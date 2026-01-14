import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import type { StringValue } from "ms";

import { PasswordService } from "src/password/password.service";
import { UsersService } from "src/users/users.service";

import { LoginDto } from "./dto/login.dto";
import { AuthTokens } from "./types/auth-tokens.type";
import { JwtPayload } from "./types/jwt-payload.type";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private generateToken(
    payload: JwtPayload,
    type: "access" | "refresh",
  ): Promise<string> {
    const configKeys = {
      access: {
        secret: "JWT_ACCESS_SECRET",
        ttl: "JWT_ACCESS_TTL",
      },
      refresh: {
        secret: "JWT_REFRESH_SECRET",
        ttl: "JWT_REFRESH_TTL",
      },
    };

    const { ttl, secret } = configKeys[type];

    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.getOrThrow<StringValue>(ttl),
      secret: this.configService.getOrThrow<string>(secret),
    });
  }

  async login({ username, password }: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findForAuthByUsername(username);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await this.passwordService.verify(
      user.password,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(payload, "access"),
      this.generateToken(payload, "refresh"),
    ]);

    return { accessToken, refreshToken };
  }
}
