import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { LoggerModule } from "src/logger/logger.module";
import { PasswordModule } from "src/password/password.module";
import { RefreshTokenModule } from "src/refresh-token/refresh-token.module";
import { UsersModule } from "src/users/users.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAccessStrategy } from "./strategies/jwt-access.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";

@Module({
  imports: [
    UsersModule,
    PasswordModule,
    JwtModule,
    RefreshTokenModule,
    LoggerModule,
  ],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
