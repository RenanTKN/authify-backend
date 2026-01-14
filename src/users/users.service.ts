import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";

import { Prisma } from "generated/prisma/client";

import { LoggerService } from "src/logger/logger.service";
import { PasswordService } from "src/password/password.service";
import { PrismaService } from "src/prisma/prisma.service";

import { CreateUserDto } from "./dto/create-user.dto";
import { AuthUserWithPassword, BaseUser } from "./types/user.types";
import { authUserSelect, baseUserSelect } from "./users.select";

@Injectable()
export class UsersService {
  constructor(
    private passwordService: PasswordService,
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async create({ email, password, username }: CreateUserDto) {
    const passwordHash = await this.passwordService.hash(password);

    try {
      return await this.prisma.user.create({
        data: {
          email,
          password: passwordHash,
          username,
        },
        select: baseUserSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("User already exists");
      }

      this.logger.error("Failed to create user", error);

      throw new InternalServerErrorException(
        "Unable to create user at this time",
      );
    }
  }

  async findById(id: string): Promise<BaseUser | null> {
    return this.prisma.user.findUnique({
      select: baseUserSelect,
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<BaseUser | null> {
    return this.prisma.user.findUnique({
      select: baseUserSelect,
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<BaseUser | null> {
    return this.prisma.user.findUnique({
      select: baseUserSelect,
      where: { username },
    });
  }

  async findForAuthByUsername(
    username: string,
  ): Promise<AuthUserWithPassword | null> {
    return this.prisma.user.findUnique({
      select: authUserSelect,
      where: { username },
    });
  }
}
