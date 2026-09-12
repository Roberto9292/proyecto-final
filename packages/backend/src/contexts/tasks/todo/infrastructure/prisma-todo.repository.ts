import { Injectable } from '@nestjs/common';
import type { Todo as TodoRow } from 'generated/prisma/client';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { Todo } from '../domain/todo.entity';
import {
  CreateTodoData,
  TodoRepository,
  UpdateTodoData,
} from '../domain/todo.repository';

@Injectable()
export class PrismaTodoRepository implements TodoRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(row: TodoRow) {
    return new Todo(
      row.id,
      row.title,
      row.description,
      row.completed,
      row.userId,
      row.dueDate,
      row.categoryId,
    );
  }

  async findAll(userId: string) {
    const rows = await this.prisma.todo.findMany({ where: { userId } });
    return rows.map((r) => this.toDomain(r));
  }

  async getOne(id: string, userId: string) {
    const row = await this.prisma.todo.findFirst({ where: { id, userId } });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateTodoData) {
    const row = await this.prisma.todo.create({ data });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateTodoData) {
    const row = await this.prisma.todo.update({ where: { id }, data });
    return this.toDomain(row);
  }

  async deleteItem(id: string) {
    await this.prisma.todo.delete({ where: { id } });
  }
}
