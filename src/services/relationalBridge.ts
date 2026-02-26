/**
 * Relational Bridge — Conflict communication intelligence
 * 
 * Philosophy:
 * - Compare two personalities to suggest best communication approach
 * - Focus on de-escalation and understanding, not winning
 * - Provide specific, actionable phrases to try
 * - Respect both parties' needs and styles
 */

import { getPersonality, getRelationshipDynamic, type PersonalityPeriod, type RelationshipDynamic } from './personology';
import { type CircleMember, type RelationshipType } from '../stores/circleStore';

export interface ConflictContext {
  situation?: string; // What's the conflict about
  yourEmotion?: string; // How you're feeling
  theirBehavior?: string; // What they did/said
}

export interface CommunicationBridge {
  yourStyle: string;
  theirStyle: string;
  styleMismatch?: string;
  
  openingStrategies: string[];
  phrasesToTry: string[];
  phrasesToAvoid: string[];
  
  theirTriggers: string[];
  whatTheyNeedToHear: string[];
  
  conflictTip: string;
  repairStrategy: string;
  
  deescalationNote?: string;
}

export interface RelationalBridgeResult {
  hasData: boolean;
  yourPersonality?: PersonalityPeriod;
  theirPersonality?: PersonalityPeriod;
  bridge?: CommunicationBridge;
  generalTips?: string[];
}

/**
 * Communication style mappings for bridge building
 */
const STYLE_OPENERS: Record<string, string[]> = {
  'Direct': [
    "I'll get straight to the point: [your need]",
    "Here's what I need from you: [specific request]",
    "Can we talk about [topic]? I want to resolve this.",
  ],
  'Indirect': [
    "I've been thinking about something, when you have a moment...",
    "I wanted to check in about how things are going between us.",
    "Something's been on my mind — can I share it with you?",
  ],
  'Emotional': [
    "I've been feeling [emotion] and I want us to be okay.",
    "This is hard for me to say, but I trust you with it.",
    "My heart's been heavy about [topic]. Can we talk?",
  ],
  'Logical': [
    "I'd like to discuss [topic] — I have some thoughts on a solution.",
    "Can we look at this situation together and figure out next steps?",
    "I want to understand your perspective on [topic].",
  ],
};

const STYLE_AVOIDS: Record<string, string[]> = {
  'needs time': [
    "We need to talk about this RIGHT NOW",
    "Why aren't you saying anything?",
    "Your silence is making this worse",
  ],
  'needs safety': [
    "Don't get so emotional",
    "You're overreacting",
    "Just calm down",
  ],
  'needs appreciation': [
    "You always do this",
    "What's wrong with you?",
    "Starting with criticism",
  ],
  'needs space': [
    "Where are you going? We're not done!",
    "You can't just walk away",
    "You're avoiding this",
  ],
};

/**
 * Generate bridge recommendations for two people
 */
