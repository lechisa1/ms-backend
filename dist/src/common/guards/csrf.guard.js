"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsrfGuard = exports.CSRF_HEADER_NAME = exports.CSRF_COOKIE_NAME = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const crypto = __importStar(require("crypto"));
const skip_csrf_decorator_1 = require("../decorators/skip-csrf.decorator");
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
exports.CSRF_COOKIE_NAME = 'XSRF-TOKEN';
exports.CSRF_HEADER_NAME = 'x-xsrf-token';
let CsrfGuard = class CsrfGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const skipCsrf = this.reflector.getAllAndOverride(skip_csrf_decorator_1.SKIP_CSRF_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipCsrf) {
            return true;
        }
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        const method = req.method.toUpperCase();
        const cookieToken = this.extractCookieToken(req);
        if (SAFE_METHODS.has(method)) {
            if (!cookieToken && res && typeof res.cookie === 'function') {
                const newToken = this.generateToken();
                this.setCsrfCookie(res, newToken);
            }
            return true;
        }
        const headerToken = this.extractHeaderToken(req);
        if (!cookieToken || !headerToken) {
            throw new common_1.ForbiddenException({
                statusCode: 403,
                error: 'Forbidden',
                message: 'Invalid or missing CSRF token',
                code: 'CSRF_TOKEN_INVALID',
            });
        }
        if (!this.safeCompare(cookieToken, headerToken)) {
            throw new common_1.ForbiddenException({
                statusCode: 403,
                error: 'Forbidden',
                message: 'CSRF token mismatch',
                code: 'CSRF_TOKEN_MISMATCH',
            });
        }
        return true;
    }
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    setCsrfCookie(res, token) {
        res.cookie(exports.CSRF_COOKIE_NAME, token, {
            path: '/',
            httpOnly: false,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
    }
    extractCookieToken(req) {
        if (req.cookies?.[exports.CSRF_COOKIE_NAME]) {
            return req.cookies[exports.CSRF_COOKIE_NAME];
        }
        const rawCookie = req.headers?.cookie;
        if (!rawCookie)
            return null;
        const cookies = rawCookie.split(';');
        for (const c of cookies) {
            const [name, ...valParts] = c.trim().split('=');
            if (name === exports.CSRF_COOKIE_NAME) {
                return decodeURIComponent(valParts.join('='));
            }
        }
        return null;
    }
    extractHeaderToken(req) {
        const header = req.headers[exports.CSRF_HEADER_NAME] ||
            req.headers['x-csrf-token'] ||
            req.headers['x-xsrf-token'];
        if (!header)
            return null;
        return Array.isArray(header) ? header[0] : header;
    }
    safeCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        try {
            return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
        }
        catch {
            return false;
        }
    }
};
exports.CsrfGuard = CsrfGuard;
exports.CsrfGuard = CsrfGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], CsrfGuard);
//# sourceMappingURL=csrf.guard.js.map