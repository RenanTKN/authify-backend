import { Prisma } from "generated/prisma/client";

export const baseUserSelect = {
  createdAt: true,
  id: true,
  role: true,
  username: true,
} satisfies Prisma.UserSelect;

export const authUserSelect = {
  id: true,
  password: true,
  role: true,
  username: true,
} satisfies Prisma.UserSelect;
