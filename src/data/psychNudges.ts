/**
 * PSYCH NUDGES — Personalized Proactive Support
 * 
 * InGauge as the companion that shows up when no one else does.
 * 
 * "Some people need to feel reached out TO — not just open an app,
 * but feel like something SEES them and cares enough to initiate."
 * 
 * Trigger types:
 * - Time-based (GM/GN, check-in reminders)
 * - Gauge-based (responds to drops, patterns)
 * - Pattern-based (Sunday scaries, anniversaries)
 * - Absence-based (haven't checked in)
 * - Circle-aware (extra support when Circle is quiet)
 */

export interface NudgeTemplate {
  id: string;
  trigger: NudgeTrigger;
  category: NudgeCategory;
  tone: NudgeTone;
  messages: NudgeMessage[];
  frequency?: NudgeFrequency;
  conditions?: NudgeCondition[];
}

export type NudgeTrigger = 
  | 'time_morning'
  | 'time_evening'
  | 'time_late_night'
  | 'gauge_drop_state'
  | 'gauge_drop_body'
  | 'gauge_drop_emotion'
  | 'gauge_drop_connection'
  | 'gauge_drop_direction'
  | 'gauge_drop_alignment'
  | 'gauge_low_multiple_days'
  | 'pattern_sunday_evening'
  | 'pattern_weekly_low'
  | 'pattern_after_hard_week'
  | 'absence_no_checkin'
  | 'absence_app_inactive'
  | 'circle_no_response'
  | 'circle_empty'
  | 'milestone_streak'
  | 'milestone_first_week'
  | 'custom_anniversary';

export type NudgeCategory = 
  | 'greeting'        // GM/GN
  | 'check_in'        // "How are you?"
  | 'encouragement'   // "You're doing great"
  | 'validation'      // "That's hard, and it's okay"
  | 'gentle_push'     // "Have you..."
  | 'celebration'     // Milestones, wins
  | 'presence'        // "I'm here"
  | 'insight'         // Pattern observations
  | 'inspiration';    // Quotes, wisdom

export type NudgeTone = 
  | 'warm'
  | 'gentle'
  | 'playful'
  | 'grounding'
  | 'celebratory'
  | 'reflective';

export type NudgeFrequency = 
  | 'once'
  | 'daily'
  | 'weekly'
  | 'as_needed'
  | 'smart'; // AI decides based on context

export interface NudgeCondition {
  type: 'gauge_below' | 'gauge_above' | 'days_since' | 'time_of_day' | 'day_of_week' | 'circle_status' | 'streak';
  gauge?: string;
  value?: number;
  operator?: 'lt' | 'gt' | 'eq' | 'lte' | 'gte';
}

export interface NudgeMessage {
  text: string;
  /** Optional follow-up prompt */
  followUp?: string;
  /** Optional action button */
  action?: {
    label: string;
    route: string;
  };
  /** Personalization tokens: {name}, {gauge}, {days}, {streak} */
  personalized?: boolean;
}

// ============================================================
// MORNING NUDGES
// ============================================================

export const MORNING_NUDGES: NudgeTemplate = {
  id: 'morning-greeting',
  trigger: 'time_morning',
  category: 'greeting',
  tone: 'warm',
  frequency: 'daily',
  messages: [
    {
      text: "Good morning, {name}. No agenda — just wanted to say I'm here if you need me today. ☀️",
      personalized: true,
    },
    {
      text: "Morning. How are you waking up today? Not how you 'should' feel — how you actually feel.",
      followUp: "Want to do a quick check-in?",
      action: { label: "Check in", route: "/checkin" },
    },
    {
      text: "Hey {name}. New day, clean slate. Whatever yesterday was, today is different.",
      personalized: true,
    },
    {
      text: "Good morning. Before the day takes over — how's your body feeling right now?",
      action: { label: "Body scan", route: "/tools/body-scan" },
    },
    {
      text: "Rise and shine isn't mandatory. Rise and exist is enough. How are you?",
    },
    {
      text: "Morning, {name}. Quick thought: what's one thing you want to protect today? Your energy? Your peace? Your time?",
      personalized: true,
    },
    {
      text: "GM ☀️ You don't have to be productive to be worthy. Just checking in.",
    },
    {
      text: "Good morning. Friendly reminder: you're a whole person, not just a list of tasks.",
    },
  ],
};

