/**
 * 16 Human Skills — Data: 4 domains, 16 skills.
 */

import type { SkillId, SkillDomainId, HumanSkill, SkillDomain } from '../types/human-skills';

const SKILLS: HumanSkill[] = [
  // Self (Awareness)
  {
    id: 'self-awareness', domainId: 'self', order: 1, title: 'Self-Awareness', shortTitle: 'Self-Awareness', emoji: '🪞',
    description: 'Noticing your thoughts, feelings, and patterns without judgment.',
    whyItMatters: 'Self-awareness is the foundation of emotional intelligence. It helps you make choices that match who you are and catch unhelpful patterns before they run the show.',
    whatResearchSays: 'Meta-analyses link self-awareness to better decision-making, relationships, and well-being. It’s a learnable skill, not a fixed trait.',
    practiceTips: ['Pause a few times a day and ask: "What am I feeling right now?"', 'Notice when you react on autopilot — no judgment, just notice.', 'Use mood check-ins or Post-Flight debriefs to name patterns.'],
    paceNote: 'Build at your own pace. Even one small pause per day counts.',
    badgeName: 'Self-Discovery',
    practiceChallenge: 'Notice one moment today when you reacted on autopilot — no judgment, just name what you felt.',
  },
  {
    id: 'emotional-awareness', domainId: 'self', order: 2, title: 'Emotional Awareness', shortTitle: 'Emotional Awareness', emoji: '❤️',
    description: 'Recognizing and naming what you feel in the moment.',
    whyItMatters: 'Naming emotions reduces their intensity and helps you respond instead of react. "Name it to tame it" is backed by neuroscience.',
    whatResearchSays: 'Labeling emotions (affect labeling) is associated with lower amygdala activation and better regulation. It’s a core skill in evidence-based therapies.',
    practiceTips: ['Use the emotion wheel or a feelings list when you’re unsure.', 'Say or write: "I feel _____" — simple and direct.', 'Check in with Body: tight chest? racing heart? That’s data.'],
    paceNote: 'Start with one emotion per day. There’s no wrong answer.',
    badgeName: 'Emotion Explorer',
    practiceChallenge: 'Name one emotion you felt today out loud or in writing — "I felt _____."',
  },
  {
    id: 'body-awareness', domainId: 'self', order: 3, title: 'Body Awareness', shortTitle: 'Body Awareness', emoji: '🧘',
    description: 'Tuning into physical sensations and what your body is telling you.',
    whyItMatters: 'Your body signals stress, safety, and emotion before your mind catches up. Noticing those signals helps you regulate and avoid burnout.',
    whatResearchSays: 'Interoception (sensing internal body states) is linked to emotional regulation and is trainable. Body-based practices are central to trauma-informed care.',
    practiceTips: ['Do a quick body scan: head to feet, where do you feel tension or ease?', 'Use the Body foundation tool or a short body-scan activity.', 'Notice hunger, fatigue, and rest — they’re information.'],
    paceNote: 'A few minutes of tuning in counts. No need to "fix" anything.',
    practiceChallenge: 'Do a 30-second body scan: where do you feel tension or ease right now?',
  },
  {
    id: 'values-clarity', domainId: 'self', order: 4, title: 'Values Clarity', shortTitle: 'Values Clarity', emoji: '⚖️',
    description: 'Knowing what matters most to you and when you are aligned.',
    whyItMatters: 'Values guide decisions and reduce regret. When you know what you stand for, saying no (and yes) gets easier.',
    whatResearchSays: 'Values clarity is associated with meaning in life, goal persistence, and lower psychological distress. It’s central to acceptance and commitment approaches.',
    practiceTips: ['Answer the 12 Life Questions — especially Values and Purpose.', 'When deciding something, ask: "Which choice aligns with what I care about?"', 'Revisit your values when you feel stuck or drained.'],
    paceNote: 'Values can shift over time. Revisit when it feels right.',
    practiceChallenge: 'Before one decision today, ask: "Which choice aligns with what I care about?"',
  },
  // Regulate (State)
  {
    id: 'regulation', domainId: 'regulate', order: 5, title: 'Regulation', shortTitle: 'Regulation', emoji: '🌊',
    description: 'Calming or energizing your nervous system when you need to.',
    whyItMatters: 'You can’t think clearly when you’re flooded or numb. Regulation brings you back to a window where you can choose how to respond.',
    whatResearchSays: 'Emotion regulation is a core predictor of mental health. Techniques like breathing and cognitive reappraisal are well-supported; practice improves capacity.',
    practiceTips: ['Use Quick Reset when you need to downshift or refocus.', 'Try slow exhales (longer out than in) to activate the calming response.', 'Name the emotion and give it space instead of fighting it.'],
    paceNote: 'One regulated moment at a time. You’re building a skill.',
    practiceChallenge: 'When you feel activated, take three slow breaths (longer out than in).',
  },
  {
    id: 'stress-tolerance', domainId: 'regulate', order: 6, title: 'Stress Tolerance', shortTitle: 'Stress Tolerance', emoji: '🛡️',
    description: 'Staying present and functional under pressure.',
    whyItMatters: 'Life will bring stress. Tolerance isn’t about not feeling it — it’s about not being overwhelmed by it so you can still act.',
    whatResearchSays: 'Distress tolerance is a key skill in DBT and related therapies. It’s linked to better outcomes under chronic stress.',
    practiceTips: ['Practice in small doses: stay with discomfort for 30 seconds, then 1 minute.', 'Use grounding (5-4-3-2-1: name 5 things you see, 4 hear, etc.).', 'Remind yourself: "This is hard, and I can get through this moment."'],
    paceNote: 'Tolerance builds slowly. Be kind to yourself on hard days.',
    practiceChallenge: 'Stay with a small discomfort for 30 seconds without escaping — then notice what happens.',
  },
  {
    id: 'grounding', domainId: 'regulate', order: 7, title: 'Grounding', shortTitle: 'Grounding', emoji: '🌍',
    description: 'Anchoring in the here and now when you feel scattered or overwhelmed.',
    whyItMatters: 'When you’re anxious or dissociated, your mind is in the past or future. Grounding brings you back to the present so you can feel safer.',
    whatResearchSays: 'Sensory grounding (5-4-3-2-1, cold water, feet on floor) is used in PTSD and anxiety treatment. It engages the here-and-now.',
    practiceTips: ['5-4-3-2-1: name 5 things you see, 4 hear, 3 touch, 2 smell, 1 taste.', 'Feel your feet on the floor or your back against the chair.', 'Hold something cold or warm and focus only on that sensation.'],
    paceNote: 'Use it whenever you need it — no minimum practice required.',
    practiceChallenge: 'Name 5 things you see and 4 you hear right now — out loud or in your head.',
  },
  {
    id: 'recovery', domainId: 'regulate', order: 8, title: 'Recovery', shortTitle: 'Recovery', emoji: '🔋',
    description: 'Bouncing back after difficulty and restoring your baseline.',
    whyItMatters: 'Recovery isn’t laziness — it’s how your nervous system and mind restore. Without it, stress accumulates.',
    whatResearchSays: 'Recovery (physical and psychological) is linked to resilience and performance. Rest and restoration are evidence-based parts of sustainable coping.',
    practiceTips: ['Schedule short rest blocks; treat them as non-negotiable.', 'After something hard, do one thing that restores you (walk, quiet, sleep).', 'Use the Body gauge and Body Maintenance to track rest and recovery.'],
    paceNote: 'Recovery looks different for everyone. Find what works for you.',
    practiceChallenge: 'Do one thing today that restores you after something hard — even for 5 minutes.',
  },
  // Connect (Relationship)
  {
    id: 'empathy', domainId: 'connect', order: 9, title: 'Empathy', shortTitle: 'Empathy', emoji: '💜',
    description: 'Sensing and understanding what others might be feeling.',
    whyItMatters: 'Empathy builds trust and de-escalates conflict. It doesn’t mean you agree — it means you can imagine the other person’s experience.',
    whatResearchSays: 'Empathy is associated with better relationship quality and prosocial behavior. It has cognitive and affective components, both improvable with practice.',
    practiceTips: ['In conversations, ask yourself: "What might they be feeling?"', 'Use the Relate tool to practice seeing another’s perspective.', 'Listen without planning your reply; just take in what they say.'],
    paceNote: 'You don’t have to get it perfect. Curiosity is enough.',
    practiceChallenge: 'Ask someone how their day really went — and listen without interrupting or fixing.',
  },
  {
    id: 'communication', domainId: 'connect', order: 10, title: 'Communication', shortTitle: 'Communication', emoji: '💬',
    description: 'Expressing yourself clearly and listening with care.',
    whyItMatters: 'Clear communication reduces misunderstanding and conflict. Good listening makes others feel seen and often deepens connection.',
    whatResearchSays: 'Assertive communication and active listening are associated with relationship satisfaction and conflict resolution. Both can be learned and practiced.',
    practiceTips: ['Talk with the AI: practice putting feelings into words in a low-stakes space.', 'Use "I feel…" and "I need…" instead of "You always…"', 'Pre-Check before hard conversations; use Reach Out when you’ve been distant.'],
    paceNote: 'One clear sentence at a time. You’re building a habit.',
    badgeName: 'Clear Communicator',
    practiceChallenge: 'Ask someone how their day really went and listen without interrupting.',
  },
  {
    id: 'boundaries', domainId: 'connect', order: 11, title: 'Boundaries', shortTitle: 'Boundaries', emoji: '🚧',
    description: 'Knowing and honoring your limits with others.',
    whyItMatters: 'Boundaries protect your energy and values. They’re not selfish — they make sustainable care and connection possible.',
    whatResearchSays: 'Healthy boundaries are linked to lower burnout and better relationship quality. Cultural context matters; boundaries can honor both self and family.',
    practiceTips: ['Use the Boundaries tool to explore what your limits are.', 'Start with one small "no" or "I need…" and notice what happens.', 'Revisit your values: boundaries often guard what you care about most.'],
    paceNote: 'Start small. You can expand boundaries over time.',
    practiceChallenge: 'Say no to one thing this week that drains your energy.',
  },
  {
    id: 'repair', domainId: 'connect', order: 12, title: 'Repair', shortTitle: 'Repair', emoji: '🔧',
    description: 'Mending ruptures and restoring trust after conflict or hurt.',
    whyItMatters: 'Ruptures are normal. Repair is what keeps relationships strong. Knowing how to apologize and reconnect is a skill.',
    whatResearchSays: 'Relationship repair (apology, reconnection) is central to attachment research and couples therapy. Successful repair strengthens bonds.',
    practiceTips: ['Use the Relationship Repair tool for a step-by-step approach.', 'Acknowledge impact: "I hear that I hurt you." Before defending.', 'Offer a small next step: "What would help from me right now?"'],
    paceNote: 'Repair can happen in small steps. You don’t have to fix everything at once.',
    badgeName: 'Relationship Builder',
    practiceChallenge: 'Reach out to one person you’ve been distant from — a simple "thinking of you" or "how are you?"',
  },
  // Grow (Direction)
  {
    id: 'reflection', domainId: 'grow', order: 13, title: 'Reflection', shortTitle: 'Reflection', emoji: '🔭',
    description: 'Looking back to learn and make meaning from experience.',
    whyItMatters: 'Reflection turns experience into learning. Without it, we repeat the same patterns; with it, we can adapt and grow.',
    whatResearchSays: 'Structured reflection improves learning and decision-making. Post-event reflection is used in coaching and clinical practice.',
    practiceTips: ['Use Post-Flight debrief after hard moments or days.', 'Ask: "What would I do differently? What did I do well?"', 'Write or talk through one situation per week — no need to do it all.'],
    paceNote: 'A few minutes of reflection counts. Quality over quantity.',
    practiceChallenge: 'After one situation this week, ask: "What would I do differently? What did I do well?"',
  },
  {
    id: 'learning', domainId: 'grow', order: 14, title: 'Learning', shortTitle: 'Learning', emoji: '📚',
    description: 'Taking in new information and adapting your understanding.',
    whyItMatters: 'Learning keeps you flexible and curious. It’s not about being right — it’s about updating your map when life shows you something new.',
    whatResearchSays: 'Growth mindset and learning orientation are linked to resilience and better coping. Learning style varies; knowing yours helps.',
    practiceTips: ['Take the Learning Style quiz so you know how you learn best.', 'After a lesson or conversation, ask: "What’s one thing I’m taking away?"', 'Try one lesson from Learn when you have a few minutes.'],
    paceNote: 'One insight at a time. You don’t have to master everything.',
    practiceChallenge: 'Complete one lesson from Learn and write one sentence: "One thing I’m taking away is…"',
  },
  {
    id: 'intention', domainId: 'grow', order: 15, title: 'Intention', shortTitle: 'Intention', emoji: '🎯',
    description: 'Setting and returning to what you want to prioritize.',
    whyItMatters: 'Intentions focus your energy. They’re gentler than rigid goals — you can return to them when you drift.',
    whatResearchSays: 'Setting intentions is associated with goal progress and well-being. Implementation intentions ("When X, I will Y") are especially effective.',
    practiceTips: ['Set one daily intention (e.g. "Today I’ll pause before I react").', 'Use the Direction gauge to align with what matters.', 'Revisit the 12 Questions — Purpose and Values — when you feel lost.'],
    paceNote: 'You can change your intention anytime. It’s a guide, not a rule.',
    badgeName: 'Decision Navigator',
    practiceChallenge: 'Set one intention for today and revisit it once — "When _____, I will _____."',
  },
  {
    id: 'meaning', domainId: 'grow', order: 16, title: 'Meaning', shortTitle: 'Meaning', emoji: '✨',
    description: 'Connecting your actions to what gives your life purpose.',
    whyItMatters: 'Meaning buffers stress and supports mental health. It doesn’t have to be grand — it’s the thread that connects what you do to what you care about.',
    whatResearchSays: 'Meaning in life is linked to lower depression and anxiety and greater well-being. It can come from belonging, purpose, or story.',
    practiceTips: ['Answer the Meaning and Legacy questions in the 12 Life Questions.', 'Use the Life Direction Finder to explore what matters to you.', 'Ask: "How does this small action connect to something I care about?"'],
    paceNote: 'Meaning evolves. Revisit when life changes.',
    badgeName: 'Life Pathfinder',
    practiceChallenge: 'Name one small action you did today and how it connects to something you care about.',
  },
];

