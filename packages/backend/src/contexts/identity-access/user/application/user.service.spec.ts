import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { NotificationPort } from 'src/shared/domain/notification.port';
import { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { PasswordHasher } from '../domain/password-hasher.port';
import { User } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let notificationPort: jest.Mocked<NotificationPort>;

  const mockUser = new User(
    '000001',
    'juan@test.com',
    'Juan',
    'hashed-password',
    'CLIENT',
    'ACTIVE',
  );

  const admin: AuthenticatedUser = {
    id: 'admin-id',
    email: 'admin@todo.com',
    role: 'ADMIN',
  };

  const owner: AuthenticatedUser = {
    id: mockUser.id,
    email: mockUser.email,
    role: 'CLIENT',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            deleteItem: jest.fn(),
          },
        },
        {
          provide: PasswordHasher,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashed-password'),
            verify: jest.fn(),
          },
        },
        {
          provide: NotificationPort,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    passwordHasher = module.get(PasswordHasher);
    notificationPort = module.get(NotificationPort);
  });

  it('Debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('Retorna un array de usuarios seguros', async () => {
      userRepository.findAll.mockResolvedValue([mockUser]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('getOne', () => {
    it('Retorna un usuario seguro por id', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getOne(mockUser.id);
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(mockUser.email);
    });

    it('Usuario inexistente, debería lanzar NotFoundException', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('Crea un nuevo usuario y retorna un usuario seguro', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(
        {
          name: mockUser.name,
          email: mockUser.email,
          password: 'password123',
        },
        'caller-id',
      );

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(mockUser.email);
      expect(passwordHasher.hash).toHaveBeenCalledWith('password123');
      expect(notificationPort.send).toHaveBeenCalled();
    });

    it('Email ya existe, debería lanzar ConflictException', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.create(
          {
            name: mockUser.name,
            email: mockUser.email,
            password: 'password123',
          },
          'caller-id',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('El propio usuario puede actualizar sus datos', async () => {
      const updated = new User(
        mockUser.id,
        mockUser.email,
        'Juan Pérez',
        mockUser.password,
        'CLIENT',
        'ACTIVE',
      );
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updated);

      const result = await service.update(
        mockUser.id,
        { name: 'Juan Pérez' },
        owner,
      );

      expect(result.name).toBe('Juan Pérez');
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        name: 'Juan Pérez',
      });
    });

    it('Hashea la contraseña antes de guardarla', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(mockUser);

      await service.update(mockUser.id, { password: 'new-password' }, owner);

      expect(passwordHasher.hash).toHaveBeenCalledWith('new-password');
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        password: 'hashed-password',
      });
    });

    it('Otro usuario sin rol admin, debería lanzar ForbiddenException', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      await expect(
        service.update(
          mockUser.id,
          { name: 'Otro' },
          {
            id: 'otro-id',
            email: 'otro@test.com',
            role: 'CLIENT',
          },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Un usuario sin rol admin no puede cambiar su propio rol', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      await expect(
        service.update(mockUser.id, { role: 'ADMIN' }, owner),
      ).rejects.toThrow(ForbiddenException);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('Email en uso por otro usuario, debería lanzar ConflictException', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(
        new User('otro', 'otro@test.com', 'Otro', 'hash', 'CLIENT', 'ACTIVE'),
      );

      await expect(
        service.update(mockUser.id, { email: 'otro@test.com' }, admin),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteItem', () => {
    it('Un admin elimina a otro usuario', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.deleteItem.mockResolvedValue(undefined);

      await service.deleteItem(mockUser.id, admin);
      expect(userRepository.deleteItem).toHaveBeenCalledWith(mockUser.id);
    });

    it('Un admin no puede eliminarse a sí mismo', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      await expect(
        service.deleteItem(mockUser.id, {
          id: mockUser.id,
          email: mockUser.email,
          role: 'ADMIN',
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(userRepository.deleteItem).not.toHaveBeenCalled();
    });

    it('Usuario inexistente, debería lanzar NotFoundException', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.deleteItem('999', admin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
