/**
 * Personology Engine — Relationship Intelligence
 * Birthday-based personality and relationship dynamics (inspired by Goldschneider).
 */

export interface PersonalityPeriod {
  name: string;
  range: string;
  strengths: string[];
  challenges: string[];
  communicationStyle: string;
  needsInRelationships: string;
  stressResponse: string;
}

export interface RelationshipDynamic {
  strengths: string[];
  frictionPoints: string[];
  communicationTip: string;
  conflictPattern: string;
  whatTheyNeed: string;
  whatYouNeed: string;
}

const ARCH: Record<number, PersonalityPeriod> = {
  1: { name: 'The Architect', range: 'January', strengths: ['disciplined', 'strategic', 'resilient', 'goal-oriented'], challenges: ['rigid expectations', 'difficulty showing vulnerability', 'workaholic tendencies'], communicationStyle: 'Direct and practical. Values efficiency.', needsInRelationships: 'Respect for their goals. Space to work. Loyalty through consistency.', stressResponse: 'Withdraws and works harder. May shut down emotionally.' },
  2: { name: 'The Visionary', range: 'February', strengths: ['innovative', 'independent', 'humanitarian', 'intellectually curious'], challenges: ['emotionally detached', 'contrarian', 'unpredictable'], communicationStyle: 'Idea-driven. Needs mental stimulation.', needsInRelationships: 'Freedom to be unconventional. Intellectual partnership.', stressResponse: 'Detaches emotionally. May intellectualize feelings.' },
  3: { name: 'The Empath', range: 'March', strengths: ['intuitive', 'compassionate', 'creative', 'adaptable'], challenges: ['absorbs others emotions', 'boundary issues', 'escapist tendencies'], communicationStyle: 'Feels first, thinks second. Needs to feel safe to open up.', needsInRelationships: 'Emotional safety. Gentle honesty over harsh truth.', stressResponse: 'Withdraws into inner world. May use escapism to cope.' },
  4: { name: 'The Initiator', range: 'April', strengths: ['bold', 'energetic', 'honest', 'protective'], challenges: ['impulsive', 'competitive', 'quick-tempered'], communicationStyle: 'Direct to a fault. Says what they mean immediately.', needsInRelationships: 'Honesty. Someone who can match their energy.', stressResponse: 'Gets louder, more aggressive. Anger is the default.' },
  5: { name: 'The Builder', range: 'May', strengths: ['reliable', 'patient', 'sensual', 'grounded'], challenges: ['stubborn', 'possessive', 'resistant to change'], communicationStyle: 'Slow and deliberate. Needs time to process.', needsInRelationships: 'Stability. Physical affection. Loyalty.', stressResponse: 'Digs in and refuses to budge.' },
  6: { name: 'The Communicator', range: 'June', strengths: ['versatile', 'witty', 'social', 'quick-thinking'], challenges: ['scattered', 'inconsistent', 'avoids depth'], communicationStyle: 'Fast, verbal, needs variety. Processes by talking.', needsInRelationships: 'Mental stimulation. Variety.', stressResponse: 'Talks more, commits less. May deflect with humor.' },
  7: { name: 'The Nurturer', range: 'July', strengths: ['protective', 'emotionally intelligent', 'loyal', 'intuitive'], challenges: ['moody', 'clingy', 'takes everything personally'], communicationStyle: 'Indirect. Tests the water before being vulnerable.', needsInRelationships: 'Emotional security. Reassurance.', stressResponse: 'Retreats into shell. Gets quiet, then resentful.' },
  8: { name: 'The Leader', range: 'August', strengths: ['confident', 'generous', 'warm', 'creative'], challenges: ['ego-driven', 'needs validation', 'dramatic'], communicationStyle: 'Expressive, passionate. Wants to be heard and appreciated.', needsInRelationships: 'Admiration. Loyalty. Feeling special and seen.', stressResponse: 'Gets louder, more dramatic. Ego bruises run deep.' },
  9: { name: 'The Analyst', range: 'September', strengths: ['detail-oriented', 'helpful', 'practical', 'thoughtful'], challenges: ['overcritical', 'anxious', 'perfectionist'], communicationStyle: 'Precise. Shows love through acts of service.', needsInRelationships: 'Appreciation for their effort. Patience with anxiety.', stressResponse: 'Becomes hypercritical. Anxious spiral.' },
  10: { name: 'The Harmonizer', range: 'October', strengths: ['diplomatic', 'fair-minded', 'charming', 'partnership-oriented'], challenges: ['indecisive', 'conflict-avoidant', 'people-pleasing'], communicationStyle: 'Balanced, seeks agreement. May avoid conflict.', needsInRelationships: 'Equality. Partnership where both show up.', stressResponse: 'Freezes on decisions. Avoids conflict until it explodes.' },
  11: { name: 'The Investigator', range: 'November', strengths: ['intense', 'perceptive', 'transformative', 'loyal to the core'], challenges: ['jealous', 'controlling', 'secretive', 'holds grudges'], communicationStyle: 'Reads you before you speak. Values depth. Tests trust.', needsInRelationships: 'Absolute honesty. Depth. Proven loyalty.', stressResponse: 'Gets controlling. Suspects the worst.' },
  12: { name: 'The Explorer', range: 'December', strengths: ['optimistic', 'adventurous', 'philosophical', 'honest'], challenges: ['commitment-phobic', 'tactless', 'restless'], communicationStyle: 'Big picture. Honest to a fault.', needsInRelationships: 'Freedom. Growth. Adventure buddy.', stressResponse: 'Runs physically or emotionally. Plans escape route.' },
};

