export function debounce(
  func: (...args: any[]) => void,
  wait: number
): (...args: any[]) => void {
  let timeoutId: number | undefined;
  return (...args: any[]): void => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
}
