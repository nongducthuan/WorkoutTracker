import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { DashboardSkeleton as Skeleton } from '../../../components/LoadingSkeleton';
import { Colors } from '../../theme/colors';
import { styles } from './styles';

interface CommentsTabProps {
  isLoading: boolean;
  comments: any[];
  commentInput: string;
  onChangeCommentInput: (v: string) => void;
  onPostComment: () => void;
  editingCommentId: string | null;
  editCommentText: string;
  onChangeEditCommentText: (v: string) => void;
  onStartEditComment: (id: string, currentText: string) => void;
  onCancelEditComment: () => void;
  onSaveEditComment: (id: string) => void;
  onDeleteComment: (id: string) => void;
}

export function CommentsTab({
  isLoading,
  comments,
  commentInput,
  onChangeCommentInput,
  onPostComment,
  editingCommentId,
  editCommentText,
  onChangeEditCommentText,
  onStartEditComment,
  onCancelEditComment,
  onSaveEditComment,
  onDeleteComment,
}: CommentsTabProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.paneContent}>
      <Text style={styles.paneTitle}>
        {t('workout_detail.athletic_bulletin', 'Athletic Bulletin')}
      </Text>

      {/* Comment Input */}
      <View style={styles.cardContainerComment}>
        <Text style={styles.commentInputTitle}>
          {t('workout_detail.share_notes', 'Share Notes or Feedback')}
        </Text>
        <TextInput
          value={commentInput}
          onChangeText={onChangeCommentInput}
          placeholder={t('workout_detail.comment_placeholder', 'Log energy levels, diet, split adjustments...')}
          placeholderTextColor={Colors.mutedGray}
          multiline
          numberOfLines={3}
          style={styles.commentInputBox}
        />
        <TouchableOpacity
          onPress={onPostComment}
          disabled={!commentInput.trim()}
          style={[styles.postButton, !commentInput.trim() ? styles.postButtonDisabled : styles.postButtonActive]}
        >
          <Feather name="message-square" size={14} color={!commentInput.trim() ? Colors.white : Colors.black} />
          <Text style={[styles.postButtonText, !commentInput.trim() ? styles.textWhite : styles.textBlack]}>
            {t('workout_detail.post_comment', 'Post Log')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comments List */}
      {isLoading ? (
        <Skeleton />
      ) : comments.length > 0 ? (
        <View style={styles.paneContentSpacing}>
          {comments.map(c => {
            const isEditing = editingCommentId === c.id;
            return (
              <View key={c.id} style={styles.commentItem}>
                <View style={styles.avatarBox}>
                  <Feather name="user" size={18} color={Colors.electric} />
                </View>
                <View style={styles.flex1}>
                  <View style={styles.commentHeader}>
                    <View>
                      <Text style={styles.commentAuthor}>
                        {c.userName || t('workout_detail.anonymous_athlete', 'Anonymous Athlete')}
                      </Text>
                      <Text style={styles.commentDate}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                      </Text>
                    </View>
                    {!isEditing && (
                      <View style={styles.commentActions}>
                        <TouchableOpacity
                          onPress={() => onStartEditComment(c.id, c.comment)}
                          style={styles.actionBtnMargin}
                        >
                          <Feather name="edit-2" size={12} color={Colors.mutedGray} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDeleteComment(c.id)} style={styles.actionBtnMargin}>
                          <Feather name="trash-2" size={12} color={Colors.electricOrange} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  {isEditing ? (
                    <View style={styles.editCommentWrap}>
                      <TextInput
                        value={editCommentText}
                        onChangeText={onChangeEditCommentText}
                        multiline
                        style={styles.editCommentInput}
                      />
                      <View style={styles.editCommentActions}>
                        <TouchableOpacity onPress={onCancelEditComment} style={styles.cancelCommentBtn}>
                          <Text style={styles.cancelCommentText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onSaveEditComment(c.id)} style={styles.saveCommentBtn}>
                          <Text style={styles.saveCommentText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.commentText}>{c.comment}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.noCommentsText}>No comments yet.</Text>
      )}
    </View>
  );
}
