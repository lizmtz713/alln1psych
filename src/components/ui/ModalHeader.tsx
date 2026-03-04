/**
 * ModalHeader — Reusable header for modal screens
 * Provides consistent back/close button across all modals
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../../lib/constants';

interface ModalHeaderProps {
  /** Title shown in center (optional) */
  title?: string;
  /** Show X (close) or ← (back) icon. Default: close */
  variant?: 'close' | 'back';
  /** Custom close handler (defaults to router.back) */
  onClose?: () => void;
  /** Right side action (optional) */
  rightAction?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
  };
  /** Hide the close/back button entirely */
  hideClose?: boolean;
}

export function ModalHeader({ 
  title, 
  variant = 'close', 
  onClose, 
  rightAction,
  hideClose = false,
}: ModalHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Left: Close/Back button */}
      <View style={styles.left}>
        {!hideClose && (
          <Pressable 
            style={styles.closeBtn} 
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={variant === 'back' ? 'arrow-back' : 'close'} 
              size={28} 
              color={COLORS.text} 
            />
          </Pressable>
        )}
      </View>
      
      {/* Center: Title */}
      <View style={styles.center}>
        {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
      </View>
      
      {/* Right: Action button */}
      <View style={styles.right}>
        {rightAction && (
          <Pressable 
            style={[styles.actionBtn, rightAction.disabled && styles.actionBtnDisabled]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              rightAction.onPress();
            }}
            disabled={rightAction.disabled}
          >
            <Text style={[styles.actionText, rightAction.disabled && styles.actionTextDisabled]}>
              {rightAction.label}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/**
 * SimpleCloseButton — Just the X button for minimal headers
 */
export function SimpleCloseButton({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };
  
  return (
    <Pressable 
      style={[styles.simpleClose, { top: insets.top + 12 }]} 
      onPress={handleClose}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="close" size={28} color={COLORS.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    width: 60,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 60,
    alignItems: 'flex-end',
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
  actionTextDisabled: {
    color: COLORS.textMuted,
  },
  simpleClose: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
    padding: 4,
  },
});

export default ModalHeader;
