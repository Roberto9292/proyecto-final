import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { HEX_COLOR, HEX_COLOR_MESSAGE } from '../../domain/category-color';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Nombre de la categoría',
    example: 'Trabajo',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Color de la categoría en formato hexadecimal',
    example: '#FF5733',
    pattern: HEX_COLOR.source,
  })
  @IsString()
  @Matches(HEX_COLOR, { message: HEX_COLOR_MESSAGE })
  @IsOptional()
  color?: string;
}
