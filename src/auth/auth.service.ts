import { randomUUID } from "crypto";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import type { StringValue } from "ms";

import { AUTH_SWAGGER } from "src/domain/auth/auth.swagger";
import { PasswordService } from "src/password/password.service";
import { UsersService } from "src/users/users.service";

import { LoginDto } from "./dto/login.dto";
import { AuthTokens } from "./types/auth-tokens.type";
import { AuthUser } from "./types/auth-user.type";
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
  ) {
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

    const basePayload = this.buildJwtBasePayload(user.id);
    const accessPayload = this.buildAccessTokenPayload(basePayload, user);
    const refreshPayload = this.buildRefreshTokenPayload(basePayload);

    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(accessPayload, "access"),
      this.generateToken(refreshPayload, "refresh"),
    ]);

    return { accessToken, refreshToken };
  }
}
