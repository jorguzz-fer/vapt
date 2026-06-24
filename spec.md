# VAPT — Especificação do Produto (MVP)

**Marketplace sob demanda de plantões e serviços veterinários**

| | |
|---|---|
| **Produto** | VAPT (nome de trabalho; candidatos: VAPT, VAPT PRO, VATE PRO) |
| **Cliente / Idealizadora** | Manuela ("Manu") — médica veterinária e proprietária de clínica |
| **Desenvolvimento** | Tudo Mudou — Fernando Jorge |
| **Mentoria de negócio** | Dr. Kleber Ferreira |
| **Documento** | Especificação do MVP — v1.0 |
| **Data** | 23/06/2026 |
| **Status** | Rascunho para validação |

---

## 1. Visão geral

O VAPT é um marketplace sob demanda que conecta, em tempo real e por geolocalização, **estabelecimentos que precisam de profissionais veterinários** (clínicas, hospitais, consultórios) a **veterinários disponíveis para plantões e serviços avulsos** ("volantes").

A analogia mental é direta: **Uber/99 para plantões veterinários**. A clínica que fica sem profissional — por falta, folga, doença ou imprevisto — aciona o app, informa endereço/CEP, e a plataforma localiza profissionais cadastrados que se propõem a atender naquela região e horário.

> O diferencial central declarado pela idealizadora é **agilidade + geolocalização + segurança/confiança**, em contraste com o boca a boca atual (lento, sem procedência) e com sites antigos do setor (cadastro passivo, sem matching, dependentes da boa vontade do profissional em responder).

### 1.1 A dor que o produto resolve

- Quando uma clínica fica sem veterinário, encontrar substituto hoje é **"um caos"**: depende de boca a boca, pode levar de um dia a mais de uma semana, sem garantia de procedência ou qualidade do profissional.
- O profissional autônomo, por outro lado, tem **insegurança de fluxo** (não sabe se conseguirá plantões com regularidade) e de **recebimento** (calote, pagamento que demora meses na medicina humana).
- O mercado opera num **"leilão" de valores** que deprecia o plantão. A plataforma pretende estabelecer uma **régua de preço mínimo** e agregar serviços que justifiquem a contratação via VAPT.

### 1.2 Proposta de valor

| Para o estabelecimento (contratante) | Para o veterinário (profissional) |
|---|---|
| Encontra plantonista rapidamente, por proximidade | Fluxo previsível de oportunidades de plantão |
| Pré-qualificação (CRMV ativo, antecedentes, histórico) | Recebimento garantido via split/escrow |
| Avaliações e reputação visíveis | Menor exposição a calote |
| Maior compromisso do profissional (entidade intermediadora) | Régua de preço que valoriza o serviço |
| Regras claras de cancelamento/no-show | Clube de vantagens e benefícios agregados |

---

## 2. Atores / Personas

1. **Estabelecimento contratante** — clínica, hospital ou consultório veterinário (também o próprio veterinário-dono, como a Manu). Publica a demanda de plantão e paga.
2. **Profissional veterinário** — plantonista volante, especialista (ex.: ultrassonografia, radiologia), também enfermeiro/técnico/cuidador. Aceita e executa o plantão. Deve ser **PJ** (ver §8).
3. **Plataforma / Administração (VAPT)** — intermedia, valida cadastros, define regras, retém comissão, gerencia repasses e disputas.
4. **Tutor** *(Fase 2 — fora do MVP)* — dono de pet que demanda serviços a domicílio (enfermeiro para soro, etc.).

---

## 3. Escopo — o que entra e o que NÃO entra no MVP

> **Princípio reitor:** o MVP existe para **validar uma hipótese de duas pontas** — (a) os estabelecimentos querem e pagam por isso (já há forte indício de sim) e (b) os veterinários aceitam passar pelo processo (ainda não validado). Tudo que não for essencial a essa validação fica para depois. Foi consenso na reunião não "matar mosquito com bazuca".

### 3.1 DENTRO do MVP

- Cadastro e verificação de profissionais (CRMV, documentos, antecedentes)
- Cadastro de estabelecimentos
- Geolocalização e matching por região
- Publicação de demanda de plantão com parâmetros (tipo, porta aberta/fechada, nº de pacientes, duração, valor)
- Régua de preço mínimo
- Aceite, confirmação e ciclo de vida do plantão
- Pagamento com split + retenção (escrow) e comissão da plataforma
- Repasse ao profissional mediante emissão de NF
- Avaliações (reputação bilateral)
- Regras de cancelamento e no-show (banimento/multa)
- Painel administrativo da plataforma
- **Restrição geográfica: Grande São Paulo** (São Paulo capital, Guarulhos, Osasco, Barueri, Carapicuíba, Jandira e entorno)

