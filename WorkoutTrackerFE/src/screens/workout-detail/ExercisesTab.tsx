import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { DashboardSkeleton as Skeleton } from '../../../components/LoadingSkeleton';
import { EmptyState } from '../../../components/EmptyState';
import { MuscleMap } from '../../../components/MuscleMap';
import { getExerciseMuscleGroup, getMuscleLabel, MuscleId } from '../../lib/muscleMap';
import { Colors } from '../../theme/colors';
import { styles } from './styles';

interface OverallTargets {
  primary: MuscleId[];
  secondary: MuscleId[];
}

interface ExercisesTabProps {
  isLoading: boolean;
  workoutExercises: any[];
  completedSets: Record<string, boolean[]>;
  overallTargets: OverallTargets;
  onToggleSet: (weId: string, setIdx: number, totalSets: number) => void;
  onAddExercise: () => void;
  onEditExercise: (we: any) => void;
  onDeleteExercise: (id: string) => void;
}

export function ExercisesTab({
  isLoading,
  workoutExercises,
  completedSets,
  overallTargets,
  onToggleSet,
  onAddExercise,
  onEditExercise,
  onDeleteExercise,
}: ExercisesTabProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.paneContent}>
      <View style={styles.paneHeader}>
        <Text style={styles.paneTitle}>
          {t('workout_detail.split_movements', 'Split Movements')}
        </Text>
        <TouchableOpacity onPress={onAddExercise} style={styles.addExButton}>
          <Feather name="plus" size={14} color={Colors.black} />
          <Text style={styles.addExText}>
            {t('workout_detail.add_exercise', 'Add Movement')}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
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
                      <TouchableOpacity onPress={() => onEditExercise(we)} style={styles.actionBtn}>
                        <Feather name="edit-2" size={12} color={Colors.mutedGray} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onDeleteExercise(we.id)} style={styles.actionBtn}>
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
                          onPress={() => onToggleSet(we.id, setIdx, we.sets)}
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
          onAction={onAddExercise}
          icon={<Feather name="book-open" size={32} color={Colors.mutedGray} />}
        />
      )}
    </View>
  );
}
