/**
 * Social Physics — response intent engine and predicted gauge impact.
 */

export type ResponseIntent =
  | 'set_boundary'
  | 'reconnect'
  | 'apologize'
  | 'confront'
  | 'validate'
  | 'withdraw'
  | 'clarify'
  | 'defer';

export function toResponseIntent(value: string): ResponseIntent | null {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '_');
  const intents: ResponseIntent[] = [
    'set_boundary',
    'reconnect',
    'apologize',
    'confront',
    'validate',
    'withdraw',
    'clarify',
    'defer',
  ];
  return intents.includes(normalized as ResponseIntent)
    ? (normalized as ResponseIntent)
    : null;
}

export interface GaugeImpact {
  connection: number;
  state?: number;
  emotion?: number;
  alignment?: number;
  direction?: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface InteractionContext {
  recentConflict?: boolean;
  highTrust?: boolean;
  repeatedPattern?: boolean;
  urgency?: 'low' | 'medium' | 'high';
  userCapacity?: 'low' | 'medium' | 'high';
}

export interface TrajectoryExplanation {
  why: string;
  whenToUse: string;
  watchOut: string;
}

export interface IntentEngineEntry {
  label: string;
  description: string;
  impact: GaugeImpact;
  risk: RiskLevel;
  defaultFollowUp: string;
  explanation: TrajectoryExplanation;
}

export const RESPONSE_ENGINE: Record<ResponseIntent, IntentEngineEntry> = {
  set_boundary: {
    label: 'Set Boundary',
    description: 'Protect your limits while staying clear and respectful.',
    impact: {
      connection: -1,
      state: +4,
      emotion: +2,
      alignment: +6,
      direction: +3,
    },
    risk: 'medium',
    defaultFollowUp: 'State your limit clearly, briefly, and without overexplaining.',
    explanation: {
      why: 'Boundaries usually improve alignment and steadiness, even if they create a little short-term friction in connection.',
      whenToUse: 'Use this when something feels draining, disrespectful, intrusive, or unsustainable.',
      watchOut: 'Do not overexplain, justify excessively, or set a boundary you do not plan to hold.',
    },
  },

  reconnect: {
    label: 'Reconnect',
    description: 'Reopen warmth, contact, or trust after distance.',
    impact: {
      connection: +6,
      state: +1,
      emotion: +2,
      alignment: +2,
      direction: +4,
    },
    risk: 'low',
    defaultFollowUp: 'Send a simple, warm message that lowers pressure and invites contact.',
    explanation: {
      why: 'Reconnection tends to raise connection and forward movement by lowering distance and reopening the channel.',
      whenToUse: 'Use this after drift, silence, or mild awkwardness when the relationship still feels worth tending.',
      watchOut: 'Do not force closeness too fast or ignore unresolved hurt that still needs acknowledgment.',
    },
  },

  apologize: {
    label: 'Apologize',
    description: 'Repair harm by taking responsibility and making space for impact.',
    impact: {
      connection: +7,
      state: -1,
      emotion: +3,
      alignment: +7,
      direction: +5,
    },
    risk: 'medium',
    defaultFollowUp: 'Name what happened, own your part, and avoid defensiveness.',
    explanation: {
      why: 'A real apology often increases connection and alignment because it reduces defensiveness and restores trust.',
      whenToUse: 'Use this when you clearly missed the mark, caused harm, or contributed to the problem.',
      watchOut: 'Do not apologize just to end discomfort, and do not attach excuses that weaken accountability.',
    },
  },

  confront: {
    label: 'Confront',
    description: 'Address a problem directly when avoidance would worsen it.',
    impact: {
      connection: -3,
      state: -3,
      emotion: -1,
      alignment: +4,
      direction: +5,
    },
    risk: 'high',
    defaultFollowUp: 'Be specific, stay grounded, and focus on behavior rather than character.',
    explanation: {
      why: 'Confronting can create stress in the moment, but it can also move stuck situations forward when truth needs to be said.',
      whenToUse: 'Use this when a pattern is harmful, repeated, or important enough that silence would cost more.',
      watchOut: 'Do not confront when highly dysregulated, vague, or trying to punish rather than clarify and repair.',
    },
  },

  validate: {
    label: 'Validate',
    description: 'Help the other person feel understood and emotionally met.',
    impact: {
      connection: +8,
      state: +3,
      emotion: +4,
      alignment: +2,
      direction: +2,
    },
    risk: 'low',
    defaultFollowUp: 'Reflect what they may be feeling before trying to solve anything.',
    explanation: {
      why: 'Validation often strengthens connection because people calm down when they feel seen and understood.',
      whenToUse: 'Use this when emotions are high, tension is building, or the other person seems hurt, reactive, or unseen.',
      watchOut: 'Do not confuse validation with agreement, and do not jump into fixing too quickly.',
    },
  },

  withdraw: {
    label: 'Withdraw',
    description: 'Step back to protect yourself or reduce escalation.',
    impact: {
      connection: -6,
      state: +1,
      emotion: -2,
      alignment: +1,
      direction: -4,
    },
    risk: 'medium',
    defaultFollowUp: 'Pause the interaction and return later with a clearer, explicit re-entry plan.',
    explanation: {
      why: 'Withdrawal can reduce overload in the short term, but it often lowers connection and slows resolution if it stays unspoken.',
      whenToUse: 'Use this when the interaction feels too hot, unsafe, overwhelming, or beyond your present capacity.',
      watchOut: 'Do not disappear without context if repair matters; name the pause and give a return path when possible.',
    },
  },

  clarify: {
    label: 'Clarify',
    description: 'Reduce confusion by checking meaning, intent, or facts.',
    impact: {
      connection: +2,
      state: +1,
      emotion: +2,
      alignment: +3,
      direction: +4,
    },
    risk: 'low',
    defaultFollowUp: 'Ask a clean question and reflect back what you think you heard.',
    explanation: {
      why: 'Clarifying improves direction because many conflicts are made worse by assumptions, ambiguity, or mismatched meaning.',
      whenToUse: 'Use this when you are unsure what they meant, what happened, or what is actually being asked.',
      watchOut: 'Do not hide an accusation inside a question, and do not ask five questions at once.',
    },
  },

  defer: {
    label: 'Defer',
    description: 'Delay response until there is more capacity, safety, or information.',
    impact: {
      connection: -1,
      state: +3,
      emotion: +1,
      alignment: +2,
      direction: -1,
    },
    risk: 'low',
    defaultFollowUp: 'Say you want to come back to it, and give a specific time if possible.',
    explanation: {
      why: 'Deferring can protect state and reduce impulsive reactions, even though it may slightly slow progress for now.',
      whenToUse: 'Use this when you need more time, more regulation, or more information before responding well.',
      watchOut: 'Do not use deferral as endless avoidance; set a realistic return point if the issue matters.',
    },
  },
};

export interface ScoredInteraction {
  intent: ResponseIntent;
  label: string;
  impact: GaugeImpact;
  score: number;
  risk: RiskLevel;
  recommendedFollowUp: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getIntentConfig(intent: ResponseIntent): IntentEngineEntry {
  return RESPONSE_ENGINE[intent];
}

export function getIntentImpact(
  intent: ResponseIntent,
  context?: InteractionContext
): GaugeImpact {
  const base = RESPONSE_ENGINE[intent].impact;

  let connection = base.connection;
  let state = base.state ?? 0;
  let emotion = base.emotion ?? 0;
  let alignment = base.alignment ?? 0;
  let direction = base.direction ?? 0;

  if (!context) {
    return { connection, state, emotion, alignment, direction };
  }

  if (context.recentConflict) {
    if (intent === 'confront') {
      connection -= 2;
      state -= 2;
    }
    if (intent === 'validate' || intent === 'clarify') {
      connection += 1;
    }
  }

  if (context.highTrust) {
    if (intent === 'confront' || intent === 'set_boundary') {
      connection += 2;
    }
    if (intent === 'reconnect') {
      connection += 1;
    }
  }

  if (context.repeatedPattern) {
    if (intent === 'withdraw') {
      direction -= 2;
    }
    if (intent === 'set_boundary' || intent === 'confront') {
      alignment += 2;
      direction += 1;
    }
  }

  if (context.urgency === 'high') {
    if (intent === 'defer') {
      direction -= 3;
    }
    if (intent === 'clarify' || intent === 'confront') {
      direction += 1;
    }
  }

  if (context.userCapacity === 'low') {
    if (intent === 'withdraw' || intent === 'defer') {
      state += 2;
    }
    if (intent === 'confront') {
      state -= 2;
    }
  }

  return {
    connection: clamp(connection, -20, 20),
    state: clamp(state, -20, 20),
    emotion: clamp(emotion, -20, 20),
    alignment: clamp(alignment, -20, 20),
    direction: clamp(direction, -20, 20),
  };
}

export function getRecommendedFollowUp(
  intent: ResponseIntent,
  context?: InteractionContext
): string {
  if (context?.userCapacity === 'low') {
    if (intent === 'confront') {
      return 'Slow this down. Draft the message first or wait until your body is more regulated.';
    }
    if (intent === 'withdraw' || intent === 'defer') {
      return 'Take space, communicate that you are pausing, and set a return point.';
    }
  }

  if (context?.recentConflict) {
    if (intent === 'validate') {
      return 'Lead with validation first. Do not explain your side yet.';
    }
    if (intent === 'clarify') {
      return 'Ask one grounding question before making assumptions.';
    }
  }

  return RESPONSE_ENGINE[intent].defaultFollowUp;
}

export function getTrajectoryExplanation(
  intent: ResponseIntent,
  context?: InteractionContext
): TrajectoryExplanation {
  const base = RESPONSE_ENGINE[intent].explanation;

  if (context?.userCapacity === 'low' && intent === 'confront') {
    return {
      why: 'Direct confrontation may move the issue forward, but low capacity makes escalation more likely right now.',
      whenToUse: 'Use this only if the issue is urgent and you can stay specific and grounded.',
      watchOut: 'Pause if your body is too activated, flooded, or shut down to stay clear.',
    };
  }

  if (context?.recentConflict && intent === 'validate') {
    return {
      why: 'After conflict, validation often helps lower defensiveness and rebuild enough safety for a better conversation.',
      whenToUse: 'Use this at the start of repair, especially when the other person still seems hurt or reactive.',
      watchOut: 'Do not pivot too fast into your explanation before they feel understood.',
    };
  }

  return base;
}

export function scoreInteraction(
  intent: ResponseIntent,
  context?: InteractionContext
): ScoredInteraction {
  const config = getIntentConfig(intent);
  const impact = getIntentImpact(intent, context);

  const score =
    impact.connection +
    (impact.state ?? 0) +
    (impact.emotion ?? 0) +
    (impact.alignment ?? 0) +
    (impact.direction ?? 0);

  return {
    intent,
    label: config.label,
    impact,
    score,
    risk: config.risk,
    recommendedFollowUp: getRecommendedFollowUp(intent, context),
  };
}
