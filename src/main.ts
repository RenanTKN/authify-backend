import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import cookieParser from "cookie-parser";
import helmet from "helmet";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser(config.getOrThrow<string>("cookie.secret")));

  app.setGlobalPrefix("api");

  await app.listen(config.getOrThrow<number>("port"));
}
void bootstrap();
