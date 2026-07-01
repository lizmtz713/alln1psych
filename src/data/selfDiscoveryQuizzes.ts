/**
 * Self-Discovery quizzes — 8 short, research-backed insight tools.
 * Big Five, Attachment (external), Stress Response, Decision Style, Motivation, Social Energy, Thinking Bias, Conflict Style.
 */

import type {
  SelfDiscoveryQuiz,
  SelfDiscoveryQuizExternal,
  SelfDiscoveryQuizInline,
  SelfDiscoveryQuestion,
  SelfDiscoveryResult,
} from '../types/selfDiscovery';
import { isInlineQuiz } from '../types/selfDiscovery';
export { isInlineQuiz };

const attachmentExternal: SelfDiscoveryQuizExternal = {
  id: 'attachment',
  type: 'external',
  title: 'Attachment Style',
  shortTitle: 'Attachment Style',
  emoji: '🌳',
  description: 'How you relate to others in close relationships.',
  timeEstimate: '3 min',
  route: '/(modals)/attachment-style',
};

// —— Big Five Snapshot (5 traits, scale 1–5, show top 2) ——
const bigFiveQuestions: SelfDiscoveryQuestion[] = [
  { id: 'o1', text: 'I enjoy exploring new ideas and trying new experiences.', scaleLabels: ['Not like me', 'Very much like me'], options: [] },
  { id: 'c1', text: 'I stay organized and finish what I start.', scaleLabels: ['Not like me', 'Very much like me'], options: [] },
  { id: 'e1', text: 'I feel energized when I\'m around people.', scaleLabels: ['Not like me', 'Very much like me'], options: [] },
  { id: 'a1', text: 'I prefer to cooperate and keep the peace.', scaleLabels: ['Not like me', 'Very much like me'], options: [] },
  { id: 'n1', text: 'I notice my emotions easily and sometimes feel stressed.', scaleLabels: ['Not like me', 'Very much like me'], options: [] },
];

const bigFiveDimensionFromId: Record<string, string> = {
  o1: 'openness', c1: 'conscientiousness', e1: 'extraversion', a1: 'agreeableness', n1: 'neuroticism',
};

const bigFiveResults: Record<string, SelfDiscoveryResult> = {
  openness: { key: 'openness', title: 'Openness', emoji: '🔮', insight: 'You score high in openness and curiosity. You may enjoy exploring ideas and learning new things.', gauges: ['direction', 'alignment'], whatHelps: ['Lean into learning and creativity.', 'Try the Life Direction Finder or new lessons.'] },
  conscientiousness: { key: 'conscientiousness', title: 'Conscientiousness', emoji: '📋', insight: 'You tend to be organized and reliable. You get things done and value order.', gauges: ['direction', 'state'], whatHelps: ['Use intention-setting and small goals.', 'Quick Reset can help when you feel scattered.'] },
  extraversion: { key: 'extraversion', title: 'Extraversion', emoji: '⚡', insight: 'You gain energy from people and activity. Social connection fuels you.', gauges: ['connection', 'state'], whatHelps: ['Protect time for connection.', 'Reach Out tool can help you stay in touch.'] },
  agreeableness: { key: 'agreeableness', title: 'Agreeableness', emoji: '🤝', insight: 'You value cooperation and harmony. You tend to be trusting and kind.', gauges: ['connection', 'alignment'], whatHelps: ['Balance kindness with boundaries.', 'Use the Boundaries tool when you over-give.'] },
  neuroticism: { key: 'neuroticism', title: 'Emotional sensitivity', emoji: '🌊', insight: 'You notice emotions and stress easily. This isn\'t a flaw — it\'s sensitivity. Learning to regulate helps.', gauges: ['emotion', 'state'], whatHelps: ['Practice grounding and Quick Reset.', 'Name emotions to tame them (emotion wheel).'] },
};

