/**
 * Question Bank — Varied questions to prevent habituation
 * 
 * Each gauge has multiple ways of asking the same thing.
 * Rotates based on day, time, or random selection.
 * Same data, different doorways.
 */

import type { GaugeName } from './types';
import { COLORS } from '../../lib/constants';

// ═══════════════════════════════════════════════════════════════
// BODY — Interoceptive check (always first)
// ═══════════════════════════════════════════════════════════════

export const BODY_QUESTIONS = {
  gauge: 'body' as GaugeName,
  color: COLORS.gauges.body,
  emoji: '🫀',
  
  variants: [
    // Variant 0: Basic needs checklist
    {
      id: 'needs",
      question: \"Let's check your body"s basics",
      type: 'checklist' as const,
      items: [
        { id: 'sleep', label: 'Slept okay', emoji: '😴' },
        { id: 'food', label: 'Eaten something', emoji: '🍽️' },
        { id: 'water', label: 'Had water', emoji: '💧' },
        { id: 'move', label: 'Moved around', emoji: '🚶' },
      ],
      calculate: (checked: string[]) => checked.length * 25,
    },
    // Variant 1: Physical sensations
    {
      id: 'sensations",
      question: \"What's your body telling you?\",
      type: "multi' as const,
      options: [
        { id: 'energized', label: 'Energized', emoji: '⚡', valence: 'positive' },
        { id: 'rested', label: 'Rested', emoji: '😌', valence: 'positive' },
        { id: 'comfortable', label: 'Comfortable', emoji: '🛋️', valence: 'positive' },
        { id: 'tired', label: 'Tired', emoji: '🥱', valence: 'negative' },
        { id: 'tense', label: 'Tense', emoji: '😬', valence: 'negative' },
        { id: 'hungry', label: 'Hungry', emoji: '🍴', valence: 'negative' },
        { id: 'achy', label: 'Achy', emoji: '🤕', valence: 'negative' },
        { id: 'restless', label: 'Restless', emoji: '😣', valence: 'negative' },
      ],
      calculate: (selected: string[], options: any[]) => {
        if (selected.length === 0) return 50;
        const positive = selected.filter(s => 
          options.find(o => o.id === s)?.valence === 'positive'
        ).length;
        const negative = selected.filter(s => 
          options.find(o => o.id === s)?.valence === 'negative'
        ).length;
        return Math.max(10, Math.min(100, 50 + (positive * 20) - (negative * 15)));
      },
    },
    // Variant 2: Simple scale with body focus
    {
      id: 'scale',
      question: 'How does your body feel right now?',
      type: 'single' as const,
      options: [
        { id: 'great', label: 'Great', emoji: '💪', value: 100, desc: 'Energized, comfortable, fueled' },
        { id: 'good', label: 'Good', emoji: '👍', value: 75, desc: 'Mostly okay, minor things' },
        { id: 'meh', label: 'Meh', emoji: '😐', value: 50, desc: 'Not great, not terrible' },
        { id: 'rough', label: 'Rough', emoji: '😮‍💨', value: 25, desc: 'Tired, hungry, or uncomfortable' },
        { id: 'depleted', label: 'Depleted', emoji: '🪫', value: 10, desc: 'Running on empty' },
      ],
    },
    // Variant 3: Quick visual (for micro check-ins)
    {
      id: 'quick',
      question: 'Body check',
      type: 'single' as const,
      options: [
        { id: '5', label: '', emoji: '💪', value: 100 },
        { id: '4', label: '', emoji: '🙂', value: 75 },
        { id: '3', label: '', emoji: '😐', value: 50 },
        { id: '2', label: '', emoji: '😮‍💨', value: 25 },
        { id: '1', label: '', emoji: '🪫', value: 10 },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// STATE — Nervous system regulation
// ═══════════════════════════════════════════════════════════════

export const STATE_QUESTIONS = {
  gauge: 'state' as GaugeName,
  color: COLORS.gauges.state,
  emoji: '🌊',
  
  variants: [
    // Variant 0: Regulation language
    {
      id: 'regulated',
      question: 'How regulated do you feel?',
      type: 'single' as const,
      options: [
        { id: 'calm', label: 'Calm', emoji: '😌', value: 100, desc: 'Clear thinking. Grounded.' },
        { id: 'alert', label: 'Alert', emoji: '👀', value: 75, desc: 'Focused and responsive.' },
        { id: 'activated', label: 'Activated', emoji: '😤', value: 50, desc: 'Heart rate up. On edge.' },
        { id: 'threatened', label: 'Threatened', emoji: '😰', value: 25, desc: 'Fight/flight/freeze mode.' },
        { id: 'shutdown', label: 'Shutdown', emoji: '😶', value: 10, desc: 'Numb or frozen.' },
      ],
    },
    // Variant 1: Nervous system frame
    {
      id: 'nervous",
      question: \"Where's your nervous system?\",
      type: "single' as const,
      options: [
        { id: 'ventral', label: 'Safe & Social', emoji: '🤗', value: 100, desc: 'Connected, open, calm' },
        { id: 'alert', label: 'Alert', emoji: '🦒', value: 75, desc: 'Scanning, ready, watchful' },
        { id: 'sympathetic', label: 'Fight or Flight', emoji: '🐆', value: 50, desc: 'Activated, tense, reactive' },
        { id: 'freeze', label: 'Freeze', emoji: '🦌', value: 25, desc: 'Stuck, can\'t move forward' },
        { id: 'dorsal', label: 'Collapsed', emoji: '🐢', value: 10, desc: 'Shutdown, withdrawn, numb' },
      ],
    },
    // Variant 2: Chaos-calm spectrum
    {
      id: 'spectrum',
      question: 'Chaos to calm — where are you?',
      type: 'single' as const,
      options: [
        { id: '5', label: 'Total calm', emoji: '🧘', value: 100, desc: '' },
        { id: '4', label: 'Mostly calm', emoji: '😌', value: 75, desc: '' },
        { id: '3', label: 'Mixed', emoji: '🌀', value: 50, desc: '' },
        { id: '2', label: 'Mostly chaos', emoji: '😵', value: 25, desc: '' },
        { id: '1', label: 'Total chaos', emoji: '🌪️', value: 10, desc: '' },
      ],
    },
    // Variant 3: Visual only (micro)
    {
      id: 'quick',
      question: 'State',
      type: 'single' as const,
      options: [
        { id: '5', label: '', emoji: '😌', value: 100 },
        { id: '4', label: '', emoji: '👀', value: 75 },
        { id: '3', label: '', emoji: '😤', value: 50 },
        { id: '2', label: '', emoji: '😰', value: 25 },
        { id: '1', label: '', emoji: '😶", value: 10 },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// EMOTION — What you're feeling
// ═══════════════════════════════════════════════════════════════

export const EMOTION_QUESTIONS = {
  gauge: "emotion' as GaugeName,
  color: COLORS.gauges.emotion,
  emoji: '💫',
  
  variants: [
    // Variant 0: Core emotions multi-select
    {
      id: 'core',
      question: "What emotions are present?",
      subtext: 'Pick all that apply',
      type: 'multi' as const,
      options: [
        { id: 'calm', label: 'Calm', emoji: '😌', valence: 'positive' },
        { id: 'happy', label: 'Happy', emoji: '😊', valence: 'positive' },
        { id: 'grateful', label: 'Grateful', emoji: '🙏', valence: 'positive' },
        { id: 'hopeful', label: 'Hopeful', emoji: '🌟', valence: 'positive' },
        { id: 'sad', label: 'Sad', emoji: '😢', valence: 'negative' },
        { id: 'anxious', label: 'Anxious', emoji: '😰', valence: 'negative' },
        { id: 'angry', label: 'Angry', emoji: '😠', valence: 'negative' },
        { id: 'overwhelmed', label: 'Overwhelmed', emoji: '🤯', valence: 'negative' },
        { id: 'numb', label: 'Numb', emoji: '😶', valence: 'neutral' },
        { id: 'confused', label: 'Confused', emoji: '😕', valence: 'neutral' },
      ],
      calculate: (selected: string[], options: any[]) => {
        if (selected.length === 0) return 50;
        if (selected.includes('numb')) return 30;
        const positive = selected.filter(s => 
          options.find(o => o.id === s)?.valence === 'positive'
        ).length;
        const negative = selected.filter(s => 
          options.find(o => o.id === s)?.valence === 'negative'
        ).length;
        if (negative > positive) return Math.max(20, 50 - (negative * 12));
        if (positive > negative) return Math.min(100, 50 + (positive * 15));
        return 50;
      },
    },
    // Variant 1: Emotional weather
    {
      id: 'weather',
      question: "If your emotions were weather, what would it be?",
      type: 'single' as const,
      options: [
        { id: 'sunny', label: 'Sunny', emoji: '☀️', value: 100, desc: 'Clear and bright' },
        { id: 'partly', label: 'Partly cloudy', emoji: '⛅', value: 75, desc: 'Mostly good, some clouds' },
        { id: 'cloudy', label: 'Cloudy', emoji: '☁️', value: 50, desc: 'Overcast, waiting' },
        { id: 'rainy', label: 'Rainy', emoji: '🌧️', value: 30, desc: 'Sad, heavy' },
        { id: 'stormy', label: 'Stormy', emoji: '⛈️', value: 15, desc: 'Turbulent, intense' },
      ],
    },
    // Variant 2: Simple scale
    {
      id: 'scale',
      question: 'Emotionally, how are you doing?',
      type: 'single' as const,
      options: [
        { id: 'great', label: 'Really good', emoji: '😊', value: 100, desc: 'Positive, balanced' },
        { id: 'good', label: 'Pretty good', emoji: '🙂', value: 75, desc: 'More good than bad' },
        { id: 'okay', label: 'Okay', emoji: '😐', value: 50, desc: 'Neutral, mixed' },
        { id: 'rough', label: 'Struggling', emoji: '😔', value: 30, desc: 'More hard than easy' },
        { id: 'bad', label: 'Really hard', emoji: '😢', value: 15, desc: 'Hurting' },
      ],
    },
    // Variant 3: Quick visual (micro)
    {
      id: 'quick',
      question: 'Emotion',
      type: 'single' as const,
      options: [
        { id: '5', label: '', emoji: '😊', value: 100 },
        { id: '4', label: '', emoji: '🙂', value: 75 },
        { id: '3', label: '', emoji: '😐', value: 50 },
        { id: '2', label: '', emoji: '😔', value: 30 },
        { id: '1', label: '', emoji: '😢', value: 15 },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// CONNECTION — Relational state
// ═══════════════════════════════════════════════════════════════

export const CONNECTION_QUESTIONS = {
  gauge: 'connection' as GaugeName,
  color: COLORS.gauges.connection,
  emoji: '🤝',
  
  variants: [
    // Variant 0: Relationship energy
    {
      id: 'energy',
      question: 'How connected do you feel to others?',
      type: 'single' as const,
      options: [
        { id: 'deep', label: 'Deeply connected', emoji: '🤗', value: 100, desc: 'Close to people who matter' },
        { id: 'good', label: 'Well connected', emoji: '😊', value: 75, desc: 'Good relationships, present' },
        { id: 'some', label: 'Somewhat connected', emoji: '🙂', value: 50, desc: 'Some connection, could be more' },
        { id: 'isolated', label: 'A bit isolated', emoji: '😕', value: 30, desc: 'Missing connection' },
        { id: 'alone', label: 'Very alone', emoji: '🏝️', value: 10, desc: 'Lonely, disconnected' },
      ],
    },
    // Variant 1: Social battery
    {
      id: 'battery',
      question: "How's your social battery?",
      type: 'single' as const,
      options: [
        { id: 'full', label: 'Fully charged', emoji: '🔋', value: 100, desc: 'Ready for people' },
        { id: 'good', label: 'Good charge', emoji: '🔋', value: 75, desc: 'Energy for connection' },
        { id: 'mid', label: 'Half charged', emoji: '🪫', value: 50, desc: 'Some capacity' },
        { id: 'low', label: 'Running low', emoji: '🪫', value: 30, desc: 'Need recharge' },
        { id: 'empty', label: 'Empty', emoji: '🔌', value: 10, desc: 'Tapped out' },
      ],
    },
    // Variant 2: Belonging
    {
      id: 'belonging',
      question: 'Do you feel like you belong somewhere?',
      type: 'single' as const,
      options: [
        { id: 'yes', label: 'Definitely', emoji: '🏠', value: 100, desc: 'Strong sense of belonging' },
        { id: 'mostly', label: 'Mostly', emoji: '🚪', value: 75, desc: 'Usually feel I belong' },
        { id: 'sometimes', label: 'Sometimes', emoji: '🤔', value: 50, desc: 'Depends on context' },
        { id: 'rarely', label: 'Rarely', emoji: '😔', value: 30, desc: 'Often feel like an outsider' },
        { id: 'no', label: 'Not really', emoji: '🌑', value: 10, desc: 'Don\'t belong anywhere' },
      ],
    },
    // Variant 3: Quick (micro)
    {
      id: 'quick',
      question: 'Connection',
      type: 'single' as const,
      options: [
        { id: '5', label: '', emoji: '🤗', value: 100 },
        { id: '4', label: '', emoji: '😊', value: 75 },
        { id: '3', label: '', emoji: '🙂', value: 50 },
        { id: '2', label: '', emoji: '😕', value: 30 },
        { id: '1', label: '', emoji: '🏝️', value: 10 },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// DIRECTION — Sense of purpose
// ═══════════════════════════════════════════════════════════════

export const DIRECTION_QUESTIONS = {
  gauge: 'direction' as GaugeName,
  color: COLORS.gauges.direction,
  emoji: '🧭',
  
  variants: [
    // Variant 0: Purpose clarity
    {
      id: 'purpose',
      question: 'How clear is your sense of direction?',
      type: 'single' as const,
      options: [
        { id: 'clear', label: 'Crystal clear', emoji: '🎯', value: 100, desc: 'Know exactly where I\'m going' },
        { id: 'mostly', label: 'Mostly clear', emoji: '🧭', value: 75, desc: 'General direction, some fog' },
        { id: 'hazy', label: 'A bit hazy', emoji: '🌫️', value: 50, desc: 'Uncertain about the path' },
        { id: 'lost', label: 'Feeling lost', emoji: '😵‍💫', value: 25, desc: 'No sense of direction' },
        { id: 'stuck', label: 'Completely stuck', emoji: '🛑', value: 10, desc: 'Can\'t see any path forward' },
      ],
    },
    // Variant 1: Momentum
    {
      id: 'momentum',
      question: 'Do you feel like you\'re moving forward?',
      type: 'single' as const,
      options: [
        { id: 'flying', label: 'Yes, making progress', emoji: '🚀', value: 100, desc: 'Real momentum' },
        { id: 'walking', label: 'Yes, slowly', emoji: '🚶', value: 75, desc: 'Moving, not fast' },
        { id: 'standing', label: 'Standing still', emoji: '🧍', value: 50, desc: 'Not moving but not stuck' },
        { id: 'slipping', label: 'Sliding backward', emoji: '📉', value: 25, desc: 'Losing ground' },
        { id: 'stuck', label: 'Totally stuck', emoji: '🪨', value: 10, desc: 'Can\'t move at all' },
      ],
    },
    // Variant 2: Meaning
    {
      id: 'meaning',
      question: 'Does what you\'re doing feel meaningful?',
      type: 'single' as const,
      options: [
        { id: 'very', label: 'Very meaningful', emoji: '✨', value: 100, desc: 'Deep sense of purpose' },
        { id: 'mostly', label: 'Mostly meaningful', emoji: '🌟', value: 75, desc: 'Purpose with some routine' },
        { id: 'some', label: 'Somewhat', emoji: '💫', value: 50, desc: 'Some meaning, some emptiness' },
        { id: 'little', label: 'Not much', emoji: '😕', value: 25, desc: 'Going through motions' },
        { id: 'none', label: 'Not at all', emoji: '🕳️', value: 10, desc: 'Everything feels pointless' },
      ],
    },
    // Variant 3: Quick (micro)
    {
      id: 'quick',
      question: 'Direction',
      type: 'single' as const,
      options: [
        { id: '5', label: '', emoji: '🎯', value: 100 },
        { id: '4', label: '', emoji: '🧭', value: 75 },
        { id: '3', label: '', emoji: '🌫️', value: 50 },
        { id: '2', label: '', emoji: '😵‍💫', value: 25 },
        { id: '1', label: '', emoji: '🛑', value: 10 },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// ALIGNMENT — Living your values
// ═══════════════════════════════════════════════════════════════

export const ALIGNMENT_QUESTIONS = {
  gauge: 'alignment' as GaugeName,
  color: COLORS.gauges.alignment,
  emoji: '⭐',
  
  variants: [
    // Variant 0: Values alignment
    {
      id: 'values',
      question: 'Are you living in alignment with your values?',
      type: 'single' as const,
      options: [
        { id: 'fully', label: 'Fully aligned', emoji: '⭐', value: 100, desc: 'Living my truth' },
        { id: 'mostly', label: 'Mostly aligned', emoji: '✨', value: 75, desc: 'Some compromises but okay' },
        { id: 'drifting', label: 'Drifting a bit', emoji: '🌊', value: 50, desc: 'Not quite myself lately' },
        { id: 'off', label: 'Off track', emoji: '😣', value: 25, desc: 'Choices don\'t match values' },
        { id: 'betraying', label: 'Betraying myself', emoji: '💔', value: 10, desc: 'Acting against who I am' },
      ],
    },
    // Variant 1: Integrity
    {
      id: 'integrity',
      question: 'How integrated do you feel?',
      subtext: '(Whole, not fragmented)',
      type: 'single' as const,
      options: [
        { id: 'whole', label: 'Very whole', emoji: '🔮', value: 100, desc: 'All parts aligned' },
        { id: 'mostly', label: 'Mostly whole', emoji: '💎', value: 75, desc: 'Minor inconsistencies' },
        { id: 'mixed', label: 'A bit fragmented', emoji: '🧩', value: 50, desc: 'Parts pulling different ways' },
        { id: 'split', label: 'Pretty split', emoji: '💔', value: 25, desc: 'Internal conflict' },
        { id: 'shattered', label: 'Scattered', emoji: '🪨', value: 10, desc: 'No coherent sense of self' },
      ],
    },
    // Variant 2: Authentic
    {
      id: 'authentic',
      question: 'Are you being your authentic self?',
      type: 'single' as const,
      options: [
        { id: 'yes', label: 'Completely', emoji: '🌟', value: 100, desc: 'Fully myself' },
        { id: 'mostly', label: 'Mostly', emoji: '😊', value: 75, desc: 'Real in most situations' },
        { id: 'sometimes', label: 'Sometimes', emoji: '🎭', value: 50, desc: 'Depends on context' },
        { id: 'rarely', label: 'Rarely', emoji: '😔', value: 25, desc: 'Often wearing masks' },
        { id: 'never', label: 'Not at all', emoji: '👻', value: 10, desc: 'Lost touch with real self' },
      ],
    },
    // Variant 3: Quick (micro)
    {
      id: 'quick',
      question: 'Alignment',
      type: 'single' as const,
      options: [
        { id: '5', label: '', emoji: '⭐', value: 100 },
        { id: '4', label: '', emoji: '✨', value: 75 },
        { id: '3', label: '', emoji: '🌊', value: 50 },
        { id: '2', label: '', emoji: '😣', value: 25 },
        { id: '1', label: '', emoji: '💔', value: 10 },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// QUESTION SELECTOR
// ═══════════════════════════════════════════════════════════════

export const ALL_GAUGES = {
  body: BODY_QUESTIONS,
  state: STATE_QUESTIONS,
  emotion: EMOTION_QUESTIONS,
  connection: CONNECTION_QUESTIONS,
  direction: DIRECTION_QUESTIONS,
  alignment: ALIGNMENT_QUESTIONS,
};

/**
 * Get a question variant based on day/time
 * Rotates to prevent habituation
 */
export function getVariantIndex(
  level: 'micro' | 'quick' | 'deep',
  seed?: number
): number {
  // Micro always uses the quick variant (index 3)
  if (level === 'micro') return 3;
  
  // Quick and Deep rotate through 0-2
  const baseSeed = seed ?? new Date().getDate();
  return baseSeed % 3;
}

/**
 * Get the gauge order for a check-in
 * Always body-first (interoception principle)
 */
export const GAUGE_ORDER: GaugeName[] = [
  'body',      // Always first - interoception grounds everything
  'state',     // Nervous system next
  'emotion',   // Then emotional awareness
  'connection', // Relational
  'direction',  // Purpose
  'alignment',  // Values
];
