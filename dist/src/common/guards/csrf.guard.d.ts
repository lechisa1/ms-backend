import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
export declare const CSRF_COOKIE_NAME = "XSRF-TOKEN";
export declare const CSRF_HEADER_NAME = "x-xsrf-token";
export declare class CsrfGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
    generateToken(): string;
    setCsrfCookie(res: Response, token: string): void;
    private extractCookieToken;
    private extractHeaderToken;
    private safeCompare;
}
