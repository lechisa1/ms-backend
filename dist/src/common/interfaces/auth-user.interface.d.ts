import { Request } from 'express';
export interface AuthUser {
    id: string;
    email: string;
    organizationUnitId: string | null;
    membershipRole: string;
    roles: string[];
    permissions: string[];
}
export interface AuthenticatedRequest extends Request {
    user: AuthUser;
}
