import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { id: string; userId: string; expiresAt: Date }) {
    return this.prisma.refreshToken.create({ data });
  }

  async findValid(id: string, userId: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        expiresAt: { gt: new Date() },
        id,
        revokedAt: null,
        userId,
      },
    });
  }

  async revoke(id: string, userId: string) {
    return this.prisma.refreshToken.updateMany({
      data: { revokedAt: new Date() },
      where: { id, revokedAt: null, userId },
    });
  }

  async revokeAllForUser(userId: string) {
    return this.prisma.refreshToken.updateMany({
      data: {
        revokedAt: new Date(),
      },
      where: {
        revokedAt: null,
        userId,
      },
    });
  }
}
