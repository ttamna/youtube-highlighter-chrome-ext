export function parseViewCount(text: string): number {
  // Remove non-numeric, non-Korean characters
  text = text.replace(/,/g, '').replace(/[^\d.만천회]/g, '');
  if (text.includes('만')) {
    // '9.3만회' → '9.3'
    const num = parseFloat(text.replace('만', '').replace('회', ''));
    return isNaN(num) ? 0 : Math.round(num * 10000);
  }
  if (text.includes('천')) {
    // '3.3천회' → '3.3'
    const num = parseFloat(text.replace('천', '').replace('회', ''));
    return isNaN(num) ? 0 : Math.round(num * 1000);
  }
  // e.g., '1234회' => 1234
  const num = parseInt(text.replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? 0 : num;
} 