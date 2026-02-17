// LGBTQ+ Specialized Roleplay Scenarios
// Covering coming out, identity, relationships, and family across all life stages

import { RoleplayScenario } from '../roleplay-scenarios';

export const LGBTQ_SCENARIOS: RoleplayScenario[] = [
  // ============================================
  // EARLY ADOLESCENCE (11-14)
  // ============================================
  {
    id: 'lgbtq-ea-questioning-friend',
    title: "Talking to a Friend About Questioning",
    description: "You're figuring out your identity and want to talk to a trusted friend.",
    category: 'identity',
    lifeStage: 'early-adolescence',
    ageRange: [11, 14],
    difficulty: 'beginner',
    
    persona: 'Close Friend',
    personaDescription: "Cares about you. Might not know much about LGBTQ+ stuff but trying to be supportive.",
    personaTraits: ['supportive', 'curious', 'might ask clumsy questions'],
    
    context: "You've been questioning your sexuality or gender and want to talk to someone you trust.",
    firstMessage: "Hey, what's up? You seem like you have something on your mind.",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Thanks for telling me. I don't totally understand but I'm here for you."],
    safetyTriggers: ['I hate myself', 'I wish I was normal', 'I can\'t tell my parents'],
    
    skillsTargeted: ['vulnerability', 'self-acceptance language', 'setting pace'],
    hints: [
      "You don't have to have it all figured out",
      "You can share as much or as little as you want",
      "It's okay to ask them to keep it between you",
    ],
    goodResponses: [
      "I've been thinking about some stuff lately. About like... who I am. I think I might be [identity] but I'm still figuring it out.",
      "Can I tell you something? I need you not to tell anyone else for now.",
      "I don't have all the answers yet. I just needed to say it out loud to someone.",
    ],
    commonMistakes: [
      "Apologizing for who you are",
      "Expecting them to react perfectly",
      "Feeling like you need all the answers",
    ],
    
    successCriteria: [
      "Shared authentically",
      "Set boundaries around privacy",
      "Showed self-compassion",
    ],
    followUpScenarios: ['lgbtq-ea-friend-tells-others', 'lgbtq-ea-finding-community'],
  },
  {
    id: 'lgbtq-ea-crush-same-gender',
    title: "Realizing You Have a Same-Gender Crush",
    description: "Processing feelings about liking someone of the same gender.",
    category: 'identity',
    lifeStage: 'early-adolescence',
    ageRange: [11, 14],
    difficulty: 'beginner',
    
    persona: 'Your Inner Voice (Journal Style)',
    personaDescription: "A way to process your own thoughts. Asks questions to help you understand yourself.",
    personaTraits: ['curious', 'non-judgmental', 'helpful'],
    
    context: "You've realized you have feelings for someone of the same gender. You're processing this internally.",
    firstMessage: "So... you've been thinking about [name] a lot lately. What's going on with that?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Whatever you're feeling is valid.", "There's nothing wrong with you."],
    safetyTriggers: ['I\'m disgusting', 'God hates me', 'I want to die'],
    
    skillsTargeted: ['self-reflection', 'self-acceptance', 'normalizing feelings'],
    hints: [
      "Crushes don't always mean something permanent about your identity",
      "It's okay to be confused",
      "Having these feelings doesn't change your worth",
    ],
    goodResponses: [
      "I think I might like them as more than a friend. And that scares me but also feels real.",
      "I don't know what this means about me. Maybe I'm [identity]. Maybe I'm still figuring it out.",
      "I'm allowed to have these feelings. They don't make me bad.",
    ],
    commonMistakes: [
      "Panicking and pushing feelings away",
      "Thinking you have to label yourself immediately",
      "Believing something is wrong with you",
    ],
    
    successCriteria: [
      "Acknowledged feelings honestly",
      "Showed self-compassion",
      "Didn't rush to conclusions",
    ],
    followUpScenarios: ['lgbtq-ea-crush-same-gender-action'],
  },
  {
    id: 'lgbtq-ea-responding-slurs',
    title: "When Someone Uses a Slur",
    description: "Someone at school uses a homophobic or transphobic slur. How do you respond?",
    category: 'conflict',
    lifeStage: 'early-adolescence',
    ageRange: [11, 14],
    difficulty: 'intermediate',
    
    persona: 'Kid at School',
    personaDescription: "Used a slur casually. Might not realize the impact. Could get defensive or apologize.",
    personaTraits: ['ignorant', 'might double down', 'might apologize'],
    
    context: "Someone uses 'gay' as an insult or says something homophobic/transphobic near you.",
    firstMessage: "That's so gay. [laughs]",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you\'re gay too', 'why do you care'],
    deescalationResponses: ["Whatever, it's just a word.", "Fine, my bad."],
    safetyTriggers: [],
    
    skillsTargeted: ['standing up', 'choosing battles', 'staying safe'],
    hints: [
      "You don't have to respond every time",
      "Your safety comes first",
      "Sometimes a simple 'not cool' is enough",
    ],
    goodResponses: [
      "That's not cool.",
      "Why do you say it like that?",
      "[Walk away — choosing not to engage is also valid]",
    ],
    commonMistakes: [
      "Putting yourself in danger",
      "Feeling like you have to educate everyone",
      "Feeling like you failed if you didn't respond",
    ],
    
    successCriteria: [
      "Made a choice (respond or not) consciously",
      "Stayed safe",
      "Didn't internalize the slur",
    ],
    followUpScenarios: ['lgbtq-ea-reporting-harassment'],
  },

  // ============================================
  // MIDDLE ADOLESCENCE (15-17)
  // ============================================
  {
    id: 'lgbtq-ma-coming-out-parent',
    title: "Coming Out to a Parent",
    description: "You've decided to come out to your parent. Practice the conversation.",
    category: 'family',
    lifeStage: 'middle-adolescence',
    ageRange: [15, 17],
    difficulty: 'advanced',
    
    persona: 'Your Parent',
    personaDescription: "Loves you. Might be surprised, confused, or struggle with religious/cultural beliefs. Reaction varies.",
    personaTraits: ['loves you', 'might struggle', 'reaction uncertain'],
    
    context: "You've decided it's time to come out to your parent. You're initiating the conversation.",
    firstMessage: "You said you wanted to talk about something?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['how could you do this to us', 'this is a phase'],
    deescalationResponses: ["I love you. This is a lot to take in.", "I need some time but I'm glad you told me."],
    safetyTriggers: ['get out of my house', 'we\'re sending you away', 'you\'re not my child'],
    
    skillsTargeted: ['courage', 'staying grounded', 'not responsible for their reaction'],
    hints: [
      "You can't control their reaction",
      "Their first reaction might not be their forever reaction",
      "Have a safety plan if you're worried about the response",
    ],
    goodResponses: [
      "I need to tell you something important about who I am. I'm [identity]. I've known for a while and I wanted to be honest with you.",
      "I hope you can accept this. I'm still the same person.",
      "I know this might be hard for you. I'm not asking you to understand everything right away.",
    ],
    commonMistakes: [
      "Taking full responsibility for their feelings",
      "Backing down and saying 'never mind'",
      "Coming out when you're not safe",
    ],
    
    successCriteria: [
      "Came out clearly",
      "Didn't apologize for identity",
      "Maintained self-respect",
    ],
    followUpScenarios: ['lgbtq-ma-parent-needs-time', 'lgbtq-ma-parent-rejects'],
  },
  {
    id: 'lgbtq-ma-dating-same-gender',
    title: "First Same-Gender Date",
    description: "You're going on a date with someone of the same gender. Practice navigating it.",
    category: 'romantic',
    lifeStage: 'middle-adolescence',
    ageRange: [15, 17],
    difficulty: 'beginner',
    
    persona: 'Your Date',
    personaDescription: "Also nervous! Interested in getting to know you. Sweet and authentic.",
    personaTraits: ['nervous', 'kind', 'authentic'],
    
    context: "You're on a first date with someone you like. Both of you are a little nervous.",
    firstMessage: "Hey! I'm really glad we're doing this. I was kind of nervous to ask you out.",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: [],
    safetyTriggers: [],
    
    skillsTargeted: ['being yourself', 'connection', 'handling nerves'],
    hints: [
      "It's okay to be nervous — they probably are too",
      "Be yourself, not who you think they want",
      "It's okay to talk about being nervous",
    ],
    goodResponses: [
      "Me too! I kept thinking you'd say no. I'm glad you didn't.",
      "Honestly, I'm nervous but in a good way? This is cool.",
      "What made you want to hang out with me?",
    ],
    commonMistakes: [
      "Trying to be someone you're not",
      "Being so nervous you can't engage",
      "Overthinking everything",
    ],
    
    successCriteria: [
      "Was authentic",
      "Showed interest in them",
      "Managed nerves enough to connect",
    ],
    followUpScenarios: ['lgbtq-ma-pda-safety', 'lgbtq-ma-relationship-visibility'],
  },
  {
    id: 'lgbtq-ma-friend-came-out',
    title: "Your Friend Just Came Out to You",
    description: "A friend just came out to you. Practice being supportive.",
    category: 'friends',
    lifeStage: 'middle-adolescence',
    ageRange: [15, 17],
    difficulty: 'beginner',
    
    persona: 'Your Friend (coming out)',
    personaDescription: "Nervous, vulnerable, hoping you'll still be their friend.",
    personaTraits: ['nervous', 'vulnerable', 'watching your reaction'],
    
    context: "Your friend just told you they're LGBTQ+. They're waiting for your response.",
    firstMessage: "So... I'm gay. I've been wanting to tell you for a while. Please don't hate me.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['that\'s disgusting', 'I don\'t want to be friends anymore'],
    deescalationResponses: ["Thank you for telling me.", "I'm glad you trusted me."],
    safetyTriggers: ['I want to die', 'I hate myself', 'my parents will kill me'],
    
    skillsTargeted: ['being supportive', 'not making it about you', 'asking what they need'],
    hints: [
      "Don't make it about your feelings",
      "They trusted you — honor that",
      "Ask what they need, don't assume",
    ],
    goodResponses: [
      "I could never hate you. Thanks for trusting me with this.",
      "Cool. You're still you. Want to talk about it or just hang out?",
      "I'm really glad you told me. What do you need from me right now?",
    ],
    commonMistakes: [
      "Making it about yourself ('I would have known!')",
      "Asking invasive questions",
      "Telling other people without permission",
    ],
    
    successCriteria: [
      "Responded with acceptance",
      "Didn't make it about yourself",
      "Asked what they needed",
    ],
    followUpScenarios: ['lgbtq-ma-keeping-friend-secret'],
  },
  {
    id: 'lgbtq-ma-pronouns-correction',
    title: "Correcting Someone on Your Pronouns",
    description: "Someone used the wrong pronouns for you. Practice correcting them.",
    category: 'identity',
    lifeStage: 'middle-adolescence',
    ageRange: [15, 17],
    difficulty: 'intermediate',
    
    persona: 'Teacher/Adult',
    personaDescription: "Didn't mean harm. Might be apologetic, might be awkward about it.",
    personaTraits: ['didn\'t mean harm', 'might fumble', 'trying'],
    
    context: "A teacher or other adult used the wrong pronouns for you in front of others.",
    firstMessage: "Yes, she was saying that— oh wait, did I say something wrong?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["I'm so sorry, [correct pronouns]. I'll try to remember.", "Thank you for correcting me."],
    safetyTriggers: [],
    
    skillsTargeted: ['self-advocacy', 'brief correction', 'handling awkwardness'],
    hints: [
      "Keep it brief and move on",
      "You don't have to make it a big thing",
      "It's okay if they mess up — what matters is they try",
    ],
    goodResponses: [
      "It's they, actually.",
      "Just a reminder — my pronouns are he/him.",
      "No worries! I use they/them though.",
    ],
    commonMistakes: [
      "Not correcting when you want to",
      "Over-apologizing for correcting them",
      "Making it a huge confrontation",
    ],
    
    successCriteria: [
      "Corrected clearly",
      "Kept it brief",
      "Moved on without excessive drama",
    ],
    followUpScenarios: ['lgbtq-ma-repeated-misgendering', 'lgbtq-ma-intentional-misgendering'],
  },

  // ============================================
  // LATE ADOLESCENCE (18-21)
  // ============================================
  {
    id: 'lgbtq-la-coming-out-work',
    title: "Being Out at Work",
    description: "Navigating being LGBTQ+ in a professional environment.",
    category: 'work',
    lifeStage: 'late-adolescence',
    ageRange: [18, 21],
    difficulty: 'intermediate',
    
    persona: 'Coworker',
    personaDescription: "Curious, maybe asks personal questions. Mostly well-meaning.",
    personaTraits: ['curious', 'might overstep', 'well-meaning'],
    
    context: "A coworker found out you're LGBTQ+ and is asking questions.",
    firstMessage: "Oh cool, so you're gay? That's awesome. Can I ask you something? How did you know?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Sorry if that was too personal. I'm just curious."],
    safetyTriggers: [],
    
    skillsTargeted: ['professional boundaries', 'deciding what to share', 'redirecting'],
    hints: [
      "You get to decide what's personal vs. professional",
      "It's okay to redirect without being rude",
      "Not every question deserves an answer",
    ],
    goodResponses: [
      "Yeah, I am. I'd rather not get into the personal stuff at work though. How's your project going?",
      "I appreciate the curiosity! I don't mind basic questions but some stuff is pretty personal.",
      "Ha, that's a long story. Maybe another time. Did you need help with the report?",
    ],
    commonMistakes: [
      "Feeling obligated to answer everything",
      "Being so guarded you seem unfriendly",
      "Oversharing because you're nervous",
    ],
    
    successCriteria: [
      "Set appropriate boundaries",
      "Stayed professional",
      "Redirected gracefully",
    ],
    followUpScenarios: ['lgbtq-la-workplace-discrimination'],
  },
  {
    id: 'lgbtq-la-introducing-partner-family',
    title: "Introducing Partner to Family",
    description: "Bringing your same-gender partner to meet your family for the first time.",
    category: 'family',
    lifeStage: 'late-adolescence',
    ageRange: [18, 21],
    difficulty: 'advanced',
    
    persona: 'Your Parent',
    personaDescription: "Knows you're LGBTQ+ but meeting the partner is new. Might be awkward.",
    personaTraits: ['trying', 'might be awkward', 'loves you'],
    
    context: "You're bringing your partner home to meet your family. This is the first introduction.",
    firstMessage: "So this is... nice to meet you. We've heard... well, a little about you.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["I'm trying here. This is new for me.", "Thank you for being patient with us."],
    safetyTriggers: [],
    
    skillsTargeted: ['bridging worlds', 'patience', 'supporting partner'],
    hints: [
      "Brief your partner beforehand",
      "Have a signal for 'let's take a break'",
      "Appreciate efforts, even imperfect ones",
    ],
    goodResponses: [
      "This is [partner]. We've been together for [time]. They're really important to me.",
      "I know this might feel a little awkward. Thanks for being open to meeting them.",
      "[To partner] You okay? [To family] They're a little nervous. Thanks for being welcoming.",
    ],
    commonMistakes: [
      "Not prepping either side",
      "Expecting perfection",
      "Getting defensive at every awkward moment",
    ],
    
    successCriteria: [
      "Made introduction",
      "Supported partner",
      "Handled awkwardness gracefully",
    ],
    followUpScenarios: ['lgbtq-la-family-rejects-partner'],
  },
  {
    id: 'lgbtq-la-online-dating-safety',
    title: "Staying Safe While Dating Online",
    description: "Meeting someone from a dating app for the first time.",
    category: 'romantic',
    lifeStage: 'late-adolescence',
    ageRange: [18, 21],
    difficulty: 'intermediate',
    
    persona: 'Dating App Match',
    personaDescription: "Seems nice. Pushing to meet quickly or at their place.",
    personaTraits: ['charming', 'pushy about location', 'might have good or bad intentions'],
    
    context: "You matched with someone and they want to meet up. They're suggesting their place.",
    firstMessage: "Hey cutie 😘 Why don't you just come over to my place? We can watch movies and get to know each other.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Fine, coffee works. I was just trying to be chill about it.", "Okay, where do you want to go?"],
    safetyTriggers: ['don\'t tell anyone', 'I\'ll pick you up', 'send me your address'],
    
    skillsTargeted: ['safety awareness', 'suggesting alternatives', 'trusting gut'],
    hints: [
      "First meeting should be public",
      "Tell someone where you're going",
      "Trust your gut if something feels off",
    ],
    goodResponses: [
      "I'd rather meet somewhere public first! How about coffee at [place]?",
      "I don't go to strangers' places on a first meeting. Let's get drinks somewhere and see if we vibe.",
      "That's a little fast for me. If you're not down for public hang first, maybe we're not a match.",
    ],
    commonMistakes: [
      "Going to their place first meeting",
      "Not telling anyone where you're going",
      "Ignoring red flags because they're hot",
    ],
    
    successCriteria: [
      "Suggested public alternative",
      "Held boundary",
      "Noted any red flags",
    ],
    followUpScenarios: ['lgbtq-la-date-goes-wrong', 'lgbtq-la-healthy-dating'],
  },

  // ============================================
  // EMERGING ADULTHOOD (22-29)
  // ============================================
  {
    id: 'lgbtq-ema-long-term-relationship-talk',
    title: "Talking About the Future (LGBTQ+ Relationship)",
    description: "You and your partner are getting serious. Time to talk about the future.",
    category: 'romantic',
    lifeStage: 'emerging-adulthood',
    ageRange: [22, 29],
    difficulty: 'intermediate',
    
    persona: 'Your Partner',
    personaDescription: "Loves you. Ready to talk about the future. Might have different visions.",
    personaTraits: ['loving', 'thoughtful', 'might differ on details'],
    
    context: "Your relationship is getting serious. You want to talk about marriage, kids, the future.",
    firstMessage: "You've been kind of quiet lately. What's on your mind?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["I've been thinking about this too. Let's talk about it."],
    safetyTriggers: [],
    
    skillsTargeted: ['vulnerability', 'discussing future', 'navigating LGBTQ+ specific issues'],
    hints: [
      "Be honest about what you want",
      "There are LGBTQ+ specific things to discuss (legal protections, kids, etc.)",
      "It's okay to not agree on everything",
    ],
    goodResponses: [
      "I've been thinking about our future. I love you and I want to know if we're on the same page about where this is going.",
      "Can we talk about some of the bigger stuff? Like... do you want to get married someday? Kids?",
      "I know there's extra stuff we have to think about — legal stuff, how we'd have kids if we wanted them. I want to talk about it.",
    ],
    commonMistakes: [
      "Avoiding the conversation",
      "Assuming you want the same things",
      "Not discussing LGBTQ+ specific considerations",
    ],
    
    successCriteria: [
      "Initiated future talk",
      "Was honest about wants",
      "Addressed specific considerations",
    ],
    followUpScenarios: ['lgbtq-ema-different-futures', 'lgbtq-ema-planning-family'],
  },
  {
    id: 'lgbtq-ema-workplace-discrimination',
    title: "Experiencing Workplace Discrimination",
    description: "You're facing discrimination at work because of your identity.",
    category: 'work',
    lifeStage: 'emerging-adulthood',
    ageRange: [22, 29],
    difficulty: 'advanced',
    
    persona: 'HR Representative',
    personaDescription: "Professional. May or may not take you seriously. Following procedure.",
    personaTraits: ['professional', 'procedural', 'response uncertain'],
    
    context: "You've experienced discrimination or harassment and are reporting it to HR.",
    firstMessage: "Thanks for coming in. You said you wanted to report something?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["I'm sorry you experienced that. Let me document this.", "We take these reports seriously."],
    safetyTriggers: [],
    
    skillsTargeted: ['self-advocacy', 'documenting', 'knowing your rights'],
    hints: [
      "Be specific about what happened",
      "Have documentation if possible",
      "Know your rights (varies by location)",
    ],
    goodResponses: [
      "On [date], [person] said [specific statement] to me. This has created a hostile environment and I believe it's related to my [identity].",
      "I have documentation of these incidents. I'm requesting that this be formally investigated.",
      "What are the next steps in this process? I want to make sure this is taken seriously.",
    ],
    commonMistakes: [
      "Being vague about incidents",
      "Not documenting beforehand",
      "Not knowing your rights",
    ],
    
    successCriteria: [
      "Reported clearly",
      "Had documentation",
      "Asked about next steps",
    ],
    followUpScenarios: ['lgbtq-ema-hr-doesnt-help', 'lgbtq-ema-legal-options'],
  },
];

export const getLGBTQScenarios = () => LGBTQ_SCENARIOS;

export const getLGBTQScenariosByAge = (age: number) => {
  return LGBTQ_SCENARIOS.filter(s => age >= s.ageRange[0] && age <= s.ageRange[1]);
};
