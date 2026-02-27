/**
 * Human Manual — Deep Topics for Real Life
 * 
 * This file contains 50+ lessons covering the harder parts of being human:
 * - Relationships & People
 * - Mental Health Real Talk  
 * - Stress & Survival
 * - Work & Money
 * - World & Society
 * - Body & Health
 * - Life Transitions
 * - Growth & Healing
 * 
 * Each lesson is grounded in psychology research and designed to meet
 * people where they actually are — not where we wish they were.
 */

export interface HumanManualLesson {
  id: string;
  title: string;
  category: string;
  duration: number; // minutes
  emoji: string;
  content: {
    introduction: string;
    keyInsights: { title: string; explanation: string }[];
    whatHelps?: string[];
    warningSign?: string;
    professionalNote?: string;
  };
  reflectionQuestions: string[];
  relatedLessons?: string[];
}

export interface HumanManualCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  lessons: HumanManualLesson[];
}

// ============================================================================
// CATEGORY 1: RELATIONSHIPS & PEOPLE
// ============================================================================

const relationshipsLessons: HumanManualLesson[] = [
  {
    id: 'hm-rel-family-wounds',
    title: 'Family Wounds Run Deep',
    category: 'relationships',
    duration: 8,
    emoji: '🩹',
    content: {
      introduction: `The family you grew up in taught you how to be human — for better or worse. Attachment researchers have found that the way your caregivers responded to your needs in the first few years of life literally wired your nervous system for how you'd experience relationships forever after. This isn't destiny. It's just the starting point.

Family wounds don't always look like abuse. Sometimes they look like a parent who was physically present but emotionally absent. A home where anger was explosive and unpredictable. A family where emotions were never discussed, so you learned they weren't acceptable. A parent who used you as their therapist. A sibling who was favored. Neglect doesn't require intention.

The wound isn't just what happened — it's what DIDN'T happen. You might have missed the experience of being truly seen, of having your emotions validated, of feeling unconditionally loved. And you can't miss what you never knew was supposed to be there, which is why many people don't recognize family wounds until much later.

Healing doesn't require your family to acknowledge what happened. It doesn't require reconciliation. It starts with recognizing the wound, grieving what you didn't get, and slowly learning to give it to yourself.`,
      keyInsights: [
        { 
          title: 'The wound and the adaptation', 
          explanation: 'Every family wound comes with an adaptation — a survival strategy you developed. People-pleasing, hyper-independence, emotional shutdown, perfectionism — these aren\'t character flaws. They\'re how you survived.' 
        },
        { 
          title: 'You can love someone and be wounded by them', 
          explanation: 'This is one of the hardest truths. Your parents could have loved you deeply and still harmed you. Both can be true. Acknowledging harm doesn\'t erase love, and love doesn\'t erase harm.' 
        },
        { 
          title: 'Parentification', 
          explanation: 'When children have to parent their parents — emotionally, practically, or both — they miss their own childhood. They become hyper-responsible adults who don\'t know how to let anyone take care of them.' 
        },
        { 
          title: 'Emotional neglect is invisible', 
          explanation: 'Unlike abuse, neglect leaves no marks. It\'s the absence of attunement, validation, and presence. You might not have words for it because nothing "happened" — but something crucial didn\'t happen.' 
        },
      ],
      whatHelps: [
        'Name the wound. Give it words even if they feel inadequate.',
        'Grieve what you didn\'t get. This is real loss.',
        'Identify the adaptation. How did you survive? That skill served you — but does it still?',
        'Reparenting work (see Growth & Healing section)',
        'Therapy, especially trauma-informed or attachment-focused',
      ],
      professionalNote: 'If exploring family wounds brings up intense distress, flashbacks, or destabilization, a trauma-informed therapist can help you process safely.'
    },
    reflectionQuestions: [
      'What did you learn about emotions in your family? Were some feelings allowed and others not?',
      'What adaptation did you develop to survive your family system? Does it still serve you?',
      'If you could go back and give your younger self one thing you didn\'t get — what would it be?',
    ],
    relatedLessons: ['hm-growth-reparenting', 'hm-growth-inner-child', 'hm-mh-trauma-basics'],
  },
  {
    id: 'hm-rel-affairs-betrayal',
    title: 'Affairs and Betrayal Trauma',
    category: 'relationships',
    duration: 10,
    emoji: '💔',
    content: {
      introduction: `Discovering a partner's affair isn't just heartbreak — it's trauma. Research by Dr. Shirley Glass and others has shown that infidelity produces symptoms similar to PTSD: intrusive thoughts, hypervigilance, emotional flooding, difficulty trusting your own perception. This isn't an overreaction. Your attachment system has been fundamentally shaken.

Betrayal trauma is unique because the person who was your source of safety became the source of danger. Your brain is now trying to reconcile these two incompatible realities. This is why it can feel like you're going crazy — obsessive thoughts, checking behaviors, mood swings, physical symptoms. Your nervous system is trying to regain control in a world that suddenly feels unpredictable.

The betrayed partner often gets blamed — for being "too controlling" with their need to know details, for not "moving on" fast enough, for their emotional reactions. But these responses are neurobiologically normal. The brain needs information to update its threat assessment. The emotions need space to process.

Whether you stay or leave, healing is possible. But it's a process measured in years, not months. The relationship either ends, or a new relationship forms between the same two people. The old one is gone either way.`,
      keyInsights: [
        { 
          title: 'Betrayal trauma is real trauma', 
          explanation: 'The symptoms — intrusive thoughts, hypervigilance, sleep disruption, difficulty concentrating — are your nervous system\'s response to attachment violation. You\'re not being dramatic.' 
        },
        { 
          title: 'The need for details is normal', 
          explanation: 'Your brain can\'t move forward without understanding what happened. The obsessive need to know isn\'t pathology — it\'s your mind trying to make sense of something that shattered your reality.' 
        },
        { 
          title: 'Gaslighting compounds the wound', 
          explanation: 'If your partner denied, minimized, or blamed you, you\'ve experienced gaslighting on top of betrayal. Rebuilding trust in your own perception may take longer than rebuilding trust in a partner.' 
        },
        { 
          title: 'Stay or leave — both are valid', 
          explanation: 'There\'s no "right" choice. Some relationships can be rebuilt into something stronger. Some can\'t. Neither choice makes you weak or wrong.' 
        },
        {
          title: 'Triggers may last for years',
          explanation: 'Dates, places, songs, even smells can bring back the flood of pain. This doesn\'t mean you haven\'t healed — it means the wound was deep. The triggers diminish over time but may never fully disappear.'
        }
      ],
      whatHelps: [
        'Full, honest disclosure from the unfaithful partner (research shows trickle truth prolongs trauma)',
        'Space for all your emotions — rage, grief, confusion, even love',
        'Couples therapy with a specialist in infidelity (not all therapists understand betrayal trauma)',
        'Individual therapy to process trauma symptoms',
        'Support from people who won\'t push you to "just forgive" or "just leave"',
        'Time — healing takes 2-5 years on average, whether you stay or go',
      ],
      professionalNote: 'If you\'re experiencing PTSD symptoms from betrayal, a trauma-informed therapist (look for someone trained in betrayal trauma or infidelity) can help stabilize your nervous system while you make decisions.'
    },
    reflectionQuestions: [
      'What do you need right now that you\'re not getting?',
      'What would it take for you to trust again — trust your partner, or trust yourself?',
      'What did you learn about yourself through this pain?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-rel-boundaries-protect'],
  },
  {
    id: 'hm-rel-adult-friendships',
    title: 'Adult Friendships Are Hard',
    category: 'relationships',
    duration: 7,
    emoji: '👯',
    content: {
      introduction: `Making and keeping friends as an adult is legitimately difficult, and it's not your fault. Research shows that friendship requires three things: proximity (being near each other regularly), repeated unplanned interaction, and a setting that encourages vulnerability. School and college naturally provided all three. Adult life provides almost none.

After school, you have to manufacture opportunities that used to happen automatically. You have to text people to hang out, which feels vulnerable. You have to show up tired after work, which feels hard. You have to be the one to reach out, which feels one-sided. This is normal. It's not that you're bad at friendship — it's that the conditions for friendship have fundamentally changed.

The research is clear: adults need friends for health and wellbeing. Loneliness is as harmful as smoking 15 cigarettes a day. But knowing this doesn't make it easier. The solution isn't to try harder — it's to create structures that allow friendship to develop naturally: recurring activities, shared interests, built-in time together.

And sometimes the hardest part is grieving the friendships that didn't survive the transition to adulthood. People grow in different directions. It's not anyone's fault. But the loss is real.`,
      keyInsights: [
        { 
          title: 'Friendship requires structure', 
          explanation: 'It takes an average of 200 hours together to become close friends. Without built-in proximity, you have to create recurring opportunities: weekly game nights, gym buddies, book clubs, anything that repeats.' 
        },
        { 
          title: 'Initiation feels one-sided because it is', 
          explanation: 'In the early stages, someone has to be willing to reach out more. It\'s awkward. It feels vulnerable. But if you wait for others to initiate, everyone waits.' 
        },
        { 
          title: 'Quality over quantity', 
          explanation: 'You don\'t need 10 close friends. Research suggests having even 3-5 people you can truly count on provides most of the wellbeing benefits.' 
        },
        { 
          title: 'Grief is part of it', 
          explanation: 'Outgrowing friendships hurts. Drifting apart hurts. The friends who couldn\'t grow with you — that\'s a real loss that deserves acknowledgment.' 
        },
      ],
      whatHelps: [
        'Join recurring activities aligned with your interests (same people, same time, week after week)',
        'Be the initiator — someone has to, and it might as well be you',
        'Lower the bar: texting "thinking of you" counts as maintaining connection',
        'Accept that some friendships are seasonal and let them go with grace',
        'Be patient — adult friendships develop slowly',
      ],
    },
    reflectionQuestions: [
      'What recurring activities could you join to increase proximity with potential friends?',
      'Who have you been meaning to reach out to? What stops you?',
      'Is there a friendship you need to grieve instead of trying to revive?',
    ],
    relatedLessons: ['hm-trans-identity-shifts', 'hm-stress-overwhelm'],
  },
  {
    id: 'hm-rel-boundaries-protect',
    title: 'Boundaries Protect — They Don\'t Punish',
    category: 'relationships',
    duration: 6,
    emoji: '🚧',
    content: {
      introduction: `Boundaries are not about controlling other people — they're about what YOU will do. "You can't talk to me that way" isn't a boundary. "I will leave the conversation if you yell at me" is. See the difference? One tries to control their behavior. The other defines yours.

Many people struggle with boundaries because they were taught that having needs is selfish, that love means tolerating harm, or that keeping the peace is more important than protecting yourself. These beliefs are survival adaptations from families or relationships where your boundaries weren't respected. They're understandable — and they can change.

Setting boundaries often feels mean at first. If you've been boundaryless, even reasonable limits will feel harsh. If others are used to unlimited access to you, they will often react badly when you start having limits. This doesn't mean you're wrong. It means they got used to a dynamic that wasn't sustainable.

You are allowed to change the terms of access to your time, energy, and self. Some relationships won't survive your boundaries. That's information about those relationships.`,
      keyInsights: [
        { 
          title: 'Boundaries define YOUR behavior, not theirs', 
          explanation: '"I won\'t discuss this topic." "I\'ll need to hang up if this continues." "I\'m not available after 9pm." These define what you will do in response to situations.' 
        },
        { 
          title: 'Guilt doesn\'t mean you\'re wrong', 
          explanation: 'If you were raised without boundaries, setting them will feel guilty. That guilt is just your nervous system adjusting. It\'s not moral guidance.' 
        },
        { 
          title: 'Boundaries can be flexible without being weak', 
          explanation: 'You can have firm boundaries in some areas and looser ones in others. You can adjust based on context. Flexibility isn\'t the same as having no limits.' 
        },
        { 
          title: 'Consequences must be enforceable', 
          explanation: 'Don\'t set boundaries you won\'t enforce. "I\'ll leave" only works if you actually leave. Empty threats erode all your boundaries.' 
        },
      ],
      whatHelps: [
        'Start small — practice with low-stakes boundaries before the big ones',
        'Write out your boundaries and their consequences before difficult conversations',
        'Expect pushback and plan for it — people who benefited from your lack of boundaries won\'t celebrate your new ones',
        'Remember: "No" is a complete sentence',
        'Find support from people who model healthy boundaries',
      ],
    },
    reflectionQuestions: [
      'Where in your life do you need a boundary you don\'t currently have?',
      'What belief makes it hard for you to set that boundary?',
      'What consequence would you be willing to actually enforce?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-growth-self-compassion'],
  },
  {
    id: 'hm-rel-toxic-patterns',
    title: 'Breaking Toxic Relationship Patterns',
    category: 'relationships',
    duration: 8,
    emoji: '🔄',
    content: {
      introduction: `If you keep ending up in the same types of difficult relationships, you're not unlucky — you're running a pattern. This isn't blame; it's recognition. The patterns we learned in childhood about what love looks like, what we deserve, and how relationships work tend to replay until we consciously interrupt them.

Maybe you're drawn to people who are emotionally unavailable because that's what love felt like growing up. Maybe you choose partners who need rescuing because being needed feels like love. Maybe you tolerate treatment you'd never accept for a friend because somewhere you learned that your needs don't matter. The pattern made sense once. It kept you connected to caregivers who weren't always safe or present. But what was adaptive then is destructive now.

Breaking the pattern starts with seeing it. Not judging it — just seeing it. What do your relationships have in common? What role do you tend to play? What dynamics feel "comfortable" even when they're harmful? Comfort isn't the same as healthy. Sometimes healthy feels uncomfortable precisely because it's new.

Change is possible. But it requires staying conscious during the moments when your pattern wants to take over. It means tolerating the discomfort of choosing differently. And it often means grieving the fantasy that the next person with the same pattern will give you what the others couldn't.`,
      keyInsights: [
        { 
          title: 'Familiar ≠ healthy', 
          explanation: 'We\'re drawn to what feels familiar, even when it\'s harmful. Chaos can feel like love if that\'s what you grew up with. Stability can feel boring or suspicious.' 
        },
        { 
          title: 'You can\'t rescue your childhood through adult relationships', 
          explanation: 'Choosing partners who mirror a difficult parent and trying to "win" their love this time is a common pattern. It doesn\'t work. The wound needs to be healed directly, not through proxy.' 
        },
        { 
          title: 'Red flags look different from inside the pattern', 
          explanation: 'What friends see as warning signs often feel like intensity, chemistry, or being chosen. Your nervous system doesn\'t distinguish between danger and excitement in the early stages.' 
        },
        { 
          title: 'Healing attracts different people', 
          explanation: 'As you heal, you become less interesting to people who wanted to exploit your wounds. And more interesting to people who want a partner, not a project.' 
        },
      ],
      whatHelps: [
        'Map your relationship history — look for common elements',
        'Identify what role you play (rescuer, peacekeeper, pursuer, etc.)',
        'Slow down — patterns thrive on intensity and speed',
        'Get outside perspective from therapists or trusted friends',
        'Practice tolerating the discomfort of "boring" (healthy)',
      ],
    },
    reflectionQuestions: [
      'What do your significant relationships have in common?',
      'What role do you typically play in relationships?',
      'What would choosing differently actually look like?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-growth-inner-child'],
  },
  {
    id: 'hm-rel-loneliness-epidemic',
    title: 'The Loneliness Epidemic',
    category: 'relationships',
    duration: 6,
    emoji: '🏝️',
    content: {
      introduction: `Loneliness has reached epidemic levels, and it's not because people are flawed. Our society has been systematically dismantled of the structures that used to create connection: extended families, neighborhoods, religious communities, third places, even front porches. We now have to individually solve what used to be collectively provided.

Loneliness isn't the same as being alone. You can feel lonely in a crowd, in a marriage, or surrounded by family. Loneliness is the gap between the connection you have and the connection you need. And your nervous system treats this gap like a threat — because evolutionarily, isolation WAS a threat to survival.

Chronic loneliness changes the brain. It increases inflammation, disrupts sleep, and triggers hypervigilance. It can make you interpret neutral social cues as negative, creating a cycle where loneliness breeds more isolation. This isn't weakness — it's neurobiology.

The solution isn't just "put yourself out there." It's recognizing that the loneliness epidemic is a societal problem requiring individual workarounds until we rebuild the village we've lost.`,
      keyInsights: [
        { 
          title: 'Loneliness is a biological alarm', 
          explanation: 'Your brain treats social disconnection like hunger or thirst — a signal that a survival need isn\'t being met. Take it seriously.' 
        },
        { 
          title: 'Quality over quantity', 
          explanation: 'You don\'t need 100 friends. You need a few people who truly know you. One deep connection does more for health than dozens of acquaintances.' 
        },
        { 
          title: 'The loneliness-isolation spiral', 
          explanation: 'Loneliness can make social interaction feel more threatening, leading to withdrawal, leading to more loneliness. Recognizing this cycle is the first step to interrupting it.' 
        },
        { 
          title: 'It\'s a societal failure, not a personal one', 
          explanation: 'You\'re not lonely because something\'s wrong with you. You\'re lonely because we built a world that isolates people and then blames them for being isolated.' 
        },
      ],
      whatHelps: [
        'Start small — even brief positive interactions help',
        'Regular, recurring contact matters more than occasional deep connection',
        'Volunteer work provides connection with added meaning',
        'Online communities count — especially for isolated populations',
        'Pet connection is real connection (research supports this)',
        'Be honest with someone about feeling lonely — shame grows in silence',
      ],
    },
    reflectionQuestions: [
      'On a scale of 1-10, how lonely do you feel most days?',
      'What\'s one small way you could increase meaningful contact this week?',
      'What keeps you from reaching out when you\'re lonely?',
    ],
    relatedLessons: ['hm-rel-adult-friendships', 'hm-mh-depression-truth'],
  },
  {
    id: 'hm-rel-difficult-people',
    title: 'Dealing with Difficult People',
    category: 'relationships',
    duration: 7,
    emoji: '⚔️',
    content: {
      introduction: `Some people in your life are genuinely difficult — not because of a misunderstanding you could solve with better communication, but because of who they are. They might be narcissistic, manipulative, chronically negative, or simply incompatible with your wellbeing. Recognizing this is not being judgmental; it's being realistic.

The tricky part is that many of these people can't be removed from your life — they're family members, coworkers, or co-parents. The strategy shifts from "get away from them" to "limit their impact on your nervous system." This requires accepting that you can't change them, only your response to them.

The "gray rock" method works for some situations: becoming so boring and non-reactive that you stop being an interesting target. Strict boundaries work for others. Sometimes the only solution is radical acceptance that this person will always be difficult, and restructuring your life to minimize contact.

Your energy is finite. Difficult people often consume disproportionate amounts of it. Choosing where to spend that energy is an act of self-preservation, not selfishness.`,
      keyInsights: [
        { 
          title: 'You can\'t change them', 
          explanation: 'This is both devastating and liberating. The fantasy that if you just explain it right, they\'ll understand — let it go. Channel that energy into managing your own response.' 
        },
        { 
          title: 'Gray rock technique', 
          explanation: 'Becoming boring, unresponsive, and uninteresting to someone who feeds on drama. Short answers, no emotional engagement, no JADE (Justify, Argue, Defend, Explain).' 
        },
        { 
          title: 'Protect your energy budget', 
          explanation: 'You have limited emotional energy. Difficult people drain it disproportionately. Consciously deciding how much access they get is not mean — it\'s mathematics.' 
        },
        { 
          title: 'Their behavior reflects them, not you', 
          explanation: 'Difficult people often try to make you feel like the problem. Remember: their reaction to reasonable boundaries is information about them, not about whether your boundaries are okay.' 
        },
      ],
      whatHelps: [
        'Lower your expectations — expect them to be who they are',
        'Prepare emotionally before interactions',
        'Have a "safe person" to debrief with afterward',
        'Use the BIFF method: Brief, Informative, Friendly, Firm',
        'Consider whether low contact or no contact is possible',
        'Document interactions if needed for legal/HR purposes',
      ],
    },
    reflectionQuestions: [
      'Who in your life is consistently difficult? What pattern do interactions with them follow?',
      'What have you been hoping will change that probably won\'t?',
      'What would protecting your energy from this person actually look like?',
    ],
    relatedLessons: ['hm-rel-boundaries-protect', 'hm-stress-overwhelm'],
  },
  {
    id: 'hm-rel-sibling-wounds',
    title: 'Sibling Relationships: The Longest Ties',
    category: 'relationships',
    duration: 9,
    emoji: '👫',
    content: {
      introduction: `Sibling relationships are the longest relationships most people will ever have — longer than friendships, longer than marriages, longer than parent-child bonds. And yet we often underestimate how profoundly these relationships shape us. Your siblings witnessed your childhood. They were there for the family dysfunction you might still be processing. They hold memories no one else has.

Sibling relationships can be sources of deep love and support, or lasting wounds and rivalry. Often, they're both. The dynamics you developed as children — the golden child and the scapegoat, the caretaker and the baby, the peacemaker and the troublemaker — tend to persist into adulthood unless actively examined.

Sibling rivalry isn't childish. It often reflects real competition for limited parental attention, approval, or resources. If your parents explicitly or implicitly compared you to your siblings, that wound runs deep. If one sibling was favored, the others carry that rejection. If one sibling was parentified (made responsible for the others), that shapes every relationship that follows.

Adult sibling relationships require renegotiation. You're not the same people you were at 8 or 15. But many siblings never update their perception of each other, still relating through the roles assigned in childhood. Healing sibling relationships — or accepting they can't be healed — is part of adult growth.`,
      keyInsights: [
        { 
          title: 'Childhood roles persist', 
          explanation: 'The "responsible one," the "problem child," the "favorite" — these labels often stick into adulthood unless deliberately examined. You may still be playing out dynamics from 20 years ago.' 
        },
        { 
          title: 'Parental comparison creates lasting wounds', 
          explanation: '"Why can\'t you be more like your sister?" is a wound that echoes for decades. Being compared unfavorably to siblings shapes self-worth at its foundation.' 
        },
        { 
          title: 'Grief for the sibling relationship you didn\'t have', 
          explanation: 'Some siblings become best friends. Others become strangers. If you didn\'t get the sibling relationship you wanted or needed, that\'s a legitimate loss to grieve.' 
        },
        { 
          title: 'Estrangement is sometimes necessary', 
          explanation: 'Not all sibling relationships can or should be maintained. Cutting contact with a toxic sibling isn\'t failure — it\'s protection.' 
        },
        {
          title: 'Adult siblings must renegotiate',
          explanation: 'You\'re not 12 anymore. The relationship needs updating to reflect who you both are now, not who you were in childhood. This requires both people to be willing.'
        }
      ],
      whatHelps: [
        'Examine the roles: What role were you assigned in your family? Are you still playing it?',
        'Separate your sibling from your parents\' favoritism — they didn\'t choose to be favored',
        'Have direct conversations about childhood dynamics (if safe)',
        'Accept that not all sibling relationships can be close',
        'Grieve the relationship you wished you had',
        'Set boundaries as you would with any adult relationship',
      ],
      professionalNote: 'If sibling relationships were abusive or involved parentification, trauma-informed therapy can help process these complex dynamics.'
    },
    reflectionQuestions: [
      'What role were you assigned in your sibling group? Are you still playing it?',
      'How did your parents\' treatment of your siblings affect your relationship with them?',
      'What would you need from your sibling(s) to feel closer? Is that realistic to expect?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-growth-reparenting', 'hm-rel-boundaries-protect'],
  },
  {
    id: 'hm-rel-gender-identity',
    title: 'Gender Identity and Coming Out',
    category: 'relationships',
    duration: 10,
    emoji: '🏳️‍⚧️',
    content: {
      introduction: `Gender identity — your internal sense of your own gender — is one of the most fundamental aspects of who you are. For cisgender people (those whose gender identity matches their sex assigned at birth), this usually goes unexamined. For transgender, non-binary, and gender-diverse people, understanding and expressing your true gender can be a lifelong journey.

Coming out as trans or non-binary is not a single event but an ongoing process. You may come out to yourself first, then to close friends, family, coworkers, and the world — each step carrying its own risks and rewards. Some people will embrace you. Others will struggle. Some relationships will deepen. Others will end. This is profoundly unfair, but it's the reality many trans people navigate.

Gender dysphoria — the distress caused by the mismatch between your gender identity and your body or how others perceive you — can range from mild discomfort to severe anguish. Not all trans people experience dysphoria, and the absence of dysphoria doesn't make someone "less trans." Gender euphoria — the joy of being seen and expressed as your true gender — is equally valid as an indicator.

Transition looks different for everyone. Social transition (name, pronouns, presentation), medical transition (hormones, surgeries), or no medical transition at all — there's no "right" way to be trans. What matters is living authentically.`,
      keyInsights: [
        { 
          title: 'Gender identity is internal and real', 
          explanation: 'Your gender is not determined by your body, your chromosomes, or what others think. It\'s an internal reality that only you can know. Science supports the existence and validity of transgender identities.' 
        },
        { 
          title: 'Coming out is ongoing', 
          explanation: 'You don\'t come out once. You come out again and again — to new friends, new jobs, new doctors, new situations. Each time requires assessing safety and energy.' 
        },
        { 
          title: 'Grief is part of transition', 
          explanation: 'Even positive change involves loss — loss of relationships that couldn\'t adapt, loss of the life you might have had, loss of safety or privilege. This grief is valid alongside the joy.' 
        },
        { 
          title: 'Not everyone will understand', 
          explanation: 'Some people will never fully get it. You can\'t educate everyone. Protecting your energy sometimes means accepting that some people will stay ignorant.' 
        },
        {
          title: 'Community is essential',
          explanation: 'Finding other trans and gender-diverse people — online or in person — provides validation, practical knowledge, and the relief of being understood without explanation.'
        }
      ],
      whatHelps: [
        'Connect with trans community (online spaces, support groups, chosen family)',
        'Find trans-affirming healthcare providers (WPATH guidelines)',
        'Set boundaries with people who refuse to respect your identity',
        'Document your journey if helpful (some find this affirming)',
        'Move at your own pace — there\'s no timeline for transition',
        'Access mental health support from a gender-affirming therapist',
      ],
      warningSign: 'If you\'re experiencing severe dysphoria, self-harm urges, or suicidal thoughts, please reach out to trans-specific crisis lines like Trans Lifeline (877-565-8860) or the 988 Suicide & Crisis Lifeline.',
      professionalNote: 'Gender-affirming care is evidence-based healthcare. Look for providers who follow WPATH Standards of Care and approach gender diversity with affirmation, not gatekeeping.'
    },
    reflectionQuestions: [
      'When did you first notice your gender identity didn\'t fit expectations? How did you cope?',
      'Who in your life has been affirming? Who has been harmful?',
      'What does living authentically as your gender look like for you?',
    ],
    relatedLessons: ['hm-world-minority-stress', 'hm-trans-identity-shifts', 'hm-rel-boundaries-protect'],
  },
];

