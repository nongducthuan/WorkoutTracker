import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Platform } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useExercises } from '../hooks/useFitnessData';
import { DashboardSkeleton as Skeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { MuscleMap } from '../../components/MuscleMap';
import { getExerciseMuscleGroup, MuscleId, getMuscleLabel } from '../lib/muscleMap';
import { Modal } from '../../components/Modal';
import { globalStyles } from '../theme/styles';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

const categoryMuscleMap = {
  Chest: { primary: ['chest', 'front-deltoid'], secondary: ['triceps'] },
  Back: { primary: ['lats', 'trapezius-back'], secondary: ['biceps', 'rear-deltoid', 'lower-back'] },
  Legs: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings', 'calves'] },
  Shoulders: { primary: ['front-deltoid', 'rear-deltoid'], secondary: ['trapezius-front', 'triceps'] },
  Arms: { primary: ['biceps', 'triceps'], secondary: ['forearms-front', 'forearms-back'] },
  Core: { primary: ['abs', 'obliques'], secondary: ['lower-back'] },
  Cardio: { primary: ['quadriceps', 'calves'], secondary: ['hamstrings', 'tibialis'] },
};

// Full-body fallback for "All" tab
const ALL_MUSCLES_PRIMARY = ['chest', 'abs', 'quadriceps', 'biceps', 'front-deltoid', 'obliques'];
const ALL_MUSCLES_SECONDARY = ['triceps', 'forearms-front', 'lats', 'trapezius-back', 'glutes', 'hamstrings', 'calves', 'lower-back', 'rear-deltoid'];

export default function ExercisesScreen() {
  const { colors } = useTheme();
  const { exercises = [], isLoading } = useExercises();
  const { t } = useTranslation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<MuscleId | null>(null);

  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [instructionExerciseId, setInstructionExerciseId] = useState<number | null>(null);

  const getActiveHighlightMuscles = () => {
    if (selectedExerciseId) {
      const ex = exercises.find((e: any) => e.id === selectedExerciseId);
      if (ex) return getExerciseMuscleGroup(ex.name);
    }
    if (selectedMuscleFilter) {
      return { primary: [selectedMuscleFilter], secondary: [] as MuscleId[] };
    }
    return { primary: [] as MuscleId[], secondary: [] as MuscleId[] };
  };

  const { primary: primaryHighlights, secondary: secondaryHighlights } = getActiveHighlightMuscles();

  const filteredExercises = exercises.filter((ex: any) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    
    let matchesMuscle = true;
    if (selectedMuscleFilter) {
      const mapping = getExerciseMuscleGroup(ex.name);
      matchesMuscle = 
        mapping.primary.includes(selectedMuscleFilter) || 
        mapping.secondary.includes(selectedMuscleFilter);
    }

    return matchesSearch && matchesCategory && matchesMuscle;
  });

  const handleExerciseClick = (exId: number) => {
    setSelectedExerciseId((prev) => (prev === exId ? null : exId));
  };

  if (isLoading) {
    return <Skeleton />;
  }

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              {t('exercises.title')}
            </Text>
            <Text style={styles.subtitle}>
              {t('exercises.subtitle')}
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={16} color={colors.mutedGray} style={styles.searchIcon} />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={t('exercises.search_placeholder')}
              placeholderTextColor={colors.mutedGray}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryPill,
                  isActive ? styles.categoryPillActive : styles.categoryPillInactive,
                ]}
              >
                <Text style={[
                  styles.categoryPillText,
                  isActive ? styles.categoryPillTextActive : styles.categoryPillTextInactive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Filters */}
        {(selectedMuscleFilter || selectedExerciseId) && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersTitle}>
              {t('exercises.active_filters')}
            </Text>
            
            {selectedMuscleFilter && (
              <View style={styles.filterTagPrimary}>
                <Text style={styles.filterTagPrimaryText}>
                  {t('exercises.target_label', { muscle: getMuscleLabel(selectedMuscleFilter) })}
                </Text>
                <TouchableOpacity onPress={() => setSelectedMuscleFilter(null)}>
                  <Feather name="x" size={14} color={colors.electric} />
                </TouchableOpacity>
              </View>
            )}

            {selectedExerciseId && (
              <View style={styles.filterTagSecondary}>
                <Text style={styles.filterTagSecondaryText}>
                  Pin: {exercises.find((e: any) => e.id === selectedExerciseId)?.name}
                </Text>
                <TouchableOpacity onPress={() => setSelectedExerciseId(null)}>
                  <Feather name="x" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                setSelectedMuscleFilter(null);
                setSelectedExerciseId(null);
              }}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>
                {t('exercises.clear_all')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content Grid */}
        <View style={styles.mainGrid}>
          {/* Muscle Scanner */}
          <View style={styles.muscleScannerContainer}>
            <Text style={styles.muscleScannerTitle}>
              {t('exercises.muscle_scanner_title')}
            </Text>
            <Text style={styles.muscleScannerDesc}>
              {t('exercises.muscle_scanner_desc')}
            </Text>

            <View style={styles.muscleScannerCanvas}>
              <MuscleMap
                primaryMuscles={primaryHighlights}
                secondaryMuscles={secondaryHighlights}
                view="front"
                size="sm"
                interactive={true}
                animated={true}
                onMuscleClick={(muscleId: MuscleId) => {
                  setSelectedMuscleFilter((prev) => (prev === muscleId ? null : muscleId));
                }}
              />
            </View>

            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>
                {t('exercises.legend_title')}
              </Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                  <Text style={styles.legendText}>{t('exercises.legend_primary')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                  <Text style={styles.legendText}>{t('exercises.legend_secondary')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderGray }]} />
                  <Text style={styles.legendText}>{t('exercises.legend_inactive')}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Exercises List */}
          <View style={styles.exercisesList}>
            {filteredExercises.length > 0 ? (
              filteredExercises.map((ex: any) => {
                const isPinned = selectedExerciseId === ex.id;
                const mapping = getExerciseMuscleGroup(ex.name);

                return (
                  <TouchableOpacity
                    key={ex.id}
                    onPress={() => handleExerciseClick(ex.id)}
                    style={[
                      styles.exerciseCard,
                      isPinned ? styles.exerciseCardPinned : styles.exerciseCardUnpinned
                    ]}
                  >
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseName}>
                        {ex.name}
                      </Text>
                      <View style={styles.exerciseActions}>
                        <TouchableOpacity
                          onPress={() => {
                            setInstructionExerciseId(ex.id);
                          }}
                          style={styles.infoButton}
                        >
                          <Feather name="info" size={14} color={colors.mutedGray} />
                        </TouchableOpacity>
                        {isPinned && (
                          <View style={styles.pinnedIcon}>
                            <Feather name="check" size={12} color="black" />
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.primaryMusclesContainer}>
                      {mapping.primary.slice(0, 2).map((m) => (
                        <View key={m} style={styles.musclePill}>
                          <Text style={styles.musclePillText}>
                            {getMuscleLabel(m)}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.exerciseFooter}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {ex.category || 'General'}
                        </Text>
                      </View>
                      {ex.difficulty && (
                        <View style={[
                          styles.difficultyBadge,
                          ex.difficulty === 'Beginner' ? styles.diffBeginner :
                          ex.difficulty === 'Intermediate' ? styles.diffIntermediate :
                          styles.diffAdvanced
                        ]}>
                          <Text style={[
                            styles.difficultyBadgeText,
                            ex.difficulty === 'Beginner' ? styles.diffTextBeginner :
                            ex.difficulty === 'Intermediate' ? styles.diffTextIntermediate :
                            styles.diffTextAdvanced
                          ]}>
                            {ex.difficulty}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <EmptyState
                title={t('exercises.empty_title')}
                description={t('exercises.empty_desc')}
                icon={<Feather name="book-open" size={32} color={colors.mutedGray} />}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Exercise Guide Modal */}
      <Modal
        isOpen={instructionExerciseId !== null}
        onClose={() => setInstructionExerciseId(null)}
        title="Movement Guide"
      >
        {(() => {
          const ex = exercises.find((e: any) => e.id === instructionExerciseId);
          if (!ex) return null;
          const mapping = getExerciseMuscleGroup(ex.name);

          return (
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {ex.name}
                </Text>
                <View style={styles.modalBadges}>
                  <View style={styles.modalCategoryBadge}>
                    <Text style={styles.modalCategoryText}>
                      {ex.category || 'General'}
                    </Text>
                  </View>
                  {ex.difficulty && (
                    <View style={styles.modalDifficultyBadge}>
                      <Text style={styles.modalDifficultyText}>
                        {ex.difficulty}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>
                  Anatomical Mapping
                </Text>
                <View style={styles.modalMuscles}>
                  {mapping.primary.map((m) => (
                    <View key={m} style={styles.modalMusclePrimary}>
                      <Text style={styles.modalMusclePrimaryText}>
                        {getMuscleLabel(m)} (Primary)
                      </Text>
                    </View>
                  ))}
                  {mapping.secondary.map((m) => (
                    <View key={m} style={styles.modalMuscleSecondary}>
                      <Text style={styles.modalMuscleSecondaryText}>
                        {getMuscleLabel(m)} (Secondary)
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.modalSection, styles.modalSectionBorder]}>
                <Text style={styles.modalSectionTitle}>
                  Execution Instructions
                </Text>
                <Text style={styles.modalInstructions}>
                  {ex.description || 'No execution instructions logged yet in this athletic split repository.'}
                </Text>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={() => setInstructionExerciseId(null)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>
                    Close Guide
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}
      </Modal>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
    paddingBottom: 24,
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  headerTextContainer: {
    flex: 1,
    minWidth: 200,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.onSurface,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: colors.mutedGray,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 4,
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
    minWidth: 200,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 10,
  },
  searchInput: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: colors.onSurface,
  },
  categoriesContainer: {
    marginBottom: 24,
    flexDirection: 'row',
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryPillActive: {
    backgroundColor: colors.electric,
    borderColor: colors.electric,
  },
  categoryPillInactive: {
    backgroundColor: colors.card,
    borderColor: colors.borderGray,
  },
  categoryPillText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryPillTextActive: {
    color: '#000',
    fontWeight: '900',
  },
  categoryPillTextInactive: {
    color: colors.mutedGray,
    fontWeight: 'bold',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  activeFiltersTitle: {
    fontWeight: '600',
    color: colors.mutedGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  filterTagPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterTagPrimaryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.electric,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filterTagSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterTagSecondaryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clearFiltersButton: {
    marginLeft: 'auto',
  },
  clearFiltersText: {
    fontSize: 10,
    color: colors.mutedGray,
    textTransform: 'uppercase',
    fontWeight: '900',
    letterSpacing: 1,
  },
  mainGrid: {
    flexDirection: 'column',
    gap: 24,
  },
  muscleScannerContainer: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  muscleScannerTitle: {
    fontWeight: 'bold',
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 14,
  },
  muscleScannerDesc: {
    color: colors.mutedGray,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 16,
  },
  muscleScannerCanvas: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    paddingTop: 16,
    marginTop: 16,
    gap: 8,
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: colors.mutedGray,
  },
  exercisesList: {
    flex: 1,
    gap: 16,
  },
  exerciseCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  exerciseCardPinned: {
    borderColor: colors.electric,
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
  },
  exerciseCardUnpinned: {
    borderColor: colors.borderGray,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: colors.onSurface,
    textTransform: 'uppercase',
    flex: 1,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.electric,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryMusclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  musclePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
  },
  musclePillText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.electric,
  },
  exerciseFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderGray,
    backgroundColor: colors.surface,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.mutedGray,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  difficultyBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  diffBeginner: {
    borderColor: 'rgba(52, 199, 89, 0.2)',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  diffIntermediate: {
    borderColor: 'rgba(204, 255, 0, 0.2)',
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
  },
  diffAdvanced: {
    borderColor: 'rgba(255, 149, 0, 0.2)',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  diffTextBeginner: {
    color: colors.success,
  },
  diffTextIntermediate: {
    color: colors.electric,
  },
  diffTextAdvanced: {
    color: '#FF9500', // Assuming no colors.electricOrange or warning might be used, but this matches Advanced
  },
  modalContent: {
    gap: 20,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  modalCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderGray,
    backgroundColor: colors.surface,
  },
  modalCategoryText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.onSurface,
  },
  modalDifficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.15)',
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
  },
  modalDifficultyText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.electric,
  },
  modalSection: {
    gap: 8,
    marginBottom: 16,
  },
  modalSectionBorder: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  modalSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.mutedGray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  modalMuscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalMusclePrimary: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modalMusclePrimaryText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.electric,
  },
  modalMuscleSecondary: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modalMuscleSecondaryText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#FF9500',
  },
  modalInstructions: {
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 20,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  closeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
