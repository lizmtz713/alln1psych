/**
 * LOVE Tool - Comprehensive Education Content
 * 
 * Topics: Love, Relationships, Sexual Health, Identity, Safety, Survivors
 * All content is age-adaptive and age-gated where appropriate.
 */

import { type AgeTier, canAccessContent } from '../services/ageAdaptive';

export interface CrisisResource {
  name: string;
  description: string;
  phone?: string;
  text?: string;
  website?: string;
  available: string;
}

export interface TopicCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  minAge: number; // Minimum age to access this category
  crisisResources?: CrisisResource[];
}

export interface TopicLesson {
  id: string;
  categoryId: string;
  title: string;
  minAge: number;
  content: {
    teen?: string;
    youngAdult?: string;
    adult?: string;
    mature?: string;
    senior?: string;
  };
}

// ============================================
// CRISIS RESOURCES (Always Accessible)
// ============================================

export const CRISIS_RESOURCES: Record<string, CrisisResource[]> = {
  abuse: [
    {
      name: 'National Domestic Violence Hotline',
      description: 'Support for domestic violence survivors',
      phone: '1-800-799-7233',
      text: 'Text START to 88788',
      website: 'thehotline.org',
      available: '24/7',
    },
    {
      name: 'RAINN (Sexual Assault)',
      description: 'Support for sexual assault survivors',
      phone: '1-800-656-4673',
      website: 'rainn.org',
      available: '24/7',
    },
    {
      name: 'Childhelp (Child Abuse)',
      description: 'Support for child abuse',
      phone: '1-800-422-4453',
      website: 'childhelp.org',
      available: '24/7',
    },
    {
      name: 'Love Is Respect (Teen Dating)',
      description: 'Support for teen dating abuse',
      phone: '1-866-331-9474',
      text: 'Text LOVEIS to 22522',
      website: 'loveisrespect.org',
      available: '24/7',
    },
  ],
  lgbtq: [
    {
      name: 'Trevor Project (Youth LGBTQ+)',
      description: 'Crisis support for LGBTQ+ youth',
      phone: '1-866-488-7386',
      text: 'Text START to 678-678',
      website: 'thetrevorproject.org',
      available: '24/7',
    },
    {
      name: 'Trans Lifeline',
      description: 'Support by and for trans people',
      phone: '1-877-565-8860',
      website: 'translifeline.org',
      available: '24/7 (hours vary)',
    },
    {
      name: 'LGBT National Hotline',
      description: 'Support for LGBTQ+ individuals of all ages',
      phone: '1-888-843-4564',
      website: 'glbthotline.org',
      available: 'Mon-Fri 4pm-12am, Sat 12pm-5pm ET',
    },
  ],
  reproductive: [
    {
      name: 'Planned Parenthood',
      description: 'Reproductive health services and information',
      phone: '1-800-230-7526',
      website: 'plannedparenthood.org',
      available: 'Varies by location',
    },
    {
      name: 'National Abortion Federation',
      description: 'Abortion information and referrals',
      phone: '1-800-772-9100',
      website: 'prochoice.org',
      available: 'Mon-Fri 9am-9pm, Sat-Sun 9am-5pm ET',
    },
    {
      name: 'All-Options Talkline',
      description: 'Support for all pregnancy decisions',
      phone: '1-888-493-0092',
      website: 'all-options.org',
      available: 'Mon-Fri 10am-1am, Sat-Sun 10am-6pm ET',
    },
  ],
  general: [
    {
      name: '988 Suicide & Crisis Lifeline',
      description: 'Mental health crisis support',
      phone: '988',
      text: 'Text 988',
      website: '988lifeline.org',
      available: '24/7',
    },
    {
      name: 'Crisis Text Line',
      description: 'Text-based crisis support',
      text: 'Text HOME to 741741',
      website: 'crisistextline.org',
      available: '24/7',
    },
  ],
};

// ============================================
// TOPIC CATEGORIES
// ============================================

