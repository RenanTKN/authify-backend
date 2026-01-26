import { minutes, seconds, ThrottlerModuleOptions } from "@nestjs/throttler";

const throttlerConfig: ThrottlerModuleOptions = [
  {
    name: "default",
    ttl: minutes(1),
    limit: 100,
  },
  {
    name: "short",
    ttl: seconds(1),
    limit: 3,
  },
  {
    name: "medium",
    ttl: seconds(10),
    limit: 20,
  },
];

export default throttlerConfig;
