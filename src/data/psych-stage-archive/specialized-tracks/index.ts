// Specialized Tracks - Index
// Import all specialized scenario tracks

export * from './lgbtq-scenarios';
export * from './neurodivergent-scenarios';
export * from './cultural-scenarios';
export * from './grief-scenarios';
export * from './recovery-scenarios';
export * from './chronic-illness-scenarios';

// Re-export combined helpers
import { LGBTQ_SCENARIOS, getLGBTQScenariosByAge } from './lgbtq-scenarios';
import { NEURODIVERGENT_SCENARIOS, getNeurodivergentScenariosByAge, getADHDScenarios, getAutismScenarios } from './neurodivergent-scenarios';
import { CULTURAL_SCENARIOS, getCulturalScenariosByAge } from './cultural-scenarios';
import { GRIEF_SCENARIOS, getGriefScenariosByAge } from './grief-scenarios';
import { RECOVERY_SCENARIOS, getRecoveryScenariosByAge } from './recovery-scenarios';
import { CHRONIC_ILLNESS_SCENARIOS, getChronicIllnessScenariosByAge } from './chronic-illness-scenarios';

export const ALL_SPECIALIZED_SCENARIOS = [
  ...LGBTQ_SCENARIOS,
  ...NEURODIVERGENT_SCENARIOS,
  ...CULTURAL_SCENARIOS,
  ...GRIEF_SCENARIOS,
  ...RECOVERY_SCENARIOS,
  ...CHRONIC_ILLNESS_SCENARIOS,
];

export interface SpecializedTrack {
  id: string;
  name: string;
  emoji: string;
  description: string;
  scenarioCount: number;
  ageRange: [number, number];
  tags: string[];
}

export const SPECIALIZED_TRACKS: SpecializedTrack[] = [
  {
    id: 'lgbtq',
    name: 'LGBTQ+',
    emoji: '🏳️‍🌈',
    description: 'Coming out, identity, relationships, family acceptance, navigating a straight world',
    scenarioCount: LGBTQ_SCENARIOS.length,
    ageRange: [11, 30],
    tags: ['identity', 'coming out', 'relationships', 'family'],
  },
  {
    id: 'neurodivergent',
    name: 'Neurodivergent',
    emoji: '🧠',
    description: 'ADHD, autism, executive dysfunction, sensory needs, unmasking, self-advocacy',
    scenarioCount: NEURODIVERGENT_SCENARIOS.length,
    ageRange: [11, 35],
    tags: ['adhd', 'autism', 'sensory', 'advocacy'],
  },
  {
    id: 'cultural',
    name: 'Cultural & Heritage',
    emoji: '🌍',
    description: 'First-generation experiences, cultural identity, navigating multiple cultures',
    scenarioCount: CULTURAL_SCENARIOS.length,
    ageRange: [10, 40],
    tags: ['culture', 'identity', 'family', 'immigration'],
  },
  {
    id: 'grief',
    name: 'Grief & Loss',
    emoji: '💔',
    description: 'Death, loss, divorce, major life changes, processing grief',
    scenarioCount: GRIEF_SCENARIOS.length,
    ageRange: [6, 80],
    tags: ['grief', 'loss', 'death', 'change'],
  },
  {
    id: 'chronic-illness',
    name: 'Chronic Illness',
    emoji: '🩺',
    description: 'Living with chronic conditions, invisible illness, self-advocacy in healthcare',
    scenarioCount: CHRONIC_ILLNESS_SCENARIOS.length,
    ageRange: [12, 70],
    tags: ['health', 'disability', 'advocacy', 'relationships'],
  },
  {
    id: 'recovery',
    name: 'Recovery & Sobriety',
    emoji: '🌱',
    description: 'Addiction recovery, navigating sobriety, support systems, relapse prevention',
    scenarioCount: RECOVERY_SCENARIOS.length,
    ageRange: [16, 70],
    tags: ['recovery', 'sobriety', 'addiction', 'support'],
  },
];

export const getSpecializedScenariosByTrack = (trackId: string, age?: number) => {
  switch (trackId) {
    case 'lgbtq':
      return age ? getLGBTQScenariosByAge(age) : LGBTQ_SCENARIOS;
    case 'neurodivergent':
      return age ? getNeurodivergentScenariosByAge(age) : NEURODIVERGENT_SCENARIOS;
    case 'cultural':
      return age ? getCulturalScenariosByAge(age) : CULTURAL_SCENARIOS;
    case 'grief':
      return age ? getGriefScenariosByAge(age) : GRIEF_SCENARIOS;
    case 'recovery':
      return age ? getRecoveryScenariosByAge(age) : RECOVERY_SCENARIOS;
    case 'chronic-illness':
      return age ? getChronicIllnessScenariosByAge(age) : CHRONIC_ILLNESS_SCENARIOS;
    default:
      return [];
  }
};

export const getAllSpecializedScenariosByAge = (age: number) => {
  return [
    ...getLGBTQScenariosByAge(age),
    ...getNeurodivergentScenariosByAge(age),
    ...getCulturalScenariosByAge(age),
    ...getGriefScenariosByAge(age),
    ...getRecoveryScenariosByAge(age),
    ...getChronicIllnessScenariosByAge(age),
  ];
};
