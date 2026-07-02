/**
 * PHOSM Knowledge Base
 * Personal Health Operating System for the Mind
 * 
 * This isn't an intro to psychology app.
 * This is 22+ textbooks SYNTHESIZED into one usable system.
 * 
 * The 6 Gauges aren't arbitrary - they map to real science:
 * - Body → Biological psychology, health psychology
 * - State → Polyvagal theory, nervous system science
 * - Emotion → Affective neuroscience, emotion research
 * - Connection → Attachment theory, relationship science
 * - Direction → Cognitive psychology, decision science
 * - Alignment → Identity research, values psychology
 * 
 * Every insight in InGauge is grounded in peer-reviewed research,
 * but delivered in language humans actually use.
 */

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type GaugeType = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

export interface AcademicSource {
  id: string;
  author: string;
  title: string;
  shortTitle: string;
  primaryGauge: GaugeType; // Which gauge this source primarily informs
  keyInsight: string; // The ONE big idea from this source
}

export interface SynthesizedInsight {
  id: string;
  title: string; // Human-readable title
  keywords: string[]; // For matching to lesson content
  gauges: GaugeType[];
  
  // The synthesized truth (not just citations)
  coreTruth: string; // The integrated insight from multiple sources
  
  // Supporting sources (for credibility)
  sources: {
    sourceId: string;
    contribution: string; // What this source adds to the insight
  }[];
  
  // Practical application
  whatThisMeans: string; // For the user
  whatYouCanDo: string; // Actionable
}

// ═══════════════════════════════════════════════════════════
// THE KNOWLEDGE BASE
// 22 textbooks synthesized, not just cited
// ═══════════════════════════════════════════════════════════

