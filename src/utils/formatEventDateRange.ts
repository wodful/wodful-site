/** Format event start/end for display (API already returns dd/MM/yyyy). */
export function formatEventDateRange(
  startDate?: string | null,
  endDate?: string | null
): string {
  const start = startDate?.trim() ?? "";
  const end = endDate?.trim() ?? "";

  if (!start && !end) return "";
  if (!end || start === end) {
    return start ? `${start} · evento de 1 dia` : end;
  }
  return `${start} até ${end}`;
}
