import { Test, TestingModule } from "@nestjs/testing";

import { PrismaService } from "src/prisma/prisma.service";

import { RefreshTokenService } from "./refresh-token.service";

jest.mock("src/prisma/prisma.service", () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  })),
}));

describe("RefreshTokenService", () => {
  let service: RefreshTokenService;

  const mockPrismaService = {
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a refresh token", async () => {
      const createdToken = {
        expiresAt: new Date(),
        id: "jti-123",
        userId: "user-1",
      };

      mockPrismaService.refreshToken.create.mockResolvedValue(createdToken);

      const result = await service.create(createdToken);

      expect(mockPrismaService.refreshToken.create).toHaveBeenCalledWith({
        data: createdToken,
      });

      expect(result).toEqual(createdToken);
    });
  });

  describe("findValid", () => {
    it("should return a valid refresh token", async () => {
      const token = {
        expiresAt: new Date(Date.now() + 1000),
        id: "jti-123",
        revokedAt: null,
        userId: "user-1",
      };

      mockPrismaService.refreshToken.findFirst.mockResolvedValue(token);

      const result = await service.findValid(token.id, token.userId);

      expect(mockPrismaService.refreshToken.findFirst).toHaveBeenCalledWith({
        where: {
          expiresAt: { gt: expect.any(Date) as Date },
          id: token.id,
          revokedAt: null,
          userId: token.userId,
        },
      });

      expect(result).toEqual(token);
    });

    it("should return null when token is not found", async () => {
      mockPrismaService.refreshToken.findFirst.mockResolvedValue(null);

      const result = await service.findValid("jti-x", "user-x");

      expect(result).toBeNull();
    });
  });

  describe("revoke", () => {
    it("should revoke a refresh token", async () => {
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.revoke("jti-123", "user-1");

      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        data: { revokedAt: expect.any(Date) as Date },
        where: {
          id: "jti-123",
          revokedAt: null,
          userId: "user-1",
        },
      });

      expect(result).toEqual({ count: 1 });
    });
  });

  describe("revokeAllForUser", () => {
    it("should revoke all active refresh tokens for a user", async () => {
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({
        count: 3,
      });

      const result = await service.revokeAllForUser("user-1");

      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        data: { revokedAt: expect.any(Date) as Date },
        where: {
          revokedAt: null,
          userId: "user-1",
        },
      });

      expect(result).toEqual({ count: 3 });
    });
  });
});
