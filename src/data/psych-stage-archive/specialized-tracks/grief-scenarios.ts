// Grief & Loss Specialized Roleplay Scenarios
// For death, divorce, major transitions, and processing grief
// Across all life stages

import { RoleplayScenario } from '../roleplay-scenarios';

export const GRIEF_SCENARIOS: RoleplayScenario[] = [
  // ============================================
  // DEATH OF LOVED ONES
  // ============================================
  {
    id: 'grief-talking-after-death',
    title: "When People Don't Know What to Say",
    description: "Someone awkwardly tries to comfort you after a loss. Practice responding.",
    category: 'friends',
    lifeStage: 'middle-adolescence',
    ageRange: [10, 80],
    difficulty: 'beginner',
    
    persona: 'Friend/Acquaintance',
    personaDescription: "Means well but doesn't know what to say. Might say something unhelpful.",
    personaTraits: ['well-meaning', 'awkward', 'cares'],
    
    context: "Someone is trying to express condolences but says something that doesn't land right.",
    firstMessage: "I heard about your [person]. I'm so sorry. At least they're not suffering anymore, right? Everything happens for a reason.",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["I'm sorry, I don't know what to say.", "I just want you to know I care."],
    safetyTriggers: ['I want to be with them', 'I can\'t do this anymore'],
    
    skillsTargeted: ['receiving condolences', 'setting boundaries kindly', 'accepting imperfect support'],
    hints: [
      "People often say dumb things because they're scared, not mean",
      "You can redirect without attacking",
      "'Thank you' is always acceptable even if what they said wasn't",
    ],
    goodResponses: [
      "Thanks. I appreciate you saying something.",
      "I know you mean well. I'm not really in a place to hear 'reasons' right now, but I appreciate you reaching out.",
      "Thank you. What helps most is just having people around.",
    ],
    commonMistakes: [
      "Attacking someone who meant well",
      "Feeling like you have to comfort THEM",
      "Pretending it helped when you're hurt",
    ],
    
    successCriteria: [
      "Accepted the intent behind words",
      "Set boundary if needed",
      "Didn't take on their discomfort",
    ],
    followUpScenarios: ['grief-asking-for-what-you-need'],
  },
  {
    id: 'grief-first-day-back',
    title: "First Day Back at School/Work After Loss",
    description: "You're returning to normal life after losing someone. Practice navigating it.",
    category: 'school',
    lifeStage: 'middle-adolescence',
    ageRange: [10, 65],
    difficulty: 'intermediate',
    
    persona: 'Teacher/Boss/Coworker',
    personaDescription: "Knows what happened. Unsure how to treat you. Trying.",
    personaTraits: ['walking on eggshells', 'caring', 'unsure'],
    
    context: "It's your first day back. People know. You're trying to get through it.",
    firstMessage: "Hey, welcome back. I wasn't sure if I should say anything or just act normal? I'm sorry about everything.",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Let me know what you need.", "I'll follow your lead."],
    safetyTriggers: ['I can\'t be here', 'I can\'t do this'],
    
    skillsTargeted: ['asking for what you need', 'navigating re-entry', 'giving yourself grace'],
    hints: [
      "You can tell people what helps",
      "It's okay to not be okay and also need normalcy",
      "You don't owe anyone a performance",
    ],
    goodResponses: [
      "Thanks. Honestly, normal helps. I might need a minute sometimes but I want to just... do regular stuff today.",
      "I appreciate you asking. I might not want to talk about it much here, but it's okay to acknowledge it.",
      "Can we just take it as it comes? Some moments I'm okay, some I'm not. I'll let you know.",
    ],
    commonMistakes: [
      "Pretending you're fine when you're not",
      "Isolating completely",
      "Feeling like you have to grieve 'right'",
    ],
    
    successCriteria: [
      "Communicated needs",
      "Accepted imperfect support",
      "Gave yourself permission to not be okay",
    ],
    followUpScenarios: ['grief-needing-to-leave', 'grief-triggered-at-school'],
  },
  {
    id: 'grief-parent-death-talking',
    title: "Talking About a Parent's Death",
    description: "Someone asks about your parents and one has died. Practice responding.",
    category: 'friends',
    lifeStage: 'middle-adolescence',
    ageRange: [8, 60],
    difficulty: 'intermediate',
    
    persona: 'New Person You\'re Meeting',
    personaDescription: "Doesn't know your situation. Asks an innocent question.",
    personaTraits: ['innocent', 'curious', 'will feel bad'],
    
    context: "Someone new asks 'what do your parents do?' or similar. You have a deceased parent.",
    firstMessage: "So what do your parents do? Are they cool with you staying out?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["Oh god, I'm so sorry. I didn't know.", "I feel terrible for asking."],
    safetyTriggers: [],
    
    skillsTargeted: ['disclosure choices', 'handling awkwardness', 'protecting yourself'],
    hints: [
      "You get to choose how much to share",
      "You don't owe a full story to everyone",
      "Their discomfort isn't yours to manage",
    ],
    goodResponses: [
      "My mom/dad passed away. My [other parent] is cool though.",
      "It's just me and my mom/dad. [Can leave it at that]",
      "My dad/mom died a while ago. It's okay, you didn't know. So anyway, [redirect]...",
    ],
    commonMistakes: [
      "Feeling guilty for making them uncomfortable",
      "Over-explaining to fill the silence",
      "Pretending parent is alive",
    ],
    
    successCriteria: [
      "Answered at your comfort level",
      "Didn't over-manage their reaction",
      "Moved conversation forward",
    ],
    followUpScenarios: ['grief-follow-up-questions'],
  },
  {
    id: 'grief-sibling-death',
    title: "After Losing a Sibling",
    description: "Your sibling died. Practice talking about it and your needs.",
    category: 'family',
    lifeStage: 'middle-adolescence',
    ageRange: [10, 40],
    difficulty: 'advanced',
    
    persona: 'Surviving Parent',
    personaDescription: "Also grieving. Might be absent emotionally. Trying their best.",
    personaTraits: ['grieving too', 'might be absent', 'loves you'],
    
    context: "Your sibling died and your family is struggling. You need something from your parent.",
    firstMessage: "I know I haven't been... I'm trying. Are you okay?",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["You're right. I'm sorry. What do you need?", "We're all we have now."],
    safetyTriggers: ['I wish it was me', 'I want to die too', 'they loved them more'],
    
    skillsTargeted: ['asking for help from grieving people', 'expressing needs', 'honoring mutual grief'],
    hints: [
      "Your grief matters even if they're grieving too",
      "You can need them AND understand they're struggling",
      "Surviving sibling grief is often invisible",
    ],
    goodResponses: [
      "I'm not okay. I know you're not either. But I need you sometimes too.",
      "I miss them. And I feel like I'm disappearing. Can we... do something together? Even just be in the same room?",
      "I don't want us to lose each other while we're all grieving them.",
    ],
    commonMistakes: [
      "Making yourself invisible because they're grieving 'more'",
      "Not asking for what you need",
      "Becoming a caretaker for parents",
    ],
    
    successCriteria: [
      "Expressed own needs",
      "Acknowledged shared grief",
      "Asked for connection",
    ],
    followUpScenarios: ['grief-invisible-sibling', 'grief-family-therapy'],
  },
  {
    id: 'grief-friend-death',
    title: "When a Friend Dies",
    description: "Your friend died. Processing with someone who didn't know them.",
    category: 'friends',
    lifeStage: 'middle-adolescence',
    ageRange: [12, 30],
    difficulty: 'advanced',
    
    persona: 'Another Friend (didn\'t know the deceased)',
    personaDescription: "Wants to support you but didn't know the person who died.",
    personaTraits: ['supportive', 'outsider to grief', 'cares about you'],
    
    context: "Your friend died. You're trying to explain to someone what you're going through.",
    firstMessage: "I know you lost your friend. I didn't know them but I'm here for you. How are you doing?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["I'm so sorry.", "Tell me about them?"],
    safetyTriggers: ['should have been me', 'I can\'t live without them', 'what\'s the point'],
    
    skillsTargeted: ['sharing grief', 'keeping memory alive', 'accepting support'],
    hints: [
      "You can talk about them — keeping them alive through stories",
      "Friend grief is real and valid, even if less recognized",
      "You don't have to be 'over it' quickly",
    ],
    goodResponses: [
      "I'm really not okay. They were [describe who they were to you]. I can't believe they're gone.",
      "Can I tell you about them? I want someone to know who they were.",
      "It's weird because people don't always get how big friend loss is. But they were my person.",
    ],
    commonMistakes: [
      "Minimizing because it's 'just' a friend",
      "Isolating in grief",
      "Feeling like you should be over it",
    ],
    
    successCriteria: [
      "Shared about the friend",
      "Honored the relationship",
      "Accepted support",
    ],
    followUpScenarios: ['grief-memorial-planning', 'grief-anniversary'],
  },
  {
    id: 'grief-pet-death',
    title: "When Your Pet Dies",
    description: "Your pet died. Someone minimizes it. Practice responding.",
    category: 'conflict',
    lifeStage: 'early-adolescence',
    ageRange: [6, 30],
    difficulty: 'beginner',
    
    persona: 'Person Who Minimizes',
    personaDescription: "Says 'it's just a pet.' Doesn't understand.",
    personaTraits: ['dismissive', 'doesn\'t get it', 'might come around'],
    
    context: "Your pet died and you're grieving. Someone says 'it's just a pet.'",
    firstMessage: "You're still upset about that? It was just a dog/cat. You can get a new one.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["I guess I didn't realize how much they meant to you."],
    safetyTriggers: [],
    
    skillsTargeted: ['defending your grief', 'setting boundaries', 'not minimizing yourself'],
    hints: [
      "Pet grief is real grief",
      "You don't need their permission to be sad",
      "You can educate or you can protect yourself",
    ],
    goodResponses: [
      "They weren't 'just' anything. They were family to me. I'd appreciate some understanding.",
      "Grief doesn't work like that. I'm not looking for a replacement. I'm mourning someone I loved.",
      "I need you to not say stuff like that right now. It's not helpful.",
    ],
    commonMistakes: [
      "Agreeing with minimization",
      "Feeling embarrassed about grief",
      "Getting new pet too quickly to avoid grief",
    ],
    
    successCriteria: [
      "Defended the grief",
      "Set boundary on comments",
      "Honored the relationship",
    ],
    followUpScenarios: ['grief-when-ready-new-pet'],
  },

  // ============================================
  // DIVORCE & FAMILY CHANGES
  // ============================================
  {
    id: 'grief-parents-divorcing',
    title: "When Your Parents Tell You They're Divorcing",
    description: "Your parents just told you they're splitting up. Practice responding.",
    category: 'family',
    lifeStage: 'early-adolescence',
    ageRange: [8, 25],
    difficulty: 'advanced',
    
    persona: 'Parent (telling you)',
    personaDescription: "Trying to tell you gently. Also emotional. Hoping you'll be okay.",
    personaTraits: ['emotional', 'trying to be gentle', 'worried about you'],
    
    context: "Your parents just told you they're getting divorced. You're processing in real time.",
    firstMessage: "We need to tell you something. Your dad/mom and I have decided... we're going to separate. We both love you so much. This isn't about you.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["It's okay to be upset.", "What questions do you have?"],
    safetyTriggers: ['I don\'t want to live through this', 'I hate you both'],
    
    skillsTargeted: ['processing shock', 'asking questions', 'expressing feelings'],
    hints: [
      "All feelings are valid — anger, sadness, relief, numbness",
      "You can ask questions",
      "This will take time to process",
    ],
    goodResponses: [
      "I... I don't know what to say. Can I have some time?",
      "What does this mean? Where will I live? Will things change?",
      "I need you to know I'm really upset right now. I don't know how to feel.",
    ],
    commonMistakes: [
      "Immediately trying to fix it",
      "Suppressing all feelings",
      "Blaming yourself",
    ],
    
    successCriteria: [
      "Allowed yourself to react",
      "Asked questions if needed",
      "Didn't take blame",
    ],
    followUpScenarios: ['grief-divorce-two-homes', 'grief-parents-badmouth-each-other'],
  },
  {
    id: 'grief-caught-in-middle-divorce',
    title: "Caught in the Middle of Parents' Divorce",
    description: "Your parents keep putting you in the middle. Practice setting boundaries.",
    category: 'family',
    lifeStage: 'middle-adolescence',
    ageRange: [10, 22],
    difficulty: 'advanced',
    
    persona: 'Parent (venting about other parent)',
    personaDescription: "Hurt and angry at the other parent. Using you as emotional support or messenger.",
    personaTraits: ['hurting', 'venting', 'not seeing impact on you'],
    
    context: "Your parent is venting about your other parent or using you to pass messages. You're stuck in the middle.",
    firstMessage: "I can't believe your mother/father. They're so selfish. Did they say anything about the money situation? Can you tell them I need to know by Friday?",
    
    responseStyle: 'realistic',
    escalationTriggers: ['you\'re taking their side', 'after everything they did'],
    deescalationResponses: ["You're right. I shouldn't put this on you.", "I'm sorry."],
    safetyTriggers: [],
    
    skillsTargeted: ['setting boundaries with parents', 'not being messenger', 'protecting yourself'],
    hints: [
      "You can love both parents AND set boundaries",
      "Being the messenger isn't your job",
      "Their relationship is theirs to manage",
    ],
    goodResponses: [
      "I love you both, but I can't be in the middle. Please talk to each other directly about money stuff.",
      "When you say stuff like that about Mom/Dad, it makes me feel like I have to choose sides. Can you vent to someone else?",
      "I'm not a messenger. If you need to tell them something, please contact them yourself.",
    ],
    commonMistakes: [
      "Being the go-between",
      "Listening to all the venting",
      "Choosing sides to keep the peace",
    ],
    
    successCriteria: [
      "Refused messenger role",
      "Set boundary kindly but firmly",
      "Maintained relationship with both",
    ],
    followUpScenarios: ['grief-parent-keeps-venting', 'grief-co-parenting-conflicts'],
  },
  {
    id: 'grief-new-step-parent',
    title: "Meeting Your Parent's New Partner",
    description: "Your parent is introducing you to someone new. It's complicated.",
    category: 'family',
    lifeStage: 'middle-adolescence',
    ageRange: [10, 30],
    difficulty: 'intermediate',
    
    persona: 'New Partner',
    personaDescription: "Trying to make a good impression. Nervous. Not trying to replace anyone.",
    personaTraits: ['nervous', 'trying', 'not a replacement'],
    
    context: "Your parent is dating someone new. You're meeting them. You have feelings about it.",
    firstMessage: "Hey, it's really nice to meet you. Your mom/dad talks about you all the time. I'm not trying to replace anyone — I just want to get to know you.",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["I understand if this is weird.", "We can take things slow."],
    safetyTriggers: [],
    
    skillsTargeted: ['managing complicated feelings', 'being polite without faking', 'processing change'],
    hints: [
      "You can be polite without being fake",
      "Mixed feelings are normal",
      "You don't have to love them immediately",
    ],
    goodResponses: [
      "Nice to meet you too. I'll be honest, this is weird for me. But I'm willing to get to know you.",
      "Thanks for saying that. I'm not ready to call you anything or be super close, but we can see how it goes.",
      "I appreciate you being upfront. This is a lot. Can we take it slow?",
    ],
    commonMistakes: [
      "Being cruel to the new person",
      "Faking enthusiasm you don't feel",
      "Refusing to engage at all",
    ],
    
    successCriteria: [
      "Was honest about feelings",
      "Remained polite",
      "Expressed need for time/space",
    ],
    followUpScenarios: ['grief-step-parent-boundaries', 'grief-blended-family'],
  },

  // ============================================
  // OTHER LOSSES
  // ============================================
  {
    id: 'grief-lost-friendship',
    title: "Grieving a Lost Friendship",
    description: "A friendship ended or faded. You're grieving it.",
    category: 'friends',
    lifeStage: 'middle-adolescence',
    ageRange: [12, 35],
    difficulty: 'intermediate',
    
    persona: 'Current Friend',
    personaDescription: "Knows you're sad about the lost friendship. Supportive.",
    personaTraits: ['supportive', 'might not fully get it', 'cares'],
    
    context: "A close friendship ended (fight, fade, or circumstances). You're grieving it.",
    firstMessage: "You've seemed really down since you and [name] stopped talking. Do you want to talk about it?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["Friendship breakups are real breakups.", "I'm sorry you're going through this."],
    safetyTriggers: ['no one will ever', 'I can\'t trust anyone'],
    
    skillsTargeted: ['naming friendship grief', 'processing loss', 'moving forward'],
    hints: [
      "Friendship loss is real loss",
      "You're allowed to grieve someone who's still alive",
      "It's okay to miss them AND know it's over",
    ],
    goodResponses: [
      "It feels stupid but I'm grieving them. They were my best friend. Now they're just... gone from my life.",
      "People don't take friendship breakups seriously but this hurts as much as a real breakup.",
      "I keep wanting to text them when stuff happens. And then I remember we don't do that anymore.",
    ],
    commonMistakes: [
      "Minimizing the loss",
      "Pretending you're over it",
      "Trying to force a friendship back",
    ],
    
    successCriteria: [
      "Named the grief",
      "Allowed yourself to feel it",
      "Accepted support",
    ],
    followUpScenarios: ['grief-seeing-ex-friend', 'grief-making-new-friends'],
  },
  {
    id: 'grief-loss-of-ability',
    title: "Losing an Ability or Identity (Injury, Illness)",
    description: "You can't do something you used to do (sports, art, etc.) anymore.",
    category: 'identity',
    lifeStage: 'middle-adolescence',
    ageRange: [12, 50],
    difficulty: 'advanced',
    
    persona: 'Family Member or Friend',
    personaDescription: "Trying to be supportive. Might say unhelpful things about 'bright side.'",
    personaTraits: ['supportive', 'might bright-side', 'cares'],
    
    context: "Due to injury or illness, you can't do something that was a big part of your identity.",
    firstMessage: "I know you're upset about not being able to [activity] anymore. But maybe it's a chance to find new interests? Everything happens for a—",
    
    responseStyle: 'realistic',
    escalationTriggers: [],
    deescalationResponses: ["I'm sorry. I'm not being helpful. What do you need?"],
    safetyTriggers: ['I have nothing left', 'what\'s the point of me', 'I want to die'],
    
    skillsTargeted: ['grieving identity', 'setting boundaries on positivity', 'finding new self'],
    hints: [
      "This is a real grief — you're mourning a version of yourself",
      "You don't have to be positive yet",
      "Identity can shift, even if it's painful",
    ],
    goodResponses: [
      "Please don't 'bright side' me right now. I need to be sad about this. It was a huge part of who I am.",
      "I know you're trying to help, but I'm not ready to talk about silver linings. I'm grieving.",
      "Eventually I'll figure out what's next. But right now I just need to mourn what I lost.",
    ],
    commonMistakes: [
      "Forcing positivity too fast",
      "Letting others rush your grief",
      "Defining yourself only by what's lost",
    ],
    
    successCriteria: [
      "Set boundary on toxic positivity",
      "Allowed yourself to grieve",
      "Didn't attack the helper",
    ],
    followUpScenarios: ['grief-rebuilding-identity', 'grief-finding-new-meaning'],
  },
  {
    id: 'grief-anticipatory',
    title: "Anticipatory Grief (Someone is Dying)",
    description: "Someone you love is dying. You're grieving before they're gone.",
    category: 'family',
    lifeStage: 'late-adolescence',
    ageRange: [14, 80],
    difficulty: 'advanced',
    
    persona: 'The Person Who is Dying',
    personaDescription: "Your loved one who is terminal. Having a conversation with you.",
    personaTraits: ['accepting', 'wants connection', 'worried about you'],
    
    context: "Someone you love is dying. You have a chance to talk to them.",
    firstMessage: "I know this is hard. I want to talk about things before I can't. Is there anything you want to say to me?",
    
    responseStyle: 'supportive',
    escalationTriggers: [],
    deescalationResponses: ["It's okay. Take your time.", "I'm just glad we're talking."],
    safetyTriggers: ['I can\'t live without you', 'I want to go with you'],
    
    skillsTargeted: ['saying what needs to be said', 'presence over perfection', 'anticipatory grief'],
    hints: [
      "You don't have to say anything perfect",
      "Being present matters more than words",
      "It's okay to cry together",
    ],
    goodResponses: [
      "I don't know what to say. I love you. I'm not ready for you to go.",
      "Thank you for everything you've taught me. I carry you with me.",
      "I'm scared. But I'm grateful for this time. Is there anything you need from me?",
    ],
    commonMistakes: [
      "Avoiding the dying person",
      "Pretending everything is fine",
      "Not saying what you need to say",
    ],
    
    successCriteria: [
      "Was present",
      "Said something meaningful",
      "Allowed emotion",
    ],
    followUpScenarios: ['grief-after-expected-death', 'grief-hospice-support'],
  },
];

export const getGriefScenarios = () => GRIEF_SCENARIOS;

export const getGriefScenariosByAge = (age: number) => {
  return GRIEF_SCENARIOS.filter(s => age >= s.ageRange[0] && age <= s.ageRange[1]);
};

export const getDeathGriefScenarios = () => {
  return GRIEF_SCENARIOS.filter(s => 
    s.id.includes('death') || 
    s.id.includes('parent-death') || 
    s.id.includes('sibling') ||
    s.id.includes('friend-death') ||
    s.id.includes('dying')
  );
};

export const getDivorceScenarios = () => {
  return GRIEF_SCENARIOS.filter(s => 
    s.id.includes('divorce') || 
    s.id.includes('step')
  );
};
