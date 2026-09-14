import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../contexts/identity-access/user/application/user.service';
import { SafeUser } from '../../contexts/identity-access/user/domain/user.entity';
import { AuthenticatedUser } from '../../contexts/identity-access/auth/domain/authenticated-user';
import { JwtAuthGuard } from '../../contexts/identity-access/auth/infrastructure/jwt-auth.guard';
import { RolesGuard } from '../../contexts/identity-access/auth/infrastructure/roles.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const currentUser: AuthenticatedUser = {
    id: '1',
    email: 'juan@test.com',
    role: 'ADMIN',
  };

  const mockUser: SafeUser = {
    id: '1',
    email: 'juan@test.com',
    name: 'Juan',
    role: 'CLIENT',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
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
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all users', async () => {
      userService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();
      expect(result).toEqual([mockUser]);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns a user by id', async () => {
      userService.getOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockUser);
      expect(userService.getOne).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('creates a user', async () => {
      userService.create.mockResolvedValue(mockUser);

      const result = await controller.create(currentUser, {
        email: 'juan@test.com',
        name: 'Juan',
        password: 'password123',
      });
      expect(result).toEqual(mockUser);
      expect(userService.create).toHaveBeenCalledWith(
        {
          email: 'juan@test.com',
          name: 'Juan',
          password: 'password123',
        },
        '1',
      );
    });
  });

  describe('update', () => {
    it('updates a user', async () => {
      const updated = { ...mockUser, name: 'Juan Pérez' };
      userService.update.mockResolvedValue(updated);

      const result = await controller.update(currentUser, '1', {
        name: 'Juan Pérez',
      });
      expect(result).toEqual(updated);
      expect(userService.update).toHaveBeenCalledWith(
        '1',
        { name: 'Juan Pérez' },
        currentUser,
      );
    });
  });

  describe('delete', () => {
    it('deletes a user', async () => {
      userService.deleteItem.mockResolvedValue(undefined);

      await controller.delete(currentUser, '2');
      expect(userService.deleteItem).toHaveBeenCalledWith('2', currentUser);
    });
  });
});
