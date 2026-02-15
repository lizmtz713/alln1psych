/**
 * Human Owner's Manual — car maintenance metaphor.
 * Section 1: Know Your Machine (full). Sections 2–4 TBD.
 */

export interface LessonContent {
  introduction: string;
  keyConcepts: { title: string; explanation: string }[];
  reflectionPrompt: string;
}

export interface ManualLesson {
  id: string;
  title: string;
  emoji: string;
  linkedActivity?: string;
  content: {
    teen: LessonContent;
    adult: LessonContent;
    senior: LessonContent;
  };
}

export interface ManualModule {
  id: string;
  title: string;
  emoji: string;
  lessons: ManualLesson[];
}

export interface ManualSection {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  modules: ManualModule[];
}

// ----- Section 1: Know Your Machine -----

const section1Module1: ManualModule = {
  id: 'manual-1-dashboard',
  title: 'The Dashboard (Emotions as Warning Lights)',
  emoji: '🚨',
  lessons: [
    {
      id: 'manual-1-1-1',
      title: 'What Are Emotions, Really?',
      emoji: '💡',
      linkedActivity: 'emotion-wheel',
      content: {
        teen: {
          introduction: "Emotions are your brain's text messages to you. They're not random — each one is trying to tell you something. Anger says 'something's not fair.' Fear says 'be careful.' Sadness says 'something matters to you.' They're not good or bad — they're information.",
          keyConcepts: [
            { title: 'Emotions as signals', explanation: 'Each emotion carries information about what you need or what matters to you.' },
            { title: 'Primary vs secondary emotions', explanation: 'Sometimes one feeling hides another — anger might cover hurt or fear.' },
            { title: 'Emotional vocabulary', explanation: 'The more words you have for what you feel, the less overwhelming it gets.' },
            { title: 'The difference between feeling and reacting', explanation: 'You can feel something without acting on it. Noticing is the first step.' },
          ],
          reflectionPrompt: "What emotion have you been ignoring lately? What might it be trying to tell you?",
        },
        adult: {
          introduction: "Emotions are neurochemical signals designed to drive behavior. They evolved to keep us alive — fear triggers the fight-or-flight response, disgust protects us from contamination, joy reinforces beneficial behaviors. Understanding this removes the shame. You're not 'too emotional' — your system is working.",
          keyConcepts: [
            { title: 'Emotions as signals', explanation: 'Emotions are data from your nervous system, not character flaws.' },
            { title: 'Primary vs secondary emotions', explanation: 'Surface emotions often mask deeper ones — anger can mask hurt, anxiety can mask grief.' },
            { title: 'Emotional vocabulary', explanation: 'Expanding your vocabulary for emotions increases self-awareness and regulation.' },
            { title: 'The difference between feeling and reacting', explanation: 'There is a gap between feeling an emotion and choosing how to respond. That gap is where agency lives.' },
          ],
          reflectionPrompt: "What emotion have you been ignoring lately? What might it be trying to tell you?",
        },
        senior: {
          introduction: "After a lifetime of feelings, it helps to understand why they still surprise us. Emotions don't weaken with age — in fact, research shows emotional regulation improves over time. Your dashboard has been running for decades. You've learned which lights to pay attention to and which are false alarms.",
          keyConcepts: [
            { title: 'Emotions as signals', explanation: 'Emotions remain valuable guides at every stage of life.' },
            { title: 'Primary vs secondary emotions', explanation: 'Decades of experience can make it easier to spot what lies beneath surface feelings.' },
            { title: 'Emotional vocabulary', explanation: 'Naming what you feel doesn\'t make it worse — it often makes it easier to carry.' },
            { title: 'The difference between feeling and reacting', explanation: 'Wisdom includes knowing when to feel fully and when to choose your response.' },
          ],
          reflectionPrompt: "What emotion have you been ignoring lately? What might it be trying to tell you?",
        },
      },
    },
    {
      id: 'manual-1-1-2',
      title: 'Reading Your Dashboard',
      emoji: '📊',
      content: {
        teen: {
          introduction: "Imagine your car dashboard lit up with 5 warning lights at once. Would you panic? Probably. That's what it feels like when multiple emotions hit at the same time. The trick is learning to read them one at a time. Let's slow it down.",
          keyConcepts: [
            { title: 'Emotional granularity', explanation: 'Being able to tell the difference between similar feelings — annoyed vs angry vs hurt — gives you more control.' },
            { title: 'Mixed emotions are normal', explanation: 'You can feel two things at once. That doesn\'t mean you\'re confused; it means you\'re human.' },
            { title: 'The "check engine" trap', explanation: 'Ignoring feelings until they become a crisis is like ignoring a warning light until the car breaks down.' },
            { title: 'Building awareness', explanation: 'Regular check-ins with yourself make it easier to read your dashboard before it\'s overwhelming.' },
          ],
          reflectionPrompt: "Right now, without thinking too hard — what are you feeling? Can you name more than one thing?",
        },
        adult: {
          introduction: "Most adults experience an average of 27 distinct emotions per day. But most of us only name 3: good, bad, and tired. Expanding your emotional vocabulary is like upgrading from a dashboard with one warning light to one with specific indicators for every system.",
          keyConcepts: [
            { title: 'Emotional granularity', explanation: 'Finer distinctions (anxious vs overwhelmed vs dread) lead to better self-regulation.' },
            { title: 'Mixed emotions are normal', explanation: 'Adults often feel multiple emotions simultaneously. Acknowledging all of them reduces inner conflict.' },
            { title: 'The "check engine" trap', explanation: 'Avoiding or suppressing emotions until they erupt is common; learning to notice them earlier prevents blowups.' },
            { title: 'Building awareness', explanation: 'Mindfulness and reflection practices strengthen your ability to read your own emotional state.' },
          ],
          reflectionPrompt: "Right now, without thinking too hard — what are you feeling? Can you name more than one thing?",
        },
        senior: {
          introduction: "You've spent a lifetime reading other people's dashboards — your children's moods, your partner's stress, your friends' grief. But when was the last time you carefully read your own?",
          keyConcepts: [
            { title: 'Emotional granularity', explanation: 'You may have developed a rich inner vocabulary over the years; use it for yourself too.' },
            { title: 'Mixed emotions are normal', explanation: 'Life transitions often bring mixed feelings — grief and gratitude, loss and relief. Both can be true.' },
            { title: 'The "check engine" trap', explanation: 'It\'s never too late to stop ignoring your own warning lights and tend to them with care.' },
            { title: 'Building awareness', explanation: 'Taking time to read your own dashboard is a gift to yourself and those who care about you.' },
          ],
          reflectionPrompt: "Right now, without thinking too hard — what are you feeling? Can you name more than one thing?",
        },
      },
    },
    {
      id: 'manual-1-1-3',
      title: 'False Alarms',
      emoji: '⚠️',
      linkedActivity: 'thought-challenger',
      content: {
        teen: {
          introduction: "Sometimes your brain sets off the alarm for no real reason. Your heart races before a test even though a test can't hurt you. You feel angry at a friend for something small that's actually about something bigger. False alarms are normal — your brain is just being overprotective.",
          keyConcepts: [
            { title: 'Fight-flight-freeze explained', explanation: 'Your body reacts to perceived threat before your thinking brain can decide if the threat is real.' },
            { title: 'Anxiety vs real danger', explanation: 'Anxiety often fires when there\'s no actual danger — your brain is protecting you from what might happen.' },
            { title: 'Emotional triggers as echoes', explanation: 'Strong reactions to small things can be echoes of past experiences, not just about the present.' },
            { title: 'How past experiences wire current reactions', explanation: 'Your brain generalizes from the past. Old hurts can make you react strongly to new situations that feel similar.' },
          ],
          reflectionPrompt: "Think of a recent time you had a strong reaction that felt bigger than the situation. What old alarm might have been triggered?",
        },
        adult: {
          introduction: "Anxiety before a presentation, rage in traffic, dread on Sunday nights — these are often emotional false alarms. The threat isn't real, but the feeling is. Understanding the difference between real danger and perceived danger is one of the most powerful skills you can develop.",
          keyConcepts: [
            { title: 'Fight-flight-freeze explained', explanation: 'The autonomic nervous system responds to perceived threat in milliseconds; the rational mind follows later.' },
            { title: 'Anxiety vs real danger', explanation: 'Many daily anxieties are false alarms — the body reacting to uncertainty or anticipation as if it were threat.' },
            { title: 'Emotional triggers as echoes', explanation: 'Triggers often link to unresolved past experiences; the present situation is just the match.' },
            { title: 'How past experiences wire current reactions', explanation: 'Neural pathways from past trauma or stress can fire in the present; awareness is the first step to rewiring.' },
          ],
          reflectionPrompt: "Think of a recent time you had a strong reaction that felt bigger than the situation. What old alarm might have been triggered?",
        },
        senior: {
          introduction: "At this stage of life, false alarms might look like worry about adult children, anxiety about health changes, or sadness that feels bigger than the situation. Your alarm system has decades of data — sometimes it triggers old patterns from situations long past.",
          keyConcepts: [
            { title: 'Fight-flight-freeze explained', explanation: 'The same survival system operates at every age; it can be calmed with practice and compassion.' },
            { title: 'Anxiety vs real danger', explanation: 'Worry about loss, health, or change is understandable; distinguishing real risk from amplified fear helps.' },
            { title: 'Emotional triggers as echoes', explanation: 'Old losses and transitions can make current events feel heavier. Your system is remembering, not just reacting.' },
            { title: 'How past experiences wire current reactions', explanation: 'Lifetime experiences create deep pathways; they can be acknowledged and gently updated.' },
          ],
          reflectionPrompt: "Think of a recent time you had a strong reaction that felt bigger than the situation. What old alarm might have been triggered?",
        },
      },
    },
  ],
};

