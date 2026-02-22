export interface ConfidenceInputs {
  modelConfidence: number;
  validationScore: number;
  crossFieldScore: number;
}

export interface ConfidenceWeights {
  model: number;
  validation: number;
  crossField: number;
}

const DEFAULT_WEIGHTS: ConfidenceWeights = {
  model: 0.5,
  validation: 0.3,
  crossField: 0.2,
};

const REVIEW_THRESHOLD = 0.85;

export function calculateConfidence(
  inputs: ConfidenceInputs,
  weights: ConfidenceWeights = DEFAULT_WEIGHTS
): { score: number; requiresReview: boolean } {
  const totalWeight = weights.model + weights.validation + weights.crossField;
  const score =
    (inputs.modelConfidence * weights.model +
      inputs.validationScore * weights.validation +
      inputs.crossFieldScore * weights.crossField) /
    totalWeight;

  const rounded = Math.round(score * 1000) / 1000;

  return {
    score: rounded,
    requiresReview: rounded < REVIEW_THRESHOLD,
  };
}

export function getReviewThreshold(): number {
  return REVIEW_THRESHOLD;
}
