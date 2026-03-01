/**
 * Emotion wheel: primary → secondary → detail (description, triggers, coping).
 */

export interface EmotionDetail {
  name: string;
  feelsLike: string;
  showsUpWhen: string;
  tryThis: string;
}

export interface PrimaryEmotion {
  id: string;
  emoji: string;
  label: string;
  color: string;
  secondary: { id: string; label: string }[];
  details: Record<string, EmotionDetail>;
}

export const EMOTION_WHEEL_PRIMARY: PrimaryEmotion[] = [
  {
    id: 'angry',
    emoji: '😠',
    label: 'Angry',
    color: '#EF5350',
    secondary: [
      { id: 'frustrated', label: 'Frustrated' },
      { id: 'irritated', label: 'Irritated' },
      { id: 'furious', label: 'Furious' },
      { id: 'betrayed', label: 'Betrayed' },
      { id: 'resentful', label: 'Resentful' },
      { id: 'jealous', label: 'Jealous' },
    ],
    details: {
      frustrated: {
        name: 'Frustrated',
        feelsLike: 'Things aren't going the way you want, and you feel stuck or blocked.',
        showsUpWhen: 'Repeated obstacles, feeling unheard, or when effort doesn't pay off.',
        tryThis: 'Name what's in your control vs. what isn't. One small step you can take right now.',
      },
      irritated: {
        name: 'Irritated',
        feelsLike: 'A low-grade annoyance — little things rub you the wrong way.',
        showsUpWhen: 'You're tired, overstimulated, or your boundaries are being nudged.',
        tryThis: 'Take a short break. Sometimes 5 minutes of quiet or a walk helps.',
      },
      furious: {
        name: 'Furious',
        feelsLike: `Intense heat and energy - you might feel like you could explode.`,
        showsUpWhen: `Something unfair happened, or a core value was violated.`,
        tryThis: `Let the wave move through. Splash cold water on your face or squeeze ice. Then decide what you need.`,
      },
      betrayed: {
        name: 'Betrayed',
        feelsLike: 'A breach of trust — you expected safety and got the opposite.',
        showsUpWhen: 'Someone you trusted broke a promise, lied, or went behind your back.',
        tryThis: 'Your feelings are valid. When you're ready, you can decide what you need from the relationship.',
      },
      resentful: {
        name: 'Resentful',
        feelsLike: 'Holding onto old anger — “they had it easy” or “I always give more.”',
        showsUpWhen: 'Unfair division of labor, past hurts that weren't acknowledged, or unmet needs.',
        tryThis: 'Name what you're still needing (apology, change, or to let go). One small conversation or boundary at a time.',
      },
      jealous: {
        name: 'Jealous',
        feelsLike: 'Fear of losing something or someone, mixed with comparison.',
        showsUpWhen: 'Someone has what you want, or you're worried about being replaced.',
        tryThis: 'Jealousy often points to what we care about. What do you need more of — security, recognition, or connection?',
      },
    },
  },
  {
    id: 'sad',
    emoji: '😢',
    label: 'Sad',
    color: '#42A5F5',
    secondary: [
      { id: 'lonely', label: 'Lonely' },
      { id: 'heartbroken', label: 'Heartbroken' },
      { id: 'disappointed', label: 'Disappointed' },
      { id: 'hopeless', label: 'Hopeless' },
      { id: 'guilty', label: 'Guilty' },
      { id: 'empty', label: 'Empty' },
    ],
    details: {
      lonely: {
        name: 'Lonely',
        feelsLike: `Wanting connection but feeling unseen or alone.`,
        showsUpWhen: `Isolation, lack of deep connection, or feeling different from others.`,
        tryThis: `Reach out to one person - even a short text. Or write what you wish someone would say to you.`,
      },
      heartbroken: {
        name: 'Heartbroken',
        feelsLike: `Heavy chest, tears, like something precious was lost.`,
        showsUpWhen: `Loss of a relationship, a dream, or someone you love.`,
        tryThis: `Grief takes time. Be gentle. Small comforts - a warm drink, a soft blanket - matter.`,
      },
      disappointed: {
        name: 'Disappointed',
        feelsLike: 'Let down — things didn't turn out as you hoped.',
        showsUpWhen: 'Expectations weren't met, by yourself or someone else.',
        tryThis: 'It's okay to feel let down. What would you do differently next time, or what do you need to accept?',
      },
      hopeless: {
        name: 'Hopeless',
        feelsLike: 'Nothing will get better — why try?',
        showsUpWhen: 'Repeated setbacks, depression, or when the future looks dark.',
        tryThis: 'Hopelessness lies. One tiny thing that's still true or good today? If you're stuck, tell someone.',
      },
      guilty: {
        name: 'Guilty',
        feelsLike: 'You did something wrong or let someone down.',
        showsUpWhen: 'You hurt someone, broke a value, or didn't meet your own standards.',
        tryThis: 'Guilt can be useful — it points to repair. Apologize or make amends if you can. Then work on forgiving yourself.',
      },
      empty: {
        name: 'Empty',
        feelsLike: `Numb or hollow - nothing matters much.`,
        showsUpWhen: `Burnout, depression, or disconnection from what used to give meaning.`,
        tryThis: `Emptiness is a signal. Rest, one small thing that used to bring joy, or talking to someone can help.`,
      },
    },
  },
  {
    id: 'afraid',
    emoji: '😨',
    label: 'Afraid',
    color: '#7C4DFF',
    secondary: [
      { id: 'anxious', label: 'Anxious' },
      { id: 'insecure', label: 'Insecure' },
      { id: 'overwhelmed', label: 'Overwhelmed' },
      { id: 'panicked', label: 'Panicked' },
      { id: 'vulnerable', label: 'Vulnerable' },
      { id: 'helpless', label: 'Helpless' },
    ],
    details: {
      anxious: {
        name: 'Anxious',
        feelsLike: 'Butterflies, racing thoughts, or a sense that something bad might happen.',
        showsUpWhen: 'Uncertainty, big changes, or when you're bracing for the worst.',
        tryThis: 'Ground yourself: 5-4-3-2-1 — name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.',
      },
      insecure: {
        name: 'Insecure',
        feelsLike: 'Not good enough — others will find out or reject you.',
        showsUpWhen: 'Comparison, criticism, or past experiences of being judged.',
        tryThis: 'Notice the thought. Would you say that to a friend? One thing you're actually good at or have survived.',
      },
      overwhelmed: {
        name: 'Overwhelmed',
        feelsLike: 'Too much — you can't keep up or think straight.',
        showsUpWhen: 'Too many demands, no clear priority, or no break.',
        tryThis: 'Pick one small thing. Do only that. Delegate or drop one thing if you can.',
      },
      panicked: {
        name: 'Panicked',
        feelsLike: 'Heart racing, can't breathe — something is very wrong.',
        showsUpWhen: 'Panic attacks, trauma triggers, or feeling trapped.',
        tryThis: 'You're safe. Slow your breath: 4 in, 4 hold, 4 out. This will pass.',
      },
      vulnerable: {
        name: 'Vulnerable',
        feelsLike: `Exposed - someone could hurt you if they wanted to.`,
        showsUpWhen: `Opening up, being honest, or after being hurt.`,
        tryThis: `Vulnerability is courage. You get to choose who earns your trust.`,
      },
      helpless: {
        name: 'Helpless',
        feelsLike: 'Nothing I do matters — I have no control.',
        showsUpWhen: 'Situations you can't fix, or when others make decisions for you.',
        tryThis: 'Name one thing you can control right now — even if it's small. Focus there.',
      },
    },
  },
  {
    id: 'happy',
    emoji: '😊',
    label: 'Happy',
    color: '#FDD835',
    secondary: [
      { id: 'grateful', label: 'Grateful' },
      { id: 'proud', label: 'Proud' },
      { id: 'content', label: 'Content' },
      { id: 'excited', label: 'Excited' },
      { id: 'peaceful', label: 'Peaceful' },
      { id: 'loved', label: 'Loved' },
    ],
    details: {
      grateful: {
        name: 'Grateful',
        feelsLike: 'Warmth — something good is present, and you notice it.',
        showsUpWhen: 'Acknowledging what you have, even when things are hard.',
        tryThis: 'Name three small things you're grateful for today. Write or say them out loud.',
      },
      proud: {
        name: 'Proud',
        feelsLike: 'You did something that matters — you're standing taller.',
        showsUpWhen: 'You tried, grew, or met a goal that was important to you.',
        tryThis: 'Let yourself feel it. Share it with someone who'll celebrate with you.',
      },
      content: {
        name: 'Content',
        feelsLike: 'Enough — not chasing, just okay right now.',
        showsUpWhen: 'Needs are met, you're present, or you've accepted how things are.',
        tryThis: 'Savor it. Contentment is a gift — stay with it for a few breaths.',
      },
      excited: {
        name: 'Excited',
        feelsLike: `Buzzing energy - something good is coming.`,
        showsUpWhen: `Anticipation of something you care about.`,
        tryThis: `Channel it - plan something, share the news, or move your body.`,
      },
      peaceful: {
        name: 'Peaceful',
        feelsLike: `Calm - your mind and body are at rest.`,
        showsUpWhen: `Safety, resolution, or moments of quiet.`,
        tryThis: `Protect this. What helped? Do more of that when you can.`,
      },
      loved: {
        name: 'Loved',
        feelsLike: `Seen and held - someone cares about you.`,
        showsUpWhen: `Connection, affection, or being chosen.`,
        tryThis: `Let it in. You deserve to feel loved.`,
      },
    },
  },
  {
    id: 'surprised',
    emoji: '😲',
    label: 'Surprised',
    color: '#FFA726',
    secondary: [
      { id: 'confused', label: 'Confused' },
      { id: 'amazed', label: 'Amazed' },
      { id: 'shocked', label: 'Shocked' },
      { id: 'moved', label: 'Moved' },
      { id: 'curious', label: 'Curious' },
      { id: 'speechless', label: 'Speechless' },
    ],
    details: {
      confused: {
        name: 'Confused',
        feelsLike: 'Can't quite put it together — mixed signals or unclear information.',
        showsUpWhen: 'Too much at once, conflicting messages, or something new.',
        tryThis: 'It's okay not to know. Write down what you do know and one question to clarify.',
      },
      amazed: {
        name: 'Amazed',
        feelsLike: 'Wonder — something is unexpectedly beautiful or impressive.',
        showsUpWhen: 'Nature, art, or someone's kindness catches you off guard.',
        tryThis: 'Stay with the feeling. Share it with someone if you can.',
      },
      shocked: {
        name: 'Shocked',
        feelsLike: 'Stunned — you didn't see that coming.',
        showsUpWhen: 'Unexpected news, good or bad.',
        tryThis: 'Give yourself time. You don't have to respond or decide right away.',
      },
      moved: {
        name: 'Moved',
        feelsLike: `Touched - something got to you emotionally.`,
        showsUpWhen: `A story, a gesture, or a moment of connection.`,
        tryThis: `Let yourself feel it. Being moved is a sign you care.`,
      },
      curious: {
        name: 'Curious',
        feelsLike: `Wanting to know more - open and interested.`,
        showsUpWhen: `Something new, a puzzle, or a person you want to understand.`,
        tryThis: `Follow it. Ask one question or explore one thing.`,
      },
      speechless: {
        name: 'Speechless',
        feelsLike: 'Words aren't enough — you're struck by something.',
        showsUpWhen: 'Awe, grief, or overwhelming emotion.',
        tryThis: 'You don't have to speak. A hand on your heart or a deep breath can be enough.',
      },
    },
  },
  {
    id: 'disgusted',
    emoji: '🤢',
    label: 'Disgusted',
    color: '#66BB6A',
    secondary: [
      { id: 'ashamed', label: 'Ashamed' },
      { id: 'repulsed', label: 'Repulsed' },
      { id: 'judgmental', label: 'Judgmental' },
      { id: 'uncomfortable', label: 'Uncomfortable' },
      { id: 'contemptuous', label: 'Contemptuous' },
      { id: 'embarrassed', label: 'Embarrassed' },
    ],
    details: {
      ashamed: {
        name: 'Ashamed',
        feelsLike: `You are wrong or bad - you want to hide.`,
        showsUpWhen: `You violated a value, were exposed, or were shamed by others.`,
        tryThis: `Shame lies. You are not your mistake. One person who would still care about you?`,
      },
      repulsed: {
        name: 'Repulsed',
        feelsLike: 'Something is wrong or offensive — you want to get away.',
        showsUpWhen: 'Something violates your boundaries or values physically or morally.',
        tryThis: 'Your reaction is valid. Remove yourself if you need to. You don't have to engage.',
      },
      judgmental: {
        name: 'Judgmental',
        feelsLike: 'They're wrong or less than — you're above it.',
        showsUpWhen: 'Someone did something you disagree with, or you're protecting yourself by criticizing.',
        tryThis: 'Notice the judgment. What are you really feeling underneath — hurt, fear, or something else?',
      },
      uncomfortable: {
        name: 'Uncomfortable',
        feelsLike: 'Something's off — you want to leave or change the subject.',
        showsUpWhen: 'Boundaries are nudged, the situation is unfamiliar, or something doesn't sit right.',
        tryThis: 'You can leave or change the topic. It's okay to honor your discomfort.',
      },
      contemptuous: {
        name: 'Contemptuous',
        feelsLike: 'They're beneath you — you've lost respect.',
        showsUpWhen: 'Repeated letdowns, feeling superior, or unresolved anger.',
        tryThis: 'Contempt damages connection. What would need to change for you to feel respect again?',
      },
      embarrassed: {
        name: 'Embarrassed',
        feelsLike: `You did something silly or wrong in front of others.`,
        showsUpWhen: `A slip-up, being the center of attention, or fear of being laughed at.`,
        tryThis: `Most people forget quickly. Be kind to yourself - everyone has off moments.`,
      },
    },
  },
];
