import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../user/domain/user.entity';
import { UserRepository } from '../../user/domain/user.repository';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser = new User(
    '1',
    'juan@test.com',
    'Juan',
    'hashed',
    'CLIENT',
    'ACTIVE',
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('returns user when found', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate({
        sub: '1',
        email: 'juan@test.com',
        role: 'CLIENT',
      });

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });

    it('throws UnauthorizedException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        strategy.validate({
          sub: '999',
          email: 'no@test.com',
          role: 'CLIENT',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the user is blocked', async () => {
      const blocked = new User(
        '2',
        'blocked@test.com',
        'Blocked',
        'hashed',
        'CLIENT',
        'BLOCKED',
      );
      userRepository.findById.mockResolvedValue(blocked);

      await expect(
        strategy.validate({
          sub: '2',
          email: 'blocked@test.com',
          role: 'CLIENT',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
