/**
 * Emotional education content - modules and lessons.
 * Age-adapted: under13, teen, youngAdult, adult, midlife, senior.
 */

export type ContentAgeGroup =
  | 'under13'
  | 'teen'
  | 'youngAdult'
  | 'adult'
  | 'midlife'
  | 'senior';

export interface LessonContent {
  ageGroup: ContentAgeGroup;
  body: string;
  exercise?: string;
  reflection?: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: number;
  content: LessonContent[];
}

export interface Module {
  id: string;
  title: string;
  emoji: string;
  description: string;
  lessons: Lesson[];
  recommendedFor: ContentAgeGroup[];
}

// ----- Feelings 101 -----
const feelings101Lessons: Lesson[] = [
  {
    id: 'feelings-101-what-are-emotions',
    title: 'What Are Emotions?',
    duration: 5,
    content: [
      {
        ageGroup: 'under13',
        body: `Emotions are like little messengers inside you. When something happens - like getting a present or losing a game - your brain and body send signals. That's why you might feel bubbly in your tummy when you're excited, or heavy in your chest when you're sad.

Emotions aren't \"good\" or \"bad.\" Being sad doesn't mean you're broken. Being angry doesn't mean you're bad. They're just information. Like a traffic light: green means go, red means stop. Your feelings are telling you something. The more you notice them, the better you get at knowing what you need.

Think of a friend who stubbed their toe. They might yell or cry. You wouldn't say \"That's a bad feeling." You'd say \"That really hurts!\" It's the same with feelings in your heart. They're there to help you understand yourself.`,
        exercise: `Next time you feel a strong feeling, stop and say out loud or in your head: "I feel _____." Just naming it can make it feel a little smaller.`,
        reflection: `What's one feeling you had today? Where did you feel it in your body?`,
      },
      {
        ageGroup: 'teen',
        body: `Emotions are your brain and body's way of communicating. When something happens - a text from someone you like, a bad grade, drama with a friend - your brain triggers a cascade of chemicals and signals. That's why you feel butterflies, or your chest gets tight, or you want to scream into a pillow.

Here's the thing: emotions aren't good or bad. They're data. Sadness isn't "wrong." Anger isn't \"bad.\" They're telling you something about what you care about and what you need. Society often tells teens to suppress emotions or dismiss them as \"hormones.\" But your feelings are real and valid. They're not less important because you're young.

When you can name what you're feeling - \"I'm anxious," "I'm disappointed,\" \"I'm actually really hurt\" - you're already one step ahead. You're not being controlled by the feeling; you're noticing it. That's the first step to understanding yourself. Sometimes your emotional "check engine light" isn't about a situation - it's about how the world treats your identity. If you're LGBTQ+, trans, or part of any marginalized group, some of your stress comes from the world, not from you. That means: you're not broken. The system around you needs work.`,
        exercise: `When a strong emotion hits today, pause. Say to yourself: \"I'm feeling _____. It's okay." Notice where in your body you feel it.`,
        reflection: `What emotion do you feel most often that you wish people understood better?`,
      },
      {
        ageGroup: 'adult',
        body: `Emotions are your nervous system's way of processing the world. When something happens - a win at work, a conflict with a partner, a memory, a headline - your brain doesn't just think about it; it responds. Your heart rate shifts. Your stomach tightens or relaxes. That's emotion. It's physiological before it's even a word.

We're often taught to treat emotions as problems to fix or hide. "Don't be so sensitive.\" \"Just get over it.\" But emotions aren't bugs; they're features. They evolved to keep us connected, safe, and motivated. Anger signals a boundary was crossed. Sadness signals loss. Anxiety signals uncertainty. They're not good or bad - they're information. When you can name what you're feeling without judging it, you're not at the mercy of it. You're in relationship with it. And that changes everything.

Sometimes your emotional \"check engine light\" isn't about a situation - it's about how the world treats your identity. If you're LGBTQ+, trans, or part of any marginalized group, some of your stress comes from the world, not from you. That's important to know because it means: you're not broken. The system around you needs work.`,
        exercise: `Next time you feel a strong emotion, pause. Name it. Then notice: Where do I feel this in my body? What might it be telling me?`,
        reflection: `Which emotion do you find hardest to allow in yourself? Why do you think that is?`,
      },
      {
        ageGroup: 'senior',
        body: `Emotions are how we've always made sense of life - at every age. Something happens; our body and mind respond. A grandchild's visit brings joy. A loss brings grief. A change in health brings fear or frustration. These aren't weaknesses; they're human.

Sometimes in later life we're told we should "have it together" or not "make a fuss." But your feelings are just as valid now as they ever were. They're not childish. They're not something to hide. Naming what you feel - \"I'm lonely," "I'm grateful,\" \"I'm worried\" - doesn't make it bigger. It often makes it more manageable. You've lived a long time. You've felt a lot. That's not a problem. That's a life.`,
        exercise: `Today, when you notice a feeling, name it quietly. See if putting a word to it makes it feel a bit easier to carry.`,
        reflection: `What's one emotion you've felt a lot in your life that you've come to understand better over time?`,
      },
    ],
  },
  {
    id: 'feelings-101-name-it-to-tame-it',
    title: 'Name It to Tame It',
    duration: 5,
    content: [
      {
        ageGroup: 'adult',
        body: `There's a saying in psychology: \"Name it to tame it.\" When you put a word to what you're feeling, you activate a different part of your brain than the part that's just reacting. You're not getting rid of the feeling - you're giving it a label. And that simple act can dial down the intensity.

Think about it. When you're overwhelmed, everything feels like a blur. When you say \"I'm overwhelmed,\" suddenly there's a shape to it. You might even notice "I'm not just overwhelmed - I'm scared I'll disappoint people, and underneath that I'm tired.\" The more specific you get, the more you understand yourself. And when you understand, you have more choices. You're not just reacting; you're responding.

You don't need a fancy vocabulary. \"Mad,\" \"sad,\" \"scared,\" \"glad,\" \"bad,\" \"okay\" - start there. Then get curious. Is \"mad\" actually \"hurt\"? Is \"bad\" actually \"ashamed\"? The words are tools. Use them.`,
        exercise: `Set a timer for 2 minutes. Write or say every emotion word you can think of. Notice which ones fit how you've been feeling lately.`,
        reflection: `When was the last time naming a feeling actually made it feel a bit easier?`,
      },
      {
        ageGroup: "teen",
        body: `\"Name it to tame it\" means: when you can say what you're feeling, it often feels less huge. Your brain has a part that just reacts (fight, flight, freeze) and a part that can step back and label things. When you name the feeling, you're using that second part. You're not erasing the emotion - you're not saying \"I shouldn't feel this." You're just saying \"This is what's here.\" And that can make it a little easier to handle.

So when everything feels like too much, try: \"I'm anxious." "I'm hurt.\" \"I'm lonely.\" Even \"I feel like crap\" counts. Once it has a name, you can breathe. You can choose what to do next instead of being swept away.`,
        exercise: `Next time something hits you hard, text yourself or say out loud: \"I feel _____.\" See if it takes the edge off even a little.`,
        reflection: `What's one feeling you often have but don't usually say out loud?`,
      },
      {
        ageGroup: 'under13',
        body: `When you have a big feeling, it can feel like a storm inside you. But if you give the feeling a name - \"I'm angry,\" \"I'm sad," "I'm scared\" - it can get a little calmer. It's like telling a grown-up \"I have a stomachache.\" Once you say it, they can help. When you name your feeling, you're helping yourself.

You don't need big words. \"Mad,\" \"sad,\" \"happy,\" \"worried\" - that's enough. Try it next time. Say in your head or out loud: \"I feel _____.\" It's like turning on a light in a dark room. The feeling might still be there, but you can see it better.`,
        exercise: `Draw or write one feeling you had today. Give it a name.`,
        reflection: `What feeling is easiest for you to name? What's harder?`,
      },
      {
        ageGroup: 'senior',
        body: `Naming what you feel doesn't make it worse - it often makes it easier to carry. When you say \"I'm grieving" or "I'm grateful\" or \"I'm lonely,\" you're not complaining. You're being clear. That clarity can calm the nervous system. You're no longer just \"in\" the feeling; you're observing it too. And that small distance can help.

You've had a lifetime of feelings. You don't have to perform calm or hide what's there. Naming it is a kindness to yourself. Try it today. "I feel _____." No one else has to hear. It's for you.`,
        exercise: `When a feeling rises today, give it one word. Say it quietly. Notice what happens.`,
        reflection: `Is there a feeling you've carried for a long time that you've only recently been able to name?`,
      },
    ],
  },
  {
    id: 'feelings-101-body-keeps-score',
    title: 'Your Body Keeps Score',
    duration: 6,
    content: [
      {
        ageGroup: 'adult',
        body: `Emotions don't just live in your head. They show up in your body. Anxiety might be a tight chest or shallow breath. Grief might be a weight in your stomach. Anger might be heat in your face or clenched fists. Your body is literally keeping score - holding the feelings you haven't fully processed.

When you notice "my shoulders are up by my ears" or "my jaw is tight," you're reading your body's signals. That's valuable. You don't have to fix it right away. Just notice. Sometimes placing a hand where you feel it - on your chest, your belly - and breathing into that spot can soften the intensity. You're telling your nervous system: I see you. I'm here.

The goal isn't to never feel tension or pain. It's to recognize that your body is part of the conversation. The more you listen, the better you get at knowing what you need - rest, movement, connection, or simply acknowledgment.`,
        exercise: `Right now, scan your body from head to toe. Where do you feel tension, heaviness, or ease? Name it without trying to change it.`,
        reflection: `Where in your body do you usually feel stress? Where do you feel calm?`,
      },
      {
        ageGroup: 'teen',
        body: `Ever notice that when you're stressed, your stomach hurts? Or when you're embarrassed, your face gets hot? That's your body feeling the emotion before you've even found words for it. Your body keeps score. Tight shoulders, fast heart, headache, tiredness - a lot of that can be your body saying \"something's going on."

When you start to notice where you feel things - chest, stomach, throat - you get better at knowing what you need. Maybe you need to move. Maybe you need to sit still. Maybe you need to talk to someone. Your body is giving you clues. You're not \"making it up.\" It's real. And paying attention is the first step to taking care of yourself.`,
        exercise: `Next time you're stressed or sad, pause. Where do you feel it? Put your hand there. Breathe into that spot once or twice.`,
        reflection: `Where in your body do you usually feel big emotions?`,
      },
      {
        ageGroup: 'under13',
        body: `Feelings don't just happen in your mind. They happen in your body too! When you're nervous, your tummy might feel wobbly. When you're sad, your chest might feel heavy. When you're excited, you might feel bouncy. That's your body feeling the same thing your heart feels.

It helps to notice where you feel things. If your tummy is tight, you might need a hug or a break. If your chest is heavy, maybe you need to talk to someone. Your body is like a friend that tells you how you're doing. Listen to it.`,
        exercise: `Close your eyes. Where do you feel your feelings right now? In your tummy? Your chest? Your head? Point to the spot.`,
        reflection: `When you're upset, where do you feel it in your body?`,
      },
      {
        ageGroup: "senior",
        body: `Emotions live in the body as much as in the mind. Aches, tension, fatigue - often they're not just \"getting older.\" They're how your body holds what you've been through. That doesn't mean it's all in your head; it means your body is part of the story.

Noticing where you feel things - the tight shoulder, the heavy chest, the calm in your hands when you're with someone you love - helps you understand yourself. You don't have to fix it. Just notice. Sometimes a gentle hand on the place that hurts, and a slow breath, is enough to say: I'm here. I hear you.`,
        exercise: `Do a quick body scan. Where do you feel ease? Where do you feel tension? No need to change anything - just notice.`,
        reflection: `What does your body tell you when you're at peace? When you're not?`,
      },
    ],
  },
];

