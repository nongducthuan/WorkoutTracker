import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

import { 
  useWorkout, 
  useWorkoutExercises, 
  useExercises, 
  useComments, 
  useWorkoutSchedules 
} from '../../src/hooks/useFitnessData';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DashboardSkeleton as Skeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { MuscleMap } from '../../components/MuscleMap';
import { getExerciseMuscleGroup, getMuscleLabel, MuscleId } from '../../src/lib/muscleMap';

const exerciseSchema = z.object({
  exerciseId: z.coerce.number().min(1, 'Please select an exercise'),
  sets: z.coerce.number().min(1, 'Sets must be at least 1').max(20, 'Max 20 sets'),
  repetitions: z.coerce.number().min(1, 'Reps must be at least 1').max(100, 'Max 100 reps'),
  weight: z.coerce.number().min(0, 'Weight cannot be negative').max(1000, 'Max 1000 kg'),
});
type ExerciseFormValues = z.infer<typeof exerciseSchema>;

const scheduleSchema = z.object({
  scheduledDate: z.string().min(1, 'Please select a date and time'),
});
type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams();
  const workoutId = Array.isArray(id) ? id[0] : id || '';
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'exercises' | 'comments' | 'schedule'>('exercises');

  const { workout, isLoading: isWorkoutLoading, updateWorkout } = useWorkout(workoutId);
  const { 
    workoutExercises, 
    isLoading: isExercisesLoading, 
    addExercise, 
    updateExercise, 
    deleteExercise 
  } = useWorkoutExercises(workoutId);
  const { exercises: globalExercises } = useExercises();
  const { 
    comments, 
    isLoading: isCommentsLoading, 
    addComment, 
    updateComment, 
    deleteComment 
  } = useComments(workoutId);
  const { 
    schedules: workoutSchedules,
    scheduleWorkout, 
    updateSchedule,
    deleteSchedule, 
    completeSchedule, 
    isCompleting 
  } = useWorkoutSchedules(workoutId);

  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});

  useEffect(() => {
    AsyncStorage.getItem(`completed_sets_${workoutId}`).then((saved) => {
      if (saved) {
        try {
          setCompletedSets(JSON.parse(saved));
        } catch (e) {}
      }
    });
  }, [workoutId]);

  useEffect(() => {
    AsyncStorage.setItem(`completed_sets_${workoutId}`, JSON.stringify(completedSets));
  }, [completedSets, workoutId]);

  const sortedWorkoutSchedules = useMemo(() => {
    return [...workoutSchedules].sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [workoutSchedules]);

  const todaySchedule = useMemo(() => {
    const todayStr = new Date().toDateString();
    return workoutSchedules.find(s => 
      !s.isCompleted && 
      new Date(s.scheduledDate).toDateString() === todayStr
    );
  }, [workoutSchedules]);

  const handleCompleteWorkout = async () => {
    if (!todaySchedule) return;
    try {
      await completeSchedule(todaySchedule.id);
      setCompletedSets({});
      AsyncStorage.removeItem(`completed_sets_${workoutId}`);
    } catch (e) {}
  };

  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            setIsTimerActive(false);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

  const playBeep = async () => {
    // Basic beep simulation via expo-av not implemented here to keep it simple,
    // but structure is ready if needed.
  };

  const toggleSetCompletion = (weId: string, setIdx: number) => {
    setCompletedSets((prev) => {
      const current = prev[weId] ? [...prev[weId]] : [];
      const length = workoutExercises.find((we: any) => we.id === weId)?.sets || 4;
      while (current.length < length) {
        current.push(false);
      }
      const newVal = !current[setIdx];
      current[setIdx] = newVal;

      if (newVal) {
        setTimerSeconds(60);
        setIsTimerActive(true);
      }

      return { ...prev, [weId]: current };
    });
  };

  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<any>(null);

  const [commentInput, setCommentInput] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const [deletingElement, setDeletingElement] = useState<{ type: 'exercise' | 'comment' | 'schedule'; id: string } | null>(null);

  const [exSubmitStatus, setExSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Schedule edit state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  const { control: controlEx, handleSubmit: handleSubmitEx, reset: resetEx, watch: watchEx } = useForm<any>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { exerciseId: 0, sets: 3, repetitions: 10, weight: 0 }
  });

  const { control: controlSched, handleSubmit: handleSubmitSched, reset: resetSched } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
  });

  const selectedExId = watchEx('exerciseId');

  const handleStartEditOverview = () => {
    if (!workout) return;
    setEditName(workout.name);
    setEditDescription(workout.description);
    setIsEditingOverview(true);
  };

  const handleSaveOverview = async () => {
    if (!editName.trim() || !editDescription.trim()) return;
    try {
      await updateWorkout({ name: editName, description: editDescription });
      setIsEditingOverview(false);
    } catch {}
  };

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
      weight: we.weight 
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

  const handlePostComment = async () => {
    if (!commentInput.trim()) return;
    try {
      await addComment(commentInput);
      setCommentInput('');
    } catch {}
  };

  const handleSaveCommentEdit = async (id: string) => {
    if (!editCommentText.trim()) return;
    try {
      await updateComment({ id, comment: editCommentText });
      setEditingCommentId(null);
    } catch {}
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

  const handleOpenAddSchedule = () => {
    setEditingScheduleId(null);
    resetSched();
    setIsScheduleModalOpen(true);
  };

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
      <View className="flex-1 bg-background p-5">
        <EmptyState
          title="Workout Split Not Found"
          description="This profile does not exist or has been deleted from the catalog."
          actionText="Back to Routines"
          onAction={() => router.push('/(tabs)/workouts')}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background relative">
      {/* Background glow */}
      <View className="absolute top-0 right-0 w-64 h-64 bg-electric/5 rounded-full" style={{ opacity: 0.5, pointerEvents: 'none' }} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="p-5 border-b border-border-gray">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1.5 mb-4 self-start bg-surface px-3 py-1.5 rounded-lg border border-border-gray">
            <Feather name="arrow-left" size={14} color="white" />
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Back</Text>
          </TouchableOpacity>

          {isEditingOverview ? (
            <View className="space-y-4">
              <TextInput
                value={editName}
                onChangeText={setEditName}
                className="w-full bg-surface border border-border-gray rounded-lg px-4 py-3 text-lg font-bold text-on-surface"
                placeholderTextColor="var(--muted-gray)"
                placeholder="Workout Name"
              />
              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                numberOfLines={3}
                className="w-full bg-surface border border-border-gray rounded-lg px-4 py-3 text-sm text-on-surface text-left align-top"
                placeholderTextColor="var(--muted-gray)"
                placeholder="Description"
              />
              <View className="flex-row gap-2 justify-end mt-2">
                <TouchableOpacity
                  onPress={() => setIsEditingOverview(false)}
                  className="flex-row items-center gap-1.5 px-4 py-2 bg-surface border border-border-gray rounded-lg"
                >
                  <Text className="text-white text-xs font-bold uppercase tracking-wider">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveOverview}
                  className="flex-row items-center gap-1.5 px-4 py-2 bg-electric rounded-lg"
                >
                  <Text className="text-black text-xs font-black uppercase tracking-wider">Save Split</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="flex-col gap-3">
              <View>
                <View className="bg-electric/15 self-start px-2.5 py-1 rounded mb-2">
                  <Text className="text-[10px] text-electric font-black uppercase tracking-wider">
                    Split Studio
                  </Text>
                </View>
                <Text className="text-3xl font-black tracking-wider text-on-surface uppercase mb-1">
                  {workout.name}
                </Text>
                <Text className="text-muted-gray text-xs leading-relaxed font-semibold">
                  {workout.description || 'No description provided.'}
                </Text>
              </View>

              <View className="flex-row gap-2 mt-2">
                {todaySchedule && (
                  <TouchableOpacity
                    onPress={handleCompleteWorkout}
                    disabled={isCompleting}
                    className={`flex-row items-center justify-center gap-1.5 rounded-lg px-4 py-2 ${isCompleting ? 'opacity-50' : ''} bg-electric`}
                  >
                    <Feather name="check" size={14} color="black" />
                    <Text className="text-black text-xs font-black uppercase tracking-wider">
                      {isCompleting ? t('workout_detail.finishing', 'Finishing...') : t('workout_detail.finish_workout', 'Finish Workout')}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleStartEditOverview}
                  className="flex-row items-center justify-center gap-1.5 rounded-lg bg-surface border border-border-gray px-4 py-2"
                >
                  <Feather name="edit-2" size={14} color="white" />
                  <Text className="text-white text-xs font-bold uppercase tracking-wider">
                    {t('workout_detail.edit_overview', 'Edit Details')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="border-b border-border-gray"
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {[
            { id: 'exercises', label: t('workout_detail.tab_exercises', 'Exercise Logs'), icon: 'list' },
            { id: 'comments', label: t('workout_detail.tab_comments', 'Board Comments'), icon: 'message-square' },
            { id: 'schedule', label: t('workout_detail.tab_schedule', 'Calendar Split'), icon: 'calendar' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              className={`flex-row items-center gap-2 px-4 py-4 border-b-2 mr-2 ${
                activeTab === tab.id ? 'border-electric' : 'border-transparent'
              }`}
            >
              <Feather 
                name={tab.icon as any} 
                size={16} 
                color={activeTab === tab.id ? 'var(--electric)' : 'var(--muted-gray)'} 
              />
              <Text className={`font-black tracking-wider uppercase ${
                activeTab === tab.id ? 'text-electric' : 'text-muted-gray'
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        <View className="p-5">
          {activeTab === 'exercises' && (
            <View className="space-y-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-black tracking-wider text-on-surface uppercase">
                  {t('workout_detail.split_movements', 'Split Movements')}
                </Text>
                <TouchableOpacity
                  onPress={handleOpenAddExModal}
                  className="flex-row items-center gap-1.5 bg-electric px-3 py-1.5 rounded-lg"
                >
                  <Feather name="plus" size={14} color="black" />
                  <Text className="text-black text-[10px] font-black uppercase tracking-wider">
                    {t('workout_detail.add_exercise', 'Add Movement')}
                  </Text>
                </TouchableOpacity>
              </View>

              {isExercisesLoading ? (
                <Skeleton />
              ) : workoutExercises.length > 0 ? (
                <View className="space-y-6">
                  {/* Exercises List */}
                  <View className="bg-card border border-border-gray rounded-xl overflow-hidden">
                    {workoutExercises.map((we: any, index: number) => {
                      const isLast = index === workoutExercises.length - 1;
                      return (
                        <View key={we.id} className={`p-4 ${!isLast ? 'border-b border-border-gray' : ''}`}>
                          <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1 pr-4">
                              <Text className="font-bold text-on-surface uppercase tracking-wider mb-1">
                                {we.exerciseName}
                              </Text>
                              <Text className="text-[9px] text-muted-gray uppercase font-bold">
                                {getExerciseMuscleGroup(we.exerciseName || '').primary.map(m => getMuscleLabel(m)).join(', ')}
                              </Text>
                            </View>
                            <View className="flex-row gap-2">
                              <TouchableOpacity onPress={() => handleOpenEditExModal(we)} className="p-1.5 bg-surface rounded">
                                <Feather name="edit-2" size={12} color="var(--muted-gray)" />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => setDeletingElement({ type: 'exercise', id: we.id })} className="p-1.5 bg-surface rounded">
                                <Feather name="trash-2" size={12} color="var(--electric-orange)" />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View className="flex-row gap-4 mb-4">
                            <View className="bg-surface px-3 py-1.5 rounded flex-1 items-center">
                              <Text className="text-[10px] text-muted-gray font-bold uppercase mb-0.5">Sets</Text>
                              <Text className="text-sm font-black text-white">{we.sets}</Text>
                            </View>
                            <View className="bg-surface px-3 py-1.5 rounded flex-1 items-center">
                              <Text className="text-[10px] text-muted-gray font-bold uppercase mb-0.5">Reps</Text>
                              <Text className="text-sm font-black text-white">{we.repetitions}</Text>
                            </View>
                            <View className="bg-electric/10 border border-electric/20 px-3 py-1.5 rounded flex-1 items-center">
                              <Text className="text-[10px] text-electric font-bold uppercase mb-0.5">Weight</Text>
                              <Text className="text-sm font-black text-electric">{we.weight} <Text className="text-[9px]">KG</Text></Text>
                            </View>
                          </View>

                          {/* Sets Tracker */}
                          <View className="flex-row flex-wrap gap-2">
                            {Array.from({ length: we.sets }).map((_, setIdx) => {
                              const isChecked = !!completedSets[we.id]?.[setIdx];
                              return (
                                <TouchableOpacity
                                  key={setIdx}
                                  onPress={() => toggleSetCompletion(we.id, setIdx)}
                                  className={`w-8 h-8 rounded-full border items-center justify-center ${
                                    isChecked 
                                      ? 'bg-electric border-electric' 
                                      : 'bg-surface border-border-gray'
                                  }`}
                                >
                                  <Text className={`text-[10px] font-black ${isChecked ? 'text-black' : 'text-muted-gray'}`}>
                                    {setIdx + 1}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Anatomical Studio */}
                  <View className="bg-card border border-border-gray rounded-xl p-5">
                    <Text className="font-bold text-on-surface uppercase tracking-wider text-xs mb-1">
                      {t('workout_detail.anatomical_studio', 'Anatomical Studio')}
                    </Text>
                    <Text className="text-muted-gray text-[9px] uppercase font-bold mb-4">
                      {t('workout_detail.union_highlights', "Union highlights of today's split targets")}
                    </Text>

                    <View className="bg-[#0D0D0F]/40 border border-border-gray rounded-xl p-4 items-center justify-center mb-4">
                      <MuscleMap
                        primaryMuscles={overallTargets.primary}
                        secondaryMuscles={overallTargets.secondary}
                        view="both"
                        size="sm"
                        interactive={false}
                        animated={true}
                      />
                    </View>

                    <View className="border-t border-border-gray pt-3">
                      <Text className="text-[10px] font-black uppercase text-on-surface tracking-widest mb-2">
                        {t('workout_detail.todays_muscle_targets', "Today's Muscle Targets")}
                      </Text>

                      {overallTargets.primary.length === 0 && overallTargets.secondary.length === 0 ? (
                        <Text className="text-[10px] text-muted-gray uppercase font-bold">
                          {t('workout_detail.no_muscles_logged', 'No muscles logged yet')}
                        </Text>
                      ) : (
                        <View className="space-y-3">
                          {overallTargets.primary.length > 0 && (
                            <View>
                              <Text className="text-[8px] font-black text-electric uppercase tracking-widest mb-1">Primary:</Text>
                              <View className="flex-row flex-wrap gap-1">
                                {overallTargets.primary.map(m => (
                                  <View key={m} className="bg-electric/10 border border-electric/15 px-2 py-0.5 rounded">
                                    <Text className="text-[9px] font-extrabold text-electric uppercase">{getMuscleLabel(m)}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                          {overallTargets.secondary.length > 0 && (
                            <View>
                              <Text className="text-[8px] font-black text-electric-orange uppercase tracking-widest mb-1">Secondary:</Text>
                              <View className="flex-row flex-wrap gap-1">
                                {overallTargets.secondary.map(m => (
                                  <View key={m} className="bg-electric-orange/10 border border-electric-orange/15 px-2 py-0.5 rounded">
                                    <Text className="text-[9px] font-extrabold text-electric-orange uppercase">{getMuscleLabel(m)}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ) : (
                <EmptyState
                  title={t('workout_detail.no_exercises', 'No exercises added yet')}
                  description={t('workout_detail.no_exercises_desc', 'Add exercises to track your sets, reps, and weight.')}
                  actionText={t('workout_detail.add_first_exercise', '+ Add first exercise')}
                  onAction={handleOpenAddExModal}
                  icon={<Feather name="book-open" size={32} color="var(--muted-gray)" />}
                />
              )}
            </View>
          )}

          {activeTab === 'comments' && (
            <View className="space-y-6">
              <Text className="text-lg font-black tracking-wider text-on-surface uppercase mb-2">
                {t('workout_detail.athletic_bulletin', 'Athletic Bulletin')}
              </Text>

              {/* Comment Input */}
              <View className="bg-card border border-border-gray rounded-xl p-4">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-gray mb-2">
                  {t('workout_detail.share_notes', 'Share Notes or Feedback')}
                </Text>
                <TextInput
                  value={commentInput}
                  onChangeText={setCommentInput}
                  placeholder={t('workout_detail.comment_placeholder', 'Log energy levels, diet, split adjustments...')}
                  placeholderTextColor="var(--muted-gray)"
                  multiline
                  numberOfLines={3}
                  className="bg-surface border border-border-gray rounded-lg px-3 py-2 text-sm text-on-surface mb-3 align-top"
                />
                <TouchableOpacity
                  onPress={handlePostComment}
                  disabled={!commentInput.trim()}
                  className={`flex-row items-center justify-center gap-1.5 rounded-lg py-2 ${!commentInput.trim() ? 'opacity-50 bg-surface' : 'bg-electric'}`}
                >
                  <Feather name="message-square" size={14} color={!commentInput.trim() ? 'white' : 'black'} />
                  <Text className={`text-xs font-black uppercase tracking-wider ${!commentInput.trim() ? 'text-white' : 'text-black'}`}>
                    {t('workout_detail.post_comment', 'Post Log')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Comments List */}
              {isCommentsLoading ? (
                <Skeleton />
              ) : comments.length > 0 ? (
                <View className="space-y-3">
                  {comments.map(c => {
                    const isEditing = editingCommentId === c.id;
                    return (
                      <View key={c.id} className="bg-card border border-border-gray rounded-xl p-4 flex-row gap-3">
                        <View className="w-10 h-10 rounded-lg bg-surface border border-border-gray items-center justify-center">
                          <Feather name="user" size={18} color="var(--electric)" />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row justify-between items-start mb-1">
                            <View>
                              <Text className="font-bold text-on-surface uppercase text-xs">
                                {c.userName || t('workout_detail.anonymous_athlete', 'Anonymous Athlete')}
                              </Text>
                              <Text className="text-[9px] text-muted-gray font-semibold uppercase">
                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                              </Text>
                            </View>
                            {!isEditing && (
                              <View className="flex-row gap-2">
                                <TouchableOpacity onPress={() => {
                                  setEditingCommentId(c.id);
                                  setEditCommentText(c.comment);
                                }} className="p-1">
                                  <Feather name="edit-2" size={12} color="var(--muted-gray)" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setDeletingElement({ type: 'comment', id: c.id })} className="p-1">
                                  <Feather name="trash-2" size={12} color="var(--electric-orange)" />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                          {isEditing ? (
                            <View className="mt-2">
                              <TextInput
                                value={editCommentText}
                                onChangeText={setEditCommentText}
                                multiline
                                className="bg-surface border border-border-gray rounded-lg px-3 py-2 text-sm text-on-surface mb-2"
                              />
                              <View className="flex-row gap-2 justify-end">
                                <TouchableOpacity onPress={() => setEditingCommentId(null)} className="px-3 py-1 bg-surface border border-border-gray rounded">
                                  <Text className="text-[10px] font-bold text-white uppercase">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleSaveCommentEdit(c.id)} className="px-3 py-1 bg-electric rounded">
                                  <Text className="text-[10px] font-bold text-black uppercase">Save</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <Text className="text-sm text-on-surface mt-1">{c.comment}</Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text className="text-center text-muted-gray text-xs uppercase font-bold mt-4">
                  No comments yet.
                </Text>
              )}
            </View>
          )}

          {activeTab === 'schedule' && (
            <View className="space-y-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-black tracking-wider text-on-surface uppercase">
                  {t('workout_detail.calendar_split', 'Calendar Split')}
                </Text>
                <TouchableOpacity
                  onPress={handleOpenAddSchedule}
                  className="flex-row items-center gap-1.5 bg-surface border border-border-gray px-3 py-1.5 rounded-lg"
                >
                  <Feather name="calendar" size={14} color="white" />
                  <Text className="text-white text-[10px] font-black uppercase tracking-wider">
                    {t('workout_detail.add_schedule', 'Schedule')}
                  </Text>
                </TouchableOpacity>
              </View>

              {workoutSchedules.length > 0 ? (
                <View className="bg-card border border-border-gray rounded-xl overflow-hidden">
                  {sortedWorkoutSchedules.map((s: any, index: number) => {
                    const isLast = index === sortedWorkoutSchedules.length - 1;
                    const d = new Date(s.scheduledDate);
                    return (
                      <View key={s.id} className={`p-4 flex-row items-center justify-between ${!isLast ? 'border-b border-border-gray' : ''}`}>
                        <View className="flex-row items-center gap-3">
                          <View className={`w-10 h-10 rounded-lg items-center justify-center ${s.isCompleted ? 'bg-electric/10 border border-electric/20' : 'bg-surface border border-border-gray'}`}>
                            {s.isCompleted ? (
                              <Feather name="check" size={16} color="var(--electric)" />
                            ) : (
                              <Feather name="calendar" size={16} color="var(--muted-gray)" />
                            )}
                          </View>
                          <View>
                            <Text className="font-bold text-on-surface uppercase text-sm">
                              {d.toLocaleDateString()}
                            </Text>
                            <Text className="text-[10px] text-muted-gray font-semibold uppercase">
                              {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row gap-2">
                          <TouchableOpacity onPress={() => setDeletingElement({ type: 'schedule', id: s.id })} className="p-1.5 bg-surface rounded">
                            <Feather name="trash-2" size={14} color="var(--electric-orange)" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <EmptyState
                  title="No Schedules"
                  description="Schedule this workout to see it in your calendar."
                  icon={<Feather name="calendar" size={32} color="var(--muted-gray)" />}
                />
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* Timer floating pill */}
      {isTimerActive && timerSeconds !== null && (
        <View className="absolute bottom-6 self-center bg-[#1A1A1F] border border-electric/30 rounded-full px-6 py-3 flex-row items-center gap-3 shadow-glow z-50">
          <Feather name="clock" size={18} color="var(--electric)" />
          <Text className="text-white font-display text-xl tracking-widest w-12 text-center">
            {timerSeconds}
          </Text>
          <TouchableOpacity onPress={() => setIsTimerActive(false)} className="p-1">
            <Feather name="x" size={16} color="var(--muted-gray)" />
          </TouchableOpacity>
        </View>
      )}

      {/* Add/Edit Exercise Modal */}
      <Modal isOpen={isExerciseModalOpen} onClose={() => setIsExerciseModalOpen(false)} title={editingEx ? 'Edit Movement' : 'Add Movement'}>
        <View className="space-y-4">
          <View>
            <Text className="text-[10px] font-bold text-muted-gray uppercase mb-1">Exercise Library</Text>
            {/* Simple Picker Simulation. For Expo, using a styled TextInput just to show UI or custom dropdown. */}
             <Controller
              control={controlEx}
              name="exerciseId"
              render={({ field: { onChange, value } }) => (
                <View className="bg-surface border border-border-gray rounded-lg overflow-hidden">
                   {/* In a real RN app you'd use a Picker component. Here we just show a fake button to represent selection since react-native Picker is complex to style natively on all platforms without extra libs */}
                   <View className="px-4 py-3 border-b border-border-gray flex-row justify-between items-center">
                     <Text className="text-white text-sm">Select Exercise ID: {value}</Text>
                     <Feather name="chevron-down" size={16} color="white" />
                   </View>
                   <TextInput 
                     keyboardType="numeric"
                     placeholder="Type Exercise ID (1-10)"
                     placeholderTextColor="var(--muted-gray)"
                     className="px-4 py-2 text-white"
                     value={String(value || '')}
                     onChangeText={(v) => onChange(Number(v))}
                   />
                </View>
              )}
            />
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-muted-gray uppercase mb-1">Sets</Text>
              <Controller
                control={controlEx}
                name="sets"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    keyboardType="numeric"
                    className="bg-surface border border-border-gray rounded-lg px-4 py-3 text-white font-bold"
                    value={String(value)}
                    onChangeText={(v) => onChange(Number(v))}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-muted-gray uppercase mb-1">Reps</Text>
              <Controller
                control={controlEx}
                name="repetitions"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    keyboardType="numeric"
                    className="bg-surface border border-border-gray rounded-lg px-4 py-3 text-white font-bold"
                    value={String(value)}
                    onChangeText={(v) => onChange(Number(v))}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-muted-gray uppercase mb-1">Weight</Text>
              <Controller
                control={controlEx}
                name="weight"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    keyboardType="numeric"
                    className="bg-surface border border-border-gray rounded-lg px-4 py-3 text-white font-bold"
                    value={String(value)}
                    onChangeText={(v) => onChange(Number(v))}
                  />
                )}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmitEx(onSubmitEx)}
            disabled={exSubmitStatus === 'loading'}
            className="bg-electric rounded-lg py-3 mt-4 items-center justify-center"
          >
            <Text className="text-black font-black uppercase text-sm tracking-wider">
              {exSubmitStatus === 'loading' ? 'Saving...' : 'Save Movement'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Schedule Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule Split">
        <View className="space-y-4">
          <View>
            <Text className="text-[10px] font-bold text-muted-gray uppercase mb-1">Date & Time</Text>
            <Controller
              control={controlSched}
              name="scheduledDate"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  placeholder="YYYY-MM-DDTHH:mm"
                  placeholderTextColor="var(--muted-gray)"
                  className="bg-surface border border-border-gray rounded-lg px-4 py-3 text-white font-bold"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
          <TouchableOpacity
            onPress={handleSubmitSched(onSubmitSched)}
            className="bg-electric rounded-lg py-3 mt-4 items-center justify-center"
          >
            <Text className="text-black font-black uppercase text-sm tracking-wider">Confirm</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingElement}
        title="Delete Item"
        message="Are you sure you want to remove this? This action cannot be undone."
        onConfirm={handleConfirmDeleteElement}
        onCancel={() => setDeletingElement(null)}
        confirmText="Remove"
        isDanger={true}
      />
    </View>
  );
}
