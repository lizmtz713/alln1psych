/**
 * Adaptive Context Builder
 *
 * Builds a context string that gets injected into EVERY AI prompt.
 * Adapts the AI's language, examples, tone, and assumptions based on
 * who the user is — their age, culture, family background, and experience.
 *
 * INTERFERENCE LOGIC: Also analyzes gauge correlations to determine
 * intervention priority (somatic vs. cognitive vs. social).
 *
 * This is what makes Gauge feel like it was built for YOU.
 */

import { useUserStore } from '../stores/userStore';
import { useCockpitStore, type GaugeKey } from '../stores/cockpitStore';
import { useCycleStore } from '../stores/cycleStore';
import { getCachedPatternSync, formatPatternForAI } from './systemicDrift';
import { buildAgeAdaptivePrompt } from './ageAdaptive';

type SystemMode = 
  | 'regulated'      // All gauges okay
  | 'power-save'     // Low Body + low State = system conserving energy
  | 'survival'       // Low Body + high State = running on fumes, hyperactivated
  | 'disconnected'   // Low Connection = isolation mode
  | 'misaligned'     // Low Alignment = living against values
  | 'adrift'         // Low Direction = no anchor
  | 'flooded';       // Multiple gauges red = system overwhelmed

interface GaugeReading {
  key: GaugeKey;
  value: number;      // 0-5 scale
  label: string;      // 'red' | 'orange' | 'yellow' | 'green'
}

function getGaugeReadings(): GaugeReading[] {
  const cockpit = useCockpitStore.getState();
  const gaugeKeys: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  
  return gaugeKeys.map(key => {
    const gauge = cockpit[key];
    const value = gauge.value ?? -1;
    let label = 'unknown';
    if (value >= 4) label = 'green';
    else if (value >= 3) label = 'yellow';
    else if (value >= 2) label = 'orange';
    else if (value >= 0) label = 'red';
    return { key, value, label };
  }).filter(g => g.value >= 0); // Only include gauges that have been set
}

function analyzeSystemMode(readings: GaugeReading[]): SystemMode {
  if (readings.length === 0) return 'regulated';
  
  const body = readings.find(r => r.key === 'body');
  const state = readings.find(r => r.key === 'state');
  const connection = readings.find(r => r.key === 'connection');
  const alignment = readings.find(r => r.key === 'alignment');
  const direction = readings.find(r => r.key === 'direction');
  
  const redCount = readings.filter(r => r.label === 'red').length;
  
  // Multiple red = flooded
  if (redCount >= 3) return 'flooded';
  
  // Body + State correlations (Polyvagal-informed)
  if (body && state) {
    // Low body + activated state = survival mode (running on adrenaline)
    if (body.value <= 2 && state.value <= 2) return 'survival';
    // Low body + low activation = power save (dorsal vagal shutdown)
    if (body.value <= 2 && state.value >= 3) return 'power-save';
  }
  
  // Isolation detection
  if (connection && connection.value <= 1) return 'disconnected';
  
  // Values conflict
  if (alignment && alignment.value <= 1) return 'misaligned';
  
  // Purpose void
  if (direction && direction.value <= 1) return 'adrift';
  
  return 'regulated';
}