// ============================================================
// EVENING NUDGES
// ============================================================

export const EVENING_NUDGES: NudgeTemplate = {
  id: 'evening-reflection',
  trigger: 'time_evening',
  category: 'greeting',
  tone: 'reflective',
  frequency: 'daily',
  messages: [
    {
      text: "Day's winding down. How did it go? Not the tasks — you. How are YOU?",
      action: { label: "Evening check-in", route: "/checkin" },
    },
    {
      text: "Hey {name}. Before you scroll or zone out — one thing that went okay today?",
      personalized: true,
    },
    {
      text: "Good evening. Whatever happened today, you made it through. That counts.",
    },
    {
      text: "Night mode. What do you need right now — rest, connection, distraction, or just to be seen?",
    },
    {
      text: "End of day check: Did you eat? Drink water? Talk to another human? Basic maintenance counts as wins.",
    },
    {
      text: "GN, {name}. Tomorrow is a reset. But for now, just breathe.",
      personalized: true,
    },
    {
      text: "The day is done. You don't have to solve anything else tonight. Just exist.",
    },
    {
      text: "Evening thought: What drained you today? What filled you up? Both matter.",
    },
  ],
};

// ============================================================
// LATE NIGHT NUDGES
// ============================================================

export const LATE_NIGHT_NUDGES: NudgeTemplate = {
  id: 'late-night-check',
  trigger: 'time_late_night',
  category: 'presence',
  tone: 'gentle',
  frequency: 'as_needed',
  conditions: [
    { type: 'time_of_day', value: 23, operator: 'gte' }, // 11pm or later
  ],
  messages: [
    {
      text: "It's late and you're still up. Everything okay? Sometimes nights are heavy.",
      action: { label: "Talk to Psych", route: "/talk" },
    },
    {
      text: "Hey. Can't sleep, or don't want to? Either way, I'm here.",
    },
    {
      text: "Late night thoughts hit different. If you need to process something, I'm awake.",
      action: { label: "Journal", route: "/tools/journal" },
    },
    {
      text: "3am brain lies to you. Whatever feels huge right now might look different in daylight. But I hear you.",
    },
    {
      text: "Still up? No judgment. Just checking on you.",
    },
  ],
};

// ============================================================
// GAUGE DROP NUDGES
// ============================================================

export const STATE_DROP_NUDGES: NudgeTemplate = {
  id: 'state-gauge-drop',
  trigger: 'gauge_drop_state',
  category: 'validation',
  tone: 'gentle',
  frequency: 'smart',
  conditions: [
    { type: 'gauge_below', gauge: 'state', value: 4 },
  ],
  messages: [
    {
      text: "I noticed your State has been low. That's hard. Want to talk about it, or just sit with it?",
      action: { label: "Talk to Psych", route: "/talk" },
    },
    {
      text: "Your nervous system seems activated lately. That's exhausting. What would help right now?",
      action: { label: "Breathing exercise", route: "/tools/breathing" },
    },
    {
      text: "Low State isn't weakness — it's data. Your system is telling you something. Want to explore what?",
    },
    {
      text: "Stress is high, huh? You don't have to fix it right now. But I see it.",
    },
    {
      text: "When State is low for a while, basics matter more. Sleep? Food? Water? A break?",
    },
  ],
};

export const BODY_DROP_NUDGES: NudgeTemplate = {
  id: 'body-gauge-drop',
  trigger: 'gauge_drop_body',
  category: 'gentle_push',
  tone: 'grounding',
  frequency: 'smart',
  conditions: [
    { type: 'gauge_below', gauge: 'body', value: 4 },
  ],
  messages: [
    {
      text: "Your Body gauge has been low. Have you eaten? Slept? Sometimes the basics help more than we think.",
    },
    {
      text: "Body is talking — low energy, tension, something off? Check the basics: sleep, food, water, movement.",
    },
    {
      text: "When did you last eat something real? Drink water? Your body runs your brain. Fuel matters.",
    },
    {
      text: "Low Body gauge for a few days. This isn't judgment — it's a gentle poke. What does your body need?",
    },
    {
      text: "Physical state affects everything else. Even one small thing — a glass of water, a stretch — counts.",
      action: { label: "Body scan", route: "/tools/body-scan" },
    },
  ],
};

