import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../navigation/types';
import {
  useWorkout,
  useWorkoutExercises,
  useExercises,
  useComments,
  useWorkoutSchedules,
} from '../hooks/useFitnessData';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DashboardSkeleton as Skeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { getExerciseMuscleGroup, MuscleId } from '../lib/muscleMap';

import { styles } from './workout-detail/styles';
import { exerciseSchema, scheduleSchema, ScheduleFormValues } from './workout-detail/schemas';
import { useCompletedSets } from './workout-detail/useCompletedSets';
import { useRestTimer } from './workout-detail/useRestTimer';
import { OverviewHeader } from './workout-detail/OverviewHeader';
import { TabsBar, WorkoutDetailTabId } from './workout-detail/TabsBar';
import { ExercisesTab } from './workout-detail/ExercisesTab';
import { CommentsTab } from './workout-detail/CommentsTab';
import { ScheduleTab } from './workout-detail/ScheduleTab';
import { ExerciseFormModal } from './workout-detail/ExerciseFormModal';
import { ScheduleFormModal } from './workout-detail/ScheduleFormModal';
import { RestTimerPill } from './workout-detail/RestTimerPill';

type WorkoutDetailRouteProp = RouteProp<RootStackParamList, 'WorkoutDetail'>;

export default function WorkoutDetailScreen() {
  const route = useRoute<WorkoutDetailRouteProp>();
  const navigation = useNavigation<any>();
  const workoutId = route.params?.id || '';

  const [activeTab, setActiveTab] = useState<WorkoutDetailTabId>('exercises');

  const { workout, isLoading: isWorkoutLoading, updateWorkout } = useWorkout(workoutId);
  const {
    workoutExercises,
    isLoading: isExercisesLoading,
    addExercise,
    updateExercise,
    deleteExercise,
  } = useWorkoutExercises(workoutId);
  const { exercises: globalExercises } = useExercises();
  const {
    comments,
    isLoading: isCommentsLoading,
    addComment,
    updateComment,
    deleteComment,
  } = useComments(workoutId);
  const {
    schedules: workoutSchedules,
    scheduleWorkout,
    updateSchedule,
    deleteSchedule,
    completeSchedule,
    isCompleting,
  } = useWorkoutSchedules(workoutId);

  // Rest timer + completed-sets tracking (persisted to AsyncStorage per workout)
  const restTimer = useRestTimer();
  const { completedSets, toggleSetCompletion, resetCompletedSets } = useCompletedSets(
    workoutId,
    restTimer.start
  );

  const sortedWorkoutSchedules = useMemo(() => {
    return [...workoutSchedules].sort(
      (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }, [workoutSchedules]);

  const todaySchedule = useMemo(() => {
    const todayStr = new Date().toDateString();
    return workoutSchedules.find(
      (s) => !s.isCompleted && new Date(s.scheduledDate).toDateString() === todayStr
    );
  }, [workoutSchedules]);

  const handleCompleteWorkout = async () => {
    if (!todaySchedule) return;
    try {
      await completeSchedule(todaySchedule.id);
      resetCompletedSets();
    } catch (e) {}
  };

  // --- Overview edit state ---
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleStartEditOverview = () => {
    if (!workout) return;
    setEditName(workout.name);
    setEditDescription(workout.description || '');
    setIsEditingOverview(true);
  };

  const handleSaveOverview = async () => {
    if (!editName.trim() || !editDescription.trim()) return;
    try {
      await updateWorkout({ name: editName, description: editDescription });
      setIsEditingOverview(false);
    } catch {}
  };

  // --- Exercise modal state ---
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<any>(null);
  const [exSubmitStatus, setExSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { control: controlEx, handleSubmit: handleSubmitEx, reset: resetEx } = useForm<any>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { exerciseId: 0, sets: 3, repetitions: 10, weight: 0 },
  });

  const handleOpenAddExModal = () => {
    setEditingEx(null);
    resetEx({ exerciseId: 0, sets: 3, repetitions: 10, weight: 0 });
    setExSubmitStatus('idle');
    setIsExerciseModalOpen(true);
  };

  const handleOpenEditExModal = (we: any) => {
    setEditingEx(we);
    resetEx({
      exerciseId: we.exerciseId,
      sets: we.sets,
      repetitions: we.repetitions,
      weight: we.weight,
    });
    setExSubmitStatus('idle');
    setIsExerciseModalOpen(true);
  };

  const onSubmitEx = async (data: any) => {
    setExSubmitStatus('loading');
    try {
      if (editingEx) {
        await updateExercise({ id: editingEx.id, data: { ...data, workoutId } });
      } else {
        await addExercise({ ...data, workoutId });
      }
      setExSubmitStatus('success');
      setTimeout(() => {
        setIsExerciseModalOpen(false);
        setExSubmitStatus('idle');
        resetEx();
      }, 1500);
    } catch {
      setExSubmitStatus('error');
    }
  };

  // --- Comments state ---
  const [commentInput, setCommentInput] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const handlePostComment = async () => {
    if (!commentInput.trim()) return;
    try {
      await addComment(commentInput);
      setCommentInput('');
    } catch {}
  };

  const handleStartEditComment = (id: string, currentText: string) => {
    setEditingCommentId(id);
    setEditCommentText(currentText);
  };

  const handleSaveCommentEdit = async (id: string) => {
    if (!editCommentText.trim()) return;
    try {
      await updateComment({ id, comment: editCommentText });
      setEditingCommentId(null);
    } catch {}
  };

  // --- Schedule modal state ---
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  const { control: controlSched, handleSubmit: handleSubmitSched, reset: resetSched } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
  });

  const handleOpenAddSchedule = () => {
    setEditingScheduleId(null);
    resetSched();
    setIsScheduleModalOpen(true);
  };

  const onSubmitSched = async (data: ScheduleFormValues) => {
    try {
      if (editingScheduleId) {
        await updateSchedule({ id: editingScheduleId, date: new Date(data.scheduledDate).toISOString() });
      } else {
        await scheduleWorkout(new Date(data.scheduledDate).toISOString());
      }
      setIsScheduleModalOpen(false);
      resetSched();
    } catch {}
  };

  // --- Delete confirmation (shared across exercise / comment / schedule) ---
  const [deletingElement, setDeletingElement] = useState<{ type: 'exercise' | 'comment' | 'schedule'; id: string } | null>(null);

  const handleConfirmDeleteElement = async () => {
    if (!deletingElement) return;
    try {
      if (deletingElement.type === 'exercise') {
        await deleteExercise(deletingElement.id);
      } else if (deletingElement.type === 'comment') {
        await deleteComment(deletingElement.id);
      } else if (deletingElement.type === 'schedule') {
        await deleteSchedule(deletingElement.id);
      }
      setDeletingElement(null);
    } catch {}
  };

  const overallTargets = useMemo(() => {
    const primarySet = new Set<MuscleId>();
    const secondarySet = new Set<MuscleId>();

    (workoutExercises || []).forEach((we: any) => {
      const mapping = getExerciseMuscleGroup(we.exerciseName || '');
      mapping.primary.forEach((m) => primarySet.add(m));
      mapping.secondary.forEach((m) => secondarySet.add(m));
    });

    return {
      primary: Array.from(primarySet),
      secondary: Array.from(secondarySet),
    };
  }, [workoutExercises]);

  if (isWorkoutLoading) {
    return <Skeleton />;
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState
          title="Workout Split Not Found"
          description="This profile does not exist or has been deleted from the catalog."
          actionText="Back to Routines"
          onAction={() => navigation.navigate('Main')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.backgroundGlow} pointerEvents="none" />

      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        <OverviewHeader
          workoutName={workout.name}
          workoutDescription={workout.description || ''}
          isEditing={isEditingOverview}
          editName={editName}
          editDescription={editDescription}
          onChangeEditName={setEditName}
          onChangeEditDescription={setEditDescription}
          onStartEdit={handleStartEditOverview}
          onCancelEdit={() => setIsEditingOverview(false)}
          onSaveEdit={handleSaveOverview}
          onGoBack={() => navigation.goBack()}
          showFinishButton={!!todaySchedule}
          isFinishing={isCompleting}
          onFinishWorkout={handleCompleteWorkout}
        />

        <TabsBar activeTab={activeTab} onChangeTab={setActiveTab} />

        <View style={styles.tabPane}>
          {activeTab === 'exercises' && (
            <ExercisesTab
              isLoading={isExercisesLoading}
              workoutExercises={workoutExercises}
              completedSets={completedSets}
              overallTargets={overallTargets}
              onToggleSet={toggleSetCompletion}
              onAddExercise={handleOpenAddExModal}
              onEditExercise={handleOpenEditExModal}
              onDeleteExercise={(id) => setDeletingElement({ type: 'exercise', id })}
            />
          )}

          {activeTab === 'comments' && (
            <CommentsTab
              isLoading={isCommentsLoading}
              comments={comments}
              commentInput={commentInput}
              onChangeCommentInput={setCommentInput}
              onPostComment={handlePostComment}
              editingCommentId={editingCommentId}
              editCommentText={editCommentText}
              onChangeEditCommentText={setEditCommentText}
              onStartEditComment={handleStartEditComment}
              onCancelEditComment={() => setEditingCommentId(null)}
              onSaveEditComment={handleSaveCommentEdit}
              onDeleteComment={(id) => setDeletingElement({ type: 'comment', id })}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleTab
              schedules={workoutSchedules}
              sortedSchedules={sortedWorkoutSchedules}
              onAddSchedule={handleOpenAddSchedule}
              onDeleteSchedule={(id) => setDeletingElement({ type: 'schedule', id })}
            />
          )}
        </View>
      </ScrollView>

      <RestTimerPill
        isActive={restTimer.isTimerActive}
        secondsLeft={restTimer.timerSeconds}
        onClose={restTimer.stop}
      />

      <ExerciseFormModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        isEditing={!!editingEx}
        control={controlEx}
        onSubmit={handleSubmitEx(onSubmitEx)}
        submitStatus={exSubmitStatus}
      />

      <ScheduleFormModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        control={controlSched}
        onSubmit={handleSubmitSched(onSubmitSched)}
      />

      <ConfirmDialog
        isOpen={!!deletingElement}
        title="Delete Item"
        message="Are you sure you want to remove this? This action cannot be undone."
        onConfirm={handleConfirmDeleteElement}
        onCancel={() => setDeletingElement(null)}
        confirmText="Remove"
        isDanger={true}
      />
    </SafeAreaView>
  );
}