// ============================================================================
// CATEGORY 2: MENTAL HEALTH REAL TALK
// ============================================================================

const mentalHealthLessons: HumanManualLesson[] = [
  {
    id: 'hm-mh-depression-truth',
    title: 'Depression: What It Really Is',
    category: 'mental-health',
    duration: 8,
    emoji: '🌧️',
    content: {
      introduction: `Depression isn't sadness. Sadness is a normal emotion with a beginning, middle, and end. Depression is a disorder that flattens everything — not just your mood, but your energy, motivation, sleep, appetite, concentration, and sense of self. It's not "being sad" that you should "snap out of." It's a neurobiological state that requires intervention.

The symptoms can be confusing because they don't always look like the stereotype. Sometimes depression looks like irritability, not tears. Sometimes it's numbness, not sadness. Sometimes it's exhaustion, not crying in bed. Sometimes you can still function at work while feeling hollow inside. "High-functioning depression" is still depression.

Depression lies. It tells you this is permanent. It tells you you're a burden. It tells you nothing will help. It tells you people would be better off without you. These are symptoms of the illness, not truths about reality. The cruelest thing about depression is that it attacks the very parts of you that could seek help — motivation, hope, self-worth.

Treatment works for most people. Medication helps many. Therapy helps many. The combination helps most. Exercise, sleep, connection, and meaning matter too. But first: recognizing depression for what it is — a treatable condition, not a character flaw.`,
      keyInsights: [
        { 
          title: 'Depression lies', 
          explanation: 'The hopelessness, worthlessness, and belief that nothing will help are symptoms of the disorder. They feel like truth because depression hijacks the parts of your brain that evaluate reality.' 
        },
        { 
          title: 'It\'s neurobiological', 
          explanation: 'Brain chemistry, inflammation, neural pathways, genetics — depression is a medical condition. You wouldn\'t tell someone with diabetes to "just think positive."' 
        },
        { 
          title: 'It doesn\'t always look like sadness', 
          explanation: 'Irritability, numbness, fatigue, physical pain, and cognitive fog are all depression symptoms. You don\'t need to cry to be depressed.' 
        },
        { 
          title: 'Functioning doesn\'t mean fine', 
          explanation: 'Going to work, taking care of kids, appearing okay while falling apart inside is exhausting. Just because you can still function doesn\'t mean you\'re not suffering.' 
        },
        {
          title: 'It\'s episodic but can recur',
          explanation: 'Many people have depressive episodes that resolve, but the condition can return. Learning your warning signs and having a response plan helps manage the long-term.'
        }
      ],
      whatHelps: [
        'Professional help — therapy (especially CBT, behavioral activation), medication, or both',
        'Behavioral activation — doing things even when you don\'t feel like it, because feeling follows action',
        'Protect sleep even when it\'s disrupted',
        'Movement, even small amounts',
        'Connection, even when you want to isolate',
        'Reduce decision fatigue — structure helps when motivation is gone',
      ],
      warningSign: 'If you\'re having thoughts of suicide, please reach out: 988 (US Suicide & Crisis Lifeline), Crisis Text Line (text HOME to 741741), or your local emergency services.',
      professionalNote: 'Depression is one of the most treatable mental health conditions. If you\'ve been struggling for more than two weeks with persistent low mood, loss of interest, or functional impairment, please see a professional.'
    },
    reflectionQuestions: [
      'Have you been confusing depression with laziness, weakness, or just "being sad"?',
      'What lies has depression been telling you that you\'ve been believing?',
      'What\'s one small action you could take today, even if you don\'t feel like it?',
    ],
    relatedLessons: ['hm-mh-suicidal-thoughts', 'hm-body-medication-stigma', 'hm-stress-burnout'],
  },
  {
    id: 'hm-mh-anxiety-types',
    title: 'Anxiety: When the Alarm Won\'t Stop',
    category: 'mental-health',
    duration: 8,
    emoji: '⚡',
    content: {
      introduction: `Anxiety is your threat-detection system stuck in "on" position. It evolved to keep you alive — to notice danger and respond quickly. The problem is that your ancient alarm system can't tell the difference between a bear attack and an email from your boss. It responds to uncertainty, social evaluation, and "what ifs" with the same intensity as physical danger.

There are many flavors of anxiety: Generalized Anxiety Disorder (constant worry about everything), Social Anxiety (fear of judgment), Panic Disorder (sudden intense panic attacks), Health Anxiety (constant worry about illness), and more. They share a common thread: the alarm is too sensitive, fires too often, or won't turn off.

Anxiety becomes a disorder when it significantly impairs your life — when you're avoiding things, when your worry is disproportionate to actual risk, when physical symptoms are constant, when you can't stop the loop no matter what you try. The threshold isn't "any anxiety is bad" — it's "this anxiety is no longer serving me and is actively harming me."

The good news: anxiety is highly treatable. Exposure therapy, cognitive behavioral therapy, medication, and nervous system regulation techniques all have strong evidence. The bad news: untreated anxiety tends to expand. The things you avoid grow.`,
      keyInsights: [
        { 
          title: 'Avoidance makes it worse', 
          explanation: 'When you avoid something anxiety-provoking, your brain learns "that was dangerous, good thing I avoided it." The anxiety grows. Gradual exposure is the opposite approach — teaching your brain that the feared situation is survivable.' 
        },
        { 
          title: 'The body drives anxiety, not just thoughts', 
          explanation: 'Racing heart, shallow breathing, tight muscles — these aren\'t just symptoms of anxiety, they also cause it. Regulating the body can interrupt the cycle even when your mind keeps spinning.' 
        },
        { 
          title: 'Anxiety and excitement feel identical', 
          explanation: 'The physical sensations are the same — your interpretation makes the difference. Sometimes "I\'m anxious" can be reframed as "I\'m excited." It doesn\'t always work, but when it does, it helps.' 
        },
        { 
          title: 'Worry is not problem-solving', 
          explanation: 'Worry feels productive because your brain is working hard. But you\'re not solving anything — you\'re rehearsing catastrophe. Effective problem-solving has an endpoint. Worry loops forever.' 
        },
      ],
      whatHelps: [
        'Exposure therapy (facing fears gradually with support)',
        'Cognitive behavioral therapy (challenging unhelpful thoughts)',
        'Nervous system regulation (breathing techniques, vagal toning)',
        'Medication (SSRIs, SNRIs) for moderate to severe cases',
        'Reducing caffeine (seriously)',
        'Regular exercise (burns off adrenaline)',
        'Sleep protection (anxiety and sleep deprivation feed each other)',
      ],
      professionalNote: 'If anxiety is significantly impairing your life — if you\'re avoiding important things, if physical symptoms are constant, if you can\'t control the worry — please see a professional. Anxiety responds very well to treatment.'
    },
    reflectionQuestions: [
      'What are you avoiding because of anxiety? How has that avoidance grown over time?',
      'What would your life look like if anxiety had less power over your decisions?',
      'Where do you feel anxiety in your body? Can you notice it without trying to fix it?',
    ],
    relatedLessons: ['hm-mh-panic-attacks', 'hm-stress-nervous-system', 'hm-body-chronic'],
  },
  {
    id: 'hm-mh-suicidal-thoughts',
    title: 'Suicidal Thoughts: You\'re Not Alone',
    category: 'mental-health',
    duration: 10,
    emoji: '🆘',
    content: {
      introduction: `Having thoughts of suicide doesn't make you crazy, weak, or broken. It makes you human in pain. Suicidal ideation exists on a spectrum — from passive thoughts ("I wouldn't mind if I didn't wake up") to active plans with intent. All points on this spectrum deserve attention and care, but they require different levels of intervention.

The stigma around suicidal thoughts prevents people from talking about them, which is exactly the wrong thing. Thoughts that stay hidden grow in power. Speaking them — to a therapist, a crisis line, sometimes a trusted person — reduces their grip. Talking about suicide doesn't "plant the idea" — research has thoroughly debunked this myth. Talking about it saves lives.

Suicidal thoughts often emerge when pain exceeds coping resources. The solution isn't always to reduce the pain (though that helps). It's also to increase coping resources: support, skills, meaning, connection, treatment. When the balance tips back, the thoughts often recede.

If you're having these thoughts, please know: this state is temporary, even though it doesn't feel that way. Treatment works. People survive this and go on to live meaningful lives. The thought that everyone would be better off without you is a symptom of the pain, not an accurate assessment of reality.`,
      keyInsights: [
        { 
          title: 'It\'s a symptom, not a character trait', 
          explanation: 'Suicidal thoughts are symptoms of overwhelming pain — not evidence that you\'re fundamentally flawed. Like other symptoms, they can be treated.' 
        },
        { 
          title: 'Passive vs. active ideation', 
          explanation: 'Passive ("I wish I wasn\'t here") is different from active (specific plans, intent). Both deserve care, but active ideation is a crisis requiring immediate support.' 
        },
        { 
          title: 'Talking helps, not hurts', 
          explanation: 'The old fear that asking about suicide makes it more likely has been thoroughly disproven. Asking directly and openly can be a lifeline.' 
        },
        { 
          title: 'Pain exceeds resources', 
          explanation: 'Suicidal states emerge when pain exceeds the ability to cope. The goal is tipping the balance: reducing pain AND building coping resources.' 
        },
        {
          title: 'The permanent solution lie',
          explanation: 'Depression makes suicide feel like the only solution to unbearable pain. It\'s a permanent response to a temporary state. The pain changes. People who survive suicide attempts overwhelmingly don\'t go on to die by suicide.'
        }
      ],
      whatHelps: [
        'Tell someone — a therapist, crisis line, trusted person',
        'Create distance from means (research shows this saves lives)',
        'Crisis resources: 988 (US), Crisis Text Line (text HOME to 741741)',
        'Write a "reasons to live" list when you\'re NOT in crisis — use it during crisis',
        'Make a safety plan with a professional',
        'Remember: this feeling is temporary, even when it feels permanent',
      ],
      warningSign: 'If you have a plan and intent, this is a crisis. Please call 988, go to an emergency room, or call emergency services. This is not weakness — this is using the resources designed for exactly this moment.',
      professionalNote: 'Suicidal ideation always warrants professional help. Please reach out to a mental health provider or crisis service. You don\'t have to carry this alone.'
    },
    reflectionQuestions: [
      'Have you been carrying thoughts you\'ve been afraid to share?',
      'Who could you tell if things got worse?',
      'What has kept you here so far? (These are your reasons to live.)',
    ],
    relatedLessons: ['hm-mh-depression-truth', 'hm-growth-self-compassion'],
  },
  {
    id: 'hm-mh-panic-attacks',
    title: 'Panic Attacks: Intense but Not Dangerous',
    category: 'mental-health',
    duration: 7,
    emoji: '💨',
    content: {
      introduction: `A panic attack feels like dying. Racing heart, chest pain, difficulty breathing, dizziness, tingling, sweating, shaking, a sense of doom — your body is fully convinced something catastrophic is happening. But here's the crucial truth: panic attacks, while terrifying, are not medically dangerous. They cannot cause heart attacks, make you stop breathing, make you go crazy, or kill you.

Panic attacks are your fight-or-flight system misfiring with full intensity. All the symptoms are just adrenaline and stress hormones doing what they're designed to do when you face mortal danger. The problem is there's no actual danger — just your alarm system gone haywire.

Understanding this is the first step to reducing panic's power. When you're in a panic attack and you add fear of the panic attack itself, it escalates. When you can recognize "this is a panic attack, it's awful but not dangerous, and it will pass" — you've interrupted the escalation cycle.

Panic disorder develops when you start fearing and avoiding situations where panic might strike. The avoidance seems protective but actually trains your brain that those situations ARE dangerous. Treatment focuses on breaking this cycle through exposure and learning that panic, while miserable, is survivable.`,
      keyInsights: [
        { 
          title: 'Panic is miserable but not dangerous', 
          explanation: 'No one has ever died from a panic attack. Your heart won\'t stop. You won\'t stop breathing. You won\'t go crazy. Your body is doing exactly what it\'s designed to do — just at the wrong time.' 
        },
        { 
          title: 'Fear of panic feeds panic', 
          explanation: 'The panic about having panic creates a feedback loop. Learning to tolerate panic — to let it happen without fighting — paradoxically reduces its power.' 
        },
        { 
          title: 'It peaks and passes', 
          explanation: 'A panic attack cannot maintain peak intensity forever. The adrenaline burns off. Most attacks peak around 10 minutes and resolve within 20-30. It feels like forever, but it ends.' 
        },
        { 
          title: 'Avoidance expands the fear', 
          explanation: 'If you avoid places where you\'ve panicked, your world shrinks. The more you avoid, the more things become "dangerous." Facing the situations (with support) is how you reclaim your life.' 
        },
      ],
      whatHelps: [
        'During panic: slow breathing (exhale longer than inhale), grounding (5 things you can see), reminding yourself "this will pass"',
        'Between attacks: education about what panic actually is (you\'re getting this now)',
        'Interoceptive exposure: intentionally creating panic sensations in safe contexts to teach your brain they\'re not dangerous',
        'Avoiding avoidance: gradually returning to situations you\'ve been avoiding',
        'Medication: SSRIs for prevention, benzodiazepines for acute panic (short-term, with caution)',
      ],
      professionalNote: 'If panic attacks are recurrent and you\'re avoiding situations because of them, please see a professional. Panic disorder responds extremely well to treatment — most people recover fully.'
    },
    reflectionQuestions: [
      'What situations have you been avoiding because of fear of panic?',
      'What do you tell yourself during a panic attack? Is it helping or making it worse?',
      'What would you do if panic didn\'t have power over your choices?',
    ],
    relatedLessons: ['hm-mh-anxiety-types', 'hm-stress-nervous-system'],
  },
  {
    id: 'hm-mh-trauma-basics',
    title: 'Trauma: What Actually Happens',
    category: 'mental-health',
    duration: 9,
    emoji: '🌪️',
    content: {
      introduction: `Trauma isn't defined by the event — it's defined by how your nervous system responded to it. Two people can experience the same event; one walks away shaken but okay, the other develops lasting symptoms. This isn't weakness or strength — it's about circumstances, support, prior history, and biology.

Trauma occurs when your nervous system gets overwhelmed and can't complete its natural stress response. The event gets encoded differently — fragments of sensory memory without the normal narrative structure. That's why trauma survivors have flashbacks rather than regular memories, why triggers hit like time machines, why the body keeps reacting as if the past is happening now.

Not all difficult experiences are trauma. Trauma has a specific neurobiological signature: the memory remains "hot," easily triggered, poorly integrated into your life story. It intrudes through flashbacks, nightmares, and physical symptoms. It leads to avoidance, hypervigilance, and changes in how you see yourself and the world.

The good news: trauma is one of the most treatable conditions we know how to treat. The brain can heal. New neural pathways can form. The hot memory can be cooled and integrated. People recover and go on to live full lives. But recovery requires the right approach — not just "talking about it" but specialized trauma therapy.`,
      keyInsights: [
        { 
          title: 'Trauma is in the nervous system, not just the mind', 
          explanation: 'That\'s why you can\'t think your way out of it. The body holds the experience and keeps responding as if it\'s still happening. Treatment needs to include the body.' 
        },
        { 
          title: 'Big T and little t trauma', 
          explanation: 'Big T: life-threatening events, violence, disasters. Little t: chronic stress, emotional neglect, bullying, losses. Both can overwhelm the system. Don\'t dismiss your "little t" experiences.' 
        },
        { 
          title: 'The window of tolerance', 
          explanation: 'Trauma shrinks your window — the range where you can cope. Too much stimulation pushes you into hyperarousal (panic, rage). Too little drops you into hypoarousal (shutdown, numbing). Healing expands the window.' 
        },
        { 
          title: 'Recovery is possible', 
          explanation: 'The brain\'s plasticity means trauma responses can change. With proper treatment, intrusive symptoms decrease, triggers lose their power, and life expands again.' 
        },
      ],
      whatHelps: [
        'Trauma-specific therapy: EMDR, Somatic Experiencing, CPT, prolonged exposure',
        'Safety first — you need enough stability before processing',
        'Body-based approaches: yoga, breathing, movement',
        'Self-compassion — trauma responses were survival, not weakness',
        'Time AND treatment (time alone doesn\'t heal all wounds)',
        'Community and connection — isolation worsens trauma effects',
      ],
      professionalNote: 'If you have intrusive symptoms (flashbacks, nightmares, physical reactions to triggers), please see a trauma-specialized therapist. Not all therapy is equipped for trauma work.'
    },
    reflectionQuestions: [
      'Do you have experiences that still feel "hot" — easily triggered, intrusive?',
      'What did your nervous system have to do to survive? Can you offer that part of you compassion?',
      'What would healing look like for you — not erasing the past, but integrating it?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-stress-freeze-response', 'hm-world-generational'],
  },
  {
    id: 'hm-mh-medication-misconceptions',
    title: 'Psychiatric Medication: Facts vs. Fear',
    category: 'mental-health',
    duration: 7,
    emoji: '💊',
    content: {
      introduction: `There's more stigma around psychiatric medication than almost any other type of medicine. People who would take blood pressure medication without shame feel embarrassed about antidepressants. People worry medication will "change who they are" or become a "crutch." Let's address these fears with facts.

Psychiatric medications work on brain chemistry — neurotransmitters, receptors, neural pathways. They don't give you a fake version of happiness. They correct chemical imbalances that are making your normal brain function impossible. For many people, medication provides the floor of stability needed to do the work of therapy and lifestyle change.

Yes, finding the right medication can take time. Side effects are real and worth discussing with your doctor. Some medications require careful management. But these are medical decisions to make with professionals, not reasons to reject an entire category of treatment that helps millions of people function.

Medication isn't for everyone, and it's not the only treatment. But refusing to consider it because of stigma — when you might benefit — is letting shame make medical decisions for you.`,
      keyInsights: [
        { 
          title: 'It\'s medicine for a medical condition', 
          explanation: 'We don\'t shame people for using insulin. Mental health conditions are equally medical. The brain is an organ that sometimes needs chemical support.' 
        },
        { 
          title: 'Medication doesn\'t change who you are', 
          explanation: 'The real "you" isn\'t depressed, anxious, or unable to function. Medication can help restore who you are when your brain chemistry is working properly.' 
        },
        { 
          title: 'It\'s not a crutch — or so what if it is', 
          explanation: 'If a crutch helps you walk, use the crutch. Some people need medication short-term; some need it forever. Both are okay. Function matters more than ideological purity.' 
        },
        { 
          title: 'Finding the right one takes time', 
          explanation: 'Psychiatric medication often requires trial and adjustment. This isn\'t evidence it doesn\'t work — it\'s evidence that brain chemistry is individual. Patience and communication with your doctor are key.' 
        },
      ],
      whatHelps: [
        'Get informed — learn about what specific medications do and their evidence base',
        'Find a good prescriber — psychiatrists specialize in this; primary care doctors can help but have less specialized training',
        'Give medication time — most take 4-6 weeks to show full effect',
        'Track your symptoms — this helps you and your doctor assess what\'s working',
        'Don\'t stop abruptly — most psychiatric medications need to be tapered under medical supervision',
      ],
      professionalNote: 'Decisions about medication should be made with a healthcare provider who knows your full history. This lesson provides education, not medical advice.'
    },
    reflectionQuestions: [
      'What beliefs do you have about psychiatric medication? Where did they come from?',
      'If you\'ve avoided medication, is that based on evidence or stigma?',
      'What would it mean to accept that your brain might need chemical support?',
    ],
    relatedLessons: ['hm-mh-depression-truth', 'hm-body-medication-stigma'],
  },
  {
    id: 'hm-mh-intrusive-thoughts',
    title: 'Intrusive Thoughts: You\'re Not Your Thoughts',
    category: 'mental-health',
    duration: 6,
    emoji: '💭',
    content: {
      introduction: `Everyone has intrusive thoughts — sudden, unwanted thoughts that pop into your mind, often disturbing or against your values. The new parent who imagines dropping the baby. The kind person who has violent flashes. The religious person with blasphemous thoughts. These thoughts don't mean anything about who you are. They're neural noise.

The brain generates thousands of thoughts a day, most of which we don't notice or take seriously. Intrusive thoughts become a problem not because of their content but because of how we respond to them. When you take them as meaningful — "I must be a terrible person for thinking this" — you give them power. When you try to suppress them, they come back stronger.

Intrusive thoughts are especially common in OCD, anxiety, depression, and postpartum periods. They become clinical problems when they cause significant distress, when you can't stop engaging with them, or when they lead to compulsive behaviors to "neutralize" them.

The counterintuitive solution: let the thoughts come without fighting them. Notice them, label them ("oh, there's an intrusive thought"), and let them pass. Don't engage, analyze, or try to make them stop. Thoughts don't require response.`,
      keyInsights: [
        { 
          title: 'Having a thought doesn\'t mean you want it', 
          explanation: 'Intrusive thoughts are often the exact opposite of what you want. The parent terrified of harming their child has those thoughts BECAUSE they care so much, not because they\'re dangerous.' 
        },
        { 
          title: 'Suppression backfires', 
          explanation: 'Try not to think of a white bear. See? The brain doesn\'t process negatives well. Fighting thoughts makes them stronger.' 
        },
        { 
          title: 'Content doesn\'t predict behavior', 
          explanation: 'People with intrusive violent thoughts are no more likely to be violent. People with intrusive "taboo" thoughts aren\'t more likely to act on them. The distress you feel is actually evidence that you don\'t want these things.' 
        },
        { 
          title: 'The thought is just a thought', 
          explanation: 'You can observe thoughts without engaging with them. "Oh, there\'s a thought about X" is very different from "I\'m a terrible person because I thought about X."' 
        },
      ],
      whatHelps: [
        'Notice and label: "that\'s an intrusive thought"',
        'Let it pass without engaging — don\'t analyze, don\'t confess, don\'t seek reassurance',
        'Mindfulness practice helps build the skill of observing thoughts without attachment',
        'For OCD-related intrusive thoughts: ERP therapy (Exposure and Response Prevention) is highly effective',
        'Normalize: everyone has weird thoughts. The difference is how much attention you give them.',
      ],
      professionalNote: 'If intrusive thoughts are causing significant distress, interfering with function, or leading to compulsive behaviors, please see a professional. OCD is very treatable.'
    },
    reflectionQuestions: [
      'Do you have thoughts that feel disturbing but don\'t align with who you are?',
      'What do you do when these thoughts appear? Does that response help or hurt?',
      'What would change if you could see these thoughts as noise rather than signal?',
    ],
    relatedLessons: ['hm-mh-anxiety-types', 'hm-growth-self-compassion'],
  },
];

