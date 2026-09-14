import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateTodoDto {
  @ApiPropertyOptional({
    description: 'Título de la tarea',
    example: 'Comprar pan',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la tarea',
    example: 'Comprar pan en la tienda cercana',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estado de la tarea',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha límite de la tarea (ISO 8601), null para quitarla',
    example: '2026-09-15T10:00:00.000Z',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string | null;

  @ApiPropertyOptional({
    description: 'ID de la categoría, null para quitarla',
    example: '3f1a8c6e-6f6a-4f3e-9f7b-9d2f0a1b2c3d',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string | null;
}