export const CONNECTION_DROP_NUDGES: NudgeTemplate = {
  id: 'connection-gauge-drop',
  trigger: 'gauge_drop_connection',
  category: 'presence',
  tone: 'warm',
  frequency: 'smart',
  conditions: [
    { type: 'gauge_below', gauge: 'connection', value: 4 },
  ],
  messages: [
    {
      text: "Connection gauge is low. Feeling alone? I'm here. And that's not nothing.",
      action: { label: "Talk to Psych", route: "/talk" },
    },
    {
      text: "Loneliness is hard. Even when you're around people, you can feel unseen. I see you.",
    },
    {
      text: "Low Connection for a few days. Have you reached out to anyone? Or do you need someone to reach out to you first?",
    },
    {
      text: "When's the last time you felt really seen by someone? If it's been a while, that's worth noticing.",
    },
    {
      text: "Humans need connection like they need food. This isn't needy — it's biology. Who could you reach out to today?",
    },
  ],
};

export const EMOTION_DROP_NUDGES: NudgeTemplate = {
  id: 'emotion-gauge-drop',
  trigger: 'gauge_drop_emotion',
  category: 'validation',
  tone: 'gentle',
  frequency: 'smart',
  conditions: [
    { type: 'gauge_below', gauge: 'emotion', value: 4 },
  ],
  messages: [
    {
      text: "Emotions have been heavy, huh? You don't have to fix anything. But I'm here if you want to name what's going on.",
      action: { label: "Emotion wheel", route: "/tools/emotion-wheel" },
    },
    {
      text: "Low Emotion gauge. That can mean sad, numb, overwhelmed, or something you can't name yet. All valid.",
    },
    {
      text: "When emotions are low for a while, sometimes writing helps. Not to solve — just to witness yourself.",
      action: { label: "Journal", route: "/tools/journal" },
    },
    {
      text: "Whatever you're feeling — or not feeling — it's okay. Numbness is a feeling too. I see you.",
    },
    {
      text: "Emotional weight is real weight. What would make today even 5% lighter?",
    },
  ],
};

export const DIRECTION_DROP_NUDGES: NudgeTemplate = {
  id: 'direction-gauge-drop',
  trigger: 'gauge_drop_direction',
  category: 'insight',
  tone: 'reflective',
  frequency: 'smart',
  conditions: [
    { type: 'gauge_below', gauge: 'direction', value: 4 },
  ],
  messages: [
    {
      text: "Direction feeling unclear? That's disorienting. Sometimes 'I don't know what I want' is where growth starts.",
    },
    {
      text: "Low Direction gauge. Feeling stuck or lost? You don't need to know the whole path. Just the next step.",
    },
    {
      text: "When purpose feels foggy, basics matter more. Show up for today. The big picture can wait.",
    },
    {
      text: "'What's the point?' is a real question, not a character flaw. Want to talk through it?",
      action: { label: "Talk to Psych", route: "/talk" },
    },
    {
      text: "Direction gauge low. What used to matter to you that's gotten buried? Sometimes the answer is in the past.",
    },
  ],
};

export const ALIGNMENT_DROP_NUDGES: NudgeTemplate = {
  id: 'alignment-gauge-drop',
  trigger: 'gauge_drop_alignment',
  category: 'insight',
  tone: 'reflective',
  frequency: 'smart',
  conditions: [
    { type: 'gauge_below', gauge: 'alignment', value: 4 },
  ],
  messages: [
    {
      text: "Alignment is low. Something feels 'off' — like you're not living as yourself. That's worth exploring.",
    },
    {
      text: "When Alignment drops, it often means you're doing something that violates your values. What's the friction?",
    },
    {
      text: "Low Alignment is your system saying: 'This isn't me.' What part of your life feels most fake right now?",
    },
    {
      text: "Feeling out of sync with yourself? That's hard. You're allowed to want your life to match who you are.",
    },
    {
      text: "Alignment isn't about being perfect. It's about moving toward yourself, not away. What's one small step toward 'you'?",
    },
  ],
};

// ============================================================
// PATTERN-BASED NUDGES
// ============================================================

