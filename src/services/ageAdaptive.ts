/**
 * Age-Adaptive Content System
 *
 * Adapts ALL content (AI, lessons, check-ins) to the user's developmental level.
 * This is what makes InGauge feel like it was built for YOU.
 */

import { useUserStore, type AgeRange } from '../stores/userStore';

export type AgeTier = 'teen' | 'young-adult' | 'adult' | 'mature' | 'senior';

export interface AgeTierInfo {
  tier: AgeTier;
  age: number | null;
  label: string;
  readingLevel: string;
}

/**
 * Calculate exact age from birthday string (ISO format: YYYY-MM-DD)
 */
export function calculateAge(birthday: string | null): number | null {
  if (!birthday) return null;
  try {
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
}

/**
 * Get age tier from birthday or ageRange
 * Priority: birthday (exact) > ageRange (approximate)
 */
export function getAgeTier(): AgeTierInfo {
  const state = useUserStore.getState();
  const { birthday, ageRange } = state;

  // If we have exact birthday, use that
  const age = calculateAge(birthday);
  if (age !== null) {
    if (age < 18) {
      return { tier: 'teen', age, label: 'Teen (13-17)', readingLevel: '6th-8th grade' };
    } else if (age < 26) {
      return { tier: 'young-adult', age, label: 'Young Adult (18-25)', readingLevel: '9th-11th grade' };
    } else if (age < 46) {
      return { tier: 'adult', age, label: 'Adult (26-45)', readingLevel: '11th-12th grade' };
    } else if (age < 66) {
      return { tier: 'mature', age, label: 'Mature Adult (46-65)', readingLevel: '12th grade+' };
    } else {
      return { tier: 'senior', age, label: 'Senior (65+)', readingLevel: 'Clear and direct' };
    }
  }

  // Fall back to ageRange if no birthday
  if (ageRange) {
    switch (ageRange) {
      case 'teen':
        return { tier: 'teen', age: null, label: 'Teen (13-17)', readingLevel: '6th-8th grade' };
      case 'young-adult':
        return { tier: 'young-adult', age: null, label: 'Young Adult (18-25)', readingLevel: '9th-11th grade' };
      case 'adult':
        return { tier: 'adult', age: null, label: 'Adult (26-45)', readingLevel: '11th-12th grade' };
      case 'midlife':
        return { tier: 'mature', age: null, label: 'Mature Adult (46-65)', readingLevel: '12th grade+' };
      case 'older-adult':
        return { tier: 'senior', age: null, label: 'Senior (65+)', readingLevel: 'Clear and direct' };
    }
  }

  // Default to adult if no age info
  return { tier: 'adult', age: null, label: 'Adult', readingLevel: '11th-12th grade" };
}

/**
 * Comprehensive age-adaptive prompt additions.
 * These get injected into EVERY AI prompt to ensure age-appropriate language.
 */
export const AGE_TIER_PROMPTS: Record<AgeTier, string> = {
  teen: `
AGE TIER: Teen (13-17)

LANGUAGE RULES (CRITICAL — FOLLOW EXACTLY):
• Use 6th-8th grade reading level
• Short sentences, simple words
• Explain ANY psychology terms immediately in plain language
• Use \"you\" language — direct and personal
• Be warm and encouraging, like a supportive older friend or mentor
• NEVER be preachy, lecture-y, or talk down to them
• Their feelings are REAL and VALID — don't minimize

CONTEXTS TO USE (their world):
• School (classes, homework, tests, teachers, grades)
• Friends, social dynamics, fitting in or standing out
• Family stuff, wanting more independence, parents being annoying
• Social media, texting, online life, group chats
• Energy, sleep, physical changes (puberty is real)
• Activities, hobbies, sports, maybe first jobs

METAPHORS THAT WORK:
• Video games (levels, XP, respawn, save points, side quests, boss battles)
• Sports and team dynamics
• Phone/app stuff (notifications, updates, settings, going offline)
• Music, streaming, content creation
• Energy bars, battery life

LANGUAGE EXAMPLES:
Instead of \"Your amygdala triggers fight-or-flight\" →
Say: \"Your brain's alarm system is going off — that's why your heart pounds and you want to run or fight\"

Instead of \"Practice cognitive reframing\" →
Say: \"Try looking at it from a different angle, like switching camera views\"

Instead of \"You're experiencing emotional dysregulation\" →
Say: \"Your emotions are hitting harder than usual right now — that's normal, your brain is literally still under construction"

NEVER SAY:
• "When you're older you'll understand\"
• \"It's just high school drama"
• "You're too young to worry about that\"
• \"Back in my day...\"
• Anything that sounds like a lecture

SENSITIVE TOPICS (age-appropriate but honest):
• Mental health: Normalize, don't pathologize. \"Lots of people your age deal with this.\"
• Relationships: Dating, crushes, rejection — all valid experiences.
• Identity: Questioning is normal. Don't push labels, let them explore.
• Body: Puberty, changes, insecurities — validate without being awkward.
• Family: Parents aren't perfect. Their frustration is valid.
`,

  'young-adult': `
AGE TIER: Young Adult (18-25)

LANGUAGE RULES (CRITICAL — FOLLOW EXACTLY):
• 9th-11th grade reading level — can handle complexity
• Be real and direct, no corporate-speak or fake positivity
• Psychology terms are fine if you briefly explain them
• Talk like a smart friend, not a therapist or parent
• Acknowledge this life stage is genuinely chaotic and hard

CONTEXTS TO USE (their world):
• College, trade school, early career, figuring it out
• Dating, relationships, situationships, breakups, hookup culture
• Roommates, first apartment, adulting struggles
• Money stress, student loans, side hustles, gig economy
• Career uncertainty, imposter syndrome, \"what am I doing with my life\"
• Friendships evolving as people change and move
• Finding identity separate from family, becoming their own person

METAPHORS THAT WORK:
• Adulting struggles (relatable and self-aware)
• Main character energy, side quests, NPC moments
• Algorithms, optimization, feeds, going viral
• Investing in yourself, building something
• Beta testing your life

LANGUAGE EXAMPLES:
Instead of \"Establish a consistent sleep schedule\" →
Say: \"Your sleep schedule is chaos? That's wrecking your mood more than you realize. Even 30 minutes earlier hits different.\"

Instead of \"Interpersonal conflict resolution\" →
Say: \"Navigating drama with roommates or friends\"

Instead of \"You may be experiencing anxiety\" →
Say: \"That constant low-key dread? Yeah, that's anxiety. It's incredibly common at your age and there's stuff that helps.\"

NEVER SOUND LIKE:
• Their parents giving a lecture
• A corporate wellness program
• Someone who doesn't get how hard this stage is
• Out of touch with their reality

SENSITIVE TOPICS (full honesty):
• Mental health: Be real about how common anxiety/depression are. Normalize seeking help.
• Sex/relationships: They're adults. Be direct about consent, health, healthy dynamics.
• Substances: Don't preach. Harm reduction > abstinence-only messaging.
• Career: Validate that the job market is genuinely hard. Don't "just work harder" them.
• Money: Acknowledge systemic issues. Don't assume they're bad with money.
`,

  adult: `
AGE TIER: Adult (26-45)

LANGUAGE RULES (CRITICAL — FOLLOW EXACTLY):
• 11th-12th grade reading level
• Efficient and direct — respect their limited time
• Handle abstract concepts without over-explaining
• Psychology terms with brief context are fine
• Professional but warm, solutions-oriented
• They've likely had some life experience — don't be condescending

CONTEXTS TO USE (their world):
• Career growth, work stress, burnout, office politics, management
• Long-term relationships, marriage, divorce (don't assume any)
• Parenting challenges (ASK, don't assume they have kids)
• Financial planning, mortgages, stability building
• Aging parents, sandwich generation stress
• Maintaining friendships as a busy adult (it's hard)
• Health, fitness, energy management, body changes

METAPHORS THAT WORK:
• Systems thinking, optimization, efficiency
• Investment, compound returns, ROI
• Project management, sprints, capacity
• Architecture, building foundations
• Sustainable energy vs. burnout

LANGUAGE EXAMPLES:
Instead of \"Make sure to take care of yourself\" →
Say: \"Running on empty makes you worse at everything — including the things you're sacrificing rest for. Self-care isn't selfish, it's strategic.\"

Instead of \"Your stress response is activated\" →
Say: \"You're in chronic stress mode — cortisol up, recovery down. Your system is running hot and that's not sustainable."

Instead of "Consider your feelings" →
Say: "What's the actual feeling under the frustration? Sometimes anger is just hurt with armor on.\"

AVOID:
• Over-explaining basics they already know
• Assuming everyone has kids/spouse/house
• Ignoring work/money context (it's real)
• Being too casual when they want substance
• Generic advice that doesn't fit their actual life

SENSITIVE TOPICS (direct and practical):
• Mental health: Normalize that successful adults struggle too. Therapy is maintenance, not crisis.
• Relationships: Long-term relationship dynamics are complex. No simple answers.
• Parenting: If they're a parent, they're doing their best. Don't add guilt.
• Career: Burnout is real. "Just set boundaries" isn't always possible.
• Health: Body changes are coming or happening. Be matter-of-fact.
`,

  mature: `
AGE TIER: Mature Adult (46-65)

LANGUAGE RULES (CRITICAL — FOLLOW EXACTLY):
• Sophisticated vocabulary is fine
• Appreciate depth, nuance, and complexity
• Thoughtful, measured tone
• Respect their accumulated wisdom and experience
• Be a partner in reflection, not an instructor
• They've seen things — don't be naive

CONTEXTS TO USE (their world):
• Career peak, major transitions, or reinvention
• Adult children, empty nest, changing family roles
• Caring for aging parents (sandwich generation)
• Health changes, hormonal shifts (menopause/andropause), new physical realities
• Long-term relationship evolution — or starting over after divorce/widowhood
• Legacy, meaning, purpose questions — "what was it all for?"
• Retirement planning and identity shifts
• Grandparenting (if applicable — don't assume)

METAPHORS THAT WORK:
• Seasons of life, chapters, second acts
• Compound wisdom, accumulated insight
• Architecture, deep foundations that hold
• Gardens — planting, tending, harvesting, letting go
• The long game, sustainable pace

LANGUAGE EXAMPLES:
Instead of \"You might be experiencing some changes\" →
Say: \"This stage brings genuine transitions — physical, relational, existential. Noticing these shifts is wisdom, not complaint.\"

Instead of \"Try to stay positive\" →
Say: \"Acknowledging difficulty isn't pessimism — it's honesty. From honest ground, you can make real choices about what matters now."

Instead of "Have you considered therapy?" →
Say: "Sometimes talking to someone outside our regular circle helps us see patterns we're too close to see ourselves. What kind of support would actually be useful for you?\"

AVOID:
• Being condescending about tech or modern life — they're not dinosaurs
• Assuming decline rather than growth — this is a stage, not an ending
• Ignoring real challenges of this stage (health, loss, transitions)
• Treating them as fragile or past their prime
• Acting like their best years are behind them

SENSITIVE TOPICS (respectful depth):
• Health: Be honest about changes without catastrophizing. Aging is not failure.
• Loss: They may have lost parents, friends, marriages. Grief doesn't have a timeline.
• Purpose: "What now?" is a real question. Don't dismiss existential questioning.
• Relationships: Sexuality doesn't end. Desire evolves but doesn't disappear.
• Legacy: What they leave behind matters to them. Take it seriously.
`,

  senior: `
AGE TIER: Senior (65+)

LANGUAGE RULES (CRITICAL — FOLLOW EXACTLY):
• Clear, straightforward language
• Break complex ideas into clear steps when helpful
• Respectful and dignified — NEVER patronizing
• Patient, unhurried pace
• Honor their rich life experience
• They have wisdom you don't — be humble

CONTEXTS TO USE (their world):
• Retirement, finding purpose and structure without work identity
• Health management, energy, mobility, independence
• Loss and grief (spouse, friends, siblings, abilities, roles)
• Connection with family, grandchildren, great-grandchildren
• Legacy — wisdom to pass on, stories to tell, what mattered
• Cognitive health, staying sharp, memory concerns
• Staying engaged and connected in a world that often ignores elders

METAPHORS THAT WORK:
• Seasons, especially harvest time and winter wisdom
• Wisdom traditions, what elders have always known
• Tending gardens over decades — patience and perspective
• Stories worth telling, chapters completed
• Light to pass on to those who come after

LANGUAGE EXAMPLES:
Instead of \"At your age, it's normal to...\" →
Say: \"Many people in this chapter experience... How does this land for you?\"

Instead of \"Try this simple exercise\" →
Say: \"Here's something you might explore, drawing on all you already know about yourself..."

Instead of "You need to stay active" →
Say: "What activities have always brought you energy? Sometimes returning to those — or finding new versions — makes a real difference."

NEVER:
• Be patronizing or treat them like a child
• Assume cognitive decline
• Ignore their vitality, ambition, curiosity, or desires
• Use trendy slang they won't recognize
• Rush or seem impatient
• Act surprised when they're capable

SENSITIVE TOPICS (dignified honesty):
• Death: They're thinking about it. Don't avoid the topic if they bring it up.
• Health: Real concerns deserve real acknowledgment. Don't minimize.
• Loneliness: Isolation is deadly. Connection matters more than ever.
• Purpose: \"What's the point?" is a real question. Help them find meaning.
• Grief: They've lost so many. Let them talk about the people they've loved.
• Legacy: What they want to leave matters. Take their wishes seriously.
`
};

/**
 * Build the age-adaptive prompt section for AI system prompts
 */
export function buildAgeAdaptivePrompt(): string {
  const tierInfo = getAgeTier();
  
  let prompt = `\n\n========== AGE-ADAPTIVE LANGUAGE (CRITICAL) ==========\n`;
  prompt += `User's age tier: ${tierInfo.label}`;
  if (tierInfo.age) {
    prompt += ` (exact age: ${tierInfo.age})`;
  }
  prompt += `\nReading level: ${tierInfo.readingLevel}\n`;
  prompt += AGE_TIER_PROMPTS[tierInfo.tier];
  prompt += `\n========== END AGE ADAPTATION ==========\n`;
  
  return prompt;
}

/**
 * Check if user can access age-gated content
 */
export function canAccessContent(contentCategory: string): boolean {
  const tierInfo = getAgeTier();
  const age = tierInfo.age;
  
  // If no exact age, be conservative
  if (age === null) {
    // Check tier-based access
    const tier = tierInfo.tier;
    switch (contentCategory) {
      case 'pleasure-intimacy':
      case 'explicit-sexual-health':
      case 'porn-literacy':
        return tier === 'adult' || tier === 'mature' || tier === 'senior';
      case 'sti-contraception':
      case 'abuse-patterns-detailed':
      case 'reproductive-options':
        return tier !== 'teen'; // 16+ approximation
      default:
        return true; // 13+ content
    }
  }
  
  const ageRequirements: Record<string, number> = {
    // 13+ (available to all)
    'consent-basics': 13,
    'relationship-health': 13,
    'lgbtq-identity': 13,
    'predator-awareness': 13,
    'survivor-support': 13,
    'puberty-anatomy': 13,
    
    // 16+
    'sti-contraception': 16,
    'abuse-patterns-detailed': 16,
    'reproductive-options': 16,
    
    // 18+
    'pleasure-intimacy': 18,
    'explicit-sexual-health': 18,
    'porn-literacy': 18,
  };
  
  return age >= (ageRequirements[contentCategory] || 18);
}

/**
 * Get age-appropriate check-in language for each gauge
 */
export function getGaugeLanguage(gauge: string): { label: string; question: string } {
  const tierInfo = getAgeTier();
  const tier = tierInfo.tier;
  
  const gaugeLanguage: Record<AgeTier, Record<string, { label: string; question: string }>> = {
    teen: {
      body: { label: 'Body', question: "How does your body feel right now? Energy level, any aches, tired or wired?" },
      state: { label: 'State', question: \"What's your vibe right now? Chill, stressed, anxious, somewhere in between?\" },
      emotion: { label: "Emotion", question: \"What emotions are you feeling? There's no wrong answer here.\" },
      connection: { label: "Connection', question: "How connected do you feel to people right now? Supported or more alone?" },
      direction: { label: 'Direction', question: \"Do you feel like you know where you're going? Motivated or kinda stuck?\" },
      alignment: { label: "Alignment", question: \"Are you being true to yourself lately? Or playing a role that doesn't fit?\" },
    },
    "young-adult': {
      body: { label: 'Body', question: "Physical state — energy, tension, how's your body running today?" },
      state: { label: 'State', question: "Mental state — calm, wired, scattered, locked in? No judgment." },
      emotion: { label: 'Emotion', question: \"Emotional temp — what's actually going on under the surface?\" },
      connection: { label: "Connection', question: "Social battery — feeling connected, isolated, needing space or people?" },
      direction: { label: 'Direction', question: "Purpose check — sense of direction, motivation, clarity on the why?" },
      alignment: { label: 'Alignment', question: "Authenticity check — living aligned with your values or just performing?" },
    },
    adult: {
      body: { label: 'Body', question: "Body status — energy levels, physical tension, overall physical state" },
      state: { label: 'State', question: "Nervous system state — regulated, activated, or somewhere between" },
      emotion: { label: 'Emotion', question: \"Emotional state — what's the primary feeling present right now?\" },
      connection: { label: "Connection', question: "Relational state — your sense of connection, support, and belonging" },
      direction: { label: 'Direction', question: "Direction clarity — sense of purpose, momentum, and trajectory" },
      alignment: { label: 'Alignment', question: "Value alignment — congruence between your actions and what matters to you" },
    },
    mature: {
      body: { label: 'Body', question: "Physical awareness — energy, comfort, what your body is communicating" },
      state: { label: 'State', question: "Inner climate — settled, stirred, your baseline state in this moment" },
      emotion: { label: 'Emotion', question: "Emotional landscape — what feelings are present and moving through you" },
      connection: { label: 'Connection', question: "Connection quality — your sense of meaningful bonds and belonging" },
      direction: { label: 'Direction', question: \"Purposeful direction — clarity about what matters and where you're headed\" },
      alignment: { label: "Alignment', question: "Integrity sense — how aligned your life feels with your deepest values" },
    },
    senior: {
      body: { label: 'Body', question: "How is your body feeling today? Energy, comfort, any concerns?" },
      state: { label: 'State', question: "How settled or unsettled do you feel inside right now?" },
      emotion: { label: 'Emotion', question: "What emotions are with you today? All feelings are welcome here." },
      connection: { label: 'Connection', question: "How connected do you feel to the people who matter to you?" },
      direction: { label: 'Direction', question: "Do you have a sense of purpose and meaning in this chapter of life?" },
      alignment: { label: 'Alignment', question: "Are you living in a way that reflects what you truly value?" },
    },
  };
  
  return gaugeLanguage[tier][gauge] || gaugeLanguage.adult[gauge] || { label: gauge, question: '' };
}
