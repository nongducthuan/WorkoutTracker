import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import { MuscleId } from '../src/lib/muscleMap';

export interface MuscleMapProps {
  primaryMuscles?: MuscleId[];
  secondaryMuscles?: MuscleId[];
  heatmapData?: Partial<Record<MuscleId, number>>;
  view?: 'front' | 'back' | 'both';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  animated?: boolean;
  onMuscleClick?: (muscleId: MuscleId) => void;
  gender?: 'male' | 'female';
}

// Map internal MuscleId -> react-native-body-highlighter Slug
const muscleIdToSlugMap: Record<MuscleId, Slug> = {
  chest: 'chest',
  abs: 'abs',
  obliques: 'obliques',
  quadriceps: 'quadriceps',
  tibialis: 'tibialis',
  'front-deltoid': 'deltoids',
  biceps: 'biceps',
  'forearms-front': 'forearm',
  'trapezius-front': 'trapezius',
  'trapezius-back': 'trapezius',
  'rear-deltoid': 'deltoids',
  lats: 'upper-back',
  triceps: 'triceps',
  'forearms-back': 'forearm',
  'lower-back': 'lower-back',
  glutes: 'gluteal',
  hamstrings: 'hamstring',
  calves: 'calves',
};

// Map react-native-body-highlighter Slug -> internal MuscleId
const slugToMuscleIdMap: Partial<Record<Slug, MuscleId>> = {
  chest: 'chest',
  abs: 'abs',
  obliques: 'obliques',
  quadriceps: 'quadriceps',
  tibialis: 'tibialis',
  deltoids: 'front-deltoid',
  biceps: 'biceps',
  forearm: 'forearms-front',
  trapezius: 'trapezius-front',
  'upper-back': 'lats',
  triceps: 'triceps',
  'lower-back': 'lower-back',
  gluteal: 'glutes',
  hamstring: 'hamstrings',
  calves: 'calves',
};

export const MuscleMap: React.FC<MuscleMapProps> = ({
  primaryMuscles = [],
  secondaryMuscles = [],
  heatmapData,
  view = 'both',
  size = 'md',
  interactive = true,
  onMuscleClick,
  gender = 'male',
}) => {
  // Scale calculation based on size prop
  const scale = useMemo(() => {
    const baseScale = (() => {
      switch (size) {
        case 'sm':
          return 0.75;
        case 'lg':
          return 1.3;
        case 'md':
        default:
          return 1.0;
      }
    })();
    // When showing both front and back, shrink each body so they fit side-by-side on phone
    return view === 'both' ? baseScale * 0.62 : baseScale;
  }, [size, view]);

  // Convert inputs to ExtendedBodyPart[] format for the highlighter component
  const bodyData = useMemo(() => {
    const dataMap = new Map<Slug, ExtendedBodyPart>();

    if (heatmapData && Object.keys(heatmapData).length > 0) {
      // Heatmap mode: score 0 to 1 -> intensity 1 to 3
      Object.entries(heatmapData).forEach(([muscleId, val]) => {
        const slug = muscleIdToSlugMap[muscleId as MuscleId];
        if (!slug || typeof val !== 'number' || val <= 0) return;

        let intensity = 1;
        if (val > 0.66) intensity = 3;
        else if (val > 0.33) intensity = 2;

        dataMap.set(slug, { slug, intensity });
      });
    } else {
      // Primary / Secondary highlight mode
      secondaryMuscles.forEach((m) => {
        const slug = muscleIdToSlugMap[m];
        if (slug) {
          dataMap.set(slug, { slug, intensity: 1 });
        }
      });

      primaryMuscles.forEach((m) => {
        const slug = muscleIdToSlugMap[m];
        if (slug) {
          dataMap.set(slug, { slug, intensity: 2 });
        }
      });
    }

    return Array.from(dataMap.values());
  }, [primaryMuscles, secondaryMuscles, heatmapData]);

  const handleBodyPartPress = (part: ExtendedBodyPart) => {
    if (!interactive || !onMuscleClick || !part.slug) return;
    const internalId = slugToMuscleIdMap[part.slug];
    if (internalId) {
      onMuscleClick(internalId);
    }
  };

  const colors = useMemo(() => ['#F59E0B', '#EF4444', '#FF3B30', '#FF6B35'], []);

  return (
    <View style={styles.wrapper}>
      {view === 'both' ? (
        <View style={styles.bothContainer}>
          <View style={styles.bodyWrap}>
            <Body
              data={bodyData}
              side="front"
              gender={gender}
              scale={scale}
              colors={colors}
              defaultFill="#1F1F24"
              border="#3A3A45"
              onBodyPartPress={handleBodyPartPress}
            />
          </View>
          <View style={styles.bodyWrap}>
            <Body
              data={bodyData}
              side="back"
              gender={gender}
              scale={scale}
              colors={colors}
              defaultFill="#1F1F24"
              border="#3A3A45"
              onBodyPartPress={handleBodyPartPress}
            />
          </View>
        </View>
      ) : (
        <View style={styles.singleContainer}>
          <Body
            data={bodyData}
            side={view === 'back' ? 'back' : 'front'}
            gender={gender}
            scale={scale}
            colors={colors}
            defaultFill="#1F1F24"
            border="#3A3A45"
            onBodyPartPress={handleBodyPartPress}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  heatmapBox: {
    backgroundColor: 'rgba(13, 13, 15, 0.4)',
    borderWidth: 1,
    borderColor: '#3A3A45',
    borderRadius: 16,
    padding: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    width: '100%',
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  bothContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  singleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
