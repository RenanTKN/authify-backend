import { minutes, Throttle } from "@nestjs/throttler";

export const ThrottleLogin = () =>
  Throttle({
    default: {
      blockDuration: minutes(5),
      limit: 10,
      ttl: minutes(1),
    },
  });

export const ThrottleCreateUser = () =>
  Throttle({
    default: {
      blockDuration: minutes(30),
      limit: 5,
      ttl: minutes(10),
    },
  });