// —— Stress Response (fight/flight/freeze/fawn) ——
const stressQuestions: SelfDiscoveryQuestion[] = [
  { id: 's1', text: 'When something stressful happens, I usually want to...', options: [{ value: 'fight', label: 'Confront it or push back', dimension: 'fight' }, { value: 'flight', label: 'Get away or distract myself', dimension: 'flight' }, { value: 'freeze', label: 'Shut down or feel stuck', dimension: 'freeze' }, { value: 'fawn', label: 'Please others or fix the situation', dimension: 'fawn' }] },
  { id: 's2', text: 'Under pressure, my first instinct is to...', options: [{ value: 'fight', label: 'Stand my ground', dimension: 'fight' }, { value: 'flight', label: 'Leave or avoid', dimension: 'flight' }, { value: 'freeze', label: 'Go blank or wait it out', dimension: 'freeze' }, { value: 'fawn', label: 'Smooth things over', dimension: 'fawn' }] },
  { id: 's3', text: 'When I feel overwhelmed, I often...', options: [{ value: 'fight', label: 'Get irritable or argumentative', dimension: 'fight' }, { value: 'flight', label: 'Scroll, busy myself, or escape', dimension: 'flight' }, { value: 'freeze', label: 'Can\'t think or move', dimension: 'freeze' }, { value: 'fawn', label: 'Focus on what others need', dimension: 'fawn' }] },
  { id: 's4', text: 'In conflict, I tend to...', options: [{ value: 'fight', label: 'Push back or defend', dimension: 'fight' }, { value: 'flight', label: 'Withdraw or change the subject', dimension: 'flight' }, { value: 'freeze', label: 'Go silent or feel paralyzed', dimension: 'freeze' }, { value: 'fawn', label: 'Apologize or accommodate', dimension: 'fawn' }] },
  { id: 's5', text: 'My body often reacts to stress by...', options: [{ value: 'fight', label: 'Tension, anger, ready to act', dimension: 'fight' }, { value: 'flight', label: 'Restlessness, wanting to leave', dimension: 'flight' }, { value: 'freeze', label: 'Numbness, can\'t move', dimension: 'freeze' }, { value: 'fawn', label: 'Trying to fix or comfort others', dimension: 'fawn' }] },
  { id: 's6', text: 'When criticized, I usually...', options: [{ value: 'fight', label: 'Defend or counter-criticize', dimension: 'fight' }, { value: 'flight', label: 'Withdraw or avoid the person', dimension: 'flight' }, { value: 'freeze', label: 'Shut down or go blank', dimension: 'freeze' }, { value: 'fawn', label: 'Try to make them happy again', dimension: 'fawn' }] },
];

const stressResults: Record<string, SelfDiscoveryResult> = {
  fight: { key: 'fight', title: 'Fight', emoji: '🦁', insight: 'You tend to confront or push back under stress. Your nervous system mobilizes to stand your ground.', gauges: ['state', 'emotion'], whatHelps: ['Pause before reacting. Count to three.', 'Use grounding (5-4-3-2-1) to regulate before responding.'] },
  flight: { key: 'flight', title: 'Flight', emoji: '🦅', insight: 'You tend to escape or distract yourself when overwhelmed. Your system wants to get away.', gauges: ['state', 'emotion'], whatHelps: ['Pause before reacting. Use grounding techniques.', 'Quick Reset can help you come back into your body.'] },
  freeze: { key: 'freeze', title: 'Freeze', emoji: '🦌', insight: 'You may shut down or feel stuck under stress. Your nervous system is trying to protect you.', gauges: ['state', 'emotion'], whatHelps: ['Small movements (feet on floor, wiggle fingers) to come back.', 'Grounding and breath; no need to fix it all at once.'] },
  fawn: { key: 'fawn', title: 'Fawn', emoji: '🕊️', insight: 'You may focus on pleasing others or fixing the situation when stressed. Your system seeks safety through connection.', gauges: ['state', 'emotion', 'connection'], whatHelps: ['Check in: what do I need right now?', 'Boundaries tool and saying no in small ways.'] },
};

