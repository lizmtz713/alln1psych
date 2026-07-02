/**
 * Parent Compass — Evidence-based, modular parenting guide.
 * Structure: Quick Insight → What Science Says → What It Looks Like → What Helps → Learn More.
 * Tools → People → Parent Compass. Never shaming; parenting is a learning process.
 */

export interface ParentCompassEntry {
  id: string;
  title: string;
  emoji: string;
  quickInsight: string;
  scienceSays: string;
  whatItLooksLike: string[];
  whatHelps: string[];
  learnMore: string[];
}

/** Core parenting topics */
export const PARENT_COMPASS_TOPICS: ParentCompassEntry[] = [
  {
    id: 'parenting-styles',
    title: 'Parenting styles',
    emoji: '🏠',
    quickInsight: 'Research identifies four common styles. Authoritative (warm + structured) generally produces the healthiest outcomes.',
    scienceSays:
      'Developmental psychology distinguishes authoritative (high warmth, clear boundaries), authoritarian (strict, low warmth), permissive (warm, few boundaries), and neglectful (low involvement). Authoritative parenting is associated with better emotional regulation, academic success, and mental health in children.',
    whatItLooksLike: [
      'Authoritative: "I hear you’re upset. We still need to leave in 5 minutes."',
      'Authoritarian: "We’re leaving now. No back talk."',
      'Permissive: "We can stay as long as you want."',
      'Neglectful: Little response or presence.',
    ],
    whatHelps: [
      'Aim for warm + clear: empathy first, then limits.',
      'Explain the "why" in age-appropriate ways.',
      'Consistency matters more than perfection.',
    ],
    learnMore: ['Baumrind parenting styles', 'Attachment and discipline research'],
  },
  {
    id: 'child-brain-development',
    title: 'Child brain development',
    emoji: '🧠',
    quickInsight: 'A child’s brain develops from the bottom up—emotion before logic. Young kids lack impulse control; teens feel emotions more intensely.',
    scienceSays:
      'The prefrontal cortex (planning, impulse control) develops into the mid-20s. The limbic system (emotions) is active early. So children literally cannot "just calm down" or "think before acting" the way adults can. Teens experience stronger emotional reactivity due to brain remodeling.',
    whatItLooksLike: [
      'Toddler tantrums: overwhelm, not manipulation.',
      'School-age impulsivity: brain not yet wired for delay.',
      'Teen mood swings: real neurobiological changes.',
    ],
    whatHelps: [
      'Meet emotion first; logic comes later.',
      'Name what you see: "You’re really frustrated."',
      'Adjust expectations by age—don’t expect adult-level self-regulation.',
    ],
    learnMore: ['Developmental neuroscience', 'Dan Siegel — "The Whole-Brain Child"'],
  },
  {
    id: 'emotional-coaching',
    title: 'Emotional coaching',
    emoji: '💬',
    quickInsight: 'Children learn emotional regulation by watching how adults regulate themselves. Notice, validate, then guide.',
    scienceSays:
      'Emotion coaching (John Gottman et al.) shows that when caregivers notice emotions, validate feelings, and then guide behavior, children develop better emotional skills. Co-regulation—staying calm so the child can borrow your calm—is how kids learn to self-regulate.',
    whatItLooksLike: [
      'Child having a meltdown is often overwhelmed, not trying to misbehave.',
      'Dismissing ("You’re fine") blocks learning; validating ("That was really hard") opens the door.',
    ],
    whatHelps: [
      'Stay calm and present (your nervous system helps theirs).',
      'Label emotions: "I see you’re frustrated."',
      'Offer choices instead of commands when possible.',
      'After the storm: "What would help next time?"',
    ],
    learnMore: ['Emotion coaching (Gottman)', 'Co-regulation and attachment'],
  },
  {
    id: 'boundaries-discipline',
    title: 'Boundaries & discipline',
    emoji: '🛡️',
    quickInsight: 'Discipline is teaching, not punishment. Consistent rules and natural consequences help kids learn.',
    scienceSays:
      'Punishment focuses on making a child suffer for a mistake; discipline focuses on teaching. Effective discipline includes clear expectations, consistency, and consequences that fit the situation (natural or logical). Research supports limits that are firm but kind.',
    whatItLooksLike: [
      'Punishment: "No screen for a week because you lied."',
      'Discipline: "When we break trust, we need to rebuild it. How can you make it right?"',
    ],
    whatHelps: [
      'Set rules that are clear and age-appropriate.',
      'Use natural consequences when safe (e.g. forgot coat → cold).',
      'Separate the behavior from the child: "I love you; I don’t like that choice."',
      'Repair after conflict so the relationship stays safe.',
    ],
    learnMore: ['Positive discipline', 'Natural and logical consequences'],
  },
  {
    id: 'communication',
    title: 'Communication',
    emoji: '🗣️',
    quickInsight: 'How you talk to kids should match their age: simple for toddlers, explanations for school-age, respect and autonomy for teens.',
    scienceSays:
      'Language and social cognition develop in stages. Toddlers need short, concrete phrases. School-age children benefit from simple explanations and cause-and-effect. Teens need to feel respected and heard; lectures often backfire.',
    whatItLooksLike: [
      'Toddlers: "First shoes, then we go."',
      'School-age: "We’re leaving in 5 minutes so we’re not late. Can you get your coat?"',
      'Teens: "I’m curious what you think. What’s your plan?"',
    ],
    whatHelps: [
      'Get on their level (literally) for young kids.',
      'Use "I" statements: "I feel worried when I don’t know where you are."',
      'Listen before solving; often they need to vent.',
    ],
    learnMore: ['Developmentally appropriate communication', 'Nonviolent Communication with kids'],
  },
  {
    id: 'attachment-security',
    title: 'Attachment & security',
    emoji: '🤗',
    quickInsight: 'Children thrive when they feel safe, understood, and supported. Connection is the foundation.',
    scienceSays:
      'Attachment theory (Bowlby, Ainsworth) shows that secure attachment—feeling that a caregiver is available and responsive—supports emotional regulation, exploration, and relationships later in life. Safety and attunement matter more than perfect behavior.',
    whatItLooksLike: [
      'Secure base: child checks in with you, then explores.',
      'After a hard day: "I’m here. You’re not alone with this."',
    ],
    whatHelps: [
      'Respond consistently to needs (especially when they’re struggling).',
      'Repair after rupture: "I was short with you earlier. I’m sorry."',
      'Quality time doesn’t have to be long—focused attention matters.',
    ],
    learnMore: ['Attachment theory', 'Secure base and safe haven'],
  },
  {
    id: 'screen-time-modern',
    title: 'Screen time & modern challenges',
    emoji: '📱',
    quickInsight: 'Screens affect attention and mood. Boundaries and modeling matter more than a single rule.',
    scienceSays:
      'Research links heavy screen use to attention and sleep issues, especially in young children. Social media can affect teen well-being. What helps: clear boundaries, screen-free zones/times, and adults modeling healthy use.',
    whatItLooksLike: [
      'Endless "one more minute" negotiations.',
      'Teens absorbed in phones at meals or before bed.',
    ],
    whatHelps: [
      'Set family norms (e.g. no phones at table, screens off 30–60 min before bed).',
      'Explain the "why" in age-appropriate ways.',
      'Offer alternatives: play, movement, connection.',
      'Model putting your own phone away.',
    ],
    learnMore: ['Screen time and development', 'Social media and adolescent mental health'],
  },
];