export const LOVE_CATEGORIES: TopicCategory[] = [
  {
    id: 'consent-boundaries',
    title: 'Consent & Boundaries',
    emoji: '🤝',
    description: "Understanding consent, setting boundaries, respecting others',
    minAge: 13,
    crisisResources: CRISIS_RESOURCES.abuse,
  },
  {
    id: "healthy-relationships',
    title: 'Healthy vs. Unhealthy Relationships',
    emoji: '💚',
    description: 'Recognizing green flags, red flags, and everything in between',
    minAge: 13,
    crisisResources: CRISIS_RESOURCES.abuse,
  },
  {
    id: 'lgbtq-identity',
    title: 'LGBTQ+ Identity',
    emoji: '🏳️‍🌈',
    description: 'Orientation, gender identity, coming out, finding community',
    minAge: 13,
    crisisResources: CRISIS_RESOURCES.lgbtq,
  },
  {
    id: 'safety-protection',
    title: 'Safety & Protection',
    emoji: '🛡️',
    description: 'Recognizing predators, grooming, staying safe online and offline',
    minAge: 13,
    crisisResources: [...CRISIS_RESOURCES.abuse, ...CRISIS_RESOURCES.general],
  },
  {
    id: 'survivor-support',
    title: 'Survivor Support',
    emoji: '💜',
    description: 'Healing from abuse, assault, or trauma',
    minAge: 13,
    crisisResources: CRISIS_RESOURCES.abuse,
  },
  {
    id: 'sexual-health',
    title: 'Sexual Health',
    emoji: '🩺',
    description: 'STI prevention, contraception, reproductive health',
    minAge: 16,
    crisisResources: CRISIS_RESOURCES.reproductive,
  },
  {
    id: 'reproductive-choices',
    title: 'Reproductive Choices',
    emoji: '🌱',
    description: 'Pregnancy options, abortion, adoption, parenting',
    minAge: 16,
    crisisResources: CRISIS_RESOURCES.reproductive,
  },
  {
    id: 'intimacy-pleasure',
    title: 'Intimacy & Pleasure',
    emoji: '💕',
    description: 'Healthy intimacy, communication, understanding your body",
    minAge: 18,
  },
];

// ============================================
// LOVE TOOL AI SYSTEM PROMPTS
// ============================================

export const LOVE_TOOL_BASE_PROMPT = `You are the LOVE tool in InGauge - a safe, judgment-free space for questions about love, relationships, sex, identity, and safety.

CORE PRINCIPLES (NEVER VIOLATE):
• Science-based, never preachy or moralistic
• Zero judgment - ALL questions are valid, none are \"too weird\"
• Affirming of ALL identities and orientations
• Trauma-informed - never push, always offer, respect autonomy
• Age-appropriate for this specific user (see age adaptation rules)

YOU CAN HELP WITH:
• Questions about bodies, sex, and health
• Relationship concerns and patterns
• Identity exploration (orientation, gender)
• Recognizing unhealthy dynamics and red flags
• Healing from abuse or trauma
• Understanding consent and boundaries
• Sexual health questions (STIs, contraception)
• Reproductive choices (all options, no agenda)
• Intimacy and communication

YOU ARE NOT:
• A medical provider - refer to professionals for medical care
• A crisis line - provide resources for immediate danger
• A replacement for therapy - encourage professional support for trauma
• Judgmental - ever, about anything

WHEN SAFETY IS A CONCERN:
• If someone is in immediate danger → Provide emergency resources immediately
• If someone discloses abuse → Validate first, offer resources, NEVER push reporting
• If a minor discloses abuse → Age-appropriate guidance to trusted adult + resources
• If someone seems in crisis → Provide crisis resources gently

ALWAYS:
• Meet them where they are emotionally
• Validate before educating
• Offer resources without pressure
• Use their language for their body/identity
• Respect their autonomy and choices
• Normalize their questions (\"lots of people wonder about this\")

LANGUAGE RULES:
• Use accurate anatomical terms (penis, vagina, vulva - not euphemisms)
• Normalize all bodies and identities
• Don't use scare tactics
• Include diverse examples (not just heterosexual, cisgender)
• Acknowledge systemic barriers without being preachy

NEVER:
• Shame any choice or identity
• Push any particular decision (especially reproductive)
• Minimize experiences
• Use judgmental language about sexual activity
• Assume heterosexuality or cisgender identity
• Assume family support or safety
• Say \"that"s inappropriate" to any genuine question`;

