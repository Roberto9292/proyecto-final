import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationPort } from 'src/shared/domain/notification.port';
import { CategoryService } from '../../category/application/category.service';
import { TodoRepository, UpdateTodoData } from '../domain/todo.repository';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly categoryService: CategoryService,
    private readonly notificationPort: NotificationPort,
  ) {}

  async findAll(userId: string) {
    return this.todoRepository.findAll(userId);
  }

  async getOne(id: string, userId: string) {
    const todo = await this.todoRepository.getOne(id, userId);
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return todo;
  }

  async create(userId: string, dto: CreateTodoDto) {
    await this.assertCategoryIsOwned(dto.categoryId, userId);

    const todo = await this.todoRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      completed: false,
      userId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      categoryId: dto.categoryId ?? null,
    });

    await this.notificationPort.send({
      userId,
      type: 'TASK_CREATED',
      title: 'Nueva tarea',
      message: `Se creó la tarea "${dto.title}"`,
      metadata: { taskId: todo.id },
    });

    return todo;
  }

  async update(id: string, userId: string, dto: UpdateTodoDto) {
    const existing = await this.getOne(id, userId);
    await this.assertCategoryIsOwned(dto.categoryId, userId);

    const data: UpdateTodoData = {
      ...dto,
      dueDate:
        dto.dueDate !== undefined
          ? dto.dueDate
            ? new Date(dto.dueDate)
            : null
          : undefined,
    };
    const updated = await this.todoRepository.update(id, data);

    if (dto.completed && !existing.completed) {
      await this.notificationPort.send({
        userId,
        type: 'TASK_COMPLETED',
        title: 'Tarea completada',
        message: `La tarea "${existing.title}" fue completada`,
        metadata: { taskId: id },
      });
    }

    return updated;
  }

  async deleteItem(id: string, userId: string) {
    await this.getOne(id, userId);
    return this.todoRepository.deleteItem(id);
  }

  private async assertCategoryIsOwned(
    categoryId: string | null | undefined,
    userId: string,
  ) {
    if (categoryId) {
      await this.categoryService.getOne(categoryId, userId);
    }
  }
}
