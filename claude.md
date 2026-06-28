# CLAUDE.md — VAPT

Diretrizes comportamentais + padrões de engenharia do projeto.
Seções 1–4: como o LLM deve agir. Seções 5+: como o projeto deve ser construído.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## 5. Princípios Fundamentais de Engenharia

1. **Server-authoritative** — regra de negócio, autenticação e autorização vivem no servidor. O cliente é apresentação; nunca é fronteira de confiança.
2. **Uma API, vários clientes** — web e (futuramente) mobile consomem a mesma API. Sem lógica de negócio duplicada por plataforma.
3. **Superfície mínima exposta** — só o BFF/gateway é público; serviços internos são privados. Negar por padrão (allow-list de rotas).
4. **Segurança e privacidade por padrão** — menor privilégio, criptografia em trânsito e repouso, segredos fora do código. LGPD é requisito, não opção.
5. **Modular primeiro** — monólito modular com bounded contexts claros; extrair serviços só quando a escala justificar.
6. **Contrato como fonte de verdade** — API descrita por OpenAPI; tipos gerados a partir dele, nunca ao contrário.
7. **Tudo versionado e reprodutível** — schema, migrations, dependências e config em código; ambientes idênticos via Docker.
8. **Observabilidade desde o dia 1** — logs estruturados (JSON), métricas, error tracking; sem dados sensíveis em claro nos logs.
9. **Automatizar o repetitivo** — CI/CD, lint, testes, migrations e deploy sem passos manuais frágeis.
10. **Decisões registradas** — escolhas arquiteturais relevantes viram ADRs em `docs/adr/`.

---

## 6. Stack do Projeto

| Camada | Escolha | Motivo |
|--------|---------|--------|
| Linguagem | TypeScript end-to-end | Um ecossistema de tipos do banco ao front |
| Backend | NestJS + Fastify | DI, guards/interceptors, ~2× throughput vs Express |
| Frontend | Next.js 14 (App Router) | SSR, PWA, web-only no MVP |
| Estilo | Tailwind CSS | Mobile-first, design system próprio |
| ORM/DB | Drizzle ORM + PostgreSQL | Schema em TS, SQL previsível, inferência de tipos superior |
| Auth | Auth.js (server-side sessions) | Cookie httpOnly; sem JWT stateless no MVP |
| Pagamentos | Asaas / Pagar.me / Iugu | Split + escrow; zero dados de cartão no servidor |
| Monorepo | Turborepo + pnpm workspaces | Build incremental; `apps/` e `packages/` |
| Infra dev | Docker Compose | Paridade dev/prod; Postgres local |
| Infra prod | Coolify/Easypanel + VPS Hostinger | Container não-root; HTTPS via Let's Encrypt |

Versões fixadas em `package.json`; `.nvmrc` na raiz.

---

## 7. Arquitetura

- **Monólito modular** com fronteiras por domínio (Auth, Profissional, Estabelecimento, Plantão, Pagamento, Admin).
- **Camadas**: cliente → API/NestJS (casos de uso) → domínio (regras) → infraestrutura (DB, gateway de pagamento). Dependências apontam para dentro.
- **BFF**: o `apps/web` (Next.js) fala apenas com `apps/api` (NestJS). O NestJS mantém sessão, injeta contexto e serve como único ponto de entrada.
- **Eventos de domínio** para efeitos colaterais desacoplados (ex.: plantão aceito → notificação). Com retry/back-off.
- **Contrato OpenAPI** gerado a partir dos DTOs do NestJS; cliente TypeScript gerado para o `apps/web`.

Estrutura de pastas:
```
vapt/
├── apps/
│   ├── api/          # NestJS — módulos por domínio
│   └── web/          # Next.js — app-router, mobile-first
├── packages/
│   ├── db/           # Drizzle schema + migrations
│   └── shared/       # Types, enums, Zod schemas
├── docs/
│   └── adr/          # Architecture Decision Records
├── infra/            # Docker Compose, scripts de deploy
└── .github/
    └── workflows/    # CI/CD
```

---

## 8. Segurança

