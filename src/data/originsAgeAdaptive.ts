/**
 * Age-Adaptive Prompts for Origins Content
 * 
 * The Origins lessons (parent wounds, attachment, healing) need to land differently
 * for different ages. A 16-year-old still living at home needs different framing
 * than a 35-year-old processing childhood from a distance.
 * 
 * Integrates with existing age-adaptive system from Feb 28 build.
 */

import type { OriginsLesson } from './originsContent';

export type AgeTier = 'teen' | 'youngAdult' | 'adult' | 'mature' | 'senior';

export interface AgeAdaptiveOrigins {
  tier: AgeTier;
  ageRange: string;
  
  // How to frame parent content for this age
  framingNotes: string;
  
  // What to emphasize
  emphasis: string[];
  
  // What to be careful about
  cautions: string[];
  
  // Modified language examples
  languageExamples: {
    original: string;
    adapted: string;
  }[];
  
  // Additional resources for this age
  additionalResources?: string[];
}

export const ORIGINS_AGE_ADAPTATIONS: Record<AgeTier, AgeAdaptiveOrigins> = {
  teen: {
    tier: 'teen',
    ageRange: '13-17",
    
    framingNotes: `Teens may still be living with the parents being discussed. Focus on:
- Validation without encouraging conflict
- Safety planning if home isn't safe
- Building support outside the home
- Hope that things can change when they have more autonomy
- NEVER encourage running away or unsafe choices`,
    
    emphasis: [
      "You won\'t be in this situation forever',
      'It\'s not your job to fix your parents',
      'Finding safe adults outside home is okay',
      'Your feelings are valid even if you can\'t change the situation yet',
      'Building skills now for when you have more choices',
    ],
    
    cautions: [
      'Don\'t frame leaving/cutting off parents as immediate option',
      'Be careful about boundary advice when they have no power to enforce',
      'Watch for signs they need crisis resources (abuse, neglect)',
      'Don\'t put them in position of confronting abusive parents',
      'Emphasize safety over processing if home is dangerous',
    ],
    
    languageExamples: [
      {
        original: 'You can choose to limit contact with your parents.',
        adapted: 'Right now you might not have control over contact. But you can start building a life and support system that\'s yours. When you\'re older, you\'ll have more choices.',
      },
      {
        original: 'Set a boundary with your mother.',
        adapted: 'Sometimes we can\'t set boundaries yet because it\'s not safe or we don\'t have that power. What you CAN do is notice what\'s happening and start imagining what you\'ll do differently when you can.',
      },
      {
        original: 'Your parents\' issues aren\'t your responsibility.',
        adapted: 'You might feel like you have to manage your parents\' emotions or problems. That\'s a lot to carry. It\'s okay to find people outside your home who can support YOU.',
      },
    ],
    
    additionalResources: [
      'Crisis Text Line: Text HOME to 741741',
      'Childhelp National Child Abuse Hotline: 1-800-422-4453',
      'Boys Town National Hotline: 1-800-448-3000 (for all teens)',
      'The Trevor Project: 1-866-488-7386 (LGBTQ+ youth)',
    ],
  },
  
  youngAdult: {
    tier: 'youngAdult',
    ageRange: '18-25",
    
    framingNotes: `This is the PRIMARY demographic for Origins content. They're:
- Often just gaining autonomy
- Processing childhood from new perspective
- May be financially dependent still
- Figuring out what relationships to maintain
- Most likely to share with friends in similar situations`,
    
    emphasis: [
      "You\'re not broken — your survival strategies made sense',
      'You have choices now that you didn\'t have as a kid',
      'Your friends are probably dealing with similar stuff',
      'Therapy is great but this is a start you can afford',
      'Breaking the cycle is possible and starts with awareness',
    ],
    
    cautions: [
      'Don\'t assume they\'re fully independent (many still need family support)',
      'Acknowledge financial/practical entanglement with family',
      'Watch for black-and-white thinking (cutting off vs. enmeshment)',
      'Self-medication section is especially relevant — handle carefully',
    ],
    
    languageExamples: [
      {
        original: 'Your attachment style formed in childhood.',
        adapted: 'Your attachment style formed before you had any say in the matter. And it\'s probably why your relationships have felt a certain way. The good news? Now that you can see it, you can work with it.',
      },
      {
        original: 'Consider limiting contact with toxic family members.',
        adapted: 'You might not be able to fully cut contact yet — maybe you need their support, or it\'s just complicated. That\'s okay. You can create emotional distance even when physical distance isn\'t possible.',
      },
      {
        original: 'Practice self-compassion.',
        adapted: 'I know "self-compassion" sounds like something your therapist would say. But real talk: the voice in your head that\'s always criticizing you? That\'s probably your parent\'s voice. You can start talking back to it.',
      },
    ],
  },
  
  adult: {
    tier: 'adult',
    ageRange: '26-45",
    
    framingNotes: `Adults often come to this work because:
- They're becoming parents themselves
- Relationships are struggling
- Therapy surfaced family-of-origin stuff
- They have more distance and capacity to process`,
    
    emphasis: [
      "It\'s never too late to understand your patterns',
      'This work affects your current relationships and parenting',
      'You can reparent yourself at any age',
      'Understanding parents doesn\'t mean excusing them',
      'You\'re breaking cycles for the next generation',
    ],
    
    cautions: [
      'May have more complicated family dynamics (aging parents, inheritance, etc.)',
      'Could be triggered by their own parenting',
      'May have done therapy before — don\'t be basic',
      'Might have siblings with different experiences of same parents',
    ],
    
    languageExamples: [
      {
        original: 'Your nervous system adapted to your childhood environment.',
        adapted: 'By now you\'ve probably noticed patterns in yourself that don\'t seem to make sense. They made sense once — in the environment you grew up in. Your nervous system was just doing its job.',
      },
      {
        original: 'You\'re not your parents.',
        adapted: 'If you have kids, you\'ve probably caught yourself sounding just like your mother or father — and it scared you. Here\'s the truth: awareness alone changes the game. You\'re already not them, because you\'re paying attention.',
      },
    ],
  },
  
  mature: {
    tier: 'mature',
    ageRange: '46-65',
    
    framingNotes: `At this stage:
- Parents may be aging, ill, or deceased
- Grief and processing often intertwined
- May be reconsidering relationships after decades
- Could be supporting their own adult children through this`,
    
    emphasis: [
      'It\'s never too late to heal',
      'Understanding can come at any age',
      'You can grieve and process even after parents are gone',
      'Your experience can help the younger generations',
      'Forgiveness is optional — understanding is for you',
    ],
    
    cautions: [
      'Don\'t assume they should "be over it by now"',
      'Aging/dying parents complicate boundary-setting',
      'May feel guilt for "speaking ill" of parents',
      'Could have decades of coping mechanisms to work with',
    ],
    
    languageExamples: [
      {
        original: 'Your attachment style formed in childhood.',
        adapted: 'You\'ve spent decades in relationships shaped by patterns you didn\'t choose. It\'s not too late to understand them. Sometimes it takes this long to have the space and safety to look back clearly.',
      },
      {
        original: 'Set boundaries with your parents.',
        adapted: 'At this stage, your parents might be aging, ill, or gone. Boundaries might look different — maybe it\'s about how much you give, or how you engage with siblings, or what you\'re willing to do as a caregiver. You still get to protect yourself.',
      },
    ],
  },
  
  senior: {
    tier: 'senior',
    ageRange: '65+',
    
    framingNotes: `Seniors engaging with this content are often:
- Processing after parents have passed
- Looking back on life with new perspective
- Wanting to understand their own patterns before passing them to grandchildren
- May have more acceptance and distance`,
    
    emphasis: [
      'Wisdom comes from looking back with clarity',
      'Your understanding can be a gift to younger generations',
      'Healing has no expiration date',
      'You can hold compassion for your parents AND yourself',
      'Your story matters',
    ],
    
    cautions: [
      'Don\'t be condescending',
      'They may have processing skills from decades of life',
      'Respect their era\'s different norms around family',
      'May be more focused on legacy than personal healing',
    ],
    
    languageExamples: [
      {
        original: 'Your parents did their best with what they had.',
        adapted: 'Looking back across the decades, you can probably see how your parents were shaped by their own time and circumstances. Understanding this doesn\'t erase how it affected you — but it might bring a kind of peace.',
      },
      {
        original: 'Break the cycle.',
        adapted: 'You\'ve already lived most of your life. But understanding your patterns can still matter — for your own peace, and for what you share with children and grandchildren. Wisdom is seeing clearly, and it\'s never too late for that.',
      },
    ],
  },
};

