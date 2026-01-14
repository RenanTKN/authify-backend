import { Prisma } from "generated/prisma/client";

import { authUserSelect, baseUserSelect } from "../users.select";

export type BaseUser = Prisma.UserGetPayload<{
  select: typeof baseUserSelect;
}>;

export type AuthUserWithPassword = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;
