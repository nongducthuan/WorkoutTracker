import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { Colors } from '../../theme/colors';
import { styles } from './styles';

interface OverviewHeaderProps {
  workoutName: string;
  workoutDescription: string;
  isEditing: boolean;
  editName: string;
  editDescription: string;
  onChangeEditName: (v: string) => void;
  onChangeEditDescription: (v: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onGoBack: () => void;
  showFinishButton: boolean;
  isFinishing: boolean;
  onFinishWorkout: () => void;
}

export function OverviewHeader({
  workoutName,
  workoutDescription,
  isEditing,
  editName,
  editDescription,
  onChangeEditName,
  onChangeEditDescription,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onGoBack,
  showFinishButton,
  isFinishing,
  onFinishWorkout,
}: OverviewHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
        <Feather name="arrow-left" size={14} color={Colors.white} />
        <Text style={styles.backText}>{t('workout_detail.back')}</Text>
      </TouchableOpacity>

      {isEditing ? (
        <View style={styles.editOverviewContainer}>
          <TextInput
            value={editName}
            onChangeText={onChangeEditName}
            style={styles.editNameInput}
            placeholderTextColor={Colors.mutedGray}
            placeholder={t('workouts.name_label')}
          />
          <TextInput
            value={editDescription}
            onChangeText={onChangeEditDescription}
            multiline
            numberOfLines={3}
            style={styles.editDescInput}
            placeholderTextColor={Colors.mutedGray}
            placeholder={t('workouts.desc_label')}
          />
          <View style={styles.editActionRow}>
            <TouchableOpacity onPress={onCancelEdit} style={styles.cancelButton}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSaveEdit} style={styles.saveButton}>
              <Text style={styles.saveText}>{t('workout_detail.save_split')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.overviewContainer}>
          <View>
            <View style={styles.splitStudioTag}>
              <Text style={styles.splitStudioText}>Split Studio</Text>
            </View>
            <Text style={styles.workoutName}>{workoutName}</Text>
            <Text style={styles.workoutDesc}>{workoutDescription || t('workout_detail.no_description')}</Text>
          </View>

          <View style={styles.headerActionRow}>
            {showFinishButton && (
              <TouchableOpacity
                onPress={onFinishWorkout}
                disabled={isFinishing}
                style={[styles.completeButton, isFinishing && styles.opacity50]}
              >
                <Feather name="check" size={14} color={Colors.black} />
                <Text style={styles.completeText}>
                  {isFinishing ? t('workout_detail.finishing') : t('workout_detail.finish_workout')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onStartEdit} style={styles.editButton}>
              <Feather name="edit-2" size={14} color={Colors.white} />
              <Text style={styles.editText}>
                {t('workout_detail.edit_overview')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}