import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, globalStyles } from '../theme/styles';
import { useWorkouts } from '../hooks/useFitnessData';
import { DashboardSkeleton } from '../../components/LoadingSkeleton';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { RootStackParamList } from '../navigation/types';

type WorkoutsNav = NativeStackNavigationProp<RootStackParamList>;

export default function WorkoutsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<WorkoutsNav>();
  const { workouts, isLoading, createWorkout, deleteWorkout } = useWorkouts();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  if (isLoading) return <DashboardSkeleton />;

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createWorkout({ name, description: desc });
    setName(''); setDesc(''); setIsCreateOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteWorkout(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <View style={globalStyles.screen}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={[globalStyles.sectionHeader, { flexWrap: 'wrap' }]}>
          <Text
            style={[globalStyles.heading, { flexShrink: 1, marginRight: 8 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {t('workouts.title')}
          </Text>
          <TouchableOpacity
            onPress={() => setIsCreateOpen(true)}
            style={[globalStyles.btnSmall, { flexShrink: 0 }]}
          >
            <Icon name="plus" size={16} color={Colors.black} />
            <Text style={globalStyles.btnSmallText}>{t('workouts.new_workout')}</Text>
          </TouchableOpacity>
        </View>

        {workouts.length === 0 ? (
          <EmptyState
            title={t('workouts.empty_title')}
            description={t('workouts.empty_desc')}
            actionText={t('workouts.new_workout')}
            onAction={() => setIsCreateOpen(true)}
            icon={<Icon name="list" size={48} color={Colors.mutedGray} />}
          />
        ) : (
          <View style={{ gap: 16 }}>
            {workouts.map(w => (
              <TouchableOpacity
                key={w.id}
                style={globalStyles.card}
                onPress={() => navigation.navigate('WorkoutDetail', { id: w.id })}
              >
                <View style={[globalStyles.row, { justifyContent: 'space-between', marginBottom: 8 }]}>
                  <Text style={[globalStyles.textOnSurface, { fontSize: 18, fontWeight: '700' }]}>{w.name}</Text>
                  <TouchableOpacity onPress={() => setDeleteId(w.id)}>
                    <Icon name="trash-2" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={globalStyles.bodyText}>{w.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('workouts.modal_create_title')}>
        <View style={{ gap: 16 }}>
          <View>
            <Text style={globalStyles.label}>{t('workouts.name_label')}</Text>
            <TextInput style={globalStyles.input} value={name} onChangeText={setName} placeholder="Push Day, Leg Day..." placeholderTextColor={Colors.mutedGray} />
          </View>
          <View>
            <Text style={globalStyles.label}>{t('workouts.desc_label')}</Text>
            <TextInput style={globalStyles.input} value={desc} onChangeText={setDesc} placeholder="Optional description" placeholderTextColor={Colors.mutedGray} />
          </View>
          <TouchableOpacity style={globalStyles.btnPrimary} onPress={handleCreate}>
            <Text style={globalStyles.btnPrimaryText}>{t('workouts.save_workout')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title={t('workouts.delete_title')}
        message={t('workouts.delete_confirm')}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </View>
  );
}