// ============================================================================
// CATEGORY 3: STRESS & SURVIVAL
// ============================================================================

const stressSurvivalLessons: HumanManualLesson[] = [
  {
    id: 'hm-stress-burnout',
    title: 'Burnout: When the Engine Fails',
    category: 'stress-survival',
    duration: 8,
    emoji: '🔥',
    content: {
      introduction: `Burnout isn't being tired. Tired recovers with rest. Burnout is a state of chronic stress that has depleted you physically, emotionally, and mentally. The World Health Organization recognizes it as an occupational phenomenon characterized by exhaustion, cynicism, and reduced efficacy. You're not just out of energy — you're out of capacity to care.

The Maslach Burnout Inventory identifies three dimensions: Exhaustion (nothing left to give), Cynicism (detachment and negativity), and Inefficacy (feeling incompetent and like nothing matters). You might have one or all three. Any combination is damaging.

Burnout usually develops gradually. You start by overworking to compensate for something — impossible demands, values mismatch, lack of control, insufficient reward, unfairness, or conflict with the work. You push through tiredness, then push through exhaustion, then push through your body's escalating warnings until the system fails.

Recovery requires more than vacation. Vacation helps symptoms but doesn't address causes. Real recovery requires changing the equation: either changing the environment (job, boundaries, expectations) or changing your relationship to the demands (values clarification, boundaries, support).`,
      keyInsights: [
        { 
          title: 'Burnout vs. tired', 
          explanation: 'Tired improves with rest. Burnout often doesn\'t — you take a vacation and come back feeling the same. That\'s a sign it\'s structural, not just a need for sleep.' 
        },
        { 
          title: 'The causes are often systemic', 
          explanation: 'Impossible workloads, lack of control, values conflicts, inadequate rewards, unfairness — these are organizational problems, not personal failures. Self-care can\'t fix a toxic job.' 
        },
        { 
          title: 'Burnout tanks everything', 
          explanation: 'It affects your health, relationships, cognitive function, creativity, and ability to care about anything. It\'s not just a work problem — it\'s a life problem.' 
        },
        { 
          title: 'Recovery requires structural change', 
          explanation: 'You can\'t yoga your way out of an impossible situation. Recovery requires changing the demands, the resources, or your relationship to the work. Sometimes it requires leaving.' 
        },
      ],
      whatHelps: [
        'Assess honestly: is this a you problem or an environment problem?',
        'Boundaries: what are you doing beyond your actual job?',
        'Recovery time: are you actually resting or just doing different work?',
        'Values check: is this work aligned with what matters to you?',
        'Consider whether this job is fixable or needs to be left',
        'Professional support — burnout can develop into depression',
      ],
      professionalNote: 'Severe burnout can transition to clinical depression or anxiety disorders. If you\'re experiencing hopelessness, inability to function, or thoughts of self-harm, please seek professional help.'
    },
    reflectionQuestions: [
      'Which burnout dimension hits closest to home: exhaustion, cynicism, or inefficacy?',
      'What\'s causing your burnout that self-care can\'t fix?',
      'What would have to change for your current situation to be sustainable?',
    ],
    relatedLessons: ['hm-work-job-identity', 'hm-mh-depression-truth', 'hm-stress-overwhelm'],
  },
  {
    id: 'hm-stress-freeze-response',
    title: 'The Freeze Response: When Shutdown Happens',
    category: 'stress-survival',
    duration: 7,
    emoji: '🧊',
    content: {
      introduction: `You've heard of fight-or-flight. But there's a third response that often gets overlooked: freeze. When your nervous system determines that fighting or fleeing won't work — when the threat is too overwhelming — it shuts down. You go numb. You dissociate. You can't think, can't act, can't feel. You freeze.

Freeze is a survival mechanism, not a choice. It's the nervous system's last-ditch effort to protect you, similar to an animal playing dead. In humans, it can look like spacing out during a stressful conversation, being unable to move during a confrontation, emotional numbness, or that foggy feeling where you're present but not really "there."

The freeze response explains why trauma survivors often ask "why didn't I fight back?" or "why didn't I run?" The answer: your nervous system chose for you, and freeze was its best option given the circumstances. This was never a conscious decision — and blaming yourself for it compounds the trauma.

Coming out of freeze requires gentleness. Forcing yourself to act when you're frozen often backfires. The nervous system needs to feel safe before it releases. Small movements, warmth, presence of safe people, and gentle stimulation of the senses can help. Rushing makes it worse.`,
      keyInsights: [
        { 
          title: 'Freeze isn\'t choosing', 
          explanation: 'Your nervous system assesses threat faster than conscious thought and picks the response most likely to help you survive. Freeze isn\'t cowardice — it\'s a survival adaptation.' 
        },
        { 
          title: 'It explains the "why didn\'t I" question', 
          explanation: 'Survivors often blame themselves for not fighting or fleeing. But those options were neurobiologically offline. Understanding freeze can help release self-blame.' 
        },
        { 
          title: 'Chronic freeze is common', 
          explanation: 'Some people live in a low-grade freeze state — emotionally numb, disconnected, unable to access motivation. This is often the result of chronic overwhelming stress.' 
        },
        { 
          title: 'Thawing takes time and safety', 
          explanation: 'You can\'t force yourself out of freeze through willpower. The system needs safety signals: warmth, gentle movement, safe connection, time.' 
        },
      ],
      whatHelps: [
        'Recognize it: "I\'m in freeze right now"',
        'Don\'t force — pushing through often deepens the freeze',
        'Small, gentle movements: wiggle fingers, stretch, shake',
        'Warmth: blanket, warm drink, hot shower',
        'Safe presence: being near calm, regulated people',
        'Sensory input: cold water on face (activates dive reflex), strong scents, texture',
        'For chronic freeze: trauma therapy, especially somatic approaches',
      ],
    },
    reflectionQuestions: [
      'Do you recognize the freeze response in yourself? When does it happen?',
      'Have you blamed yourself for not fighting or fleeing in a past situation?',
      'What helps you thaw when you\'re frozen?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-stress-nervous-system'],
  },
  {
    id: 'hm-stress-overwhelm',
    title: 'Overwhelm: Too Much, Too Fast',
    category: 'stress-survival',
    duration: 6,
    emoji: '🌊',
    content: {
      introduction: `Overwhelm happens when input exceeds processing capacity. It's not about the absolute amount of stress — it's about the ratio of demands to resources. A single task can be overwhelming if you're already depleted. A hundred tasks might be manageable if you're resourced and supported.

The problem is that overwhelm often triggers more overwhelm. When you're overwhelmed, your executive function — the part of your brain that prioritizes, plans, and makes decisions — goes offline. So you can't figure out what to do about being overwhelmed, which makes you more overwhelmed. It's a trap.

Breaking the cycle requires stepping back from trying to solve the overwhelm and instead stabilizing your nervous system first. You cannot think your way out of overwhelm when the thinking parts of your brain aren't functioning. Regulate first, then prioritize.

Most overwhelm is also a boundaries problem. If you're constantly overwhelmed, something is out of balance: you're taking on too much, not delegating, not saying no, or not building in recovery time. The solution isn't just getting through this current wave — it's restructuring so the waves don't keep crashing.`,
      keyInsights: [
        { 
          title: 'Overwhelm tanks executive function', 
          explanation: 'The part of your brain that could solve this problem — planning, prioritizing, deciding — goes offline when you\'re overwhelmed. That\'s why "just make a list" doesn\'t help when you\'re in the middle of it.' 
        },
        { 
          title: 'Regulate before you problem-solve', 
          explanation: 'First: breathe, ground, slow down. Get your nervous system to a place where thinking is possible. Then you can tackle the list.' 
        },
        { 
          title: 'The smallest next step', 
          explanation: 'When everything feels urgent, pick one thing — the smallest possible step. Completion creates momentum. Don\'t try to solve the whole problem at once.' 
        },
        { 
          title: 'Chronic overwhelm is a structure problem', 
          explanation: 'If you\'re always overwhelmed, the issue isn\'t time management — it\'s that demands exceed resources. Something has to change structurally.' 
        },
      ],
      whatHelps: [
        'Stop. Trying to power through overwhelm usually makes it worse.',
        'Regulate first: slow breathing, feet on floor, orient to the room',
        'Brain dump: get everything out of your head onto paper — don\'t organize yet',
        'Pick ONE thing. The smallest possible step.',
        'Ask for help or delegate (even if this is hard)',
        'Look at what\'s creating chronic overwhelm — that\'s where the real work is',
      ],
    },
    reflectionQuestions: [
      'What does overwhelm feel like in your body? Can you catch it earlier?',
      'What\'s creating chronic overwhelm in your life? What would need to change?',
      'What\'s one thing you could say no to or delegate?',
    ],
    relatedLessons: ['hm-stress-burnout', 'hm-work-boundaries'],
  },
  {
    id: 'hm-stress-nervous-system',
    title: 'Your Nervous System: The Control Center',
    category: 'stress-survival',
    duration: 8,
    emoji: '⚡',
    content: {
      introduction: `Everything in your emotional life runs through your nervous system. Polyvagal theory, developed by Dr. Stephen Porges, describes three states your autonomic nervous system moves between: ventral vagal (safe and social), sympathetic (fight-or-flight), and dorsal vagal (freeze and shutdown).

When you're in ventral vagal, you feel safe, connected, and able to engage with the world. You can think clearly, connect with others, and access creativity. This is where you want to spend most of your time.

Sympathetic activation is the fight-or-flight state: increased heart rate, rapid breathing, tension, anxiety, irritability. It's designed for short-term threat response. Problems arise when you get stuck here — chronic sympathetic activation leads to anxiety, health problems, and relationship difficulties.

Dorsal vagal is shutdown: freeze, dissociation, collapse, depression, numbness. It's the nervous system's last resort when fighting and fleeing don't seem viable. Getting stuck here leads to depression, lack of motivation, and feeling disconnected from life.

Understanding your nervous system helps you work with it instead of against it. You can't think your way to calm, but you can use body-based tools to shift your state.`,
      keyInsights: [
        { 
          title: 'State drives story', 
          explanation: 'Your nervous system state shapes how you interpret everything. In sympathetic activation, neutral faces look threatening. In ventral vagal, challenges look manageable. The world looks different based on your state.' 
        },
        { 
          title: 'You can\'t think yourself regulated', 
          explanation: 'The autonomic nervous system doesn\'t respond to logic. "There\'s nothing to be anxious about" doesn\'t help because the body isn\'t listening to the mind. Regulation requires body-based approaches.' 
        },
        { 
          title: 'Co-regulation is powerful', 
          explanation: 'Nervous systems sync up. Being in the presence of a calm, regulated person can help regulate you. This is why we seek connection when stressed — and why other people\'s dysregulation is contagious.' 
        },
        { 
          title: 'Window of tolerance', 
          explanation: 'This is the range where you can cope with life\'s demands without going into fight/flight or freeze. Trauma shrinks the window; healing expands it.' 
        },
      ],
      whatHelps: [
        'Slow exhales: extending the exhale activates the parasympathetic system',
        'Cold water on face: triggers the mammalian dive reflex, slowing heart rate',
        'Humming, singing, gargling: these stimulate the vagus nerve',
        'Orientation: slowly looking around the room signals safety to the nervous system',
        'Movement: shaking, dancing, exercise can help discharge stuck activation',
        'Safe connection: being with regulated people helps you regulate',
      ],
    },
    reflectionQuestions: [
      'Which nervous system state do you spend the most time in?',
      'What helps you return to ventral vagal (safe and social)?',
      'Whose presence helps regulate your nervous system?',
    ],
    relatedLessons: ['hm-stress-freeze-response', 'hm-mh-anxiety-types', 'hm-mh-panic-attacks'],
  },
  {
    id: 'hm-stress-chronic',
    title: 'Chronic Stress: The Slow Poison',
    category: 'stress-survival',
    duration: 7,
    emoji: '⏰',
    content: {
      introduction: `Acute stress is designed to be temporary — you face a threat, your body mobilizes, you deal with it, and then you recover. Chronic stress breaks this cycle. The threat never ends, so the stress response never turns off. Your body is designed for sprints, not marathons of activation.

Chronic stress damages nearly every system in your body. It keeps cortisol elevated, which over time impairs immune function, disrupts sleep, increases inflammation, affects memory and cognition, contributes to weight gain, raises blood pressure, and increases risk of heart disease. It's a slow poison that accumulates.

The tricky part is that chronic stress becomes normal. You adapt to it. You don't notice how much tension you're holding, how shallow your breathing is, how compromised your sleep has become. You think this is just how life is. It's not. It's how your life has been — and it can change.

Addressing chronic stress requires both symptom management (regulation techniques, sleep, exercise) and root cause intervention (changing the stressors, boundaries, support systems). You can't meditate your way out of an impossible situation, but you also can't change your situation if you're too depleted to act.`,
      keyInsights: [
        { 
          title: 'Stress was designed to be temporary', 
          explanation: 'Your stress response evolved for short-term threats. When it never turns off, the very chemicals meant to protect you start causing damage.' 
        },
        { 
          title: 'You\'ve adapted to it', 
          explanation: 'Chronic stress becomes your baseline. You don\'t notice the tension, the shallow breathing, the racing thoughts anymore. A body scan can reveal how much you\'re carrying.' 
        },
        { 
          title: 'It affects everything', 
          explanation: 'Sleep, immune function, cognition, mood, relationships, health — chronic stress reaches into every corner of your life. No system is spared.' 
        },
        { 
          title: 'Both symptom and cause need addressing', 
          explanation: 'Regulation techniques help manage symptoms. But if you don\'t address the sources of chronic stress, you\'re bailing water from a sinking boat.' 
        },
      ],
      whatHelps: [
        'Audit your stressors: what\'s actually causing chronic stress?',
        'What can change? What can\'t? Put energy where it can make a difference.',
        'Build recovery into every day, not just vacations',
        'Sleep protection — chronic stress destroys sleep, which increases stress',
        'Social support — connection buffers stress effects',
        'Movement — the body needs to discharge stress chemicals',
        'Consider what trade-offs you\'re making that aren\'t worth it',
      ],
    },
    reflectionQuestions: [
      'What chronic stressors have you adapted to as "normal"?',
      'Do a quick body scan — where are you holding tension right now?',
      'What would have to change for your life to be sustainable?',
    ],
    relatedLessons: ['hm-stress-burnout', 'hm-body-chronic', 'hm-stress-nervous-system'],
  },
];

