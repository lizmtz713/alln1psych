// Age-based content adaptation system
// Everything in VIBE scales to the user's developmental stage

export type AgeStage = 'early' | 'mid' | 'late' | 'young-adult';

export interface AgeStageConfig {
  id: AgeStage;
  label: string;
  ageRange: string;
  description: string;
  
  // Content style guide
  style: {
    vocabulary: 'simple' | 'moderate' | 'advanced';
    sentenceLength: 'short' | 'medium' | 'longer';
    abstractConcepts: boolean;
    scienceDepth: 'basics' | 'some-detail' | 'full-detail';
    exampleTypes: string[];
  };
}

export const AGE_STAGES: AgeStageConfig[] = [
  {
    id: 'early',
    label: 'Early Teen',
    ageRange: '12-14',
    description: 'Middle school vibes',
    style: {
      vocabulary: 'simple',
      sentenceLength: 'short',
      abstractConcepts: false,
      scienceDepth: 'basics',
      exampleTypes: ['school', 'friends', 'family', 'hobbies', 'social media'],
    },
  },
  {
    id: 'mid',
    label: 'Mid Teen',
    ageRange: '15-16',
    description: 'High school energy',
    style: {
      vocabulary: 'moderate',
      sentenceLength: 'medium',
      abstractConcepts: true,
      scienceDepth: 'some-detail',
      exampleTypes: ['school pressure', 'relationships', 'identity', 'future planning', 'social dynamics'],
    },
  },
  {
    id: 'late',
    label: 'Late Teen',
    ageRange: '17-18',
    description: 'Almost adult',
    style: {
      vocabulary: 'advanced',
      sentenceLength: 'longer',
      abstractConcepts: true,
      scienceDepth: 'full-detail',
      exampleTypes: ['college/career', 'serious relationships', 'independence', 'adult responsibilities', 'identity formation'],
    },
  },
  {
    id: 'young-adult',
    label: 'Young Adult',
    ageRange: '19-24',
    description: 'Adulting begins',
    style: {
      vocabulary: 'advanced',
      sentenceLength: 'longer',
      abstractConcepts: true,
      scienceDepth: 'full-detail',
      exampleTypes: ['work/career', 'adult relationships', 'financial stress', 'life transitions', 'self-discovery'],
    },
  },
];

// Helper to get stage from age
export function getStageFromAge(age: number): AgeStage {
  if (age <= 14) return 'early';
  if (age <= 16) return 'mid';
  if (age <= 18) return 'late';
  return 'young-adult';
}

// Helper to get config
export function getStageConfig(stage: AgeStage): AgeStageConfig {
  return AGE_STAGES.find(s => s.id === stage) || AGE_STAGES[1]; // default to mid
}
