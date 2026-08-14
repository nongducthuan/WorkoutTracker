import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { useMuscleLoad, useExercises } from '../../hooks';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { MuscleMap } from '../../../components/MuscleMap';
import { SegmentedControl, PrimaryButton } from '../../../components/ui';
import { MuscleId, getMuscleLabel } from '../../lib/muscleMap';
import { CATEGORY_MUSCLES, categoryForMuscle } from '../exercises/categoryMuscles';

type MapNav = NativeStackNavigationProp<RootStackParamList>;
type BodyView = 'front' | 'back';

/** Design 07c · Bản đồ cơ toàn màn hình. */
export default function MuscleMapFullScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<MapNav>();
  const { heatmap } = useMuscleLoad(30);
  const { exercises } = useExercises();

  const [view, setView] = useState<BodyView>('front');
  const [selected, setSelected] = useState<MuscleId | null>(null);

  const selectedCategory = selected ? categoryForMuscle(selected) : undefined;

  const matchingExercises = useMemo(() => {
    if (!selectedCategory) return [];
    return exercises.filter((e) => e.category === selectedCategory);
  }, [exercises, selectedCategory]);

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <ScreenHeader title={t('muscle_map.title')} />

        <SegmentedControl<BodyView>
          value={view}
          onChange={setView}
          options={[
            { value: 'front', label: t('muscle_map.front') },
            { value: 'back', label: t('muscle_map.back') },
          ]}
        />

        <Text style={styles.hint}>{t('muscle_map.tap_hint')}</Text>

        <View style={styles.mapWrap}>
          <MuscleMap
            heatmapData={heatmap}
            primaryMuscles={selected ? [selected] : []}
            secondaryMuscles={
              selectedCategory ? CATEGORY_MUSCLES[selectedCategory]?.secondary ?? [] : []
            }
            view={view}
            size="lg"
            onMuscleClick={setSelected}
          />
        </View>

        {!!selected && (
          <View style={styles.detail}>
            <Text style={styles.detailTitle}>
              {t('muscle_map.group_label', { name: getMuscleLabel(selected) })}
            </Text>
            <Text style={styles.detailMeta}>
              {t('muscle_map.exercise_count', { count: matchingExercises.length })}
            </Text>
            <PrimaryButton
              label={t('muscle_map.view_exercises')}
              onPress={() => navigation.navigate('Main')}
              size="sm"
              style={styles.detailBtn}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, padding: 20 },
    hint: { fontSize: 11, color: colors.mutedGray, textAlign: 'center', marginTop: 14 },
    mapWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    detail: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
    },
    detailTitle: { fontSize: 15, fontWeight: '900', color: colors.onSurface },
    detailMeta: { fontSize: 12, color: colors.mutedGray, marginTop: 6 },
    detailBtn: { alignSelf: 'flex-start', marginTop: 14 },
  });