/** Age-specific guides */
export const PARENT_COMPASS_AGE_GUIDES: ParentCompassEntry[] = [
  {
    id: 'age-0-5',
    title: 'Early childhood (0–5)',
    emoji: '👶',
    quickInsight: 'Focus: safety, emotional regulation, and language. Tantrums and separation anxiety are normal.',
    scienceSays:
      'The first years build the foundation for attachment and self-regulation. Brain development is rapid; consistent, responsive caregiving supports healthy wiring. Tantrums reflect overwhelm, not defiance.',
    whatItLooksLike: [
      'Tantrums when tired, hungry, or transitioning.',
      'Separation anxiety: "Don’t go!"',
      'Big feelings with small words.',
    ],
    whatHelps: [
      'Routine and predictability reduce anxiety.',
      'Name emotions: "You’re sad. It’s hard when Mom leaves."',
      'Stay calm; your calm helps them regulate.',
    ],
    learnMore: ['Early childhood development', 'Toddler emotional regulation'],
  },
  {
    id: 'age-6-12',
    title: 'Middle childhood (6–12)',
    emoji: '🧒',
    quickInsight: 'Focus: friendships, confidence, and learning. They need structure and room to practice skills.',
    scienceSays:
      'School-age children develop peer relationships, self-concept, and academic skills. They benefit from clear expectations and opportunities to succeed and fail in safe ways.',
    whatItLooksLike: [
      'Friendship drama and wanting to fit in.',
      'Homework and responsibility struggles.',
      'Testing limits while still needing boundaries.',
    ],
    whatHelps: [
      'Listen to friendship and school concerns without fixing everything.',
      'Support routines for homework and chores.',
      'Praise effort and process, not just outcomes.',
    ],
    learnMore: ['Middle childhood development', 'Social and emotional learning'],
  },
  {
    id: 'age-13-18',
    title: 'Adolescence (13–18)',
    emoji: '🧑',
    quickInsight: 'Focus: identity, independence, and emotional intensity. Conflict with parents and risk-taking are common.',
    scienceSays:
      'The teen brain is remodeling; reward and emotion systems are highly active while impulse control is still developing. Pushing for autonomy is developmentally normal. Connection with parents still matters—often in different forms.',
    whatItLooksLike: [
      'More conflict and "You don’t understand."',
      'Peer pressure and experimentation.',
      'Mood swings and need for privacy.',
    ],
    whatHelps: [
      'Respect their need for autonomy while staying available.',
      'Choose battles; not everything needs to be a fight.',
      'Keep the door open: "I’m here when you want to talk."',
    ],
    learnMore: ['Adolescent brain development', 'Teen mental health and connection'],
  },
];