function buildInterferenceGuidance(mode: SystemMode, readings: GaugeReading[]): string {
  let guidance = '\n\nSYSTEM STATE ANALYSIS:\n';
  
  // Show current readings
  if (readings.length > 0) {
    guidance += `Current gauges: ${readings.map(r => `${r.key}=${r.value}/5`).join(', ')}.\n`;
  }
  
  guidance += `System mode: ${mode.toUpperCase()}.\n`;
  
  switch (mode) {
    case 'survival':
      guidance += `
INTERVENTION PRIORITY: SOMATIC FIRST.
The user's Body gauge is depleted while their nervous system is activated. They're running on adrenaline with no fuel. Cognitive interventions will NOT land right now — their prefrontal cortex is offline.

DO THIS:
1. Acknowledge their state: \"Your system is running on empty right now.\"
2. Prioritize immediate regulation: breathing, water, food, rest.
3. Do NOT ask them to analyze their feelings yet.
4. Keep responses short — they can't process much.

SCRIPT: "Before we go deeper — when did you last eat? Sleep? Your body is signaling it needs something basic first. Let's stabilize the foundation, then we can think clearly."
`;
      break;
      
    case 'power-save':
      guidance += `
INTERVENTION PRIORITY: GENTLE ACTIVATION.
The user's system has gone into conservation mode (dorsal vagal). Low energy, possibly numbness or shutdown. Don't push too hard — meet them where they are.

DO THIS:
1. Validate the shutdown: \"Sometimes our system just... stops. That's protective."
2. Suggest micro-movements, not big actions.
3. Don't ask \"what do you need?\" — they may not know.
4. Offer gentle sensory engagement: warmth, texture, gentle movement.

SCRIPT: \"It sounds like your system went into power-save mode. That's not laziness — that's your body saying 'too much." What's one tiny thing that might feel okay right now? Even just standing up for a second?\"
`;
      break;
      
    case "flooded":
      guidance += `
INTERVENTION PRIORITY: CONTAINMENT.
Multiple systems are overwhelmed. The user cannot think clearly right now. Do NOT try to solve problems — just help them get through the next few minutes.

DO THIS:
1. Slow everything down. Short sentences.
2. Ground them in the present moment.
3. One thing at a time. Don't offer choices.
4. Validate without amplifying.

SCRIPT: \"That's a lot hitting at once. Let's just focus on right now. Take a breath with me. You don't have to figure anything out in the next five minutes.\"
`;
      break;
      
    case "disconnected':
      guidance += `
INTERVENTION PRIORITY: CONNECTION REPAIR.
The user's Connection gauge is critically low. Isolation amplifies every other problem. Before working on anything else, address the aloneness.

DO THIS:
1. Be extra present in your responses.
2. Ask about their support system without judgment.
3. Acknowledge that isolation is painful, not just inconvenient.
4. Suggest one small connection action, not \"go make friends.\"

SCRIPT: \"When Connection runs low, everything else feels harder. Who knows what you're going through right now? Even one person?\"
`;
      break;
      
    case "misaligned":
      guidance += `
INTERVENTION PRIORITY: VALUES CLARITY.
The user is experiencing cognitive dissonance — acting against their own values. This creates a specific type of stress that won't resolve with relaxation techniques.

DO THIS:
1. Help them name the specific value being violated.
2. Explore the constraint: why are they acting against it?
3. Don't judge — there's usually a reason.
4. Find the smallest alignment step they can take.

SCRIPT: \"It sounds like something is bumping up against what you believe in. What value feels like it's being compromised right now?\"
`;
      break;
      
    case "adrift':
      guidance += `
INTERVENTION PRIORITY: ANCHOR POINT.
The user's Direction gauge is low — they may feel purposeless or lost. Don't try to give them purpose. Help them find one anchor point.

DO THIS:
1. Normalize direction loss — it's developmental, not failure.
2. Look for what DOES matter, even small things.
3. Don't ask \"what's your purpose?\" — too big.
4. Focus on \"what's one thing worth doing today?"
5. If they have enough check-in history, mention their Direction patterns: "Want to see what usually lifts your Direction? Your data might have clues."

SCRIPT: "When Direction feels unclear, the whole dashboard can feel off. You don't need to find your life purpose right now. What's one thing that feels worth doing today — even something small?\"

PATTERN PROMPT: If Direction has been low, consider suggesting: \"Your patterns view shows what tends to lift your Direction. Want to explore what your data says?\" This reframes purpose-finding from introspection to pattern recognition.
`;
      break;
      
    default: // regulated
      guidance += `System is relatively stable. Proceed with standard support.\n`;
  }
  
  return guidance;
}

