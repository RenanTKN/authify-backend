import { USER_CONFIG } from "./user.config";

export const USER_SWAGGER = {
  fields: {
    email: {
      description: "User email address (unique)",
      example: "user@example.com",
      format: "email",
    },

    password: {
      description: "User password",
      example: "strong-password-123",
      maxLength: USER_CONFIG.PASSWORD.MAX,
      minLength: USER_CONFIG.PASSWORD.MIN,
    },

    role: {
      description: "User role",
      example: "USER",
    },

    username: {
      description:
        "Unique username (lowercase, letters, numbers and underscore)",
      example: "example_user",
      maxLength: USER_CONFIG.USERNAME.MAX,
      minLength: USER_CONFIG.USERNAME.MIN,
      pattern: USER_CONFIG.USERNAME.REGEX.source,
    },
  },

  responses: {
    create: {
      CONFLICT: "User already exists",
      CREATED: "User created successfully",
    },
  },
};
