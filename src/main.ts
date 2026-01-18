import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import cookieParser from "cookie-parser";
import helmet from "helmet";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser(configService.getOrThrow<string>("cookie.secret")));

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
      whitelist: true,
    }),
  );

  app.setGlobalPrefix("api");

  if (configService.getOrThrow("NODE_ENV") !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("API")
      .setDescription("API documentation")
      .setVersion("1.0")
      .addBearerAuth(
        {
          bearerFormat: "JWT",
          scheme: "bearer",
          type: "http",
        },
        "access-token",
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup("docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(configService.getOrThrow<number>("port"));
}
void bootstrap();