// ============================================================================
// CATEGORY 4: WORK & MONEY
// ============================================================================

const workMoneyLessons: HumanManualLesson[] = [
  {
    id: 'hm-work-job-identity',
    title: 'When Your Job Becomes Your Identity',
    category: 'work-money',
    duration: 7,
    emoji: '💼',
    content: {
      introduction: `"What do you do?" is often the first question we ask when meeting someone. It's also a trap. When work becomes too central to identity, you're vulnerable in ways you might not recognize until something disrupts that identity — layoff, burnout, retirement, career change, or simply losing passion for what you do.

Enmeshment with work can look like success. The dedicated employee, the passionate entrepreneur, the person who "loves what they do." But when work IS identity rather than part of identity, any threat to work becomes a threat to self. Job criticism feels like personal criticism. Failure at work feels like failure as a human. Time away from work feels like losing yourself.

This isn't to say work can't be meaningful or central to your life. But there's a difference between work being deeply important and work being all you are. The goal is developing what researchers call "identity complexity" — having multiple sources of meaning and value so that no single domain can devastate you.

If you lost your job tomorrow and someone asked "who are you?" — could you answer without mentioning what you do for work?`,
      keyInsights: [
        { 
          title: 'Work as identity is culturally encouraged', 
          explanation: 'Hustle culture, passion economy, "do what you love" — we\'ve built a culture that celebrates work-identity enmeshment. Recognizing this helps you question it.' 
        },
        { 
          title: 'Identity complexity protects you', 
          explanation: 'Having multiple sources of identity — relationships, hobbies, values, communities — means no single failure can destroy your sense of self.' 
        },
        { 
          title: 'What you do ≠ who you are', 
          explanation: 'Your worth isn\'t determined by your productivity, title, or income. You are valuable simply because you exist. (This is hard to believe in capitalism, but it\'s true.)' 
        },
        { 
          title: 'Transitions expose the enmeshment', 
          explanation: 'Layoffs, retirement, burnout, career change — these moments reveal how much identity was wrapped up in work. Better to diversify before crisis forces it.' 
        },
      ],
      whatHelps: [
        'Notice how you describe yourself — is work always first?',
        'Invest in non-work identity: hobbies, relationships, communities',
        'Practice answering "who are you?" without job title',
        'Examine beliefs: do you believe your worth depends on what you produce?',
        'Create boundaries between work-you and the rest of you',
      ],
    },
    reflectionQuestions: [
      'If you couldn\'t mention your job, how would you describe who you are?',
      'How much of your self-worth is tied to your work performance?',
      'What parts of your identity have you neglected because of work?',
    ],
    relatedLessons: ['hm-stress-burnout', 'hm-trans-identity-shifts', 'hm-work-imposter'],
  },
  {
    id: 'hm-work-financial-trauma',
    title: 'Financial Trauma and Money Wounds',
    category: 'work-money',
    duration: 8,
    emoji: '💰',
    content: {
      introduction: `Money isn't just numbers — it's tied to survival, safety, worth, and deep emotional history. Financial trauma can come from growing up with scarcity, sudden financial loss, financial abuse, debt, or shame around money. It shows up as anxiety about spending, hoarding, over-giving, avoidance of looking at accounts, or self-sabotaging financial decisions.

Your earliest experiences with money created a template. If money was scarce and stressful, your nervous system may always associate money with threat. If money was used to control you, freedom around money may feel dangerous. If your worth was tied to financial success, money becomes identity rather than tool.

Financial shame is particularly insidious because money is so private. We don't talk about how much we make, owe, or struggle. The silence breeds shame, which prevents asking for help, which deepens the problem. Breaking the cycle often requires naming the shame and the history that created it.

Healing financial trauma is both practical and emotional. You need financial literacy and skills, yes. But you also need to address the nervous system responses, beliefs, and patterns that override rational decision-making when money is involved.`,
      keyInsights: [
        { 
          title: 'Money is emotional, not just rational', 
          explanation: 'Financial decisions are influenced by fear, shame, childhood experiences, and nervous system states — not just math. Understanding this helps you work with your full self.' 
        },
        { 
          title: 'Scarcity mindset vs. abundance mindset', 
          explanation: 'Scarcity says there\'s never enough, so hoard, avoid, or give it all away before it\'s taken. This mindset develops from real scarcity and can persist even when circumstances change.' 
        },
        { 
          title: 'Financial avoidance is protective avoidance', 
          explanation: 'Not looking at your accounts, not opening bills, not making a budget — this isn\'t laziness. It\'s your nervous system protecting you from the anxiety of engaging with money.' 
        },
        { 
          title: 'Intergenerational money patterns', 
          explanation: 'Your family\'s relationship with money — their beliefs, behaviors, silence or conflict around it — shaped yours. Understanding this lineage helps you choose differently.' 
        },
      ],
      whatHelps: [
        'Name your money history — what did you learn about money growing up?',
        'Notice your nervous system around money — anxiety, avoidance, activation',
        'Start small with financial engagement — even opening one statement counts',
        'Separate facts from feelings — what\'s actually in the account vs. how it makes you feel',
        'Consider a financial therapist or financial counselor trained in psychology',
        'Talk about money with safe people — shame grows in silence',
      ],
    },
    reflectionQuestions: [
      'What did you learn about money growing up? What was the emotional climate around it?',
      'How does your body respond when you think about your finances?',
      'What money behavior do you keep repeating even though you know it\'s not working?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-world-generational'],
  },
  {
    id: 'hm-work-imposter',
    title: 'Imposter Syndrome: Feeling Like a Fraud',
    category: 'work-money',
    duration: 6,
    emoji: '🎭',
    content: {
      introduction: `Imposter syndrome is the persistent feeling that you've fooled everyone and are about to be exposed as incompetent, despite evidence of your accomplishments. It's remarkably common — research suggests about 70% of people experience it at some point. You're not alone, and you're not actually a fraud.

Imposter feelings often intensify during transitions: new job, promotion, entering a new field, or being the "first" or "only" in a space. They're particularly common among high achievers (who always expect more of themselves) and among people from marginalized groups (who receive constant cultural messaging that they don't belong).

The painful irony is that imposter syndrome tends to hit the competent and conscientious hardest. The truly incompetent often have inflated self-assessments (the Dunning-Kruger effect). Your very ability to recognize the gaps in your knowledge — the complexity of your field, the expertise of others — creates the conditions for feeling like an imposter.

This doesn't mean imposter feelings should be ignored. They're information about what you value, what you fear, and where you might benefit from support, mentorship, or skill development. But they're not accurate assessments of your worth or your right to be where you are.`,
      keyInsights: [
        { 
          title: 'Evidence doesn\'t cure it', 
          explanation: 'Getting more credentials, more accomplishments, more praise rarely helps — you just raise the bar and attribute success to luck. The work is internal, not external.' 
        },
        { 
          title: 'It hits certain groups harder', 
          explanation: 'Women, people of color, first-generation professionals, and anyone who doesn\'t see themselves represented often experience more intense imposter syndrome. Some of this is internalized messaging from a culture that tells you you don\'t belong.' 
        },
        { 
          title: 'Competence includes knowing what you don\'t know', 
          explanation: 'The ability to see your gaps is a sign of expertise, not fraud. Actual frauds tend to be overconfident. Your awareness of complexity is a strength.' 
        },
        { 
          title: 'Normalize the feeling, don\'t believe it', 
          explanation: '"I feel like an imposter" is different from "I am an imposter." You can acknowledge the feeling without letting it drive decisions.' 
        },
      ],
      whatHelps: [
        'Name it when it\'s happening: "this is imposter syndrome"',
        'Keep a "wins" file — concrete evidence of your competence to review',
        'Talk to trusted others — you\'ll often find they experience it too',
        'Separate feelings from facts: "I feel like I don\'t belong" vs. "I was hired/accepted/chosen for a reason"',
        'Recognize that discomfort is growth — being stretched doesn\'t mean you\'re failing',
      ],
    },
    reflectionQuestions: [
      'When do you feel most like an imposter?',
      'What evidence of your competence do you tend to dismiss?',
      'What would you do differently if you trusted that you belonged?',
    ],
    relatedLessons: ['hm-work-job-identity', 'hm-growth-self-compassion'],
  },
  {
    id: 'hm-work-boundaries',
    title: 'Work Boundaries in an Always-On World',
    category: 'work-money',
    duration: 6,
    emoji: '🚫',
    content: {
      introduction: `The boundaries between work and life have never been more blurred. Emails at midnight, Slack messages on weekends, the expectation of constant availability, remote work that means work is always accessible — the structures that used to protect personal time have eroded.

This is bad for your health, relationships, and ironically, your work performance. Research consistently shows that working more hours past a certain point leads to declining productivity and increasing errors. Rest isn't a luxury — it's a performance requirement. But try telling that to a culture that celebrates hustle.

Setting work boundaries often feels risky. Will you be passed over for promotion? Will colleagues judge you? Will you lose your job? These fears are sometimes valid and sometimes projections. The truth is usually more nuanced: some workplaces punish boundaries, some respect them, and many are waiting for someone to model that it's possible.

You don't have to announce your boundaries — you can just keep them. Don't respond to emails after hours. Don't apologize for not being available on weekends. Let people adjust to your rhythms rather than abandoning yours to match theirs.`,
      keyInsights: [
        { 
          title: 'Boundaries are a skill, not a personality trait', 
          explanation: 'If boundaries are hard for you, that\'s not because something\'s wrong with you — it\'s because you haven\'t had practice, or because your history made them dangerous. You can learn.' 
        },
        { 
          title: 'Rest is productive', 
          explanation: 'Counter to hustle culture, rest improves creativity, problem-solving, and sustained performance. Burnout is the actual productivity killer.' 
        },
        { 
          title: 'You don\'t have to explain', 
          explanation: '"I\'m not available" is a complete sentence. You don\'t need to justify why you have a life outside work.' 
        },
        { 
          title: 'Structural problems need structural solutions', 
          explanation: 'If your workplace has a culture of boundary violation, individual boundary-setting is swimming upstream. It\'s worth asking whether this is a fixable culture or one you should leave.' 
        },
      ],
      whatHelps: [
        'Decide your boundaries in advance — when are you off?',
        'Create rituals that mark the end of work',
        'Turn off notifications outside work hours',
        'Batch communication — don\'t respond to every ping in real-time',
        'Model boundaries for others — when you keep yours, you give permission',
        'Assess the real (not imagined) risks of boundaries in your workplace',
      ],
    },
    reflectionQuestions: [
      'Where are your work boundaries weakest? What\'s the cost?',
      'What would healthy work boundaries actually look like for you?',
      'What fears come up when you imagine enforcing boundaries with work?',
    ],
    relatedLessons: ['hm-stress-burnout', 'hm-rel-boundaries-protect', 'hm-stress-overwhelm'],
  },
  {
    id: 'hm-work-meaning',
    title: 'When Work Loses Meaning',
    category: 'work-money',
    duration: 7,
    emoji: '🔍',
    content: {
      introduction: `There's a particular kind of suffering that comes from doing work that feels meaningless. You might be well-paid, successful by external measures, even good at what you do — and still feel empty about it. This isn't ingratitude. It's a legitimate form of distress.

Meaning in work can come from many sources: the work itself (craft, challenge, creativity), its impact (helping others, making a difference), its alignment with values (doing something you believe in), or its role in a larger vision (career path, legacy). When none of these are present, work becomes something you endure rather than something you engage with.

Sometimes loss of meaning signals burnout — you cared once but the caring got depleted. Sometimes it signals misalignment — you grew or changed and the work didn't grow with you. Sometimes it signals that you never cared about this particular work and chose it for other reasons (money, security, expectation) that no longer feel sufficient.

You have options: find meaning in the work differently, find meaning outside work, change the work, or change jobs. None of these are easy, and all require clarity about what actually matters to you — which you may have lost touch with along the way.`,
      keyInsights: [
        { 
          title: 'Not everyone can "do what they love"', 
          explanation: 'Sometimes work is how you fund a life that has meaning elsewhere. There\'s no shame in having a job that\'s just a job while you invest meaning in other domains.' 
        },
        { 
          title: 'Meaning can be found, not just had', 
          explanation: 'Sometimes the same work can become meaningful through a shift in perspective: connecting more with people, focusing on craft, finding the impact you weren\'t seeing.' 
        },
        { 
          title: 'Loss of meaning can signal growth', 
          explanation: 'What mattered at 25 might not matter at 40. Outgrowing work isn\'t failure — it\'s evolution. But it requires action, not just suffering.' 
        },
        { 
          title: 'Golden handcuffs are real', 
          explanation: 'High pay in meaningless work creates a trap. You adapt to the income, the lifestyle requires it, and leaving feels impossible. This is a real constraint worth naming.' 
        },
      ],
      whatHelps: [
        'Get clear on what actually gives you meaning (not what should)',
        'Audit your current work — is there meaning you\'re not accessing?',
        'Consider whether the work could change or whether you need to change works',
        'Build meaning outside work if work itself won\'t provide it',
        'Be honest about the trade-offs you\'re making and whether they\'re worth it',
      ],
    },
    reflectionQuestions: [
      'What gives you a sense of meaning in life? Is work providing any of that?',
      'When did work last feel meaningful? What changed?',
      'What would you do if money weren\'t a constraint?',
    ],
    relatedLessons: ['hm-stress-burnout', 'hm-work-job-identity', 'hm-trans-starting-over'],
  },
];

