import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { Request, Response } from "express";
import { StringValue } from "ms";

import {
  ApiLogin,
  ApiLogout,
  ApiMe,
  ApiRefresh,
} from "src/domain/auth/auth.api.decorators";

import { clearRefreshTokenCookie, setRefreshTokenCookie } from "./auth.cookies";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import {
  ThrottleLogin,
  ThrottleRefreshToken,
} from "./decorators/throttle.decorator";
import { LoginDto } from "./dto/login.dto";
import { JwtAccessGuard } from "./guards/jwt-access/jwt-access.guard";
import { JwtRefreshGuard } from "./guards/jwt-refresh/jwt-refresh.guard";
import type { LoginResponse } from "./types/auth-tokens.type";
import type { AuthUser, RefreshUser } from "./types/auth-user.type";

@Controller("auth")
export class AuthController {
  private readonly refreshTokenTtl: StringValue;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTokenTtl =
      this.configService.getOrThrow<StringValue>("jwt.refreshTtl");
  }

  @Post("login")
  @ThrottleLogin()
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const { accessToken, refreshToken } = await this.authService.login(dto);

    setRefreshTokenCookie(res, refreshToken, this.refreshTokenTtl);

    return { accessToken };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiLogout()
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = req.cookies?.refresh_token as string | undefined;

    if (token) {
      await this.authService.logout(token);
    }

    clearRefreshTokenCookie(res);
  }

  @Post("refresh")
  @ThrottleRefreshToken()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiRefresh()
  async refresh(
    @CurrentUser<RefreshUser>() user: RefreshUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const tokens = await this.authService.refresh(user);

    setRefreshTokenCookie(res, tokens.refreshToken, this.refreshTokenTtl);

    return { accessToken: tokens.accessToken };
  }

  @Get("me")
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  @ApiMe()
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
