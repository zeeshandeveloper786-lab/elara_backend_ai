import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<any> {
    const userExists = await this.prisma.user.findFirst({
      where: { email: dto.email, is_deleted: false },
    });

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    return this.signToken(user.id, user.email, user.name || '');
  }

  // login
  async login(dto: LoginDto): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, is_deleted: false },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user.id, user.email, user.name || '');
  }

  // logout
  logout(): { message: string } {
    return { message: 'Logged out successfully' };
  }

  async signToken(
    userId: string,
    email: string,
    userName: string,
  ): Promise<any> {
    const payload = {
      sub: userId,
      email,
      user_name: userName,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: {
        id: userId,
        email,
        user_name: userName,
      },
    };
  }
}