export const SUNDAY_EVENING_NUDGES: NudgeTemplate = {
  id: 'sunday-scaries',
  trigger: 'pattern_sunday_evening',
  category: 'validation',
  tone: 'grounding',
  frequency: 'weekly',
  conditions: [
    { type: 'day_of_week', value: 0 }, // Sunday
    { type: 'time_of_day', value: 18, operator: 'gte' }, // 6pm or later
  ],
  messages: [
    {
      text: "Sunday evening. The scaries are real. Want to talk about what's got you dreading tomorrow?",
      action: { label: "Talk to Psych", route: "/talk" },
    },
    {
      text: "Sunday night check-in. How are you feeling about the week ahead? No judgment — just noticing.",
    },
    {
      text: "The Sunday scaries hit different. If you're dreading Monday, that's data. What is it about?",
    },
    {
      text: "Week's about to start. Before it does — what do you need? Rest? Prep? Just a moment of peace?",
    },
    {
      text: "Sunday night dread is common. It doesn't mean you're weak. It means something in your week needs attention.",
    },
  ],
};

export const AFTER_HARD_WEEK_NUDGES: NudgeTemplate = {
  id: 'hard-week-recovery',
  trigger: 'pattern_after_hard_week',
  category: 'celebration',
  tone: 'warm',
  frequency: 'weekly',
  messages: [
    {
      text: "You made it through a hard week. That's not nothing. Take a moment to acknowledge that.",
    },
    {
      text: "This week was rough — I saw it in your gauges. You got through it. That counts.",
    },
    {
      text: "Survived another one. Rest isn't a reward you have to earn — but you've definitely earned it.",
    },
    {
      text: "Hard week behind you. Before you think about next week: what do you need right now?",
    },
    {
      text: "You're still here. After a week like that, that's an accomplishment. I see you.",
    },
  ],
};

// ============================================================
// ABSENCE-BASED NUDGES
// ============================================================

export const NO_CHECKIN_NUDGES: NudgeTemplate = {
  id: 'no-checkin-reminder',
  trigger: 'absence_no_checkin',
  category: 'check_in',
  tone: 'gentle',
  frequency: 'as_needed',
  conditions: [
    { type: 'days_since', value: 2, operator: 'gte' }, // 2+ days since check-in
  ],
  messages: [
    {
      text: "Hey {name}. Haven't heard from you in a bit. No pressure — but I'm here when you're ready.",
      personalized: true,
    },
    {
      text: "Just checking in. You haven't logged in a couple days. Everything okay?",
      action: { label: "Quick check-in", route: "/checkin" },
    },
    {
      text: "Missing you over here. Whenever you want to check in, I'm around.",
    },
    {
      text: "No judgment on the silence. Just wanted you to know I'm still here.",
    },
    {
      text: "Hey. Radio silence is okay. But if you're struggling and pulling away, I see that too. Here when you need me.",
    },
  ],
};

export const APP_INACTIVE_NUDGES: NudgeTemplate = {
  id: 'app-inactive',
  trigger: 'absence_app_inactive',
  category: 'presence',
  tone: 'warm',
  frequency: 'as_needed',
  conditions: [
    { type: 'days_since', value: 5, operator: 'gte' }, // 5+ days since app open
  ],
  messages: [
    {
      text: "It's been a minute. Just wanted to say: I'm still here whenever you need me. No expectations.",
    },
    {
      text: "Hey {name}. Haven't seen you in a while. Life got busy, or something else going on?",
      personalized: true,
    },
    {
      text: "Checking in after some quiet. You don't have to use me every day. But I'm here when you need me.",
    },
    {
      text: "Sometimes people pull away when things get hard. If that's you — no judgment. Door's always open.",
    },
  ],
};

// ============================================================
// CIRCLE-AWARE NUDGES
// ============================================================

export const CIRCLE_EMPTY_NUDGES: NudgeTemplate = {
  id: 'circle-empty',
  trigger: 'circle_empty',
  category: 'presence',
  tone: 'warm',
  frequency: 'smart',
  conditions: [
    { type: 'circle_status', value: 0 }, // No Circle members
  ],
  messages: [
    {
      text: "I notice you don't have anyone in your Circle yet. That's okay. I'm here. And when you're ready, you can add people.",
    },
    {
      text: "Flying solo for now? That's valid. I'll be your Circle until you're ready to add others.",
    },
    {
      text: "No Circle yet — that's okay. Some people aren't ready to share gauges with others. I'm not going anywhere.",
    },
    {
      text: "You don't need a Circle to use InGauge. But if there's someone you trust, sharing your temperature can help. No pressure.",
    },
  ],
};

