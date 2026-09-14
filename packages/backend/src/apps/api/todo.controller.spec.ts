import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from '../../contexts/tasks/todo/application/todo.service';
import { AuthenticatedUser } from '../../contexts/identity-access/auth/domain/authenticated-user';
import { JwtAuthGuard } from '../../contexts/identity-access/auth/infrastructure/jwt-auth.guard';

describe('TodoController', () => {
  let controller: TodoController;
  let service: jest.Mocked<TodoService>;

  const currentUser: AuthenticatedUser = {
    id: 'user-1',
    email: 'juan@test.com',
    role: 'CLIENT',
  };

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
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: {
            findAll: jest.fn(),
            getOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            deleteItem: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get(TodoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('returns the todos of the authenticated user', async () => {
      service.findAll.mockResolvedValue([mockTodo]);

      const result = await controller.findAll(currentUser);
      expect(result).toEqual([mockTodo]);
      expect(service.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('returns a todo by id', async () => {
      service.getOne.mockResolvedValue(mockTodo);

      const result = await controller.findOne(currentUser, '1');
      expect(result).toEqual(mockTodo);
      expect(service.getOne).toHaveBeenCalledWith('1', 'user-1');
    });
  });

  describe('create', () => {
    it('creates a todo for the authenticated user', async () => {
      service.create.mockResolvedValue(mockTodo);

      const result = await controller.create(currentUser, {
        title: 'Test todo',
        description: 'Test description',
      });
      expect(result).toEqual(mockTodo);
      expect(service.create).toHaveBeenCalledWith('user-1', {
        title: 'Test todo',
        description: 'Test description',
      });
    });
  });

  describe('update', () => {
    it('updates a todo', async () => {
      const updated = { ...mockTodo, completed: true };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(currentUser, '1', {
        completed: true,
      });
      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('1', 'user-1', {
        completed: true,
      });
    });
  });

  describe('delete', () => {
    it('deletes a todo', async () => {
      service.deleteItem.mockResolvedValue(undefined);

      await controller.delete(currentUser, '1');
      expect(service.deleteItem).toHaveBeenCalledWith('1', 'user-1');
    });
  });
});
