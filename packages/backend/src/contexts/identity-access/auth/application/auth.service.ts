import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordHasher } from '../../user/domain/password-hasher.port';
import { UserRepository } from '../../user/domain/user.repository';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.passwordHasher.verify(user.password, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('User is blocked');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
