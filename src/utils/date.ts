import { WEEKS_PER_YEAR, TOTAL_WEEKS } from "./constants";

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export function getWeeksLived(birthday: string): number {
  const birth = new Date(birthday);
  const now = new Date();
  const diff = now.getTime() - birth.getTime();
  return Math.floor(diff / MS_PER_WEEK);
}

export function getLifeProgress(birthday: string): number {
  const weeksLived = getWeeksLived(birthday);
  return Math.min((weeksLived / TOTAL_WEEKS) * 100, 100);
}

export function getRemainingWeeks(birthday: string): number {
  return Math.max(TOTAL_WEEKS - getWeeksLived(birthday), 0);
}

export function dateToWeekIndex(birthday: string, date: string): number {
  const birth = new Date(birthday);
  const target = new Date(date);
  const diff = target.getTime() - birth.getTime();
  return Math.floor(diff / MS_PER_WEEK);
}

export function weekIndexToYearWeek(weekIndex: number): {
  year: number;
  week: number;
} {
  return {
    year: Math.floor(weekIndex / WEEKS_PER_YEAR),
    week: weekIndex % WEEKS_PER_YEAR,
  };
}
