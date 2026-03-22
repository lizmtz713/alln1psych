/**
 * Family Edition — Pre-Flight & Post-Flight Rituals
 * Domain: rituals/ | Delivered as micro-lessons in the learn/ stack.
 * Spec: docs/FAMILY_EDITION_SPEC.md (Rituals section)
 */

import type { HumanManualLesson } from './humanManual';

/** Micro-lesson shape for learn/ (id, title, domain, content, action). Used by Family Fleet ritual cards. */
export interface FamilyRitualMicroLesson {
  id: string;
  title: string;
  domain: 'Learn';
  content: string;
  action: string;
}

/** Pre-Flight + Post-Flight as simple micro-lessons (e.g. for JSON or lightweight UI). */
export const FAMILY_RITUALS_MICRO_LESSONS: FamilyRitualMicroLesson[] = [
  {
    id: 'family-pre-flight',
    title: 'The Pre-Flight Ritual',
    domain: 'Learn",
    content:
      \"A family is a fleet. Before you hit the road, check your telemetry. If one car is in Red, the whole fleet slows down to help. This isn't a delay; it"s maintenance.",
    action: 'Open Cockpit and sync gauges with Ground Control.',
  },
  {
    id: 'family-post-flight',
    title: 'The Post-Flight Ritual',
    domain: 'Learn',
    content:
      "At dinner or before bed: Odometer Check (smoothest part of the day?), Pothole Report (anyone hit Red—did the system stabilize?), and Mechanic's Thanks (thank a fleet member for something specific). Narrative-first closes the loop.",
    action: 'Run the Post-Flight prompts with your fleet at dinner or before bed.',
  },
];

/** Full Human Manual–compatible lessons for the learn tab (Family Fleet / Rituals category). */
export const familyRitualsLessons: HumanManualLesson[] = [
  {
    id: 'family-pre-flight',
    title: 'The Pre-Flight Ritual',
    category: 'family-fleet',
    duration: 2,
    emoji: '🛫",
    content: {
      introduction: `A family is a fleet. Before you hit the road, check your telemetry. This 60-second morning check-in isn't \"What are you doing today?\" — it"s "What is your engine"s capacity?\" If one car is in Red, the whole fleet slows down to help. This isn't a delay; it"s maintenance.`,
      keyInsights: [
        {
          title: 'Step 1: Gauge Scan',
          explanation: 'Everyone logs Body and State gauges so the fleet has a shared picture.',
        },
        {
          title: 'Step 2: Fleet Forecast',
          explanation:
            "The app shows Ground Control (e.g. parents): 'The fleet is 66% Green. Pilot A is in Amber (Low State). Recommend Low-RPM communication until after 4:00 PM.'",
        },
        {
          title: 'Step 3: Driving Style",
          explanation:
            \"Each member chooses: Support Vehicle (I have extra capacity to help), Solo Navigator (I need space to focus), or Maintenance Mode (I am low on fuel; please don't push).\",
        },
      ],
      whatHelps: ["Open Cockpit and sync gauges with Ground Control each morning.'],
    },
    reflectionQuestions: [
      'Which Driving Style do you need most often?',
      'How does knowing the fleet forecast change how you approach the day?',
    ],
    relatedLessons: ['family-post-flight'],
  },
  {
    id: 'family-post-flight',
    title: 'The Post-Flight Ritual',
    category: 'family-fleet',
    duration: 3,
    emoji: '🛬',
    content: {
      introduction: `At dinner or before bed, the fleet does a repair ritual. This is narrative-building and closing the loop (Rule 7: Narrative-First). It turns the day into a story the family shares instead of scattered stress.`,
      keyInsights: [
        {
          title: 'Odometer Check',
          explanation: '"What was the smoothest part of the road today?" — start with what worked.',
        },
        {
          title: 'Pothole Report',
          explanation:
            '"Did anyone\'s gauge hit Red? If so, did the system stabilize or stall?" — name the bumps without blame.',
        },
        {
          title: "Mechanic's Thanks",
          explanation:
            'Thank another fleet member for a specific action. Script: "I noticed your Connection gauge was low and you gave me space. Thanks for checking the telemetry."',
        },
      ],
      whatHelps: ['Run the three prompts (Odometer, Pothole, Mechanic\'s Thanks) at dinner or before bed.'],
    },
    reflectionQuestions: [
      'Who in your fleet could use a Mechanic\'s Thanks from you tonight?',
      'What was one pothole that stabilized instead of stalling?',
    ],
    relatedLessons: ['family-pre-flight'],
  },
];
