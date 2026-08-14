import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionsApi, SessionSetInput, WorkoutSession } from '../api/sessions';
import { queryKeys } from './queryKeys';

/**
 * Everything derived from real training — reports, records, muscle load,
 * schedule completion — changes the moment a session is logged, so they are
 * invalidated together.
 */
const useInvalidateTrainingData = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reports });
    queryClient.invalidateQueries({ queryKey: queryKeys.personalRecords });
    queryClient.invalidateQueries({ queryKey: ['muscle-load'] });
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.schedules });
    // The plan list carries `lastPerformedAt`, so finishing a session changes a
    // row the user is about to look at.
    queryClient.invalidateQueries({ queryKey: queryKeys.workouts });
  };
};

export interface LogSessionInput {
  workoutId: string;
  scheduleId?: string;
  startedAt?: string;
  durationSec?: number;
  note?: string;
  sets: SessionSetInput[];
}

export const useLogSession = () => {
  const invalidate = useInvalidateTrainingData();

  const mutation = useMutation({
    mutationFn: (input: LogSessionInput) => sessionsApi.log(input),
    onSuccess: invalidate,
  });

  return {
    logSession: (input: LogSessionInput): Promise<WorkoutSession> =>
      mutation.mutateAsync(input),
    isLogging: mutation.isPending,
  };
};

/** Session history — design 04g. */
export const useSessions = (params?: {
  from?: string;
  to?: string;
  workoutId?: string;
  page?: number;
  pageSize?: number;
}) => {
  const query = useQuery({
    queryKey: queryKeys.sessions(params),
    queryFn: () => sessionsApi.getAll({ ...params, finishedOnly: true }),
  });

  return {
    sessions: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

/** One session with every set — design 04c when reopened from history. */
export const useSession = (id?: string) => {
  const query = useQuery({
    queryKey: queryKeys.session(id ?? ''),
    queryFn: () => sessionsApi.getById(id as string),
    enabled: !!id,
  });

  return {
    session: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
