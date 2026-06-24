import { PlantaoStatus, TipoPlantao, TipoPorta, UserRole, DuracaoPlantao } from '../enums';

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
  cnpj: string;
  cep: string;
  endereco: string;
}

export interface Profissional extends BaseEntity {
  userId: string;
  nomeCompleto: string;
  crmv: string;
  crmvAtivo: boolean;
  cnpj?: string;
  verificado: boolean;
}

export interface Plantao extends BaseEntity {
  estabelecimentoId: string;
  profissionalId?: string;
  status: PlantaoStatus;
  tipo: TipoPlantao;
  tipoPorta: TipoPorta;
  duracao: DuracaoPlantao;
  valorProposto: number;
  volumePacientes?: number;
  localizacao: string;
  dataInicio: Date;
  dataFim: Date;
  updatedAt: Date;
}