### 3.2 FORA do MVP (Fase 2 / Backlog)

Ideias válidas levantadas na reunião, deliberadamente adiadas para não inflar o escopo:

- Cadastro e jornada de **tutores** (serviços a domicílio)
- **Medicina humana** (plantões; mercado grande, porém com complexidade de convênios)
- **Tosadores, passeadores, cuidadores** como categorias próprias
- **Aluguel de cães** (test drive, exposição, experiência) — ideia exploratória
- **Seguro durante o plantão** (parceria MaisVet/Porto) — depende de negociação externa
- **Apps nativos** (App Store / Play Store) — o MVP é **web** (ver §9)
- Clube de vantagens completo e venda cruzada de telemedicina (WOW+) — pode entrar como módulo leve, mas não bloqueia o MVP

---

## 4. Funcionalidades do MVP

### 4.1 Cadastro e verificação do profissional

- Cadastro com dados pessoais, **CRMV** e dados de PJ (CNPJ).
- **Pré-qualificação automática:** verificar se o CRMV está **ativo e regular** (caminho mínimo de confiança).
- Upload de documentos (identidade, comprovante de CRMV, dados bancários/PJ).
- Verificação de **antecedentes criminais** e consulta a **processos** (ex.: Jusbrasil / conselho de classe) — como camada de confiança. *Pode entrar como verificação manual no MVP e ser automatizada depois; ponto jurídico em aberto (§13).*
- Definição das regiões de atuação e tipos de plantão que aceita.

### 4.2 Cadastro do estabelecimento

- Dados da clínica/hospital, CNPJ, endereço e CEP (base da geolocalização).
- Método de pagamento e, opcionalmente, **carteira de créditos** (ver §4.7).

### 4.3 Geolocalização e matching

- Estabelecimento informa endereço/CEP; o sistema usa geolocalização para listar profissionais cadastrados que atendem àquela **região** e ao **tipo de plantão**.
- Ordenação por proximidade + reputação.

### 4.4 Publicação da demanda de plantão

Parâmetros que compõem a vaga e influenciam o preço:

- **Tipo de plantão:** emergência, fim de semana, férias, cobertura de período X→Y; duração de 12h, 24h, semana.
- **Porta aberta** (emergência, fluxo) **vs. porta fechada** (internação, sem novos atendimentos).
- **Número de pacientes / volume** — acima de um teto, exige veterinário adicional ou auxiliar.
- Opção de **auxiliar/2º profissional** ofertado pela própria plataforma.
- Local (clínica/hospital/consultório).
- Adendos: alimentação no local, transporte etc. (impactam a atratividade da vaga).

### 4.5 Régua de preço mínimo

- A clínica propõe um valor, mas a plataforma impõe um **piso** ("a partir daqui"), evitando o leilão para baixo.
- Faixas de referência observadas no mercado: de R$100 (mercado ruim) a R$500 (porta aberta/emergência, ex.: hospitais de grande porte). Valor "irrecusável" mencionado: ~R$300/plantão (R$250 já muito bom para vaga simples).
- Premissa de design: nas 12h típicas, o profissional precisa cobrir transporte e alimentação **e ainda sobrar** — daí os adendos.

### 4.6 Aceite, confirmação e ciclo de vida

Estados sugeridos da vaga: `ABERTA → ACEITA → CONFIRMADA → EM_ANDAMENTO → CONCLUÍDA → AVALIADA` (e ramos `CANCELADA` / `NO_SHOW`).

- Profissional dá o **aceite**; plataforma confirma.
- Ao concluir, o estabelecimento **valida** ("plantão cumprido, tudo certo") e dispara a liberação do pagamento.

### 4.7 Pagamento: split + escrow + créditos

- Integração com **gateway de split de pagamentos** (candidatos citados: **Asaas, Pagar.me, Iugu**). O gateway divide automaticamente: parte para a plataforma (comissão), parte para o profissional.
- Modelo de **retenção/escrow estilo Mercado Livre:** o dinheiro fica retido na plataforma e é repassado após confirmação do plantão (ou automaticamente se não houver contestação em prazo definido).
- **Carteira de créditos:** o estabelecimento pode pré-depositar crédito (ex.: R$500 / R$1.000). Quem compra créditos paga **plantão mais barato** (a plataforma elimina o risco de inadimplência). Para o profissional, vaga lastreada por crédito é mais atrativa (o dinheiro "já é dele", basta cumprir).

### 4.8 Comissão e repasse

- **Comissão da plataforma: 15% a 25%** sobre o serviço (referência Uber; a calibrar).
- **Repasse ao profissional:** **semanal** no início (ex.: plantão na quinta → recebe na sexta), migrando para **quinzenal** conforme operação cresce (controle financeiro).
- **Condição inegociável:** o profissional só recebe **mediante emissão de Nota Fiscal** para a plataforma (ver §8).

