import { User, UserRole, UserStatus } from './user.entity';

export interface UserCreateData {
  email: string;
  name: string | null;
  password: string;
  role: UserRole;
  status: UserStatus;
}

export interface UserUpdateData {
  email?: string;
  name?: string | null;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
}

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract create(data: UserCreateData): Promise<User>;
  abstract update(id: string, data: UserUpdateData): Promise<User>;
  abstract deleteItem(id: string): Promise<void>;
}