// —— Decision Style ——
const decisionQuestions: SelfDiscoveryQuestion[] = [
  { id: 'd1', text: 'When making a big decision, I usually...', options: [{ value: 'analytical', label: 'List pros and cons, research', dimension: 'analytical' }, { value: 'intuitive', label: 'Go with my gut', dimension: 'intuitive' }, { value: 'avoidant', label: 'Put it off until I have to', dimension: 'avoidant' }, { value: 'dependent', label: 'Ask others what they think', dimension: 'dependent' }] },
  { id: 'd2', text: 'I trust my decisions most when...', options: [{ value: 'analytical', label: 'I\'ve looked at the data', dimension: 'analytical' }, { value: 'intuitive', label: 'It feels right', dimension: 'intuitive' }, { value: 'avoidant', label: 'Someone else decides', dimension: 'avoidant' }, { value: 'dependent', label: 'Others agree', dimension: 'dependent' }] },
  { id: 'd3', text: 'When I\'m unsure, I tend to...', options: [{ value: 'analytical', label: 'Gather more information', dimension: 'analytical' }, { value: 'intuitive', label: 'Sleep on it and see how I feel', dimension: 'intuitive' }, { value: 'avoidant', label: 'Avoid choosing', dimension: 'avoidant' }, { value: 'dependent', label: 'Get advice from people I trust', dimension: 'dependent' }] },
  { id: 'd4', text: 'My worst decisions happened when...', options: [{ value: 'analytical', label: 'I overthought and got stuck', dimension: 'analytical' }, { value: 'intuitive', label: 'I ignored red flags', dimension: 'intuitive' }, { value: 'avoidant', label: 'I waited too long', dimension: 'avoidant' }, { value: 'dependent', label: 'I did what others wanted', dimension: 'dependent' }] },
  { id: 'd5', text: 'I make daily choices mostly by...', options: [{ value: 'analytical', label: 'Routine and logic', dimension: 'analytical' }, { value: 'intuitive', label: 'What feels right in the moment', dimension: 'intuitive' }, { value: 'avoidant', label: 'Default or habit', dimension: 'avoidant' }, { value: 'dependent', label: 'What others expect', dimension: 'dependent' }] },
  { id: 'd6', text: 'When two options are both okay, I...', options: [{ value: 'analytical', label: 'Compare them carefully', dimension: 'analytical' }, { value: 'intuitive', label: 'Pick one and move on', dimension: 'intuitive' }, { value: 'avoidant', label: 'Delay until one disappears', dimension: 'avoidant' }, { value: 'dependent', label: 'Ask someone to break the tie', dimension: 'dependent' }] },
];

const decisionResults: Record<string, SelfDiscoveryResult> = {
  analytical: { key: 'analytical', title: 'Analytical', emoji: '📊', insight: 'You rely on logic and information when making choices. You like to weigh options carefully.', gauges: ['direction', 'alignment'], whatHelps: ['Use the Decision tool when stuck.', 'Set a time limit so analysis doesn\'t become paralysis.'] },
  intuitive: { key: 'intuitive', title: 'Intuitive', emoji: '✨', insight: 'You rely strongly on intuition when making decisions. You often "just know."', gauges: ['direction', 'alignment'], whatHelps: ['Check in with your body: does this choice align with your values?', 'Life Direction Finder can clarify what you want.'] },
  avoidant: { key: 'avoidant', title: 'Avoidant', emoji: '⏸️', insight: 'You may put off decisions or wait until the choice is made for you. Reducing the stakes can help.', gauges: ['direction', 'state'], whatHelps: ['Break the decision into one small step.', 'Decision tool and "what would I do if I weren\'t afraid?"'] },
  dependent: { key: 'dependent', title: 'Dependent', emoji: '👥', insight: 'You often look to others before deciding. Your own voice matters too.', gauges: ['direction', 'connection'], whatHelps: ['Ask yourself first: what do I want? Then get input.', 'Practice one small decision on your own.'] },
};

