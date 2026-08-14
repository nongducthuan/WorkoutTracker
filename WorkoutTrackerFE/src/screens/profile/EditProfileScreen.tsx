import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { useCurrentUser } from '../../hooks';
import { authApi } from '../../api/auth';
import { useToast } from '../../../components/Toast';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { FormField, PrimaryButton } from '../../../components/ui';
import { initialsOf } from '../../utils/format';

/** Design 08b · Chỉnh sửa hồ sơ. */
export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, displayName, reload } = useCurrentUser();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? '');
    setUserName(user?.userName ?? '');
    setWeight(user?.weightKg != null ? String(user.weightKg) : '');
    setHeight(user?.heightCm != null ? String(user.heightCm) : '');
    setBirthday(user?.birthday ?? '');
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      // Body metrics live on the user record now, so they go up with the profile
      // in one request instead of staying on the device.
      await authApi.updateProfile({
        fullName: fullName.trim(),
        email: user?.email ?? '',
        weightKg: weight ? Number(weight) : null,
        heightCm: height ? Number(height) : null,
        birthday: birthday || null,
      });
      await reload();
      success(t('profile.update_success'));
      navigation.goBack();
    } catch {
      error(t('profile.update_failed'));
    } finally {
      setSaving(false);
    }
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title={t('profile.edit_title')} />

          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsOf(fullName || displayName)}</Text>
            </View>
            <TouchableOpacity style={styles.avatarBtn} disabled>
              <Icon name="camera" size={14} color={colors.mutedGray} />
              <Text style={styles.avatarBtnText}>{t('profile.change_avatar')}</Text>
            </TouchableOpacity>
          </View>

          <FormField label={t('profile.full_name')} value={fullName} onChangeText={setFullName} />

          <FormField
            label={t('profile.username')}
            value={userName}
            editable={false}
            hint={t('profile.cannot_change')}
          />

          <FormField
            label={t('profile.email')}
            value={user?.email ?? ''}
            editable={false}
            hint={t('profile.cannot_change')}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <FormField
                label={t('profile.weight')}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                suffix="kg"
              />
            </View>
            <View style={styles.rowItem}>
              <FormField
                label={t('profile.height')}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                suffix="cm"
              />
            </View>
          </View>

          <FormField
            label={t('profile.birthday')}
            value={birthday}
            onChangeText={setBirthday}
            placeholder="15/03/2000"
          />

          <PrimaryButton
            label={isSaving ? t('profile.saving') : t('profile.save_changes')}
            onPress={save}
            loading={isSaving}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    avatarWrap: { alignItems: 'center', marginBottom: 24 },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 2,
      borderColor: colors.electric,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 24, fontWeight: '900', color: colors.electric },
    avatarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
    avatarBtnText: { fontSize: 11, color: colors.mutedGray, fontWeight: '700' },
    row: { flexDirection: 'row', gap: 12 },
    rowItem: { flex: 1 },
    submit: { marginTop: 8 },
  });
