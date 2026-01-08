export default () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.APP_PORT ?? "3000", 10),

  database: {
    url: process.env.DATABASE_URL,
  },

  cookie: {
    secret: process.env.COOKIE_SECRET,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL,
    refreshTtl: process.env.JWT_REFRESH_TTL,
  },
});
