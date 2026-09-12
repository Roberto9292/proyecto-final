import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { Todo } from '../domain/todo.entity';
import { PrismaTodoRepository } from './prisma-todo.repository';

// PrismaService extiende PrismaClient, así que cargarlo de verdad arrastra todo
// el cliente generado de Prisma. Acá solo se necesita como token de inyección,
// y la fábrica evita que Jest llegue a resolver el módulo real.
jest.mock('src/shared/infrastructure/prisma/prisma.service', () => ({
  PrismaService: class PrismaServiceStub {},
}));

describe('PrismaTodoRepository', () => {
  let repository: PrismaTodoRepository;
  let prisma: {
    todo: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const dueDate = new Date('2026-09-15T10:00:00.000Z');
  const row = {
    id: '1',
    title: 'Comprar pan',
    description: 'En la panadería',
    completed: false,
    userId: 'user-1',
    dueDate,
    categoryId: 'cat-1',
  };

  beforeEach(async () => {
    prisma = {
      todo: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTodoRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get(PrismaTodoRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('only reads the todos of the given user', async () => {
      prisma.todo.findMany.mockResolvedValue([row]);

      const result = await repository.findAll('user-1');

      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual([
        new Todo(
          '1',
          'Comprar pan',
          'En la panadería',
          false,
          'user-1',
          dueDate,
          'cat-1',
        ),
      ]);
    });

    it('returns an empty list when the user has no todos', async () => {
      prisma.todo.findMany.mockResolvedValue([]);

      expect(await repository.findAll('user-1')).toEqual([]);
    });
  });

  describe('getOne', () => {
    it('scopes the lookup by user, so one user cannot read another ones todo', async () => {
      prisma.todo.findFirst.mockResolvedValue(row);

      const result = await repository.getOne('1', 'user-1');

      expect(prisma.todo.findFirst).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-1' },
      });
      expect(result).toBeInstanceOf(Todo);
    });

    it('returns null when the todo belongs to somebody else', async () => {
      prisma.todo.findFirst.mockResolvedValue(null);

      expect(await repository.getOne('1', 'other-user')).toBeNull();
    });
  });

  describe('create', () => {
    it('persists the todo and returns it as a domain entity', async () => {
      prisma.todo.create.mockResolvedValue(row);
      const data = {
        title: 'Comprar pan',
        description: 'En la panadería',
        completed: false,
        userId: 'user-1',
        dueDate,
        categoryId: 'cat-1',
      };

      const result = await repository.create(data);

      expect(prisma.todo.create).toHaveBeenCalledWith({ data });
      expect(result.id).toBe('1');
    });

    it('keeps the optional fields as null', async () => {
      prisma.todo.create.mockResolvedValue({
        ...row,
        description: null,
        dueDate: null,
        categoryId: null,
      });

      const result = await repository.create({
        title: 'Comprar pan',
        description: null,
        completed: false,
        userId: 'user-1',
        dueDate: null,
        categoryId: null,
      });

      expect(result.description).toBeNull();
      expect(result.dueDate).toBeNull();
      expect(result.categoryId).toBeNull();
    });
  });

  describe('update', () => {
    it('updates by id and returns the new state', async () => {
      prisma.todo.update.mockResolvedValue({ ...row, completed: true });

      const result = await repository.update('1', { completed: true });

      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { completed: true },
      });
      expect(result.completed).toBe(true);
    });
  });

  describe('deleteItem', () => {
    it('deletes by id and resolves without a value', async () => {
      prisma.todo.delete.mockResolvedValue(row);

      await expect(repository.deleteItem('1')).resolves.toBeUndefined();
      expect(prisma.todo.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
