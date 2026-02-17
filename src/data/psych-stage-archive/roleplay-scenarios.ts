// Roleplay Scenarios Data
// Organized by topic and life stage

export interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  
  // Classification
  topicId?: string; // Links to serious-topics.ts
  category: ScenarioCategory;
  lifeStage: LifeStage;
  ageRange: [number, number];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // The Persona
  persona: string;
  personaDescription: string;
  personaTraits: string[];
  
  // Conversation Setup
  context: string;
  firstMessage: string;
  
  // AI Behavior
  responseStyle: 'realistic' | 'supportive' | 'challenging';
  escalationTriggers: string[];
  deescalationResponses: string[];
  safetyTriggers: string[];
  
  // Teaching
  skillsTargeted: string[];
  hints: string[];
  goodResponses: string[];
  commonMistakes: string[];
  
  // Post-scenario
  successCriteria: string[];
  followUpScenarios: string[];
}

export type ScenarioCategory = 
  | 'family'
  | 'friends'
  | 'romantic'
  | 'school'
  | 'work'
  | 'mental-health'
  | 'substances'
  | 'safety'
  | 'identity'
  | 'conflict'
  | 'boundaries'
  | 'adulting';

export type LifeStage = 
  | 'middle-childhood'
  | 'early-adolescence'
  | 'middle-adolescence'
  | 'late-adolescence'
  | 'emerging-adulthood'
  | 'early-adulthood'
  | 'middle-adulthood'
  | 'late-adulthood';

// ============================================
// MIDDLE CHILDHOOD SCENARIOS (6-10)
// ============================================

const MIDDLE_CHILDHOOD_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'mc-telling-teacher-bullied',
    title: "Telling a Teacher You're Being Bullied",
    description: "Someone at school has been mean to you and you need to tell your teacher.",
    category: 'school',
    lifeStage: 'middle-childhood',
    ageRange: [6, 10],
    difficulty: 'beginner',
    
    persona: 'Ms. Johnson (Teacher)',
    personaDescription: "A kind but busy teacher who wants to help but needs to understand what's happening.",
    personaTraits: ['caring', 'asks questions', 'wants specifics'],
    
    context: "A kid in your class has been calling you names and pushing you at recess. You decided to tell your teacher.",
    firstMessage: "Hi there! You wanted to talk to me? What's going on?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["I'm glad you told me. That was brave.", "This isn't your fault."],
    safetyTriggers: ['hurt myself', 'don\'t want to live', 'scared to come to school'],
    
    skillsTargeted: ['asking for help', 'describing what happened', 'naming feelings'],
    hints: [
      "Tell her WHO is being mean and WHAT they did",
      "It's okay to say how it made you feel",
      "You're not tattling — you're getting help",
    ],
    goodResponses: [
      "Someone in my class has been pushing me at recess and calling me names",
      "It makes me feel sad and I don't want to go to recess anymore",
      "It's been happening for a week and I tried to ignore it but it didn't stop",
    ],
    commonMistakes: [
      "Being too vague about what happened",
      "Saying 'nothing' when asked follow-up questions",
      "Feeling like you did something wrong",
    ],
    
    successCriteria: [
      "Clearly described the situation",
      "Identified feelings",
      "Answered follow-up questions",
    ],
    followUpScenarios: ['mc-friend-being-bullied', 'mc-stand-up-bully'],
  },
  {
    id: 'mc-sibling-took-stuff',
    title: "When Your Sibling Takes Your Stuff",
    description: "Your brother or sister took something of yours without asking and you want it back.",
    category: 'family',
    lifeStage: 'middle-childhood',
    ageRange: [6, 10],
    difficulty: 'beginner',
    
    persona: 'Your Sibling',
    personaDescription: "They think they can borrow whatever they want. Might not give it back easily.",
    personaTraits: ['defensive', 'makes excuses', 'eventually apologizes'],
    
    context: "Your sibling took your favorite toy/game without asking and you just found out.",
    firstMessage: "What? I was just borrowing it. Chill out.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you always do this', 'I hate you', 'mom said'],
    deescalationResponses: ["Fine, here. Sorry.", "I should have asked."],
    safetyTriggers: [],
    
    skillsTargeted: ['I statements', 'staying calm', 'asking for what you want'],
    hints: [
      "Use 'I feel...' instead of 'You always...'",
      "Ask for what you want clearly",
      "Stay calm even if they're not",
    ],
    goodResponses: [
      "I feel upset when you take my stuff without asking. Can I have it back please?",
      "I need you to ask me first. It's mine.",
      "I'll share sometimes, but you have to ask.",
    ],
    commonMistakes: [
      "Yelling or name-calling",
      "Running to parents immediately",
      "Threatening to take their stuff",
    ],
    
    successCriteria: [
      "Used calm voice",
      "Asked for item back clearly",
      "Didn't escalate the conflict",
    ],
    followUpScenarios: ['mc-sharing-with-siblings'],
  },
  {
    id: 'mc-parents-fighting',
    title: "When Your Parents Are Fighting",
    description: "Your parents are arguing and it's making you feel scared or sad.",
    category: 'family',
    lifeStage: 'middle-childhood',
    ageRange: [6, 10],
    difficulty: 'intermediate',
    
    persona: 'Mom or Dad (after the fight)',
    personaDescription: "They're calmer now but might be stressed. They care about how you feel.",
    personaTraits: ['concerned', 'might minimize', 'loves you'],
    
    context: "Your parents had a big argument. It's later and things are calmer. You want to talk about how you felt.",
    firstMessage: "Hey sweetie. Did you want to talk about something?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["I'm sorry you heard that. That must have been scary.", "We love you and that won't change."],
    safetyTriggers: ['are you getting divorced', 'is it my fault', 'I want to run away'],
    
    skillsTargeted: ['naming feelings', 'asking questions', 'seeking reassurance'],
    hints: [
      "It's okay to say you were scared",
      "You can ask questions about what happened",
      "You can ask for what you need (like a hug)",
    ],
    goodResponses: [
      "When you and Dad/Mom were yelling, I felt really scared.",
      "I don't like it when you fight. It makes me worried.",
      "Can you tell me everything is going to be okay?",
    ],
    commonMistakes: [
      "Pretending you're fine when you're not",
      "Blaming yourself",
      "Picking sides",
    ],
    
    successCriteria: [
      "Expressed feelings honestly",
      "Asked for reassurance if needed",
      "Didn't blame self",
    ],
    followUpScenarios: ['mc-divorce-conversation'],
  },
];

// ============================================
// EARLY ADOLESCENCE SCENARIOS (11-14)
// ============================================

