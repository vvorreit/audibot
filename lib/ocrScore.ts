export interface OcrScoreResult {
  ocrConfidence: number;
  dataScore: number;
  globalScore: number;
  level: "high" | "medium" | "low";
}

export function computeScore(
  ocrConfidence: number,
  dataScore: number
): OcrScoreResult {
  const globalScore = Math.round(ocrConfidence * 0.3 + dataScore * 0.7);
  const level = globalScore >= 80 ? "high" : globalScore >= 50 ? "medium" : "low";
  return { ocrConfidence, dataScore, globalScore, level };
}
