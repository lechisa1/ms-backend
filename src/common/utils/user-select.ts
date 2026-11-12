import { Prisma } from '@prisma/client';

export const USER_PUBLIC_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  isActive: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  lastLoginIp: true,
  createdAt: true,
  updatedAt: true,
  organizationUnitId: true,
  membershipRole: true,
} satisfies Prisma.UserSelect;