// ============================================================================
// CATEGORY 5: WORLD & SOCIETY
// ============================================================================

const worldSocietyLessons: HumanManualLesson[] = [
  {
    id: 'hm-world-collective-trauma',
    title: 'Collective Trauma: When the World Wounds',
    category: 'world-society',
    duration: 8,
    emoji: '🌍',
    content: {
      introduction: `Trauma isn't always individual. Pandemics, wars, economic collapses, mass violence, political upheaval — these events traumatize entire populations. Collective trauma operates differently than personal trauma: it's shared, it shapes culture, and it often goes unrecognized because when everyone's affected, the abnormal becomes normal.

The COVID-19 pandemic is a recent example of collective trauma. Years later, many people still carry effects they don't recognize as trauma-related: increased anxiety, changed relationships with mortality, erosion of trust, hypervigilance about health, grief that never had space, changes in how they relate to society and each other.

Collective trauma can bind communities together (shared experience, solidarity) or tear them apart (blame, us-vs-them thinking, breakdown of trust). How it unfolds depends partly on leadership, partly on existing social structures, and partly on whether the trauma is acknowledged at all.

Healing from collective trauma requires acknowledgment at the collective level — but since that rarely happens, individuals are often left to process alone what was never theirs alone to carry.`,
      keyInsights: [
        { 
          title: 'Collective trauma is invisible', 
          explanation: 'When everyone is affected, there\'s no "normal" to contrast against. Effects become the new baseline. You might not recognize what you\'re carrying as trauma.' 
        },
        { 
          title: 'The pandemic traumatized everyone', 
          explanation: 'Even if you weren\'t sick, didn\'t lose someone, weren\'t frontline — you still lived through chronic uncertainty, disrupted attachment, and collective grief. That counts.' 
        },
        { 
          title: 'Individual healing in collective wounds', 
          explanation: 'Ideally, society would acknowledge and process collective trauma together. Since that rarely happens, individuals must heal wounds that were never theirs alone to carry.' 
        },
        { 
          title: 'Intergenerational transmission', 
          explanation: 'Collective trauma passes through generations — in bodies, in silence, in cultural patterns. Your grandparents\' wars, migrations, and losses may live in you.' 
        },
      ],
      whatHelps: [
        'Name it: acknowledge what you lived through and its effects',
        'Resist minimization: "others had it worse" doesn\'t invalidate your experience',
        'Find community: shared acknowledgment helps, even if society doesn\'t provide it',
        'Understand that some struggles are not individual mental health issues — they\'re reasonable responses to unreasonable circumstances',
        'Consider how collective trauma intersects with your personal history',
      ],
    },
    reflectionQuestions: [
      'How did the pandemic (or other collective events) affect you in ways you haven\'t fully acknowledged?',
      'What collective traumas might your family or community carry that shaped you?',
      'How does it feel to recognize that some of your struggles aren\'t individual — they\'re shared?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-world-generational'],
  },
  {
    id: 'hm-world-news-triggers',
    title: 'News and Doomscrolling: Information as Trauma',
    category: 'world-society',
    duration: 6,
    emoji: '📱',
    content: {
      introduction: `Your nervous system can't distinguish between danger that's in front of you and danger you're reading about on a screen. Every terrible news story activates the same threat response as if it were happening to you personally. This is why consuming news — especially the algorithmic, attention-maximizing, conflict-optimized news of social media — can genuinely traumatize you.

Doomscrolling — the compulsive consumption of negative news — isn't just a bad habit. It's often an attempt at control: if I know about all the threats, I can prepare for them. But you can't prepare for everything, and the knowing doesn't make you safer — it just keeps your nervous system in chronic activation.

This doesn't mean you should be uninformed. But there's a difference between being informed and being saturated. You can know what's happening in the world without watching every video, reading every thread, absorbing every atrocity in real-time detail.

The world has always been full of suffering. What's new is the algorithmic delivery of that suffering directly to your pocket, optimized for maximum engagement (which often means maximum distress).`,
      keyInsights: [
        { 
          title: 'Your body responds to screens like reality', 
          explanation: 'Adrenaline doesn\'t know the difference between a real threat and footage of a threat. Your nervous system responds as if you\'re there.' 
        },
        { 
          title: 'Doomscrolling is an anxious coping mechanism', 
          explanation: 'The urge to know everything is about control, but the information doesn\'t provide control — it provides activation. You\'re not more prepared; you\'re more dysregulated.' 
        },
        { 
          title: 'Algorithms optimize for engagement, not wellbeing', 
          explanation: 'Social media shows you what keeps you scrolling, which is often outrage, fear, and conflict. Your feed is not a neutral source of information.' 
        },
        { 
          title: 'Being informed has diminishing returns', 
          explanation: 'After a certain point, more news doesn\'t make you more informed — it just makes you more traumatized. You can be aware without being overwhelmed.' 
        },
      ],
      whatHelps: [
        'Set specific news times — don\'t let it be constant background',
        'Choose sources consciously — curate for quality over algorithms',
        'Notice the body: are you getting activated? That\'s enough for now.',
        'Ask: does knowing more about this make me more able to help? If not, why am I watching?',
        'Limit video/imagery — reading is usually less activating than watching',
        'Take action when possible — helplessness is traumatic; agency helps',
      ],
    },
    reflectionQuestions: [
      'How much news do you consume, and how does it affect your nervous system?',
      'What drives your doomscrolling — what are you looking for?',
      'What would "informed but not overwhelmed" actually look like?',
    ],
    relatedLessons: ['hm-stress-nervous-system', 'hm-mh-anxiety-types'],
  },
  {
    id: 'hm-world-generational',
    title: 'Generational Trauma: What Gets Passed Down',
    category: 'world-society',
    duration: 8,
    emoji: '🌳',
    content: {
      introduction: `Trauma doesn't end with the person who experienced it. Research shows that the effects of traumatic experiences can be transmitted across generations — through parenting behaviors, through epigenetic changes, through family systems, and through cultural patterns. You may be carrying grief, fear, or survival adaptations from events that happened before you were born.

This is particularly relevant for descendants of genocide survivors, enslaved peoples, refugees, famine victims, war veterans, and anyone whose ancestors experienced massive collective trauma. The silence around the trauma often makes it more powerful: what can't be spoken is felt more deeply by the next generation.

Recognizing generational trauma isn't about blame. Your parents did the best they could with what their parents gave them. Understanding the lineage helps you have compassion for them AND recognize what you might be carrying that was never yours to begin with.

The good news is that transmission can work in both directions. Healing can also pass through generations. When you heal, you change what you pass on. You become the generation that breaks the cycle.`,
      keyInsights: [
        { 
          title: 'Trauma lives in bodies, not just stories', 
          explanation: 'Epigenetic research shows that stress responses can be passed biologically. Your nervous system may be calibrated to threats your grandparents faced.' 
        },
        { 
          title: 'Silence transmits more than words', 
          explanation: 'What families don\'t talk about is often felt more intensely. The unspoken tragedy creates a shape in the family system that everyone works around.' 
        },
        { 
          title: 'You might be carrying what isn\'t yours', 
          explanation: 'Anxiety, depression, hypervigilance, survival patterns — these might not have originated with your experiences. Understanding the lineage helps you respond appropriately.' 
        },
        { 
          title: 'Healing is generational too', 
          explanation: 'When you heal, you change what you pass on. You can be the generation that interrupts the transmission. That\'s meaningful beyond your own life.' 
        },
      ],
      whatHelps: [
        'Learn your family history — what traumas were experienced and how were they (or weren\'t they) processed?',
        'Notice patterns: what survival adaptations run through your family?',
        'Have compassion: your ancestors did what they could to survive',
        'Separate what\'s yours from what was passed to you',
        'Consider therapy that addresses intergenerational trauma specifically',
        'Honor the ancestors by healing what they couldn\'t',
      ],
    },
    reflectionQuestions: [
      'What traumas did your parents or grandparents experience?',
      'What patterns or survival adaptations seem to run through your family?',
      'What would it mean to heal something that started before you were born?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-mh-trauma-basics', 'hm-world-collective-trauma'],
  },
  {
    id: 'hm-world-minority-stress',
    title: 'Minority Stress: When the World Is Hostile',
    category: 'world-society',
    duration: 7,
    emoji: '⚠️',
    content: {
      introduction: `Minority stress theory explains the unique stressors faced by people who belong to stigmatized groups — based on race, ethnicity, sexual orientation, gender identity, disability, or other marginalized identities. This stress is chronic, comes from external sources, and is layered on top of the general stress everyone faces.

This stress shows up as: direct discrimination (being denied jobs, services, safety), everyday microaggressions (subtle slights and invalidations), internalized stigma (absorbing negative messages about your group), and the mental load of concealment, hypervigilance, and code-switching.

Minority stress has measurable health effects. Research consistently shows higher rates of depression, anxiety, substance use, and physical health problems among minority populations — not because of anything inherent to those identities, but because of how society treats those identities.

This is important context because mental health struggles in marginalized communities are often treated as individual problems when they're actually reasonable responses to unreasonable conditions. You're not broken — you're responding to a world that hasn't been built for you.`,
      keyInsights: [
        { 
          title: 'It\'s not in your head — it\'s in the world', 
          explanation: 'Minority stress comes from real, external sources: discrimination, prejudice, systemic barriers. Your anxiety and hypervigilance are adaptive responses to real threats.' 
        },
        { 
          title: 'Microaggressions accumulate', 
          explanation: 'Each small slight might seem minor in isolation. But they compound over a lifetime, creating chronic stress and eroding trust.' 
        },
        { 
          title: 'Internalized stigma is insidious', 
          explanation: 'When you absorb negative messages about your identity, you may judge yourself by standards that were never fair. This creates shame that feels personal but has political roots.' 
        },
        { 
          title: 'Community is protective', 
          explanation: 'Connection with others who share your identity and understand your experience provides validation, solidarity, and buffer against the effects of minority stress.' 
        },
      ],
      whatHelps: [
        'Name it as external, not internal — the problem isn\'t you',
        'Find community with people who share your experience',
        'Seek mental health support from providers who understand minority stress',
        'Build spaces where you can be fully yourself without code-switching',
        'Recognize that some exhaustion is from carrying what others don\'t have to carry',
        'Activism can help — channeling frustration into change has mental health benefits',
      ],
    },
    reflectionQuestions: [
      'What stressors do you face because of your identity that others might not face?',
      'How does carrying this stress affect your mental health and daily life?',
      'Where can you find community that understands your experience?',
    ],
    relatedLessons: ['hm-stress-chronic', 'hm-work-imposter', 'hm-growth-self-compassion'],
  },
  {
    id: 'hm-world-climate-anxiety',
    title: 'Climate Anxiety: Grieving the Future',
    category: 'world-society',
    duration: 6,
    emoji: '🌡️',
    content: {
      introduction: `Climate anxiety (sometimes called eco-anxiety or solastalgia) is the chronic fear and distress related to environmental destruction and climate change. It's not a clinical disorder — it's a rational response to a real threat. The challenge is living with this awareness without being paralyzed by it.

Young people report especially high rates of climate anxiety, which makes sense: they'll live with the worst consequences. But people of all ages experience it, particularly those connected to nature, future-oriented in their thinking, or aware of the science.

The grief is complex: you're mourning losses that haven't fully happened yet, mourning what you'll never know (what the world could have been), mourning on behalf of future generations. There's also rage at the systems and decisions that created this, and despair at the scale of the problem.

How you respond to climate anxiety matters. Denial numbs but doesn't help. Doom and paralysis feel appropriate but also don't help. The goal is what researchers call "active hope" — acknowledging the reality, grieving what's lost, and still engaging in meaningful action.`,
      keyInsights: [
        { 
          title: 'This anxiety is rational', 
          explanation: 'Unlike many anxieties, climate anxiety is a response to real, documented, scientifically verified threats. You\'re not catastrophizing — you\'re observing.' 
        },
        { 
          title: 'Grief for the future is real grief', 
          explanation: 'Anticipatory grief and ambiguous loss apply here. You\'re mourning what will be lost, what already has been, and what will never exist.' 
        },
        { 
          title: 'Individual action has limits', 
          explanation: 'Personal carbon footprint was a concept invented by oil companies to shift responsibility from systems to individuals. Your individual choices matter AND are insufficient. Both are true.' 
        },
        { 
          title: 'Community and action help', 
          explanation: 'Isolation makes climate anxiety worse. Connection with others who share the concern, and engagement in collective action, provides meaning and counters helplessness.' 
        },
      ],
      whatHelps: [
        'Limit (don\'t eliminate) climate news exposure — stay informed without doom-saturating',
        'Connect with others who share your concern — community helps',
        'Take action at the level you can — it won\'t solve everything but helps with helplessness',
        'Allow grief — you\'re allowed to mourn the future',
        'Spend time in nature — it\'s still here, still beautiful, still worth protecting',
        'Focus on what you can control and influence, release the rest',
      ],
    },
    reflectionQuestions: [
      'How does awareness of climate change affect your daily mood and sense of the future?',
      'What emotions come up when you think about the climate: fear, grief, rage, despair, hope?',
      'What would "living with this awareness without being paralyzed" look like for you?',
    ],
    relatedLessons: ['hm-world-collective-trauma', 'hm-trans-grief-all-kinds'],
  },
];

