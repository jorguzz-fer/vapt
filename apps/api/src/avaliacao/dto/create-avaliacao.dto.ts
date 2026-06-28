import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvaliacaoDto {
  @IsUUID()
  plantaoId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  nota!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comentario?: string;
}
