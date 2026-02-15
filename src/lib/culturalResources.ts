/**
 * Culturally relevant crisis resources.
 * Show universal first, then resources matching user's cultural background.
 */

export interface CrisisResource {
  name: string;
  number?: string;
  url?: string;
  subtitle: string;
  cultures?: string[]; // keys that match user's culturalBackground (normalized)
}

/** Map onboarding chip labels to resource culture keys */
export function culturalLabelToKey(label: string): string {
  const map: Record<string, string> = {
    'Latino/Hispanic': 'latino-hispanic',
    'Black/African American': 'black-african-american',
    'Asian/Pacific Islander': 'asian-pacific-islander',
    'South Asian': 'south-asian',
    'Indigenous/Native': 'indigenous-native',
    'Immigrant family': 'immigrant-family',
    'First-generation American': 'first-gen',
    'Military family': 'military-family',
  };
  return map[label] ?? label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export const CULTURAL_RESOURCES: CrisisResource[] = [
  { name: '988 Suicide & Crisis Lifeline', number: '988', subtitle: 'Available in English and Spanish' },
  { name: 'Crisis Text Line', number: '741741', subtitle: 'Text HOME' },
  { name: 'SAMHSA National Helpline', number: '1-800-662-4357', subtitle: 'Free, confidential, 24/7 — Spanish available', cultures: ['latino-hispanic'] },
  { name: 'NAMI en Español', number: '1-800-950-6264', subtitle: 'Press 2 for Spanish', cultures: ['latino-hispanic'] },
  { name: 'Black Mental Health Alliance', url: 'https://blackmentalhealth.com', subtitle: 'Culturally relevant resources', cultures: ['black-african-american'] },
  { name: 'Therapy for Black Girls', url: 'https://therapyforblackgirls.com', subtitle: 'Find a therapist who gets it', cultures: ['black-african-american'] },
  { name: 'Asian Mental Health Collective', url: 'https://asianmhc.org', subtitle: 'Therapist directory', cultures: ['asian-pacific-islander', 'south-asian'] },
  { name: 'Trans Lifeline', number: '877-565-8860', subtitle: 'By and for trans people', cultures: ['lgbtq'] },
  { name: 'Trevor Project', number: '866-488-7386', subtitle: 'LGBTQ+ youth', cultures: ['lgbtq'] },
  { name: 'Veterans Crisis Line', number: '988', subtitle: 'Press 1 for veterans', cultures: ['military-family'] },
  { name: 'StrongHearts Native Helpline', number: '1-844-762-8483', subtitle: 'For Native Americans', cultures: ['indigenous-native'] },
];

export function getRelevantResources(culturalBackground: string[]): CrisisResource[] {
  const keys = new Set(culturalBackground.map(culturalLabelToKey));
  const universal = CULTURAL_RESOURCES.filter((r) => !r.cultures || r.cultures.length === 0);
  const culturallySpecific = CULTURAL_RESOURCES.filter(
    (r) => r.cultures?.some((c) => keys.has(c) || culturalBackground.some((cb) => culturalLabelToKey(cb) === c))
  );
  return [...culturallySpecific, ...universal];
}
