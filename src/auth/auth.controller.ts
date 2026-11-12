import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import * as crypto from 'crypto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService, AuthResult } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { SkipCsrf } from '../common/decorators/skip-csrf.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @SkipCsrf()
  @Get('csrf')
  @ApiOperation({ summary: 'Acquire CSRF token' })
  getCsrfToken(@Res({ passthrough: true }) res: Response) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return { csrfToken: token };
  }

  @Public()
  @SkipCsrf()
  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  register(@Body() dto: RegisterDto): Promise<AuthResult> {
    return this.authService.register(dto);
  }

  @Public()
  @SkipCsrf()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ description: 'Access and refresh tokens' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto, @Ip() ip: string): Promise<AuthResult> {
    return this.authService.login(dto, ip);
  }

  @Public()
  @SkipCsrf()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue a new access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated user' })
  profile(@CurrentUser('id') userId: string) {
    return this.authService.profile(userId);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change own password' })
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Get('permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Effective permissions of current user' })
  permissions(@CurrentUser() user: AuthUser) {
    return this.authService.permissions(user);
  }
}
