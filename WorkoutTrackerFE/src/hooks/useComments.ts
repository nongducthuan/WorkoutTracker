import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { commentsApi } from '../api/comments';
import { useToast } from '../../components/Toast';
import { WorkoutComment } from '../types';
import { queryKeys } from './queryKeys';

export const useComments = (workoutId: string) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const query = useQuery({
    queryKey: queryKeys.comments(workoutId),
    queryFn: () => commentsApi.getByWorkoutId(workoutId),
    enabled: !!workoutId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.comments(workoutId) });

  const createMutation = useMutation({
    mutationFn: (comment: string) => commentsApi.create(workoutId, comment),
    onSuccess: () => {
      invalidate();
      success(t('toast.comment_added'));
    },
    onError: () => error(t('error.generic')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      commentsApi.update(id, comment, workoutId),
    onSuccess: () => {
      invalidate();
      success(t('toast.comment_updated'));
    },
    onError: () => error(t('error.generic')),
  });

  const deleteMutation = useMutation({
    mutationFn: commentsApi.delete,
    onSuccess: () => {
      invalidate();
      success(t('toast.comment_deleted'));
    },
    onError: () => error(t('error.generic')),
  });

  return {
    comments: (query.data || []) as WorkoutComment[],
    isLoading: query.isLoading,
    isError: query.isError,
    addComment: createMutation.mutateAsync,
    isAdding: createMutation.isPending,
    updateComment: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteComment: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
