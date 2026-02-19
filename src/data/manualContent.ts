/**
 * Human Owner's Manual — car maintenance metaphor.
 * Complete PHOSM: Internal system + External life domains
 */

// Import new sections (School, Work, Family)
import { MANUAL_SECTION_5 } from './manualSection5-school';
import { MANUAL_SECTION_6 } from './manualSection6-work';
import { MANUAL_SECTION_7 } from './manualSection7-family';

export interface LessonContent {
  introduction: string;
  keyConcepts: { title: string; explanation: string }[];
  reflectionPrompt: string;
}

export interface LessonDiagnostic {
  symptom: string;
  checkFirst: string;
  possibleCauses: string[];
  tryThis: string[];
}

/** Optional age-adaptive intro override (identity-setup life stage). When present, shown instead of content[age].introduction. */
export type AgeAdaptiveMap = {
  teen?: string;
  'young-adult'?: string;
  adult?: string;
  midlife?: string;
  'older-adult'?: string;
};

export interface ManualLesson {
  id: string;
  title: string;
  emoji: string;
  linkedActivity?: string;
  deepDive?: string;
  realWorld?: string[];
  diagnostics?: LessonDiagnostic[];
  tryThis?: string;
  connectsTo?: string[];
  ageAdaptive?: AgeAdaptiveMap;
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
      deepDive: "Your brain has at least 27 scientifically documented emotions — not just happy, sad, mad. Research shows that the more precisely you can name what you feel (emotional granularity), the better your brain can process it and the stronger your mental health. Anger is almost always a secondary emotion: it's the bodyguard for hurt, fear, or powerlessness. Anxiety and excitement produce identical physical sensations; the only difference is the label your brain puts on it. Understanding this doesn't make feelings go away — it gives you a map so you're not lost in the storm.",
      realWorld: [
        "A manager snaps at his team every Monday morning. He thinks he has an anger problem. Underneath: dread of the week ahead and fear of underperforming. Once he names the fear, the anger loses its grip.",
        "A student feels 'anxious' before every exam. When she relabels the same butterflies as 'excitement to show what I know,' her performance improves. Same body state, different story.",
        "Someone who says 'I'm fine' when they're not is often suppressing — which research shows increases internal stress and cortisol. The brave face doesn't help; it costs more.",
      ],
      diagnostics: [
        {
          symptom: "You feel angry and don't know why",
          checkFirst: "Emotion gauge — what's under the anger? Hurt, fear, powerlessness, shame?",
          possibleCauses: ["Anger as secondary emotion masking something more vulnerable", "Unmet need or boundary violation", "Body/State depletion making regulation harder"],
          tryThis: ["Pause and ask: what would I feel if I wasn't angry?", "Name the vulnerable feeling out loud or in writing", "Check Body and State gauges — are you hungry, tired, overloaded?"],
        },
        {
          symptom: "You feel anxious for no clear reason",
          checkFirst: "Body gauge first (sleep, food, water, caffeine), then Emotion — is it actually excitement or another emotion mislabeled?",
          possibleCauses: ["Low blood sugar or sleep deprivation mimicking anxiety", "Anxiety and excitement share the same physical sensations", "Unnamed emotion showing up as generic 'anxiety'"],
          tryThis: ["Eat something with protein, drink water", "Try saying 'I'm excited' and see if the sensation shifts", "Use the emotion wheel to find a more specific word than 'anxious'"],
        },
      ],
      tryThis: "For the next 3 days, whenever you feel a strong emotion, pause and name it as specifically as you can (e.g. not 'bad' but 'disappointed and a little embarrassed'). See if naming it changes how long it lasts.",
      connectsTo: ['emotion', 'state', 'body'],
      ageAdaptive: {
        teen: "Emotions are your brain's text messages — and your brain literally can't do math when you're dehydrated. That test you bombed? Check if you drank any water that day. Your body runs your brain and your brain runs your mood. Sleep, food, water aren't just health class advice. They're the difference between handling a bad day and having a total meltdown.",
        'young-adult': "That all-nighter made you emotionally 10 years younger. When your prefrontal cortex goes offline from sleep deprivation, your amygdala runs the show. You're essentially operating with a teenager's emotional brain in an adult's life. The Sunday scaries, the 3pm crash, the random crying — check your body first.",
        adult: "Your kid's 5pm meltdown isn't a behavior problem. It's a blood sugar problem. And yours might be too. When you snap at your partner after work, check: when did you last eat? How much sleep? How many coffees? Fix the body before diagnosing the emotion.",
        midlife: "Sleep architecture changes after 50. You get less deep sleep, which means less emotional processing overnight. That increased irritability and decreased patience? It might not be stress — it might be biology. Afternoon naps aren't lazy. They're compensating for a structural change in how your brain recovers.",
        'older-adult': "Medication side effects, hydration changes, and nutritional absorption all shift with age and directly affect mood and cognition. That confusion or irritability your doctor might attribute to aging could be dehydration or a medication interaction. Track your body basics — they matter MORE now, not less.",
      },
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
      deepDive: "Research identifies at least 27 distinct emotions — not just happy, sad, mad. The more precisely you can name what you feel (emotional granularity), the better your brain can process it and the stronger your mental health outcomes. Most people use maybe 5 words. Expanding your vocabulary isn't about being fancy — it's about giving your brain the right data so it can regulate. Mixed emotions are normal: you can feel grief and gratitude, fear and excitement, at the same time. The dashboard isn't broken when it shows multiple lights; it's giving you a fuller picture.",
      realWorld: [
        "A person who always says 'I'm fine' discovers that when they slow down and name what they feel — overwhelmed, lonely, and a little hopeful — the overwhelm becomes manageable. Naming it didn't create the feeling; it gave the brain a handle.",
        "Someone in conflict keeps saying 'I'm just angry.' When they pause and read their dashboard: hurt (they didn't listen), fear (this relationship might end), and anger. Addressing the hurt and fear defuses the anger.",
        "A teenager learns that 'anxious' can be broken into: nervous about the test, excited about the weekend, and tired from poor sleep. Three different needs, three different responses.",
      ],
      diagnostics: [
        {
          symptom: "You feel 'fine' or 'okay' but something is off",
          checkFirst: "Emotion gauge — slow down and name 2–3 more specific feelings. What's the mix?",
          possibleCauses: ["Overuse of generic labels (fine, bad) hides specific emotions", "Mixed emotions that need to be named separately", "Suppression making the dashboard harder to read"],
          tryThis: ["Use an emotion wheel or list and pick the most accurate words", "Ask: if I couldn't say 'fine,' what would I say?", "Check Body and State — sometimes 'off' is hunger, fatigue, or overload"],
        },
        {
          symptom: "You have multiple strong feelings and don't know which to address first",
          checkFirst: "All are valid. Which one is most urgent or most driving the others?",
          possibleCauses: ["Mixed emotions are normal; the brain can hold more than one", "One emotion may be masking another (e.g. anger masking hurt)", "Overwhelm from too many lights at once"],
          tryThis: ["List them: 'I feel X, Y, and Z.' No need to fix yet.", "Pick one to tend to first — often the most vulnerable one", "If overwhelmed, tend to Body/State first (breath, water, pause)"],
        },
      ],
      tryThis: "For one day, every time you would say 'good,' 'bad,' or 'fine,' replace it with two more specific words (e.g. 'relieved and a little tired'). Notice if reading your dashboard gets easier.",
      connectsTo: ['emotion', 'state'],
      ageAdaptive: {
        teen: "Your dashboard has way more than one light — and most people only name three: good, bad, tired. When everything feels like a blur, naming even two things ('anxious and lonely' or 'relieved but still mad') gives your brain a handle. School, friends, social media — it all shows up on the dashboard. Reading it gets easier when you slow down.",
        'young-adult': "You've got 27+ emotions per day and you're probably only naming three. When 'fine' or 'stressed' is your default, the real picture stays blurry. Dating apps, job stress, roommates — they all show up as mixed signals. The more specific you get ('disappointed and a little jealous' instead of 'bad'), the more you can actually address what's going on.",
        adult: "Most adults experience dozens of distinct emotions per day and name maybe three. When you say 'fine' or 'stressed,' you're running on a dashboard with one light. Expanding your vocabulary isn't about being fancy — it's about giving your brain the right data so you can regulate. Right now: what are you feeling? Can you name more than one thing?",
        midlife: "You've spent decades reading other people's dashboards — your kids, your partner, your parents. When was the last time you read your own? Mixed emotions are normal at this stage: grief and gratitude, loss and relief. Naming them doesn't make them worse; it often makes them easier to carry.",
        'older-adult': "You've had a lifetime of feelings. You don't have to perform calm or hide what's there. When the dashboard shows multiple lights — loneliness, gratitude, worry, peace — that's not confusion. That's a full life. Naming each one is a kindness to yourself.",
      },
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
      deepDive: "Your nervous system has three modes: fight, flight, and freeze. It responds to perceived threat in milliseconds — before your thinking brain can decide if the threat is real. After trauma, the system can recalibrate: stimuli that wouldn't alarm others trigger full activation. That's not overreacting; that's a system that was retrained by experience. You can't think your way out of activation; the body must be regulated first (breathing, movement, co-regulation). Cognitive distortions — catastrophizing, mind-reading, all-or-nothing — are thinking shortcuts everyone has; they become problems when unexamined.",
      realWorld: [
        "A veteran jumps at loud noises. He's not 'broken' — his nervous system was trained in combat to detect threat early. With practice, he can recalibrate.",
        "A person gets disproportionately angry at a partner's tone. The tone triggered an old alarm: a parent's voice before punishment. The present situation is the match; the fuel was the past.",
        "Someone who always expects the worst (catastrophizing) learns to ask: 'What's the evidence? What's a more likely outcome?' The alarm stays but the story changes.",
      ],
      diagnostics: [
        {
          symptom: "Your reaction felt bigger than the situation",
          checkFirst: "State gauge — were you already activated? Emotion — what old alarm might this have triggered?",
          possibleCauses: ["Trauma or past experience wired this trigger", "Body/State already depleted (hungry, tired, overloaded)", "Cognitive distortion (catastrophizing, mind-reading)"],
          tryThis: ["Trace back: what was I feeling 30 minutes before the trigger?", "Check Body basics (food, water, sleep)", "Name the distortion: 'I'm mind-reading' or 'I'm catastrophizing'", "Regulate body first: 6 breaths, then re-evaluate"],
        },
        {
          symptom: "You feel numb or frozen, can't think or act",
          checkFirst: "State gauge — this may be freeze (dorsal vagal) shutdown, not laziness or depression.",
          possibleCauses: ["Nervous system overwhelmed into shutdown", "Chronic stress without discharge", "Unprocessed trauma"],
          tryThis: ["Don't force. Gentle movement, cold water on face, or presence of a calm person (co-regulation) can help", "Small steps: one tiny action to re-engage", "If persistent, consider professional support for trauma"],
        },
      ],
      tryThis: "Next time you have a strong reaction, wait 6 seconds before responding. Notice whether the urge to react shifts when your thinking brain catches up.",
      connectsTo: ['state', 'emotion', 'body'],
      ageAdaptive: {
        teen: "Your brain sometimes sets off the alarm when there's no real danger — heart racing before a test, anger at a friend over something small. That's not you being dramatic. It's your brain being overprotective. Strong reactions to small things can be echoes of past stuff. Knowing that doesn't fix it, but it helps you pause before you react.",
        'young-adult': "Anxiety before the presentation, rage in traffic, Sunday night dread — often false alarms. The threat isn't real but the feeling is. Your brain is wired to react first; your thinking brain catches up later. Triggers often link to unresolved past experiences. The present situation is just the match.",
        adult: "Reactions that feel bigger than the situation are often emotional false alarms. The threat isn't real; the feeling is. Your nervous system responds in milliseconds; the rational mind follows. Triggers are often echoes of the past. Understanding that is the first step to choosing your response.",
        midlife: "At this stage false alarms might look like worry about adult children, health anxiety, or sadness that feels disproportionate. Your alarm system has decades of data — sometimes it triggers old patterns. That's not weakness. It's a system that was shaped by experience. You can still learn to pause.",
        'older-adult': "Worry about loss, health, or change is understandable. Your system has a long memory. Distinguishing real risk from amplified fear helps. Old losses can make current events feel heavier. Your system is remembering, not just reacting. Acknowledging that is the first step to calming the alarm.",
      },
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
      deepDive: "Your brain has three major systems: the brainstem (survival — heart rate, breathing, fight-or-flight), the limbic system (emotions, social bonding), and the prefrontal cortex (planning, judgment, impulse control). Under stress, the brain prioritizes survival first, emotions second, rational thought last. That's why you can't 'think clearly' when upset — your prefrontal cortex has literally gone offline. Sleep deprivation amplifies amygdala reactivity by up to 60%, so when you're tired, the alarm runs hotter. The goal isn't preventing this; it's recognizing when it's happening and using body-based tools (breath, movement) to bring the prefrontal cortex back online.",
      realWorld: [
        "A mother snaps at her kids every evening around 5pm. She thinks she has an anger problem. She actually has a blood sugar and cortisol problem — she hasn't eaten since noon. A snack at 3:30pm changes her entire evening.",
        "A college student can't focus or regulate emotions on Sunday nights. It's not just 'dread of Monday' — his weekend sleep schedule (up until 3am) has disrupted his circadian rhythm. Fix the sleep, fix the Sunday scaries.",
        "Someone in an argument says something they regret. In the moment, their amygdala was in charge. After 6 seconds and a breath, the prefrontal cortex could have chosen a different response. They're not 'bad' — their brain was in survival mode.",
      ],
      diagnostics: [
        {
          symptom: "You can't think clearly or make decisions when upset",
          checkFirst: "State/Body — your prefrontal cortex may be offline. Regulate first, then think.",
          possibleCauses: ["Amygdala activation suppressing prefrontal function", "Sleep deprivation amplifying emotional reactivity", "Stress or hunger further reducing cognitive capacity"],
          tryThis: ["6 slow breaths to start bringing the thinking brain back", "Check Body: food, water, sleep", "Delay big decisions until you're regulated", "Name it: 'My alarm is on; I'll decide when I'm calmer'"],
        },
        {
          symptom: "You react before you think and regret it later",
          checkFirst: "This is the 6-second gap. Your fast brain is winning.",
          possibleCauses: ["Evolutionary wiring: survival favored speed", "Repeated practice of reacting (path is deep)", "High State activation (nervous system already on alert)"],
          tryThis: ["Practice the pause: count to 6 before responding in low-stakes situations", "Create a ritual: one breath before replying to messages", "After a blowup, reflect: what was the trigger? What did I need in that moment?"],
        },
      ],
      tryThis: "For the next 3 days, rate your Body gauge and your Emotion gauge at the same time. See if they track together. Most people are shocked by the correlation.",
      connectsTo: ['body', 'state', 'emotion'],
      ageAdaptive: {
        teen: "Your brain literally can't do math when you're dehydrated. That test you bombed? Check if you drank any water that day. Your body runs your brain and your brain runs your mood. Sleep, food, water — these aren't just health class advice. They're the difference between handling a bad day and having a total meltdown.",
        'young-adult': "That all-nighter made you emotionally 10 years younger. When your prefrontal cortex goes offline from sleep deprivation, your amygdala runs the show. You're essentially operating with a teenager's emotional brain in an adult's life. The Sunday scaries, the 3pm crash, the random crying — check your body first.",
        adult: "Your kid's 5pm meltdown isn't a behavior problem. It's a blood sugar problem. And yours might be too. When you snap at your partner after work, check: when did you last eat? How much sleep? How many coffees? Fix the body before diagnosing the emotion.",
        midlife: "Sleep architecture changes after 50. You get less deep sleep, which means less emotional processing overnight. That increased irritability and decreased patience? It might not be stress — it might be biology. Afternoon naps aren't lazy. They're compensating for a structural change in how your brain recovers.",
        'older-adult': "Medication side effects, hydration changes, and nutritional absorption all shift with age and directly affect mood and cognition. That confusion or irritability your doctor might attribute to aging could be dehydration or a medication interaction. Track your body basics — they matter MORE now, not less.",
      },
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
      deepDive: "Neuroplasticity means your brain physically changes based on what you repeatedly do. BDNF (brain-derived neurotrophic factor) — released during exercise and learning — is like fertilizer for new pathways. The path you want (e.g. pause then respond) requires repetition, not willpower. Willpower is a limited resource; design your environment so the right choice is easier. Habits are neural pathways: every time you do the new behavior, the new path gets deeper. It's never too late; the brain remains capable of change throughout life.",
      realWorld: [
        "Someone who used to yell when angry now notices the urge, takes a breath, and speaks calmly — not because they 'try harder' but because they've practiced the new response hundreds of times. The new path is now the default.",
        "A person who used to suppress emotions now names them out loud. At first it felt forced; after months it's automatic. The brain rewired.",
        "An office worker puts their phone in another room during focus blocks. They're not relying on willpower — they're changing the environment so the desired path is the only easy path.",
      ],
      diagnostics: [
        {
          symptom: "I keep doing the same thing even though I want to change",
          checkFirst: "Direction/Alignment — is this change actually aligned with your values? Are you relying on willpower alone?",
          possibleCauses: ["Old pathway is very deep; new one needs repetition", "Environment still cues the old behavior", "Willpower is exhausted; need systems, not just intention"],
          tryThis: ["Pick one specific situation and one new response. Practice only that.", "Change the environment: remove cues for old behavior, add cues for new", "Track small wins: each time you do the new thing, the path gets deeper"],
        },
        {
          symptom: "I don't know what to do instead of my usual reaction",
          checkFirst: "Get specific. What would the ideal response look like in one scenario?",
          possibleCauses: ["Vague goals ('be calmer') are hard to wire", "Need a concrete alternative behavior to practice", "Might need to learn a new skill (e.g. assertiveness, breathing)"],
          tryThis: ["Script it: 'When X happens, I will do Y' (e.g. take one breath, then speak)", "Practice in a safe context first", "Use the Manual and activities to build the skill"],
        },
      ],
      tryThis: "Choose one small situation where you usually react on autopilot. For one week, practice one different response in that situation only. Notice the new path forming.",
      connectsTo: ['body', 'state', 'direction', 'alignment'],
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
      deepDive: "Your brain is approximately 75% water; dehydration of just 1–2% impairs cognitive function, mood, and concentration. 95% of serotonin is produced in the gut — so digestive health directly affects mood. Low blood sugar mimics anxiety almost perfectly (racing heart, shakiness, can't focus); your body can't tell 'I haven't eaten' from 'something is wrong.' Sleep deprivation amplifies amygdala reactivity by up to 60%; chronic sleep debt can't be repaid with one good night. Caffeine blocks the tired signal while increasing cortisol — so you feel awake but wired. Movement releases BDNF, the brain's growth fertilizer; a 20-minute walk helps. Body isn't separate from emotion — it IS the substrate.",
      realWorld: [
        "A mother of three snaps at her kids every evening around 5pm. She thinks she has an anger problem. She actually has a blood sugar problem — she hasn't eaten since noon and cortisol peaks in late afternoon. A snack at 3:30pm changes her entire evening.",
        "A college student feels depressed every Sunday night. He thinks it's about Monday classes. It's actually his weekend sleep schedule — staying up until 3am disrupts his circadian rhythm. Fix the sleep, fix the Sunday scaries.",
        "An office worker has been irritable for weeks and blames her relationship. Her water bottle has been untouched on her desk for days. Mild chronic dehydration is elevating her baseline irritability.",
      ],
      diagnostics: [
        {
          symptom: "You feel anxious for no clear reason",
          checkFirst: "Body gauge — sleep, food, water, caffeine intake",
          possibleCauses: ["Sleep deprivation amplifies amygdala by 60%", "Low blood sugar mimics anxiety perfectly", "Dehydration impairs mood and cognition", "Caffeine elevates cortisol and masks fatigue"],
          tryThis: ["Eat something with protein right now", "Drink 16oz of water", "Count your caffeine today", "Check last night's sleep hours", "If all basics are covered, THEN explore emotional causes"],
        },
        {
          symptom: "You overreacted and don't know why",
          checkFirst: "State gauge — were you already activated before the trigger? Body — basics covered?",
          possibleCauses: ["Cumulative stress without discharge", "Sensory overload from environment", "Body gauge already depleted", "Unprocessed emotion from earlier today"],
          tryThis: ["Trace back 2 hours before the reaction", "Check all Body basics first", "6 slow breaths to reset nervous system", "Journal: what was the trigger vs what was the reaction?"],
        },
      ],
      tryThis: "For the next 3 days, rate your Body gauge AND your Emotion gauge at the same time. See if they track together. Most people are shocked by the correlation.",
      connectsTo: ['body', 'state', 'emotion'],
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

// ----- Section 2: Maintenance Schedule -----

const section2Module1: ManualModule = {
  id: 'manual-2-tuneup',
  title: 'Daily Tune-Up',
  emoji: '🌅',
  lessons: [
    {
      id: 'manual-2-1-1',
      title: 'The Morning Check-In',
      emoji: '☀️',
      linkedActivity: 'breathing',
      content: {
        teen: {
          introduction: "How you start the day sets the tone for everything that comes next. A morning check-in isn't about being perfect or productive — it's about noticing where you are before the world starts asking things of you. Even two minutes of paying attention to your body and mood can make the rest of the day feel more yours.",
          keyConcepts: [
            { title: 'Morning mood check', explanation: 'Before you reach for your phone or run out the door, pause and ask: How do I feel right now? Not how you should feel — how you actually feel. That simple question builds self-awareness over time.' },
            { title: 'Setting daily intention', explanation: 'One small intention — "I want to be patient with myself" or "I want to say one kind thing to someone" — gives the day a gentle direction without adding pressure.' },
            { title: '2-minute body scan', explanation: 'From your head to your feet, just notice. Are you holding tension somewhere? Tired? Restless? You don\'t have to fix it. Noticing is the practice.' },
            { title: 'Why mornings set the tone', explanation: 'The first hour of your day often shapes how you respond to stress later. A calm, intentional start doesn\'t guarantee a perfect day — but it gives you more room to choose your responses.' },
          ],
          reflectionPrompt: "What does your morning routine do for your emotional health? What could you add — even something tiny — that would help you start the day more aware?",
        },
        adult: {
          introduction: "The first moments of the day are often lost to alarms, screens, and mental to-do lists. Building a brief morning check-in creates a buffer between sleep and the demands of the day. It's not about adding another task — it's about claiming a few minutes to land in your body and your mood before the world pulls you outward.",
          keyConcepts: [
            { title: 'Morning mood check', explanation: 'Before the day takes over, name your emotional starting point. Anxious, calm, tired, hopeful — whatever it is, acknowledging it reduces the chance that unacknowledged feelings will drive your reactions later.' },
            { title: 'Setting daily intention', explanation: 'One intention — a quality you want to bring (patience, presence, honesty) or one thing you want to do for yourself — acts as a touchstone when the day gets chaotic.' },
            { title: '2-minute body scan', explanation: 'A quick scan from head to toe builds somatic awareness. Many adults live mostly in their heads; this practice reconnects you to the body that carries you through the day.' },
            { title: 'Why mornings set the tone', explanation: 'Research suggests that how we begin the day affects stress reactivity and decision-making. A grounded start is an investment in the hours that follow.' },
          ],
          reflectionPrompt: "What does your morning routine do for your emotional health? What could you add that would help you start the day more aware?",
        },
        senior: {
          introduction: "Mornings in later life can be slower — or filled with medical routines, caregiving, or loneliness. A morning check-in doesn't require extra time so much as a pause. How am I today? Where do I feel it? That question, asked with kindness, can make the difference between a day that happens to you and a day you meet with awareness.",
          keyConcepts: [
            { title: 'Morning mood check', explanation: 'Checking in with your mood and body in the morning helps you recognize what you need — whether that\'s rest, connection, or a gentle activity. It\'s a form of self-respect.' },
            { title: 'Setting daily intention', explanation: 'One intention for the day — to be gentle with yourself, to reach out to someone, to do one thing that brings peace — gives the day a light structure without rigidity.' },
            { title: '2-minute body scan', explanation: 'Noticing where you hold tension or ease in your body helps you advocate for yourself with doctors and caregivers. It also keeps you in touch with your own experience.' },
            { title: 'Why mornings set the tone', explanation: 'How you start the day influences how you respond to challenges, from physical discomfort to loneliness. A brief, kind check-in is a gift to the rest of your day.' },
          ],
          reflectionPrompt: "What does your morning routine do for your emotional health? What could you add — even something small — that would help you start the day more aware?",
        },
      },
    },
    {
      id: 'manual-2-1-2',
      title: 'The Evening Review',
      emoji: '🌙',
      linkedActivity: 'gratitude-jar',
      content: {
        teen: {
          introduction: "The day is over and your brain is still running — replaying that conversation, worrying about tomorrow, or just buzzing. An evening review is a way to put the day to rest instead of carrying it into sleep. You don't have to solve anything. You're just acknowledging what happened and giving yourself permission to let it go until tomorrow.",
          keyConcepts: [
            { title: 'What went well today', explanation: 'One thing that went okay — even something small — helps your brain register positive experiences. Teens often focus on what went wrong; naming what went right balances the scale.' },
            { title: 'What drained you', explanation: 'Noticing what drained you (a class, a person, a situation) isn\'t complaining — it\'s information. Over time you see patterns and can protect your energy better.' },
            { title: 'What you\'re carrying into tomorrow', explanation: 'Is there something you need to do, say, or let go of? Naming it before sleep can reduce the loop of thoughts and help you plan the next step.' },
            { title: 'Gratitude as a reset', explanation: 'One thing you\'re grateful for — even "I have a bed to sleep in" — shifts your nervous system toward safety and can improve sleep quality.' },
          ],
          reflectionPrompt: "What's one thing from today you want to let go of before sleep? You don't have to fix it — just name it and give yourself permission to put it down for the night.",
        },
        adult: {
          introduction: "Without a way to process the day, we often carry its stress, regrets, and unfinished thoughts into bed. An evening review is a short ritual that helps the brain file the day away. It's not journaling for hours — it's a few minutes of honest acknowledgment so that sleep can do its job.",
          keyConcepts: [
            { title: 'What went well today', explanation: 'Adults are often better at identifying failures than successes. Naming one thing that went well — or one moment of connection, competence, or calm — reinforces that good exists alongside the hard.' },
            { title: 'What drained you', explanation: 'Acknowledging what drained you (work, a relationship, news, your own thoughts) without judgment helps you set boundaries and make choices about where you put your energy.' },
            { title: 'What you\'re carrying into tomorrow', explanation: 'Writing down or naming what you need to do or address tomorrow can reduce middle-of-the-night rumination. The brain relaxes when it knows the concern is captured.' },
            { title: 'Gratitude as a reset', explanation: 'Gratitude practices are linked to better sleep and lower anxiety. One genuine thing you\'re grateful for can shift your state before sleep.' },
          ],
          reflectionPrompt: "What's one thing from today you want to let go of before sleep? Naming it and consciously setting it down can make room for rest.",
        },
        senior: {
          introduction: "Evenings can be lonely or quiet after a lifetime of busy days. An evening review gives structure to the end of the day — a chance to acknowledge what was good, what was hard, and what you're carrying. It's a gentle way to close the day and prepare for rest.",
          keyConcepts: [
            { title: 'What went well today', explanation: 'Noticing what went well — a visit, a phone call, a moment of comfort — helps counter the tendency to focus on loss or limitation. It\'s a practice of balance.' },
            { title: 'What drained you', explanation: 'Naming what drained you (pain, worry, loneliness, news) is valid. You don\'t have to tough it out. Acknowledging it is the first step toward compassion for yourself.' },
            { title: 'What you\'re carrying into tomorrow', explanation: 'If something is on your mind for tomorrow — a call to make, a decision, a feeling to tend to — writing or saying it can ease the urge to ruminate in bed.' },
            { title: 'Gratitude as a reset', explanation: 'One thing you\'re grateful for at the end of the day can soften the transition into sleep and remind you that good is still present in your life.' },
          ],
          reflectionPrompt: "What's one thing from today you want to let go of before sleep? Let yourself put it down for the night.",
        },
      },
    },
  ],
};

const section2Module2: ManualModule = {
  id: 'manual-2-oil',
  title: 'Oil Changes (The Power of Talking)',
  emoji: '🗣️',
  lessons: [
    {
      id: 'manual-2-2-1',
      title: 'Why Talking Works',
      emoji: '💬',
      linkedActivity: 'comm-builder',
      content: {
        teen: {
          introduction: "When you're upset, your first instinct might be to shut down or blow up. But talking — to someone who actually listens — does something different. It doesn't just vent; it actually changes how your brain processes the feeling. Connection is maintenance, not a luxury. You're not meant to figure everything out alone.",
          keyConcepts: [
            { title: 'Co-regulation', explanation: 'When someone listens calmly, your nervous system can borrow their calm. That\'s co-regulation — your brain and body settling because someone else is steady beside you.' },
            { title: 'Naming emotions reduces their intensity', explanation: 'When you put words to what you feel, the emotional part of your brain gets a little less loud. "I feel really left out" is different from just feeling it with no words.' },
            { title: 'Vulnerability as strength', explanation: 'Telling someone how you really feel is scary. But it\'s also what builds real connection. The people who can handle your honesty are the ones worth keeping close.' },
            { title: 'Finding safe people', explanation: 'Safe people don\'t dismiss you, fix you without asking, or use what you say against you. They listen, ask questions, and stay. Not everyone is safe — and that\'s why choosing who you talk to matters.' },
          ],
          reflectionPrompt: "Who is the one person you can be completely honest with? If no one comes to mind — what's stopping you from being that honest with someone?",
        },
        adult: {
          introduction: "Many adults were taught to handle things on their own — that needing to talk is weak or burdensome. But connection is one of the most effective forms of emotional regulation we have. Talking to someone who listens doesn't just feel good; it changes how your brain processes stress. It's essential maintenance, not indulgence.",
          keyConcepts: [
            { title: 'Co-regulation', explanation: 'Our nervous systems are designed to regulate in relationship. When you\'re with someone who is present and calm, your own system can downshift. That\'s why "just talking" often helps — it\'s biology.' },
            { title: 'Naming emotions reduces their intensity', explanation: 'Affect labeling — putting feelings into words — has been shown to reduce amygdala activation. Naming what you feel, especially out loud to another person, dials down the intensity.' },
            { title: 'Vulnerability as strength', explanation: 'Vulnerability is the gateway to intimacy and support. Sharing what you really feel — with someone safe — invites connection and often relief. It\'s not oversharing; it\'s human need.' },
            { title: 'Finding safe people', explanation: 'Safe people listen without immediately fixing, don\'t use your words against you, and can sit with discomfort. Not everyone qualifies. Identifying and investing in those who do is one of the most important things you can do for your mental health.' },
          ],
          reflectionPrompt: "Who is the one person you can be completely honest with? If no one — what's stopping you?",
        },
        senior: {
          introduction: "In later life, opportunities to talk deeply can shrink — friends move, spouses pass, family is busy. But the need for connection doesn't go away. Talking to someone who listens is still one of the most powerful ways to process grief, loneliness, and change. It's not weakness to need it; it's human.",
          keyConcepts: [
            { title: 'Co-regulation', explanation: 'Being with someone who listens and doesn\'t rush to fix you can calm your nervous system. That\'s true at any age. Sometimes the best thing someone can do is simply be there.' },
            { title: 'Naming emotions reduces their intensity', explanation: 'Putting grief, loneliness, or fear into words — to another person — can make those feelings more manageable. You don\'t have to carry everything in silence.' },
            { title: 'Vulnerability as strength', explanation: 'Asking for a listening ear is brave. Many older adults were raised to not "burden" others. But sharing what you feel is how you stay connected and how others can show they care.' },
            { title: 'Finding safe people', explanation: 'Safe people don\'t minimize ("You have so much to be grateful for") or change the subject. They listen. That might be a friend, a support group, a therapist, or a family member who has shown they can hold your truth.' },
          ],
          reflectionPrompt: "Who is the one person you can be completely honest with? If no one — what would need to change for you to have that?",
        },
      },
    },
    {
      id: 'manual-2-2-2',
      title: 'How to Talk About Feelings (Without Being Weird About It)',
      emoji: '🗣️',
      linkedActivity: 'comm-builder',
      content: {
        teen: {
          introduction: "Talking about feelings can feel awkward — like you're making a big deal out of nothing or that the other person will think you're weird. But there's a way to do it that feels more natural. It's not about dumping everything at once. It's about clear, honest sentences that give the other person a chance to understand and respond.",
          keyConcepts: [
            { title: '"I feel" statements', explanation: 'Starting with "I feel..." instead of "You always..." keeps the focus on your experience. "I feel hurt when plans get canceled last minute" is easier to hear than "You never follow through."' },
            { title: 'Listening vs fixing', explanation: 'When someone shares with you, they often need to be heard more than fixed. Same for you — you might want someone to just get it, not give you a solution right away. You can ask for that: "I just need to vent."' },
            { title: 'Asking for what you need', explanation: 'People can\'t read your mind. "I need you to just listen" or "I need a hug" or "I need some space" gives the other person a clear way to show up for you.' },
            { title: 'When to go deeper vs when to keep it light', explanation: 'Not every conversation has to be heavy. Sometimes "I\'m okay" is enough. But when you do want to go deeper, picking a calm moment and being direct ("Can I talk to you about something?") helps.' },
          ],
          reflectionPrompt: "What's one thing you've been wanting to say to someone but haven't? What's holding you back?",
        },
        adult: {
          introduction: "Many adults were never taught how to talk about feelings in a way that invites connection instead of conflict. The skills are learnable: how to name what you feel, how to ask for what you need, and how to listen when others do the same. It's not about being perfect — it's about being clearer.",
          keyConcepts: [
            { title: '"I feel" statements', explanation: '"I feel [emotion] when [situation]" keeps the focus on your experience and reduces defensiveness. It\'s a formula that works in relationships, at work, and with family.' },
            { title: 'Listening vs fixing', explanation: 'Most of us default to fixing when someone shares a problem. But often what people need is to be heard. Asking "Do you want advice or just to be heard?" can transform a conversation.' },
            { title: 'Asking for what you need', explanation: 'Others can\'t read your mind. "I need you to listen without offering solutions" or "I need some time alone" gives people a chance to show up for you in the way you actually need.' },
            { title: 'When to go deeper vs when to keep it light', explanation: 'Not every moment is for heavy conversation. But when you do want to go deeper, naming it ("I want to talk about something that\'s been on my mind") sets the stage and gives the other person a chance to be present.' },
          ],
          reflectionPrompt: "What's one thing you've been wanting to say to someone but haven't? What's holding you back?",
        },
        senior: {
          introduction: "You've had decades of conversations — some that went well, some that didn't. Talking about feelings in later life can feel especially vulnerable: you might worry about burdening family or being seen as complaining. But clear, gentle communication is still one of the best tools you have for connection and for getting your needs met.",
          keyConcepts: [
            { title: '"I feel" statements', explanation: 'Using "I feel..." instead of blaming or accusing keeps the door open. "I feel lonely when we don\'t talk for a while" is easier for family to hear than "You never call."' },
            { title: 'Listening vs fixing', explanation: 'When you share, you might want to be heard more than fixed. You can say so: "I don\'t need advice right now — I just need you to listen." That helps the other person know how to show up.' },
            { title: 'Asking for what you need', explanation: 'Being clear about what you need — a visit, a call, someone to sit with you, or space — gives others a way to help. They often want to; they don\'t always know how.' },
            { title: 'When to go deeper vs when to keep it light', explanation: 'You get to choose when to share deeply. Some days light conversation is enough. When you do want to go deeper, saying so gives the other person a chance to be present.' },
          ],
          reflectionPrompt: "What's one thing you've been wanting to say to someone but haven't? What would need to change for you to say it?",
        },
      },
    },
  ],
};

const section2Module3: ManualModule = {
  id: 'manual-2-tire',
  title: 'Tire Rotation (Changing Perspectives)',
  emoji: '🔄',
  lessons: [
    {
      id: 'manual-2-3-1',
      title: 'Thinking About Your Thinking',
      emoji: '🧠',
      linkedActivity: 'thought-challenger',
      content: {
        teen: {
          introduction: "Your thoughts aren't always true. Sometimes your brain serves up the worst possible interpretation — they're mad at me, I'm going to fail, nothing will ever get better. That's not the same as reality. Learning to notice your thoughts — and question the ones that make you feel terrible — is like rotating your tires: you get a different grip on the road.",
          keyConcepts: [
            { title: 'All-or-nothing thinking', explanation: 'Seeing things in black and white — "I always mess up" or "They never listen" — leaves no room for nuance. Most of life is gray. One failure doesn\'t mean always; one bad day isn\'t forever.' },
            { title: 'Catastrophizing', explanation: 'Your brain can jump from "I got a bad grade" to "I\'ll never get into college and my life is ruined." Catastrophizing is when you spiral to the worst outcome. Slowing down and asking "What\'s actually true right now?" helps.' },
            { title: 'Mind reading', explanation: 'Assuming you know what someone else is thinking — "They think I\'m annoying" — is mind reading. You don\'t have access to their mind. You can ask instead of assume.' },
            { title: 'Emotional reasoning and the reframe', explanation: 'Emotional reasoning is "I feel like a failure, so I must be one." Feelings aren\'t facts. A reframe is asking: "What\'s another way to look at this?" There\'s almost always more than one.' },
          ],
          reflectionPrompt: "What's a thought you have on repeat? Is it a fact or a feeling? What's one other way to look at it?",
        },
        adult: {
          introduction: "The way we think shapes the way we feel. Many of our most painful thoughts are distorted — cognitive distortions that psychologists have studied for decades. Learning to recognize them (all-or-nothing thinking, catastrophizing, mind reading, emotional reasoning) and gently challenge them doesn't mean pretending things are fine. It means not letting your brain's worst interpretations run the show.",
          keyConcepts: [
            { title: 'All-or-nothing thinking', explanation: 'Also called black-and-white thinking: things are either perfect or a disaster. Reality is usually in between. One mistake doesn\'t define you; one conflict doesn\'t define a relationship.' },
            { title: 'Catastrophizing', explanation: 'Jumping to the worst possible outcome and treating it as likely. "If I lose this job, I\'ll lose everything." Slowing down to ask "What\'s the evidence? What\'s actually likely?" reduces the spiral.' },
            { title: 'Mind reading', explanation: 'Assuming you know what others think or feel without checking. "They must think I\'m incompetent." Mind reading creates suffering that could be reduced by asking or accepting that we don\'t know.' },
            { title: 'Emotional reasoning and the reframe', explanation: '"I feel it, so it must be true" is emotional reasoning. Reframing is considering other interpretations or evidence. It\'s not positive thinking; it\'s balanced thinking.' },
          ],
          reflectionPrompt: "What's a thought you have on repeat? Is it a fact or a feeling? What's one other way to look at it?",
        },
        senior: {
          introduction: `After decades of life, thought patterns can feel fixed — "I've always thought this way." But the link between thoughts and feelings remains. Noticing distorted thinking (catastrophizing about health, mind reading with family, all-or-nothing about the past) and gently reframing doesn't erase real problems. It gives you more room to respond instead of react.`,
          keyConcepts: [
            { title: 'All-or-nothing thinking', explanation: `"I was a bad parent" or "My life was wasted" leaves no room for the complexity of a long life. Most stories have both good and hard; holding both is more accurate than one extreme.` },
            { title: 'Catastrophizing', explanation: 'Worry about health, loss, or the future can spiral. Asking "What do I know for sure right now?" and "What would I tell a friend in this situation?" can slow the spiral.' },
            { title: 'Mind reading', explanation: 'Assuming adult children are too busy to care, or that someone is judging you — without checking — adds pain that might not be necessary. When possible, ask.' },
            { title: 'Emotional reasoning and the reframe', explanation: 'Feeling useless doesn\'t make it true. Feeling like a burden doesn\'t make it true. Reframing is asking for another angle: "What would someone who loves me say?"' },
          ],
          reflectionPrompt: "What's a thought you have on repeat? Is it a fact or a feeling? What's one other way to look at it?",
        },
      },
    },
  ],
};

const section2Module4: ManualModule = {
  id: 'manual-2-fluid',
  title: 'Fluid Checks (Monitoring Yourself)',
  emoji: '📊',
  lessons: [
    {
      id: 'manual-2-4-1',
      title: 'Tracking Your Patterns',
      emoji: '📈',
      linkedActivity: 'mood-patterns',
      content: {
        teen: {
          introduction: "You're not random. Your moods and reactions have patterns — certain times of day, certain people, certain triggers. Tracking your patterns isn't about judging yourself; it's about knowing yourself. When you see the pattern, you have more power to change it or work with it.",
          keyConcepts: [
            { title: 'Mood journaling', explanation: 'Writing down how you feel — even briefly — over a few days or weeks reveals patterns. You might see that Sundays are hard, or that you feel worse after too much screen time, or better after sleep.' },
            { title: 'Trigger awareness', explanation: 'Triggers are situations or people that tend to set off a strong reaction. Knowing your triggers doesn\'t mean you\'re broken — it means you can prepare, set boundaries, or get support when you\'re heading into one.' },
            { title: 'Cycle patterns', explanation: 'Some people notice cycles: good days followed by low days, or anxiety that spikes at certain times. Seeing the cycle can reduce the fear that the low will last forever.' },
            { title: 'Data as self-compassion', explanation: 'Tracking isn\'t about blaming yourself. It\'s about gathering information so you can be kinder and smarter about how you take care of yourself.' },
          ],
          reflectionPrompt: "Do you notice any patterns in when you feel your best? Your worst? What would it be like to track for a week and see?",
        },
        adult: {
          introduction: "Self-monitoring — paying attention to your moods, triggers, and patterns — is one of the most effective tools for emotional health. It's not navel-gazing; it's data collection. When you see that your anxiety spikes on Sunday nights, or that you feel better after exercise, or that certain people drain you, you can make choices instead of wondering why you feel the way you do.",
          keyConcepts: [
            { title: 'Mood journaling', explanation: 'Brief daily notes on mood, sleep, and key events create a record that reveals patterns over time. You don\'t need to write essays — a few words or a number scale can be enough.' },
            { title: 'Trigger awareness', explanation: 'Knowing what tends to set off anxiety, anger, or low mood lets you prepare, set boundaries, or seek support. Triggers aren\'t character flaws; they\'re information.' },
            { title: 'Cycle patterns', explanation: 'Many people notice weekly, monthly, or situational cycles. Recognizing them reduces the fear that a bad patch will last forever and can help you plan self-care in advance.' },
            { title: 'Data as self-compassion', explanation: 'When you see the data — "I always feel worse when I don\'t sleep" — you can respond with care instead of self-criticism. Data supports self-compassion, not self-judgment.' },
          ],
          reflectionPrompt: "Do you notice any patterns in when you feel your best? Your worst? What would change if you had that information clearly?",
        },
        senior: {
          introduction: "In later life, patterns might include the impact of medication, sleep, pain, or loneliness on your mood. Tracking doesn't have to be elaborate — even mental notes or a simple daily check-in can reveal when you feel better or worse. That knowledge helps you and your doctors make better decisions and helps you be gentler with yourself when you're in a low patch.",
          keyConcepts: [
            { title: 'Mood journaling', explanation: 'A simple daily note — how you felt, how you slept, what you did — can reveal links between activity, health, and mood. That information is valuable for you and for any professional supporting you.' },
            { title: 'Trigger awareness', explanation: 'Certain situations — anniversaries of loss, family conflict, health worries — may reliably affect your mood. Knowing your triggers helps you prepare and ask for support.' },
            { title: 'Cycle patterns', explanation: 'You may notice that certain times of day or week are harder. Recognizing that pattern can reduce the fear that the low will never lift and help you schedule comfort or connection when you need it most.' },
            { title: 'Data as self-compassion', explanation: 'Seeing that your mood dips when you\'re in pain or alone isn\'t a character flaw — it\'s human. Data can help you and others respond with understanding instead of judgment.' },
          ],
          reflectionPrompt: "Do you notice any patterns in when you feel your best? Your worst? What would it mean to honor those patterns with kindness?",
        },
      },
    },
  ],
};

const section2Module5: ManualModule = {
  id: 'manual-2-seasonal',
  title: 'Seasonal Service (Life Transitions)',
  emoji: '🍂',
  lessons: [
    {
      id: 'manual-2-5-1',
      title: 'When Everything Changes',
      emoji: '🔄',
      content: {
        teen: {
          introduction: "Transitions are everywhere when you're young — new school, new friends, your body changing, your identity forming. It's disorienting. You're not the same person you were a year ago, and that can feel exciting and terrifying. Understanding that transition is a season — not forever — and that it's okay to feel lost in the middle of it can help.",
          keyConcepts: [
            { title: 'Grief isn\'t just death', explanation: 'You can grieve the end of a friendship, the loss of a version of yourself, or the childhood that\'s ending. Grief is the natural response to loss — any loss.' },
            { title: 'Identity shifts', explanation: 'Figuring out who you are is messy. You might try on different identities, make mistakes, and change your mind. That\'s not flaky — it\'s development.' },
            { title: 'The gap between old life and new life', explanation: 'Transitions often have an in-between phase where the old doesn\'t fit anymore but the new isn\'t here yet. That gap is uncomfortable — and normal.' },
            { title: 'Growth disguised as chaos', explanation: 'What feels like falling apart can be part of coming together in a new way. Not every crisis is growth, but a lot of growth comes from surviving crisis.' },
          ],
          reflectionPrompt: "What transition are you in right now? What part of your old self are you holding onto — and what might happen if you loosened your grip a little?",
        },
        adult: {
          introduction: `Major life transitions — job change, relationship shift, becoming a parent, losing a parent, moving, illness, empty nest — disrupt our sense of who we are and how life works. The transition period is often painful and confusing. Understanding that grief, identity shift, and the "in-between" are normal can reduce the additional suffering of feeling like you're failing at change.`,
          keyConcepts: [
            { title: 'Grief isn\'t just death', explanation: 'You can grieve a job, a relationship, health, a role you no longer have, or the life you thought you\'d have. Grief is the emotional response to loss of any kind.' },
            { title: 'Identity shifts', explanation: 'Who you are is partly defined by your roles and relationships. When those change, your identity can feel wobbly. That\'s not a breakdown — it\'s the psyche reorganizing.' },
            { title: 'The gap between old life and new life', explanation: 'William Bridges called it the "neutral zone" — the messy middle where the old is gone and the new isn\'t fully formed. It\'s uncomfortable and often when the most growth happens.' },
            { title: 'Growth disguised as chaos', explanation: 'What looks like falling apart can be the necessary dismantling before a new structure forms. That doesn\'t make it easy — but it can make it meaningful.' },
          ],
          reflectionPrompt: "What transition are you in right now? What part of your old self or old life are you holding onto? What would it mean to acknowledge the loss and the possibility at the same time?",
        },
        senior: {
          introduction: "Later life is full of transitions — retirement, loss of spouse or friends, health changes, moving, changing roles in the family. These aren't small adjustments; they're identity-level shifts. Grief, disorientation, and the feeling of being in-between are normal. You're not failing at aging; you're navigating one of the biggest transitions there is.",
          keyConcepts: [
            { title: 'Grief isn\'t just death', explanation: 'You can grieve independence, the role you had at work, the way your body used to work, or the people and places that are gone. All of that grief is valid.' },
            { title: 'Identity shifts', explanation: 'So much of identity was tied to work, to being a caregiver, to being "the strong one." When those roles change, it\'s normal to wonder who you are now. That question is part of the transition.' },
            { title: 'The gap between old life and new life', explanation: 'The in-between — no longer who you were, not yet at peace with who you are now — is a real phase. It doesn\'t last forever, but it deserves compassion while it lasts.' },
            { title: 'Growth disguised as chaos', explanation: 'Finding meaning, wisdom, and a new sense of purpose after loss or change is possible. It doesn\'t replace what was lost, but it can coexist with it.' },
          ],
          reflectionPrompt: "What transition are you in right now? What part of your old self or old life are you holding onto? What would gentleness toward yourself in this transition look like?",
        },
      },
    },
  ],
};

// ----- Section 3: Troubleshooting -----

const section3Module1: ManualModule = {
  id: 'manual-3-warning',
  title: 'Warning Lights',
  emoji: '⚠️',
  lessons: [
    {
      id: 'manual-3-1-1',
      title: 'Anxiety: The Overactive Alarm',
      emoji: '🚨',
      linkedActivity: 'stress-thermo',
      content: {
        teen: {
          introduction: "Anxiety is like a car alarm that goes off too easily — sometimes when there's no real threat. Your brain is trying to protect you, but it's oversensitive. That doesn't mean you're broken. It means your alarm system needs some recalibration. Understanding how anxiety works is the first step to feeling more in control.",
          keyConcepts: [
            { title: 'Generalized anxiety', explanation: 'When worry feels constant and spreads to everything — school, friends, the future, your body — that\'s generalized anxiety. The alarm is set too high. It\'s treatable.' },
            { title: 'Social anxiety', explanation: 'Fear of being judged, embarrassed, or rejected in social situations is common. It\'s not shyness — it\'s the alarm firing around other people. You\'re not alone in it.' },
            { title: 'Panic', explanation: 'Panic attacks are sudden, intense waves of fear with physical symptoms — racing heart, shortness of breath. They feel dangerous but they\'re not. Your body is misfiring; it passes.' },
            { title: 'The anxiety-avoidance cycle', explanation: 'Avoiding what makes you anxious gives short-term relief but makes the anxiety stronger long-term. Facing feared situations — gradually — is how you turn the alarm down.' },
          ],
          reflectionPrompt: "What do you avoid because of anxiety? What would you do if the anxiety wasn't there?",
        },
        adult: {
          introduction: "Anxiety is the nervous system's threat detector set on high. It evolved to keep us safe, but in modern life it often fires at perceived threats — deadlines, conflict, uncertainty — that aren't life-threatening. Understanding anxiety as an overactive alarm, not a character flaw, is the first step toward managing it. And avoidance, though tempting, makes it worse.",
          keyConcepts: [
            { title: 'Generalized anxiety', explanation: 'Persistent worry about many areas of life — work, health, relationships, the world — that\'s hard to shut off. The mind treats uncertainty as threat. Learning to tolerate uncertainty reduces the fuel for anxiety.' },
            { title: 'Social anxiety', explanation: 'Fear of negative evaluation in social or performance situations. It\'s more than shyness; it\'s the alarm firing around others. Exposure and cognitive work can significantly reduce it.' },
            { title: 'Panic', explanation: 'Panic attacks are acute surges of fear with physical symptoms. They feel catastrophic but aren\'t dangerous. Understanding that they peak and pass — and that avoiding them reinforces them — is key.' },
            { title: 'Why avoidance makes it worse', explanation: 'Avoiding anxiety-provoking situations reduces anxiety in the moment but teaches the brain that the situation is dangerous. Approach — in manageable steps — teaches the brain that you can cope.' },
          ],
          reflectionPrompt: "What do you avoid because of anxiety? What would you do if the anxiety wasn't there?",
        },
        senior: {
          introduction: `Anxiety in later life can center on health, loss, finances, or dependence. It's not "just worry" — it's the same overactive alarm system, sometimes triggered by real concerns and sometimes by the brain's habit of scanning for threat. Understanding that anxiety is the alarm, not the reality of danger, and that avoidance fuels it, can help you take small steps toward more peace.`,
          keyConcepts: [
            { title: 'Generalized anxiety', explanation: 'Worry that won\'t turn off about health, family, or the future is common in later life. It doesn\'t mean you\'re weak. It means the alarm is set high. Reducing caffeine, improving sleep, and talking to someone can help.' },
            { title: 'Social anxiety', explanation: 'Withdrawal from social situations due to fear of judgment or burdening others can increase isolation. Small steps back into connection — one person, one activity — can dial down the alarm.' },
            { title: 'Panic', explanation: 'Panic attacks can happen at any age. They feel like a heart attack or losing control, but they pass. Knowing they\'re not dangerous and that they peak within minutes can reduce the fear of the next one.' },
            { title: 'Why avoidance makes it worse', explanation: 'Avoiding places or activities that trigger anxiety gives short-term relief but reinforces the brain\'s belief that they\'re dangerous. Gentle, gradual exposure — with support — can retrain the alarm.' },
          ],
          reflectionPrompt: "What do you avoid because of anxiety? What would you do if the anxiety wasn't there?",
        },
      },
    },
    {
      id: 'manual-3-1-2',
      title: 'Depression: The Engine Stalling',
      emoji: '🛑',
      content: {
        teen: {
          introduction: "Depression isn't just sadness. It's more like the engine of your motivation and joy stalling — everything feels heavy, slow, and pointless. You're not lazy and you're not broken. Your system is struggling, and that's real. Small actions and support can help the engine start again.",
          keyConcepts: [
            { title: 'Depression isn\'t laziness', explanation: 'When you\'re depressed, even small tasks feel impossible. That\'s not laziness — it\'s the brain\'s energy and reward systems running low. You wouldn\'t blame someone with the flu for not running a marathon.' },
            { title: 'Anhedonia', explanation: 'Anhedonia is when things that used to bring joy don\'t anymore. Hobbies, friends, food can feel flat. It\'s a symptom of depression, not a character flaw.' },
            { title: 'The withdrawal spiral', explanation: 'Depression makes you want to isolate, and isolation makes depression worse. It\'s a trap. Even small steps toward connection or activity can interrupt the spiral.' },
            { title: 'Small actions matter', explanation: 'You don\'t have to fix everything at once. One text, one shower, one short walk can be a win. Small actions build momentum and send the brain a different message.' },
          ],
          reflectionPrompt: "If you're feeling low: what's one tiny thing that might bring a moment of okay-ness today? It doesn't have to be joy — just a little less heavy.",
        },
        adult: {
          introduction: "Depression is often described as the engine stalling — motivation, pleasure, and energy drop, and the world can feel gray and pointless. It's not a moral failing or laziness; it's a state of the nervous system. Understanding that depression lies (you're not worthless; things are not hopeless) and that small, consistent actions and professional support can help restart the system is crucial.",
          keyConcepts: [
            { title: 'Depression isn\'t laziness', explanation: 'The inability to "just do it" when depressed is neurological. Motivation and reward circuits are underactive. Self-criticism for not being productive makes depression worse; compassion and small steps help.' },
            { title: 'Anhedonia', explanation: 'Loss of interest or pleasure in things you used to enjoy is a core symptom of depression. It\'s not that you\'ve become a different person; it\'s that the reward system is dampened. It can return with treatment and time.' },
            { title: 'The withdrawal spiral', explanation: 'Depression drives withdrawal, and withdrawal deepens depression. Breaking the spiral — even with one small act of connection or activity — is one of the most powerful things you can do.' },
            { title: 'Small actions matter', explanation: 'Behavioral activation — doing one small thing even when you don\'t feel like it — is evidence-based. You don\'t have to feel motivated first. Action can precede motivation.' },
          ],
          reflectionPrompt: "If you're feeling low: what's one tiny thing that might bring a moment of okay-ness today?",
        },
        senior: {
          introduction: `Depression in later life can be mistaken for "just getting old" or "having a reason to be sad." But depression is not a normal part of aging. It's the engine stalling — energy, interest, and hope running low. It's treatable. And it's not your fault. Small steps and professional support can make a real difference.`,
          keyConcepts: [
            { title: 'Depression isn\'t laziness', explanation: 'When you\'re depressed, even basic tasks feel overwhelming. That\'s the condition, not a character flaw. Family and doctors sometimes miss depression in older adults; it\'s worth naming and seeking help.' },
            { title: 'Anhedonia', explanation: 'Losing interest in things that used to matter — hobbies, visits, food — is a symptom. It can improve with treatment, connection, and gradual re-engagement. You\'re not "done" with life; the system is underpowered.' },
            { title: 'The withdrawal spiral', explanation: 'Isolation deepens depression, and depression pushes you toward isolation. One phone call, one visit, one short outing can be a step out of the spiral.' },
            { title: 'Small actions matter', explanation: 'One small positive action — a shower, a walk, a conversation — can shift the momentum. You don\'t have to feel like it first. The action can come before the feeling.' },
          ],
          reflectionPrompt: "If you're feeling low: what's one tiny thing that might bring a moment of okay-ness today?",
        },
      },
    },
    {
      id: 'manual-3-1-3',
      title: 'Anger: The Overheat Warning',
      emoji: '🔥',
      linkedActivity: 'trigger-map',
      content: {
        teen: {
          introduction: "Anger is like an overheat warning — the engine is running too hot. But anger is usually a secondary emotion. Underneath it there's often hurt, fear, shame, or feeling disrespected. When you can name what's underneath, you have more choices about how to respond instead of just exploding or stuffing it.",
          keyConcepts: [
            { title: 'Anger as a cover for hurt, fear, shame', explanation: 'Anger often protects you from feeling something more vulnerable. "I\'m not hurt — I\'m mad" can feel safer. But the hurt or fear is usually what needs attention.' },
            { title: 'Healthy vs destructive expression', explanation: 'Healthy expression means naming the feeling and what you need without attacking the other person. Destructive expression is yelling, blaming, or acting out in ways that damage relationship or respect.' },
            { title: 'The cool-down period', explanation: 'When you\'re flooded with anger, your thinking brain is offline. Taking a break — 20 minutes, a walk, deep breaths — lets the system cool down so you can respond instead of react.' },
            { title: 'Anger as information', explanation: 'Anger tells you something matters to you — a boundary was crossed, a value was violated. The feeling is valid; what you do with it is the choice.' },
          ],
          reflectionPrompt: "Think of the last time you were angry. What was underneath the anger? Hurt? Fear? Feeling disrespected?",
        },
        adult: {
          introduction: `Anger is one of the most common "overheat" signals. It's often a secondary emotion — a protective cover for hurt, fear, or shame. Understanding that anger is information (something matters to you, a boundary was crossed) and that there's a difference between feeling it and acting on it can transform your relationships and your relationship with yourself.`,
          keyConcepts: [
            { title: 'Anger as a cover for hurt, fear, shame', explanation: 'In therapy, anger is often called a "secondary emotion." Primary emotions — hurt, fear, shame — feel more vulnerable, so the brain serves up anger as protection. Getting curious about what\'s underneath reduces reactive outbursts.' },
            { title: 'Healthy vs destructive expression', explanation: 'Healthy expression: "I feel angry when X happens. I need Y." Destructive expression: attacking, blaming, or acting in ways that harm. The feeling is valid; the expression can be chosen.' },
            { title: 'The cool-down period', explanation: 'When emotionally flooded, the prefrontal cortex is offline. Taking 20–30 minutes to cool down before addressing the issue prevents saying or doing things you\'ll regret.' },
            { title: 'Anger as information', explanation: 'Anger signals that something you care about was violated — a boundary, a value, your dignity. Listening to that signal (without letting it run the show) is useful.' },
          ],
          reflectionPrompt: "Think of the last time you were angry. What was underneath the anger?",
        },
        senior: {
          introduction: "Anger in later life can flare around loss of control, feeling dismissed by family or doctors, or grief that has nowhere to go. It's still often a secondary emotion — hurt, fear, or shame underneath. Understanding that anger is an overheat warning, not the whole story, and that you can feel it without letting it dictate your behavior, can help you and those around you.",
          keyConcepts: [
            { title: 'Anger as a cover for hurt, fear, shame', explanation: 'Feeling powerless, disrespected, or unheard can show up as anger. Naming the hurt or fear beneath it doesn\'t make the anger wrong — it gives you more options for how to respond.' },
            { title: 'Healthy vs destructive expression', explanation: 'You can say "I feel angry when I\'m talked over" without attacking. Healthy expression protects your dignity and your relationships; destructive expression often damages both.' },
            { title: 'The cool-down period', explanation: 'When you\'re flooded, pause. Leave the room if you need to. Come back when you\'re calmer. That\'s not weakness — it\'s regulation.' },
            { title: 'Anger as information', explanation: 'Anger tells you something matters. Listening to it — "What boundary was crossed? What do I need?" — is more useful than either stuffing it or exploding.' },
          ],
          reflectionPrompt: "Think of the last time you were angry. What was underneath the anger?",
        },
      },
    },
  ],
};

const section3Module2: ManualModule = {
  id: 'manual-3-noises',
  title: 'Strange Noises',
  emoji: '🔊',
  lessons: [
    {
      id: 'manual-3-2-1',
      title: 'Intrusive Thoughts',
      emoji: '💭',
      content: {
        teen: {
          introduction: "Sometimes a thought pops into your head that's weird, scary, or gross — something you'd never do but your brain just went there. That's an intrusive thought. Almost everyone has them. Having the thought doesn't mean you want to do it. It doesn't mean anything about who you are. Understanding that can take away a lot of the shame and fear.",
          keyConcepts: [
            { title: 'Everyone has them', explanation: 'Intrusive thoughts are common — violent, sexual, or "wrong" thoughts that pop up unbidden. They don\'t reflect your character. They\'re the brain\'s random noise.' },
            { title: 'Having the thought ≠ wanting to act', explanation: 'Thinking something doesn\'t mean you want it. The brain generates all kinds of content. What you do with it — whether you act — is what matters.' },
            { title: 'Why fighting them makes them louder', explanation: 'Trying to suppress or push away intrusive thoughts often makes them come back more. The brain keeps checking "don\'t think about that" and... now you\'re thinking about it.' },
            { title: 'Observation without judgment', explanation: 'Noticing the thought — "There it is again" — without judging yourself or engaging with it can reduce its power. You\'re not the thought; you\'re the one noticing it.' },
          ],
          reflectionPrompt: "Have you ever been scared by your own thoughts? You're not alone — and having them doesn't mean anything about who you are.",
        },
        adult: {
          introduction: "Intrusive thoughts are unwanted, often disturbing thoughts that pop into consciousness — about harm, taboo topics, or things that go against your values. They're remarkably common and, for most people, meaningless. The problem isn't the thought; it's the fear and shame that can attach to it. Understanding that intrusive thoughts are brain noise, not truth, and that fighting them often makes them stickier, can bring real relief.",
          keyConcepts: [
            { title: 'Everyone has them', explanation: 'Research shows that most people experience intrusive thoughts. They can be violent, sexual, or blasphemous. They don\'t reflect your values or your character.' },
            { title: 'Having the thought ≠ wanting to act', explanation: 'The content of a thought is not the same as intention. People with OCD or anxiety often fear that having a thought means they want to act on it. It doesn\'t. Thought and action are separate.' },
            { title: 'Why fighting them makes them louder', explanation: 'Thought suppression backfires — the more you try not to think something, the more it appears. Acceptance and non-engagement (letting the thought be there without feeding it) reduce its impact.' },
            { title: 'Observation without judgment', explanation: 'Mindfulness of thoughts — "I notice I\'m having that thought again" — creates distance. You\'re not the thought; you\'re the awareness that can observe it and let it pass.' },
          ],
          reflectionPrompt: "Have you ever been scared by your own thoughts? You're not alone — and having them doesn't mean anything about who you are.",
        },
        senior: {
          introduction: `Intrusive thoughts can happen at any age. Sometimes in later life they might center on harm, illness, or loss. They can feel especially alarming if you believe "I should have more control by now." But intrusive thoughts are not a sign of weakness or danger. They're brain noise. Understanding that — and that you don't have to act on or believe them — can reduce the distress they cause.`,
          keyConcepts: [
            { title: 'Everyone has them', explanation: 'Intrusive thoughts are a common human experience. They don\'t indicate that you\'re "losing it" or that you\'re a bad person. They\'re unwelcome mental events, not commands.' },
            { title: 'Having the thought ≠ wanting to act', explanation: 'Thinking something doesn\'t mean wanting it. Many people have fleeting thoughts that horrify them. What matters is that you don\'t act on them — and most people never do.' },
            { title: 'Why fighting them makes them louder', explanation: 'Trying to push thoughts away often makes them return more often. Letting them be there — without engaging or judging — tends to reduce their frequency and power over time.' },
            { title: 'Observation without judgment', explanation: 'Noticing "there\'s that thought again" without adding "and that means something terrible about me" creates space. The thought can pass. You don\'t have to host it forever.' },
          ],
          reflectionPrompt: "Have you ever been scared by your own thoughts? You're not alone — and having them doesn't mean anything about who you are.",
        },
      },
    },
  ],
};

const section3Module3: ManualModule = {
  id: 'manual-3-overheating',
  title: 'Overheating',
  emoji: '🌡️',
  lessons: [
    {
      id: 'manual-3-3-1',
      title: 'Emotional Overwhelm',
      emoji: '🌊',
      linkedActivity: 'stress-thermo',
      content: {
        teen: {
          introduction: "When everything is too much — school, friends, family, your body, the future — you can hit a point where you feel like you're drowning. That's emotional overwhelm. Your nervous system is flooded. It's not weak to feel that way. And there are ways to come back: grounding, breathing, and knowing that it's okay to shut down temporarily.",
          keyConcepts: [
            { title: 'Emotional flooding', explanation: 'When too much comes at once, your brain can\'t process it. You might cry, freeze, or feel numb. That\'s flooding — the system overloaded. It\'s a normal response to too much input.' },
            { title: 'The window of tolerance', explanation: 'Everyone has a "window" — a range of arousal where they can think and cope. When stress pushes you outside that window, you might flip into fight, flight, or freeze. The goal is to widen the window and to return to it when you\'re outside.' },
            { title: 'Grounding techniques', explanation: 'Grounding brings you back to the present: 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste. Or cold water on your face. They interrupt the spiral and anchor you in "right now."' },
            { title: 'It\'s okay to shut down temporarily', explanation: 'Sometimes the only way through is to rest — to stop trying to fix or figure out and just be. That\'s not giving up. It\'s letting the system reset.' },
          ],
          reflectionPrompt: "What does overwhelm feel like in your body? What helps you come back — even a little?",
        },
        adult: {
          introduction: "Emotional overwhelm is when the demands on your nervous system exceed your capacity to process them. You might feel flooded, numb, or like you're watching yourself from outside. It's a real state — not drama or weakness. Understanding the window of tolerance, and having grounding and regulation tools, can help you come back when you've gone over the edge.",
          keyConcepts: [
            { title: 'Emotional flooding', explanation: 'When the amygdala and stress response take over, the prefrontal cortex goes offline. You can\'t think clearly; you might react intensely or shut down. That\'s flooding. It passes, but in the moment it feels endless.' },
            { title: 'The window of tolerance', explanation: 'Within your window, you can think, feel, and respond flexibly. Outside it — too high (anxiety, rage) or too low (numb, dissociated) — you\'re in survival mode. The work is to recognize when you\'re outside and to use tools to return.' },
            { title: 'Grounding techniques', explanation: '5-4-3-2-1 (senses), cold water, slow breathing, or naming objects in the room can pull you back into the present and reduce dissociation or panic.' },
            { title: 'It\'s okay to shut down temporarily', explanation: 'Sometimes the nervous system needs to shut down to protect itself. Rest, sleep, or doing nothing for a bit isn\'t failure — it\'s the system trying to recover.' },
          ],
          reflectionPrompt: "What does overwhelm feel like in your body? What helps you come back?",
        },
        senior: {
          introduction: "Overwhelm in later life can come from health worries, loss, caregiving, or the accumulation of stress. When everything feels like too much, your system may flood or shut down. That's not a character flaw — it's the nervous system protecting itself. Grounding techniques and permission to rest can help you come back when you're ready.",
          keyConcepts: [
            { title: 'Emotional flooding', explanation: 'Too much stress — physical, emotional, or both — can overwhelm the system. You might feel like you can\'t think or like you\'re floating. That\'s a real state. It doesn\'t last forever.' },
            { title: 'The window of tolerance', explanation: 'When you\'re within your window, you can cope. When you\'re outside it — too activated or too shut down — you need to regulate. Knowing that you can return to the window with time and gentle care is important.' },
            { title: 'Grounding techniques', explanation: 'Noticing what you see, hear, and touch right now can anchor you. So can slow breathing or holding something cold. These are simple tools that work at any age.' },
            { title: 'It\'s okay to shut down temporarily', explanation: 'Rest isn\'t laziness. When the system is overwhelmed, stopping — really stopping — can be what allows recovery. You\'re allowed to not be "on" all the time.' },
          ],
          reflectionPrompt: "What does overwhelm feel like in your body? What helps you come back?",
        },
      },
    },
  ],
};

const section3Module4: ManualModule = {
  id: 'manual-3-breakdown',
  title: 'Breakdown on the Road',
  emoji: '🚧',
  lessons: [
    {
      id: 'manual-3-4-1',
      title: 'Panic Attacks and Emotional Crises',
      emoji: '🆘',
      linkedActivity: 'breathing',
      content: {
        teen: {
          introduction: "When panic hits, it feels like you're dying — heart racing, can't breathe, world spinning. But panic attacks aren't dangerous. They're your body's alarm going off at full volume when there's no real threat. Knowing that can help you get through the next one. And having a plan — breathing, grounding, who to call — makes the worst moments more manageable.",
          keyConcepts: [
            { title: 'Panic attacks aren\'t dangerous', explanation: 'They feel like a heart attack or losing control. But they don\'t cause heart attacks, and you won\'t lose control. They peak in about 10 minutes and then subside. Knowing that can reduce the fear of the next one.' },
            { title: '5-4-3-2-1 grounding', explanation: 'Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste. It pulls your brain into the present and out of the panic spiral.' },
            { title: 'Box breathing', explanation: 'Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat. It activates the calming part of your nervous system and gives your mind something to focus on.' },
            { title: 'Calling for help is strength', explanation: 'Texting or calling someone — a friend, a hotline, a parent — when you\'re in crisis isn\'t weak. It\'s brave. You don\'t have to ride it out alone.' },
          ],
          reflectionPrompt: "Do you have a plan for your worst moments? Who would you call? What would you do first (breathe, ground, text someone)?",
        },
        adult: {
          introduction: "In an acute crisis — panic attack, emotional breakdown, or moment when you don't feel safe with yourself — the most important thing is to get through the next minutes. Panic attacks are not dangerous; they feel catastrophic. Grounding and breathing can help. And reaching out — to a friend, a crisis line, or a professional — is a sign of strength, not weakness.",
          keyConcepts: [
            { title: 'Panic attacks aren\'t dangerous (they feel like it)', explanation: 'Panic mimics cardiac and other serious events, but it\'s the nervous system misfiring. It peaks and passes. Reminding yourself of that in the moment can reduce secondary fear ("I\'m going to die").' },
            { title: 'The 5-4-3-2-1 grounding technique', explanation: 'Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste. It engages the senses and the present moment, interrupting the panic loop.' },
            { title: 'Box breathing', explanation: '4 counts in, 4 hold, 4 out, 4 hold. Slow, deliberate breathing activates the parasympathetic nervous system and gives the mind a focal point.' },
            { title: 'Calling for help is strength', explanation: '988, a therapist, a trusted friend — reaching out in crisis is one of the bravest things you can do. You don\'t have to white-knuckle it alone.' },
          ],
          reflectionPrompt: "Do you have a plan for your worst moments? Let's make one — who to call, what to do first.",
        },
        senior: {
          introduction: "Panic or emotional crisis can happen at any age. In the moment, it feels like it will never end. But panic attacks peak and pass; emotional crises can be weathered with support. Having a plan — breathing, grounding, who to call — doesn't mean you're fragile. It means you're prepared. And asking for help in a crisis is strength.",
          keyConcepts: [
            { title: 'Panic attacks aren\'t dangerous', explanation: 'They feel terrifying — heart racing, breath short. But they\'re not heart attacks and they don\'t last. Knowing that can help you ride them out. If in doubt, seek medical care; but for many people, panic is the explanation.' },
            { title: '5-4-3-2-1 grounding', explanation: 'Naming what you see, hear, and touch right now can anchor you when the world feels like it\'s spinning. It\'s a simple technique that works.' },
            { title: 'Box breathing', explanation: 'Slow, even breathing — in, hold, out, hold — calms the nervous system. You can do it anywhere. It\'s a tool you always have.' },
            { title: 'Calling for help is strength', explanation: 'Calling 988, a family member, or your doctor when you\'re in crisis isn\'t weakness. It\'s using the support that exists. You deserve to not be alone in the worst moments.' },
          ],
          reflectionPrompt: "Do you have a plan for your worst moments? Who would you call? What would you do first?",
        },
      },
    },
  ],
};

const section3Module5: ManualModule = {
  id: 'manual-3-mechanic',
  title: 'When to See the Mechanic',
  emoji: '🔧',
  lessons: [
    {
      id: 'manual-3-5-1',
      title: 'When Self-Help Isn\'t Enough',
      emoji: '🩺',
      content: {
        teen: {
          introduction: `Sometimes what you're going through is too big for an app, a book, or even a good friend. That doesn't mean you've failed. It means you need a professional — someone trained to help with the stuff that's stuck. Therapy isn't for "crazy people." It's for anyone who wants support figuring out their mind and their life. And if you're LGBTQ+, you deserve a therapist who gets that.`,
          keyConcepts: [
            { title: 'Therapy isn\'t failure', explanation: 'Going to therapy doesn\'t mean you\'re broken. It means you\'re taking your mental health seriously. Athletes have coaches; musicians have teachers. Brains can use guides too.' },
            { title: 'Types of therapy (simple)', explanation: 'CBT helps you change unhelpful thoughts and behaviors. DBT adds skills for emotion regulation and relationships. EMDR helps process trauma. Different tools for different needs.' },
            { title: 'How to find a therapist', explanation: 'Ask your doctor, search psychologytoday.com or your insurance site, or use a school counselor as a starting point. You can try a session and see if the person feels like a fit.' },
            { title: 'LGBTQ+ affirming care', explanation: 'If you\'re LGBTQ+, you deserve a therapist who affirms your identity. It\'s okay to ask: "Are you experienced with LGBTQ+ clients? Are you affirming?" A good therapist will say yes and mean it.' },
          ],
          reflectionPrompt: "Is there something you've been handling alone that might benefit from professional support? What would it be like to try one session?",
        },
        adult: {
          introduction: "There comes a point when self-help isn't enough — when patterns are too entrenched, when trauma needs processing, or when you're stuck in ways that books and apps can't address. That's not failure; it's the moment to seek a professional. Therapy is a tool. So is medication when it's indicated. And if you're LGBTQ+, finding an affirming therapist isn't optional — it's essential. You deserve a mechanic who knows your make and model.",
          keyConcepts: [
            { title: 'Therapy isn\'t failure', explanation: 'Seeking therapy is a sign of resourcefulness, not weakness. It\'s an investment in your quality of life and relationships. Many people who go to therapy are high-functioning; they just want support.' },
            { title: 'Types of therapy (CBT, DBT, EMDR — simply)', explanation: 'CBT targets thoughts and behaviors. DBT adds emotion regulation and interpersonal skills. EMDR is used for trauma. Your therapist can explain what they do and why.' },
            { title: 'How to find a therapist', explanation: 'Psychology Today, your insurance directory, or a referral from your doctor. You can interview a few. Fit matters — you should feel heard and respected.' },
            { title: 'LGBTQ+ affirming care', explanation: 'If you\'re LGBTQ+, ask explicitly: "Are you affirming of trans and queer identities? Do you have experience with LGBTQ+ clients?" You deserve a therapist who sees and affirms all of you. Your identity is not a debate.' },
          ],
          reflectionPrompt: "Is there something you've been handling alone that might benefit from professional support?",
        },
        senior: {
          introduction: `In later life, the idea of therapy can feel foreign — "we didn't do that in my day." But therapy isn't just for young people or "serious" cases. It's for anyone who wants support with loss, transition, depression, anxiety, or the weight of a long life. Medication can also be a tool, not a crutch. And if you're LGBTQ+, you deserve a therapist who affirms who you are. Your identity is not something to fix.`,
          keyConcepts: [
            { title: 'Therapy isn\'t failure', explanation: 'Seeking therapy at any age is a sign of strength. It\'s never too late to get support for grief, depression, anxiety, or the challenges of aging. Many therapists work specifically with older adults.' },
            { title: 'Types of therapy', explanation: 'CBT, supportive therapy, grief counseling, and others can help. Your doctor or a local mental health agency can point you to someone. You can ask what approach they use.' },
            { title: 'Medication as a tool', explanation: 'Antidepressants or anti-anxiety medication aren\'t a crutch — they\'re a tool that can help the brain function better. It\'s okay to consider them with your doctor.' },
            { title: 'LGBTQ+ affirming care', explanation: 'If you\'re LGBTQ+, you deserve a therapist who affirms your identity. It\'s okay to ask: "Are you affirming of LGBTQ+ clients?" A good mechanic knows your make and model. You deserve that.' },
          ],
          reflectionPrompt: "Is there something you've been handling alone that might benefit from professional support?",
        },
      },
    },
  ],
};

// ----- Section 4: Upgrades -----

const section4Module1: ManualModule = {
  id: 'manual-4-eq',
  title: 'Performance Tuning',
  emoji: '🏎️',
  lessons: [
    {
      id: 'manual-4-1-1',
      title: 'What Is Emotional Intelligence?',
      emoji: '🧠',
      content: {
        teen: {
          introduction: `Emotional intelligence (EQ) isn't about being nice or never getting mad. It's about knowing your own emotions, managing them, reading other people's emotions, and handling relationships well. Some of the most "successful" people in life aren't the smartest in the book sense — they're the ones who get emotions, in themselves and others. You can build EQ. It's a skill.`,
          keyConcepts: [
            { title: 'Self-awareness', explanation: 'Knowing what you feel and why. Noticing your moods, your triggers, and how you show up in different situations. It\'s the foundation of everything else.' },
            { title: 'Self-regulation', explanation: 'Managing your emotions instead of being run by them. Pausing before reacting, choosing how to express yourself, and not letting every feeling dictate your behavior.' },
            { title: 'Empathy', explanation: 'Reading and feeling what others might be feeling. Not assuming you know — but being curious and open. Empathy doesn\'t mean agreeing; it means understanding.' },
            { title: 'Why EQ matters for life outcomes', explanation: 'Research shows EQ predicts relationship quality, job performance, and well-being as much or more than IQ. You can get smarter about emotions at any age.' },
          ],
          reflectionPrompt: "On a scale of 1-10, how well do you understand your own emotions? How well do you understand others'? What would make each number one point higher?",
        },
        adult: {
          introduction: "Emotional intelligence (EQ) is the capacity to recognize and manage your own emotions and to recognize and influence the emotions of others. It's not soft skills — it's the skills that determine the quality of your relationships, your leadership, and your inner life. EQ can be developed. It's not fixed at birth. And it often matters more than IQ for life satisfaction and success.",
          keyConcepts: [
            { title: 'Self-awareness', explanation: 'The ability to notice your emotions, name them, and understand what triggers them. Without self-awareness, you\'re at the mercy of reactions you don\'t understand.' },
            { title: 'Self-regulation', explanation: 'The ability to manage your emotions — to choose your response rather than default to impulse. It includes delaying gratification, managing stress, and adapting to change.' },
            { title: 'Empathy', explanation: 'The ability to sense what others are feeling and to take their perspective. Empathy supports connection, conflict resolution, and care. It can be cultivated.' },
            { title: 'Why EQ matters more than IQ for life outcomes', explanation: 'Studies link EQ to better relationships, mental health, and job performance. Technical skill gets you in the door; emotional skill determines how far you go and how well you live.' },
          ],
          reflectionPrompt: "On a scale of 1-10, how well do you understand your own emotions? How well do you understand others'? What would improve each?",
        },
        senior: {
          introduction: "Emotional intelligence isn't just for the young. In fact, many older adults have developed high EQ through decades of relationships, loss, and reflection. EQ includes self-awareness (knowing what you feel), self-regulation (managing it), empathy (reading others), and social skill (navigating relationships). You've had a lifetime to practice. And there's always room to refine.",
          keyConcepts: [
            { title: 'Self-awareness', explanation: 'Knowing your emotional patterns, triggers, and needs. Many older adults have deep self-awareness from a long life of reflection. It\'s an asset in relationships and in advocating for yourself.' },
            { title: 'Self-regulation', explanation: 'Choosing how to respond to emotion rather than reacting automatically. Wisdom often shows up as increased capacity for pause and choice.' },
            { title: 'Empathy', explanation: 'Understanding what others might be feeling. Long experience with people can sharpen empathy — and it remains one of the most important gifts you can offer family and friends.' },
            { title: 'Why EQ matters for life outcomes', explanation: 'EQ supports relationship quality, decision-making, and well-being at every stage. The good news: it can keep growing. You\'re not done developing.' },
          ],
          reflectionPrompt: "On a scale of 1-10, how well do you understand your own emotions? How well do you understand others'? What have you learned about both over your life?",
        },
      },
    },
  ],
};

const section4Module2: ManualModule = {
  id: 'manual-4-boundaries',
  title: 'New Features',
  emoji: '🆕',
  lessons: [
    {
      id: 'manual-4-2-1',
      title: 'Boundaries Are Features, Not Bugs',
      emoji: '🚧',
      linkedActivity: 'comm-builder',
      content: {
        teen: {
          introduction: "Boundaries aren't about being mean or building walls. They're about knowing what's okay for you and what isn't — and saying it. That's a feature, not a bug. You get to decide who gets access to your time, your body, your energy, and your story. Setting boundaries might feel selfish at first, but it's actually how you protect your ability to show up for the people and things that matter.",
          keyConcepts: [
            { title: 'What boundaries actually are', explanation: 'Boundaries are limits you set about what you will and won\'t do, or what you will and won\'t accept. "I need to leave by 9" or "I don\'t want to talk about that" are boundaries.' },
            { title: 'Why they feel mean (but aren\'t)', explanation: 'We\'re often taught that saying no or having limits is selfish. But boundaries protect your energy so you can actually be present. Without them, you burn out or resent people.' },
            { title: 'How to set them without guilt', explanation: 'You can set a boundary calmly: "I\'m not able to do that" or "I need X." You don\'t have to over-explain or apologize for having limits. Short and clear is enough.' },
            { title: 'When boundaries get tested', explanation: 'People might push back when you set a boundary. That doesn\'t mean you\'re wrong. It might mean they\'re used to you having none. Holding the line is how boundaries become real.' },
          ],
          reflectionPrompt: "Where in your life do you need a boundary that doesn't exist yet? What would it be?",
        },
        adult: {
          introduction: "Boundaries are the limits you set around your time, energy, body, and emotional availability. They're not walls; they're the way you protect your capacity to care. Many adults struggle with guilt when setting boundaries — as if having limits is selfish. But boundaries are what allow you to sustain relationships and work without burning out. They're a feature of healthy systems, not a bug.",
          keyConcepts: [
            { title: 'What boundaries actually are', explanation: 'Boundaries define what you will and won\'t do, accept, or tolerate. They can be about time ("I don\'t work after 6"), emotional availability ("I can\'t talk about that right now"), or physical space.' },
            { title: 'Why they feel mean (but aren\'t)', explanation: 'Cultural and family messages often equate boundaries with selfishness or coldness. In reality, boundaries prevent resentment and burnout and make sustained care possible.' },
            { title: 'How to set them without guilt', explanation: 'State the boundary clearly and briefly. You don\'t owe a long justification. "I\'m not available for that" is complete. Guilt may show up; it doesn\'t mean you\'re wrong.' },
            { title: 'When boundaries get tested', explanation: 'People who benefited from your lack of boundaries may push back. Testing is normal. Holding the boundary — with kindness and consistency — is how others learn what you need.' },
          ],
          reflectionPrompt: "Where in your life do you need a boundary that doesn't exist yet?",
        },
        senior: {
          introduction: "In later life, boundaries might be about how much you give to family, what you'll discuss with doctors, or how you want to be treated by caregivers. Setting boundaries doesn't make you difficult — it makes you clear. You've earned the right to say what works for you and what doesn't. And boundaries protect your energy so you can still show up for what matters.",
          keyConcepts: [
            { title: 'What boundaries actually are', explanation: 'Boundaries are the limits you set — about your time, your body, your privacy, or what you\'ll discuss. "I don\'t want to talk about that" or "I need to rest now" are boundaries.' },
            { title: 'Why they feel mean (but aren\'t)', explanation: 'Many older adults were raised to put others first always. But boundaries aren\'t selfish — they\'re how you preserve your dignity and energy. You\'re allowed to have limits.' },
            { title: 'How to set them without guilt', explanation: 'You can set a boundary simply: "I\'d prefer not to" or "I need X." You don\'t have to justify or apologize. Your needs are valid.' },
            { title: 'When boundaries get tested', explanation: 'Family or caregivers might push back. That doesn\'t mean you\'re wrong. Calmly repeating the boundary is often enough. You get to decide what you will and won\'t accept.' },
          ],
          reflectionPrompt: "Where in your life do you need a boundary that doesn't exist yet?",
        },
      },
    },
  ],
};

const section4Module3: ManualModule = {
  id: 'manual-4-gps',
  title: 'GPS Navigation',
  emoji: '🧭',
  lessons: [
    {
      id: 'manual-4-3-1',
      title: 'Values as Your GPS',
      emoji: '📍',
      content: {
        teen: {
          introduction: "Goals are specific — get into this college, make the team, get through the week. Values are different. They're what matters to you deep down — connection, honesty, creativity, courage. When you're lost or stressed, checking your values is like checking a GPS. They don't tell you exactly which road to take, but they point you toward the direction that fits who you want to be.",
          keyConcepts: [
            { title: 'Values vs goals', explanation: 'Goals are finish lines — you achieve them and they\'re done. Values are ongoing directions — you never "arrive" at kindness or courage; you keep moving toward them. Values guide; goals are stops along the way.' },
            { title: 'Identifying core values', explanation: 'What matters to you? Family, friendship, honesty, creativity, fairness, growth? There\'s no right list. Your values are yours. Naming them helps you make choices that align.' },
            { title: 'Living in alignment', explanation: 'When your choices match your values, you feel more purpose and less drift. When you betray your values — doing something that goes against what you care about — you feel it. Alignment is the guide.' },
            { title: 'When you feel lost — check your GPS', explanation: 'Feeling lost or stuck often means you\'ve lost touch with what matters. Reconnecting with your values — "What do I care about? What would I do if I were living that?" — can point the way.' },
          ],
          reflectionPrompt: "What are 3 things that matter most to you? Are you living in alignment with them? What's one small step toward one of them?",
        },
        adult: {
          introduction: "Values are what you care about at the core — not what you think you should care about, but what actually matters to you. They're like a GPS: they don't give you a single route, but they point you in a direction. When life feels meaningless or you're making choices that leave you empty, reconnecting with your values can restore a sense of direction. Goals are what you achieve; values are how you want to live.",
          keyConcepts: [
            { title: 'Values vs goals', explanation: 'Goals are achievable and completable. Values are ongoing directions — integrity, connection, growth, care. You never "finish" living your values; you keep orienting toward them.' },
            { title: 'Identifying core values', explanation: 'What would you want said about you at the end of your life? What makes you feel most alive? Those questions point to values. Common ones: family, honesty, creativity, service, freedom, growth.' },
            { title: 'Living in alignment', explanation: 'Alignment means your actions match your values. Misalignment — doing things that contradict what you care about — creates unease and meaninglessness. Checking in with values helps you course-correct.' },
            { title: 'When you feel lost — check your GPS', explanation: 'When you\'re stuck or drifting, asking "What do I value? What would I do if I were living that?" often reveals the next step. Values don\'t fix everything, but they point the way.' },
          ],
          reflectionPrompt: "What are 3 things that matter most to you? Are you living in alignment with them?",
        },
        senior: {
          introduction: "After decades of life, you've had time to see what really matters — and what was just noise. Values are that inner compass: connection, family, honesty, legacy, peace, growth. When you feel lost in transition or loss, reconnecting with your values can remind you who you are and what you're still living for. Values don't require achievement; they require attention.",
          keyConcepts: [
            { title: 'Values vs goals', explanation: 'Goals can be completed; values are ongoing. You don\'t "achieve" love or integrity — you live in their direction. In later life, values often become clearer than ever.' },
            { title: 'Identifying core values', explanation: 'What has mattered most across your life? What do you want to pass on? What makes you feel at peace? Those questions reveal values. They\'re your GPS.' },
            { title: 'Living in alignment', explanation: 'Even when options feel limited, you can still choose in line with your values — kindness in a conversation, honesty with family, presence with someone you love. Alignment is possible at any stage.' },
            { title: 'When you feel lost — check your GPS', explanation: 'Loss and transition can make the world feel meaningless. Reconnecting with what you value — and taking one small action in that direction — can restore a sense of purpose.' },
          ],
          reflectionPrompt: "What are 3 things that matter most to you? Are you living in alignment with them? What would that look like today?",
        },
      },
    },
  ],
};

const section4Module4: ManualModule = {
  id: 'manual-4-attachment',
  title: 'Passenger Safety',
  emoji: '🛡️',
  lessons: [
    {
      id: 'manual-4-4-1',
      title: 'Attachment Styles: Why You Love the Way You Love',
      emoji: '❤️',
      content: {
        teen: {
          introduction: "How you act in close relationships — whether you cling, pull away, or feel pretty steady — has a lot to do with attachment. Attachment styles form early, but they're not permanent. Knowing your style (and your friend's or crush's) can help you understand why you react the way you do when things get intense. And you can earn a more secure way of loving over time.",
          keyConcepts: [
            { title: 'Secure, anxious, avoidant (in plain language)', explanation: 'Secure: you\'re comfortable with closeness and space. Anxious: you want a lot of reassurance and fear being abandoned. Avoidant: you value independence and can feel smothered. Most people are a mix.' },
            { title: 'How childhood shapes adult relationships', explanation: 'How your caregivers responded to you as a kid wired your brain to expect certain things in relationships — safety, unpredictability, or distance. It\'s not your fault; it\'s your history.' },
            { title: 'You can earn secure attachment', explanation: 'Attachment styles can change. Safe relationships — with friends, family, or a therapist — can help you develop a more secure way of connecting. It takes time, but it\'s possible.' },
            { title: 'Understanding your partner\'s (or friend\'s) style', explanation: 'When you know that someone pulls away when they\'re stressed, or needs more reassurance, you can stop taking it personally and respond in ways that help you both.' },
          ],
          reflectionPrompt: "Do you tend to cling closer or pull away when things get hard in relationships? What would it be like to name that pattern without judging it?",
        },
        adult: {
          introduction: "Attachment theory explains why we love the way we do — why some people need constant closeness and others need space, why we react to conflict in predictable ways. Your attachment style was shaped early but isn't fixed. Understanding it (and your partner's) can reduce blame and increase compassion. And secure attachment can be earned through safe, consistent relationships — including therapy.",
          keyConcepts: [
            { title: 'Secure, anxious, avoidant, disorganized (in plain language)', explanation: 'Secure: comfort with intimacy and autonomy. Anxious: fear of abandonment, need for reassurance. Avoidant: discomfort with closeness, emphasis on independence. Disorganized: mix of approach and avoidance, often from trauma. Most people have a primary style with elements of others.' },
            { title: 'How childhood shapes adult relationships', explanation: 'Early caregiving teaches the brain what to expect from others — safety, inconsistency, or danger. Those expectations show up in adult relationships as patterns of closeness and distance.' },
            { title: 'You can earn secure attachment', explanation: 'Through reparative relationships — a secure partner, therapy, or consistent safe connection — the brain can develop more security. It\'s not instant, but it\'s well-documented.' },
            { title: 'Understanding your partner\'s style', explanation: 'When you see your partner\'s behavior through the lens of attachment — "they pull away when stressed" or "they need reassurance" — it reduces blame and opens space for collaboration.' },
          ],
          reflectionPrompt: "Do you tend to cling closer or pull away when things get hard in relationships?",
        },
        senior: {
          introduction: "You've loved and been loved in many ways over a lifetime. Attachment styles — how we seek or avoid closeness — were shaped early but show up in every relationship: with partners, children, and friends. Understanding your style (and the styles of those you love) can bring clarity to old patterns. And it's never too late to develop more security through safe, honest connection.",
          keyConcepts: [
            { title: 'Secure, anxious, avoidant (in plain language)', explanation: 'Secure: comfortable with both closeness and space. Anxious: need for reassurance, fear of loss. Avoidant: comfort with distance, discomfort with too much need. You may see these in yourself and in your adult children or partner.' },
            { title: 'How childhood shapes adult relationships', explanation: 'Early relationships with caregivers set templates for what we expect from others. Those templates don\'t have to dictate the rest of life — but they often explain why we react the way we do.' },
            { title: 'You can earn secure attachment', explanation: 'Safe, consistent relationships at any age can support more security. That might be with a spouse, a friend, a therapist, or a support group. The brain remains capable of change.' },
            { title: 'Understanding your partner\'s (or family\'s) style', explanation: 'When adult children seem distant or a spouse seems clingy, attachment can explain it. Understanding doesn\'t fix everything — but it can reduce hurt and increase patience.' },
          ],
          reflectionPrompt: "Do you tend to cling closer or pull away when things get hard in relationships? What have you learned about that over your life?",
        },
      },
    },
  ],
};

const section4Module5: ManualModule = {
  id: 'manual-4-resilience',
  title: 'The Long Road',
  emoji: '🛤️',
  lessons: [
    {
      id: 'manual-4-5-1',
      title: 'Post-Traumatic Growth',
      emoji: '🌱',
      content: {
        teen: {
          introduction: "Going through something really hard doesn't only break people. It can also change them in ways that make them stronger, more grateful, or more clear about what matters. That's not the same as saying the trauma was good — it wasn't. But growth can come from the other side of pain. You're not only what happened to you. You're also what you did with it.",
          keyConcepts: [
            { title: 'Not everyone who suffers is broken', explanation: 'Trauma can cause real damage — and it can also be a catalyst for growth. Both can be true. Surviving something hard doesn\'t mean you\'re fine; it can also mean you\'ve developed strengths you didn\'t have before.' },
            { title: 'PTG is real and common', explanation: 'Post-traumatic growth is a real phenomenon: people report stronger relationships, new possibilities, personal strength, appreciation for life, and spiritual or existential change after trauma. It\'s not universal, but it\'s common.' },
            { title: 'New appreciation, new possibilities', explanation: 'After loss or crisis, many people notice they don\'t take small things for granted anymore, or they see new paths they wouldn\'t have considered. The lens shifts.' },
            { title: 'Meaning-making', explanation: 'Finding meaning in suffering doesn\'t justify the suffering. It can, however, help you carry it. "That was awful, and I learned X" or "I grew in Y way" can coexist with "I wish it never happened."' },
          ],
          reflectionPrompt: "What's one hard thing you've been through that made you stronger — even if you would never choose to go through it again?",
        },
        adult: {
          introduction: "Post-traumatic growth (PTG) is the phenomenon of positive change that can follow trauma — not because the trauma was good, but because the struggle to survive and make meaning of it can reshape people. New appreciation for life, stronger relationships, new possibilities, personal strength, and spiritual or existential shift are commonly reported. PTG doesn't erase the trauma or the pain. It names that growth can exist alongside them.",
          keyConcepts: [
            { title: 'Not everyone who suffers is broken', explanation: 'Trauma can cause lasting harm — and many people also report growth in its aftermath. The two aren\'t mutually exclusive. Acknowledging growth doesn\'t minimize the cost.' },
            { title: 'PTG is real and common', explanation: 'Research on PTG shows that a significant proportion of people who experience trauma later report positive changes in relationships, sense of possibility, personal strength, appreciation, and meaning. It\'s not guaranteed, but it\'s well-documented.' },
            { title: 'New appreciation, new possibilities, personal strength', explanation: 'People often report valuing life more, seeing new paths, and feeling stronger after surviving. These aren\'t silver linings that justify the trauma; they\'re real outcomes that can coexist with ongoing pain.' },
            { title: 'Meaning-making', explanation: 'Finding meaning in what happened — "I learned X," "I became Y," "I now prioritize Z" — doesn\'t make the trauma okay. It can, however, help integrate the experience and reduce the sense that it was purely destructive.' },
          ],
          reflectionPrompt: "What's one hard thing you've been through that made you stronger — even if you wouldn't choose to go through it again?",
        },
        senior: {
          introduction: "You've likely been through more than one kind of loss or crisis. Post-traumatic growth is the idea that people can come out of suffering not only wounded but also changed in positive ways — more appreciative, clearer about what matters, stronger in relationships, or more at peace with life's fragility. That doesn't mean the suffering was worth it. It means that you're not only what happened to you; you're also what you did with it over time.",
          keyConcepts: [
            { title: 'Not everyone who suffers is broken', explanation: 'A long life usually includes trauma and loss. Many people also report growth — resilience, wisdom, deeper relationships, or a clarified sense of meaning. Both the wound and the growth can be true.' },
            { title: 'PTG is real and common', explanation: 'Studies of older adults and trauma survivors often find reports of post-traumatic growth. It doesn\'t erase the past or the pain; it names that positive change can follow even severe hardship.' },
            { title: 'New appreciation, new possibilities, personal strength', explanation: 'You may have developed a capacity for gratitude, a willingness to try new things, or a strength you didn\'t know you had. Those are real. They don\'t cancel out what you lost.' },
            { title: 'Meaning-making', explanation: 'Making meaning of suffering — "I became who I am partly because of that" — is a way of carrying the past without being crushed by it. It\'s a form of integration, not denial.' },
          ],
          reflectionPrompt: "What's one hard thing you've been through that made you stronger — even if you wouldn't choose to go through it again?",
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
  {
    id: 'maintenance-schedule',
    title: 'Maintenance Schedule',
    subtitle: 'Keeping yourself running',
    emoji: '🔩',
    color: '#FFB74D',
    modules: [
      section2Module1,
      section2Module2,
      section2Module3,
      section2Module4,
      section2Module5,
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    subtitle: "When something's wrong",
    emoji: '🔍',
    color: '#EF5350',
    modules: [
      section3Module1,
      section3Module2,
      section3Module3,
      section3Module4,
      section3Module5,
    ],
  },
  {
    id: 'upgrades',
    title: 'Upgrades',
    subtitle: 'Growing and evolving',
    emoji: '⬆️',
    color: '#66BB6A',
    modules: [
      section4Module1,
      section4Module2,
      section4Module3,
      section4Module4,
      section4Module5,
    ],
  },
  // NEW: External Life Domains (completing PHOSM)
  MANUAL_SECTION_5,  // School
  MANUAL_SECTION_6,  // Work
  MANUAL_SECTION_7,  // Family & Relationships
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