export const ACADEMIC_SOURCES: AcademicSource[] = [
  // BODY GAUGE
  { id: 'kalat', author: 'James W. Kalat', title: 'Biological Psychology', shortTitle: 'Kalat', primaryGauge: 'body', keyInsight: 'Your brain runs on the same fuel as your body - sleep, food, water aren\'t optional.' },
  { id: 'carlson', author: 'Neil R. Carlson', title: 'Foundations of Physiological Psychology', shortTitle: 'Carlson', primaryGauge: 'body', keyInsight: 'Every thought and feeling has a physical basis - biology isn\'t separate from psychology.' },
  { id: 'pinel', author: 'John P.J. Pinel', title: 'Biopsychology', shortTitle: 'Pinel', primaryGauge: 'body', keyInsight: 'Your brain changes based on what you do - neuroplasticity means it\'s never too late.' },
  { id: 'sarafino', author: 'Edward P. Sarafino', title: 'Health Psychology', shortTitle: 'Sarafino', primaryGauge: 'body', keyInsight: 'Mind and body are one system - you can\'t fix one while ignoring the other.' },

  // STATE GAUGE
  { id: 'porges', author: 'Stephen Porges', title: 'The Polyvagal Theory', shortTitle: 'Porges', primaryGauge: 'state', keyInsight: 'Your nervous system decides if you\'re safe before your brain does - safety is biological.' },
  { id: 'van-der-kolk', author: 'Bessel van der Kolk', title: 'The Body Keeps the Score', shortTitle: 'van der Kolk', primaryGauge: 'state', keyInsight: 'Trauma lives in the body, not just memory - healing requires the body.' },
  
  // EMOTION GAUGE
  { id: 'barrett', author: 'Lisa Feldman Barrett', title: 'How Emotions Are Made', shortTitle: 'Barrett', primaryGauge: 'emotion', keyInsight: 'Emotions are constructed, not triggered - you have more control than you think.' },
  { id: 'barlow', author: 'David H. Barlow', title: 'Abnormal Psychology: An Integrative Approach', shortTitle: 'Barlow', primaryGauge: 'emotion', keyInsight: 'Mental health exists on a spectrum - everyone struggles, just in different ways.' },
  { id: 'beck', author: 'Aaron T. Beck', title: 'Cognitive Therapy and the Emotional Disorders', shortTitle: 'Beck', primaryGauge: 'emotion', keyInsight: 'Your thoughts shape your emotions - change the story, change the feeling.' },
  { id: 'ekman', author: 'Paul Ekman', title: 'Emotions Revealed', shortTitle: 'Ekman', primaryGauge: 'emotion', keyInsight: 'Emotions are universal but expression is learned - we all feel the same things.' },
  
  // CONNECTION GAUGE
  { id: 'bowlby', author: 'John Bowlby', title: 'Attachment and Loss', shortTitle: 'Bowlby', primaryGauge: 'connection', keyInsight: 'Your earliest relationships created your template for all relationships - but templates can be updated.' },
  { id: 'gottman', author: 'John Gottman', title: 'The Science of Trust', shortTitle: 'Gottman', primaryGauge: 'connection', keyInsight: 'Relationships succeed or fail based on how you repair, not whether you fight.' },
  { id: 'aronson', author: 'Elliot Aronson', title: 'The Social Animal', shortTitle: 'Aronson', primaryGauge: 'connection', keyInsight: 'We are wired for connection - isolation isn\'t just lonely, it\'s dangerous.' },
  { id: 'goldschneider', author: 'Frances K. Goldscheider', title: 'Family and Household Dynamics', shortTitle: 'Goldscheider', primaryGauge: 'connection', keyInsight: 'Family patterns repeat until someone breaks the cycle - you can be that person.' },
  
  // DIRECTION GAUGE
  { id: 'kahneman', author: 'Daniel Kahneman', title: 'Thinking, Fast and Slow', shortTitle: 'Kahneman', primaryGauge: 'direction', keyInsight: 'Your brain has two systems - learning when to trust each one is wisdom.' },
  { id: 'matlin', author: 'Margaret W. Matlin', title: 'Cognition', shortTitle: 'Matlin', primaryGauge: 'direction', keyInsight: 'How you think about thinking determines how well you navigate life.' },
  { id: 'goldstein', author: 'E. Bruce Goldstein', title: 'Cognitive Psychology', shortTitle: 'Goldstein', primaryGauge: 'direction', keyInsight: 'Attention is limited - what you focus on becomes your reality.' },
  
  // ALIGNMENT GAUGE
  { id: 'erikson', author: 'Erik Erikson', title: 'Identity and the Life Cycle', shortTitle: 'Erikson', primaryGauge: 'alignment', keyInsight: 'Identity isn\'t found, it\'s built - through exploration, commitment, and sometimes crisis.' },
  { id: 'funder', author: 'David C. Funder', title: 'The Personality Puzzle', shortTitle: 'Funder', primaryGauge: 'alignment', keyInsight: 'You are consistent AND changeable - personality is both trait and choice.' },
  
  // DEVELOPMENTAL (spans multiple gauges)
  { id: 'berger', author: 'Kathleen Stassen Berger', title: 'The Developing Person Through the Life Span', shortTitle: 'Berger', primaryGauge: 'alignment', keyInsight: 'Development doesn\'t stop at 25 - you\'re still becoming who you\'ll be.' },
  { id: 'siegler', author: 'Robert Siegler', title: 'How Children Develop', shortTitle: 'Siegler', primaryGauge: 'connection', keyInsight: 'What you learned as a child isn\'t your fault - but updating it is your responsibility.' },
  { id: 'myers-social', author: 'David G. Myers', title: 'Social Psychology', shortTitle: 'Myers', primaryGauge: 'connection', keyInsight: 'You are shaped by your environment more than you realize - and you shape it back.' },
];

// ═══════════════════════════════════════════════════════════
// SYNTHESIZED INSIGHTS
// Not citations - integrated truths from multiple sources
// ═══════════════════════════════════════════════════════════

