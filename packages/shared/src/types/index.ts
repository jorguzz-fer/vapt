import {
  PlantaoStatus,
  TipoPlantao,
  TipoPorta,
  UserRole,
  DuracaoPlantao,
  Especialidade,
  CandidaturaStatus,
  PagamentoStatus,
  AvaliadorRole,
} from '../enums';

export interface BaseEntity {
  id: string;
  createdAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  updatedAt: Date;
}

export interface Estabelecimento extends BaseEntity {
  userId: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  cep: string;
  endereco: string;
  telefone?: string;
  updatedAt: Date;
}

export interface Profissional extends BaseEntity {
  userId: string;
  nomeCompleto: string;
  crmv: string;
  crmvAtivo: boolean;
  especialidade?: Especialidade;
  bio?: string;
  fotoPerfil?: string;
  cnpj?: string;
  verificado: boolean;
  backgroundCheckAprovado: boolean;
  updatedAt: Date;
}

export interface Plantao extends BaseEntity {
  estabelecimentoId: string;
  profissionalId?: string;
  status: PlantaoStatus;
  tipo: TipoPlantao;
  tipoPorta: TipoPorta;
  duracao: DuracaoPlantao;
  especialidade: Especialidade;
  valorProposto: number;
  valorFinal?: number;
  volumePacientes?: number;
  cep: string;
  localizacao: string;
  observacoes?: string;
  motivoCancelamento?: string;
  dataInicio: Date;
  dataFim: Date;
  updatedAt: Date;
}

export interface Candidatura extends BaseEntity {
  plantaoId: string;
  profissionalId: string;
  status: CandidaturaStatus;
  mensagem?: string;
  updatedAt: Date;
}

export interface Avaliacao extends BaseEntity {
  plantaoId: string;
  avaliadorRole: AvaliadorRole;
  nota: number;
  comentario?: string;
}

export interface Pagamento extends BaseEntity {
  plantaoId: string;
  valor: number;
  status: PagamentoStatus;
  gatewayTransactionId?: string;
  updatedAt: Date;
}
