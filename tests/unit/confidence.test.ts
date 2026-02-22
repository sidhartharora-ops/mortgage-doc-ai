import { describe, it, expect } from "vitest";
import { calculateConfidence, getReviewThreshold } from "@/lib/confidence/engine";

describe("Confidence Engine", () => {
  it("calculates weighted average correctly", () => {
    const result = calculateConfidence({
      modelConfidence: 0.9,
      validationScore: 1.0,
      crossFieldScore: 0.8,
    });
    // (0.9 * 0.5 + 1.0 * 0.3 + 0.8 * 0.2) / 1.0 = 0.45 + 0.30 + 0.16 = 0.91
    expect(result.score).toBe(0.91);
    expect(result.requiresReview).toBe(false); // 0.91 >= 0.85
  });

  it("flags for review when below threshold", () => {
    const result = calculateConfidence({
      modelConfidence: 0.7,
      validationScore: 0.6,
      crossFieldScore: 0.5,
    });
    // (0.7 * 0.5 + 0.6 * 0.3 + 0.5 * 0.2) / 1.0 = 0.35 + 0.18 + 0.10 = 0.63
    expect(result.score).toBe(0.63);
    expect(result.requiresReview).toBe(true); // 0.63 < 0.85
  });

  it("handles perfect scores", () => {
    const result = calculateConfidence({
      modelConfidence: 1.0,
      validationScore: 1.0,
      crossFieldScore: 1.0,
    });
    expect(result.score).toBe(1.0);
    expect(result.requiresReview).toBe(false);
  });

  it("handles zero scores", () => {
    const result = calculateConfidence({
      modelConfidence: 0,
      validationScore: 0,
      crossFieldScore: 0,
    });
    expect(result.score).toBe(0);
    expect(result.requiresReview).toBe(true);
  });

  it("respects custom weights", () => {
    const result = calculateConfidence(
      { modelConfidence: 0.9, validationScore: 1.0, crossFieldScore: 0.8 },
      { model: 0.6, validation: 0.2, crossField: 0.2 }
    );
    // (0.9 * 0.6 + 1.0 * 0.2 + 0.8 * 0.2) / 1.0 = 0.54 + 0.20 + 0.16 = 0.90
    expect(result.score).toBe(0.9);
  });

  it("boundary: exactly at threshold does not require review", () => {
    const result = calculateConfidence({
      modelConfidence: 0.85,
      validationScore: 0.85,
      crossFieldScore: 0.85,
    });
    expect(result.score).toBe(0.85);
    expect(result.requiresReview).toBe(false);
  });

  it("boundary: just below threshold requires review", () => {
    const result = calculateConfidence({
      modelConfidence: 0.84,
      validationScore: 0.84,
      crossFieldScore: 0.84,
    });
    expect(result.score).toBe(0.84);
    expect(result.requiresReview).toBe(true);
  });

  it("review threshold is 0.85", () => {
    expect(getReviewThreshold()).toBe(0.85);
  });
});
