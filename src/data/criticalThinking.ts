/**
 * Critical Thinking Tool — Logical fallacies, cognitive biases, misinformation tactics, evidence evaluation.
 * @see docs/ingauge-CRITICAL-THINKING-TOOL.md
 */

export interface LearnItem {
  id: string;
  label: string;
  description: string;
  example?: string;
}

export interface LearnCategory {
  id: string;
  title: string;
  intro: string;
  items: LearnItem[];
}

// ─── LOGICAL FALLACIES (30+) ───────────────────────────────────────────────

export const FALLACY_CATEGORIES: LearnCategory[] = [
  {
    id: 'fallacies',
    title: 'Logical Fallacies',
    intro: 'Common errors in reasoning that make an argument invalid or weak. Spotting them helps you evaluate claims fairly.',
    items: [
      { id: 'ad-hominem', label: 'Ad Hominem', description: 'Attacking the person instead of their argument. "You can\'t trust her — she\'s a known liar."', example: 'Dismissing a scientist\'s climate data because of their political party.' },
      { id: 'straw-man', label: 'Straw Man', description: 'Misrepresenting someone\'s position to make it easier to attack. Replacing their real claim with a weaker or extreme version.', example: ''They want open borders" when the position is immigration reform.' },
      { id: 'false-dilemma', label: 'False Dilemma', description: 'Presenting only two options when more exist. "Either you\'re with us or against us."', example: ''We must cut all spending or go bankrupt" — other options exist.' },
      { id: 'appeal-to-authority', label: 'Appeal to Authority', description: 'Using an authority figure as proof, even when they\'re not an expert on the topic or the claim is wrong.', example: 'A celebrity endorsing a medical treatment.' },
      { id: 'appeal-to-emotion', label: 'Appeal to Emotion', description: 'Using strong feelings (fear, pity, anger) instead of evidence to persuade.', example: 'Ads that show sad animals to get donations without showing impact.' },
      { id: 'appeal-to-popularity', label: 'Appeal to Popularity (Bandwagon)', description: 'Arguing something is true or right because many people believe it.', example: ''Everyone knows that..." or "It\'s the best-selling brand."' },
      { id: 'slippery-slope', label: 'Slippery Slope', description: 'Claiming one step will inevitably lead to extreme outcomes without showing the causal chain.', example: ''If we allow this, next thing we\'ll have chaos."' },
      { id: 'red-herring', label: 'Red Herring', description: 'Introducing an irrelevant topic to distract from the real issue.', example: 'In a debate about policy, bringing up a politician\'s personal life.' },
      { id: 'tu-quoque', label: 'Tu Quoque', description: ''You too" — dismissing criticism by saying the critic does the same thing. Doesn\'t address the argument.', example: ''You say I shouldn\'t lie, but you\'ve lied too."' },
      { id: 'begging-the-question', label: 'Begging the Question', description: 'Assuming the conclusion in the premise. The argument restates the claim instead of proving it.', example: ''The Bible is true because it says it\'s the word of God."' },
      { id: 'hasty-generalization', label: 'Hasty Generalization', description: 'Drawing a broad conclusion from a small or unrepresentative sample.', example: ''I met two rude people from that city — everyone there is rude."' },
      { id: 'post-hoc', label: 'Post Hoc (False Cause)', description: 'Assuming that because A happened before B, A caused B. Correlation isn\'t causation.', example: ''I wore my lucky shirt and we won — the shirt caused the win."' },
      { id: 'circular-reasoning', label: 'Circular Reasoning', description: 'The conclusion is used as part of the evidence. A because B, B because A.', example: ''I\'m right because I\'m never wrong."' },
      { id: 'appeal-to-ignorance', label: 'Appeal to Ignorance', description: 'Claiming something is true because it hasn\'t been proven false (or vice versa).', example: ''No one has proved aliens don\'t exist, so they exist."' },
      { id: 'false-equivalence', label: 'False Equivalence', description: 'Treating two things as equal when they differ in important ways (scale, evidence, impact).', example: ''Both sides spread misinformation" when one does it far more and with more impact.' },
      { id: 'loaded-question', label: 'Loaded Question', description: 'A question that assumes something not agreed upon. "Have you stopped lying?" assumes you lied.', example: ''Why do you always ignore me?" (assumes they always do).' },
      { id: 'no-true-scotsman', label: 'No True Scotsman', description: 'Excluding counterexamples by redefining the category. "No real X would do that."', example: ''No real Christian would support that" when some do.' },
      { id: 'appeal-to-tradition', label: 'Appeal to Tradition', description: 'Arguing something is right or better because it\'s been done a long time.', example: ''We\'ve always done it this way" as sole justification.' },
      { id: 'appeal-to-nature', label: 'Appeal to Nature', description: 'Claiming something is good or right because it\'s "natural," or bad because it\'s "unnatural."', example: ''It\'s natural, so it\'s safe" (many natural things are harmful).' },
      { id: 'anecdotal', label: 'Anecdotal Evidence', description: 'Using personal stories or single examples instead of systematic evidence.', example: ''My cousin did X and got better — so X works."' },
      { id: 'moving-the-goalposts', label: 'Moving the Goalposts', description: 'Changing the criteria for acceptance after evidence is presented.', example: 'After a study is shown: "That\'s only one study — we need five more."' },
      { id: 'middle-ground', label: 'False Middle Ground', description: 'Assuming the truth is always between two extremes. Compromise isn\'t always correct.', example: ''One side says 2+2=4, the other says 6 — so it\'s 5."' },
      { id: 'personal-incredulity', label: 'Personal Incredulity', description: ''I can\'t understand it, so it must be wrong."', example: ''I don\'t see how evolution works, so it\'s false."' },
      { id: 'composition-division', label: 'Composition / Division', description: 'Assuming what\'s true of the parts is true of the whole (composition), or the reverse (division).', example: ''Each player is great, so the team will win" (composition).' },
      { id: 'ambiguity', label: 'Equivocation (Ambiguity)', description: 'Using a word in two different senses in the same argument.', example: ''Only man is rational. No woman is a man. So no woman is rational." (man = human vs male).' },
      { id: 'burden-of-proof', label: 'Burden of Proof', description: 'Shifting the burden onto the wrong party. The one making the claim usually has to support it.', example: ''Prove that ghosts don\'t exist."' },
      { id: 'gamblers-fallacy', label: 'Gambler\'s Fallacy', description: 'Believing past random events affect future ones. "We\'re due for a win."', example: 'After 5 reds on roulette, thinking black is "due."' },
      { id: 'texas-sharpshooter', label: 'Texas Sharpshooter', description: 'Choosing data or patterns after the fact to fit a conclusion. Drawing the target around the bullet hole.', example: 'Finding one correlation in many variables and treating it as proof.' },
      { id: 'genetic', label: 'Genetic Fallacy', description: 'Judging an idea by its origin instead of its merit.', example: ''That idea came from a bad person, so it\'s wrong."' },
      { id: 'black-or-white', label: 'Black-or-White', description: 'Presenting things as only two alternatives when there\'s a spectrum or other options.', example: ''You\'re either perfect or a failure."' },
      { id: 'sunk-cost', label: 'Sunk Cost (Fallacy)', description: 'Continuing because you\'ve already invested, rather than based on future benefit.', example: ''We\'ve spent so much on this project we can\'t stop now."' },
    ],
  },
];

// ─── COGNITIVE BIASES (25+) ────────────────────────────────────────────────

export const BIAS_CATEGORIES: LearnCategory[] = [
  {
    id: 'biases',
    title: 'Cognitive Biases',
    intro: 'Mental shortcuts that can lead to systematic errors in judgment. Knowing them helps you correct for your own blind spots.',
    items: [
      { id: 'confirmation-bias', label: 'Confirmation Bias', description: 'Seeking and favoring information that confirms what we already believe.', example: 'Only reading sources that agree with your view.' },
      { id: 'anchoring', label: 'Anchoring', description: 'Relying too heavily on the first piece of information (the "anchor") when deciding.', example: 'First price you see shapes what you think is fair.' },
      { id: 'dunning-kruger', label: 'Dunning–Kruger Effect', description: 'People with limited competence overestimate their ability; experts may underestimate theirs.', example: 'Beginners being overconfident; experts saying "it\'s complicated."' },
      { id: 'bandwagon', label: 'Bandwagon Effect', description: 'Doing or believing something because many others do.', example: 'Buying a stock because everyone is talking about it.' },
      { id: 'halo-effect', label: 'Halo Effect', description: 'One positive trait (e.g. attractiveness) influences overall impression.', example: 'Assuming a charismatic speaker is also right about facts.' },
      { id: 'sunk-cost-bias', label: 'Sunk Cost Fallacy', description: 'Continuing a course of action because of past investment, not future value.', example: 'Sitting through a bad movie because you paid for the ticket.' },
      { id: 'loss-aversion', label: 'Loss Aversion', description: 'Losses feel about twice as bad as equivalent gains feel good. We over-weight avoiding loss.', example: 'Refusing to sell a losing investment "until it comes back."' },
      { id: 'availability', label: 'Availability Heuristic', description: 'Judging likelihood by how easily examples come to mind (often recent or vivid).', example: 'Overestimating risk of plane crashes after news of one.' },
      { id: 'representativeness', label: 'Representativeness Heuristic', description: 'Judging probability by how much something "seems like" a category, ignoring base rates.', example: 'Assuming a quiet person is more likely a librarian than a salesperson.' },
      { id: 'recency', label: 'Recency Bias', description: 'Giving more weight to recent events or information.', example: 'Rating a team by last game instead of full season.' },
      { id: 'survivorship', label: 'Survivorship Bias', description: 'Focusing on what survived or succeeded and ignoring what didn\'t.', example: ''Dropouts like Bill Gates succeeded" — we don\'t see the many who didn\'t.' },
      { id: 'fundamental-attribution', label: 'Fundamental Attribution Error', description: 'Explaining others\' behavior by character, our own by situation.', example: ''They cut me off because they\'re rude" vs "I was in a hurry."' },
      { id: 'self-serving', label: 'Self-Serving Bias', description: 'Crediting ourselves for success, blaming external factors for failure.', example: ''I won because I\'m good; I lost because of bad luck."' },
      { id: 'negativity', label: 'Negativity Bias', description: 'Negative information and experiences have more impact than positive ones.', example: 'One critical comment outweighs ten compliments.' },
      { id: 'status-quo', label: 'Status Quo Bias', description: 'Preferring things to stay the same; resisting change.', example: 'Keeping a default option even when another is better.' },
      { id: 'framing', label: 'Framing Effect', description: 'Same information presented differently leads to different decisions.', example: ''90% survival" vs "10% mortality" for a procedure.' },
      { id: 'authority', label: 'Authority Bias', description: 'Trusting or obeying authority figures more than we should.', example: 'Following a doctor\'s wrong advice without questioning.' },
      { id: 'ingroup', label: 'In-Group Bias', description: 'Favoring people we see as belonging to our group.', example: 'Rooting for "our" team or tribe regardless of evidence.' },
      { id: 'outgroup-homogeneity', label: 'Out-Group Homogeneity', description: 'Seeing out-group members as all alike; in-group as diverse.', example: ''They all think the same" about a different political group.' },
      { id: 'optimism', label: 'Optimism Bias', description: 'Overestimating likelihood of positive outcomes for ourselves.', example: ''It won\'t happen to me" about risks.' },
      { id: 'planning', label: 'Planning Fallacy', description: 'Underestimating time, cost, and risk for our own plans.', example: 'Projects routinely taking longer than planned.' },
      { id: 'peak-end', label: 'Peak–End Rule', description: 'We remember experiences by their peak and how they ended, not the whole duration.', example: 'A long trip with a great ending feels good overall.' },
      { id: 'zero-risk', label: 'Zero-Risk Bias', description: 'Preferring to eliminate risk in one area even when it increases total risk.', example: 'Paying more to reduce one small risk while ignoring bigger ones.' },
      { id: 'moral', label: 'Moral Credential Effect', description: 'Past good behavior can license later bad behavior in our own eyes.', example: ''I donated once, so I can skip helping this time."' },
      { id: 'blind-spot', label: 'Bias Blind Spot', description: 'Seeing bias in others more easily than in ourselves.', example: ''They\'re biased; I\'m objective."' },
      { id: 'curse-of-knowledge', label: 'Curse of Knowledge', description: 'Assuming others know what we know. Hard to imagine not knowing.', example: 'Experts using jargon without realizing others don\'t get it.' },
    ],
  },
];

// ─── MISINFORMATION TACTICS (15+) ──────────────────────────────────────────

export const TACTICS_CATEGORIES: LearnCategory[] = [
  {
    id: 'tactics',
    title: 'Misinformation Tactics',
    intro: 'Common ways false or misleading content is created or spread. Recognizing them helps you pause and verify.',
    items: [
      { id: 'emotional-headlines', label: 'Emotional Headlines', description: 'Headlines designed to trigger strong emotion (anger, fear, outrage) to drive clicks and shares, often without full context.', example: 'Clickbait that leaves out key facts.' },
      { id: 'missing-context', label: 'Missing Context', description: 'True facts or quotes presented without the context that would change their meaning.', example: 'A quote cut to make someone look bad.' },
      { id: 'gish-gallop', label: 'Gish Gallop', description: 'Overwhelming with a rapid fire of weak or false claims. Hard to refute each in real time.', example: 'Debater lists 20 "facts" in a minute; opponent can\'t address all.' },
      { id: 'astroturfing', label: 'Astroturfing', description: 'Fake grassroots: organized campaigns that look like organic public opinion.', example: 'Paid comments or accounts that seem like real users.' },
      { id: 'deepfakes', label: 'Deepfakes / Synthetic Media', description: 'AI-generated or altered video/audio that looks or sounds like a real person saying or doing something they didn\'t.', example: 'Fake video of a politician "saying" something inflammatory.' },
      { id: 'bot-amplification', label: 'Bot Amplification', description: 'Bots or inauthentic accounts used to make a message seem more popular or trending than it is.', example: 'Same phrase tweeted by thousands of accounts in minutes.' },
      { id: 'false-equivalence-tactic', label: 'False Equivalence', description: 'Presenting two sides as equally valid when evidence strongly favors one.', example: ''Both sides have scientists" when one side has overwhelming consensus.' },
      { id: 'cherry-picking', label: 'Cherry-Picking', description: 'Selecting only data or examples that support a conclusion and ignoring the rest.', example: 'Only showing years when a trend fits the narrative.' },
      { id: 'fake-experts', label: 'Fake Experts', description: 'Using people who sound or look like experts but lack relevant expertise.', example: 'A physicist commenting authoritatively on vaccine safety.' },
      { id: 'impossible-expectations', label: 'Impossible Expectations', description: 'Demanding unattainable level of proof (e.g. "perfect" studies) to dismiss evidence.', example: ''Unless you have 100% proof, I won\'t believe it."' },
      { id: 'conspiracy-narrative', label: 'Conspiracy Narrative', description: 'Framing any counter-evidence as part of the conspiracy, making the claim unfalsifiable.', example: ''They\'re covering it up" in response to every debunk.' },
      { id: 'repeated-claims', label: 'Repetition as Proof', description: 'Repeating a claim until it feels true (illusory truth effect).', example: 'Same slogan in every ad or post.' },
      { id: 'leading-questions', label: 'Leading Questions / Polls', description: 'Surveys or questions worded to get a desired answer, then presented as "people say."', example: ''Do you support helping children?" (who would say no?).' },
      { id: 'out-of-date', label: 'Out-of-Date or Retracted', description: 'Sharing old or retracted studies as if they were current and valid.', example: 'A study that was later retracted still cited as proof.' },
      { id: 'impersonation', label: 'Impersonation', description: 'Accounts or sites that mimic real people, brands, or news outlets.', example: 'Fake "BBC" or "Reuters" site with a slight URL change.' },
      { id: 'emotional-manipulation', label: 'Emotional Manipulation', description: 'Content designed to trigger fear, anger, or tribalism so people share without checking.', example: ''They\'re coming for your kids" style messaging.' },
    ],
  },
];

// ─── EVIDENCE EVALUATION ───────────────────────────────────────────────────

export const EVIDENCE_HIERARCHY: LearnItem[] = [
  { id: 'meta', label: 'Meta-analysis / systematic review', description: 'Combines many studies; strongest when well done. Reduces single-study flukes.' },
  { id: 'rct', label: 'Randomized controlled trials (RCTs)', description: 'Gold standard for cause-effect when feasible. Random assignment reduces confounding.' },
  { id: 'cohort', label: 'Cohort / longitudinal studies', description: 'Follow groups over time. Strong for associations; harder to prove cause.' },
  { id: 'case-control', label: 'Case-control studies', description: 'Compare those with vs without an outcome. Good for rare outcomes; prone to bias.' },
  { id: 'case-series', label: 'Case series / single studies', description: 'One or a few studies. Need replication; can be wrong or cherry-picked.' },
  { id: 'expert-consensus', label: 'Expert consensus / guidelines', description: 'Summarizes what most experts agree on. Quality varies by process.' },
  { id: 'anecdote', label: 'Anecdote / personal story', description: 'Single experience. Can illustrate but not prove. Easy to cherry-pick.' },
];

export const EVIDENCE_VS_OPINION_CHECKLIST: string[] = [
  'Is a claim backed by data, studies, or verifiable facts?',
  'Is the source transparent about methods and limitations?',
  'Do they distinguish "this is my view" from "this is what the evidence shows"?',
  'Are opposing views acknowledged and addressed, not just dismissed?',
];

export const SOURCE_CREDIBILITY_SIGNALS: LearnItem[] = [
  { id: 'transparency', label: 'Transparency', description: 'Clear who wrote it, who funded it, and what methods were used.' },
  { id: 'corrections', label: 'Corrections policy', description: 'Reputable outlets correct errors and note them.' },
  { id: 'expertise', label: 'Relevant expertise', description: 'Authors have credentials in the topic they\'re discussing.' },
  { id: 'independence', label: 'Independence', description: 'Not solely funded by parties with a stake in the conclusion.' },
  { id: 'consistency', label: 'Track record', description: 'Source has a history of accuracy and accountability.' },
];

// ─── FLAT LISTS (for practice, search) ──────────────────────────────────────

export function getAllFallacies(): LearnItem[] {
  return FALLACY_CATEGORIES.flatMap((c) => c.items);
}

export function getAllBiases(): LearnItem[] {
  return BIAS_CATEGORIES.flatMap((c) => c.items);
}

export function getAllTactics(): LearnItem[] {
  return TACTICS_CATEGORIES.flatMap((c) => c.items);
}

export function getLearnItemById(id: string): LearnItem | undefined {
  const all = [...getAllFallacies(), ...getAllBiases(), ...getAllTactics(), ...EVIDENCE_HIERARCHY, ...SOURCE_CREDIBILITY_SIGNALS];
  return all.find((i) => i.id === id);
}

// ─── PRACTICE CHALLENGES (spot the fallacy / bias / tactic) ──────────────────

export type PracticeType = 'fallacy' | 'bias' | 'tactic';

export interface PracticeChallenge {
  id: string;
  type: PracticeType;
  claim: string;
  correctId: string;
  options: string[]; // labels for multiple choice
}

const FALLACY_ITEMS = getAllFallacies();
const BIAS_ITEMS = getAllBiases();
const TACTIC_ITEMS = getAllTactics();

export const PRACTICE_CHALLENGES: PracticeChallenge[] = [
  { id: 'p1', type: 'fallacy', claim: 'You can\'t trust his opinion on climate — he flies private jets.', correctId: 'ad-hominem', options: ['Ad Hominem', 'Straw Man', 'Appeal to Authority', 'Red Herring'] },
  { id: 'p2', type: 'fallacy', claim: 'Either we ban it completely or society will collapse.', correctId: 'false-dilemma', options: ['False Dilemma', 'Slippery Slope', 'Hasty Generalization', 'Appeal to Emotion'] },
  { id: 'p3', type: 'fallacy', claim: 'My cousin took that supplement and her back pain went away.', correctId: 'anecdotal', options: ['Anecdotal Evidence', 'Appeal to Authority', 'Post Hoc', 'Begging the Question'] },
  { id: 'p4', type: 'fallacy', claim: 'If we allow this today, next they\'ll take everything.', correctId: 'slippery-slope', options: ['Slippery Slope', 'Red Herring', 'False Dilemma', 'Straw Man'] },
  { id: 'p5', type: 'fallacy', claim: 'Millions of people use this product — it must work.', correctId: 'appeal-to-popularity', options: ['Appeal to Popularity', 'Bandwagon Effect', 'Halo Effect', 'Anchoring'] },
  { id: 'p6', type: 'bias', claim: 'I only read news from one outlet that matches my views.', correctId: 'confirmation-bias', options: ['Confirmation Bias', 'Anchoring', 'Availability Heuristic', 'Halo Effect'] },
  { id: 'p7', type: 'bias', claim: 'That one viral story made me think this is happening everywhere.', correctId: 'availability', options: ['Availability Heuristic', 'Recency Bias', 'Negativity Bias', 'Survivorship Bias'] },
  { id: 'p8', type: 'bias', claim: 'I\'ve already put two years into this — I can\'t quit now.', correctId: 'sunk-cost-bias', options: ['Sunk Cost Fallacy', 'Loss Aversion', 'Status Quo Bias', 'Planning Fallacy'] },
  { id: 'p9', type: 'tactic', claim: 'A headline that says "You won\'t believe what they did" with no details.', correctId: 'emotional-headlines', options: ['Emotional Headlines', 'Missing Context', 'Cherry-Picking', 'Repetition as Proof'] },
  { id: 'p10', type: 'tactic', claim: 'Someone lists 15 "facts" in 30 seconds so you can\'t check any.', correctId: 'gish-gallop', options: ['Gish Gallop', 'False Equivalence', 'Fake Experts', 'Impossible Expectations'] },
];

export function getRandomChallenge(): PracticeChallenge {
  return PRACTICE_CHALLENGES[Math.floor(Math.random() * PRACTICE_CHALLENGES.length)];
}
