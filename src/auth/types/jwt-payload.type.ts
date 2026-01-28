import { UserRole } from "generated/prisma/enums";

export type JwtBasePayload = {
  aud: string;
  iss: string;
  sub: string;
};

export type AccessTokenPayload = JwtBasePayload & {
  username: string;
  role: UserRole;
  tokenType: "access";
};

export type RefreshTokenPayload = JwtBasePayload & {
  jti: string;
  tokenType: "refresh";
};
