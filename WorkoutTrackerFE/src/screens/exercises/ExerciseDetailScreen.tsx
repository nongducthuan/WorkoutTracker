import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { useExercise, useWorkoutExercises } from '../../hooks';
import { DashboardSkeleton } from '../../../components/LoadingSkeleton';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Badge, SectionLabel, PrimaryButton, GhostButton } from '../../../components/ui';
import { MuscleMap } from '../../../components/MuscleMap';
import { getExerciseMuscleGroup, getMuscleLabel } from '../../lib/muscleMap';
import {
  ExerciseFormModal,
  ExerciseFormValues,
} from '../workout-detail/components/ExerciseFormModal';
import { useExercises } from '../../hooks';

type DetailRoute = RouteProp<RootStackParamList, 'ExerciseDetail'>;
type DetailNav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Design 04d · Chi tiết động tác. The API stores a single free-text
 * description, so the "Cách thực hiện" list is built by splitting it into
 * sentences — each one becomes a numbered step.
 */
export default function ExerciseDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNav>();
  const { exerciseId, workoutId } = route.params;

  const { exercise, isLoading } = useExercise(exerciseId);
  const { exercises: library } = useExercises();
  const { addExercise, isAdding } = useWorkoutExercises(workoutId || '');
  const [isFormOpen, setFormOpen] = useState(false);

  const mapping = useMemo(
    () => getExerciseMuscleGroup(exercise?.name || ''),
    [exercise?.name]
  );

  const steps = useMemo(() => {
    if (!exercise?.description) return [];
    return exercise.description
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [exercise?.description]);

  const difficultyLabel = (value?: string) => {
    const key = (value || '').toLowerCase();
    if (key.startsWith('begin')) return t('difficulty.beginner');
    if (key.startsWith('inter')) return t('difficulty.intermediate');
    if (key.startsWith('adv')) return t('difficulty.advanced');
    return value || '';
  };

  const handleAdd = async (values: ExerciseFormValues) => {
    await addExercise({
      workoutId: workoutId!,
      exerciseId: values.exerciseId,
      sets: values.sets,
      repetitions: values.repetitions,
      weight: values.weight,
    } as any);
    setFormOpen(false);
    navigation.goBack();
  };

  const styles = makeStyles(colors);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title={exercise?.name || ''}
          right={
            !!exercise?.difficulty ? (
              <Badge label={difficultyLabel(exercise.difficulty)} tone="muted" />
            ) : undefined
          }
        />

        {/* Video placeholder — the catalogue has no media field yet. */}
        <View style={styles.videoBox}>
          <Icon name="play-circle" size={34} color={colors.mutedGray} />
          <Text style={styles.videoText}>{t('exercise_detail.video_placeholder')}</Text>
        </View>

        <View style={styles.muscleRow}>
          {mapping.primary.map((m) => (
            <Badge
              key={m}
              label={`${getMuscleLabel(m)} (${t('exercise_detail.primary')})`}
              tone="electric"
            />
          ))}
          {mapping.secondary.map((m) => (
            <Badge key={m} label={getMuscleLabel(m)} tone="muted" />
          ))}
        </View>

        <View style={styles.mapWrap}>
          <MuscleMap
            primaryMuscles={mapping.primary}
            secondaryMuscles={mapping.secondary}
            view="both"
            size="sm"
            interactive={false}
          />
        </View>

        <SectionLabel>{t('exercise_detail.how_to')}</SectionLabel>
        {steps.length === 0 ? (
          <Text style={styles.empty}>{t('exercise_detail.no_description')}</Text>
        ) : (
          steps.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepIndex}>
                <Text style={styles.stepIndexText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))
        )}

        <GhostButton
          label={t('exercise_detail.view_history')}
          icon="trending-up"
          onPress={() => navigation.navigate('ExerciseHistory', { exerciseId })}
          style={styles.historyBtn}
        />

        {!!workoutId && (
          <PrimaryButton
            label={t('exercise_detail.add_to_plan')}
            onPress={() => setFormOpen(true)}
            style={styles.addBtn}
          />
        )}
      </ScrollView>

      {!!workoutId && (
        <ExerciseFormModal
          isOpen={isFormOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleAdd}
          library={library}
          presetExerciseId={exerciseId}
          isSaving={isAdding}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    videoBox: {
      height: 170,
      borderRadius: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 18,
    },
    videoText: { fontSize: 11, color: colors.mutedGray },
    muscleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    mapWrap: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      marginBottom: 22,
    },
    empty: { fontSize: 13, color: colors.mutedGray },
    stepRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    stepIndex: {
      width: 24,
      height: 24,
      borderRadius: 8,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepIndexText: { fontSize: 11, fontWeight: '900', color: colors.electric },
    stepText: { flex: 1, fontSize: 13, color: colors.mutedGray, lineHeight: 20 },
    historyBtn: { marginTop: 18 },
    addBtn: { marginTop: 12 },
  });
