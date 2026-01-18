import { applyDecorators } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

import { USER_CONFIG } from "./user.config";
import { USER_SWAGGER } from "./user.swagger";

export function usernameField() {
  return applyDecorators(
    ApiProperty(USER_SWAGGER.fields.username),
    IsString(),
    MinLength(USER_CONFIG.USERNAME.MIN),
    MaxLength(USER_CONFIG.USERNAME.MAX),
    Matches(USER_CONFIG.USERNAME.REGEX),
  );
}

export function passwordField() {
  return applyDecorators(
    ApiProperty(USER_SWAGGER.fields.password),
    IsString(),
    MinLength(USER_CONFIG.PASSWORD.MIN),
    MaxLength(USER_CONFIG.PASSWORD.MAX),
  );
}

export function emailField() {
  return applyDecorators(
    ApiProperty(USER_SWAGGER.fields.email),
    IsEmail({ allow_display_name: false }),
  );
}
