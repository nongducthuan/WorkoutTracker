import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useWorkouts, useSchedules } from '../../src/hooks/useFitnessData';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DashboardSkeleton as CardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Workout } from '../../src/types';

const workoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(50, 'Name must be under 50 characters'),
  description: z.string().min(1, 'Description is required').max(200, 'Description must be under 200 characters'),
});
type WorkoutFormValues = z.infer<typeof workoutSchema>;

export default function WorkoutsScreen() {
  const { t } = useTranslation();
  const { workouts = [], isLoading, createWorkout, updateWorkout, deleteWorkout } = useWorkouts();
  const { scheduleWorkout } = useSchedules();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { control, handleSubmit, reset, setValue } = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: { name: '', description: '' }
  });

  const handleOpenCreateModal = () => {
    setEditingWorkout(null);
    reset({ name: '', description: '' });
    setSubmitStatus('idle');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (workout: Workout) => {
    setEditingWorkout(workout);
    setValue('name', workout.name);
    setValue('description', workout.description);
    setSubmitStatus('idle');
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setDeletingId(id);
  };

  const onSubmit = async (data: WorkoutFormValues) => {
    setSubmitStatus('loading');
    try {
      if (editingWorkout) {
        await updateWorkout({ id: editingWorkout.id, data: { name: data.name, description: data.description } });
      } else {
        await createWorkout({ name: data.name, description: data.description });
      }
      setSubmitStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus('idle');
        reset();
      }, 1500);
    } catch {
      setSubmitStatus('error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeletingLoading(true);
    try {
      await deleteWorkout(deletingId);
      setDeletingId(null);
    } catch {
    } finally {
      setIsDeletingLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border-gray pb-6 mb-6">
          <View>
            <Text className="text-3xl font-black tracking-wider text-on-surface uppercase">
              {t('workouts.title')}
            </Text>
            <Text className="text-muted-gray text-xs tracking-wider uppercase font-semibold mt-1">
              {t('workouts.subtitle')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenCreateModal}
            className="flex-row items-center justify-center gap-2 rounded-lg bg-electric px-4 py-2.5 shadow-lg"
          >
            <Feather name="plus" size={18} color="black" />
            <Text className="text-sm font-black text-black uppercase tracking-wider">
              {t('workouts.new_workout')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="flex-1"><CardSkeleton /></View>
        ) : workouts.length > 0 ? (
          <View className="space-y-6">
            {workouts.map((workout: Workout) => (
              <TouchableOpacity
                key={workout.id}
                onPress={() => router.push(`/workouts/${workout.id}`)}
                className="bg-card border border-border-gray rounded-xl p-5"
              >
                <View className="space-y-3">
                  <View className="flex-row justify-between items-start">
                    <Text className="text-xl font-bold tracking-wider text-on-surface uppercase max-w-[80%]">
                      {workout.name}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() => handleOpenEditModal(workout)}
                        className="p-1.5 rounded bg-surface"
                      >
                        <Feather name="edit-2" size={16} color="var(--muted-gray)" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleOpenDeleteDialog(workout.id)}
                        className="p-1.5 rounded bg-surface"
                      >
                        <Feather name="trash-2" size={16} color="var(--error)" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text className="text-sm text-muted-gray font-semibold mb-4" numberOfLines={3}>
                    {workout.description || t('workouts.no_description')}
                  </Text>
                  {workout.scheduledDate && (
                    <View className="flex-row items-center gap-1.5 mt-1">
                      <Feather name="calendar" size={12} color="var(--muted-gray)" />
                      <Text className="text-[10px] text-muted-gray font-semibold">
                        {new Date(workout.scheduledDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="border-t border-border-gray pt-4 mt-6 flex-row justify-between items-center">
                  <View className="bg-electric/10 px-2 py-0.5 rounded">
                    <Text className="text-[10px] text-electric font-bold uppercase tracking-wider">
                      {t('workouts.routine_profile')}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-bold uppercase tracking-wider text-muted-gray">
                      {t('workouts.enter_studio')}
                    </Text>
                    <Feather name="arrow-right" size={14} color="var(--muted-gray)" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            title={t('workouts.empty_title')}
            description={t('workouts.empty_desc')}
            actionText={t('workouts.empty_action')}
            onAction={handleOpenCreateModal}
            icon={<Feather name="list" size={32} color="var(--muted-gray)" />}
          />
        )}
      </ScrollView>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorkout ? t('workouts.modal_edit_title') : t('workouts.modal_create_title')}
      >
        <View className="space-y-5">
          <View className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted-gray mb-2">
              {t('workouts.name_label')}
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g. Monday Push Day"
                    placeholderTextColor="var(--muted-gray)"
                    className={`w-full bg-surface border rounded-lg px-4 py-3 text-sm text-on-surface ${error ? 'border-error' : 'border-border-gray'}`}
                  />
                  {error && <Text className="text-error text-xs mt-1">{error.message}</Text>}
                </View>
              )}
            />
          </View>
          
          <View className="mb-6">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted-gray mb-2">
              {t('workouts.desc_label')}
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g. Detail target muscles, specific goals..."
                    placeholderTextColor="var(--muted-gray)"
                    multiline
                    numberOfLines={3}
                    className={`w-full bg-surface border rounded-lg px-4 py-3 text-sm text-on-surface min-h-[80px] ${error ? 'border-error' : 'border-border-gray'}`}
                  />
                  {error && <Text className="text-error text-xs mt-1">{error.message}</Text>}
                </View>
              )}
            />
          </View>

          <View className="flex-row justify-end gap-3">
            <TouchableOpacity
              onPress={() => setIsModalOpen(false)}
              className="rounded-lg px-4 py-3 bg-surface border border-border-gray"
            >
              <Text className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                {t('workouts.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={submitStatus === 'loading' || submitStatus === 'success'}
              className={`rounded-lg px-6 py-3 flex-row items-center justify-center ${submitStatus === 'success' ? 'bg-success' : 'bg-electric'}`}
            >
              {submitStatus === 'loading' && <Text className="text-black font-black uppercase text-xs">{t('workouts.saving')}</Text>}
              {submitStatus === 'success' && <Text className="text-black font-black uppercase text-xs">{t('workouts.saved')}</Text>}
              {submitStatus === 'error' && <Text className="text-black font-black uppercase text-xs">{t('workouts.try_again')}</Text>}
              {submitStatus === 'idle' && <Text className="text-black font-black uppercase text-xs">{editingWorkout ? t('workouts.save_workout') : t('workouts.create_workout')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        isOpen={deletingId !== null}
        title={t('workouts.delete_title')}
        message={t('workouts.delete_message')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
        isLoading={isDeletingLoading}
      />
    </View>
  );
}
