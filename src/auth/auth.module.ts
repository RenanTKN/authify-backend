import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { PasswordModule } from "src/password/password.module";
import { UsersModule } from "src/users/users.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [UsersModule, PasswordModule, JwtModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
