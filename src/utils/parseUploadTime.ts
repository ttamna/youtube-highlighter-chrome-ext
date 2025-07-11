export function parseUploadTime(text: string): number {
  // e.g., '2시간 전', '1일 전', '3주 전', '5분 전'
  if (text.includes('분')) {
    const min = parseInt(text, 10);
    return Math.max(min / 60, 0.01); // 최소값 보정
  }
  if (text.includes('시간')) {
    return parseInt(text, 10);
  }
  if (text.includes('일')) {
    return parseInt(text, 10) * 24;
  }
  if (text.includes('주')) {
    return parseInt(text, 10) * 24 * 7;
  }
  if (text.includes('개월')) {
    return parseInt(text, 10) * 24 * 30;
  }
  if (text.includes('년')) {
    return parseInt(text, 10) * 24 * 365;
  }
  return 0;
} 