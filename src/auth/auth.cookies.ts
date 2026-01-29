import type { Response } from "express";
import ms, { StringValue } from "ms";

const COOKIE_NAME = "refresh_token";
const COOKIE_PATH = "/auth";

export function setRefreshTokenCookie(
  res: Response,
  refreshToken: string,
  ttl: StringValue,
) {
  res.cookie(COOKIE_NAME, refreshToken, {
    httpOnly: true,
    maxAge: ms(ttl),
    path: COOKIE_PATH,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    path: COOKIE_PATH,
  });
}
