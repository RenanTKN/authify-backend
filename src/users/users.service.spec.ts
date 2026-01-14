import {
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { Prisma } from "generated/prisma/client";

import { LoggerService } from "src/logger/logger.service";
import { PasswordService } from "src/password/password.service";
import { PrismaService } from "src/prisma/prisma.service";

import { baseUserSelect } from "./users.select";
import { UsersService } from "./users.service";

jest.mock("generated/prisma/client", () => ({
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code?: string;
      constructor(message: string, options: { code?: string }) {
        super(message);
        this.code = options.code;
      }
    },
  },
}));

jest.mock("src/prisma/prisma.service", () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  })),
}));

describe("UsersService", () => {
  let service: UsersService;

  const mockPasswordService = {
    hash: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockLoggerService = {
    error: jest.fn(),
    setContext: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(mockLoggerService.setContext).toHaveBeenCalledWith(
      UsersService.name,
    );
  });

  describe("create", () => {
    const dto = {
      email: "test@example.com",
      password: "plain-password",
      username: "testuser",
    };

    it("should create a user and return BaseUser", async () => {
      mockPasswordService.hash.mockResolvedValue("hashed-password");

      const createdUser = {
        createdAt: new Date(),
        id: "uuid",
        role: "USER",
        username: dto.username,
      };

      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(dto);

      expect(mockPasswordService.hash).toHaveBeenCalledWith(dto.password);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          password: "hashed-password",
          username: dto.username,
        },
        select: baseUserSelect,
      });

      expect(result).toEqual(createdUser);
    });

    it("should throw ConflictException on unique constraint (P2002)", async () => {
      mockPasswordService.hash.mockResolvedValue("hashed-password");

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        { clientVersion: "0.0.0", code: "P2002" },
      );

      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockLoggerService.error).not.toHaveBeenCalled();
    });

    it("should log and throw InternalServerErrorException on unknown error", async () => {
      mockPasswordService.hash.mockResolvedValue("hashed-password");

      const unknownError = new Error("DB down");
      mockPrismaService.user.create.mockRejectedValue(unknownError);

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        "Failed to create user",
        unknownError,
      );
    });
  });

  describe("findById", () => {
    it("should return BaseUser by id", async () => {
      const user = {
        createdAt: new Date(),
        id: "uuid",
        role: "USER",
        username: "testuser",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findById(user.id);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        select: baseUserSelect,
        where: { id: user.id },
      });

      expect(result).toEqual(user);
    });
  });

  describe("findByUsername", () => {
    it("should return BaseUser by username", async () => {
      const user = {
        createdAt: new Date(),
        id: "uuid",
        role: "USER",
        username: "testuser",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findByUsername(user.username);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        select: baseUserSelect,
        where: { username: user.username },
      });

      expect(result).toEqual(user);
    });
  });
});
