import {
  IsNumber,
  IsString,
  Length,
  Matches,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Dados exigidos pelo Asaas para abrir a subconta do profissional.
 *
 * São repassados ao gateway e não persistidos: o banco guarda apenas os
 * identificadores devolvidos (accountId e walletId).
 */
export class CriarContaRecebimentoDto {
  @IsString()
  @Matches(/^\d{11}$|^\d{14}$/, {
    message: 'cpfCnpj deve conter 11 dígitos (CPF) ou 14 (CNPJ), somente números.',
  })
  cpfCnpj!: string;

  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'mobilePhone deve conter DDD + número, somente dígitos.',
  })
  mobilePhone!: string;

  /** Renda ou faturamento mensal — obrigatório pelo Asaas. */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  incomeValue!: number;

  @IsString()
  @Matches(/^\d{8}$/, { message: 'postalCode deve conter 8 dígitos, somente números.' })
  postalCode!: string;

  @IsString()
  @Length(1, 255)
  address!: string;

  @IsString()
  @Length(1, 20)
  addressNumber!: string;

  /** Bairro. */
  @IsString()
  @MaxLength(100)
  province!: string;
}
