/**
 * Human Owner's Manual — Section 6: The Workplace (Work)
 * 
 * For adults: where most waking hours go. How work affects your gauges.
 * For teens/young adults: preparation for what's coming.
 * For older adults: retirement transition and legacy.
 * 
 * "Where you trade hours of your life for money — and often your peace of mind."
 * 
 * Grounded in Industrial/Organizational Psychology:
 * - Maslach Burnout Inventory
 * - Herzberg's Two-Factor Theory
 * - Job Demands-Resources Model
 */

import type { ManualModule } from './manualContent';

// ============================================================
// MODULE 6.1: WORK AND YOUR GAUGES
// How work affects your entire system
// ============================================================

const section6Module1: ManualModule = {
  id: 'manual-6-gauges',
  title: 'Work and Your Gauges',
  emoji: '💼',
  lessons: [
    {
      id: 'manual-6-1-1',
      title: 'How Work Affects Every Gauge',
      emoji: '📊',
      deepDive: `Work isn't just something you do — it's something that affects every part of your system. Let's trace it through each gauge:

**BODY:** Sedentary work, skipped meals, poor sleep, physical exhaustion. Your body pays for work stress even when the work itself isn't physical.

**STATE:** Constant activation — deadlines, emails, meetings, performance anxiety. Many people spend 8+ hours a day with their nervous system on alert. That's not sustainable.

**EMOTION:** Frustration with coworkers, imposter syndrome, anxiety about performance, resentment about workload, pride in accomplishment. Work generates the full emotional spectrum.

**CONNECTION:** Coworker relationships (support or toxicity), isolation (especially remote work), work-life bleeding that strains personal relationships.

**DIRECTION:** Career purpose, feeling stuck vs. growing, ambition vs. contentment, "is this what I want to do with my life?"

**ALIGNMENT:** Values match or mismatch. Does your work align with who you are? Or does it require you to be someone you're not?

The 40-hour workweek myth: most knowledge workers think about work far more than 40 hours. Emails, mental load, Sunday scaries — work colonizes mental space far beyond office hours.

Understanding how work hits your gauges is the first step to protecting yourself.`,
      realWorld: [
        "A woman tracks her gauges for a week and notices a pattern: every Sunday night, State drops and anxiety spikes. Classic Sunday scaries. But WHY? She traces it to a toxic boss she dreads seeing Monday morning.",
        "A man realizes his irritability at home isn't about his family — it's overflow from work. His State gauge is depleted by 5pm and there's nothing left for his kids. He starts building a decompression ritual for the commute home.",
        "A remote worker notices her Connection gauge tanking. She's 'connected' to coworkers via Slack but hasn't had a real conversation in weeks. The isolation is affecting everything else.",
      ],
      diagnostics: [
        {
          symptom: "Sunday scaries — dreading the week before it starts",
          checkFirst: "State + Direction gauges. Is it general work stress or something specific?",
          possibleCauses: ["Toxic work environment", "Misalignment with role/values", "Overwhelm from workload", "Sleep disruption (weekend schedule different from weekday)"],
          tryThis: ["Identify: is this about Monday specifically or work in general?", "Check: is your weekend sleep schedule throwing off your Monday?", "If it's the job itself, that's important data", "Sunday evening ritual to ease the transition"],
        },
        {
          symptom: "Snapping at family after work",
          checkFirst: "Body + State. Are you depleted before you even walk in the door?",
          possibleCauses: ["No recovery time between work and home", "Carrying work stress into home space", "Body basics neglected during workday (food, water, breaks)", "Work taking more than you have to give"],
          tryThis: ["Build a decompression buffer: 10-minute walk, music, anything that creates transition", "Check: did you eat? Drink water? Take any breaks?", "Name it: 'I'm depleted from work. I need 15 minutes before I can be present.'", "If chronic, the job may be taking too much"],
        },
        {
          symptom: "Feeling 'what's the point?' about work",
          checkFirst: "Direction + Alignment. Is this burnout, or something deeper?",
          possibleCauses: ["Burnout (exhaustion + cynicism)", "Values mismatch — work violates who you are", "Lack of growth or challenge", "Loss of meaning that was once there"],
          tryThis: ["Distinguish: am I exhausted, or am I in the wrong place?", "Recall: what originally drew you to this work?", "Check: is this fixable with rest, or is it fundamental?", "If it's been months, this isn't a phase — it's data"],
        },
      ],
      tryThis: "Rate your gauges at the END of a workday for one week. Notice patterns. Which gauge takes the biggest hit? That tells you where work is costing you most.",
      connectsTo: ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'],
      ageAdaptive: {
        teen: "Work might seem far off, but school is your current 'job' — and the patterns are similar. How does school affect your gauges? That's practice for understanding how work will affect them later. And if you have a part-time job, you're already learning this firsthand.",
        'young-adult': "Welcome to the workforce. You're learning that work isn't just tasks — it's a whole system that affects everything. Pay attention to how your job affects your gauges. This data matters for deciding what you want your career to look like.",
        adult: "By now you know: work affects everything. The question is what to do about it. Understanding which gauges take the biggest hit helps you target your self-care and make informed decisions about your career.",
        midlife: "At this stage, you've probably had multiple work experiences and can see patterns. What kinds of work drain you? What kinds energize you? This data is valuable for the second half of your career — or for deciding if you want to change course.",
        'older-adult': "Whether you're still working, recently retired, or long retired, work shaped you. Understanding how it affected your gauges — for decades — can bring insight. And if you're mentoring younger people, your wisdom about work-life balance matters.",
      },
      content: {
        teen: {
          introduction: "Work might feel distant, but school is basically your job right now — and the patterns are the same. How does 'work' (school) affect your energy, your stress, your mood, your relationships? Learning to notice this now prepares you for the adult work world.",
          keyConcepts: [
            { title: 'Work affects everything', explanation: 'It\'s not just something you do. It affects your body, your stress levels, your emotions, your relationships, your sense of purpose.' },
            { title: 'School as practice', explanation: 'How you respond to school pressure is often how you\'ll respond to work pressure. Notice your patterns now.' },
            { title: 'Recovery matters', explanation: 'If school drains you, you need ways to refill. That\'s not lazy — that\'s maintenance.' },
            { title: 'Boundaries start now', explanation: 'Learning to protect your time and energy is a skill. School is where you practice it.' },
          ],
          reflectionPrompt: "How does school affect your different gauges? Which one takes the biggest hit?",
        },
        adult: {
          introduction: "Work affects every gauge you have. It's not just about tasks and paychecks — it's about your body, your stress, your emotions, your relationships, your sense of purpose, and your alignment with your values. Understanding how work hits your specific system helps you protect yourself.",
          keyConcepts: [
            { title: 'All gauges are affected', explanation: 'Body (exhaustion), State (chronic activation), Emotion (the full range), Connection (coworkers + spillover to home), Direction (purpose), Alignment (values match).' },
            { title: 'The 40-hour myth', explanation: 'Mental load, emails, Sunday scaries — work occupies mental space far beyond official hours. That\'s part of the real cost.' },
            { title: 'Track to understand', explanation: 'Rating your gauges at the end of workdays reveals patterns. Which gauge takes the hit? That\'s where to focus.' },
            { title: 'This is data, not complaint', explanation: 'Understanding how work affects you isn\'t whining. It\'s information for making decisions.' },
          ],
          reflectionPrompt: "Which of your gauges does work affect most? What would it take to protect that gauge?",
        },
        senior: {
          introduction: "Whether you're still working or reflecting on a career that's ended, work shaped you. For decades, it affected your body, your stress, your relationships, your sense of self. Understanding this — even retrospectively — can bring insight and perhaps some peace.",
          keyConcepts: [
            { title: 'Work leaves marks', explanation: 'Decades of work stress, accomplishment, frustration, and purpose leave their imprint. That\'s just true.' },
            { title: 'Retrospective clarity', explanation: 'Looking back, you can see patterns that were invisible in the moment. That\'s wisdom.' },
            { title: 'What you\'d tell your younger self', explanation: 'What do you know now about work and life that you wish you\'d known earlier? That insight is valuable.' },
            { title: 'Sharing wisdom', explanation: 'If you have younger people in your life, your perspective on work-life balance is a gift — if shared gently.' },
          ],
          reflectionPrompt: "How did work affect your gauges over the years? What do you wish you'd understood earlier?",
        },
      },
    },
    {
      id: 'manual-6-1-2',
      title: 'Burnout: The Engine Fire',
      emoji: '🔥',
      linkedActivity: 'stress-thermo',
      deepDive: `Burnout isn't just being tired. It's a specific syndrome with three dimensions, identified by psychologist Christina Maslach:

**1. EXHAUSTION**
Feeling completely depleted. Not "I need a weekend" tired, but "I have nothing left" tired. Physical and emotional exhaustion that doesn't recover with normal rest.

**2. CYNICISM (Depersonalization)**
Detachment from your work. "Why bother?" attitude. Negativity about your job, coworkers, clients. You used to care; now you don't. Or you're pretending to care and it's exhausting.

**3. INEFFICACY**
Feeling incompetent, unproductive, like nothing you do matters. Even when you accomplish things, it doesn't register. The wins don't count.

When all three are present, you're burned out. Not "stressed." Not "tired." Burned out.

Here's the thing: vacation doesn't fix burnout. Rest helps with exhaustion, but cynicism and inefficacy don't disappear after a week at the beach. Burnout usually requires structural changes — in the job, in your boundaries, or in whether you stay.

**Warning signs:**
- Dreading work every single day (not just some days)
- Physical symptoms: headaches, stomach issues, insomnia
- Can't remember why you cared about this job
- Increasingly irritable — at work AND at home
- "Just getting through" every day with nothing left

**Risk factors:**
- Chronic overwork without recovery
- Lack of control over your work
- Insufficient reward (not just money — recognition, meaning)
- Unfair treatment
- Values conflict
- No community at work

Burnout is not a personal failing. It's often a job problem, not a you problem.`,
      realWorld: [
        "A nurse who loved her job starts calling in sick constantly. She's not lazy — she's burned out. Three years of understaffing and impossible patient loads depleted her. No amount of 'self-care' tips fix a system problem.",
        "A tech worker realizes he's been running on cynicism for a year. He used to be excited about his projects; now he mocks everything. That's not maturity — that's depersonalization. A dimension of burnout.",
        "A teacher takes a leave of absence and expects to come back refreshed. She does, briefly. But three weeks back, she's exactly where she was. Vacation didn't fix it because the structural problems remained.",
      ],
      diagnostics: [
        {
          symptom: "Exhausted even after rest",
          checkFirst: "Is this tiredness or true depletion? Did rest actually help?",
          possibleCauses: ["Burnout exhaustion (deeper than tired)", "Sleep issues (quality, not just quantity)", "Medical issue worth checking", "Emotional exhaustion masquerading as physical"],
          tryThis: ["Track: does a weekend help, or do you still feel depleted?", "If rest doesn't restore you, this isn't normal tired", "Check the other burnout dimensions: cynicism? inefficacy?", "Consider: is it the job, or is something else draining you?"],
        },
        {
          symptom: "You've become cynical about work you used to care about",
          checkFirst: "When did this shift? What changed?",
          possibleCauses: ["Burnout depersonalization dimension", "Specific events that broke trust", "Values have shifted", "Protecting yourself from caring because caring hurts"],
          tryThis: ["Notice: am I cynical about everything or just work?", "Trace back: when did I stop caring?", "Is there anything left I care about here?", "Cynicism is data, not character flaw"],
        },
        {
          symptom: "Accomplishments don't feel like accomplishments",
          checkFirst: "Are you achieving and not registering it, or not achieving?",
          possibleCauses: ["Burnout inefficacy dimension", "Depression (overlaps with burnout)", "Imposter syndrome amplified by exhaustion", "Perfectionism making nothing feel 'good enough'"],
          tryThis: ["List three things you accomplished this week — can you feel any of them?", "If nothing registers, that's a sign", "This dimension often responds to rest + external validation", "If it persists, professional support helps"],
        },
      ],
      tryThis: "Rate yourself on the three burnout dimensions: Exhaustion (1-10), Cynicism (1-10), Inefficacy (1-10). If any are above 7, pay attention. If all three are high, you're likely burned out.",
      connectsTo: ['body', 'state', 'emotion', 'direction', 'alignment'],
      content: {
        teen: {
          introduction: "Burnout isn't just for adults with jobs. Students can burn out too — from academic pressure, extracurriculars, social demands, and the feeling that you can never do enough. The same three dimensions apply: exhaustion, cynicism ('why bother?'), and feeling like nothing you do matters.",
          keyConcepts: [
            { title: 'Burnout has three parts', explanation: 'Exhaustion (nothing left), cynicism (don\'t care), and inefficacy (nothing matters). When all three hit, you\'re burned out.' },
            { title: 'It\'s not laziness', explanation: 'If you used to care and now you don\'t, if rest doesn\'t restore you, if accomplishments don\'t register — that\'s burnout, not character flaw.' },
            { title: 'Rest alone doesn\'t fix it', explanation: 'Burnout usually requires changing something structural — workload, expectations, boundaries — not just sleeping more.' },
            { title: 'It happens to students too', explanation: 'Academic burnout is real. If school has depleted you to the point of not caring, that\'s worth taking seriously.' },
          ],
          reflectionPrompt: "Have you ever felt all three: exhausted, cynical, and like nothing you do matters? What was happening?",
        },
        adult: {
          introduction: "Burnout isn't 'being stressed.' It's a specific syndrome with three dimensions: exhaustion, cynicism, and inefficacy. When all three are present, vacation won't fix it. Burnout usually requires structural changes — in the job, in your boundaries, or in whether you stay.",
          keyConcepts: [
            { title: 'The three dimensions (Maslach)', explanation: 'Exhaustion: depleted. Cynicism: detached, negative. Inefficacy: nothing matters, can\'t feel wins. All three = burnout.' },
            { title: 'It\'s often a job problem', explanation: 'Burnout is frequently caused by systemic issues: overwork, lack of control, insufficient reward, values conflict. It\'s not always a "you" problem.' },
            { title: 'Vacation isn\'t the cure', explanation: 'Rest helps exhaustion but doesn\'t fix cynicism or inefficacy. Those require addressing root causes.' },
            { title: 'Warning signs matter', explanation: 'Constant dread, physical symptoms, irritability spilling over, "just getting through" — these aren\'t normal. They\'re data.' },
          ],
          reflectionPrompt: "Rate yourself on the three dimensions right now. Exhaustion? Cynicism? Inefficacy? What does that tell you?",
        },
        senior: {
          introduction: "Whether you experienced burnout during your career or managed to avoid it, this concept illuminates a lot. Looking back, can you see times when you were burned out? How did it affect you? And if you're still working — or supporting someone who is — this framework helps.",
          keyConcepts: [
            { title: 'Retrospective recognition', explanation: 'You might recognize burnout periods in your past that you didn\'t have language for at the time.' },
            { title: 'The cost over time', explanation: 'Burnout that isn\'t addressed doesn\'t just go away. It leaves marks — on health, relationships, sense of self.' },
            { title: 'What you\'d do differently', explanation: 'With hindsight, what would you have changed? That wisdom matters.' },
            { title: 'Supporting others', explanation: 'If you see burnout in your adult children or others, naming it gently can help. They might not see it themselves.' },
          ],
          reflectionPrompt: "Looking back, when were you most burned out? What did it cost you? What would you do differently?",
        },
      },
    },
    {
      id: 'manual-6-1-3',
      title: 'Work-Life Boundaries',
      emoji: '⚖️',
      deepDive: `"Work-life balance" is a misleading phrase. It implies a static 50/50 split that's achievable and sustainable. Reality is messier: sometimes work demands more, sometimes life does. The goal isn't balance — it's intentional boundaries that protect what matters.

Boundaries at work might include:
- **Time boundaries:** Not checking email after 7pm. Leaving at 5 even if others stay.
- **Availability boundaries:** Not being reachable 24/7. Taking real vacations.
- **Emotional boundaries:** Not letting a bad meeting ruin your whole evening.
- **Identity boundaries:** You are not your job title.

The challenge: many workplaces reward boundary-less behavior. Being "always on" gets praised. Setting limits can feel risky.

But here's the truth: **boundaries make you more sustainable, not less valuable.** A burned-out employee produces worse work than a rested one. Boundaries aren't selfish — they're how you protect your capacity to contribute over time.

**Remote work complicates everything:**
When you work from home, there's no commute to create transition, no physical separation between "work space" and "life space." You have to create boundaries artificially:
- Designated work area (even if it's just a corner)
- Fake commute: a walk before and after work
- Hard start and stop times
- Changing clothes to signal "work mode" vs "home mode"

**The "good enough" decision:**
Perfectionism is the enemy of boundaries. If everything must be perfect, you can never stop working. Learning to deliver "good enough" work — knowing when more effort has diminishing returns — is a boundary skill.`,
      realWorld: [
        "A manager sets a hard stop at 6pm. Her team initially worries she's not committed. Over time, they notice she's more focused, produces better work, and is actually more pleasant to work with. Boundaries made her more effective, not less.",
        "A remote worker realizes he hasn't left his apartment in three days. Work and life have melted together. He institutes a 'fake commute' — a 15-minute walk before and after work. It creates the separation he needs.",
        "A woman realizes her perfectionism is destroying her boundaries. Nothing is ever 'done' so she can never stop. Learning to say 'this is good enough' is revolutionary.",
      ],
      diagnostics: [
        {
          symptom: "Work bleeds into everything — evenings, weekends, vacation",
          checkFirst: "Is this external pressure or internal inability to stop?",
          possibleCauses: ["Workplace culture rewards overwork", "Fear of missing something or falling behind", "Perfectionism: it's never 'done'", "Identity fusion: you ARE your job"],
          tryThis: ["Identify one boundary to test (e.g., no email after 7)", "Start small, see what happens", "Notice: is the sky falling, or did nothing bad happen?", "If workplace punishes boundaries, that's a workplace problem"],
        },
        {
          symptom: "No transition between work mode and home mode",
          checkFirst: "Do you have any ritual or separation, or does one blur into the other?",
          possibleCauses: ["Remote work with no physical separation", "No commute to create transition", "Always-on mindset", "Lack of alternative identity beyond work"],
          tryThis: ["Create artificial transition: walk, change clothes, anything", "Designate work space even if it's just a corner", "Hard start and stop times (set alarms if needed)", "The ritual matters more than the logic — just pick something"],
        },
      ],
      tryThis: "Pick one boundary to experiment with for one week. Maybe no work email after dinner. Maybe a fake commute. See what happens. Most fears about boundary-setting don't come true.",
      connectsTo: ['body', 'state', 'connection', 'alignment'],
      content: {
        teen: {
          introduction: "Boundaries aren't just for adults with jobs. Learning to separate 'school mode' from 'rest mode' is practice for work-life boundaries later. And if you have a job already, this applies directly.",
          keyConcepts: [
            { title: 'Boundaries protect your capacity', explanation: 'If you never stop, you burn out. Boundaries aren\'t lazy — they\'re maintenance.' },
            { title: 'Time limits', explanation: 'Deciding when to stop studying — even if you could do more — is a boundary skill.' },
            { title: 'The good enough decision', explanation: 'Perfectionism is the enemy of boundaries. Learning when something is done enough is crucial.' },
            { title: 'Identity beyond school', explanation: 'You are not your grades. Having an identity outside of academic performance protects your whole self.' },
          ],
          reflectionPrompt: "Do you have any boundaries around school work? What would happen if you experimented with one?",
        },
        adult: {
          introduction: "Work-life 'balance' is a myth. What you actually need is intentional boundaries that protect what matters. Time boundaries, availability boundaries, emotional boundaries. These aren't selfish — they're how you sustain yourself for the long haul.",
          keyConcepts: [
            { title: 'Boundaries make you sustainable', explanation: 'A rested worker produces better work than an exhausted one. Boundaries protect your capacity to contribute.' },
            { title: 'Types of boundaries', explanation: 'Time (when you stop), availability (when you\'re reachable), emotional (not taking it home), identity (you are not your job).' },
            { title: 'The perfectionism trap', explanation: 'If nothing is ever "done," you can never stop. "Good enough" is a boundary skill.' },
            { title: 'Remote work needs artificial boundaries', explanation: 'Without commute or physical separation, you have to create transitions deliberately.' },
          ],
          reflectionPrompt: "What's one boundary you don't have that you need? What's the fear about setting it?",
        },
        senior: {
          introduction: "Looking back, how were your work-life boundaries? What did you protect, and what did you sacrifice? This reflection matters — and if you're still working or supporting someone who is, these principles still apply.",
          keyConcepts: [
            { title: 'Retrospective honesty', explanation: 'What did overwork cost you? What would you do differently?' },
            { title: 'It\'s not too late', explanation: 'Whether in work or in life, boundaries are still relevant. You can still protect what matters.' },
            { title: 'Modeling for others', explanation: 'How you handle boundaries — even now — is observed by those around you.' },
            { title: 'Permission to rest', explanation: 'You\'ve worked enough. Rest isn\'t something you have to earn anymore.' },
          ],
          reflectionPrompt: "What do you wish you'd protected more during your working years?",
        },
      },
    },
    {
      id: 'manual-6-1-4',
      title: 'Motivation: Why You Work',
      emoji: '🎯',
      deepDive: `Frederick Herzberg's Two-Factor Theory changed how we understand work motivation. He found that satisfaction and dissatisfaction aren't opposites on the same scale — they're separate dimensions affected by different factors.

**HYGIENE FACTORS** (prevent dissatisfaction):
- Salary and benefits
- Working conditions
- Job security
- Company policies
- Relationship with supervisor
- Status

When these are BAD, you're dissatisfied. When they're GOOD, you're... not dissatisfied. But you're not necessarily satisfied or motivated either. These are baseline requirements.

**MOTIVATORS** (create satisfaction):
- Achievement — accomplishing meaningful work
- Recognition — being valued for contributions
- The work itself — finding the tasks engaging
- Responsibility — having ownership
- Growth — learning, advancing, developing
- Meaning — connecting to purpose larger than yourself

This explains why a raise doesn't always make you happier at work. Money is a hygiene factor. Once it's adequate, more money doesn't create motivation — it just prevents dissatisfaction.

Real motivation comes from the work itself: challenge, autonomy, growth, meaning, recognition.

**Intrinsic vs. Extrinsic Motivation:**
- Extrinsic: doing it for external reward (money, praise, avoiding punishment)
- Intrinsic: doing it because it's inherently satisfying

Extrinsic motivation is fragile — take away the reward, lose the motivation. Intrinsic motivation is durable but can be killed by too much external control.

The Direction gauge at work: Are you growing? Learning? Moving toward something that matters to you? Or just trading time for money?`,
      realWorld: [
        "A developer gets a big raise but still feels unmotivated. The money was never the issue — the issue was lack of challenge. His hygiene factors are fine; his motivators are missing.",
        "A teacher earns very little but finds deep satisfaction in her work. High motivators (meaning, achievement, impact) compensate for lower hygiene factors (pay). Until they don't — burnout eventually catches up when basics aren't met.",
        "A worker in a prestigious company with great perks is miserable. On paper, everything's good. But he has no autonomy, no growth, no sense that his work matters. The hygiene is perfect; the motivation is absent.",
      ],
      tryThis: "List your top 3 hygiene factors at work (basics that must be okay) and your top 3 motivators (what makes work actually satisfying). Are they being met?",
      connectsTo: ['direction', 'alignment', 'emotion'],
      content: {
        teen: {
          introduction: "Why do you do your schoolwork? Because you have to? Because you find it interesting? Because you want good grades for college? Understanding what motivates you — and what doesn't — is useful now and will be crucial for choosing a career.",
          keyConcepts: [
            { title: 'Two kinds of factors', explanation: 'Some things prevent you from being miserable (basics being okay). Other things make you actually engaged (challenge, meaning, growth).' },
            { title: 'Intrinsic vs. extrinsic', explanation: 'Doing something because it\'s interesting vs. doing it for a grade or reward. Both are real, but intrinsic motivation lasts longer.' },
            { title: 'Grades aren\'t everything', explanation: 'External rewards (grades) motivate short-term but can kill intrinsic interest. Finding genuine curiosity matters.' },
            { title: 'What engages you?', explanation: 'Notice what you do when no one\'s making you. That\'s data about what might motivate you in a career.' },
          ],
          reflectionPrompt: "What are you intrinsically motivated by? What do you do just because you want to, not because you have to?",
        },
        adult: {
          introduction: "Herzberg's research shows that satisfaction and dissatisfaction are different dimensions. Money, conditions, and security prevent dissatisfaction. But achievement, growth, meaning, and recognition create actual satisfaction. Understanding this explains why a raise doesn't always make you happier — and what might.",
          keyConcepts: [
            { title: 'Hygiene factors vs. motivators', explanation: 'Hygiene (pay, conditions, security) prevents dissatisfaction. Motivators (achievement, growth, meaning) create satisfaction. Both matter, differently.' },
            { title: 'Why money doesn\'t always help', explanation: 'Once salary is adequate, more money doesn\'t create motivation. It just prevents dissatisfaction about money.' },
            { title: 'What actually motivates', explanation: 'Challenge, autonomy, growth, meaning, recognition. These create engagement, not just presence.' },
            { title: 'Intrinsic vs. extrinsic', explanation: 'Doing it because it matters vs. doing it for reward. Intrinsic motivation is more durable but can be killed by over-control.' },
          ],
          reflectionPrompt: "What motivates you at work — really? Are those factors present in your current role?",
        },
        senior: {
          introduction: "Looking back at your career, what actually motivated you? The answer might be different from what you thought at the time. Understanding motivation retrospectively can bring insight — and helps you advise younger people who are navigating these questions now.",
          keyConcepts: [
            { title: 'What really mattered', explanation: 'Was it the money? The meaning? The growth? The recognition? Looking back, what actually drove you?' },
            { title: 'The money question', explanation: 'Did more money make you happier, or did it just raise the baseline? That\'s Herzberg in action.' },
            { title: 'Meaning mattered', explanation: 'For most people, work that felt meaningful was more satisfying than work that just paid well.' },
            { title: 'Sharing wisdom', explanation: 'What would you tell a young person about what actually motivates? Your experience is valuable.' },
          ],
          reflectionPrompt: "What motivated you most in your career? What do you wish you'd prioritized differently?",
        },
      },
    },
    {
      id: 'manual-6-1-5',
      title: 'Workplace Relationships',
      emoji: '🤝',
      linkedActivity: 'relate',
      deepDive: `You spend more waking hours with coworkers than with almost anyone else. These relationships affect your gauges profoundly — for better or worse.

**Coworkers aren't automatically friends:**
You're thrown together by circumstance, not choice. Some coworker relationships become genuine friendships. Many are cordial but shallow. Some are toxic. Knowing the difference matters.

**The boss relationship:**
This is one of the most significant relationships for your work experience. A good boss can make a hard job bearable; a bad boss can make an easy job unbearable. This relationship often echoes other authority dynamics — parents, teachers. Noticing those echoes helps you respond to your actual boss, not a historical pattern.

**Difficult people:**
Every workplace has them. The question isn't "how do I change them?" (you can't) but "how do I protect my gauges while working with them?" Boundaries, limited engagement, and not taking their behavior personally.

**Remote work isolation:**
Connection gauge challenges in the Zoom era. You might be "connected" via Slack 50 times a day and still feel profoundly alone. Digital communication doesn't replace human presence. Remote workers need to intentionally build connection — it doesn't happen automatically.

**When work relationships go wrong:**
Conflict, betrayal, politics. These aren't just "work stuff" — they're relational wounds that affect you. Taking them seriously (while also keeping perspective that work isn't everything) is the balance.`,
      realWorld: [
        "A woman's stress at work isn't about the work — it's about a coworker who undermines her in every meeting. Naming the actual problem (the relationship) instead of the symptom (work stress) helps her address it.",
        "A man realizes he responds to his boss the same way he responded to his critical father: anxious over-performing followed by resentment. Noticing the pattern helps him relate to his actual boss, not his father.",
        "A remote worker schedules weekly video calls with coworkers even when there's no agenda — just to maintain human connection. It feels inefficient. It's actually essential.",
      ],
      tryThis: "Map your key workplace relationships. For each, ask: Does this person generally fill or drain my Connection gauge? What's one thing I could do to improve or protect this dynamic?",
      connectsTo: ['connection', 'state', 'emotion'],
      content: {
        teen: {
          introduction: "The relationships at school — with teachers, classmates, group project partners — are practice for workplace relationships. How do you navigate authority figures? How do you work with people you didn't choose? These skills transfer directly.",
          keyConcepts: [
            { title: 'Not everyone is a friend', explanation: 'Classmates and coworkers are people you\'re with by circumstance. Some become friends. Many don\'t. That\'s okay.' },
            { title: 'Authority dynamics', explanation: 'How you relate to teachers predicts how you\'ll relate to bosses. Notice your patterns.' },
            { title: 'Difficult people practice', explanation: 'Learning to work with someone you find difficult without letting them ruin your day is a skill.' },
            { title: 'Boundaries apply here too', explanation: 'You don\'t have to be best friends with everyone. Professional distance is valid.' },
          ],
          reflectionPrompt: "Who at school affects your gauges the most — for better or worse? What patterns do you notice?",
        },
        adult: {
          introduction: "Workplace relationships affect your gauges more than almost anything else about work. A good boss can make hard work bearable; a toxic coworker can make easy work miserable. Understanding these dynamics — and your own patterns — helps you navigate them.",
          keyConcepts: [
            { title: 'The boss relationship matters', explanation: 'This single relationship often determines your work experience more than the work itself. Pay attention to it.' },
            { title: 'Historical echoes', explanation: 'You might respond to your boss like you responded to parents or teachers. Notice when the past is driving the present.' },
            { title: 'Difficult people boundaries', explanation: 'You can\'t change them. But you can limit engagement, not take it personally, and protect your gauges.' },
            { title: 'Remote isolation is real', explanation: 'Digital connection isn\'t the same as human presence. Build real connection deliberately.' },
          ],
          reflectionPrompt: "Which workplace relationship affects your gauges most? What could improve?",
        },
        senior: {
          introduction: "Looking back, which workplace relationships mattered most? Which still affect you now, for better or worse? These relationships shaped you — understanding them brings insight.",
          keyConcepts: [
            { title: 'Relationships that shaped you', explanation: 'Mentors, difficult bosses, colleagues who became friends. These people affected who you became.' },
            { title: 'Patterns across time', explanation: 'Did you respond the same way to authority figures across multiple jobs? What drove that?' },
            { title: 'What you\'d do differently', explanation: 'Knowing what you know now, would you have handled any workplace relationship differently?' },
            { title: 'Wisdom to share', explanation: 'Your experience navigating workplace dynamics is valuable. How would you advise someone younger?' },
          ],
          reflectionPrompt: "Which workplace relationship had the biggest impact on your life — positive or negative?",
        },
      },
    },
  ],
};

