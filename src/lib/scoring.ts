import type { Point, PathScoringResult } from "../types"

export function calculateScore(correctDrops: number, incorrectDrops: number) {
  const CORRECT_DROP_POINTS = 5
  const INCORRECT_DROP_PENALTY = -1
  return correctDrops * CORRECT_DROP_POINTS + incorrectDrops * INCORRECT_DROP_PENALTY
}

export function generateTestSummary(score: number, totalQuestions: number) {
  const percentage = (score / (totalQuestions * 5)) * 100
  let performance: string
  if (percentage >= 90) performance = "Excellent"
  else if (percentage >= 75) performance = "Good"
  else if (percentage >= 60) performance = "Average"
  else performance = "Needs Improvement"
  return { score, percentage: percentage.toFixed(2), performance }
}

function distance(a: Point, b: Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function pathLength(path: Point[]) {
  let len = 0
  for (let i = 1; i < path.length; i++) {
    len += distance(path[i], path[i - 1])
  }
  return len
}

export function scoreDrawnPath(
  drawnPath: Point[],
  referencePath: Point[],
  timeSeconds: number
): PathScoringResult {
  if (drawnPath.length < 2) {
    return { score: 0, deviation: 999, time: timeSeconds, accuracy: "poor" }
  }

  const drawnLen = pathLength(drawnPath)
  const refLen = pathLength(referencePath)

  const lengthDeviation = Math.abs(drawnLen - refLen) / refLen

  let totalDist = 0
  let matchCount = 0
  for (let i = 0; i < referencePath.length; i += 5) {
    let minDist = Infinity
    for (let j = 0; j < drawnPath.length; j += 3) {
      const d = distance(referencePath[i], drawnPath[j])
      if (d < minDist) minDist = d
    }
    if (minDist < 50) matchCount++
    totalDist += minDist
  }

  const avgDeviation = totalDist / Math.ceil(referencePath.length / 5)
  const pathAccuracy = matchCount / Math.ceil(referencePath.length / 5)

  const timeScore = Math.max(0, 100 - timeSeconds * 2)
  const accuracyScore = pathAccuracy * 100
  const lengthScore = Math.max(0, 100 - lengthDeviation * 100)

  const finalScore = Math.round(accuracyScore * 0.5 + lengthScore * 0.3 + timeScore * 0.2)

  let accuracy: PathScoringResult["accuracy"] = "poor"
  if (finalScore >= 90) accuracy = "excellent"
  else if (finalScore >= 75) accuracy = "good"
  else if (finalScore >= 50) accuracy = "average"

  return { score: finalScore, deviation: Math.round(avgDeviation), time: timeSeconds, accuracy }
}
