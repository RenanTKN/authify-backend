export type JwtBasePayload = {
  aud: string;
  iss: string;
  sub: string;
};

export type AccessTokenPayload = JwtBasePayload & {
  username: string;
  role: string;
  tokenType: "access";
};

export type RefreshTokenPayload = JwtBasePayload & {
  jti: string;
  tokenType: "refresh";
};
