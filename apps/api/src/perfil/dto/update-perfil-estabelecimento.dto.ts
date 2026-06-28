import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdatePerfilEstabelecimentoDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nomeFantasia?: string;

  @IsOptional()
  @IsString()
  @Length(10, 20)
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  endereco?: string;
}