export function generateBridge(
  myBirthday: string,
  theirBirthday: string,
  context?: ConflictContext
): RelationalBridgeResult {
  const myPersonality = getPersonality(myBirthday);
  const theirPersonality = getPersonality(theirBirthday);
  
  if (!myPersonality || !theirPersonality) {
    return {
      hasData: false,
      generalTips: [
        "Without birthday info, here are universal tips:",
        "• Start with 'I feel...' not 'You always...'",
        "• Ask 'Help me understand' before assuming",
        "• Take a break if either person is flooded",
        "• The goal is understanding, not winning",
      ],
    };
  }

  const dynamic = getRelationshipDynamic(myBirthday, theirBirthday);
  
  // Analyze communication style mismatch
  let styleMismatch: string | undefined;
  const myStyle = myPersonality.communicationStyle;
  const theirStyle = theirPersonality.communicationStyle;
  
  if (myStyle.includes('Direct') && theirStyle.includes('Indirect')) {
    styleMismatch = "You're direct; they're indirect. You might seem harsh; they might seem evasive. Bridge: soften your opener, give them time to respond.";
  } else if (myStyle.includes('Indirect') && theirStyle.includes('Direct')) {
    styleMismatch = "They're direct; you're indirect. They might miss your hints; you might feel steamrolled. Bridge: be more explicit about your needs; don't expect them to read between lines.";
  } else if (myStyle.includes('Fast') && theirStyle.includes('time to process')) {
    styleMismatch = "You process quickly; they need time. Don't fill silence — it's them thinking, not ignoring.";
  }

  // Generate opening strategies based on their style
  const openingStrategies: string[] = [];
  
  if (theirStyle.includes('time to process')) {
    openingStrategies.push("Give them advance notice: 'I'd like to talk about X later today — take your time to think about it.'");
  }
  if (theirStyle.includes('safe') || theirStyle.includes('emotional')) {
    openingStrategies.push("Start soft: 'I care about us, and I want to understand what happened.'");
  }
  if (theirStyle.includes('appreciated')) {
    openingStrategies.push("Lead with appreciation: 'I value our relationship, and that's why I want to address this.'");
  }
  if (theirStyle.includes('Direct')) {
    openingStrategies.push("Be clear and concise — they'll respect you getting to the point.");
  }
  if (theirStyle.includes('stimulation') || theirStyle.includes('variety')) {
    openingStrategies.push("Keep it interesting — don't rehash the same points; bring a new perspective.");
  }
  
  // Default opener
  if (openingStrategies.length === 0) {
    openingStrategies.push("Start with curiosity: 'Help me understand your perspective on what happened.'");
  }

  // Phrases to try based on their needs
  const phrasesToTry: string[] = [
    `"I want to understand where you're coming from."`,
    `"Can you help me see this from your side?"`,
  ];
  
  if (theirPersonality.needsInRelationships.includes('respect')) {
    phrasesToTry.push(`"I respect your perspective, even when we disagree."`);
  }
  if (theirPersonality.needsInRelationships.includes('safety') || theirPersonality.needsInRelationships.includes('security')) {
    phrasesToTry.push(`"I'm not going anywhere. I want to work through this together."`);
  }
  if (theirPersonality.needsInRelationships.includes('appreciation') || theirPersonality.needsInRelationships.includes('special')) {
    phrasesToTry.push(`"I appreciate [specific thing they do]. That's not lost on me."`);
  }
  if (theirPersonality.needsInRelationships.includes('freedom') || theirPersonality.needsInRelationships.includes('space')) {
    phrasesToTry.push(`"Take the time you need. I'll be here when you're ready."`);
  }
  if (theirPersonality.needsInRelationships.includes('honesty')) {
    phrasesToTry.push(`"I'm going to be honest with you because I know that matters to you."`);
  }

  // Phrases to avoid based on their challenges/triggers
  const phrasesToAvoid: string[] = [];
  
  if (theirPersonality.challenges.includes('takes everything personally')) {
    phrasesToAvoid.push(`"It's not a big deal" (they feel dismissed)`);
    phrasesToAvoid.push(`"You're being too sensitive" (they shut down)`);
  }
  if (theirPersonality.challenges.includes('ego') || theirPersonality.challenges.includes('needs validation')) {
    phrasesToAvoid.push(`Starting with criticism (lead with something positive first)`);
    phrasesToAvoid.push(`Public confrontation (protect their dignity)`);
  }
  if (theirPersonality.challenges.includes('stubborn')) {
    phrasesToAvoid.push(`"You have to change" (they dig in deeper)`);
    phrasesToAvoid.push(`Ultimatums (triggers defiance)`);
  }
  if (theirPersonality.challenges.includes('avoids')) {
    phrasesToAvoid.push(`"We NEED to talk NOW" (triggers avoidance)`);
    phrasesToAvoid.push(`Cornering them (give an exit)`);
  }
  if (theirPersonality.challenges.includes('controlling') || theirPersonality.challenges.includes('jealous')) {
    phrasesToAvoid.push(`Being vague about your whereabouts (triggers suspicion)`);
    phrasesToAvoid.push(`Secrets, even small ones (builds distrust)`);
  }

  // Their triggers
  const theirTriggers: string[] = [
    ...theirPersonality.challenges.map(c => `Watch for: ${c}`),
  ];
  
  // What they need to hear
  const whatTheyNeedToHear: string[] = [];
  const needs = theirPersonality.needsInRelationships;
  
  if (needs.includes('loyalty')) {
    whatTheyNeedToHear.push("I'm committed to us.");
  }
  if (needs.includes('appreciation') || needs.includes('seen')) {
    whatTheyNeedToHear.push("I see how much you do.");
  }
  if (needs.includes('safety') || needs.includes('security')) {
    whatTheyNeedToHear.push("You're safe with me.");
  }
  if (needs.includes('respect')) {
    whatTheyNeedToHear.push("I respect your judgment.");
  }
  if (needs.includes('freedom') || needs.includes('space')) {
    whatTheyNeedToHear.push("I trust you.");
  }

  // Conflict tip from dynamic
  const conflictTip = dynamic?.conflictPattern || 
    `Under stress, you: ${myPersonality.stressResponse.split('.')[0]}. They: ${theirPersonality.stressResponse.split('.')[0]}. Know this pattern to interrupt it.`;

  // Repair strategy
  let repairStrategy: string;
  if (theirPersonality.stressResponse.includes('Withdraws') || theirPersonality.stressResponse.includes('Retreats')) {
    repairStrategy = "After conflict, they may need space first. Check in gently later: 'I'm thinking about you. Let me know when you're ready to talk.'";
  } else if (theirPersonality.stressResponse.includes('louder') || theirPersonality.stressResponse.includes('aggressive')) {
    repairStrategy = "After the heat passes, they often feel remorse. Give it time, then reconnect without rehashing: 'I know we both care. Let's start fresh.'";
  } else if (theirPersonality.stressResponse.includes('critical') || theirPersonality.stressResponse.includes('anxious')) {
    repairStrategy = "They may over-analyze. Offer reassurance: 'We're okay. Disagreements don't change how I feel about you.'";
  } else {
    repairStrategy = "Repair is about reconnection, not re-litigating. Small gestures matter: a touch, a cup of coffee, saying 'I love you' without conditions.";
  }

  // De-escalation note based on both stress responses
  let deescalationNote: string | undefined;
  if (myPersonality.stressResponse.includes('louder') && theirPersonality.stressResponse.includes('Withdraws')) {
    deescalationNote = "⚠️ Pursue-Withdraw pattern detected: When you escalate, they retreat. When they retreat, you pursue harder. BREAK THE CYCLE: When you notice them withdrawing, that's your cue to pause, not push.";
  } else if (myPersonality.stressResponse.includes('Withdraws') && theirPersonality.stressResponse.includes('louder')) {
    deescalationNote = "⚠️ Pursue-Withdraw pattern detected: When they escalate, you shut down. When you go silent, they get louder. BREAK THE CYCLE: Say 'I need 20 minutes, but I'll come back' — give them a return time.";
  }

  return {
    hasData: true,
    yourPersonality: myPersonality,
    theirPersonality: theirPersonality,
    bridge: {
      yourStyle: myStyle,
      theirStyle: theirStyle,
      styleMismatch,
      openingStrategies,
      phrasesToTry,
      phrasesToAvoid: phrasesToAvoid.length > 0 ? phrasesToAvoid : ["No specific phrases to avoid identified — use general respect."],
      theirTriggers: theirTriggers.slice(0, 3),
      whatTheyNeedToHear,
      conflictTip,
      repairStrategy,
      deescalationNote,
    },
  };
}

