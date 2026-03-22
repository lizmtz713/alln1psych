/**
 * Social Physics — Predictive Interaction Logic
 * 
 * Calculates how different response intents will likely affect
 * the user's gauges based on Social Psychology research.
 * 
 * Grounded in:
 * - Attribution Theory (Aronson)
 * - Boundary Setting research
 * - Polyvagal Theory (Porges)
 * - Attachment Theory
 */

export type ResponseIntent = 
  | 'set_boundary'
  | 'reconnect'
  | 'apologize'
  | 'confront'
  | 'validate'
  | 'withdraw'
  | 'clarify'
  | 'defer";

export interface GaugeImpact {
  connection: number;  // -20 to +20
  alignment: number;   // -20 to +20
  state: number;       // -20 to +20
  explanation: string;
}

export interface PartnerState {
  isActivated?: boolean;      // Their nervous system is in fight/flight
  isShutdown?: boolean;       // They're withdrawn/avoidant
  recentConflict?: boolean;   // There"s been recent friction
  secureAttachment?: boolean; // They handle directness well
}

/**
 * Calculate predicted gauge impact based on intent and context
 */
export function calculateTrajectory(
  intent: ResponseIntent,
  partnerState?: PartnerState
): GaugeImpact {
  const impact: GaugeImpact = {
    connection: 0,
    alignment: 0,
    state: 0,
    explanation: '',
  };

  const partnerActivated = partnerState?.isActivated ?? false;
  const partnerShutdown = partnerState?.isShutdown ?? false;
  const recentConflict = partnerState?.recentConflict ?? false;

  switch (intent) {
    case 'set_boundary':
      // Integrity increases when honoring values
      impact.alignment = 15;
      // Short-term friction is a biological cost
      impact.connection = partnerActivated ? -15 : -10;
      // Temporary stress spike during conflict
      impact.state = -5;
      impact.explanation = 'Boundaries boost integrity but create short-term friction. If they\'re already activated, expect pushback.';
      break;

    case 'reconnect':
      // Proactive belonging reduces biological pain
      impact.connection = 20;
      // Nervous system shifts toward 'Safe'
      impact.state = 10;
      // Slight alignment boost if authentic
      impact.alignment = 5;
      impact.explanation = 'Reaching out signals safety and belonging. Your nervous system will likely calm.';
      break;

    case 'apologize':
      // Repair attempt boosts connection
      impact.connection = partnerShutdown ? 10 : 15;
      // Alignment depends on sincerity
      impact.alignment = 5;
      // Vulnerability can spike state temporarily
      impact.state = -3;
      impact.explanation = 'Genuine apology repairs connection. If they\'re shutdown, impact may be delayed.';
      break;

    case 'confront':
      // High integrity move
      impact.alignment = 18;
      // Significant short-term cost
      impact.connection = recentConflict ? -18 : -12;
      // Stress spike
      impact.state = -10;
      impact.explanation = 'Confrontation honors your truth but costs connection short-term. High stress likely.';
      break;

    case 'validate':
      // Strong connection boost
      impact.connection = 15;
      // Slight alignment risk if over-validating
      impact.alignment = -2;
      // Calming for both nervous systems
      impact.state = 8;
      impact.explanation = 'Validation builds safety. Be careful not to abandon your own perspective entirely.';
      break;

    case 'withdraw':
      // Protects from escalation
      impact.state = 5;
      // Connection cost
      impact.connection = -8;
      // May feel like abandoning values
      impact.alignment = -5;
      impact.explanation = 'Strategic withdrawal prevents escalation but may feel unresolved.';
      break;

    case 'clarify':
      // Neutral to positive on all fronts
      impact.connection = 5;
      impact.alignment = 8;
      impact.state = 3;
      impact.explanation = 'Seeking clarity is low-risk and shows good faith.';
      break;

    case 'defer':
      // Buys time
      impact.state = 5;
      // Slight connection maintenance
      impact.connection = 2;
      // May feel like avoiding
      impact.alignment = -3;
      impact.explanation = 'Deferring buys time but doesn\'t resolve tension.';
      break;
  }

  // Modifiers based on partner state
  if (partnerActivated && (intent === 'confront' || intent === 'set_boundary')) {
    impact.connection -= 5;
    impact.explanation += ' ⚠️ Their activated state means this will land harder.';
  }

  if (partnerShutdown && intent === 'reconnect') {
    impact.connection -= 5;
    impact.explanation += ' ⚠️ They may not be ready to receive connection yet.';
  }

  return impact;
}

/**
 * Format impact for display
 */
export function formatImpact(impact: GaugeImpact): string {
  const format = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
  return `Alignment ${format(impact.alignment)} | Connection ${format(impact.connection)} | State ${format(impact.state)}`;
}

/**
 * Get all trajectory options for a situation
 */
export function getTrajectoryOptions(partnerState?: PartnerState): Array<{
  intent: ResponseIntent;
  label: string;
  impact: GaugeImpact;
}> {
  const intents: Array<{ intent: ResponseIntent; label: string }> = [
    { intent: 'reconnect', label: 'Reach out warmly' },
    { intent: 'set_boundary', label: 'Set a boundary' },
    { intent: 'validate', label: 'Validate their feelings' },
    { intent: 'clarify', label: 'Ask for clarity' },
    { intent: 'defer', label: 'Buy more time' },
  ];

  return intents.map(({ intent, label }) => ({
    intent,
    label,
    impact: calculateTrajectory(intent, partnerState),
  }));
}
