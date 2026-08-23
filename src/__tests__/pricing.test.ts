import { calculateCost } from "../config/pricing";

describe("calculateCost", () => {
  it("calculates cost correctly for a known model", () => {
    const cost = calculateCost("openai/gpt-oss-20b", 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(0.075 + 0.30, 5);
  });

  it("returns zero cost for free local models", () => {
    const cost = calculateCost("llama3.2:1b", 1000, 1000);
    expect(cost).toBe(0);
  });

  it("returns zero cost for unknown models instead of throwing", () => {
    const cost = calculateCost("unknown-model", 1000, 1000);
    expect(cost).toBe(0);
  });
});
