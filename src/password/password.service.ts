import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { argon2id, hash, Options, verify } from "argon2";

@Injectable()
export class PasswordService {
  constructor(private configService: ConfigService) {}

  private get options(): Options {
    return {
      memoryCost: this.configService.get<number>("hashing.memoryCost"),
      parallelism: this.configService.get<number>("hashing.parallelism"),
      timeCost: this.configService.get<number>("hashing.timeCost"),
      type: argon2id,
    };
  }

  async hash(password: string): Promise<string> {
    return hash(password, this.options);
  }

  async verify(hash: string, password: string): Promise<boolean> {
    return verify(hash, password);
  }
}
