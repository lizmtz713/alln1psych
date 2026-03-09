/**
 * Reach Out Actions — All the ways to connect with someone
 */

import { Linking } from 'react-native';
import type { Light } from '../types/lights';

export type ReachOutMethod =
  | 'text' | 'call' | 'video' | 'voice-note' | 'email' | 'mind-mail'
  | 'doordash' | 'ubereats' | 'instacart' | 'flowers' | 'amazon-gift' | 'venmo' | 'cashapp'
  | 'schedule-hangout' | 'send-meme' | 'share-song' | 'send-photo';

export interface ReachOutAction {
  id: ReachOutMethod;
  label: string;
  emoji: string;
  category: 'communicate' | 'gift' | 'plan' | 'share';
  effort: 'low' | 'medium' | 'high';
  loveLanguages: string[];
  description: string;
  deepLink?: (light: Light) => string | null;
}

export const REACH_OUT_ACTIONS: ReachOutAction[] = [
  { id: 'text', label: 'Text', emoji: '💬', category: 'communicate', effort: 'low',
    loveLanguages: ['Words of Affirmation', 'Quality Time'], description: 'Send a quick text message',
    deepLink: (l) => l.phone ? `sms:${l.phone.replace(/\D/g, '')}` : null },
  { id: 'call', label: 'Call', emoji: '📞', category: 'communicate', effort: 'medium',
    loveLanguages: ['Quality Time', 'Words of Affirmation'], description: 'Have a real conversation',
    deepLink: (l) => l.phone ? `tel:${l.phone.replace(/\D/g, '')}` : null },
  { id: 'video', label: 'FaceTime', emoji: '📹', category: 'communicate', effort: 'medium',
    loveLanguages: ['Quality Time'], description: 'Face-to-face connection',
    deepLink: (l) => l.phone ? `facetime:${l.phone.replace(/\D/g, '')}` : null },
  { id: 'voice-note', label: 'Voice Note', emoji: '🎤', category: 'communicate', effort: 'low',
    loveLanguages: ['Words of Affirmation', 'Quality Time'], description: 'More personal than text',
    deepLink: (l) => l.phone ? `sms:${l.phone.replace(/\D/g, '')}` : null },
  { id: 'email', label: 'Email', emoji: '✉️', category: 'communicate', effort: 'medium',
    loveLanguages: ['Words of Affirmation'], description: 'Write something thoughtful',
    deepLink: (l) => l.email ? `mailto:${l.email}` : null },
  { id: 'mind-mail', label: 'Mind Mail', emoji: '💌', category: 'communicate', effort: 'low',
    loveLanguages: ['Words of Affirmation'], description: 'Send through InGauge' },
  { id: 'doordash', label: 'Send Food', emoji: '🍕', category: 'gift', effort: 'medium',
    loveLanguages: ['Acts of Service', 'Gifts'], description: 'Surprise them with a meal',
    deepLink: () => 'https://www.doordash.com/gift-cards/' },
  { id: 'ubereats', label: 'Uber Eats', emoji: '🍔', category: 'gift', effort: 'medium',
    loveLanguages: ['Acts of Service', 'Gifts'], description: 'Send food via Uber Eats',
    deepLink: () => 'ubereats://' },
  { id: 'instacart', label: 'Groceries', emoji: '🛒', category: 'gift', effort: 'high',
    loveLanguages: ['Acts of Service'], description: 'Help them with groceries',
    deepLink: () => 'https://www.instacart.com' },
  { id: 'flowers', label: 'Send Flowers', emoji: '💐', category: 'gift', effort: 'medium',
    loveLanguages: ['Gifts'], description: 'Brighten their day',
    deepLink: () => 'https://www.1800flowers.com' },
  { id: 'amazon-gift', label: 'Amazon Gift', emoji: '📦', category: 'gift', effort: 'medium',
    loveLanguages: ['Gifts'], description: 'Send something from their wishlist',
    deepLink: () => 'https://www.amazon.com/gift-cards' },
  { id: 'venmo', label: 'Venmo', emoji: '💸', category: 'gift', effort: 'low',
    loveLanguages: ['Gifts', 'Acts of Service'], description: 'Send coffee money',
    deepLink: () => 'venmo://' },
  { id: 'cashapp', label: 'Cash App', emoji: '💵', category: 'gift', effort: 'low',
    loveLanguages: ['Gifts', 'Acts of Service'], description: 'Send a surprise treat',
    deepLink: () => 'cashapp://' },
  { id: 'schedule-hangout', label: 'Plan Hangout', emoji: '📅', category: 'plan', effort: 'high',
    loveLanguages: ['Quality Time', 'Physical Touch'], description: 'Schedule time together' },
  { id: 'send-meme', label: 'Send Meme', emoji: '😂', category: 'share', effort: 'low',
    loveLanguages: ['Quality Time', 'Words of Affirmation'], description: 'Share something funny',
    deepLink: (l) => l.phone ? `sms:${l.phone.replace(/\D/g, '')}` : null },
  { id: 'share-song', label: 'Share Song', emoji: '🎵', category: 'share', effort: 'low',
    loveLanguages: ['Quality Time', 'Gifts'], description: '"This made me think of you"',
    deepLink: (l) => l.phone ? `sms:${l.phone.replace(/\D/g, '')}` : null },
  { id: 'send-photo', label: 'Send Photo', emoji: '📸', category: 'share', effort: 'low',
    loveLanguages: ['Quality Time'], description: 'Share a memory or moment',
    deepLink: (l) => l.phone ? `sms:${l.phone.replace(/\D/g, '')}` : null },
];