### 4.9 Avaliações / reputação

- Sistema de notas estilo Uber (estrelinhas) para **qualidade e conduta** do profissional, gerando volumetria de reputação.
- Avaliação bilateral (estabelecimento ↔ profissional) desejável.

### 4.10 Antiabsenteísmo (no-show)

- Profissional que aceita e **não comparece** sofre penalidade: **multa** e/ou **banimento** (temporário/definitivo conforme reincidência).
- O modelo escrow protege a clínica: sem cumprimento, sem repasse.

### 4.11 Clube de vantagens *(módulo leve / opcional no MVP)*

- **Taxa de adesão do profissional:** ideia de **R$150/ano** (taxa única anual) para "ser sócio do clube" e ter acesso às vagas + benefícios.
- Benefícios: clube de vantagens (a Tudo Mudou/WOW+ já possui estrutura), possibilidade de oferecer **telemedicina/seguro saúde** (venda cruzada WOW+), com **comissão** para a Manu.
- *No MVP, pode entrar apenas como taxa de adesão + listagem de benefícios; a venda cruzada completa é Fase 2.*

### 4.12 Painel administrativo

- Gestão de cadastros e aprovação/verificação de profissionais.
- Visão de vagas, plantões, disputas, comissões e repasses.
- Configuração de régua de preço, comissão (%) e regras de penalidade.

---

## 5. Regras de negócio (resumo)

| Regra | Definição |
|---|---|
| Piso de preço | Plataforma define mínimo por tipo de plantão; clínica não pode publicar abaixo |
| Comissão | 15%–25% sobre o valor do serviço (parametrizável) |
| Repasse | Semanal no início → quinzenal na escala; sempre condicionado à NF |
| Escrow | Valor retido até confirmação de conclusão pelo estabelecimento |
| Créditos | Pré-pagamento dá desconto e prioridade ao profissional |
| No-show | Multa e/ou banimento progressivo |
| Verificação | CRMV ativo/regular = pré-requisito; antecedentes/processos = camada extra |
| Geografia | Apenas Grande São Paulo no MVP |

---

## 6. Modelo de monetização

1. **Comissão por transação** (15%–25%) — receita principal.
2. **Taxa de adesão anual do profissional** (~R$150/ano).
3. **Spread/desconto sobre carteira de créditos** (engajamento + capital de giro).
4. **Venda cruzada / clube de vantagens** — telemedicina (WOW+), seguros — *Fase 2*.

> Diretriz da mentoria: pensar a monetização desde o MVP ("o que mais consigo vender dentro do app?"), sem depender de uma única fonte.

---

## 7. Fluxos principais (jornadas)

### 7.1 Estabelecimento solicita plantão
1. Login → "Nova demanda de plantão".
2. Informa endereço/CEP, tipo, porta aberta/fechada, nº de pacientes, duração, adendos.
3. Sistema aplica régua de preço → estabelecimento confirma valor.
4. Paga (cartão/PIX/boleto ou créditos) → valor retido em escrow.
5. Plataforma lista/notifica profissionais compatíveis por proximidade.

### 7.2 Profissional aceita e executa
1. Recebe notificação da vaga compatível com região/tipo.
2. Visualiza detalhes (valor líquido estimado, local, adendos) → **aceita**.
3. Comparece e executa o plantão.
4. Estabelecimento **valida** a conclusão.

### 7.3 Liquidação
1. Conclusão validada → gateway executa o **split**.
2. Profissional **emite NF** → repasse liberado (semanal/quinzenal).
3. Ambos avaliam → reputação atualizada.

---

## 8. Tributário / contratual (ponto crítico)

- **Médico-veterinário não pode ser MEI.** Enquadramento típico: **Simples Nacional** (PJ). Há resistência de parte dos profissionais a atuar como PJ pela carga tributária (~ percepção de "15% sobre a nota").
- A plataforma precisa **receber NF do profissional** para repassar — sem NF, sem pagamento.
- Cada profissional firma **contrato de prestação de serviços** com a plataforma; ele presta serviço **à clínica, mediante intermediação do VAPT**.
- **Reforma tributária 2026+:** atenção ao fim gradual do modelo atual, IBS/CBS e **split payment** (imposto retido na liquidação, conforme regime do recebedor). Modelagem financeira precisa contemplar isso.
- **Ação:** validar enquadramento, emissão de NF e fluxo de repasse com a **contabilidade** (a do Dr. Kleber, com contexto do mercado veterinário).

---

## 9. Arquitetura técnica e stack

