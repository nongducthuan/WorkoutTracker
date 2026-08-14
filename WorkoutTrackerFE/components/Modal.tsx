import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../src/context/ThemeContext';
import type { ThemeColors } from '../src/theme/colors';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  /** Bottom-sheet style, matching the "Thêm bài / Thêm lịch" screens. */
  variant?: 'center' | 'sheet';
  scrollable?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'center',
  scrollable = false,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const Content = scrollable ? ScrollView : View;

  return (
    <RNModal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, variant === 'sheet' && styles.overlaySheet]}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, variant === 'sheet' && styles.containerSheet]}>
              {variant === 'sheet' && <View style={styles.grabber} />}
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                <TouchableOpacity onPress={onClose} hitSlop={12}>
                  <Icon name="x" size={22} color={colors.mutedGray} />
                </TouchableOpacity>
              </View>
              <Content
                style={scrollable ? styles.scroll : undefined}
                contentContainerStyle={styles.content}
              >
                {children}
              </Content>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    overlaySheet: { justifyContent: 'flex-end', padding: 0 },
    container: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      overflow: 'hidden',
    },
    containerSheet: {
      maxWidth: undefined,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      maxHeight: '88%',
    },
    grabber: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginTop: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    title: {
      flex: 1,
      fontSize: 15,
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.onSurface,
    },
    scroll: { flexGrow: 0 },
    content: { padding: 16 },
  });