// ----- Your Triggers -----
const triggersLessons: Lesson[] = [
  {
    id: "triggers-what-is-trigger",
    title: \"What's a Trigger?\",
    duration: 5,
    content: [
      {
        ageGroup: "adult",
        body: `A trigger is something - a situation, a word, a tone of voice, a memory - that causes a strong emotional reaction that feels bigger than the moment. You might snap at a partner over something small, or shut down in a meeting, or feel panic when someone raises their voice. The reaction is real, but it's often connected to something from your past - a time when you felt unsafe, dismissed, or overwhelmed.

Triggers aren't a sign that you're broken. They're a sign that your brain is trying to protect you based on what it learned before. The problem is, sometimes it overgeneralizes. It treats \"my boss is criticizing my work\" like \"I'm not safe" or "I'm not enough.\" So you react as if it's life-or-death when it's actually a fixable moment.

Understanding that you're triggered - \"I'm having a big reaction; something old might be getting activated\" - doesn't erase the feeling. But it gives you a choice. You can still act, but you're not only reacting. You're starting to see the pattern.`,
        exercise: `Think of one situation that often sets you off. What might your brain be linking it to from the past?`,
        reflection: `What's one trigger you've started to notice in yourself?`,
      },
    ],
  },
  {
    id: 'triggers-mapping-patterns',
    title: 'Mapping Your Patterns',
    duration: 6,
    content: [
      {
        ageGroup: 'adult',
        body: `Patterns usually go: trigger → reaction → consequence. Something happens (a comment, a silence, a deadline). You react (anger, withdrawal, anxiety). Then there's a consequence (a fight, a missed opportunity, more stress). Mapping the pattern means writing or noticing: What was the trigger? What did I do? What happened next?

You're not blaming yourself. You're gathering data. Over time you might see: \"When I feel dismissed, I get cold and shut down. Then the other person feels rejected and we both end up lonely.\" Or: \"When I'm overwhelmed, I snap at the kids. Then I feel guilty and they feel hurt.\" Once you see the pattern, you can experiment. What if I paused when I feel dismissed? What if I asked for five minutes alone when I'm overwhelmed? You're not perfecting yourself. You're adding one small step between trigger and reaction.`,
        exercise: `Pick one recent blow-up or shutdown. Write: Trigger → My reaction → What happened next. No judgment - just map it.`,
        reflection: `What pattern would you most like to change?`,
      },
    ],
  },
  {
    id: "triggers-the-pause',
    title: 'The Pause',
    duration: 5,
    content: [
      {
        ageGroup: 'adult',
        body: `Between a trigger and your response there's a tiny space. The pause is that space. You can't always control the trigger or the first flash of feeling. But you can train yourself to notice that flash and pause before you act. Breathe. Count to three. Say "I need a minute." Leave the room. The goal isn't to never feel - it's to not let the feeling run the show every time.

The pause doesn't have to be long. A few seconds can be enough to choose "I'm not going to say that\" or \"I'm going to say I need a break.\" You're not becoming a robot. You're giving yourself a chance to respond instead of react. That's agency. That's growth.`,
        exercise: `Next time you feel triggered, try: one breath in, one breath out. Then decide what you'll do. Even if you still get upset, you've created a tiny gap.`,
        reflection: `When is it hardest for you to pause? What would make it easier?`,
      },
    ],
  },
];

