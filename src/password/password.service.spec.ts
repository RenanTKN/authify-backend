import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { PasswordService } from "./password.service";

describe("PasswordService", () => {
  let service: PasswordService;

  const hashingConfig: Record<string, number> = {
    "hashing.memoryCost": 4096,
    "hashing.parallelism": 1,
    "hashing.timeCost": 2,
  };

  const mockConfigService = {
    get: jest.fn((key: string) => hashingConfig[key]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should use hashing options from ConfigService", async () => {
    await service.hash("test");

    expect(mockConfigService.get).toHaveBeenCalledWith("hashing.memoryCost");
    expect(mockConfigService.get).toHaveBeenCalledWith("hashing.parallelism");
    expect(mockConfigService.get).toHaveBeenCalledWith("hashing.timeCost");
  });

  it("should hash a password", async () => {
    const password = "super-secure-password";

    const hashed = await service.hash(password);

    expect(hashed).toBeDefined();
    expect(typeof hashed).toBe("string");
    expect(hashed).not.toBe(password);
  });

  it("should return true for a correct password", async () => {
    const password = "correct-password";

    const hashed = await service.hash(password);
    const isValid = await service.verify(hashed, password);

    expect(isValid).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const correctPassword = "correct-password";
    const wrongPassword = "wrong-password";

    const hash = await service.hash(correctPassword);
    const isValid = await service.verify(hash, wrongPassword);

    expect(isValid).toBe(false);
  });
});