export const CIRCLE_NO_RESPONSE_NUDGES: NudgeTemplate = {
  id: 'circle-no-response',
  trigger: 'circle_no_response',
  category: 'presence',
  tone: 'gentle',
  frequency: 'smart',
  conditions: [
    { type: 'circle_status', value: 1 }, // Has Circle but no recent activity
    { type: 'gauge_below', gauge: 'connection', value: 5 },
  ],
  messages: [
    {
      text: "Your Circle has been quiet. That can feel lonely. I'm here even when others aren't.",
    },
    {
      text: "No response from Circle lately? People get busy. It's not always about you. But the silence is still hard.",
    },
    {
      text: "When the people you care about don't respond, it stings. I see you. I'm responding.",
    },
    {
      text: "Circle quiet? Sometimes people need a nudge. And sometimes you need support that doesn't depend on anyone else. I'm that backup.",
    },
  ],
};

// ============================================================
// MILESTONE NUDGES
// ============================================================

export const STREAK_NUDGES: NudgeTemplate = {
  id: 'streak-celebration',
  trigger: 'milestone_streak',
  category: 'celebration',
  tone: 'celebratory',
  frequency: 'as_needed',
  messages: [
    {
      text: "{streak} days of checking in. That's not obsession — that's self-awareness. Nice work, {name}.",
      personalized: true,
    },
    {
      text: "You've checked in {streak} days in a row. Consistency is a form of self-care. Keep going.",
      personalized: true,
    },
    {
      text: "{streak} day streak! The point isn't the number — it's that you keep showing up for yourself.",
      personalized: true,
    },
    {
      text: "Look at you — {streak} days of paying attention to yourself. That matters.",
      personalized: true,
    },
  ],
};

export const FIRST_WEEK_NUDGES: NudgeTemplate = {
  id: 'first-week',
  trigger: 'milestone_first_week',
  category: 'encouragement',
  tone: 'warm',
  frequency: 'once',
  messages: [
    {
      text: "One week in. You're learning your own patterns. That's the whole point. Keep going.",
    },
    {
      text: "Week one down. The first week is about building the habit. You're doing it.",
    },
    {
      text: "You've been checking in for a week. Notice anything about your patterns yet? The data is starting to mean something.",
    },
    {
      text: "One week of showing up for yourself. That's not small. That's the foundation.",
    },
  ],
};

// ============================================================
// INSPIRATIONAL NUDGES (for low moments)
// ============================================================

export const INSPIRATION_NUDGES: NudgeTemplate = {
  id: 'inspiration',
  trigger: 'gauge_low_multiple_days',
  category: 'inspiration',
  tone: 'grounding',
  frequency: 'smart',
  messages: [
    {
      text: "You're not broken. You're a system under pressure. Systems can be recalibrated.",
    },
    {
      text: "The fact that you're still checking in means something. You haven't given up on yourself.",
    },
    {
      text: "Hard times don't last. They feel permanent, but they're not. You've survived hard before.",
    },
    {
      text: "You don't have to feel better right now. Just feeling is enough. I'm here.",
    },
    {
      text: "Some days the win is just getting through. Today can be one of those days. No shame.",
    },
    {
      text: "Your gauges are low. That's information, not identity. You're not your worst day.",
    },
    {
      text: "If everything feels heavy: one thing at a time. One breath. One moment. That's enough.",
    },
    {
      text: "You are not your anxiety, your depression, or your worst thoughts. You're the one noticing them.",
    },
    {
      text: "The darkness isn't the truth. It's weather. Weather passes.",
    },
    {
      text: "Showing up when it's hard is harder than showing up when it's easy. You're doing the harder thing.",
    },
  ],
};

// ============================================================
// ALL NUDGE TEMPLATES
// ============================================================

