import { Module } from "@nestjs/common";

import { LoggerModule } from "src/logger/logger.module";
import { PasswordModule } from "src/password/password.module";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [LoggerModule, PasswordModule],
  exports: [UsersService],
})
export class UsersModule {}
