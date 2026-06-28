import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TipoPlantao,
  TipoPorta,
  DuracaoPlantao,
  Especialidade,
} from '@vapt/shared';

export class CreatePlantaoDto {
  @IsEnum(TipoPlantao)
  tipo!: TipoPlantao;

  @IsEnum(TipoPorta)
  tipoPorta!: TipoPorta;

  @IsEnum(DuracaoPlantao)
  duracao!: DuracaoPlantao;

  @IsEnum(Especialidade)
  especialidade!: Especialidade;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20, { message: 'Valor mínimo por hora é R$20,00.' })
  @Type(() => Number)
  valorProposto!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  @Type(() => Number)
  volumePacientes?: number;

  @IsString()
  @Length(8, 8, { message: 'CEP deve ter 8 dígitos.' })
  cep!: string;

  @IsString()
  @MinLength(10, { message: 'Localização inválida.' })
  localizacao!: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsDateString()
  dataInicio!: string;

  @IsDateString()
  dataFim!: string;
}
