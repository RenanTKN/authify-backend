import { JwtAccessGuard } from "./jwt-access.guard";

describe("JwtAuthGuard", () => {
  it("should be defined", () => {
    expect(new JwtAccessGuard()).toBeDefined();
  });
});