const section1Module2: ManualModule = {
  id: 'manual-1-engine',
  title: 'The Engine (Your Brain)',
  emoji: '🧠',
  lessons: [
    {
      id: 'manual-1-2-1',
      title: 'How Your Brain Processes Feelings',
      emoji: '⚙️',
      linkedActivity: 'breathing',
      content: {
        teen: {
          introduction: "Your brain has two main systems for handling emotions — the fast one (amygdala) and the slow one (prefrontal cortex). The fast one is like autocorrect — it reacts before you even think. The slow one is the editor that checks the work. Sometimes autocorrect wins and you say or do something you didn't mean.",
          keyConcepts: [
            { title: 'Amygdala vs prefrontal cortex (in simple terms)', explanation: 'The amygdala reacts fast to threat; the prefrontal cortex helps you think and choose. They don\'t always agree.' },
            { title: 'The 6-second gap', explanation: 'It takes about 6 seconds for your thinking brain to catch up. Pausing for 6 seconds can change your response.' },
            { title: 'Why you react before you think', explanation: 'Survival wired us to act first. In modern life, that can cause overreactions we later regret.' },
            { title: 'Neuroplasticity — you can rewire your responses', explanation: 'Your brain can form new habits. With practice, you can strengthen the pause between trigger and reaction.' },
          ],
          reflectionPrompt: "When was the last time your 'fast brain' took over? What happened?",
        },
        adult: {
          introduction: "The amygdala processes threats in milliseconds — before your conscious mind even registers what happened. That's why you flinch, snap, or freeze before you 'decide' to. The prefrontal cortex — your rational mind — takes about 6 seconds to catch up. Those 6 seconds are where emotional intelligence lives.",
          keyConcepts: [
            { title: 'Amygdala vs prefrontal cortex (in simple terms)', explanation: 'The amygdala is the alarm; the prefrontal cortex is the manager. Learning to let the manager respond takes practice.' },
            { title: 'The 6-second gap', explanation: 'Waiting 6 seconds before reacting allows the prefrontal cortex to engage and choose a response.' },
            { title: 'Why you react before you think', explanation: 'Evolution prioritized speed for survival; in relationships and work, that speed can backfire.' },
            { title: 'Neuroplasticity — you can rewire your responses', explanation: 'Repeated practice of pausing and choosing strengthens the pathways for regulation.' },
          ],
          reflectionPrompt: "When was the last time your 'fast brain' took over? What happened?",
        },
        senior: {
          introduction: "The good news about an aging brain: your prefrontal cortex — the part that regulates emotions — actually gets better with age. Research shows older adults are better at emotional regulation, perspective-taking, and finding meaning. Your engine is more refined, not weaker.",
          keyConcepts: [
            { title: 'Amygdala vs prefrontal cortex (in simple terms)', explanation: 'With age, the balance can shift toward more regulation and less reactive emotion.' },
            { title: 'The 6-second gap', explanation: 'Using the pause becomes easier with practice and with the wisdom that comes from decades of experience.' },
            { title: 'Why you react before you think', explanation: 'Understanding why you react helps you be kinder to yourself when the fast brain still wins sometimes.' },
            { title: 'Neuroplasticity — you can rewire your responses', explanation: 'It\'s never too late; the brain remains capable of change throughout life.' },
          ],
          reflectionPrompt: "When was the last time your 'fast brain' took over? What happened?",
        },
      },
    },
    {
      id: 'manual-1-2-2',
      title: 'Rewiring Your Responses',
      emoji: '🔄',
      content: {
        teen: {
          introduction: "Your brain is like a path through a forest. The more you walk the same path, the deeper it gets. If you always yell when you're mad, that path gets deep. But you can make a new path — it just takes practice. Every time you pause instead of react, the new path gets a little deeper.",
          keyConcepts: [
            { title: 'Neuroplasticity in plain language', explanation: 'Your brain builds stronger connections for whatever you do repeatedly.' },
            { title: 'Habits as neural pathways', explanation: 'Emotional habits are literally paths in your brain; new ones form when you repeat new choices.' },
            { title: 'The role of repetition', explanation: 'One time won\'t change much. Doing the new thing over and over is what rewires you.' },
            { title: 'Why willpower alone doesn\'t work', explanation: 'Willpower runs out. Building new pathways means making the new response easier through practice, not just trying harder.' },
          ],
          reflectionPrompt: "What emotional response would you like to rewire? What would you like to do instead?",
        },
        adult: {
          introduction: "Neuroplasticity means your brain physically changes based on what you repeatedly do. If you've spent years suppressing emotions, your brain got efficient at suppression. If you've spent years exploding, your brain got efficient at explosion. The path you want to build — regulation — requires repetition, not willpower.",
          keyConcepts: [
            { title: 'Neuroplasticity in plain language', explanation: 'The brain changes structure and function in response to repeated experience.' },
            { title: 'Habits as neural pathways', explanation: 'Every habit is a well-worn path; changing behavior means carving a new path through repetition.' },
            { title: 'The role of repetition', explanation: 'Consistent practice is what creates lasting change, not intensity or good intentions alone.' },
            { title: 'Why willpower alone doesn\'t work', explanation: 'Self-control is a limited resource; design your environment and habits so the right choice is easier.' },
          ],
          reflectionPrompt: "What emotional response would you like to rewire? What would you like to do instead?",
        },
        senior: {
          introduction: "It's never too late to build new neural pathways. Research on older adults shows remarkable neuroplasticity. You can learn new emotional responses at any age. The wisdom you've accumulated isn't just metaphorical — it's physically encoded in your brain.",
          keyConcepts: [
            { title: 'Neuroplasticity in plain language', explanation: 'The brain continues to adapt and learn across the lifespan.' },
            { title: 'Habits as neural pathways', explanation: 'Long-standing habits are deep paths, but new ones can still be formed with patience.' },
            { title: 'The role of repetition', explanation: 'Steady, gentle repetition is more sustainable than dramatic short-term effort.' },
            { title: 'Why willpower alone doesn\'t work', explanation: 'Relying on wisdom and practice rather than sheer will reduces exhaustion and supports lasting change.' },
          ],
          reflectionPrompt: "What emotional response would you like to rewire? What would you like to do instead?",
        },
      },
    },
  ],
};

