import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from 'src/contexts/identity-access/auth/domain/authenticated-user';
import { CurrentUser } from 'src/contexts/identity-access/auth/infrastructure/current-user.decorator';
import { JwtAuthGuard } from 'src/contexts/identity-access/auth/infrastructure/jwt-auth.guard';
import { Roles } from 'src/contexts/identity-access/auth/infrastructure/roles.decorator';
import { RolesGuard } from 'src/contexts/identity-access/auth/infrastructure/roles.guard';
import { CreateUserDto } from 'src/contexts/identity-access/user/application/dto/create-user.dto';
import { UpdateUserDto } from 'src/contexts/identity-access/user/application/dto/update-user.dto';
import { UserService } from 'src/contexts/identity-access/user/application/user.service';

@ApiTags('Users')
@ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiOkResponse({ description: 'Lista de usuarios (sin passwords)' })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiOkResponse({ description: 'Usuario encontrado (sin password)' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.userService.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiCreatedResponse({ description: 'Usuario creado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'El email ya está registrado' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateUserDto) {
    return this.userService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un usuario (solo el propio usuario o un admin)',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiOkResponse({ description: 'Usuario actualizado (sin password)' })
  @ApiForbiddenResponse({ description: 'Sin permisos para actualizar' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiConflictResponse({ description: 'El email ya está registrado' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar un usuario (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  @ApiForbiddenResponse({ description: 'Sin permisos para eliminar' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.userService.deleteItem(id, user);
  }
}