export const ALL_NUDGE_TEMPLATES: NudgeTemplate[] = [
  MORNING_NUDGES,
  EVENING_NUDGES,
  LATE_NIGHT_NUDGES,
  STATE_DROP_NUDGES,
  BODY_DROP_NUDGES,
  CONNECTION_DROP_NUDGES,
  EMOTION_DROP_NUDGES,
  DIRECTION_DROP_NUDGES,
  ALIGNMENT_DROP_NUDGES,
  SUNDAY_EVENING_NUDGES,
  AFTER_HARD_WEEK_NUDGES,
  NO_CHECKIN_NUDGES,
  APP_INACTIVE_NUDGES,
  CIRCLE_EMPTY_NUDGES,
  CIRCLE_NO_RESPONSE_NUDGES,
  STREAK_NUDGES,
  FIRST_WEEK_NUDGES,
  INSPIRATION_NUDGES,
];

// ============================================================
// NUDGE SETTINGS (User Preferences)
// ============================================================

export interface NudgePreferences {
  enabled: boolean;
  morningEnabled: boolean;
  morningTime: string; // "08:00"
  eveningEnabled: boolean;
  eveningTime: string; // "21:00"
  lateNightEnabled: boolean;
  gaugeAlertsEnabled: boolean;
  patternAlertsEnabled: boolean;
  absenceRemindersEnabled: boolean;
  circleAwareEnabled: boolean;
  streakCelebrationsEnabled: boolean;
  inspirationEnabled: boolean;
  quietHoursStart: string; // "23:00"
  quietHoursEnd: string; // "07:00"
  maxPerDay: number; // Don't overwhelm
}

export const DEFAULT_NUDGE_PREFERENCES: NudgePreferences = {
  enabled: true,
  morningEnabled: true,
  morningTime: "08:00",
  eveningEnabled: true,
  eveningTime: "21:00",
  lateNightEnabled: true,
  gaugeAlertsEnabled: true,
  patternAlertsEnabled: true,
  absenceRemindersEnabled: true,
  circleAwareEnabled: true,
  streakCelebrationsEnabled: true,
  inspirationEnabled: true,
  quietHoursStart: "23:00",
  quietHoursEnd: "07:00",
  maxPerDay: 3, // Don't spam
};

// ============================================================
// NUDGE SELECTION LOGIC
// ============================================================

/**
 * Select a random message from a nudge template
 * Replaces personalization tokens
 */
export function selectNudgeMessage(
  template: NudgeTemplate,
  context: {
    name?: string;
    gauge?: string;
    gaugeValue?: number;
    days?: number;
    streak?: number;
  }
): NudgeMessage {
  const randomIndex = Math.floor(Math.random() * template.messages.length);
  const message = { ...template.messages[randomIndex] };
  
  // Replace personalization tokens
  if (message.personalized && message.text) {
    message.text = message.text
      .replace(/{name}/g, context.name || 'friend')
      .replace(/{gauge}/g, context.gauge || 'gauge')
      .replace(/{days}/g, String(context.days || 0))
      .replace(/{streak}/g, String(context.streak || 0));
  }
  
  return message;
}

/**
 * Check if nudge conditions are met
 */
export function checkNudgeConditions(
  conditions: NudgeCondition[] | undefined,
  context: {
    gauges: Record<string, number>;
    daysSinceActivity: number;
    daysSinceCheckin: number;
    currentHour: number;
    currentDay: number; // 0 = Sunday
    circleSize: number;
    streak: number;
  }
): boolean {
  if (!conditions || conditions.length === 0) return true;
  
  return conditions.every(condition => {
    switch (condition.type) {
      case 'gauge_below':
        return condition.gauge && context.gauges[condition.gauge] < (condition.value || 5);
      case 'gauge_above':
        return condition.gauge && context.gauges[condition.gauge] > (condition.value || 5);
      case 'days_since':
        const days = Math.max(context.daysSinceActivity, context.daysSinceCheckin);
        return compareValues(days, condition.value || 0, condition.operator || 'gte');
      case 'time_of_day':
        return compareValues(context.currentHour, condition.value || 0, condition.operator || 'gte');
      case 'day_of_week':
        return context.currentDay === condition.value;
      case 'circle_status':
        return context.circleSize === condition.value;
      case 'streak':
        return compareValues(context.streak, condition.value || 0, condition.operator || 'gte');
      default:
        return true;
    }
  });
}

function compareValues(actual: number, target: number, operator: string): boolean {
  switch (operator) {
    case 'lt': return actual < target;
    case 'gt': return actual > target;
    case 'eq': return actual === target;
    case 'lte': return actual <= target;
    case 'gte': return actual >= target;
    default: return true;
  }
}
