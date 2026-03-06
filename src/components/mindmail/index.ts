/**
 * Mind Mail Safety — Exports and integration guide.
 *
 * Quick integration:
 *
 * Compose (app/mind-mail/compose.tsx):
 * - Before send: checkContent(text) → if isCrisis show <CrisisIntervention /> and block until dismiss.
 * - Cooldown: getCooldownRemaining(sendType) → if > 0 show <CooldownTimer /> and disable Send.
 * - Anonymous/Soft: show <EmotionalSafetyCheck />; onConfirm proceed with send.
 * - After send: recordSend(sendType). Option: "Mark as sensitive" → contentWarning on note/mail.
 *
 * Detail (app/mind-mail/[id].tsx):
 * - If mail.contentWarning: wrap body in <ContentWarning>{children}</ContentWarning>.
 * - Inbox: <MessageActions messageId senderIdOrToken senderLabel isAnonymous onBlocked />.
 */

export { CrisisIntervention } from './CrisisIntervention';
export { EmotionalSafetyCheck } from './EmotionalSafetyCheck';
export { CooldownTimer } from './CooldownTimer';
export { ContentWarning } from './ContentWarning';
export { MessageActions } from './MessageActions';
