import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({
    description: "Returns a hello world message",
    schema: {
      example: "Hello World!",
      type: "string",
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
