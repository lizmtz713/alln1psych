/**
 * THE GAUGE SYSTEM - The Heart of InGauge
 * 
 * This isn't just self-help. This is a new operating system for being human.
 * Master all 6 gauges and become Self InGauged.
 */

export interface GaugeSensory {
  feel: string;      // Physical sensations
  look: string;      // How it shows up in your life/behavior
  sound: string;     // Internal narrative, what you say to yourself
  taste: string;     // The emotional flavor, the quality of experience
}

export interface GaugeState {
  healthy: string;   // What it looks/feels like when balanced
  unhealthy: string; // What it looks/feels like when depleted/dysregulated
}

export interface GaugeSection {
  title: string;
  content: string;
}

export interface GaugeData {
  id: string;
  emoji: string;
  name: string;
  color: string;
  tagline: string;
  coreTruth: string;           // The one sentence that captures this gauge
  description: string;
  
  // Sensory Experience
  whenLow: GaugeSensory;
  whenHealthy: GaugeSensory;
  
  // The Good and The Bad
  theGood: string[];           // What this gauge gives you when working well
  theBad: string[];            // What happens when neglected/dysregulated
  
  // Deep Sections
  sections: GaugeSection[];
  
  // Actionable
  checkIn: string;             // How to check this gauge right now
  quickFixes: string[];        // Immediate actions to improve
  deepWork: string;            // Long-term work to master this gauge
  
  // Real World
  realWorld: string[];
  
  // Science
  science: string;
  
  // Connection to others
  rippleEffect: string;        // How this gauge affects your relationships and the world
}

export const SELF_INGAUGED = {
  title: "Self InGauged",
  meaning: "When you truly understand all 6 gauges - not just intellectually, but in your bones - you become Self InGauged. You can read your own dashboard. You know what's happening inside you and why. You have the language to understand yourself and the tools to regulate yourself. You're no longer at the mercy of moods that come from nowhere. You're no longer confused by your own reactions. You're not fixed - you're fluent.",
  
  whyItMatters: {
    forYou: "Imagine never again saying 'I don't know why I feel this way.' Imagine catching yourself before you spiral, before you snap, before you shut down. Imagine knowing exactly what you need and being able to ask for it. That's what Self InGauged means.",
    
    forLovedOnes: "When you understand yourself, you stop taking things out on the people you love. You stop expecting them to read your mind. You can say 'I'm activated right now, give me 10 minutes' instead of starting a fight. You can say 'my Connection gauge is low, I need quality time' instead of getting resentful. You become easier to love - not because you're perfect, but because you're legible.",
    
    forTheWorld: "Imagine a world where people could say 'I'm in freeze state right now' instead of being called lazy. Where 'my alignment is off' replaced vague guilt. Where 'I'm not angry, I'm hurt' stopped conflicts before they started. Self InGauged people raise Self InGauged kids. They build Self InGauged teams. They create cultures where emotional intelligence isn't soft - it's standard. This is how the world changes: one dashboard at a time.",
  },
  
  theMovement: {
    tagline: "Get InGauged. Stay InGauged. Help others get InGauged.",
    vision: "We believe emotional intelligence shouldn't be a privilege. It shouldn't require years of therapy or expensive coaches. Everyone deserves to understand their own operating system. When you share InGauge, you're not just sharing an app - you're sharing a language. A framework. A way of being human that actually makes sense.",
    callToAction: "The people you love deserve this too. Your kids, your partner, your friends, your coworkers. Not because they're broken - because they're human. And humans deserve a manual.",
  }
};

export const GAUGE_SYSTEM_INTRO = {
  headline: "You are not broken. You are a system.",
  subhead: "And now you have a dashboard.",
  philosophy: `Most self-help treats you like a problem to fix. Like there's something wrong with you that needs correcting. InGauge is different.

You're not broken. You're a biological system running on hardware (your body), software (your mind), and firmware (your nervous system). When a car's check engine light comes on, we don't shame the car. We check what's wrong. We read the gauges.

These 6 gauges are your operating system. They're always running, always communicating. The question isn't whether they're active - it's whether you're paying attention.

Check them regularly, and you'll finally know what's actually going on inside. You'll stop being confused by your own moods. You'll stop taking your stress out on people you love. You'll have language for what you feel and tools for what you need.

This is the manual you should have been given at birth.`,
};

