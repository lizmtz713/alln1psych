/**
 * Human Owner"s Manual - Section 5: The Daily Commute (School)
 * 
 * For teens and young adults: school IS life. It's where gauges get tested daily.
 * For parents: understanding school stress helps you understand your kids.
 * For adults: these patterns often replay in work settings.
 * 
 * \"Where you spend most of your waking hours shapes who you become.\"
 */

import type { ManualModule } from "./manualContent';

// ============================================================
// MODULE 5.1: THE ACADEMIC ENGINE
// How school affects your system
// ============================================================

const section5Module1: ManualModule = {
  id: 'manual-5-academic',
  title: 'The Academic Engine',
  emoji: '🎓',
  lessons: [
    {
      id: 'manual-5-1-1',
      title: 'School Stress Is Real Stress',
      emoji: '📝",
      deepDive: `Here's something adults often forget: school stress activates the same nervous system as any other threat. Your body doesn"t know the difference between a bear chasing you and a test you"re not ready for. Both trigger cortisol, adrenaline, the same fight-flight-freeze response.

Test anxiety isn't \"drama.\" It"s your amygdala interpreting the situation as dangerous to your survival - because in a way it is. Your future, your identity, your parents" approval, your social standing can all feel like they're on the line.

Academic stress is compounded by:
- Sleep deprivation (most teens are chronically underslept)
- Social pressure (peers, comparisons, social media)
- Future uncertainty (\"what am I doing with my life?\")
- Family expectations (real or perceived)
- The grade-identity trap (when your worth = your GPA)

This isn"t to say adults have it easy - they don't. But dismissing school stress as "not real stress" misses the point. To the nervous system, stress is stress.`,
      realWorld: [
        "A student's hands shake before every test. His parents tell him "it's just a test, relax." That doesn't help because his body is in survival mode. What helps: recognizing the physical signs, breathing techniques, and reframing the test as a challenge rather than a threat.",
        "A girl"s stomach hurts every Sunday night. It's not a virus - it"s anticipatory anxiety about the school week. Once she names it, she can work with it instead of just suffering through mysterious symptoms.",
        "A parent realizes their kid isn't 'being dramatic" about school pressure - they're actually overwhelmed. When they validate instead of dismiss, everything shifts.\",
      ],
      diagnostics: [
        {
          symptom: \"Physical symptoms before school (stomach ache, headache, can"t sleep)",
          checkFirst: "State gauge - is your body in threat response about school?",
          possibleCauses: ["Anticipatory anxiety", "Social stress", "Academic pressure", "Something specific happening (bullying, conflict)"],
          tryThis: ["Name it: 'My body is stressed about school'", "Check: is there something specific or is it general dread?", "Morning routine that calms the system (not just rushing)", "If persistent, something bigger might need addressing"],
        },
        {
          symptom: "Test anxiety that tanks your performance",
          checkFirst: "State + Body gauges - are basics covered (sleep, food)?",
          possibleCauses: ["Nervous system interpreting test as survival threat", "Underprepared (realistic assessment)", "Grade-identity fusion (your worth = your score)", "Past failure creating anticipatory fear"],
          tryThis: ["Breathing before and during test", "Reframe: 'This is showing what I know' not 'This defines me"\", \"Adequate preparation reduces anxiety (but doesn't eliminate it)\", \"Physical movement before test to discharge some activation\"],
        },
      ],
      tryThis: \"The next time you"re stressed about school, locate where you feel it in your body. Stomach? Chest? Shoulders? Just naming the physical sensation can reduce its power.",
      connectsTo: ['state', 'body', 'emotion', 'direction'],
      ageAdaptive: {
        teen: "When adults say "it's just school," they"re forgetting what it felt like. Your stress is real. Tests, grades, social stuff, future pressure - it all hits your nervous system for real. That doesn't mean you"re weak. It means you"re human. The first step is taking your own stress seriously, even when others don't.\",
        "young-adult': "College stress is school stress with less structure and more freedom to spiral. No one"s checking if you ate or slept. The pressure can be intense - and often invisible to people outside academia. Your stress is valid. And burnout in college is real.\",
        adult: \"If you're a parent, remember: school stress is real to your kid"s nervous system. Dismissing it doesn't help. Validating it - 'That sounds really stressful" - does. You can still have expectations AND acknowledge that it's hard.\",
        midlife: \"Looking back, you might see how school stress shaped patterns you still carry - test anxiety that became performance anxiety at work, for instance. Understanding this can help you be more compassionate with yourself and with any young people in your life.\",
        "older-adult": \"School was different in your day, but stress wasn't. The patterns you developed then may have followed you. And if you have grandchildren in school now, understanding that their stress is real - even if the context is different - helps you support them.\",
      },
      content: {
        teen: {
          introduction: \"Your body doesn"t know the difference between a bear attack and a test you"re not ready for. Both trigger the same stress response. School stress isn't fake or dramatic - it"s your nervous system doing its job. Understanding this is the first step to working WITH your system instead of against it.",
          keyConcepts: [
            { title: 'Stress is stress', explanation: 'Academic pressure activates the same fight-flight-freeze response as physical danger. Your racing heart before a test is real, not weakness.' },
            { title: 'The grade-identity trap', explanation: 'When your worth = your GPA, every assignment becomes a judgment of your value as a person. This makes everything feel higher stakes than it is.' },
            { title: 'Compound stress', explanation: 'School + social + family + future pressure + sleep deprivation = overwhelmed system. It\'s not one thing - it\'s everything at once.' },
            { title: 'Your stress matters', explanation: 'Even if adults dismiss it, your experience is valid. Taking your own stress seriously is the first step to managing it." },
          ],
          reflectionPrompt: \"What's the most stressful part of school for you right now? Where do you feel that stress in your body?\",
        },
        adult: {
          introduction: \"If you"re a parent, teacher, or work with young people - remember that school stress activates the same nervous system you use at work. Dismissing it as 'not real stress" isn't accurate. The brain doesn"t know the difference. Understanding this helps you support young people more effectively.",
          keyConcepts: [
            { title: 'Stress is stress', explanation: 'Academic pressure triggers the same physiological response as adult work stress. It\'s not less real because they\'re young.' },
            { title: 'The validation shift', explanation: 'When you validate instead of dismiss - "That sounds really hard" - young people feel seen. This actually helps them cope better.' },
            { title: 'Expectations AND empathy', explanation: 'You can still have expectations while acknowledging that meeting them is difficult. Both can be true.' },
            { title: 'What helps', explanation: 'Presence. Listening. Not immediately problem-solving. Trusting them to handle it while being available if they can\'t." },
          ],
          reflectionPrompt: \"How did adults respond to your school stress when you were young? How might that have shaped how you respond to young people now?\",
        },
        senior: {
          introduction: \"School looked different in your time, but stress didn't. The pressure to perform, to fit in, to please parents - that"s timeless. If you have grandchildren in school, understanding that their stress is real helps you be a calm, supportive presence in their lives.",
          keyConcepts: [
            { title: 'Different context, same stress', explanation: 'Social media, standardized testing, and college competition are new. But the underlying stress response is the same as it always was.' },
            { title: 'Your perspective is valuable', explanation: 'You\'ve seen people survive school stress and go on to live full lives. That long view can be reassuring.' },
            { title: 'Calm presence matters', explanation: 'When parents are stressed about their kid\'s school performance, grandparents can sometimes offer a calmer perspective.' },
            { title: 'Listening > advice', explanation: 'Often young people just need to be heard. You don\'t have to solve it - just witness it.' },
          ],
          reflectionPrompt: "What do you remember about school stress from your own life? What helped then?",
        },
      },
    },
    {
      id: 'manual-5-1-2',
      title: 'Learning How YOU Learn',
      emoji: '🧠',
      linkedActivity: 'learning-styles",
      deepDive: `Not everyone learns the same way - and that's not a bug, it"s a feature. Learning styles (visual, auditory, reading/writing, kinesthetic) represent different preferences for how information comes in and sticks.

But here"s what most people miss: knowing your style is only half the equation. You also need to know what actually works for retention - and most study methods don't.

What DOESN"T work well:
- Re-reading notes (feels productive, doesn"t stick)
- Highlighting (feels like you're doing something, you"re not)
- Passive listening without engagement
- Cramming (short-term memory, not learning)

What DOES work:
- Active recall (testing yourself, not just reviewing)
- Spaced repetition (reviewing over time, not all at once)
- Teaching someone else (if you can explain it, you know it)
- Connecting new info to what you already know
- Sleep (seriously - memory consolidation happens during sleep)

The goal isn"t to study more. It's to study smarter - in a way that matches how YOUR brain works.`,
      realWorld: [
        \"A student realizes she"s been highlighting her textbooks for years but retaining almost nothing. When she switches to self-testing with flashcards and spaced repetition, her recall doubles.",
        "A kinesthetic learner who's been told to 'sit still and focus" finally accepts that she learns better while walking or moving. She listens to lectures while on a treadmill and her focus improves dramatically.\",
        \"A guy who thinks he's "bad at school" discovers he's an auditory learner in a visual-heavy classroom. He starts recording lectures and listening back - and suddenly he"s 'smart."\",
      ],
      tryThis: \"Take the Learning Styles quiz in the app. Then, for your next study session, try one technique that matches your style. Notice if it's easier to retain.\",
      connectsTo: ["direction', 'body', 'state"],
      content: {
        teen: {
          introduction: \"You're not bad at learning - you might just be learning the wrong way. Everyone has a style that works better for them: visual (seeing), auditory (hearing), reading/writing (text), or kinesthetic (doing). And most of what schools teach about studying is wrong. Time to upgrade your approach.\",
          keyConcepts: [
            { title: "Learning styles are real', explanation: 'Some people learn by seeing, some by hearing, some by reading, some by doing. Finding your style makes learning less painful.' },
            { title: 'Most study methods don\'t work', explanation: 'Re-reading and highlighting feel productive but don\'t lead to retention. Testing yourself and spacing out your study sessions do.' },
            { title: 'Active recall > passive review', explanation: 'Your brain learns better when it has to RETRIEVE information, not just look at it. Quiz yourself instead of just re-reading.' },
            { title: 'Sleep is a study tool', explanation: 'Memory consolidation happens during sleep. Pulling an all-nighter often backfires. Sleep before a test beats cramming." },
          ],
          reflectionPrompt: \"What's your learning style? How does that match (or mismatch) how your classes are taught?\",
        },
        adult: {
          introduction: \"Understanding learning styles isn"t just for students - it applies to any time you"re acquiring new information. And if you're helping a young person study, knowing THEIR style (not yours) makes you more effective.\",
          keyConcepts: [
            { title: "Styles persist', explanation: 'Your learning style doesn\'t change much. The visual learner who needed diagrams in school still learns better with visual aids at work.' },
            { title: 'Teaching your style', explanation: 'If you\'re helping a kid study, check: are you teaching the way YOU learn, or the way THEY learn?' },
            { title: 'Effective methods', explanation: 'Active recall and spaced repetition work for everyone. Teaching these skills to young people is a gift.' },
            { title: 'Learning as a lifelong skill', explanation: 'The meta-skill of knowing HOW you learn best serves you forever." },
          ],
          reflectionPrompt: \"What's your learning style? How has it shown up in your life and work?\",
        },
        senior: {
          introduction: \"Learning doesn"t stop at any age - and neither does your learning style. Whether you're picking up a new skill, staying sharp, or helping grandchildren with homework, knowing how YOU learn best is still relevant.",
          keyConcepts: [
            { title: 'Neuroplasticity continues', explanation: 'Your brain can still learn new things. It might take longer, but it works. Staying mentally active matters.' },
            { title: 'Your style still applies', explanation: 'If you were an auditory learner at 20, you still are at 70. Use what works for your brain.' },
            { title: 'Teaching is learning', explanation: 'Explaining something to a grandchild reinforces your own understanding. Teaching is one of the best ways to learn.' },
            { title: 'Patience with yourself', explanation: 'Learning may take more repetition now. That\'s not failure - that\'s adaptation. Keep going.' },
          ],
          reflectionPrompt: "What have you learned recently? What method worked best?",
        },
      },
    },
    {
      id: 'manual-5-1-3',
      title: 'The Social Side of School',
      emoji: '👥",
      deepDive: `For many students, the academic part of school is easier than the social part. Navigating friendships, popularity, exclusion, drama, and the constant comparison engine of social media - this is where gauges really get tested.

Here's what neuroscience tells us: social rejection activates the same brain regions as physical pain. When you feel left out, your brain literally hurts. This isn"t oversensitivity. It"s biology.

The teen years are particularly intense because the brain is wired to prioritize peer relationships. This is developmental - you're building a social identity separate from your family. That"s why friends' opinions feel more important than parents" opinions. It's not disrespect; it"s brain development.

Add social media to this mix and you have:
- Constant comparison (everyone"s highlight reel vs. your real life)
- 24/7 social monitoring (who liked what, who said what)
- Permanent record (mistakes can follow you)
- FOMO and exclusion made visible

The Connection gauge isn't just \"do I have people?\" It"s "do I belong?" And belonging is a fundamental human need.`,
      realWorld: [
        "A student who has 'lots of friends" feels lonely because none of those friendships feel real. She realizes she's been performing a version of herself that isn"t authentic - and that's exhausting.",
        "A guy gets excluded from a group chat and it tanks his whole week. His parents say "it's just texts" but to his nervous system, it"s tribal rejection. The pain is real.\",
        \"A girl deletes social media for a month as an experiment. The first week is hard. By week three, she realizes how much calmer she feels without the constant comparison.\",
      ],
      diagnostics: [
        {
          symptom: \"Feeling lonely even when surrounded by people\",
          checkFirst: \"Connection gauge - is it quantity or quality of relationships?\",
          possibleCauses: [\"Surface-level friendships without depth\", \"Performing a version of yourself that isn't real\", \"Not feeling truly seen or known\", \"Social anxiety creating distance\"],
          tryThis: [\"Identify one person you could go deeper with\", \"Share something real and see how they respond\", \"Notice: are you waiting to be chosen, or actively choosing?\", \"Quality > quantity. One real friend > many shallow ones\"],
        },
        {
          symptom: \"Social media makes you feel worse\",
          checkFirst: \"Emotion gauge after scrolling - what"s actually happening?",
          possibleCauses: ["Comparison to curated highlight reels", "FOMO (fear of missing out)", "Cyberbullying or exclusion", "Addictive scroll patterns"],
          tryThis: ["Track: how do you feel before vs. after scrolling?", "Experiment: 24-48 hours off. Notice what changes", "Curate your feed: unfollow what drains you", "Time limits can help if you can't quit"],
        },
      ],
      tryThis: "After your next social interaction, check in: do you feel more energized or drained? More like yourself or less? That data tells you about the quality of the connection.",
      connectsTo: ['connection', 'emotion', 'state"],
      content: {
        teen: {
          introduction: \"Let's be real: the social part of school can be harder than the academic part. Friendships, drama, exclusion, fitting in, social media - it all hits your gauges hard. And the pain of being left out is real. Your brain processes social rejection like physical pain. You"re not being dramatic.",
          keyConcepts: [
            { title: 'Social pain is real pain', explanation: 'Rejection activates the same brain regions as physical injury. When you feel left out, your brain literally hurts.' },
            { title: 'Belonging is a need', explanation: 'Humans are tribal. We need to belong. Feeling outside the group threatens something fundamental.' },
            { title: 'The comparison trap', explanation: 'Social media shows everyone\'s best moments vs. your everyday reality. It\'s rigged. Comparing yourself to that is unfair to yourself.' },
            { title: 'Quality over quantity', explanation: 'One real friend who gets you beats a hundred followers who don\'t. Depth > breadth." },
          ],
          reflectionPrompt: \"Do you have someone who knows the real you - not the version you perform? If not, what would it take to let someone in?\",
        },
        adult: {
          introduction: \"If you're a parent, remember: social dynamics at school are as real and important as academics. Dismissing social stress dismisses a fundamental human need - belonging. Your kid"s social pain is real, even if the specific drama seems trivial to you.",
          keyConcepts: [
            { title: 'Social stress is real stress', explanation: 'The brain processes social rejection like physical pain. When your kid is hurt by exclusion, they\'re actually hurting.' },
            { title: 'Don\'t dismiss', explanation: '"Just ignore them" or "who cares what they think" isn\'t helpful. It invalidates real pain.' },
            { title: 'Peer importance is developmental', explanation: 'Teens prioritizing friends over family is normal brain development. It\'s not disrespect - it\'s building a social identity.' },
            { title: 'Social media complicates everything', explanation: 'You didn\'t grow up with this. The 24/7 social monitoring, comparison, and permanent record are new. Have compassion for what they\'re navigating.' },
          ],
          reflectionPrompt: "What was your social experience in school like? How might that shape how you respond to your kid's social struggles?",
        },
        senior: {
          introduction: "Social dynamics have always mattered - even if the platforms change. If you have grandchildren navigating school social life, understanding that their struggles are real (even when the context is unfamiliar) helps you be supportive.",
          keyConcepts: [
            { title: 'Same need, different world', explanation: 'The need to belong is timeless. The ways it plays out now are different - but the pain of exclusion is the same.' },
            { title: 'Don\'t compare eras', explanation: '"In my day..." isn\'t helpful. Validate their experience in their context.' },
            { title: 'Your perspective helps', explanation: 'You know that high school doesn\'t last forever. That long view can be reassuring - if offered gently, not dismissively.' },
            { title: 'Listening matters', explanation: 'Sometimes they just need someone to hear them. You don\'t have to understand every detail to be present.' },
          ],
          reflectionPrompt: "What do you remember about belonging and exclusion from your school years?",
        },
      },
    },
  ],
};

// ============================================================
// MODULE 5.2: SCHOOL TRANSITIONS
// Major changes in the school journey
// ============================================================

const section5Module2: ManualModule = {
  id: 'manual-5-transitions',
  title: 'School Transitions',
  emoji: '🚌',
  lessons: [
    {
      id: 'manual-5-2-1',
      title: 'Starting New',
      emoji: '🌱",
      deepDive: `Every school transition - new school, new grade, middle to high school, high school to college - is a mini identity crisis. The old world is gone. The new world isn't familiar yet. You"re in the gap.

This is disorienting by design. Transitions strip away the context you knew yourself in. You might have been "the smart kid" or "the athlete" or "the quiet one" - and now no one knows that story. You have to prove yourself again, or reinvent yourself entirely.

The opportunity: you can become someone different. The challenge: you don't know who you are without your old context.

What helps:
- Acknowledging the loss (yes, even if the change is "good")
- Giving yourself time to feel like you belong
- Looking for one person, one connection, not a whole friend group immediately
- Remembering: everyone else in a new situation is also figuring it out`,
      realWorld: [
        "A student moves to a new school and spends the first month feeling invisible. She expects to feel 'at home" immediately and thinks something is wrong when she doesn't. Learning that transition takes time - and that feeling lost is normal - helps her be patient with herself.\",
        \"A freshman in college realizes that being "the smart one" doesn't mean anything anymore - everyone here was the smart one. He has to rebuild an identity that isn"t just about grades.",
        "A kid uses a school change as a chance to reinvent - dropping the 'quiet" label and trying out being more social. It's scary but exhilarating.\",
      ],
      tryThis: \"If you"re in a transition: name one thing you"re grieving about the old situation (even if you're glad it ended) and one thing you"re hoping for in the new one.",
      connectsTo: ['direction', 'connection', 'emotion', 'alignment"],
      content: {
        teen: {
          introduction: \"Starting at a new school - or a new grade level - is a mini identity crisis. Everything familiar is gone. You have to figure out who you are all over again. That's hard. It"s also an opportunity. You can become whoever you want to be when no one knows your old story.",
          keyConcepts: [
            { title: 'Transition is loss', explanation: 'Even good changes involve losing something. It\'s okay to miss the old while building the new.' },
            { title: 'The gap is normal', explanation: 'Feeling like you don\'t belong yet isn\'t a sign something\'s wrong. It just means you\'re in the gap. Everyone in a new place feels this.' },
            { title: 'One connection first', explanation: 'Don\'t pressure yourself to find a whole friend group immediately. Look for one person you click with.' },
            { title: 'Reinvention is possible', explanation: 'New context = new chance. You don\'t have to be who you were. Who do you want to be?" },
          ],
          reflectionPrompt: \"If you could be anyone at a new school, who would you be? What's stopping you?\",
        },
        adult: {
          introduction: \"If your child is navigating a school transition, know that it"s harder than it looks. They"re not just changing locations - they're losing the context in which they knew themselves. Be patient. Validate the disorientation. It takes time to belong somewhere new.\",
          keyConcepts: [
            { title: "Transitions are identity shifts', explanation: 'Changing schools means losing the social context that defined them. That\'s destabilizing even when the change is wanted.' },
            { title: 'Patience matters', explanation: 'Expecting them to adjust immediately isn\'t realistic. Building belonging takes months, not weeks.' },
            { title: 'Don\'t push too hard', explanation: '"Did you make friends today?" is a lot of pressure. Try "What was one okay thing?" instead.' },
            { title: 'Acknowledge the loss', explanation: 'Even if they wanted to leave, they might miss the old place. Both can be true.' },
          ],
          reflectionPrompt: "What school transition was hardest for you? What helped - or what do you wish had helped?",
        },
        senior: {
          introduction: "School transitions may be in your past, but the pattern is universal. Any time you enter a new context - community, living situation, social group - the same dynamics apply. And if you have grandchildren navigating school transitions, your patience and presence can be an anchor.",
          keyConcepts: [
            { title: 'Transitions are timeless', explanation: 'The feeling of being new never fully goes away, even as contexts change. You know this pattern.' },
            { title: 'Your experience helps', explanation: 'You\'ve survived many transitions. That wisdom - that it gets easier, that you figure it out - can be reassuring to young people.' },
            { title: 'Presence over advice', explanation: 'Sometimes the best support is just being there. You don\'t have to solve it.' },
            { title: 'Own transitions', explanation: 'If you\'re navigating your own transitions - new living situation, new community - the same rules apply. Give yourself time.' },
          ],
          reflectionPrompt: "What transition in your life was hardest? What helped you through it?",
        },
      },
    },
    {
      id: 'manual-5-2-2',
      title: 'The College Transition',
      emoji: '🎒',
      deepDive: `The college transition is unique because it combines:
- Academic escalation (harder work, less hand-holding)
- Social reinvention (knowing no one, or leaving your friend group)
- Identity crisis ("who am I when no one"s watching?\")
- Freedom + overwhelm (no one enforcing structure)
- Separation from family (physically and emotionally)

Many students hit a wall freshman year. The freedom that seemed exciting becomes overwhelming. The academic pressure that felt manageable becomes crushing. The loneliness that's supposed to be temporary starts feeling permanent.

This is normal. Most people struggle in this transition. The ones who look like they have it together often don"t.

What helps:
- Building ONE routine (sleep, meals, something predictable)
- Finding ONE connection (not a whole social life immediately)
- Using campus resources (they exist for a reason)
- Remembering: the first semester is the hardest. It gets easier.

And if it doesn"t get easier - if you're seriously struggling - that"s what counseling centers are for. Asking for help is smart, not weak.`,
      realWorld: [
        "A freshman who was a 'star" in high school feels invisible in college. She has to rebuild her sense of self without external validation. It's painful - and ultimately growth.\",
        \"A student"s anxiety spirals because there"s no structure. He was used to parents and school enforcing a schedule. Now it's all on him and he doesn"t know how to self-regulate yet.",
        "A woman looks back on her freshman year as the hardest of her life - and also the year she grew the most. Surviving it built resilience she still uses.",
      ],
      tryThis: "If you"re in college: what's one routine that"s working? What"s one thing you're still figuring out? Be honest with yourself.\",
      connectsTo: ["body', 'state', 'connection', 'direction"],
      content: {
        teen: {
          introduction: \"If college is ahead of you, here's what no one tells you: freshman year is often really hard. The freedom that seems amazing becomes overwhelming when no one"s enforcing structure. The social life that seems exciting becomes lonely when you know no one. This is normal. Almost everyone struggles. And it gets better.",
          keyConcepts: [
            { title: 'Freedom is a double-edged sword', explanation: 'No one telling you what to do sounds great until you realize you have to tell yourself. Self-regulation is a skill that takes practice.' },
            { title: 'The social rebuild is hard', explanation: 'You\'re leaving the people who know you. Building new connections takes time and effort.' },
            { title: 'Identity questions intensify', explanation: '"Who am I when I\'m not who my parents expect?" is a real question that hits hard in college.' },
            { title: 'It gets better', explanation: 'First semester is usually the hardest. Most people find their footing eventually. And help is available if you\'re stuck." },
          ],
          reflectionPrompt: \"What excites you about college? What scares you? Both are worth acknowledging.\",
        },
        adult: {
          introduction: \"If you have a child heading to or in college, the transition is significant - for them and for you. They're gaining freedom and losing structure. They"re building a new identity and grieving the old one. Your job is to stay connected without controlling. And to trust that struggle is part of growth.",
          keyConcepts: [
            { title: 'Let them struggle (within reason)', explanation: 'Some struggle is how they grow. Rescuing them from every difficulty prevents development. But watch for serious warning signs.' },
            { title: 'Stay connected, not controlling', explanation: 'Regular check-ins help. Hovering doesn\'t. Find the balance that works for your relationship.' },
            { title: 'Normalize difficulty', explanation: '"Freshman year is hard for most people" is more helpful than "What\'s wrong with you?"' },
            { title: 'Know the warning signs', explanation: 'Withdrawal, dramatic grade drop, not eating/sleeping, talk of hopelessness - these warrant more than patience. Encourage professional help.' },
          ],
          reflectionPrompt: "How can you support your college student while still letting them become independent?",
        },
        senior: {
          introduction: "The college transition has changed in some ways since your time - more options, more pressure, more uncertainty about what comes after. But the developmental challenge is the same: leaving childhood and figuring out who you are. If you have grandchildren navigating this, your long view and steady presence can be grounding.",
          keyConcepts: [
            { title: 'Different era, same challenge', explanation: 'The pressures are different now but the developmental task is timeless: becoming an adult.' },
            { title: 'Long view helps', explanation: 'You\'ve seen young people struggle and then thrive. That perspective can be reassuring when shared gently.' },
            { title: 'No comparisons', explanation: '"In my day..." doesn\'t help. Validate their experience in their context.' },
            { title: 'Be a calm harbor', explanation: 'When parents are anxious and friends are overwhelmed, a grandparent can offer steadiness. That matters.' },
          ],
          reflectionPrompt: "What do you wish someone had told you at that age?",
        },
      },
    },
  ],
};

// ============================================================
// SECTION 5 EXPORT
// ============================================================

export const MANUAL_SECTION_5: {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  modules: ManualModule[];
} = {
  id: 'section-5-school',
  title: 'The Daily Commute',
  subtitle: 'School',
  emoji: '📚',
  color: '#3B82F6', // Blue - learning, trust
  modules: [
    section5Module1,
    section5Module2,
  ],
};