// ----- Communication -----
const communicationLessons: Lesson[] = [
  {
    id: "comm-i-feel-statements',
    title: 'I Feel Statements',
    duration: 5,
    content: [
      {
        ageGroup: 'adult',
        body: `\"You never listen\" puts the other person on defense. \"I feel unheard when we're both on our phones during dinner\" states your experience without accusing. That's the idea behind "I feel" statements: you own your feeling and describe what's going on for you, instead of blaming or labeling the other person.

Format: "I feel [emotion] when [situation]. I'd like [request].\" Example: \"I feel worried when you come home late and don't text. I'd like a quick message so I know you're okay.\" You're not saying they're wrong. You're saying what you feel and what would help. It doesn't guarantee they'll change, but it makes it more likely they'll hear you - and it keeps you from building resentment in silence.`,
        exercise: `Turn one complaint into an "I feel" statement. "You always..." becomes "I feel _____ when _____."`,
        reflection: `Who do you wish you could say an "I feel" statement to? What would you say?`,
      },
    ],
  },
  {
    id: 'comm-listening-to-understand',
    title: 'Listening to Understand',
    duration: 6,
    content: [
      {
        ageGroup: 'adult',
        body: `Most of us listen to reply. We wait for our turn to talk, or we're already planning what we'll say. Listening to understand is different. You're trying to get what the other person means and feels - not to fix it, not to agree, not to tell your story yet. Just to receive theirs.

That means less interrupting, less \"Oh, that's like when I…,\" less advice unless they ask. It means reflecting back: \"So what you're saying is…" or "It sounds like you felt…" It means being okay with silence. When someone feels heard, they often soften. And when you practice really listening, you learn more than when you're talking.`,
        exercise: `In your next real conversation, try to listen without planning your response. When they pause, say "What else?" or "Tell me more."`,
        reflection: `When do you find it hardest to listen without jumping in?`,
      },
    ],
  },
  {
    id: 'comm-hard-conversations',
    title: 'Having Hard Conversations',
    duration: 6,
    content: [
      {
        ageGroup: 'adult',
        body: `Hard conversations are the ones we avoid: setting a boundary, saying we're hurt, asking for what we need, ending something. The trick is to go in with clarity. What do I want to say? What do I want them to understand? What do I need from them (or from myself)?

You can script a few lines. \"I need to tell you something that's hard for me." "When you did X, I felt Y. I'm not saying you're bad - I'm saying I need this to change." "I'd like to hear your side after I've said this.\" You don't have to be perfect. You can say "I'm nervous to bring this up.\" Timing matters: when you're both calm, when you have time, when you're not in public. And remember: their reaction isn't your job. Your job is to be clear and honest.

Finding your people - people who see you and accept ALL of you - isn't a luxury. It's maintenance. If your current circle doesn't affirm who you are, it's okay to find people who do.`,
        exercise: `Write three sentences you could use in a hard conversation you've been avoiding. You don't have to send them yet.`,
        reflection: `What's one conversation you've been putting off? What's the smallest first step?`,
      },
    ],
  },
];