export const GAUGES: GaugeData[] = [
  {
    id: 'body',
    emoji: '🫀',
    name: 'Body',
    color: '#F87171',
    tagline: 'The hardware running everything',
    coreTruth: "You can't run good software on broken hardware.",
    
    description: "Your body isn't separate from your emotions - it IS the foundation they run on. Every thought requires glucose. Every feeling requires neurotransmitters. Every decision requires a prefrontal cortex that's actually online. When the body fails, everything fails. This isn't weakness. This is physics.",
    
    whenLow: {
      feel: "Heavy limbs. Foggy head. Tight shoulders. Shallow breathing. That bone-deep tiredness that sleep doesn't fix. Cravings you can't explain. Headaches that come from nowhere. A body that feels like it's working against you.",
      look: "Snapping at people for small things. Can't focus. Making bad decisions. Reaching for sugar, caffeine, alcohol. Skipping workouts. Canceling plans. Looking tired in the mirror. Getting sick more often.",
      sound: "'I'm so exhausted.' 'I don't know what's wrong with me.' 'I just need to push through.' 'I'll rest when this is over.' 'Why can't I just get it together?'",
      taste: "Like running on empty. Like everything requires twice the effort. Like your body is a burden instead of a home."
    },
    
    whenHealthy: {
      feel: "Energy that lasts through the day. Clear head. Body that feels like it's working WITH you. Waking up actually rested. Steady mood without the crashes. Strength you can count on.",
      look: "Handling stress without falling apart. Having energy for the things you care about. Skin looks better. Eyes look brighter. Moving through the world with ease instead of effort.",
      sound: "'I feel good today.' 'I have the energy for this.' 'My body is telling me to rest and I'm going to listen.' 'I'm taking care of myself.'",
      taste: "Like having a full tank. Like your body is an ally. Like the foundation is solid and you can build anything on it."
    },
    
    theGood: [
      "Clear thinking and sharp decisions",
      "Emotional stability and resilience",
      "Energy to show up for what matters",
      "Stronger immune system",
      "Better relationships (you're not taking depletion out on others)",
      "Longer healthspan and lifespan",
      "The confidence that comes from physical wellbeing"
    ],
    
    theBad: [
      "Emotional volatility you can't control",
      "Brain fog and poor decisions",
      "Chronic fatigue that rest doesn't fix",
      "Getting sick constantly",
      "Snapping at loved ones for no real reason",
      "Anxiety and depression symptoms (that might be physical)",
      "Aging faster than your years"
    ],
    
    sections: [
      {
        title: "The Big 5 Body Inputs",
        content: `Sleep: 7-9 hours for adults isn't a luxury - it's a biological requirement. Less than 6 hours = cognitive impairment equivalent to being legally drunk. Your brain consolidates emotional memories during REM; skip it and yesterday's stress bleeds into today. Chronic sleep debt can't be repaid with one good night.

Food: Your brain burns 20% of your daily calories despite being 2% of your body weight. Low blood sugar creates identical symptoms to anxiety - racing heart, sweaty palms, impending doom. Eat protein with every meal; it stabilizes glucose and provides amino acids for neurotransmitters.

Water: Your brain is 75% water. Dehydration of just 1-2% impairs cognition, mood, and concentration. By the time you feel thirsty, you're already impaired. Most people are chronically, mildly dehydrated and have no idea how much better they could feel.

Movement: Exercise releases BDNF - brain-derived neurotrophic factor - which is essentially fertilizer for your neurons. A 20-minute walk changes your neurochemistry. Sitting for 8+ hours increases anxiety and depression risk independent of other factors.

Hormones: Cortisol, estrogen, testosterone, thyroid, insulin - these invisible chemicals shape your mood more than your circumstances. Menstrual cycles, chronic stress, aging, and medications all shift the chemical soup you're swimming in. What feels like a psychological problem might be hormonal.`
      },
      {
        title: "The Body-Emotion Feedback Loop",
        content: `Here's what most people miss: emotions aren't just mental events - they're physical states. Anxiety IS a racing heart and shallow breathing. Sadness IS heaviness and slowed movement. You can't separate the feeling from the sensation because they're the same thing.

This is why cognitive approaches ('think positive') often fail while body-based approaches (breathing, movement, temperature change) work. You're not going around the emotion - you're addressing it at its source.

When your body is depleted, your emotional capacity shrinks. The same frustration that's manageable at full tank becomes overwhelming at empty. You're not overreacting - you have less bandwidth.

The Body gauge comes first because it sets the capacity for everything else.`
      }
    ],
    
    checkIn: "Right now: When did you last eat something with protein? How many hours of sleep last night? How much water today? When did you last move for 20+ minutes? Rate your physical energy 1-10.",
    
    quickFixes: [
      "Drink a full glass of water right now",
      "Eat something with protein if it's been 4+ hours",
      "Stand up and stretch for 2 minutes",
      "Take 5 deep breaths",
      "Step outside for fresh air and light"
    ],
    
    deepWork: "Track your Big 5 for two weeks. Notice the correlation between body inputs and emotional states. Most people are shocked by how much their mood depends on basics. Build non-negotiable routines: sleep schedule, meals, hydration, movement. Protect these like your wellbeing depends on them - because it does.",
    
    realWorld: [
      "A mother snaps at her kids every evening at 5pm. She thinks she has an anger problem. She actually has a blood sugar problem - she hasn't eaten since noon. A snack at 3:30pm with protein changes her entire evening. Same woman, same kids, same situation - different body state.",
      "A college student can't focus or regulate emotions on Sunday nights. It's not just Monday dread - his weekend sleep schedule (staying up until 3am) has disrupted his circadian rhythm. His Sunday anxiety is actually Saturday's sleep deprivation. Fix the sleep, fix the scaries.",
      "A professional feels 'randomly anxious' every afternoon around 2pm. When she tracks it, it correlates perfectly with skipping lunch. The anxiety wasn't random - it was hunger wearing an anxiety costume. Same physical symptoms, different cause, different solution."
    ],
    
    science: "Sleep deprivation amplifies amygdala reactivity by 60% - your brain's alarm system literally runs hotter when tired (Walker, 2017). Dehydration of 1-2% impairs cognitive function and elevates cortisol (Biopsychology, Pinel). The gut produces 95% of the body's serotonin; gut health directly impacts mood (gut-brain axis research). Exercise increases BDNF and reduces depression symptoms as effectively as medication in some studies (Ratey, 2008).",
    
    rippleEffect: "When your Body gauge is healthy, you have capacity for others. You don't snap at your partner because you're hungry. You don't cancel on friends because you're exhausted. You show up as the person you want to be instead of the depleted version running on empty. The people around you feel the difference even if they can't name it."
  },
  
  {
    id: 'state',
    emoji: '⚡',
    name: 'State',
    color: '#FACC15',
    tagline: 'Your nervous system right now',
    coreTruth: "Your state determines your reality. Same situation, different nervous system state, completely different experience.",
    
    description: "Your autonomic nervous system is always in one of three modes: activated (fight/flight), calm (rest/digest), or shutdown (freeze). This isn't something you choose - it's something that happens TO you, faster than thought. And here's the key: your state determines how you perceive everything. The same words from your partner sound like love when you're regulated and like criticism when you're activated. You're not being dramatic. Your nervous system is running a different program.",
    
    whenLow: {
      feel: "Activated: Racing heart. Tight chest. Can't sit still. Muscles tense. Ready to fight or run. Freeze: Numb. Heavy. Can't move. Disconnected from your body. Like you're watching through glass.",
      look: "Activated: Snapping at people. Defensive. Can't listen. Interpreting everything as threat. Freeze: Zoning out. Canceling everything. Can't make decisions. Appearing 'lazy' or 'checked out.'",
      sound: "Activated: 'Everyone is against me.' 'I need to defend myself.' 'This is an emergency.' Freeze: 'What's the point?' 'I can't do anything.' 'I just want to disappear.' 'Nothing matters.'",
      taste: "Activated: Like electricity under the skin. Like danger everywhere. Freeze: Like being underwater. Like reality has a filter over it. Like existing takes too much effort."
    },
    
    whenHealthy: {
      feel: "Present. Grounded. Heart rate steady. Breathing naturally deep. Body relaxed but alert. Able to feel feelings without being overwhelmed by them.",
      look: "Responding instead of reacting. Able to pause before speaking. Curious instead of defensive. Connecting easily with others. Rolling with challenges.",
      sound: "'I can handle this.' 'Let me think about that.' 'I hear what you're saying.' 'I'm okay right now.' 'I have what I need.'",
      taste: "Like being home in your body. Like the world is manageable. Like you have choices. Like safety."
    },
    
    theGood: [
      "Clear thinking and good decisions",
      "Ability to connect and be present with others",
      "Responding thoughtfully instead of reacting",
      "Emotional experiences you can ride without drowning",
      "Access to creativity, humor, and play",
      "Resilience when things go wrong",
      "Others feel safe around you"
    ],
    
    theBad: [
      "Saying things you regret when activated",
      "Relationships damaged by reactivity",
      "Chronic anxiety or numbness",
      "Can't access your best thinking",
      "Life feels like constant threat or constant fog",
      "Others walk on eggshells around you",
      "Physical health issues from chronic activation"
    ],
    
    sections: [
      {
        title: "The Three States",
        content: `Fight/Flight (Sympathetic Activation): Your gas pedal. Heart races, pupils dilate, blood flows to muscles, digestion stops. You're ready for action, scanning for threat. When you're here, everything looks dangerous. The tone of voice that's neutral when you're calm sounds attacking. The feedback that's helpful when regulated sounds like criticism.

Rest/Digest (Parasympathetic/Ventral Vagal): Your brake. Heart slows, body relaxes, digestion works, prefrontal cortex comes online. This is where you can think clearly, connect with others, and see situations accurately. This is where you want to live most of the time.

Freeze/Shutdown (Dorsal Vagal): Your emergency brake. When threat is overwhelming and you can't fight or flee, the system shuts down. Numbness, dissociation, collapse. This is an ancient survival response - playing dead when the predator is too powerful. This isn't laziness. It's biology. Depression often has freeze-state components.`
      },
      {
        title: "Why 'Just Calm Down' Never Works",
        content: `Your autonomic nervous system operates faster than thought. The amygdala can detect and respond to threat in 12 milliseconds - before you're consciously aware anything happened. By the time you know you're upset, your body has already flooded with cortisol and adrenaline.

This is why you can't think your way out of activation. You can't 'be rational' when your prefrontal cortex is offline. You can't 'just relax' when your body is in survival mode. The thinking brain doesn't control the survival brain - it's the other way around.

The only way out is through the body. Slow exhales (longer out than in) activate the parasympathetic system. The vagus nerve responds to breath patterns, not thoughts. Cold water on the face triggers the dive reflex. Movement discharges activation energy. Co-regulation with a calm person works because nervous systems sync.

Regulate the body first. Then think.`
      },
      {
        title: "The Window of Tolerance",
        content: `You have a window within which you can experience stress and still function well - still think, still connect, still make good choices. This is your window of tolerance.

Above the window = hyperarousal (fight/flight). Below the window = hypoarousal (freeze). Inside the window = where life happens well.

Different people have different sized windows. Trauma shrinks the window. Healing expands it. Chronic stress keeps you at the edges. Good regulation keeps you in the middle.

The goal isn't to never be activated or never freeze. The goal is to expand your window and have reliable tools to get back inside it.`
      }
    ],
    
    checkIn: "Right now: Is your heart rate elevated or normal? Is your breathing shallow or deep? Are your muscles tense or relaxed? Can you think clearly? On a scale of activation (10) to freeze (-10) to calm (0), where are you?",
    
    quickFixes: [
      "Box breathing: 4 counts in, 4 hold, 4 out, 4 hold. Repeat 4x.",
      "Cold water on face or wrists (activates dive reflex)",
      "Shake out your hands and body for 30 seconds",
      "Push hard against a wall for 10 seconds, then release",
      "Hum or sing (vibrates vagus nerve)"
    ],
    
    deepWork: "Learn your personal activation signals. Track what dysregulates you. Build a regulation toolkit that works for YOUR body. Practice down-regulation when you're NOT activated so it's available when you are. Work with a trauma-informed therapist if your window is very narrow.",
    
    realWorld: [
      "A couple has the same argument every week. Both people are saying reasonable things. But they're having it when both are activated - after work, hungry, tired. The words aren't the problem; the state is. When they learn to check state before engaging difficult topics, the arguments stop.",
      "Someone who 'can't get off the couch' isn't lazy - they're in freeze. Their nervous system is in shutdown mode. Telling them to 'just do it' increases shame without addressing the state. Gentle activation (stretching, humming, small movements) works better than willpower.",
      "A professional always says things in meetings she regrets. She's not unprofessional - she's activated. Her nervous system interprets disagreement as threat. When she learns to regulate before speaking, she keeps her job and her relationships."
    ],
    
    science: "Polyvagal Theory (Stephen Porges) maps three branches of the autonomic nervous system and their behavioral correlates. The amygdala triggers threat response in 12 milliseconds - before conscious awareness (LeDoux). Heart rate variability (HRV) is a measurable indicator of nervous system flexibility. Co-regulation is documented: proximity to a regulated person measurably affects another's HRV (interpersonal physiology research).",
    
    rippleEffect: "Your nervous system state is contagious. When you're activated, the people around you activate. When you're regulated, you become a regulating presence for others. Parents who can regulate raise kids who learn to regulate. Leaders who stay calm create teams that stay calm under pressure. Your state doesn't just affect you - it ripples outward."
  },
  
  {
    id: 'emotion',
    emoji: '💜',
    name: 'Emotion',
    color: '#A78BFA',
    tagline: 'What you\'re actually feeling',
    coreTruth: "Emotions aren't problems to solve. They're messages to understand.",
    
    description: "Emotions are your brain's rapid assessment system. Fear says 'threat detected.' Anger says 'boundary violated.' Sadness says 'loss registered.' Guilt says 'I acted against my values.' They evolved over millions of years to give you crucial information about your environment, relationships, and needs. The problem isn't having emotions - it's not knowing how to read them.",
    
    whenLow: {
      feel: "Overwhelmed by feelings you can't name. Emotional storms that come from nowhere. Numbness when you know you should feel something. The same few emotions on repeat (angry, anxious, fine). Feelings that get stuck instead of moving through.",
      look: "Overreacting to small things. Underreacting to big things. Not knowing why you're upset. Saying 'I'm fine' when you're not. Letting feelings drive behavior you regret.",
      sound: "'I don't know why I feel this way.' 'I shouldn't feel like this.' 'I'm just angry' (about everything). 'I'm fine' (when you're not). 'I can't handle this.'",
      taste: "Like being lost in a storm. Like feelings are enemies. Like emotional life is something that happens TO you, not WITH you."
    },
    
    whenHealthy: {
      feel: "Feelings that you can name precisely. Emotions that move through instead of getting stuck. Ability to feel fully without being controlled by feelings. The right feeling at the right intensity for the situation.",
      look: "Naming what you feel accurately. Expressing emotions appropriately. Using feelings as information for decisions. Bouncing back from difficult emotions. Emotional range - access to the full spectrum.",
      sound: "'I'm feeling disappointed and a little embarrassed.' 'This anger is telling me my boundary was crossed.' 'I notice I'm anxious - let me figure out why.' 'I can feel this without acting on it.'",
      taste: "Like emotional life is information you can use. Like feelings are allies. Like you're fluent in your own internal language."
    },
    
    theGood: [
      "Clear information about your needs and values",
      "Connection with others through shared emotional experience",
      "Motivation and energy from healthy emotion",
      "Better decisions informed by emotional data",
      "Authenticity - being genuinely who you are",
      "Resilience - ability to feel hard things and recover",
      "Richer experience of life - joy, love, awe, excitement"
    ],
    
    theBad: [
      "Being controlled by emotions you don't understand",
      "Damaged relationships from unregulated expression",
      "Physical health impacts from suppressed emotion",
      "Missing important information your feelings carry",
      "Chronic anxiety, anger, or numbness",
      "The exhaustion of emotional avoidance",
      "Feeling like a stranger to yourself"
    ],
    
    sections: [
      {
        title: "27+ Emotions, Not Just 5",
        content: `Most people rotate through maybe 5-7 emotion words: happy, sad, angry, anxious, stressed, tired, fine. But research identifies at least 27 distinct emotional states, and some models suggest hundreds of nuanced emotional experiences.

The difference matters. 'Frustrated' and 'disappointed' feel different and need different responses. 'Anxious' and 'excited' produce nearly identical body sensations - racing heart, butterflies - but the label you apply changes everything. 'Sad' is different from 'lonely' is different from 'grief.'

This is called emotional granularity, and it's one of the strongest predictors of mental health. People who can precisely name what they feel regulate better, have fewer depression symptoms, and recover from setbacks faster. It's not about being 'emotional' - it's about being emotionally literate.

Expanding your vocabulary isn't just semantics. It's giving your brain more precise data to work with.`
      },
      {
        title: "Primary vs. Secondary Emotions",
        content: `Anger is almost never the real feeling. It's the bodyguard - it shows up to protect something more vulnerable underneath. Under anger, you'll usually find hurt ('they didn't care about me'), fear ('I might lose this'), or powerlessness ('I can't control this situation').

Anxiety often masks grief, unprocessed fear, or excitement that got mislabeled. 'Laziness' masks overwhelm, depression, or freeze state. 'Fine' almost always hides something else.

The therapeutic question is always: 'What's underneath this?' Keep asking until you hit something that resonates. When you address the primary emotion, the secondary one often dissolves.

A person who thinks they have an anger problem often has a hurt problem they've never addressed. Once they can say 'I'm hurt,' the anger loses its grip.`
      },
      {
        title: "Name It to Tame It",
        content: `Brain imaging shows that simply naming an emotion - putting words to what you feel - reduces amygdala activation. This is called affect labeling, and it's one of the simplest, most effective emotional regulation strategies.

When you say 'I'm feeling anxious about the presentation,' you move processing from the emotional brain to the prefrontal cortex. You're not wallowing - you're literally helping your brain process the emotion.

But the label has to be accurate. Calling everything 'stressed' doesn't help. Saying 'I'm nervous about the outcome, disappointed in myself for procrastinating, and honestly a little excited underneath' - that gives your brain specific information to work with.

The emotion wheel exists because sometimes you need help finding the right word. Using it isn't a crutch. It's expanding your operating vocabulary.`
      },
      {
        title: "Emotions Are Physical",
        content: `Every emotion has a body signature. Anxiety: tight chest, shallow breathing, racing heart, butterflies. Sadness: heaviness, low energy, throat tightness. Shame: heat in face, desire to curl inward, can't make eye contact. Joy: expansion, lightness, upward energy.

This is why you can't 'think' your way out of an emotion - it's not just in your head. The feeling is the body sensation. They're the same phenomenon described two ways.

This is also why body-based approaches work when cognitive approaches fail. Breathing into the tightness. Moving the heavy energy. Noticing where the emotion lives physically. You're not going around the emotion - you're meeting it where it actually exists.

Ask yourself: 'Where do I feel this in my body? What shape is it? What temperature? What texture?' This isn't woo. It's how emotions actually work.`
      }
    ],
    
    checkIn: "Right now: What are you feeling - specifically? Can you name at least 3 distinct feelings present? Where do you feel each one in your body? What might each feeling be trying to tell you?",
    
    quickFixes: [
      "Name it: 'I'm feeling ___' (use an emotion wheel if needed)",
      "Find it in your body: Where is the sensation?",
      "Ask: What's underneath this? What's this feeling protecting?",
      "Write for 5 minutes without stopping about how you feel",
      "Tell someone you trust what you're actually feeling"
    ],
    
    deepWork: "Build your emotional vocabulary - study the emotion wheel, learn new words. Practice noticing and naming throughout the day. Track what triggers what. Learn your personal patterns (e.g., 'I go to anger when I'm actually scared'). Consider therapy to process stuck emotions and expand capacity.",
    
    realWorld: [
      "A person who always says 'I'm fine' when they're not is suppressing, which research shows increases internal stress and cortisol. The brave face doesn't help; it costs more. When they finally name the feeling - overwhelmed, lonely, scared - it becomes manageable. Naming didn't create the feeling; it gave it a handle.",
      "A manager snaps at his team every Monday morning. He thinks he has an anger problem. Underneath: dread of the week ahead and fear of underperforming. Once he names the fear and addresses it, the anger loses its grip. Different target, same energy.",
      "Someone feels 'anxious' before every exam. When they get granular: nervous about the outcome, excited about proving what they know, and tired from staying up late studying. Three different feelings need three different responses. 'I'm anxious' collapses them all into one unsolvable problem."
    ],
    
    science: "Emotional granularity predicts mental health outcomes independently of other factors (Lisa Feldman Barrett). Affect labeling reduces amygdala activation in fMRI studies (Lieberman et al.). Suppression of emotions increases sympathetic nervous system activity and impairs memory for events (Gross). Emotions have documented physiological signatures across cultures (Ekman, Levenson).",
    
    rippleEffect: "Emotionally literate people create emotionally literate families. Kids learn to name their feelings from adults who name theirs. Partners who can say 'I'm hurt' instead of attacking transform relationships. Teams where emotion is discussable outperform teams where it's taboo. Your emotional fluency teaches others that feelings are information, not shameful secrets."
  },
  
  {
    id: 'connection',
    emoji: '🤝',
    name: 'Connection',
    color: '#4ADE80',
    tagline: 'Your relationship to others',
    coreTruth: "You are not a solo creature who sometimes socializes. You are a social creature who sometimes needs solitude.",
    
    description: "Humans evolved in tribes. Our nervous systems were designed to be regulated by other nervous systems. Loneliness isn't just sad - your brain processes it identically to physical pain. Social isolation has health impacts comparable to smoking 15 cigarettes a day. Connection isn't a nice-to-have. It's a biological requirement, as essential as food and water.",
    
    whenLow: {
      feel: "Lonely even in crowds. Unseen. Misunderstood. Like you're on the outside looking in. Craving contact but not knowing how to get it. Touch-starved. Socially anxious. Bracing for rejection.",
      look: "Isolating. Declining invitations. Surface-level conversations only. Relationships that feel like obligations. No one you can call at 3am. Performing instead of connecting. Scrolling for connection instead of having it.",
      sound: "'Nobody understands me.' 'I don't want to burden anyone.' 'I'm better off alone.' 'Everyone has their own problems.' 'I don't need anyone.'",
      taste: "Like being hungry with no food available. Like standing behind glass. Like the weight of carrying everything alone."
    },
    
    whenHealthy: {
      feel: "Known. Seen. Like you belong. Safe to be yourself. Able to give and receive. Rich in the currency of human contact. Supported without being dependent.",
      look: "People you can be real with. Relationships that nourish. Ability to ask for help. Giving support without depleting yourself. Conflict that leads to deeper connection, not destruction.",
      sound: "'I have people.' 'I can be myself with them.' 'I feel supported.' 'I can ask for what I need.' 'I'm part of something.'",
      taste: "Like warmth. Like home. Like you're not alone in the world. Like the burden is shared."
    },
    
    theGood: [
      "Nervous system regulation through co-regulation",
      "Longer, healthier life (documented survival benefits)",
      "Shared joy is doubled; shared pain is halved",
      "Support when you need it, purpose when you give it",
      "The meaning that comes from mattering to someone",
      "Resilience - you can survive almost anything with support",
      "The deep satisfaction of being truly known"
    ],
    
    theBad: [
      "Loneliness that affects physical health",
      "Nervous system stuck in vigilance without co-regulation",
      "No one to reality-check your thinking",
      "Carrying everything alone",
      "The mental health impacts of isolation",
      "Relationships that drain instead of fill",
      "The tragedy of being surrounded by people but known by none"
    ],
    
    sections: [
      {
        title: "Wired for Connection",
        content: `Babies who are fed but not held fail to thrive and can literally die - a phenomenon called 'failure to thrive.' This isn't just psychology; it's biology. Human infants are born more helpless than any other mammal because our brains are so large they must exit the womb early. We finish developing outside, in relationship.

Adults who are chronically lonely have mortality risks comparable to smoking 15 cigarettes a day. The immune system weakens. Inflammation increases. Blood pressure rises. Cognitive decline accelerates. Your body treats isolation as a threat because evolutionarily, a human alone was a human about to die.

This isn't about being extroverted or introverted. Introverts need connection too - just in smaller doses and different formats. The need itself is universal.`
      },
      {
        title: "Quality Over Quantity",
        content: `It's not about having lots of friends. It's about having relationships where you feel seen, safe, and able to be yourself. One deep friendship beats 50 surface-level connections. One conversation where you feel truly heard beats a month of small talk.

The key variable is authenticity. If you have to perform, mask, or manage impression constantly, the connection doesn't 'count' neurologically. Your nervous system knows the difference between real and performed connection.

'Loneliness in a crowd' is real. You can be surrounded by people and still starved for connection if you can't be yourself with any of them. The question isn't 'how many friends do I have?' It's 'do I have anyone I can be real with?'`
      },
      {
        title: "Co-Regulation",
        content: `When you're dysregulated and a calm person sits with you, your nervous system starts matching theirs. Heart rate variability synchronizes. Breathing aligns. Stress hormones decrease. This isn't metaphor - it's measurable physiology.

Babies learn to regulate through their caregiver's nervous system. They don't have their own regulatory capacity yet; they borrow mom's or dad's. Adults still benefit from this. A calm friend, a regulated therapist, even a pet - presence is medicine.

This is why being around anxious people makes you anxious and being around calm people calms you down. It's why phone calls with certain people leave you drained and time with others leaves you replenished. You're not imagining it. Your nervous systems are in conversation.`
      },
      {
        title: "Attachment Patterns",
        content: `How you connected (or didn't) with early caregivers shapes how you connect now. These are attachment patterns:

Secure: Comfortable with intimacy and independence. Can ask for needs, tolerate conflict, trust others while trusting yourself.

Anxious: Fear of abandonment. Need for reassurance. Hypervigilant to rejection. Often attracted to avoidant partners.

Avoidant: Discomfort with closeness. Value independence highly. Pull away when things get deep. Often attracted to anxious partners.

Disorganized: Mixed approach and withdrawal. Often from early trauma. Wanting closeness but fearing it.

These aren't destiny - they're starting points. Understanding your pattern helps you work with it. Secure attachment can be earned through healing relationships and intentional work.`
      }
    ],
    
    checkIn: "Right now: Who in your life knows how you're actually doing? When did you last have a conversation where you felt truly seen? Is there anyone you could call at 3am? Rate your felt sense of connection 1-10.",
    
    quickFixes: [
      "Text someone you've been thinking about",
      "Have one real conversation today (not small talk)",
      "Make eye contact and actually see someone",
      "Ask 'how are you really doing?' and listen",
      "Physical touch if available (hug, hand on shoulder)"
    ],
    
    deepWork: "Examine your attachment pattern. Notice what happens when connection gets close - do you pull away or cling? Invest in depth over breadth. Practice vulnerability in safe relationships. Consider therapy to heal relational wounds. Build community, not just individual connections.",
    
    realWorld: [
      "A man has lots of friends and still feels lonely. He never lets any of them see him struggle. The quantity is there; the depth isn't. When he finally shares something vulnerable with one friend - really lets them see him - the loneliness breaks. The same number of friends, completely different experience.",
      "A woman feels anxious every evening. She lives alone and works from home. Her nervous system is spending 23 hours a day without co-regulation. She starts working from a coffee shop sometimes. Joins a weekly class. Anxiety decreases without 'treating' it directly. Her system needed other humans.",
      "A couple realizes they've become roommates. They live together but don't connect. Phones at dinner. Parallel living. They institute a daily 10-minute 'no phones, real talk' ritual. The relationship transforms. The time wasn't the issue; the presence was."
    ],
    
    science: "Social exclusion activates the dorsal anterior cingulate cortex - the same region involved in physical pain (Eisenberger, 2003). Loneliness increases mortality risk by 26% (Holt-Lunstad meta-analysis). Heart rate variability synchronizes between people in close interaction (interpersonal physiology). Secure attachment in adulthood predicts better stress regulation, immune function, and relationship satisfaction (attachment theory research).",
    
    rippleEffect: "Connected people connect others. When you're well-resourced relationally, you can give to others without depleting yourself. Parents who have support can parent better. Friends who are filled up can show up. Communities are built from individuals who have capacity for others. Your connection doesn't just help you - it creates ripples of connection outward."
  },
  
  {
    id: 'direction',
    emoji: '🧭',
    name: 'Direction',
    color: '#38BDF8',
    tagline: 'Purpose and momentum',
    coreTruth: "Humans don't just need comfort. We need to be going somewhere.",
    
    description: "Direction isn't about having your entire life figured out. It's not about finding your One True Purpose and following it perfectly. It's about having something to move toward - even if it's small, even if it changes, even if you're not sure why it matters. Without direction, even pleasure feels empty. With direction, even hard work feels meaningful. Humans are meaning-making creatures. We need to be going somewhere.",
    
    whenLow: {
      feel: "Drifting. Stuck. Empty even when comfortable. Like you're running in place. No reason to get out of bed. Going through motions. Rest that doesn't refresh because there's nothing to rest FOR.",
      look: "Aimless scrolling. Can't motivate. Starting things and not finishing. Envy of people who seem to have purpose. Saying yes to whatever comes because nothing calls to you. Avoidance masquerading as openness.",
      sound: "'What's the point?' 'I don't know what I want.' 'I should want more but I don't.' 'Nothing sounds appealing.' 'I feel like I'm wasting my life.'",
      taste: "Like gray. Like treading water. Like life is happening around you but you're not in it."
    },
    
    whenHealthy: {
      feel: "Movement. Momentum. Something pulling you forward. Days that feel like they matter. Energy that comes from engagement. A reason to get up beyond just surviving another day.",
      look: "Progress on things that matter to you. Saying no to things that don't serve your direction. Challenges that feel meaningful. Growth you can sense. A through-line in your choices.",
      sound: "'I'm working toward something.' 'This matters to me.' 'I know why I'm doing this.' 'Even hard days are part of something.' 'My time is going where I want it to go.'",
      taste: "Like being pulled forward. Like your days are adding up to something. Like your life is yours."
    },
    
    theGood: [
      "Dopamine from progress - the momentum molecule",
      "Meaning that makes hard things bearable",
      "Clarity about what to say yes and no to",
      "Energy that comes from engagement with purpose",
      "Resilience - setbacks are part of the journey, not the end of it",
      "The satisfaction of growth and contribution",
      "Legacy - you're building something beyond yourself"
    ],
    
    theBad: [
      "Existential emptiness even with comfort",
      "Depression without obvious cause",
      "Envy of people who 'have it figured out'",
      "Avoidance and distraction as coping",
      "Time slipping away without meaning",
      "The crisis that comes when you achieve the goal and still feel empty",
      "Regret for a life not really lived"
    ],
    
    sections: [
      {
        title: "The Dopamine of Progress",
        content: `Your brain releases dopamine not when you achieve a goal, but when you're making progress toward it. This is crucial. The pleasure isn't in the destination - it's in the pursuit.

This is why the anticipation is often better than the achievement. Why the hungry years feel more alive than the comfortable ones. Why lottery winners return to baseline happiness. And why having nothing to pursue feels like a specific kind of despair.

Small wins matter more than big plans. Completing a small task toward something meaningful releases dopamine. Making progress on something you care about releases dopamine. This isn't about toxic productivity - it's about understanding that your brain needs something to move toward. It's how we're designed.`
      },
      {
        title: "Meaning vs. Happiness",
        content: `Research distinguishes between hedonic wellbeing (pleasure, comfort, positive emotion) and eudaimonic wellbeing (meaning, purpose, functioning well). They're both important, but they're not the same thing. You can have pleasure without meaning - empty enjoyment. And meaning without pleasure - hard but worthwhile work.

Here's what's surprising: people with high meaning and low happiness actually have better long-term outcomes than people with high happiness and low meaning. Meaning provides resilience. Comfort alone does not.

A life of only pleasure feels hollow. A life of only hard work burns out. The aim is meaning AND pleasure - direction AND enjoyment. But if you have to choose, meaning sustains.`
      },
      {
        title: "Lost, Not Lazy",
        content: `When Direction is low, it looks like laziness. Like apathy. Like depression. And sometimes it IS depression. But often it's disorientation - you don't know what matters or which way to go.

The solution isn't 'try harder.' It's 'get oriented.'

You don't need to find your capital-P Purpose. That framing is paralyzing. You need to find something - one thing - worth getting out of bed for. It can be small. It can change. But there needs to be something pulling you forward, or psychology stagnates.

Start with: What's one thing that would make today feel like it mattered? Do that. Direction comes from action, not from waiting for clarity. Clarity comes AFTER you start moving.`
      },
      {
        title: "Values as Compass",
        content: `Direction comes from values - what matters to you independent of external outcomes. If you value creativity, you have direction when you're creating, regardless of external success. If you value connection, building relationships IS the direction.

The trap is living by someone else's values - parents, society, Instagram - and wondering why success feels empty. You can achieve every external marker and still feel directionless if the direction was never yours.

The question isn't 'what should I do with my life?' It's 'what do I value, and how can I move toward it today?' The answer changes over time. That's okay. Values are a compass, not a destination.`
      }
    ],
    
    checkIn: "Right now: What's one thing you're moving toward that matters to you? Did today feel like it added up to something? Do you know why you're doing what you're doing? Rate your sense of direction and purpose 1-10.",
    
    quickFixes: [
      "Write down one thing that would make today meaningful",
      "Do one small thing toward something you care about",
      "Ask: 'What do I want to be different in 6 months?'",
      "Say no to one thing that's not aligned with your direction",
      "Remember a time you felt purposeful - what was present?"
    ],
    
    deepWork: "Clarify your values (not what you should value - what you actually do). Notice what activities create meaning vs. which just pass time. Build small, sustainable practices toward what matters. Create milestones you can progress toward. Reconsider if your current life structure supports your direction or undermines it.",
    
    realWorld: [
      "A person quits their high-paying job and feels lost. The paycheck was good but the meaning was absent. They felt successful and empty. Finding work aligned with their values paid less but filled the direction tank. Same capabilities, different container, completely different experience.",
      "A retiree becomes depressed after leaving work. It wasn't the work itself - it was having something to do, someone to be, somewhere to go. They start volunteering. Depression lifts. The structure and purpose were what mattered, not the title or paycheck.",
      "A student can't motivate herself to study. She's not lazy - she's not connected to why the degree matters. When she connects coursework to something she actually cares about, energy appears. Motivation isn't about willpower; it's about meaning."
    ],
    
    science: "Dopamine is released during goal pursuit, not just achievement (reward prediction error research). Eudaimonic wellbeing (meaning) predicts health outcomes beyond hedonic wellbeing (pleasure), including gene expression patterns (Fredrickson et al.). Purpose in life is associated with reduced mortality risk, better sleep, and lower rates of Alzheimer's disease (longevity research). Viktor Frankl's logotherapy, developed in concentration camps, demonstrated that meaning helps survival.",
    
    rippleEffect: "People with direction inspire direction in others. Parents who are building something model purpose for their kids. Leaders with vision attract others to join. Purpose is contagious. And people without direction often drift toward those who have it. When you know where you're going, you become a landmark for others who are lost."
  },
  
  {
    id: 'alignment',
    emoji: '⚖️',
    name: 'Alignment',
    color: '#F472B6',
    tagline: 'Living your values',
    coreTruth: "The stress you can't explain often comes from the mismatch you won't admit.",
    
    description: "Alignment is the match - or mismatch - between what you value and how you're actually living. When actions match values, there's integrity, coherence, inner peace. When they don't, there's friction - guilt, shame, anxiety, that nagging sense that something's off. You don't have to be perfect. You have to be honest about the gap. Alignment isn't about performing righteousness. It's about internal coherence.",
    
    whenLow: {
      feel: "Vague guilt you can't pinpoint. Shame that doesn't attach to specific events. Anxiety without obvious source. That low-grade sense that something's off. Inner conflict. Defending choices you don't believe in.",
      look: "Saying one thing, doing another. Hiding parts of your life from people. Values you espouse but don't practice. Resentment from unset boundaries. The exhaustion of maintaining a version of yourself that isn't real.",
      sound: "'I should be grateful.' 'I don't know why I feel so anxious.' 'I can't explain what's wrong.' 'I'm being stupid.' 'Let me justify why this is okay...'",
      taste: "Like wearing clothes that don't fit. Like static beneath everything. Like being a stranger in your own life."
    },
    
    whenHealthy: {
      feel: "Coherent. Whole. Actions and values pointing the same direction. Able to look yourself in the mirror. Clean energy, not guilty energy. Peace that comes from congruence.",
      look: "Saying no to things that violate your values, even when costly. Honesty even when difficult. Boundaries that protect what matters. Less internal conflict. Less need to justify.",
      sound: "'This is who I am.' 'I can live with this choice.' 'I'm proud of how I handled that.' 'I don't need to explain myself.' 'My life reflects what I believe.'",
      taste: "Like integrity. Like fit. Like being the same person inside and outside."
    },
    
    theGood: [
      "Inner peace that doesn't depend on circumstances",
      "Energy freed up from no longer managing the gap",
      "Relationships built on authenticity, not performance",
      "Self-respect that others can sense",
      "Decision-making clarity - you know what matters",
      "The deep satisfaction of living your own life",
      "A legacy you're proud of"
    ],
    
    theBad: [
      "Chronic guilt and shame without clear source",
      "Anxiety from maintaining a false self",
      "Relationships built on versions of you that aren't real",
      "Resentment from unset boundaries",
      "The exhaustion of internal conflict",
      "Regret for a life spent pleasing or performing",
      "Moral injury - psychological damage from acting against values"
    ],
    
    sections: [
      {
        title: "The Value-Action Gap",
        content: `Most people can articulate their values if asked: honesty, family, health, growth, kindness. But how we spend our time and energy often doesn't match. We value health but don't sleep. We value family but cancel on them for work. We value honesty but avoid difficult conversations.

This gap isn't hypocrisy - it's the normal human condition. We have competing demands, limited resources, unconscious patterns. The gap exists.

But the gap has costs. Your body registers it as stress even when you won't consciously acknowledge it. That background unease? The free-floating guilt? The sense that something's off? Often that's misalignment showing up.

Alignment work isn't about becoming perfect. It's about making the gap smaller and more honest.`
      },
      {
        title: "Integrity as Integration",
        content: `The word 'integrity' comes from 'integer' - whole, undivided. Alignment is integration: your inner values and outer actions pointing the same direction. When you're integrated, you don't have to manage separate versions of yourself. You're the same person at work, at home, online, alone.

Misalignment is disintegration: pieces of you pulling different directions. Part of you wants to speak up; part suppresses. Part of you believes in honesty; part is maintaining a lie. Part of you values rest; part won't stop working.

This internal war uses enormous psychological resources. It's exhausting to be at odds with yourself. Integration doesn't mean internal agreement on everything - it means honestly facing the conflicts instead of pretending they don't exist.`
      },
      {
        title: "Boundaries as Alignment",
        content: `Boundaries aren't about keeping people out - they're about staying true to what matters. When you say yes to something you want to say no to, that's a values violation. When you tolerate treatment that conflicts with your self-respect, that's misalignment.

Every boundary is a statement about what you value. Setting them isn't selfish - it's aligning your external life with your internal compass. The discomfort of boundary-setting is less than the chronic discomfort of living without them.

The people who respect your boundaries are the ones you want in your life. The ones who don't were violating your alignment anyway.`
      },
      {
        title: "The Discomfort Is Information",
        content: `When alignment is low, you feel it. The feelings aren't random - they're signals:

Guilt says: 'I acted against what I believe.'
Shame says: 'I am not who I want to be.'
Resentment says: 'I'm not honoring my needs.'
Anxiety says: 'Something's wrong that I'm not facing.'

These aren't feelings to eliminate. They're alignment signals. The goal isn't to make them disappear - it's to listen to what they're pointing at.

Sometimes the answer is changing behavior. Sometimes it's updating the value (maybe you don't actually believe what you thought you believed). Sometimes it's accepting the gap with full honesty. But the first step is always acknowledgment.`
      }
    ],
    
    checkIn: "Right now: Where are you saying one thing and doing another? What value are you betraying in how you're living today? Is there something you're hiding or defending that doesn't match who you want to be? Rate your sense of alignment 1-10.",
    
    quickFixes: [
      "Name one area of misalignment honestly",
      "Set one boundary you've been avoiding",
      "Have one honest conversation you've been postponing",
      "Stop doing one thing that violates your values",
      "Forgive yourself for one past misalignment"
    ],
    
    deepWork: "Clarify your actual values (not aspirational - actual). Map where life is aligned and where it's not. Make a plan to close one significant gap. Examine where your values came from - are they yours or inherited? Consider therapy to work through shame, boundary-setting, and authentic living.",
    
    realWorld: [
      "A person feels constantly anxious but 'has no reason to be.' Turns out they're maintaining a version of themselves that isn't real - for their family, their job, their partner. The anxiety is the misalignment signal. When they start being more authentic, even when costly, the anxiety decreases. Same life circumstances, different internal coherence.",
      "Someone keeps saying yes to things they don't want to do, then feeling resentful. The resentment is the signal: their actions aren't matching their values around self-care. Learning to say no isn't selfish - it's alignment. The relationships that survive the 'no' are the real ones.",
      "A professional works at a company whose practices conflict with their ethics. They can't name why they're miserable - good salary, decent hours. But the values mismatch creates constant low-grade dissonance. Leaving for an aligned role changes everything. Sometimes the problem isn't the job; it's the integrity cost of the job."
    ],
    
    science: "Cognitive dissonance (Festinger, 1957) describes the psychological tension of holding conflicting beliefs or acting against one's beliefs - and the mental effort required to resolve it. Self-determination theory identifies authenticity as a core psychological need. Value-action discrepancy is associated with increased cortisol and decreased wellbeing. Moral injury - acting against deeply held values - is a predictor of PTSD beyond trauma exposure alone (military research).",
    
    rippleEffect: "People in alignment give others permission to be in alignment. When you set boundaries, others realize they can too. When you tell the truth, others feel safer being honest. When you stop performing, others relax their performances. Misalignment is also contagious - cultures of performance breed more performance. But so is integrity. One aligned person can shift an entire system."
  }
];