// ============================================================================
// CATEGORY 6: BODY & HEALTH
// ============================================================================

const bodyHealthLessons: HumanManualLesson[] = [
  {
    id: 'hm-body-chronic',
    title: 'Chronic Illness: When Your Body Is the Problem',
    category: 'body-health',
    duration: 8,
    emoji: '🏥',
    content: {
      introduction: `Living with chronic illness means living in a body that doesn't work the way bodies "should." This creates unique psychological challenges: grief over lost capacity, rage at a body that betrays you, isolation from a world designed for healthy people, exhaustion from managing symptoms AND the medical system, and the endless work of explaining and justifying your experience.

Chronic illness is often invisible. You may look fine while feeling terrible, which creates its own problems: disbelief from others, pressure to perform wellness, guilt about not being "sick enough" to deserve accommodations. The illness is isolating and the invisibility is isolating too.

The medical system often fails people with chronic illness. Conditions are dismissed as psychosomatic, particularly for women and people of color. Diagnosis can take years. Treatment may be inadequate. You end up becoming your own researcher, advocate, and case manager — exhausting work you never asked for.

Acceptance of chronic illness is not the same as giving up. It's recognizing what is, grieving what was, and finding meaning and quality of life within new constraints. This is an ongoing process, not a destination.`,
      keyInsights: [
        { 
          title: 'Grief for the body you lost', 
          explanation: 'Chronic illness often involves grieving your former capacity, the life you expected, the identity you had. This grief can recur with every flare or progression.' 
        },
        { 
          title: 'It\'s not in your head (but it affects your head)', 
          explanation: 'The experience of being told symptoms are psychosomatic is traumatizing. Even when symptoms are 100% physical, they affect mental health. Both directions are real.' 
        },
        { 
          title: 'Spoon theory and energy management', 
          explanation: 'The concept of "spoons" as limited daily energy units helps explain chronic illness to others and helps you manage. Every activity costs spoons. Run out and you\'re done.' 
        },
        { 
          title: 'Medical trauma compounds physical illness', 
          explanation: 'Being dismissed, misdiagnosed, or mistreated by the healthcare system creates its own trauma layer. Many people with chronic illness have medical PTSD.' 
        },
      ],
      whatHelps: [
        'Find community with others who understand (chronic illness communities can be lifelines)',
        'Pace and plan: manage energy proactively rather than push-crash cycles',
        'Grieve the losses — this is real grief and deserves space',
        'Seek mental health support from providers who understand chronic illness',
        'Advocate for yourself in medical settings — bring documentation, bring support people',
        'Acceptance isn\'t giving up — it\'s making peace with what is so you can live fully within it',
      ],
      professionalNote: 'If you\'re struggling with the psychological impact of chronic illness, look for therapists who specialize in health psychology or chronic illness. General therapists may not understand the unique challenges.'
    },
    reflectionQuestions: [
      'What losses have come with your illness that you haven\'t fully grieved?',
      'How has the medical system treated you? What impact has that had?',
      'What would acceptance (not giving up, but accepting what is) look like for you?',
    ],
    relatedLessons: ['hm-trans-grief-all-kinds', 'hm-body-medication-stigma', 'hm-rel-loneliness-epidemic'],
  },
  {
    id: 'hm-body-medication-stigma',
    title: 'Medication Stigma: The Shame of Needing Help',
    category: 'body-health',
    duration: 6,
    emoji: '💊',
    content: {
      introduction: `There's a particular kind of shame attached to psychiatric medication that doesn't exist for other types of medicine. People who wouldn't hesitate to take blood pressure medication or insulin feel embarrassed about antidepressants. This stigma prevents people from getting help, stops them from being honest about their needs, and adds shame to an already difficult experience.

The beliefs underlying this stigma are deep and often unconscious: mental illness is weakness, medication is a crutch, you should be able to handle it yourself, taking medication means you've failed. These beliefs come from a culture that sees mental health as separate from physical health, mind as superior to body, and needing help as shameful.

The reality: the brain is an organ. Mental health conditions often have neurobiological components. Medication can correct chemical imbalances that make normal function impossible. For many people, medication is what makes therapy possible, what makes daily function possible, what makes life livable.

Choosing medication is a medical decision between you and your provider. It doesn't make you weak. It doesn't change who you "really" are. It's a tool for managing a medical condition. Full stop.`,
      keyInsights: [
        { 
          title: 'Brain is an organ too', 
          explanation: 'We don\'t shame people for treating heart disease or diabetes. The brain is equally physical, equally subject to dysfunction, equally deserving of treatment.' 
        },
        { 
          title: 'Stigma prevents treatment', 
          explanation: 'How many people suffer longer than necessary because shame about medication kept them from seeking help? The stigma itself causes harm.' 
        },
        { 
          title: 'It\'s not about being strong enough', 
          explanation: 'You can\'t willpower your way out of a chemical imbalance. Asking for help when you need it is actually strength, not weakness.' 
        },
        { 
          title: 'You don\'t have to tell anyone', 
          explanation: 'Your medication is your business. If sharing invites judgment you don\'t need, you\'re allowed to keep it private.' 
        },
      ],
      whatHelps: [
        'Examine where your beliefs about medication came from',
        'Separate facts from stigma: what does the research actually say?',
        'Make medical decisions based on evidence, not shame',
        'Find providers who are supportive and non-judgmental',
        'Connect with others who take medication (you\'d be surprised how many people do)',
      ],
    },
    reflectionQuestions: [
      'What beliefs do you have about psychiatric medication? Where did they come from?',
      'If a friend needed medication, would you judge them? Why would you judge yourself differently?',
      'What would it mean to accept help without shame?',
    ],
    relatedLessons: ['hm-mh-medication-misconceptions', 'hm-mh-depression-truth', 'hm-growth-self-compassion'],
  },
  {
    id: 'hm-body-sleep-mental-health',
    title: 'Sleep and Mental Health: The Foundation',
    category: 'body-health',
    duration: 6,
    emoji: '😴',
    content: {
      introduction: `Sleep and mental health form a bidirectional relationship so strong that it's sometimes hard to tell which is causing which. Poor sleep worsens depression, anxiety, and emotional regulation. Depression and anxiety disrupt sleep. It becomes a vicious cycle where each problem feeds the other.

Sleep deprivation affects the brain in measurable ways: the amygdala (emotional alarm center) becomes up to 60% more reactive, while the prefrontal cortex (rational control center) goes partially offline. You're literally less capable of emotional regulation when you're sleep-deprived. Those mood swings aren't weakness — they're sleep debt.

Sleep is also when the brain processes emotions and consolidates memories. Without adequate REM sleep, emotional experiences don't get properly processed. Trauma survivors often have disrupted REM sleep, which may explain why traumatic memories stay so "hot."

Protecting sleep is often the highest-leverage mental health intervention available. It's also one of the hardest, because life conspires against it: work, kids, screens, stress, the feeling that sleep is "unproductive" time. But sleep IS productive — it's when your brain does essential maintenance.`,
      keyInsights: [
        { 
          title: 'Sleep deprivation mimics mental illness', 
          explanation: 'Irritability, emotional dysregulation, cognitive impairment, low mood — these look like depression or anxiety but might actually be sleep debt. Check sleep before diagnosing yourself.' 
        },
        { 
          title: 'The cycle is vicious', 
          explanation: 'Poor sleep causes worse mental health, worse mental health causes poor sleep. Intervening anywhere in the cycle helps.' 
        },
        { 
          title: 'Sleep is when emotions get processed', 
          explanation: 'REM sleep helps integrate and process emotional experiences. Without it, emotions stay raw and unprocessed.' 
        },
        { 
          title: 'Sleep debt is real debt', 
          explanation: 'You can\'t truly catch up on missed sleep, and the effects accumulate. Chronic sleep deprivation has long-term health consequences.' 
        },
      ],
      whatHelps: [
        'Prioritize sleep like your mental health depends on it (because it does)',
        'Create sleep-supportive conditions: dark, cool, consistent timing',
        'Limit screens before bed — the light disrupts melatonin',
        'Address anxiety or racing thoughts that prevent sleep (this may need professional help)',
        'Rule out sleep disorders if you sleep enough hours but still feel unrested',
      ],
    },
    reflectionQuestions: [
      'How much sleep are you actually getting? How does that compare to what you need?',
      'How does your mood change with your sleep? Can you track the correlation?',
      'What would you need to change to protect your sleep?',
    ],
    relatedLessons: ['hm-mh-depression-truth', 'hm-mh-anxiety-types', 'hm-stress-chronic'],
  },
  {
    id: 'hm-body-movement-mood',
    title: 'Movement and Mood: The Body-Mind Loop',
    category: 'body-health',
    duration: 5,
    emoji: '🏃',
    content: {
      introduction: `Exercise is one of the most effective interventions for depression and anxiety — in some studies comparable to medication. This isn't "just go for a run and you'll feel better" toxic positivity. It's neuroscience: movement releases endorphins, reduces cortisol, promotes neurogenesis, and activates the body's natural regulation systems.

But here's the cruel irony: when you're depressed or anxious, motivation and energy for movement are exactly what's missing. Telling someone with depression to exercise can feel like telling someone with a broken leg to walk it off. The solution is also blocked by the problem.

The way through is behavioral activation: doing things even when you don't feel like it, knowing that feeling often follows action rather than preceding it. Start smaller than you think necessary. A five-minute walk counts. Movement doesn't have to be exercise — it can be stretching, dancing, cleaning, anything that gets the body moving.

And it's not about achievement or fitness goals. It's about the mood regulation effects of being in motion. The bar is "moved a bit" not "worked out hard." Lower the bar until it's something you can actually do, then do it consistently.`,
      keyInsights: [
        { 
          title: 'The evidence is strong', 
          explanation: 'Multiple meta-analyses show exercise has significant effects on depression and anxiety. This isn\'t wishful thinking — it\'s one of the most well-supported interventions we have.' 
        },
        { 
          title: 'Action before motivation', 
          explanation: 'Don\'t wait to feel like moving. Move and let the feeling follow. This is behavioral activation: breaking the depression cycle by doing, not waiting.' 
        },
        { 
          title: 'Small counts', 
          explanation: 'Five minutes of walking has mood effects. You don\'t need a gym membership or an hour. Movement that happens is better than exercise that doesn\'t.' 
        },
        { 
          title: 'It\'s not about fitness', 
          explanation: 'Forget weight loss, performance, or appearance goals. This is about mood regulation. The point is moving, not achieving.' 
        },
      ],
      whatHelps: [
        'Start embarrassingly small — make the bar low enough that you can clear it',
        'Attach movement to existing habits (after coffee, during lunch)',
        'Find movement that doesn\'t feel like exercise: walking, dancing, gardening',
        'Don\'t wait to feel like it — do it and let the feeling come after',
        'Track the mood effects so you see the correlation',
      ],
    },
    reflectionQuestions: [
      'What\'s the smallest possible amount of movement you could consistently do?',
      'What type of movement might actually feel good (not what you "should" do)?',
      'What stops you from moving when you know it would help?',
    ],
    relatedLessons: ['hm-mh-depression-truth', 'hm-stress-nervous-system'],
  },
  {
    id: 'hm-body-substances',
    title: 'Substances and Self-Medication',
    category: 'body-health',
    duration: 7,
    emoji: '🍷',
    content: {
      introduction: `Many people use substances — alcohol, cannabis, other drugs — to cope with emotional pain, anxiety, depression, or trauma. This is self-medication: using substances to manage symptoms that aren't being addressed another way. It works, in the short term, which is exactly the problem.

Self-medication isn't stupidity or weakness. It's an attempt to solve a real problem with the tools available. Alcohol does reduce anxiety (temporarily). Cannabis does numb emotional pain (temporarily). The problem is that the temporary relief creates longer-term problems: dependency, tolerance, physical health effects, and often a worsening of the original symptoms.

The question isn't whether substances provide relief — they often do. The question is whether the relief is worth the costs, and whether better solutions exist. For most self-medication patterns, the answer is: there are better solutions, but they require access to treatment, resources, and support that not everyone has.

If you're self-medicating, the path forward involves both addressing the substance use AND addressing what you've been using substances to manage. Just stopping the substance without addressing the underlying issue often leads either to relapse or to the underlying issue getting worse.`,
      keyInsights: [
        { 
          title: 'Self-medication is problem-solving', 
          explanation: 'It\'s not a character flaw. It\'s an attempt to manage something painful. The goal is to find better solutions, not to shame yourself for trying to cope.' 
        },
        { 
          title: 'Short-term relief, long-term cost', 
          explanation: 'Substances often provide genuine relief in the moment. The issue is that the costs accumulate while the relief diminishes (tolerance). The math gets worse over time.' 
        },
        { 
          title: 'Address both the behavior and the underlying need', 
          explanation: 'Just stopping a substance without addressing what it was managing often leads to returning to it or finding another problematic coping mechanism.' 
        },
        { 
          title: 'Access to alternatives isn\'t equal', 
          explanation: 'It\'s easy to say "get therapy" but not everyone has access. Self-medication often fills a gap left by inadequate mental health care systems.' 
        },
      ],
      whatHelps: [
        'Be honest about what function the substance serves — what is it managing?',
        'Look at the actual costs, not just the immediate benefits',
        'Explore what you\'d need to address if you stopped using the substance',
        'Seek support that addresses both the substance use and the underlying issues',
        'Harm reduction: if you can\'t stop, can you reduce harm?',
      ],
      professionalNote: 'If you\'re struggling with substance use, please seek support. This could be a therapist, a support group (AA, SMART Recovery, etc.), or a treatment program. You don\'t have to do this alone.'
    },
    reflectionQuestions: [
      'What function does substance use serve in your life? What is it helping you manage?',
      'What are the costs — not just the obvious ones, but the accumulated ones?',
      'What would you need to address if you weren\'t using substances to manage it?',
    ],
    relatedLessons: ['hm-mh-depression-truth', 'hm-mh-anxiety-types', 'hm-mh-trauma-basics'],
  },
];

