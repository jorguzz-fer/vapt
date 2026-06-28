import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido.' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres.' })
  password!: string;
}
