import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthUser } from "../types/auth-user.type";
import { AccessTokenPayload } from "../types/jwt-payload.type";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  "jwt-access",
) {
  constructor(configService: ConfigService) {
    super({
      audience: configService.getOrThrow("jwt.audience"),
      ignoreExpiration: false,
      issuer: configService.getOrThrow("jwt.issuer"),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  validate(payload: AccessTokenPayload): AuthUser {
    if (payload.tokenType !== "access") {
      throw new UnauthorizedException("Invalid token type");
    }

    return {
      id: payload.sub,
      role: payload.role,
      username: payload.username,
    };
  }
}
