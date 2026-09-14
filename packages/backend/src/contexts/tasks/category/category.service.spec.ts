import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoryService } from './application/category.service';
import { CategoryRepository } from './domain/category.repository';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: jest.Mocked<CategoryRepository>;

  const mockCategory = {
    id: '1',
    name: 'Trabajo',
    color: '#FF5733',
    userId: 'user-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: {
            findAll: jest.fn(),
            getOne: jest.fn(),
            findByName: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            deleteItem: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get(CategoryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all categories of the authenticated user', async () => {
      repository.findAll.mockResolvedValue([mockCategory]);

      const result = await service.findAll('user-1');
      expect(result).toEqual([mockCategory]);
      expect(repository.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getOne', () => {
    it('returns a category by id', async () => {
      repository.getOne.mockResolvedValue(mockCategory);

      const result = await service.getOne('1', 'user-1');
      expect(result).toEqual(mockCategory);
      expect(repository.getOne).toHaveBeenCalledWith('1', 'user-1');
    });

    it('throws NotFoundException when category not found', async () => {
      repository.getOne.mockResolvedValue(null);

      await expect(service.getOne('999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a category for the authenticated user', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockCategory);

      const result = await service.create('user-1', {
        name: 'Trabajo',
        color: '#FF5733',
      });
      expect(result).toEqual(mockCategory);
      expect(repository.create).toHaveBeenCalledWith({
        name: 'Trabajo',
        color: '#FF5733',
        userId: 'user-1',
      });
    });

    it('defaults color to null when it is not provided', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.create.mockResolvedValue({ ...mockCategory, color: null });

      await service.create('user-1', { name: 'Trabajo' });
      expect(repository.create).toHaveBeenCalledWith({
        name: 'Trabajo',
        color: null,
        userId: 'user-1',
      });
    });

    it('throws ConflictException when the name is already taken', async () => {
      repository.findByName.mockResolvedValue(mockCategory);

      await expect(
        service.create('user-1', { name: 'Trabajo' }),
      ).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates a category', async () => {
      const updated = { ...mockCategory, color: '#000000' };
      repository.getOne.mockResolvedValue(mockCategory);
      repository.update.mockResolvedValue(updated);

      const result = await service.update('1', 'user-1', { color: '#000000' });
      expect(result).toEqual(updated);
      expect(repository.update).toHaveBeenCalledWith('1', {
        color: '#000000',
      });
    });

    it('keeps its own name without raising a conflict', async () => {
      repository.getOne.mockResolvedValue(mockCategory);
      repository.update.mockResolvedValue(mockCategory);

      await service.update('1', 'user-1', { name: 'Trabajo' });
      expect(repository.findByName).not.toHaveBeenCalled();
    });

    it('throws ConflictException when renaming to a name already taken', async () => {
      repository.getOne.mockResolvedValue(mockCategory);
      repository.findByName.mockResolvedValue({
        ...mockCategory,
        id: '2',
        name: 'Personal',
      });

      await expect(
        service.update('1', 'user-1', { name: 'Personal' }),
      ).rejects.toThrow(ConflictException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('allows renaming to a free name', async () => {
      repository.getOne.mockResolvedValue(mockCategory);
      repository.findByName.mockResolvedValue(null);
      repository.update.mockResolvedValue({
        ...mockCategory,
        name: 'Personal',
      });

      const result = await service.update('1', 'user-1', { name: 'Personal' });

      expect(repository.findByName).toHaveBeenCalledWith('Personal');
      expect(result.name).toBe('Personal');
    });

    it('throws NotFoundException when category not found', async () => {
      repository.getOne.mockResolvedValue(null);

      await expect(
        service.update('999', 'user-1', { name: 'Otro' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteItem', () => {
    it('deletes a category', async () => {
      repository.getOne.mockResolvedValue(mockCategory);
      repository.deleteItem.mockResolvedValue(undefined);

      await service.deleteItem('1', 'user-1');
      expect(repository.deleteItem).toHaveBeenCalledWith('1');
    });

    it('throws NotFoundException when category not found', async () => {
      repository.getOne.mockResolvedValue(null);

      await expect(service.deleteItem('999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.deleteItem).not.toHaveBeenCalled();
    });
  });
});
