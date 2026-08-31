import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export const MOMENTOS_CAPTURA = [
  'ACEITE_CANDIDATURA',
  'INICIO_PLANTAO',
  'POS_CONCLUSAO',
] as const;

export const POLITICAS_LIBERACAO = [
  'MANUAL_NA_CONCLUSAO',
  'AUTOMATICA_POR_PRAZO',
  'APOS_AVALIACAO_MUTUA',
] as const;

export class UpdateConfiguracaoDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  taxaEstabelecimentoPercentual?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  taxaProfissionalPercentual?: number;

  @IsOptional()
  @IsIn(MOMENTOS_CAPTURA)
  momentoCaptura?: (typeof MOMENTOS_CAPTURA)[number];

  @IsOptional()
  @IsIn(POLITICAS_LIBERACAO)
  politicaLiberacao?: (typeof POLITICAS_LIBERACAO)[number];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(180)
  @Type(() => Number)
  escrowDiasRetencao?: number;

  @IsOptional()
  @IsBoolean()
  aceitaPix?: boolean;

  @IsOptional()
  @IsBoolean()
  aceitaCartao?: boolean;

  @IsOptional()
  @IsBoolean()
  aceitaBoleto?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  valorMinimoPlantao?: number;
}
