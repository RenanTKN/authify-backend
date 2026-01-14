import { Test, TestingModule } from "@nestjs/testing";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

jest.mock("./users.service", () => ({
  UsersService: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  })),
}));

describe("UsersController", () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