export const LOVE_TOOL_TEEN_ADDITION = `
TEEN-SPECIFIC GUIDANCE (13-17):

AGE-APPROPRIATE CONTENT BOUNDARIES:
• CAN discuss: consent, boundaries, healthy relationships, LGBTQ+ identity, puberty, anatomy basics, online safety, recognizing predators/grooming, emotional aspects of relationships
• REDIRECT to age-appropriate resources: detailed sexual health, explicit content
• ALWAYS: validate their questions as normal and important

SPECIFIC APPROACHES:
• Puberty questions are NORMAL - answer factually without embarrassment
• Relationship questions are valid - don"t dismiss as \"too young\"
• Identity questioning is healthy - support exploration without pushing labels
• Online safety is critical - be direct about risks without fear-mongering
• If they're being pressured - clear guidance on rights and resources

CRISIS RESOURCES TO ALWAYS MENTION WHEN RELEVANT:
• Trevor Project (LGBTQ+ youth): 1-866-488-7386 or text START to 678-678
• Love Is Respect (dating abuse): 1-866-331-9474 or text LOVEIS to 22522
• Crisis Text Line: Text HOME to 741741
• School counselors and trusted adults

TONE:
• Like a knowledgeable older sibling or cool aunt/uncle
• Never awkward about their questions
• \"This is a totally normal thing to wonder about\"
• Direct answers, not dancing around topics`;

export const LOVE_TOOL_YOUNGADULT_ADDITION = `
YOUNG ADULT-SPECIFIC GUIDANCE (18-25):

FULL ACCESS to all topics - they"re adults. Be direct.

SPECIFIC APPROACHES:
• First sexual experiences - normalize nerves, emphasize communication
• Consent in hookup culture - explicit, enthusiastic consent every time
• STI testing - normalize it as routine health care
• Contraception - all options, practical info
• Toxic relationship patterns - help them recognize red flags
• Porn literacy - realistic vs. unrealistic expectations
• Identity exploration - coming out, dating while queer, finding community
• Boundaries with family about identity/choices

PRACTICAL FOCUS:
• Where to get tested, where to get contraception
• How to have hard conversations with partners
• What healthy relationships actually look like
• How to leave unhealthy situations safely

TONE:
• Like a trusted friend who knows their stuff
• No judgment about number of partners or experiences
• Practical, real-world applicable
• "Here"s what you actually need to know\"`;

export const LOVE_TOOL_ADULT_ADDITION = `
ADULT-SPECIFIC GUIDANCE (26-45):

SPECIFIC APPROACHES:
• Long-term relationship dynamics - desire changes are normal
• Parenthood and intimacy - real talk about how it changes things
• Mismatched desire - communication strategies, not blame
• Fertility and reproductive decisions - factual support
• Past trauma affecting current relationships - gentle, refer to therapy
• Sexless marriages - non-judgmental exploration of causes and options
• Open relationships/non-monogamy - if they're curious, factual info
• Divorce/separation - emotional support and practical resources

PRACTICAL FOCUS:
• How to talk to partners about difficult topics
• Maintaining connection with limited time
• When relationship issues need professional help
• Resources for couples therapy

TONE:
• Peer-to-peer, no condescension
• Acknowledging the complexity of adult life
• \"These are common challenges, and there are real solutions\"`;

export const LOVE_TOOL_MATURE_ADDITION = `
MATURE ADULT-SPECIFIC GUIDANCE (46-65):

SPECIFIC APPROACHES:
• Menopause/andropause effects on desire and function - normalize
• Sex after major health events - practical guidance
• New relationships after divorce/widowhood - emotional support
• Empty nest and reconnecting with partner
• Adult children"s relationships - boundaries on involvement
• Long-term relationship revitalization
• Body changes and self-image

SPECIFIC CONSIDERATIONS:
• Don"t assume sexuality ends at this age - many have active sex lives
• Health changes may require adaptation, not cessation
• Late-life coming out is real - support without surprise
• Grief and loss may intersect with intimacy topics

TONE:
• Respectful of life experience
• \"Your desires and questions are just as valid now\"
• Practical without being clinical`;

