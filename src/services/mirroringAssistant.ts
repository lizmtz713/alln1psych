/**
 * Mirroring Assistant — Active Constructive Responding
 * 
 * Based on Shelly Gable's research on capitalization and 
 * Active Constructive Responding (ACR).
 * 
 * Philosophy:
 * - How you respond to good news matters MORE than how you respond to bad news
 * - Enthusiastic engagement builds intimacy and trust
 * - Validation before solutions for struggles
 * - "Tell me more" > "Here's what you should do"
 */

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type MessageType = 'good-news' | 'struggle' | 'neutral' | 'request';

export interface ResponseSuggestion {
  id: string;
  text: string;
  style: 'active-constructive' | 'supportive' | 'curious';
  emoji?: string;
}

export interface MirroringContext {
  memberName: string;
  relationship?: string;
  temperature?: 'green' | 'yellow' | 'orange' | 'red';
  temperatureLabel?: string;
}

export interface MirroringResult {
  messageType: MessageType;
  suggestions: ResponseSuggestion[];
  scienceNote: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Response Style Research
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The 4 response styles (Shelly Gable's research):
 * 
 * Active Constructive (best): Enthusiastic, asks questions, celebrates
 *   - "That's amazing! Tell me everything!"
 * 
 * Passive Constructive: Acknowledges but doesn't engage
 *   - "That's nice" (then changes subject)
 * 
 * Active Destructive: Points out problems
 *   - "That's going to be a lot of work"
 * 
 * Passive Destructive: Ignores or dismisses
 *   - "What's for dinner?"
 * 
 * Only Active Constructive builds relationships.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Message Type Detection
// ═══════════════════════════════════════════════════════════════════════════

const GOOD_NEWS_INDICATORS = [
  'got', 'won', 'passed', 'promoted', 'accepted',
  'engaged', 'pregnant', 'new job', 'raise', 'achievement',
  'accomplished', 'finished', 'completed', 'did it', 'made it',
  'feeling great', 'amazing day', 'best day', 'excited',
  'happy', 'proud', 'succeeded', 'bought', 'moved',
  'graduated', 'published', 'launched', 'started',
  'good news', 'great news', 'guess what', '🎉', '🥳', '🎊',
  'finally', 'i did', 'we did', 'so happy', 'so excited',
];

const STRUGGLE_INDICATORS = [
  'stressed', 'anxious', 'overwhelmed', 'struggling',
  'hard time', 'difficult', 'exhausted', 'burned out',
  'sad', 'depressed', 'lonely', 'frustrated', 'angry',
  'hurt', 'scared', 'worried', 'nervous', 'failed',
  'lost', 'rejected', 'broke up', 'fight', 'argument',
  'sick', 'tired', 'rough day', 'bad day', 'tough',
  "can't", "won't", "don't know", 'help', 'crying',
  '😢', '😔', '😞', '💔', '😰', '😤', '😣',
  'ugh', 'sigh', 'hate', 'awful', 'terrible',
];

const REQUEST_INDICATORS = [
  'can you', 'could you', 'would you', 'help me',
  'need you to', 'want you to', 'please', 'wondering if',
  'mind if', 'able to', 'available', 'free to',
  '?', 'what do you think', 'your opinion', 'advice',
];

/**
 * Identify what type of message someone shared
 */
export function identifyMessageType(message: string): MessageType {
  if (!message || message.trim().length === 0) {
    return 'neutral';
  }

  const lower = message.toLowerCase();

  // Check for requests first (they often contain question marks)
  const requestScore = REQUEST_INDICATORS.filter(i => lower.includes(i)).length;
  if (requestScore >= 2 || (requestScore >= 1 && lower.includes('?'))) {
    return 'request';
  }

  // Score for good news vs struggle
  const goodNewsScore = GOOD_NEWS_INDICATORS.filter(i => lower.includes(i)).length;
  const struggleScore = STRUGGLE_INDICATORS.filter(i => lower.includes(i)).length;

  if (goodNewsScore > struggleScore && goodNewsScore >= 1) {
    return 'good-news';
  }

  if (struggleScore > goodNewsScore && struggleScore >= 1) {
    return 'struggle';
  }

  // If scores are equal and both present, look at sentiment
  if (goodNewsScore > 0 && struggleScore > 0) {
    // Check for negation patterns that flip meaning
    const negations = ['not', "n't", 'no longer', 'finally over', 'done with'];
    const hasNegation = negations.some(n => lower.includes(n));
    if (hasNegation && struggleScore >= goodNewsScore) {
      return 'good-news'; // "not stressed anymore" = good news
    }
    return struggleScore > goodNewsScore ? 'struggle' : 'good-news';
  }

  return 'neutral';
}

/**
 * Identify message type from temperature alone (when no message)
 */
export function identifyTypeFromTemperature(
  temperature: 'green' | 'yellow' | 'orange' | 'red',
  temperatureLabel?: string
): MessageType {
  const label = temperatureLabel?.toLowerCase() || '';

  // High energy positive states
  if (temperature === 'green') {
    if (label.includes('thriving') || label.includes('great') || label.includes('amazing')) {
      return 'good-news';
    }
    return 'neutral';
  }

  // Struggling states
  if (temperature === 'red') {
    return 'struggle';
  }

  if (temperature === 'orange') {
    return 'struggle';
  }

  // Yellow could be either
  if (temperature === 'yellow') {
    if (label.includes('stress') || label.includes('tough') || label.includes('hard')) {
      return 'struggle';
    }
    return 'neutral';
  }

  return 'neutral';
}

// ═══════════════════════════════════════════════════════════════════════════
// Active Constructive Responses (for good news)
// ═══════════════════════════════════════════════════════════════════════════

const ACTIVE_CONSTRUCTIVE_TEMPLATES = [
  {
    id: 'ac-1',
    text: "That's amazing! How did you pull that off?",
    emoji: '🎉',
  },
  {
    id: 'ac-2',
    text: "I'm so happy for you! Tell me everything!",
    emoji: '💜',
  },
  {
    id: 'ac-3',
    text: "Wow! How does it feel?",
    emoji: '✨',
  },
  {
    id: 'ac-4',
    text: "That's huge! What was the best part?",
    emoji: '🌟',
  },
  {
    id: 'ac-5',
    text: "I knew you could do it! What's next?",
    emoji: '🚀',
  },
  {
    id: 'ac-6',
    text: "That's wonderful news! I want to hear all the details!",
    emoji: '😊',
  },
  {
    id: 'ac-7',
    text: "Yes!! How are you celebrating?",
    emoji: '🥳',
  },
  {
    id: 'ac-8',
    text: "So proud of you! What made it happen?",
    emoji: '💪',
  },
];

/**
 * Generate Active Constructive responses for good news
 * 
 * Key elements:
 * 1. Enthusiasm (not just acknowledgment)
 * 2. Questions that invite elaboration
 * 3. Focus on their experience, not yours
 */
export function generateActiveConstructiveResponse(
  theirMessage: string,
  context: MirroringContext
): ResponseSuggestion[] {
  const suggestions: ResponseSuggestion[] = [];
  const name = context.memberName;

  // Shuffle and pick 3 templates
  const shuffled = [...ACTIVE_CONSTRUCTIVE_TEMPLATES]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  for (const template of shuffled) {
    suggestions.push({
      id: template.id,
      text: template.text,
      style: 'active-constructive',
      emoji: template.emoji,
    });
  }

  // Add a personalized one if we have relationship context
  if (context.relationship) {
    const personalized = generatePersonalizedACR(context);
    if (personalized) {
      suggestions.unshift(personalized);
      suggestions.pop(); // Keep to 3
    }
  }

  return suggestions;
}

function generatePersonalizedACR(context: MirroringContext): ResponseSuggestion | null {
  const relationship = context.relationship?.toLowerCase();
  const name = context.memberName;

  if (relationship?.includes('partner') || relationship?.includes('spouse')) {
    return {
      id: 'ac-personal-partner',
      text: `This makes me so happy! Let's celebrate tonight?`,
      style: 'active-constructive',
      emoji: '💕',
    };
  }

  if (relationship?.includes('parent') || relationship?.includes('mom') || relationship?.includes('dad')) {
    return {
      id: 'ac-personal-parent',
      text: `That's wonderful! I'm so proud of you. Tell me more!`,
      style: 'active-constructive',
      emoji: '💜',
    };
  }

  if (relationship?.includes('friend')) {
    return {
      id: 'ac-personal-friend',
      text: `YESS! We need to celebrate! When can we hang?`,
      style: 'active-constructive',
      emoji: '🎊',
    };
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Supportive Responses (for struggles)
// ═══════════════════════════════════════════════════════════════════════════

const SUPPORTIVE_TEMPLATES = [
  {
    id: 'sup-1',
    text: "That sounds really hard. I'm here.",
    emoji: '💜',
  },
  {
    id: 'sup-2',
    text: "I hear you. Want to talk about it?",
    emoji: '🤗',
  },
  {
    id: 'sup-3',
    text: "I'm sorry you're going through this. I'm listening.",
    emoji: '💙',
  },
  {
    id: 'sup-4',
    text: "That's a lot to carry. How can I support you?",
    emoji: '🫂',
  },
  {
    id: 'sup-5',
    text: "I see you. This matters.",
    emoji: '👁️',
  },
  {
    id: 'sup-6',
    text: "You're not alone in this. Tell me more.",
    emoji: '🌙',
  },
  {
    id: 'sup-7',
    text: "That makes sense that you're feeling that way.",
    emoji: '💫',
  },
  {
    id: 'sup-8',
    text: "I'm with you. What do you need right now?",
    emoji: '🤝',
  },
];

/**
 * Generate Supportive responses for struggles
 * 
 * Key elements:
 * 1. Validate feelings FIRST (not fix)
 * 2. Offer presence, not solutions
 * 3. "I hear you" + "Tell me more" pattern
 * 4. Avoid: "At least...", "You should...", "Have you tried..."
 */
export function generateSupportiveResponse(
  theirMessage: string,
  context: MirroringContext
): ResponseSuggestion[] {
  const suggestions: ResponseSuggestion[] = [];
  const name = context.memberName;

  // Shuffle and pick 3 templates
  const shuffled = [...SUPPORTIVE_TEMPLATES]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  for (const template of shuffled) {
    suggestions.push({
      id: template.id,
      text: template.text,
      style: 'supportive',
      emoji: template.emoji,
    });
  }

  // Add severity-appropriate response for red temperature
  if (context.temperature === 'red') {
    suggestions.unshift({
      id: 'sup-urgent',
      text: "I love you and I'm here. Can we talk?",
      style: 'supportive',
      emoji: '❤️',
    });
    suggestions.pop();
  }

  return suggestions;
}

// ═══════════════════════════════════════════════════════════════════════════
// Curious/Neutral Responses
// ═══════════════════════════════════════════════════════════════════════════

const CURIOUS_TEMPLATES = [
  {
    id: 'cur-1',
    text: "How are you doing today?",
    emoji: '💬',
  },
  {
    id: 'cur-2',
    text: "What's on your mind?",
    emoji: '🤔',
  },
  {
    id: 'cur-3',
    text: "Tell me about your day?",
    emoji: '☀️',
  },
  {
    id: 'cur-4',
    text: "Thinking of you. How's everything going?",
    emoji: '💭',
  },
];

function generateCuriousResponses(): ResponseSuggestion[] {
  const shuffled = [...CURIOUS_TEMPLATES]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  return shuffled.map(t => ({
    id: t.id,
    text: t.text,
    style: 'curious' as const,
    emoji: t.emoji,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// Science Notes (educational element)
// ═══════════════════════════════════════════════════════════════════════════

const SCIENCE_NOTES = {
  'good-news': 
    "Active Constructive Responding: Research shows that how you respond to good news predicts relationship quality better than how you respond to bad news. Enthusiastic engagement that asks questions builds intimacy.",
  'struggle':
    "Supportive Responding: When someone struggles, they need validation before solutions. 'I hear you' + 'Tell me more' creates safety. Jumping to advice can feel dismissive.",
  'neutral':
    "Connection Check-In: Regular, low-pressure check-ins maintain relationship bonds. Curiosity ('How are you really?') shows care.",
  'request':
    "Being present to requests, even small ones, builds trust over time. Turning toward bids for connection strengthens bonds.",
};

// ═══════════════════════════════════════════════════════════════════════════
// Main API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate mirroring suggestions based on what someone shared
 * 
 * @param theirMessage - The text they shared (can be empty if using temperature)
 * @param context - Who they are, their state, relationship
 * @returns Suggestions and educational note
 */
export function generateMirroringSuggestions(
  theirMessage: string | undefined,
  context: MirroringContext
): MirroringResult {
  // Determine message type
  let messageType: MessageType;

  if (theirMessage && theirMessage.trim().length > 0) {
    messageType = identifyMessageType(theirMessage);
  } else if (context.temperature) {
    messageType = identifyTypeFromTemperature(
      context.temperature,
      context.temperatureLabel
    );
  } else {
    messageType = 'neutral';
  }

  // Generate appropriate responses
  let suggestions: ResponseSuggestion[];

  switch (messageType) {
    case 'good-news':
      suggestions = generateActiveConstructiveResponse(theirMessage || '', context);
      break;
    case 'struggle':
      suggestions = generateSupportiveResponse(theirMessage || '', context);
      break;
    case 'request':
    case 'neutral':
    default:
      suggestions = generateCuriousResponses();
      break;
  }

  return {
    messageType,
    suggestions,
    scienceNote: SCIENCE_NOTES[messageType],
  };
}

/**
 * Get response style explanation
 */
export function getResponseStyleExplanation(style: ResponseSuggestion['style']): string {
  switch (style) {
    case 'active-constructive':
      return "Enthusiastic + asks questions = builds intimacy";
    case 'supportive':
      return "Validates feelings first, offers presence not solutions";
    case 'curious':
      return "Shows interest and opens conversation";
    default:
      return "";
  }
}

/**
 * Get a short explanation of why ACR matters
 */
export function getACRExplanation(): string {
  return "How you respond to good news matters MORE than how you respond to bad news. Enthusiastic engagement that asks follow-up questions builds intimacy and trust. 'That's nice' (passive) actually erodes connection over time.";
}
