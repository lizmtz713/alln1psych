/**
 * Body scan zones: label, meaning, suggestion, and optional "talk prompt".
 */

export interface BodyZoneDef {
  id: string;
  label: string;
  meaning: string;
  suggestion: string;
}

export const BODY_ZONES: BodyZoneDef[] = [
  {
    id: 'head',
    label: 'Head',
    meaning: `Tension here often means overthinking, worry, or mental fatigue.`,
    suggestion: `Close your eyes and imagine your thoughts as clouds passing. Or write down the top 3 things on your mind.`,
  },
  {
    id: 'jaw',
    label: 'Jaw',
    meaning: `Clenching often means suppressed anger or stress.`,
    suggestion: `Let your jaw drop slightly. Massage your temples and the hinge of your jaw with your fingertips.`,
  },
  {
    id: 'throat',
    label: 'Throat',
    meaning: "Tightness here can mean you're holding back words — something unsaid.",
    suggestion: 'Take a sip of water. When you're ready, try writing or saying one thing you've been holding in.',
  },
  {
    id: 'chest',
    label: 'Chest',
    meaning: 'Heaviness or tightness often connects to grief, anxiety, or heartache.',
    suggestion: 'Place a hand on your chest and breathe slowly. Name one thing you're carrying.',
  },
  {
    id: 'stomach',
    label: 'Stomach',
    meaning: `Butterflies or knots usually mean nervousness, fear, or gut instinct.`,
    suggestion: `Breathe into your belly — 4 counts in, 4 out. Notice what your gut might be telling you.`,
  },
  {
    id: 'shoulders',
    label: 'Shoulders',
    meaning: `Tension here often means you're carrying too much — responsibility, stress, or burden.`,
    suggestion: `Roll your shoulders back 5 times and take a deep breath. Imagine setting down one load.`,
  },
  {
    id: 'arms',
    label: 'Arms',
    meaning: `Heaviness can mean exhaustion or wanting to reach out to someone.`,
    suggestion: `Stretch your arms up, then out. If you need connection, who could you text or call?`,
  },
  {
    id: 'hands',
    label: 'Hands',
    meaning: `Clenching often means frustration or wanting control. Tingling can mean anxiety.`,
    suggestion: `Open and close your hands slowly. Press your palms together, then release.`,
  },
  {
    id: 'legs',
    label: 'Legs',
    meaning: `Restlessness often means you want to run — from a situation, a feeling, or a conversation.`,
    suggestion: `If you can, take a short walk or shake out your legs. Movement can help the feeling move through.`,
  },
];
