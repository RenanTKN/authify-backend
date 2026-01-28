import { ApiProperty } from "@nestjs/swagger";

import { UserRole } from "generated/prisma/enums";

import { USER_SWAGGER } from "./user.swagger";
import { COMMON_SWAGGER } from "../commom/commom.swagger";

export class CreateUserResponse {
  @ApiProperty(COMMON_SWAGGER.fields.id)
  id: string;

  @ApiProperty(USER_SWAGGER.fields.username)
  username: string;

  @ApiProperty(USER_SWAGGER.fields.role)
  role: UserRole;

  @ApiProperty(COMMON_SWAGGER.fields.createdAt)
  createdAt: Date;
}