// ----- Boundaries -----
const boundariesLessons: Lesson[] = [
  {
    id: 'boundaries-what-are',
    title: 'What Are Boundaries?',
    duration: 5,
    content: [
      {
        ageGroup: 'adult',
        body: `Boundaries aren't walls. They're more like fences with gates. They define what's okay for you and what isn't - with your time, your body, your energy, your stuff. \"I'm not available after 9 p.m. for work texts." "I don't want to talk about that right now.\" \"I need you to ask before borrowing my things.\" That's not mean. It's clear.

A lot of us were taught that saying no or having limits is selfish. But boundaries are how you take care of yourself so you can show up for others without burning out or resenting them. They're not about controlling the other person. They're about what you will and won't do, and what you'll allow in your space.`,
        exercise: `Name one boundary you already have that you're proud of. Then name one you wish you had.`,
        reflection: `Where in your life do you most need a clearer boundary?`,
      },
    ],
  },
  {
    id: "boundaries-saying-no',
    title: 'Saying No Without Guilt',
    duration: 5,
    content: [
      {
        ageGroup: 'adult',
        body: `\"No\" is a complete sentence. You don't have to over-explain or soften it so much that it becomes a \"maybe.\" You can say \"I can't do that," "I'm not available,\" \"That doesn't work for me.\" You don't owe a long story. You're allowed to protect your time and energy.

Guilt often shows up because we're afraid of disappointing people or being seen as selfish. But saying no to one thing is saying yes to something else - rest, another person, your own needs. The people who respect your no are the ones worth keeping close. The ones who push back might need a firmer line. You're not responsible for their reaction. You're responsible for being honest.`,
        exercise: `Practice saying no out loud to something small this week. \"No, I can't make it.\" \"No, I'd rather not." Notice how it feels.`,
        reflection: `What do you usually say yes to when you want to say no?`,
      },
    ],
  },
  {
    id: 'boundaries-when-others-cross',
    title: 'When Others Cross Your Boundaries',
    duration: 6,
    content: [
      {
        ageGroup: 'adult',
        body: `When someone crosses a boundary you've set, you have choices. You can remind them: \"I said I wasn't going to talk about that. I need you to respect that." You can leave the situation. You can limit contact. You're not punishing them; you're enforcing what you need to feel safe and respected.

If they keep crossing after you've been clear, that's information. It might mean they don't take you seriously, or they're not capable of giving you what you need. You can still care about someone and choose to have less access to you. Your job isn't to make them understand. Your job is to hold the line for yourself.`,
        exercise: `Think of one time someone crossed a boundary. What did you do? What would you do now?`,
        reflection: `When someone crosses your boundary, do you tend to freeze, fight, or leave? What would you like to do more of?`,
      },
    ],
  },
];

