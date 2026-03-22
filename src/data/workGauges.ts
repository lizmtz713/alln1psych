/**
 * WORK & YOUR GAUGES
 * Industrial Psychology meets the Gauge System
 * 
 * 90,000 hours. That"s how long the average person spends at work.
 * Almost no one teaches us how work affects our psychology - and how to protect ourselves.
 */

export interface WorkGaugeImpact {
  gauge: string;
  emoji: string;
  color: string;
  howWorkAffectsIt: string;
  commonWorkDrains: string[];
  warningSignsAtWork: string[];
  protectionStrategies: string[];
  boundaryScripts: string[];
}

export interface WorkTool {
  id: string;
  emoji: string;
  title: string;
  description: string;
  whenToUse: string;
  howItWorks: string;
  timeNeeded: string;
}

export const WORK_INTRO = {
  headline: \"90,000 Hours\",
  subhead: \"That's how long you"ll spend at work. Let"s make sure it doesn't break you.\",
  
  philosophy: `Work isn"t separate from life - it"s where most of life happens. Yet we're taught to leave our humanity at the door. \"Be professional.\" \"Don"t bring personal stuff to work." "Push through."

This is a lie. You bring your whole nervous system to work every day. Your Body gauge depletes in that chair. Your State gauge activates with every urgent email. Your Emotion gauge gets suppressed to seem "appropriate." Your Connection gauge starves in remote isolation. Your Direction gauge questions if this is really it. Your Alignment gauge feels the gap between your values and your tasks.

Understanding how work affects your gauges isn"t just self-help - it's survival. It"s the difference between a sustainable career and burnout at 45. Between bringing your best self home and snapping at your family because you have nothing left.

This section won"t tell you to \"find your passion\" or \"hustle harder.\" It will help you understand the real psychological costs of work - and how to protect yourself while still showing up.`,

  reality: {
    title: \"The Reality Nobody Talks About\",
    points: [
      \"The 40-hour week was designed for one-income households with someone at home handling everything else. Most of us don't have that.\",
      \"Your brain wasn"t designed for 8 hours of focused knowledge work. It"s exhausting in ways physical labor isn't.\",
      \"Open offices, Slack, and "quick questions" mean most people can't do 2 hours of deep work in an 8-hour day.\",
      \"Remote work solved commutes but created 24/7 availability expectations and profound isolation.\",
      \"Most workplace stress isn"t about the work itself - it"s about lack of control, unclear expectations, and poor management.\",
      \"Burnout isn't weakness. It"s the predictable result of chronic stress without adequate recovery.",
    ]
  }
};