const section1Module3: ManualModule = {
  id: 'manual-1-fuel',
  title: 'The Fuel System (Physical Health → Mental Health)',
  emoji: '⛽',
  lessons: [
    {
      id: 'manual-1-3-1',
      title: 'Your Body Runs Your Mood',
      emoji: '🔋',
      linkedActivity: 'body-scan',
      content: {
        teen: {
          introduction: "Ever notice you're way more irritable when you're hungry? Or anxious when you didn't sleep? Or calmer after a run? That's because your body and your emotions run on the same fuel. If you want to feel better emotionally, sometimes the fastest fix is physical.",
          keyConcepts: [
            { title: 'Sleep and mood', explanation: 'Poor sleep makes everything harder — anxiety, irritability, and sadness all get worse when you\'re tired.' },
            { title: 'Exercise and serotonin', explanation: 'Movement releases chemicals that improve mood; you don\'t have to run a marathon — a walk helps.' },
            { title: 'Nutrition and gut-brain connection', explanation: 'What you eat affects your gut, and your gut talks to your brain. Balanced eating supports balanced mood.' },
            { title: 'Hydration and cognitive function', explanation: 'Being even a little dehydrated can make you foggy and more emotional.' },
          ],
          reflectionPrompt: "How did you sleep last night? How are you feeling right now? Do you see a connection?",
        },
        adult: {
          introduction: "The gut-brain axis, sleep-mood connection, and exercise-serotonin pathway aren't separate systems — they're one system. 90% of serotonin is produced in the gut. One night of poor sleep reduces emotional regulation by up to 60%. A 20-minute walk can be as effective as a mild antidepressant. Your body isn't separate from your emotions — it IS your emotions.",
          keyConcepts: [
            { title: 'Sleep and mood', explanation: 'Sleep deprivation impairs emotional regulation; prioritizing sleep is a form of emotional self-care.' },
            { title: 'Exercise and serotonin', explanation: 'Regular movement supports neurotransmitter balance and stress reduction.' },
            { title: 'Nutrition and gut-brain connection', explanation: 'The gut produces most of the body\'s serotonin; diet directly influences mood and anxiety.' },
            { title: 'Hydration and cognitive function', explanation: 'Dehydration affects focus and emotional stability; water is part of the fuel mix.' },
          ],
          reflectionPrompt: "How did you sleep last night? How are you feeling right now? Do you see a connection?",
        },
        senior: {
          introduction: "As we age, the connection between physical and emotional health becomes even more important. Chronic pain affects mood. Medication side effects can mimic depression. Reduced mobility can increase isolation. Understanding these connections helps you advocate for yourself with doctors and loved ones.",
          keyConcepts: [
            { title: 'Sleep and mood', explanation: 'Sleep quality often changes with age; addressing sleep supports emotional well-being.' },
            { title: 'Exercise and serotonin', explanation: 'Gentle, consistent movement remains one of the most effective mood supports at any age.' },
            { title: 'Nutrition and gut-brain connection', explanation: 'Diet and medication interactions can affect mood; worth discussing with your doctor.' },
            { title: 'Hydration and cognitive function', explanation: 'Older adults are more susceptible to dehydration; it can worsen confusion and low mood.' },
          ],
          reflectionPrompt: "How did you sleep last night? How are you feeling right now? Do you see a connection?",
        },
      },
    },
    {
      id: 'manual-1-3-2',
      title: 'Maintenance Fuels',
      emoji: '⛽',
      content: {
        teen: {
          introduction: "Think of it like this: sleep is charging your battery, food is fuel, water is coolant, and exercise is keeping the engine running. If any of those run low, your whole system starts acting weird. It's not a character flaw — it's mechanics.",
          keyConcepts: [
            { title: 'The 5 fuels', explanation: 'Sleep, food, water, movement, and connection. When one is low, your whole system can feel off.' },
            { title: 'How deficiency mimics mental illness', explanation: 'Being exhausted or hungry can look like depression or anxiety. Check the basics first.' },
            { title: 'Checking basics before spiraling', explanation: 'Before you assume the worst about your mood, ask: have I eaten? Slept? Moved? Had water? Talked to someone?' },
            { title: 'Physical self-care as emotional self-care', explanation: 'Taking care of your body isn\'t selfish or shallow — it\'s the foundation of emotional health.' },
          ],
          reflectionPrompt: "Rate your 5 fuels today (1-10): Sleep? Food? Water? Movement? Human connection?",
        },
        adult: {
          introduction: "Before you analyze a bad mood, check the basics. Have you eaten? Have you slept? Have you moved your body? Have you had water? Have you talked to another human? These aren't oversimplifications — they're the literal fuel your nervous system needs to regulate emotions.",
          keyConcepts: [
            { title: 'The 5 fuels (sleep, food, water, movement, connection)', explanation: 'These five inputs directly affect your nervous system\'s ability to regulate.' },
            { title: 'How deficiency mimics mental illness', explanation: 'Chronic underfueling can produce symptoms that look like anxiety or depression; basics matter.' },
            { title: 'Checking basics before spiraling', explanation: 'When mood drops, run through the five fuels before concluding something is seriously wrong.' },
            { title: 'Physical self-care as emotional self-care', explanation: 'Investing in sleep, nutrition, movement, and connection is evidence-based emotional maintenance.' },
          ],
          reflectionPrompt: "Rate your 5 fuels today (1-10): Sleep? Food? Water? Movement? Human connection?",
        },
        senior: {
          introduction: "The basics matter more, not less, as we age. Adequate sleep, gentle movement, proper nutrition, and hydration directly affect cognitive function and emotional stability. Sometimes the most radical act of self-care is the simplest one.",
          keyConcepts: [
            { title: 'The 5 fuels', explanation: 'Sleep, food, water, movement, and connection remain essential at every stage of life.' },
            { title: 'How deficiency mimics mental illness', explanation: 'Medical and lifestyle factors can mimic or worsen mood; ruling out basics is wise.' },
            { title: 'Checking basics before spiraling', explanation: 'A simple checklist can prevent unnecessary worry and point to practical fixes.' },
            { title: 'Physical self-care as emotional self-care', explanation: 'Honoring your body\'s needs is a valid and powerful form of self-care.' },
          ],
          reflectionPrompt: "Rate your 5 fuels today (1-10): Sleep? Food? Water? Movement? Human connection?",
        },
      },
    },
  ],
};