// —— Motivation Type (SDT-inspired) ——
const motivationQuestions: SelfDiscoveryQuestion[] = [
  { id: 'm1', text: 'I feel most motivated when...', options: [{ value: 'purpose', label: 'What I do has meaning', dimension: 'purpose' }, { value: 'reward', label: 'I see clear rewards or results', dimension: 'reward' }, { value: 'curiosity', label: 'I\'m learning something new', dimension: 'curiosity' }, { value: 'social', label: 'Others count on me or I\'m part of a team', dimension: 'social' }] },
  { id: 'm2', text: 'I keep going when things get hard because...', options: [{ value: 'purpose', label: 'It matters to me deeply', dimension: 'purpose' }, { value: 'reward', label: 'I want the outcome', dimension: 'reward' }, { value: 'curiosity', label: 'I want to see how it turns out', dimension: 'curiosity' }, { value: 'social', label: 'I don\'t want to let people down', dimension: 'social' }] },
  { id: 'm3', text: 'The best feedback for me is...', options: [{ value: 'purpose', label: 'Knowing I made a difference', dimension: 'purpose' }, { value: 'reward', label: 'Recognition or tangible results', dimension: 'reward' }, { value: 'curiosity', label: 'Understanding how things work', dimension: 'curiosity' }, { value: 'social', label: 'Connection and belonging', dimension: 'social' }] },
  { id: 'm4', text: 'I lose motivation when...', options: [{ value: 'purpose', label: 'It feels pointless', dimension: 'purpose' }, { value: 'reward', label: 'There\'s no visible payoff', dimension: 'reward' }, { value: 'curiosity', label: 'It\'s boring or repetitive', dimension: 'curiosity' }, { value: 'social', label: 'I feel alone in it', dimension: 'social' }] },
  { id: 'm5', text: 'I\'m most energized by...', options: [{ value: 'purpose', label: 'A cause or mission', dimension: 'purpose' }, { value: 'reward', label: 'Wins and progress', dimension: 'reward' }, { value: 'curiosity', label: 'New challenges and ideas', dimension: 'curiosity' }, { value: 'social', label: 'Working with or for others', dimension: 'social' }] },
  { id: 'm6', text: 'My ideal work or project...', options: [{ value: 'purpose', label: 'Aligns with my values', dimension: 'purpose' }, { value: 'reward', label: 'Has clear milestones and rewards', dimension: 'reward' }, { value: 'curiosity', label: 'Lets me learn and grow', dimension: 'curiosity' }, { value: 'social', label: 'Connects me to people', dimension: 'social' }] },
];

const motivationResults: Record<string, SelfDiscoveryResult> = {
  purpose: { key: 'purpose', title: 'Purpose-driven', emoji: '🧭', insight: 'You are strongly motivated by purpose and meaning. You want what you do to matter.', gauges: ['alignment', 'direction'], whatHelps: ['Connect daily tasks to your "why."', '12 Life Questions — Purpose and Meaning.'] },
  reward: { key: 'reward', title: 'Reward-driven', emoji: '🏆', insight: 'You are motivated by clear outcomes and recognition. You like to see progress.', gauges: ['direction', 'state'], whatHelps: ['Set small milestones and celebrate them.', 'Win Capture tool to track wins.'] },
  curiosity: { key: 'curiosity', title: 'Curiosity-driven', emoji: '🔬', insight: 'You are motivated by learning and novelty. You thrive when things are interesting.', gauges: ['direction', 'alignment'], whatHelps: ['Follow one "interesting" thread at a time.', 'Learn tab and new lessons.'] },
  social: { key: 'social', title: 'Social-driven', emoji: '🤝', insight: 'You are motivated by connection and others. You do well when part of something bigger.', gauges: ['connection', 'direction'], whatHelps: ['Protect time for people who matter.', 'Circle and Reach Out.'] },
};

