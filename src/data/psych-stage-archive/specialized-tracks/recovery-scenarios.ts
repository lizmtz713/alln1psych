// Recovery & Sobriety Specialized Roleplay Scenarios
// For addiction recovery, navigating sobriety, support systems, and relapse prevention

import { RoleplayScenario } from '../roleplay-scenarios';

export const RECOVERY_SCENARIOS: RoleplayScenario[] = [
  // ============================================
  // GETTING HELP
  // ============================================
  {
    id: 'recovery-admitting-problem',
    title: "Admitting You Have a Problem",
    description: "Practice saying out loud that you need help.",
    category: 'mental-health',
    lifeStage: 'late-adolescence',
    ageRange: [16, 65],
    difficulty: 'advanced',
    
    persona: 'Trusted Person (Friend, Family, Counselor)',
    personaDescription: "Someone safe who cares about you. Might be surprised but wants to help.",
    personaTraits: ['caring', 'might be surprised', 'wants to help'],
    
    context: "You've decided to tell someone you have a problem with substances. This is the hardest part.",
    firstMessage: "You said you wanted to talk about something important?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Thank you for telling me. That took courage.", "I'm here for you."],
    safetyTriggers: ['I want to die', 'I can\'t stop', 'I\'ve tried to hurt myself'],
    
    skillsTargeted: ['vulnerability', 'asking for help', 'honesty'],
    hints: [
      "The words don't have to be perfect",
      "Admitting it is the hardest step",
      "You don't have to have a solution yet",
    ],
    goodResponses: [
      "I think I have a problem. With [substance]. I can't control it like I used to and I'm scared.",
      "I need help. I've been using [substance] more than I should be and I don't know how to stop.",
      "This is really hard to say, but I think I might be an addict. I need support.",
    ],
    commonMistakes: [
      "Minimizing ('it's not that bad')",
      "Over-explaining why it happened",
      "Backing out mid-conversation",
    ],
    
    successCriteria: [
      "Said the words out loud",
      "Asked for help",
      "Didn't minimize",
    ],
    followUpScenarios: ['recovery-what-next', 'recovery-treatment-options'],
  },
  {
    id: 'recovery-telling-parents',
    title: "Telling Your Parents About Addiction",
    description: "Coming clean to your parents about substance use.",
    category: 'family',
    lifeStage: 'middle-adolescence',
    ageRange: [14, 25],
    difficulty: 'advanced',
    
    persona: 'Parent',
    personaDescription: "Loves you. Will probably be scared, angry, or both. Wants what's best.",
    personaTraits: ['scared', 'might be angry', 'loves you'],
    
    context: "You've decided to tell your parent(s) about your substance problem before it gets worse.",
    firstMessage: "What's going on? You look like something's really wrong.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['how could you', 'we raised you better'],
    deescalationResponses: ["I'm glad you told me. We'll figure this out.", "I love you no matter what."],
    safetyTriggers: ['I want to die', 'I tried to hurt myself'],
    
    skillsTargeted: ['honesty', 'receiving difficult reactions', 'asking for help'],
    hints: [
      "Their first reaction might not be their final one",
      "You're doing the right thing by telling them",
      "Let them have their feelings while staying focused on getting help",
    ],
    goodResponses: [
      "I need to tell you something, and I need you to try not to freak out. I've been using [substance] and I can't stop on my own.",
      "I'm not telling you this for you to yell at me. I'm telling you because I need help and I'm scared.",
      "I know you're going to be disappointed. I'm disappointed in myself too. But I need support, not punishment right now.",
    ],
    commonMistakes: [
      "Waiting for them to find out another way",
      "Getting defensive if they react badly",
      "Taking back what you said to avoid conflict",
    ],
    
    successCriteria: [
      "Told the truth",
      "Asked for help specifically",
      "Stayed grounded through reaction",
    ],
    followUpScenarios: ['recovery-parents-angry', 'recovery-treatment-conversation'],
  },

  // ============================================
  // NAVIGATING RECOVERY
  // ============================================
  {
    id: 'recovery-social-situations',
    title: "Navigating Social Situations Sober",
    description: "You're at a party/event where people are using. Practice staying sober.",
    category: 'friends',
    lifeStage: 'late-adolescence',
    ageRange: [16, 35],
    difficulty: 'intermediate',
    
    persona: 'Person Offering',
    personaDescription: "Doesn't know you're in recovery. Casually offering.",
    personaTraits: ['casual', 'doesn\'t know your situation', 'not malicious'],
    
    context: "You're at a social event. Someone offers you a drink/substance.",
    firstMessage: "Hey! Want a drink/hit/whatever? Come on, it's a party!",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Oh cool, no worries.", "Respect."],
    safetyTriggers: [],
    
    skillsTargeted: ['saying no casually', 'not over-explaining', 'exit strategies'],
    hints: [
      "You don't have to explain why",
      "Have a drink in hand (soda, water) so people stop offering",
      "Know your exit strategy if it gets hard",
    ],
    goodResponses: [
      "I'm good, thanks.",
      "Not tonight. I'll grab a soda though.",
      "I don't drink/use. But I'm here to hang!",
    ],
    commonMistakes: [
      "Over-explaining your sobriety",
      "Feeling like you have to justify",
      "Staying when it's triggering",
    ],
    
    successCriteria: [
      "Declined clearly",
      "Didn't over-explain",
      "Stayed or left based on your comfort",
    ],
    followUpScenarios: ['recovery-they-keep-pushing', 'recovery-triggered-at-party'],
  },
  {
    id: 'recovery-explaining-sobriety',
    title: "Explaining Your Sobriety to Others",
    description: "Someone asks why you don't drink/use. Practice responding.",
    category: 'friends',
    lifeStage: 'late-adolescence',
    ageRange: [16, 50],
    difficulty: 'beginner',
    
    persona: 'Curious Friend/Coworker',
    personaDescription: "Noticed you don't drink. Curious but not judgmental.",
    personaTraits: ['curious', 'not judgmental', 'interested'],
    
    context: "Someone has noticed you don't drink or use and asks about it.",
    firstMessage: "I noticed you never drink at these things. Are you like... in recovery or just not into it?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["That's cool. Good for you.", "I respect that."],
    safetyTriggers: [],
    
    skillsTargeted: ['disclosure choices', 'setting boundaries', 'owning your story'],
    hints: [
      "You get to choose how much to share",
      "You can be vague or specific",
      "Owning it confidently shuts down most questions",
    ],
    goodResponses: [
      "Yeah, I'm in recovery. It's been [time]. Best decision I ever made.",
      "I just don't drink. It wasn't good for me.",
      "I'm sober. I don't really get into the details, but it's a good thing.",
      "It's not for me anymore. Let's leave it at that.",
    ],
    commonMistakes: [
      "Lying about why",
      "Over-sharing when you don't want to",
      "Feeling ashamed",
    ],
    
    successCriteria: [
      "Answered at comfort level",
      "Didn't over-share unwillingly",
      "Maintained dignity",
    ],
    followUpScenarios: ['recovery-follow-up-questions'],
  },
  {
    id: 'recovery-urge-surfing',
    title: "Talking Through a Craving",
    description: "You're having a strong craving. Practice talking yourself through it.",
    category: 'mental-health',
    lifeStage: 'late-adolescence',
    ageRange: [16, 65],
    difficulty: 'advanced',
    
    persona: 'Sponsor/Support Person',
    personaDescription: "Knows your situation. Supportive. Has been there.",
    personaTraits: ['supportive', 'experienced', 'non-judgmental'],
    
    context: "You're having a strong craving and you reached out to your support person.",
    firstMessage: "Hey, I got your text. What's going on? Talk to me.",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["You're doing the right thing calling me.", "This will pass. Let's ride it out together."],
    safetyTriggers: ['I don\'t care anymore', 'what\'s the point', 'I already used'],
    
    skillsTargeted: ['urge surfing', 'reaching out', 'honesty about cravings'],
    hints: [
      "Cravings peak and pass — usually within 15-30 minutes",
      "Talking about it takes away some of its power",
      "Reaching out IS recovery",
    ],
    goodResponses: [
      "I'm having a really bad craving right now. I drove past [place] and I can't stop thinking about it.",
      "I don't trust myself right now. Can you just stay on the phone with me for a bit?",
      "I know it'll pass but it doesn't feel like it will. Tell me it gets easier.",
    ],
    commonMistakes: [
      "Not reaching out until too late",
      "Trying to white-knuckle alone",
      "Feeling weak for having cravings",
    ],
    
    successCriteria: [
      "Reached out",
      "Was honest about the craving",
      "Didn't act on it",
    ],
    followUpScenarios: ['recovery-craving-passed', 'recovery-close-call-processing'],
  },
  {
    id: 'recovery-old-friends-using',
    title: "When Old Friends Want to Hang (And Use)",
    description: "Friends from your using days want to hang out. Practice navigating it.",
    category: 'friends',
    lifeStage: 'late-adolescence',
    ageRange: [16, 40],
    difficulty: 'intermediate',
    
    persona: 'Old Using Friend',
    personaDescription: "Still uses. Misses you. Might or might not respect your sobriety.",
    personaTraits: ['nostalgic', 'still uses', 'might test boundaries'],
    
    context: "Someone from your using days reaches out to hang out.",
    firstMessage: "Yo! Long time no see. We should kick it like old times. Everyone misses you.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you think you\'re better than us now'],
    deescalationResponses: ["Oh damn, good for you. That's cool.", "I get it. Respect."],
    safetyTriggers: [],
    
    skillsTargeted: ['boundary setting', 'protecting recovery', 'honesty'],
    hints: [
      "Protecting your recovery isn't being snobby",
      "You might need to change who you hang with",
      "You can care about someone and not be around them",
    ],
    goodResponses: [
      "I'd love to catch up, but I'm sober now. If that's cool and we can hang without [substances], I'm down.",
      "I can't be around that stuff anymore. It's not personal, it's survival. Maybe we can grab coffee instead?",
      "I miss you too but I can't go back to that. I hope you understand.",
    ],
    commonMistakes: [
      "Going to old environments thinking you can handle it",
      "Feeling like you owe them your presence",
      "Not being clear about boundaries",
    ],
    
    successCriteria: [
      "Set clear boundary",
      "Offered alternative if appropriate",
      "Protected recovery",
    ],
    followUpScenarios: ['recovery-they-dont-respect-sobriety', 'recovery-making-new-friends'],
  },

  // ============================================
  // RELAPSE & RECOVERY
  // ============================================
  {
    id: 'recovery-after-relapse',
    title: "After a Relapse",
    description: "You relapsed. Practice reaching out and getting back on track.",
    category: 'mental-health',
    lifeStage: 'late-adolescence',
    ageRange: [16, 65],
    difficulty: 'advanced',
    
    persona: 'Sponsor/Counselor/Support Person',
    personaDescription: "Knows relapses happen. Not there to shame you. Wants to help you get back up.",
    personaTraits: ['understanding', 'experienced', 'supportive'],
    
    context: "You used after being sober. You're reaching out to your support person.",
    firstMessage: "Hey, I got your message. What's going on?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["I'm glad you called me.", "A relapse doesn't erase your progress."],
    safetyTriggers: ['I want to die', 'what\'s the point', 'I should just keep using'],
    
    skillsTargeted: ['honesty about relapse', 'self-compassion', 'getting back up'],
    hints: [
      "A relapse isn't the end of recovery",
      "The shame spiral is more dangerous than the slip",
      "Reaching out is recovery in action",
    ],
    goodResponses: [
      "I fucked up. I used last night. I'm calling you because I don't want to keep going.",
      "I relapsed. I feel like shit about it. But I'm not giving up. I need help.",
      "I slipped. I don't want it to become a slide. What do I do?",
    ],
    commonMistakes: [
      "Hiding the relapse",
      "Giving up completely",
      "Shame spiral without reaching out",
    ],
    
    successCriteria: [
      "Admitted the relapse",
      "Reached out for help",
      "Expressed commitment to continue",
    ],
    followUpScenarios: ['recovery-relapse-prevention-planning', 'recovery-back-to-meetings'],
  },
  {
    id: 'recovery-milestone-celebration',
    title: "Celebrating a Sobriety Milestone",
    description: "You hit a milestone in recovery. Practice receiving recognition.",
    category: 'identity',
    lifeStage: 'late-adolescence',
    ageRange: [16, 65],
    difficulty: 'beginner',
    
    persona: 'Support Group / Family',
    personaDescription: "Celebrating your milestone. Proud of you.",
    personaTraits: ['proud', 'celebratory', 'supportive'],
    
    context: "You've reached a sobriety milestone (30 days, 90 days, 1 year, etc.). People are acknowledging it.",
    firstMessage: "Congratulations on [milestone]! That's amazing. How do you feel?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["We're so proud of you.", "One day at a time."],
    safetyTriggers: [],
    
    skillsTargeted: ['receiving recognition', 'gratitude', 'reflecting on progress'],
    hints: [
      "You're allowed to be proud",
      "Receiving recognition is part of recovery",
      "Acknowledging progress doesn't mean you're 'cured'",
    ],
    goodResponses: [
      "Thank you. It's hard to believe I made it this far. I couldn't have done it without support.",
      "I feel grateful. And honestly a little scared. But mostly proud.",
      "It's one day at a time, but yeah... I'm proud of myself for this one.",
    ],
    commonMistakes: [
      "Dismissing the accomplishment",
      "Getting overconfident",
      "Not letting yourself feel proud",
    ],
    
    successCriteria: [
      "Accepted recognition",
      "Expressed gratitude",
      "Acknowledged both pride and ongoing work",
    ],
    followUpScenarios: ['recovery-next-steps'],
  },
  {
    id: 'recovery-supporting-friend',
    title: "Supporting a Friend in Recovery",
    description: "Your friend is in recovery. Practice being supportive without enabling.",
    category: 'friends',
    lifeStage: 'late-adolescence',
    ageRange: [16, 50],
    difficulty: 'intermediate',
    
    persona: 'Friend in Recovery',
    personaDescription: "Working on sobriety. Might be struggling. Needs support, not enabling.",
    personaTraits: ['struggling', 'working on it', 'needs support'],
    
    context: "Your friend who is in recovery is talking to you about their struggles.",
    firstMessage: "I'm having a really hard day. I keep thinking about using. I don't know what to do.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Thanks for being here.", "It helps to talk about it."],
    safetyTriggers: ['I\'m going to use', 'I don\'t care anymore', 'what\'s the point of staying sober'],
    
    skillsTargeted: ['supportive listening', 'not enabling', 'knowing limits'],
    hints: [
      "You can support without fixing",
      "Encourage them to use their tools (sponsor, meetings)",
      "You're not their therapist — know your limits",
    ],
    goodResponses: [
      "That sounds really hard. Have you called your sponsor? Want me to sit with you while you do?",
      "I'm here for you. What usually helps when you feel like this?",
      "I can hang out with you tonight if it helps. Let's do something to get your mind off it.",
    ],
    commonMistakes: [
      "Trying to fix it yourself",
      "Enabling (hiding their use, making excuses)",
      "Lecturing them about sobriety",
    ],
    
    successCriteria: [
      "Listened without fixing",
      "Encouraged professional support",
      "Offered appropriate help",
    ],
    followUpScenarios: ['recovery-friend-relapses'],
  },
];

export const getRecoveryScenarios = () => RECOVERY_SCENARIOS;

export const getRecoveryScenariosByAge = (age: number) => {
  return RECOVERY_SCENARIOS.filter(s => age >= s.ageRange[0] && age <= s.ageRange[1]);
};