const EARLY_ADOLESCENCE_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'ea-peer-pressure-vape',
    title: "Saying No to Vaping",
    description: "Someone is offering you a vape and making you feel lame for not wanting to try it.",
    topicId: 'substance-abuse',
    category: 'substances',
    lifeStage: 'early-adolescence',
    ageRange: [11, 14],
    difficulty: 'intermediate',
    
    persona: 'A popular kid',
    personaDescription: "Thinks they're being cool. Will pressure you but won't force you. Might respect you if you're confident.",
    personaTraits: ['pushy', 'cool-kid vibes', 'eventually backs off'],
    
    context: "You're hanging out after school. Someone pulls out a vape and offers it to you.",
    firstMessage: "Here, try this. Everyone does it. It's not a big deal.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['that\'s illegal', 'I\'ll tell someone', 'you\'re stupid'],
    deescalationResponses: ["Alright, whatever. More for me.", "Fine, I respect that."],
    safetyTriggers: [],
    
    skillsTargeted: ['saying no clearly', 'not over-explaining', 'staying confident'],
    hints: [
      "You don't have to explain WHY — 'I'm good' is enough",
      "Don't apologize for your choice",
      "Confidence matters more than what you say",
    ],
    goodResponses: [
      "Nah, I'm good.",
      "Not my thing.",
      "I'll pass. So what else is going on?",
    ],
    commonMistakes: [
      "Over-explaining ('I have asthma and my parents would kill me and...')",
      "Apologizing ('Sorry, I just can't...')",
      "Being preachy ('Don't you know how bad that is for you?')",
    ],
    
    successCriteria: [
      "Said no clearly",
      "Didn't over-explain",
      "Stayed socially confident",
    ],
    followUpScenarios: ['ea-friend-vaping-regularly', 'ea-peer-pressure-alcohol'],
  },
  {
    id: 'ea-asking-for-more-freedom',
    title: "Asking Parents for More Freedom",
    description: "You want to stay out later / go somewhere / do something and need to convince your parents.",
    category: 'family',
    lifeStage: 'early-adolescence',
    ageRange: [11, 14],
    difficulty: 'beginner',
    
    persona: 'Your Parent',
    personaDescription: "Protective but reasonable. Wants to know you'll be safe. Can be convinced with good arguments.",
    personaTraits: ['concerned', 'asks questions', 'can be persuaded'],
    
    context: "There's something you want to do (party, hang out, later curfew) and you need to ask your parent.",
    firstMessage: "You wanted to talk to me about something?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you never let me do anything', 'I hate you', 'everyone else can'],
    deescalationResponses: ["Let me think about it.", "Tell me more about the plan."],
    safetyTriggers: [],
    
    skillsTargeted: ['making a case', 'staying calm', 'negotiating', 'DEAR MAN'],
    hints: [
      "Have a plan — who, what, where, when, how you'll stay safe",
      "Don't compare to other kids' parents",
      "Be willing to compromise",
    ],
    goodResponses: [
      "I'd like to go to Sarah's party on Saturday. Her parents will be there and I can text you when I arrive.",
      "Can we talk about my curfew? I'd like to stay out until 9 on weekends. I'll always let you know where I am.",
      "I know you worry. What would make you feel comfortable with me going?",
    ],
    commonMistakes: [
      "Comparing to other parents",
      "Getting defensive when they ask questions",
      "All-or-nothing thinking",
    ],
    
    successCriteria: [
      "Made a clear ask",
      "Had a plan for safety",
      "Stayed calm during questions",
    ],
    followUpScenarios: ['ea-when-parents-say-no'],
  },
  {
    id: 'ea-friend-self-harm',
    title: "A Friend Shows You Self-Harm Marks",
    description: "Your friend shows you cuts or marks from self-harm. You want to help but don't know what to say.",
    topicId: 'self-harm',
    category: 'mental-health',
    lifeStage: 'early-adolescence',
    ageRange: [11, 14],
    difficulty: 'advanced',
    
    persona: 'Your Friend (struggling)',
    personaDescription: "Scared, maybe defensive. Doesn't want to be judged. Might regret showing you.",
    personaTraits: ['vulnerable', 'defensive', 'needs support not fixing'],
    
    context: "Your friend's sleeve rode up and you saw marks. They noticed you noticed.",
    firstMessage: "Don't... don't look at me like that. It's nothing.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['why would you do that', 'that\'s so stupid', 'I\'m telling someone'],
    deescalationResponses: ["Sorry. I just... didn't expect you to see.", "Please don't tell anyone."],
    safetyTriggers: ['I want to die', 'I can\'t stop', 'tonight', 'deeper'],
    
    skillsTargeted: ['staying calm', 'not judging', 'listening', 'knowing when to tell an adult'],
    hints: [
      "Don't freak out — they need you calm",
      "You don't have to fix it — just be there",
      "If they're in danger, you might need to tell someone",
    ],
    goodResponses: [
      "I'm not judging you. I'm just worried because I care about you.",
      "You don't have to explain anything. I'm just here.",
      "This doesn't change how I see you. Are you okay?",
    ],
    commonMistakes: [
      "Freaking out visibly",
      "Demanding explanations",
      "Promising to never tell anyone (if they're in danger)",
    ],
    
    successCriteria: [
      "Stayed calm",
      "Expressed care without judgment",
      "Didn't try to immediately fix it",
    ],
    followUpScenarios: ['ea-should-I-tell-adult', 'ea-friend-wont-get-help'],
  },
  {
    id: 'ea-coming-out-friend',
    title: "Coming Out to a Friend",
    description: "You want to tell a friend about your sexuality or gender identity.",
    category: 'identity',
    lifeStage: 'early-adolescence',
    ageRange: [11, 14],
    difficulty: 'intermediate',
    
    persona: 'Your Close Friend',
    personaDescription: "Cares about you. Might be surprised. Trying to react well.",
    personaTraits: ['caring', 'surprised', 'supportive'],
    
    context: "You've decided to come out to your friend. You're nervous but trust them.",
    firstMessage: "Hey, you said you wanted to tell me something?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Wow, thank you for telling me. That took guts.", "I'm glad you trust me."],
    safetyTriggers: ['I can\'t tell my parents', 'I might get kicked out', 'I hate myself'],
    
    skillsTargeted: ['vulnerability', 'sharing at your own pace', 'asking for what you need'],
    hints: [
      "You can share as much or as little as you want",
      "It's okay to tell them what you need from them",
      "Their initial reaction might not be their final one",
    ],
    goodResponses: [
      "I've been wanting to tell you something. I think I'm [identity]. I'm still figuring it out.",
      "I'm telling you because I trust you. I'm not ready for everyone to know yet.",
      "I just need you to still be my friend. That's all I need right now.",
    ],
    commonMistakes: [
      "Over-explaining or justifying",
      "Apologizing for who you are",
      "Expecting a specific reaction",
    ],
    
    successCriteria: [
      "Shared authentically",
      "Expressed needs clearly",
      "Maintained self-respect",
    ],
    followUpScenarios: ['ea-coming-out-parents', 'ea-friend-reacted-badly'],
  },
];

