// Inside Out-style emotion education for teens
// Making psychology accessible and relatable

export interface EmotionGuide {
  id: string;
  name: string;
  emoji: string;
  color: string;
  gradient: [string, string];
  tagline: string; // Like Inside Out character intro
  
  // Meet the feeling
  whatItIs: string;
  whyItExists: string;
  
  // Brain science (simple!)
  brainScience: {
    whatsHappening: string;
    funFact: string;
  };
  
  // Its superpower
  superpower: string;
  
  // Body signals
  bodySignals: string[];
  
  // When it's too much
  warningSignals: string[];
  
  // What helps
  copingTips: string[];
  
  // Inside Out reference or relatable example
  insideOutMoment: string;
  
  // Quick regulation technique
  quickTechnique: {
    name: string;
    steps: string[];
    duration: string;
  };
}

export const EMOTION_GUIDES: EmotionGuide[] = [
  {
    id: 'anxiety',
    name: 'Anxiety',
    emoji: '😰',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A78BFA'],
    tagline: "i'm your brain's alarm system — just a little too sensitive sometimes",
    
    whatItIs: "Anxiety is your brain's way of preparing you for something it thinks might be dangerous or important. It's like having a smoke detector that goes off when you're just making toast.",
    
    whyItExists: "Back when humans lived in the wild, anxiety kept us alive. Hear a rustle in the bushes? Anxiety said 'RUN!' Today we don't have many lions, but our brain still treats a math test like a predator.",
    
    brainScience: {
      whatsHappening: "Your amygdala (the brain's alarm center) sends out danger signals, flooding your body with adrenaline and cortisol. Your heart races, breathing speeds up, and muscles tense — all to help you fight or flee.",
      funFact: "Your brain can't tell the difference between a real threat (lion) and an imagined one (embarrassment). That's why you can feel terrified about a presentation even though nothing is actually dangerous."
    },
    
    superpower: "Anxiety helps you prepare, stay alert, and perform well under pressure. A little anxiety before a test actually helps you focus! It's your brain saying 'this matters, pay attention.'",
    
    bodySignals: [
      "Racing or pounding heart",
      "Tight chest or hard to breathe",
      "Sweaty palms",
      "Butterflies or nausea",
      "Muscle tension (especially shoulders/jaw)",
      "Restlessness — can't sit still"
    ],
    
    warningSignals: [
      "Avoiding things you used to do",
      "Can't stop worst-case-scenario thinking",
      "Trouble sleeping because your mind won't shut off",
      "Physical symptoms happening a lot",
      "Feeling on edge most of the time"
    ],
    
    copingTips: [
      "Name it to tame it: 'I notice I'm feeling anxious right now'",
      "Ground yourself with 5-4-3-2-1 (5 things you see, 4 hear, etc.)",
      "Slow exhales — breathe out longer than you breathe in",
      "Move your body to burn off the adrenaline",
      "Challenge the thought: 'What's the evidence? What's most likely?'"
    ],
    
    insideOutMoment: "Remember when Riley had to introduce herself at her new school? That tight feeling, racing thoughts, wanting to escape? That's anxiety trying to protect her from potential embarrassment. It meant well, but it made things harder.",
    
    quickTechnique: {
      name: "The 4-7-8 Breath",
      steps: [
        "Breathe in through your nose for 4 seconds",
        "Hold your breath for 7 seconds",
        "Exhale slowly through your mouth for 8 seconds",
        "Repeat 3-4 times"
      ],
      duration: "2 minutes"
    }
  },
  
  {
    id: 'sadness',
    name: 'Sadness',
    emoji: '😢',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#60A5FA'],
    tagline: "i help you slow down, process, and connect with others",
    
    whatItIs: "Sadness is your heart's way of saying 'something matters to me, and it hurts.' It's not weakness — it's proof that you care deeply about things.",
    
    whyItExists: "Sadness tells others we need support. It helps us process loss and change. Without sadness, we couldn't truly appreciate happiness. It's the pause button that lets us reflect and heal.",
    
    brainScience: {
      whatsHappening: "When you're sad, your brain actually slows down certain functions to help you conserve energy and process what happened. Tears contain stress hormones — crying literally releases them from your body.",
      funFact: "Emotional tears have a different chemical makeup than onion tears. They contain more protein and natural painkillers. Crying is your body's way of self-medicating!"
    },
    
    superpower: "Sadness builds empathy, deepens connections, and helps you process difficult experiences so you can move forward. It's also a signal to others that you need support.",
    
    bodySignals: [
      "Heaviness in your chest",
      "Low energy, wanting to sleep",
      "Tears or feeling like crying",
      "Slower movements and speech",
      "Wanting to curl up or be alone",
      "Loss of appetite (or comfort eating)"
    ],
    
    warningSignals: [
      "Feeling hopeless for weeks at a time",
      "Losing interest in everything, even stuff you loved",
      "Thoughts of hurting yourself or not wanting to exist",
      "Can't get out of bed most days",
      "Isolating from everyone"
    ],
    
    copingTips: [
      "Let yourself feel it — don't stuff it down",
      "Talk to someone you trust (it's not complaining, it's processing)",
      "Write it out — journal without filtering",
      "Move gently — even a short walk helps",
      "Do something kind for yourself (comfort without self-destruction)"
    ],
    
    insideOutMoment: "Remember when Sadness touched Riley's core memories and everything felt ruined? But at the end, we learn Sadness was the key to Riley getting help. When Riley finally let herself be sad, her parents could comfort her. Sadness brought connection.",
    
    quickTechnique: {
      name: "Comfort Inventory",
      steps: [
        "Name 3 people who care about you",
        "Think of 1 place that feels safe",
        "Remember 1 time you got through something hard",
        "Identify 1 small comfort you can give yourself right now"
      ],
      duration: "3 minutes"
    }
  },
  
  {
    id: 'anger',
    name: 'Anger',
    emoji: '😤',
    color: '#EF4444',
    gradient: ['#EF4444', '#F87171'],
    tagline: "i'm your protector — i show up when your boundaries are crossed",
    
    whatItIs: "Anger is energy that rises when something feels unfair, when your boundaries are crossed, or when something you care about is threatened. It's not bad — it's information.",
    
    whyItExists: "Anger gives you the energy to stand up for yourself and others. It helped our ancestors protect their families and fight injustice. It's the emotion that says 'this isn't okay.'",
    
    brainScience: {
      whatsHappening: "Your amygdala triggers a rush of adrenaline and noradrenaline. Blood flows to your hands (ready to fight), your heart races, and your prefrontal cortex (logic center) goes a bit offline — which is why we say things we regret when angry.",
      funFact: "It takes about 20 minutes for your body to return to baseline after getting really angry. That's why 'counting to 10' isn't enough for big anger — you need more time."
    },
    
    superpower: "Anger fuels courage, sets boundaries, and motivates change. Every social justice movement was powered by righteous anger. It's the energy that says 'I deserve better.'",
    
    bodySignals: [
      "Heat rising (face, chest, hands)",
      "Clenched jaw or fists",
      "Tense muscles",
      "Faster heartbeat",
      "Urge to yell, throw things, or move aggressively",
      "Tunnel vision — can only see the problem"
    ],
    
    warningSignals: [
      "Exploding over small things",
      "Hurting others (physically or with words)",
      "Staying angry for days",
      "Anger is your default emotion (covering hurt/fear)",
      "People are scared of your reactions"
    ],
    
    copingTips: [
      "Pause before reacting — even 6 seconds helps",
      "Move the energy: push-ups, run, scream into a pillow",
      "Cold water on your face activates your dive reflex and calms you",
      "Ask: 'What am I actually feeling underneath this?'",
      "Wait 20 min before sending that text"
    ],
    
    insideOutMoment: "Remember how Anger kept making Riley want to run away and say harsh things? He was trying to protect her from hurt, but without the other emotions balancing him, things escalated. Anger isn't the villain — but he needs teammates.",
    
    quickTechnique: {
      name: "STOP Technique",
      steps: [
        "S - Stop what you're doing",
        "T - Take a breath (or 5)",
        "O - Observe what you're feeling and thinking",
        "P - Proceed with awareness (respond, don't react)"
      ],
      duration: "1 minute"
    }
  },
  
  {
    id: 'fear',
    name: 'Fear',
    emoji: '😨',
    color: '#A855F7',
    gradient: ['#A855F7', '#C084FC'],
    tagline: "i keep you safe — but sometimes i see danger where there isn't any",
    
    whatItIs: "Fear is your brain's protection system. It's trying to keep you alive and away from threats. Sometimes those threats are real (a speeding car), sometimes they're perceived (judgment from others).",
    
    whyItExists: "Fear kept our ancestors from being eaten by predators. Today, it still protects you from real dangers. The problem is our ancient brain hasn't updated for modern life.",
    
    brainScience: {
      whatsHappening: "Your amygdala detects a potential threat and hits the panic button before your thinking brain can evaluate if it's real. This is why you jump at loud noises before you know what they are.",
      funFact: "Your brain processes fear faster than any other emotion — about 12 milliseconds. That's 40x faster than it takes to blink. Fear is designed to act first, think later."
    },
    
    superpower: "Fear keeps you safe, helps you prepare for challenges, and can even be exhilarating (hello, roller coasters and scary movies). It makes you alert and ready to handle tough situations.",
    
    bodySignals: [
      "Heart racing",
      "Freezing up or feeling paralyzed",
      "Wanting to run away",
      "Sweating",
      "Feeling small or wanting to hide",
      "Hypervigilance (scanning for danger)"
    ],
    
    warningSignals: [
      "Avoiding more and more things",
      "Panic attacks",
      "Fear controlling your decisions",
      "Can't do normal activities because of 'what ifs'",
      "Nightmares or flashbacks"
    ],
    
    copingTips: [
      "Ask: 'Am I safe right now, in this moment?'",
      "Ground yourself in the present (5-4-3-2-1)",
      "Talk back to the fear: 'I hear you, but I'm actually okay'",
      "Gradual exposure — face small fears to build courage",
      "Remember times you were scared but it turned out okay"
    ],
    
    insideOutMoment: "Fear was always imagining worst-case scenarios and trying to keep Riley away from anything risky. But remember — some risks are worth taking. Fear means well, but he's not always right about what's dangerous.",
    
    quickTechnique: {
      name: "Reality Check",
      steps: [
        "Name the fear out loud",
        "Ask: Is this happening RIGHT NOW or am I imagining the future?",
        "What's the MOST LIKELY outcome (not worst case)?",
        "What would I tell a friend who had this fear?"
      ],
      duration: "2 minutes"
    }
  },
  
  {
    id: 'joy',
    name: 'Joy',
    emoji: '😄',
    color: '#FBBF24',
    gradient: ['#FBBF24', '#FCD34D'],
    tagline: "i'm not just happiness — i'm connection, meaning, and savoring the good",
    
    whatItIs: "Joy is more than just feeling good. It's the warmth of connection, the satisfaction of accomplishment, the peace of gratitude. It comes in quiet moments and loud celebrations.",
    
    whyItExists: "Joy motivates us to seek positive experiences, build relationships, and do things that help us thrive. It's your brain's reward system saying 'more of this, please!'",
    
    brainScience: {
      whatsHappening: "Joy releases dopamine (motivation), serotonin (well-being), and oxytocin (bonding). These chemicals don't just make you feel good — they boost your immune system, help you learn, and improve your relationships.",
      funFact: "Your brain is wired with a 'negativity bias' — it remembers bad things more easily than good. That's why you have to intentionally notice and savor joy to balance things out."
    },
    
    superpower: "Joy builds resilience, deepens relationships, and helps you handle hard times. People with more positive emotions live longer, recover faster from setbacks, and have stronger immune systems.",
    
    bodySignals: [
      "Lightness in your body",
      "Smiling (even when alone)",
      "Energy and motivation",
      "Warmth in your chest",
      "Feeling connected to others",
      "Wanting to share the good feeling"
    ],
    
    warningSignals: [
      "Can't remember the last time you felt joy",
      "Good things happen but you can't feel them",
      "Feeling numb or empty",
      "Guilt when you feel happy",
      "Joy only comes from unhealthy sources"
    ],
    
    copingTips: [
      "Savor good moments — pause and really notice them",
      "Share joy with others (it multiplies)",
      "Keep a gratitude practice (3 things daily)",
      "Do things you're good at",
      "Connect with people who lift you up"
    ],
    
    insideOutMoment: "Joy tried to keep Riley happy all the time and push away sadness. But she learned that joy isn't about being happy 24/7 — it's about embracing ALL emotions and finding meaning even in hard times. Joy and Sadness work together.",
    
    quickTechnique: {
      name: "Joy Snapshot",
      steps: [
        "Notice something good happening right now (even tiny)",
        "Pause and really take it in for 20 seconds",
        "Notice where you feel it in your body",
        "Take a mental 'photo' to remember it"
      ],
      duration: "1 minute"
    }
  },
  
  {
    id: 'shame',
    name: 'Shame',
    emoji: '😞',
    color: '#6B7280',
    gradient: ['#6B7280', '#9CA3AF'],
    tagline: "i make you feel like something is wrong with YOU — but that's a lie",
    
    whatItIs: "Shame is the painful feeling that there's something fundamentally wrong with you as a person. It's different from guilt (I did something bad) — shame says 'I AM bad.'",
    
    whyItExists: "Shame evolved to help us stay in our social group — if you felt bad about being rejected, you'd try harder to fit in. But in modern life, shame often does more harm than good.",
    
    brainScience: {
      whatsHappening: "Shame activates the same brain regions as physical pain. That's why it hurts so much. It also triggers a 'shut down' response — you want to hide, disappear, or become invisible.",
      funFact: "Everyone feels shame. It's universal. But shame HATES being talked about — which is exactly why talking about it makes it lose its power."
    },
    
    superpower: "Healthy shame (not toxic shame) can help us recognize when we've genuinely hurt someone and motivate us to make amends. The key is separating 'I did something wrong' from 'I am wrong.'",
    
    bodySignals: [
      "Wanting to disappear or hide",
      "Avoiding eye contact",
      "Making yourself physically smaller",
      "Blushing or feeling hot",
      "Chest tightness",
      "Negative self-talk on repeat"
    ],
    
    warningSignals: [
      "Constant feeling of not being good enough",
      "Hiding parts of yourself from everyone",
      "Perfectionism (if I'm perfect, I won't feel shame)",
      "Attacking yourself with harsh inner criticism",
      "Feeling fundamentally different/broken"
    ],
    
    copingTips: [
      "Talk to someone safe about it — shame dies in the light",
      "Separate behavior from identity ('I made a mistake' not 'I am a mistake')",
      "Ask: Whose voice is this? (Often it's someone else's criticism we internalized)",
      "Practice self-compassion: What would you say to a friend?",
      "Remember: Everyone has stuff they're ashamed of. You're human."
    ],
    
    insideOutMoment: "Shame wasn't in Inside Out, but imagine if there was a character who made Riley want to hide under her bed and never come out, whispering 'everyone thinks you're weird.' That's shame. The antidote? Connection and being seen anyway.",
    
    quickTechnique: {
      name: "Self-Compassion Break",
      steps: [
        "Put your hand on your heart",
        "Say: 'This is a moment of suffering'",
        "Say: 'Suffering is part of being human'",
        "Say: 'May I be kind to myself right now'"
      ],
      duration: "1 minute"
    }
  },
  
  {
    id: 'overwhelmed',
    name: 'Overwhelmed',
    emoji: '🤯',
    color: '#EC4899',
    gradient: ['#EC4899', '#F472B6'],
    tagline: "i show up when there's too much — too many tasks, feelings, or expectations",
    
    whatItIs: "Overwhelm is your brain's way of saying 'system overload.' It's not weakness — it's a signal that you've hit your capacity and need to offload something.",
    
    whyItExists: "Your brain has limited processing power. When too much comes at once — deadlines, emotions, social stuff — overwhelm is the alarm saying 'slow down before you crash.'",
    
    brainScience: {
      whatsHappening: "Your prefrontal cortex (the planning/organizing part) gets flooded and starts to shut down. That's why you can't think straight or make decisions when overwhelmed. It's not laziness — it's overload.",
      funFact: "Your working memory can only hold about 4-7 things at once. When you're trying to juggle more, everything starts to fall."
    },
    
    superpower: "Overwhelm forces you to prioritize. It's your brain demanding that you figure out what actually matters and let go of the rest.",
    
    bodySignals: [
      "Can't think straight or make decisions",
      "Wanting to cry or shut down",
      "Paralysis — can't start anything",
      "Tight chest, shallow breathing",
      "Snapping at people",
      "Wanting to escape or hide"
    ],
    
    warningSignals: [
      "Constantly saying 'I can't handle this'",
      "Avoiding everything instead of tackling anything",
      "Breaking down regularly",
      "Physical symptoms (headaches, stomach issues)",
      "Feeling like you're drowning daily"
    ],
    
    copingTips: [
      "Brain dump: write EVERYTHING down to get it out of your head",
      "Pick ONE thing — just the next small step",
      "It's okay to drop balls. Not everything is equally important",
      "Ask for help — seriously, people want to help",
      "Take 5 minutes to just breathe before deciding anything"
    ],
    
    insideOutMoment: "Remember when ALL of Riley's emotions were pressing buttons at once during the move? That chaos, that inability to function — that's overwhelm. The fix wasn't doing more; it was letting things settle.",
    
    quickTechnique: {
      name: "Brain Dump + Pick One",
      steps: [
        "Write down EVERYTHING on your mind (2 min, no editing)",
        "Circle the ONE thing that would help most right now",
        "Cross out anything that can wait til tomorrow",
        "Do the ONE thing for just 10 minutes"
      ],
      duration: "5 minutes"
    }
  },
  
  {
    id: 'lonely',
    name: 'Lonely',
    emoji: '🥺',
    color: '#6366F1',
    gradient: ['#6366F1', '#818CF8'],
    tagline: "i'm not about being alone — i'm about feeling unseen and disconnected",
    
    whatItIs: "Loneliness isn't about how many people are around you — it's about feeling truly seen and connected. You can be lonely in a crowd and content alone. It's about the quality of connection.",
    
    whyItExists: "Humans are social creatures. We literally need connection to survive and thrive. Loneliness is your brain's signal that you need more meaningful interaction.",
    
    brainScience: {
      whatsHappening: "Loneliness activates the same brain regions as physical pain. It also increases cortisol (stress hormone) and can affect your immune system. Your brain treats social disconnection as a survival threat.",
      funFact: "Social media can actually increase loneliness because it often provides 'junk food' connection — looks filling but isn't nourishing."
    },
    
    superpower: "Loneliness motivates you to seek real connection. It can push you to reach out, be vulnerable, and build deeper relationships.",
    
    bodySignals: [
      "Ache in your chest",
      "Feeling invisible or unseen",
      "Scrolling social media but feeling worse",
      "Craving deep conversation",
      "Feeling like no one 'gets' you",
      "Empty even when busy"
    ],
    
    warningSignals: [
      "Isolating yourself more and more",
      "Feeling like a burden to others",
      "Believing no one would notice if you disappeared",
      "Weeks without meaningful conversation",
      "Using substances or screens to numb the feeling"
    ],
    
    copingTips: [
      "Text ONE person — even just 'hey, thinking of you'",
      "Quality > quantity — one real friend beats 100 followers",
      "Be the initiator — don't wait to be invited",
      "Join something (club, team, group) around an interest",
      "Talk to a counselor — they're literally trained for this"
    ],
    
    insideOutMoment: "Think of Riley when she first moved — surrounded by family but completely alone inside. Her parents were there but didn't really see what she was going through. That's loneliness.",
    
    quickTechnique: {
      name: "Reach Out Right Now",
      steps: [
        "Think of ONE person you trust (even a little)",
        "Send them a text: 'hey, been thinking of you'",
        "Or: 'having a rough day, you around?'",
        "Don't overthink it — connection starts small"
      ],
      duration: "2 minutes"
    }
  },
  
  {
    id: 'jealous',
    name: 'Jealousy',
    emoji: '😒',
    color: '#22C55E',
    gradient: ['#22C55E', '#4ADE80'],
    tagline: "i point at what you want — the question is what will you do about it",
    
    whatItIs: "Jealousy is the uncomfortable feeling when someone has something you want — attention, success, relationships, stuff. It's often mixed with fear of losing what you have or not getting what you deserve.",
    
    whyItExists: "Jealousy helped our ancestors compete for resources and mates. Today, it can highlight what you truly value and want for yourself.",
    
    brainScience: {
      whatsHappening: "Jealousy activates your brain's threat detection system and reward centers simultaneously. You perceive a threat to something you value while also wanting what someone else has.",
      funFact: "Social media has supercharged jealousy because you're constantly comparing your real life to everyone's highlight reels."
    },
    
    superpower: "Jealousy is information. It shows you what you actually want. Instead of just feeling bad, you can use it as a compass for your goals.",
    
    bodySignals: [
      "Tightness in chest or stomach",
      "Obsessing over someone's success/life",
      "Urge to criticize or put them down",
      "Feeling 'less than' or inadequate",
      "Compulsive social media checking",
      "Bitterness or resentment"
    ],
    
    warningSignals: [
      "Constant comparison to others",
      "Can't be happy for anyone",
      "Sabotaging relationships over jealousy",
      "Obsessing over specific people",
      "Your self-worth depends on being 'better than'"
    ],
    
    copingTips: [
      "Ask: What does this jealousy tell me I want?",
      "Their success doesn't reduce yours — abundance mindset",
      "Limit social media comparison time",
      "Use it as motivation, not bitterness",
      "Practice genuine compliments (it helps, seriously)"
    ],
    
    insideOutMoment: "Imagine if Riley saw a new kid get all the attention she used to get. That burning feeling of 'that should be me' — that's jealousy. The movie Turning Red shows this with Mei and her friends.",
    
    quickTechnique: {
      name: "Jealousy to Clarity",
      steps: [
        "Name exactly what you're jealous of",
        "Ask: Do I actually want this, or just think I should?",
        "If yes: What's ONE step toward getting it myself?",
        "If no: Why am I comparing myself here?"
      ],
      duration: "3 minutes"
    }
  },
  
  {
    id: 'embarrassed',
    name: 'Embarrassment',
    emoji: '😳',
    color: '#F97316',
    gradient: ['#F97316', '#FB923C'],
    tagline: "i'm the spotlight feeling — when you think everyone is watching and judging",
    
    whatItIs: "Embarrassment is that hot, wanting-to-disappear feeling when you think you've done something socially awkward or exposed something about yourself. It's different from shame — it's usually about a moment, not your whole identity.",
    
    whyItExists: "Embarrassment helps us fit into social groups. It teaches us social norms and motivates us to repair social mistakes. It's evolution's way of saying 'let's not do that again.'",
    
    brainScience: {
      whatsHappening: "Blood rushes to your face (blushing), your body heats up, and your brain goes into 'everyone is watching' mode. The spotlight effect makes you think people notice way more than they actually do.",
      funFact: "Studies show people barely notice or remember your embarrassing moments. That thing you cringe about? Others forgot in 5 minutes."
    },
    
    superpower: "Embarrassment shows you care about how you come across. It also makes you relatable — people who never get embarrassed seem robotic. Owning it can be charming.",
    
    bodySignals: [
      "Face getting hot (blushing)",
      "Wanting to disappear or run away",
      "Nervous laughter",
      "Avoiding eye contact",
      "Replaying the moment over and over",
      "Physical cringing"
    ],
    
    warningSignals: [
      "Avoiding all situations where you might be embarrassed",
      "Constant fear of judgment",
      "Old embarrassments keeping you up at night",
      "Never speaking up or being yourself",
      "Apologizing constantly for existing"
    ],
    
    copingTips: [
      "The spotlight effect: people notice 10% of what you think they notice",
      "Laugh at yourself — owning it takes away its power",
      "Everyone has embarrassing moments. Literally everyone.",
      "In a week, no one will remember. In a month, definitely not.",
      "Embarrassment is temporary; avoiding life is permanent"
    ],
    
    insideOutMoment: "Remember Riley's first day at school when she started crying in front of everyone? That burning need to disappear? Classic embarrassment. But here's the thing — her classmates weren't judging; they felt for her.",
    
    quickTechnique: {
      name: "Embarrassment Reset",
      steps: [
        "Take 3 deep breaths (seriously, do it)",
        "Ask: Will this matter in 5 years? (probably not)",
        "Remember: Everyone is too worried about themselves to focus on you",
        "Laugh if you can — 'well that happened 😅'"
      ],
      duration: "1 minute"
    }
  },
  
  {
    id: 'frustrated',
    name: 'Frustration',
    emoji: '😤',
    color: '#EF4444',
    gradient: ['#EF4444', '#F87171'],
    tagline: "i show up when things aren't working — and i want them fixed NOW",
    
    whatItIs: "Frustration is the feeling of being blocked from a goal. Something isn't working, someone isn't understanding, progress isn't happening — and you're stuck. It's anger's annoying little sibling.",
    
    whyItExists: "Frustration motivates problem-solving. It pushes you to find new approaches, ask for help, or persist through obstacles. It's energy for change.",
    
    brainScience: {
      whatsHappening: "Your brain expects a certain outcome, and when reality doesn't match, it creates tension. This releases cortisol and adrenaline — giving you energy but also making you tense.",
      funFact: "Frustration tolerance is like a muscle — the more you work through frustrations, the better you get at handling them."
    },
    
    superpower: "Frustration is persistence fuel. People who achieve big things aren't frustration-free — they're good at channeling it. It means you care about the outcome.",
    
    bodySignals: [
      "Tense muscles, especially jaw and shoulders",
      "Sighing repeatedly",
      "Urge to give up or throw things",
      "Racing, impatient thoughts",
      "Snapping at people",
      "Inability to sit still"
    ],
    
    warningSignals: [
      "Constantly frustrated at everything",
      "Taking it out on others",
      "Destroying relationships over small stuff",
      "Rage quitting everything",
      "Frustration turning into hopelessness"
    ],
    
    copingTips: [
      "Step away for 5-10 minutes — fresh eyes help",
      "Ask: Is this approach working, or do I need a new one?",
      "Break it down smaller — what's the NEXT tiny step?",
      "Ask for help — someone else might see the solution",
      "Physical release — squeeze something, do push-ups"
    ],
    
    insideOutMoment: "In Inside Out 2, Anxiety keeps trying to control everything and getting more and more frustrated when it doesn't work. The lesson? Sometimes you have to let go of controlling the outcome.",
    
    quickTechnique: {
      name: "Frustration Pause",
      steps: [
        "Stop what you're doing",
        "10 deep breaths or 20 jumping jacks",
        "Ask: 'What's actually in my control here?'",
        "Either try a different approach or take a real break"
      ],
      duration: "3 minutes"
    }
  }
];

// Get emotion by ID
export const getEmotionGuide = (id: string): EmotionGuide | undefined => {
  return EMOTION_GUIDES.find(e => e.id === id);
};

// Get all emotion IDs
export const getEmotionIds = (): string[] => {
  return EMOTION_GUIDES.map(e => e.id);
};
