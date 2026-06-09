export interface PointLog {
  logDate: string;
  status: string;
  earnedPoint: number;
}

export function sumCompletedPoints(logs: PointLog[]): number {
  return logs
    .filter((l) => l.status === 'completed')
    .reduce((sum, l) => sum + l.earnedPoint, 0);
}

export function pointsByDay(logs: PointLog[], days: string[]): { date: string; points: number }[] {
  return days.map((date) => ({
    date,
    points: sumCompletedPoints(logs.filter((l) => l.logDate === date)),
  }));
}