export const WORK_GAUGE_IMPACTS: WorkGaugeImpact[] = [
  {
    gauge: 'Body',
    emoji: '🫀',
    color: '#F87171",
    howWorkAffectsIt: `Your body wasn't designed for desk work. Sitting for 8+ hours is now linked to the same health risks as smoking. Your eyes strain at screens. Your shoulders hunch. Your back aches. You skip meals or eat garbage at your desk. You drink coffee instead of water. You hold your bladder for \"just one more meeting.\"

The worst part? This becomes normal. You stop noticing the headaches, the tension, the fatigue. Your Body gauge slowly drains, and you attribute the exhaustion to \"just how work is.\"

It doesn"t have to be this way. But you have to actively protect your body - work won"t do it for you.`,
    
    commonWorkDrains: [
      \"Sitting 6-10 hours without real movement\",
      \"Skipping breakfast, eating lunch at desk, working through hunger\",
      \"Caffeine dependence - coffee to start, coffee to push through, coffee to recover\",
      \"Blue light exposure all day disrupting circadian rhythm\",
      \"Chronic dehydration (water bottle sits untouched)\",
      \"Holding tension in shoulders, jaw, back without noticing\",
      \"Sleep disruption from work stress or late-night emails\",
      \"No exposure to natural light (especially in winter)\",
    ],
    
    warningSignsAtWork: [
      \"Afternoon crashes that coffee can't fix\",
      \"Headaches that start around 2-3pm\",
      \"Back/neck pain you"ve accepted as 'normal"\",
      \"Getting sick every time you take vacation (your body finally rests and crashes)\",
      \"Needing the whole weekend just to feel human again\",
      \"Digestive issues that correlate with stressful periods\",
      \"Sleep problems - can't fall asleep, can"t stay asleep, or wake up exhausted",
    ],
    
    protectionStrategies: [
      "Set hourly movement reminders - even 2 minutes of standing/stretching helps",
      "Protect lunch: leave your desk, eat real food, take 30 minutes minimum",
      "Hydration system: water bottle visible, drink before each meeting",
      "Walking meetings when possible (even just walking while on a call)",
      "Blue light glasses or screen warmth settings after 4pm",
      "Standing desk or sitting/standing rotation",
      "Boundaries on work hours to protect sleep",
      "Take your vacation. Actually disconnect. Your body needs it.",
    ],
    
    boundaryScripts: [
      "I"m stepping away from my desk for lunch. I'll be back at [time].\",
      \"I need to take a quick break before this next meeting. Give me 5 minutes.\",
      \"I"m going to walk while we talk - helps me think better.",
      "I"m offline after 6pm to protect my sleep. I'll respond tomorrow.\",
      \"I"m taking my vacation days and won't be checking email. [Person] can cover urgent issues.",
    ],
  },
  
  {
    gauge: 'State',
    emoji: '⚡',
    color: '#FACC15",
    howWorkAffectsIt: `Modern work keeps your nervous system in a constant state of low-grade activation. Not full fight-or-flight, but never fully at rest either. Email notifications. Slack pings. \"Got a minute?\" interruptions. Deadline pressure. Micromanagement. The knowledge that you're always behind on something.

This chronic activation is exhausting in ways that don"t show up on a to-do list. Your State gauge never fully returns to baseline. You"re always a little vigilant, a little braced, a little on edge. And your brain can't tell the difference between a saber-toothed tiger and a passive-aggressive email from your boss.

The result? You come home \"tired\" but can"t relax. Wired but exhausted. Your nervous system forgot how to turn off.`,
    
    commonWorkDrains: [
      "Always-on notification culture (email, Slack, Teams)",
      "Back-to-back meetings with no recovery time",
      "Unclear expectations or constantly shifting priorities",
      "Micromanagement that signals "you're not trusted"",
      "Toxic coworkers or bosses who keep you on edge",
      "Job insecurity - layoff fears, performance anxiety",
      "Work following you home via phone/laptop",
      "Sunday Scaries - dreading Monday from Saturday night",
    ],
    
    warningSignsAtWork: [
      "Heart rate spikes when you see certain names in your inbox",
      "Constantly checking email/Slack even when nothing is urgent",
      "Can"t stop thinking about work during off-hours\",
      \"Irritable and reactive in meetings\",
      \"Startle response to notification sounds\",
      \"Difficulty concentrating - jumping between tasks\",
      \"Physical tension you don't notice until you try to relax\",
      \"Exhausted but can"t sleep (system won't turn off)",
    ],
    
    protectionStrategies: [
      "Notification batching: check email/Slack at set times, not constantly",
      "Buffer time between meetings (even 5-10 minutes)",
      "One 'meeting-free' block per day for deep work",
      "Physical transitions: change location, take a walk, do something to signal 'shift'",
      "End-of-day shutdown ritual: close tabs, write tomorrow"s list, leave\",
      \"Tech boundaries: work apps off personal phone, or at least notifications off after hours\",
      \"Morning routine before opening email - protect the first hour\",
      \"Nervous system resets during the day: box breathing, cold water, movement\",
    ],
    
    boundaryScripts: [
      \"I batch my email responses. I'll reply within 24 hours unless it"s urgent.",
      "I don't have Slack notifications on. If something"s urgent, text me.\",
      \"I'm in deep work mode for the next 2 hours. I"ll check messages after.",
      "I need a 10-minute buffer between these meetings.",
      "I don"t check email after 7pm. If it's a true emergency, call me.\",
      \"Let me take a breath before we dive in. [pause, breathe] Okay, go ahead.\",
    ],
  },
  
  {
    gauge: "Emotion',
    emoji: '💜',
    color: '#A78BFA",
    howWorkAffectsIt: `\"Be professional\" usually means \"suppress your emotions.\" Don't show frustration. Don"t let them see you"re upset. Stay calm even when the situation is genuinely upsetting.

This constant suppression has costs. Research shows suppressing emotions increases physiological stress, impairs memory, and damages relationships. The emotions don't go away - they go underground. They leak out as irritability, cynicism, passive-aggression, or complete numbness.

Work often requires emotional labor too - faking positivity, managing others" feelings, staying upbeat for customers or clients even when you"re struggling. This is exhausting in ways that don't get recognized.

Your Emotion gauge at work is in a constant bind: you have feelings, but you"re not "supposed to" have them.`,
    
    commonWorkDrains: [
      "Suppressing frustration in meetings",
      "Faking enthusiasm for projects you don't believe in",
      "Emotional labor: managing customers', clients', or coworkers' emotions",
      "Not being able to express when something is unfair or hurtful",
      "Imposter syndrome - constant fear of being 'found out"\",
      \"Receiving criticism without being able to respond authentically\",
      \"Workplace conflict that can't be addressed directly\",
      \"Celebrating wins you don"t feel good about, or mourning losses you can't acknowledge",
    ],
    
    warningSignsAtWork: [
      "Feeling 'numb" at work - disconnected from caring about anything\",
      \"Cynicism that wasn't there when you started\",
      \"Irritability that bleeds into home life\",
      \"Imposter syndrome that never goes away no matter what you achieve\",
      \"Dreading interactions with specific people\",
      \"Passive-aggressive behavior (when you can"t be direct-aggressive)",
      "Sunday anxiety about the week ahead",
      "Crying in the car or bathroom",
    ],
    
    protectionStrategies: [
      "Name your emotions (privately) even when you can't express them: "I'm frustrated and that"s valid'",
      "Find one safe person at work you can be honest with",
      "Process work emotions outside of work: journal, therapy, trusted friend",
      "Validate yourself: "This situation is genuinely hard, I'm not overreacting"",
      "Take mental health moments: bathroom break to breathe, walk around the block",
      "Don"t take your suppressed work emotions out on family - find another outlet first\",
      \"Recognize emotional labor as real work that deserves compensation (and limits)\",
      \"If imposter syndrome is chronic, it might be the environment, not you\",
    ],
    
    boundaryScripts: [
      \"I need a moment to process this before responding.\",
      \"I have some concerns about this approach. Can we discuss?\",
      \"That comment landed hard for me. Can we talk about it?\",
      \"I'm having a hard day. I"m going to take a short break.",
      "I need to think about this. I'll follow up by [time].",
      "I hear you. I also need you to hear [my perspective].",
    ],
  },
  
  {
    gauge: 'Connection',
    emoji: '🤝',
    color: '#4ADE80",
    howWorkAffectsIt: `Work can be profoundly lonely, even when surrounded by people. Surface-level interactions. Competitive dynamics. Political maneuvering. Relationships that exist only because of proximity, not genuine connection.

Remote work amplified this. Many people went from some human contact to nearly none. Video calls aren't the same as presence. Slack isn"t the same as conversation. Working alone in your home, day after day, starves your Connection gauge even if you're "talking to people" all day.

Even in offices, real connection is rare. Most workplace relationships stay carefully superficial. You can spend 40 hours a week with someone and not know anything real about their life.

Humans need connection. Work often provides the illusion of it without the substance.`,
    
    commonWorkDrains: [
      "Remote work isolation - days without real human contact",
      "Surface-level interactions that never go deeper",
      "Competitive environments where colleagues are rivals",
      "Office politics that make trust dangerous",
      "No time for relationship-building (too busy with 'work")\",
      \"High turnover - just when you connect, people leave\",
      \"Hierarchical distance - can't really connect with bosses or reports\",
      \"Global teams across time zones - asynchronous isolation\",
    ],
    
    warningSignsAtWork: [
      \"Feeling lonely despite being on calls all day\",
      \"No one at work you"d call if you had a personal crisis",
      "Dreading 'team bonding' events because they feel fake",
      "Not knowing basic things about coworkers' lives",
      "Feeling invisible - like you could disappear and no one would notice",
      "Avoiding video calls, keeping camera off, minimizing interaction",
      "Using work as an excuse to avoid real relationships outside work",
      "Feeling like a 'work robot" - performing functions, not being a person\",
    ],
    
    protectionStrategies: [
      \"One real conversation per day - not about work, about life\",
      \"Camera on when possible (even when tired) - being seen matters\",
      \"In-person time if available, even occasionally, is worth the effort\",
      \"Find your person at work: one genuine ally makes everything better\",
      \"Don't let work be your only source of connection - protect relationships outside\",
      \"Create rituals: virtual coffee, walking 1:1s, weekly check-ins that aren"t status updates",
      "Share something real (appropriately): 'I had a hard weekend' goes further than 'fine, you?'",
      "If remote, engineer human contact: coffee shop, co-working space, lunch with friends",
    ],
    
    boundaryScripts: [
      "Before we dive in, how are you really doing?",
      "I"d love to grab coffee sometime - not about work, just to connect.\",
      \"I've been feeling isolated working from home. Anyone else?\",
      \"Can we do this as a walking meeting? I need to see humans today.\",
      \"I"m going to keep my camera on today - helps me feel more connected.",
      "I'm taking lunch at a coffee shop to be around people. Want to join virtually?",
    ],
  },
  
  {
    gauge: 'Direction',
    emoji: '🧭',
    color: '#38BDF8",
    howWorkAffectsIt: `Work can provide direction - or steal it. Meaningful work aligned with your values fills the Direction gauge. But much of modern work feels meaningless: tasks that don't connect to outcomes, projects that get canceled, bureaucracy that serves no one.

The most insidious Direction drain is golden handcuffs. You make good money doing something that doesn"t matter to you. You"re too comfortable to leave, too unfulfilled to stay. Years pass. The Direction gauge slowly empties while the bank account fills.

\"Sunday Scaries\" are often a Direction signal. It's not just anxiety about the week - it"s your psychology asking: "Is this really how I"m spending my life?\"

Direction doesn't mean you have to love every task. But you need to see how your work connects to something that matters - even if it"s just providing for your family, learning skills, or building toward something else.`,
    
    commonWorkDrains: [
      "Meaningless tasks: busywork, pointless meetings, reports no one reads",
      "No connection between effort and impact",
      "Work that conflicts with your values",
      "Golden handcuffs: good money, empty soul",
      "Career plateau: nowhere to grow, nothing to learn",
      "Constant pivots: can"t see anything through\",
      \"Working toward goals you don't believe in\",
      \"The "is this it?' feeling that settles in around year 3-5",
    ],
    
    warningSignsAtWork: [
      "Sunday Scaries that start Saturday evening",
      "Counting down hours/days/months until something (vacation, retirement, escape)",
      "Fantasizing about completely different careers",
      "Going through motions without caring about outcomes",
      "Unable to answer 'why does this matter?"\",
      \"Jealousy of people who seem to have found meaningful work\",
      \"Avoiding thinking about where your career is going\",
      \"Staying only for the money, benefits, or fear of change\",
    ],
    
    protectionStrategies: [
      \"Find the meaning in the current role, even if imperfect: who benefits? what are you learning? what does it enable?\",
      \"Create direction outside work if work can't provide it: side projects, community, family\",
      \"Set a timeline: "I'll do this for X years to achieve Y, then reassess"\",
      \"Identify the Direction gap: is it the company, the role, the industry, or all work?\",
      \"Small experiments: explore interests without quitting your job\",
      \"Talk to people in roles/fields you're curious about\",
      \"Be honest about golden handcuffs: what"s the real cost of comfort?",
      "Remember: Direction can be 'providing for my family" - that IS meaning\",
    ],
    
    boundaryScripts: [
      \"Help me understand how this project connects to our larger goals.\",
      \"I'm interested in taking on more responsibility in [area]. Can we discuss?\",
      \"I need to understand the purpose behind this before I can give it my best.\",
      \"I"m feeling stuck in my growth. What would it take to move forward?",
      "I want to have an honest conversation about my career path here.",
      "I've decided to pursue [X]. I want to make a thoughtful transition.",
    ],
  },
  
  {
    gauge: 'Alignment',
    emoji: '⚖️',
    color: '#F472B6",
    howWorkAffectsIt: `Work often requires us to be someone we're not. Play politics. Suppress opinions. Promote products we don"t believe in. Stay silent about problems. Pretend to agree with decisions we oppose.

This is misalignment, and it has a cost. Every time you act against your values, your Alignment gauge drops. The stress you can"t explain? The exhaustion beyond the hours worked? Often that's alignment friction - the psychological cost of being out of integrity.

The worst part is how normalized this is. \"That"s just work." "Everyone does it." "You have to play the game." Maybe. But the game has a price, and your nervous system is the one paying it.

Alignment at work isn"t about being naive or self-righteous. It's about knowing where your lines are - and what you"re trading when you cross them.`,
    
    commonWorkDrains: [
      "Promoting products/services you don't believe in",
      "Staying silent about problems to avoid conflict",
      "Playing politics: saying what people want to hear",
      "Pretending to agree with decisions you oppose",
      "Tolerating behavior that violates your values",
      "Being a 'different person' at work than at home",
      "Participating in systems you think are harmful",
      "Hiding parts of yourself to fit in or advance",
    ],
    
    warningSignsAtWork: [
      "Feeling like a fraud or actor at work",
      "Compartmentalizing: 'work me' vs 'real me"\",
      \"Guilt about what your company does or how it operates\",
      \"Defending decisions you don't agree with\",
      \"Values conflicts you"ve stopped trying to resolve",
      "Burnout that doesn"t improve with rest (misalignment fatigue)\",
      \"Shame about your job when talking to people outside work\",
      \"The feeling that you've "sold out"\",
    ],
    
    protectionStrategies: [
      \"Know your non-negotiables: what lines won't you cross, regardless of consequences?\",
      \"Name the trade-offs honestly: "I'm choosing X (money, security) over Y (alignment). For now."\",
      \"Find where you CAN be aligned: even in imperfect jobs, there are usually areas of integrity\",
      \"Small acts of authenticity: don't pretend to agree, say "I see it differently"\",
      \"Build exit options: savings, skills, network - so you're not trapped\",
      \"Examine if "everyone does it" is actually true, or just an excuse\",
      \"Consider: is the misalignment temporary/strategic or is this who you're becoming?\",
      \"If you can"t change the environment, make a plan to leave it",
    ],
    
    boundaryScripts: [
      "I don"t feel comfortable with this approach. Here's my concern...\",
      \"I need to be honest: I have reservations about [X].\",
      \"I can do this task, but I want to flag that it conflicts with [value].\",
      \"I"m not willing to [specific thing]. What are our alternatives?",
      "I"ve realized this role isn't aligned with where I want to go. Let"s discuss transition.",
      "I'd rather give you an honest answer than one that sounds good.",
    ],
  },
];

