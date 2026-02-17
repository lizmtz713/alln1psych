/**
 * Personology — Relationship Intelligence (stub).
 * Birthday-based personality and relationship dynamics.
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

function monthFromIso(iso: string): number {
  if (!iso || iso.length < 7) return 0;
  const m = parseInt(iso.slice(5, 7), 10);
  return isNaN(m) ? 0 : m;
}

export function getPersonality(birthdayIso: string): PersonalityPeriod | null {
  const month = monthFromIso(birthdayIso);
  if (month < 1 || month > 12) return null;
  const names = ['The Architect', 'The Visionary', 'The Empath', 'The Initiator', 'The Builder', 'The Communicator', 'The Nurturer', 'The Leader', 'The Harmonizer', 'The Strategist', 'The Innovator', 'The Sage'];
  return {
    name: names[month - 1] ?? 'Unknown',
    range: new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' }),
    strengths: ['insightful', 'adaptable'],
    challenges: ['sensitive to stress'],
    communicationStyle: 'Direct and thoughtful.',
    needsInRelationships: 'Honesty and space.',
    stressResponse: 'May withdraw to process.',
  };
}

export function getRelationshipDynamic(myIso: string, theirIso: string): RelationshipDynamic {
  return {
    strengths: ['Different perspectives can complement each other'],
    frictionPoints: ['Communication style differences'],
    communicationTip: 'Listen first, then respond.',
    conflictPattern: 'Take a pause before reacting.',
    whatTheyNeed: 'To feel heard.',
    whatYouNeed: 'To feel respected.',
  };
}
