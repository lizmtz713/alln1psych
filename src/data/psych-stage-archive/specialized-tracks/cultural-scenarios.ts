// Cultural & Heritage Specialized Roleplay Scenarios
// For first-generation Americans, immigrants, multicultural families
// Navigating identity between cultures, family expectations, and finding belonging

import { RoleplayScenario } from '../roleplay-scenarios';

export const CULTURAL_SCENARIOS: RoleplayScenario[] = [
  // ============================================
  // FAMILY & EXPECTATIONS
  // ============================================
  {
    id: 'cultural-parent-career-expectations',
    title: "When Your Career Dreams Don't Match Family Expectations",
    description: "Your family expects you to be a doctor/lawyer/engineer but you want something else.",
    category: 'family',
    lifeStage: 'middle-adolescence',
    ageRange: [15, 25],
    difficulty: 'advanced',
    
    persona: 'Parent (Traditional Expectations)',
    personaDescription: "Loves you deeply. Sacrificed a lot for your opportunities. Has specific ideas about success.",
    personaTraits: ['loving', 'traditional', 'has sacrificed', 'worried about your future'],
    
    context: "Your parent wants you to pursue a 'safe' career. You want to do something creative, unconventional, or just different.",
    firstMessage: "We didn't come to this country for you to throw away your future. Art degree? How will you survive?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you don\'t understand anything', 'I don\'t care what you think'],
    deescalationResponses: ["I just want you to have a good life.", "Help me understand why this matters to you."],
    safetyTriggers: [],
    
    skillsTargeted: ['honoring sacrifice while choosing your path', 'bridging cultural gaps', 'showing you\'ve thought it through'],
    hints: [
      "Acknowledge their sacrifices — they're real",
      "Show you've researched and have a plan",
      "Find the values underneath their expectations (security, respect, success)",
    ],
    goodResponses: [
      "I know you sacrificed so much for me to have choices. That's exactly why I want to choose something I'm passionate about. Let me show you my plan.",
      "I hear that you want security for me. I want that too. Here's how this path can get me there — it just looks different than what you imagined.",
      "Can I explain why this matters to me? I'm not throwing anything away. I'm building something.",
    ],
    commonMistakes: [
      "Dismissing their sacrifices",
      "Not having a concrete plan",
      "Making it a battle instead of a conversation",
    ],
    
    successCriteria: [
      "Acknowledged their perspective",
      "Showed concrete planning",
      "Stayed respectful while firm",
    ],
    followUpScenarios: ['cultural-parent-still-disapproves', 'cultural-finding-compromise'],
  },
  {
    id: 'cultural-dating-outside-culture',
    title: "Dating Someone Outside Your Culture",
    description: "You're dating someone your family might not approve of because of their background.",
    category: 'romantic',
    lifeStage: 'late-adolescence',
    ageRange: [17, 30],
    difficulty: 'advanced',
    
    persona: 'Parent',
    personaDescription: "Traditional views about who you should marry. Worried about losing cultural connection.",
    personaTraits: ['protective', 'traditional', 'worried about culture loss'],
    
    context: "You need to tell your family you're dating someone outside your culture/religion/ethnicity.",
    firstMessage: "So who is this person you've been spending time with? What family are they from?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you\'re betraying your family', 'what will people say'],
    deescalationResponses: ["Tell me about them as a person.", "I want to meet them."],
    safetyTriggers: ['we\'ll disown you', 'you\'re dead to us'],
    
    skillsTargeted: ['honesty', 'introducing partner as person first', 'handling disapproval'],
    hints: [
      "Lead with who they are as a person, not their background",
      "Be honest rather than hiding",
      "You can't control their reaction, only your integrity",
    ],
    goodResponses: [
      "Their name is [name]. They're [positive qualities]. They treat me really well and I care about them a lot.",
      "I know this might not be what you expected. I want to be honest with you because I respect you.",
      "I understand this is hard. I'm not rejecting our culture — I'm also living my own life. Can you try to know them?",
    ],
    commonMistakes: [
      "Hiding the relationship until it's serious",
      "Being defensive immediately",
      "Dismissing their concerns entirely",
    ],
    
    successCriteria: [
      "Was honest",
      "Presented partner positively",
      "Stayed grounded despite reaction",
    ],
    followUpScenarios: ['cultural-family-refuses-meet', 'cultural-introducing-partner'],
  },
  {
    id: 'cultural-too-american-not-american-enough',
    title: "Feeling 'Too American' at Home, Not American Enough Outside",
    description: "You don't fully belong anywhere. Practice processing and talking about it.",
    category: 'identity',
    lifeStage: 'middle-adolescence',
    ageRange: [12, 25],
    difficulty: 'intermediate',
    
    persona: 'Trusted Friend (different background)',
    personaDescription: "Wants to understand your experience. Asking genuine questions.",
    personaTraits: ['curious', 'caring', 'might not fully get it'],
    
    context: "A friend notices you seem stressed about identity stuff and asks about it.",
    firstMessage: "You seem like you're in your head a lot lately. What's going on? Is it family stuff?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["That sounds really hard.", "I didn't realize you dealt with that."],
    safetyTriggers: ['I don\'t belong anywhere', 'I wish I wasn\'t', 'I hate being'],
    
    skillsTargeted: ['articulating identity struggles', 'vulnerability', 'finding belonging'],
    hints: [
      "It's okay to feel in-between",
      "You don't have to choose one identity",
      "Naming the feeling helps",
    ],
    goodResponses: [
      "It's this thing where I'm 'too American' for my family but not American enough everywhere else. I don't fully fit anywhere.",
      "At home I'm not [culture] enough because I don't know the language perfectly or whatever. But outside, I'm always 'other.' It's exhausting.",
      "I'm trying to figure out who I am when I'm made of different pieces that don't seem to go together.",
    ],
    commonMistakes: [
      "Saying 'it's fine' when it's not",
      "Thinking you have to choose one identity",
      "Not letting yourself feel it",
    ],
    
    successCriteria: [
      "Articulated the struggle",
      "Was vulnerable",
      "Didn't minimize",
    ],
    followUpScenarios: ['cultural-finding-community', 'cultural-embracing-both-and'],
  },
  {
    id: 'cultural-translating-for-parents',
    title: "Being the Family Translator (Language & Culture)",
    description: "You're always the one translating, navigating, explaining. It's a lot.",
    category: 'family',
    lifeStage: 'early-adolescence',
    ageRange: [10, 22],
    difficulty: 'intermediate',
    
    persona: 'Parent (needs translation help)',
    personaDescription: "Depends on you to navigate English/American systems. Doesn't realize the pressure.",
    personaTraits: ['dependent on you', 'grateful', 'doesn\'t see the burden'],
    
    context: "You've been translating/navigating for your family since you were young. Today is another request.",
    firstMessage: "Mijo/mija, I need you to call the insurance company again. They sent another letter I don't understand.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["You're right, it's a lot. I'm sorry.", "What would help you?"],
    safetyTriggers: [],
    
    skillsTargeted: ['setting limits while helping', 'asking for help', 'honoring both needs'],
    hints: [
      "It's okay to feel frustrated AND love your family",
      "You can help AND set limits",
      "This is a real burden, not something to feel guilty about",
    ],
    goodResponses: [
      "I'll help you with this one, but I have homework too. Can we find a time that works for both of us?",
      "I know you need me for this stuff. Sometimes it's a lot though. Can we look into other resources so I'm not the only one?",
      "I want to help. I also feel stressed being the only one who can do this. That's not your fault, it's just real.",
    ],
    commonMistakes: [
      "Never saying no",
      "Feeling guilty for having limits",
      "Exploding instead of communicating",
    ],
    
    successCriteria: [
      "Agreed to help with boundaries",
      "Expressed the burden without blame",
      "Proposed alternatives",
    ],
    followUpScenarios: ['cultural-setting-translation-boundaries', 'cultural-parentification'],
  },
  {
    id: 'cultural-microaggressions-response',
    title: "Responding to Microaggressions",
    description: "Someone said something ignorant about your culture. Practice responding.",
    category: 'conflict',
    lifeStage: 'middle-adolescence',
    ageRange: [12, 35],
    difficulty: 'intermediate',
    
    persona: 'Person Who Said Something Ignorant',
    personaDescription: "Probably didn't mean harm. Clueless. Might get defensive or apologize.",
    personaTraits: ['ignorant', 'might be defensive', 'might apologize'],
    
    context: "Someone said something like 'where are you REALLY from' or made an assumption about your culture.",
    firstMessage: "Wow, your English is so good! Where are you really from?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['why are you being so sensitive', 'it was just a compliment'],
    deescalationResponses: ["Oh, I didn't think about it that way. Sorry.", "I didn't mean to offend you."],
    safetyTriggers: [],
    
    skillsTargeted: ['choosing your response', 'educating vs. protecting energy', 'staying grounded'],
    hints: [
      "You don't have to educate everyone",
      "You can choose how much energy to spend",
      "Your feelings are valid even if they 'didn't mean it'",
    ],
    goodResponses: [
      "I'm from [city]. [End of conversation if you want]",
      "That question is kind of loaded, actually. I'm American. What are you really asking?",
      "I know you didn't mean it this way, but that implies I don't belong here. I was born here.",
      "[Choose to let it go — also valid]",
    ],
    commonMistakes: [
      "Feeling obligated to always educate",
      "Exploding when you're exhausted",
      "Feeling like you handled it 'wrong'",
    ],
    
    successCriteria: [
      "Made a conscious choice (respond or not)",
      "Didn't attack self for response",
      "Stayed grounded",
    ],
    followUpScenarios: ['cultural-they-doubled-down', 'cultural-they-apologized'],
  },
  {
    id: 'cultural-losing-language',
    title: "Feeling Guilty About Losing Your Heritage Language",
    description: "You're losing fluency in your family's language and it feels like losing part of yourself.",
    category: 'identity',
    lifeStage: 'late-adolescence',
    ageRange: [16, 30],
    difficulty: 'intermediate',
    
    persona: 'Grandparent/Elder',
    personaDescription: "Speaks mostly heritage language. Notices you struggling. Might be disappointed or understanding.",
    personaTraits: ['elder', 'heritage keeper', 'might show disappointment'],
    
    context: "You're struggling to communicate with an elder in your heritage language. They noticed.",
    firstMessage: "[In heritage language] You used to speak so well when you were little. What happened?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["It's okay. You're still [culture]. Language can come back.", "I'm glad you still try."],
    safetyTriggers: ['I\'m not really [ethnicity]', 'I\'m a disappointment'],
    
    skillsTargeted: ['self-compassion', 'honoring heritage', 'making amends without shame'],
    hints: [
      "Language loss is often not your fault — it's systemic",
      "You can reconnect at any age",
      "You're still part of your culture",
    ],
    goodResponses: [
      "I know. I'm sorry. I want to practice more. Will you help me?",
      "School and life made it hard to keep up. I miss being able to talk to you easily. Can we try to speak more?",
      "I feel bad about it too. I don't want to lose this connection with you.",
    ],
    commonMistakes: [
      "Deep shame that prevents trying",
      "Avoiding heritage speakers",
      "Thinking it's too late",
    ],
    
    successCriteria: [
      "Acknowledged the loss",
      "Showed desire to reconnect",
      "Didn't spiral in shame",
    ],
    followUpScenarios: ['cultural-learning-language-again', 'cultural-elder-support'],
  },
  {
    id: 'cultural-code-switching-exhaustion',
    title: "Code-Switching Exhaustion",
    description: "You're tired of being different versions of yourself in different spaces.",
    category: 'identity',
    lifeStage: 'late-adolescence',
    ageRange: [16, 35],
    difficulty: 'intermediate',
    
    persona: 'Close Friend (understands)',
    personaDescription: "Either shares your experience or is a safe person to talk to about it.",
    personaTraits: ['understanding', 'safe', 'good listener'],
    
    context: "You're exhausted from constantly adapting. You're talking to someone safe about it.",
    firstMessage: "You seem really tired lately. Not just like sleep tired. What's going on?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["That sounds exhausting.", "I didn't realize you had to do that."],
    safetyTriggers: ['I can\'t do this anymore', 'I want to disappear'],
    
    skillsTargeted: ['naming exhaustion', 'finding safe spaces', 'self-compassion'],
    hints: [
      "Code-switching is a survival skill — and it's exhausting",
      "Finding spaces where you don't have to switch is healing",
      "This exhaustion is real and valid",
    ],
    goodResponses: [
      "I'm just tired of being different people in different places. At home I'm one way, at school another, with different friends another. I never get to just be.",
      "Do you know what code-switching is? I do it constantly. The way I talk, act, even my name sometimes. It's exhausting performing all day.",
      "I need spaces where I can just exist without translating myself. This is one of them. Thanks for being that.",
    ],
    commonMistakes: [
      "Saying 'it's fine' when it's not",
      "Thinking everyone does this equally",
      "Not recognizing the toll",
    ],
    
    successCriteria: [
      "Named the exhaustion",
      "Identified safe spaces",
      "Accepted support",
    ],
    followUpScenarios: ['cultural-reducing-code-switching', 'cultural-finding-your-people'],
  },

  // ============================================
  // IMMIGRATION-SPECIFIC
  // ============================================
  {
    id: 'cultural-immigration-status-fear',
    title: "Living with Immigration Status Anxiety",
    description: "Your status (or family's) creates constant background fear. Practice talking about it.",
    category: 'mental-health',
    lifeStage: 'middle-adolescence',
    ageRange: [12, 30],
    difficulty: 'advanced',
    
    persona: 'Trusted Person (teacher, counselor, friend)',
    personaDescription: "Safe person who wants to support you. Might not fully understand.",
    personaTraits: ['trustworthy', 'wants to help', 'might not fully understand'],
    
    context: "You're struggling with anxiety about your or your family's immigration status. You're talking to someone safe.",
    firstMessage: "I've noticed you seem stressed lately. More than usual. Is there something going on I can help with?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Thank you for trusting me with this.", "That's a huge weight to carry."],
    safetyTriggers: ['what\'s the point', 'we might get deported', 'I can\'t take this'],
    
    skillsTargeted: ['selective disclosure', 'seeking support', 'managing chronic stress'],
    hints: [
      "You get to choose what and how much to share",
      "Support can help even if they can't fix it",
      "This stress is real and valid",
    ],
    goodResponses: [
      "There's stuff with my family's immigration situation that I can't really talk about in detail. But it's scary and it's always in the back of my mind.",
      "I carry this fear that something could happen to my family. It makes it hard to focus on anything else sometimes.",
      "I don't need you to fix it. I just need someone to know why I'm struggling.",
    ],
    commonMistakes: [
      "Disclosing too much to wrong people",
      "Never telling anyone and isolating",
      "Minimizing real fear",
    ],
    
    successCriteria: [
      "Shared appropriately for relationship",
      "Named the impact",
      "Accepted support",
    ],
    followUpScenarios: ['cultural-know-your-rights', 'cultural-immigration-resources'],
  },
  {
    id: 'cultural-first-gen-college',
    title: "Being First-Generation in College",
    description: "You're the first in your family to go to college. No one understands what you're going through.",
    category: 'school',
    lifeStage: 'late-adolescence',
    ageRange: [17, 23],
    difficulty: 'intermediate',
    
    persona: 'Parent',
    personaDescription: "Proud of you but doesn't understand college life. Might have expectations you can't meet.",
    personaTraits: ['proud', 'doesn\'t understand', 'high expectations'],
    
    context: "You're struggling in college with things your family doesn't understand (office hours, networking, mental health days).",
    firstMessage: "Why can't you come home this weekend? You're always so busy. Don't forget why you're there.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['we sacrificed for this', 'you\'re changing'],
    deescalationResponses: ["I just miss you.", "Help me understand what college is like."],
    safetyTriggers: [],
    
    skillsTargeted: ['explaining college culture', 'bridging worlds', 'setting expectations'],
    hints: [
      "They can't understand what they've never experienced",
      "You're not abandoning them by growing",
      "Explain the hidden curriculum of college",
    ],
    goodResponses: [
      "I miss you too. College isn't just classes — there's stuff I have to do to succeed that isn't obvious, like meeting with professors and going to events. I'm not choosing that over you.",
      "I'm not changing who I am. I'm learning new things. I want to share it with you, not leave you behind.",
      "Can I explain how college works? It's different than a job. The extra stuff is actually part of succeeding.",
    ],
    commonMistakes: [
      "Getting frustrated they don't understand",
      "Pulling away from family",
      "Not explaining, just doing",
    ],
    
    successCriteria: [
      "Explained college realities",
      "Maintained connection",
      "Set realistic expectations",
    ],
    followUpScenarios: ['cultural-first-gen-imposter-syndrome', 'cultural-finding-first-gen-community'],
  },
  {
    id: 'cultural-balancing-traditions',
    title: "Balancing Family Traditions with Your Own Life",
    description: "Family traditions and obligations conflict with your personal life/beliefs.",
    category: 'family',
    lifeStage: 'emerging-adulthood',
    ageRange: [18, 35],
    difficulty: 'advanced',
    
    persona: 'Parent/Elder',
    personaDescription: "Holds traditions sacred. Sees your pulling away as rejection.",
    personaTraits: ['traditional', 'hurt by perceived rejection', 'loves you'],
    
    context: "You're trying to balance respecting traditions with living your own life (maybe you don't want to do every holiday ritual, or you have different religious views, etc.).",
    firstMessage: "You're not coming to [traditional event]? This is who we are. Are you ashamed of your family now?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you think you\'re better than us', 'you\'re losing yourself'],
    deescalationResponses: ["I don't want to lose you to this new life.", "Maybe we can find a way."],
    safetyTriggers: [],
    
    skillsTargeted: ['honoring AND differentiating', 'negotiating traditions', 'choosing your practices'],
    hints: [
      "You can honor your heritage on your own terms",
      "Setting boundaries isn't rejection",
      "Find which traditions matter to YOU",
    ],
    goodResponses: [
      "I'm not ashamed. I love our family. I'm also an adult building my own life. Can we find a way I can participate that works for both of us?",
      "Some traditions are really meaningful to me and I want to keep them. Others feel less important. Can we talk about which ones matter most?",
      "I want to be part of this family. I also need space to figure out what I believe. Those aren't opposites.",
    ],
    commonMistakes: [
      "Rejecting all traditions",
      "Following all traditions resentfully",
      "Not explaining your perspective",
    ],
    
    successCriteria: [
      "Expressed love for heritage",
      "Asserted autonomy",
      "Proposed middle ground",
    ],
    followUpScenarios: ['cultural-creating-own-traditions', 'cultural-family-accepts-boundaries'],
  },
];

export const getCulturalScenarios = () => CULTURAL_SCENARIOS;

export const getCulturalScenariosByAge = (age: number) => {
  return CULTURAL_SCENARIOS.filter(s => age >= s.ageRange[0] && age <= s.ageRange[1]);
};