### Autenticação e Autorização
- Auth **100% server-side** — guards NestJS em todo endpoint protegido.
- **RBAC**: roles `ADMIN`, `ESTABELECIMENTO`, `PROFISSIONAL` em `packages/shared`.
- Sessão em **cookie httpOnly + Secure + SameSite=Lax**; token fora do JS.
- **MFA obrigatório** para role `ADMIN`.
- Rate limiting (`@nestjs/throttler`) em rotas públicas; lockout progressivo em login.
- **Helmet** com CSP, HSTS, X-Frame-Options na API.
- **CORS** allowlist explícita (apenas origin do `apps/web`).
- `class-validator` + `class-transformer` em todos os DTOs — validação na fronteira da API.

### Dados Sensíveis (LGPD)
- CPF, CRMV, dados bancários: **nunca em logs**; acesso auditado.
- Background check: armazenar apenas resultado (aprovado/reprovado), não dados brutos.
- **Trilha de auditoria imutável** (quem/o quê/quando) em ações sensíveis.
- Minimização: coletar só o necessário; retenção e descarte definidos.

### Pagamentos
- **Zero dados de cartão no servidor** — gateway lida com PCI DSS.
- Verificar **assinatura HMAC do webhook** antes de processar qualquer evento de pagamento.
- Escrow mantido pelo gateway até conclusão validada.

### Infraestrutura
- Segredos em variáveis de ambiente; `.env` no `.gitignore`; `.env.example` sem valores reais.
- Containers com **usuário não-root**.
- Só porta 443 pública; banco e serviços internos sem portas expostas no host.
- CI roda **SAST + secret scanning + scan de dependências** antes do merge.

---

## 9. Dados e Persistência

- **Migrations versionadas** com Drizzle Kit — nada de ALTER manual em produção.
- Revisão de migration obrigatória no PR antes de aplicar.
- Modelagem:
  - PKs em `uuid` (`.defaultRandom()`).
  - Timestamps em `timestamptz`.
  - Valores monetários em `numeric(10,2)` — nunca float.
  - `jsonb` com parcimônia (só campos genuinamente flexíveis).
- **Soft delete** + auditoria em entidades sensíveis (Profissional, Plantão, Pagamento).
- Índices revisados em cada migration; FKs e constraints declarados no schema.
- Backup automatizado do banco; restauração testada periodicamente.

---

## 10. Qualidade e Testes

- **Pirâmide**: muitos unitários (domínio/regras) → integração (API + DB) → poucos e2e (fluxos críticos).
- **Testes de autorização** automatizados: garantir que PROFISSIONAL não acessa dados de ESTABELECIMENTO e vice-versa.
- CI bloqueia merge sem **lint + type-check + testes verdes**.
- **Definition of Done**: código + testes + revisão + CI verde + observabilidade do que foi entregue.
- Foco em cobertura de **caminhos críticos** (aceitação de plantão, pagamento, autenticação), não 100% vaidoso.

---

## 11. Fluxo de Trabalho (Git / PR)

- **Trunk-based**: branches curtas a partir de `main`; `main` sempre deployável.
- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
- PRs **pequenos e focados**; descrição com contexto + critério de sucesso.
- Code review obrigatório; CI verde como gate; revisão de segurança quando toca auth/dados/pagamentos.
- Decisões arquiteturais relevantes viram **ADR** em `docs/adr/NNNN-titulo.md`.

Template ADR mínimo:
```markdown
# ADR NNNN — <título>
- Status: proposto | aceito | substituído por ADR-XXXX
- Data: AAAA-MM-DD
## Contexto
## Opções consideradas
## Decisão
## Consequências
```

---

## 12. Observabilidade

- **Logs estruturados** (JSON) com `request_id` e `user_id` (quando autenticado); **sem CPF, CRMV ou dados bancários em claro**.
- **Error tracking** (ex.: Sentry) com contexto suficiente para reproduzir.
- **Healthcheck** em `GET /health` na API.
- Métricas e alertas: latência p95, taxa de erro, fill rate de plantões (KPI principal).
- Painéis de observabilidade acessíveis **só por rede interna/VPN**.

---

**Estas diretrizes funcionam se:** diffs têm menos mudanças desnecessárias, decisões de arquitetura ficam registradas, segurança e LGPD nunca são afterthought, e o CI bloqueia regressões antes do merge.
