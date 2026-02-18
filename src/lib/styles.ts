/**
 * Shared styles for consistent UI across the app
 * Import and spread these in your StyleSheet.create()
 */
import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from './constants';

/**
 * Screen container with standard padding
 */
export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
});

/**
 * Header styles
 */
export const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightPlaceholder: {
    width: 44,
  },
});

/**
 * Card styles
 */
export const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  padded: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  elevated: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  accent: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
    padding: SPACING.lg,
  },
  interactive: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
});

/**
 * Button styles
 */
export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    ...TYPOGRAPHY.labelLg,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.text,
    fontWeight: '500',
  },
  ghost: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.accent,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
  pill: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pillActive: {
    backgroundColor: COLORS.accentBg,
    borderColor: COLORS.borderAccent,
  },
  pillText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.accent,
  },
});

/**
 * Input styles
 */
export const inputStyles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    color: COLORS.text,
    fontSize: 16,
  },
  multiline: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  focused: {
    borderColor: COLORS.accent,
  },
  label: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  hint: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});

/**
 * Text styles
 */
export const textStyles = StyleSheet.create({
  displayLg: {
    ...TYPOGRAPHY.displayLg,
    color: COLORS.text,
  },
  displayMd: {
    ...TYPOGRAPHY.displayMd,
    color: COLORS.text,
  },
  displaySm: {
    ...TYPOGRAPHY.displaySm,
    color: COLORS.text,
  },
  headlineLg: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text,
  },
  headlineMd: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
  },
  headlineSm: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.text,
  },
  bodyLg: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.text,
  },
  bodyMd: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
  },
  bodySm: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text,
  },
  labelLg: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.text,
  },
  labelMd: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text,
  },
  labelSm: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.text,
  },
  muted: {
    color: COLORS.textMuted,
  },
  secondary: {
    color: COLORS.textSecondary,
  },
  accent: {
    color: COLORS.accent,
  },
  center: {
    textAlign: 'center',
  },
});

/**
 * Section styles
 */
export const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
});

/**
 * List/Menu styles
 */
export const listStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentBg,
  },
  itemLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
  },
  itemHint: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
  },
});

/**
 * Chat/Message bubble styles
 */
export const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  userBubble: {
    backgroundColor: COLORS.accentBg,
    alignSelf: 'flex-end',
    borderBottomRightRadius: SPACING.xs,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: SPACING.xs,
  },
  bubbleText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  inputField: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.surface,
  },
});

/**
 * Loading/Status styles
 */
export const statusStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: SPACING.xxl,
    alignSelf: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  toastText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text,
  },
});

/**
 * Grid layout helpers
 */
export const gridStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  col2: {
    width: '48%',
  },
  col3: {
    width: '31%',
  },
});
