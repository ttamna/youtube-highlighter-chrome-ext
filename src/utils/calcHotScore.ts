export function calcHotScore(viewCount: number, hoursSinceUpload: number): number {
  return viewCount / (hoursSinceUpload + 1);
} 