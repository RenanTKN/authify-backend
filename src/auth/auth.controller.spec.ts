import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

jest.mock("./auth.service", () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
  })),
}));

describe("AuthController", () => {
  let controller: AuthController;

  const mockConfigService = {
    getOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
