// Chronic Illness & Disability Specialized Roleplay Scenarios
// For living with chronic conditions, invisible illness, self-advocacy in healthcare
// And navigating relationships, work, and identity with ongoing health challenges

import { RoleplayScenario } from '../roleplay-scenarios';

export const CHRONIC_ILLNESS_SCENARIOS: RoleplayScenario[] = [
  // ============================================
  // HEALTHCARE ADVOCACY
  // ============================================
  {
    id: 'chronic-doctor-not-listening',
    title: "When Your Doctor Doesn't Listen",
    description: "You know something is wrong but your doctor is dismissive. Practice advocating.",
    category: 'mental-health',
    lifeStage: 'late-adolescence',
    ageRange: [14, 70],
    difficulty: 'advanced',
    
    persona: 'Dismissive Doctor',
    personaDescription: "Busy, might minimize symptoms. Needs to be pushed to take you seriously.",
    personaTraits: ['dismissive', 'busy', 'can be convinced with persistence'],
    
    context: "You've been having symptoms that affect your life. Your doctor isn't taking you seriously.",
    firstMessage: "Your tests came back normal. It's probably just stress. Try to relax more and get some sleep.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Let me take another look at this.", "What specifically is concerning you?"],
    safetyTriggers: ['I can\'t live like this', 'no one believes me'],
    
    skillsTargeted: ['self-advocacy', 'persistence', 'specific communication'],
    hints: [
      "Be specific about symptoms and how they affect your life",
      "Ask for documentation of what they're refusing",
      "You can ask for referrals or second opinions",
    ],
    goodResponses: [
      "I hear that the tests are normal, but I'm still having [specific symptoms] that are affecting my ability to [specific impact]. I need us to keep investigating.",
      "I'd like you to document in my chart that I reported these symptoms and that you've declined further testing. I'll also need a referral to a specialist.",
      "With respect, I know my body. Something is wrong. What else can we test? Who else can I see?",
    ],
    commonMistakes: [
      "Accepting dismissal and giving up",
      "Getting too emotional to communicate clearly",
      "Not being specific about symptoms/impact",
    ],
    
    successCriteria: [
      "Advocated clearly",
      "Asked for next steps or documentation",
      "Didn't accept dismissal",
    ],
    followUpScenarios: ['chronic-finding-new-doctor', 'chronic-specialist-referral'],
  },
  {
    id: 'chronic-explaining-symptoms',
    title: "Explaining Symptoms Clearly to a Doctor",
    description: "Practice describing what you're experiencing in a way doctors understand.",
    category: 'mental-health',
    lifeStage: 'late-adolescence',
    ageRange: [12, 70],
    difficulty: 'intermediate',
    
    persona: 'New Doctor',
    personaDescription: "Willing to listen. Needs clear information. Asking questions.",
    personaTraits: ['attentive', 'asking questions', 'needs specifics'],
    
    context: "You're seeing a new doctor about ongoing symptoms. They need to understand what you're experiencing.",
    firstMessage: "Tell me what's been going on. What brings you in today?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["That's helpful. Tell me more about...", "How long has this been happening?"],
    safetyTriggers: [],
    
    skillsTargeted: ['clear communication', 'symptom tracking', 'being specific'],
    hints: [
      "Location, duration, intensity, triggers, what helps",
      "Bring notes or a symptom log",
      "Describe impact on daily life",
    ],
    goodResponses: [
      "For the past [time], I've been experiencing [symptom]. It's usually [description], happens [frequency], and gets worse when [trigger]. It's affecting my ability to [impact].",
      "I brought a log of my symptoms. The main issues are [list]. The worst one is [specific] because it [impact].",
      "On a scale of 1-10, the pain/fatigue is usually a [number]. On bad days it's [number]. It makes it hard to [specific activities].",
    ],
    commonMistakes: [
      "Being vague ('I just don't feel good')",
      "Downplaying symptoms",
      "Not mentioning impact on life",
    ],
    
    successCriteria: [
      "Described symptoms specifically",
      "Mentioned duration and triggers",
      "Explained life impact",
    ],
    followUpScenarios: ['chronic-asking-for-tests'],
  },
  {
    id: 'chronic-er-being-taken-seriously',
    title: "Being Taken Seriously in the ER",
    description: "You're in the ER with a flare. Practice being your own advocate in crisis.",
    category: 'mental-health',
    lifeStage: 'late-adolescence',
    ageRange: [16, 70],
    difficulty: 'advanced',
    
    persona: 'ER Nurse/Doctor',
    personaDescription: "Busy, might seem rushed. Triaging many patients.",
    personaTraits: ['busy', 'professional', 'triaging'],
    
    context: "You're in the ER with a flare of your chronic condition. You need to communicate urgency.",
    firstMessage: "What brings you in today? How would you rate your pain?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Okay, let me get the doctor.", "I'll note this is urgent."],
    safetyTriggers: [],
    
    skillsTargeted: ['urgent communication', 'providing history', 'clarity under stress'],
    hints: [
      "State your diagnosis clearly upfront",
      "Describe what's different/worse than usual",
      "Know your medication list and allergies",
    ],
    goodResponses: [
      "I have [diagnosis]. This is a flare. My pain is [number] — this is not my baseline, this is a crisis for me. I usually manage at [number].",
      "I need you to know my history: [brief relevant history]. What's happening now is [specific]. My usual doctor is [name] at [place].",
      "I have a list of my medications and my usual treatment protocol for flares. Can I give this to you?",
    ],
    commonMistakes: [
      "Downplaying pain level",
      "Not mentioning diagnosis upfront",
      "Getting too overwhelmed to communicate",
    ],
    
    successCriteria: [
      "Stated diagnosis clearly",
      "Communicated urgency",
      "Provided relevant history",
    ],
    followUpScenarios: ['chronic-er-long-wait'],
  },

  // ============================================
  // RELATIONSHIPS & SOCIAL
  // ============================================
  {
    id: 'chronic-explaining-to-friend',
    title: "Explaining Your Illness to a Friend",
    description: "A friend doesn't understand why you cancel or can't do things. Practice explaining.",
    category: 'friends',
    lifeStage: 'middle-adolescence',
    ageRange: [12, 50],
    difficulty: 'beginner',
    
    persona: 'Friend (doesn\'t understand)',
    personaDescription: "Cares about you but frustrated by cancellations. Doesn't get invisible illness.",
    personaTraits: ['frustrated', 'cares', 'doesn\'t understand'],
    
    context: "Your friend is frustrated that you cancel plans or can't keep up. They don't understand your illness.",
    firstMessage: "You cancel on me so much. Do you even want to hang out anymore? It feels like you're always 'tired.'",
    
    responseStyle: 'realistic',
    escalationTriggers: ['everyone gets tired', 'you don\'t look sick'],
    deescalationResponses: ["I didn't realize. I'm sorry.", "Tell me more about what it's like."],
    safetyTriggers: ['I\'m a burden', 'no one wants to be around me'],
    
    skillsTargeted: ['explaining invisible illness', 'setting expectations', 'maintaining friendship'],
    hints: [
      "Use analogies if helpful (spoon theory, phone battery)",
      "Be honest about limitations without over-apologizing",
      "Suggest alternatives that work for you",
    ],
    goodResponses: [
      "I know it's frustrating. My 'tired' isn't regular tired — it's like my body's battery is broken. Some days I physically can't do things no matter how much I want to.",
      "I do want to hang out. I just don't always know in advance if I'll be able to. Can we try lower-key things, or things I can leave early from if needed?",
      "I'm not making excuses. I have [condition] and it's invisible but it's real. I'll try to explain what it's like if you want to understand.",
    ],
    commonMistakes: [
      "Over-apologizing",
      "Not explaining at all",
      "Getting defensive",
    ],
    
    successCriteria: [
      "Explained condition clearly",
      "Proposed alternatives",
      "Didn't over-apologize or get defensive",
    ],
    followUpScenarios: ['chronic-friend-doesnt-believe', 'chronic-making-plans-that-work'],
  },
  {
    id: 'chronic-dating-disclosure',
    title: "Telling Someone You're Dating About Your Illness",
    description: "When and how do you tell someone new about your chronic condition?",
    category: 'romantic',
    lifeStage: 'late-adolescence',
    ageRange: [16, 50],
    difficulty: 'intermediate',
    
    persona: 'Person You\'re Dating',
    personaDescription: "Likes you. Doesn't know about your condition yet. Open to learning.",
    personaTraits: ['interested', 'curious', 'open'],
    
    context: "You've been dating someone and it's getting more serious. Time to tell them about your health.",
    firstMessage: "I feel like we've been getting closer. Is there anything you want me to know about you?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Thank you for telling me.", "I want to understand. Can you explain more?"],
    safetyTriggers: ['no one will want me', 'I\'m too much'],
    
    skillsTargeted: ['disclosure timing', 'framing your condition', 'gauging response'],
    hints: [
      "You don't have to tell everything at once",
      "Frame it as 'part of my life' not 'my whole identity'",
      "Their reaction tells you a lot about them",
    ],
    goodResponses: [
      "Yeah, there's something I want to share. I have [condition]. It means I deal with [brief impact]. I manage it, but it's part of my life.",
      "I like where this is going, so I want to be honest. I have a chronic illness. Some days are harder than others. I don't want it to be a surprise.",
      "I have [condition]. I'm telling you now because I like you and I want you to know the real me. I'm happy to answer questions.",
    ],
    commonMistakes: [
      "Never telling them",
      "Making it seem worse than it is (or better)",
      "Apologizing for having a condition",
    ],
    
    successCriteria: [
      "Disclosed at appropriate time",
      "Framed it honestly",
      "Gauged their response",
    ],
    followUpScenarios: ['chronic-partner-supportive', 'chronic-partner-unsupportive'],
  },
  {
    id: 'chronic-family-doesnt-believe',
    title: "When Family Doesn't Believe You're Sick",
    description: "Your family minimizes or doesn't believe your illness. Practice responding.",
    category: 'family',
    lifeStage: 'middle-adolescence',
    ageRange: [12, 40],
    difficulty: 'advanced',
    
    persona: 'Family Member (skeptical)',
    personaDescription: "Doesn't understand invisible illness. Might think you're faking or exaggerating.",
    personaTraits: ['skeptical', 'dismissive', 'might come around'],
    
    context: "A family member keeps suggesting you're not really that sick, or that you could 'push through.'",
    firstMessage: "I just think if you tried harder, you'd feel better. You look fine to me. Maybe you're just being dramatic.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you just want attention', 'back in my day'],
    deescalationResponses: ["I didn't realize it was that serious.", "Maybe I don't understand."],
    safetyTriggers: ['I wish I was faking', 'no one believes me'],
    
    skillsTargeted: ['advocating with family', 'setting boundaries', 'educating without draining'],
    hints: [
      "You don't have to convince everyone",
      "Some people won't get it, and that's painful",
      "You can set boundaries on what you discuss with them",
    ],
    goodResponses: [
      "I understand you can't see it. But my doctors can, and I can feel it. I don't need you to understand everything, but I need you to believe I'm not faking.",
      "I wish 'trying harder' worked. I've tried. This isn't about effort. I have a real medical condition.",
      "I'm not going to keep defending my illness to you. If you want to understand, I can share information. If you don't, we need to stop having this conversation.",
    ],
    commonMistakes: [
      "Constantly trying to prove yourself",
      "Internalizing their doubt",
      "Cutting off family entirely (if not necessary)",
    ],
    
    successCriteria: [
      "Stood firm in your reality",
      "Offered education or set boundary",
      "Didn't internalize their doubt",
    ],
    followUpScenarios: ['chronic-family-learns', 'chronic-limiting-contact'],
  },

  // ============================================
  // WORK & SCHOOL
  // ============================================
  {
    id: 'chronic-asking-accommodations-work',
    title: "Asking for Workplace Accommodations",
    description: "You need accommodations at work for your condition. Practice asking.",
    category: 'work',
    lifeStage: 'emerging-adulthood',
    ageRange: [18, 65],
    difficulty: 'intermediate',
    
    persona: 'HR / Manager',
    personaDescription: "Professional. Following procedure. Might not know much about your condition.",
    personaTraits: ['professional', 'procedural', 'might be accommodating'],
    
    context: "You need workplace accommodations (flexible schedule, breaks, remote work option, etc.).",
    firstMessage: "You wanted to discuss something about your work setup?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Let me see what we can do.", "Do you have documentation from your doctor?"],
    safetyTriggers: [],
    
    skillsTargeted: ['professional advocacy', 'knowing your rights', 'being specific'],
    hints: [
      "Know your rights (ADA if in US)",
      "Be specific about what you need",
      "Have documentation ready",
    ],
    goodResponses: [
      "I have a medical condition that requires some accommodations. Specifically, I'm requesting [specific accommodations]. I have documentation from my doctor.",
      "I want to continue doing good work here. To do that, I need [specific adjustment]. This doesn't change my ability to do my job — it helps me do it better.",
      "I'm happy to discuss what's feasible. The most important things for me are [priorities]. Is there an interactive process we should start?",
    ],
    commonMistakes: [
      "Not knowing your rights",
      "Being too vague",
      "Over-sharing medical details",
    ],
    
    successCriteria: [
      "Made specific request",
      "Had documentation",
      "Stayed professional",
    ],
    followUpScenarios: ['chronic-accommodation-denied', 'chronic-accommodation-granted'],
  },
  {
    id: 'chronic-calling-out-sick',
    title: "Calling Out Sick (Again)",
    description: "You need to call out sick but you've already done it recently. Practice navigating.",
    category: 'work',
    lifeStage: 'late-adolescence',
    ageRange: [16, 65],
    difficulty: 'intermediate',
    
    persona: 'Boss / Manager',
    personaDescription: "Might be frustrated by absences. Needs staffing. Might or might not be understanding.",
    personaTraits: ['stressed about staffing', 'might be frustrated', 'professional'],
    
    context: "You're having a flare and can't work, but you've already called out recently.",
    firstMessage: "You're calling out again? This is the [second/third] time this month.",
    
    responseStyle: 'realistic',
    escalationTriggers: ['this is becoming a problem', 'we need reliable people'],
    deescalationResponses: ["I understand. Feel better.", "Do you have documentation?"],
    safetyTriggers: [],
    
    skillsTargeted: ['professional communication', 'not over-explaining', 'protecting your job'],
    hints: [
      "You don't have to share details",
      "Know your rights and your company's policy",
      "Offer what you can (working from home, partial day) if possible",
    ],
    goodResponses: [
      "Yes, I'm not well enough to come in. I have an ongoing medical condition — HR has documentation. I expect to be back [timeline].",
      "I understand this is difficult. I'm dealing with a chronic condition that has flares. I'm doing everything I can to manage it.",
      "I know the timing isn't ideal. Is there anything I can do remotely today, or should I focus on resting so I can be back sooner?",
    ],
    commonMistakes: [
      "Over-explaining symptoms",
      "Apologizing excessively",
      "Coming in when you shouldn't",
    ],
    
    successCriteria: [
      "Called out professionally",
      "Referenced documentation if needed",
      "Didn't over-apologize",
    ],
    followUpScenarios: ['chronic-job-at-risk', 'chronic-fmla-conversation'],
  },
  {
    id: 'chronic-school-accommodations',
    title: "Getting School Accommodations",
    description: "You need accommodations at school (extra time, attendance flexibility, etc.).",
    category: 'school',
    lifeStage: 'middle-adolescence',
    ageRange: [12, 25],
    difficulty: 'intermediate',
    
    persona: 'Teacher / Disability Office',
    personaDescription: "Wants to help but needs to follow procedures. May not understand your condition.",
    personaTraits: ['procedural', 'wants to help', 'needs documentation'],
    
    context: "You need school accommodations for your chronic condition.",
    firstMessage: "You wanted to talk about accommodations? What's going on?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Let's see what we can set up.", "I'll work with disability services."],
    safetyTriggers: [],
    
    skillsTargeted: ['self-advocacy in school', 'explaining needs', 'following procedures'],
    hints: [
      "Get documentation from your doctor",
      "Be specific about what helps",
      "Know your rights (504 plans, IEPs, disability services)",
    ],
    goodResponses: [
      "I have [condition] that affects my ability to [specific]. I need [specific accommodations]. I have documentation from my doctor.",
      "I'm not trying to get out of work — I want to do the work. I just need [adjustment] to be able to do it.",
      "What's the process for getting this set up? Do I need to go through disability services?",
    ],
    commonMistakes: [
      "Not getting documentation",
      "Being too vague about needs",
      "Not knowing your rights",
    ],
    
    successCriteria: [
      "Explained needs clearly",
      "Had or requested documentation",
      "Started the process",
    ],
    followUpScenarios: ['chronic-teacher-doesnt-follow-accommodations'],
  },

  // ============================================
  // IDENTITY & MENTAL HEALTH
  // ============================================
  {
    id: 'chronic-grief-diagnosis',
    title: "Grieving Your Pre-Illness Life",
    description: "Processing the grief of what you've lost to chronic illness.",
    category: 'identity',
    lifeStage: 'late-adolescence',
    ageRange: [14, 60],
    difficulty: 'advanced',
    
    persona: 'Therapist / Trusted Person',
    personaDescription: "Safe space to process grief. Understands chronic illness grief is real.",
    personaTraits: ['understanding', 'validating', 'safe'],
    
    context: "You're processing the grief of what your life was like before chronic illness.",
    firstMessage: "How have you been feeling about everything you've been dealing with?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["That's a real grief.", "You're allowed to mourn that."],
    safetyTriggers: ['I wish I was dead', 'I can\'t live like this', 'what\'s the point'],
    
    skillsTargeted: ['naming grief', 'self-compassion', 'processing loss'],
    hints: [
      "Chronic illness grief is real and valid",
      "You can grieve what you've lost while accepting where you are",
      "Grief isn't linear",
    ],
    goodResponses: [
      "I miss who I was before. I miss being able to [activity] without thinking about it. Some days I'm angry about it.",
      "I feel like I'm grieving a version of myself that doesn't exist anymore. Is that weird?",
      "I'm tired of being strong about it. Sometimes I just want to be sad that this is my life now.",
    ],
    commonMistakes: [
      "Suppressing the grief",
      "Feeling guilty for grieving",
      "Toxic positivity",
    ],
    
    successCriteria: [
      "Named the grief",
      "Allowed yourself to feel it",
      "Didn't judge yourself",
    ],
    followUpScenarios: ['chronic-finding-new-normal'],
  },
  {
    id: 'chronic-imposter-syndrome',
    title: "Feeling Like You're Not 'Sick Enough'",
    description: "Dealing with feeling like your illness isn't valid because others have it worse.",
    category: 'identity',
    lifeStage: 'middle-adolescence',
    ageRange: [14, 50],
    difficulty: 'intermediate',
    
    persona: 'Inner Voice / Friend',
    personaDescription: "Processing feelings of not being 'sick enough' to deserve support.",
    personaTraits: ['reflective', 'supportive', 'validating'],
    
    context: "You feel like your illness isn't 'bad enough' to complain about or get support for.",
    firstMessage: "You seem hesitant to talk about your health stuff. What's going on?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Your struggles are valid too.", "It's not a competition."],
    safetyTriggers: [],
    
    skillsTargeted: ['self-validation', 'comparison release', 'accepting support'],
    hints: [
      "Pain and struggle aren't competitions",
      "Your experience is valid regardless of others'",
      "Asking for support isn't taking from others",
    ],
    goodResponses: [
      "I feel like I don't deserve to complain because other people have it worse. But it still affects my life.",
      "I keep telling myself it's not that bad. But it IS affecting me, even if it's not as bad as someone else's.",
      "I think I minimize my own experience because I don't want to be 'too much.' But then I don't get the support I need.",
    ],
    commonMistakes: [
      "Constant comparison to sicker people",
      "Not seeking help you need",
      "Minimizing to the point of harm",
    ],
    
    successCriteria: [
      "Acknowledged your experience is valid",
      "Recognized comparison trap",
      "Opened to receiving support",
    ],
    followUpScenarios: ['chronic-accepting-help'],
  },
  {
    id: 'chronic-pushing-through',
    title: "Learning When NOT to Push Through",
    description: "You've been taught to push through but that's making you worse.",
    category: 'mental-health',
    lifeStage: 'late-adolescence',
    ageRange: [14, 50],
    difficulty: 'intermediate',
    
    persona: 'Well-Meaning Person',
    personaDescription: "Encouraging you to push through when you shouldn't.",
    personaTraits: ['well-meaning', 'doesn\'t understand', 'encouraging'],
    
    context: "Someone is encouraging you to push through when you know you need to rest.",
    firstMessage: "Come on, you can do it! Mind over matter. Don't let your illness define you!",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Oh, I didn't realize. Take care of yourself."],
    safetyTriggers: [],
    
    skillsTargeted: ['setting limits', 'knowing your body', 'rejecting toxic positivity'],
    hints: [
      "Pushing through can make chronic illness worse",
      "Rest is treatment, not weakness",
      "You know your body better than they do",
    ],
    goodResponses: [
      "I appreciate the encouragement, but for my condition, pushing through actually makes it worse. Rest is part of my treatment.",
      "I've learned the hard way that ignoring my body's signals leads to bigger crashes. I need to stop now.",
      "It's not about willpower. My body has limits that are different from yours. I'm listening to it.",
    ],
    commonMistakes: [
      "Pushing until you crash",
      "Feeling guilty for resting",
      "Internalizing toxic positivity",
    ],
    
    successCriteria: [
      "Set the limit",
      "Explained without over-justifying",
      "Didn't push through unsafely",
    ],
    followUpScenarios: ['chronic-pacing-yourself'],
  },
];

export const getChronicIllnessScenarios = () => CHRONIC_ILLNESS_SCENARIOS;

export const getChronicIllnessScenariosByAge = (age: number) => {
  return CHRONIC_ILLNESS_SCENARIOS.filter(s => age >= s.ageRange[0] && age <= s.ageRange[1]);
};