export const WORK_TOOLS: WorkTool[] = [
  {
    id: 'work-checkin',
    emoji: '📊',
    title: 'Work Gauge Check-In',
    description: 'How is work affecting your gauges today?',
    whenToUse: 'End of workday, or when you notice work stress bleeding into life',
    howItWorks: 'Compare how you felt before work vs after. Identify which gauges are most depleted. Look for patterns over time.',
    timeNeeded: '3 minutes',
  },
  {
    id: 'sunday-scaries',
    emoji: '😰',
    title: 'Sunday Scaries Decoder',
    description: 'What\'s really driving the dread?',
    whenToUse: 'When you feel anxiety about the upcoming work week',
    howItWorks: 'Break down the dread into specific gauge concerns. Is it Body (exhaustion)? State (anxiety about people/situations)? Emotion (dreading suppression)? Connection (isolation)? Direction (meaninglessness)? Alignment (values conflict)? Different sources need different solutions.',
    timeNeeded: '5 minutes',
  },
  {
    id: 'meeting-recovery',
    emoji: '🔄',
    title: 'Meeting Recovery Reset',
    description: 'Quick nervous system reset between meetings',
    whenToUse: 'After difficult meetings, before important ones, when feeling activated',
    howItWorks: 'Box breathing (4-4-4-4) for 1 minute. Stand and stretch. Look away from screen. Name how you\'re feeling. Then decide if you\'re ready for the next thing or need more time.',
    timeNeeded: '2 minutes',
  },
  {
    id: 'boundary-builder',
    emoji: '🛡️',
    title: 'Work Boundary Builder',
    description: 'Scripts and strategies for protecting yourself',
    whenToUse: 'When you need to set a limit but don\'t know how to say it',
    howItWorks: 'Identify what boundary you need. Review scripts for similar situations. Customize for your context. Practice saying it out loud before the real conversation.',
    timeNeeded: '5-10 minutes',
  },
  {
    id: 'toxic-check',
    emoji: '☢️',
    title: 'Is It Toxic or Is It Me?',
    description: 'Distinguish between a toxic environment and personal dysregulation',
    whenToUse: 'When you\'re struggling at work and aren\'t sure if the problem is you or the environment',
    howItWorks: 'Separate assessment: How are your gauges outside of work? Have others had similar experiences at this job? Were you functional at previous jobs? Sometimes it\'s you, sometimes it\'s them, often it\'s both.',
    timeNeeded: '10 minutes',
  },
  {
    id: 'career-alignment',
    emoji: '🎯',
    title: 'Career Alignment Check',
    description: 'Does your work match your values?',
    whenToUse: 'Quarterly review, or when feeling "is this it?" regularly',
    howItWorks: 'List your core values. Rate how well your current role expresses each. Identify the biggest gaps. Decide: can you close the gaps here, or is it time to explore options?',
    timeNeeded: '15-20 minutes',
  },
  {
    id: 'work-comm-lab',
    emoji: '💬',
    title: 'Work Communication Lab',
    description: 'Practice difficult workplace conversations',
    whenToUse: 'Before a tough conversation with boss, coworker, or report',
    howItWorks: 'Role-play the conversation with Gauge. Try different approaches. Get feedback on how it lands. Prepare for likely responses. Build confidence before the real thing.',
    timeNeeded: '10-15 minutes',
  },
  {
    id: 'burnout-radar',
    emoji: '📡',
    title: 'Burnout Early Warning',
    description: 'Recognize the signs before you crash',
    whenToUse: 'Weekly check-in, or when multiple gauges have been low for 2+ weeks',
    howItWorks: 'Review the 12 stages of burnout. Identify where you are. The earlier you catch it, the easier the recovery. If you\'re past stage 6, you may need more than self-care.',
    timeNeeded: '5 minutes',
  },
  {
    id: 'shutdown-ritual',
    emoji: '🌅',
    title: 'Workday Shutdown Ritual',
    description: 'Transition from work mode to life mode',
    whenToUse: 'End of every workday',
    howItWorks: 'Close all work tabs. Write tomorrow\'s top 3 priorities. Say out loud: "The workday is complete." Change location, clothes, or activity. Do not check email until tomorrow.',
    timeNeeded: '5 minutes',
  },
  {
    id: 'exit-planning',
    emoji: '🚪',
    title: 'Exit Strategy Planner',
    description: 'When and how to leave thoughtfully',
    whenToUse: 'When you\'ve decided (or are considering) that it\'s time to go',
    howItWorks: 'Financial runway assessment. Network activation. Skills gap analysis. Timeline creation. Emotional preparation for the transition. How to leave well (for you and for them).',
    timeNeeded: '30 minutes - 1 hour",
  },
];