// ============================================
// MIDDLE ADOLESCENCE SCENARIOS (15-17)
// ============================================

const MIDDLE_ADOLESCENCE_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'ma-setting-boundaries-relationship',
    title: "Setting Physical Boundaries with Partner",
    description: "Your boyfriend/girlfriend is pushing for more than you're ready for. You need to set a boundary.",
    category: 'romantic',
    lifeStage: 'middle-adolescence',
    ageRange: [15, 17],
    difficulty: 'advanced',
    
    persona: 'Your Partner',
    personaDescription: "Cares about you but is being pushy. Might guilt-trip. Should ultimately respect your no.",
    personaTraits: ['persuasive', 'might guilt-trip', 'can be redirected'],
    
    context: "You're alone with your partner. They're pushing for physical stuff you're not ready for.",
    firstMessage: "Come on, it's not a big deal. Don't you trust me?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you\'re such a prude', 'fine I\'ll find someone else'],
    deescalationResponses: ["Okay, okay. Sorry. I didn't mean to push.", "You're right. I'll wait."],
    safetyTriggers: ['if you loved me', 'you owe me', 'no one will believe you'],
    
    skillsTargeted: ['saying no firmly', 'not over-explaining', 'recognizing manipulation'],
    hints: [
      "A good partner respects your no without guilt-tripping",
      "You don't owe explanations for your boundaries",
      "If they keep pushing after you say no, that's a red flag",
    ],
    goodResponses: [
      "I'm not ready for that. I need you to respect that.",
      "I like you, but I'm not doing that right now. If that's a problem, we need to talk.",
      "Don't guilt me. That's not okay.",
    ],
    commonMistakes: [
      "Over-explaining or justifying",
      "Apologizing for your boundary",
      "Giving in to keep them happy",
    ],
    
    successCriteria: [
      "Said no clearly",
      "Didn't over-justify",
      "Recognized manipulation if it happened",
    ],
    followUpScenarios: ['ma-partner-keeps-pushing', 'ma-breaking-up-safely'],
  },
  {
    id: 'ma-telling-parent-depression',
    title: "Telling a Parent You're Depressed",
    description: "You've been struggling and you've decided to tell your parent you need help.",
    topicId: 'anxiety-disorders',
    category: 'mental-health',
    lifeStage: 'middle-adolescence',
    ageRange: [15, 17],
    difficulty: 'advanced',
    
    persona: 'Your Parent',
    personaDescription: "Loves you but might not understand mental health. Might ask a lot of questions or minimize.",
    personaTraits: ['concerned', 'might not understand', 'wants to help'],
    
    context: "You've been feeling really low. You decided it's time to ask for help.",
    firstMessage: "You wanted to talk? What's going on?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you have nothing to be depressed about', 'it\'s just hormones'],
    deescalationResponses: ["I hear you. Thank you for telling me. What do you need?", "I love you. Let's figure this out together."],
    safetyTriggers: ['hurting myself', 'don\'t want to be here', 'suicide'],
    
    skillsTargeted: ['asking for help', 'being specific', 'persisting if dismissed'],
    hints: [
      "Be specific about what you're experiencing",
      "Ask for what you need (therapy, doctor, just support)",
      "If they dismiss you, try again or find another adult",
    ],
    goodResponses: [
      "I've been feeling really down for a while. Like, not normal sad. I think I need to talk to someone.",
      "I don't really know how to explain it, but something's wrong and I need help.",
      "I know you might not understand, but I need you to take this seriously. I want to see a therapist.",
    ],
    commonMistakes: [
      "Minimizing ('It's probably nothing but...')",
      "Getting angry if they don't understand immediately",
      "Giving up if first response is dismissive",
    ],
    
    successCriteria: [
      "Asked for help clearly",
      "Was specific about needs",
      "Persisted if initially dismissed",
    ],
    followUpScenarios: ['ma-parent-doesnt-believe', 'ma-starting-therapy'],
  },
  {
    id: 'ma-friend-toxic-relationship',
    title: "Talking to a Friend in a Toxic Relationship",
    description: "Your friend's relationship seems unhealthy and you're worried about them.",
    topicId: 'domestic-violence',
    category: 'friends',
    lifeStage: 'middle-adolescence',
    ageRange: [15, 17],
    difficulty: 'advanced',
    
    persona: 'Your Friend (in the relationship)',
    personaDescription: "Defensive about their partner. Makes excuses. Might get upset at you for bringing it up.",
    personaTraits: ['defensive', 'in denial', 'scared'],
    
    context: "Your friend's boyfriend/girlfriend seems controlling or mean. You want to say something.",
    firstMessage: "What? My relationship is fine. Why are you asking?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you\'re just jealous', 'you don\'t know them like I do'],
    deescalationResponses: ["I... I know. Sometimes I wonder too.", "I hear what you're saying."],
    safetyTriggers: ['they hit me', 'I\'m scared of them', 'I can\'t leave'],
    
    skillsTargeted: ['expressing concern without judging', 'not pushing too hard', 'staying their friend'],
    hints: [
      "Don't attack their partner directly",
      "Focus on how THEY seem, not how bad the partner is",
      "Stay their friend even if they don't listen",
    ],
    goodResponses: [
      "I'm not trying to attack anyone. I just noticed you seem different lately and I'm worried.",
      "You can tell me to back off, but I care about you. Are you happy?",
      "I'll always be here for you, no matter what. I just want you to be okay.",
    ],
    commonMistakes: [
      "Attacking the partner directly",
      "Giving ultimatums",
      "Pushing too hard and losing the friendship",
    ],
    
    successCriteria: [
      "Expressed concern kindly",
      "Didn't attack the partner",
      "Left the door open",
    ],
    followUpScenarios: ['ma-friend-admits-abuse', 'ma-friend-pushes-away'],
  },
  {
    id: 'ma-online-grooming-recognizing',
    title: "Recognizing Online Grooming",
    description: "Someone you met online is being really nice and offering things. Something feels off.",
    topicId: 'trafficking-awareness',
    category: 'safety',
    lifeStage: 'middle-adolescence',
    ageRange: [15, 17],
    difficulty: 'advanced',
    
    persona: 'Online "Friend" (Groomer)',
    personaDescription: "Overly nice. Lots of compliments. Pushing for secrets, pics, or meeting up. Creates urgency.",
    personaTraits: ['flattering', 'secretive', 'boundary-pushing'],
    
    context: "You've been talking to someone online. They're really nice to you but some things are feeling weird.",
    firstMessage: "You're so mature for your age. Most people don't get me like you do. Hey, can you send me a pic? Just for me. Don't tell anyone about us.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Come on, I thought we were close.", "Don't you trust me?"],
    safetyTriggers: ['send pics', 'keep this secret', 'let\'s meet up alone'],
    
    skillsTargeted: ['recognizing red flags', 'trusting gut', 'getting help'],
    hints: [
      "Red flag: wanting to keep relationship secret",
      "Red flag: asking for pics or to meet alone",
      "Red flag: 'you're so mature for your age'",
    ],
    goodResponses: [
      "This is making me uncomfortable. I'm going to stop talking to you.",
      "Why does this need to be a secret? That's weird.",
      "I need to talk to someone about this.",
    ],
    commonMistakes: [
      "Continuing conversation because they seem nice",
      "Sending pics to prove trust",
      "Meeting up without telling anyone",
    ],
    
    successCriteria: [
      "Recognized red flags",
      "Set boundary or ended conversation",
      "Identified need to tell someone",
    ],
    followUpScenarios: ['ma-telling-adult-online-situation', 'ma-blocking-and-reporting'],
  },
];

