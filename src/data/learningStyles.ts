/**
 * LEARNING STYLES
 * How You Learn Best
 * 
 * Everyone processes information differently.
 * Understanding your learning style helps you actually absorb what you"re learning -
 * not just read it and forget it.
 */

export interface LearningStyle {
  id: string;
  emoji: string;
  name: string;
  color: string;
  tagline: string;
  description: string;
  howYouLearn: string[];
  strengths: string[];
  challenges: string[];
  signsThisIsYou: string[];
  howToUseThisApp: string[];
  studyTips: string[];
  bestActivities: string[];
}

export const LEARNING_STYLES_INTRO = {
  headline: \"How Do You Learn Best?\",
  subhead: \"Understanding your style helps you actually absorb this - not just read it.\",
  
  philosophy: `Ever read something, understood it in the moment, and completely forgot it by the next day? That's not a memory problem. That"s a learning style mismatch.

Your brain has preferred pathways for taking in and retaining information. Some people need to see it visually. Some need to hear it explained. Some need to read and write about it. Some need to physically do it.

There"s no \"best\" style - just the one that works for YOUR brain. Most people are a blend of styles, with one or two that are stronger.

Understanding your learning style isn't just for school. It"s for life. It's how you actually retain the emotional intelligence concepts in this app instead of just scrolling through them.`,

  theoryNote: "Learning styles are debated in academic research, but the practical insight remains useful: different approaches work better for different people at different times. Use what works for you.",
};

