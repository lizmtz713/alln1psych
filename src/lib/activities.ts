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

export function getActivityById(id: string) {
  return ACTIVITIES.find(a => a.id === id) || null;
}