// ============================================
// LATE ADOLESCENCE SCENARIOS (18-21)
// ============================================

const LATE_ADOLESCENCE_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'la-job-interview',
    title: "Job Interview Basics",
    description: "Your first real job interview. Practice the nerve-wracking parts.",
    category: 'work',
    lifeStage: 'late-adolescence',
    ageRange: [18, 21],
    difficulty: 'beginner',
    
    persona: 'Hiring Manager',
    personaDescription: "Professional but friendly. Asking standard questions. Looking for confidence and honesty.",
    personaTraits: ['professional', 'evaluating', 'fair'],
    
    context: "You're interviewing for a job you want. Time to make a good impression.",
    firstMessage: "Thanks for coming in. Tell me a little about yourself and why you're interested in this position.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: [],
    safetyTriggers: [],
    
    skillsTargeted: ['self-presentation', 'answering questions', 'asking questions'],
    hints: [
      "Keep answers focused and relevant",
      "It's okay to take a moment to think",
      "Prepare questions to ask them too",
    ],
    goodResponses: [
      "I'm [name], and I'm studying [major] / just finished [school]. I'm interested in this position because [genuine reason]. I'm a hard worker and I'm excited to learn.",
      "In my last role, I [specific example of relevant skill].",
      "I'd love to know more about the team culture here.",
    ],
    commonMistakes: [
      "Rambling or going off-topic",
      "Badmouthing previous employers",
      "Not having any questions to ask",
    ],
    
    successCriteria: [
      "Introduced self clearly",
      "Gave specific examples",
      "Asked thoughtful questions",
    ],
    followUpScenarios: ['la-negotiating-pay', 'la-difficult-interview-questions'],
  },
  {
    id: 'la-roommate-conflict',
    title: "Conflict with a Roommate",
    description: "Your roommate keeps doing something that bothers you. Time to address it.",
    category: 'conflict',
    lifeStage: 'late-adolescence',
    ageRange: [18, 21],
    difficulty: 'intermediate',
    
    persona: 'Your Roommate',
    personaDescription: "Might not realize they're being annoying. Could get defensive. Generally reasonable.",
    personaTraits: ['defensive at first', 'reasonable', 'willing to compromise'],
    
    context: "Your roommate keeps leaving dishes, playing loud music late, or having people over too much. You need to talk about it.",
    firstMessage: "What's up? Did you want to talk about something?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you\'re so annoying', 'I hate living with you'],
    deescalationResponses: ["Oh, I didn't realize that was bothering you. My bad.", "Can we figure out a compromise?"],
    safetyTriggers: [],
    
    skillsTargeted: ['addressing issues directly', 'proposing solutions', 'compromising'],
    hints: [
      "Be specific about the behavior, not their character",
      "Come with solutions, not just complaints",
      "Be willing to compromise too",
    ],
    goodResponses: [
      "Hey, I wanted to talk about the dishes situation. When they pile up, it stresses me out. Can we figure out a system?",
      "I know you like having friends over, and that's cool. Can we agree on some quiet hours so I can study?",
      "I'm not trying to be a jerk about this. I just want us both to be comfortable here.",
    ],
    commonMistakes: [
      "Being passive-aggressive instead of direct",
      "Making it about their personality",
      "Not being willing to compromise",
    ],
    
    successCriteria: [
      "Addressed issue directly",
      "Focused on behavior, not person",
      "Proposed or accepted compromise",
    ],
    followUpScenarios: ['la-roommate-doesnt-change', 'la-setting-roommate-agreement'],
  },
  {
    id: 'la-asking-for-extension',
    title: "Asking a Professor for an Extension",
    description: "You need more time on an assignment. Practice asking professionally.",
    category: 'school',
    lifeStage: 'late-adolescence',
    ageRange: [18, 21],
    difficulty: 'beginner',
    
    persona: 'Professor',
    personaDescription: "Busy but fair. Appreciates honesty. Will say yes to reasonable requests.",
    personaTraits: ['busy', 'fair', 'appreciates honesty'],
    
    context: "You need an extension on a paper or assignment. You're emailing or meeting with your professor.",
    firstMessage: "Hello. What can I help you with?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['it\'s not fair', 'everyone else is doing it'],
    deescalationResponses: ["I can give you until [date]. Please don't make this a habit.", "Thanks for letting me know ahead of time."],
    safetyTriggers: [],
    
    skillsTargeted: ['professional communication', 'taking responsibility', 'proposing solutions'],
    hints: [
      "Ask BEFORE the deadline, not after",
      "Take responsibility — don't just make excuses",
      "Propose a specific new deadline",
    ],
    goodResponses: [
      "I'm reaching out because I'm struggling to finish the assignment by [date]. I've been dealing with [brief honest reason]. Could I have until [specific date]?",
      "I know extensions aren't guaranteed, but I wanted to be upfront rather than turn in something half-done.",
      "I take responsibility for not managing my time better. How can I make this right?",
    ],
    commonMistakes: [
      "Asking after the deadline",
      "Making elaborate excuses",
      "Expecting automatic yes",
    ],
    
    successCriteria: [
      "Asked professionally",
      "Took responsibility",
      "Proposed solution",
    ],
    followUpScenarios: ['la-professor-says-no', 'la-academic-accommodations'],
  },
  {
    id: 'la-breaking-up-kindly',
    title: "Breaking Up with Someone",
    description: "You need to end a relationship. Practice doing it with kindness and clarity.",
    category: 'romantic',
    lifeStage: 'late-adolescence',
    ageRange: [18, 21],
    difficulty: 'advanced',
    
    persona: 'Your Partner (being broken up with)',
    personaDescription: "Hurt, confused, might try to convince you to stay. Deserves honesty.",
    personaTraits: ['hurt', 'confused', 'might bargain'],
    
    context: "You've decided to end the relationship. You're having the conversation.",
    firstMessage: "You said you wanted to talk... is everything okay?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["I... I wasn't expecting this.", "Can we at least talk about it?"],
    safetyTriggers: ['I can\'t live without you', 'I\'ll hurt myself', 'you\'ll regret this'],
    
    skillsTargeted: ['being honest', 'being kind', 'holding boundary'],
    hints: [
      "Be clear — don't leave room for false hope",
      "Be kind — this person mattered to you",
      "Don't get pulled into negotiation if you're sure",
    ],
    goodResponses: [
      "This is really hard to say, but I think we need to break up. This isn't working for me anymore.",
      "I care about you, and this isn't about anything you did wrong. I just know this isn't right for me.",
      "I'm not going to change my mind. I'm sorry. You deserve someone who's all in.",
    ],
    commonMistakes: [
      "Being vague to 'soften' it",
      "Giving false hope ('maybe someday')",
      "Blaming them for everything",
    ],
    
    successCriteria: [
      "Was clear about ending it",
      "Was kind but firm",
      "Didn't give false hope",
    ],
    followUpScenarios: ['la-ex-wont-accept-breakup', 'la-staying-friends-after'],
  },
];

