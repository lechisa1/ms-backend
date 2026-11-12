import { AuthService, AuthResult } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<AuthResult>;
    login(dto: LoginDto, ip: string): Promise<AuthResult>;
    refresh(dto: RefreshTokenDto): Promise<import("./auth.service").AuthTokens>;
    profile(userId: string): Promise<Record<string, unknown>>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    permissions(user: AuthUser): string[];
}
