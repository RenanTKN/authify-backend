import { applyDecorators, HttpStatus } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
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
      headers: {
        "Set-Cookie": AUTH_SWAGGER.fields.refreshToken,
      },
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

export function ApiLogout() {
  return applyDecorators(
    ApiNoContentResponse({
      description: AUTH_SWAGGER.responses.logout.OK,
      headers: {
        "Set-Cookie": AUTH_SWAGGER.fields.clearRefreshToken,
      },
    }),
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