export type MessageContext = 'just-checking-in' | 'been-a-while' | 'they-struggling' | 'celebration' | 'random-love' | 'thinking-of-you' | 'need-to-reconnect' | 'funny';

/** Tone filter for message suggestions: Reconnect, Appreciation, Funny, Deep, Quick */
export type MessageTone = 'Reconnect' | 'Appreciation' | 'Funny' | 'Deep' | 'Quick';

export const MESSAGE_TONE_ORDER: MessageTone[] = ['Reconnect', 'Appreciation', 'Funny', 'Deep', 'Quick'];

const CONTEXT_TO_TONE: Record<MessageContext, MessageTone> = {
  'just-checking-in': 'Quick',
  'been-a-while': 'Reconnect',
  'they-struggling': 'Deep',
  'celebration': 'Quick',
  'random-love': 'Appreciation',
  'thinking-of-you': 'Quick',
  'need-to-reconnect': 'Reconnect',
  'funny': 'Funny',
};

export const EXAMPLE_MESSAGES: { context: MessageContext; messages: string[] }[] = [
  { context: 'just-checking-in', messages: [
    "Hey! Just thinking about you. How's everything going?",
    "Hi! Hope you're having a good week 💛",
    "Hey you! What's new in your world?",
  ]},
  { context: 'been-a-while', messages: [
    "It's been way too long! Miss your face. Coffee soon?",
    "Hey stranger! We need to catch up. When are you free?",
    "Life got crazy but I miss you! Let's not let so much time pass again.",
  ]},
  { context: 'they-struggling', messages: [
    "Hey, just wanted you to know I'm here if you need anything. 💛",
    "Thinking of you. No pressure to respond, just sending love.",
    "You don't have to go through this alone. I'm here.",
  ]},
  { context: 'celebration', messages: [
    "CONGRATS!! So proud of you! 🎉",
    "You did it! I knew you would. Celebrating you today!",
  ]},
  { context: 'random-love', messages: [
    "No reason, just wanted to say you're awesome.",
    "Random appreciation post: you're one of my favorite humans.",
    "Just grateful you're in my life. That's all. 💛",
  ]},
  { context: 'thinking-of-you', messages: [
    "Just saw something and it reminded me of you!",
    "You popped into my head so I had to reach out 💭",
  ]},
  { context: 'funny', messages: [
    "I just thought of the dumbest thing and you're the only one who'd get it.",
    "Sending you this so we can laugh about it later 😂",
    "No context. Just vibes. And you.",
  ]},
];

