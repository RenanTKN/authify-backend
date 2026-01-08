import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaClient } from "generated/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.getOrThrow<string>("database.url"),
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