export const LEARNING_STYLES: LearningStyle[] = [
  {
    id: 'visual',
    emoji: '👁️',
    name: 'Visual',
    color: '#38BDF8',
    tagline: 'You learn by seeing",
    
    description: `Visual learners process information best through images, diagrams, charts, maps, and visual representations. You think in pictures. When someone explains something, you might automatically create a mental image. You remember faces better than names. You're drawn to color-coding and visual organization.

Your brain builds understanding by seeing how things connect spatially. A wall of text is your enemy. A well-designed infographic is your friend.`,

    howYouLearn: [
      \"Seeing information displayed visually (charts, diagrams, mind maps)\",
      \"Color-coding and highlighting\",
      \"Watching demonstrations rather than hearing instructions\",
      \"Visualizing concepts as mental images\",
      \"Spatial organization - where things are placed matters\",
    ],

    strengths: [
      \"Quick at seeing patterns and connections\",
      \"Good at remembering visual details\",
      \"Strong spatial reasoning\",
      \"Can picture abstract concepts\",
      \"Often good at design and aesthetics\",
    ],

    challenges: [
      \"Long lectures without visuals are draining\",
      \"Verbal instructions can be hard to follow\",
      \"May miss information that"s only spoken",
      "Can get overwhelmed by cluttered visual environments",
    ],

    signsThisIsYou: [
      "You remember what you saw, not what was said",
      "You take lots of notes, often with drawings or diagrams",
      "You prefer maps over written directions",
      "You notice visual details others miss",
      "You think in pictures - when someone describes something, you see it",
      "You"re drawn to well-designed apps, websites, and spaces\",
    ],

    howToUseThisApp: [
      \"Look at the gauge visualizations - the colors and shapes carry meaning\",
      \"Pay attention to the emojis and icons - they're memory anchors\",
      \"Draw your own diagrams of how the 6 gauges connect\",
      \"Take screenshots of key concepts and review them\",
      \"Use the Body Scan with its body map visualization\",
      \"Notice the color patterns: red = Body, yellow = State, purple = Emotion, etc.\",
    ],

    studyTips: [
      \"Create mind maps of the gauge system\",
      \"Draw what emotions feel like in your body\",
      \"Use colored highlighters when journaling\",
      \"Visualize scenarios before trying the tools\",
      \"Sketch the 3 nervous system states\",
    ],

    bestActivities: [
      \"Body Scan (visual body map)\",
      \"Emotion Wheel (visual organization of feelings)\",
      \"Mood Patterns (visual charts)\",
      \"Trigger Map (visual connections)\",
    ],
  },
  
  {
    id: "auditory',
    emoji: '👂',
    name: 'Auditory',
    color: '#A78BFA',
    tagline: 'You learn by hearing',
    
    description: `Auditory learners process information best through sound - listening, discussing, and talking through ideas. You remember what you heard better than what you saw. You probably think by talking things out, either with others or to yourself.

Podcasts are your friend. Lectures work for you. Reading silently might be less effective than reading aloud. When learning something new, you might need to hear it explained or explain it to someone else to really get it.`,

    howYouLearn: [
      "Listening to explanations and discussions",
      "Talking through concepts out loud",
      "Verbal repetition and mnemonic devices",
      "Hearing stories and examples",
      "Discussing ideas with others",
    ],

    strengths: [
      "Good at remembering verbal information",
      "Strong listening skills",
      "Can follow spoken instructions well",
      "Good at learning through discussion",
      "Often skilled at languages and music",
    ],

    challenges: [
      "Visual-only materials can be harder to retain",
      "May need to talk through problems (can seem like 'thinking out loud' too much)",
      "Quiet study environments might not be ideal",
      "Written instructions alone may not stick",
    ],

    signsThisIsYou: [
      "You remember conversations better than what you read",
      "You talk to yourself when figuring things out",
      "You can recall what someone said, word for word",
      "You prefer listening to podcasts over reading articles",
      "You often say 'let me talk this through"\",
      \"Background music or sounds can help you focus (or specific sounds distract you)\",
    ],

    howToUseThisApp: [
      \"Use voice input when talking to Gauge - speak instead of type\",
      \"Ask Gauge to explain concepts out loud (use voice response)\",
      \"Read the gauge descriptions aloud to yourself\",
      \"Discuss what you're learning with someone else\",
      \"Explain a gauge to a friend - teaching reinforces learning\",
      \"Use the guided breathing exercises with audio cues\",
    ],

    studyTips: [
      \"Record yourself explaining each gauge, then listen back\",
      \"Talk through the "When It's Low' descriptions out loud",
      "Discuss your insights with someone daily",
      "Create verbal mnemonics: 'Body, State, Emotion, Connection, Direction, Alignment'",
      "Use Gauge as a conversation partner to process your understanding",
    ],

    bestActivities: [
      "Talk to Gauge (conversation-based learning)",
      "Role Play (verbal practice)",
      "Breathing exercises (audio-guided)",
      "Communication Lab (verbal scripts)",
    ],
  },
  
  {
    id: 'reading-writing',
    emoji: '📝',
    name: 'Reading/Writing',
    color: '#4ADE80',
    tagline: 'You learn by reading and writing',
    
    description: `Reading/Writing learners process information best through text. You love reading - not just as consumption, but as learning. Taking notes helps you think. Writing things down, in your own words, cements understanding. You might read something multiple times, each pass deepening comprehension.

Lists, written instructions, and detailed text explanations work for you. You probably prefer email over phone calls. When you want to understand something deeply, you read about it. When you want to process something, you write about it.`,

    howYouLearn: [
      "Reading detailed explanations",
      "Writing notes and summaries in your own words",
      "Lists, written instructions, and definitions",
      "Re-reading and annotating",
      "Journaling and written reflection",
    ],

    strengths: [
      "Strong reading comprehension",
      "Good at written communication",
      "Can organize thoughts through writing",
      "Comfortable with detailed textual information",
      "Often good at research and analysis",
    ],

    challenges: [
      "May need more time to process verbal information",
      "Group discussions can feel too fast",
      "Visual-only or audio-only materials may not stick as well",
      "Might over-rely on notes rather than active practice",
    ],

    signsThisIsYou: [
      "You take extensive notes and review them",
      "You prefer reading instructions over watching videos",
      "You write to think - journaling, lists, notes to self",
      "You remember what you read better than what you heard or saw",
      "You often say 'let me write this down"\",
      \"You're the one who reads the entire manual\",
    ],

    howToUseThisApp: [
      \"Read through the full gauge content - the depth is there for you\",
      \"Use the journal regularly - writing processes emotions for you\",
      \"Take notes on what you"re learning about yourself",
      "Write summaries of each gauge in your own words",
      "Read the Human Manual lessons thoroughly - they're written for readers",
      "Create your own 'personal manual' with your patterns and insights",
    ],

    studyTips: [
      "Write out the 6 gauges and what each means to YOU",
      "Journal daily about which gauges were affected and why",
      "Create personal definitions for emotional terms",
      "Write scripts for difficult conversations before having them",
      "Summarize each section of the Human Manual after reading",
    ],

    bestActivities: [
      "Journal (writing-based processing)",
      "Human Manual lessons (text-rich)",
      "Discovery (reading-focused insights)",
      "Thought Lab (written examination of thoughts)",
    ],
  },
  
  {
    id: 'kinesthetic',
    emoji: '🤲',
    name: 'Kinesthetic',
    color: '#F87171',
    tagline: 'You learn by doing",
    
    description: `Kinesthetic learners process information best through physical experience, practice, and hands-on engagement. You learn by doing, not just reading or hearing. Your body is part of your thinking process. You might need to move while learning - pacing, fidgeting, or gesturing.

You probably hate long lectures. You want to try things, not just hear about them. Real-world application is how concepts become real for you. Simulation and practice trump theory every time.`,

    howYouLearn: [
      \"Hands-on practice and experimentation\",
      \"Physical movement while learning\",
      \"Real-world application and experience\",
      \"Role-playing and simulation\",
      \"Learning by doing, trial and error\",
    ],

    strengths: [
      \"Strong physical/body awareness\",
      \"Good at learning practical skills quickly\",
      \"Remember what they've done and experienced\",
      \"Often athletic or skilled with their hands\",
      \"Good at figuring things out through trial and error\",
    ],

    challenges: [
      \"Sitting still for long periods is hard\",
      \"Abstract concepts without practical application can feel pointless\",
      \"May be labeled "fidgety' or 'restless' in traditional settings",
      "Need opportunities to practice, not just observe",
    ],

    signsThisIsYou: [
      "You learn better when you can move or use your hands",
      "You remember experiences better than explanations",
      "You prefer to 'just try it" rather than read instructions\",
      \"You often gesture when explaining things\",
      \"You feel restless sitting through lectures or long readings\",
      \"You're aware of physical sensations - body tells you things\",
    ],

    howToUseThisApp: [
      \"DO the activities, don"t just read about them",
      "Body Scan - actually feel where tension is in your body",
      "Breathing exercises - actually do them, feel the difference",
      "Role Play - practice conversations, not just read scripts",
      "Move while learning - walk while listening to explanations",
      "Apply concepts immediately - check your gauges right now, not 'later"\",
    ],

    studyTips: [
      \"Walk while listening to Gauge explain things\",
      \"Do a gauge check-in after physical activity - notice the difference\",
      \"Practice the breathing techniques until they're automatic\",
      \"Role-play difficult conversations out loud, with movement\",
      \"Notice your body"s response to different emotions - hands-on discovery",
    ],

    bestActivities: [
      "Body Scan (physical awareness)",
      "Breathing exercises (physical practice)",
      "Role Play (experiential practice)",
      "Stress Check (body-based assessment)",
    ],
  },
];

