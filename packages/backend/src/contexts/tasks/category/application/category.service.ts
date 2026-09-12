import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from '../domain/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(userId: string) {
    return this.categoryRepository.findAll(userId);
  }

  async getOne(id: string, userId: string) {
    const category = await this.categoryRepository.getOne(id, userId);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    await this.assertNameIsAvailable(dto.name);

    return this.categoryRepository.create({
      name: dto.name,
      color: dto.color ?? null,
      userId,
    });
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto) {
    const existing = await this.getOne(id, userId);

    if (dto.name !== undefined && dto.name !== existing.name) {
      await this.assertNameIsAvailable(dto.name);
    }

    return this.categoryRepository.update(id, dto);
  }

  async deleteItem(id: string, userId: string) {
    await this.getOne(id, userId);
    return this.categoryRepository.deleteItem(id);
  }

  private async assertNameIsAvailable(name: string) {
    const existing = await this.categoryRepository.findByName(name);
    if (existing) {
      throw new ConflictException(`Category with name ${name} already exists`);
    }
  }
}