// ============================================================================
// CATEGORY 7: LIFE TRANSITIONS
// ============================================================================

const lifeTransitionsLessons: HumanManualLesson[] = [
  {
    id: 'hm-trans-grief-all-kinds',
    title: 'Grief Comes in Many Forms',
    category: 'life-transitions',
    duration: 8,
    emoji: '🕯️',
    content: {
      introduction: `Grief is the normal response to loss — but loss comes in more forms than death. You can grieve the end of a relationship, the loss of a job, the life you expected, a friendship that faded, your health, your youth, a version of yourself that no longer exists. These are real losses that deserve real grief.

Our culture is bad at grief. We want it to have stages that progress neatly, a timeline, an endpoint. But grief is not linear. It comes in waves. It can ambush you years later. The "stages" model (denial, anger, bargaining, depression, acceptance) was never meant to be sequential — the person who created it said it described common experiences, not a roadmap.

Disenfranchised grief — grief that society doesn't recognize as legitimate — is particularly painful. The loss of a pet, a pregnancy, a friendship, an opportunity, a home. When others don't acknowledge your loss as "real," you may feel you don't have permission to grieve. You do.

Grief doesn't require getting over it. It requires learning to carry it. The loss remains. You grow around it. Over time, the grief may soften, but the love doesn't have to.`,
      keyInsights: [
        { 
          title: 'Grief is not just for death', 
          explanation: 'Any significant loss — relationship, health, opportunity, identity, dream — can generate genuine grief. If you lost something that mattered, you\'re allowed to grieve it.' 
        },
        { 
          title: 'It\'s not linear', 
          explanation: 'Waves, not stages. You can feel fine and then suddenly not. Progress isn\'t steady. This is normal, not failure.' 
        },
        { 
          title: 'Disenfranchised grief is real', 
          explanation: 'When others don\'t recognize your loss, you may feel you don\'t deserve to grieve. But you do. Your grief is valid even if others can\'t see it.' 
        },
        { 
          title: 'You don\'t get over it, you grow around it', 
          explanation: 'The loss doesn\'t shrink. You expand to carry it. The grief becomes part of who you are, not something you leave behind.' 
        },
      ],
      whatHelps: [
        'Name the loss — even if others don\'t recognize it',
        'Let yourself grieve fully — don\'t rush or minimize',
        'Find people who can witness your grief without trying to fix it',
        'Create rituals to honor what you\'ve lost',
        'Be patient — grief has its own timeline',
        'Seek support if grief becomes complicated (stuck, overwhelming, extending function impairment for long periods)',
      ],
      professionalNote: 'Complicated grief — when grief remains intensely debilitating for extended periods — may benefit from specialized grief therapy. This isn\'t weakness; it\'s getting appropriate help for a wound that isn\'t healing on its own.'
    },
    reflectionQuestions: [
      'What losses in your life haven\'t been fully grieved?',
      'Are there griefs you\'ve minimized because others didn\'t see them as "real"?',
      'What would fully honoring your grief actually look like?',
    ],
    relatedLessons: ['hm-trans-identity-shifts', 'hm-body-chronic', 'hm-world-climate-anxiety'],
  },
  {
    id: 'hm-trans-identity-shifts',
    title: 'When Who You Are Changes',
    category: 'life-transitions',
    duration: 7,
    emoji: '🦋',
    content: {
      introduction: `Identity isn't fixed — it evolves across the lifespan. Sometimes the evolution is gradual. Sometimes it's sudden: a life event forces you to become someone different, or you realize who you've been is no longer who you want to be. These identity shifts are disorienting, even when they're chosen.

Major life transitions often trigger identity restructuring: becoming a parent, retiring, divorce, illness, career change, loss of a role or relationship that defined you, coming out, recovery from addiction, or any major change in circumstances. The old "you" no longer applies, but the new one hasn't solidified.

The space between identities — what William Bridges called the "neutral zone" — is uncomfortable. You don't know who you are yet. The old answers to "who am I?" don't fit, and the new answers haven't arrived. This in-between time can feel like falling apart even when it's actually falling into place.

Allow the transition. Resisting it prolongs the disorientation. The new identity will emerge, but it requires letting go of the old one — and that's a grief process too.`,
      keyInsights: [
        { 
          title: 'Identity is always in process', 
          explanation: 'You\'re not the same person at 40 that you were at 20. Growth means changing, and changing means grieving who you were.' 
        },
        { 
          title: 'The neutral zone is uncomfortable but necessary', 
          explanation: 'Between "who I was" and "who I\'m becoming" is a messy middle. It\'s disorienting but it\'s where transformation happens.' 
        },
        { 
          title: 'Loss of identity is real loss', 
          explanation: 'When you can no longer be who you were — due to illness, circumstances, growth — that\'s a death of sorts. Grief is appropriate.' 
        },
        { 
          title: 'You get to choose (mostly)', 
          explanation: 'Some identity shifts are forced. But you have more say in who you become than you might think. Intentional identity work is possible.' 
        },
      ],
      whatHelps: [
        'Recognize you\'re in transition — naming it helps',
        'Allow the disorientation instead of rushing to resolve it',
        'Explore: who are you if not [old role/identity]?',
        'Try on new possibilities without committing',
        'Grieve the old identity — it was real, even if it no longer fits',
        'Be patient — identity reconstruction takes time',
      ],
    },
    reflectionQuestions: [
      'What parts of your identity feel solid right now? What feels like it\'s shifting?',
      'Is there an old version of yourself you need to let go of?',
      'Who might you be becoming?',
    ],
    relatedLessons: ['hm-trans-grief-all-kinds', 'hm-work-job-identity', 'hm-trans-starting-over'],
  },
  {
    id: 'hm-trans-starting-over',
    title: 'Starting Over After Loss',
    category: 'life-transitions',
    duration: 7,
    emoji: '🌱',
    content: {
      introduction: `Starting over is one of the hardest things humans do. After divorce, job loss, death of a partner, major health crisis, or any event that destroys your previous life structure — you face the task of rebuilding from scratch while grieving what was lost.

The simultaneous grief and reconstruction is exhausting. You're supposed to be moving forward while still processing what happened. Society often wants you to "bounce back" on a timeline that has nothing to do with reality. There's pressure to be inspirational, to find the silver lining, to turn pain into growth on command.

Here's permission to not be okay for a while. Starting over doesn't mean pretending the loss didn't happen. It means building a new life that acknowledges the loss, that has room for grief alongside new growth. The new life will be different from what you planned. It can still be good — but it will be different.

Take it day by day when long-term vision feels impossible. Do the next small thing. Let people help. Lower the bar for what counts as success. You're not just building a life — you're doing it while carrying grief. That deserves massive compassion.`,
      keyInsights: [
        { 
          title: 'Rebuilding while grieving is exhausting', 
          explanation: 'You\'re doing two of the hardest things at once. Cut yourself enormous slack.' 
        },
        { 
          title: 'The new life will be different', 
          explanation: 'You can\'t recreate what you had. Trying to will lead to frustration. The new life needs to be accepted on its own terms.' 
        },
        { 
          title: 'Small steps compound', 
          explanation: 'When vision is impossible, focus on the next small thing. One decision, one task, one day. Progress accumulates.' 
        },
        { 
          title: '"Bouncing back" is a myth', 
          explanation: 'You don\'t bounce back to who you were. You become someone new — someone shaped by the loss but not defined only by it.' 
        },
      ],
      whatHelps: [
        'Let people help — this isn\'t the time for independence',
        'Lower all standards — good enough is the goal',
        'Day by day when longer is too much',
        'Allow grief alongside rebuilding — they can coexist',
        'Find models: people who rebuilt after similar losses',
        'Patience — this takes longer than you want it to',
      ],
    },
    reflectionQuestions: [
      'What do you need to grieve before you can rebuild?',
      'What\'s the smallest possible next step you could take?',
      'What might the new life look like if you stopped trying to recreate the old one?',
    ],
    relatedLessons: ['hm-trans-grief-all-kinds', 'hm-trans-identity-shifts'],
  },
  {
    id: 'hm-trans-aging',
    title: 'Aging: The Transition Nobody Escapes',
    category: 'life-transitions',
    duration: 7,
    emoji: '⏳',
    content: {
      introduction: `Aging is the one major life transition that applies to everyone who doesn't die young. Yet we rarely prepare for it, avoid thinking about it, and treat it as something that happens to other people until it happens to us.

The psychological challenges of aging include: adjusting to changing physical capacity, processing accumulated losses, finding meaning without roles that defined you, facing mortality, dealing with a culture that devalues older people, and maintaining connection when your social network naturally shrinks.

But aging also comes with advantages often overlooked: emotional regulation generally improves with age, older adults tend to focus more on meaningful relationships, research shows increases in wellbeing in later life for many people, and accumulated wisdom is real. The "U-curve" of happiness suggests wellbeing often increases after middle age.

The transition of aging goes better when acknowledged than when denied. Pretending you're still 35 when you're 65 creates its own suffering. Accepting the reality of this life stage, with its losses AND its gifts, allows you to live it fully rather than fighting it constantly.`,
      keyInsights: [
        { 
          title: 'Denial doesn\'t help', 
          explanation: 'Fighting aging creates suffering. Accepting it as a life stage — with its challenges AND opportunities — allows you to engage with it rather than resist it.' 
        },
        { 
          title: 'Aging has real gifts', 
          explanation: 'Emotional regulation, perspective, focus on what matters, freedom from certain anxieties — research shows these often improve with age.' 
        },
        { 
          title: 'Connection matters more', 
          explanation: 'As social networks naturally shrink, the quality of remaining relationships becomes more important. Cultivate and maintain key connections.' 
        },
        { 
          title: 'Meaning needs renegotiating', 
          explanation: 'If work or parenting defined you, retirement or empty nest requires finding new sources of meaning. This is identity work.' 
        },
      ],
      whatHelps: [
        'Accept the reality of aging rather than fighting it',
        'Stay connected — isolation is one of the biggest risks',
        'Find meaning in this stage — what does it make possible that earlier stages didn\'t?',
        'Address grief for lost capacities, roles, and people',
        'Stay engaged with life — purpose matters at every age',
        'Deal with practical realities (health, finances, living situation) rather than avoiding them',
      ],
    },
    reflectionQuestions: [
      'What fears do you have about aging? What hopes?',
      'What meaning and purpose do you want in your later years?',
      'What losses have come with aging that you haven\'t fully acknowledged?',
    ],
    relatedLessons: ['hm-trans-grief-all-kinds', 'hm-trans-identity-shifts', 'hm-rel-loneliness-epidemic'],
  },
  {
    id: 'hm-trans-divorce',
    title: 'Divorce and Relationship Endings',
    category: 'life-transitions',
    duration: 8,
    emoji: '💔',
    content: {
      introduction: `Divorce and major relationship endings involve loss on multiple levels: loss of the person, loss of the future you planned, loss of daily routines and shared life, loss of identity as part of a couple, sometimes loss of home or financial security, and often loss of mutual friends and extended family connections.

Even when the relationship needed to end — even when you're the one who ended it — grief is normal. You can be relieved AND grieving. You can know it was right AND still mourn. These aren't contradictions; they're the complexity of real human experience.

The practical challenges (where to live, finances, custody if children are involved) layer on top of emotional devastation. You're supposed to make major life decisions while your capacity for decision-making is at its lowest. This is a setup for struggle, and giving yourself grace is essential.

Recovery takes longer than you expect or want. Research suggests 2-5 years for full adjustment to divorce. Rushing to "get over it" or jumping into a new relationship to avoid the pain typically extends the recovery, not shortens it.`,
      keyInsights: [
        { 
          title: 'Multiple losses at once', 
          explanation: 'You\'re not just losing a person — you\'re losing a life structure, a future, an identity. Each of these deserves grief.' 
        },
        { 
          title: 'Relief and grief coexist', 
          explanation: 'Being glad it\'s over doesn\'t mean you don\'t mourn. Both are true. Both are allowed.' 
        },
        { 
          title: 'Recovery takes years, not months', 
          explanation: 'The pressure to "move on" quickly doesn\'t match reality. Full adjustment takes 2-5 years for most people. That\'s not failure — that\'s normal.' 
        },
        { 
          title: 'Making decisions while depleted', 
          explanation: 'Major life decisions during divorce (housing, finances, custody) happen when you\'re least capable of making them well. Get support, go slow when possible.' 
        },
      ],
      whatHelps: [
        'Allow the full grief, including for parts of the relationship that were good',
        'Get support — friends, family, therapist, divorce support group',
        'Be careful about major decisions while in acute grief',
        'Take care of basics: sleep, food, movement, connection',
        'Resist the urge to jump into a new relationship to avoid pain',
        'Be patient — this takes time and that\'s okay',
      ],
    },
    reflectionQuestions: [
      'What are all the losses you\'re grieving, not just the obvious one?',
      'What do you need from others during this transition?',
      'What would taking care of yourself through this actually look like?',
    ],
    relatedLessons: ['hm-trans-grief-all-kinds', 'hm-trans-starting-over', 'hm-trans-identity-shifts'],
  },
  {
    id: 'hm-trans-becoming-parent',
    title: 'Becoming a Parent: Identity Earthquake',
    category: 'life-transitions',
    duration: 7,
    emoji: '👶',
    content: {
      introduction: `Becoming a parent is one of the most profound identity transitions a person can undergo. In an instant, you become responsible for another human's survival and wellbeing. Your time, body, relationships, work, and sense of self all fundamentally restructure. This is true even when deeply wanted — and especially complicated when it wasn't.

The cultural narrative says you should feel overwhelming love and joy. The reality often includes exhaustion, identity loss, relationship strain, grief for your former life, sometimes ambivalence, and the terrifying responsibility of keeping a tiny human alive. Admitting any of this feels taboo, which isolates new parents in their struggle.

Postpartum depression and anxiety are common (affecting 10-20% of new mothers and a significant percentage of fathers) but still under-discussed. Intrusive thoughts about harm coming to the baby are extremely common and don't mean you're dangerous — they're a feature of the hypervigilant postpartum brain.

The identity shift of parenthood is permanent. You will never not be a parent again. This can be beautiful and it can feel like a trap. Both are valid experiences of the same reality.`,
      keyInsights: [
        { 
          title: 'Identity reconstruction is normal', 
          explanation: 'You\'re not the same person you were before. Mourning your pre-parent self — your freedom, your sleep, your identity — is allowed and doesn\'t mean you don\'t love your child.' 
        },
        { 
          title: 'The cultural narrative is a lie', 
          explanation: 'Constant bliss is not the reality. Exhaustion, ambivalence, struggle, and love coexist. You\'re not failing if parenthood is hard.' 
        },
        { 
          title: 'Intrusive thoughts are common', 
          explanation: 'Terrible thoughts about harm coming to your baby plague many new parents. They\'re the anxious brain on overdrive, not evidence of danger. Talk to someone if they\'re overwhelming.' 
        },
        { 
          title: 'Your relationship changes', 
          explanation: 'The partnership that existed before kids transforms. This requires attention and communication. Many couples struggle and don\'t talk about it.' 
        },
      ],
      whatHelps: [
        'Talk honestly about the hard parts — break the isolation',
        'Get help — you\'re not meant to do this alone',
        'Sleep when possible (yes, really)',
        'Screen for postpartum depression/anxiety — it\'s common and treatable',
        'Grieve the identity you lost while embracing the one you\'re gaining',
        'Communicate with your partner — the relationship needs attention',
      ],
      warningSign: 'Postpartum depression and anxiety are serious. If you\'re having persistent low mood, excessive anxiety, intrusive thoughts you can\'t shake, or thoughts of harming yourself or your baby, please tell someone immediately.'
    },
    reflectionQuestions: [
      'What parts of your pre-parent identity are you mourning?',
      'What would you admit about parenthood that you don\'t usually say out loud?',
      'What support do you need that you\'re not currently getting?',
    ],
    relatedLessons: ['hm-trans-identity-shifts', 'hm-