// Additional Scenarios
// More scenarios to expand coverage across all life stages

import { RoleplayScenario } from './roleplay-scenarios';

// ============================================
// ADDITIONAL CHILDHOOD SCENARIOS (6-10)
// ============================================

export const ADDITIONAL_CHILDHOOD: RoleplayScenario[] = [
  {
    id: 'mc-new-kid-school',
    title: "Being the New Kid at School",
    description: "You just started at a new school. Practice introducing yourself and making friends.",
    category: 'school',
    lifeStage: 'middle-childhood',
    ageRange: [6, 10],
    difficulty: 'beginner',
    
    persona: 'Classmate',
    personaDescription: "A kid your age who seems nice. Curious about the new kid.",
    personaTraits: ['curious', 'friendly', 'might already have friends'],
    
    context: "It's your first day. A kid sits next to you and starts talking.",
    firstMessage: "Hey, you're new, right? Where did you move from?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Cool! Want to sit with us at lunch?"],
    safetyTriggers: [],
    
    skillsTargeted: ['introducing yourself', 'asking questions', 'making connections'],
    hints: [
      "Answer their question and ask one back",
      "Mention something you like — maybe they like it too",
      "It's okay to feel nervous",
    ],
    goodResponses: [
      "Yeah, I just moved from [place]. What's your name?",
      "I'm [name]. Is this school cool? What's your favorite thing to do here?",
      "I'm a little nervous. Is everyone pretty nice here?",
    ],
    commonMistakes: [
      "One-word answers that don't continue the conversation",
      "Pretending you're not nervous when you are",
      "Not asking questions back",
    ],
    
    successCriteria: [
      "Introduced yourself",
      "Asked questions to show interest",
      "Kept the conversation going",
    ],
    followUpScenarios: ['mc-joining-lunch-table'],
  },
  {
    id: 'mc-scared-tell-adult',
    title: "Telling an Adult About Something Scary",
    description: "Something happened that scared you. Practice telling a trusted adult.",
    category: 'safety',
    lifeStage: 'middle-childhood',
    ageRange: [6, 10],
    difficulty: 'intermediate',
    
    persona: 'Trusted Adult (Teacher/Parent)',
    personaDescription: "An adult who cares about you and wants to help.",
    personaTraits: ['caring', 'patient', 'wants to help'],
    
    context: "Something happened that scared you or made you uncomfortable. You're telling an adult.",
    firstMessage: "Sweetie, you seem upset. What's going on? You can tell me anything.",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Thank you for telling me. You did the right thing."],
    safetyTriggers: ['hurt me', 'touched me', 'secret', 'threatened'],
    
    skillsTargeted: ['asking for help', 'describing what happened', 'trusting adults'],
    hints: [
      "You won't get in trouble for telling",
      "Start with 'Something happened...'",
      "It's okay if you don't have all the words",
    ],
    goodResponses: [
      "Something happened and I'm scared. Can I tell you?",
      "Someone did something that made me feel bad. I don't know if I should tell.",
      "I saw/heard something scary and I don't know what to do.",
    ],
    commonMistakes: [
      "Keeping it a secret",
      "Thinking you'll get in trouble",
      "Saying 'never mind' and not telling",
    ],
    
    successCriteria: [
      "Started to share",
      "Stayed in conversation",
      "Asked for help",
    ],
    followUpScenarios: ['mc-adult-asks-questions'],
  },
  {
    id: 'mc-losing-game',
    title: "Losing a Game Without Getting Upset",
    description: "You lost a game and you're frustrated. Practice good sportsmanship.",
    category: 'friends',
    lifeStage: 'middle-childhood',
    ageRange: [6, 10],
    difficulty: 'beginner',
    
    persona: 'Friend Who Won',
    personaDescription: "Your friend who just beat you at a game. Happy but not mean about it.",
    personaTraits: ['excited', 'not rubbing it in', 'wants to keep playing'],
    
    context: "You just lost a game (video game, board game, sport). Your friend won.",
    firstMessage: "Yes! I won! That was close though. Want to play again?",
    
    responseStyle: 'supportive',
    escalationTriggers: ['you cheated', 'I hate this game'],
    deescalationResponses: ["Hey, you almost had me. Good game!"],
    safetyTriggers: [],
    
    skillsTargeted: ['handling frustration', 'good sportsmanship', 'staying friends'],
    hints: [
      "It's okay to be disappointed, but not mean",
      "Saying 'good game' is a nice thing to do",
      "You can play again and maybe win next time",
    ],
    goodResponses: [
      "Good game. Yeah, let's play again!",
      "Aw man, I really wanted to win. Okay, one more time.",
      "You're really good at this. Teach me that move you did?",
    ],
    commonMistakes: [
      "Saying they cheated",
      "Refusing to play anymore",
      "Getting really angry",
    ],
    
    successCriteria: [
      "Handled frustration",
      "Was a good sport",
      "Stayed friends",
    ],
    followUpScenarios: [],
  },
];

