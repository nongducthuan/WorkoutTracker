import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useExercises } from '../../src/hooks/useFitnessData';
import { DashboardSkeleton as Skeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { MuscleMap } from '../../components/MuscleMap';
import { getExerciseMuscleGroup, MuscleId, getMuscleLabel } from '../../src/lib/muscleMap';
import { Modal } from '../../components/Modal';

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

export default function ExercisesScreen() {
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

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border-gray pb-6 mb-6 flex-wrap gap-4">
          <View className="flex-1 min-w-[200px]">
            <Text className="text-3xl font-black tracking-wider text-on-surface uppercase">
              {t('exercises.title')}
            </Text>
            <Text className="text-muted-gray text-xs tracking-wider uppercase font-semibold mt-1">
              {t('exercises.subtitle')}
            </Text>
          </View>

          <View className="relative flex-1 min-w-[200px]">
            <Feather name="search" size={16} color="var(--muted-gray)" className="absolute left-3 top-3.5 z-10" />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={t('exercises.search_placeholder')}
              placeholderTextColor="var(--muted-gray)"
              className="w-full bg-surface border border-border-gray rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface"
            />
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg mr-2 border ${
                  isActive
                    ? 'bg-electric border-electric'
                    : 'bg-card border-border-gray'
                }`}
              >
                <Text className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-black font-black' : 'text-muted-gray'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Filters */}
        {(selectedMuscleFilter || selectedExerciseId) && (
          <View className="flex-row flex-wrap items-center gap-2 bg-surface border border-border-gray rounded-lg p-3 mb-6">
            <Text className="font-semibold text-muted-gray uppercase tracking-wider text-xs">
              {t('exercises.active_filters')}
            </Text>
            
            {selectedMuscleFilter && (
              <View className="flex-row items-center gap-1.5 bg-electric/10 border border-electric/25 px-2.5 py-1 rounded-md">
                <Text className="text-[10px] font-bold text-electric uppercase tracking-wide">
                  {t('exercises.target_label', { muscle: getMuscleLabel(selectedMuscleFilter) })}
                </Text>
                <TouchableOpacity onPress={() => setSelectedMuscleFilter(null)}>
                  <Feather name="x" size={14} color="var(--electric)" />
                </TouchableOpacity>
              </View>
            )}

            {selectedExerciseId && (
              <View className="flex-row items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                <Text className="text-[10px] font-bold text-white uppercase tracking-wide">
                  Pin: {exercises.find((e: any) => e.id === selectedExerciseId)?.name}
                </Text>
                <TouchableOpacity onPress={() => setSelectedExerciseId(null)}>
                  <Feather name="x" size={14} color="white" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                setSelectedMuscleFilter(null);
                setSelectedExerciseId(null);
              }}
              className="ml-auto"
            >
              <Text className="text-[10px] text-muted-gray uppercase font-black tracking-wider">
                {t('exercises.clear_all')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content Grid */}
        <View className="flex-col lg:flex-row gap-6">
          {/* Muscle Scanner (Left column on large screens, top on mobile) */}
          <View className="bg-card border border-border-gray rounded-xl p-5 mb-6">
            <Text className="font-bold text-on-surface uppercase tracking-wider text-sm">
              {t('exercises.muscle_scanner_title')}
            </Text>
            <Text className="text-muted-gray text-[10px] uppercase font-semibold mt-1 mb-4">
              {t('exercises.muscle_scanner_desc')}
            </Text>

            <View className="bg-surface rounded-xl p-2 py-4 border border-border-gray shadow-inner items-center justify-center">
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

            <View className="border-t border-border-gray pt-4 mt-4 space-y-2">
              <Text className="text-[10px] font-black text-on-surface uppercase tracking-widest block mb-2">
                {t('exercises.legend_title')}
              </Text>
              <View className="space-y-1.5">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded bg-error shadow-sm" />
                  <Text className="text-[10px] uppercase font-bold text-muted-gray">{t('exercises.legend_primary')}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded bg-warning shadow-sm" />
                  <Text className="text-[10px] uppercase font-bold text-muted-gray">{t('exercises.legend_secondary')}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded bg-surface border border-border-gray" />
                  <Text className="text-[10px] uppercase font-bold text-muted-gray">{t('exercises.legend_inactive')}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Exercises List */}
          <View className="flex-1 space-y-4">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((ex: any) => {
                const isPinned = selectedExerciseId === ex.id;
                const mapping = getExerciseMuscleGroup(ex.name);

                return (
                  <TouchableOpacity
                    key={ex.id}
                    onPress={() => handleExerciseClick(ex.id)}
                    className={`bg-card border rounded-xl p-5 mb-4 ${
                      isPinned 
                        ? 'border-electric bg-electric/5' 
                        : 'border-border-gray'
                    }`}
                  >
                    <View className="flex-row justify-between items-start gap-2 mb-2">
                      <Text className="text-lg font-bold tracking-wide text-on-surface uppercase flex-1">
                        {ex.name}
                      </Text>
                      <View className="flex-row items-center gap-1.5 shrink-0">
                        <TouchableOpacity
                          onPress={(e) => {
                            setInstructionExerciseId(ex.id);
                          }}
                          className="w-8 h-8 rounded-lg bg-surface border border-border-gray items-center justify-center"
                        >
                          <Feather name="info" size={14} color="var(--muted-gray)" />
                        </TouchableOpacity>
                        {isPinned && (
                          <View className="w-6 h-6 rounded-full bg-electric items-center justify-center">
                            <Feather name="check" size={12} color="black" />
                          </View>
                        )}
                      </View>
                    </View>

                    <View className="flex-row flex-wrap gap-1.5 mb-4">
                      {mapping.primary.slice(0, 2).map((m) => (
                        <View key={m} className="px-1.5 py-0.5 rounded bg-electric/15">
                          <Text className="text-[9px] font-extrabold uppercase tracking-wide text-electric">
                            {getMuscleLabel(m)}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View className="flex-row gap-2 pt-4 border-t border-border-gray">
                      <View className="px-2 py-0.5 rounded border border-border-gray bg-surface">
                        <Text className="text-[10px] font-black uppercase tracking-wider text-muted-gray">
                          {ex.category || 'General'}
                        </Text>
                      </View>
                      {ex.difficulty && (
                        <View className={`px-2 py-0.5 rounded border ${
                          ex.difficulty === 'Beginner' ? 'border-success/20 bg-success/10' :
                          ex.difficulty === 'Intermediate' ? 'border-electric/20 bg-electric/10' :
                          'border-electric-orange/20 bg-electric-orange/10'
                        }`}>
                          <Text className={`text-[10px] font-black uppercase tracking-wider ${
                            ex.difficulty === 'Beginner' ? 'text-success' :
                            ex.difficulty === 'Intermediate' ? 'text-electric' :
                            'text-electric-orange'
                          }`}>
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
                icon={<Feather name="book-open" size={32} color="var(--muted-gray)" />}
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
            <View className="space-y-5">
              <View className="mb-4">
                <Text className="text-xl font-bold text-on-surface uppercase tracking-wider">
                  {ex.name}
                </Text>
                <View className="flex-row gap-2 mt-2">
                  <View className="px-2.5 py-0.5 rounded border border-border-gray bg-surface">
                    <Text className="text-[10px] font-black uppercase tracking-wider text-on-surface">
                      {ex.category || 'General'}
                    </Text>
                  </View>
                  {ex.difficulty && (
                    <View className="px-2.5 py-0.5 rounded border border-electric/15 bg-electric/5">
                      <Text className="text-[10px] font-black uppercase tracking-wider text-electric">
                        {ex.difficulty}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View className="space-y-2 mb-4">
                <Text className="text-[10px] font-black text-muted-gray uppercase tracking-widest mb-2">
                  Anatomical Mapping
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {mapping.primary.map((m) => (
                    <View key={m} className="bg-electric/10 border border-electric/15 px-2 py-0.5 rounded-md">
                      <Text className="text-[10px] font-bold uppercase tracking-wide text-electric">
                        {getMuscleLabel(m)} (Primary)
                      </Text>
                    </View>
                  ))}
                  {mapping.secondary.map((m) => (
                    <View key={m} className="bg-[#FF9500]/10 border border-[#FF9500]/15 px-2 py-0.5 rounded-md">
                      <Text className="text-[10px] font-bold uppercase tracking-wide text-[#FF9500]">
                        {getMuscleLabel(m)} (Secondary)
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="space-y-2 pt-4 border-t border-border-gray mb-4">
                <Text className="text-[10px] font-black text-muted-gray uppercase tracking-widest mb-2">
                  Execution Instructions
                </Text>
                <Text className="text-sm text-on-surface leading-relaxed font-semibold">
                  {ex.description || 'No execution instructions logged yet in this athletic split repository.'}
                </Text>
              </View>

              <View className="flex-row justify-end">
                <TouchableOpacity
                  onPress={() => setInstructionExerciseId(null)}
                  className="rounded-lg px-4 py-3 bg-surface border border-border-gray"
                >
                  <Text className="text-xs font-semibold text-on-surface uppercase tracking-wider">
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
