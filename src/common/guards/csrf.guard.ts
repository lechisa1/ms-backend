import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
export const CSRF_HEADER_NAME = 'x-xsrf-token';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      return true;
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const method = req.method.toUpperCase();
    const cookieToken = this.extractCookieToken(req);

    // If safe HTTP method (GET, HEAD, OPTIONS), automatically seed a token into the cookie if none exists
    if (SAFE_METHODS.has(method)) {
      if (!cookieToken && res && typeof res.cookie === 'function') {
        const newToken = this.generateToken();
        this.setCsrfCookie(res, newToken);
      }
      return true;
    }

    // For mutating HTTP methods (POST, PUT, PATCH, DELETE)
    const headerToken = this.extractHeaderToken(req);

    if (!cookieToken || !headerToken) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Invalid or missing CSRF token',
        code: 'CSRF_TOKEN_INVALID',
      });
    }

    // Constant-time comparison to protect against timing attacks
    if (!this.safeCompare(cookieToken, headerToken)) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'CSRF token mismatch',
        code: 'CSRF_TOKEN_MISMATCH',
      });
    }

    return true;
  }

  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  setCsrfCookie(res: Response, token: string): void {
    res.cookie(CSRF_COOKIE_NAME, token, {
      path: '/',
      httpOnly: false, // Standard for Double Submit Cookie pattern so client can read and submit
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  private extractCookieToken(req: Request): string | null {
    // Check if req.cookies exists
    if ((req as any).cookies?.[CSRF_COOKIE_NAME]) {
      return (req as any).cookies[CSRF_COOKIE_NAME];
    }

    // Fallback: parse raw cookie header directly with zero dependencies
    const rawCookie = req.headers?.cookie;
    if (!rawCookie) return null;

    const cookies = rawCookie.split(';');
    for (const c of cookies) {
      const [name, ...valParts] = c.trim().split('=');
      if (name === CSRF_COOKIE_NAME) {
        return decodeURIComponent(valParts.join('='));
      }
    }
    return null;
  }

  private extractHeaderToken(req: Request): string | null {
    const header =
      req.headers[CSRF_HEADER_NAME] ||
      req.headers['x-csrf-token'] ||
      req.headers['x-xsrf-token'];

    if (!header) return null;
    return Array.isArray(header) ? header[0] : header;
  }

  private safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    try {
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch {
      return false;
    }
  }
}