// ============================================
// ADDITIONAL TEEN SCENARIOS (11-17)
// ============================================

export const ADDITIONAL_TEEN: RoleplayScenario[] = [
  {
    id: 'teen-sexting-pressure',
    title: "When Someone Asks for Inappropriate Pictures",
    description: "Someone is asking you to send pictures you're not comfortable with.",
    category: 'safety',
    lifeStage: 'middle-adolescence',
    ageRange: [13, 17],
    difficulty: 'advanced',
    
    persona: 'Person Requesting Pictures',
    personaDescription: "Someone pressuring you to send pics. Might be a crush, partner, or stranger.",
    personaTraits: ['pushy', 'guilt-tripping', 'may threaten'],
    
    context: "Someone (online or IRL) is asking you to send intimate pictures.",
    firstMessage: "Come on, just send me one pic. I won't show anyone. Don't you trust me?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Okay fine, I respect that."],
    safetyTriggers: ['already have pics', 'I\'ll show everyone', 'you owe me'],
    
    skillsTargeted: ['saying no firmly', 'recognizing manipulation', 'protecting yourself'],
    hints: [
      "You NEVER have to send pictures, no matter what they say",
      "If they threaten you, tell an adult immediately",
      "Anyone who pressures you doesn't respect you",
    ],
    goodResponses: [
      "No. I'm not sending pics. That's my boundary.",
      "If you respected me, you wouldn't keep asking.",
      "I said no. If you can't accept that, we're done talking.",
    ],
    commonMistakes: [
      "Giving in to pressure",
      "Thinking 'just one' is okay",
      "Not telling anyone if threatened",
    ],
    
    successCriteria: [
      "Said no clearly",
      "Didn't give in to pressure",
      "Recognized red flags",
    ],
    followUpScenarios: ['teen-being-threatened-pics', 'teen-telling-adult-situation'],
  },
  {
    id: 'teen-friend-bad-relationship',
    title: "Your Friend's Partner Seems Controlling",
    description: "You're worried about your friend's relationship but they don't see it.",
    category: 'friends',
    lifeStage: 'middle-adolescence',
    ageRange: [14, 19],
    difficulty: 'advanced',
    
    persona: 'Friend in Concerning Relationship',
    personaDescription: "Defensive about their partner. Makes excuses. Might get upset with you.",
    personaTraits: ['defensive', 'in love', 'makes excuses'],
    
    context: "Your friend's partner seems controlling. You want to say something.",
    firstMessage: "Why does everyone keep asking about my relationship? We're fine. They're just protective.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you\'re jealous', 'you don\'t understand'],
    deescalationResponses: ["I... I know you're just worried about me."],
    safetyTriggers: ['they would hurt me if', 'I can\'t leave', 'I\'m scared'],
    
    skillsTargeted: ['expressing concern', 'not pushing too hard', 'staying their friend'],
    hints: [
      "Focus on how THEY seem, not how bad the partner is",
      "Don't attack the partner directly",
      "Stay their friend no matter what",
    ],
    goodResponses: [
      "I'm not saying they're bad. I'm saying I miss you and I'm worried because you seem different.",
      "I just want to make sure you can still be yourself. Can you still see friends? Talk to family?",
      "I'll always be your friend. If you ever need anything, I'm here. No judgment.",
    ],
    commonMistakes: [
      "Attacking the partner",
      "Giving ultimatums",
      "Pushing so hard they pull away",
    ],
    
    successCriteria: [
      "Expressed concern gently",
      "Didn't attack partner",
      "Kept friendship open",
    ],
    followUpScenarios: ['teen-friend-admits-problem'],
  },
  {
    id: 'teen-academic-pressure',
    title: "When Parents Pressure About Grades",
    description: "Your parents are putting too much pressure on your academics.",
    category: 'family',
    lifeStage: 'middle-adolescence',
    ageRange: [14, 18],
    difficulty: 'intermediate',
    
    persona: 'Parent (High Expectations)',
    personaDescription: "Wants you to succeed. Might be too intense about grades.",
    personaTraits: ['high expectations', 'loving', 'might not see the pressure'],
    
    context: "Your parent is pressuring you about grades or academic performance.",
    firstMessage: "A B+? You can do better than that. Did you even try? What happened?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['I did my best', 'you don\'t understand'],
    deescalationResponses: ["I know. I just want what's best for you.", "Okay, how can I support you?"],
    safetyTriggers: ['I can\'t take this pressure', 'I want to disappear'],
    
    skillsTargeted: ['advocating for yourself', 'expressing overwhelm', 'setting expectations'],
    hints: [
      "Acknowledge you want to do well too",
      "Explain the pressure you're feeling",
      "Ask for what you need (support, not just pressure)",
    ],
    goodResponses: [
      "I did try. A B+ is good. I feel like nothing is ever good enough for you.",
      "I want to do well too, but the pressure makes it worse. Can we talk about this differently?",
      "I'm doing my best. What I need is support, not disappointment.",
    ],
    commonMistakes: [
      "Shutting down and saying nothing",
      "Yelling and making it a fight",
      "Agreeing to impossible standards",
    ],
    
    successCriteria: [
      "Stood up for yourself",
      "Explained the impact of pressure",
      "Asked for what you need",
    ],
    followUpScenarios: ['teen-parent-listens', 'teen-setting-realistic-expectations'],
  },
  {
    id: 'teen-social-media-bullying',
    title: "Handling Cyberbullying",
    description: "Someone is being mean to you online. Practice responding and getting help.",
    category: 'conflict',
    lifeStage: 'early-adolescence',
    ageRange: [11, 17],
    difficulty: 'intermediate',
    
    persona: 'Trusted Adult',
    personaDescription: "Someone you're telling about the online situation.",
    personaTraits: ['concerned', 'wants to help', 'might not fully understand online stuff'],
    
    context: "Someone has been posting mean things about you online. You're telling an adult.",
    firstMessage: "You said someone's been bothering you online? Tell me what's happening.",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["That's not okay. We'll figure this out together."],
    safetyTriggers: ['I want to die', 'I can\'t face them', 'I don\'t want to go to school'],
    
    skillsTargeted: ['asking for help', 'explaining online situations', 'documenting'],
    hints: [
      "Screenshot everything before it's deleted",
      "Don't respond to the bully",
      "It's not your fault, and you deserve help",
    ],
    goodResponses: [
      "Someone from school has been posting mean things about me. I have screenshots. I don't know what to do.",
      "It started with comments and now they made a post. Other people are commenting too. I feel sick about going to school.",
      "I haven't responded because I didn't want to make it worse. But it's affecting me a lot.",
    ],
    commonMistakes: [
      "Not telling anyone",
      "Responding and escalating",
      "Deleting evidence",
    ],
    
    successCriteria: [
      "Explained the situation",
      "Showed documentation mindset",
      "Asked for help",
    ],
    followUpScenarios: ['teen-reporting-bullying-school'],
  },
  {
    id: 'teen-consent-conversation',
    title: "Talking About Consent",
    description: "Practice communicating about consent and boundaries in dating.",
    category: 'romantic',
    lifeStage: 'middle-adolescence',
    ageRange: [15, 19],
    difficulty: 'intermediate',
    
    persona: 'Date/Partner',
    personaDescription: "Someone you're dating. Wants to get physical but should respect boundaries.",
    personaTraits: ['interested', 'should be respectful', 'might need clarity'],
    
    context: "You're in a dating situation where physical stuff might happen. Practice consent communication.",
    firstMessage: "I'm having a really good time with you. [moves closer]",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Totally, let's just hang out.", "No pressure at all."],
    safetyTriggers: [],
    
    skillsTargeted: ['communicating consent', 'checking in', 'setting boundaries'],
    hints: [
      "Consent should be enthusiastic, not pressured",
      "You can say yes to some things and no to others",
      "It's okay to change your mind at any time",
    ],
    goodResponses: [
      "I like you too. Before anything happens, I want to make sure we're on the same page about boundaries.",
      "Is this okay? I want to make sure you're comfortable.",
      "I'm not ready for [that], but I'm okay with [this]. Is that cool?",
    ],
    commonMistakes: [
      "Not communicating at all",
      "Assuming based on signals",
      "Feeling bad about setting limits",
    ],
    
    successCriteria: [
      "Communicated clearly",
      "Checked in or set boundary",
      "Modeled good consent practice",
    ],
    followUpScenarios: [],
  },
];