// —— Social Energy ——
const socialEnergyQuestions: SelfDiscoveryQuestion[] = [
  { id: 'e1', text: 'After a busy day with people, I usually...', options: [{ value: 'people', label: 'Feel energized and want more', dimension: 'people' }, { value: 'balanced', label: 'Feel fine either way', dimension: 'balanced' }, { value: 'solitude', label: 'Need quiet time alone', dimension: 'solitude' }] },
  { id: 'e2', text: 'I recharge best by...', options: [{ value: 'people', label: 'Talking to friends or being around others', dimension: 'people' }, { value: 'balanced', label: 'Mix of social and alone time', dimension: 'balanced' }, { value: 'solitude', label: 'Being alone, no demands', dimension: 'solitude' }] },
  { id: 'e3', text: 'Too much time alone makes me...', options: [{ value: 'people', label: 'Lonely or low', dimension: 'people' }, { value: 'balanced', label: 'It depends', dimension: 'balanced' }, { value: 'solitude', label: 'Actually fine — I need it', dimension: 'solitude' }] },
  { id: 'e4', text: 'On a free weekend, I\'d rather...', options: [{ value: 'people', label: 'Make plans with people', dimension: 'people' }, { value: 'balanced', label: 'Some plans, some solo time', dimension: 'balanced' }, { value: 'solitude', label: 'Keep it open or stay home', dimension: 'solitude' }] },
  { id: 'e5', text: 'When I\'m drained, the best fix is...', options: [{ value: 'people', label: 'A good conversation or hangout', dimension: 'people' }, { value: 'balanced', label: 'Either connection or quiet', dimension: 'balanced' }, { value: 'solitude', label: 'Quiet, no one needing anything', dimension: 'solitude' }] },
  { id: 'e6', text: 'I feel most like myself when...', options: [{ value: 'people', label: 'I\'m with people I care about', dimension: 'people' }, { value: 'balanced', label: 'I have a balance of both', dimension: 'balanced' }, { value: 'solitude', label: 'I have space to think and be alone', dimension: 'solitude' }] },
];

const socialEnergyResults: Record<string, SelfDiscoveryResult> = {
  people: { key: 'people', title: 'Energized by people', emoji: '⚡', insight: 'You regain energy through connection. Time with others refuels you.', gauges: ['connection', 'state'], whatHelps: ['Schedule regular connection. Protect it.', 'Reach Out when you\'ve been isolated.'] },
  balanced: { key: 'balanced', title: 'Balanced', emoji: '⚖️', insight: 'You recharge through a mix of people and solitude. You adapt to what you need.', gauges: ['connection', 'state'], whatHelps: ['Tune in: do I need people or quiet today?', 'Honor both needs.'] },
  solitude: { key: 'solitude', title: 'Energized by solitude', emoji: '🌙', insight: 'You regain energy best through quiet, independent activities. Solitude restores you.', gauges: ['connection', 'state'], whatHelps: ['Protect alone time without guilt.', 'Boundaries: say no to social overload.'] },
};

// —— Thinking Bias Finder ——
const biasQuestions: SelfDiscoveryQuestion[] = [
  { id: 'b1', text: 'When something goes wrong, I often...', options: [{ value: 'catastrophizing', label: 'Assume the worst will happen', dimension: 'catastrophizing' }, { value: 'confirmation', label: 'Look for evidence I was right', dimension: 'confirmation' }, { value: 'blackwhite', label: 'See it as all bad or all good', dimension: 'blackwhite' }] },
  { id: 'b2', text: 'When I get critical feedback, I tend to...', options: [{ value: 'catastrophizing', label: 'Think everything is falling apart', dimension: 'catastrophizing' }, { value: 'confirmation', label: 'Remember only the negative', dimension: 'confirmation' }, { value: 'blackwhite', label: 'Feel like a total failure', dimension: 'blackwhite' }] },
  { id: 'b3', text: 'In uncertain situations, I often...', options: [{ value: 'catastrophizing', label: 'Imagine the worst outcome', dimension: 'catastrophizing' }, { value: 'confirmation', label: 'Stick to what I already believe', dimension: 'confirmation' }, { value: 'blackwhite', label: 'See only one "right" way', dimension: 'blackwhite' }] },
  { id: 'b4', text: 'When I disagree with someone, I...', options: [{ value: 'catastrophizing', label: 'Worry the relationship is ruined', dimension: 'catastrophizing' }, { value: 'confirmation', label: 'Focus on points that support my view', dimension: 'confirmation' }, { value: 'blackwhite', label: 'Think they\'re wrong and I\'m right', dimension: 'blackwhite' }] },
  { id: 'b5', text: 'I notice I sometimes...', options: [{ value: 'catastrophizing', label: 'Jump to the worst conclusion', dimension: 'catastrophizing' }, { value: 'confirmation', label: 'Dismiss info that doesn\'t fit', dimension: 'confirmation' }, { value: 'blackwhite', label: 'Label people or situations as all one way', dimension: 'blackwhite' }] },
  { id: 'b6', text: 'Under stress, my thinking becomes...', options: [{ value: 'catastrophizing', label: 'Very negative and doom-focused', dimension: 'catastrophizing' }, { value: 'confirmation', label: 'Stuck on what I already think', dimension: 'confirmation' }, { value: 'blackwhite', label: 'Either/or — no middle ground', dimension: 'blackwhite' }] },
];

