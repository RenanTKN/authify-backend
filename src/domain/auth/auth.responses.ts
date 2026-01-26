import { ApiProperty } from "@nestjs/swagger";

import { AUTH_SWAGGER } from "./auth.swagger";
import { COMMON_SWAGGER } from "../commom/commom.swagger";
import { USER_SWAGGER } from "../user/user.swagger";

export class LoginResponse {
  @ApiProperty(AUTH_SWAGGER.fields.accessToken)
  accessToken: string;
}

export class MeResponse {
  @ApiProperty(COMMON_SWAGGER.fields.id)
  id: string;

  @ApiProperty(USER_SWAGGER.fields.role)
  role: string;

  @ApiProperty(USER_SWAGGER.fields.username)
  username: string;
}
