import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelarPlantaoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