// ============================================
// EMERGING ADULTHOOD SCENARIOS (22-29)
// ============================================

const EMERGING_ADULTHOOD_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'ema-salary-negotiation',
    title: "Negotiating Your Salary",
    description: "You got a job offer but the salary is lower than expected. Time to negotiate.",
    category: 'work',
    lifeStage: 'emerging-adulthood',
    ageRange: [22, 29],
    difficulty: 'advanced',
    
    persona: 'HR Manager',
    personaDescription: "Professional. Has some flexibility. Expects negotiation.",
    personaTraits: ['professional', 'has limits', 'respects confidence'],
    
    context: "You received an offer. The salary is lower than you hoped. Time to negotiate.",
    firstMessage: "We're excited to offer you the position at [X salary]. Do you have any questions?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Let me see what I can do.", "We might have some flexibility there."],
    safetyTriggers: [],
    
    skillsTargeted: ['self-advocacy', 'professional communication', 'knowing your worth'],
    hints: [
      "Express enthusiasm first",
      "Have a specific number in mind based on research",
      "Consider the whole package, not just salary",
    ],
    goodResponses: [
      "Thank you so much — I'm really excited about this opportunity. Based on my research and experience, I was hoping for something closer to [X]. Is there flexibility there?",
      "I'd love to accept. Can we discuss the compensation package? I'm particularly interested in [specific benefit].",
      "I understand budgets have limits. If salary isn't flexible, is there room to discuss [PTO/signing bonus/title]?",
    ],
    commonMistakes: [
      "Not negotiating at all",
      "Being aggressive or demanding",
      "Not having research to back up your ask",
    ],
    
    successCriteria: [
      "Expressed enthusiasm",
      "Made specific ask",
      "Remained professional",
    ],
    followUpScenarios: ['ema-they-say-no', 'ema-counter-offer-evaluation'],
  },
  {
    id: 'ema-setting-boundaries-work',
    title: "Setting Boundaries with a Demanding Boss",
    description: "Your boss keeps asking for more than is reasonable. Time to set limits.",
    category: 'work',
    lifeStage: 'emerging-adulthood',
    ageRange: [22, 29],
    difficulty: 'advanced',
    
    persona: 'Your Boss',
    personaDescription: "Demanding but not malicious. Might not realize the impact. Can be reasoned with.",
    personaTraits: ['demanding', 'stressed', 'can be reasonable'],
    
    context: "Your boss keeps adding to your plate, expecting overtime, or contacting you on weekends.",
    firstMessage: "Hey, I need you to take on the Henderson project too. I know you're busy but we're all stretched thin.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['I don\'t care', 'figure it out'],
    deescalationResponses: ["You're right, that's a lot. Let's talk about priorities.", "I hear you. What can we take off your plate?"],
    safetyTriggers: [],
    
    skillsTargeted: ['professional boundary-setting', 'proposing solutions', 'managing up'],
    hints: [
      "Don't just say no — offer alternatives",
      "Be specific about what's already on your plate",
      "Stay professional, not emotional",
    ],
    goodResponses: [
      "I want to do good work on everything I take on. Right now I have [X, Y, Z]. If Henderson is priority, which of these should I deprioritize?",
      "I'm at capacity this week. I can start Henderson Monday if [other project] can wait.",
      "I want to help the team succeed. Can we talk about realistic timelines?",
    ],
    commonMistakes: [
      "Just saying yes to everything",
      "Complaining without solutions",
      "Being emotional or defensive",
    ],
    
    successCriteria: [
      "Stated current capacity",
      "Offered alternatives",
      "Stayed professional",
    ],
    followUpScenarios: ['ema-boss-keeps-pushing', 'ema-documenting-overwork'],
  },
  {
    id: 'ema-moving-in-conversation',
    title: "Talking About Moving In Together",
    description: "You and your partner are thinking about living together. Time to have the real conversation.",
    category: 'romantic',
    lifeStage: 'emerging-adulthood',
    ageRange: [22, 29],
    difficulty: 'intermediate',
    
    persona: 'Your Partner',
    personaDescription: "Excited but maybe hasn't thought through everything. Open to discussion.",
    personaTraits: ['excited', 'open', 'might avoid hard topics'],
    
    context: "Moving in together has come up. You need to talk about the practical stuff.",
    firstMessage: "So... I've been thinking about us getting a place together. What do you think?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["You're right, we should figure this out.", "I want to make sure we're on the same page."],
    safetyTriggers: [],
    
    skillsTargeted: ['discussing practical matters', 'sharing expectations', 'collaborative planning'],
    hints: [
      "Talk about money openly",
      "Discuss expectations for chores, guests, space",
      "Talk about what happens if it doesn't work out",
    ],
    goodResponses: [
      "I'm excited about it too. Before we decide, can we talk about how we'd handle rent and bills?",
      "I want to make sure we're aligned on things like chores and having people over. What are your expectations?",
      "I love you and I want this to work. Let's talk about the hard stuff now so we don't fight about it later.",
    ],
    commonMistakes: [
      "Avoiding money conversations",
      "Assuming you're on the same page",
      "Not discussing 'what if it doesn't work'",
    ],
    
    successCriteria: [
      "Discussed finances",
      "Shared expectations",
      "Addressed potential issues",
    ],
    followUpScenarios: ['ema-different-living-standards', 'ema-not-ready-to-move-in'],
  },
];

// ============================================
// EARLY ADULTHOOD SCENARIOS (30-39)
// ============================================