const section1Module4: ManualModule = {
  id: 'manual-1-wiring',
  title: 'The Wiring (Body-Emotion Connection)',
  emoji: '⚡',
  lessons: [
    {
      id: 'manual-1-4-1',
      title: 'Where You Feel It',
      emoji: '📍',
      linkedActivity: 'body-scan',
      content: {
        teen: {
          introduction: "Butterflies in your stomach aren't imaginary — that's your nervous system responding to anxiety. A tight chest is grief. Clenched fists are anger. Your body is always telling you what you're feeling, sometimes before your brain figures it out.",
          keyConcepts: [
            { title: 'Somatic markers', explanation: 'Emotions show up in the body as sensations — tension, heat, heaviness, flutters.' },
            { title: 'Common body-emotion connections', explanation: 'Chest = grief or anxiety; stomach = fear or excitement; jaw/shoulders = anger or stress.' },
            { title: 'The body keeps score (simplified)', explanation: 'Your body holds onto experiences even when your mind tries to forget.' },
            { title: 'Tension as stored emotion', explanation: 'Chronic tension in one area can be where you\'ve been holding unprocessed feelings.' },
          ],
          reflectionPrompt: "Close your eyes for 10 seconds. Where do you feel tension right now? What emotion might live there?",
        },
        adult: {
          introduction: "Somatic experiencing — feeling emotions in the body — is one of the most evidence-based approaches to emotional healing. Your body stores emotional experiences. Chronic shoulder tension might be years of carrying responsibility. A tight throat might be decades of unspoken words.",
          keyConcepts: [
            { title: 'Somatic markers', explanation: 'Bodily sensations are integral to emotion; learning to notice them increases self-awareness.' },
            { title: 'Common body-emotion connections', explanation: 'Different emotions tend to map to different body regions; your own map is unique.' },
            { title: 'The body keeps score (simplified)', explanation: 'Trauma and stress are held in the body; healing often involves reconnecting with the body safely.' },
            { title: 'Tension as stored emotion', explanation: 'Unexpressed or unprocessed emotion can manifest as chronic muscle tension or pain.' },
          ],
          reflectionPrompt: "Close your eyes for 10 seconds. Where do you feel tension right now? What emotion might live there?",
        },
        senior: {
          introduction: "Many older adults experience emotions more physically than emotionally — unexplained aches, fatigue, digestive issues that have no medical cause. Sometimes the body speaks what the mind won't. Learning to listen to these signals can unlock emotions that need attention.",
          keyConcepts: [
            { title: 'Somatic markers', explanation: 'Emotions may show up more in the body as we age; listening to the body is a skill worth keeping.' },
            { title: 'Common body-emotion connections', explanation: 'Knowing your own patterns helps you recognize when the body is carrying emotion.' },
            { title: 'The body keeps score (simplified)', explanation: 'A lifetime of experiences can be held in the body; gentle attention can help release them.' },
            { title: 'Tension as stored emotion', explanation: 'Physical complaints sometimes have an emotional component; both deserve care.' },
          ],
          reflectionPrompt: "Close your eyes for 10 seconds. Where do you feel tension right now? What emotion might live there?",
        },
      },
    },
  ],
};

