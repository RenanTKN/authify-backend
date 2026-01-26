export default () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.APP_PORT ?? "3000", 10),

  database: {
    url: process.env.DATABASE_URL,
  },

  cookie: {
    secret: process.env.COOKIE_SECRET,
  },

  hashing: {
    memoryCost: parseInt(process.env.HASH_MEMORY_COST ?? "65536", 10),
    parallelism: parseInt(process.env.HASH_PARALLELISM ?? "1", 10),
    timeCost: parseInt(process.env.HASH_TIME_COST ?? "3", 10),
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL,
    refreshTtl: process.env.JWT_REFRESH_TTL,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  },
});
