import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").required(),

  APP_PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().uri().required(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),

  JWT_ACCESS_TTL: Joi.string().default("10m"),
  JWT_REFRESH_TTL: Joi.string().default("7d"),

  COOKIE_SECRET: Joi.string().min(32).required(),
});