const biasResults: Record<string, SelfDiscoveryResult> = {
  catastrophizing: { key: 'catastrophizing', title: 'Catastrophizing', emoji: '🌧️', insight: 'You tend to assume the worst outcome in stressful situations. Your brain is trying to protect you by anticipating danger.', gauges: ['emotion', 'state'], whatHelps: ['Ask: What\'s the evidence? What\'s a more likely outcome?', 'Think tool and grounding before spiraling.'] },
  confirmation: { key: 'confirmation', title: 'Confirmation bias', emoji: '🔍', insight: 'You may notice only what fits what you already believe. We all do this — awareness helps.', gauges: ['alignment', 'emotion'], whatHelps: ['Ask: What would change my mind?', 'Bias Check tool when making decisions.'] },
  blackwhite: { key: 'blackwhite', title: 'Black-and-white thinking', emoji: '⬛⬜', insight: 'You may see situations or people as all good or all bad. Shades of gray exist.', gauges: ['emotion', 'alignment'], whatHelps: ['Look for one gray area in a situation.', 'Think tool to challenge either/or.'] },
};

// —— Conflict Style ——
const conflictQuestions: SelfDiscoveryQuestion[] = [
  { id: 'c1', text: 'In a disagreement, I usually...', options: [{ value: 'avoiding', label: 'Avoid or change the subject', dimension: 'avoiding' }, { value: 'accommodating', label: 'Give in to keep peace', dimension: 'accommodating' }, { value: 'competing', label: 'Push for my view', dimension: 'competing' }, { value: 'compromising', label: 'Look for a middle ground', dimension: 'compromising' }, { value: 'collaborating', label: 'Try to find a solution that works for both', dimension: 'collaborating' }] },
  { id: 'c2', text: 'When someone is upset with me, I tend to...', options: [{ value: 'avoiding', label: 'Withdraw until it blows over', dimension: 'avoiding' }, { value: 'accommodating', label: 'Apologize or fix it quickly', dimension: 'accommodating' }, { value: 'competing', label: 'Defend myself', dimension: 'competing' }, { value: 'compromising', label: 'Meet halfway', dimension: 'compromising' }, { value: 'collaborating', label: 'Talk it through until we understand each other', dimension: 'collaborating' }] },
  { id: 'c3', text: 'I feel conflict is resolved when...', options: [{ value: 'avoiding', label: 'We stop talking about it', dimension: 'avoiding' }, { value: 'accommodating', label: 'The other person is happy', dimension: 'accommodating' }, { value: 'competing', label: 'I got my way', dimension: 'competing' }, { value: 'compromising', label: 'We both gave a little', dimension: 'compromising' }, { value: 'collaborating', label: 'We found something that works for both', dimension: 'collaborating' }] },
  { id: 'c4', text: 'My main goal in conflict is usually...', options: [{ value: 'avoiding', label: 'To not make it worse', dimension: 'avoiding' }, { value: 'accommodating', label: 'To keep the relationship', dimension: 'accommodating' }, { value: 'competing', label: 'To win or be heard', dimension: 'competing' }, { value: 'compromising', label: 'To get to a fair split', dimension: 'compromising' }, { value: 'collaborating', label: 'To understand and solve it together', dimension: 'collaborating' }] },
  { id: 'c5', text: 'I\'m most comfortable when...', options: [{ value: 'avoiding', label: 'We don\'t have to argue', dimension: 'avoiding' }, { value: 'accommodating', label: 'Everyone gets along', dimension: 'accommodating' }, { value: 'competing', label: 'My position is clear', dimension: 'competing' }, { value: 'compromising', label: 'Nobody loses everything', dimension: 'compromising' }, { value: 'collaborating', label: 'We work through it openly', dimension: 'collaborating' }] },
  { id: 'c6', text: 'When I have to confront someone, I...', options: [{ value: 'avoiding', label: 'Put it off as long as possible', dimension: 'avoiding' }, { value: 'accommodating', label: 'Soft-pedal so they don\'t get upset', dimension: 'accommodating' }, { value: 'competing', label: 'State my case clearly', dimension: 'competing' }, { value: 'compromising', label: 'Offer a deal', dimension: 'compromising' }, { value: 'collaborating', label: 'Invite them to problem-solve with me', dimension: 'collaborating' }] },
];

