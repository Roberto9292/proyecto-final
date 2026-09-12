import { UserRole } from '../../user/domain/user.entity';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}