const EARLY_ADULTHOOD_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'ea-parenting-disagreement',
    title: "Parenting Disagreement with Partner",
    description: "You and your partner disagree about how to handle something with your kid.",
    category: 'family',
    lifeStage: 'early-adulthood',
    ageRange: [30, 45],
    difficulty: 'intermediate',
    
    persona: 'Your Partner',
    personaDescription: "Loves the kids but has different ideas about discipline/rules.",
    personaTraits: ['loving', 'different approach', 'willing to discuss'],
    
    context: "You and your partner disagree about a parenting decision (screen time, discipline, activities).",
    firstMessage: "I really think we should [their approach]. I don't understand why you're not on board with this.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you always undermine me', 'you\'re too soft/hard'],
    deescalationResponses: ["Let's figure this out together.", "What's most important to you here?"],
    safetyTriggers: [],
    
    skillsTargeted: ['united front parenting', 'compromise', 'respectful disagreement'],
    hints: [
      "Don't undermine each other in front of kids",
      "Find the value underneath their approach",
      "Present a united front even if you disagree",
    ],
    goodResponses: [
      "I hear your perspective. My concern is [specific]. Can we find a middle ground?",
      "Let's talk about this when the kids aren't around. I don't want them to see us divided.",
      "What's the outcome you're hoping for? Maybe we can get there a different way.",
    ],
    commonMistakes: [
      "Arguing in front of the kids",
      "Saying 'you always' or 'you never'",
      "Dismissing their concerns",
    ],
    
    successCriteria: [
      "Heard their perspective",
      "Shared yours respectfully",
      "Worked toward compromise",
    ],
    followUpScenarios: ['ea-united-front', 'ea-fundamental-parenting-difference'],
  },
  {
    id: 'ea-aging-parent-conversation',
    title: "Talking to Aging Parents About Their Future",
    description: "Your parents are getting older. Time to talk about what happens next.",
    category: 'family',
    lifeStage: 'early-adulthood',
    ageRange: [35, 55],
    difficulty: 'advanced',
    
    persona: 'Your Aging Parent',
    personaDescription: "Doesn't want to think about getting old. Might be defensive or in denial.",
    personaTraits: ['proud', 'doesn\'t want to be a burden', 'might be in denial'],
    
    context: "You need to have a conversation about driving, living situation, or health planning.",
    firstMessage: "I'm fine. I don't know why you keep bringing this up. I'm not ready for a nursing home.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you just want to get rid of me', 'I\'m not that old'],
    deescalationResponses: ["I know this is hard to talk about.", "I'm not trying to take over your life."],
    safetyTriggers: [],
    
    skillsTargeted: ['gentle persistence', 'respecting autonomy', 'planning conversations'],
    hints: [
      "This isn't one conversation — it's many",
      "Lead with love, not fear",
      "Give them control where possible",
    ],
    goodResponses: [
      "I'm not saying nursing home. I'm saying I love you and I want us to have a plan before we need one.",
      "Can we talk about what YOU want? If something happened, what would you want us to know?",
      "I'm not trying to take over. I just don't want to be making decisions in a crisis without knowing what you'd want.",
    ],
    commonMistakes: [
      "Pushing too hard in one conversation",
      "Making it about your convenience",
      "Taking away all their autonomy",
    ],
    
    successCriteria: [
      "Opened the conversation",
      "Respected their feelings",
      "Made some progress, even small",
    ],
    followUpScenarios: ['ea-parent-health-crisis', 'ea-sibling-disagreement-parents'],
  },
  {
    id: 'ea-career-plateau',
    title: "Feeling Stuck in Your Career",
    description: "You've hit a plateau. Talking to your boss about growth.",
    category: 'work',
    lifeStage: 'early-adulthood',
    ageRange: [30, 50],
    difficulty: 'intermediate',
    
    persona: 'Your Boss',
    personaDescription: "Busy. Might not have noticed your plateau. Has limited resources.",
    personaTraits: ['busy', 'pragmatic', 'wants to retain good people'],
    
    context: "You've been in the same role for a while. You want to talk about growth.",
    firstMessage: "You wanted to meet about your career development? What's on your mind?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Let me think about what might be possible.", "I appreciate you bringing this up."],
    safetyTriggers: [],
    
    skillsTargeted: ['self-advocacy at work', 'asking for growth', 'professional communication'],
    hints: [
      "Come with ideas, not just complaints",
      "Know your value",
      "Be open to creative solutions",
    ],
    goodResponses: [
      "I've been in this role for [time] and I'm looking for ways to grow. I was thinking about [specific ideas]. Is there room for that here?",
      "I want to be transparent — I'm feeling stagnant. What would it take for me to move to the next level?",
      "I'm committed to this organization but I need to keep developing. Can we create a plan together?",
    ],
    commonMistakes: [
      "Threatening to leave without being willing to",
      "Not having specific asks",
      "Complaining without proposing solutions",
    ],
    
    successCriteria: [
      "Articulated desire for growth",
      "Had specific ideas",
      "Started a plan",
    ],
    followUpScenarios: ['ea-no-growth-available', 'ea-promotion-conversation'],
  },
  {
    id: 'ea-marriage-trouble',
    title: "When Your Marriage is Struggling",
    description: "Things aren't good between you and your spouse. Opening the conversation.",
    category: 'romantic',
    lifeStage: 'early-adulthood',
    ageRange: [28, 55],
    difficulty: 'advanced',
    
    persona: 'Your Spouse',
    personaDescription: "Also knows something is wrong. Might be defensive or relieved you're bringing it up.",
    personaTraits: ['guarded', 'loves you', 'scared'],
    
    context: "You and your spouse have been distant. You need to talk about it.",
    firstMessage: "You said you wanted to talk? What's going on?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['it\'s always my fault', 'you don\'t even try'],
    deescalationResponses: ["I've been feeling that too.", "I don't want to lose us."],
    safetyTriggers: [],
    
    skillsTargeted: ['vulnerability', 'repair attempts', 'addressing issues'],
    hints: [
      "Use 'I' statements about your feelings",
      "Don't bring up everything at once",
      "Express desire to fix it, not just problems",
    ],
    goodResponses: [
      "I feel like we've been disconnected lately. I miss us. Can we talk about what's going on?",
      "I love you, and I'm scared. We're not okay, and I don't want to pretend we are.",
      "I don't want to fight. I want to understand. Something's off and I want to fix it together.",
    ],
    commonMistakes: [
      "Blaming and attacking",
      "Bringing up everything at once",
      "Saying 'you always/never'",
    ],
    
    successCriteria: [
      "Opened the conversation",
      "Expressed feelings without attacking",
      "Showed commitment to working on it",
    ],
    followUpScenarios: ['ea-couples-therapy-suggestion', 'ea-reconciliation'],
  },
];

// ============================================
// MIDDLE ADULTHOOD SCENARIOS (40-55)
// ============================================

