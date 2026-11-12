import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
}
export interface AuthResult {
    user: Record<string, unknown>;
    tokens: AuthTokens;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    private get saltRounds();
    private toSeconds;
    private signTokens;
    register(dto: RegisterDto): Promise<AuthResult>;
    login(dto: LoginDto, ip?: string): Promise<AuthResult>;
    refresh(refreshToken: string): Promise<AuthTokens>;
    profile(userId: string): Promise<Record<string, unknown>>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    permissions(user: AuthUser): string[];
}
