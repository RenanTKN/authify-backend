import { randomUUID } from "crypto";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import ms, { StringValue } from "ms";

import { AUTH_SWAGGER } from "src/domain/auth/auth.swagger";
import { LoggerService } from "src/logger/logger.service";
import { PasswordService } from "src/password/password.service";
import { RefreshTokenService } from "src/refresh-token/refresh-token.service";
import { UsersService } from "src/users/users.service";

import { LoginDto } from "./dto/login.dto";
import { AuthTokens } from "./types/auth-tokens.type";
import { AuthUser, RefreshUser } from "./types/auth-user.type";
import {
  AccessTokenPayload,
  JwtBasePayload,
  RefreshTokenPayload,
} from "./types/jwt-payload.type";

@Injectable()
export class AuthService {
  private readonly jwtAudience: string;
  private readonly jwtIssuer: string;
  private readonly tokenConfig = {
    access: {
      secret: "JWT_ACCESS_SECRET",
      ttl: "JWT_ACCESS_TTL",
    },
    refresh: {
      secret: "JWT_REFRESH_SECRET",
      ttl: "JWT_REFRESH_TTL",
    },
  };

  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(AuthService.name);

    this.jwtAudience = this.configService.getOrThrow<string>("jwt.audience");

    this.jwtIssuer = this.configService.getOrThrow<string>("jwt.issuer");
  }

  private generateToken(
    payload: AccessTokenPayload,
    type: "access",
  ): Promise<string>;
  private generateToken(
    payload: RefreshTokenPayload,
    type: "refresh",
  ): Promise<string>;
  private generateToken(
    payload: AccessTokenPayload | RefreshTokenPayload,
    type: "access" | "refresh",
  ): Promise<string> {
    const { ttl, secret } = this.tokenConfig[type];

    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.getOrThrow<StringValue>(ttl),
      secret: this.configService.getOrThrow<string>(secret),
    });
  }

  private buildJwtBasePayload(userId: string): JwtBasePayload {
    return {
      aud: this.jwtAudience,
      iss: this.jwtIssuer,
      sub: userId,
    };
  }

  private buildAccessTokenPayload(
    jwtBasePayload: JwtBasePayload,
    { role, username }: AuthUser,
  ): AccessTokenPayload {
    return {
      ...jwtBasePayload,
      role,
      tokenType: "access",
      username,
    };
  }

  private buildRefreshTokenPayload(
    jwtBasePayload: JwtBasePayload,
  ): RefreshTokenPayload {
    return {
      ...jwtBasePayload,
      jti: randomUUID(),
      tokenType: "refresh",
    };
  }

  private throwInvalidCredentials(): never {
    throw new UnauthorizedException(AUTH_SWAGGER.responses.login.UNAUTHORIZED);
  }

  private getRefreshTokenTtlInMs(): number {
    const ttl = this.configService.getOrThrow<StringValue>(
      this.tokenConfig.refresh.ttl,
    );
    return ms(ttl);
  }

  private async saveRefreshToken(id: string, userId: string): Promise<void> {
    const expiresAt = new Date(Date.now() + this.getRefreshTokenTtlInMs());

    await this.refreshTokenService.create({ expiresAt, id, userId });
  }

  private async issueTokensForUser(user: AuthUser): Promise<AuthTokens> {
    const basePayload = this.buildJwtBasePayload(user.id);
    const accessPayload = this.buildAccessTokenPayload(basePayload, user);
    const refreshPayload = this.buildRefreshTokenPayload(basePayload);

    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(accessPayload, "access"),
      this.generateToken(refreshPayload, "refresh"),
    ]);

    await this.saveRefreshToken(refreshPayload.jti, user.id);

    return { accessToken, refreshToken };
  }

  async login({ username, password }: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findForAuthByUsername(username);

    if (!user) {
      this.throwInvalidCredentials();
    }

    const isPasswordValid = await this.passwordService.verify(
      user.password,
      password,
    );

    if (!isPasswordValid) {
      this.throwInvalidCredentials();
    }

    return this.issueTokensForUser(user);
  }

  async logout(token?: string): Promise<void> {
    if (!token) {
      return;
    }

    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token, {
        audience: this.jwtAudience,
        issuer: this.jwtIssuer,
        secret: this.configService.getOrThrow("JWT_REFRESH_SECRET"),
      });

      if (payload.tokenType !== "refresh") {
        throw new Error("Invalid token type");
      }

      await this.refreshTokenService.revoke(payload.jti, payload.sub);
    } catch {
      this.logger.warn("Logout with invalid refresh token");
    }
  }

  async refresh(user: RefreshUser): Promise<AuthTokens> {
    const storedToken = await this.refreshTokenService.findValid(
      user.jti,
      user.id,
    );

    if (!storedToken) {
      await this.refreshTokenService.revokeAllForUser(user.id);
      throw new UnauthorizedException(
        AUTH_SWAGGER.responses.refresh.UNAUTHORIZED,
      );
    }

    await this.refreshTokenService.revoke(user.jti, user.id);

    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) {
      throw new UnauthorizedException();
    }

    return this.issueTokensForUser(fullUser);
  }
}