export function getPersonality(birthday: string): PersonalityPeriod | null {
  try {
    const month = new Date(birthday).getMonth() + 1;
    return ARCH[month] ?? null;
  } catch {
    return null;
  }
}

export function getRelationshipDynamic(myBirthday: string, theirBirthday: string): RelationshipDynamic | null {
  const me = getPersonality(myBirthday);
  const them = getPersonality(theirBirthday);
  if (!me || !them) return null;
  const strengths: string[] = [];
  if (me.strengths.some((s) => s.includes('practical')) && them.strengths.some((s) => s.includes('creative'))) strengths.push('You ground their ideas; they expand your thinking.');
  if (me.strengths.some((s) => s.includes('loyal')) && them.strengths.some((s) => s.includes('loyal'))) strengths.push('Mutual loyalty creates deep trust once established.');
  if (me.strengths.some((s) => s.includes('honest')) && them.strengths.some((s) => s.includes('honest'))) strengths.push('Both value truth — conversations can go deep.');
  if (me.strengths.some((s) => s.includes('intuitive')) || them.strengths.some((s) => s.includes('intuitive'))) strengths.push('At least one of you reads emotional undercurrents naturally.');
  strengths.push(`Your ${me.strengths[0]} meets their ${them.strengths[0]} — different strengths that balance.`);

  const friction: string[] = [];
  if (me.communicationStyle.includes('Direct') && them.communicationStyle.includes('Indirect')) friction.push('You say it straight; they hint. You might miss their signals; they might feel steamrolled.');
  if (me.communicationStyle.includes('Indirect') && them.communicationStyle.includes('Direct')) friction.push('They say it straight; you hint. They might seem harsh; you might seem unclear.');
  if (me.stressResponse.includes('louder') && them.stressResponse.includes('Retreats')) friction.push('Under stress: you escalate, they withdraw. Pursue-withdraw is your biggest risk.');
  if (me.stressResponse.includes('Withdraws') && them.stressResponse.includes('louder')) friction.push('Under stress: they escalate, you shut down. They read silence as rejection; you read intensity as attack.');
  friction.push(`Your challenge (${me.challenges[0]}) may trigger their challenge (${them.challenges[0]}).`);

  let communicationTip: string;
  if (them.communicationStyle.includes('time to process')) communicationTip = 'Give them time to think before expecting a response. Silence means they are processing, not that they do not care.';
  else if (them.communicationStyle.includes('talking')) communicationTip = 'Let them talk it through. They process by speaking. Do not try to solve it before they have finished.';
  else if (them.communicationStyle.includes('safe')) communicationTip = 'They need emotional safety before they open up. Start soft. I want to understand works better than We need to talk.';
  else if (them.communicationStyle.includes('appreciated')) communicationTip = 'Lead with what they did right before addressing what went wrong. They hear criticism louder than praise.';
  else communicationTip = `Their style: ${them.communicationStyle} Your style: ${me.communicationStyle}. The bridge is curiosity — ask help me understand before assuming.`;

  let conflictPattern: string;
  if (me.stressResponse.includes('Withdraws') && them.stressResponse.includes('Withdraws')) conflictPattern = 'Both of you withdraw under stress. Silence becomes a wall. Someone has to go first.';
  else if (me.stressResponse.includes('louder') && them.stressResponse.includes('louder')) conflictPattern = 'Both of you escalate under stress. Agree on a pause word; when either says it, take 20 minutes apart before continuing.';
  else conflictPattern = `Under pressure, you tend to: ${me.stressResponse.split('.')[0].toLowerCase()}. They tend to: ${them.stressResponse.split('.')[0].toLowerCase()}. Knowing this lets you interrupt the pattern.`;

  return { strengths: strengths.length > 4 ? strengths.slice(0, 4) : strengths, frictionPoints: friction, communicationTip, conflictPattern, whatTheyNeed: them.needsInRelationships, whatYouNeed: me.needsInRelationships };
}

export function buildRelationshipContext(myBirthday: string, theirBirthday: string, theirName: string): string {
  const dynamic = getRelationshipDynamic(myBirthday, theirBirthday);
  const me = getPersonality(myBirthday);
  const them = getPersonality(theirBirthday);
  if (!dynamic || !me || !them) return '';
  return '\n\nRELATIONSHIP CONTEXT for ' + theirName + ':\nYour personality style: ' + me.name + ' — ' + me.communicationStyle + '\nTheir personality style: ' + them.name + ' — ' + them.communicationStyle + '\nStrengths: ' + dynamic.strengths.join('; ') + '\nFriction: ' + dynamic.frictionPoints.join('; ') + '\nCommunication tip: ' + dynamic.communicationTip + '\nConflict pattern: ' + dynamic.conflictPattern + '\nWhat they need: ' + dynamic.whatTheyNeed + '\nWhat you need: ' + dynamic.whatYouNeed + '\nUse this context when the user discusses this person. Weave in what is relevant.\n';
}