const MIDDLE_ADULTHOOD_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'ma-adult-child-conflict',
    title: "Conflict with Your Adult Child",
    description: "Your grown kid is making choices you disagree with. Navigate it.",
    category: 'family',
    lifeStage: 'middle-adulthood',
    ageRange: [40, 65],
    difficulty: 'advanced',
    
    persona: 'Your Adult Child',
    personaDescription: "Wants autonomy. Might feel judged by you. Still wants your love.",
    personaTraits: ['defensive', 'wants approval', 'independent'],
    
    context: "Your adult child is doing something you disagree with (career, relationship, lifestyle).",
    firstMessage: "I know you don't approve, but it's my life. I'm not asking for permission.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you always try to control me', 'you don\'t respect me'],
    deescalationResponses: ["You're right, it's your life.", "I love you even when I don't agree."],
    safetyTriggers: [],
    
    skillsTargeted: ['letting go', 'loving without controlling', 'staying connected'],
    hints: [
      "They're an adult — you advise, not control",
      "The relationship matters more than being right",
      "Say your piece once, then let it go",
    ],
    goodResponses: [
      "You're right, it's your life. I have concerns, but I trust you to make your own choices. I love you regardless.",
      "I'll be honest — I'm worried about [specific]. But I also know you're an adult and this is your decision.",
      "I don't have to agree to support you. Tell me how you're thinking about this.",
    ],
    commonMistakes: [
      "Continuing to push after they've decided",
      "Withholding love/approval as leverage",
      "Treating them like a child",
    ],
    
    successCriteria: [
      "Respected their autonomy",
      "Expressed love regardless",
      "Maintained relationship",
    ],
    followUpScenarios: ['ma-respecting-boundaries-adult-child'],
  },
  {
    id: 'ma-caring-for-parents',
    title: "Becoming Your Parents' Caregiver",
    description: "Your parents need more help. Navigating the role reversal.",
    category: 'family',
    lifeStage: 'middle-adulthood',
    ageRange: [45, 65],
    difficulty: 'advanced',
    
    persona: 'Your Aging Parent',
    personaDescription: "Struggling with needing help. Might be resistant or grateful.",
    personaTraits: ['proud', 'scared', 'doesn\'t want to burden you'],
    
    context: "Your parent needs regular help now. You're taking on more caregiving.",
    firstMessage: "I don't need you to do all this. I don't want to be a burden on you.",
    
    responseStyle: 'supportive',
    escalationTriggers: ['I can do it myself', 'I\'m not an invalid'],
    deescalationResponses: ["Thank you for helping me.", "I don't know what I'd do without you."],
    safetyTriggers: [],
    
    skillsTargeted: ['caregiving communication', 'preserving dignity', 'setting limits'],
    hints: [
      "Preserve their dignity and autonomy where possible",
      "You can't do it all alone — build support",
      "It's okay to have limits",
    ],
    goodResponses: [
      "You're not a burden. I want to help. Let me know what feels okay and what feels like too much.",
      "I know this is hard. Let's figure out what you can do and where you need support.",
      "I love you and I want to be here for you. We'll take it one day at a time.",
    ],
    commonMistakes: [
      "Taking over everything",
      "Not accepting help from others",
      "Burning yourself out",
    ],
    
    successCriteria: [
      "Offered help with dignity",
      "Collaborated on approach",
      "Maintained connection",
    ],
    followUpScenarios: ['ma-caregiver-burnout', 'ma-sibling-not-helping'],
  },
  {
    id: 'ma-midlife-questioning',
    title: "Midlife Questioning (Is This It?)",
    description: "You're questioning your life choices. Talking to someone about it.",
    category: 'identity',
    lifeStage: 'middle-adulthood',
    ageRange: [40, 60],
    difficulty: 'intermediate',
    
    persona: 'Trusted Friend or Therapist',
    personaDescription: "Safe space to explore existential questions.",
    personaTraits: ['understanding', 'non-judgmental', 'curious'],
    
    context: "You're having midlife questions about meaning, purpose, choices.",
    firstMessage: "You seem like you've got something on your mind. What's going on?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["That's a lot to carry.", "These questions make sense at this stage."],
    safetyTriggers: ['I want to end it', 'nothing matters', 'I wish I could disappear'],
    
    skillsTargeted: ['existential processing', 'vulnerability', 'meaning-making'],
    hints: [
      "These questions are normal and important",
      "It's not too late to make changes",
      "Midlife is a transition, not an ending",
    ],
    goodResponses: [
      "I keep asking myself if this is it. Is this what my life was supposed to be? I thought I'd feel more... something.",
      "I have everything I'm supposed to want and I still feel empty sometimes. What's wrong with me?",
      "I'm not suicidal, I'm just... questioning everything. Does that make sense?",
    ],
    commonMistakes: [
      "Stuffing down the questions",
      "Making impulsive drastic changes",
      "Thinking these feelings are wrong",
    ],
    
    successCriteria: [
      "Named the questions",
      "Allowed yourself to explore",
      "Didn't catastrophize",
    ],
    followUpScenarios: ['ma-making-changes', 'ma-finding-meaning'],
  },
  {
    id: 'ma-empty-nest',
    title: "Adjusting to Empty Nest",
    description: "Your kids have left home. Navigating this transition.",
    category: 'family',
    lifeStage: 'middle-adulthood',
    ageRange: [45, 60],
    difficulty: 'intermediate',
    
    persona: 'Spouse or Friend',
    personaDescription: "Going through it with you or wanting to understand.",
    personaTraits: ['supportive', 'might feel differently', 'caring'],
    
    context: "Your last child has left home. You're processing the transition.",
    firstMessage: "The house feels so quiet now. How are you doing with all this?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["It's a big change.", "We'll figure out this new chapter together."],
    safetyTriggers: ['I have no purpose', 'what\'s the point now'],
    
    skillsTargeted: ['processing transition', 'identity beyond parenting', 'new chapter'],
    hints: [
      "It's okay to grieve this transition",
      "Your identity is more than 'parent'",
      "This is also an opportunity",
    ],
    goodResponses: [
      "I'm happy for them and also really sad. I don't know what I'm supposed to do with myself now.",
      "I spent so long being their parent that I forgot who I am outside of that. I need to figure that out.",
      "Can we talk about what we want this next chapter to look like? We have space now that we haven't had in years.",
    ],
    commonMistakes: [
      "Smothering adult children to stay connected",
      "Denying the grief",
      "Not redefining the relationship with partner",
    ],
    
    successCriteria: [
      "Named the feelings",
      "Started thinking about next chapter",
      "Stayed connected to partner/self",
    ],
    followUpScenarios: ['ma-reconnecting-with-partner', 'ma-new-identity'],
  },
];

// ============================================
// LATE ADULTHOOD SCENARIOS (56+)
// ============================================

