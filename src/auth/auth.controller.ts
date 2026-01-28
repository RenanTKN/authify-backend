import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";

import type { Response } from "express";

import {
  ApiLogin,
  ApiLogout,
  ApiMe,
} from "src/domain/auth/auth.api.decorators";

import { clearRefreshTokenCookie, setRefreshTokenCookie } from "./auth.cookies";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { ThrottleLogin } from "./decorators/throttle.decorator";
import { LoginDto } from "./dto/login.dto";
import { JwtAccessGuard } from "./guards/jwt-access/jwt-access.guard";
import type { LoginResponse } from "./types/auth-tokens.type";
import type { AuthUser } from "./types/auth-user.type";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ThrottleLogin()
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const { accessToken, refreshToken } = await this.authService.login(dto);

    setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @Post("logout")
  @ApiLogout()
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    clearRefreshTokenCookie(res);
  }

  @Get("me")
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  @ApiMe()
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