const section1Module5: ManualModule = {
  id: 'manual-1-exhaust',
  title: 'The Exhaust (How Stress Leaves Your Body)',
  emoji: '💨',
  lessons: [
    {
      id: 'manual-1-5-1',
      title: 'Letting It Out',
      emoji: '🌬️',
      linkedActivity: 'breathing',
      content: {
        teen: {
          introduction: "Animals literally shake after a scary experience — it's how they release stress. Humans are the only animals that hold it in because we're embarrassed. Crying, shaking, deep breathing, laughing, moving — these aren't weakness. They're your body's exhaust system working correctly.",
          keyConcepts: [
            { title: 'Stress completion cycles', explanation: 'Your body needs to complete the stress response — discharge the energy — or it stays stuck.' },
            { title: 'Why crying helps', explanation: 'Tears release stress hormones and signal to others that you need care. Crying is functional.' },
            { title: 'Movement as emotional release', explanation: 'Exercise, dancing, or even shaking your hands can help the body release pent-up stress.' },
            { title: 'The cost of holding it in', explanation: 'Chronic suppression can lead to anxiety, fatigue, and physical tension.' },
          ],
          reflectionPrompt: "When was the last time you let yourself fully feel something without stopping it? What happened?",
        },
        adult: {
          introduction: "Stress completion cycles are essential. Your body produces cortisol and adrenaline in response to threat. If that energy isn't discharged, it stays in your body as chronic tension, anxiety, or fatigue. Exercise, crying, deep breathing, creative expression, and physical touch all complete the cycle.",
          keyConcepts: [
            { title: 'Stress completion cycles', explanation: 'The nervous system needs to complete the threat response; incomplete cycles leave residual activation.' },
            { title: 'Why crying helps', explanation: 'Crying releases stress chemicals and can restore emotional equilibrium.' },
            { title: 'Movement as emotional release', explanation: 'Physical activity and somatic practices help discharge stored stress and emotion.' },
            { title: 'The cost of holding it in', explanation: 'Chronic inhibition of emotional expression is linked to worse mental and physical health outcomes.' },
          ],
          reflectionPrompt: "When was the last time you let yourself fully feel something without stopping it? What happened?",
        },
        senior: {
          introduction: "Grief, in particular, needs an exhaust system. Many older adults carry losses that were never fully processed — a spouse, friends, health, independence, identity. Finding safe ways to release these emotions is not self-indulgent. It's maintenance.",
          keyConcepts: [
            { title: 'Stress completion cycles', explanation: 'Unprocessed grief and loss can remain in the body; finding ways to release is healing.' },
            { title: 'Why crying helps', explanation: 'Tears are a natural and healthy way to process loss and stress at any age.' },
            { title: 'Movement as emotional release', explanation: 'Gentle movement, breathwork, and creative expression can support release when words aren\'t enough.' },
            { title: 'The cost of holding it in', explanation: 'Allowing yourself to feel and release is a gift to your long-term well-being.' },
          ],
          reflectionPrompt: "When was the last time you let yourself fully feel something without stopping it? What happened?",
        },
      },
    },
  ],
};

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'know-your-machine',
    title: 'Know Your Machine',
    subtitle: 'Understanding how you work',
    emoji: '🔧',
    color: '#4FC3F7',
    modules: [
      section1Module1,
      section1Module2,
      section1Module3,
      section1Module4,
      section1Module5,
    ],
  },
];

