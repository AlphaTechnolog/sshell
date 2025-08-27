export const maxLength = (text: string, length: number): string => {
  const suffix = "...";
  const maxLength = length - suffix.length;
  if (text.length > maxLength) return text.slice(0, maxLength) + suffix;
  return text;
}

export const capitalize = (text: string): string => {
  return text.split(" ").map(x => {
    return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase();
  }).join(" ");
}
