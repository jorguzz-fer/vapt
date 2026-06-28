import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Especialidade } from '@vapt/shared';

export class UpdatePerfilProfissionalDto {
  @IsOptional()
  @IsEnum(Especialidade)
  especialidade?: Especialidade;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