export function getToneForContext(context: MessageContext): MessageTone {
  return CONTEXT_TO_TONE[context] ?? 'Quick';
}

export function getRecommendedActions(light: Light): ReachOutAction[] {
  const loveLanguage = light.loveLanguage;
  if (loveLanguage) {
    const matched = REACH_OUT_ACTIONS.filter(a => a.loveLanguages.includes(loveLanguage));
    const others = REACH_OUT_ACTIONS.filter(a => !a.loveLanguages.includes(loveLanguage));
    return [...matched, ...others];
  }
  return REACH_OUT_ACTIONS.sort((a, b) => {
    const effortOrder = { low: 0, medium: 1, high: 2 };
    return effortOrder[a.effort] - effortOrder[b.effort];
  });
}

export function getSuggestedMessages(light: Light): { context: MessageContext; message: string }[] {
  const suggestions: { context: MessageContext; message: string }[] = [];

  if (light.temperature === 'cool') {
    const msgs = EXAMPLE_MESSAGES.find(e => e.context === 'they-struggling')!;
    suggestions.push({ context: 'they-struggling', message: msgs.messages[Math.floor(Math.random() * msgs.messages.length)] });
  }

  if (light.daysSinceContact > 30) {
    const msgs = EXAMPLE_MESSAGES.find(e => e.context === 'been-a-while')!;
    suggestions.push({ context: 'been-a-while', message: msgs.messages[Math.floor(Math.random() * msgs.messages.length)] });
  } else if (light.daysSinceContact > 7) {
    const msgs = EXAMPLE_MESSAGES.find(e => e.context === 'just-checking-in')!;
    suggestions.push({ context: 'just-checking-in', message: msgs.messages[Math.floor(Math.random() * msgs.messages.length)] });
  }

  const randomLove = EXAMPLE_MESSAGES.find(e => e.context === 'random-love')!;
  suggestions.push({ context: 'random-love', message: randomLove.messages[Math.floor(Math.random() * randomLove.messages.length)] });

  const funny = EXAMPLE_MESSAGES.find(e => e.context === 'funny')!;
  suggestions.push({ context: 'funny', message: funny.messages[Math.floor(Math.random() * funny.messages.length)] });

  return suggestions.slice(0, 5);
}

export async function executeReachOut(action: ReachOutAction, light: Light, options?: { message?: string }): Promise<boolean> {
  const deepLink = action.deepLink?.(light);
  if (deepLink) {
    try {
      const canOpen = await Linking.canOpenURL(deepLink);
      if (canOpen) {
        await Linking.openURL(deepLink);
        return true;
      }
    } catch (error) {
      console.error('Failed to open link:', error);
    }
  }
  return false;
}

export const LOVE_LANGUAGE_TIPS: Record<string, { actions: string[]; tips: string[] }> = {
  'Words of Affirmation': {
    actions: ['text', 'voice-note', 'mind-mail', 'email'],
    tips: ['Send specific compliments', 'Voice notes feel more personal', 'Written notes they can re-read mean a lot'],
  },
  'Quality Time': {
    actions: ['call', 'video', 'schedule-hangout'],
    tips: ['Put your phone away when together', 'Schedule regular catch-up calls', 'Give undivided attention'],
  },
  'Acts of Service': {
    actions: ['doordash', 'instacart', 'venmo'],
    tips: ['Help without being asked', 'Send food when they\'re stressed', 'Actions speak louder than words'],
  },
  'Gifts': {
    actions: ['flowers', 'amazon-gift', 'doordash', 'venmo'],
    tips: ['It\'s the thought, not the price', 'Surprise gifts on random days mean more'],
  },
  'Physical Touch': {
    actions: ['schedule-hangout', 'video'],
    tips: ['Plan in-person hangouts', 'Hugs hello and goodbye matter'],
  },
};

export function getLoveLanguageTips(loveLanguage: string | undefined) {
  if (!loveLanguage) return null;
  return LOVE_LANGUAGE_TIPS[loveLanguage] || null;
}
