import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from '../../contexts/tasks/category/application/category.service';
import { AuthenticatedUser } from '../../contexts/identity-access/auth/domain/authenticated-user';
import { JwtAuthGuard } from '../../contexts/identity-access/auth/infrastructure/jwt-auth.guard';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: jest.Mocked<CategoryService>;

  const currentUser: AuthenticatedUser = {
    id: 'user-1',
    email: 'juan@test.com',
    role: 'CLIENT',
  };

  const mockCategory = {
    id: '1',
    name: 'Trabajo',
    color: '#FF5733',
    userId: 'user-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
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

    controller = module.get<CategoryController>(CategoryController);
    service = module.get(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('returns the categories of the authenticated user', async () => {
      service.findAll.mockResolvedValue([mockCategory]);

      const result = await controller.findAll(currentUser);
      expect(result).toEqual([mockCategory]);
      expect(service.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('returns a category by id', async () => {
      service.getOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(currentUser, '1');
      expect(result).toEqual(mockCategory);
      expect(service.getOne).toHaveBeenCalledWith('1', 'user-1');
    });
  });

  describe('create', () => {
    it('creates a category for the authenticated user', async () => {
      service.create.mockResolvedValue(mockCategory);

      const result = await controller.create(currentUser, {
        name: 'Trabajo',
        color: '#FF5733',
      });
      expect(result).toEqual(mockCategory);
      expect(service.create).toHaveBeenCalledWith('user-1', {
        name: 'Trabajo',
        color: '#FF5733',
      });
    });
  });

  describe('update', () => {
    it('updates a category', async () => {
      const updated = { ...mockCategory, name: 'Personal' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(currentUser, '1', {
        name: 'Personal',
      });
      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('1', 'user-1', {
        name: 'Personal',
      });
    });
  });

  describe('delete', () => {
    it('deletes a category', async () => {
      service.deleteItem.mockResolvedValue(undefined);

      await controller.delete(currentUser, '1');
      expect(service.deleteItem).toHaveBeenCalledWith('1', 'user-1');
    });
  });
});
