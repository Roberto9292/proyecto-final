import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

// PrismaService extiende PrismaClient, así que cargarlo de verdad arrastra todo
// el cliente generado de Prisma. Acá solo se necesita como token de inyección,
// y la fábrica evita que Jest llegue a resolver el módulo real.
jest.mock('src/shared/infrastructure/prisma/prisma.service', () => ({
  PrismaService: class PrismaServiceStub {},
}));
import { Category } from '../domain/category.entity';
import { PrismaCategoryRepository } from './prisma-category.repository';

describe('PrismaCategoryRepository', () => {
  let repository: PrismaCategoryRepository;
  let prisma: {
    category: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const row = {
    id: '1',
    name: 'Trabajo',
    color: '#FF5733',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      category: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaCategoryRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get(PrismaCategoryRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('only reads the categories of the given user, sorted by name', async () => {
      prisma.category.findMany.mockResolvedValue([row]);

      const result = await repository.findAll('user-1');

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([
        new Category('1', 'Trabajo', '#FF5733', 'user-1'),
      ]);
    });

    it('returns an empty list when the user has no categories', async () => {
      prisma.category.findMany.mockResolvedValue([]);

      expect(await repository.findAll('user-1')).toEqual([]);
    });
  });

  describe('getOne', () => {
    it('scopes the lookup by user, so one user cannot read another ones category', async () => {
      prisma.category.findFirst.mockResolvedValue(row);

      const result = await repository.getOne('1', 'user-1');

      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-1' },
      });
      expect(result).toEqual(new Category('1', 'Trabajo', '#FF5733', 'user-1'));
    });

    it('returns null when the category belongs to somebody else', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      expect(await repository.getOne('1', 'other-user')).toBeNull();
    });
  });

  describe('findByName', () => {
    it('looks the name up globally, because the column is unique across users', async () => {
      prisma.category.findUnique.mockResolvedValue(row);

      const result = await repository.findByName('Trabajo');

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: 'Trabajo' },
      });
      expect(result).toEqual(new Category('1', 'Trabajo', '#FF5733', 'user-1'));
    });

    it('returns null when the name is free', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      expect(await repository.findByName('Libre')).toBeNull();
    });
  });

  describe('create', () => {
    it('persists the category and returns it as a domain entity', async () => {
      prisma.category.create.mockResolvedValue(row);
      const data = { name: 'Trabajo', color: '#FF5733', userId: 'user-1' };

      const result = await repository.create(data);

      expect(prisma.category.create).toHaveBeenCalledWith({ data });
      expect(result).toBeInstanceOf(Category);
      expect(result.id).toBe('1');
    });

    it('keeps a null color as null', async () => {
      prisma.category.create.mockResolvedValue({ ...row, color: null });

      const result = await repository.create({
        name: 'Trabajo',
        color: null,
        userId: 'user-1',
      });

      expect(result.color).toBeNull();
    });
  });

  describe('update', () => {
    it('updates by id and returns the new state', async () => {
      const updated = { ...row, color: '#000000' };
      prisma.category.update.mockResolvedValue(updated);

      const result = await repository.update('1', { color: '#000000' });

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { color: '#000000' },
      });
      expect(result.color).toBe('#000000');
    });
  });

  describe('deleteItem', () => {
    it('deletes by id and resolves without a value', async () => {
      prisma.category.delete.mockResolvedValue(row);

      await expect(repository.deleteItem('1')).resolves.toBeUndefined();
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
