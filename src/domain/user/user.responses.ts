import { ApiProperty } from "@nestjs/swagger";

import { USER_SWAGGER } from "./user.swagger";
import { COMMON_SWAGGER } from "../commom/commom.swagger";

export class CreateUserResponse {
  @ApiProperty(COMMON_SWAGGER.fields.id)
  id: string;

  @ApiProperty(USER_SWAGGER.fields.username)
  username: string;

  @ApiProperty(USER_SWAGGER.fields.role)
  role: string;

  @ApiProperty(COMMON_SWAGGER.fields.createdAt)
  createdAt: Date;
}
