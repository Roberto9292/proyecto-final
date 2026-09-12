import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { PasswordHasher } from '../../user/domain/password-hasher.port';
import { User } from '../../user/domain/user.entity';
import { UserRepository } from '../../user/domain/user.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

  const mockUser = new User(
    '1',
    'juan@test.com',
    'Juan',
    'hashed-password',
    'CLIENT',
    'ACTIVE',
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: PasswordHasher,
          useValue: {
            hash: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    passwordHasher = module.get(PasswordHasher);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('returns accessToken and user on valid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.verify.mockResolvedValue(true);

      const result = await service.login({
        email: 'juan@test.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken', 'jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('throws UnauthorizedException when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.verify.mockResolvedValue(false);

      await expect(
        service.login({ email: 'juan@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the user is blocked', async () => {
      const blocked = new User(
        '2',
        'blocked@test.com',
        'Blocked',
        'hashed-password',
        'CLIENT',
        'BLOCKED',
      );
      userRepository.findByEmail.mockResolvedValue(blocked);
      passwordHasher.verify.mockResolvedValue(true);

      await expect(
        service.login({ email: 'blocked@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
