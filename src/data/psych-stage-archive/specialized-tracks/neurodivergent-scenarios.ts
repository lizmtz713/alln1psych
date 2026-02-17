// Neurodivergent Specialized Roleplay Scenarios
// For people with ADHD, autism, anxiety disorders, and other neurological differences
// Focus on communication, self-advocacy, and navigating a neurotypical world

import { RoleplayScenario } from '../roleplay-scenarios';

export const NEURODIVERGENT_SCENARIOS: RoleplayScenario[] = [
  // ============================================
  // ADHD-SPECIFIC SCENARIOS
  // ============================================
  {
    id: 'nd-adhd-explaining-to-friend',
    title: "Explaining ADHD to a Friend",
    description: "Your friend doesn't understand why you're 'like this.' Practice explaining.",
    category: 'friends',
    lifeStage: 'middle-adolescence',
    ageRange: [13, 25],
    difficulty: 'beginner',
    
    persona: 'Friend (doesn\'t understand ADHD)',
    personaDescription: "Cares about you but frustrated. Has misconceptions about ADHD.",
    personaTraits: ['frustrated', 'misconceptions', 'willing to listen'],
    
    context: "Your friend is annoyed because you forgot plans again or interrupted them. They don't get why you 'can't just try harder.'",
    firstMessage: "This is like the third time you forgot. Can't you just set a reminder or something? It's not that hard.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you\'re just making excuses'],
    deescalationResponses: ["I didn't know that. I'm sorry.", "That makes more sense."],
    safetyTriggers: [],
    
    skillsTargeted: ['self-advocacy', 'explaining without excusing', 'asking for understanding'],
    hints: [
      "Explain without making excuses — ADHD is real AND you're working on it",
      "Give concrete examples of what's hard",
      "Ask for specific accommodations",
    ],
    goodResponses: [
      "I know it's frustrating. ADHD isn't just 'not trying' — my brain literally works differently. Reminders help sometimes, but I also forget to check them. Can we find a system that works for both of us?",
      "I'm not making excuses, but I want you to understand. It's like my brain has 50 tabs open and the one I need keeps getting buried. I'm trying.",
      "What would help is if you texted me day-of to confirm. Would that work for you?",
    ],
    commonMistakes: [
      "Over-apologizing without explaining",
      "Getting defensive",
      "Not suggesting solutions",
    ],
    
    successCriteria: [
      "Explained ADHD clearly",
      "Took responsibility without shame",
      "Proposed accommodation",
    ],
    followUpScenarios: ['nd-adhd-friend-still-frustrated'],
  },
  {
    id: 'nd-adhd-asking-accommodations',
    title: "Asking for ADHD Accommodations at School/Work",
    description: "You need accommodations and have to ask for them.",
    category: 'school',
    lifeStage: 'late-adolescence',
    ageRange: [16, 30],
    difficulty: 'intermediate',
    
    persona: 'Teacher/Boss/HR',
    personaDescription: "Might be supportive or skeptical. Following policy.",
    personaTraits: ['professional', 'might be skeptical', 'has process to follow'],
    
    context: "You need accommodations for ADHD (extended time, written instructions, movement breaks, etc.).",
    firstMessage: "You wanted to talk about something?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['everyone has trouble focusing'],
    deescalationResponses: ["What specifically would help you?", "Let me look into what we can do."],
    safetyTriggers: [],
    
    skillsTargeted: ['self-advocacy', 'being specific', 'professionalism'],
    hints: [
      "Be specific about what you need",
      "Have documentation if required",
      "Frame it as helping you do your best work",
    ],
    goodResponses: [
      "I have ADHD, and I want to do well here. I'm requesting [specific accommodation] because it helps me [specific reason].",
      "I have documentation from my doctor. The main things that help me are [specific, concrete requests].",
      "I'm not asking for less work or lower standards — just adjustments to how I work that help me meet the same expectations.",
    ],
    commonMistakes: [
      "Being too vague ('I just need help')",
      "Not having documentation ready",
      "Apologizing for having needs",
    ],
    
    successCriteria: [
      "Made specific request",
      "Was professional",
      "Had supporting info ready",
    ],
    followUpScenarios: ['nd-adhd-accommodation-denied'],
  },
  {
    id: 'nd-adhd-rejection-sensitivity',
    title: "Handling Rejection Sensitivity (RSD)",
    description: "Someone said something that triggered intense rejection feelings. Practice responding, not reacting.",
    category: 'conflict',
    lifeStage: 'middle-adolescence',
    ageRange: [13, 30],
    difficulty: 'advanced',
    
    persona: 'Friend/Partner/Coworker',
    personaDescription: "Said something that felt critical. Probably didn't mean it as harshly as it landed.",
    personaTraits: ['didn\'t mean harm', 'confused by your reaction'],
    
    context: "Someone gave you feedback or said something that triggered intense rejection feelings.",
    firstMessage: "Hey, I was just saying maybe next time you could... are you okay? You look really upset.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["I didn't mean to upset you. Can we talk about this?"],
    safetyTriggers: ['everyone hates me', 'I should just disappear'],
    
    skillsTargeted: ['emotional regulation', 'communicating needs', 'reality testing'],
    hints: [
      "The feeling is real but the interpretation might not be",
      "It's okay to ask for a minute",
      "Name what's happening without blaming them",
    ],
    goodResponses: [
      "I'm having a big reaction right now. Can I have a minute before we talk about this?",
      "I know logically this is probably not a big deal, but it hit me hard. Give me a second.",
      "I have something called rejection sensitivity — feedback can feel really intense for me even when it's not meant that way. I'm working on it.",
    ],
    commonMistakes: [
      "Lashing out immediately",
      "Shutting down completely",
      "Blaming them for your reaction",
    ],
    
    successCriteria: [
      "Paused before reacting",
      "Communicated what was happening",
      "Didn't attack or shut down",
    ],
    followUpScenarios: ['nd-adhd-repairing-after-rsd'],
  },

  // ============================================
  // AUTISM-SPECIFIC SCENARIOS
  // ============================================
  {
    id: 'nd-autism-explaining-needs',
    title: "Explaining Your Needs as an Autistic Person",
    description: "Someone doesn't understand why you need certain things. Practice explaining.",
    category: 'friends',
    lifeStage: 'middle-adolescence',
    ageRange: [13, 30],
    difficulty: 'beginner',
    
    persona: 'Friend/Family Member',
    personaDescription: "Doesn't understand autism. Might have stereotypes. Willing to learn.",
    personaTraits: ['confused', 'has stereotypes', 'caring'],
    
    context: "Someone questions why you need routine, quiet, or other accommodations.",
    firstMessage: "Why can't you just come to the party? It's not that loud. You're being so antisocial.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you don\'t look autistic', 'everyone gets overwhelmed'],
    deescalationResponses: ["I didn't realize. What would help?", "Sorry, I didn't understand."],
    safetyTriggers: [],
    
    skillsTargeted: ['self-advocacy', 'explaining sensory needs', 'proposing alternatives'],
    hints: [
      "You don't have to justify your needs — but explaining can help",
      "Give concrete examples of what's hard",
      "Propose alternatives that work for you",
    ],
    goodResponses: [
      "For me, loud environments aren't just 'not fun' — they're physically overwhelming. It's like every sound is turned up to 11 and I can't filter anything out.",
      "I want to hang out with you. Can we do something that's not a loud party? Maybe I could come for a little while and leave early?",
      "I'm not antisocial — my brain just processes things differently. Being in crowds drains me in a way it doesn't drain you.",
    ],
    commonMistakes: [
      "Forcing yourself to go when you'll melt down",
      "Over-justifying yourself",
      "Not proposing alternatives",
    ],
    
    successCriteria: [
      "Explained needs clearly",
      "Didn't over-apologize",
      "Proposed alternative",
    ],
    followUpScenarios: ['nd-autism-friend-keeps-pushing'],
  },
  {
    id: 'nd-autism-meltdown-communication',
    title: "Communicating During/After a Meltdown",
    description: "You had or are having a meltdown. Practice communicating what you need.",
    category: 'mental-health',
    lifeStage: 'middle-adolescence',
    ageRange: [11, 30],
    difficulty: 'intermediate',
    
    persona: 'Someone Trying to Help',
    personaDescription: "Wants to help but doesn't know how. Might be doing things that make it worse.",
    personaTraits: ['caring', 'doesn\'t know what to do', 'might overwhelm'],
    
    context: "You're overwhelmed/in meltdown and someone is trying to help in ways that aren't helping.",
    firstMessage: "Oh no, are you okay? What's wrong? Can I get you something? Should I call someone? What do you need?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Okay. I'll be quiet. I'm here when you're ready."],
    safetyTriggers: [],
    
    skillsTargeted: ['communicating needs in crisis', 'asking for space', 'post-meltdown repair'],
    hints: [
      "Short phrases are okay",
      "It's okay to ask for space or silence",
      "You can explain later when you're regulated",
    ],
    goodResponses: [
      "Space. Quiet. Please.",
      "I'm okay. I just need [no talking / dim lights / to be alone / pressure / specific thing].",
      "[Later] I had a meltdown. It wasn't about you. When I'm like that, the most helpful thing is [specific instruction for next time].",
    ],
    commonMistakes: [
      "Trying to force yourself to communicate complex things mid-meltdown",
      "Not ever explaining to people what helps",
      "Feeling ashamed to ask for what you need",
    ],
    
    successCriteria: [
      "Communicated basic needs",
      "Didn't force complex communication",
      "Explained later (if possible)",
    ],
    followUpScenarios: ['nd-autism-creating-meltdown-plan'],
  },
  {
    id: 'nd-autism-social-scripts',
    title: "When Social Scripts Don't Work",
    description: "You're in a social situation and not sure what to say or do.",
    category: 'friends',
    lifeStage: 'early-adolescence',
    ageRange: [11, 25],
    difficulty: 'intermediate',
    
    persona: 'Person in Social Situation',
    personaDescription: "Having a conversation with you. Expects typical social responses.",
    personaTraits: ['friendly', 'following social norms', 'might be confused'],
    
    context: "You're in a social situation (party, lunch, conversation) and not sure how to respond.",
    firstMessage: "So how was your weekend? Did you do anything fun?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["That sounds cool!", "Oh interesting."],
    safetyTriggers: [],
    
    skillsTargeted: ['social reciprocity', 'asking questions', 'authentic engagement'],
    hints: [
      "It's okay to answer honestly even if your weekend was 'boring'",
      "Asking a question back shows interest",
      "You don't have to pretend to be neurotypical",
    ],
    goodResponses: [
      "It was pretty chill. I played video games mostly. How about you?",
      "Honestly nothing exciting, but I like low-key weekends. What did you do?",
      "I reorganized my bookshelf by genre and then subgenre. [Being yourself] What about you?",
    ],
    commonMistakes: [
      "One-word answers that kill conversation",
      "Not asking questions back",
      "Masking so hard you exhaust yourself",
    ],
    
    successCriteria: [
      "Responded to question",
      "Asked reciprocal question",
      "Was authentically yourself",
    ],
    followUpScenarios: ['nd-autism-conversation-going-deeper'],
  },
  {
    id: 'nd-autism-special-interest-sharing',
    title: "Sharing Special Interest Without Overwhelming",
    description: "Someone asked about your special interest. Practice sharing in a social way.",
    category: 'friends',
    lifeStage: 'middle-adolescence',
    ageRange: [11, 30],
    difficulty: 'intermediate',
    
    persona: 'Person Showing Interest',
    personaDescription: "Genuinely curious but might have limited bandwidth. Friendly.",
    personaTraits: ['curious', 'friendly', 'limited bandwidth'],
    
    context: "Someone asked about your special interest. You could talk about it for hours.",
    firstMessage: "Oh you're into [special interest]? That's cool. What's that about?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["That's really interesting!", "I didn't know that."],
    safetyTriggers: [],
    
    skillsTargeted: ['reading cues', 'concise explanation', 'checking in'],
    hints: [
      "Start with the elevator pitch, not the deep lore",
      "Check if they want more before continuing",
      "It's okay to be enthusiastic — just pace yourself",
    ],
    goodResponses: [
      "[Concise exciting summary]. That's the basic idea. Want to know more, or is that enough for now?",
      "Oh I could talk about this forever, so stop me if I go too long. Basically, [short version].",
      "The short version is [summary]. The long version involves [hint at depth]. Which do you want?",
    ],
    commonMistakes: [
      "Info-dumping for 20 minutes",
      "Not checking if they're still interested",
      "Shutting down instead of sharing at all",
    ],
    
    successCriteria: [
      "Gave concise overview",
      "Checked for interest",
      "Showed authentic enthusiasm",
    ],
    followUpScenarios: ['nd-autism-they-want-more', 'nd-autism-they-changed-subject'],
  },

  // ============================================
  // GENERAL NEURODIVERGENT SCENARIOS
  // ============================================
  {
    id: 'nd-disclosing-diagnosis',
    title: "Deciding Whether to Disclose Your Diagnosis",
    description: "Practice thinking through whether to share your diagnosis.",
    category: 'identity',
    lifeStage: 'late-adolescence',
    ageRange: [16, 30],
    difficulty: 'intermediate',
    
    persona: 'New Friend/Date/Coworker',
    personaDescription: "Getting to know you. Might notice you're 'different.' You're deciding what to share.",
    personaTraits: ['curious', 'friendly', 'forming impressions'],
    
    context: "You're getting to know someone and they've noticed you're a bit different. You're deciding whether to explain.",
    firstMessage: "You seem really... I don't know, unique? In a good way. You process things differently than other people I know.",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["That's really interesting. Thanks for sharing.", "That actually explains some things."],
    safetyTriggers: [],
    
    skillsTargeted: ['self-disclosure decisions', 'framing your identity', 'reading safety'],
    hints: [
      "You don't owe anyone your diagnosis",
      "You can share labels or just behaviors/needs",
      "The right people will accept you either way",
    ],
    goodResponses: [
      "Yeah, I'm actually [diagnosis]. It means [brief explanation of what that looks like for you].",
      "Ha, yeah, I've been told that before. My brain works a little differently. Some people call it [diagnosis], I just call it how I am.",
      "I do think differently — I'm not sure I want to put a label on it for you though. Is that okay?",
    ],
    commonMistakes: [
      "Feeling forced to disclose",
      "Over-explaining to justify yourself",
      "Hiding parts of yourself out of shame",
    ],
    
    successCriteria: [
      "Made conscious choice about disclosure",
      "Framed it on your own terms",
      "Didn't over-justify",
    ],
    followUpScenarios: ['nd-they-react-poorly', 'nd-they-react-well'],
  },
  {
    id: 'nd-executive-dysfunction-explain',
    title: "Explaining Executive Dysfunction",
    description: "You couldn't do something that seemed simple. Practice explaining why.",
    category: 'conflict',
    lifeStage: 'middle-adolescence',
    ageRange: [13, 30],
    difficulty: 'intermediate',
    
    persona: 'Parent/Partner/Friend',
    personaDescription: "Frustrated that you didn't do something. Doesn't understand executive dysfunction.",
    personaTraits: ['frustrated', 'confused', 'cares about you'],
    
    context: "You couldn't do something that seemed simple (call, clean, start task). Someone is frustrated.",
    firstMessage: "You've been home all day. How is it possible you couldn't just make one phone call?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you\'re just lazy', 'everyone has to do things they don\'t want to'],
    deescalationResponses: ["That sounds really frustrating. I didn't know.", "What can I do to help?"],
    safetyTriggers: ['I\'m worthless', 'I can\'t do anything right'],
    
    skillsTargeted: ['explaining without excusing', 'self-compassion', 'problem-solving together'],
    hints: [
      "Executive dysfunction isn't laziness — your brain literally can't start the task",
      "Explain the wall between knowing and doing",
      "Suggest accommodations that help",
    ],
    goodResponses: [
      "I know it seems simple. But there's like a wall between knowing I should do it and being able to start. I sat there wanting to do it and couldn't. That's executive dysfunction.",
      "It's not that I didn't want to. My brain couldn't initiate the action. It's a real thing, not an excuse. What helps me is [specific strategy].",
      "I'm frustrated too. Can we figure out a system? Like body doubling — if you sit with me while I start, I can usually do it.",
    ],
    commonMistakes: [
      "Just apologizing without explaining",
      "Saying 'I don't know' and shutting down",
      "Internalizing that you're lazy",
    ],
    
    successCriteria: [
      "Explained executive dysfunction",
      "Didn't self-attack",
      "Proposed solution",
    ],
    followUpScenarios: ['nd-they-dont-believe-you', 'nd-building-systems'],
  },
  {
    id: 'nd-sensory-overwhelm-public',
    title: "Managing Sensory Overwhelm in Public",
    description: "You're in public and getting overwhelmed. Practice communicating and coping.",
    category: 'mental-health',
    lifeStage: 'early-adolescence',
    ageRange: [11, 30],
    difficulty: 'intermediate',
    
    persona: 'Friend You\'re With',
    personaDescription: "Doesn't realize you're struggling. Having a good time.",
    personaTraits: ['oblivious', 'friendly', 'will help if asked'],
    
    context: "You're in a loud/crowded/bright place and getting overwhelmed. Your friend doesn't notice.",
    firstMessage: "Isn't this great?! Oh look, let's go check out that thing over there!",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Oh, are you okay? What do you need?", "Let's find somewhere quiet."],
    safetyTriggers: [],
    
    skillsTargeted: ['asking for what you need', 'self-awareness', 'preventing meltdown'],
    hints: [
      "It's better to ask for a break before you crash",
      "You can be honest without ruining their fun",
      "Have an exit plan before you need it",
    ],
    goodResponses: [
      "Hey, I'm getting kind of overwhelmed. Can we find somewhere quieter for a few minutes?",
      "I need a break from the noise. Can we step outside? I'll be okay, I just need to regulate.",
      "I'm hitting my limit. I might need to head out soon, but you can stay if you want.",
    ],
    commonMistakes: [
      "Pushing through until you melt down",
      "Not telling anyone you're struggling",
      "Feeling like you're ruining things",
    ],
    
    successCriteria: [
      "Recognized signs early",
      "Asked for what you needed",
      "Didn't push to meltdown",
    ],
    followUpScenarios: ['nd-friend-annoyed', 'nd-successful-regulation'],
  },
  {
    id: 'nd-unmasking',
    title: "Starting to Unmask with Safe People",
    description: "Practice being more authentically yourself instead of masking.",
    category: 'identity',
    lifeStage: 'late-adolescence',
    ageRange: [16, 35],
    difficulty: 'advanced',
    
    persona: 'Safe Friend',
    personaDescription: "Someone you trust who has shown acceptance. Safe to be yourself with.",
    personaTraits: ['accepting', 'curious', 'safe'],
    
    context: "You're with someone safe and trying to be more authentically yourself instead of masking.",
    firstMessage: "You seem different today. More relaxed maybe? In a good way.",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["I like this version of you.", "You can be yourself with me."],
    safetyTriggers: [],
    
    skillsTargeted: ['authenticity', 'vulnerability', 'unmasking'],
    hints: [
      "You don't have to unmask all at once",
      "The right people will appreciate the real you",
      "Stimming, info-dumping, being 'weird' — it's all okay with safe people",
    ],
    goodResponses: [
      "Yeah, I'm trying to mask less around you. This is more what I'm like naturally. Is that okay?",
      "I usually work really hard to seem 'normal.' With you, I'm trying to just be me.",
      "Can I just... stim without hiding it? And talk about my interests without filtering? I trust you.",
    ],
    commonMistakes: [
      "Unmasking with unsafe people",
      "All-or-nothing (mask completely or not at all)",
      "Feeling shame about your authentic self",
    ],
    
    successCriteria: [
      "Showed authentic behaviors",
      "Communicated about unmasking",
      "Didn't apologize for being yourself",
    ],
    followUpScenarios: ['nd-friend-accepts', 'nd-expanding-unmasking'],
  },
];

export const getNeurodivergentScenarios = () => NEURODIVERGENT_SCENARIOS;

export const getNeurodivergentScenariosByAge = (age: number) => {
  return NEURODIVERGENT_SCENARIOS.filter(s => age >= s.ageRange[0] && age <= s.ageRange[1]);
};

export const getADHDScenarios = () => {
  return NEURODIVERGENT_SCENARIOS.filter(s => s.id.includes('adhd'));
};

export const getAutismScenarios = () => {
  return NEURODIVERGENT_SCENARIOS.filter(s => s.id.includes('autism'));
};