/** Quick guides for common scenarios */
export const PARENT_COMPASS_SCENARIOS: ParentCompassEntry[] = [
  {
    id: 'scenario-meltdown',
    title: 'Child having a meltdown',
    emoji: '🌪️',
    quickInsight: 'A meltdown is overwhelm, not manipulation. Your calm presence helps more than words.',
    scienceSays:
      'When the emotional brain is flooded, the thinking brain goes offline. Co-regulation—staying calm and present—helps the child’s nervous system settle. Reasoning mid-meltdown rarely works.',
    whatItLooksLike: [
      'Crying, yelling, or shutting down.',
      'Unable to hear or comply with requests.',
    ],
    whatHelps: [
      'Stay calm and present; don’t escalate.',
      'Label the feeling: "You’re really upset."',
      'Wait for the storm to pass before problem-solving.',
      'Afterward: "What was hard? What could help next time?"',
    ],
    learnMore: ['Emotional coaching', 'Co-regulation'],
  },
  {
    id: 'scenario-lying',
    title: 'Child lying',
    emoji: '🫣',
    quickInsight: 'Lying often comes from fear of consequences or shame. Address the need behind it, not just the lie.',
    scienceSays:
      'Young children may not fully grasp truth vs. lie; older kids may lie to avoid punishment or protect self-image. Harsh punishment for lying can increase lying. Focus on safety, honesty, and repair.',
    whatItLooksLike: [
      'Denial when caught: "I didn’t do it."',
      'Exaggeration or stories to avoid trouble.',
    ],
    whatHelps: [
      'Avoid traps: "Did you…?" when you know the answer.',
      'State what you know: "I see the screen was on. What happened?"',
      'Separate the behavior from the child; focus on trust and repair.',
    ],
    learnMore: ['Development of honesty', 'Discipline without shame'],
  },
  {
    id: 'scenario-siblings',
    title: 'Sibling conflict',
    emoji: '👫',
    quickInsight: 'Sibling rivalry is normal. Fair doesn’t always mean equal; each child needs to feel heard.',
    scienceSays:
      'Siblings compete for attention and resources; some conflict is expected. Parent focus on "who started it" often increases tension. Teaching conflict skills and giving each child one-on-one time helps.',
    whatItLooksLike: [
      'Fighting over toys, space, or your attention.',
      'Tattling and "It’s not fair!"',
    ],
    whatHelps: [
      'Listen to both without taking sides immediately.',
      '"What do you need?" for each child.',
      'Set boundaries: "We don’t hit. Use words or ask for help."',
      'Schedule individual time with each child.',
    ],
    learnMore: ['Sibling dynamics', 'Conflict resolution with kids'],
  },
  {
    id: 'scenario-homework',
    title: 'Homework struggles',
    emoji: '📚',
    quickInsight: 'Resistance to homework can be about ability, attention, or overwhelm. Check the cause before pushing harder.',
    scienceSays:
      'Homework battles can stem from learning difficulties, attention issues, fatigue, or lack of motivation. Forcing and nagging often increase resistance. Structure, breaks, and support (not doing it for them) help.',
    whatItLooksLike: [
      'Procrastination, tears, or "I don’t get it."',
      'Power struggles at homework time.',
    ],
    whatHelps: [
      'Set a consistent time and space; reduce distractions.',
      'Break tasks into small steps: "Do these 3 problems, then we’ll check in."',
      'If it’s always a fight, consider whether there’s an underlying issue (vision, learning, anxiety).',
    ],
    learnMore: ['Executive function and homework', 'Supporting struggling learners'],
  },
  {
    id: 'scenario-teen-rules',
    title: 'Teen refusing rules',
    emoji: '🚪',
    quickInsight: 'Teens push for autonomy. Clear, few rules and room to negotiate reduce power struggles.',
    scienceSays:
      'Adolescents are wired to seek independence and peer connection. Rigid control often leads to rebellion or secrecy. Firm boundaries on safety (e.g. substances, driving) with flexibility on preferences (e.g. clothes, room) can reduce conflict.',
    whatItLooksLike: [
      '"You can’t make me." / "Everyone else gets to."',
      'Secrecy or lying about where they are.',
    ],
    whatHelps: [
      'Distinguish safety rules (non-negotiable) from preference rules (negotiable).',
      'Explain the "why" and listen to their view.',
      'Give choices within limits: "You need to be home by 10. Do you want to be dropped off or picked up?"',
      'Repair after blow-ups: "I was harsh. I still care about you."',
    ],
    learnMore: ['Teen autonomy and boundaries', 'Authoritative parenting with teens'],
  },
];

export function getParentCompassEntryById(id: string): ParentCompassEntry | undefined {
  const all = [...PARENT_COMPASS_TOPICS, ...PARENT_COMPASS_AGE_GUIDES, ...PARENT_COMPASS_SCENARIOS];
  return all.find((e) => e.id === id);
}
