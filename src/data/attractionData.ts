/**
 * Attraction science tool — brain chemistry, stages, factors, types, myths, unhealthy patterns, assessment.
 * Science: Helen Fisher, David Buss, Esther Perel, Attachment Theory.
 */

import type {
  AttractionChemical,
  AttractionStage,
  AttractionFactor,
  AttractionType,
  AttractionMyth,
  UnhealthyPattern,
  AttractionAssessmentQuestion,
} from '../types/attraction';

export const ATTRACTION_CHEMICALS: AttractionChemical[] = [
  { id: 'testosterone-estrogen', emoji: '🔥', name: 'Testosterone / Estrogen', role: 'Lust drivers' },
  { id: 'dopamine', emoji: '✨', name: 'Dopamine', role: "The \"high\" of new love" },
  { id: 'norepinephrine', emoji: '💓', name: 'Norepinephrine', role: 'Racing heart, butterflies' },
  { id: 'serotonin', emoji: '🌀', name: 'Serotonin', role: 'DECREASES = obsessive thinking' },
  { id: 'oxytocin', emoji: '🤗', name: 'Oxytocin', role: 'Bonding hormone' },
  { id: 'vasopressin', emoji: '🔒', name: 'Vasopressin', role: 'Loyalty hormone' },
];

export const ATTRACTION_STAGES: AttractionStage[] = [
  {
    id: 'lust',
    emoji: '🔥',
    label: 'Lust',
    timeframe: 'Days–weeks',
    description: 'Physical desire. Driven by testosterone and estrogen. Gets you in the game.',
  },
  {
    id: 'attraction',
    emoji: '💫',
    label: 'Attraction',
    timeframe: 'Weeks–2 years',
    description: 'The "high" — euphoria, obsession, can\'t eat or sleep. Dopamine and norepinephrine spike; serotonin drops. Your brain on attraction = brain on cocaine + OCD. Literally.',
  },
  {
    id: 'attachment',
    emoji: '🏠',
    label: 'Attachment',
    timeframe: 'Years–lifetime',
    description: 'Calm, secure bonding. Oxytocin and vasopressin. This is the glue that keeps people together long-term.',
  },
];

export const ATTRACTION_FACTORS: AttractionFactor[] = [
  { id: 'proximity', emoji: '📍', label: 'Proximity', description: 'We fall for who\'s nearby.' },
  { id: 'familiarity', emoji: '🔄', label: 'Familiarity', description: 'Repeated exposure = liking.' },
  { id: 'similarity', emoji: '🪞', label: 'Similarity', description: 'NOT opposites. We like people who are like us.' },
  { id: 'reciprocity', emoji: '🔁', label: 'Reciprocity', description: 'We like people who like us.' },
  { id: 'mystery', emoji: '🌙', label: 'Mystery', description: 'Uncertainty intensifies attraction.' },
  { id: 'confidence', emoji: '👑', label: 'Confidence', description: 'Self-assurance is attractive.' },
  { id: 'humor', emoji: '😂', label: 'Humor', description: 'Laughter and play create connection.' },
  { id: 'status', emoji: '🏆', label: 'Status', description: 'Perceived status can influence attraction.' },
  { id: 'warmth', emoji: '☀️', label: 'Warmth', description: 'Kindness and approachability.' },
  { id: 'physical', emoji: '✨', label: 'Physical', description: 'Appearance and chemistry play a role.' },
];

export const ATTRACTION_TYPES: AttractionType[] = [
  { id: 'physical', emoji: '🔥', label: 'Physical / Sexual', description: 'Desire for physical intimacy and touch.' },
  { id: 'romantic', emoji: '💕', label: 'Romantic', description: 'Desire for partnership, dates, romance.' },
  { id: 'emotional', emoji: '💙', label: 'Emotional', description: 'Desire for deep emotional connection and vulnerability.' },
  { id: 'intellectual', emoji: '🧠', label: 'Intellectual', description: 'Desire for mental stimulation and ideas.' },
  { id: 'aesthetic', emoji: '🎨', label: 'Aesthetic', description: 'Appreciation of how someone looks or presents, without sexual pull.' },
];

