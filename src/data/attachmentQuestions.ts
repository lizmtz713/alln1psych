/**
 * Attachment style assessment — 12 questions (6 anxiety, 6 avoidance).
 * Inspired by ECR-R; maps to Bartholomew & Horowitz (1991) four-category model.
 */

import type { AttachmentQuestion, AttachmentStyleInfo } from '../types/attachment';

export const ATTACHMENT_QUESTIONS: AttachmentQuestion[] = [
  { id: 'a1', dimension: 'anxiety', text: 'I worry about being abandoned by people I care about.', reverseScored: false },
  { id: 'a2', dimension: 'anxiety', text: 'I often wish that others would show their feelings more clearly.', reverseScored: false },
  { id: 'a3', dimension: 'anxiety', text: 'I find that others don\'t want to get as close as I would like.', reverseScored: false },
  { id: 'a4', dimension: 'anxiety', text: 'I worry that people I care about will leave me.', reverseScored: false },
  { id: 'a5', dimension: 'anxiety', text: 'I need a lot of reassurance that I am loved.', reverseScored: false },
  { id: 'a6', dimension: 'anxiety', text: 'I get frustrated when others are not available when I need them.', reverseScored: false },
  { id: 'v1', dimension: 'avoidance', text: 'I prefer not to show others how I feel deep down.', reverseScored: false },
  { id: 'v2', dimension: 'avoidance', text: 'I feel comfortable depending on others.', reverseScored: true },
  { id: 'v3', dimension: 'avoidance', text: 'I find it difficult to allow myself to rely on others.', reverseScored: false },
  { id: 'v4', dimension: 'avoidance', text: 'I am comfortable sharing my feelings with close others.', reverseScored: true },
  { id: 'v5', dimension: 'avoidance', text: 'I get uncomfortable when a partner wants to be very close.', reverseScored: false },
  { id: 'v6', dimension: 'avoidance', text: 'I prefer to keep a bit of distance in close relationships.', reverseScored: false },
];

export const ATTACHMENT_STYLE_INFO: Record<string, AttachmentStyleInfo> = {
  secure: {
    style: 'secure',
    label: 'Secure',
    emoji: '🌳',
    shortDescription: 'Comfortable with closeness and independence.',
    insight: 'You tend to feel worthy of love and trust that others are generally reliable. You can be close without losing yourself and give space without feeling rejected.',
    strengths: ['Balance of intimacy and independence', 'Generally trusting and open to connection', 'Able to communicate needs and boundaries', 'Resilient in conflict; can repair and reconnect'],
    growthTips: ['Keep nurturing your relationships and your own interests.', 'Your style is a strength — use it to model secure behavior for others when you can.'],
  },
  anxious: {
    style: 'anxious',
    label: 'Anxious',
    emoji: '🌊',
    shortDescription: 'Strong need for closeness; worry about rejection.',
    insight: 'You value connection deeply and may notice when others pull away. You might sometimes need more reassurance than partners give. This style often comes from inconsistent care early on.',
    strengths: ['High attunement to relationship dynamics', 'Strong capacity for emotional expression', 'Often very loyal and invested', 'Can be deeply empathetic and caring'],
    growthTips: ['Practice self-soothing when you feel abandoned or unheard.', 'Share your needs clearly instead of testing or pursuing.', 'Notice when you\'re seeking reassurance from someone who can\'t give it.'],
  },
  avoidant: {
    style: 'avoidant',
    label: 'Avoidant',
    emoji: '🏔️',
    shortDescription: 'Comfortable with independence; closeness can feel overwhelming.',
    insight: 'You may value self-reliance and find too much closeness or dependency uncomfortable. You might have learned that relying on others was unsafe. This isn\'t a flaw — it\'s a strategy that once helped.',
    strengths: ['Strong self-reliance and problem-solving', 'Comfort with solitude and boundaries', 'Often calm under relationship stress', 'Can give partners space without anxiety'],
    growthTips: ['Small steps toward vulnerability — share one feeling or need with someone safe.', 'Notice if you pull away when things get close.', 'Partners may need more verbal reassurance than you do.'],
  },
  fearful: {
    style: 'fearful',
    label: 'Fearful',
    emoji: '🌪️',
    shortDescription: 'Want closeness but fear it; mixed push-pull.',
    insight: 'You may want deep connection but also find it scary or unsafe. You might worry both about being abandoned and about being hurt if you get too close. Awareness is the first step.',
    strengths: ['You understand both the desire for and fear of connection', 'Often insightful about relationship patterns', 'Can be very caring when you feel safe enough', 'Growth often means building safety slowly'],
    growthTips: ['Therapy or a safe person can help you build "earned security" over time.', 'Identify one or two people you can practice trusting in small ways.', 'Notice the push-pull: when you want to get close, what happens?'],
  },
};
