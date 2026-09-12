export type UserRole = 'CLIENT' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'BLOCKED';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null,
    public readonly password: string,
    public readonly role: UserRole,
    public readonly status: UserStatus,
  ) {}
}

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}

export function toSafeUsers(users: User[]): SafeUser[] {
  return users.map((user) => toSafeUser(user));
}
