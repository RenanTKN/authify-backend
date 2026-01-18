import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

import { ApiCreateUser } from "src/domain/user/user.api.decorators";
import { CreateUserResponse } from "src/domain/user/user.responses";

import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateUser()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResponse> {
    const user = await this.usersService.create(createUserDto);

    return user;
  }
}
