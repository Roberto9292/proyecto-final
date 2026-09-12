import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type { UserRole, UserStatus } from '../../domain/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Email del usuario',
    example: 'juan@test.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario (solo un admin puede cambiarlo)',
    enum: ['CLIENT', 'ADMIN'],
    example: 'CLIENT',
  })
  @IsIn(['CLIENT', 'ADMIN'])
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Estado del usuario (solo un admin puede cambiarlo)',
    enum: ['ACTIVE', 'BLOCKED'],
    example: 'ACTIVE',
  })
  @IsIn(['ACTIVE', 'BLOCKED'])
  @IsOptional()
  status?: UserStatus;
}
