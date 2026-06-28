import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCandidaturaDto {
  @IsUUID()
  plantaoId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  mensagem?: string;
}
