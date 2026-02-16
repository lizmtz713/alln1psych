import { useCockpitStore } from '../stores/cockpitStore';

function current(s: { value: number }): number {
  return s.value < 0 ? 0 : s.value;
}

/**
 * Apply cockpit gauge bonuses when the user completes an activity.
 * Call this when the user taps "Done" or completes a flow (e.g. conversation, journal save).
 * Bonuses are capped at 100.
 */
export function applyCockpitBonusForActivity(activityId: string): void {
  const s = useCockpitStore.getState();
  switch (activityId) {
    case 'breathing':
      s.updateState(Math.min(100, current(s.state) + 10));
      break;
    case 'body-scan':
      s.updateBody(Math.min(100, current(s.body) + 5));
      s.updateState(Math.min(100, current(s.state) + 5));
      break;
    case 'emotion-wheel':
      s.updateEmotion(Math.min(100, current(s.emotion) + 15));
      break;
    case 'thought-challenger':
      s.updateEmotion(Math.min(100, current(s.emotion) + 10));
      s.updateAlignment(Math.min(100, current(s.alignment) + 5));
      break;
    case 'emotion-match':
      s.updateEmotion(Math.min(100, current(s.emotion) + 5));
      break;
    case 'trigger-map':
      s.updateEmotion(Math.min(100, current(s.emotion) + 10));
      s.updateAlignment(Math.min(100, current(s.alignment) + 10));
      break;
    case 'gratitude-jar':
      s.updateDirection(Math.min(100, current(s.direction) + 5));
      s.updateEmotion(Math.min(100, current(s.emotion) + 5));
      break;
    case 'stress-thermo':
      s.updateState(Math.min(100, current(s.state) + 5));
      break;
    case 'comm-builder':
      s.updateConnection(Math.min(100, current(s.connection) + 10));
      break;
    case 'mood-patterns':
      s.updateEmotion(Math.min(100, current(s.emotion) + 5));
      break;
    default:
      break;
  }
}

/** Call when user completes a conversation with 3+ messages. */
export function applyCockpitBonusForConversation(): void {
  const s = useCockpitStore.getState();
  s.updateEmotion(Math.min(100, current(s.emotion) + 10));
  s.updateConnection(Math.min(100, current(s.connection) + 5));
}

/** Call when user saves a journal entry. */
export function applyCockpitBonusForJournal(): void {
  const s = useCockpitStore.getState();
  s.updateEmotion(Math.min(100, current(s.emotion) + 5));
  s.updateAlignment(Math.min(100, current(s.alignment) + 5));
}

/** Call when user completes role play. */
export function applyCockpitBonusForRolePlay(): void {
  const s = useCockpitStore.getState();
  s.updateConnection(Math.min(100, current(s.connection) + 10));
}

/** Call when user checks on a circle member. */
export function applyCockpitBonusForCircleCheck(): void {
  const s = useCockpitStore.getState();
  s.updateConnection(Math.min(100, current(s.connection) + 10));
}

/** Call when user uses Help Someone flow. */
export function applyCockpitBonusForHelpSomeone(): void {
  const s = useCockpitStore.getState();
  s.updateConnection(Math.min(100, current(s.connection) + 15));
}