const conflictResults: Record<string, SelfDiscoveryResult> = {
  avoiding: { key: 'avoiding', title: 'Avoiding', emoji: '🚶', insight: 'You often avoid conflict to maintain harmony. Sometimes that helps; sometimes issues pile up.', gauges: ['connection', 'emotion'], whatHelps: ['Pick one small issue to address. Use Relationship Repair.', 'Pre-Check before a hard conversation.'] },
  accommodating: { key: 'accommodating', title: 'Accommodating', emoji: '🤲', insight: 'You often give in to keep the peace. Your needs matter too.', gauges: ['connection', 'alignment'], whatHelps: ['Say one need out loud. Boundaries tool.', 'Relationship Repair when you\'ve over-accommodated.'] },
  competing: { key: 'competing', title: 'Competing', emoji: '🦁', insight: 'You tend to push for your view. Winning can cost connection.', gauges: ['connection', 'emotion'], whatHelps: ['Ask: What does the other person need? Relate tool.', 'Referee when you\'re both dug in.'] },
  compromising: { key: 'compromising', title: 'Compromising', emoji: '⚖️', insight: 'You look for middle ground. Sometimes that works; sometimes both feel shortchanged.', gauges: ['connection', 'alignment'], whatHelps: ['Check if compromise is fair or just fast.', 'Collaborating may get a better outcome.'] },
  collaborating: { key: 'collaborating', title: 'Collaborating', emoji: '🤝', insight: 'You try to find solutions that work for both. That takes time but often strengthens connection.', gauges: ['connection', 'alignment'], whatHelps: ['Keep using this when the stakes are high.', 'Resolve and Referee tools support this.'] },
};