// ============================================
// ADDITIONAL ADULT SCENARIOS (25+)
// ============================================

export const ADDITIONAL_ADULT: RoleplayScenario[] = [
  {
    id: 'adult-saying-no-work',
    title: "Saying No to Extra Work",
    description: "You're asked to take on more than you can handle at work.",
    category: 'work',
    lifeStage: 'emerging-adulthood',
    ageRange: [22, 55],
    difficulty: 'intermediate',
    
    persona: 'Boss/Colleague',
    personaDescription: "Asking you to take on more work. Might expect you to say yes.",
    personaTraits: ['assumptive', 'busy', 'might be reasonable'],
    
    context: "Someone asks you to take on additional work when you're already at capacity.",
    firstMessage: "Hey, I need someone to handle the Johnson project. Can you add it to your plate?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['everyone else is busy too'],
    deescalationResponses: ["Okay, thanks for being honest about your capacity."],
    safetyTriggers: [],
    
    skillsTargeted: ['saying no professionally', 'setting limits', 'offering alternatives'],
    hints: [
      "You can say no without being negative",
      "Explain your capacity, don't just refuse",
      "Offer alternatives if possible",
    ],
    goodResponses: [
      "I want to help, but I'm already at capacity with [current projects]. If this is priority, what should I deprioritize?",
      "I can't take that on right now without dropping something else. Can we look at my current workload together?",
      "I'd be setting us both up for failure if I say yes. I'm fully committed through [date]. Can we revisit then?",
    ],
    commonMistakes: [
      "Always saying yes until burnout",
      "Saying no rudely",
      "Not explaining why",
    ],
    
    successCriteria: [
      "Declined professionally",
      "Explained reasoning",
      "Offered alternative or solution",
    ],
    followUpScenarios: ['adult-boss-pushes-back'],
  },
  {
    id: 'adult-difficult-inlaw',
    title: "Setting Boundaries with In-Laws",
    description: "Your in-law is overstepping. Practice addressing it.",
    category: 'family',
    lifeStage: 'early-adulthood',
    ageRange: [25, 55],
    difficulty: 'advanced',
    
    persona: 'In-Law (Mother or Father)',
    personaDescription: "Loves family but oversteps. Might not see their behavior as problematic.",
    personaTraits: ['well-meaning', 'overbearing', 'might get defensive'],
    
    context: "Your in-law keeps overstepping (parenting advice, showing up unannounced, criticizing).",
    firstMessage: "I'm just trying to help! I don't know why you're so sensitive about everything.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['my son/daughter never complained', 'you\'re keeping me from my grandchildren'],
    deescalationResponses: ["I didn't realize. I'll try to be better about that."],
    safetyTriggers: [],
    
    skillsTargeted: ['boundary setting', 'staying calm', 'maintaining relationship'],
    hints: [
      "Address the behavior, not their character",
      "Your partner should ideally back you up",
      "Set the boundary once and hold it",
    ],
    goodResponses: [
      "I appreciate that you want to help. And I need you to call before coming over. That's not negotiable for us.",
      "We're not asking you to stop being involved. We're asking you to respect our decisions as parents.",
      "I know this is hard to hear. We love you and we need this boundary respected.",
    ],
    commonMistakes: [
      "Never saying anything until you explode",
      "Making your partner the bad guy",
      "Engaging in arguments about the boundary",
    ],
    
    successCriteria: [
      "Set boundary clearly",
      "Stayed respectful",
      "Didn't over-explain or argue",
    ],
    followUpScenarios: ['adult-inlaw-ignores-boundary'],
  },
  {
    id: 'adult-friend-drifting',
    title: "When a Friendship is Fading",
    description: "A long-time friend has been distant. Decide whether to address it or let go.",
    category: 'friends',
    lifeStage: 'emerging-adulthood',
    ageRange: [25, 50],
    difficulty: 'intermediate',
    
    persona: 'Distant Friend',
    personaDescription: "Used to be close but has been distant. Might be busy, might be pulling away.",
    personaTraits: ['distant lately', 'has history with you', 'unclear intentions'],
    
    context: "A long friendship feels like it's fading. You're reaching out.",
    firstMessage: "Hey! Sorry I've been MIA. Things have been crazy. How are you?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["You're right. I've been a bad friend. I'm sorry."],
    safetyTriggers: [],
    
    skillsTargeted: ['honest communication', 'accepting change', 'expressing needs'],
    hints: [
      "It's okay to say you miss them",
      "Ask directly if something is wrong",
      "Be prepared for any answer",
    ],
    goodResponses: [
      "I've missed you. It feels like we've been disconnected. Is everything okay with us?",
      "No worries about being busy, but I wanted to check in. Our friendship matters to me and I've been feeling the distance.",
      "I'm good. I've been wanting to reach out too. Can we actually catch up? Like for real, not just texting.",
    ],
    commonMistakes: [
      "Pretending you haven't noticed",
      "Being passive aggressive",
      "Assuming the worst",
    ],
    
    successCriteria: [
      "Addressed the distance",
      "Expressed care for friendship",
      "Left room for honest response",
    ],
    followUpScenarios: ['adult-friend-admits-distance-intentional'],
  },
  {
    id: 'adult-financial-conversation-partner',
    title: "Talking About Money with Your Partner",
    description: "You need to have a difficult money conversation with your partner.",
    category: 'romantic',
    lifeStage: 'emerging-adulthood',
    ageRange: [22, 55],
    difficulty: 'intermediate',
    
    persona: 'Partner',
    personaDescription: "Your partner. You need to discuss a money issue (debt, spending, goals).",
    personaTraits: ['might be defensive', 'loves you', 'might have different money views'],
    
    context: "There's a money issue you need to address with your partner.",
    firstMessage: "What do you mean we need to talk about money? Is something wrong?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you\'re always judging my spending'],
    deescalationResponses: ["You're right, we should talk about this."],
    safetyTriggers: [],
    
    skillsTargeted: ['financial communication', 'non-blaming language', 'shared planning'],
    hints: [
      "Use 'we' language — you're a team",
      "Focus on goals, not blame",
      "Share your own money stuff too, not just theirs",
    ],
    goodResponses: [
      "Nothing is wrong, I just think we should get on the same page about our money. I want us to have shared goals.",
      "I'm not accusing you of anything. I'm saying I think we need to talk about [specific topic] so we're a team.",
      "Can we look at our finances together? I want to make sure we're building what we both want.",
    ],
    commonMistakes: [
      "Blaming and accusing",
      "Avoiding the conversation forever",
      "Making it about their spending only",
    ],
    
    successCriteria: [
      "Opened conversation without blame",
      "Focused on shared goals",
      "Invited collaboration",
    ],
    followUpScenarios: ['adult-financial-planning-together'],
  },
  {
    id: 'adult-health-scare',
    title: "Telling Family About a Health Concern",
    description: "You have a health issue you need to tell family about.",
    category: 'family',
    lifeStage: 'early-adulthood',
    ageRange: [30, 70],
    difficulty: 'advanced',
    
    persona: 'Family Member (Spouse, Parent, or Child)',
    personaDescription: "Someone you love who will be worried. Might freak out.",
    personaTraits: ['loving', 'scared', 'might overreact'],
    
    context: "You have health news to share with family (diagnosis, scare, test results).",
    firstMessage: "You said you had something to tell me. You're scaring me. What's going on?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Thank you for telling me. We'll face this together."],
    safetyTriggers: [],
    
    skillsTargeted: ['sharing difficult news', 'managing others\' reactions', 'accepting support'],
    hints: [
      "You can ask them to stay calm first",
      "Share facts before emotions",
      "It's okay to say what you need from them",
    ],
    goodResponses: [
      "Before I tell you, I need you to stay calm so we can talk about it. Can you do that?",
      "I found out [health news]. Here's what we know and here's the plan. I wanted you to hear it from me.",
      "I'm okay right now. I'm telling you because I need support, not panic. Can you be that for me?",
    ],
    commonMistakes: [
      "Not telling anyone",
      "Not managing their reaction",
      "Taking on their panic too",
    ],
    
    successCriteria: [
      "Shared the news",
      "Provided facts and plan",
      "Expressed what you need",
    ],
    followUpScenarios: ['adult-processing-health-news-together'],
  },
];

// ============================================
// EXPORT ALL ADDITIONAL SCENARIOS
// ============================================

export const ALL_ADDITIONAL_SCENARIOS: RoleplayScenario[] = [
  ...ADDITIONAL_CHILDHOOD,
  ...ADDITIONAL_TEEN,
  ...ADDITIONAL_ADULT,
];

export default ALL_ADDITIONAL_SCENARIOS;
