import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { PasswordHasher } from './domain/password-hasher.port';
import { UserRepository } from './domain/user.repository';
import { Argon2PasswordHasher } from './infrastructure/argon2-password-hasher';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { NotificationModule } from 'src/shared/infrastructure/notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [
    UserService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: PasswordHasher,
      useClass: Argon2PasswordHasher,
    },
  ],
  exports: [UserService, UserRepository, PasswordHasher],
})
export class UserModule {}