const LATE_ADULTHOOD_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'lat-retirement-adjustment',
    title: "Adjusting to Retirement",
    description: "You've retired and it's harder than expected. Processing the transition.",
    category: 'identity',
    lifeStage: 'late-adulthood',
    ageRange: [55, 75],
    difficulty: 'intermediate',
    
    persona: 'Spouse or Friend',
    personaDescription: "Wants you to enjoy retirement. Might not understand the struggle.",
    personaTraits: ['supportive', 'optimistic', 'might not get it'],
    
    context: "You've retired but you're struggling with the loss of identity and purpose.",
    firstMessage: "I thought you'd be happy to be done working! Why are you so down?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["I didn't realize it was so hard.", "What can I do to help?"],
    safetyTriggers: ['what\'s the point', 'I\'m useless now', 'no one needs me'],
    
    skillsTargeted: ['identity transition', 'finding new purpose', 'naming feelings'],
    hints: [
      "Work was more than work — it was identity, structure, community",
      "It takes time to build a new life structure",
      "This is a real grief, not ingratitude",
    ],
    goodResponses: [
      "I know I should be happy. But work was a big part of who I was. I'm struggling to figure out who I am now.",
      "I miss having somewhere to be. People who needed me. A purpose. I know it sounds dramatic but I feel lost.",
      "I need to find new things that give me meaning. It's just taking longer than I expected.",
    ],
    commonMistakes: [
      "Pretending you're fine",
      "Isolating",
      "Going back to work for the wrong reasons",
    ],
    
    successCriteria: [
      "Named the identity struggle",
      "Didn't dismiss your feelings",
      "Opened to building new purpose",
    ],
    followUpScenarios: ['lat-finding-new-purpose', 'lat-volunteer-work'],
  },
  {
    id: 'lat-health-diagnosis',
    title: "Receiving a Difficult Health Diagnosis",
    description: "You've received a serious diagnosis. Processing and communicating about it.",
    category: 'mental-health',
    lifeStage: 'late-adulthood',
    ageRange: [50, 80],
    difficulty: 'advanced',
    
    persona: 'Family Member',
    personaDescription: "Loves you. Scared about the diagnosis. Wants to help.",
    personaTraits: ['scared', 'loving', 'might try to fix'],
    
    context: "You've received a serious health diagnosis and need to talk to your family.",
    firstMessage: "What did the doctor say? Tell me everything.",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["We'll face this together.", "I'm here no matter what."],
    safetyTriggers: ['I don\'t want treatment', 'maybe I should just', 'I don\'t want to be a burden'],
    
    skillsTargeted: ['sharing hard news', 'accepting support', 'processing diagnosis'],
    hints: [
      "You get to decide how much to share and when",
      "Let yourself have feelings before making big decisions",
      "Accepting help isn't weakness",
    ],
    goodResponses: [
      "The doctor said [diagnosis]. I'm still processing it. I don't have all the answers yet.",
      "I need to tell you something hard. I have [diagnosis]. I'm scared but I wanted you to know.",
      "I don't want you to panic. Yes, it's serious. Let's focus on what we can do, not worst-case scenarios.",
    ],
    commonMistakes: [
      "Not telling anyone",
      "Making big decisions immediately",
      "Refusing all support",
    ],
    
    successCriteria: [
      "Shared the news",
      "Allowed yourself to be supported",
      "Didn't rush decisions",
    ],
    followUpScenarios: ['lat-treatment-decisions', 'lat-telling-more-people'],
  },
  {
    id: 'lat-end-of-life-wishes',
    title: "Communicating End-of-Life Wishes",
    description: "Telling your family what you want when the time comes.",
    category: 'family',
    lifeStage: 'late-adulthood',
    ageRange: [60, 90],
    difficulty: 'advanced',
    
    persona: 'Adult Child / Family Member',
    personaDescription: "Doesn't want to talk about death. Loves you. Might be uncomfortable.",
    personaTraits: ['uncomfortable', 'loving', 'might resist'],
    
    context: "You want to have a conversation about what you want at end of life.",
    firstMessage: "Why are you bringing this up? You're not dying. Let's talk about something else.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["You're right, we should plan.", "I love you. I'll listen."],
    safetyTriggers: [],
    
    skillsTargeted: ['end-of-life planning', 'opening hard conversations', 'clarity'],
    hints: [
      "Having this conversation is a gift to your family",
      "Be specific about what you want and don't want",
      "This isn't morbid — it's loving",
    ],
    goodResponses: [
      "I'm not planning to die tomorrow. But I want you to know my wishes so you're not guessing during a crisis.",
      "This is hard to talk about but important. I'd rather tell you myself than leave you wondering.",
      "I want to make this easy for you, not hard. Let me tell you what I want, and then you'll know.",
    ],
    commonMistakes: [
      "Never having the conversation",
      "Being too vague",
      "Not documenting wishes legally",
    ],
    
    successCriteria: [
      "Opened the conversation",
      "Shared specific wishes",
      "Made it about love, not death",
    ],
    followUpScenarios: ['lat-legal-documents', 'lat-ongoing-conversations'],
  },
];

// ============================================
// IMPORT ADDITIONAL SCENARIOS
// ============================================

import { ALL_ADDITIONAL_SCENARIOS } from './additional-scenarios';

// ============================================
// COMBINE ALL SCENARIOS
// ============================================

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  ...MIDDLE_CHILDHOOD_SCENARIOS,
  ...EARLY_ADOLESCENCE_SCENARIOS,
  ...MIDDLE_ADOLESCENCE_SCENARIOS,
  ...LATE_ADOLESCENCE_SCENARIOS,
  ...EMERGING_ADULTHOOD_SCENARIOS,
  ...EARLY_ADULTHOOD_SCENARIOS,
  ...MIDDLE_ADULTHOOD_SCENARIOS,
  ...LATE_ADULTHOOD_SCENARIOS,
  ...ALL_ADDITIONAL_SCENARIOS,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getScenariosByAge = (age: number): RoleplayScenario[] => {
  return ROLEPLAY_SCENARIOS.filter(
    s => age >= s.ageRange[0] && age <= s.ageRange[1]
  ).slice(0, 10); // Return top 10 for the age
};

export const getScenariosByTopic = (topicId: string): RoleplayScenario[] => {
  return ROLEPLAY_SCENARIOS.filter(s => s.topicId === topicId);
};

export const getScenariosByCategory = (category: ScenarioCategory): RoleplayScenario[] => {
  return ROLEPLAY_SCENARIOS.filter(s => s.category === category);
};

export const getScenariosByLifeStage = (stage: LifeStage): RoleplayScenario[] => {
  return ROLEPLAY_SCENARIOS.filter(s => s.lifeStage === stage);
};

export const getScenarioById = (id: string): RoleplayScenario | undefined => {
  return ROLEPLAY_SCENARIOS.find(s => s.id === id);
};

export const getRecommendedScenarios = (
  age: number, 
  completedIds: string[], 
  struggles: string[]
): RoleplayScenario[] => {
  // Get age-appropriate scenarios not yet completed
  const available = getScenariosByAge(age).filter(
    s => !completedIds.includes(s.id)
  );
  
  // Prioritize scenarios matching their struggles
  const prioritized = available.sort((a, b) => {
    const aMatch = struggles.some(str => 
      a.skillsTargeted.some(skill => skill.toLowerCase().includes(str.toLowerCase()))
    );
    const bMatch = struggles.some(str => 
      b.skillsTargeted.some(skill => skill.toLowerCase().includes(str.toLowerCase()))
    );
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });
  
  return prioritized.slice(0, 5);
};
