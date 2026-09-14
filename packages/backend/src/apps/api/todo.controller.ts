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
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateTodoDto } from '../../contexts/tasks/todo/application/dto/create-todo.dto';
import { UpdateTodoDto } from '../../contexts/tasks/todo/application/dto/update-todo.dto';
import { TodoService } from 'src/contexts/tasks/todo/application/todo.service';
import type { AuthenticatedUser } from 'src/contexts/identity-access/auth/domain/authenticated-user';
import { JwtAuthGuard } from 'src/contexts/identity-access/auth/infrastructure/jwt-auth.guard';
import { CurrentUser } from 'src/contexts/identity-access/auth/infrastructure/current-user.decorator';

@ApiTags('Todo')
@ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de tareas' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.todoService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea encontrada' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.todoService.getOne(id, user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva tarea para el usuario autenticado',
  })
  @ApiResponse({ status: 201, description: 'Tarea creada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createTodoDto: CreateTodoDto,
  ) {
    return this.todoService.create(user.id, createTodoDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todoService.update(id, user.id, updateTodoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.todoService.deleteItem(id, user.id);
  }
}