export const LEARNING_STYLE_QUIZ = {
  intro: "Answer honestly - there are no right answers. Most people are a blend.",
  questions: [
    {
      question: "When learning how to use a new app, you prefer to:",
      options: [
        { text: "Watch a video tutorial", style: 'visual' },
        { text: "Have someone explain it to you", style: 'auditory' },
        { text: "Read the documentation", style: 'reading-writing' },
        { text: "Just start clicking around and figure it out", style: 'kinesthetic" },
      ]
    },
    {
      question: \"When you're upset, what helps most?\",
      options: [
        { text: \"Looking at pictures or nature\", style: "visual' },
        { text: "Talking to someone or listening to music", style: 'auditory' },
        { text: "Writing in a journal", style: 'reading-writing' },
        { text: "Going for a walk or doing something physical", style: 'kinesthetic' },
      ]
    },
    {
      question: "When giving directions, you typically:",
      options: [
        { text: "Draw a map or picture", style: 'visual' },
        { text: "Explain verbally with lots of detail", style: 'auditory' },
        { text: "Write out step-by-step instructions", style: 'reading-writing' },
        { text: "Walk with them or gesture the route", style: 'kinesthetic' },
      ]
    },
    {
      question: "What do you remember best?",
      options: [
        { text: "Faces, images, what things looked like", style: 'visual' },
        { text: "Conversations, what was said, tones of voice", style: 'auditory' },
        { text: "What you read, notes you took", style: 'reading-writing' },
        { text: "Experiences, what you did, how things felt", style: 'kinesthetic' },
      ]
    },
    {
      question: "In a group project, you naturally gravitate toward:",
      options: [
        { text: "Creating the presentation or visual materials", style: 'visual' },
        { text: "Leading the discussion or presenting", style: 'auditory' },
        { text: "Writing the report or documentation", style: 'reading-writing' },
        { text: "Building the prototype or doing the hands-on work", style: 'kinesthetic' },
      ]
    },
    {
      question: "When you have a problem to solve, you:",
      options: [
        { text: "Visualize different scenarios in your head", style: 'visual' },
        { text: "Talk it through with yourself or someone else", style: 'auditory' },
        { text: "Write out pros/cons lists or notes", style: 'reading-writing' },
        { text: "Try different approaches and see what works", style: 'kinesthetic' },
      ]
    },
    {
      question: "When meeting new people, you tend to remember their:",
      options: [
        { text: "Face and what they were wearing", style: 'visual' },
        { text: "Voice and what they said", style: 'auditory' },
        { text: "Name if you wrote it down or saw it written", style: 'reading-writing' },
        { text: "Handshake, energy, and how the interaction felt", style: 'kinesthetic' },
      ]
    },
    {
      question: "The best way to study for you is:",
      options: [
        { text: "Diagrams, charts, and color-coded notes", style: 'visual' },
        { text: "Recording notes and listening, or study groups", style: 'auditory' },
        { text: "Reading and re-reading, writing summaries", style: 'reading-writing' },
        { text: "Practice tests, flashcards, or moving while reviewing", style: 'kinesthetic" },
      ]
    },
  ]
};

export const MULTI_STYLE_TIPS = {
  headline: \"Most People Are a Blend\",
  content: `Pure learning styles are rare. Most people are primarily one style with secondary preferences. You might be Visual-Kinesthetic, or Auditory-Reading, or some other combination.

Use your primary style for initial learning. Use secondary styles to reinforce.

When something isn't sticking, try a different style"s approach. The concept might make sense when you hear it instead of read it, or when you do it instead of watch it.

The goal isn"t to label yourself - it's to have more tools for actually learning and retaining what matters.`,
  
  combiningStyles: [
    \"Visual + Kinesthetic: Draw while moving, watch demonstrations then practice immediately\",
    \"Auditory + Reading: Read aloud, discuss what you"ve read, write after listening",
    "Visual + Auditory: Watch videos with commentary, explain your visualizations out loud",
    "Reading + Kinesthetic: Write notes by hand, read while walking, immediately apply what you read",
  ]
};
