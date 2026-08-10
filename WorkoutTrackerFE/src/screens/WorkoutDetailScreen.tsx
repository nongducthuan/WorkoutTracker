import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../navigation/types';
import { 
  useWorkout, 
  useWorkoutExercises, 
  useExercises, 
  useComments, 
  useWorkoutSchedules 
} from '../hooks/useFitnessData';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DashboardSkeleton as Skeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { MuscleMap } from '../../components/MuscleMap';
import { getExerciseMuscleGroup, getMuscleLabel, MuscleId } from '../lib/muscleMap';
import { globalStyles } from '../theme/styles';
import { Colors } from '../theme/colors';

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

type WorkoutDetailRouteProp = RouteProp<RootStackParamList, 'WorkoutDetail'>;

export default function WorkoutDetailScreen() {
  const route = useRoute<WorkoutDetailRouteProp>();
  const navigation = useNavigation<any>();
  const workoutId = route.params?.id || '';
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
    // Basic beep simulation - expo-av removed for React Native CLI compatibility
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
  
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  const { control: controlEx, handleSubmit: handleSubmitEx, reset: resetEx } = useForm<any>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { exerciseId: 0, sets: 3, repetitions: 10, weight: 0 }
  });

  const { control: controlSched, handleSubmit: handleSubmitSched, reset: resetSched } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
  });

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={14} color={Colors.white} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {isEditingOverview ? (
            <View style={styles.editOverviewContainer}>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={styles.editNameInput}
                placeholderTextColor={Colors.mutedGray}
                placeholder="Workout Name"
              />
              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                numberOfLines={3}
                style={styles.editDescInput}
                placeholderTextColor={Colors.mutedGray}
                placeholder="Description"
              />
              <View style={styles.editActionRow}>
                <TouchableOpacity onPress={() => setIsEditingOverview(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveOverview} style={styles.saveButton}>
                  <Text style={styles.saveText}>Save Split</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.overviewContainer}>
              <View>
                <View style={styles.splitStudioTag}>
                  <Text style={styles.splitStudioText}>Split Studio</Text>
                </View>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDesc}>{workout.description || 'No description provided.'}</Text>
              </View>

              <View style={styles.headerActionRow}>
                {todaySchedule && (
                  <TouchableOpacity
                    onPress={handleCompleteWorkout}
                    disabled={isCompleting}
                    style={[styles.completeButton, isCompleting && styles.opacity50]}
                  >
                    <Feather name="check" size={14} color={Colors.black} />
                    <Text style={styles.completeText}>
                      {isCompleting ? t('workout_detail.finishing', 'Finishing...') : t('workout_detail.finish_workout', 'Finish Workout')}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleStartEditOverview} style={styles.editButton}>
                  <Feather name="edit-2" size={14} color={Colors.white} />
                  <Text style={styles.editText}>
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
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {[
            { id: 'exercises', label: t('workout_detail.tab_exercises', 'Exercise Logs'), icon: 'list' },
            { id: 'comments', label: t('workout_detail.tab_comments', 'Board Comments'), icon: 'message-square' },
            { id: 'schedule', label: t('workout_detail.tab_schedule', 'Calendar Split'), icon: 'calendar' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
            >
              <Feather 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.id ? Colors.electric : Colors.mutedGray} 
              />
              <Text style={[styles.tabText, activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        <View style={styles.tabPane}>
          {activeTab === 'exercises' && (
            <View style={styles.paneContent}>
              <View style={styles.paneHeader}>
                <Text style={styles.paneTitle}>
                  {t('workout_detail.split_movements', 'Split Movements')}
                </Text>
                <TouchableOpacity onPress={handleOpenAddExModal} style={styles.addExButton}>
                  <Feather name="plus" size={14} color={Colors.black} />
                  <Text style={styles.addExText}>
                    {t('workout_detail.add_exercise', 'Add Movement')}
                  </Text>
                </TouchableOpacity>
              </View>

              {isExercisesLoading ? (
                <Skeleton />
              ) : workoutExercises.length > 0 ? (
                <View style={styles.paneContentSpacing}>
                  {/* Exercises List */}
                  <View style={styles.cardContainer}>
                    {workoutExercises.map((we: any, index: number) => {
                      const isLast = index === workoutExercises.length - 1;
                      return (
                        <View key={we.id} style={[styles.exItem, !isLast && styles.borderBottom]}>
                          <View style={styles.exItemHeader}>
                            <View style={styles.exItemTitleBox}>
                              <Text style={styles.exItemName}>{we.exerciseName}</Text>
                              <Text style={styles.exItemMuscles}>
                                {getExerciseMuscleGroup(we.exerciseName || '').primary.map(m => getMuscleLabel(m)).join(', ')}
                              </Text>
                            </View>
                            <View style={styles.exItemActions}>
                              <TouchableOpacity onPress={() => handleOpenEditExModal(we)} style={styles.actionBtn}>
                                <Feather name="edit-2" size={12} color={Colors.mutedGray} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => setDeletingElement({ type: 'exercise', id: we.id })} style={styles.actionBtn}>
                                <Feather name="trash-2" size={12} color={Colors.electricOrange} />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                              <Text style={styles.statLabel}>Sets</Text>
                              <Text style={styles.statVal}>{we.sets}</Text>
                            </View>
                            <View style={styles.statBox}>
                              <Text style={styles.statLabel}>Reps</Text>
                              <Text style={styles.statVal}>{we.repetitions}</Text>
                            </View>
                            <View style={styles.statBoxElectric}>
                              <Text style={styles.statLabelElectric}>Weight</Text>
                              <Text style={styles.statValElectric}>{we.weight} <Text style={styles.statUnit}>KG</Text></Text>
                            </View>
                          </View>

                          {/* Sets Tracker */}
                          <View style={styles.setsContainer}>
                            {Array.from({ length: we.sets }).map((_, setIdx) => {
                              const isChecked = !!completedSets[we.id]?.[setIdx];
                              return (
                                <TouchableOpacity
                                  key={setIdx}
                                  onPress={() => toggleSetCompletion(we.id, setIdx)}
                                  style={[styles.setCircle, isChecked ? styles.setCircleActive : styles.setCircleInactive]}
                                >
                                  <Text style={[styles.setCircleText, isChecked ? styles.setCircleTextActive : styles.setCircleTextInactive]}>
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
                  <View style={styles.studioCard}>
                    <Text style={styles.studioTitle}>
                      {t('workout_detail.anatomical_studio', 'Anatomical Studio')}
                    </Text>
                    <Text style={styles.studioSubtitle}>
                      {t('workout_detail.union_highlights', "Union highlights of today's split targets")}
                    </Text>

                    <View style={styles.mapContainer}>
                      <MuscleMap
                        primaryMuscles={overallTargets.primary}
                        secondaryMuscles={overallTargets.secondary}
                        view="both"
                        size="sm"
                        interactive={false}
                        animated={true}
                      />
                    </View>

                    <View style={styles.targetsContainer}>
                      <Text style={styles.targetsTitle}>
                        {t('workout_detail.todays_muscle_targets', "Today's Muscle Targets")}
                      </Text>

                      {overallTargets.primary.length === 0 && overallTargets.secondary.length === 0 ? (
                        <Text style={styles.noMusclesText}>
                          {t('workout_detail.no_muscles_logged', 'No muscles logged yet')}
                        </Text>
                      ) : (
                        <View style={styles.targetsList}>
                          {overallTargets.primary.length > 0 && (
                            <View>
                              <Text style={styles.primaryTitle}>Primary:</Text>
                              <View style={styles.tagWrap}>
                                {overallTargets.primary.map(m => (
                                  <View key={m} style={styles.primaryTag}>
                                    <Text style={styles.primaryTagText}>{getMuscleLabel(m)}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                          {overallTargets.secondary.length > 0 && (
                            <View style={styles.marginTop8}>
                              <Text style={styles.secondaryTitle}>Secondary:</Text>
                              <View style={styles.tagWrap}>
                                {overallTargets.secondary.map(m => (
                                  <View key={m} style={styles.secondaryTag}>
                                    <Text style={styles.secondaryTagText}>{getMuscleLabel(m)}</Text>
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
                  icon={<Feather name="book-open" size={32} color={Colors.mutedGray} />}
                />
              )}
            </View>
          )}

          {activeTab === 'comments' && (
            <View style={styles.paneContent}>
              <Text style={styles.paneTitle}>
                {t('workout_detail.athletic_bulletin', 'Athletic Bulletin')}
              </Text>

              {/* Comment Input */}
              <View style={styles.cardContainerComment}>
                <Text style={styles.commentInputTitle}>
                  {t('workout_detail.share_notes', 'Share Notes or Feedback')}
                </Text>
                <TextInput
                  value={commentInput}
                  onChangeText={setCommentInput}
                  placeholder={t('workout_detail.comment_placeholder', 'Log energy levels, diet, split adjustments...')}
                  placeholderTextColor={Colors.mutedGray}
                  multiline
                  numberOfLines={3}
                  style={styles.commentInputBox}
                />
                <TouchableOpacity
                  onPress={handlePostComment}
                  disabled={!commentInput.trim()}
                  style={[styles.postButton, !commentInput.trim() ? styles.postButtonDisabled : styles.postButtonActive]}
                >
                  <Feather name="message-square" size={14} color={!commentInput.trim() ? Colors.white : Colors.black} />
                  <Text style={[styles.postButtonText, !commentInput.trim() ? styles.textWhite : styles.textBlack]}>
                    {t('workout_detail.post_comment', 'Post Log')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Comments List */}
              {isCommentsLoading ? (
                <Skeleton />
              ) : comments.length > 0 ? (
                <View style={styles.paneContentSpacing}>
                  {comments.map(c => {
                    const isEditing = editingCommentId === c.id;
                    return (
                      <View key={c.id} style={styles.commentItem}>
                        <View style={styles.avatarBox}>
                          <Feather name="user" size={18} color={Colors.electric} />
                        </View>
                        <View style={styles.flex1}>
                          <View style={styles.commentHeader}>
                            <View>
                              <Text style={styles.commentAuthor}>
                                {c.userName || t('workout_detail.anonymous_athlete', 'Anonymous Athlete')}
                              </Text>
                              <Text style={styles.commentDate}>
                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                              </Text>
                            </View>
                            {!isEditing && (
                              <View style={styles.commentActions}>
                                <TouchableOpacity onPress={() => {
                                  setEditingCommentId(c.id);
                                  setEditCommentText(c.comment);
                                }} style={styles.actionBtnMargin}>
                                  <Feather name="edit-2" size={12} color={Colors.mutedGray} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setDeletingElement({ type: 'comment', id: c.id })} style={styles.actionBtnMargin}>
                                  <Feather name="trash-2" size={12} color={Colors.electricOrange} />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                          {isEditing ? (
                            <View style={styles.editCommentWrap}>
                              <TextInput
                                value={editCommentText}
                                onChangeText={setEditCommentText}
                                multiline
                                style={styles.editCommentInput}
                              />
                              <View style={styles.editCommentActions}>
                                <TouchableOpacity onPress={() => setEditingCommentId(null)} style={styles.cancelCommentBtn}>
                                  <Text style={styles.cancelCommentText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleSaveCommentEdit(c.id)} style={styles.saveCommentBtn}>
                                  <Text style={styles.saveCommentText}>Save</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <Text style={styles.commentText}>{c.comment}</Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.noCommentsText}>No comments yet.</Text>
              )}
            </View>
          )}

          {activeTab === 'schedule' && (
            <View style={styles.paneContent}>
              <View style={styles.paneHeader}>
                <Text style={styles.paneTitle}>
                  {t('workout_detail.calendar_split', 'Calendar Split')}
                </Text>
                <TouchableOpacity onPress={handleOpenAddSchedule} style={styles.addSchedButton}>
                  <Feather name="calendar" size={14} color={Colors.white} />
                  <Text style={styles.addSchedText}>
                    {t('workout_detail.add_schedule', 'Schedule')}
                  </Text>
                </TouchableOpacity>
              </View>

              {workoutSchedules.length > 0 ? (
                <View style={styles.cardContainer}>
                  {sortedWorkoutSchedules.map((s: any, index: number) => {
                    const isLast = index === sortedWorkoutSchedules.length - 1;
                    const d = new Date(s.scheduledDate);
                    return (
                      <View key={s.id} style={[styles.schedItem, !isLast && styles.borderBottom]}>
                        <View style={styles.schedItemLeft}>
                          <View style={[styles.schedIconBox, s.isCompleted ? styles.schedIconBoxCompleted : styles.schedIconBoxPending]}>
                            {s.isCompleted ? (
                              <Feather name="check" size={16} color={Colors.electric} />
                            ) : (
                              <Feather name="calendar" size={16} color={Colors.mutedGray} />
                            )}
                          </View>
                          <View>
                            <Text style={styles.schedDateText}>
                              {d.toLocaleDateString()}
                            </Text>
                            <Text style={styles.schedTimeText}>
                              {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.schedActions}>
                          <TouchableOpacity onPress={() => setDeletingElement({ type: 'schedule', id: s.id })} style={styles.actionBtn}>
                            <Feather name="trash-2" size={14} color={Colors.electricOrange} />
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
                  icon={<Feather name="calendar" size={32} color={Colors.mutedGray} />}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Timer floating pill */}
      {isTimerActive && timerSeconds !== null && (
        <View style={styles.timerFloat}>
          <Feather name="clock" size={18} color={Colors.electric} />
          <Text style={styles.timerText}>{timerSeconds}</Text>
          <TouchableOpacity onPress={() => setIsTimerActive(false)} style={styles.timerClose}>
            <Feather name="x" size={16} color={Colors.mutedGray} />
          </TouchableOpacity>
        </View>
      )}

      {/* Add/Edit Exercise Modal */}
      <Modal isOpen={isExerciseModalOpen} onClose={() => setIsExerciseModalOpen(false)} title={editingEx ? 'Edit Movement' : 'Add Movement'}>
        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Exercise Library</Text>
            <Controller
              control={controlEx}
              name="exerciseId"
              render={({ field: { onChange, value } }) => (
                <View style={styles.modalInputWrap}>
                  <View style={styles.fakePickerRow}>
                    <Text style={styles.fakePickerText}>Select Exercise ID: {value}</Text>
                    <Feather name="chevron-down" size={16} color={Colors.white} />
                  </View>
                  <TextInput 
                    keyboardType="numeric"
                    placeholder="Type Exercise ID (1-10)"
                    placeholderTextColor={Colors.mutedGray}
                    style={styles.modalTextInput}
                    value={String(value || '')}
                    onChangeText={(v) => onChange(Number(v))}
                  />
                </View>
              )}
            />
          </View>

          <View style={styles.rowGap4}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Sets</Text>
              <Controller
                control={controlEx}
                name="sets"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    keyboardType="numeric"
                    style={styles.modalTextInputBox}
                    value={String(value)}
                    onChangeText={(v) => onChange(Number(v))}
                  />
                )}
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Reps</Text>
              <Controller
                control={controlEx}
                name="repetitions"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    keyboardType="numeric"
                    style={styles.modalTextInputBox}
                    value={String(value)}
                    onChangeText={(v) => onChange(Number(v))}
                  />
                )}
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Weight</Text>
              <Controller
                control={controlEx}
                name="weight"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                    keyboardType="numeric"
                    style={styles.modalTextInputBox}
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
            style={styles.modalSaveBtn}
          >
            <Text style={styles.modalSaveText}>
              {exSubmitStatus === 'loading' ? 'Saving...' : 'Save Movement'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Schedule Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule Split">
        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date & Time</Text>
            <Controller
              control={controlSched}
              name="scheduledDate"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  placeholder="YYYY-MM-DDTHH:mm"
                  placeholderTextColor={Colors.mutedGray}
                  style={styles.modalTextInputBox}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
          <TouchableOpacity onPress={handleSubmitSched(onSubmitSched)} style={styles.modalSaveBtn}>
            <Text style={styles.modalSaveText}>Confirm</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 256,
    height: 256,
    backgroundColor: 'rgba(198, 244, 50, 0.05)',
    borderRadius: 128,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 6,
  },
  editOverviewContainer: {
    gap: 16,
  },
  editNameInput: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.onSurface,
  },
  editDescInput: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.onSurface,
    textAlignVertical: 'top',
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  cancelText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.electric,
    borderRadius: 8,
  },
  saveText: {
    color: Colors.black,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  overviewContainer: {
    gap: 12,
  },
  splitStudioTag: {
    backgroundColor: 'rgba(198, 244, 50, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  splitStudioText: {
    fontSize: 10,
    color: Colors.electric,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  workoutName: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    color: Colors.onSurface,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  workoutDesc: {
    color: Colors.mutedGray,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  headerActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.electric,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  opacity50: {
    opacity: 0.5,
  },
  completeText: {
    color: Colors.black,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 6,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 6,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 8,
  },
  tabButtonActive: {
    borderBottomColor: Colors.electric,
  },
  tabText: {
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  tabTextActive: {
    color: Colors.electric,
  },
  tabTextInactive: {
    color: Colors.mutedGray,
  },
  tabPane: {
    padding: 20,
  },
  paneContent: {
    gap: 24,
  },
  paneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paneTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  addExButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.electric,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addExText: {
    color: Colors.black,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 6,
  },
  addSchedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addSchedText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 6,
  },
  paneContentSpacing: {
    gap: 24,
  },
  cardContainer: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  exItem: {
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exItemTitleBox: {
    flex: 1,
    paddingRight: 16,
  },
  exItemName: {
    fontWeight: 'bold',
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  exItemMuscles: {
    fontSize: 9,
    color: Colors.mutedGray,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  exItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    backgroundColor: Colors.surface,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statBox: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  statBoxElectric: {
    backgroundColor: 'rgba(198, 244, 50, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(198, 244, 50, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.mutedGray,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.white,
  },
  statLabelElectric: {
    fontSize: 10,
    color: Colors.electric,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValElectric: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.electric,
  },
  statUnit: {
    fontSize: 9,
  },
  setsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCircleActive: {
    backgroundColor: Colors.electric,
    borderColor: Colors.electric,
  },
  setCircleInactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  setCircleText: {
    fontSize: 10,
    fontWeight: '900',
  },
  setCircleTextActive: {
    color: Colors.black,
  },
  setCircleTextInactive: {
    color: Colors.mutedGray,
  },
  studioCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 20,
  },
  studioTitle: {
    fontWeight: 'bold',
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 4,
  },
  studioSubtitle: {
    color: Colors.mutedGray,
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mapContainer: {
    backgroundColor: 'rgba(13, 13, 15, 0.4)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  targetsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  targetsTitle: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: Colors.onSurface,
    letterSpacing: 2,
    marginBottom: 8,
  },
  noMusclesText: {
    fontSize: 10,
    color: Colors.mutedGray,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  targetsList: {
    gap: 12,
  },
  primaryTitle: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.electric,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  secondaryTitle: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.electricOrange,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  marginTop8: {
    marginTop: 8,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  primaryTag: {
    backgroundColor: 'rgba(198, 244, 50, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(198, 244, 50, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.electric,
    textTransform: 'uppercase',
  },
  secondaryTag: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  secondaryTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.electricOrange,
    textTransform: 'uppercase',
  },
  cardContainerComment: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  commentInputTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.mutedGray,
    marginBottom: 8,
  },
  commentInputBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.onSurface,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
  },
  postButtonActive: {
    backgroundColor: Colors.electric,
  },
  postButtonDisabled: {
    backgroundColor: Colors.surface,
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 6,
  },
  textWhite: {
    color: Colors.white,
  },
  textBlack: {
    color: Colors.black,
  },
  commentItem: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: 'bold',
    color: Colors.onSurface,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  commentDate: {
    fontSize: 9,
    color: Colors.mutedGray,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  commentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnMargin: {
    padding: 4,
  },
  commentText: {
    fontSize: 14,
    color: Colors.onSurface,
    marginTop: 4,
  },
  editCommentWrap: {
    marginTop: 8,
  },
  editCommentInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.onSurface,
    marginBottom: 8,
  },
  editCommentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelCommentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
  },
  cancelCommentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  saveCommentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.electric,
    borderRadius: 4,
  },
  saveCommentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.black,
    textTransform: 'uppercase',
  },
  noCommentsText: {
    textAlign: 'center',
    color: Colors.mutedGray,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginTop: 16,
  },
  schedItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  schedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  schedIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schedIconBoxPending: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  schedIconBoxCompleted: {
    backgroundColor: 'rgba(198, 244, 50, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(198, 244, 50, 0.2)',
  },
  schedDateText: {
    fontWeight: 'bold',
    color: Colors.onSurface,
    textTransform: 'uppercase',
    fontSize: 14,
  },
  schedTimeText: {
    fontSize: 10,
    color: Colors.mutedGray,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  schedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  timerFloat: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#1A1A1F',
    borderWidth: 1,
    borderColor: 'rgba(198, 244, 50, 0.3)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 5,
    shadowColor: Colors.electric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 50,
  },
  timerText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    width: 48,
    textAlign: 'center',
  },
  timerClose: {
    padding: 4,
  },
  modalContent: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.mutedGray,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalInputWrap: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fakePickerRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fakePickerText: {
    color: Colors.white,
    fontSize: 14,
  },
  modalTextInput: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: Colors.white,
  },
  modalTextInputBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.white,
    fontWeight: 'bold',
  },
  rowGap4: {
    flexDirection: 'row',
    gap: 16,
  },
  modalSaveBtn: {
    backgroundColor: Colors.electric,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  modalSaveText: {
    color: Colors.black,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 14,
    letterSpacing: 1,
  },
});