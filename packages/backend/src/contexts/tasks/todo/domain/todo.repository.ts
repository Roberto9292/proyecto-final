import { Todo } from './todo.entity';

export interface CreateTodoData {
  title: string;
  description: string | null;
  completed: boolean;
  userId: string;
  dueDate: Date | null;
  categoryId: string | null;
}

export interface UpdateTodoData {
  title?: string;
  description?: string | null;
  completed?: boolean;
  dueDate?: Date | null;
  categoryId?: string | null;
}

export abstract class TodoRepository {
  abstract findAll(userId: string): Promise<Todo[]>;
  abstract getOne(id: string, userId: string): Promise<Todo | null>;
  abstract create(data: CreateTodoData): Promise<Todo>;
  abstract update(id: string, data: UpdateTodoData): Promise<Todo>;
  abstract deleteItem(id: string): Promise<void>;
}
