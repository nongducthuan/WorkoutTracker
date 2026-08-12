import * as z from 'zod';

export const exerciseSchema = z.object({
  exerciseId: z.coerce.number().min(1, 'Please select an exercise'),
  sets: z.coerce.number().min(1, 'Sets must be at least 1').max(20, 'Max 20 sets'),
  repetitions: z.coerce.number().min(1, 'Reps must be at least 1').max(100, 'Max 100 reps'),
  weight: z.coerce.number().min(0, 'Weight cannot be negative').max(1000, 'Max 1000 kg'),
});
export type ExerciseFormValues = z.infer<typeof exerciseSchema>;

export const scheduleSchema = z.object({
  scheduledDate: z.string().min(1, 'Please select a date and time'),
});
export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