export const SYNTHESIZED_INSIGHTS: SynthesizedInsight[] = [
  // ─────────────────────────────────────────────────────────
  // THE BODY-MIND CONNECTION
  // ─────────────────────────────────────────────────────────
  {
    id: 'body-runs-mind',
    title: 'Your Body Runs Your Mind',
    keywords: ['body', 'sleep', 'food', 'water', 'tired', 'hungry', 'physical', 'fuel', 'energy'],
    gauges: ['body', 'emotion', 'state'],
    coreTruth: 'Your mental state is downstream of your physical state. Sleep deprivation makes you emotionally volatile. Hunger mimics anxiety. Dehydration impairs thinking. You can\'t outthink biology - you have to work with it.',
    sources: [
      { sourceId: 'kalat', contribution: 'The brain uses 20% of your energy - it needs fuel.' },
      { sourceId: 'sarafino', contribution: 'Physical health predicts mental health outcomes.' },
      { sourceId: 'carlson', contribution: 'Neurotransmitters require proper nutrition to function.' },
    ],
    whatThisMeans: 'When you feel anxious, irritable, or foggy - check your body first. Did you sleep? Eat? Drink water? Move?',
    whatYouCanDo: 'Before analyzing your mood, run the body checklist. Fix the basics, then see what\'s left.',
  },
  
  // ─────────────────────────────────────────────────────────
  // THE NERVOUS SYSTEM
  // ─────────────────────────────────────────────────────────
  {
    id: 'nervous-system-runs-everything',
    title: 'Your Nervous System Decides Before You Do',
    keywords: ['nervous', 'fight', 'flight', 'freeze', 'calm', 'activated', 'dysregulated', 'overwhelm', 'panic', 'shutdown'],
    gauges: ['state', 'body', 'emotion'],
    coreTruth: 'Your nervous system scans for threat 24/7 and responds before your conscious mind catches up. When it detects danger (real or perceived), it hijacks your body and mind. You can\'t think your way out of activation - you have to regulate the body first.',
    sources: [
      { sourceId: 'porges', contribution: 'Neuroception detects safety/danger before awareness.' },
      { sourceId: 'van-der-kolk', contribution: 'The body keeps score - regulation must include the body.' },
      { sourceId: 'carlson', contribution: 'The autonomic system operates outside conscious control.' },
    ],
    whatThisMeans: 'That "overreaction" wasn\'t weakness - your nervous system was protecting you based on old data. You can update its settings.',
    whatYouCanDo: 'Learn your activation signals. Practice calming the body (breath, cold water, movement) BEFORE trying to think through problems.',
  },
  
  // ─────────────────────────────────────────────────────────
  // EMOTIONS
  // ─────────────────────────────────────────────────────────
  {
    id: 'emotions-are-data',
    title: 'Emotions Are Data, Not Directives',
    keywords: ['emotion', 'feeling', 'angry', 'sad', 'anxious', 'scared', 'overwhelmed', 'numb'],
    gauges: ['emotion', 'state'],
    coreTruth: 'Emotions are signals from your system telling you something matters. They\'re not commands to obey or enemies to suppress. They carry information about your needs, boundaries, and values. Name them precisely, decode their message, then choose your response.',
    sources: [
      { sourceId: 'barrett', contribution: 'Emotions are constructed predictions, not automatic reactions.' },
      { sourceId: 'barlow', contribution: 'Emotion regulation is learnable - it\'s a skill, not a trait.' },
      { sourceId: 'ekman', contribution: 'Basic emotions are universal; what you do with them is learned.' },
    ],
    whatThisMeans: 'You\'re not "too emotional" - your system is working. The question is whether you\'re reading it accurately.',
    whatYouCanDo: 'Name what you feel with precision. Ask what the emotion is protecting or signaling. Then choose your response.',
  },
  {
    id: 'anger-is-secondary',
    title: 'Anger Is Usually Guarding Something',
    keywords: ['anger', 'angry', 'rage', 'frustrated', 'pissed', 'mad', 'resentment'],
    gauges: ['emotion', 'connection'],
    coreTruth: 'Anger is almost always a secondary emotion - a bodyguard for something more vulnerable underneath. Hurt, fear, shame, powerlessness. Anger feels safer to express, so the brain serves it up first. But addressing the anger without finding what\'s underneath just moves the furniture around.',
    sources: [
      { sourceId: 'barlow', contribution: 'Anger often masks primary emotions like hurt or fear.' },
      { sourceId: 'gottman', contribution: 'In relationships, beneath anger is usually a longing or fear.' },
      { sourceId: 'beck', contribution: 'The thought driving anger often involves perceived injustice or threat.' },
    ],
    whatThisMeans: 'When you\'re angry, there\'s almost always something softer underneath. Finding it doesn\'t make you weak - it makes you accurate.',
    whatYouCanDo: 'When angry, ask: "If I wasn\'t angry, what would I be feeling?" That\'s usually the real issue.',
  },
  
  // ─────────────────────────────────────────────────────────
  // RELATIONSHIPS
  // ─────────────────────────────────────────────────────────
  {
    id: 'attachment-is-template',
    title: 'Your First Relationships Wrote Your Code',
    keywords: ['attachment', 'childhood', 'parent', 'family', 'pattern', 'relationship', 'trust', 'secure', 'anxious', 'avoidant'],
    gauges: ['connection', 'emotion'],
    coreTruth: 'Your earliest relationships created your first map of what to expect from others. Secure, anxious, avoidant - these aren\'t personality flaws, they\'re adaptations to your environment. The good news: attachment is learnable. You can develop earned security through new experiences and awareness.',
    sources: [
      { sourceId: 'bowlby', contribution: 'Attachment patterns form early and persist into adulthood.' },
      { sourceId: 'berger', contribution: 'Attachment can be "earned" through later secure relationships.' },
      { sourceId: 'gottman', contribution: 'Adult attachment affects how we handle conflict and intimacy.' },
    ],
    whatThisMeans: 'Your relationship patterns aren\'t random - they\'re learned. And what was learned can be updated.',
    whatYouCanDo: 'Notice your patterns. When do you get anxious, avoidant, or clingy? That\'s your attachment code running. You can rewrite it.',
  },
  {
    id: 'repair-over-perfection',
    title: 'Repair Matters More Than Perfection',
    keywords: ['conflict', 'fight', 'argument', 'repair', 'apologize', 'rupture', 'relationship', 'marriage', 'partner'],
    gauges: ['connection', 'emotion'],
    coreTruth: 'The healthiest relationships aren\'t conflict-free - they\'re repair-rich. Masters of relationships don\'t avoid ruptures; they repair them quickly and completely. The bid for repair and the response to it predict relationship success better than anything else.',
    sources: [
      { sourceId: 'gottman', contribution: 'Repair attempts are the #1 predictor of relationship success.' },
      { sourceId: 'bowlby', contribution: 'Rupture and repair builds secure attachment.' },
      { sourceId: 'aronson', contribution: 'Relationships deepen through vulnerability, including apology.' },
    ],
    whatThisMeans: 'You don\'t need to be perfect. You need to be willing to repair. That\'s what builds trust.',
    whatYouCanDo: 'After conflict, prioritize repair over being right. The relationship is more important than the argument.',
  },
  {
    id: 'family-patterns-repeat',
    title: 'Family Patterns Repeat Until Someone Breaks Them',
    keywords: ['family', 'generation', 'parent', 'sibling', 'pattern', 'cycle', 'repeat', 'trauma', 'inherited'],
    gauges: ['connection', 'alignment'],
    coreTruth: 'Family patterns - communication styles, conflict patterns, emotional habits - transfer across generations automatically. You learned how to handle emotions by watching your family. Breaking the cycle requires awareness first, then deliberate practice of new patterns.',
    sources: [
      { sourceId: 'goldschneider', contribution: 'Family patterns persist across generations.' },
      { sourceId: 'bowlby', contribution: 'Attachment patterns transfer from parent to child.' },
      { sourceId: 'van-der-kolk', contribution: 'Trauma can be intergenerational until processed.' },
    ],
    whatThisMeans: 'The way you react to stress, handle conflict, or express love - much of it was inherited. But inheritance isn\'t destiny.',
    whatYouCanDo: 'Name the patterns you inherited. Decide which to keep and which to break. Then practice the new pattern until it becomes yours.',
  },
  
  // ─────────────────────────────────────────────────────────
  // THINKING & COGNITION
  // ─────────────────────────────────────────────────────────
  {
    id: 'two-brains',
    title: 'You Have Two Brains - Know Which One\'s Talking',
    keywords: ['thinking', 'thought', 'decision', 'brain', 'react', 'impulsive', 'rational', 'fast', 'slow'],
    gauges: ['direction', 'emotion'],
    coreTruth: 'Your fast brain (System 1) handles most of life automatically - it\'s quick but error-prone. Your slow brain (System 2) is deliberate but tires easily. Under stress, the fast brain takes over completely. Wisdom is knowing which system to trust when.',
    sources: [
      { sourceId: 'kahneman', contribution: 'System 1 is fast/automatic; System 2 is slow/deliberate.' },
      { sourceId: 'kalat', contribution: 'The prefrontal cortex (slow brain) goes offline under stress.' },
      { sourceId: 'beck', contribution: 'Automatic thoughts (System 1) often contain cognitive distortions.' },
    ],
    whatThisMeans: 'That impulsive reaction? That was your fast brain. It\'s not "the real you" - it\'s one system among two.',
    whatYouCanDo: 'When stakes are high, pause. Give your slow brain time to come online. The 6-second rule exists for a reason.',
  },
  {
    id: 'neuroplasticity-hope',
    title: 'Your Brain Can Change at Any Age',
    keywords: ['change', 'habit', 'stuck', 'rewire', 'neuroplasticity', 'brain', 'new', 'practice', 'learn'],
    gauges: ['direction', 'alignment'],
    coreTruth: 'Your brain physically changes based on what you repeatedly do. Every time you practice a new response, you strengthen that neural pathway. It\'s not about willpower - it\'s about repetition. The path you want to build requires consistent practice, not perfect execution.',
    sources: [
      { sourceId: 'pinel', contribution: 'Neuroplasticity continues throughout the lifespan.' },
      { sourceId: 'kalat', contribution: 'Repeated behaviors strengthen neural connections.' },
      { sourceId: 'carlson', contribution: 'Learning creates structural changes in the brain.' },
    ],
    whatThisMeans: 'You\'re not stuck. The patterns that feel permanent are just well-practiced. New patterns are possible.',
    whatYouCanDo: 'Pick one response you want to change. Practice the new response in small situations first. The pathway will grow.',
  },
  
  // ─────────────────────────────────────────────────────────
  // IDENTITY & PURPOSE
  // ─────────────────────────────────────────────────────────
  {
    id: 'identity-is-built',
    title: 'Identity Is Built, Not Found',
    keywords: ['identity', 'purpose', 'meaning', 'who am i', 'self', 'authentic', 'lost', 'confused'],
    gauges: ['alignment', 'direction'],
    coreTruth: 'Identity isn\'t a treasure to uncover - it\'s a structure to build. Through exploration, commitment, and sometimes crisis, you construct who you are. And you keep constructing it across your lifespan. Feeling lost isn\'t a sign you\'re broken; it\'s a sign you\'re between constructions.',
    sources: [
      { sourceId: 'erikson', contribution: 'Identity forms through crisis and commitment cycles.' },
      { sourceId: 'funder', contribution: 'Personality is both stable traits and ongoing choice.' },
      { sourceId: 'berger', contribution: 'Identity development continues through adulthood.' },
    ],
    whatThisMeans: 'Not knowing who you are isn\'t failure - it\'s the space between the old you and the next you.',
    whatYouCanDo: 'Explore. Try things. Commit to what resonates. Recommit when it stops resonating. That\'s the process.',
  },
  {
    id: 'values-alignment',
    title: 'Living Out of Alignment Hurts',
    keywords: ['values', 'authentic', 'misaligned', 'wrong', 'stuck', 'unfulfilled', 'purpose', 'meaning'],
    gauges: ['alignment', 'emotion'],
    coreTruth: 'When your actions don\'t match your values, you feel a persistent low-grade distress - even if you can\'t name why. This isn\'t weakness or pickiness. It\'s your system telling you something important is wrong. Alignment isn\'t a luxury; it\'s infrastructure.',
    sources: [
      { sourceId: 'barlow', contribution: 'Values-based action is core to psychological well-being.' },
      { sourceId: 'sarafino', contribution: 'Purpose and meaning correlate with physical health.' },
      { sourceId: 'funder', contribution: 'Personality coherence (alignment) predicts well-being.' },
    ],
    whatThisMeans: 'That vague sense of "something\'s off" might be values misalignment. You\'re not crazy - you\'re out of alignment.',
    whatYouCanDo: 'Name your core values. Look at where your life doesn\'t match them. Start closing the gaps, one decision at a time.',
  },
  
  // ─────────────────────────────────────────────────────────
  // TRAUMA & HEALING
  // ─────────────────────────────────────────────────────────
  {
    id: 'trauma-is-stored',
    title: 'Trauma Lives in the Body',
    keywords: ['trauma', 'PTSD', 'past', 'abuse', 'neglect', 'wound', 'heal', 'triggered', 'flashback'],
    gauges: ['state', 'body', 'emotion'],
    coreTruth: 'Trauma isn\'t just a bad memory - it\'s a rewiring of the nervous system. It lives in muscle tension, startle responses, and automatic reactions. That\'s why you can\'t just "think" your way out. Healing trauma requires working with the body, not just the mind.',
    sources: [
      { sourceId: 'van-der-kolk', contribution: 'The body keeps the score - trauma is somatic.' },
      { sourceId: 'porges', contribution: 'Trauma dysregulates the autonomic nervous system.' },
      { sourceId: 'barlow', contribution: 'Trauma treatment must address body and mind.' },
    ],
    whatThisMeans: 'Your "overreactions" to certain triggers aren\'t character flaws - they\'re your nervous system running old code.',
    whatYouCanDo: 'Work with your body, not against it. Movement, breath, safe touch, co-regulation. The body needs to learn safety.',
  },
];

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get source details by ID
 */
