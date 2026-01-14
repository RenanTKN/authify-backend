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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
