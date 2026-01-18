import { applyDecorators, HttpStatus } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { LoginResponse, MeResponse } from "./auth.responses";
import { AUTH_SWAGGER } from "./auth.swagger";
import { swaggerErrorResponse } from "../commom/http-error.response";

export function ApiLogin() {
  return applyDecorators(
    ApiOkResponse({
      description: AUTH_SWAGGER.responses.login.OK,
      type: LoginResponse,
    }),
    ApiUnauthorizedResponse(
      swaggerErrorResponse(
        HttpStatus.UNAUTHORIZED,
        "Unauthorized",
        AUTH_SWAGGER.responses.login.UNAUTHORIZED,
      ),
    ),
  );
}

export function ApiMe() {
  return applyDecorators(
    ApiBearerAuth("access-token"),

    ApiOkResponse({
      description: AUTH_SWAGGER.responses.me.OK,
      type: MeResponse,
    }),

    ApiUnauthorizedResponse(
      swaggerErrorResponse(
        HttpStatus.UNAUTHORIZED,
        "Unauthorized",
        AUTH_SWAGGER.responses.me.UNAUTHORIZED,
      ),
    ),
  );
}
