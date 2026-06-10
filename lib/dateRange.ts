export function isWithinLastDays(date: string, days: 7 | 14 | 30, now = new Date()): boolean {
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) {
    return false;
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (target.getTime() > today.getTime()) {
    return false;
  }

  const start = new Date(today);
  start.setDate(start.getDate() - days);

  return target.getTime() >= start.getTime();
}