/**
 * Get age-adaptive framing for a specific lesson
 */
export function getAdaptedOriginsContent(
  lesson: OriginsLesson,
  ageTier: AgeTier
): {
  lesson: OriginsLesson;
  adaptation: AgeAdaptiveOrigins;
  safetyNote?: string;
} {
  const adaptation = ORIGINS_AGE_ADAPTATIONS[ageTier];
  
  // Add safety note for teens on sensitive content
  let safetyNote: string | undefined;
  if (ageTier === 'teen') {
    if (lesson.category === 'father' || lesson.category === 'mother') {
      safetyNote = 'If your home situation feels unsafe, please reach out to a trusted adult or contact the Crisis Text Line (text HOME to 741741). Your safety comes first.';
    }
  }
  
  return {
    lesson,
    adaptation,
    safetyNote,
  };
}

/**
 * AI prompt addition for Origins content
 */
export function getOriginsAIPromptAddition(ageTier: AgeTier): string {
  const adaptation = ORIGINS_AGE_ADAPTATIONS[ageTier];
  
  return `
## Origins/Family Content Guidelines for ${adaptation.ageRange} age group:

${adaptation.framingNotes}

### Emphasize:
${adaptation.emphasis.map(e => `- ${e}`).join('\n')}

### Be careful about:
${adaptation.cautions.map(c => `- ${c}`).join('\n')}

### Language adaptation examples:
${adaptation.languageExamples.map(ex => `
Instead of: "${ex.original}"
Say: "${ex.adapted}"
`).join('\n')}

${adaptation.additionalResources ? `
### Crisis resources to mention if needed:
${adaptation.additionalResources.map(r => `- ${r}`).join('\n')}
` : ''}
`;
}