export const WHY_SHARE = {
  headline: "This changes everything. But not just for you.",
  sections: [
    {
      title: "For Your Loved Ones",
      content: `The people you love deserve to understand themselves too. Your partner who can't explain why they're upset. Your friend who keeps making the same mistakes. Your parent who never learned to name their feelings. Your kid who's struggling and doesn't have words for it.

When you share InGauge, you're not sharing an app. You're sharing a language. A framework. A manual that none of us got but all of us needed.

Imagine your family all speaking the same emotional vocabulary. 'My State is activated.' 'My Body gauge is low.' 'I'm feeling hurt underneath the anger.' Conflicts resolve faster. Needs get communicated. Everyone becomes easier to love because everyone becomes more legible.`
    },
    {
      title: "For the World",
      content: `Most of the problems in the world trace back to dysregulated humans who don't understand their own systems. People vote from activated nervous systems and call it values. People hurt each other from misaligned actions and call it necessity. People stay stuck in unhealthy patterns and call it personality.

What if emotional intelligence wasn't a privilege for people who could afford therapy? What if everyone had a dashboard?

Self InGauged people raise Self InGauged kids. They build Self InGauged teams. They create cultures where understanding your own psychology isn't 'soft' - it's basic literacy.

This is how the world changes: one person at a time, one dashboard at a time, one family at a time, one community at a time.`
    },
    {
      title: "The Movement",
      content: `We're building something bigger than an app. We're building a movement of people who:

• Understand themselves deeply enough to change
• Have language for experiences that used to be wordless
• Can help others without requiring professional credentials
• Believe emotional intelligence should be universal, not elite
• Know that 'you are not broken, you are a system' changes everything

Get InGauged. Stay InGauged. Help others get InGauged.

Share with one person today. Not to hit a referral target - to change their life. Because you know what it's like to finally have a manual for being human. They deserve that too.`
    }
  ]
};