// ----- Self-Compassion -----
const selfCompassionLessons: Lesson[] = [
  {
    id: 'compassion-talk-like-friend',
    title: 'Talk to Yourself Like a Friend',
    duration: 5,
    content: [
      {
        ageGroup: 'adult',
        body: `Would you say to a friend what you say to yourself when you mess up? \"You're so stupid.\" \"You always ruin things.\" Probably not. You'd say "That was hard. You're doing your best.\" So why is it okay to talk to yourself that way? It's not. The way you speak to yourself shapes how you feel and what you try next.

Self-compassion isn't letting yourself off the hook. It's talking to yourself like someone who wants you to get better, not suffer. \"I made a mistake. I can learn from this.\" \"I'm struggling. It's okay to need help." Try putting your hand on your heart and saying your name, then one kind sentence. It might feel weird at first. That's the habit of self-criticism talking. Keep going.`,
        exercise: `Next time you catch yourself being harsh, pause. What would you say to a friend in the same situation? Say that to yourself.`,
        reflection: `What's one thing you often say to yourself that you'd never say to a friend?`,
      },
    ],
  },
  {
    id: 'compassion-perfectionism',
    title: 'Perfectionism vs Excellence',
    duration: 5,
    content: [
      {
        ageGroup: 'adult',
        body: `Perfectionism sounds like high standards, but it's often fear in disguise. Fear of being judged, of not being enough, of making a mistake. So you push and criticize and never feel done. Excellence is different. It's doing your best and being able to stop. It's \"good enough\" as a real goal, not a compromise.

Good enough means: I did what I could with the time and energy I had. It doesn't mean lazy. It means sustainable. Perfectionism burns you out and steals the joy of finishing. Good enough lets you ship the project, send the message, and rest. You're allowed to be satisfied. You're allowed to not re-read that email 10 times.`,
        exercise: `Pick one thing you've been overdoing. Decide what \"good enough\" would look like. Try stopping there once this week.`,
        reflection: `Where does perfectionism show up most in your life? What would \"good enough\" look like there?`,
      },
    ],
  },
  {
    id: "compassion-forgiving-yourself',
    title: 'Forgiving Yourself',
    duration: 6,
    content: [
      {
        ageGroup: 'adult',
        body: `You did the best you could with what you knew and what you had at the time. That's not an excuse for harm you caused - it's a starting point for moving forward. Self-forgiveness doesn't mean forgetting or saying it didn't matter. It means no longer using the past to punish yourself in the present.

You can regret something and still choose to learn, make amends if needed, and stop replaying the tape on loop. The person you were then didn't have the clarity you have now. You're allowed to grow. You're allowed to put down the weight. It doesn't mean what you did was okay. It means you don't have to carry the sentence forever.`,
        exercise: `Write one sentence: \"I forgive myself for _____.\" You don't have to believe it fully yet. Just write it.`,
        reflection: `What's one thing you've been holding against yourself that you're ready to soften toward?`,
      },
    ],
  },
  {
    id: "compassion-when-to-see-mechanic',
    title: 'When to See the Mechanic',
    duration: 5,
    content: [
      {
        ageGroup: 'adult',
        body: `Sometimes you need more than self-care and good habits - you need a professional. That's not failure. It's like taking your car to a mechanic when the check engine light won't turn off. A therapist can help you work through patterns, trauma, or stuck places in a way that friends and apps can't.

If you're looking for a therapist, it's okay to ask: \"Are you experienced with LGBTQ+ clients?\" or \"Are you affirming of trans identities?\" A good mechanic knows your specific make and model. You deserve that. Gender-affirming care is valid healthcare, not something to debate. Your identity is not a diagnosis.`,
        exercise: `If you've ever thought about therapy, write one question you'd want to ask a potential therapist before starting.`,
        reflection: `What would make you feel safe and heard in a therapy room?`,
      },
    ],
  },
];

