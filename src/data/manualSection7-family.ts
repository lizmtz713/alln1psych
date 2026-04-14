/**
 * Human Owner's Manual - Section 7: The Passengers (Family & Relationships)
 * 
 * THE CORE VISION: Parents understanding kids. Kids learning about themselves.
 * How relationships affect your gauges - and how your gauges affect relationships.
 * 
 * \"You are a system. But you're also part of other systems - and they affect each other.\"
 */

import type { ManualModule, ManualLesson } from "./manualContent';

// ============================================================
// MODULE 7.1: FAMILY OF ORIGIN
// Where your wiring came from
// ============================================================

const section7Module1: ManualModule = {
  id: 'manual-7-origin',
  title: 'Family of Origin',
  emoji: '🌳',
  lessons: [
    {
      id: 'manual-7-1-1',
      title: 'Where Your Wiring Came From',
      emoji: '🔌',
      deepDive: `Your family was your first classroom for emotions. Before you could talk, you were learning: Is it safe to cry? Does anger get attention or punishment? Do people comfort each other or shut down? These lessons happened before conscious memory, but they shaped your nervous system's default settings.

Attachment theory (Bowlby, Ainsworth) shows that how caregivers responded to your needs as an infant created a template for all future relationships. Secure attachment - \"I can count on people\" - comes from consistent, responsive care. Anxious attachment - \"I need to cling to keep people close\" - comes from inconsistent care. Avoidant attachment - \"I can only count on myself\" - comes from emotional unavailability or rejection.

None of this is destiny. Neuroplasticity means you can rewire. But you can't change a pattern you can't see. Understanding where your wiring came from is the first step to choosing your own settings.`,
      realWorld: [
        "A woman realizes she apologizes constantly - even when she did nothing wrong. She traces it back: in her family, conflict meant someone leaving. Apologizing was how she kept people from going. Now she can catch the pattern and ask: 'Did I actually do something wrong, or am I just afraid?'",
        "A man who "doesn't do emotions" discovers his family's unspoken rule: boys don't cry, feelings are weakness. He's not unemotional - he learned to suppress. Understanding the source helps him experiment with a different way.",
        "A teen notices she shuts down when her parents argue. Her nervous system learned early: conflict is dangerous, disappear. Recognizing this helps her understand her freeze response isn't weakness - it's a survival strategy that made sense once.\",
      ],
      diagnostics: [
        {
          symptom: \"You react to small conflicts like they're emergencies",
          checkFirst: "State gauge - is your nervous system responding to NOW or to something old?",
          possibleCauses: ["Family conflict was scary/dangerous", "You learned small = big because escalation was normal", "Your system never learned that conflict can be safe"],
          tryThis: ["Notice: 'Is this a 2/10 situation that feels like a 9/10?'", "Ground yourself in the present: 'I am safe right now'", "Ask yourself: "Whose voice is this? Mine or someone else's?""],
        },
        {
          symptom: "You can't ask for help even when you need it\",
          checkFirst: \"Connection gauge - what did asking for help mean in your family?\",
          possibleCauses: [\"Help wasn't available or came with strings\", \"Independence was praised, needing was shamed\", \"You learned to only rely on yourself\"],
          tryThis: [\"Start tiny: ask for something small from someone safe\", \"Notice the fear - then do it anyway\", \"Remind yourself: needing help is human, not weakness\"],
        },
      ],
      tryThis: \"Write down three "rules' about emotions you learned from your family. Examples: "Don't be too happy or something bad will happen." 'Anger is dangerous.' 'Sadness is attention-seeking.' Then ask: Do I still believe these? Do they serve me?",
      connectsTo: ['emotion', 'connection', 'state'],
      ageAdaptive: {
        teen: \"Your family taught you everything you know about emotions - before you even knew you were learning. How they handled anger, sadness, fear, and joy became YOUR normal. Some of what you learned helps you. Some of it you'll spend years unlearning. That's not your fault. It's just how humans work. The first step is noticing: "Oh, that's not ME - that's what I was taught.'",
        'young-adult': \"You're probably starting to notice: "Why do I do that?' or 'Why does that trigger me so hard?" Often the answer is in your family. Not to blame them - but to understand. You absorbed their patterns before you could choose. Now you can choose. The patterns that served a 6-year-old might not serve a 22-year-old. You get to decide what to keep.\",
        adult: \"As an adult, you might suddenly see your parents in your own reactions - and it's not always comfortable. You swore you'd never say that thing, and then you said it. Understanding family patterns isn't about blame. It's about awareness. You can love your parents AND recognize what they got wrong. Both things can be true.\",
        midlife: \"At this stage, you might be reckoning with your parents" limitations in a new way - especially if they're aging or gone. You might also see how their patterns showed up in your own parenting. This isn't about guilt. It's about breaking cycles where you can, and making peace where you can't.",
        'older-adult': \"Looking back, you can see the threads: what your parents passed to you, what you passed to your children, and what still runs in the family. Some of it was good. Some wasn't. Making peace with your family of origin - whatever that looks like - is part of the work of this stage. You don't have to forgive everything. But understanding can bring a certain freedom.",
      },
      content: {
        teen: {
          introduction: "Before you knew what emotions were, you were learning how to handle them - from your family. How they dealt with anger, sadness, fear, and happiness became your 'normal." That's not good or bad. It's just true. Understanding where your patterns came from helps you decide which ones to keep.",
          keyConcepts: [
            { title: 'Emotions are learned', explanation: 'You weren\'t born knowing how to handle feelings. You watched your family and absorbed their ways - for better or worse.' },
            { title: 'Attachment styles', explanation: 'How your caregivers responded to you as a baby shaped how you expect relationships to work: secure (people are reliable), anxious (I have to cling), or avoidant (I can only count on myself).' },
            { title: 'Family rules about feelings', explanation: 'Every family has unspoken rules: "We don\'t talk about that." "Big emotions are dramatic." "Be strong, don\'t cry." These rules live in you.' },
            { title: 'You can rewrite the code', explanation: 'Just because you learned something doesn\'t mean it\'s true or permanent. You can notice the pattern and choose differently." },
          ],
          reflectionPrompt: \"What did your family teach you about anger? About sadness? About asking for help? Do those lessons still serve you?\",
        },
        adult: {
          introduction: \"Your family was your first emotional classroom. The way they handled conflict, expressed love, dealt with stress - all of it became your template. Attachment theory shows that early caregiver relationships shape expectations for all future connections. Understanding your family of origin isn't about blame. It's about seeing clearly so you can choose consciously.",
          keyConcepts: [
            { title: 'Emotions are learned', explanation: 'Emotional patterns are absorbed in childhood, often before conscious memory. Your defaults were set by what you witnessed and experienced.' },
            { title: 'Attachment styles', explanation: 'Secure, anxious, avoidant, or disorganized - how caregivers responded to your needs created a template for how you expect relationships to work.' },
            { title: 'Family rules about feelings', explanation: 'Every family has implicit rules about which emotions are acceptable and how they should be expressed. These rules often operate unconsciously.' },
            { title: 'You can rewrite the code', explanation: 'Neuroplasticity means patterns can change. Awareness is the first step. You\'re not destined to repeat what you learned." },
          ],
          reflectionPrompt: \"What patterns from your family do you see in yourself? Which ones serve you? Which ones are you ready to change?\",
        },
        senior: {
          introduction: \"Looking back across a lifetime, you can trace the threads - what your parents taught you, what you passed on, what patterns persisted across generations. This isn't about blame or regret. It's about understanding. Some of what you inherited was a gift. Some was a burden you've carried long enough. Making peace with your family of origin, whatever that looks like, is part of the work of this stage.",
          keyConcepts: [
            { title: 'Emotions are learned', explanation: 'The patterns you\'ve carried for decades started somewhere. Understanding their origin can bring compassion - for yourself and for those who taught you.' },
            { title: 'Attachment styles', explanation: 'How you\'ve approached relationships your whole life often traces back to your earliest experiences. It\'s never too late to understand this.' },
            { title: 'Family rules about feelings', explanation: 'Rules you absorbed as a child may still operate today. Naming them can loosen their grip.' },
            { title: 'You can rewrite the code', explanation: 'Change is possible at any age. You might not redo the past, but you can choose how you move forward - and what you model for those watching.' },
          ],
          reflectionPrompt: "What emotional inheritance are you most grateful for? What would you like to let go of, even now?",
        },
      },
    },
    {
      id: 'manual-7-1-2',
      title: 'Intergenerational Patterns',
      emoji: '🔄",
      deepDive: `Trauma, coping styles, and communication patterns can pass through generations like a relay baton - often without anyone realizing. A grandmother who survived scarcity might pass anxiety about money to a mother who passes it to a daughter who doesn't understand why she panics about her bank account.

This isn't mystical - it's learned behavior, modeled responses, and sometimes epigenetics (the study of how trauma can affect gene expression across generations). The patterns travel through what's said, what's never said, and what's done.

The good news: awareness breaks the chain. You can be the generation that names the pattern and changes it. Not perfectly. But intentionally.`,
      realWorld: [
        "Three generations of women in a family struggle with anxiety. When the youngest finally goes to therapy, she learns: her grandmother survived a war, her mother grew up with a hypervigilant parent, and she absorbed that vigilance without knowing why. Naming it helps her say: "This fear is real, but it's not mine."",
        "A father realizes he goes silent during conflict - exactly like his father did. He always hated that silence as a kid. Now he catches himself doing it. Awareness doesn't make it easy to change, but it makes it possible.",
        "A family never talks about a suicide that happened two generations back. The silence creates a shadow no one can name. When someone finally speaks it, the whole family feels something shift.",
      ],
      tryThis: "Draw a simple family tree - grandparents, parents, you. For each person, write one word about how they handled stress or hard emotions. Look for patterns. What got passed down? What do you want to pass forward?",
      connectsTo: ['emotion', 'connection', 'alignment'],
      content: {
        teen: {
          introduction: \"Patterns travel through families - sometimes for generations. The way your grandparents dealt with stress might show up in your parents, and then in you. It's like emotional DNA. You didn't choose it, but once you see it, you can decide what to do with it.",
          keyConcepts: [
            { title: 'Patterns pass down', explanation: 'Anxiety, anger styles, avoidance, silence - these can travel through generations without anyone naming them.' },
            { title: 'Trauma echoes', explanation: 'If something hard happened to your grandparents or parents, its effects might show up in your family even if no one talks about it.' },
            { title: 'You can break the chain', explanation: 'Awareness is the first step. You can be the one who notices and chooses differently.' },
            { title: 'It\'s not about blame', explanation: 'Your parents probably inherited their patterns too. Understanding this can build compassion - even when you\'re changing the pattern." },
          ],
          reflectionPrompt: \"What pattern in your family do you NOT want to pass forward? What would you do instead?\",
        },
        adult: {
          introduction: \"Intergenerational patterns are real. Trauma, coping styles, attachment patterns, and family secrets can pass through generations - through behavior, modeling, and sometimes biology. Understanding this isn't about blaming your ancestors. It's about seeing clearly what you inherited so you can choose what to keep, what to heal, and what to stop passing down.",
          keyConcepts: [
            { title: 'Patterns pass down', explanation: 'What your grandparents experienced shaped your parents, who shaped you. Anxiety, depression, relational patterns - they travel.' },
            { title: 'Trauma echoes', explanation: 'Unprocessed trauma doesn\'t disappear. It shows up in the next generation as anxiety, hypervigilance, or patterns that don\'t quite make sense.' },
            { title: 'You can break the chain', explanation: 'Being the one who names the pattern, seeks help, and chooses differently is hard. It\'s also one of the most meaningful things you can do for future generations.' },
            { title: 'It\'s not about blame', explanation: 'Your parents did what they could with what they had. And now you can do better - not because they failed, but because you have more tools." },
          ],
          reflectionPrompt: \"What intergenerational pattern do you want to end with you? What would need to change?\",
        },
        senior: {
          introduction: \"From here, you can see multiple generations. You know what your parents carried, what you carried, and what your children might be carrying. Some patterns you broke. Some you couldn't. Some you're only seeing now. This isn't a time for regret - it's a time for honesty and, where possible, repair.\",
          keyConcepts: [
            { title: "Patterns pass down', explanation: 'You inherited patterns and passed some on. That\'s human. What matters now is what you can still do: name them, own them, release them.' },
            { title: 'Trauma echoes', explanation: 'Some of what you carried came from generations before you. And some of what your kids carry came from you. Both can be true without canceling each other out.' },
            { title: 'It\'s never too late', explanation: 'You can still name things, apologize, or simply understand. That has value even now.' },
            { title: 'Legacy is a choice', explanation: 'What you model in this stage - how you handle aging, loss, emotion - is still being watched. You\'re still shaping what gets passed down.' },
          ],
          reflectionPrompt: "What pattern are you proud of breaking? What would you name or repair if you could?",
        },
      },
    },
    {
      id: 'manual-7-1-3',
      title: 'When Family Wasn\'t Safe',
      emoji: '🩹',
      linkedActivity: 'talk', // Talk to Psych for processing
      deepDive: `Not all families are safe. Some are actively harmful - through abuse, neglect, addiction, or dysfunction. Some are subtly toxic - through criticism, control, emotional unavailability, or conditional love. And some are a painful mix: love AND harm, good moments AND bad patterns.

You can love someone and be hurt by them. Both things can be true. Recognizing harm doesn't mean you didn't also experience love. And experiencing love doesn't mean the harm didn't happen or doesn't count.

Healing from family wounds doesn't require reconciliation. Sometimes the healthiest choice is distance - temporary or permanent. You get to decide what contact serves your wellbeing. That's not selfish. That's self-preservation.

And if you didn't get what you needed as a child - consistent love, emotional attunement, safety - you can learn to give it to yourself. That's called reparenting. It's not a replacement for what was lost, but it's a way forward.`,
      realWorld: [
        \"A woman goes no-contact with her mother after years of manipulation and guilt-tripping. She feels guilty - and also free. Both feelings are valid. She doesn't owe anyone access to her life.\",
        \"A man realizes his father's 'toughening up" was actually emotional neglect. He's not betraying his father by naming it. He's finally understanding why he struggles to show vulnerability.",
        "A young adult learns to comfort themselves the way they wished their parents had. When they're scared, they say - out loud - "It's okay. You're going to be okay." It felt ridiculous at first. Now it helps.\",
      ],
      diagnostics: [
        {
          symptom: \"You feel guilty for setting boundaries with family\",
          checkFirst: \"Alignment gauge - are you violating YOUR values, or theirs?\",
          possibleCauses: [\"You were taught that your needs don't matter\", \"Family used guilt as a control mechanism\", \"Boundaries were framed as betrayal\"],
          tryThis: [\"Name the guilt without letting it decide\", \"Ask: "Would I tell a friend they should feel guilty for this?"\", \"Boundaries aren't punishment - they're protection"],
        },
        {
          symptom: "You minimize what happened ("It wasn't that bad")",
          checkFirst: "Emotion gauge - what happens when you let yourself feel it fully?",
          possibleCauses: ["Minimizing was survival", "You weren't validated, so you learned to invalidate yourself", "Acknowledging harm feels like losing the good parts too"],
          tryThis: ["Try: 'Even if others had it worse, my experience was still hard"\", \"You can hold both: love AND harm\", \"Consider talking to a therapist who can witness what happened\"],
        },
      ],
      tryThis: \"Write a letter you'll never send. Tell a family member exactly how they affected you - the good and the hard. Let it be messy. Burn it, keep it, or just let it exist. The point is saying what was never said.\",
      connectsTo: ["emotion', 'connection', 'state', 'alignment'],
      content: {
        teen: {
          introduction: "Not everyone's family is safe or healthy. Some families hurt - through abuse, neglect, addiction, constant criticism, or just not being there. If that's your family, it's not your fault. You didn't cause it and you can't fix it. And even if there were good moments, the hard parts still count.\",
          keyConcepts: [
            { title: "It\'s not your fault', explanation: 'Whatever went wrong in your family, you didn\'t cause it. Kids are never responsible for adult dysfunction.' },
            { title: 'Both things can be true', explanation: 'You can love someone and be hurt by them. You can have good memories AND bad experiences. Both count.' },
            { title: 'You get to protect yourself', explanation: 'If someone is harmful to you, you\'re allowed to create distance. That\'s not betrayal - it\'s survival.' },
            { title: 'Healing is possible', explanation: 'What you didn\'t get from family, you can learn to give yourself - and find in other relationships. It takes time, but it\'s real." },
          ],
          reflectionPrompt: \"If your family has been hard, what do you wish someone would say to you about it?\",
        },
        adult: {
          introduction: \"Family dysfunction exists on a spectrum - from subtle emotional unavailability to outright abuse. If your family wasn't safe, you've likely spent years minimizing, explaining, or simply surviving. Naming what happened isn't betrayal. It's clarity. And healing doesn't require reconciliation. You get to decide what relationship, if any, serves your wellbeing.",
          keyConcepts: [
            { title: 'Harm is real', explanation: 'What happened to you mattered. Minimizing it doesn\'t make it hurt less - it just buries the wound.' },
            { title: 'Both things can be true', explanation: 'Love and harm can coexist. You don\'t have to choose between honoring the good and naming the bad.' },
            { title: 'Boundaries are valid', explanation: 'Low contact, no contact, or structured contact - you get to choose. You don\'t owe access to people who hurt you.' },
            { title: 'Reparenting yourself', explanation: 'The care you didn\'t get, you can learn to give yourself. It\'s not the same, but it\'s something. And it helps." },
          ],
          reflectionPrompt: \"What did you need from your family that you didn't get? How might you give that to yourself now?\",
        },
        senior: {
          introduction: \"At this stage, you've had a lifetime to reckon with family wounds - some healed, some scarred over, some still tender. Maybe you've made peace. Maybe you're still working on it. Maybe some relationships needed to end. Whatever your story, it's valid. And it's never too late to name what happened, even just to yourself.",
          keyConcepts: [
            { title: 'Naming still matters', explanation: 'Even after decades, acknowledging what was hard can bring relief. You don\'t have to protect anyone from the truth anymore.' },
            { title: 'Forgiveness is optional', explanation: 'You don\'t have to forgive to heal. Some things are unforgivable. You can still find peace without absolution.' },
            { title: 'Legacy choices', explanation: 'What patterns did you break? What would you still like to name or release? These questions have value even now.' },
            { title: 'Grief is allowed', explanation: 'Grieving the family you deserved but didn\'t get is valid. It\'s not self-pity. It\'s honoring your own experience.' },
          ],
          reflectionPrompt: "What family wound are you still carrying? What would it mean to set it down - not forget it, but stop carrying its full weight?",
        },
      },
    },
  ],
};

// ============================================================
// MODULE 7.2: PARENTS AND CHILDREN
// The heart of InGauge - understanding each other
// ============================================================

const section7Module2: ManualModule = {
  id: 'manual-7-parent-child',
  title: 'Parents and Children',
  emoji: '👪',
  lessons: [
    {
      id: 'manual-7-2-1',
      title: 'The Parent-Child Gauge Connection',
      emoji: '🌡️',
      linkedActivity: 'circle',
      deepDive: `Children don't just live in the same house as their parents - they live in their parents" nervous systems. Before a child can regulate their own emotions, they borrow their caregiver's regulation. This is called co-regulation.

When a parent is calm, the child's nervous system can settle. When a parent is anxious, angry, or checked out, the child absorbs that state. Kids are emotional sponges. They don't just hear your words - they feel your energy, your tension, your fear.

This isn't about being a perfect parent. That doesn't exist. It's about awareness: YOUR gauges directly affect your child's gauges. When you take care of your own system - sleep, stress management, emotional regulation - you're not being selfish. You're creating a calmer environment for your child to borrow from.

And the reverse is true too: children's states affect parents. A dysregulated child can dysregulate a parent. It becomes a feedback loop. The goal isn't to never be triggered - it's to notice the loop and interrupt it.`,
      realWorld: [
        \"A mother notices that her toddler melts down every evening at 5pm. She tracks it: that's when HER energy tanks. Her exhaustion is showing up in her kid. She starts a 4:30 snack and 5-minute reset for herself - and the meltdowns decrease.",
        "A father realizes he's been snapping at his teenagers. He checks his own gauges: sleep-deprived, work stress through the roof. His kids aren't the problem. His system is overwhelmed and they're catching the overflow.",
        "A teen notices she gets anxious whenever her mom is stressed - even if mom says nothing. She's been co-regulating (or co-dysregulating) her whole life. Naming it helps her ask: 'Is this MY anxiety or am I absorbing hers?"\",
      ],
      diagnostics: [
        {
          symptom: \"Your child/teen is constantly dysregulated\",
          checkFirst: \"Check YOUR State gauge first. What's happening in the household nervous system?\",
          possibleCauses: [\"Child is absorbing adult stress\", \"Parent is dysregulated and child can't borrow calm", "Environment is chaotic or unpredictable"],
          tryThis: ["Regulate yourself first - even 3 breaths", "Create one pocket of predictability/calm in the day", "Notice: am I trying to fix them when I need to fix me?"],
        },
        {
          symptom: "You lose your temper with your kids more than you want",
          checkFirst: "Body gauge - are you running on empty? When did you last eat, sleep, have a break?",
          possibleCauses: ["Depleted parent = reactive parent", "Your triggers are getting activated (old wounds)", "You're absorbing their dysregulation"],
          tryThis: ["Sleep and food first - not kidding", "Name it: "I'm overwhelmed and I need a minute"", "Repair after rupture - kids learn from how you come back"],
        },
      ],
      tryThis: "For one day, track your emotional state alongside your child's. Every few hours, rate your State gauge (1-10) and observe theirs. Look for correlation. You might be more connected than you realized.",
      connectsTo: ['state', 'body', 'emotion', 'connection'],
      ageAdaptive: {
        teen: \"Here's something wild: your parents" moods literally affect your nervous system - and yours affects theirs. It's called co-regulation. When they're stressed, you feel it even if they don't say anything. When you're melting down, it activates them. You're connected systems. Understanding this doesn't make it less annoying, but it might help you make sense of the family vibe.",
        'young-adult': \"Now that you have some distance from your parents, you might notice it more clearly: their stress was YOUR stress. Their calm was your anchor. That's not enmeshment - that's how human nervous systems work. As you build your own life, you're learning to self-regulate instead of borrowing theirs. It's a transition.\",
        adult: \"Your kids are living in your nervous system. Before they can regulate themselves, they borrow your calm (or absorb your chaos). This isn't about being perfect. It's about awareness: when you take care of your own gauges, you're not being selfish - you're creating a stable system for your kids to borrow from.",
        midlife: "If you raised kids, you probably remember the exhaustion - and maybe the guilt about not being calmer. Here's what's true: you did the best you could with the nervous system you had. And you can still model regulation now. How you handle stress, aging, and emotion is still being watched. It still matters.\",
        "older-adult": \"The parent-child nervous system connection doesn't end when kids grow up. Your adult children may still be affected by your emotional state - and you by theirs. What you model now - how you handle loss, change, fear - is still part of their learning. Your calm or your chaos still ripples.\",
      },
      content: {
        teen: {
          introduction: \"Your family's emotional states are connected - like phones on the same WiFi. When your parent is stressed, you feel it. When you're upset, it affects them. That's not because anyone is doing something wrong. It's just how human nervous systems work. Understanding this can help you make sense of the family 'vibe' - and maybe even change it.",
          keyConcepts: [
            { title: 'Co-regulation is real', explanation: 'Kids literally borrow their parents\' nervous system regulation. When they\'re calm, it\'s easier to be calm. When they\'re anxious, it\'s contagious.' },
            { title: 'You absorb their state', explanation: 'Even if no one says anything, you can feel when something\'s off. That\'s not you being dramatic. That\'s your system doing its job.' },
            { title: 'Your state affects them too', explanation: 'It goes both ways. When you\'re dysregulated, your parents feel it - even if they don\'t handle it well.' },
            { title: 'The family system', explanation: 'A family isn\'t just individuals. It\'s a connected system. One person\'s gauge being off can throw everyone off." },
          ],
          reflectionPrompt: \"When someone in your family is stressed, how do you feel? When you're upset, what happens to the household?\",
        },
        adult: {
          introduction: \"Your children are living in your nervous system. Co-regulation means they can't fully regulate their own emotions yet - they borrow yours. When you're calm, they have something stable to anchor to. When you're dysregulated, they absorb that chaos. This isn't about being perfect. It's about understanding: your gauges affect their gauges.",
          keyConcepts: [
            { title: 'Co-regulation is biological', explanation: 'Children\'s brains are wired to sync with caregivers. Your calm = their anchor. Your stress = their stress.' },
            { title: 'Your state comes first', explanation: 'You can\'t regulate a child if you\'re dysregulated. Taking care of your own system isn\'t selfish - it\'s necessary.' },
            { title: 'Behavior is communication', explanation: 'When kids act out, they\'re often showing you their internal state. Look at the behavior as data, not defiance.' },
            { title: 'The feedback loop', explanation: 'Child dysregulated → parent triggered → child more dysregulated. Someone has to break the loop. It usually has to be you." },
          ],
          reflectionPrompt: \"When your child is struggling, what happens to YOUR nervous system? How might your state be affecting theirs?\",
        },
        senior: {
          introduction: \"The parent-child connection doesn't end when children are grown. Your adult children may still respond to your emotional state - and you to theirs. How you handle this stage of life - aging, loss, change - is still being absorbed by the people who love you. Your calm still matters. Your emotional honesty still models something.\",
          keyConcepts: [
            { title: "The connection persists', explanation: 'Adult children still respond to their parents\' emotional states. You\'re still part of each other\'s systems.' },
            { title: 'What you model now matters', explanation: 'How you handle aging, fear, grief - your children are watching. You\'re still teaching.' },
            { title: 'Interdependence, not dependence', explanation: 'Healthy family systems in later life involve mutual support - not one-way caretaking.' },
            { title: 'Repair is still possible', explanation: 'If past patterns were harmful, repair can still happen. It\'s not too late to model something different.' },
          ],
          reflectionPrompt: "How does your emotional state still affect your adult children? How does theirs affect you?",
        },
      },
    },
    {
      id: 'manual-7-2-2',
      title: 'When Kids Can\'t or Won\'t Talk',
      emoji: '🤐',
      linkedActivity: 'circle',
      deepDive: `Here's a truth most parents struggle with: teenagers are developmentally supposed to pull away. It's not rejection - it's individuation. They're building an identity separate from you, and that requires some distance.

Add to that: many kids - especially teens - lack the vocabulary for what they're feeling. Or they have the words but not the trust that they'll be heard without judgment, fixing, or freaking out. Or they're ashamed. Or they don't fully know what's wrong yet.

\"How was school?\" will almost never unlock this. It's too broad, too routine, too easy to deflect with \"fine.\"

But here's what DOES work:
- Specific questions: "What was the hardest part of today?" "What drained you?"
- Observation over interrogation: "You seem off. I'm here if you want to talk. No pressure."
- Listening without fixing: When they DO talk, resist the urge to solve. Just witness.
- Parallel presence: Sometimes kids talk more while doing something else - driving, cooking, walking.

And this is where InGauge's Circle comes in: when words fail, gauges can speak. A kid who won't say \"I'm struggling" might check in with low State and Emotion gauges. A parent who watches those numbers can understand without forcing a conversation. It's connection without interrogation.`,
      realWorld: [
        "A dad stops asking 'How was school?' and starts asking 'What drained you today?' The first week, his son says 'I dunno." By week three, he's actually answering.\",
        \"A mom notices her daughter's Circle check-in: Body low, State low, Connection low. She doesn't interrogate. She just says, "I see you're having a hard day. I'm here.' Her daughter cries - and finally talks.",
        "A teen who 'never tells his parents anything" actually wants to. But every time he tries, they freak out or lecture. He stops trying. When they finally just listen - without fixing - he opens up.\",
      ],
      diagnostics: [
        {
          symptom: \"Your teen tells you nothing\",
          checkFirst: \"Connection gauge (yours) - have you created safety for honesty?\",
          possibleCauses: [\"They fear your reaction (judgment, panic, lecture)\", \"Developmentally normal pulling away\", \"They don't have words for it yet\", \"Past attempts went badly\"],
          tryThis: [\"Stop asking generic questions\", \"Try: "You don't have to talk. I'm just here."", "Listen without fixing when they DO talk", "Use Circle to see their gauges without words"],
        },
        {
          symptom: "Your child used to talk to you and stopped",
          checkFirst: "What changed? Age? An event? Your response to something?",
          possibleCauses: ["They hit adolescence (normal)", "Something happened they're ashamed of\", \"A conversation went badly and they shut down\", \"They're protecting you from worry\"],
          tryThis: [\"Don't force it", "Name it: "I notice you don't talk to me like you used to. That's okay. I miss it, but I'm here when you're ready."", "Create low-pressure connection time (driving, walks)", "Check their Circle gauge instead of asking"],
        },
      ],
      tryThis: "For one week, replace 'How was your day?' with one specific question each day: 'What made you laugh today?' 'What was annoying?' 'Rate your day 1-10.' Notice what opens up.",
      connectsTo: ['connection', 'emotion', 'state'],
      ageAdaptive: {
        teen: \"You might not want to talk to your parents about what's going on. That's normal. But here's the thing: they probably want to understand you even if they're bad at asking. If talking feels like too much, try showing them your gauges through Circle. Let the numbers say what you can't. Sometimes being seen without explaining is enough.",
        'young-adult': \"Looking back, you might understand more about why talking to parents was hard. And now, as you build your own life, communication might be shifting. Some things are easier to say now. Some are still hard. That's okay. The relationship can evolve.\",
        adult: \"When your kid won't talk to you, it's easy to take it personally. But often it's not about you - it's about development, shame, or not having the words. Your job isn't to pry. It's to stay safe, stay present, and let them know you're there. Circle lets you see what they can't say.\",
        midlife: \"If your kids are grown, you might remember the silent years - and maybe understand them differently now. Or maybe you're still navigating communication gaps. The principles are the same: safety, presence, not forcing. And now you might be on the receiving end, with aging parents who won't talk about their struggles.",
        'older-adult': \"Communication gaps can run both directions. Maybe your adult children don't tell you things - to protect you, or because they're busy, or because old patterns persist. And maybe there are things you don't tell them. What would it look like to gently open a door, without forcing anyone through it?\",
      },
      content: {
        teen: {
          introduction: \"If you don't talk to your parents about what's really going on, you're not alone. Most teens don't. Sometimes you don't have words. Sometimes you're afraid of their reaction. Sometimes you just don't want to. All of that is valid. But being understood still matters - even if you can't explain it out loud.",
          keyConcepts: [
            { title: 'Silence is normal', explanation: 'Pulling away from parents in your teens is developmentally normal. It doesn\'t mean something\'s wrong with you or the relationship.' },
            { title: 'Words aren\'t the only way', explanation: 'If talking feels like too much, there are other ways to show how you\'re doing. Your gauges, your energy, your presence.' },
            { title: 'Circle lets you be seen without explaining', explanation: 'When words fail, your gauge check-ins can show what\'s happening. Your parent sees you\'re struggling without you having to spell it out.' },
            { title: 'What helps when you DO want to talk', explanation: 'Parents who listen without freaking out, fixing, or lecturing. If yours don\'t do that yet, you can tell them what you need: "I just need you to listen."" },
          ],
          reflectionPrompt: \"What would make it easier to let your parents understand how you're really doing?\",
        },
        adult: {
          introduction: \"When your child won't talk to you, it's painful. You remember when they told you everything. Now it's "fine" and silence. Here's what's true: this is often normal, and forcing it backfires. Your job is to stay safe, stay present, and create the conditions where they might choose to open up - now or later.",
          keyConcepts: [
            { title: 'Pulling away is developmental', explanation: 'Teens individuating from parents is supposed to happen. It\'s not rejection - it\'s growth. And it\'s not permanent.' },
            { title: 'They might lack words', explanation: 'Sometimes kids don\'t talk because they don\'t know what\'s wrong yet. Or they\'re ashamed. Or they\'ve learned that talking leads to lectures.' },
            { title: 'Change the questions', explanation: ''How was school?" won\'t work. Try: "What drained you today?" or "Rate your day 1-10." Specific invites specific.' },
            { title: 'Circle is a bridge', explanation: 'When they won\'t say "I\'m struggling," their gauges can show it. You see their temperature without forcing a conversation. That\'s connection without interrogation." },
          ],
          reflectionPrompt: \"When your child doesn't talk to you, what's your reaction? Does that reaction make it more or less likely they'll open up next time?\",
        },
        senior: {
          introduction: \"Communication gaps aren't just a parent-teen problem. They can persist - or emerge - with adult children, or with your own aging parents. The principles are the same: create safety, don't force, and find ways to connect that don't require everything to be said out loud.",
          keyConcepts: [
            { title: 'Gaps can go both directions', explanation: 'Maybe your adult kids don\'t tell you things. Maybe you don\'t tell them. Both are common.' },
            { title: 'Protection vs. connection', explanation: 'Often silence is about protection - they don\'t want to worry you, or you don\'t want to burden them. But protection can become distance.' },
            { title: 'Opening a door', explanation: 'You can invite without forcing: "I\'d love to know how you\'re really doing, when you\'re ready to share."' },
            { title: 'What you model', explanation: 'If you want your kids to be honest about their struggles, modeling honesty about yours - at an appropriate level - can open the door." },
          ],
          reflectionPrompt: \"What aren't you and your adult children talking about? What would it take to gently open that conversation?\",
        },
      },
    },
    {
      id: "manual-7-2-3',
      title: 'Understanding Your Teen (For Parents)',
      emoji: '🧩",
      deepDive: `The teenage brain is literally under construction. The prefrontal cortex - responsible for judgment, impulse control, and long-term thinking - isn't fully developed until the mid-20s. Meanwhile, the emotional brain and reward-seeking systems are running hot.

This creates exactly what you see: emotional intensity, risk-taking, seeming inability to think ahead, and prioritizing friends over family. This isn't defiance or disrespect. It's neurobiology.

Add to that: teens" circadian rhythms shift. They're biologically inclined to stay up later and sleep later. When they can't get up for school, it's not laziness - it's their brain chemistry working against an early schedule.

None of this excuses bad behavior. But it explains it. And understanding the WHY makes it easier to respond with firmness AND compassion instead of just frustration.

Pick your battles. Safety is non-negotiable. Respect is important. But the messy room? Maybe let it go. Save your authority for what matters.`,
      realWorld: [
        \"A mother learns that teen sleep cycles shift biologically. She stops screaming at her son to wake up and starts with an earlier bedtime and more patience. His mornings improve.\",
        \"A father realizes that his daughter's 'attitude' spikes every time she's hungry and tired. He starts recognizing the signs and calling a time-out instead of escalating.\",
        \"Parents stop fighting about screen time when they realize it's a symptom, not the cause. The real issue is their teen's loneliness and anxiety. Addressing that changes everything.",
      ],
      tryThis: "The next time your teen does something frustrating, pause before reacting and ask: 'Is this a brain development thing, a fatigue thing, or a values thing?' Only the third requires a big response.",
      connectsTo: ['body', 'state', 'emotion', 'connection'],
      content: {
        teen: {
          introduction: \"You're not the audience for this lesson - it's written for parents. But you might want to read it anyway. Sometimes understanding how YOUR brain works helps you understand why adults react the way they do. And maybe you can show this to your parents when they're being impossible.",
          keyConcepts: [
            { title: 'Your brain is under construction', explanation: 'The part of your brain that handles judgment and impulse control isn\'t done until your mid-20s. That\'s not an excuse - but it IS an explanation.' },
            { title: 'Your emotions are dialed up', explanation: 'Teen brains process emotion more intensely. What feels like overreacting to adults feels completely appropriate to you. You\'re not dramatic - you\'re wired hot right now.' },
            { title: 'Sleep shifts are real', explanation: 'Your body wants to stay up late and sleep in. That\'s biology, not laziness.' },
            { title: 'Friends feel more important than family', explanation: 'That\'s also developmental. It doesn\'t mean you don\'t love your family. It means your brain is doing its job of building a life outside them." },
          ],
          reflectionPrompt: \"What do you wish your parents understood about what it's like to be you right now?\",
        },
        adult: {
          introduction: \"Parenting a teen can feel like living with a stranger who used to be your child. Their brain is under construction - literally. Understanding the neuroscience doesn't excuse bad behavior, but it explains it. And explanation makes room for compassion alongside firmness.",
          keyConcepts: [
            { title: 'The prefrontal cortex isn\'t done', explanation: 'The judgment and impulse-control center of the brain isn\'t fully developed until the mid-20s. They\'re not defiant - they\'re under construction.' },
            { title: 'Emotional intensity is biological', explanation: 'Teen brains process emotion more intensely. What looks like overreaction is often genuine feeling at a higher volume.' },
            { title: 'Sleep is shifted', explanation: 'Circadian rhythms shift in adolescence. They\'re biologically inclined to stay up late and sleep in. Early mornings are genuinely hard.' },
            { title: 'Peers > parents (for now)', explanation: 'Prioritizing friends is developmental. They\'re building identity outside the family. It\'s not rejection - it\'s growth." },
          ],
          reflectionPrompt: \"What's one thing about your teen's behavior that might make more sense as brain development rather than defiance?",
        },
        senior: {
          introduction: "If you have grandchildren in their teens, or if you're reflecting on your own parenting, this still applies. Teen brains are under construction - the same as they were when you were parenting. The science is just clearer now. Understanding this can help with compassion, whether you're involved day-to-day or watching from a distance.\",
          keyConcepts: [
            { title: "Same brains, different era', explanation: 'Teen brains work the same as they did a generation ago. The pressures are different (social media, etc.), but the neuroscience is the same.' },
            { title: 'Patience is a gift', explanation: 'If you have grandchildren, your calm, patient presence can be an anchor when their parents are overwhelmed.' },
            { title: 'Perspective matters', explanation: 'You\'ve seen teens grow up before. You know this stage passes. That perspective is valuable - share it gently.' },
            { title: 'Support the parents too', explanation: 'Parenting teens is exhausting. Supporting your adult children while they parent is part of the intergenerational system.' },
          ],
          reflectionPrompt: "What do you understand now about teenagers that you wish you'd known when you were parenting?",
        },
      },
    },
    {
      id: 'manual-7-2-4',
      title: 'Understanding Your Parents (For Teens)',
      emoji: '🔍",
      deepDive: `Here's something that might feel weird: your parents are just people. They have their own anxieties, their own wounds from THEIR families, their own bad days. They're not perfect systems. They're humans running their own gauges - and sometimes running on empty.

This doesn't excuse bad behavior or harm. If your parents are abusive or neglectful, that's not okay. But for most parents who are just imperfect, frustrating, and sometimes clueless - understanding their perspective can shift something.

When they ask too many questions, it's often anxiety, not interrogation. When they're strict, it's often fear - they remember their own teenage mistakes or they've seen things go wrong. When they don't get it, sometimes it's because the world has changed since they were your age.

You don't have to like everything they do. But seeing them as people - with their own gauges, their own history, their own stress - can make living with them a little more bearable. And sometimes, asking them about their own teen years opens a door.`,
      realWorld: [
        \"A teen realizes her mom asks a million questions because her mom has anxiety - not because she doesn't trust her daughter. Understanding this makes the questions less annoying (and the mom works on asking fewer).\",
        \"A guy asks his dad what he was like at 16. His dad tells stories that surprise him - including some bad decisions. It doesn't solve everything, but it makes his dad seem more human.",
        "A teen notices that her parents fight more when work is stressful. Their mood isn't about her. Their gauges are affected by things she can't see.\",
      ],
      tryThis: \"Ask one of your parents: "What were you most worried about when you were my age?' or "What's one thing you did at my age that you never told your parents?" See if it shifts anything.",
      connectsTo: ['connection', 'emotion', 'state'],
      content: {
        teen: {
          introduction: \"Your parents are annoying. That's probably true. But here's something else that's true: they're just people. They have their own stress, their own fears, their own wounds from their own families. They're running their own gauges - and sometimes running on empty. Understanding this doesn't make them less annoying. But it might help you make sense of them.",
          keyConcepts: [
            { title: 'They have gauges too', explanation: 'Your parents aren\'t machines. They have Body, State, Emotion, Connection, Direction, and Alignment gauges just like you. When they snap at you, sometimes their gauges are low.' },
            { title: 'Fear looks like control', explanation: 'When they\'re overprotective or strict, they\'re often scared. They remember their own mistakes. They\'ve seen things go wrong. Fear is driving the wheel.' },
            { title: 'They don\'t know everything', explanation: 'They\'re figuring it out as they go. No one gave them a manual for how to parent YOU specifically. They\'re doing their best with what they know.' },
            { title: 'Their family shaped them too', explanation: 'Whatever patterns you don\'t like in them - they probably learned from THEIR parents. They\'re products of their own families, just like you." },
          ],
          reflectionPrompt: \"What do you think your parents worry about? Have you ever asked them?\",
        },
        adult: {
          introduction: \"This lesson is for teens, but adults might want to read it too - especially if you're reflecting on your relationship with your own parents. The perspective works in both directions: understanding that parents are people, with their own histories and limitations, can shift something at any age.\",
          keyConcepts: [
            { title: "Parents are people', explanation: 'The person who raised you has their own story, their own wounds, their own limitations. Seeing them as a person - not just as Parent - can change how you relate.' },
            { title: 'Their choices had context', explanation: 'Decisions that frustrate you often made sense given their fears, their history, their resources at the time. Context isn\'t excuse - but it\'s understanding.' },
            { title: 'Compassion and boundaries can coexist', explanation: 'You can understand why they did what they did AND still set boundaries about how you\'ll relate now. Both are valid.' },
            { title: 'It\'s okay to outgrow patterns', explanation: 'You don\'t have to repeat what they did. Understanding them can actually free you to choose differently." },
          ],
          reflectionPrompt: \"How has your understanding of your parents changed over time? What do you see now that you couldn't see then?\",
        },
        senior: {
          introduction: \"This lesson is written for teens about understanding their parents. But at this stage, you might be reflecting on how your own children understand - or misunderstand - you. And you might still be working out your understanding of your own parents, living or gone.\",
          keyConcepts: [
            { title: "Being understood matters', explanation: 'Most people want to be seen as more than their mistakes or their role. You might still want your children to understand who you really are.' },
            { title: 'Understanding your own parents', explanation: 'Even now, you might be making sense of your parents in new ways. Death doesn\'t end the relationship - the understanding continues.' },
            { title: 'What you want your children to know', explanation: 'Is there something you wish they understood about your choices, your life, your love? It might be worth saying.' },
            { title: 'Compassion cycles', explanation: 'When your children understand you, they might relate differently. When you understood your parents, something shifted. Compassion can flow in all directions.' },
          ],
          reflectionPrompt: "What do you wish your children understood about you that they might not?",
        },
      },
    },
  ],
};

// ============================================================
// MODULE 7.3: OTHER KEY RELATIONSHIPS
// Beyond parent-child: siblings, partners, friends
// ============================================================

const section7Module3: ManualModule = {
  id: 'manual-7-relationships',
  title: 'Other Key Relationships',
  emoji: '💫',
  lessons: [
    {
      id: 'manual-7-3-1',
      title: 'How Relationships Affect Your Gauges',
      emoji: '📊',
      linkedActivity: 'relate',
      deepDive: `Every relationship is a nervous system interaction. Some people calm your system down - you feel regulated, safe, yourself around them. Some people activate your system - you feel on edge, drained, not quite yourself.

This isn't about good people vs. bad people. It's about fit, patterns, and history. Someone might be a wonderful person and still be activating for YOU because of your particular history.

Pay attention to how you feel after spending time with someone:
- Energized and calm? Safe person, co-regulation happening.
- Drained and anxious? Possible mismatch or boundary needed.
- Walking on eggshells? This relationship may not be safe.
- Like yourself? These are your people.

Your Connection gauge isn't just \"am I around people?\" It's \"am I around the RIGHT people?\"

Boundaries aren't mean. They're how you protect your system from relationships that consistently cost more than they give.`,
      realWorld: [
        "A woman realizes she feels exhausted after every visit with a certain friend. She thought she was being a bad friend. Actually, the friendship is one-sided - she gives, her friend takes. She starts limiting contact.",
        "A man notices he feels more anxious after every call with his sister. He traces it back: she criticizes him subtly every time. Naming the pattern helps him decide what to do about it.",
        "A teen tracks her energy around different friend groups. One group leaves her feeling alive. The other leaves her feeling drained and fake. She starts choosing more intentionally.",
      ],
      tryThis: "For one week, notice how you feel AFTER spending time with different people. Rate your energy and mood 30 minutes after each interaction. Look for patterns.",
      connectsTo: ['connection', 'state', 'emotion', 'body'],
      content: {
        teen: {
          introduction: \"Not all relationships are good for you - even if the person isn't "bad.' Some people make you feel energized, calm, and like yourself. Some people make you feel drained, anxious, or fake. Paying attention to how you feel AFTER spending time with someone tells you a lot about whether that relationship is working.",
          keyConcepts: [
            { title: 'Relationships affect your nervous system', explanation: 'You literally feel different around different people. Some calm you down. Some rev you up. That\'s real, not imaginary.' },
            { title: 'The post-interaction check', explanation: 'How do you feel 30 minutes after hanging out? Energized? Drained? Like yourself? That data matters.' },
            { title: 'Your people vs. obligation people', explanation: 'Some relationships are chosen, some are assigned (family, classmates). You can\'t always choose - but you can adjust how much access you give.' },
            { title: 'Boundaries protect your gauges', explanation: 'Setting limits on draining relationships isn\'t mean. It\'s maintenance." },
          ],
          reflectionPrompt: \"Who in your life leaves you feeling energized? Who leaves you drained? What might that mean?\",
        },
        adult: {
          introduction: \"Relationships are nervous system exchanges. Some people regulate you - you feel calm, safe, and present. Some dysregulate you - you leave feeling anxious, depleted, or not yourself. This isn't judgment about whether someone is "good" - it's about fit, patterns, and protecting your system.\",
          keyConcepts: [
            { title: "Co-regulation vs. co-dysregulation', explanation: 'Healthy relationships involve mutual regulation - you help each other feel okay. Draining relationships often involve one person absorbing the other\'s chaos.' },
            { title: 'Energy accounting', explanation: 'Track how you feel after interactions. Some relationships cost more than they give. That\'s data.' },
            { title: 'Fit matters', explanation: 'Someone can be a good person and still not be good FOR you. Your history, needs, and patterns interact with theirs.' },
            { title: 'Boundaries as self-care', explanation: 'Limiting contact with draining people isn\'t selfish. It\'s protecting your capacity to show up for the relationships that nourish you." },
          ],
          reflectionPrompt: \"Who in your life consistently leaves you feeling better? Who consistently leaves you depleted? What would it mean to honor that information?\",
        },
        senior: {
          introduction: \"At this stage, you've had decades of relationships - some nourishing, some draining, some both. The patterns are probably clear by now. The question isn't just who affects you how, but: what do you want to do about it? How do you want to spend your remaining relational energy?",
          keyConcepts: [
            { title: 'Selective investment', explanation: 'You don\'t have unlimited time or energy. Choosing who gets your presence is a valid and important decision.' },
            { title: 'Old patterns, new choices', explanation: 'Some relationships have been draining for decades. It\'s okay to finally set a limit, even this late.' },
            { title: 'Quality over quantity', explanation: 'Research shows older adults often prioritize fewer, deeper relationships. This is wisdom, not limitation.' },
            { title: 'Protecting peace', explanation: 'You\'ve earned the right to protect your peace. That\'s not selfishness - it\'s stewardship of your remaining energy.' },
          ],
          reflectionPrompt: "Who do you most want to spend your energy on at this stage? Who might you need to release?",
        },
      },
    },
    {
      id: 'manual-7-3-2',
      title: 'Betrayal and Affairs',
      emoji: '💔',
      linkedActivity: 'talk',
      deepDive: `Betrayal is one of the deepest wounds a relationship can inflict. Whether it's a physical affair, an emotional affair, or another form of broken trust, the impact on your gauges is profound and lasting.

**What is an emotional affair?**
An emotional affair is when someone develops deep emotional intimacy with someone outside their primary relationship - sharing things they don't share with their partner, seeking emotional support elsewhere, creating secrecy. There may be no physical contact, but the betrayal of emotional exclusivity is real. Many people find emotional affairs more devastating than physical ones because of what it says about the connection.

**Why affairs happen (this is not excusing them):**
- Unmet needs in the primary relationship (often unspoken)
- Avoidance of difficult conversations
- Seeking validation or escape
- Poor boundaries that escalated
- Personal issues unrelated to the partner

Understanding why doesn't justify the betrayal. It helps make sense of it.

**If you were betrayed:**
Your gauges are likely tanking across the board. State is activated (hypervigilance, anxiety, anger). Emotion is flooded (hurt, rage, grief, shame). Connection is shattered. Body might be struggling (can't eat, can't sleep). This is betrayal trauma - it's real, it's valid, and you're not overreacting.

**If you betrayed someone:**
This content isn't to shame you. Shame keeps people stuck. Understanding why you did what you did - without excusing it - is the path to genuine change. What was missing? What were you avoiding? What would repair require?

**Recovery is possible but hard:**
Some relationships survive affairs. Some shouldn't. The path forward requires honesty, accountability, time, and often professional help. There's no shortcut. And the betrayed partner gets to decide if they want to try - that's not something the betrayer gets to demand.`,
      realWorld: [
        "A man discovers his wife has been texting her coworker for months - nothing physical, but deeply intimate conversations she never had with him. The emotional betrayal feels worse than if she'd just had sex. He can't stop checking her phone. His State gauge is wrecked.\",
        \"A woman realizes her "close friendship" has become an emotional affair. She's telling her friend things she should be telling her husband. Nothing physical has happened, but she knows the line is crossed. She has to decide: end the friendship or address what's missing at home.",
        "A couple in therapy after an affair. The betrayed husband asks "why wasn't I enough?" The betraying wife realizes she never told him what she needed - she assumed he should just know. The affair was wrong, AND the communication failure was real.",
        "A man who cheated works to understand why. Not to excuse it. He discovers he was escaping his own depression rather than facing it. The affair was a symptom. The real work is internal.",
      ],
      diagnostics: [
        {
          symptom: "You just discovered betrayal and can't function\",
          checkFirst: \"All gauges - you're in crisis. This is trauma.\",
          possibleCauses: [\"Betrayal trauma is real and valid\", \"Your nervous system is responding to threat\", \"Everything you believed is destabilized\"],
          tryThis: [\"Don't make permanent decisions right now", "Find one safe person to talk to", "Let yourself feel it - suppressing makes it worse", "Professional support is recommended, not optional", "Your reaction isn't crazy - it's appropriate to the wound\"],
        },
        {
          symptom: \"You can't stop checking their phone/location",
          checkFirst: "State gauge - hypervigilance is a trauma response",
          possibleCauses: ["Your brain is trying to prevent future hurt", "Trust was shattered and you're scanning for threat\", \"This is exhausting but feels necessary\"],
          tryThis: [\"This is normal after betrayal but not sustainable\", \"The checking won't restore trust - only consistent behavior over time will\", \"Consider: is staying worth this level of suffering?\", \"Therapy can help you process without surveillance\"],
        },
        {
          symptom: \"You betrayed someone and feel like a monster\",
          checkFirst: \"Alignment gauge - you violated your own values\",
          possibleCauses: [\"Shame is keeping you stuck\", \"You may have been avoiding something hard\", \"The affair was wrong AND there may be context to understand\"],
          tryThis: [\"Shame locks you down; guilt motivates change\", \"Get honest: what were you avoiding or seeking?\", \"Take full accountability without excuses\", \"The repair work is on YOU - it's not your partner's job to comfort you\", \"Therapy helps you understand without justifying\"],
        },
      ],
      tryThis: \"If you've experienced betrayal: write what you lost. Not just the relationship - the future you imagined, the trust, the story you believed. Naming the losses is part of grieving them.\",
      connectsTo: ["connection', 'emotion', 'state', 'alignment'],
      content: {
        teen: {
          introduction: "Betrayal happens at any age - a friend who shared your secrets, a partner who cheated, someone you trusted who broke that trust. The wound is real. Understanding why it hurts so much (your brain processes betrayal like physical pain) and how to move through it matters.",
          keyConcepts: [
            { title: 'Betrayal trauma is real', explanation: 'When someone you trusted breaks that trust, your brain responds like you\'re in danger. The anxiety, obsessive thoughts, and emotional flooding are your system trying to protect you.' },
            { title: 'Emotional cheating exists', explanation: 'You don\'t have to kiss or sleep with someone to betray a relationship. Sharing emotional intimacy that belongs in your primary relationship is a form of betrayal.' },
            { title: 'It\'s not your fault', explanation: 'If someone betrayed you, that\'s their choice. You didn\'t cause it by not being enough. You can\'t control other people\'s behavior.' },
            { title: 'Healing takes time', explanation: 'You won\'t get over this quickly. That\'s not weakness - it\'s proportional to the wound. Give yourself time." },
          ],
          reflectionPrompt: \"Have you ever been betrayed or betrayed someone? What did it teach you about trust?\",
        },
        adult: {
          introduction: \"Betrayal - whether physical affairs, emotional affairs, or other broken trust - creates profound wounds. Understanding what happened, why it happened, and how to move forward (together or apart) requires honesty, support, and often professional help. This isn't about quick fixes. It's about understanding the wound.",
          keyConcepts: [
            { title: 'Emotional affairs are real affairs', explanation: 'Deep emotional intimacy outside your relationship, secrecy, sharing what you don\'t share with your partner - this is betrayal even without physical contact. Many find it more devastating.' },
            { title: 'Betrayal trauma is clinical', explanation: 'Hypervigilance, intrusive thoughts, inability to eat or sleep, panic attacks - these are trauma responses, not overreactions. Treat them accordingly.' },
            { title: 'Understanding isn\'t excusing', explanation: 'Why did the affair happen? Unmet needs, avoidance, seeking escape - understanding the context helps make sense of it without justifying the choice.' },
            { title: 'Recovery requires more than apology', explanation: 'Genuine repair takes accountability, transparency, time, and changed behavior. Words aren\'t enough. And the betrayed partner gets to decide if they want to try." },
          ],
          reflectionPrompt: \"If you've been betrayed: what did you lose beyond the relationship? If you betrayed: what were you avoiding or seeking?\",
        },
        senior: {
          introduction: \"Betrayal can happen at any stage of life - sometimes in long marriages, sometimes in new relationships. Whether you're dealing with fresh wounds or old ones that never fully healed, the principles are the same: this is a real trauma, understanding helps, and you deserve support.",
          keyConcepts: [
            { title: 'Long relationships aren\'t immune', explanation: 'Affairs happen in 30-year marriages. The length of the relationship doesn\'t protect against betrayal - and can make it more devastating.' },
            { title: 'Old wounds can resurface', explanation: 'Betrayals from decades ago can still affect you. If you never fully processed it, it\'s still there. It\'s not too late to heal.' },
            { title: 'Forgiveness is optional', explanation: 'You don\'t have to forgive to move forward. You can choose peace without absolving. That\'s your decision.' },
            { title: 'It\'s never too late for honesty', explanation: 'Whether you need to confront old pain, finally tell the truth about something, or seek closure - age doesn\'t disqualify you from doing the work." },
          ],
          reflectionPrompt: \"Is there a betrayal - given or received - that you've never fully processed? What would it mean to address it now?\",
        },
      },
    },
  ],
};

// ============================================================
// SECTION 7 EXPORT
// ============================================================

export const MANUAL_SECTION_7: {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  modules: ManualModule[];
} = {
  id: "section-7-family',
  title: 'The Passengers',
  subtitle: 'Family & Relationships',
  emoji: '👨‍👩‍👧‍👦',
  color: '#EC4899', // Pink - connection, love
  modules: [
    section7Module1,
    section7Module2,
    section7Module3,
  ],
};