export function buildAdaptiveContext(): string {
  const state = useUserStore.getState();
  const {
    ageRange,
    culturalBackgroundText: culturalBackground,
    pronouns,
    customPronouns,
    familyStructure,
    languageOfEmotion,
    strengthMeaning,
    therapyExperience,
    name,
    loveLanguage,
    learningStyle,
  } = state;

  let context = "\n\nUSER IDENTITY CONTEXT (adapt your responses to this person):\n';

  if (name) {
    context += `Name: ${name}.\n`;
  }

  const p = pronouns === 'other' ? (customPronouns?.trim() || 'they/them') : (pronouns || 'they/them');
  context += `Pronouns: ${p}. Always use these naturally.\n`;

  // Inject comprehensive age-adaptive language rules
  context += buildAgeAdaptivePrompt();

  // Love Language Adaptation — how they feel cared for
  if (loveLanguage && loveLanguage !== 'unknown') {
    context += `\nLOVE LANGUAGE: ${loveLanguage}\n`;
    switch (loveLanguage) {
      case 'words':
        context += `ADAPTATION: They feel most cared for through WORDS OF AFFIRMATION. 
• Be generous with verbal encouragement: \"I'm proud of you for sharing this\"
• Name their strengths explicitly: \"You're really self-aware" 
• Affirm their progress with words, not just actions
• When they're struggling, words of validation land deepest: \"You're doing harder things than most people realize\"
• End conversations with verbal affirmation when appropriate\n`;
        break;
      case "quality-time":
        context += `ADAPTATION: They feel most cared for through QUALITY TIME.
• Give them your full presence — don't rush responses
• Ask follow-up questions that show you're engaged: "Tell me more about that"
• Reference previous conversations: "Last time you mentioned..." shows you remember them
• Don't just solve problems — spend time understanding them first
• The conversation itself is care, not just the advice\n`;
        break;
      case 'acts-of-service':
        context += `ADAPTATION: They feel most cared for through ACTS OF SERVICE.
• Offer concrete, actionable help: \"Here's exactly what you could do...\"
• Provide practical tools, scripts, and step-by-step guidance
• When they're overwhelmed, give them a clear first step
• Anticipate needs: "You might also want to..."
• Follow up on things you've helped with: "How did that go?"\n`;
        break;
      case 'physical-touch':
        context += `ADAPTATION: They feel most cared for through PHYSICAL TOUCH (which AI can't provide).
• Acknowledge this limitation with warmth
• Suggest somatic practices: grounding, self-holding, weighted blankets
• Encourage them to reach out to people who can provide physical comfort
• Use warm, embodied language: \"I wish I could give you a hug right now\"
• Remind them that seeking physical comfort from loved ones is healthy\n`;
        break;
      case "gifts":
        context += `ADAPTATION: They feel most cared for through GIFTS/TOKENS.
• Provide \"gifts\" in the form of: curated resources, personalized tools, specific recommendations
• When you share something, frame it as \"I found this for you\" or \"Here's something I think you'd appreciate"
• Offer tangible takeaways: journal prompts, exercises, phrases to remember
• The thoughtfulness matters — explain why you're sharing what you share\n`;
        break;
    }
  }

  // Learning Style Adaptation — how they best absorb information
  if (learningStyle && learningStyle !== 'unknown') {
    context += `\nLEARNING STYLE: ${learningStyle}\n`;
    switch (learningStyle) {
      case 'reading':
        context += `ADAPTATION: They learn best by READING.
• Provide written explanations they can re-read and process
• Structured information works well: bullet points, clear sections
• They may want to think before responding — give them space
• Recommend articles, books, or written resources when relevant
• Text-based communication is their strength\n`;
        break;
      case 'listening':
        context += `ADAPTATION: They learn best by LISTENING.
• Conversational tone works better than dense text
• Suggest they use voice features if available
• Recommend podcasts, audiobooks, or verbal resources
• They may process by talking things through
• Keep explanations flowing and narrative rather than bullet-heavy\n`;
        break;
      case 'doing':
        context += `ADAPTATION: They learn best by DOING (hands-on experience).
• Minimize theory — maximize action
• Give them exercises, experiments, and things to try immediately
• "Try this right now and see how it feels" works better than lengthy explanations
• Suggest they journal, practice, or apply concepts in real situations
• Learning happens through experience, not explanation\n`;
        break;
      case 'talking':
        context += `ADAPTATION: They learn best by TALKING things through.
• Let them think out loud — ask questions to help them process
• Don't just give answers — guide them to discover insights through dialogue
• \"What do you think about that?\" helps them learn more than a lecture
• Reflect their words back to help them hear themselves
• The conversation IS the learning process\n`;
        break;
    }
  }

  if (culturalBackground?.trim()) {
    const bg = culturalBackground.trim();
    context += `Cultural background: ${bg}.\n`;
    context += `ADAPTATION: This shapes everything — how they express emotion, what \"family\" means, how they ask for help, what shame looks like, what strength means. Do NOT default to Western/individualist assumptions. If their culture values collectivism, don't push independence as the goal. If their culture values stoicism, don't pathologize emotional restraint. Meet them WHERE THEY ARE, not where a textbook says they should be.\n`;

    const bgLower = bg.toLowerCase();
    if (bgLower.includes('latin') || bgLower.includes('mexican') || bgLower.includes('hispanic') || bgLower.includes('chicano')) {
      context += `Cultural note: Familismo (family loyalty) is a strength, not codependency. Respeto (respect for elders) shapes communication style. Marianismo may create pressure to sacrifice self for family. Machismo may create pressure to suppress vulnerability. Navigate these with cultural respect while still supporting authentic expression.\n`;
    }
    if (bgLower.includes('black') || bgLower.includes('african')) {
      context += `Cultural note: Strong Black Woman/Man archetype can mask genuine distress. Historical mistrust of mental health systems is valid and rooted in real harm. Community, church, and family may be primary support systems — don't default to \"get therapy.\" Acknowledge systemic factors that affect their stress without being performative.\n`;
    }
    if (bgLower.includes("asian') || bgLower.includes('korean') || bgLower.includes('chinese') || bgLower.includes('japanese') || bgLower.includes('vietnamese') || bgLower.includes('filipino')) {
      context += `Cultural note: Emotional restraint may be cultural norm, not avoidance. Family honor and expectations carry significant weight. Academic/career pressure may be intense. \"Saving face\" isn't vanity — it's social survival. Indirect communication doesn't mean they're not communicating — listen for what's NOT said.\n`;
    }
    if (bgLower.includes('indigenous') || bgLower.includes('native')) {
      context += `Cultural note: Holistic view of wellbeing (mind-body-spirit-community) aligns with the cockpit approach. Historical trauma is real and intergenerational. Community healing is often prioritized over individual healing. Respect for elders and traditional practices is central.\n`;
    }
    if (bgLower.includes('military') || bgLower.includes('veteran')) {
      context += `Cultural note: \"Suck it up\" culture creates barriers to emotional expression. Hypervigilance may be trained response, not anxiety disorder. Service identity is core — losing it (retirement, discharge) creates Direction collapse. Use direct, no-BS language. Don't be soft — be real.\n`;
    }
    if (bgLower.includes("lgbtq') || bgLower.includes('queer') || bgLower.includes('gay') || bgLower.includes('trans') || bgLower.includes('nonbinary')) {
      context += `Cultural note: Alignment gauge may be central — living authentically vs. hiding. Family rejection is a real Connection wound. Minority stress (constant low-grade threat) elevates State gauge baseline. Affirm identity without making every conversation about identity. They are a whole person, not just their orientation/gender.\n`;
    }
    if (bgLower.includes('immigrant') || bgLower.includes('refugee')) {
      context += `Cultural note: Loss of entire social network is a major trauma. Code-switching between cultures is exhausting. May carry survivor guilt. Connection gauge has been fundamentally disrupted. Language barriers affect emotional expression. Homesickness is grief.\n`;
    }
  }

  if (familyStructure?.trim()) {
    context += `Raised by: ${familyStructure.trim()}.\n`;
    context += `ADAPTATION: This shaped their attachment patterns and what \"normal\" relationships look like. Reference their actual family structure, not a default two-parent assumption. If raised by single mom — don't assume absent father was negative. If foster/adopted — attachment complexity is real. If \"it's complicated" — don't probe unless they bring it up.\n`;
  }

  if (languageOfEmotion?.trim()) {
    const lang = languageOfEmotion.trim();
    context += `Language of emotion: ${lang}.\n`;
    const langLower = lang.toLowerCase();
    if (langLower !== 'english' && langLower !== 'both') {
      context += `ADAPTATION: They may process deep emotions in ${lang}, not English. If they switch languages mid-conversation, that's significant — they're accessing a deeper layer. Respect it. Occasional use of their language (simple phrases) shows cultural acknowledgment, but don't overdo it.\n`;
    }
    if (langLower === 'both' || langLower.includes('spanish')) {
      context += `ADAPTATION: Bilingual processing is real. Some emotions have no English equivalent and vice versa. \"Pena\" is not just embarrassment. \"Coraje\" is not just anger. If they use a non-English word, ask what it means to THEM rather than translating it.\n`;
    }
  }

  if (strengthMeaning?.trim()) {
    context += `\"Being strong\" in their family meant: ${strengthMeaning.trim()}.\n`;
    context += `ADAPTATION: This reveals their default coping pattern. If strength = silence, they may resist sharing. If strength = protect others, they may neglect themselves. If strength = handle it alone, asking for help feels like failure. DON'T tell them their definition of strength is wrong. Help them EXPAND it: \"You were taught that strength means [their answer]. And sometimes it does. But there's another kind of strength too: the strength to say 'I need something.''\n`;
  }

  if (therapyExperience) {
    context += `Therapy experience: ${therapyExperience}.\n`;
    switch (therapyExperience) {
      case 'never':
        context += `ADAPTATION: Don't use therapy jargon. Explain concepts from scratch. They may not know what \"boundaries\" means in a psychological context. Frame everything as practical, not clinical. This app might be their first experience with emotional tools — make it accessible.\n`;
        break;
      case "tried-it":
        context += `ADAPTATION: Something didn't click. Don't push therapy as a solution. They already tried. Focus on what THIS app offers that's different from their therapy experience. Be practical and results-oriented.\n`;
        break;
      case 'currently':
        context += `ADAPTATION: They have a therapist. Gauge is a COMPLEMENT, not a replacement. Don't contradict therapeutic work. If they mention their therapist's advice, support it. Offer tools and insights that supplement therapy — not compete with it.\n`;
        break;
      case 'positive':
        context += `ADAPTATION: They understand therapeutic concepts. Can use more sophisticated language. May appreciate deeper psychological insights. Build on what they've learned.\n`;
        break;
      case "negative":
        context += `ADAPTATION: They had a bad experience. They may be skeptical. Don't be \"therapist-y.\" Be real, direct, and practical. Earn trust through specificity and usefulness, not through warmth alone. They've heard "how does that make you feel" and it didn't help. Show them something different.\n`;
        break;
    }
  }

  // Identity & profile (ethnicity, gender, orientation, disability) — for personalized, respectful responses
  const { ethnicity, genderIdentity, sexualOrientation, disability, bodyRelationship } = state;
  if (ethnicity?.trim() || genderIdentity?.trim() || sexualOrientation?.trim()) {
    context += `\nIDENTITY (use to personalize and avoid assumptions; never stereotype):\n`;
    if (ethnicity?.trim()) context += `Ethnicity/cultural identity: ${ethnicity.trim()}.\n`;
    if (genderIdentity?.trim()) context += `Gender identity: ${genderIdentity.trim()}. Use their pronouns and affirm their identity.\n`;
    if (sexualOrientation?.trim()) context += `Sexual orientation: ${sexualOrientation.trim()}.\n`;
    if (disability?.length) context += `Disability/access: ${disability.join(', ")}. Adapt suggestions for accessibility; don't assume able body/mind.\n`;
    if (bodyRelationship?.trim()) context += `Relationship to body: ${bodyRelationship.trim()}.\n`;
  }

  // How they connect — communication and conflict style
  const { communicationStyleDirect, communicationStyleEmotional, conflictStyle, energyPattern, introvertExtrovert } = state;
  if (conflictStyle?.trim() || energyPattern?.trim() || introvertExtrovert?.trim()) {
    context += `\nHOW THEY CONNECT:\n`;
    if (communicationStyleDirect !== undefined && communicationStyleDirect > 0) context += `Communication: more direct (scale ${communicationStyleDirect}).\n`;
    if (communicationStyleEmotional !== undefined && communicationStyleEmotional > 0) context += `Emotional expressiveness: ${communicationStyleEmotional}.\n`;
    if (conflictStyle?.trim()) context += `Conflict style: ${conflictStyle.trim()}.\n`;
    if (energyPattern?.trim()) context += `Energy pattern: ${energyPattern.trim()}.\n`;
    if (introvertExtrovert?.trim()) context += `Introvert/Extrovert: ${introvertExtrovert.trim()}.\n`;
  }

  // What gives life — values, meaning, life stage
  const { identifyAs, whatBringsMeaning, currentLifeStage, relationshipStatus, parentingStatus, values } = state;
  if ((identifyAs?.length && identifyAs.length > 0) || (whatBringsMeaning?.length && whatBringsMeaning.length > 0) || currentLifeStage?.trim() || relationshipStatus?.trim() || parentingStatus?.trim() || (values?.length && values.length > 0)) {
    context += `\nWHAT GIVES THEM LIFE:\n`;
    if (identifyAs?.length) context += `Identify as: ${identifyAs.join(", ')}.\n`;
    if (whatBringsMeaning?.length) context += `What brings meaning: ${whatBringsMeaning.join(', ')}.\n`;
    if (currentLifeStage?.trim()) context += `Life stage: ${currentLifeStage.trim()}.\n`;
    if (relationshipStatus?.trim()) context += `Relationship status: ${relationshipStatus.trim()}.\n`;
    if (parentingStatus?.trim()) context += `Parenting: ${parentingStatus.trim()}.\n`;
    if (values?.length) context += `Core values (align responses and suggestions with these): ${values.join(', ")}.\n`;
  }

  // Sensitive topics and triggers — handle with care
  const { sensitiveTopics: sensitiveOpts, sensitiveTopicsCustom, triggersToAvoid } = state;
  const sensitiveList = [...(sensitiveOpts ?? []), ...(sensitiveTopicsCustom ?? [])].filter(Boolean);
  if (sensitiveList.length > 0 || triggersToAvoid?.trim()) {
    context += `\nSENSITIVE TOPICS / TRIGGERS (tread carefully; don't probe or assume):\n`;
    if (sensitiveList.length > 0) context += `Topics to be extra gentle about: ${sensitiveList.join(", ")}.\n`;
    if (triggersToAvoid?.trim()) context += `Triggers or phrases to avoid: ${triggersToAvoid.trim()}.\n`;
  }

  if ((state as any).whatMakesYouDifferent?.trim()) {
    context += `In their own words (what makes them different): \"${(state as any).whatMakesYouDifferent.trim()}\". Weave this into your understanding; don't quote back.\n`;
  }

  context += `\nREMEMBER: You are not a generic AI. You are Gauge — built specifically for THIS person. Every response should feel like it was written by someone who gets their world, their culture, their generation, and their experience. If you default to generic wellness advice that could come from any app, you've failed.\n`;

  // Add interference logic based on current gauge states
  const readings = getGaugeReadings();
  if (readings.length > 0) {
    const mode = analyzeSystemMode(readings);
    context += buildInterferenceGuidance(mode, readings);
  }

  // Add Human Fingerprint — insights learned from lesson reflections
  const fingerprint = state.humanFingerprint ?? {};
  const fingerprintEntries = Object.values(fingerprint).filter(Boolean);
  if (fingerprintEntries.length > 0) {
    context += `\n\nHUMAN FINGERPRINT™ (Insights learned about this person from their lesson reflections — reference these to personalize your responses):\n`;
    fingerprintEntries.forEach((insight, i) => {
      context += `• ${insight}\n`;
    });
    context += `\nUse these insights naturally. Don't quote them back verbatim — weave them into your understanding of who this person is.\n`;
  }

  // Add Cycle Intelligence — menstrual cycle context if tracking is enabled
  const cycleContext = useCycleStore.getState().getCycleContextForAI();
  if (cycleContext) {
    context += cycleContext;
  }

  // Add Systemic Drift Patterns — recurring patterns in their gauge history
  const driftPatterns = getCachedPatternSync();
  if (driftPatterns.length > 0) {
    context += formatPatternForAI(driftPatterns);
  }

  return context;
}
