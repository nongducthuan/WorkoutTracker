import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { SectionLabel } from '../../../../components/ui';
import { formatRelativeDay } from '../../../utils/date';
import { WorkoutComment } from '../../../types';

interface NotesSectionProps {
  comments: WorkoutComment[];
  onAdd: (text: string) => Promise<unknown> | void;
  onUpdate: (id: string, text: string) => Promise<unknown> | void;
  onDelete: (id: string) => void;
  isPosting?: boolean;
}

/** "Ghi chú" block of design 04, backed by the workout-comments API. */
export const NotesSection: React.FC<NotesSectionProps> = ({
  comments,
  onAdd,
  onUpdate,
  onDelete,
  isPosting,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors);

  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const submit = async () => {
    if (!draft.trim()) return;
    await onAdd(draft.trim());
    setDraft('');
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return;
    await onUpdate(id, editText.trim());
    setEditingId(null);
  };

  return (
    <View style={styles.section}>
      <SectionLabel>{t('workout_detail.notes_title')}</SectionLabel>

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={t('workout_detail.comment_placeholder')}
          placeholderTextColor={colors.mutedGray}
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          onPress={submit}
          disabled={!draft.trim() || isPosting}
          style={[styles.sendBtn, (!draft.trim() || isPosting) && styles.sendBtnOff]}
        >
          <Icon name="send" size={16} color={colors.black} />
        </TouchableOpacity>
      </View>

      {comments.length === 0 ? (
        <Text style={styles.empty}>{t('workout_detail.no_comments')}</Text>
      ) : (
        comments.map((c) => (
          <View key={c.id} style={styles.note}>
            {editingId === c.id ? (
              <>
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  style={styles.input}
                  multiline
                />
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={() => setEditingId(null)}>
                    <Text style={styles.editCancel}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => saveEdit(c.id)}>
                    <Text style={styles.editSave}>{t('common.save')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.noteText}>{c.comment}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteMeta}>
                    {c.userName || t('workout_detail.anonymous_athlete')} ·{' '}
                    {formatRelativeDay(c.createdAt)}
                  </Text>
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingId(c.id);
                        setEditText(c.comment);
                      }}
                      hitSlop={8}
                    >
                      <Icon name="edit-2" size={14} color={colors.mutedGray} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(c.id)} hitSlop={8}>
                      <Icon name="trash-2" size={14} color={colors.mutedGray} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        ))
      )}
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    section: { marginTop: 8 },
    composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 14 },
    input: {
      flex: 1,
      minHeight: 46,
      maxHeight: 120,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.onSurface,
      textAlignVertical: 'top',
    },
    sendBtn: {
      width: 46,
      height: 46,
      borderRadius: 12,
      backgroundColor: colors.electric,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnOff: { opacity: 0.4 },
    empty: { fontSize: 12, color: colors.mutedGray, paddingVertical: 8 },
    note: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    noteText: { fontSize: 13, color: colors.onSurface, lineHeight: 20 },
    noteFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    noteMeta: { fontSize: 11, color: colors.mutedGray },
    noteActions: { flexDirection: 'row', gap: 14 },
    editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 10 },
    editCancel: { fontSize: 12, color: colors.mutedGray, fontWeight: '700' },
    editSave: { fontSize: 12, color: colors.electric, fontWeight: '900' },
  });