// ----- Relationships -----
const relationshipsLessons: Lesson[] = [
  {
    id: 'relationships-attachment',
    title: 'Attachment Styles',
    duration: 6,
    content: [
      {
        ageGroup: 'adult',
        body: `How you love and need connection often has patterns - that's attachment. Some people feel secure: they're okay with closeness and with space. Some are anxious: they need a lot of reassurance and fear abandonment. Some are avoidant: they value independence and can feel smothered. Most of us are a mix, and it often links back to early relationships with caregivers.

Knowing your style isn't about labeling yourself. It's about understanding why you react the way you do in relationships. \"I need constant contact\" or \"I need a lot of space\" isn't wrong - it's information. When you and your person understand each other's styles, you can stop taking things so personally and start working with the pattern instead of against it.`,
        exercise: `Read about secure, anxious, and avoidant attachment. Which sounds most like you in close relationships?`,
        reflection: `How do you usually react when you feel rejected or when someone gets too close?`,
      },
    ],
  },
  {
    id: 'relationships-healthy-toxic',
    title: 'Healthy vs Toxic',
    duration: 6,
    content: [
      {
        ageGroup: 'adult',
        body: `Healthy relationships have respect, honesty, and room for both people to be themselves. You feel generally safe. You can disagree and repair. You're not walking on eggshells. Toxic ones leave you drained, confused, or small. There might be control, blame, inconsistency, or disrespect. Red flags: you're always wrong, you can't have other friends, you're afraid to bring things up, you're made to feel crazy.

Green flags: you can say no, you're supported, you laugh together, you feel like yourself. You don't have to have proof to leave a relationship that doesn't feel good. "I'm done\" is enough. And you're allowed to want green flags. You're allowed to expect them.`,
        exercise: `List three green flags you want in a relationship. List one red flag you're willing to no longer ignore.`,
        reflection: `What's one green flag you've seen in a relationship (yours or someone else's)?`,
      },
    ],
  },
  {
    id: 'relationships-love-languages',
    title: 'Love Languages',
    duration: 5,
    content: [
      {
        ageGroup: 'adult',
        body: `People give and receive love in different ways: words of affirmation, quality time, acts of service, gifts, physical touch. You might feel most loved when someone does something for you; your partner might feel it when you say \"I'm proud of you.\" Neither is wrong. The gap is when we give what we'd want and wonder why the other person doesn't feel it.

Learning your love language - and theirs - is about speaking each other's dialect. If their thing is quality time, put your phone away. If yours is words, ask for the words you need. It's not mind-reading; it's paying attention and choosing to show up in the way that lands.`,
        exercise: `Name your top love language. Ask someone close what they think theirs is. Compare.`,
        reflection: `How do you usually show love? How do you most like to receive it?`,
      },
    ],
  },
];