export const LOVE_TOOL_SENIOR_ADDITION = `
SENIOR-SPECIFIC GUIDANCE (65+):

SPECIFIC APPROACHES:
• Sexuality in later life - it doesn't end, it evolves
• Loss of partner and potential new relationships
• Physical changes and adaptation
• Intimacy beyond sex - touch, connection, closeness
• STI awareness (yes, it"s relevant at every age)
• Healthcare provider communication about sexual health

SPECIFIC CONSIDERATIONS:
• Never assume they're "past" sexuality
• Physical limitations may require creativity, not abstinence
• Grief and new relationships are complex
• Dignity and respect are paramount

TONE:
• Dignified, never patronizing
• "These questions matter at every age"
• Honoring their autonomy and desires`;

// ============================================
// CONTENT LESSONS (Age-Adaptive)
// ============================================

export const CONSENT_LESSON_WHAT_IS_CONSENT: TopicLesson = {
  id: 'consent-what-is-it',
  categoryId: 'consent-boundaries',
  title: 'What Consent Actually Means",
  minAge: 13,
  content: {
    teen: `Consent means someone freely and clearly says \"yes\" to something - and keeps saying yes the whole time. It's not just about sex. It"s about hugs, sharing your stuff, posting photos of you, anything that involves your body or your business.

Here"s the thing: consent isn't just \"they didn"t say no." Silence isn"t yes. Being drunk or high isn't yes. Being pressured until you give up isn"t yes. A real yes is enthusiastic, clear, and can be taken back ANY time.

**What consent looks like:**
• "Yes, I want to" (not "I guess" or "fine")
• Checking in: "Is this okay?" "Do you want to keep going?"
• Respecting when someone changes their mind - no guilt trips
• Understanding that someone can consent to one thing but not another

**What"s NOT consent:**
• \"They didn't say no\"
• \"They said yes before, so...\"
• \"We"ve been dating, so they have to"
• "They were flirting with me"
• Someone who"s asleep, drunk, high, or scared

If someone doesn't respect your \"no\" or makes you feel bad for having boundaries, that"s a red flag. You always have the right to say no, change your mind, or leave. Anyone who cares about you will respect that.`,

    youngAdult: `Consent is an enthusiastic, ongoing, freely-given "yes." Not the absence of "no." Not a pressured "fine." Not someone who"s too drunk to make decisions. It's two (or more) people actively choosing to do something together.

**The FRIES model:**
• **Freely given** - No pressure, manipulation, or power imbalance
• **Reversible** - Anyone can change their mind at any time
• **Informed** - You know what you"re agreeing to
• **Enthusiastic** - You actually want this, not just going along
• **Specific** - Yes to one thing doesn"t mean yes to everything

In hookup culture, consent can get murky. Alcohol complicates things. Here's the rule: if you"re not sure they"re enthusiastically into it, stop and ask. If they're too drunk to drive, they"re too drunk to consent. If you"re worried about \"ruining the mood\" by asking, you're prioritizing your desire over their safety.

Consent also applies to:
• Sharing nudes or private messages
• Posting photos of someone
• Sharing someone"s personal info
• Touching someone (even casually)

And yes, consent can be sexy. "Tell me what you want" is consent. "Is this good?" is consent. Communication is hot.`,

    adult: `Consent is the foundation of any ethical interaction - sexual or otherwise. It"s freely given, enthusiastic, ongoing, informed, and specific. In long-term relationships, consent can become assumed, but it shouldn't. Your partner always has the right to say no, even if they"ve said yes before.

**Consent in long-term relationships:**
• "We always..." doesn"t mean \"we will today\"
• Being married doesn't mean automatic consent
• Checking in isn"t "unsexy" - it"s respectful
• Desire fluctuates; consent must be current

**Power dynamics matter:**
• Boss/employee, teacher/student, older/younger - power imbalances complicate consent
• Even if they say yes, was the yes truly free?
• Coercion isn't just physical - it"s pressure, guilt, threats, manipulation

**Consent violations can be subtle:**
• Pushing past a "not tonight" with guilt
• Sulking or punishing after a no
• Boundary violations disguised as "I forgot" or "I didn"t know\"
• Stealthing (removing protection without consent)

If your consent has been violated - at any level - your feelings are valid. It doesn't have to be \"bad enough\" to matter. And if you"ve realized you've crossed someone"s boundaries, accountability and change are the path forward.`,

    mature: `Consent remains foundational at every stage of life. In long-term relationships, it can become assumed or routine - but it shouldn't. Your body belongs to you, always. Your partner"s body belongs to them, always.

At this stage, consent conversations may include:
• Navigating desire changes (menopause, health conditions, medications)
• Respecting when a partner needs adjustment or adaptation
• New relationships after loss - taking your time is okay
• Teaching adult children about healthy consent

Consent is also about medical decisions, caregiving boundaries, and how others treat you. You have the right to say no to a hug from someone who makes you uncomfortable. You have the right to set limits with family. Your boundaries matter.`,

    senior: `Consent never expires. Your body is yours. If something doesn"t feel right to you, you have every right to say no - whether that's with a partner, a caregiver, a doctor, or anyone else.

In this chapter of life, consent conversations might include:
• How you want to be touched or cared for
• Medical decisions and bodily autonomy
• New relationships and taking your time
• Family respecting your choices about your own life

If you"re in a caregiving situation, you still deserve to be asked, not told. "May I help you with this?" is different from someone just doing it. Your dignity matters. Your preferences matter. Always.`,
  },
};

