import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class LoggerService {
  private readonly logger = new Logger();
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string) {
    this.logger.log(message, this.context);
  }

  warn(message: string) {
    this.logger.warn(message, this.context);
  }

  error(message: string, error?: unknown): void {
    let stack: string | undefined;

    if (error instanceof Error) {
      stack = error.stack;
    } else if (typeof error === "string") {
      stack = error;
    } else if (error !== undefined) {
      stack = JSON.stringify(error);
    }

    this.logger.error(message, stack, this.context);
  }

  debug(message: string) {
    this.logger.debug(message, this.context);
  }

  verbose(message: string) {
    this.logger.verbose(message, this.context);
  }
}