/** All manual lesson IDs for progress and lookup */
export function getAllManualLessonIds(): string[] {
  const ids: string[] = [];
  MANUAL_SECTIONS.forEach((s) =>
    s.modules.forEach((m) => m.lessons.forEach((l) => ids.push(l.id)))
  );
  return ids;
}

export function getManualLessonById(lessonId: string): ManualLesson | null {
  for (const section of MANUAL_SECTIONS) {
    for (const module of section.modules) {
      const lesson = module.lessons.find((l) => l.id === lessonId);
      if (lesson) return lesson;
    }
  }
  return null;
}

export function getManualSectionByLessonId(lessonId: string): ManualSection | null {
  for (const section of MANUAL_SECTIONS) {
    const hasLesson = section.modules.some((m) => m.lessons.some((l) => l.id === lessonId));
    if (hasLesson) return section;
  }
  return null;
}

export function getManualModuleByLessonId(lessonId: string): ManualModule | null {
  for (const section of MANUAL_SECTIONS) {
    for (const module of section.modules) {
      if (module.lessons.some((l) => l.id === lessonId)) return module;
    }
  }
  return null;
}

/** Map ContentAgeGroup to manual content key (teen | adult | senior) */
export type ManualContentAge = 'teen' | 'adult' | 'senior';

export function contentAgeToManualAge(age: string): ManualContentAge {
  switch (age) {
    case 'under13':
    case 'teen':
      return 'teen';
    case 'youngAdult':
    case 'adult':
    case 'midlife':
      return 'adult';
    case 'senior':
      return 'senior';
    default:
      return 'adult';
  }
}