export const LGBTQ_LESSON_YOU_ARE_VALID: TopicLesson = {
  id: 'lgbtq-you-are-valid',
  categoryId: 'lgbtq-identity',
  title: 'You Are Valid Exactly As You Are",
  minAge: 13,
  content: {
    teen: `If you're questioning who you"re attracted to or what your gender feels like - that's normal. A lot of people your age are figuring this out. Some people know early. Some people figure it out later. Some people"s understanding changes over time. All of that is okay.

**Some terms you might be exploring:**
• **Gay/Lesbian** - attracted to people of the same gender
• **Bisexual** - attracted to more than one gender
• **Pansexual** - attracted to people regardless of gender
• **Asexual** - little or no sexual attraction (you can still want romance)
• **Transgender** - your gender is different from what was assigned at birth
• **Non-binary** - your gender isn't strictly \"boy\" or \"girl\"
• **Questioning** - still figuring it out (totally valid!)

You don"t have to pick a label. You don"t have to come out before you're ready. And you don"t have to explain yourself to anyone. Your identity is yours.

**If family or friends aren"t supportive:**
This is hard. Really hard. It's okay to protect yourself by waiting to come out. It"s okay to find your chosen family. It"s not your job to educate people who don't want to learn.

**Resources that have your back:**
• Trevor Project: 1-866-488-7386 or text START to 678-678
• Trans Lifeline: 1-877-565-8860
• PFLAG: pflag.org (support for families too)

You are not broken. You are not \"going through a phase.\" You are exactly who you"re supposed to be.`,

    youngAdult: `Wherever you are in understanding your identity - out and proud, still questioning, somewhere in between - you"re valid. Identity isn't always linear. Some people knew at 5. Some figure it out at 25. Some have identities that shift over time. There"s no wrong way to be you.

**Navigating this stage:**
• Coming out isn"t a one-time event - you'll do it over and over
• You don"t owe anyone your coming out story
• Dating while queer has its own learning curve
• Finding community matters - online and IRL
• Chosen family is real family

**Real talk:**
• It"s okay if your family doesn't get it (yet, or ever)
• It"s okay to set boundaries with people who don"t respect you
• Minority stress is real - constant low-grade threat is exhausting
• Seeking LGBTQ+-affirming therapy can help

**If you're trans or non-binary:**
• Your identity is valid whether or not you medically transition
• Dysphoria is real and hard - you deserve support
• Access to care varies by location - resources exist
• Trans Lifeline: 1-877-565-8860 (by and for trans people)

You deserve love, respect, and a life where you can be fully yourself.`,

    adult: `If you"re LGBTQ+ and navigating adult life - relationships, career, family, community - you"re dealing with layers that straight/cis folks don't always see. That"s real. And your identity is valid no matter when you figured it out or where you are in expressing it.

**Adult LGBTQ+ life:**
• Being out at work (when it"s safe) vs. navigating closeted spaces
• Long-term queer relationships and the unique dynamics
• LGBTQ+ parenting - biological, adoption, chosen family
• Dealing with family who still \"hope you'll change\"
• Aging as an LGBTQ+ person - community and care

**If you"re figuring it out later in life:**
This happens. A lot. Coming out at 30, 40, or beyond is valid. Your past relationships don"t invalidate your identity. You're allowed to grow into yourself.

**Community matters:**
Isolation is the enemy. Finding your people - whether that"s a local group, online community, or a few close friends who truly get it - makes a huge difference.`,

    mature: `If you"re LGBTQ+ at this stage of life, you may be navigating coming out late, being out for decades, or somewhere in between. All of it is valid.

**Late-life coming out:**
Some people come out after marriages, children, entire lives lived according to others' expectations. If this is you, you"re not alone. You didn"t \"waste\" your life. You survived in the way you needed to, and now you get to live more fully.

**Long-term LGBTQ+ life:**
If you've been out for years, you"ve likely weathered a lot - discrimination, loss (especially if you lived through the AIDS crisis), and also triumph, community, and hard-won rights. Your history matters.

**Aging as LGBTQ+:**
Finding LGBTQ+-friendly healthcare, housing, and community becomes increasingly important. You deserve care from people who respect your identity.`,

    senior: `Your identity doesn"t have an expiration date. Whether you've been out for decades or are coming out now, you are valid.

**If you"re coming out later in life:**
Some people wait until after a spouse passes, until children are grown, until they finally have space to be themselves. There"s no wrong time. You deserve to live authentically for whatever time you have.

**If you've been out for years:**
You are part of a history. You"ve seen things change. Your experience and wisdom matter.

**What you deserve:**
• Healthcare providers who respect your identity
• Caregivers (if needed) who honor who you are
• Community and connection
• To be seen as your whole self`,
  },
};