export const BURNOUT_STAGES = {
  title: \"The 12 Stages of Burnout\",
  source: \"Freudenberger & North\",
  stages: [
    { stage: 1, name: \"Compulsion to Prove Yourself\", description: \"Excessive ambition, need to prove worth. Everything becomes urgent.\" },
    { stage: 2, name: \"Working Harder\", description: \"Taking on more, can't delegate, feeling indispensable. "Only I can do this right.'" },
    { stage: 3, name: "Neglecting Needs", description: "Sleep, food, exercise, relationships - all sacrificed for work." },
    { stage: 4, name: "Displacement of Conflict", description: "You know something"s wrong but blame external factors. Dismiss early warning signs.\" },
    { stage: 5, name: \"Revision of Values\", description: \"Work becomes the only frame of reference. Friends, hobbies, self-care seem irrelevant.\" },
    { stage: 6, name: \"Denial of Problems\", description: \"Intolerance, cynicism, aggression. Others are the problem. You're "fine."\" },
    { stage: 7, name: \"Withdrawal\", description: \"Social isolation. Avoiding contact. Using alcohol, drugs, or other escapes.\" },
    { stage: 8, name: \"Behavioral Changes\", description: \"Obvious changes visible to others. Fearful, shy, or apathetic. Not yourself.\" },
    { stage: 9, name: \"Depersonalization\", description: \"Feeling detached from yourself. Going through motions. Everything feels meaningless.\" },
    { stage: 10, name: \"Inner Emptiness\", description: \"Seeking ways to feel something - through overeating, sex, drugs, risk-taking.\" },
    { stage: 11, name: \"Depression\", description: \"Feeling hopeless, exhausted, lost. No way forward visible.\" },
    { stage: 12, name: \"Burnout Syndrome\", description: \"Complete mental and physical collapse. May require professional intervention.\" },
  ],
  recovery: {
    early: \"Stages 1-4: Self-care, boundaries, and work adjustments can help. Catch it here.\",
    middle: \"Stages 5-8: You need significant changes - possibly a break, definitely support. Don't go it alone.\",
    late: \"Stages 9-12: Professional help is necessary. This isn"t something you can push through. Recovery is possible but takes time.",
  }
};

export const WORK_WISDOM = [
  {
    title: "The Sustainable Pace Principle",
    content: "You cannot sprint a marathon. The people who have long, successful careers aren"t the ones who burned brightest early - they're the ones who learned to sustain. Protect your recovery like your job depends on it, because long-term, it does.\",
  },
  {
    title: \"The 40-Year Frame\",
    content: \"You"ll likely work for 40 years. Any single job is probably 2-5 years. Don"t sacrifice your health, relationships, or integrity for something temporary. The question isn't "can I push through?" - it's "at what cost, and is it worth it?"\",
  },
  {
    title: \"The Control Paradox\",
    content: \"Research shows workplace stress is less about workload and more about control. High demands + high control = challenging but manageable. High demands + low control = crushing. If you feel helpless, that's the thing to address.\",
  },
  {
    title: \"The Recovery Myth\",
    content: \"Weekend recovery doesn"t work for chronic stress. If you need the whole weekend to feel human, you"re in a deficit you can't mathematically escape. Something has to change during the week, not just on the edges.\",
  },
  {
    title: \"The "Passion' Trap",
    content: "'Find your passion" is privileged advice. Most people need to find work that doesn't destroy them, supports their life, and has moments of meaning. That"s enough. Don"t let the passion myth make you feel like a failure for having a normal job.\",
  },
  {
    title: \"The Exit Option\",
    content: \"The best time to look for a job is when you have a job. Building exit options - savings, skills, network - isn't disloyal. It"s protection. Feeling trapped makes everything worse. Having choices makes everything more bearable.",
  },
];
