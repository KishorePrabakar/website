export function readingTime(wordCount: number): string {
  const mins = Math.max(1, Math.ceil(wordCount / 200))
  return `${mins} min read`
}