// Ensure every lesson has content for adult (fallback) and map other ages to closest
function ensureAllAges(lesson: Lesson): Lesson {
  const ageGroups: ContentAgeGroup[] = ['under13', 'teen', 'youngAdult', 'adult', 'midlife', 'senior'];
  const adultContent = lesson.content.find((c) => c.ageGroup === 'adult') ?? lesson.content[0];
  const byAge: Record<ContentAgeGroup, LessonContent> = {} as Record<ContentAgeGroup, LessonContent>;
  ageGroups.forEach((age) => {
    const found = lesson.content.find((c) => c.ageGroup === age);
    byAge[age] = found ?? { ...adultContent, ageGroup: age };
  });
  return {
    ...lesson,
    content: ageGroups.map((age) => byAge[age]),
  };
}

export const MODULES: Module[] = [
  {
    id: 'feelings-101',
    title: 'Feelings 101',
    emoji: '🧠',
    description: 'Understand what emotions are and how to work with them.',
    lessons: feelings101Lessons.map(ensureAllAges),
    recommendedFor: ['under13', 'teen', 'youngAdult', 'adult', 'midlife', 'senior'],
  },
  {
    id: 'triggers',
    title: 'Your Triggers',
    emoji: '⚡',
    description: 'Learn what sets you off and how to create space between trigger and response.',
    lessons: triggersLessons.map(ensureAllAges),
    recommendedFor: ['teen', 'youngAdult', 'adult', 'midlife'],
  },
  {
    id: 'communication',
    title: 'Communication',
    emoji: '💬',
    description: 'Express yourself clearly and listen in a way that connects.',
    lessons: communicationLessons.map(ensureAllAges),
    recommendedFor: ['under13', 'teen', 'youngAdult', 'adult', 'midlife', 'senior'],
  },
  {
    id: 'boundaries',
    title: 'Boundaries',
    emoji: '🚧',
    description: 'Set limits that protect your energy without building walls.',
    lessons: boundariesLessons.map(ensureAllAges),
    recommendedFor: ['teen', 'youngAdult', 'adult', 'midlife'],
  },
  {
    id: 'self-compassion',
    title: 'Self-Compassion',
    emoji: '💛',
    description: 'Talk to yourself like someone you love.',
    lessons: selfCompassionLessons.map(ensureAllAges),
    recommendedFor: ['under13', 'teen', 'youngAdult', 'adult', 'midlife', 'senior'],
  },
  {
    id: 'relationships',
    title: 'Relationships',
    emoji: '❤️',
    description: 'Attachment, healthy vs toxic, and how people give and receive love.',
    lessons: relationshipsLessons.map(ensureAllAges),
    recommendedFor: ['teen', 'youngAdult', 'adult', 'midlife', 'senior'],
  },
];

export function getLessonById(id: string): Lesson | null {
  for (const mod of MODULES) {
    const lesson = mod.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return null;
}

export function getModuleByLessonId(lessonId: string): Module | null {
  return MODULES.find((m) => m.lessons.some((l) => l.id === lessonId)) ?? null;
}

export function getContentForAge(lesson: Lesson, contentAge: ContentAgeGroup): LessonContent {
  return (
    lesson.content.find((c) => c.ageGroup === contentAge) ??
    lesson.content.find((c) => c.ageGroup === 'adult') ??
    lesson.content[0]
  );
}
