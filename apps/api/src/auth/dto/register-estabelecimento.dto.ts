import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class RegisterEstabelecimentoDto {
  @IsEmail({}, { message: 'Email inválido.' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres.' })
  password!: string;

  @IsString()
  @MinLength(3, { message: 'Razão social inválida.' })
  razaoSocial!: string;

  @IsString()
  @Length(14, 14, { message: 'CNPJ deve ter 14 dígitos.' })
  cnpj!: string;

  @IsString()
  @Length(8, 8, { message: 'CEP deve ter 8 dígitos.' })
  cep!: string;

  @IsString()
  @MinLength(10, { message: 'Endereço inválido.' })
  endereco!: string;
}