/** All 8 Self-Discovery quizzes. Attachment is external (opens existing modal). */
export const SELF_DISCOVERY_QUIZZES: SelfDiscoveryQuiz[] = [
  attachmentExternal,
  {
    id: 'big-five',
    type: 'inline',
    title: 'Big Five Personality Snapshot',
    shortTitle: 'Big Five',
    emoji: '🌈',
    description: 'Five traits that shape how you approach life: openness, conscientiousness, extraversion, agreeableness, emotional sensitivity.',
    timeEstimate: '2 min',
    questions: bigFiveQuestions,
    dimensionToResultKey: { openness: 'openness', conscientiousness: 'conscientiousness', extraversion: 'extraversion', agreeableness: 'agreeableness', neuroticism: 'neuroticism' },
    results: bigFiveResults,
  },
  {
    id: 'stress-response',
    type: 'inline',
    title: 'Stress Response Style',
    shortTitle: 'Stress Response',
    emoji: '⚡',
    description: 'How you react under pressure: fight, flight, freeze, or fawn.',
    timeEstimate: '2–3 min',
    questions: stressQuestions,
    dimensionToResultKey: { fight: 'fight', flight: 'flight', freeze: 'freeze', fawn: 'fawn' },
    results: stressResults,
  },
  {
    id: 'decision-style',
    type: 'inline',
    title: 'Decision Style',
    shortTitle: 'Decision Style',
    emoji: '🔀',
    description: 'How you make choices: analytical, intuitive, avoidant, or dependent.',
    timeEstimate: '2–3 min',
    questions: decisionQuestions,
    dimensionToResultKey: { analytical: 'analytical', intuitive: 'intuitive', avoidant: 'avoidant', dependent: 'dependent' },
    results: decisionResults,
  },
  {
    id: 'motivation-type',
    type: 'inline',
    title: 'Motivation Type',
    shortTitle: 'Motivation',
    emoji: '🔥',
    description: 'What drives you: purpose, rewards, curiosity, or connection.',
    timeEstimate: '2 min',
    questions: motivationQuestions,
    dimensionToResultKey: { purpose: 'purpose', reward: 'reward', curiosity: 'curiosity', social: 'social' },
    results: motivationResults,
  },
  {
    id: 'social-energy',
    type: 'inline',
    title: 'Social Energy Meter',
    shortTitle: 'Social Energy',
    emoji: '🔋',
    description: 'How you recharge: energized by people, balanced, or by solitude.',
    timeEstimate: '2 min',
    questions: socialEnergyQuestions,
    dimensionToResultKey: { people: 'people', balanced: 'balanced', solitude: 'solitude' },
    results: socialEnergyResults,
  },
  {
    id: 'thinking-bias',
    type: 'inline',
    title: 'Thinking Bias Finder',
    shortTitle: 'Thinking Bias',
    emoji: '🧠',
    description: 'Common thought patterns: catastrophizing, confirmation bias, black-and-white thinking.',
    timeEstimate: '2–3 min',
    questions: biasQuestions,
    dimensionToResultKey: { catastrophizing: 'catastrophizing', confirmation: 'confirmation', blackwhite: 'blackwhite' },
    results: biasResults,
  },
  {
    id: 'conflict-style',
    type: 'inline',
    title: 'Conflict Style',
    shortTitle: 'Conflict Style',
    emoji: '⚖️',
    description: 'How you handle disagreement: avoiding, accommodating, competing, compromising, or collaborating.',
    timeEstimate: '2–3 min',
    questions: conflictQuestions,
    dimensionToResultKey: { avoiding: 'avoiding', accommodating: 'accommodating', competing: 'competing', compromising: 'compromising', collaborating: 'collaborating' },
    results: conflictResults,
  },
];

export function getSelfDiscoveryQuizById(id: string): SelfDiscoveryQuiz | undefined {
  return SELF_DISCOVERY_QUIZZES.find((q) => q.id === id);
}

export function getSelfDiscoveryQuizzesInOrder(): SelfDiscoveryQuiz[] {
  return [...SELF_DISCOVERY_QUIZZES];
}

/** Score Big Five: question id -> dimension, answer 1-5. Return top 2 dimensions. */
export function scoreBigFive(answers: Record<string, number>): string[] {
  const sums: Record<string, number> = {};
  for (const q of bigFiveQuestions) {
    const dim = bigFiveDimensionFromId[q.id];
    if (dim) sums[dim] = (sums[dim] ?? 0) + (answers[q.id] ?? 3);
  }
  const sorted = Object.entries(sums).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 2).map(([k]) => k);
}

/** Score dimension-based quiz: count options by dimension, return highest dimension key. */
export function scoreDimensionQuiz(
  questions: SelfDiscoveryQuestion[],
  answers: Record<string, string>
): string {
  const counts: Record<string, number> = {};
  for (const q of questions) {
    const chosen = answers[q.id];
    const opt = q.options.find((o) => o.value === chosen);
    if (opt?.dimension) counts[opt.dimension] = (counts[opt.dimension] ?? 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? '';
}
