import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { useExerciseCatalogue, useExerciseCategories } from '../../hooks';
import { useSettings } from '../../context/SettingsContext';
import { difficultyForLevel, levelLabelKey } from '../../lib/trainingPrescription';
import { DashboardSkeleton } from '../../../components/LoadingSkeleton';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { SearchInput, Chip } from '../../../components/ui';
import { MuscleId } from '../../lib/muscleMap';
import { categoryLabel } from '../../lib/categoryLabels';

import { MuscleScanner, BodyView } from './components/MuscleScanner';
import { ExerciseCard } from './components/ExerciseCard';
import { CATEGORY_MUSCLES, ALL_MUSCLES, categoryForMuscle } from './categoryMuscles';

type ExercisesNav = NativeStackNavigationProp<RootStackParamList>;

const ALL = 'All';

/** Design 05 · Thư viện động tác. */
export default function ExercisesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<ExercisesNav>();
  const { settings } = useSettings();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(ALL);
  const [view, setView] = useState<BodyView>('front');
  /**
   * The second thing onboarding's level answer is for: capping the catalogue at
   * movements the user is ready for. Off by default — the library is for
   * browsing, and hiding exercises by default would be the app deciding what a
   * user is allowed to look at.
   */
  const [levelOnly, setLevelOnly] = useState(false);

  /**
   * Both filters are applied by the server. The chip row comes from its own
   * request rather than from the loaded rows — with only a page in memory,
   * deriving the chips from the results would make them appear and disappear
   * as the user types.
   */
  const { categories: serverCategories } = useExerciseCategories();
  const categories = [ALL, ...serverCategories];

  const {
    exercises,
    total,
    isLoading,
    isError,
    refetch,
    isDebouncing,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useExerciseCatalogue(
    search,
    category === ALL ? null : category,
    levelOnly ? difficultyForLevel(settings.level) : null
  );

  const highlighted = category === ALL ? ALL_MUSCLES : CATEGORY_MUSCLES[category] ?? ALL_MUSCLES;

  const handleMusclePress = (muscle: MuscleId) => {
    const owner = categoryForMuscle(muscle);
    if (owner) setCategory((prev) => (prev === owner ? ALL : owner));
  };

  const styles = makeStyles(colors);

  // The skeleton is for opening the screen. Once a filter is in play the list
  // reloads on every keystroke, and replacing the whole screen — search box and
  // body diagram included — would make typing feel like the app restarting.
  if (isLoading && !search.trim() && category === ALL && !levelOnly) {
    return <DashboardSkeleton />;
  }
  if (isError) return <ErrorState onRetry={refetch} />;

  const isFetchingList = isLoading || isDebouncing;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('exercises.title')}</Text>

        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('exercises.search_placeholder')}
        />

        <MuscleScanner
          primary={highlighted.primary}
          secondary={highlighted.secondary}
          view={view}
          onChangeView={setView}
          onSelectMuscle={handleMusclePress}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {categories.map((c) => (
            <Chip
              key={c}
              label={c === ALL ? t('exercises.category_all') : categoryLabel(c)}
              active={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </ScrollView>

        <View style={styles.levelRow}>
          <Chip
            label={t('exercises.level_filter', { level: t(levelLabelKey(settings.level)) })}
            active={levelOnly}
            onPress={() => setLevelOnly((prev) => !prev)}
          />
        </View>

        {isFetchingList ? (
          <ActivityIndicator color={colors.electric} style={styles.listSpinner} />
        ) : exercises.length === 0 ? (
          <EmptyState
            iconName="search"
            title={t('exercises.empty_title')}
            description={t('exercises.empty_desc')}
          />
        ) : (
          <>
            {exercises.map((e) => (
              <ExerciseCard
                key={e.id}
                exercise={e}
                onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: e.id })}
              />
            ))}

            <Text style={styles.count}>
              {t('exercises.result_count', { shown: exercises.length, total })}
            </Text>

            {hasMore && (
              <TouchableOpacity
                style={styles.loadMore}
                onPress={() => loadMore()}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <ActivityIndicator color={colors.electric} />
                ) : (
                  <Text style={styles.loadMoreText}>{t('exercises.load_more')}</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 26, fontWeight: '900', color: colors.onSurface, marginBottom: 16 },
    pillRow: { gap: 8, paddingBottom: 16, paddingRight: 8 },
    levelRow: { flexDirection: 'row', marginBottom: 16 },
    listSpinner: { marginTop: 32 },
    count: {
      fontSize: 11,
      color: colors.mutedGray,
      textAlign: 'center',
      marginTop: 6,
    },
    loadMore: {
      marginTop: 12,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    loadMoreText: { fontSize: 13, fontWeight: '800', color: colors.electric },
  });
