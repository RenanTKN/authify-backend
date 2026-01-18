import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiConflictResponse, ApiCreatedResponse } from "@nestjs/swagger";

import { CreateUserResponse } from "./user.responses";
import { USER_SWAGGER } from "./user.swagger";
import { swaggerErrorResponse } from "../commom/http-error.response";

export function ApiCreateUser() {
  return applyDecorators(
    ApiCreatedResponse({
      description: USER_SWAGGER.responses.create.CREATED,
      type: CreateUserResponse,
    }),
    ApiConflictResponse(
      swaggerErrorResponse(
        HttpStatus.CONFLICT,
        "Conflict",
        USER_SWAGGER.responses.create.CONFLICT,
      ),
    ),
  );
}