const DOMAINS: SkillDomain[] = [
  {
    id: 'self',
    order: 1,
    title: 'Self',
    shortTitle: 'Self',
    emoji: '🪞',
    description: 'Awareness of your inner world — thoughts, feelings, body, and values.',
    skillIds: ['self-awareness', 'emotional-awareness', 'body-awareness', 'values-clarity'],
  },
  {
    id: 'regulate',
    order: 2,
    title: 'Regulate',
    shortTitle: 'Regulate',
    emoji: '🌊',
    description: 'Managing your state — calm, stress, grounding, and recovery.',
    skillIds: ['regulation', 'stress-tolerance', 'grounding', 'recovery'],
  },
  {
    id: 'connect',
    order: 3,
    title: 'Connect',
    shortTitle: 'Connect',
    emoji: '💜',
    description: 'Relationship skills — empathy, communication, boundaries, and repair.',
    skillIds: ['empathy', 'communication', 'boundaries', 'repair'],
  },
  {
    id: 'grow',
    order: 4,
    title: 'Grow',
    shortTitle: 'Grow',
    emoji: '✨',
    description: 'Direction and growth — reflection, learning, intention, and meaning.',
    skillIds: ['reflection', 'learning', 'intention', 'meaning'],
  },
];

export const HUMAN_SKILL_DOMAINS = DOMAINS;
export const HUMAN_SKILLS = SKILLS;
export const SKILL_IDS: SkillId[] = SKILLS.map((s) => s.id);
export const SKILL_DOMAIN_IDS: SkillDomainId[] = DOMAINS.map((d) => d.id);

export function getSkillById(id: SkillId): HumanSkill | undefined {
  return SKILLS.find((s) => s.id === id);
}

export function getDomainById(id: SkillDomainId): SkillDomain | undefined {
  return DOMAINS.find((d) => d.id === id);
}

export function getSkillsInOrder(): HumanSkill[] {
  return [...SKILLS].sort((a, b) => a.order - b.order);
}

export function getDomainsInOrder(): SkillDomain[] {
  return [...DOMAINS].sort((a, b) => a.order - b.order);
}

export function getSkillsForDomain(domainId: SkillDomainId): HumanSkill[] {
  const domain = getDomainById(domainId);
  if (!domain) return [];
  return domain.skillIds
    .map((id) => getSkillById(id))
    .filter((s): s is HumanSkill => Boolean(s));
}
