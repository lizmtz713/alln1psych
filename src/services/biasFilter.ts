/**
 * Bias Filter Service
 * 
 * Based on Kahneman's System 1/System 2 framework.
 * Detects cognitive biases in message text when the user is activated,
 * suggests reframes, and provides System 2 (slow thinking) prompts.
 */

export type BiasType = 
  | 'loss_aversion'
  | 'confirmation_bias'
  | 'catastrophizing'
  | 'mind_reading'
  | 'emotional_reasoning'
  | 'black_and_white';

export interface DetectedBias {
  type: BiasType;
  label: string;
  confidence: number; // 0-1
  matchedPatterns: string[];
  explanation: string;
}

export interface BiasFilterResult {
  detected: boolean;
  biases: DetectedBias[];
  primaryBias: DetectedBias | null;
  system1Alert: string | null;
}

// Pattern definitions for each bias type
const BIAS_PATTERNS: Record<BiasType, {
  label: string;
  patterns: RegExp[];
  explanation: string;
}> = {
  loss_aversion: {
    label: 'Loss Aversion',
    patterns: [
      /i('ll| will)?\s*(going to\s+)?lose/i,
      /can'?t\s+afford\s+to/i,
      /if\s+i\s+don'?t[^.]*lose/i,
      /too\s+much\s+to\s+lose/i,
      /i'?m\s+going\s+to\s+lose/i,
      /losing\s+(everything|it all|them|this)/i,
      /can'?t\s+let\s+(this|them|it)\s+go/i,
      /what\s+if\s+i\s+lose/i,
      /i'?ll\s+never\s+(get|have|find)\s+(it|this|them)\s+again/i,
      /i\s+need\s+to\s+hold\s+on/i,
    ],
    explanation: 'Your brain is amplifying potential losses over potential gains. This is wired into us — losses feel about twice as painful as equivalent gains feel good.',
  },
  confirmation_bias: {
    label: 'Confirmation Bias',
    patterns: [
      /this\s+proves/i,
      /i\s+knew\s+it/i,
      /see[,?!]?\s+i\s+(was\s+right|told\s+you)/i,
      /just\s+(like|as)\s+i\s+(thought|said|expected)/i,
      /exactly\s+what\s+i\s+expected/i,
      /this\s+is\s+(exactly\s+)?why\s+i/i,
      /proves\s+(my\s+point|what\s+i|that\s+i)/i,
      /i'?ve\s+always\s+(known|said)/i,
      /typical/i,
      /of\s+course\s+they\s+(would|did)/i,
    ],
    explanation: 'Your brain is looking for evidence that fits what you already believe. It's great at spotting confirming info, but it tends to filter out what doesn't fit.',
  },
  catastrophizing: {
    label: 'Catastrophizing',
    patterns: [
      /always/i,
      /never/i,
      /everything\s+is/i,
      /nothing\s+(ever|will)/i,
      /the\s+worst/i,
      /ruined/i,
      /disaster/i,
      /can'?t\s+handle/i,
      /falling\s+apart/i,
      /end\s+of\s+(the\s+world|everything)/i,
      /i'?ll\s+never\s+recover/i,
      /this\s+is\s+horrible/i,
      /everyone\s+(hates|thinks)/i,
      /no\s+one\s+(cares|will)/i,
      /completely\s+(ruined|destroyed|over)/i,
    ],
    explanation: 'Your brain is jumping to the worst-case scenario. This is a protection mechanism — preparing for the worst — but it can distort what's actually likely.',
  },
  mind_reading: {
    label: 'Mind Reading',
    patterns: [
      /they\s+think\s+(i'm|that\s+i|i)/i,
      /they\s+don'?t\s+care/i,
      /they'?re\s+(probably\s+)?(thinking|judging|laughing)/i,
      /i\s+know\s+what\s+they'?re\s+thinking/i,
      /they\s+must\s+think/i,
      /they\s+want\s+me\s+to/i,
      /they\s+hate\s+me/i,
      /they'?re\s+trying\s+to/i,
      /i\s+can\s+tell\s+they/i,
      /they\s+obviously\s+(think|feel|want)/i,
      /they'?re\s+mad\s+at\s+me/i,
      /they\s+don'?t\s+(want|like)/i,
    ],
    explanation: 'Your brain is filling in what others think or feel without direct evidence. We're social creatures, so we try to read minds — but we're often wrong.',
  },
  emotional_reasoning: {
    label: 'Emotional Reasoning',
    patterns: [
      /i\s+feel\s+(like\s+)?(it'?s|they'?re|this\s+is|something'?s|i'?m)/i,
      /it\s+feels\s+(like|wrong|true|right)/i,
      /because\s+i\s+feel/i,
      /feels\s+true/i,
      /my\s+gut\s+(says|tells|knows)/i,
      /i\s+just\s+know/i,
      /something\s+feels\s+off/i,
      /i\s+can\s+feel\s+(it|that)/i,
      /feels\s+like\s+(they|it|this)/i,
    ],
    explanation: 'Your emotions are being treated as evidence. "I feel anxious, so something must be wrong." Feelings are real, but they're not always accurate reporters of reality.',
  },
  black_and_white: {
    label: 'Black-and-White Thinking',
    patterns: [
      /either[^.]*or/i,
      /all\s+or\s+nothing/i,
      /completely\s+(wrong|right|good|bad)/i,
      /total(ly)?\s+(failure|success|disaster|waste)/i,
      /100\s*%/i,
      /if\s+i\s+can'?t[^.]*then/i,
      /perfect\s+or\s+(nothing|not|worthless)/i,
      /(love|hate)\s+me/i,
      /you'?re\s+either/i,
      /there'?s\s+no\s+(middle|in-between|compromise)/i,
      /only\s+(two|2)\s+(options|choices|ways)/i,
      /(good|bad)\s+person/i,
    ],
    explanation: 'Your brain is simplifying a complex situation into two extreme options. This can feel decisive, but reality usually has more shades.',
  },
};

// System 2 prompts — questions to engage slow, deliberate thinking
const SYSTEM_2_PROMPTS: Record<BiasType, string[]> = {
  loss_aversion: [
    'What might you gain from this situation?',
    'What would you advise a friend who felt this way?',
    'Is the loss you're imagining certain, or a possibility?',
    'What's the realistic worst case, and how would you handle it?',
  ],
  confirmation_bias: [
    'What evidence would change your mind?',
    'What's another explanation for their behavior?',
    'If you're wrong, what would be different?',
    'What would someone who disagrees say?',
  ],
  catastrophizing: [
    'Will this matter in a week? A month? A year?',
    'What's the most likely outcome, not the worst?',
    'Has something like this happened before? How did it actually turn out?',
    'What would you tell a friend who said this to you?',
  ],
  mind_reading: [
    'What's another explanation for their behavior?',
    'Have you asked them directly?',
    'What evidence do you actually have?',
    'When have you been wrong about what someone was thinking?',
  ],
  emotional_reasoning: [
    'What facts support this, separate from how you feel?',
    'Have you felt this way before and been wrong?',
    'What would you think about this after a good night's sleep?',
    'What would a neutral observer see here?',
  ],
  black_and_white: [
    'What options exist between those two extremes?',
    'Can something be partly true and partly not?',
    'What would "good enough" look like here?',
    'Is this really all-or-nothing, or does it just feel that way?',
  ],
};

// Reframe suggestions for each bias
const REFRAME_TEMPLATES: Record<BiasType, string[]> = {
  loss_aversion: [
    'Try: "I might be overweighting what I could lose. What could I also gain?"',
    'Try: "This feels big, but I've gotten through losses before."',
    'Reframe: Instead of "I'll lose everything," try "This is one chapter, not the whole story."',
  ],
  confirmation_bias: [
    'Try: "Maybe there's more to this than what I expected to see."',
    'Try: "I wonder if I'm only noticing what fits my story."',
    'Reframe: Instead of "This proves it," try "This is one data point."',
  ],
  catastrophizing: [
    'Try: "This is hard, but 'always' and 'never' are rarely accurate."',
    'Try: "I can handle this moment. I don't need to predict every future one."',
    'Reframe: Instead of "Everything is ruined," try "This part is hard right now."',
  ],
  mind_reading: [
    'Try: "I don't actually know what they're thinking. I could ask."',
    'Try: "There might be things going on for them I can't see."',
    'Reframe: Instead of "They think I'm..." try "I'm guessing they might think..."',
  ],
  emotional_reasoning: [
    'Try: "My feelings are real, but they're not the whole picture."',
    'Try: "I feel X, and I'm curious what's actually happening."',
    'Reframe: Instead of "I feel it so it's true," try "I feel it, and I want to check the facts."',
  ],
  black_and_white: [
    'Try: "What would 'okay' look like, not just 'perfect' or 'disaster'?"',
    'Try: "Maybe this isn't either/or. What's a middle path?"',
    'Reframe: Instead of all-or-nothing, try "What's one small step forward?"',
  ],
};

/**
 * Detect cognitive biases in message text.
 * Returns detected biases with confidence scores.
 */
export function detectBiases(messageText: string, currentState?: number): BiasFilterResult {
  if (!messageText || messageText.trim().length < 10) {
    return { detected: false, biases: [], primaryBias: null, system1Alert: null };
  }

  const detectedBiases: DetectedBias[] = [];
  const text = messageText.toLowerCase();

  // Analyze for each bias type
  for (const [biasType, config] of Object.entries(BIAS_PATTERNS) as [BiasType, typeof BIAS_PATTERNS[BiasType]][]) {
    const matches: string[] = [];
    
    for (const pattern of config.patterns) {
      const match = text.match(pattern);
      if (match) {
        matches.push(match[0]);
      }
    }

    if (matches.length > 0) {
      // Calculate confidence based on number of pattern matches
      const confidence = Math.min(1, matches.length * 0.4);
      
      detectedBiases.push({
        type: biasType,
        label: config.label,
        confidence,
        matchedPatterns: matches,
        explanation: config.explanation,
      });
    }
  }

  // Sort by confidence descending
  detectedBiases.sort((a, b) => b.confidence - a.confidence);

  // Determine if we should alert based on state and detections
  const shouldAlert = detectedBiases.length > 0 && 
    (currentState === undefined || currentState < 50);

  const primaryBias = detectedBiases[0] || null;
  
  // Generate System 1 alert message
  let system1Alert: string | null = null;
  if (shouldAlert && primaryBias) {
    if (currentState !== undefined && currentState < 30) {
      system1Alert = 'Pause. You're running hot, and your System 1 might be driving.';
    } else if (currentState !== undefined && currentState < 50) {
      system1Alert = 'Pause. Your System 1 might be steering this message.';
    } else {
      system1Alert = 'Notice: This message may have some cognitive shortcuts.';
    }
  }

  return {
    detected: detectedBiases.length > 0,
    biases: detectedBiases,
    primaryBias,
    system1Alert,
  };
}

/**
 * Get a reframe suggestion for a detected bias.
 */
export function suggestReframe(bias: BiasType, originalText?: string): string {
  const templates = REFRAME_TEMPLATES[bias];
  if (!templates || templates.length === 0) {
    return 'Try stepping back and asking: Is this the whole picture?';
  }
  
  // Return a random template
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Get a System 2 prompt to engage slow thinking.
 */
export function getSystem2Prompt(bias: BiasType): string {
  const prompts = SYSTEM_2_PROMPTS[bias];
  if (!prompts || prompts.length === 0) {
    return 'What would a wise friend tell you right now?';
  }
  
  // Return a random prompt
  return prompts[Math.floor(Math.random() * prompts.length)];
}

/**
 * Get all System 2 prompts for a bias (for displaying multiple options).
 */
export function getAllSystem2Prompts(bias: BiasType): string[] {
  return SYSTEM_2_PROMPTS[bias] || ['What would a wise friend tell you right now?'];
}

/**
 * Get a gentle explanation of why the filter is showing.
 */
export function getFilterExplanation(state?: number): string {
  if (state !== undefined && state < 30) {
    return 'Your nervous system is activated right now. When we're dysregulated, our fast brain (System 1) takes over to protect us — but it can distort our perception and communication.';
  }
  if (state !== undefined && state < 50) {
    return 'When we're a bit activated, our thinking brain hands the wheel to our emotional brain. That's not bad — it's trying to help — but it can color what we write.';
  }
  return 'Your brain is taking some mental shortcuts. That's normal and often helpful, but worth noticing when communicating.';
}

/**
 * Format a bias detection result for display.
 */
export function formatBiasForDisplay(bias: DetectedBias): {
  title: string;
  subtitle: string;
  emoji: string;
} {
  const emojiMap: Record<BiasType, string> = {
    loss_aversion: '💔',
    confirmation_bias: '🔍',
    catastrophizing: '🌪️',
    mind_reading: '🔮',
    emotional_reasoning: '💭',
    black_and_white: '⬛',
  };

  return {
    title: bias.label,
    subtitle: bias.explanation,
    emoji: emojiMap[bias.type] || '🧠',
  };
}
