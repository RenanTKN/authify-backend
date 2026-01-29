import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

import { LoggerService } from "src/logger/logger.service";
import { PasswordService } from "src/password/password.service";
import { RefreshTokenService } from "src/refresh-token/refresh-token.service";
import { UsersService } from "src/users/users.service";

import { AuthService } from "./auth.service";

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

describe("AuthService", () => {
  let service: AuthService;

  const mockUsersService = {
    findById: jest.fn(),
    findByUsername: jest.fn(),
    findForAuthByUsername: jest.fn(),
  };

  const mockPasswordService = {
    hash: jest.fn(),
    verify: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn(),
  };

  const mockRefreshTokenService = {
    create: jest.fn(),
    findValid: jest.fn(),
    revoke: jest.fn(),
    revokeAllForUser: jest.fn(),
  };

  const mockLoggerService = {
    setContext: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RefreshTokenService, useValue: mockRefreshTokenService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      switch (key) {
        case "jwt.audience":
          return "test-audience";

        case "jwt.issuer":
          return "test-issuer";

        case "JWT_REFRESH_SECRET":
          return "refresh-secret";

        case "JWT_ACCESS_SECRET":
          return "access-secret";

        case "JWT_ACCESS_TTL":
        case "JWT_REFRESH_TTL":
          return "1h";

        default:
          throw new Error(`Config key not mocked: ${key}`);
      }
    });

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login", () => {
    const username = "testuser";
    const password = "secret";

    it("should login successfully and return tokens", async () => {
      const user = {
        id: "user-id",
        password: "hashed",
        role: "USER",
        username,
      };
      mockUsersService.findForAuthByUsername.mockResolvedValue(user);
      mockPasswordService.verify.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce("access-token");
      mockJwtService.signAsync.mockResolvedValueOnce("refresh-token");

      const tokens = await service.login({ password, username });

      expect(tokens).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        user.password,
        password,
      );
      expect(mockRefreshTokenService.create).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockUsersService.findForAuthByUsername.mockResolvedValue(null);

      await expect(service.login({ password, username })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if password invalid", async () => {
      const user = {
        id: "user-id",
        password: "hashed",
        role: "USER",
        username,
      };
      mockUsersService.findForAuthByUsername.mockResolvedValue(user);
      mockPasswordService.verify.mockResolvedValue(false);

      await expect(service.login({ password, username })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("logout", () => {
    it("should revoke refresh token successfully", async () => {
      const token = "some-refresh-token";
      const payload = {
        jti: "jti-1",
        sub: "user-id",
        tokenType: "refresh",
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockRefreshTokenService.revoke.mockResolvedValue(undefined);

      await service.logout(token);

      expect(mockJwtService.verify).toHaveBeenCalledWith(token, {
        audience: "test-audience",
        issuer: "test-issuer",
        secret: "refresh-secret",
      });

      expect(mockRefreshTokenService.revoke).toHaveBeenCalledWith(
        payload.jti,
        payload.sub,
      );
    });

    it("should ignore logout if token is not refresh token", async () => {
      mockJwtService.verify.mockReturnValue({
        jti: "jti-1",
        sub: "user-id",
        tokenType: "access",
      });

      await service.logout("token");

      expect(mockRefreshTokenService.revoke).not.toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        "Logout with invalid refresh token",
      );
    });

    it("should not throw if no token provided", async () => {
      await expect(service.logout(undefined)).resolves.toBeUndefined();
    });

    it("should handle invalid token gracefully", async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error("invalid");
      });

      await service.logout("bad-token");

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        "Logout with invalid refresh token",
      );
    });
  });

  describe("refresh", () => {
    const user = { id: "user-id", jti: "token-jti" };

    it("should refresh tokens successfully", async () => {
      const fullUser = { id: user.id, role: "USER", username: "u" };

      mockUsersService.findById.mockResolvedValue(fullUser);
      mockRefreshTokenService.findValid.mockResolvedValue({ id: "token-jti" });
      mockRefreshTokenService.revoke.mockResolvedValue(undefined);
      mockJwtService.signAsync.mockResolvedValueOnce("access-token");
      mockJwtService.signAsync.mockResolvedValueOnce("refresh-token");

      const tokens = await service.refresh(user);

      expect(tokens).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
      expect(mockRefreshTokenService.revoke).toHaveBeenCalledWith(
        user.jti,
        user.id,
      );
    });

    it("should revoke all tokens and throw if refresh token invalid", async () => {
      mockRefreshTokenService.findValid.mockResolvedValue(null);

      await expect(service.refresh(user)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRefreshTokenService.revokeAllForUser).toHaveBeenCalledWith(
        user.id,
      );
    });

    it("should throw if user not found", async () => {
      mockRefreshTokenService.findValid.mockResolvedValue({ id: user.jti });
      mockRefreshTokenService.revoke.mockResolvedValue(undefined);
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.refresh(user)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
