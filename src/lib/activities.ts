export const ACTIVITIES = [
  { id: 'emotion-wheel', title: 'Emotion Explorer', emoji: '🎯', type: 'interactive', module: 'dashboard' },
  { id: 'body-scan', title: 'Body Check', emoji: '🧍', type: 'interactive', module: 'wiring' },
  { id: 'thought-challenger', title: 'Thought Challenger', emoji: '💭', type: 'ai-guided', module: 'troubleshooting' },
  { id: 'breathing', title: 'Breathe With Me', emoji: '🌬️', type: 'guided', module: 'daily-tuneup' },
  { id: 'emotion-match', title: 'Emotion Match', emoji: '🃏', type: 'game', module: 'dashboard' },
  { id: 'trigger-map', title: 'Know Your Triggers', emoji: '⚡', type: 'ai-guided', module: 'troubleshooting' },
  { id: 'gratitude-jar', title: 'Gratitude Jar', emoji: '✨', type: 'daily', module: 'daily-tuneup' },
  { id: 'stress-thermo', title: 'Stress Check', emoji: '🌡️', type: 'interactive', module: 'troubleshooting' },
  { id: 'comm-builder', title: 'Say What You Feel', emoji: '💬', type: 'ai-guided', module: 'communication' },
  { id: 'mood-patterns', title: 'Your Patterns', emoji: '📊', type: 'insight', module: 'fluid-checks' },
];

/** Athlete Mode specific activities */
export const ATHLETE_ACTIVITIES = [
  { id: 'recovery-check', title: 'Recovery Check', emoji: '🔋', type: 'interactive', module: 'athlete', description: 'Assess your recovery status across sleep, soreness, energy, and mood.' },
  { id: 'pre-competition', title: 'Pre-Competition Prep', emoji: '🏆', type: 'guided', module: 'athlete', description: 'Get in your optimal zone before competition with arousal regulation.' },
  { id: 'performance-debrief', title: 'Performance Debrief', emoji: '📋', type: 'ai-guided', module: 'athlete', description: 'Process a competition or training session — what went well, what to work on.' },
  { id: 'athlete-identity', title: 'Beyond the Sport', emoji: '🌟', type: 'reflective', module: 'athlete', description: 'Explore who you are beyond your athletic identity.' },
];

/** Spectrum/Accessibility Mode specific activities */
export const SPECTRUM_ACTIVITIES = [
  { id: 'sensory-check', title: 'Sensory Check', emoji: '👁️', type: 'interactive', module: 'spectrum', description: 'Track what sensory inputs are affecting you right now.' },
  { id: 'stim-toolkit', title: 'Stim Toolkit', emoji: '🌀', type: 'interactive', module: 'spectrum', description: 'A collection of regulation tools — stimming suggestions for different needs.' },
  { id: 'social-script', title: 'Social Script Builder', emoji: '📝', type: 'ai-guided', module: 'spectrum', description: 'Get help preparing for a social situation with clear scripts.' },
  { id: 'body-double', title: 'Virtual Body Double', emoji: '👥', type: 'timed', module: 'spectrum', description: 'A gentle presence to help you focus on a task.' },
  { id: 'routine-builder', title: 'Routine Helper', emoji: '📅', type: 'interactive', module: 'spectrum', description: 'Build and track comforting routines.' },
  { id: 'emotion-cards', title: 'Emotion Cards', emoji: '🎴', type: 'interactive', module: 'spectrum', description: 'Picture-based emotion identification — no words needed.' },
];

export function getActivityById(id: string) {
  const all = [...ACTIVITIES, ...ATHLETE_ACTIVITIES, ...SPECTRUM_ACTIVITIES];
  return all.find(a => a.id === id) || null;
}

export function getActivitiesForMode(athleteMode: boolean, spectrumMode: boolean) {
  let activities = [...ACTIVITIES];
  if (athleteMode) {
    activities = [...activities, ...ATHLETE_ACTIVITIES];
  }
  if (spectrumMode) {
    activities = [...activities, ...SPECTRUM_ACTIVITIES];
  }
  return activities;
}