// More lessons would continue similarly...
// Export all lessons as an array for easy access

export const ALL_LOVE_LESSONS: TopicLesson[] = [
  CONSENT_LESSON_WHAT_IS_CONSENT,
  LGBTQ_LESSON_YOU_ARE_VALID,
  // Add more lessons here as created
];

/**
 * Get appropriate LOVE tool prompt for user's age tier
 */
export function getLoveToolPrompt(ageTier: AgeTier): string {
  let prompt = LOVE_TOOL_BASE_PROMPT;
  
  switch (ageTier) {
    case 'teen':
      prompt += LOVE_TOOL_TEEN_ADDITION;
      break;
    case 'young-adult':
      prompt += LOVE_TOOL_YOUNGADULT_ADDITION;
      break;
    case 'adult':
      prompt += LOVE_TOOL_ADULT_ADDITION;
      break;
    case 'mature':
      prompt += LOVE_TOOL_MATURE_ADDITION;
      break;
    case 'senior':
      prompt += LOVE_TOOL_SENIOR_ADDITION;
      break;
  }
  
  return prompt;
}

/**
 * Get available categories for user's age
 */
export function getAvailableCategories(age: number | null): TopicCategory[] {
  const effectiveAge = age ?? 18; // Default to adult if unknown
  return LOVE_CATEGORIES.filter(cat => effectiveAge >= cat.minAge);
}

/**
 * Get lessons for a category, filtered by age
 */
export function getLessonsForCategory(categoryId: string, age: number | null): TopicLesson[] {
  const effectiveAge = age ?? 18;
  return ALL_LOVE_LESSONS.filter(
    lesson => lesson.categoryId === categoryId && effectiveAge >= lesson.minAge
  );
}

/**
 * Get age-appropriate content from a lesson
 */
export function getLessonContent(lesson: TopicLesson, ageTier: AgeTier): string {
  // Normalize kebab to camel for content keys
  const key = ageTier === 'young-adult' ? 'youngAdult' : ageTier;
  // Try exact match first, then fall back
  const content = lesson.content[key as keyof typeof lesson.content]
    || lesson.content.adult
    || lesson.content.youngAdult
    || Object.values(lesson.content)[0]
    || '';
  
  return content;
}
