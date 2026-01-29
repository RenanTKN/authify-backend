import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

import { RefreshUser } from "../types/auth-user.type";
import { RefreshTokenPayload } from "../types/jwt-payload.type";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(configService: ConfigService) {
    super({
      audience: configService.getOrThrow("jwt.audience"),
      ignoreExpiration: false,
      issuer: configService.getOrThrow("jwt.issuer"),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const token = req?.cookies.refresh_token as string | undefined;

          return typeof token === "string" ? token : null;
        },
      ]),
      secretOrKey: configService.getOrThrow("JWT_REFRESH_SECRET"),
    });
  }

  validate(payload: RefreshTokenPayload): RefreshUser {
    if (payload.tokenType !== "refresh") {
      throw new UnauthorizedException("Invalid token type");
    }

    return {
      id: payload.sub,
      jti: payload.jti,
    };
  }
}
