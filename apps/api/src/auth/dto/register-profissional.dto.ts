import { IsEmail, IsOptional, IsString, Length, MinLength, Matches } from 'class-validator';

export class RegisterProfissionalDto {
  @IsEmail({}, { message: 'Email inválido.' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres.' })
  password!: string;

  @IsString()
  @MinLength(3, { message: 'Nome completo inválido.' })
  nomeCompleto!: string;

  @IsString()
  @Matches(/^[A-Z]{2}-\d+$/, { message: 'CRMV inválido. Formato esperado: UF-12345.' })
  crmv!: string;

  @IsOptional()
  @IsString()
  @Length(14, 14, { message: 'CNPJ deve ter 14 dígitos.' })
  cnpj?: string;
}
