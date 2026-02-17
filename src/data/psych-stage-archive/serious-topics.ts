// Serious topics guide for teens
// Honest, non-preachy, actually helpful information
// Matching the style of emotions.ts

export interface TopicGuide {
  id: string;
  name: string;
  emoji: string;
  color: string;
  gradient: [string, string];
  tagline: string;
  
  // What it is
  whatItIs: string;
  
  // Warning signs (in yourself or others)
  warningSigns: string[];
  
  // The real talk (honest, non-judgmental)
  realTalk: string;
  
  // If it's you
  ifItsYou: {
    firstSteps: string[];
    whatHelps: string[];
    whatDoesntHelp: string[];
  };
  
  // If it's a friend
  ifItsAFriend: {
    howToHelp: string[];
    whatToSay: string[];
    whatNotToSay: string[];
  };
  
  // When to get help (escalation signs)
  whenToGetHelp: string[];
  
  // Resources
  resources: {
    name: string;
    description: string;
    contact: string;
    type: 'call' | 'text' | 'website';
  }[];
  
  // Quick technique or grounding
  copingMoment: {
    name: string;
    steps: string[];
  };
}

export const SERIOUS_TOPICS: TopicGuide[] = [
  {
    id: 'substance-abuse',
    name: 'Substance Use',
    emoji: '💊',
    color: '#7C3AED',
    gradient: ['#7C3AED', '#A78BFA'],
    tagline: "no judgment here — let's talk about what's really going on",
    
    whatItIs: "Using substances (alcohol, weed, pills, vapes, harder stuff) to cope, feel better, fit in, or escape. It's on a spectrum — experimenting once isn't the same as needing something to get through the day. But that line can blur faster than you think.",
    
    warningSigns: [
      "Using more than you planned or more often",
      "Thinking about it a lot when you're not using",
      "Needing more to feel the same effect",
      "Hiding how much you use from friends/family",
      "Skipping things you used to care about to use instead",
      "Using alone or to cope with feelings",
      "Feeling weird or sick when you don't have it",
      "Friends or family have said something",
      "Doing risky stuff you wouldn't normally do"
    ],
    
    realTalk: "Here's the thing nobody tells you: most people who struggle with substances started using to deal with something else — anxiety, trauma, feeling like they don't fit in, boredom, pain. The substance isn't the real problem; it's the solution that stopped working. You're not weak or broken if you're struggling. And getting help doesn't mean you're an addict with a capital A. It means you're smart enough to recognize something isn't working.",
    
    ifItsYou: {
      firstSteps: [
        "Be honest with yourself — no judgment, just facts. How often? How much? Why?",
        "Notice what you're actually trying to feel or avoid feeling",
        "Tell ONE person you trust. Just one. It breaks the isolation.",
        "You don't have to quit forever today. Just get curious about what's going on."
      ],
      whatHelps: [
        "Finding other ways to get what the substance gives you (calm, confidence, escape)",
        "Talking to someone who won't freak out",
        "Keeping track of use (awareness without judgment)",
        "Avoiding triggers when you can",
        "Having a plan for when cravings hit",
        "Treating the underlying stuff (anxiety, depression, trauma)"
      ],
      whatDoesntHelp: [
        "Shame spirals and beating yourself up",
        "White-knuckling it alone",
        "Swapping one substance for another",
        "Promising to 'never again' without understanding why",
        "Hanging out in the same situations expecting different results"
      ]
    },
    
    ifItsAFriend: {
      howToHelp: [
        "Don't wait for rock bottom — check in now",
        "Come from 'I'm worried' not 'you have a problem'",
        "Listen more than you talk",
        "Don't cover for them or help them hide it",
        "Keep being their friend — don't abandon them",
        "Know your limits: you can support but not save them"
      ],
      whatToSay: [
        "Hey, I've noticed [specific thing] and I'm worried about you. No judgment, I just care.",
        "You don't have to explain anything. I just want you to know I'm here.",
        "Is there something going on that's making you want to use more?",
        "Whatever's happening, it doesn't change how I see you.",
        "I'm not going to tell anyone, but I think you should talk to someone who can actually help."
      ],
      whatNotToSay: [
        "You're being stupid / you're ruining your life",
        "Just stop / it's not that hard",
        "I'll tell your parents if you don't stop",
        "You're not even that bad / you're fine",
        "I can't be friends with you if you keep doing this (ultimatums rarely work)"
      ]
    },
    
    whenToGetHelp: [
      "You can't stop even when you want to",
      "It's affecting school, relationships, health",
      "You're using harder stuff or mixing substances",
      "You've had a scary experience (OD, blackout, injury)",
      "You're using to not feel withdrawals",
      "Thoughts of self-harm or suicide"
    ],
    
    resources: [
      {
        name: "SAMHSA National Helpline",
        description: "Free, confidential, 24/7 support",
        contact: "1-800-662-4357",
        type: "call"
      },
      {
        name: "Crisis Text Line",
        description: "Text for any crisis, including substances",
        contact: "Text HOME to 741741",
        type: "text"
      },
      {
        name: "Teen Line",
        description: "Teens talking to teens, no adults",
        contact: "1-800-852-8336 (6pm-10pm PT)",
        type: "call"
      },
      {
        name: "Partnership to End Addiction",
        description: "Resources for teens and families",
        contact: "drugfree.org",
        type: "website"
      }
    ],
    
    copingMoment: {
      name: "Ride the Wave",
      steps: [
        "Cravings are like waves — they build, peak, and fade",
        "Set a timer for 15 minutes",
        "Do something else: walk, music, cold water on face, text someone",
        "Notice the craving without acting on it",
        "Check in when the timer goes off — usually it's passed"
      ]
    }
  },
  
  {
    id: 'eating-disorders',
    name: 'Eating & Body Image',
    emoji: '🪞',
    color: '#EC4899',
    gradient: ['#EC4899', '#F472B6'],
    tagline: "it's not really about the food — and you're not alone",
    
    whatItIs: "Eating disorders are mental health conditions that show up through food and body behaviors — restricting, bingeing, purging, obsessive exercise, or constant body checking. They're not about vanity or willpower. They're usually about control, coping, or trying to feel okay in a world that won't stop commenting on bodies.",
    
    warningSigns: [
      "Thinking about food, weight, or body constantly",
      "Skipping meals or making excuses not to eat",
      "Eating large amounts in secret, feeling out of control",
      "Going to the bathroom right after eating",
      "Exercising to 'make up for' eating",
      "Feeling like you can't eat without rules or rituals",
      "Weighing yourself multiple times a day",
      "Avoiding social events because of food",
      "Wearing baggy clothes to hide your body",
      "Feeling disgusted or ashamed after eating",
      "Others expressing concern about your eating"
    ],
    
    realTalk: "Diet culture is everywhere, and it's exhausting. You've been told your whole life that smaller = better, that you should eat less, move more, take up less space. No wonder so many people have a messed up relationship with food. An eating disorder isn't a diet gone too far — it's a mental illness that hijacks your brain. Recovery is possible, but it usually needs real support. And you deserve that support, no matter what size you are or how 'sick' you think you are.",
    
    ifItsYou: {
      firstSteps: [
        "Recognize that this isn't about willpower or being dramatic",
        "You don't have to be underweight to have a real problem",
        "Tell someone — a friend, parent, counselor, doctor. Anyone.",
        "Consider writing down what you're actually feeling (not just what you're eating)"
      ],
      whatHelps: [
        "Working with a therapist who specializes in eating disorders",
        "Unfollowing accounts that make you feel bad about your body",
        "Eating with people you feel safe around",
        "Challenging one food rule at a time",
        "Journaling about feelings, not food or weight",
        "Being around people who don't comment on bodies"
      ],
      whatDoesntHelp: [
        "Trying to recover alone through willpower",
        "Replacing one eating disorder behavior with another",
        "Diet culture disguised as 'wellness' or 'clean eating'",
        "Body-checking or weighing yourself constantly",
        "Comparing your eating to others"
      ]
    },
    
    ifItsAFriend: {
      howToHelp: [
        "Talk about your concern — don't ignore it",
        "Don't comment on their body (even compliments can backfire)",
        "Don't make it about food — ask how they're feeling",
        "Don't try to force them to eat or watch them eat",
        "Be patient — recovery takes time and has setbacks",
        "Take care of yourself too — this is heavy"
      ],
      whatToSay: [
        "I'm not trying to talk about food or your body. I just feel like you're struggling and I want to be here.",
        "You don't have to explain anything to me. I'm just worried because I care about you.",
        "Whatever's going on, it doesn't change how I see you.",
        "Have you thought about talking to someone? I could help you find someone.",
        "I'm here no matter what. You're not a burden."
      ],
      whatNotToSay: [
        "You look fine / you're not even skinny",
        "Just eat something / just stop [behavior]",
        "I wish I had your self-control",
        "You're making everyone worry",
        "Anorexia/bulimia is so last year",
        "Comments about anyone's body or food"
      ]
    },
    
    whenToGetHelp: [
      "You can't stop the behaviors even when you want to",
      "Physical symptoms: dizzy, fainting, heart racing, hair loss, cold all the time",
      "You're thinking about hurting yourself",
      "Eating (or not eating) is all you think about",
      "You've been hiding it for a long time",
      "Your period has stopped (if you have one)"
    ],
    
    resources: [
      {
        name: "National Eating Disorders Association",
        description: "Chat, call, or text for support",
        contact: "1-800-931-2237",
        type: "call"
      },
      {
        name: "NEDA Text Line",
        description: "Text NEDA to 741741",
        contact: "Text NEDA to 741741",
        type: "text"
      },
      {
        name: "ANAD Helpline",
        description: "Support, treatment referrals",
        contact: "1-888-375-7767",
        type: "call"
      },
      {
        name: "F.E.A.S.T.",
        description: "Support for families",
        contact: "feast-ed.org",
        type: "website"
      }
    ],
    
    copingMoment: {
      name: "Body Gratitude Reset",
      steps: [
        "Put your hand on your heart",
        "Feel it beating — your body is keeping you alive",
        "Think of ONE thing your body let you do today (walk, laugh, hug someone)",
        "Say: 'My body deserves kindness, not punishment'",
        "You don't have to love your body. Just don't hurt it."
      ]
    }
  },
  
  {
    id: 'self-harm',
    name: 'Self-Harm',
    emoji: '🩹',
    color: '#6B7280',
    gradient: ['#6B7280', '#9CA3AF'],
    tagline: "you're not crazy, you're coping — but there are better ways",
    
    whatItIs: "Self-harm is hurting yourself on purpose — cutting, burning, hitting, scratching, or other ways of causing physical pain. It's not about wanting to die (that's different). For most people, it's a way to cope with emotional pain that feels too big. The physical pain provides release, control, or a way to feel something when you're numb.",
    
    warningSigns: [
      "Unexplained cuts, burns, bruises, or scars",
      "Wearing long sleeves/pants even in hot weather",
      "Avoiding activities that show skin (swimming, etc.)",
      "Having sharp objects or first aid supplies hidden",
      "Spending long periods in bathroom or bedroom alone",
      "Talking about feeling empty, numb, or wanting to feel something",
      "Pulling away from friends and family",
      "Difficulty handling emotions",
      "Saying they deserve to be hurt"
    ],
    
    realTalk: "Self-harm works — that's the problem. It actually does provide temporary relief, which is why people keep doing it. But it doesn't solve the underlying pain, and it can become addictive. Here's what matters: self-harm doesn't make you crazy, attention-seeking, or broken. It means you're dealing with more pain than you have tools for. The goal isn't to shame yourself into stopping — it's to find other ways to cope that don't hurt you.",
    
    ifItsYou: {
      firstSteps: [
        "Don't panic. Lots of people struggle with this.",
        "Try to notice what happens right BEFORE the urge — what triggered it?",
        "Tell ONE person. A friend, counselor, family member — anyone safe.",
        "When you have an urge, try to delay by 15 minutes. Just 15 minutes."
      ],
      whatHelps: [
        "Ice cubes — the cold gives physical sensation without injury",
        "Red marker on skin — visual without damage",
        "Intense exercise to burn off the energy",
        "Snapping a rubber band on wrist (not ideal but harm reduction)",
        "Screaming into a pillow",
        "Therapy — especially DBT (Dialectical Behavior Therapy)",
        "Talking about what you're ACTUALLY feeling underneath the urge"
      ],
      whatDoesntHelp: [
        "Shame spirals (making it worse)",
        "Total isolation",
        "White-knuckling without replacement coping skills",
        "People telling you to 'just stop'",
        "Hiding it from everyone forever"
      ]
    },
    
    ifItsAFriend: {
      howToHelp: [
        "Stay calm. Don't freak out or make them feel like a freak.",
        "Don't ask to see or ask detailed questions about methods",
        "Focus on feelings, not the behavior",
        "Don't promise to keep it secret if they're in danger",
        "Don't try to be their therapist — encourage professional help",
        "Keep being their friend. Don't treat them like they're fragile."
      ],
      whatToSay: [
        "I'm not judging you. I'm just glad you told me.",
        "That sounds really hard. I'm sorry you're going through this.",
        "You don't have to explain why. I just want to be here for you.",
        "Have you thought about talking to someone who can really help?",
        "This doesn't change how I see you. You're still you."
      ],
      whatNotToSay: [
        "Why would you do that to yourself?",
        "That's so attention-seeking",
        "Just stop doing it",
        "That's disgusting",
        "Promise me you'll never do it again",
        "Can I see?"
      ]
    },
    
    whenToGetHelp: [
      "The self-harm is getting more frequent or severe",
      "You're having thoughts of suicide (not just self-harm)",
      "You need medical attention for wounds",
      "You can't stop even when you want to",
      "It's the only way you can cope",
      "You feel hopeless or numb most of the time"
    ],
    
    resources: [
      {
        name: "988 Suicide & Crisis Lifeline",
        description: "Call or text for any mental health crisis",
        contact: "988",
        type: "call"
      },
      {
        name: "Crisis Text Line",
        description: "Text HOME to 741741",
        contact: "Text HOME to 741741",
        type: "text"
      },
      {
        name: "To Write Love on Her Arms",
        description: "Stories, resources, hope",
        contact: "twloha.com",
        type: "website"
      },
      {
        name: "Self-Injury Outreach & Support",
        description: "Info and resources specifically for self-harm",
        contact: "sioutreach.org",
        type: "website"
      }
    ],
    
    copingMoment: {
      name: "TIPP the Scales",
      steps: [
        "T - Temperature: Hold ice or splash cold water on face",
        "I - Intense exercise: Jumping jacks, run, push-ups (60 sec)",
        "P - Paced breathing: Breathe out longer than you breathe in",
        "P - Progressive muscle relaxation: Tense and release each muscle group",
        "Pick ONE of these when you have an urge"
      ]
    }
  },
  
  {
    id: 'anxiety-disorders',
    name: 'Anxiety Disorders',
    emoji: '😰',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A78BFA'],
    tagline: "when worry stops being helpful and starts running your life",
    
    whatItIs: "Everyone gets anxious — it's normal. But an anxiety disorder is when anxiety is so constant or intense that it interferes with your life. It's not just 'being nervous' — it's a brain thing where your alarm system is stuck on high alert. Types include generalized anxiety, social anxiety, panic disorder, phobias, and OCD.",
    
    warningSigns: [
      "Constant worry that won't turn off",
      "Avoiding more and more situations",
      "Physical symptoms: racing heart, sweating, nausea, shaking",
      "Panic attacks (sudden intense fear with physical symptoms)",
      "Trouble sleeping because your mind won't stop",
      "Difficulty concentrating or mind going blank",
      "Irritability or being on edge all the time",
      "Needing constant reassurance",
      "Muscle tension, headaches, stomach issues",
      "Feeling like something bad is always about to happen"
    ],
    
    realTalk: "Anxiety is one of the most common mental health issues for teens — you're not weird or weak. Your brain is literally doing what it evolved to do (spot danger) but in overdrive. The tricky thing about anxiety is that avoidance makes it worse. Every time you avoid something scary, your brain learns 'that was dangerous, good thing we escaped.' But the things you're avoiding usually aren't dangerous. Anxiety is treatable. Like, really treatable. Therapy and sometimes medication can change your life.",
    
    ifItsYou: {
      firstSteps: [
        "Know that anxiety is a real thing, not a personality flaw",
        "Start noticing your anxiety patterns: What triggers it? What makes it worse?",
        "Talk to someone — parent, counselor, doctor",
        "Try one grounding technique (see below) when anxiety spikes"
      ],
      whatHelps: [
        "Therapy, especially CBT (Cognitive Behavioral Therapy)",
        "Facing fears gradually instead of avoiding them",
        "Regular exercise (burns off stress hormones)",
        "Sleep hygiene (anxiety and bad sleep feed each other)",
        "Limiting caffeine and scrolling",
        "Breathing techniques and grounding",
        "Medication for some people (no shame in it)"
      ],
      whatDoesntHelp: [
        "Avoiding everything that makes you anxious (makes it worse)",
        "Constant reassurance-seeking (temporary relief, long-term worse)",
        "Trying to think your way out of a panic attack",
        "Beating yourself up for being anxious",
        "Using substances to cope"
      ]
    },
    
    ifItsAFriend: {
      howToHelp: [
        "Don't tell them to 'just calm down' (they would if they could)",
        "Be patient — they know their fears might be irrational",
        "Help them face small fears, but don't push too hard",
        "Learn their triggers so you can help, not fix",
        "Include them even if they sometimes can't come",
        "Be a calm presence, not another source of anxiety"
      ],
      whatToSay: [
        "You're safe. This will pass. I'm here.",
        "What do you need from me right now?",
        "Let's breathe together. In... out...",
        "You've gotten through this before. You can do it again.",
        "I'm not going anywhere. Take your time."
      ],
      whatNotToSay: [
        "Just relax / calm down / stop worrying",
        "What do you have to be anxious about?",
        "You're overreacting",
        "It's not that big a deal",
        "Just don't think about it"
      ]
    },
    
    whenToGetHelp: [
      "Anxiety is stopping you from doing normal things (school, friends, life)",
      "You're having panic attacks",
      "You can't leave the house or specific places",
      "Sleep is seriously affected",
      "You're using substances to cope",
      "Anxiety is leading to depression or hopelessness",
      "You're having thoughts of hurting yourself"
    ],
    
    resources: [
      {
        name: "988 Suicide & Crisis Lifeline",
        description: "For any mental health crisis",
        contact: "988",
        type: "call"
      },
      {
        name: "Crisis Text Line",
        description: "Text HELLO to 741741",
        contact: "Text HELLO to 741741",
        type: "text"
      },
      {
        name: "Anxiety & Depression Association of America",
        description: "Find a therapist, resources",
        contact: "adaa.org",
        type: "website"
      },
      {
        name: "Teen Line",
        description: "Teens helping teens, 6pm-10pm PT",
        contact: "1-800-852-8336",
        type: "call"
      }
    ],
    
    copingMoment: {
      name: "5-4-3-2-1 Grounding",
      steps: [
        "5 things you can SEE (name them out loud)",
        "4 things you can TOUCH (feel them)",
        "3 things you can HEAR (listen)",
        "2 things you can SMELL (breathe in)",
        "1 thing you can TASTE",
        "This brings you back to the present moment"
      ]
    }
  },
  
  {
    id: 'domestic-violence',
    name: 'Violence at Home',
    emoji: '🏠',
    color: '#DC2626',
    gradient: ['#DC2626', '#F87171'],
    tagline: "what happens at home affects you — and it's not your fault",
    
    whatItIs: "Domestic violence isn't just physical hitting — it's a pattern of one person trying to control another through fear. This can include physical abuse, emotional abuse, verbal abuse, financial control, or threats. If you're witnessing this between adults in your home, or experiencing it yourself, it affects you deeply — even if you're not the direct target.",
    
    warningSigns: [
      "Frequent yelling, screaming, or fighting at home",
      "Someone gets hit, pushed, grabbed, or physically hurt",
      "One person controls money, decisions, or who the other can see",
      "Threats to hurt person, kids, or pets",
      "Things getting broken or thrown",
      "Walking on eggshells — never knowing what will set someone off",
      "One person constantly putting the other down",
      "Feeling scared to go home",
      "Covering for a parent's behavior",
      "Making excuses for why things are broken or someone is hurt"
    ],
    
    realTalk: "If there's violence or abuse in your home, you might feel like it's normal because it's all you've known. It's not normal. You might feel like it's your fault or you could stop it if you were better. It's not your fault and you can't fix it. You might feel ashamed and like you can't tell anyone. The shame belongs to the person causing harm, not you. Witnessing violence is trauma — even if you were never hit. Your feelings are valid. And there are people who can help.",
    
    ifItsYou: {
      firstSteps: [
        "Know this: It's not your fault. None of it.",
        "Your safety matters. Think about who you could go to in an emergency.",
        "Tell someone you trust — a teacher, counselor, friend's parent, relative",
        "If you're in immediate danger, call 911"
      ],
      whatHelps: [
        "Having a safety plan (where to go, who to call)",
        "Keeping important things in a bag you can grab (ID, charger, comfort item)",
        "Memorizing safe numbers",
        "Talking to a counselor or therapist",
        "Knowing it's not your job to fix your family",
        "Having support outside the home"
      ],
      whatDoesntHelp: [
        "Trying to intervene in physical violence (dangerous for you)",
        "Believing you can love someone enough to make them stop",
        "Taking sides and getting caught in the middle",
        "Keeping it secret forever",
        "Blaming yourself"
      ]
    },
    
    ifItsAFriend: {
      howToHelp: [
        "Believe them. Don't question or minimize.",
        "Don't pressure them to 'just leave' or report — it's complicated",
        "Let them know it's not their fault",
        "Be a safe place they can talk or escape to",
        "Know the resources so you can share when they're ready",
        "If they're in immediate danger, tell a trusted adult"
      ],
      whatToSay: [
        "Thank you for trusting me with this. I believe you.",
        "This isn't your fault. None of it.",
        "I'm worried about your safety. What can I do?",
        "You can come to my house if you ever need to get out.",
        "I'm here no matter what. You're not alone in this."
      ],
      whatNotToSay: [
        "Why don't they just leave?",
        "That doesn't sound that bad",
        "What did you do to make them mad?",
        "Your parents wouldn't do that",
        "I'm sure they didn't mean it"
      ]
    },
    
    whenToGetHelp: [
      "You or someone in your home is in physical danger",
      "The violence is getting worse or more frequent",
      "Weapons are involved or have been threatened",
      "You're afraid to go home",
      "You're having thoughts of hurting yourself",
      "You feel like you have no one to turn to"
    ],
    
    resources: [
      {
        name: "National Domestic Violence Hotline",
        description: "24/7 confidential support",
        contact: "1-800-799-7233",
        type: "call"
      },
      {
        name: "LoveIsRespect",
        description: "For teens specifically — call, text, or chat",
        contact: "Text LOVEIS to 22522",
        type: "text"
      },
      {
        name: "Childhelp National Child Abuse Hotline",
        description: "For anyone under 18 experiencing abuse",
        contact: "1-800-422-4453",
        type: "call"
      },
      {
        name: "Crisis Text Line",
        description: "Text HOME to 741741",
        contact: "Text HOME to 741741",
        type: "text"
      }
    ],
    
    copingMoment: {
      name: "Safe Space Visualization",
      steps: [
        "Close your eyes if it feels safe",
        "Picture a place where you feel completely safe (real or imaginary)",
        "Notice the details: What do you see? Hear? Smell?",
        "Put your hand on your heart. You are here now.",
        "Say: 'I am safe in this moment. I am not alone.'",
        "Breathe here for a few minutes whenever you need to escape mentally"
      ]
    }
  },
  
  {
    id: 'trafficking-awareness',
    name: 'Trafficking & Exploitation',
    emoji: '🚨',
    color: '#B91C1C',
    gradient: ['#B91C1C', '#EF4444'],
    tagline: "it doesn't look like the movies — and knowing the signs can save you",
    
    whatItIs: "Human trafficking is when someone uses force, fraud, or manipulation to exploit another person — usually for sex or labor. It doesn't usually involve kidnapping strangers. More often, it's someone you know (or met online) who gains your trust, then gradually manipulates, threatens, or traps you. It can happen to anyone — any gender, any background.",
    
    warningSigns: [
      "Someone older who pays you a LOT of attention and calls you 'mature'",
      "Gifts, money, or opportunities that seem too good to be true",
      "Pressure to keep the relationship secret",
      "Isolating you from friends and family",
      "Slowly asking for things you're not comfortable with",
      "Taking photos or videos you didn't agree to",
      "Holding something over you (debt, secrets, photos)",
      "You feel like you can't say no or leave",
      "Someone controlling your money, ID, or movements",
      "Working but not keeping your earnings"
    ],
    
    realTalk: "Trafficking doesn't start with a white van. It usually starts with someone being really nice — love bombing, compliments, gifts, making you feel special. Then the manipulation begins. Maybe they say they love you, or you owe them, or they'll release pictures, or your family will get hurt. If someone is pressuring you into anything — sex, work, sending pictures, meeting up — and you feel like you can't say no, that's a red flag. This isn't your fault, even if you made choices that led here. Traffickers are professionals at manipulation. There's no shame in getting help.",
    
    ifItsYou: {
      firstSteps: [
        "Trust your gut — if something feels wrong, it probably is",
        "Know that it's not your fault, even if you 'went along with it'",
        "Tell someone you trust, or call a hotline anonymously",
        "If you're in immediate danger, call 911 or text 911 (if your area supports it)"
      ],
      whatHelps: [
        "Telling someone what's happening — breaking the silence breaks control",
        "Knowing that you CAN leave and there are people who will help without judging",
        "Saving evidence if you can (screenshots, messages)",
        "Having a code word with someone who can call for help",
        "Contacting a hotline — they've heard it all and won't judge"
      ],
      whatDoesntHelp: [
        "Blaming yourself",
        "Thinking you're in too deep to get out",
        "Believing you owe them something",
        "Trying to handle it completely alone",
        "Staying silent because you're ashamed"
      ]
    },
    
    ifItsAFriend: {
      howToHelp: [
        "Trust your instincts if something seems off",
        "Ask questions without judgment",
        "Don't try to 'rescue' them yourself — get professional help",
        "Share hotline info when they're ready",
        "Don't blame them for choices they made",
        "If they're a minor and in danger, tell a trusted adult"
      ],
      whatToSay: [
        "I'm worried about you. Can we talk about what's going on?",
        "You can tell me anything. I won't judge.",
        "Does this person let you see other friends? Talk to your family?",
        "I just want to make sure you're safe.",
        "There are people who can help if you're feeling trapped."
      ],
      whatNotToSay: [
        "How could you let this happen?",
        "Why didn't you just leave/say no?",
        "You should have known better",
        "That's basically prostitution",
        "I'm calling the police right now (unless immediate danger — let them decide)"
      ]
    },
    
    whenToGetHelp: [
      "Someone is controlling you through threats, debt, or blackmail",
      "You're being forced to do things you don't want to do",
      "Your ID, money, or phone has been taken",
      "You're not allowed to leave a place or see other people",
      "You're afraid of what someone might do to you or your family"
    ],
    
    resources: [
      {
        name: "National Human Trafficking Hotline",
        description: "24/7 confidential support — call or text",
        contact: "1-888-373-7888",
        type: "call"
      },
      {
        name: "Befree Text Line",
        description: "Text BEFREE to 233733",
        contact: "Text BEFREE to 233733",
        type: "text"
      },
      {
        name: "Crisis Text Line",
        description: "Text HOME to 741741",
        contact: "Text HOME to 741741",
        type: "text"
      },
      {
        name: "Polaris Project",
        description: "Information and resources",
        contact: "polarisproject.org",
        type: "website"
      },
      {
        name: "If you're in immediate danger",
        description: "Call 911 (or text 911 if supported)",
        contact: "911",
        type: "call"
      }
    ],
    
    copingMoment: {
      name: "Trust Your Gut Check",
      steps: [
        "Ask yourself: Do I feel safe with this person?",
        "Can I say no to them? What happens when I do?",
        "Do they isolate me from people who care about me?",
        "Do I feel like I owe them something I can never repay?",
        "If ANY of these feel off — trust that feeling. You're not being paranoid."
      ]
    }
  }
];

// Get topic by ID
export const getTopicGuide = (id: string): TopicGuide | undefined => {
  return SERIOUS_TOPICS.find(t => t.id === id);
};

// Get all topic IDs
export const getTopicIds = (): string[] => {
  return SERIOUS_TOPICS.map(t => t.id);
};