export const ATTRACTION_MYTHS: AttractionMyth[] = [
  { id: 'opposites', myth: 'Opposites attract.', truth: 'Actually, similarity wins. We tend to pair with people who share values, background, and interests.' },
  { id: 'love-at-first-sight', myth: 'Love at first sight.', truth: 'That\'s lust + idealization. Real love builds over time with knowledge and choice.' },
  { id: 'the-one', myth: 'The One exists.', truth: 'Many compatible partners exist. Love is built, not found.' },
  { id: 'chemistry-forever', myth: 'If the spark fades, the relationship is dead.', truth: 'The high of early attraction naturally calms. Attachment is different — and sustainable.' },
  { id: 'true-love-easy', myth: 'True love should be easy.', truth: 'All relationships take work. Ease isn\'t the measure of real love.' },
  { id: 'soulmate-no-conflict', myth: 'Soulmates don\'t fight.', truth: 'Conflict is normal. Repair and respect matter more than no conflict.' },
  { id: 'jealousy-love', myth: 'Jealousy means they love you.', truth: 'Jealousy is often insecurity or control. Love feels safe, not possessive.' },
  { id: 'fix-them', myth: 'I can change them / fix them.', truth: 'People change only if they want to. Attraction to \"potential\" often leads to resentment.' },
];

export const UNHEALTHY_PATTERNS: UnhealthyPattern[] = [
  {
    id: 'anxious-avoidant',
    emoji: '🔄',
    label: 'Anxious–Avoidant Trap',
    description: 'The \"spark\" is often anxiety. Anxious folks chase; avoidant folks need space. The push-pull feels like passion but is dysregulation.',
    insight: 'If you feel most alive when they\'re hot-and-cold, ask: Am I in love with the person or the uncertainty?',
  },
  {
    id: 'trauma-bonding',
    emoji: '⛓️',
    label: 'Trauma Bonding',
    description: 'Pain + relief = false attachment. Abuse or chaos followed by kindness creates a powerful (unhealthy) bond.',
    insight: 'The highs feel higher because the lows are so low. That\'s not love — it\'s addiction to the cycle.',
  },
  {
    id: 'intensity-seeking',
    emoji: '⚡',
    label: 'Intensity Seeking',
    description: 'Drama mistaken for passion. Constant fighting, makeups, and big gestures feel like \"real love\" but burn out fast.',
    insight: 'Calm doesn\'t mean boring. Secure love can feel \"too quiet\" if you\'re used to chaos.',
  },
  {
    id: 'savior-project',
    emoji: '🦸',
    label: 'Savior / Project',
    description: 'Attracted to \"fixing\" someone or being needed. You fall for their potential or their need for you.',
    insight: 'You can\'t love someone into changing. And you deserve a partner, not a project.',
  },
];

export const ATTRACTION_ASSESSMENT_QUESTIONS: AttractionAssessmentQuestion[] = [
  { id: 'aq1', text: 'I often feel most attracted when the other person is a bit hard to get.', dimension: 'anxious' },
  { id: 'aq2', text: 'When someone gets too close or wants more commitment, I feel like pulling away.', dimension: 'avoidant' },
  { id: 'aq3', text: 'I can enjoy a relationship that\'s stable and calm without needing drama.', dimension: 'healthy' },
  { id: 'aq4', text: 'Big emotional ups and downs make me feel more alive in a relationship.', dimension: 'intensity' },
  { id: 'aq5', text: 'I worry a lot about whether they really love me or will leave.', dimension: 'anxious' },
  { id: 'aq6', text: 'I prefer keeping some distance; too much closeness feels smothering.', dimension: 'avoidant' },
  { id: 'aq7', text: 'I\'m okay with my partner having their own life and friends.', dimension: 'healthy' },
  { id: 'aq8', text: 'I\'m drawn to people who need rescuing or who have a lot of problems.', dimension: 'intensity' },
  { id: 'aq9', text: 'I tend to idealize new partners and then feel let down later.', dimension: 'anxious' },
  { id: 'aq10', text: 'I get uncomfortable when a partner wants to define the relationship or talk about the future.', dimension: 'avoidant' },
  { id: 'aq11', text: 'I believe a good relationship can feel secure and still be exciting.', dimension: 'healthy' },
  { id: 'aq12', text: 'If there\'s no conflict or tension, I wonder if the relationship is \"real.\"', dimension: 'intensity' },
];
