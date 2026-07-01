/**
 * Psychology Knowledge Base - InGauge
 * Source: 22+ academic textbooks. Injected into every AI prompt.
 */

export interface KnowledgeFact {
  gauge: 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment' | 'cross-system';
  principle: string;
  explanation: string;
  userFriendly: string;
  source: string;
  tags: string[];
}

export const PSYCH_KNOWLEDGE: KnowledgeFact[] = [
  { gauge: 'body', principle: 'Sleep deprivation amplifies amygdala reactivity by up to 60%', explanation: "Amygdala becomes hyperactive while prefrontal cortex goes offline.", userFriendly: "You got 5 hours of sleep? Your emotional reactions are running about 60% hotter than normal. Your brain's alarm system is on high alert.", source: 'Biopsychology (Pinel)', tags: ['sleep', 'amygdala'] },
  { gauge: 'body', principle: 'Dehydration of 1-2% impairs cognitive function and mood', explanation: "Brain is ~75% water. Mild dehydration affects working memory and elevates anxiety.", userFriendly: "When did you last drink water? Your brain is 75% water. Even slight dehydration makes everything feel harder.", source: 'Biopsychology (Pinel)', tags: ['hydration', 'cognition'] },
  { gauge: 'body', principle: 'Low blood sugar mimics anxiety symptoms', explanation: "Hypoglycemia triggers the same adrenaline response as threat.", userFriendly: "That anxious feeling? When did you last eat? Low blood sugar creates the exact same physical sensation as anxiety. Eat something with protein.", source: 'Biopsychology (Pinel)', tags: ['nutrition', 'anxiety'] },
  { gauge: 'body', principle: "Exercise produces BDNF - the brain's growth fertilizer", explanation: "BDNF promotes neuroplasticity. A 20-minute walk increases it.", userFriendly: "When you move, your brain releases BDNF - fertilizer for your brain. A 20-minute walk does it. Movement is medicine for your brain.", source: 'Biopsychology (Pinel)', tags: ['exercise', 'BDNF'] },
  { gauge: 'body', principle: '95% of serotonin is produced in the gut', explanation: "Gut-brain axis means digestive health directly affects mood.", userFriendly: "95% of your serotonin is made in your gut. When you eat poorly, your mood suffers. Chemically. Your gut and brain are in constant conversation.", source: 'Biopsychology (Pinel)', tags: ['gut-brain', 'serotonin'] },
  { gauge: 'body', principle: 'Chronic sleep debt cannot be repaid with one good night', explanation: "Missing 2hr/night for a week = cognitive equivalent of 48hr awake.", userFriendly: "You can't catch up on sleep with one good night. That foggy feeling? That's accumulated sleep debt.", source: 'Biopsychology (Pinel)', tags: ['sleep-debt'] },
  { gauge: 'body', principle: 'Caffeine masks fatigue while increasing stress hormones', explanation: "Caffeine blocks adenosine and increases cortisol.", userFriendly: "Caffeine doesn't give you energy. It blocks the tired signal while pumping up stress hormones. Third coffee and anxious? The coffee might be the problem.", source: 'Biopsychology (Pinel)', tags: ['caffeine', 'cortisol'] },
  { gauge: 'state', principle: 'Your nervous system has three modes, not two', explanation: "Beyond fight-or-flight and rest there is freeze/shutdown.", userFriendly: "There's a third mode: freeze. When your system gets SO overwhelmed it shuts down. That's not laziness. That's your oldest survival system.", source: 'Biopsychology (Pinel)', tags: ['polyvagal', 'freeze'] },
  { gauge: 'state', principle: 'You cannot think your way out of nervous system activation', explanation: "Autonomic system runs faster than thought. Body must be regulated first.", userFriendly: "Just calm down doesn't work. Your nervous system runs faster than your thinking brain. Calm the body FIRST. Body first. Mind second.", source: 'Biopsychology (Pinel)', tags: ['regulation', 'body-first'] },
  { gauge: 'state', principle: "Co-regulation: a calm person calms another's nervous system", explanation: "Humans are designed to be regulated by other nervous systems.", userFriendly: "If someone calm sits next to you when you're spiraling, your nervous system literally starts matching theirs. That's co-regulation. That's biology.", source: 'Biopsychology (Pinel)', tags: ['co-regulation'] },
  { gauge: 'emotion', principle: 'At least 27 documented emotions - not just happy, sad, mad', explanation: "Emotional granularity predicts mental health.", userFriendly: "Most people use 5 emotion words. There are 27+ documented emotions. The more precisely you name what you feel, the better your brain can process it.", source: 'Cognition (Matlin)', tags: ['granularity'] },
  { gauge: 'emotion', principle: 'Anger is usually a secondary emotion hiding something vulnerable', explanation: "Anger often masks hurt, fear, or powerlessness.", userFriendly: "Anger is almost never the real thing. It's the bodyguard. Underneath there's usually hurt, fear, or powerlessness. Find what's under it.", source: 'Clinical (Compas & Gotlib)', tags: ['anger', 'secondary'] },
  { gauge: 'emotion', principle: 'Anxiety and excitement produce identical physical sensations', explanation: "Same heart rate, adrenaline. Only the label differs.", userFriendly: "Your body can't tell anxiety from excitement. Same chemistry. Next time you feel anxious, try saying I'm excited. It can work.", source: 'Cognition (Matlin)', tags: ['anxiety', 'reappraisal'] },
  { gauge: 'emotion', principle: 'Rumination amplifies and extends depression', explanation: "Replaying without resolution predicts depression severity.", userFriendly: "Replaying the same situation over and over is rumination - a strong predictor of depression. Breaking it requires action, not more thinking.", source: 'Abnormal (Nolen-Hoeksema)', tags: ['rumination', 'depression'] },
  { gauge: 'connection', principle: 'Social exclusion activates same brain regions as physical pain', explanation: "Rejection is processed in the same region as physical injury.", userFriendly: "Being left out doesn't just hurt emotionally - your brain processes it in the same region as a broken bone. Rejection literally hurts.", source: 'Social Psychology (Aronson)', tags: ['rejection', 'pain'] },
  { gauge: 'connection', principle: 'Attachment styles from childhood predict adult relationship patterns', explanation: "Secure, anxious, avoidant templates form in first 2-3 years. Can be updated.", userFriendly: "Your caregivers' responses in your first years created a blueprint for every relationship since. It's not your fault. Patterns can be rewritten.", source: 'Developmental (Siegler)', tags: ['attachment'] },
  { gauge: 'connection', principle: 'Connection quality matters more than quantity', explanation: "2-3 deep relationships protect more than 500 shallow ones.", userFriendly: "You could have 2,000 followers and feel alone. Research shows 2-3 deep relationships protect mental health more than 500 shallow ones.", source: 'Social Psychology (Aronson)', tags: ['quality', 'depth'] },
  { gauge: 'direction', principle: 'Humans need forward motion toward something meaningful', explanation: "Perceived progress toward meaningful goals protects against depression.", userFriendly: "We need to feel we're moving toward something that matters. When direction disappears, the emptiness can feel like depression. Sometimes the fix is finding the next thing that matters.", source: 'Personality (Feist & Feist)', tags: ['purpose', 'depression'] },
  { gauge: 'alignment', principle: 'Acting against your values creates measurable physiological stress', explanation: "Cognitive dissonance creates discomfort as a regulatory signal.", userFriendly: "That background anxiety you can't explain? Check your Alignment. When actions don't match values, your body generates stress. The stress IS the signal.", source: 'Social Psychology (Aronson)', tags: ['dissonance', 'values'] },
  { gauge: 'alignment', principle: 'People-pleasing is a survival strategy, not a personality trait', explanation: "Fawning develops when saying no was unsafe.", userFriendly: "If you can't say no without guilt, that's a survival pattern. Every yes that should be a no drops your Alignment gauge. You're running software from when you had no choice.", source: 'Clinical (Compas & Gotlib)', tags: ['people-pleasing', 'boundaries'] },
  { gauge: 'cross-system', principle: 'Every condition involves body, mind, AND social factors', explanation: "No condition is purely one thing. Depression is body + mind + social + purpose + alignment.", userFriendly: "Depression isn't just chemical or just thinking. It's all of them at once. That's why no single fix works alone. Address the whole system. That's why this cockpit exists.", source: 'Abnormal (Barlow & Durand)', tags: ['biopsychosocial'] },
  { gauge: 'cross-system', principle: "Anxiety that doesn't respond to mental techniques may be biological", explanation: "Check Body: sleep, caffeine, hormones, nutrition.", userFriendly: "If breathing and positive thinking don't help - check your body. Sometimes anxiety isn't psychological. It's biological. No amount of meditation fixes sleep deprivation.", source: 'Biopsychology (Pinel)', tags: ['anxiety', 'body-first'] },
  { gauge: 'cross-system', principle: 'Isolation amplifies every problem; connection buffers every problem', explanation: "Red Connection makes every other gauge harder to improve.", userFriendly: "If your Connection gauge is red, everything else gets worse. One real relationship can buffer against almost everything. Who knows about what you're struggling with?", source: 'Social Psychology (Aronson)', tags: ['isolation', 'connection'] },
  { gauge: 'cross-system', principle: "There is no universal healthy baseline - variation is normal", explanation: "The cockpit tracks YOUR patterns, not someone else's average.", userFriendly: "There is no normal. Human variation is enormous. This app tracks YOU over time. The only question: are you doing better than YOUR yesterday?", source: 'Biological Anthropology (Molnar)', tags: ['variation', 'baseline'] },
  
  // Additional knowledge from more textbooks
  { gauge: 'body', principle: 'Luteal phase (days 15-28) increases emotional sensitivity by 20-40%', explanation: "Progesterone peaks then drops rapidly, affecting GABA and serotonin.", userFriendly: "If you're in your luteal phase and everything feels harder - that's real. Progesterone affects the same receptors as anxiety medication. Your brain chemistry literally shifts.", source: 'Biopsychology (Pinel)', tags: ['menstrual', 'hormones', 'luteal'] },
  { gauge: 'body', principle: 'PMS symptoms correlate with inflammation markers', explanation: "Anti-inflammatory approaches (omega-3, reducing sugar) can reduce symptoms.", userFriendly: "PMS isn't just hormones - it's inflammation. The same things that reduce inflammation (omega-3s, less sugar, movement) reduce PMS symptoms. Your body is one system.", source: 'Biopsychology (Pinel)', tags: ['menstrual', 'inflammation'] },
  { gauge: 'body', principle: 'Heart rate variability (HRV) is the best single measure of stress resilience', explanation: "Higher HRV = better parasympathetic tone = faster recovery from stress.", userFriendly: "HRV is like your stress recovery speedometer. Low HRV means your system is stuck in overdrive. Sleep, exercise, and breathing practices raise it.", source: 'Biopsychology (Pinel)', tags: ['hrv', 'stress'] },
  { gauge: 'body', principle: 'Alcohol disrupts REM sleep for up to 3 nights after drinking', explanation: "Even moderate drinking fragments sleep architecture.", userFriendly: "That drink to relax? It helps you fall asleep but wrecks sleep quality. REM sleep - where emotional processing happens - is disrupted for days.", source: 'Biopsychology (Pinel)', tags: ['alcohol', 'sleep'] },
  { gauge: 'state', principle: 'Vagal tone can be trained through specific exercises', explanation: "Cold exposure, slow breathing, humming stimulate vagus nerve.", userFriendly: "Your vagus nerve is the brake pedal for stress. You can train it: cold water on face, slow exhales, humming. These aren't woo - they're neuroscience.", source: 'Biopsychology (Pinel)', tags: ['vagus', 'regulation'] },
  { gauge: 'state', principle: 'Hypervigilance after trauma is a feature, not a bug', explanation: "The brain learned the world is unsafe and adjusted accordingly.", userFriendly: "If you're always scanning for danger, that's not anxiety - that's a nervous system that learned the world wasn't safe. It's trying to protect you. It can be retrained.", source: 'Clinical (Compas & Gotlib)', tags: ['trauma', 'hypervigilance'] },
  { gauge: 'state', principle: 'Window of tolerance shrinks when basic needs aren\'t met', explanation: "Sleep deprivation, hunger, isolation all narrow the range of tolerable arousal.", userFriendly: "Your window of tolerance - the range where you can handle stress - shrinks when you're tired, hungry, or alone. Small things feel big because your window is small.", source: 'Clinical (Compas & Gotlib)', tags: ['window-of-tolerance'] },
  { gauge: 'emotion', principle: 'Naming an emotion reduces its intensity by 50%', explanation: "Affect labeling activates prefrontal cortex and dampens amygdala.", userFriendly: "Just naming what you feel - \"I'm feeling anxious\" - reduces the intensity by half. It's called affect labeling. Your prefrontal cortex comes online and calms the alarm.", source: 'Cognition (Matlin)', tags: ['labeling', 'regulation'] },
  { gauge: 'emotion', principle: 'Suppressing emotions increases physiological stress', explanation: "Expressive suppression raises blood pressure and cortisol.", userFriendly: "Pushing emotions down doesn't make them go away - it raises your blood pressure and stress hormones. Emotions need to move through, not be locked in.", source: 'Abnormal (Barlow & Durand)', tags: ['suppression', 'stress'] },
  { gauge: 'emotion', principle: 'Grief has no timeline and doesn\'t follow stages', explanation: "The 5 stages model is largely debunked. Grief comes in waves.", userFriendly: "Forget the 5 stages of grief - that's mostly myth. Grief comes in waves, not stages. There's no timeline. Feeling gutted 2 years later is normal.", source: 'Clinical (Compas & Gotlib)', tags: ['grief'] },
  { gauge: 'connection', principle: 'Loneliness is as harmful to health as smoking 15 cigarettes/day', explanation: "Chronic loneliness increases mortality risk by 26%.", userFriendly: "Loneliness isn't just sad - it's a health risk equivalent to smoking 15 cigarettes a day. Your body treats isolation as a threat because historically, it was.", source: 'Social Psychology (Aronson)', tags: ['loneliness', 'health'] },
  { gauge: 'connection', principle: 'Secure attachment can be earned in adulthood', explanation: "Through consistent, safe relationships, insecure patterns can shift.", userFriendly: "You weren't born with your attachment style - you learned it. And you can learn a new one. One consistent, safe relationship can rewire the pattern.", source: 'Developmental (Siegler)', tags: ['attachment', 'earned-secure'] },
  { gauge: 'connection', principle: 'Conflict avoidance predicts relationship failure more than conflict itself', explanation: "Avoiding hard conversations erodes trust and intimacy.", userFriendly: "Fighting doesn't kill relationships - avoiding fights does. Couples who never argue often have the most distance. Healthy conflict is connection.", source: 'Social Psychology (Aronson)', tags: ['conflict', 'avoidance'] },
  { gauge: 'connection', principle: 'Love languages are empirically supported', explanation: "Mismatched expression of care creates disconnection.", userFriendly: "If you show love through acts of service but they need words - you're both trying and both feeling unloved. Learn their language.", source: 'Social Psychology (Aronson)', tags: ['love-languages'] },
  { gauge: 'direction', principle: 'Meaning matters more than happiness for wellbeing', explanation: "Eudaimonic (meaningful) wellbeing predicts health better than hedonic (pleasure).", userFriendly: "Chasing happiness doesn't work. What works is meaning. People with purpose live longer, recover faster, and handle stress better - even if they're not 'happy'.", source: 'Personality (Feist & Feist)', tags: ['meaning', 'purpose'] },
  { gauge: 'direction', principle: 'Small wins compound into momentum', explanation: "Dopamine release from achievement creates positive feedback loops.", userFriendly: "Tiny wins release dopamine, which motivates the next win. Start embarrassingly small. The momentum compounds.", source: 'Biopsychology (Pinel)', tags: ['motivation', 'dopamine'] },
  { gauge: 'alignment', principle: 'Authentic living correlates with lower anxiety and depression', explanation: "Acting in accordance with core values reduces internal conflict.", userFriendly: "The more your life matches who you actually are, the less anxiety you carry. Inauthenticity is exhausting. Your nervous system knows when you're pretending.", source: 'Personality (Feist & Feist)', tags: ['authenticity'] },
  { gauge: 'alignment', principle: 'Boundaries are not walls - they\'re gates', explanation: "Healthy boundaries allow connection while protecting self.", userFriendly: "Boundaries aren't about keeping people out - they're about letting the right things in. No boundary = no self. Too rigid = no connection. It's a gate, not a wall.", source: 'Clinical (Compas & Gotlib)', tags: ['boundaries'] },
  { gauge: 'cross-system', principle: 'Stress affects memory formation and recall', explanation: "Cortisol impairs hippocampal function.", userFriendly: "Can't remember things when stressed? That's cortisol impairing your hippocampus. You're not losing your mind - you're in survival mode, and survival doesn't need memory.", source: 'Cognition (Matlin)', tags: ['stress', 'memory'] },
  { gauge: 'cross-system', principle: 'Morning sunlight sets circadian rhythm and improves mood', explanation: "10 min of morning light increases serotonin and regulates melatonin.", userFriendly: "10 minutes of morning sunlight - no sunglasses - sets your entire system for the day. Better sleep, better mood, more energy. Free medicine.", source: 'Biopsychology (Pinel)', tags: ['circadian', 'light'] },
  { gauge: 'cross-system', principle: 'The body keeps score - trauma is stored somatically', explanation: "Unprocessed trauma manifests as physical symptoms.", userFriendly: "That tension in your shoulders, that stomach knot - your body stores what your mind couldn't process. Sometimes healing requires working with the body, not just talking.", source: 'Clinical (Compas & Gotlib)', tags: ['trauma', 'somatic'] },
  { gauge: 'cross-system', principle: 'Screens before bed suppress melatonin for 3+ hours', explanation: "Blue light disrupts circadian signaling.", userFriendly: "Phone in bed? You're telling your brain it's noon. Melatonin suppression lasts 3+ hours. No wonder you can't sleep. The fix is boring: no screens before bed.", source: 'Biopsychology (Pinel)', tags: ['sleep', 'screens'] },
];

