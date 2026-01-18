import { HttpStatus } from "@nestjs/common";
import { ApiResponseOptions } from "@nestjs/swagger";

export function swaggerErrorResponse(
  status: HttpStatus,
  error: string,
  message: string,
): ApiResponseOptions {
  return {
    description: message,
    schema: {
      example: {
        error,
        message,
        statusCode: status,
      },
    },
  };
}
