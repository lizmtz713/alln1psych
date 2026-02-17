/**
 * Psychology Knowledge Base — AllN1 Psych
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
  { gauge: 'body', principle: 'Sleep deprivation amplifies amygdala reactivity by up to 60%', explanation: 'Amygdala becomes hyperactive while prefrontal cortex goes offline.', userFriendly: "You got 5 hours of sleep? Your emotional reactions are running about 60% hotter than normal. Your brain's alarm system is on high alert.", source: 'Biopsychology (Pinel)', tags: ['sleep', 'amygdala'] },
  { gauge: 'body', principle: 'Dehydration of 1-2% impairs cognitive function and mood', explanation: 'Brain is ~75% water. Mild dehydration affects working memory and elevates anxiety.', userFriendly: "When did you last drink water? Your brain is 75% water. Even slight dehydration makes everything feel harder.", source: 'Biopsychology (Pinel)', tags: ['hydration', 'cognition'] },
  { gauge: 'body', principle: 'Low blood sugar mimics anxiety symptoms', explanation: 'Hypoglycemia triggers the same adrenaline response as threat.', userFriendly: "That anxious feeling? When did you last eat? Low blood sugar creates the exact same physical sensation as anxiety. Eat something with protein.", source: 'Biopsychology (Pinel)', tags: ['nutrition', 'anxiety'] },
  { gauge: 'body', principle: "Exercise produces BDNF — the brain's growth fertilizer", explanation: 'BDNF promotes neuroplasticity. A 20-minute walk increases it.', userFriendly: "When you move, your brain releases BDNF — fertilizer for your brain. A 20-minute walk does it. Movement is medicine for your brain.", source: 'Biopsychology (Pinel)', tags: ['exercise', 'BDNF'] },
  { gauge: 'body', principle: '95% of serotonin is produced in the gut', explanation: 'Gut-brain axis means digestive health directly affects mood.', userFriendly: "95% of your serotonin is made in your gut. When you eat poorly, your mood suffers. Chemically. Your gut and brain are in constant conversation.", source: 'Biopsychology (Pinel)', tags: ['gut-brain', 'serotonin'] },
  { gauge: 'body', principle: 'Chronic sleep debt cannot be repaid with one good night', explanation: 'Missing 2hr/night for a week = cognitive equivalent of 48hr awake.', userFriendly: "You can't catch up on sleep with one good night. That foggy feeling? That's accumulated sleep debt.", source: 'Biopsychology (Pinel)', tags: ['sleep-debt'] },
  { gauge: 'body', principle: 'Caffeine masks fatigue while increasing stress hormones', explanation: 'Caffeine blocks adenosine and increases cortisol.', userFriendly: "Caffeine doesn't give you energy. It blocks the tired signal while pumping up stress hormones. Third coffee and anxious? The coffee might be the problem.", source: 'Biopsychology (Pinel)', tags: ['caffeine', 'cortisol'] },
  { gauge: 'state', principle: 'Your nervous system has three modes, not two', explanation: 'Beyond fight-or-flight and rest there is freeze/shutdown.', userFriendly: "There's a third mode: freeze. When your system gets SO overwhelmed it shuts down. That's not laziness. That's your oldest survival system.", source: 'Biopsychology (Pinel)', tags: ['polyvagal', 'freeze'] },
  { gauge: 'state', principle: 'You cannot think your way out of nervous system activation', explanation: 'Autonomic system runs faster than thought. Body must be regulated first.', userFriendly: "Just calm down doesn't work. Your nervous system runs faster than your thinking brain. Calm the body FIRST. Body first. Mind second.", source: 'Biopsychology (Pinel)', tags: ['regulation', 'body-first'] },
  { gauge: 'state', principle: "Co-regulation: a calm person calms another's nervous system", explanation: 'Humans are designed to be regulated by other nervous systems.', userFriendly: "If someone calm sits next to you when you're spiraling, your nervous system literally starts matching theirs. That's co-regulation. That's biology.", source: 'Biopsychology (Pinel)', tags: ['co-regulation'] },
  { gauge: 'emotion', principle: 'At least 27 documented emotions — not just happy, sad, mad', explanation: 'Emotional granularity predicts mental health.', userFriendly: "Most people use 5 emotion words. There are 27+ documented emotions. The more precisely you name what you feel, the better your brain can process it.", source: 'Cognition (Matlin)', tags: ['granularity'] },
  { gauge: 'emotion', principle: 'Anger is usually a secondary emotion hiding something vulnerable', explanation: 'Anger often masks hurt, fear, or powerlessness.', userFriendly: "Anger is almost never the real thing. It's the bodyguard. Underneath there's usually hurt, fear, or powerlessness. Find what's under it.", source: 'Clinical (Compas & Gotlib)', tags: ['anger', 'secondary'] },
  { gauge: 'emotion', principle: 'Anxiety and excitement produce identical physical sensations', explanation: 'Same heart rate, adrenaline. Only the label differs.', userFriendly: "Your body can't tell anxiety from excitement. Same chemistry. Next time you feel anxious, try saying I'm excited. It can work.", source: 'Cognition (Matlin)', tags: ['anxiety', 'reappraisal'] },
  { gauge: 'emotion', principle: 'Rumination amplifies and extends depression', explanation: 'Replaying without resolution predicts depression severity.', userFriendly: "Replaying the same situation over and over is rumination — a strong predictor of depression. Breaking it requires action, not more thinking.", source: 'Abnormal (Nolen-Hoeksema)', tags: ['rumination', 'depression'] },
  { gauge: 'connection', principle: 'Social exclusion activates same brain regions as physical pain', explanation: 'Rejection is processed in the same region as physical injury.', userFriendly: "Being left out doesn't just hurt emotionally — your brain processes it in the same region as a broken bone. Rejection literally hurts.", source: 'Social Psychology (Aronson)', tags: ['rejection', 'pain'] },
  { gauge: 'connection', principle: 'Attachment styles from childhood predict adult relationship patterns', explanation: 'Secure, anxious, avoidant templates form in first 2-3 years. Can be updated.', userFriendly: "Your caregivers' responses in your first years created a blueprint for every relationship since. It's not your fault. Patterns can be rewritten.", source: 'Developmental (Siegler)', tags: ['attachment'] },
  { gauge: 'connection', principle: 'Connection quality matters more than quantity', explanation: '2-3 deep relationships protect more than 500 shallow ones.', userFriendly: "You could have 2,000 followers and feel alone. Research shows 2-3 deep relationships protect mental health more than 500 shallow ones.", source: 'Social Psychology (Aronson)', tags: ['quality', 'depth'] },
  { gauge: 'direction', principle: 'Humans need forward motion toward something meaningful', explanation: 'Perceived progress toward meaningful goals protects against depression.', userFriendly: "We need to feel we're moving toward something that matters. When direction disappears, the emptiness can feel like depression. Sometimes the fix is finding the next thing that matters.", source: 'Personality (Feist & Feist)', tags: ['purpose', 'depression'] },
  { gauge: 'alignment', principle: 'Acting against your values creates measurable physiological stress', explanation: 'Cognitive dissonance creates discomfort as a regulatory signal.', userFriendly: "That background anxiety you can't explain? Check your Alignment. When actions don't match values, your body generates stress. The stress IS the signal.", source: 'Social Psychology (Aronson)', tags: ['dissonance', 'values'] },
  { gauge: 'alignment', principle: 'People-pleasing is a survival strategy, not a personality trait', explanation: 'Fawning develops when saying no was unsafe.', userFriendly: "If you can't say no without guilt, that's a survival pattern. Every yes that should be a no drops your Alignment gauge. You're running software from when you had no choice.", source: 'Clinical (Compas & Gotlib)', tags: ['people-pleasing', 'boundaries'] },
  { gauge: 'cross-system', principle: 'Every condition involves body, mind, AND social factors', explanation: 'No condition is purely one thing. Depression is body + mind + social + purpose + alignment.', userFriendly: "Depression isn't just chemical or just thinking. It's all of them at once. That's why no single fix works alone. Address the whole system. That's why this cockpit exists.", source: 'Abnormal (Barlow & Durand)', tags: ['biopsychosocial'] },
  { gauge: 'cross-system', principle: "Anxiety that doesn't respond to mental techniques may be biological", explanation: 'Check Body: sleep, caffeine, hormones, nutrition.', userFriendly: "If breathing and positive thinking don't help — check your body. Sometimes anxiety isn't psychological. It's biological. No amount of meditation fixes sleep deprivation.", source: 'Biopsychology (Pinel)', tags: ['anxiety', 'body-first'] },
  { gauge: 'cross-system', principle: 'Isolation amplifies every problem; connection buffers every problem', explanation: 'Red Connection makes every other gauge harder to improve.', userFriendly: "If your Connection gauge is red, everything else gets worse. One real relationship can buffer against almost everything. Who knows about what you're struggling with?", source: 'Social Psychology (Aronson)', tags: ['isolation', 'connection'] },
  { gauge: 'cross-system', principle: "There is no universal healthy baseline — variation is normal", explanation: "The cockpit tracks YOUR patterns, not someone else's average.", userFriendly: "There is no normal. Human variation is enormous. This app tracks YOU over time. The only question: are you doing better than YOUR yesterday?", source: 'Biological Anthropology (Molnar)', tags: ['variation', 'baseline'] },
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
  let prompt = `\n\nYOU HAVE ACCESS TO A PSYCHOLOGY KNOWLEDGE BASE from 22 textbooks. USE it. Be INFORMATIVE. Teach something they didn't know. Connect science to their situation.\n\nRULES: State facts naturally ("Sleep deprivation amplifies emotional reactions by 60%"). Connect to THEIR situation. Give them language they can use. Be direct, not clinical.\n\nRELEVANT KNOWLEDGE:\n`;
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