export function getKnowledgeForGauge(gauge: string): KnowledgeFact[] {
  return PSYCH_KNOWLEDGE.filter((k) => k.gauge === gauge || k.gauge === 'cross-system');
}

export function getDailyFact(gauge: string): KnowledgeFact | null {
  const facts = getKnowledgeForGauge(gauge);
  if (facts.length === 0) return null;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return facts[dayOfYear % facts.length];
}

function getGaugeValuesFromStore(): Record<string, number> | undefined {
  try {
    const cockpit = require('../stores/cockpitStore').useCockpitStore.getState();
    return {
      body: cockpit.body?.value ?? -1,
      state: cockpit.state?.value ?? -1,
      emotion: cockpit.emotion?.value ?? -1,
      connection: cockpit.connection?.value ?? -1,
      direction: cockpit.direction?.value ?? -1,
      alignment: cockpit.alignment?.value ?? -1,
    };
  } catch {
    return undefined;
  }
}

export function buildKnowledgePrompt(gaugeValues?: Record<string, number>): string {
  const values = gaugeValues ?? getGaugeValuesFromStore();
  let prompt = `\n\nYOU HAVE ACCESS TO A PSYCHOLOGY KNOWLEDGE BASE from 22+ academic textbooks (Pinel, Matlin, Barlow, Aronson, Siegler, Goldschneider, Feist, Nolen-Hoeksema, Compas, Molnar, etc.).

YOUR JOB: Apply this scientific knowledge to the user's REAL DATA. Not generic advice - specific, evidence-based insights using their actual numbers.

WHEN YOU SEE THEIR DATA, DO THIS:
1. Look at their health data (sleep hours, steps, HRV, cycle phase)
2. Look at their gauge values (Body, State, Emotion, Connection, Direction, Alignment)
3. Find the RELEVANT scientific principle
4. Connect it to THEIR specific numbers
5. Explain WHY they feel how they feel - backed by science

EXAMPLE: If they slept 5 hours and feel anxious:
BAD: "Sleep is important for mood."
GOOD: "You got 5 hours of sleep. Research shows sleep deprivation amplifies amygdala reactivity by 60% - your brain's alarm system is running hot. That anxious feeling isn't weakness; it's neuroscience. Your prefrontal cortex is literally offline."

BE SPECIFIC. USE THEIR NUMBERS. CITE THE SCIENCE. GIVE THEM UNDERSTANDING.

WHEN EXPLAINING A CONCEPT FROM THE LIST BELOW: Use the userFriendly phrasing as your main answer. Add one short real-life example so it lands. One concept per response; if they want more, offer "Want to go deeper?" and then expand. Psychology without the jargon.

RELEVANT KNOWLEDGE:\n`;
  if (values) {
    const lowGauges = Object.entries(values)
      .filter(([, v]) => typeof v === 'number' && v >= 0 && v < 50)
      .map(([k]) => k);
    if (lowGauges.length > 0) {
      lowGauges.forEach((g) => {
        const facts = getKnowledgeForGauge(g);
        [...facts].sort(() => Math.random() - 0.5).slice(0, 2).forEach((f) => {
          prompt += `- [${f.gauge.toUpperCase()}] ${f.principle}: ${f.userFriendly}\n`;
        });
      });
    }
    const crossFacts = PSYCH_KNOWLEDGE.filter((k) => k.gauge === 'cross-system');
    [...crossFacts].sort(() => Math.random() - 0.5).slice(0, 2).forEach((f) => {
      prompt += `- [CROSS-SYSTEM] ${f.principle}: ${f.userFriendly}\n`;
    });
  } else {
    [...PSYCH_KNOWLEDGE].sort(() => Math.random() - 0.5).slice(0, 5).forEach((f) => {
      prompt += `- [${f.gauge.toUpperCase()}] ${f.principle}: ${f.userFriendly}\n`;
    });
  }
  return prompt;
}
