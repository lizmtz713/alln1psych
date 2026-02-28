/**
 * Personology Engine — Relationship Intelligence
 * Uses the 48 week-born archetypes (Winter Seekers, Spring Builders, Summer Expressers, Fall Integrators).
 */

import { getArchetypeForBirthday, type Archetype } from '../data/archetypes';

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

function archetypeToPersonalityPeriod(a: Archetype): PersonalityPeriod {
  const comm = `${a.communicationStyle.respondsTo} Shuts down with: ${a.communicationStyle.shutsDownWith}`;
  return {
    name: a.name,
    range: a.weekRange,
    strengths: a.strengths.map((s) => s.toLowerCase()),
    challenges: a.growthEdges.map((e) => e.toLowerCase()),
    communicationStyle: comm,
    needsInRelationships: a.inRelationships.needs,
    stressResponse: a.underStress,
  };
}

/** Returns the 48-archetype personality for a birthday (ISO "YYYY-MM-DD"). */
export function getPersonality(birthday: string): PersonalityPeriod | null {
  const archetype = getArchetypeForBirthday(birthday);
  return archetype ? archetypeToPersonalityPeriod(archetype) : null;
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
