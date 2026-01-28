import { UserRole } from "generated/prisma/enums";

export type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
};
