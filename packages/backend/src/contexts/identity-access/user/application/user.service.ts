import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationPort } from 'src/shared/domain/notification.port';
import { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { PasswordHasher } from '../domain/password-hasher.port';
import { toSafeUser, toSafeUsers, User } from '../domain/user.entity';
import { UserRepository, UserUpdateData } from '../domain/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly notificationPort: NotificationPort,
  ) {}

  async findAll() {
    const users = await this.userRepository.findAll();
    return toSafeUsers(users);
  }

  async getOne(id: string) {
    const user = await this.findExisting(id);
    return toSafeUser(user);
  }

  async create(dto: CreateUserDto, userId: string) {
    await this.assertEmailIsAvailable(dto.email);

    const user = await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      password: await this.passwordHasher.hash(dto.password),
      role: 'CLIENT',
      status: 'ACTIVE',
    });

    await this.notificationPort.send({
      userId,
      type: 'USER_CREATED',
      title: 'Nuevo usuario',
      message: `Se creó el usuario "${dto.name}"`,
      metadata: { user: toSafeUser(user) },
    });

    return toSafeUser(user);
  }

  async update(id: string, dto: UpdateUserDto, requester: AuthenticatedUser) {
    const user = await this.findExisting(id);
    this.assertCanUpdate(user, dto, requester);

    if (dto.email && dto.email !== user.email) {
      await this.assertEmailIsAvailable(dto.email);
    }

    const data: UserUpdateData = { ...dto };
    if (dto.password) {
      data.password = await this.passwordHasher.hash(dto.password);
    }

    const updated = await this.userRepository.update(id, data);
    return toSafeUser(updated);
  }

  async deleteItem(id: string, requester: AuthenticatedUser) {
    await this.findExisting(id);

    if (id === requester.id) {
      throw new ForbiddenException('You cannot delete your own user');
    }

    return this.userRepository.deleteItem(id);
  }

  private async findExisting(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  private assertCanUpdate(
    user: User,
    dto: UpdateUserDto,
    requester: AuthenticatedUser,
  ) {
    const isAdmin = requester.role === 'ADMIN';

    if (!isAdmin && requester.id !== user.id) {
      throw new ForbiddenException('You can only update your own user');
    }

    if (!isAdmin && (dto.role !== undefined || dto.status !== undefined)) {
      throw new ForbiddenException(
        'Only an admin can change the role or the status of a user',
      );
    }
  }

  private async assertEmailIsAvailable(email: string) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
  }
}
