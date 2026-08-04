import {
  getISOWeek,
  startOfWeek,
  startOfDay,
  subDays,
  isSameDay,
} from "date-fns";
import {
  ReportRepository,
  CompletedScheduleRaw,
} from "../repositories/report.repository";

export interface WeeklyWorkoutDto {
  week: string;
  count: number;
  volume: number;
}

export interface RecentActivityDto {
  id: string;
  date: Date;
  workoutName: string;
  exercisesCount: number;
}

export interface WorkoutReportDto {
  totalWorkouts: number;
  totalVolume: number;
  streakDays: number;
  workoutsThisWeek: number;
  weeklyWorkouts: WeeklyWorkoutDto[];
  recentActivity: RecentActivityDto[];
}

export class ReportService {
  private repository: ReportRepository;

  constructor() {
    this.repository = new ReportRepository();
  }

  async generateReport(userId: string): Promise<WorkoutReportDto> {
    const schedules = await this.repository.findCompletedByUserId(userId);

    if (schedules.length === 0) {
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        streakDays: 0,
        workoutsThisWeek: 0,
        weeklyWorkouts: [],
        recentActivity: [],
      };
    }

    const totalWorkouts = schedules.length;

    let totalVolume = 0;
    for (const s of schedules) {
      for (const we of s.workout.workoutExercises) {
        totalVolume += we.sets * we.repetitions * we.weight;
      }
    }

    const recentActivity: RecentActivityDto[] = schedules
      .slice()
      .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime())
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        date: s.scheduledDate,
        workoutName: s.workout.name,
        exercisesCount: s.workout.workoutExercises.length,
      }));

    type WeekGroup = {
      weekNumber: number;
      count: number;
      volume: number;
    };

    const weekMap = new Map<number, WeekGroup>();

    for (const s of schedules) {
      const weekNumber = getISOWeek(s.scheduledDate);

      const scheduleVolume = s.workout.workoutExercises.reduce(
        (sum, we) => sum + we.sets * we.repetitions * we.weight,
        0
      );

      const existing = weekMap.get(weekNumber);
      if (existing) {
        existing.count += 1;
        existing.volume += scheduleVolume;
      } else {
        weekMap.set(weekNumber, {
          weekNumber,
          count: 1,
          volume: scheduleVolume,
        });
      }
    }

    const weeklyWorkouts: WeeklyWorkoutDto[] = Array.from(weekMap.values())
      .sort((a, b) => b.weekNumber - a.weekNumber)
      .slice(0, 4)
      .sort((a, b) => a.weekNumber - b.weekNumber)
      .map((g) => ({
        week: `W${g.weekNumber}`,
        count: g.count,
        volume: g.volume,
      }));

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const todayStart = startOfDay(now);

    const workoutsThisWeek = schedules.filter((s) => {
      const d = startOfDay(s.scheduledDate);
      return d >= weekStart && d <= todayStart;
    }).length;

    const uniqueDatesDesc: Date[] = Array.from(
      new Map(
        schedules.map((s) => {
          const d = startOfDay(s.scheduledDate);
          return [d.getTime(), d];
        })
      ).values()
    ).sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    if (uniqueDatesDesc.length > 0) {
      const today = startOfDay(new Date());
      const yesterday = subDays(today, 1);
      const mostRecent = uniqueDatesDesc[0];

      if (isSameDay(mostRecent, today) || isSameDay(mostRecent, yesterday)) {
        streak = 1;

        for (let i = 1; i < uniqueDatesDesc.length; i++) {
          const prevDay = uniqueDatesDesc[i - 1];
          const currDay = uniqueDatesDesc[i];
          const expectedCurr = subDays(prevDay, 1);

          if (isSameDay(currDay, expectedCurr)) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    return {
      totalWorkouts,
      totalVolume,
      streakDays: streak,
      workoutsThisWeek,
      weeklyWorkouts,
      recentActivity,
    };
  }
}