/**
 * Get quick conflict tips for a Circle member
 */
export function getQuickConflictTips(member: CircleMember, myBirthday: string): string[] {
  if (!member.birthday || !myBirthday) {
    return [
      "Without birthday info, focus on: listen first, then respond.",
      "Use 'I feel...' statements instead of 'You always...'",
      "Take a break if emotions run high — 20 minutes, then return.",
    ];
  }

  const result = generateBridge(myBirthday, member.birthday);
  if (!result.hasData || !result.bridge) {
    return result.generalTips || [];
  }

  const tips: string[] = [];
  
  if (result.bridge.styleMismatch) {
    tips.push(`Style bridge: ${result.bridge.styleMismatch.split('.')[0]}.`);
  }
  
  if (result.bridge.openingStrategies[0]) {
    tips.push(`Try: ${result.bridge.openingStrategies[0]}`);
  }
  
  if (result.bridge.deescalationNote) {
    tips.push(result.bridge.deescalationNote.replace('⚠️ ', ''));
  }
  
  tips.push(`They need to hear: "${result.bridge.whatTheyNeedToHear[0] || 'I understand'}"`);

  return tips.slice(0, 4);
}

/**
 * Relationship-type specific advice layer
 */
export function getRelationshipSpecificAdvice(
  relationshipType: RelationshipType,
  bridge: CommunicationBridge
): string[] {
  const advice: string[] = [];

  switch (relationshipType) {
    case 'partner':
      advice.push("In partnerships, repair matters more than being right. Circle back within 24 hours.");
      advice.push("Physical reconnection (a hug, holding hands) can help even before you've fully talked it through.");
      break;
    case 'parent':
      advice.push("With parents, some boundaries need repeating. That's normal — it doesn't mean you failed.");
      advice.push("You can honor them without agreeing with them. 'I hear you' isn't 'I'll do that.'");
      break;
    case 'child':
      advice.push("Children need connection before correction. Are they in a state to hear you?");
      advice.push("Model repair: 'I got frustrated and raised my voice. That wasn't okay. I'm sorry.'");
      break;
    case 'sibling':
      advice.push("Sibling dynamics often replay childhood roles. Notice if you're arguing as adults or as your 12-year-old selves.");
      advice.push("Shared history is a double-edged sword — they know your buttons because they helped install them.");
      break;
    case 'friend':
      advice.push("Friendships need maintenance but have fewer scripts than family. Be explicit about what you need.");
      advice.push("Not every friendship survives every conflict — and that's okay. Some people are for a season.");
      break;
    case 'mentor':
      advice.push("The power dynamic matters. Acknowledge their expertise while asserting your autonomy.");
      break;
    default:
      advice.push("Every relationship has its own rules. Observe what works and what doesn't.");
  }

  return advice;
}