// ============================================================
// MODULE 6.2: CAREER AND DIRECTION
// The bigger picture of work and purpose
// ============================================================

const section6Module2: ManualModule = {
  id: 'manual-6-career',
  title: 'Career and Direction',
  emoji: '🧭',
  lessons: [
    {
      id: 'manual-6-2-1',
      title: 'When Work Doesn\'t Fit',
      emoji: '🚪',
      deepDive: `Sometimes the problem isn't the job — it's the fit. The work doesn't match who you are, what you value, or where you want to go.

**Signs of misalignment:**
- Dreading work even when nothing "bad" is happening
- Having to be a fundamentally different person at work
- Values conflicts: being asked to do things that violate who you are
- Feeling like you're wasting your potential
- "Is this it?" — the existential question

**The "golden handcuffs" trap:**
Good salary, benefits, security — all keeping you in a job that doesn't fit. The exit cost feels too high. So you stay. And part of you withers.

**Career grief:**
The path not taken. The career you might have had if you'd made different choices. This grief is real, even if the life you have is good. Both things can be true.

**Permission to want more:**
It's not ungrateful to want work that means something. Having a "good job" on paper while feeling empty inside is valid pain. You're allowed to want alignment, not just adequacy.

The Direction gauge at work: Are you heading somewhere that matters to you? Or just going through the motions?`,
      realWorld: [
        "A lawyer with a prestigious job and excellent salary feels empty. On paper, she's successful. Inside, she's misaligned — the work violates her values daily. She's not ungrateful. She's in the wrong place.",
        "A man stays in a job he hates because of the health insurance and 401k. His kids are in college; he can't afford to take a risk. The golden handcuffs are real. And they're slowly strangling him.",
        "A woman in her 40s grieves the career she didn't pursue. She chose stability over passion at 25. She doesn't regret her life — but she's allowed to mourn the path not taken.",
      ],
      tryThis: "Ask yourself: If money and security weren't factors, would I still be in this job? The answer is data.",
      connectsTo: ['direction', 'alignment', 'emotion'],
      content: {
        teen: {
          introduction: "You might already feel the pressure: 'What are you going to do with your life?' The truth is, many adults are still figuring that out. And many are in jobs that don't fit. Learning early what alignment feels like — and what misalignment costs — gives you an advantage.",
          keyConcepts: [
            { title: 'Fit matters', explanation: 'A job can be good on paper and wrong for you. Alignment between who you are and what you do matters.' },
            { title: 'The pressure is real and fake', explanation: 'Real: decisions matter. Fake: you don\'t have to know everything at 18. Most people change paths multiple times.' },
            { title: 'Notice what doesn\'t fit', explanation: 'Pay attention when something feels wrong — even if you can\'t articulate why. Your gut is collecting data.' },
            { title: 'Permission to change', explanation: 'Very few people end up where they started. The path to meaningful work is rarely straight.' },
          ],
          reflectionPrompt: "What kind of work sounds interesting to you? What sounds miserable? Both answers matter.",
        },
        adult: {
          introduction: "When work doesn't fit, everything suffers. It's not about the job being hard — it's about it being wrong for you. Values conflicts, wasted potential, golden handcuffs. These are real. And recognizing misalignment is the first step to doing something about it.",
          keyConcepts: [
            { title: 'Misalignment signals', explanation: 'Constant dread, having to be someone you\'re not, values violations, "is this it?" — these are signs.' },
            { title: 'Golden handcuffs', explanation: 'Good salary/benefits keeping you in a job that doesn\'t fit. The exit cost feels too high. The staying cost is also high.' },
            { title: 'Career grief is valid', explanation: 'The path not taken. What you might have been. You can grieve this while still valuing what you have.' },
            { title: 'Permission to want alignment', explanation: 'It\'s not ungrateful to want work that matters. Adequacy isn\'t the same as alignment.' },
          ],
          reflectionPrompt: "Does your work fit who you are? If not, what's keeping you there?",
        },
        senior: {
          introduction: "Looking back, did your work fit? What compromises did you make, and were they worth it? These questions aren't about regret — they're about understanding. And if you're still working, they might inform your remaining choices.",
          keyConcepts: [
            { title: 'Retrospective fit assessment', explanation: 'Was your work aligned with who you were? Did that change over time?' },
            { title: 'Choices and trade-offs', explanation: 'Every career involves trade-offs. Understanding yours brings clarity.' },
            { title: 'Grief and gratitude together', explanation: 'You can be grateful for your path AND grieve the roads not taken. Both are valid.' },
            { title: 'Wisdom for others', explanation: 'What would you tell someone in a job that doesn\'t fit? Your experience is valuable.' },
          ],
          reflectionPrompt: "What did you sacrifice for your career? What did you gain? Was it worth it?",
        },
      },
    },
    {
      id: 'manual-6-2-2',
      title: 'Career Transitions',
      emoji: '🔄',
      deepDive: `Career transitions are identity transitions. When you change jobs, careers, or roles, you're not just changing what you do — you're changing who you are (or at least who you think you are).

**"What do you do?" is an identity question:**
In many cultures, your job title IS your identity. Losing that title — through job loss, career change, or retirement — can feel like losing yourself.

**The gap between jobs:**
Unemployment isn't just a financial problem. It's an identity problem. Who are you when you don't have a professional role? This gap can be profoundly disorienting.

**Reinvention at any age:**
The average person changes careers multiple times. "It's too late to change" is rarely actually true. It's scary, and the uncertainty is real, but it's possible.

**Retirement as identity crisis:**
For people whose identity was wrapped up in work, retirement can be devastating. The loss of structure, purpose, and professional identity hits hard. It's not "freedom" — it's loss, at least initially. The opportunity is to build an identity that isn't defined by what you produce.`,
      realWorld: [
        "A laid-off executive struggles more with identity loss than financial loss. He was 'VP of Operations.' Now he's unemployed. Who is he? The identity work is harder than the job search.",
        "A woman changes careers at 45, going from corporate law to teaching. Everyone thought she was crazy. She's never been happier. The pay cut was real; so was the alignment.",
        "A man retires after 40 years and falls into depression. His identity WAS his job. Building a post-work identity takes time, intentionality, and permission to struggle.",
      ],
      tryThis: "Complete this sentence ten times: 'I am...' How many of your answers are about your job? What would be left if you removed those?",
      connectsTo: ['direction', 'alignment', 'identity'],
      content: {
        teen: {
          introduction: "Career transitions might seem far off, but the principle matters now: when your role changes — new school, new activities, new social group — your identity can feel unstable. Learning to have a sense of self that isn't entirely dependent on your role is a life skill.",
          keyConcepts: [
            { title: 'Role ≠ identity', explanation: 'What you DO isn\'t the same as who you ARE. Developing identity beyond your role protects you when roles change.' },
            { title: 'Transitions are normal', explanation: 'Most people change careers multiple times. The path is rarely linear.' },
            { title: 'The gap is disorienting', explanation: 'When you\'re between things — schools, identities, friend groups — it feels unstable. That\'s normal.' },
            { title: 'Reinvention is possible', explanation: 'You\'re not locked in. At any age. The people who seem "locked in" just haven\'t changed yet.' },
          ],
          reflectionPrompt: "If you couldn't be a student anymore, who would you be? What else defines you?",
        },
        adult: {
          introduction: "Career transitions are identity transitions. Changing jobs, losing jobs, switching fields — these aren't just professional changes. They're changes to who you are. Understanding this helps you navigate transitions with more self-compassion.",
          keyConcepts: [
            { title: 'Work and identity are fused', explanation: '"What do you do?" is really "who are you?" Losing a job title can feel like losing yourself.' },
            { title: 'The gap is hard', explanation: 'Unemployment or career transition isn\'t just financial. The identity disorientation is real.' },
            { title: 'Reinvention is possible', explanation: 'It\'s rarely "too late." Scary, yes. But possible. People change careers at every age.' },
            { title: 'Retirement is a transition too', explanation: 'If work was your identity, retirement is a loss. Building post-work identity takes intention.' },
          ],
          reflectionPrompt: "How much of your identity is your job? What would be left if that changed?",
        },
        senior: {
          introduction: "Retirement is the final career transition — and for many, the hardest. If your identity was your work, who are you now? This isn't a problem to solve quickly. It's an identity to rebuild, slowly and with intention.",
          keyConcepts: [
            { title: 'Retirement as loss', explanation: 'It\'s not just freedom. It\'s loss of role, structure, purpose, professional identity. Grief is appropriate.' },
            { title: 'Identity beyond production', explanation: 'You\'re not just what you produce. Building an identity based on being, not doing, is the work of this stage.' },
            { title: 'Purpose still matters', explanation: 'Meaning doesn\'t end when work does. Finding new sources of purpose is essential.' },
            { title: 'Permission to struggle', explanation: 'Retirement adjustment can take years. That\'s not failing. That\'s a major life transition.' },
          ],
          reflectionPrompt: "Who are you now that you're not defined by your job? Or if still working — who will you be?",
        },
      },
    },
  ],
};

// ============================================================
// SECTION 6 EXPORT
// ============================================================

export const MANUAL_SECTION_6: {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  modules: ManualModule[];
} = {
  id: 'section-6-work',
  title: 'The Workplace',
  subtitle: 'Work',
  emoji: '💼',
  color: '#10B981', // Green — growth, money, career
  modules: [
    section6Module1,
    section6Module2,
  ],
};
