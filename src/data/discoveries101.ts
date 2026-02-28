/**
 * 101 Discoveries - Bite-sized psychological insights
 * Grounded in research from Kalat, Carlson, Porges, Damasio, and contemporary psychology
 */

export type DiscoveryCategory = 
  | 'Body'      // Physical sensations, nervous system, somatic awareness
  | 'State'     // Mental states, arousal, energy levels
  | 'Emotion'   // Feelings, affect, emotional processing
  | 'Connection'// Relationships, attachment, social bonds
  | 'Direction' // Purpose, goals, motivation
  | 'Alignment' // Values, authenticity, integration

export interface Discovery101 {
  code: string;
  title: string;
  insight: string;
  source?: string;
  category: DiscoveryCategory;
}

export const DISCOVERIES_101: Discovery101[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // BODY (D001-D017) - The nervous system, physical sensations, somatic wisdom
  // ═══════════════════════════════════════════════════════════════════════════
  {
    code: 'D001',
    title: 'Your Body Keeps Score',
    insight: 'Your nervous system can\'t tell the difference between a real threat and an imagined one. The fear you feel thinking about a presentation is physiologically identical to fear of a predator.',
    source: 'LeDoux, J. (1996). The Emotional Brain; van der Kolk, B. (2014). The Body Keeps the Score',
    category: 'Body',
  },
  {
    code: 'D002',
    title: 'The 90-Second Rule',
    insight: 'The chemical lifespan of an emotion in your body is about 90 seconds. Anything longer means you\'re re-triggering yourself with your thoughts.',
    source: 'Taylor, J.B. (2006). My Stroke of Insight',
    category: 'Body',
  },
  {
    code: 'D003',
    title: 'Breathe to Change State',
    insight: 'Slow exhales activate your vagus nerve and shift you from fight-or-flight to rest-and-digest. Your breath is the only autonomic function you can consciously control.',
    source: 'Porges, S. (2011). The Polyvagal Theory',
    category: 'Body',
  },
  {
    code: 'D004',
    title: 'Gut Feelings Are Real',
    insight: 'Your gut has 100 million neurons and makes 95% of your serotonin. "Trust your gut" isn\'t metaphor—it\'s neuroscience.',
    source: 'Mayer, E. (2016). The Mind-Gut Connection',
    category: 'Body',
  },
  {
    code: 'D005',
    title: 'Posture Shapes Mood',
    insight: 'Slumped posture increases cortisol and decreases testosterone. Standing tall for two minutes changes your hormones before any thought intervenes.',
    source: 'Carney, D. et al. (2010). Psychological Science; Cuddy, A. (2015). Presence',
    category: 'Body',
  },
  {
    code: 'D006',
    title: 'Your Face Leads Your Feelings',
    insight: 'Facial expressions don\'t just reflect emotions—they generate them. Forcing a smile (even fake) activates the same neural pathways as genuine joy.',
    source: 'Strack, F. et al. (1988). Journal of Personality and Social Psychology',
    category: 'Body',
  },
  {
    code: 'D007',
    title: 'Cold Resets the System',
    insight: 'Cold exposure triggers norepinephrine release, improving mood, focus, and resilience. A 30-second cold shower activates your body\'s reset button.',
    source: 'Shevchuk, N. (2008). Medical Hypotheses',
    category: 'Body',
  },
  {
    code: 'D008',
    title: 'Movement Is Medicine',
    insight: 'A single bout of exercise is as effective as antidepressants for mild depression—without the side effects. Your body was built to move.',
    source: 'Blumenthal, J. et al. (1999). Archives of Internal Medicine',
    category: 'Body',
  },
  {
    code: 'D009',
    title: 'Sleep Is Non-Negotiable',
    insight: 'One night of poor sleep impairs emotional regulation as much as alcohol intoxication. Your amygdala goes haywire without rest.',
    source: 'Walker, M. (2017). Why We Sleep',
    category: 'Body',
  },
  {
    code: 'D010',
    title: 'Tension Tells the Truth',
    insight: 'Your body tenses before your mind knows you\'re stressed. Chronic shoulder tension, jaw clenching, or shallow breathing are warning lights on your dashboard.',
    source: 'Gendlin, E. (1978). Focusing',
    category: 'Body',
  },
  {
    code: 'D011',
    title: 'The Vagus Nerve Highway',
    insight: '80% of vagus nerve fibers carry information from body to brain, not brain to body. Your body is constantly informing your mind—learn to listen.',
    source: 'Porges, S. (2011). The Polyvagal Theory',
    category: 'Body',
  },
  {
    code: 'D012',
    title: 'Freeze Is Not Failure',
    insight: 'When fight or flight won\'t work, your nervous system chooses freeze. It\'s not weakness—it\'s an ancient survival strategy. Coming out of freeze takes gentleness, not force.',
    source: 'Levine, P. (1997). Waking the Tiger',
    category: 'Body',
  },
  {
    code: 'D013',
    title: 'Heart Coherence',
    insight: 'When your heart rhythm becomes smooth and wave-like (coherent), your brain functions better. Slow breathing creates this coherence within seconds.',
    source: 'McCraty, R. (2015). HeartMath Institute',
    category: 'Body',
  },
  {
    code: 'D014',
    title: 'Somatic Memory',
    insight: 'Your body stores memories your mind has forgotten. A smell, a touch, or a posture can unlock experiences buried for decades.',
    source: 'van der Kolk, B. (2014). The Body Keeps the Score',
    category: 'Body',
  },
  {
    code: 'D015',
    title: 'Interoception Intelligence',
    insight: 'People who can accurately feel their heartbeat make better decisions. Body awareness isn\'t woo—it\'s a measurable intelligence.',
    source: 'Critchley, H. & Garfinkel, S. (2017). Trends in Cognitive Sciences',
    category: 'Body',
  },
  {
    code: 'D016',
    title: 'The Startle Response',
    insight: 'Your startle reflex bypasses conscious thought entirely. That\'s why you flinch before you know why. Your body protects you faster than thinking ever could.',
    source: 'Kalat, J. (2018). Biological Psychology',
    category: 'Body',
  },
  {
    code: 'D017',
    title: 'Orienting Calms',
    insight: 'When anxious, slowly looking around the room activates your orienting response, signaling safety to your nervous system. Animals do this instinctively after threat.',
    source: 'Levine, P. (2010). In an Unspoken Voice',
    category: 'Body',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE (D018-D034) - Mental states, arousal, energy, attention
  // ═══════════════════════════════════════════════════════════════════════════
  {
    code: 'D018',
    title: 'The Window of Tolerance',
    insight: 'You have a zone where you can think clearly and respond flexibly. Too activated (panic) or too shut down (numb), and you lose access to your best self.',
    source: 'Siegel, D. (1999). The Developing Mind',
    category: 'State',
  },
  {
    code: 'D019',
    title: 'Stress Isn\'t Bad',
    insight: 'Stress only damages health when you believe it will. People who see stress as enhancing actually have better outcomes than those trying to avoid it.',
    source: 'Crum, A. et al. (2013). Journal of Personality and Social Psychology',
    category: 'State',
  },
  {
    code: 'D020',
    title: 'Attention Is a Muscle',
    insight: 'Every time you notice your mind wandered and bring it back, you\'re doing a rep. Focus isn\'t a gift—it\'s trained.',
    source: 'Goleman, D. (2013). Focus',
    category: 'State',
  },
  {
    code: 'D021',
    title: 'Flow State',
    insight: 'Peak performance happens when challenge slightly exceeds skill. Too easy breeds boredom; too hard breeds anxiety. The sweet spot is flow.',
    source: 'Csikszentmihalyi, M. (1990). Flow',
    category: 'State',
  },
  {
    code: 'D022',
    title: 'Your Default Mode',
    insight: 'When you\'re not focused on a task, your brain defaults to self-referential thinking—often worrying or ruminating. Mindfulness quiets this "default mode network."',
    source: 'Raichle, M. (2015). Annual Review of Neuroscience',
    category: 'State',
  },
  {
    code: 'D023',
    title: 'Decision Fatigue',
    insight: 'Willpower depletes like a battery. The more decisions you make, the worse they get. That\'s why you snack badly at night—not weakness, but depletion.',
    source: 'Baumeister, R. (2011). Willpower',
    category: 'State',
  },
  {
    code: 'D024',
    title: 'The Zeigarnik Effect',
    insight: 'Unfinished tasks occupy mental RAM. That nagging feeling isn\'t neurotic—your brain literally can\'t let go until closure. Write it down to release it.',
    source: 'Zeigarnik, B. (1927). Psychologische Forschung',
    category: 'State',
  },
  {
    code: 'D025',
    title: 'Ultradian Rhythms',
    insight: 'Your brain cycles through 90-minute focus periods, then needs rest. Fighting this rhythm doesn\'t make you productive—it makes you depleted.',
    source: 'Peretz, L. & Lavie, P. (1992). Sleep',
    category: 'State',
  },
  {
    code: 'D026',
    title: 'Cognitive Load',
    insight: 'Working memory holds about 4 items at once. Trying to juggle more creates the scattered, overwhelmed feeling. Offload to paper or close some mental tabs.',
    source: 'Cowan, N. (2001). Behavioral and Brain Sciences',
    category: 'State',
  },
  {
    code: 'D027',
    title: 'State-Dependent Memory',
    insight: 'You remember things better in the state you learned them. Studied while calm? Test while calm. This is why "I knew it yesterday" feels so frustrating.',
    source: 'Godden, D. & Baddeley, A. (1975). British Journal of Psychology',
    category: 'State',
  },
  {
    code: 'D028',
    title: 'The Negativity Bias',
    insight: 'Bad experiences register more strongly than good ones—about 5:1. Evolution prioritized threat detection. You\'re not pessimistic; you\'re human.',
    source: 'Baumeister, R. et al. (2001). Review of General Psychology',
    category: 'State',
  },
  {
    code: 'D029',
    title: 'Arousal and Performance',
    insight: 'Performance peaks at moderate arousal. Too calm and you\'re sluggish; too wired and you choke. Find your optimal activation level for each task.',
    source: 'Yerkes, R. & Dodson, J. (1908). Journal of Comparative Neurology',
    category: 'State',
  },
  {
    code: 'D030',
    title: 'Micro-Recovery',
    insight: 'Brief mental breaks (even 40 seconds of looking at nature) restore attention. You don\'t need a vacation—you need micro-doses of rest.',
    source: 'Lee, K. et al. (2015). Journal of Environmental Psychology',
    category: 'State',
  },
  {
    code: 'D031',
    title: 'The Spotlight Effect',
    insight: 'You overestimate how much others notice your mistakes. That embarrassing moment you replay? Most people didn\'t notice or forgot within minutes.',
    source: 'Gilovich, T. et al. (2000). Journal of Personality and Social Psychology',
    category: 'State',
  },
  {
    code: 'D032',
    title: 'Affect Heuristic',
    insight: 'Your current mood colors all your judgments. Feeling bad? Everything seems risky and bleak. This isn\'t truth—it\'s affect bleeding into perception.',
    source: 'Slovic, P. et al. (2007). European Journal of Operational Research',
    category: 'State',
  },
  {
    code: 'D033',
    title: 'Hypofrontality',
    insight: 'Intense stress shuts down your prefrontal cortex—the part that plans, reasons, and regulates. That\'s why you can\'t "think your way out" of panic.',
    source: 'Arnsten, A. (2009). Nature Reviews Neuroscience',
    category: 'State',
  },
  {
    code: 'D034',
    title: 'The Present Moment',
    insight: 'A wandering mind is an unhappy mind. People are happiest when fully present, even during mundane activities. Attention is the currency of well-being.',
    source: 'Killingsworth, M. & Gilbert, D. (2010). Science',
    category: 'State',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EMOTION (D035-D051) - Feelings, affect, emotional processing
  // ═══════════════════════════════════════════════════════════════════════════
  {
    code: 'D035',
    title: 'Emotions Are Data',
    insight: 'Emotions aren\'t problems to solve—they\'re information about your needs. Anger says a boundary was crossed. Fear says something feels threatening. Listen first.',
    source: 'Damasio, A. (1994). Descartes\' Error',
    category: 'Emotion',
  },
  {
    code: 'D036',
    title: 'Name It to Tame It',
    insight: 'Putting feelings into words reduces amygdala activation by up to 50%. Naming an emotion is the first step to regulating it.',
    source: 'Lieberman, M. et al. (2007). Psychological Science',
    category: 'Emotion',
  },
  {
    code: 'D037',
    title: 'Emotional Granularity',
    insight: 'People with richer emotional vocabularies handle life better. "Bad" is vague. "Disappointed, overlooked, and a bit resentful" is actionable.',
    source: 'Barrett, L.F. (2017). How Emotions Are Made',
    category: 'Emotion',
  },
  {
    code: 'D038',
    title: 'All Emotions Are Valid',
    insight: 'There are no "bad" emotions—only difficult ones. Shame, envy, rage all carry information. Judging your feelings adds suffering to pain.',
    source: 'Neff, K. (2011). Self-Compassion',
    category: 'Emotion',
  },
  {
    code: 'D039',
    title: 'Emotions Are Contagious',
    insight: 'You catch emotions from others within milliseconds, before conscious awareness. Choose your emotional environments as carefully as your physical ones.',
    source: 'Hatfield, E. et al. (1993). Emotional Contagion',
    category: 'Emotion',
  },
  {
    code: 'D040',
    title: 'The Sadness Function',
    insight: 'Sadness slows you down, signals others you need support, and promotes reflection. It\'s not a malfunction—it\'s a recalibration.',
    source: 'Forgas, J. (2013). Current Directions in Psychological Science',
    category: 'Emotion',
  },
  {
    code: 'D041',
    title: 'Anxiety Is Future-Focused',
    insight: 'Anxiety lives in anticipation, never the present moment. When you\'re anxious, you\'re time-traveling to a future that may never arrive.',
    source: 'Barlow, D. (2002). Anxiety and Its Disorders',
    category: 'Emotion',
  },
  {
    code: 'D042',
    title: 'Anger Protects',
    insight: 'Underneath most anger is hurt, fear, or helplessness. Anger feels powerful because vulnerability feels dangerous. What\'s the anger protecting?',
    source: 'Hendricks, G. (2001). Five Wishes',
    category: 'Emotion',
  },
  {
    code: 'D043',
    title: 'Guilt vs. Shame',
    insight: 'Guilt says "I did something bad." Shame says "I am bad." Guilt motivates repair; shame motivates hiding. Know the difference.',
    source: 'Brown, B. (2010). The Gifts of Imperfection',
    category: 'Emotion',
  },
  {
    code: 'D044',
    title: 'Emotional Reappraisal',
    insight: 'Reinterpreting a situation changes the emotion it generates. "This is terrifying" becomes "This is exciting." Same arousal, different meaning, different feeling.',
    source: 'Gross, J. (2014). Handbook of Emotion Regulation',
    category: 'Emotion',
  },
  {
    code: 'D045',
    title: 'The Peak-End Rule',
    insight: 'You judge experiences by their most intense moment and how they end—not the average. A painful procedure with a gentle ending is remembered better.',
    source: 'Kahneman, D. (2011). Thinking, Fast and Slow',
    category: 'Emotion',
  },
  {
    code: 'D046',
    title: 'Affect Labeling',
    insight: 'Simply describing what you feel ("I notice I\'m feeling anxious") activates the prefrontal cortex and calms the amygdala. Observation interrupts reaction.',
    source: 'Creswell, J. et al. (2007). Psychosomatic Medicine',
    category: 'Emotion',
  },
  {
    code: 'D047',
    title: 'Gratitude Rewires',
    insight: 'Practicing gratitude literally changes your brain, increasing activity in areas linked to dopamine and motivation. It\'s not just positive thinking—it\'s neuroplasticity.',
    source: 'Emmons, R. (2007). Thanks!',
    category: 'Emotion',
  },
  {
    code: 'D048',
    title: 'Suppression Backfires',
    insight: 'Pushing emotions down makes them stronger. Suppressed feelings leak out sideways—in snapping, numbing, or physical symptoms. Feel through, not around.',
    source: 'Wegner, D. (1994). Psychological Review',
    category: 'Emotion',
  },
  {
    code: 'D049',
    title: 'Emotions Have Lifespans',
    insight: 'Every emotion rises, peaks, and fades—if you let it. Resistance extends it; acceptance lets it move. Waves aren\'t stopped; they\'re ridden.',
    source: 'Hayes, S. (2004). Get Out of Your Mind and Into Your Life',
    category: 'Emotion',
  },
  {
    code: 'D050',
    title: 'Mixed Emotions',
    insight: 'You can feel contradictory emotions simultaneously—relief and guilt, love and resentment. This isn\'t confusion; it\'s complexity. You contain multitudes.',
    source: 'Larsen, J. et al. (2001). Journal of Personality and Social Psychology',
    category: 'Emotion',
  },
  {
    code: 'D051',
    title: 'Emotions Inform Action',
    insight: 'Each emotion comes with an action tendency: fear prompts escape, anger prompts confrontation, love prompts approach. Notice the urge before acting on it.',
    source: 'Frijda, N. (1986). The Emotions',
    category: 'Emotion',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONNECTION (D052-D068) - Relationships, attachment, social bonds
  // ═══════════════════════════════════════════════════════════════════════════
  {
    code: 'D052',
    title: 'Loneliness Isn\'t About Being Alone',
    insight: 'Loneliness is feeling unseen, not being by yourself. You can be lonely in a crowd and perfectly content in solitude. It\'s about connection quality, not quantity.',
    source: 'Cacioppo, J. (2008). Loneliness',
    category: 'Connection',
  },
  {
    code: 'D053',
    title: 'Co-Regulation',
    insight: 'We regulate each other\'s nervous systems. A calm presence calms you; an anxious one activates you. Relationships are regulatory systems.',
    source: 'Porges, S. (2011). The Polyvagal Theory',
    category: 'Connection',
  },
  {
    code: 'D054',
    title: 'Attachment Styles',
    insight: 'How you were cared for as a child shapes how you connect as an adult. Anxious, avoidant, or secure—these patterns can be understood and gradually changed.',
    source: 'Bowlby, J. (1988). A Secure Base',
    category: 'Connection',
  },
  {
    code: 'D055',
    title: 'The Bid for Connection',
    insight: 'Small moments matter more than grand gestures. Responding to your partner\'s "look at this sunset" is a bid for connection. Turning toward builds trust; turning away erodes it.',
    source: 'Gottman, J. (2011). The Science of Trust',
    category: 'Connection',
  },
  {
    code: 'D056',
    title: 'Vulnerability Is Strength',
    insight: 'Braving connection requires showing parts you might prefer to hide. Vulnerability isn\'t weakness—it\'s the birthplace of intimacy, creativity, and belonging.',
    source: 'Brown, B. (2012). Daring Greatly',
    category: 'Connection',
  },
  {
    code: 'D057',
    title: 'Mirror Neurons',
    insight: 'Your brain simulates what it observes in others. When you watch someone in pain, pain circuits fire in your brain. Empathy is neurologically real.',
    source: 'Rizzolatti, G. & Craighero, L. (2004). Annual Review of Neuroscience',
    category: 'Connection',
  },
  {
    code: 'D058',
    title: 'Social Pain Is Real Pain',
    insight: 'Rejection activates the same brain regions as physical injury. "Hurt feelings" isn\'t metaphor—the pain is neurologically genuine.',
    source: 'Eisenberger, N. (2012). Psychosomatic Medicine',
    category: 'Connection',
  },
  {
    code: 'D059',
    title: 'The Need to Belong',
    insight: 'Belonging isn\'t a nice-to-have—it\'s a survival need. Social isolation has the health impact of smoking 15 cigarettes a day.',
    source: 'Holt-Lunstad, J. et al. (2015). Perspectives on Psychological Science',
    category: 'Connection',
  },
  {
    code: 'D060',
    title: 'Repair Matters More',
    insight: 'Conflict isn\'t the relationship killer—failure to repair is. How you come back together after rupture defines the bond more than avoiding fights.',
    source: 'Gottman, J. (1999). The Marriage Clinic',
    category: 'Connection',
  },
  {
    code: 'D061',
    title: 'Touch Heals',
    insight: 'Physical touch releases oxytocin, lowers cortisol, and regulates heart rate. A 20-second hug is a nervous system reset.',
    source: 'Field, T. (2014). Touch',
    category: 'Connection',
  },
  {
    code: 'D062',
    title: 'You Are the Average',
    insight: 'You become the average of the five people you spend the most time with. Not just beliefs—emotional habits, stress responses, even health behaviors.',
    source: 'Christakis, N. & Fowler, J. (2009). Connected',
    category: 'Connection',
  },
  {
    code: 'D063',
    title: 'Listening Is Rare',
    insight: 'Most people listen to respond, not to understand. Full presence—without planning your reply—is one of the greatest gifts you can give.',
    source: 'Rogers, C. (1980). A Way of Being',
    category: 'Connection',
  },
  {
    code: 'D064',
    title: 'Secure Base',
    insight: 'Children explore the world confidently when they know they can return to safety. Adults do too. A secure relationship enables—not limits—autonomy.',
    source: 'Bowlby, J. (1988). A Secure Base',
    category: 'Connection',
  },
  {
    code: 'D065',
    title: 'Attunement',
    insight: 'Feeling understood matters more than being agreed with. Attunement—sensing and responding to another\'s emotional state—is the core of connection.',
    source: 'Siegel, D. (2012). The Developing Mind (2nd ed.)',
    category: 'Connection',
  },
  {
    code: 'D066',
    title: 'The 5:1 Ratio',
    insight: 'Stable relationships need five positive interactions for every negative one. Below that ratio, the relationship erodes regardless of intensity.',
    source: 'Gottman, J. (1994). What Predicts Divorce',
    category: 'Connection',
  },
  {
    code: 'D067',
    title: 'Projection',
    insight: 'What irritates you most in others often reflects something you haven\'t accepted in yourself. Triggers are teachers wearing frustrating disguises.',
    source: 'Jung, C.G. (1951). Aion',
    category: 'Connection',
  },
  {
    code: 'D068',
    title: 'Empathy Has Limits',
    insight: 'Empathy without boundaries leads to burnout. You can care deeply and still protect your own nervous system. Compassion includes self.',
    source: 'Klimecki, O. et al. (2014). Cerebral Cortex',
    category: 'Connection',
  },
  {
    code: 'D102',
    title: 'How You Respond to Good News',
    insight: 'How you respond to good news matters more than how you respond to bad news. Enthusiastic engagement that asks questions ("That\'s amazing! Tell me more!") builds intimacy. Passive acknowledgment ("That\'s nice") actually erodes connection over time.',
    source: 'Gable, S. et al. (2004). What Do You Do When Things Go Right? Journal of Personality and Social Psychology',
    category: 'Connection',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DIRECTION (D069-D085) - Purpose, goals, motivation, meaning
  // ═══════════════════════════════════════════════════════════════════════════
  {
    code: 'D069',
    title: 'Purpose Extends Life',
    insight: 'People with a strong sense of purpose live longer, independent of age, gender, or income. Meaning isn\'t a luxury—it\'s medicine.',
    source: 'Hill, P. & Turiano, N. (2014). Psychological Science',
    category: 'Direction',
  },
  {
    code: 'D070',
    title: 'Intrinsic Beats Extrinsic',
    insight: 'Doing something for its own sake (mastery, curiosity, meaning) sustains motivation better than rewards or punishment. External carrots eventually fail.',
    source: 'Deci, E. & Ryan, R. (2000). Self-Determination Theory',
    category: 'Direction',
  },
  {
    code: 'D071',
    title: 'Goals Change You',
    insight: 'The pursuit of a goal shapes who you become—often more than achieving it. Process builds character; outcomes are just evidence.',
    source: 'Dweck, C. (2006). Mindset',
    category: 'Direction',
  },
  {
    code: 'D072',
    title: 'The Progress Principle',
    insight: 'Small wins matter more than big achievements for daily motivation. Meaningful progress—even incremental—is the most powerful motivator.',
    source: 'Amabile, T. & Kramer, S. (2011). The Progress Principle',
    category: 'Direction',
  },
  {
    code: 'D073',
    title: 'Autonomy Is Essential',
    insight: 'Humans need to feel in control of their choices. Micromanagement kills motivation not because the tasks are bad, but because choice was removed.',
    source: 'Deci, E. & Ryan, R. (2000). Self-Determination Theory',
    category: 'Direction',
  },
  {
    code: 'D074',
    title: 'Meaning Through Suffering',
    insight: '"He who has a why to live can bear almost any how." Purpose doesn\'t eliminate suffering—it gives it structure and dignity.',
    source: 'Frankl, V. (1946). Man\'s Search for Meaning',
    category: 'Direction',
  },
  {
    code: 'D075',
    title: 'Implementation Intentions',
    insight: '"I will [behavior] at [time] in [location]" doubles follow-through compared to vague intentions. Specificity is the bridge from wanting to doing.',
    source: 'Gollwitzer, P. (1999). American Psychologist',
    category: 'Direction',
  },
  {
    code: 'D076',
    title: 'Values as Compass',
    insight: 'When you\'re lost, values point the way. Not "what do I want?" but "who do I want to be?" is the question that cuts through confusion.',
    source: 'Harris, R. (2008). The Happiness Trap',
    category: 'Direction',
  },
  {
    code: 'D077',
    title: 'Motivation Follows Action',
    insight: 'You don\'t need to feel motivated to start. Action generates the motivation that action requires. Waiting for motivation is the trap.',
    source: 'Pychyl, T. (2013). Solving the Procrastination Puzzle',
    category: 'Direction',
  },
  {
    code: 'D078',
    title: 'The Hedonic Treadmill',
    insight: 'Achievements provide a boost, then you adapt. Lasting fulfillment comes from the journey, relationships, and meaning—not the next milestone.',
    source: 'Lyubomirsky, S. (2007). The How of Happiness',
    category: 'Direction',
  },
  {
    code: 'D079',
    title: 'Death as Advisor',
    insight: 'Memento mori: remembering you will die clarifies what matters. Mortality awareness reduces anxiety and increases meaning-seeking.',
    source: 'Solomon, S. et al. (2015). The Worm at the Core',
    category: 'Direction',
  },
  {
    code: 'D080',
    title: 'Growth Mindset',
    insight: 'Believing abilities can develop (growth mindset) leads to greater persistence and achievement than believing they\'re fixed. Effort is the signal, not the problem.',
    source: 'Dweck, C. (2006). Mindset',
    category: 'Direction',
  },
  {
    code: 'D081',
    title: 'The Calling',
    insight: 'People who view work as a calling—not a job or career—report higher life satisfaction regardless of profession. It\'s the orientation, not the occupation.',
    source: 'Wrzesniewski, A. et al. (1997). Journal of Research in Personality',
    category: 'Direction',
  },
  {
    code: 'D082',
    title: 'Ikigai',
    insight: 'The Japanese concept of ikigai: your reason for getting up in the morning. It sits at the intersection of what you love, what you\'re good at, what the world needs, and what you can be paid for.',
    source: 'García, H. & Miralles, F. (2016). Ikigai',
    category: 'Direction',
  },
  {
    code: 'D083',
    title: 'Fear of Success',
    insight: 'Sometimes self-sabotage protects you from the unknown demands of success. Fear of failure is obvious; fear of success hides in the shadows.',
    source: 'Tresemer, D. (1977). Fear of Success',
    category: 'Direction',
  },
  {
    code: 'D084',
    title: 'Temporal Discounting',
    insight: 'Your brain undervalues future rewards compared to immediate ones. That\'s why you scroll instead of exercise. Making future consequences vivid fights this bias.',
    source: 'Ainslie, G. (2001). Breakdown of Will',
    category: 'Direction',
  },
  {
    code: 'D085',
    title: 'Post-Traumatic Growth',
    insight: 'Struggle can catalyze growth. Many people report greater meaning, closer relationships, and new possibilities after crisis—not despite the pain, but through it.',
    source: 'Tedeschi, R. & Calhoun, L. (2004). Psychological Inquiry',
    category: 'Direction',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ALIGNMENT (D086-D101) - Values, authenticity, integration, wholeness
  // ═══════════════════════════════════════════════════════════════════════════
  {
    code: 'D086',
    title: 'Cognitive Dissonance',
    insight: 'When your actions contradict your beliefs, your mind experiences discomfort. Often, beliefs change to match actions rather than the reverse. Watch what you do.',
    source: 'Festinger, L. (1957). A Theory of Cognitive Dissonance',
    category: 'Alignment',
  },
  {
    code: 'D087',
    title: 'The True Self',
    insight: 'People who feel authentic—acting in line with their values—show better well-being, less stress, and stronger relationships. Inauthenticity has a cost.',
    source: 'Kernis, M. & Goldman, B. (2006). Handbook of Authenticity',
    category: 'Alignment',
  },
  {
    code: 'D088',
    title: 'Values Affirmation',
    insight: 'Reflecting on your core values before a stressful task buffers cortisol and improves performance. Knowing who you are protects you.',
    source: 'Creswell, J. et al. (2005). Psychological Science',
    category: 'Alignment',
  },
  {
    code: 'D089',
    title: 'The Shadow',
    insight: 'What you deny in yourself doesn\'t disappear—it goes underground. Integrating your shadow (rejected traits) makes you more whole, not less acceptable.',
    source: 'Jung, C.G. (1951). Aion',
    category: 'Alignment',
  },
  {
    code: 'D090',
    title: 'Integrity Is Health',
    insight: 'Living in alignment with your values reduces anxiety, increases energy, and improves relationships. Integrity isn\'t just moral—it\'s physiological.',
    source: 'Peterson, C. & Seligman, M. (2004). Character Strengths and Virtues',
    category: 'Alignment',
  },
  {
    code: 'D091',
    title: 'Self-Concordance',
    insight: 'Goals that align with your authentic interests are pursued more persistently and yield more satisfaction. Not all goals are equal—some are really yours.',
    source: 'Sheldon, K. & Elliot, A. (1999). Journal of Personality and Social Psychology',
    category: 'Alignment',
  },
  {
    code: 'D092',
    title: 'Values vs. Goals',
    insight: 'Goals can be achieved; values can only be lived. A goal is "run a marathon." A value is "health matters." Goals end; values guide.',
    source: 'Hayes, S. (2004). Get Out of Your Mind and Into Your Life',
    category: 'Alignment',
  },
  {
    code: 'D093',
    title: 'The Comparing Mind',
    insight: 'Comparison is the thief of joy—and accuracy. Others show their highlights; you feel your behind-the-scenes. The comparison is rigged.',
    source: 'Festinger, L. (1954). Social Comparison Theory',
    category: 'Alignment',
  },
  {
    code: 'D094',
    title: 'Self-Compassion',
    insight: 'Treating yourself with kindness during failure—not harsh criticism—increases resilience and motivation. Self-compassion isn\'t soft; it\'s effective.',
    source: 'Neff, K. (2011). Self-Compassion',
    category: 'Alignment',
  },
  {
    code: 'D095',
    title: 'Character Strengths',
    insight: 'Using your signature strengths (the traits most natural and energizing) increases engagement, meaning, and well-being. Know your strengths—then use them.',
    source: 'Peterson, C. & Seligman, M. (2004). Character Strengths and Virtues',
    category: 'Alignment',
  },
  {
    code: 'D096',
    title: 'The Impostor Phenomenon',
    insight: 'Feeling like a fraud despite evidence of competence is nearly universal in achievers. The feeling doesn\'t mean you are one. Keep going.',
    source: 'Clance, P. & Imes, S. (1978). Psychotherapy',
    category: 'Alignment',
  },
  {
    code: 'D097',
    title: 'Wholeness Over Happiness',
    insight: 'Chasing constant happiness creates its own suffering. Integration—accepting all parts of yourself and your experience—leads to a deeper kind of well-being.',
    source: 'Jung, C.G. (1954). The Practice of Psychotherapy',
    category: 'Alignment',
  },
  {
    code: 'D098',
    title: 'Boundaries Are Self-Respect',
    insight: 'Saying no to what violates your values is saying yes to yourself. Boundaries aren\'t selfish—they\'re the architecture of a life that works.',
    source: 'Cloud, H. & Townsend, J. (1992). Boundaries',
    category: 'Alignment',
  },
  {
    code: 'D099',
    title: 'Self-Acceptance',
    insight: 'Unconditional positive self-regard doesn\'t mean approving of all your actions. It means your worth isn\'t contingent on performance. You are enough.',
    source: 'Rogers, C. (1961). On Becoming a Person',
    category: 'Alignment',
  },
  {
    code: 'D100',
    title: 'The Inner Critic',
    insight: 'That harsh inner voice often developed to protect you. It\'s outdated software, not truth. You can thank it for trying and choose differently.',
    source: 'Schwartz, R. (1995). Internal Family Systems Therapy',
    category: 'Alignment',
  },
  {
    code: 'D101',
    title: 'Know Thyself',
    insight: 'The ancient Greeks carved "Know Thyself" above the Oracle at Delphi. Two thousand years later, it remains the most important work a human can do.',
    source: 'Delphic Maxims; Plato, Apology',
    category: 'Alignment',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_EMOJI: Record<DiscoveryCategory, string> = {
  Body: '🫀',
  State: '🧠',
  Emotion: '💫',
  Connection: '🤝',
  Direction: '🧭',
  Alignment: '⚖️',
};

export function getCategoryEmoji(category: DiscoveryCategory): string {
  return CATEGORY_EMOJI[category];
}

export function getDiscoveryByCode(code: string): Discovery101 | undefined {
  return DISCOVERIES_101.find(d => d.code === code);
}

export function getDiscoveriesByCategory(category: DiscoveryCategory): Discovery101[] {
  return DISCOVERIES_101.filter(d => d.category === category);
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Returns the discovery of the day based on day of year */
export function getDiscoveryOfTheDay(): Discovery101 {
  const day = getDayOfYear();
  return DISCOVERIES_101[day % DISCOVERIES_101.length];
}

/** Returns N random discoveries */
export function getRandomDiscoveries(count: number = 3): Discovery101[] {
  const shuffled = [...DISCOVERIES_101].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Returns discoveries matching a search term */
export function searchDiscoveries(query: string): Discovery101[] {
  const lower = query.toLowerCase();
  return DISCOVERIES_101.filter(d => 
    d.title.toLowerCase().includes(lower) ||
    d.insight.toLowerCase().includes(lower) ||
    d.category.toLowerCase().includes(lower)
  );
}
