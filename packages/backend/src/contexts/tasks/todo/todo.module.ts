import { Module } from '@nestjs/common';
import { TodoService } from './application/todo.service';
import { TodoRepository } from './domain/todo.repository';
import { PrismaTodoRepository } from './infrastructure/prisma-todo.repository';
import { CategoryModule } from '../category/category.module';
import { NotificationModule } from 'src/shared/infrastructure/notification/notification.module';

@Module({
  imports: [CategoryModule, NotificationModule],
  providers: [
    TodoService,
    {
      provide: TodoRepository,
      useClass: PrismaTodoRepository,
    },
  ],
  exports: [TodoService],
})
export class TodoModule {}
