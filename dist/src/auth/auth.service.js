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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const user_select_1 = require("../common/utils/user-select");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    get saltRounds() {
        return Number(this.configService.get('BCRYPT_SALT_ROUNDS', 10));
    }
    toSeconds(value) {
        const match = /^(\d+)\s*([smhd])?$/.exec(value.trim());
        if (!match) {
            return 900;
        }
        const amount = Number(match[1]);
        const unit = match[2] ?? 's';
        const multipliers = {
            s: 1,
            m: 60,
            h: 3600,
            d: 86400,
        };
        return amount * (multipliers[unit] ?? 1);
    }
    async signTokens(userId, email) {
        const payload = { sub: userId, email };
        const accessExpiration = this.configService.get('JWT_ACCESS_EXPIRATION', '15m');
        const refreshExpiration = this.configService.get('JWT_REFRESH_EXPIRATION', '7d');
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: this.toSeconds(accessExpiration),
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: this.toSeconds(refreshExpiration),
            }),
        ]);
        return { accessToken, refreshToken, expiresIn: accessExpiration };
    }
    async register(dto) {
        const email = dto.email.toLowerCase().trim();
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.ConflictException('A user with this email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);
        const user = await this.prisma.user.create({
            data: {
                fullName: dto.fullName,
                email,
                phone: dto.phone,
                passwordHash,
                organizationUnitId: dto.organizationUnitId,
                membershipRole: dto.membershipRole,
                roleAssignments: dto.roleIds?.length
                    ? { create: dto.roleIds.map((roleId) => ({ roleId })) }
                    : undefined,
            },
            select: user_select_1.USER_PUBLIC_SELECT,
        });
        const tokens = await this.signTokens(user.id, user.email);
        return { user, tokens };
    }
    async login(dto, ip) {
        const email = dto.email.toLowerCase().trim();
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                passwordHash: true,
                deletedAt: true,
                roleAssignments: {
                    select: {
                        role: { select: { id: true, name: true, dashboardRoute: true } },
                    },
                },
                permissionGrants: {
                    select: { permission: { select: { name: true } } },
                },
                organizationUnit: { select: { id: true, name: true, code: true } },
                supervisedUnit: { select: { id: true, name: true } },
                ...user_select_1.USER_PUBLIC_SELECT,
            },
        });
        if (!user || user.deletedAt || !user.isActive) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const matches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!matches) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date(), lastLoginIp: ip ?? null },
        });
        const safeUser = { ...user };
        delete safeUser.passwordHash;
        delete safeUser.deletedAt;
        const tokens = await this.signTokens(user.id, user.email);
        return { user: safeUser, tokens };
    }
    async refresh(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            return await this.signTokens(payload.sub, payload.email);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async profile(userId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
            select: {
                ...user_select_1.USER_PUBLIC_SELECT,
                roleAssignments: {
                    select: {
                        role: { select: { id: true, name: true, dashboardRoute: true } },
                    },
                },
                permissionGrants: {
                    select: { permission: { select: { name: true } } },
                },
                organizationUnit: { select: { id: true, name: true, code: true } },
                supervisedUnit: { select: { id: true, name: true } },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const matches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!matches) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, this.saltRounds);
        await this.prisma.$transaction([
            this.prisma.passwordHistory.create({
                data: { userId, passwordHash: user.passwordHash },
            }),
            this.prisma.user.update({
                where: { id: userId },
                data: { passwordHash },
            }),
        ]);
        this.logger.log(`Password changed for user ${userId}`);
    }
    permissions(user) {
        return user.permissions;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map