> O MVP é **web** (acessado pelo navegador / PWA). Apps nativos (App Store/Play Store) ficam para depois — encarecem o projeto e não são necessários para validar a hipótese.

**Stack proposta (padrão consolidado da casa):**

- **Monorepo:** Turborepo.
- **Frontend:** Next.js (web-first, responsivo / PWA).
- **Backend:** NestJS (API).
- **Banco de dados:** PostgreSQL + Prisma (ORM).
- **Autenticação:** Auth.js / sessão segura, validações sempre **server-side**.
- **Geolocalização:** geocoding por CEP/endereço + cálculo de proximidade (PostGIS ou serviço de geocoding).
- **Pagamentos:** gateway de split — **Asaas / Pagar.me / Iugu** (escrow, split em N níveis, repasse programado).
- **Infraestrutura:** Coolify / Easypanel sobre VPS (Hostinger), Docker. Estrutura atual já comporta o MVP.
- **Observabilidade / uptime:** monitoramento básico desde o MVP (o uptime "tem que ser perfeito" na escala).

**Premissas de engenharia:**
- O MVP roda na infra já existente, sem distribuir "para o planeta todo".
- Gatilho de escala: ~**1.000 veterinários + 1.000 clínicas cadastradas** → revisar infraestrutura, custos de servidor e IA.
- Segurança tecnológica: prevenção a invasões, proteção de dados (LGPD), validações em servidor.

---

## 10. Compliance e segurança

- **LGPD:** tratamento de dados pessoais de profissionais e clínicas; atenção redobrada por envolver **dados sensíveis de saúde** (animal/profissional) e antecedentes. Definir bases legais, consentimento, retenção e minimização.
- **Verificação de antecedentes/processos:** há limites legais sobre consulta e uso desses dados — validar juridicamente antes de automatizar.
- **Segurança de marca (negócio):** o único ativo realmente protegível é **nome + logomarca (registro no INPI)**; o restante do conceito é copiável. Isso reforça a estratégia de **velocidade de execução** como diferencial competitivo.

---

## 11. Métricas de validação do MVP (KPIs)

- Nº de profissionais cadastrados e **verificados** (oferta).
- Nº de estabelecimentos ativos (demanda).
- Nº de vagas publicadas vs. **vagas preenchidas** (taxa de fill).
- **Tempo médio para preencher uma vaga** (vs. dias/semana do boca a boca atual).
- **Taxa de no-show** e de cancelamento.
- Ticket médio por plantão e **GMV**; comissão efetiva.
- Recompra (clínicas que voltam a contratar) e recorrência do profissional.

> Hipótese a derrubar/validar: **os veterinários aceitam o processo** (cadastro, verificação, PJ/NF, régua de preço). A demanda das clínicas já tem forte indício de existência.

---

## 12. Roadmap por fases

| Fase | Objetivo | Escopo |
|---|---|---|
| **0 — Setup** | Fundação | Domínio, infra, identidade, repositório, esqueleto do monorepo |
| **1 — MVP web** | Validar hipótese | §4 completo, Grande SP |
| **2 — Escala** | Crescer com segurança | Atingidos ~1k+1k cadastros: hardening de infra/uptime, otimizações |
| **3 — Apps nativos** | Distribuição | App Store + Play Store |
| **4 — Expansão de oferta** | Novos verticais | Tutores, tosadores, passeadores, seguros, clube completo |
| **5 — Medicina humana** | Novo mercado | Plantões médicos (tratar complexidade de convênios) |

---

## 13. Riscos e pontos em aberto

- **Tributário/NF:** enquadramento do veterinário e fluxo de emissão de NF → validar com contabilidade.
- **Verificação de antecedentes/processos:** viabilidade e limites jurídicos (LGPD + legislação aplicável).
- **Cold start de marketplace (duas pontas):** atrair oferta e demanda simultaneamente em uma única região. A base de ~4.000 autônomos cadastrados na Alchemypet é um possível canal de aquisição de oferta.
- **Seguro durante o plantão (MaisVet/Porto):** depende de negociação externa; quem paga e como cobrar ainda indefinido.
- **Nome/marca:** definir entre VAPT / VAPT PRO / VATE PRO e registrar no INPI.
- **Régua de preço vs. adesão do profissional:** equilibrar valorização do plantão sem afastar a demanda das clínicas.

---

### Anexo — Glossário rápido
- **Volante:** veterinário que faz plantões avulsos (bico/autônomo).
- **Porta aberta / fechada:** com / sem novos atendimentos durante o plantão.
- **Split de pagamento:** divisão automática do valor entre plataforma e profissional.
- **Escrow:** retenção do valor até a confirmação da conclusão.
- **MVP:** mínimo produto viável — versão enxuta para testar a hipótese central.