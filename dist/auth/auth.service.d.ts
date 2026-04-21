import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    signup(dto: SignupDto): Promise<any>;
    login(dto: LoginDto): Promise<any>;
    logout(): {
        message: string;
    };
    signToken(userId: string, email: string, userName: string): Promise<any>;
}
