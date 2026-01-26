import type { Response } from "express";

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = "refresh_token";
const COOKIE_PATH = "/auth";

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie(COOKIE_NAME, refreshToken, {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_TTL,
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
