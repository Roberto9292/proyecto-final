import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { User } from '../domain/user.entity';
import { PrismaUserRepository } from './prisma-user.repository';

// PrismaService extiende PrismaClient, así que cargarlo de verdad arrastra todo
// el cliente generado de Prisma. Acá solo se necesita como token de inyección,
// y la fábrica evita que Jest llegue a resolver el módulo real.
jest.mock('src/shared/infrastructure/prisma/prisma.service', () => ({
  PrismaService: class PrismaServiceStub {},
}));

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const row = {
    id: '1',
    email: 'admin@gmail.com',
    name: 'Admin',
    password: '$argon2id$hash',
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get(PrismaUserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('maps every row to a domain user', async () => {
      prisma.user.findMany.mockResolvedValue([row]);

      const result = await repository.findAll();

      expect(result).toEqual([
        new User(
          '1',
          'admin@gmail.com',
          'Admin',
          '$argon2id$hash',
          'ADMIN',
          'ACTIVE',
        ),
      ]);
    });

    it('returns an empty list when there are no users', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      expect(await repository.findAll()).toEqual([]);
    });
  });

  describe('findByEmail', () => {
    it('looks the user up by email', async () => {
      prisma.user.findUnique.mockResolvedValue(row);

      const result = await repository.findByEmail('admin@gmail.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@gmail.com' },
      });
      expect(result).toBeInstanceOf(User);
    });

    it('returns null when the email is not registered', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      expect(await repository.findByEmail('nadie@todo.com')).toBeNull();
    });
  });

  describe('findById', () => {
    it('looks the user up by id', async () => {
      prisma.user.findUnique.mockResolvedValue(row);

      const result = await repository.findById('1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result?.email).toBe('admin@gmail.com');
    });

    it('returns null when the id does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      expect(await repository.findById('999')).toBeNull();
    });
  });

  describe('create', () => {
    it('persists the user and returns it as a domain entity', async () => {
      prisma.user.create.mockResolvedValue(row);
      const data = {
        email: 'admin@gmail.com',
        name: 'Admin',
        password: '$argon2id$hash',
        role: 'ADMIN' as const,
        status: 'ACTIVE' as const,
      };

      const result = await repository.create(data);

      expect(prisma.user.create).toHaveBeenCalledWith({ data });
      expect(result.id).toBe('1');
    });
  });

  describe('update', () => {
    it('updates by id and returns the new state', async () => {
      prisma.user.update.mockResolvedValue({ ...row, status: 'BLOCKED' });

      const result = await repository.update('1', { status: 'BLOCKED' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'BLOCKED' },
      });
      expect(result.status).toBe('BLOCKED');
    });
  });

  describe('deleteItem', () => {
    it('deletes by id and resolves without a value', async () => {
      prisma.user.delete.mockResolvedValue(row);

      await expect(repository.deleteItem('1')).resolves.toBeUndefined();
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
