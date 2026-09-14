import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationPort } from 'src/shared/domain/notification.port';
import { CategoryService } from '../category/application/category.service';
import { TodoService } from './application/todo.service';
import { TodoRepository } from './domain/todo.repository';

describe('TodoService', () => {
  let service: TodoService;
  let repository: jest.Mocked<TodoRepository>;
  let categoryService: jest.Mocked<CategoryService>;
  let notificationPort: jest.Mocked<NotificationPort>;

  const mockTodo = {
    id: '1',
    title: 'Test todo',
    description: 'Test description',
    completed: false,
    userId: 'user-1',
    dueDate: null,
    categoryId: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: TodoRepository,
          useValue: {
            findAll: jest.fn(),
            getOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            deleteItem: jest.fn(),
          },
        },
        {
          provide: CategoryService,
          useValue: {
            getOne: jest.fn(),
          },
        },
        {
          provide: NotificationPort,
          useValue: {
            send: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    repository = module.get(TodoRepository);
    categoryService = module.get(CategoryService);
    notificationPort = module.get(NotificationPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns only the todos of the authenticated user', async () => {
      repository.findAll.mockResolvedValue([mockTodo]);

      const result = await service.findAll('user-1');
      expect(result).toEqual([mockTodo]);
      expect(repository.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getOne', () => {
    it('returns a todo by id', async () => {
      repository.getOne.mockResolvedValue(mockTodo);

      const result = await service.getOne('1', 'user-1');
      expect(result).toEqual(mockTodo);
      expect(repository.getOne).toHaveBeenCalledWith('1', 'user-1');
    });

    it('throws NotFoundException when the todo belongs to another user', async () => {
      repository.getOne.mockResolvedValue(null);

      await expect(service.getOne('1', 'user-2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a todo and sends notification', async () => {
      repository.create.mockResolvedValue(mockTodo);

      const result = await service.create('user-1', {
        title: 'Test todo',
        description: 'Test description',
      });
      expect(result).toEqual(mockTodo);
      expect(repository.create).toHaveBeenCalledWith({
        title: 'Test todo',
        description: 'Test description',
        completed: false,
        userId: 'user-1',
        dueDate: null,
        categoryId: null,
      });
      expect(notificationPort.send).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'TASK_CREATED',
        title: 'Nueva tarea',
        message: 'Se creó la tarea "Test todo"',
        metadata: { taskId: '1' },
      });
    });

    it('rejects a category that does not belong to the user', async () => {
      categoryService.getOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.create('user-1', { title: 'Test todo', categoryId: 'cat-1' }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('turns the optional fields into null when they are missing', async () => {
      repository.create.mockResolvedValue(mockTodo);

      await service.create('user-1', { title: 'Solo el titulo' });

      expect(repository.create).toHaveBeenCalledWith({
        title: 'Solo el titulo',
        description: null,
        completed: false,
        userId: 'user-1',
        dueDate: null,
        categoryId: null,
      });
    });

    it('parses the due date and keeps the category when both are given', async () => {
      repository.create.mockResolvedValue(mockTodo);
      categoryService.getOne.mockResolvedValue(undefined as never);

      await service.create('user-1', {
        title: 'Con fecha',
        dueDate: '2026-09-15T10:00:00.000Z',
        categoryId: 'cat-1',
      });

      expect(categoryService.getOne).toHaveBeenCalledWith('cat-1', 'user-1');
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dueDate: new Date('2026-09-15T10:00:00.000Z'),
          categoryId: 'cat-1',
        }),
      );
    });
  });

  describe('update', () => {
    it('updates a todo and sends TASK_COMPLETED notification', async () => {
      const updated = { ...mockTodo, completed: true };
      repository.getOne.mockResolvedValue(mockTodo);
      repository.update.mockResolvedValue(updated);

      const result = await service.update('1', 'user-1', { completed: true });
      expect(result).toEqual(updated);
      expect(notificationPort.send).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'TASK_COMPLETED',
        title: 'Tarea completada',
        message: 'La tarea "Test todo" fue completada',
        metadata: { taskId: '1' },
      });
    });

    it('does not send notification when completed does not change', async () => {
      repository.getOne.mockResolvedValue(mockTodo);
      repository.update.mockResolvedValue(mockTodo);

      await service.update('1', 'user-1', { title: 'New title' });
      expect(notificationPort.send).not.toHaveBeenCalled();
    });

    it('leaves the due date untouched when the payload does not mention it', async () => {
      repository.getOne.mockResolvedValue(mockTodo);
      repository.update.mockResolvedValue(mockTodo);

      await service.update('1', 'user-1', { title: 'New title' });

      expect(repository.update).toHaveBeenCalledWith('1', {
        title: 'New title',
        dueDate: undefined,
      });
    });

    it('parses the due date when one is given', async () => {
      repository.getOne.mockResolvedValue(mockTodo);
      repository.update.mockResolvedValue(mockTodo);

      await service.update('1', 'user-1', {
        dueDate: '2026-09-15T10:00:00.000Z',
      });

      expect(repository.update).toHaveBeenCalledWith('1', {
        dueDate: new Date('2026-09-15T10:00:00.000Z'),
      });
    });

    it('clears the due date when it is sent as null', async () => {
      repository.getOne.mockResolvedValue(mockTodo);
      repository.update.mockResolvedValue({ ...mockTodo, dueDate: null });

      await service.update('1', 'user-1', { dueDate: null });

      expect(repository.update).toHaveBeenCalledWith('1', { dueDate: null });
    });

    it('throws NotFoundException when todo not found', async () => {
      repository.getOne.mockResolvedValue(null);

      await expect(
        service.update('999', 'user-1', { completed: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteItem', () => {
    it('deletes a todo', async () => {
      repository.getOne.mockResolvedValue(mockTodo);
      repository.deleteItem.mockResolvedValue(undefined);

      await service.deleteItem('1', 'user-1');
      expect(repository.deleteItem).toHaveBeenCalledWith('1');
    });

    it('throws NotFoundException when todo not found', async () => {
      repository.getOne.mockResolvedValue(null);

      await expect(service.deleteItem('999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.deleteItem).not.toHaveBeenCalled();
    });
  });
});
