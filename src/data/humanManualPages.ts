/**
 * Human Manual — Individual pages (Signals, Cascades, Repairs, Long Game, Big Questions).
 * Every page: Quick Truth → Science → What It Looks Like → What Helps → Learn More.
 */

export interface HumanManualPage {
  slug: string;
  title: string;
  emoji: string;
  quickTruth: string;
  science: string;
  whatItLooksLike: string[];
  whatHelps: string[];
  learnMore: string[];
}

export const HUMAN_MANUAL_PAGES: HumanManualPage[] = [
  // ═══ PART 2: SIGNALS ═══
  {
    slug: 'signal-burnout',
    title: 'Burnout',
    emoji: '🔥',
    quickTruth: 'Burnout happens when effort and recovery stay out of balance for too long.',
    science:
      'Chronic stress keeps the sympathetic nervous system activated and suppresses recovery. Research on allostatic load shows that when demands consistently exceed resources, the body and mind exhaust their capacity to adapt. Burnout is not laziness—it’s the system saying it can’t sustain the current load.',
    whatItLooksLike: [
      'Exhaustion that sleep doesn’t fix',
      'Irritability or cynicism',
      'Loss of motivation and sense of meaning',
      'Difficulty concentrating',
      'Withdrawing from people or responsibilities',
    ],
    whatHelps: [
      'Prioritize sleep and rest (recovery cascade)',
      'Reduce task load where possible',
      'Social support and connection',
      'Boundaries: say no to nonessential demands',
      'Use Breath, Reset, and Grounding tools',
    ],
    learnMore: ['Stress and recovery cycles', 'Allostatic load', 'Job burnout research'],
  },
  {
    slug: 'signal-anxiety',
    title: 'Anxiety',
    emoji: '😰',
    quickTruth: 'Anxiety is your nervous system’s alarm. It’s trying to protect you—often from uncertainty or perceived threat.',
    science:
      'Anxiety involves the amygdala and prefrontal cortex. When the brain perceives threat (real or imagined), it triggers fight-flight-freeze. Chronic anxiety can come from past trauma, ongoing stress, or patterns of catastrophic thinking. The body doesn’t distinguish between a real tiger and a worried thought.',
    whatItLooksLike: [
      'Racing thoughts or rumination',
      'Restlessness, tension, or panic',
      'Avoiding situations that trigger it',
      'Sleep or appetite changes',
      'Physical symptoms: chest tightness, stomach issues',
    ],
    whatHelps: [
      'Check Body and State first (sleep, food, caffeine)',
      'Grounding and breath to calm the nervous system',
      'Name the feeling; often “anxiety” masks specific fears',
      'Small steps toward what you’re avoiding',
      'Professional support if it’s persistent or disabling',
    ],
    learnMore: ['Anxiety and the nervous system', 'Cognitive behavioral approaches', 'Acceptance and commitment therapy'],
  },
  {
    slug: 'signal-loneliness',
    title: 'Loneliness',
    emoji: '🏝️',
    quickTruth: 'Humans are biologically wired for connection. Loneliness is a signal that your system needs more meaningful contact.',
    science:
      'Social isolation increases stress hormones and affects brain health. Loneliness is associated with higher risk for depression, cardiovascular issues, and cognitive decline. It’s not about how many people you know—it’s about feeling seen, valued, and connected. Quality and consistency matter more than quantity.',
    whatItLooksLike: [
      'Feeling invisible or misunderstood',
      'Withdrawing from people even when you want connection',
      'Loss of motivation to reach out',
      'Comparing yourself to others’ social lives',
      'Feeling like no one really knows you',
    ],
    whatHelps: [
      'Reach out to one person today (even a short message)',
      'Shared experiences: do something with someone, not just chat',
      'Community: groups, volunteering, or regular gatherings',
      'Be honest with someone you trust: “I’ve been feeling lonely.”',
    ],
    learnMore: ['Social baseline theory', 'Attachment and belonging', 'Loneliness and health research'],
  },
  {
    slug: 'signal-overwhelm',
    title: 'Overwhelm',
    emoji: '🌊',
    quickTruth: 'Overwhelm is direction overload: too many demands and not enough sense of control or order.',
    science:
      'When the prefrontal cortex is overloaded, decision-making and prioritization suffer. Stress narrows attention and makes it harder to see options. Overwhelm often involves Direction (too many goals/tasks), State (nervous system overload), and Emotion (anxiety or helplessness) at once.',
    whatItLooksLike: [
      'Can’t decide what to do first',
      'Paralysis or procrastination',
      'Feeling like everything is urgent',
      'Irritability or tearfulness',
      'Avoiding looking at the full picture',
    ],
    whatHelps: [
      'Write everything down to get it out of your head',
      'Pick one small next step; ignore the rest for now',
      'Use Plan or Focus tools to create structure',
      'Reduce inputs: mute notifications, say no to one thing',
      'Reset or Breath to calm the nervous system first',
    ],
    learnMore: ['Cognitive load', 'Decision fatigue', 'Stress and executive function'],
  },
  {
    slug: 'signal-numbness',
    title: 'Emotional numbness',
    emoji: '❄️',
    quickTruth: 'Numbness is often the nervous system’s way of protecting you from more than it can process.',
    science:
      'Emotional numbing can follow prolonged stress, trauma, or depression. The brain may shut down access to feelings to reduce pain. It can also be a side effect of certain medications or sleep deprivation. It’s a signal that the system is overloaded or in protection mode.',
    whatItLooksLike: [
      'Feeling flat or “nothing” when you used to feel more',
      'Disconnecting from activities or people you cared about',
      'Going through motions without feeling',
      'Difficulty identifying what you feel',
    ],
    whatHelps: [
      'Check Body and State (sleep, rest, safety)',
      'Gentle reconnection: small moments of pleasure or connection',
      'Don’t force feeling; create conditions for it to return',
      'Therapy or support if numbness is long-lasting or troubling',
    ],
    learnMore: ['Emotional numbing and trauma', 'Depression and anhedonia', 'Nervous system regulation'],
  },
  {
    slug: 'signal-motivation-loss',
    title: 'Motivation loss',
    emoji: '🔋',
    quickTruth: 'Motivation drops when Direction, Alignment, or energy are off—or when the system is depleted.',
    science:
      'Motivation involves dopamine, goals, and meaning. It drops when we’re exhausted (State/Body), when goals feel meaningless (Alignment), or when we’re unclear or overloaded (Direction). Depression and chronic stress also dampen motivation. It’s rarely laziness—it’s the system saying something needs to change.',
    whatItLooksLike: [
      'Hard to start or follow through',
      'Goals that used to matter feel pointless',
      'Waiting to “feel like it” before acting',
      'Guilt or shame about not doing more',
    ],
    whatHelps: [
      'Restore Body and State (sleep, movement, rest)',
      'Reconnect to why it mattered (Alignment)',
      'Tiny steps: one small action, not the whole plan',
      'Reduce overwhelm so Direction feels clearer',
    ],
    learnMore: ['Motivation and dopamine', 'Behavioral activation', 'Meaning and purpose research'],
  },
  {
    slug: 'signal-conflict',
    title: 'Conflict',
    emoji: '⚡',
    quickTruth: 'Conflict is a signal that needs, boundaries, or values are clashing. It’s normal—repair is the skill.',
    science:
      'Conflict activates the threat system; we often fight, flee, or freeze. Attachment research shows that repair—reconnecting after rupture—matters more than avoiding conflict. Unresolved conflict keeps the nervous system on alert and damages trust. Healthy conflict involves clear communication and repair attempts.',
    whatItLooksLike: [
      'Repeated arguments about the same thing',
      'Withdrawal or stonewalling',
      'Criticism, defensiveness, or contempt',
      'Avoiding the person or the topic',
    ],
    whatHelps: [
      'Cool down first (Breath, Reset) so you don’t escalate',
      'Use “I” statements and ask what they need',
      'Repair: “I don’t want us to be on opposite sides.”',
      'Human Roles guide for relationship-specific repair',
    ],
    learnMore: ['Gottman Institute conflict research', 'Nonviolent communication', 'Attachment and repair'],
  },
  {
    slug: 'signal-feeling-lost',
    title: 'Feeling lost',
    emoji: '🧭',
    quickTruth: 'Feeling lost usually means Direction or Alignment is unclear—you’re missing a map or a “why.”',
    science:
      'Humans need a sense of direction and meaning. When goals are unclear, values are unexamined, or life has changed (loss, transition), we can feel adrift. This touches Direction (what am I moving toward?) and Alignment (what matters?). It’s common after big transitions or when old answers no longer fit.',
    whatItLooksLike: [
      '“I don’t know what I want”',
      'Comparing yourself to others’ paths',
      'Drifting through days without purpose',
      'Fear of choosing wrong',
    ],
    whatHelps: [
      'Explore values and what mattered to you in the past',
      'Small experiments: try one direction without committing forever',
      'Talk to people who know you; they often see patterns you miss',
      'Accept that “lost” is part of growth and transition',
    ],
    learnMore: ['Purpose and identity', 'Life transitions', 'Values clarification'],
  },
  // ═══ PART 3: CASCADES ═══
  {
    slug: 'cascade-recovery',
    title: 'Recovery cascade',
    emoji: '😴',
    quickTruth: 'Sleep ↓ → Energy ↓ → Stress ↑ → Emotion unstable. Fix recovery first and the rest improves.',
    science:
      'Sleep is the foundation of recovery. Poor sleep impairs emotional regulation, attention, and physical health. When you’re under-slept, the amygdala is more reactive and the prefrontal cortex is less effective. Recovery cascades work both ways: better sleep supports better state and emotion.',
    whatItLooksLike: [
      'One bad night leads to worse mood and more stress',
      'Tired → more irritable → more conflict → worse sleep',
      'Chronic fatigue and feeling like you can’t catch up',
    ],
    whatHelps: [
      'Protect sleep: consistent time, dark room, limit screens',
      'Reduce nonessential demands until you’re rested',
      'Use Breath and Reset to support nervous system recovery',
    ],
    learnMore: ['Sleep and emotional regulation', 'Allostatic load', 'Recovery research'],
  },
  {
    slug: 'cascade-attention',
    title: 'Attention cascade',
    emoji: '📉',
    quickTruth: 'Work overload → chronic stress → emotional exhaustion. Life problems are system problems.',
    science:
      'Sustained cognitive demand without recovery depletes the prefrontal cortex. Attention is a limited resource. When we’re constantly “on,” stress hormones stay elevated and we burn out. The cascade spreads from Direction (too much to do) to State (dysregulation) to Emotion (exhaustion, numbness).',
    whatItLooksLike: [
      'Can’t focus; everything feels urgent',
      'Burnout after long periods of high demand',
      'Irritability and reduced capacity for connection',
    ],
    whatHelps: [
      'Boundaries: reduce load and protect focus time',
      'Focus tool: time-box deep work and breaks',
      'Recovery: sleep, rest, and non-work connection',
    ],
    learnMore: ['Attention and cognitive load', 'Burnout and recovery', 'Focus and productivity research'],
  },
  {
    slug: 'cascade-reciprocity',
    title: 'Reciprocity cascade',
    emoji: '🤝',
    quickTruth: 'Isolation → loneliness → meaning loss. Connection feeds meaning; meaning feeds the will to connect.',
    science:
      'Humans are wired for give-and-take. When we’re isolated, we get less feedback, less support, and less sense of mattering. Loneliness increases stress and reduces motivation to reach out, which can deepen isolation. Breaking the cascade usually requires one deliberate step toward connection.',
    whatItLooksLike: [
      'Pulling away when you need people most',
      'Feeling like no one cares, so you stop reaching out',
      'Loss of purpose when connection drops',
    ],
    whatHelps: [
      'One reach-out: message, call, or show up somewhere',
      'Reciprocity: offer help as well as ask for it',
      'Regular small contact beats rare big gestures',
    ],
    learnMore: ['Social baseline theory', 'Loneliness and health', 'Reciprocity in relationships'],
  },
  {
    slug: 'cascade-meaning',
    title: 'Meaning cascade',
    emoji: '💫',
    quickTruth: 'Purpose loss → motivation drops → direction feels empty. Alignment and Direction fuel each other.',
    science:
      'Meaning and purpose are linked to resilience and wellbeing. When we lose a sense of “why,” motivation and direction suffer. The cascade can start from a loss (job, relationship, identity) or from prolonged stress that makes everything feel pointless. Restoring meaning often starts with small values-aligned actions.',
    whatItLooksLike: [
      '“Nothing matters” or “What’s the point?”',
      'Goals that used to drive you feel hollow',
      'Drifting without a sense of direction',
    ],
    whatHelps: [
      'Reconnect to values: what mattered before?',
      'Small meaningful actions, not one big answer',
      'Connection and contribution often restore sense of purpose',
    ],
    learnMore: ['Meaning and purpose research', 'Values and wellbeing', 'Post-traumatic growth'],
  },
  {
    slug: 'cascade-stress',
    title: 'Stress cascade',
    emoji: '🌪️',
    quickTruth: 'Emotion → State → Body. Unprocessed emotion stresses the nervous system; chronic stress affects the body.',
    science:
      'Stress flows through the system. Emotional distress activates the nervous system (State); chronic activation affects sleep, immunity, and physical health (Body). The cascade can start from any gauge: unresolved conflict (Emotion), overload (Direction), or poor sleep (Body). Understanding the cascade helps you intervene at the right place.',
    whatItLooksLike: [
      'Emotional upset that turns into headaches or insomnia',
      'Chronic stress that shows up as illness or exhaustion',
      'Physical symptoms when you’re emotionally overloaded',
    ],
    whatHelps: [
      'Regulate at the level you can: Breath, Grounding, Reset',
      'Process emotion: name it, talk about it, or write',
      'Address Body: sleep, movement, rest',
    ],
    learnMore: ['Stress and the body', 'Psychoneuroimmunology', 'Emotion and health'],
  },
  // ═══ PART 4: REPAIRS ═══
  {
    slug: 'repair-breath',
    title: 'Breath',
    emoji: '🌬️',
    quickTruth: 'Slow, steady breathing signals safety to the nervous system and shifts you toward calm.',
    science:
      'The breath is a direct lever on the autonomic nervous system. Extended exhales and diaphragmatic breathing activate the parasympathetic (rest-and-digest) response. Even 1–2 minutes can lower heart rate and reduce anxiety. It’s one of the fastest ways to interrupt a stress cascade.',
    whatItLooksLike: [
      'Use when you’re activated, anxious, or before reacting',
      'Use to transition from work to rest',
    ],
    whatHelps: [
      'Try 4–6 breaths per minute (inhale 4 counts, exhale 6).',
      'Use the Breath activity in the app for a guided reset.',
    ],
    learnMore: ['Polyvagal theory and breath', 'Heart rate variability', 'Respiration and stress'],
  },
  {
    slug: 'repair-grounding',
    title: 'Grounding',
    emoji: '🌍',
    quickTruth: 'Grounding brings you back to the present and into your body when you’re dissociated or overwhelmed.',
    science:
      'Grounding techniques use the senses (5-4-3-2-1: see, touch, hear, smell, taste) or the body (feet on floor, weight in chair) to anchor attention in the here-and-now. They reduce rumination and panic by shifting focus from internal threat to external safety. Effective for anxiety and emotional overwhelm.',
    whatItLooksLike: [
      'Use when you’re spaced out, panicky, or flooded',
      'Use when your mind is racing and you need to slow down',
    ],
    whatHelps: [
      '5-4-3-2-1: name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.',
      'Feel your feet on the floor; notice the weight of your body.',
    ],
    learnMore: ['Grounding and trauma', 'Sensory awareness', 'Anxiety and present-moment focus'],
  },
  {
    slug: 'repair-reset',
    title: 'Reset',
    emoji: '↻',
    quickTruth: 'A short reset breaks the stress spiral and gives the nervous system a chance to recover.',
    science:
      'Brief pauses—physical, mental, or both—reduce allostatic load. The Quick Reset tool in the app combines movement, breath, and intention to create a “circuit breaker” for stress. Even 2–3 minutes can shift state and improve the next hour.',
    whatItLooksLike: [
      'Use between tasks or when you’re stuck in a bad state',
      'Use when you need to show up better for someone',
    ],
    whatHelps: [
      'Use the Quick Reset tool in the app.',
      'Or: stand, stretch, take 5 slow breaths, then choose one next action.',
    ],
    learnMore: ['Micro-breaks and performance', 'Stress interruption', 'Nervous system regulation'],
  },
  {
    slug: 'repair-reframe',
    title: 'Reframe',
    emoji: '🔄',
    quickTruth: 'Reframing changes the story you tell yourself so you can see options and reduce helplessness.',
    science:
      'Cognitive reframing doesn’t deny reality—it shifts perspective. “I’m stuck” → “I haven’t found the right step yet.” Research shows that how we interpret events affects emotion and behavior. Reframing can reduce anxiety and open up problem-solving.',
    whatItLooksLike: [
      'Use when you’re stuck in a negative or catastrophic story',
      'Use when one interpretation is driving all your feelings',
    ],
    whatHelps: [
      'Ask: “What’s another way to see this?”',
      'Decode tool in the app can help unpack thoughts and feelings.',
    ],
    learnMore: ['Cognitive reframing', 'Cognitive behavioral therapy', 'Interpretation and emotion'],
  },
  {
    slug: 'repair-focus',
    title: 'Focus',
    emoji: '⏱️',
    quickTruth: 'Focused attention in time-boxed blocks reduces overwhelm and improves clarity.',
    science:
      'Attention is limited. Time-boxing (e.g., Pomodoro) creates structure and reduces decision fatigue. Short focus blocks with breaks protect the nervous system from sustained overload. The Focus tool in the app supports this.',
    whatItLooksLike: [
      'Use when you have too much to do and can’t start',
      'Use when you need to do deep work without distraction',
    ],
    whatHelps: [
      'Pick one task. Set a timer (e.g., 25 min). Work until it rings. Short break. Repeat.',
      'Use the Focus tool in the app for timer and exercises.',
    ],
    learnMore: ['Time management and attention', 'Pomodoro technique', 'Deep work'],
  },
  {
    slug: 'repair-reach-out',
    title: 'Reach out',
    emoji: '💬',
    quickTruth: 'One message or call can interrupt loneliness and reconnect you to your people.',
    science:
      'Social connection regulates the nervous system and supports mood. Reaching out often feels hard when we need it most (withdrawal, shame). Action comes before motivation: small steps—a text, a call, showing up—break the isolation cascade.',
    whatItLooksLike: [
      'Use when you’re lonely or disconnected',
      'Use when you’ve been withdrawing and want to reconnect',
    ],
    whatHelps: [
      'Send one short message: “Thinking of you” or “How are you?”',
      'Use the Talk or Reach Out tools in the app to scaffold the step.',
    ],
    learnMore: ['Social connection and health', 'Loneliness interventions', 'Reach out and reciprocity'],
  },
  {
    slug: 'repair-conflict',
    title: 'Repair conflict',
    emoji: '🤝',
    quickTruth: 'Repair is reconnecting after rupture. It’s often more important than avoiding conflict.',
    science:
      'Gottman research shows that repair attempts—gestures that say “we’re on the same team”—predict relationship success. Repair can be an apology, a touch, humor, or naming the desire to reconnect. It calms the nervous system and restores trust.',
    whatItLooksLike: [
      'Use after an argument or when you’ve hurt someone',
      'Use when there’s been distance or resentment',
    ],
    whatHelps: [
      '“I don’t want us to be on opposite sides.”',
      '“I was wrong to…” or “I’m sorry I…”',
      'Human Roles guide for role-specific repair (Partner, Parent, Friend).',
    ],
    learnMore: ['Gottman repair research', 'Attachment and repair', 'Conflict and reconciliation'],
  },
  // ═══ PART 6: LONG GAME ═══
  {
    slug: 'long-career',
    title: 'Career choices',
    emoji: '💼',
    quickTruth: 'Career is Direction and Alignment: what you do and whether it matches your values and capacity.',
    science:
      'Career satisfaction depends on fit (skills, interests), meaning (Alignment), and sustainability (State, Body). Transitions are stressful; the brain prefers certainty. Research shows that values-based experimentation and small steps reduce anxiety and improve decision quality.',
    whatItLooksLike: [
      'Uncertainty about what to do next',
      'Burnout or boredom in current role',
      'Conflict between money, meaning, and lifestyle',
    ],
    whatHelps: [
      'Clarify values: what matters beyond paycheck?',
      'Small experiments: informational interviews, side projects',
      'Balance Direction with State and Body (don’t sacrifice health for career).',
    ],
    learnMore: ['Career transition research', 'Values and work', 'Decision-making under uncertainty'],
  },
  {
    slug: 'long-marriage',
    title: 'Marriage & partnership',
    emoji: '💑',
    quickTruth: 'Partnerships thrive on emotional responsiveness, repair, and shared direction.',
    science:
      'Attachment and Gottman research show that responsiveness, appreciation (5:1 positive to negative), and repair after conflict predict longevity. Partnerships are systems: when one person’s State or Emotion drops, the relationship is affected. Connection and Direction (shared goals) both matter.',
    whatItLooksLike: [
      'Communication breakdown or repeated conflict',
      'Feeling disconnected or taken for granted',
      'Life stage changes (kids, aging, illness) stressing the system',
    ],
    whatHelps: [
      'Human Roles → Partner: what partners need, common mistakes, what works.',
      'Repair attempts and appreciation.',
      'Shared time and shared direction (goals, values).',
    ],
    learnMore: ['Gottman Institute', 'Attachment in couples', 'Relationship maintenance'],
  },
  {
    slug: 'long-parenting',
    title: 'Parenting',
    emoji: '👨‍👩‍👧',
    quickTruth: 'Children need safety, predictability, attention, encouragement, and boundaries. You can’t pour from an empty cup.',
    science:
      'Developmental psychology shows that secure attachment and consistent care build resilience. Parents’ own State and Emotion affect the child’s regulation. Connection before correction; repair after rupture. Parent wellbeing is part of the system—rest and support matter.',
    whatItLooksLike: [
      'Guilt, overwhelm, or feeling like you’re failing',
      'Conflict with co-parent or child',
      'Losing your temper or withdrawing when stressed',
    ],
    whatHelps: [
      'Human Roles → Parent: what children need, what works, quick actions.',
      'Regulate your own State (Breath, Reset) before responding.',
      'Prioritize rest and support so you can show up consistently.',
    ],
    learnMore: ['Attachment and parenting', 'Developmental psychology', 'Parent wellbeing'],
  },
  {
    slug: 'long-aging',
    title: 'Aging',
    emoji: '🌅',
    quickTruth: 'Aging involves physical change, identity shifts, and often grief—but also wisdom and meaning.',
    science:
      'Aging affects Body (sleep, health), State (stress, loss), and Alignment (meaning, legacy). Research on aging well highlights connection, purpose, and adaptation. Ageism and isolation are real risks; community and contribution protect against decline.',
    whatItLooksLike: [
      'Health changes, loss of roles, or fear of decline',
      'Loneliness or feeling invisible',
      'Re-evaluating what matters',
    ],
    whatHelps: [
      'Stay connected: relationships and community.',
      'Contribute: mentoring, volunteering, sharing wisdom.',
      'Adapt goals (Direction) and meaning (Alignment) to new capacity.',
    ],
    learnMore: ['Aging and wellbeing', 'Successful aging', 'Purpose in later life'],
  },
  {
    slug: 'long-grief',
    title: 'Grief and loss',
    emoji: '🕊️',
    quickTruth: 'Grief is the natural response to loss. It affects the whole system and doesn’t follow a straight line.',
    science:
      'Grief involves Emotion, State, and often Alignment (meaning, identity). It’s not stages so much as waves—sometimes overwhelming, sometimes quiet. The nervous system is in shock; the brain is adapting to a world without the person or thing lost. Support and time are essential.',
    whatItLooksLike: [
      'Sadness, anger, numbness, or disbelief',
      'Exhaustion, poor sleep, or appetite changes',
      'Questioning meaning or purpose',
    ],
    whatHelps: [
      'Allow the feelings; don’t force “moving on.”',
      'Connection: people who can hold space without fixing.',
      'Ritual, memory, and meaning-making when you’re ready.',
      'Professional support if grief is stuck or disabling.',
    ],
    learnMore: ['Grief research', 'Complicated grief', 'Meaning-making after loss'],
  },
  {
    slug: 'long-identity',
    title: 'Identity changes',
    emoji: '🪞',
    quickTruth: 'Who you are can shift with life stages, loss, or choice. Identity change is disorienting but can open growth.',
    science:
      'Identity is tied to roles, relationships, and beliefs. When those change—job loss, becoming a parent, coming out, illness—we can feel lost. Research on identity transition shows that narrative (storying the change) and social support help integration. Alignment (values) can anchor when roles shift.',
    whatItLooksLike: [
      '“I don’t know who I am anymore”',
      'Old labels no longer fit',
      'Conflict between who you were and who you’re becoming',
    ],
    whatHelps: [
      'Give yourself time; identity integration isn’t instant.',
      'Connect with others who’ve been through similar shifts.',
      'Revisit values: what’s still true when the rest is changing?',
    ],
    learnMore: ['Identity and transition', 'Narrative identity', 'Life transitions'],
  },
  {
    slug: 'long-midlife',
    title: 'Midlife shifts',
    emoji: '⏳',
    quickTruth: 'Midlife often brings a reckoning with limits, meaning, and what’s left. It can be a crisis or a correction.',
    science:
      'Midlife is associated with increased reflection on meaning and mortality. “Midlife crisis” is a caricature; many people experience a quieter recalibration—of goals, relationships, and values. Depression and anxiety can spike; so can post-traumatic growth and clarity about what matters.',
    whatItLooksLike: [
      'Questioning choices or feeling stuck',
      'Shifts in energy, health, or relationships',
      'Desire for change without a clear map',
    ],
    whatHelps: [
      'Revisit Alignment: what matters now, not 20 years ago?',
      'Small experiments rather than one big leap.',
      'Connection and purpose: who and what give you meaning?',
    ],
    learnMore: ['Midlife development', 'Meaning and mortality', 'Post-traumatic growth'],
  },
  {
    slug: 'long-retirement',
    title: 'Retirement',
    emoji: '🏖️',
    quickTruth: 'Retirement is a major transition in Direction and identity. Structure and purpose still matter.',
    science:
      'Retirement removes work’s structure and often its sense of purpose. Research shows that planning for identity, connection, and meaningful activity predicts wellbeing in retirement. Loss of routine and social contact can affect State and Emotion; purpose and connection protect.',
    whatItLooksLike: [
      'Loss of routine or sense of purpose',
      'Relationship shifts (more time with partner, less with colleagues)',
      'Financial or health uncertainty',
    ],
    whatHelps: [
      'Create new structure: routines, hobbies, volunteering.',
      'Maintain and build connection.',
      'Align days with values: what do you want to contribute or enjoy?',
    ],
    learnMore: ['Retirement and wellbeing', 'Purpose in retirement', 'Aging and connection'],
  },
  // ═══ PART 7: BIG QUESTIONS ═══
  {
    slug: 'big-meaning',
    title: 'What is a meaningful life?',
    emoji: '🌟',
    quickTruth: 'Meaning comes from connection, contribution, and living in line with your values—not from one right answer.',
    science:
      'Research on meaning (e.g., Viktor Frankl, modern positive psychology) points to belonging, purpose, and coherence (making sense of life). Meaning is built through action and relationship, not found once. It’s the Alignment gauge in practice: what matters to you, and are you living it?',
    whatItLooksLike: [
      'Asking “Is this all there is?”',
      'Feeling like life is on autopilot',
      'Wanting to matter or leave a mark',
    ],
    whatHelps: [
      'Clarify values: what would you want said about you at the end?',
      'Connection and contribution: who do you care for? What do you give?',
      'Small steps toward what feels meaningful, not one big answer.',
    ],
    learnMore: ['Meaning and purpose research', 'Logotherapy', 'Values and wellbeing'],
  },
  {
    slug: 'big-decisions',
    title: 'How to make difficult decisions',
    emoji: '⚖️',
    quickTruth: 'Hard decisions rarely have a single right answer. Values, information, and acceptance of uncertainty help.',
    science:
      'Decision-making under uncertainty is cognitively demanding. We’re biased toward loss aversion and status quo. Research suggests that values clarification, gathering limited (not excessive) information, and “satisficing” (good enough) often beat endless analysis. Some decisions are about who you want to be, not just outcomes.',
    whatItLooksLike: [
      'Paralysis between options',
      'Fear of regretting the choice',
      'Pressure from others or from “shoulds.”',
    ],
    whatHelps: [
      'Name what matters most (values).',
      'Set a deadline; avoid infinite research.',
      'Ask: “Which option lets me be the person I want to be?”',
    ],
    learnMore: ['Decision-making research', 'Values and decisions', 'Regret and choice'],
  },
  {
    slug: 'big-suffering',
    title: 'Why humans suffer',
    emoji: '🕯️',
    quickTruth: 'Suffering is part of being human. It can break us or open us—often both. We don’t choose it; we choose how we respond.',
    science:
      'Philosophy and psychology have long grappled with suffering. Pain is inevitable in life (loss, illness, failure); suffering can be amplified by resistance, isolation, or meaninglessness. Connection, meaning-making, and acceptance (e.g., ACT) don’t remove pain but can reduce suffering. We’re wired for both vulnerability and resilience.',
    whatItLooksLike: [
      '“Why me?” or “Why do bad things happen?”',
      'Struggling with unfairness or randomness',
      'Feeling crushed by loss or hardship',
    ],
    whatHelps: [
      'Don’t suffer alone: connection reduces the weight.',
      'Find or create meaning where you can.',
      'Acceptance doesn’t mean approval—it means not fighting reality at every turn.',
    ],
    learnMore: ['Philosophy of suffering', 'Acceptance and commitment therapy', 'Resilience research'],
  },
  {
    slug: 'big-happiness',
    title: 'What creates happiness',
    emoji: '😊',
    quickTruth: 'Happiness is less about one thing and more about connection, meaning, and sustainable wellbeing (State, Body, Alignment).',
    science:
      'Research (e.g., positive psychology, longitudinal studies) suggests that relationships, purpose, and health matter more than wealth or achievement past a baseline. Hedonic adaptation means we get used to wins; lasting wellbeing comes from how we live—connection, gratitude, flow, and values—not from a single event.',
    whatItLooksLike: [
      'Chasing the next win and still feeling empty',
      'Comparing your life to others’ highlights',
      'Waiting for happiness instead of building it',
    ],
    whatHelps: [
      'Invest in connection and contribution.',
      'Practice gratitude and savoring.',
      'Align daily life with values (Alignment).',
    ],
    learnMore: ['Positive psychology', 'Happiness research', 'Wellbeing and connection'],
  },
  {
    slug: 'big-growth',
    title: 'How people grow and change',
    emoji: '🌱',
    quickTruth: 'Growth isn’t linear. It often comes from disruption, reflection, and small repeated choices.',
    science:
      'Change involves neuroplasticity (the brain can rewire), behavior (repeated actions shape habits), and context (relationships and environment). Post-traumatic growth research shows that struggle can lead to new meaning and strength. Growth usually requires safety enough to risk, and practice over time.',
    whatItLooksLike: [
      'Wanting to change but feeling stuck',
      'Old patterns repeating despite intention',
      'Growth after loss or crisis',
    ],
    whatHelps: [
      'Small steps: change one behavior, not everything at once.',
      'Reflect: what’s the pattern? What do I want instead?',
      'Support: therapy, community, or someone who believes in you.',
    ],
    learnMore: ['Post-traumatic growth', 'Behavior change', 'Neuroplasticity'],
  },
  {
    slug: 'big-end-of-life',
    title: 'What matters at the end of life',
    emoji: '🌅',
    quickTruth: 'People at the end of life often speak of love, connection, and meaning—not achievements or stuff.',
    science:
      'Research with the dying (e.g., Bronnie Ware’s “regrets of the dying”) and palliative care shows that relationships, authenticity, and meaning rise to the top. Regrets often center on not living true to oneself, not staying in touch, and working too hard. The end of life clarifies what the Manual is for: living aligned, connected, and awake.',
    whatItLooksLike: [
      'Thinking about mortality or legacy',
      'Wondering if you’re spending time on what matters',
      'Facing illness or loss of someone close',
    ],
    whatHelps: [
      'Use the question as a compass: what would I want to have done?',
      'Prioritize connection and presence now.',
      'Forgiveness and repair where possible.',
    ],
    learnMore: ['End-of-life research', 'Meaning and mortality', 'Regrets and priorities'],
  },
];

export function getManualPageBySlug(slug: string): HumanManualPage | undefined {
  return HUMAN_MANUAL_PAGES.find((p) => p.slug === slug);
}
