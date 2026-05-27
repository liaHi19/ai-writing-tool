export function truncate(text: string, maxLen: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= maxLen ? flat : flat.slice(0, maxLen) + "…";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}