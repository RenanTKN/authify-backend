import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";

import { Request } from "express";

export const CurrentUser = createParamDecorator(
  <T = unknown>(_: unknown, ctx: ExecutionContext): T => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) {
      throw new UnauthorizedException("User not authenticated");
    }

    return request.user as T;
  },
);
