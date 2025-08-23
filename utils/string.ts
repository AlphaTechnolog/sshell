export const maxLength = (text: string, length: number): string => {
  const suffix = "...";
  const maxLength = length - suffix.length;
  if (text.length > maxLength) return text.slice(0, maxLength) + suffix;
  return text;
}