export function getSourceById(sourceId: string): AcademicSource | undefined {
  return ACADEMIC_SOURCES.find(s => s.id === sourceId);
}

/**
 * Find the best matching synthesized insight by searching text
 */
export function findInsightByKeywords(text: string): SynthesizedInsight | null {
  const textLower = text.toLowerCase();
  
  let bestMatch: SynthesizedInsight | null = null;
  let bestScore = 0;
  
  for (const insight of SYNTHESIZED_INSIGHTS) {
    let score = 0;
    for (const keyword of insight.keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = insight;
    }
  }
  
  return bestScore > 0 ? bestMatch : null;
}

/**
 * Get all insights for a gauge
 */
export function getInsightsForGauge(gauge: GaugeType): SynthesizedInsight[] {
  return SYNTHESIZED_INSIGHTS.filter(i => i.gauges.includes(gauge));
}

/**
 * Format insight for sharing
 */
export function formatInsightForShare(insight: SynthesizedInsight): {
  gauges: GaugeType[];
  coreTruth: string;
  sources: { author: string; contribution: string }[];
  whatThisMeans: string;
  whatYouCanDo: string;
} {
  return {
    gauges: insight.gauges,
    coreTruth: insight.coreTruth,
    sources: insight.sources.map(s => {
      const source = getSourceById(s.sourceId);
      return {
        author: source?.author || s.sourceId,
        contribution: s.contribution,
      };
    }),
    whatThisMeans: insight.whatThisMeans,
    whatYouCanDo: insight.whatYouCanDo,
  };
}

/**
 * Gauge display info
 */
export const GAUGE_INFO: Record<GaugeType, { emoji: string; color: string; name: string; tagline: string }> = {
  body: { emoji: '🫀', color: '#EF4444', name: 'Body', tagline: 'Your physical foundation' },
  state: { emoji: '⚡', color: '#F59E0B', name: 'State', tagline: 'Your nervous system' },
  emotion: { emoji: '💜', color: '#8B5CF6', name: 'Emotion', tagline: 'What you feel' },
  connection: { emoji: '💙', color: '#3B82F6', name: 'Connection', tagline: 'Your relationships' },
  direction: { emoji: '🧭', color: '#10B981', name: 'Direction', tagline: 'Where you\'re going' },
  alignment: { emoji: '✨', color: '#EC4899', name: 'Alignment', tagline: 'Living your values' },
};

// Legacy exports for compatibility
export const TOPIC_SOURCE_MAP = SYNTHESIZED_INSIGHTS;
export const findSourcesByKeywords = findInsightByKeywords;
