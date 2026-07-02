/**
 * Human Manual - Deep Topics for Real Life
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
 * - Family Fleet Rituals (Pre-Flight / Post-Flight)
 * 
 * Each lesson is grounded in psychology research and designed to meet
 * people where they actually are - not where we wish they were.
 */

import { familyRitualsLessons } from './familyRitualsLessons';

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
  /** Gauges that can trigger this lesson as contextual suggestion */
  triggerGauges?: ('body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment')[];
  /** Threshold below which the lesson is suggested (default 40) */
  triggerThreshold?: number;
  /** When to suggest: 'stabilization' = only when system in stabilization mode, 'any' = anytime gauges match */
  triggerMode?: 'stabilization' | 'any';
}

export interface HumanManualCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  lessons: HumanManualLesson[];
}

/** Cross-disciplinary perspective for a lesson (used by lessonPerspectives). */
export interface LessonPerspective {
  discipline: string;
  insight: string;
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
      introduction: `The family you grew up in taught you how to be human - for better or worse. Attachment researchers have found that the way your caregivers responded to your needs in the first few years of life literally wired your nervous system for how you'd experience relationships forever after. This isn't destiny. It's just the starting point.

Family wounds don't always look like abuse. Sometimes they look like a parent who was physically present but emotionally absent. A home where anger was explosive and unpredictable. A family where emotions were never discussed, so you learned they weren't acceptable. A parent who used you as their therapist. A sibling who was favored. Neglect doesn't require intention.

The wound isn't just what happened - it's what DIDN"T happen. You might have missed the experience of being truly seen, of having your emotions validated, of feeling unconditionally loved. And you can't miss what you never knew was supposed to be there, which is why many people don't recognize family wounds until much later.

Healing doesn't require your family to acknowledge what happened. It doesn't require reconciliation. It starts with recognizing the wound, grieving what you didn't get, and slowly learning to give it to yourself.`,
      keyInsights: [
        { 
          title: "The wound and the adaptation', 
          explanation: 'Every family wound comes with an adaptation - a survival strategy you developed. People-pleasing, hyper-independence, emotional shutdown, perfectionism - these aren\'t character flaws. They\'re how you survived.' 
        },
        { 
          title: 'You can love someone and be wounded by them', 
          explanation: 'This is one of the hardest truths. Your parents could have loved you deeply and still harmed you. Both can be true. Acknowledging harm doesn\'t erase love, and love doesn\'t erase harm.' 
        },
        { 
          title: 'Parentification', 
          explanation: 'When children have to parent their parents - emotionally, practically, or both - they miss their own childhood. They become hyper-responsible adults who don\'t know how to let anyone take care of them.' 
        },
        { 
          title: 'Emotional neglect is invisible', 
          explanation: 'Unlike abuse, neglect leaves no marks. It\'s the absence of attunement, validation, and presence. You might not have words for it because nothing "happened" - but something crucial didn\'t happen.' 
        },
      ],
      whatHelps: [
        'Name the wound. Give it words even if they feel inadequate.',
        'Grieve what you didn\'t get. This is real loss.',
        'Identify the adaptation. How did you survive? That skill served you - but does it still?',
        'Reparenting work (see Growth & Healing section)',
        'Therapy, especially trauma-informed or attachment-focused',
      ],
      professionalNote: 'If exploring family wounds brings up intense distress, flashbacks, or destabilization, a trauma-informed therapist can help you process safely.'
    },
    reflectionQuestions: [
      'What did you learn about emotions in your family? Were some feelings allowed and others not?',
      'What adaptation did you develop to survive your family system? Does it still serve you?',
      'If you could go back and give your younger self one thing you didn\'t get - what would it be?',
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
      introduction: `Discovering a partner's affair isn't just heartbreak - it's trauma. Research by Dr. Shirley Glass and others has shown that infidelity produces symptoms similar to PTSD: intrusive thoughts, hypervigilance, emotional flooding, difficulty trusting your own perception. This isn't an overreaction. Your attachment system has been fundamentally shaken.

Betrayal trauma is unique because the person who was your source of safety became the source of danger. Your brain is now trying to reconcile these two incompatible realities. This is why it can feel like you're going crazy - obsessive thoughts, checking behaviors, mood swings, physical symptoms. Your nervous system is trying to regain control in a world that suddenly feels unpredictable.

The betrayed partner often gets blamed - for being \"too controlling\" with their need to know details, for not \"moving on\" fast enough, for their emotional reactions. But these responses are neurobiologically normal. The brain needs information to update its threat assessment. The emotions need space to process.

Whether you stay or leave, healing is possible. But it's a process measured in years, not months. The relationship either ends, or a new relationship forms between the same two people. The old one is gone either way.`,
      keyInsights: [
        { 
          title: 'Betrayal trauma is real trauma', 
          explanation: 'The symptoms - intrusive thoughts, hypervigilance, sleep disruption, difficulty concentrating - are your nervous system\'s response to attachment violation. You\'re not being dramatic.' 
        },
        { 
          title: 'The need for details is normal', 
          explanation: 'Your brain can\'t move forward without understanding what happened. The obsessive need to know isn\'t pathology - it\'s your mind trying to make sense of something that shattered your reality.' 
        },
        { 
          title: 'Gaslighting compounds the wound', 
          explanation: 'If your partner denied, minimized, or blamed you, you\'ve experienced gaslighting on top of betrayal. Rebuilding trust in your own perception may take longer than rebuilding trust in a partner.' 
        },
        { 
          title: 'Stay or leave - both are valid', 
          explanation: 'There\'s no "right" choice. Some relationships can be rebuilt into something stronger. Some can\'t. Neither choice makes you weak or wrong.' 
        },
        {
          title: 'Triggers may last for years',
          explanation: 'Dates, places, songs, even smells can bring back the flood of pain. This doesn\'t mean you haven\'t healed - it means the wound was deep. The triggers diminish over time but may never fully disappear.'
        }
      ],
      whatHelps: [
        'Full, honest disclosure from the unfaithful partner (research shows trickle truth prolongs trauma)',
        'Space for all your emotions - rage, grief, confusion, even love',
        'Couples therapy with a specialist in infidelity (not all therapists understand betrayal trauma)',
        'Individual therapy to process trauma symptoms',
        'Support from people who won\'t push you to "just forgive" or "just leave"',
        'Time - healing takes 2-5 years on average, whether you stay or go',
      ],
      professionalNote: 'If you\'re experiencing PTSD symptoms from betrayal, a trauma-informed therapist (look for someone trained in betrayal trauma or infidelity) can help stabilize your nervous system while you make decisions.'
    },
    reflectionQuestions: [
      'What do you need right now that you\'re not getting?',
      'What would it take for you to trust again - trust your partner, or trust yourself?',
      'What did you learn about yourself through this pain?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-rel-boundaries-protect'],
  },
  {
    id: 'hm-rel-adult-friendships',
    title: 'Adult Friendships Are Hard',
    category: 'relationships',
    duration: 7,
    emoji: '👯",
    content: {
      introduction: `Making and keeping friends as an adult is legitimately difficult, and it's not your fault. Research shows that friendship requires three things: proximity (being near each other regularly), repeated unplanned interaction, and a setting that encourages vulnerability. School and college naturally provided all three. Adult life provides almost none.

After school, you have to manufacture opportunities that used to happen automatically. You have to text people to hang out, which feels vulnerable. You have to show up tired after work, which feels hard. You have to be the one to reach out, which feels one-sided. This is normal. It's not that you're bad at friendship - it's that the conditions for friendship have fundamentally changed.

The research is clear: adults need friends for health and wellbeing. Loneliness is as harmful as smoking 15 cigarettes a day. But knowing this doesn't make it easier. The solution isn't to try harder - it's to create structures that allow friendship to develop naturally: recurring activities, shared interests, built-in time together.

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
          explanation: 'Outgrowing friendships hurts. Drifting apart hurts. The friends who couldn\'t grow with you - that\'s a real loss that deserves acknowledgment.' 
        },
      ],
      whatHelps: [
        'Join recurring activities aligned with your interests (same people, same time, week after week)',
        'Be the initiator - someone has to, and it might as well be you',
        'Lower the bar: texting "thinking of you" counts as maintaining connection',
        'Accept that some friendships are seasonal and let them go with grace',
        'Be patient - adult friendships develop slowly',
      ],
    },
    reflectionQuestions: [
      'What recurring activities could you join to increase proximity with potential friends?',
      'Who have you been meaning to reach out to? What stops you?',
      'Is there a friendship you need to grieve instead of trying to revive?',
    ],
    relatedLessons: ['hm-trans-identity-shifts', 'hm-stress-overwhelm'],
    triggerGauges: ['connection'],
    triggerThreshold: 45,
    triggerMode: 'any',
  },
  {
    id: 'hm-rel-boundaries-protect',
    title: 'Boundaries Protect - They Don\'t Punish',
    category: 'relationships',
    duration: 6,
    emoji: '🚧",
    content: {
      introduction: `Boundaries are not about controlling other people - they're about what YOU will do. \"You can't talk to me that way" isn't a boundary. \"I will leave the conversation if you yell at me\" is. See the difference? One tries to control their behavior. The other defines yours.

Many people struggle with boundaries because they were taught that having needs is selfish, that love means tolerating harm, or that keeping the peace is more important than protecting yourself. These beliefs are survival adaptations from families or relationships where your boundaries weren't respected. They're understandable - and they can change.

Setting boundaries often feels mean at first. If you've been boundaryless, even reasonable limits will feel harsh. If others are used to unlimited access to you, they will often react badly when you start having limits. This doesn't mean you're wrong. It means they got used to a dynamic that wasn't sustainable.

You are allowed to change the terms of access to your time, energy, and self. Some relationships won't survive your boundaries. That's information about those relationships.`,
      keyInsights: [
        { 
          title: 'Boundaries define YOUR behavior, not theirs', 
          explanation: ''I won\'t discuss this topic." "I\'ll need to hang up if this continues." "I\'m not available after 9pm." These define what you will do in response to situations.' 
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
        'Start small - practice with low-stakes boundaries before the big ones',
        'Write out your boundaries and their consequences before difficult conversations',
        'Expect pushback and plan for it - people who benefited from your lack of boundaries won\'t celebrate your new ones',
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
    emoji: '🔄",
    content: {
      introduction: `If you keep ending up in the same types of difficult relationships, you're not unlucky - you're running a pattern. This isn't blame; it's recognition. The patterns we learned in childhood about what love looks like, what we deserve, and how relationships work tend to replay until we consciously interrupt them.

Maybe you're drawn to people who are emotionally unavailable because that's what love felt like growing up. Maybe you choose partners who need rescuing because being needed feels like love. Maybe you tolerate treatment you'd never accept for a friend because somewhere you learned that your needs don't matter. The pattern made sense once. It kept you connected to caregivers who weren't always safe or present. But what was adaptive then is destructive now.

Breaking the pattern starts with seeing it. Not judging it - just seeing it. What do your relationships have in common? What role do you tend to play? What dynamics feel "comfortable" even when they're harmful? Comfort isn't the same as healthy. Sometimes healthy feels uncomfortable precisely because it's new.

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
        'Map your relationship history - look for common elements',
        'Identify what role you play (rescuer, peacekeeper, pursuer, etc.)',
        'Slow down - patterns thrive on intensity and speed',
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
    emoji: '🏝️",
    content: {
      introduction: `Loneliness has reached epidemic levels, and it's not because people are flawed. Our society has been systematically dismantled of the structures that used to create connection: extended families, neighborhoods, religious communities, third places, even front porches. We now have to individually solve what used to be collectively provided.

Loneliness isn't the same as being alone. You can feel lonely in a crowd, in a marriage, or surrounded by family. Loneliness is the gap between the connection you have and the connection you need. And your nervous system treats this gap like a threat - because evolutionarily, isolation WAS a threat to survival.

Chronic loneliness changes the brain. It increases inflammation, disrupts sleep, and triggers hypervigilance. It can make you interpret neutral social cues as negative, creating a cycle where loneliness breeds more isolation. This isn't weakness - it's neurobiology.

The solution isn't just "put yourself out there." It's recognizing that the loneliness epidemic is a societal problem requiring individual workarounds until we rebuild the village we've lost.`,
      keyInsights: [
        { 
          title: "Loneliness is a biological alarm', 
          explanation: 'Your brain treats social disconnection like hunger or thirst - a signal that a survival need isn\'t being met. Take it seriously.' 
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
        'Start small - even brief positive interactions help',
        'Regular, recurring contact matters more than occasional deep connection',
        'Volunteer work provides connection with added meaning',
        'Online communities count - especially for isolated populations',
        'Pet connection is real connection (research supports this)',
        'Be honest with someone about feeling lonely - shame grows in silence',
      ],
    },
    reflectionQuestions: [
      'On a scale of 1-10, how lonely do you feel most days?',
      'What\'s one small way you could increase meaningful contact this week?',
      'What keeps you from reaching out when you\'re lonely?',
    ],
    relatedLessons: ['hm-rel-adult-friendships', 'hm-mh-depression-truth'],
    triggerGauges: ['connection'],
    triggerThreshold: 30,
    triggerMode: 'any',
  },
  {
    id: 'hm-rel-difficult-people',
    title: 'Dealing with Difficult People',
    category: 'relationships',
    duration: 7,
    emoji: '⚔️",
    content: {
      introduction: `Some people in your life are genuinely difficult - not because of a misunderstanding you could solve with better communication, but because of who they are. They might be narcissistic, manipulative, chronically negative, or simply incompatible with your wellbeing. Recognizing this is not being judgmental; it's being realistic.

The tricky part is that many of these people can't be removed from your life - they're family members, coworkers, or co-parents. The strategy shifts from \"get away from them\" to \"limit their impact on your nervous system.\" This requires accepting that you can't change them, only your response to them.

The \"gray rock\" method works for some situations: becoming so boring and non-reactive that you stop being an interesting target. Strict boundaries work for others. Sometimes the only solution is radical acceptance that this person will always be difficult, and restructuring your life to minimize contact.

Your energy is finite. Difficult people often consume disproportionate amounts of it. Choosing where to spend that energy is an act of self-preservation, not selfishness.`,
      keyInsights: [
        { 
          title: "You can\'t change them', 
          explanation: 'This is both devastating and liberating. The fantasy that if you just explain it right, they\'ll understand - let it go. Channel that energy into managing your own response.' 
        },
        { 
          title: 'Gray rock technique', 
          explanation: 'Becoming boring, unresponsive, and uninteresting to someone who feeds on drama. Short answers, no emotional engagement, no JADE (Justify, Argue, Defend, Explain).' 
        },
        { 
          title: 'Protect your energy budget', 
          explanation: 'You have limited emotional energy. Difficult people drain it disproportionately. Consciously deciding how much access they get is not mean - it\'s mathematics.' 
        },
        { 
          title: 'Their behavior reflects them, not you', 
          explanation: 'Difficult people often try to make you feel like the problem. Remember: their reaction to reasonable boundaries is information about them, not about whether your boundaries are okay.' 
        },
      ],
      whatHelps: [
        'Lower your expectations - expect them to be who they are',
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
    emoji: '👫",
    content: {
      introduction: `Sibling relationships are the longest relationships most people will ever have - longer than friendships, longer than marriages, longer than parent-child bonds. And yet we often underestimate how profoundly these relationships shape us. Your siblings witnessed your childhood. They were there for the family dysfunction you might still be processing. They hold memories no one else has.

Sibling relationships can be sources of deep love and support, or lasting wounds and rivalry. Often, they're both. The dynamics you developed as children - the golden child and the scapegoat, the caretaker and the baby, the peacemaker and the troublemaker - tend to persist into adulthood unless actively examined.

Sibling rivalry isn't childish. It often reflects real competition for limited parental attention, approval, or resources. If your parents explicitly or implicitly compared you to your siblings, that wound runs deep. If one sibling was favored, the others carry that rejection. If one sibling was parentified (made responsible for the others), that shapes every relationship that follows.

Adult sibling relationships require renegotiation. You're not the same people you were at 8 or 15. But many siblings never update their perception of each other, still relating through the roles assigned in childhood. Healing sibling relationships - or accepting they can't be healed - is part of adult growth.`,
      keyInsights: [
        { 
          title: "Childhood roles persist', 
          explanation: 'The "responsible one," the "problem child," the "favorite" - these labels often stick into adulthood unless deliberately examined. You may still be playing out dynamics from 20 years ago.' 
        },
        { 
          title: 'Parental comparison creates lasting wounds', 
          explanation: ''Why can\'t you be more like your sister?" is a wound that echoes for decades. Being compared unfavorably to siblings shapes self-worth at its foundation.' 
        },
        { 
          title: 'Grief for the sibling relationship you didn\'t have', 
          explanation: 'Some siblings become best friends. Others become strangers. If you didn\'t get the sibling relationship you wanted or needed, that\'s a legitimate loss to grieve.' 
        },
        { 
          title: 'Estrangement is sometimes necessary', 
          explanation: 'Not all sibling relationships can or should be maintained. Cutting contact with a toxic sibling isn\'t failure - it\'s protection.' 
        },
        {
          title: 'Adult siblings must renegotiate',
          explanation: 'You\'re not 12 anymore. The relationship needs updating to reflect who you both are now, not who you were in childhood. This requires both people to be willing.'
        }
      ],
      whatHelps: [
        'Examine the roles: What role were you assigned in your family? Are you still playing it?',
        'Separate your sibling from your parents\' favoritism - they didn\'t choose to be favored',
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
    emoji: '🏳️‍⚧️",
    content: {
      introduction: `Gender identity - your internal sense of your own gender - is one of the most fundamental aspects of who you are. For cisgender people (those whose gender identity matches their sex assigned at birth), this usually goes unexamined. For transgender, non-binary, and gender-diverse people, understanding and expressing your true gender can be a lifelong journey.

Coming out as trans or non-binary is not a single event but an ongoing process. You may come out to yourself first, then to close friends, family, coworkers, and the world - each step carrying its own risks and rewards. Some people will embrace you. Others will struggle. Some relationships will deepen. Others will end. This is profoundly unfair, but it's the reality many trans people navigate.

Gender dysphoria - the distress caused by the mismatch between your gender identity and your body or how others perceive you - can range from mild discomfort to severe anguish. Not all trans people experience dysphoria, and the absence of dysphoria doesn't make someone "less trans." Gender euphoria - the joy of being seen and expressed as your true gender - is equally valid as an indicator.

Transition looks different for everyone. Social transition (name, pronouns, presentation), medical transition (hormones, surgeries), or no medical transition at all - there's no "right" way to be trans. What matters is living authentically.`,
      keyInsights: [
        { 
          title: 'Gender identity is internal and real', 
          explanation: 'Your gender is not determined by your body, your chromosomes, or what others think. It\'s an internal reality that only you can know. Science supports the existence and validity of transgender identities.' 
        },
        { 
          title: 'Coming out is ongoing', 
          explanation: 'You don\'t come out once. You come out again and again - to new friends, new jobs, new doctors, new situations. Each time requires assessing safety and energy.' 
        },
        { 
          title: 'Grief is part of transition', 
          explanation: 'Even positive change involves loss - loss of relationships that couldn\'t adapt, loss of the life you might have had, loss of safety or privilege. This grief is valid alongside the joy.' 
        },
        { 
          title: 'Not everyone will understand', 
          explanation: 'Some people will never fully get it. You can\'t educate everyone. Protecting your energy sometimes means accepting that some people will stay ignorant.' 
        },
        {
          title: 'Community is essential',
          explanation: 'Finding other trans and gender-diverse people - online or in person - provides validation, practical knowledge, and the relief of being understood without explanation.'
        }
      ],
      whatHelps: [
        'Connect with trans community (online spaces, support groups, chosen family)',
        'Find trans-affirming healthcare providers (WPATH guidelines)',
        'Set boundaries with people who refuse to respect your identity',
        'Document your journey if helpful (some find this affirming)',
        'Move at your own pace - there\'s no timeline for transition',
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
  {
    id: 'hm-rel-attachment-styles',
    title: 'Attachment Styles Deep Dive',
    category: 'relationships',
    duration: 10,
    emoji: '🔗',
    content: {
      introduction: `Your attachment style is the operating system running beneath all your relationships. Developed in the first years of life based on how your caregivers responded to your needs, it shapes how you experience intimacy, handle conflict, and interpret your partner's behavior. Understanding it is like finally reading the manual for your relationship brain.

There are four main attachment styles: Secure attachment develops when caregivers were consistently responsive and attuned - you learned that your needs matter and others can be trusted. Anxious attachment forms when caregiving was inconsistent - sometimes responsive, sometimes not - creating hypervigilance about the relationship and fear of abandonment. Avoidant attachment develops when emotional needs were dismissed or punished - you learned to suppress needs and maintain distance. Disorganized attachment emerges from frightening or abusive caregiving - the person who was supposed to be your safe haven was also your source of fear, creating a \"come here, go away\" pattern.

Your attachment style isn't your destiny. Research by Dr. Sue Johnson and others shows that attachment can change through corrective emotional experiences - either in therapy or in relationships with securely attached partners. The brain that learned insecure patterns can learn new ones. But first, you have to see the pattern.

About 50% of the population is securely attached. The rest are split between anxious, avoidant, and disorganized. If you're reading this, you're probably trying to understand your own patterns. That awareness itself is the first step toward change.`,
      keyInsights: [
        { 
          title: 'Secure attachment: the gold standard', 
          explanation: 'Securely attached people are comfortable with intimacy and independence. They communicate needs directly, handle conflict constructively, and trust that the relationship can survive disagreement. They\'re not perfect - they just have a fundamental belief that they\'re worthy of love and others can be relied upon.' 
        },
        { 
          title: 'Anxious attachment: the pursuit of closeness', 
          explanation: 'Anxiously attached people crave intimacy but fear abandonment. They\'re hypervigilant to signs of rejection, may become preoccupied with the relationship, need frequent reassurance, and can appear "needy" or "clingy." Their nervous system is constantly scanning for threats to the connection.' 
        },
        { 
          title: 'Avoidant attachment: the fortress of independence', 
          explanation: 'Avoidantly attached people value independence over intimacy. They suppress emotional needs, pull away when things get close, may feel "suffocated" by partners, and often don\'t understand why others need so much connection. They learned early that depending on others leads to disappointment.' 
        },
        { 
          title: 'Disorganized attachment: the impossible bind', 
          explanation: 'Disorganized attachment combines anxious and avoidant patterns chaotically. These individuals want closeness but fear it, approach intimacy then flee, and may have contradictory behaviors that confuse partners and themselves. Often rooted in early trauma where caregivers were both the source of comfort and fear.' 
        },
        {
          title: 'Attachment can change',
          explanation: 'While patterns are ingrained, they\'re not permanent. "Earned secure" attachment - developing security through therapy, self-work, or relationships with secure partners - is well-documented. It requires awareness, consistent effort, and often professional support.'
        }
      ],
      whatHelps: [
        'Identify your attachment style through reflection, quizzes, or therapy',
        'Learn your triggers - what activates your attachment fears?',
        'Communicate your needs explicitly rather than expecting partners to read your mind',
        'Notice when you\'re reacting from old patterns vs. present reality',
        'Seek out secure relationships (romantic and platonic) as corrective experiences',
        'Consider attachment-focused therapy (EFT, AEDP) if patterns are causing significant problems',
      ],
      professionalNote: 'Emotionally Focused Therapy (EFT), developed by Dr. Sue Johnson, is specifically designed to address attachment wounds in relationships. For individual work, AEDP and other attachment-focused approaches can help.'
    },
    reflectionQuestions: [
      'What was the emotional climate of your childhood home? How did caregivers respond when you were upset or needy?',
      'Which attachment style resonates most with your experience in romantic relationships?',
      'What would it look like to respond from secure attachment instead of your default pattern?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-rel-anxious-avoidant', 'hm-rel-emotional-unavailability'],
  },
  {
    id: 'hm-rel-anxious-avoidant',
    title: 'The Anxious-Avoidant Trap',
    category: 'relationships',
    duration: 9,
    emoji: '🎭",
    content: {
      introduction: `It's almost magnetic: the anxiously attached person who craves closeness pairs with the avoidantly attached person who needs space. This isn't coincidence - it's a trap built from complementary wounds that initially feel like perfect fit but become exhausting cycles of pursuit and withdrawal.

The dynamic works like this: The anxious partner seeks reassurance and connection. The avoidant partner, feeling pressured, withdraws. The withdrawal activates the anxious partner's abandonment fears, intensifying pursuit. This intensified pursuit triggers the avoidant partner's suffocation fears, deepening withdrawal. Each person's coping strategy triggers the other's wound. Both feel terrible. Neither feels heard. The relationship becomes a painful dance that neither consciously chose.

What makes this pairing so common? Anxious and avoidant partners each validate the other's worldview. The avoidant's distance confirms the anxious partner's belief that they're too much and will be abandoned. The anxious partner's pursuit confirms the avoidant's belief that intimacy is overwhelming and people are too needy. Both get to be "right" about relationships - and miserable.

Breaking this cycle requires both partners to recognize their part. The anxious partner must learn to self-soothe and tolerate uncertainty without pursuing. The avoidant partner must learn to move toward connection even when uncomfortable. Both must understand that their instincts are relics of childhood that no longer serve them.`,
      keyInsights: [
        { 
          title: 'The protest behavior trap', 
          explanation: 'Anxious partners often engage in "protest behaviors" - excessive texting, accusations, threats to leave - hoping to get a response and reassurance. These behaviors consistently backfire with avoidant partners, pushing them further away. What feels like reaching out feels like attack to the other person.' 
        },
        { 
          title: 'Deactivation as protection', 
          explanation: 'Avoidant partners "deactivate" their attachment system by focusing on partner flaws, emphasizing independence, or numbing emotions. This isn\'t manipulation - it\'s their nervous system\'s learned way of managing overwhelm. Understanding this doesn\'t make it okay, but it makes it comprehensible.' 
        },
        { 
          title: 'Both feel like the victim', 
          explanation: 'The anxious partner feels abandoned and desperate. The avoidant partner feels suffocated and trapped. Both believe they\'re responding reasonably to an unreasonable partner. In truth, both are acting out childhood programming.' 
        },
        { 
          title: 'The fantasy bond', 
          explanation: 'Sometimes this dynamic stabilizes into a "fantasy bond" - the illusion of connection without real intimacy. The couple maintains the form of a relationship while both remain protected behind their defenses. It looks like a relationship from outside but feels hollow inside.' 
        },
      ],
      whatHelps: [
        'Name the cycle: "We\'re doing the thing again - I\'m pursuing, you\'re withdrawing"',
        'Anxious partner: practice self-soothing before reaching out; ask yourself "is this really about right now?"',
        'Avoidant partner: practice staying present even when uncomfortable; notice the urge to flee',
        'Communicate about attachment needs directly: "I need reassurance" or "I need space"',
        'Set time-limited space: "I need an hour" is better than indefinite withdrawal',
        'Consider couples therapy with an EFT-trained therapist who understands this dynamic',
      ],
    },
    reflectionQuestions: [
      'In your relationships, are you usually the pursuer or the withdrawer?',
      'What childhood experience taught you this pattern? What were you protecting yourself from?',
      'What would happen if you did the opposite of your instinct during conflict?',
    ],
    relatedLessons: ['hm-rel-attachment-styles', 'hm-rel-stonewalling', 'hm-rel-healthy-conflict'],
  },
  {
    id: 'hm-rel-emotional-unavailability',
    title: 'Emotional Unavailability',
    category: 'relationships',
    duration: 8,
    emoji: '🚪",
    content: {
      introduction: `Emotional unavailability is the inability or unwillingness to connect on an emotional level. It can show up as avoiding deep conversations, being physically present but emotionally absent, prioritizing everything over the relationship, or being unable to provide emotional support. And the hardest truth: sometimes the emotionally unavailable person is you.

Recognizing emotional unavailability in a partner is painful. You're in a relationship but feel alone. You share a life but not your inner worlds. You've tried everything to reach them - being patient, being demanding, being perfect, being less - and nothing works. Because you can't create emotional availability in another person. They have to develop it themselves.

Recognizing emotional unavailability in yourself is harder. Maybe you're proud of being \"low-maintenance\" and \"not needy.\" Maybe intimacy makes you uncomfortable but you don't know why. Maybe you've been told by multiple partners that you're distant, walled-off, or hard to reach. These patterns usually trace back to early experiences where emotional openness wasn't safe.

Emotional availability is a skill that can be developed, but only by the person who's unavailable. If you're with someone emotionally unavailable, you can't fix them. If you're the unavailable one, you can do the work - but only if you genuinely want to, not just to keep a partner from leaving.`,
      keyInsights: [
        { 
          title: 'Signs of emotional unavailability', 
          explanation: 'Difficulty discussing feelings, deflecting with humor or logic, being secretive about inner life, avoiding commitment, prioritizing work/hobbies over connection, being present only when it\'s easy, shutting down during conflict. The common thread: intimacy is kept at arm\'s length.' 
        },
        { 
          title: 'Emotional unavailability as protection', 
          explanation: 'Most emotionally unavailable people aren\'t intentionally withholding - they\'re protecting themselves from vulnerability that felt dangerous earlier in life. Understanding this doesn\'t excuse the impact, but it explains the mechanism.' 
        },
        { 
          title: 'You can\'t love someone into availability', 
          explanation: 'One of the most painful truths: your love, patience, and understanding cannot make someone emotionally available. You can create conditions that support their growth, but they have to choose to grow.' 
        },
        { 
          title: 'Choosing unavailable partners is a pattern', 
          explanation: 'If you repeatedly end up with emotionally unavailable people, examine why. Sometimes it\'s because available intimacy feels scary, and unavailable partners are "safe." Sometimes it\'s reenacting childhood dynamics. The pattern is worth exploring.' 
        },
      ],
      whatHelps: [
        'If your partner is unavailable: decide what you can actually accept vs. what you\'re hoping will change',
        'If you\'re unavailable: therapy to explore the roots of your protective distance',
        'Practice small vulnerabilities - sharing feelings in low-stakes moments',
        'Notice what happens in your body when intimacy approaches - that\'s data',
        'Be honest about what you can offer rather than making promises you can\'t keep',
        'Recognize that availability requires ongoing practice, not a one-time decision',
      ],
    },
    reflectionQuestions: [
      'In your closest relationships, who pursues emotional connection more?',
      'What happens inside you when someone wants to get emotionally close?',
      'If you\'ve dated emotionally unavailable people repeatedly, what might be drawing you to them?',
    ],
    relatedLessons: ['hm-rel-attachment-styles', 'hm-rel-toxic-patterns', 'hm-rel-when-to-leave'],
  },
  {
    id: 'hm-rel-love-bombing',
    title: 'Love Bombing & Idealization',
    category: 'relationships',
    duration: 7,
    emoji: '💐",
    content: {
      introduction: `In the beginning, it feels like a dream. Constant attention, overwhelming affection, declarations of love within weeks, making you feel like the most special person in the world. They \"just know\" you're the one. They've never felt this way before. It's intoxicating - and it's a red flag.

Love bombing is excessive attention and affection early in a relationship, often used (consciously or unconsciously) to fast-forward intimacy and create emotional dependence before you've had time to truly know each other. It feels like being chosen, but it's actually being captured. The intensity isn't about you - it's about their need to secure attachment quickly.

The problem becomes clear later: the person who loved you intensely often becomes the person who devalues you just as intensely. The pedestals built during idealization inevitably crumble. No human can sustain the projected perfection, and the fall is devastating. This cycle of idealize-devalue-discard is particularly associated with narcissistic relationship patterns.

Normal healthy love builds gradually. It includes curiosity about who you actually are (not just projections), respect for boundaries and pacing, and room for you to be a complex human with flaws. It might feel less exciting than being love bombed - but it's sustainable.`,
      keyInsights: [
        { 
          title: 'Intensity isn\'t intimacy', 
          explanation: 'True intimacy develops over time through shared experiences, demonstrated reliability, and gradually increasing vulnerability. Intensity is a feeling that can be manufactured quickly. They\'re not the same thing.' 
        },
        { 
          title: 'Watch for boundary disregard', 
          explanation: 'Love bombers often push past boundaries early: wanting constant contact, moving too fast, being hurt by your need for space. What feels like passion is actually a warning sign about their ability to respect your autonomy.' 
        },
        { 
          title: 'The idealization must end', 
          explanation: 'No one can maintain perfection. When the love bomber realizes you\'re a normal human with flaws, the devaluation often begins. The same intensity that elevated you can be turned against you.' 
        },
        { 
          title: 'Your vulnerability to love bombing', 
          explanation: 'If you\'ve been lonely, have low self-worth, or are recovering from rejection, love bombing is especially seductive. Knowing your vulnerable states helps you recognize when you\'re being manipulated.' 
        },
      ],
      whatHelps: [
        'Pace the relationship - resist pressure to accelerate commitment',
        'Notice how they respond to "no" or "slow down" - healthy people respect boundaries',
        'Watch for a pattern: are they this intense with everything? Do they have stable long-term relationships?',
        'Ask yourself: do they actually know me, or are they in love with who they want me to be?',
        'Trust the people in your life who express concern - outside perspective matters',
        'Remember: sustainable love doesn\'t need to rush',
      ],
      warningSign: 'If you\'ve experienced the idealize-devalue-discard cycle repeatedly with this person, and they promise change but the pattern continues, you may be dealing with narcissistic abuse. Consider consulting with a therapist who specializes in these dynamics.'
    },
    reflectionQuestions: [
      'Looking back, can you identify times you were love bombed? What made you vulnerable to it?',
      'How do you typically respond to intense early attention from someone new?',
      'What would healthy pacing look like for you in a new relationship?',
    ],
    relatedLessons: ['hm-rel-toxic-patterns', 'hm-rel-boundaries-protect', 'hm-rel-when-to-leave'],
  },
  {
    id: 'hm-rel-healthy-conflict',
    title: 'Healthy Conflict: How Secure Couples Fight',
    category: 'relationships',
    duration: 8,
    emoji: '⚖️",
    content: {
      introduction: `Conflict is inevitable in intimate relationships. The question isn't whether you'll disagree - it's how you'll handle it. Dr. John Gottman's research, spanning decades and thousands of couples, shows that the difference between couples who thrive and those who divorce isn't the amount of conflict - it's how they fight.

Healthy conflict has a pattern: soft startup, accepting influence, repair attempts, and compromise. Toxic conflict has a different pattern: harsh startup, defensiveness, contempt, and stonewalling. The first predicts relationship success. The second predicts divorce with over 90% accuracy.

Secure couples fight about the same things everyone fights about: money, sex, chores, in-laws, parenting. But they do it differently. They start gently instead of attacking. They take responsibility instead of deflecting. They de-escalate when things get heated. They prioritize the relationship over winning the argument. And crucially: they repair quickly after ruptures.

Learning to fight well is a skill. Most of us were never taught - we just absorbed whatever our parents modeled. The good news: these are learnable patterns. The bad news: they require both partners to be willing to learn.`,
      keyInsights: [
        { 
          title: "The soft startup', 
          explanation: 'How you bring up an issue predicts how the conversation will go. "I feel overwhelmed with the dishes" lands differently than "You never help around here." Starting gentle - with "I" statements, without blame - sets up repair rather than escalation.' 
        },
        { 
          title: 'Accepting influence', 
          explanation: 'Secure partners can be influenced by each other. They hear complaints without becoming defensive. They consider their partner\'s perspective as valid. Refusing to accept influence - always needing to be right - is toxic to relationships.' 
        },
        { 
          title: 'Repair attempts', 
          explanation: 'These are any attempts to de-escalate during conflict: humor, affection, apology, taking a break. Research shows successful couples make and accept repair attempts. Failed couples miss them or reject them.' 
        },
        { 
          title: 'The 5:1 ratio', 
          explanation: 'Gottman\'s research found stable couples have at least 5 positive interactions for every negative one during conflict. This doesn\'t mean avoiding hard conversations - it means maintaining a foundation of positivity that can absorb occasional friction.' 
        },
        {
          title: 'Physiological flooding',
          explanation: 'When heart rate exceeds ~100 BPM during conflict, productive conversation becomes impossible. The brain shifts to fight-or-flight. Secure couples recognize flooding and take breaks - returning when calm, not avoiding the issue.'
        }
      ],
      whatHelps: [
        'Start with how you feel and what you need, not with accusations',
        'Take a 20-minute break when flooded - but commit to returning to the conversation',
        'Look for the valid point in your partner\'s complaint, even if delivery was poor',
        'Make repair attempts: "Can we start over?" "I know we\'re on the same team"',
        'Accept influence: being persuaded isn\'t losing, it\'s collaborating',
        'Apologize for your part, even if they were also wrong',
      ],
      professionalNote: 'Gottman Method Couples Therapy is specifically designed to replace toxic patterns with healthy ones. If you recognize destructive patterns in your conflicts, a trained therapist can help.'
    },
    reflectionQuestions: [
      'What did conflict look like in your family growing up? What patterns did you absorb?',
      'When you\'re in conflict with your partner, what\'s your usual pattern - attack, withdraw, or something else?',
      'What repair attempts might your partner be making that you\'re not recognizing?',
    ],
    relatedLessons: ['hm-rel-stonewalling', 'hm-rel-contempt', 'hm-rel-anxious-avoidant'],
  },
  {
    id: 'hm-rel-stonewalling',
    title: 'Stonewalling & Shutting Down',
    category: 'relationships',
    duration: 7,
    emoji: '🧱",
    content: {
      introduction: `They go silent. They won't look at you. They leave the room. They give one-word answers. You're trying to talk about something important, and they've turned to stone. This is stonewalling - one of the \"Four Horsemen\" that predict relationship failure - and it's devastating to be on the receiving end.

But here's what the stonewaller is experiencing: flooding. Their heart rate has exceeded 100 beats per minute, stress hormones are coursing through their system, and their capacity for productive conversation has shut down. They're not choosing to be cruel - they're physiologically overwhelmed and their nervous system has hit the emergency brake.

This doesn't excuse stonewalling, but it explains it. The stonewaller isn't consciously thinking \"I'll hurt them by ignoring them.\" They're thinking - or more accurately, not thinking clearly at all - something like "I can't handle this, I need out.\" Their withdrawal feels like self-protection to them, even as it feels like abandonment to you.

The solution isn't for the stonewaller to \"just stay and talk\" - that's often impossible when flooded. It's for both partners to recognize when flooding is happening, take a structured break, and return to the conversation when both nervous systems have calmed down. Stonewalling only becomes toxic when the conversation never resumes.`,
      keyInsights: [
        { 
          title: 'Flooding vs. choosing to stonewall', 
          explanation: 'True stonewalling usually involves physiological flooding - the person literally cannot process language well or regulate emotions. This is different from deliberately withholding as punishment, though both feel similar to the other partner.' 
        },
        { 
          title: 'The partner\'s experience', 
          explanation: 'Being stonewalled activates abandonment fears. It feels like being deemed unworthy of response, invisible, and alone in the relationship. The pursuer often escalates, which increases the stonewaller\'s flooding. It\'s a terrible cycle.' 
        },
        { 
          title: 'Gender patterns', 
          explanation: 'Research shows men are more likely to stonewall, possibly due to physiological differences in how they experience flooding. This isn\'t an excuse - it\'s information that can help both partners understand what\'s happening.' 
        },
        { 
          title: 'The break that works', 
          explanation: 'An effective break is structured: "I\'m flooded and need 30 minutes. I\'m not abandoning this conversation - I\'ll be back." Then actually coming back. Unstructured withdrawal ("I\'m done talking") damages trust.' 
        },
      ],
      whatHelps: [
        'If you stonewall: learn to recognize flooding early and call a structured timeout before you shut down',
        'If you\'re stonewalled: recognize this as flooding, not rejection - and don\'t pursue harder',
        'Agree on a signal for "I\'m flooded and need a break" before conflicts happen',
        'During breaks: do something self-soothing (walk, music, breathing) - don\'t rehearse arguments',
        'Set a specific time to return: "Let\'s come back to this in an hour"',
        'When you return, start gently - both people\'s nervous systems are still tender',
      ],
    },
    reflectionQuestions: [
      'Do you tend to stonewall, or are you usually the one being stonewalled?',
      'What happens in your body when conflict escalates? Can you identify the moment before shutdown?',
      'What would a healthy break look like for you and your partner?',
    ],
    relatedLessons: ['hm-rel-healthy-conflict', 'hm-rel-contempt', 'hm-rel-anxious-avoidant'],
  },
  {
    id: 'hm-rel-contempt',
    title: 'Contempt: The Relationship Killer',
    category: 'relationships',
    duration: 7,
    emoji: '🗡️",
    content: {
      introduction: `Of all the toxic relationship patterns, contempt is the most destructive. It's the single greatest predictor of divorce. It's eye-rolls and sneers, mockery and ridicule, name-calling and hostile humor. It's not just being angry at something your partner did - it's communicating disgust at who they are.

Contempt comes from a position of superiority. It says: \"You're beneath me. You're stupid, worthless, incompetent.\" It might be obvious (\"You're such an idiot\") or subtle (sighing heavily, mimicking mockingly). Either way, it treats your partner not as someone you disagree with, but as someone deserving of scorn.

Dr. Gottman's research shows that couples with high levels of contempt have worse physical health outcomes - including weakened immune systems. Contempt literally makes you sick, on top of destroying your relationship.

The antidote to contempt is building a culture of appreciation. This doesn't mean ignoring problems - it means approaching your partner's flaws from a place of understanding rather than superiority, and actively nurturing respect even during disagreement. If contempt has become your norm, the relationship needs immediate intervention.`,
      keyInsights: [
        { 
          title: 'Contempt vs. criticism', 
          explanation: 'Criticism attacks behavior: "You forgot to take out the trash again." Contempt attacks character: "You\'re so lazy and thoughtless, I can\'t believe I married you." The second is far more damaging because it denies the person\'s worth.' 
        },
        { 
          title: 'Contempt poisons the container', 
          explanation: 'Relationships need a foundation of mutual respect to handle conflict. Contempt destroys that foundation. Once contempt is present, even neutral interactions get filtered through disgust.' 
        },
        { 
          title: 'The breeding ground', 
          explanation: 'Contempt grows from long-standing, unresolved negative thoughts about your partner. If you\'ve been cataloging their failures and building a case against them, contempt is the eventual expression.' 
        },
        { 
          title: 'It affects the contemptuous person too', 
          explanation: 'Being contemptuous doesn\'t just hurt your partner - it corrodes your own wellbeing. Living in a state of disgust toward someone you share life with is exhausting and isolating.' 
        },
      ],
      whatHelps: [
        'Build culture of appreciation: express genuine gratitude and admiration regularly',
        'Catch contemptuous thoughts and challenge them: is this the whole picture?',
        'Address issues when they\'re small, before resentment builds into contempt',
        'Remember their humanity - they\'re struggling too, not your enemy',
        'If contempt is established, get professional help immediately - this is a relationship emergency',
        'Consider whether the contempt reveals that the relationship should end',
      ],
      warningSign: 'If contempt has become your baseline way of relating to your partner - or theirs toward you - the relationship is in crisis. This requires immediate professional intervention or a serious conversation about whether to continue.'
    },
    reflectionQuestions: [
      'Have you experienced contempt in your relationship - giving or receiving?',
      'What unresolved resentments might be building toward contempt?',
      'What do you genuinely appreciate about your partner that you haven\'t expressed lately?',
    ],
    relatedLessons: ['hm-rel-healthy-conflict', 'hm-rel-stonewalling', 'hm-rel-when-to-leave'],
  },
  {
    id: 'hm-rel-rebuilding-trust',
    title: 'Rebuilding Trust After Betrayal',
    category: 'relationships',
    duration: 10,
    emoji: '🔨",
    content: {
      introduction: `Trust is like a bone: it can heal after being broken, but it takes time, proper care, and it's never quite the same. Rebuilding trust after betrayal - whether from an affair, lies, or other violations - is one of the hardest things a couple can do. It's not impossible, but it requires both people fully committed to a long, painful process.

The betrayed partner didn't choose this. They're now expected to do the hard work of healing from something that was done to them. This is profoundly unfair. The betraying partner may be eager to \"move on\" while the betrayed is still processing. Understanding that recovery takes years, not months, is essential.

True reconciliation requires the betraying partner to tolerate the betrayed partner's pain without defensiveness - for a long time. It requires full honesty about what happened (trickle truth extends trauma). It requires demonstrated change, not just promises. And it requires the betrayed partner to eventually make the choice to trust again, knowing that trust can never be fully guaranteed.

Some relationships don't survive betrayal, and that's okay. Choosing not to reconcile is valid. But for those who choose to try, research shows many couples emerge with relationships that are different but can be deeply satisfying.`,
      keyInsights: [
        { 
          title: "Full disclosure is essential', 
          explanation: 'Research by Dr. Shirley Glass and others shows that trickle truth - revealing information bit by bit - prolongs trauma. Full, honest disclosure (ideally with a therapist\'s guidance) is the foundation of rebuilding.' 
        },
        { 
          title: 'Healing isn\'t linear', 
          explanation: 'Good days don\'t mean it\'s over. Bad days don\'t mean no progress. The betrayed partner will have triggers for years. The betraying partner must understand that this is the cost of betrayal, not unreasonable behavior.' 
        },
        { 
          title: 'The relationship doesn\'t go back', 
          explanation: 'You\'re not returning to the old relationship - it\'s gone. You\'re building a new one between the same people. This new relationship can be good, but it will never be the same as before.' 
        },
        { 
          title: 'Accountability vs. endless punishment', 
          explanation: 'The betraying partner must be accountable - but that\'s different from being punished indefinitely. At some point, if true accountability has been demonstrated, the betrayed partner must choose whether to stay and genuinely try to rebuild, or leave.' 
        },
        {
          title: 'Trust is rebuilt through behavior, not words',
          explanation: 'Promises mean nothing. Transparency, consistency, and demonstrated change over time are what rebuild trust. The betraying partner must be willing to be radically transparent for however long it takes.'
        }
      ],
      whatHelps: [
        'Work with a therapist specializing in affair recovery or betrayal trauma',
        'Full disclosure with professional guidance on how to do it well',
        'Betraying partner: tolerate partner\'s pain without defensiveness; show consistency over time',
        'Betrayed partner: be honest about what you need; allow yourself to feel everything',
        'Set realistic timelines - this is a 2-5 year process minimum',
        'Regularly check in about the process itself - how is the rebuilding going?',
      ],
      professionalNote: 'Affair recovery specialists and therapists trained in betrayal trauma can guide this process. DIY often fails because the emotions are too intense to navigate without support.'
    },
    reflectionQuestions: [
      'If you\'ve been betrayed: what would you need to see to begin trusting again?',
      'If you betrayed: can you genuinely commit to the long accountability process this requires?',
      'What would the new relationship - different from the old one - need to include?',
    ],
    relatedLessons: ['hm-rel-affairs-betrayal', 'hm-rel-when-to-leave', 'hm-rel-healthy-conflict'],
  },
  {
    id: 'hm-rel-emotional-physical-intimacy',
    title: 'Emotional vs Physical Intimacy',
    category: 'relationships',
    duration: 7,
    emoji: '💞",
    content: {
      introduction: `Emotional intimacy and physical intimacy are two different needs that often get confused. You can have one without the other. You can crave one and fear the other. Many relationship struggles stem from partners having different relationships to each type - or not realizing they're even different things.

Emotional intimacy is the experience of being fully known and accepted. It's sharing your inner world - fears, dreams, wounds, joys - and having someone receive that with care. It develops through conversation, time, and consistent emotional availability. For many people, emotional intimacy must come before physical intimacy feels safe or meaningful.

Physical intimacy is connection through the body. Sex is part of it, but not all of it - touch, affection, physical presence, and sexual connection all contribute. Some people feel most connected through physical intimacy; for them, it's their primary language of love and a precondition for emotional openness.

Problems arise when partners have different needs or different orders of operation. "I need emotional connection before I want sex" meets "I feel emotionally connected through sex." Neither is wrong, but without understanding, both feel rejected. The work is translating between these languages.`,
      keyInsights: [
        { 
          title: 'Different access points to the same place', 
          explanation: 'Some people need emotional safety before physical connection feels good. Others feel emotionally close through physical touch. Neither path is better - they\'re different wiring.' 
        },
        { 
          title: 'The rejection loop', 
          explanation: 'One partner needs emotional connection first, so they pull back physically. The other needs physical connection first, so they feel rejected and emotionally withdraw. Both end up starving.' 
        },
        { 
          title: 'Intimacy isn\'t just sex', 
          explanation: 'Physical intimacy includes non-sexual touch: holding hands, hugs, cuddling, physical affection. Some couples lose all physical connection when sex becomes fraught. Rebuilding non-sexual touch can help.' 
        },
        { 
          title: 'Both needs are valid', 
          explanation: 'The partner who needs emotional connection isn\'t being withholding. The partner who needs physical connection isn\'t being shallow. Framing either need as inferior damages the relationship.' 
        },
      ],
      whatHelps: [
        'Communicate explicitly about what makes you feel connected - don\'t assume they know',
        'Identify your access point: do you need to feel emotionally close before physical intimacy? Or vice versa?',
        'If you\'re in the rejection loop: the solution is going first in your partner\'s language, not demanding they go first in yours',
        'Rebuild non-sexual physical affection if it\'s been lost',
        'Address underlying issues (resentment, trauma, medical factors) that may be blocking intimacy',
        'Consider sex therapy for deeper disconnects',
      ],
    },
    reflectionQuestions: [
      'What makes you feel genuinely intimate with someone - emotional sharing, physical touch, or both equally?',
      'In your relationship, who needs what first? How does this create friction?',
      'What forms of physical intimacy besides sex feel connecting to you?',
    ],
    relatedLessons: ['hm-rel-libido-differences', 'hm-rel-attachment-styles', 'hm-rel-emotional-unavailability'],
  },
  {
    id: 'hm-rel-libido-differences',
    title: 'Desire Differences: When Partners Don\'t Match',
    category: 'relationships',
    duration: 8,
    emoji: '🔥",
    content: {
      introduction: `In almost every long-term relationship, there's a higher-desire partner and a lower-desire partner. This is normal. The problem isn't that desire differs - it's how couples handle the difference. When managed poorly, desire discrepancy leads to one partner feeling rejected and undesirable while the other feels pressured and inadequate. Both suffer.

Desire is complex and influenced by many factors: hormones, stress, relationship satisfaction, individual sexuality, life stage, medication, health, and more. Labeling the lower-desire partner as \"the problem\" misses this complexity - and usually makes things worse by adding shame to already challenged intimacy.

Researcher Emily Nagoski distinguishes between \"spontaneous\" desire (desire that arises out of nowhere) and \"responsive\" desire (desire that emerges in response to arousal). Many people, especially women, have primarily responsive desire - they don't feel sexual until something gets them started. This isn't low desire; it's a different pathway to desire that requires different conditions.

Working with desire differences requires both partners to take responsibility: the higher-desire partner for creating conditions that nurture their partner's desire rather than pressuring, and the lower-desire partner for actively engaging with their own sexuality rather than avoiding it entirely.`,
      keyInsights: [
        { 
          title: 'Context matters enormously', 
          explanation: 'Stress, exhaustion, relationship resentment, body image issues, and feeling unsexy all suppress desire. Addressing these contexts often matters more than any sexual technique.' 
        },
        { 
          title: 'Responsive vs. spontaneous desire', 
          explanation: 'If you rarely feel randomly horny but can get into it once things start, you likely have responsive desire. This is normal, not broken. Your partner needs to understand this isn\'t rejection.' 
        },
        { 
          title: 'Pressure kills desire', 
          explanation: 'The more the higher-desire partner pressures, criticizes, or pouts, the more the lower-desire partner\'s sexuality shuts down. Feeling obligated to have sex is the opposite of desiring it.' 
        },
        { 
          title: 'Both partners need to stretch', 
          explanation: 'The higher-desire partner must learn to tolerate not getting sex every time they want it. The lower-desire partner must actively engage with their sexuality rather than hoping the issue disappears.' 
        },
      ],
      whatHelps: [
        'Remove pressure and obligation - these are desire killers',
        'Address contextual factors (stress, resentment, exhaustion) that suppress desire',
        'If you have responsive desire: create conditions for it to emerge (what turns you ON?)',
        'Schedule intimacy - sounds unromantic, but anticipation can build desire',
        'Expand definition of sex beyond penetration - what kinds of physical intimacy work for both?',
        'Consider sex therapy if stuck - this is a common specialty with good results',
      ],
      professionalNote: 'Sex therapists (look for AASECT certification) specialize in desire discrepancy and can help couples navigate these issues without shame.'
    },
    reflectionQuestions: [
      'In your relationship, who has higher desire? How has this difference been handled?',
      'What context do you need to feel desire? What shuts it down?',
      'What beliefs about sex and desire might be getting in the way?',
    ],
    relatedLessons: ['hm-rel-emotional-physical-intimacy', 'hm-rel-porn-intimacy', 'hm-body-chronic'],
  },
  {
    id: 'hm-rel-porn-intimacy',
    title: 'Porn & Intimacy: The Complicated Impact',
    category: 'relationships',
    duration: 8,
    emoji: '📱",
    content: {
      introduction: `Pornography is the elephant in many bedrooms. Some couples watch it together with no issues. Others are destroyed by it. Some individuals use it casually; others feel enslaved by it. The research is contested, the cultural narratives are polarized, and the truth is: it's complicated.

Potential issues with porn are real: it can create unrealistic expectations about sex, contribute to erectile dysfunction in young men (porn-induced ED), reduce desire for real partners, and become compulsive in ways that feel like addiction. For some, it represents betrayal; for others, it's a healthy outlet. Context and use patterns matter enormously.

At the same time, catastrophizing about porn isn't helpful either. Occasional use doesn't automatically mean addiction. Masturbation is normal. And shame-based approaches tend to make compulsive use worse, not better. The question isn't "is porn good or bad" - it's "what role is it playing in this specific person's life and this specific relationship?\"

If porn is causing problems - impacting your relationship, escalating to concerning content, feeling out of control - it's worth addressing. If both partners are comfortable with how it's used and it's not interfering with real intimacy, moral panic isn't necessary. Honest conversation between partners is essential.`,
      keyInsights: [
        { 
          title: "Impact varies widely', 
          explanation: 'For some, porn enhances their sex life. For others, it replaces it. For some, it\'s casual entertainment. For others, it becomes compulsive. Individual differences, relationship context, and use patterns all matter.' 
        },
        { 
          title: 'Porn-induced sexual dysfunction', 
          explanation: 'Some heavy porn users develop erectile dysfunction with partners while functioning fine with porn. This appears related to the dopamine conditioning of porn use. Recovery often requires extended abstinence from porn.' 
        },
        { 
          title: 'The comparison problem', 
          explanation: 'Porn creates impossible standards for bodies and performance. Partners can feel inadequate competing with an endless stream of performed perfection. This affects both men and women in different ways.' 
        },
        { 
          title: 'Secrecy is often the biggest problem', 
          explanation: 'Sometimes the issue isn\'t the porn itself - it\'s the secrecy. Hidden sexual behavior creates a wall between partners. Whatever the content, honesty matters.' 
        },
        {
          title: 'Escalation can be concerning',
          explanation: 'Needing more extreme content to get the same response may indicate problematic use patterns. This doesn\'t happen to everyone, but it\'s worth noticing.'
        }
      ],
      whatHelps: [
        'Have honest conversations with your partner about porn - what\'s okay, what isn\'t?',
        'If use feels compulsive: consider a "reset" period without porn to see how it affects you',
        'Address underlying issues (loneliness, anxiety, boredom) that may drive compulsive use',
        'If porn-induced ED: abstinence from porn (not from partnered sex) often helps',
        'Avoid shame-based approaches - they tend to increase compulsive behavior',
        'Seek help from a sex therapist if porn is causing significant relationship or personal problems',
      ],
    },
    reflectionQuestions: [
      'What role does porn play in your life? Does it enhance or interfere with real intimacy?',
      'Have you had honest conversations with your partner about porn use?',
      'Do you feel in control of your porn use, or does it sometimes feel compulsive?',
    ],
    relatedLessons: ['hm-rel-libido-differences', 'hm-rel-emotional-physical-intimacy', 'hm-rel-affairs-betrayal'],
  },
  {
    id: 'hm-rel-polyamory',
    title: 'Polyamory & Non-Monogamy: Different Structures',
    category: 'relationships',
    duration: 8,
    emoji: '💜",
    content: {
      introduction: `Not all relationships are monogamous, and that doesn't make them less valid. Consensual non-monogamy - including polyamory, open relationships, and other structures - works well for some people and relationships. The key word is consensual: all involved parties know about and agree to the arrangement.

Polyamory specifically refers to having multiple romantic relationships simultaneously with the knowledge and consent of everyone involved. It's different from cheating (which involves deception) and different from casual non-monogamy (which may not involve emotional relationships). Other structures include open relationships (primary partnership with outside sexual connections), relationship anarchy (rejecting hierarchy in all relationships), and various other arrangements.

Common misconceptions: that poly people can't commit, that they're afraid of intimacy, that it's just an excuse to cheat, or that someone is always secretly jealous. Research shows that polyamorous relationships can be as satisfying and stable as monogamous ones - when they fit the people involved and are practiced ethically.

That said, non-monogamy isn't for everyone. It requires excellent communication, emotional regulation, and security. It's not a fix for relationship problems - it tends to amplify whatever dynamics already exist. And it takes significant time and energy to maintain multiple relationships well.`,
      keyInsights: [
        { 
          title: "Structure diversity', 
          explanation: 'Non-monogamy includes many structures: hierarchical polyamory (primary partner with secondaries), non-hierarchical polyamory, open relationships, swinging, relationship anarchy, and more. Different structures suit different people.' 
        },
        { 
          title: 'Jealousy exists but isn\'t fatal', 
          explanation: 'Poly people aren\'t immune to jealousy. They\'ve learned to work with it: communicate about it, examine what it\'s really about, and not treat it as a reason to control partners. Jealousy can even provide useful information.' 
        },
        { 
          title: 'Communication requirements are intense', 
          explanation: 'Ethical non-monogamy requires constant, clear communication about boundaries, feelings, needs, and schedules. Couples who can\'t talk openly won\'t survive it.' 
        },
        { 
          title: 'It\'s not an upgrade or downgrade', 
          explanation: 'Non-monogamy isn\'t morally superior or inferior to monogamy. It\'s a different relationship structure that suits some people better. Neither is more "evolved."' 
        },
      ],
      whatHelps: [
        'If curious: read extensively before acting (books like "The Ethical Slut," "Polysecure")',
        'If considering opening: get the primary relationship stable first - don\'t open to fix problems',
        'Communicate explicitly about boundaries, expectations, and agreements',
        'Expect that structure may need adjustment as you learn what actually works',
        'Find community - navigating non-monogamy without support is much harder',
        'If one partner wants non-monogamy and the other doesn\'t: this is a compatibility issue, not a negotiation',
      ],
      professionalNote: 'Therapists who are poly-friendly (look for listings on Psychology Today or Polyfriendly.org) can help navigate non-monogamy without pathologizing it.'
    },
    reflectionQuestions: [
      'What draws you to or away from non-monogamy? What fears or attractions arise?',
      'What would you need (from yourself and partners) to feel secure in a non-monogamous arrangement?',
      'If you\'re in a monogamous relationship and considering opening: is this about expansion or escape?',
    ],
    relatedLessons: ['hm-rel-attachment-styles', 'hm-rel-boundaries-protect', 'hm-rel-healthy-conflict'],
  },
  {
    id: 'hm-rel-long-distance',
    title: 'Long-Distance Relationships: Maintaining Connection',
    category: 'relationships',
    duration: 7,
    emoji: '🌍",
    content: {
      introduction: `Long-distance relationships get a bad reputation, but research shows they can be just as satisfying as geographically close ones - sometimes more so. What makes the difference isn't distance; it's how couples manage communication, trust, and the unique challenges distance creates.

LDR couples often develop stronger communication skills out of necessity. Without physical presence, you must articulate feelings and needs more explicitly. You can't rely on physical touch to smooth over conflicts or express love. This forced verbal intimacy can become a relationship strength.

The hardest parts: loneliness, jealousy, FOMO on each other's lives, lack of physical intimacy, and the uncertainty about when it will end. Distance is usually sustainable when there's a light at the end of the tunnel - a plan to eventually be together. Indefinite long-distance, with no end date, strains most relationships past their limits.

Making it work requires intentionality: scheduled communication that you both protect, visits that you prioritize, honest conversations about fears and needs, and creative ways to maintain connection across miles. It also requires trust - long-distance amplifies insecurity, and constant checking or jealousy will destroy it.`,
      keyInsights: [
        { 
          title: "Quality over quantity in communication', 
          explanation: 'Some LDR couples burn out on constant texting. What matters more is having meaningful conversations where you actually connect - not just checking in or performing availability.' 
        },
        { 
          title: 'You need an end date', 
          explanation: 'Most successful LDRs have a plan for eventually being in the same place. Open-ended distance - "maybe someday" - is very hard to sustain long-term.' 
        },
        { 
          title: 'Trust is non-negotiable', 
          explanation: 'You cannot verify what your partner is doing at all times. Requiring constant proof of fidelity or monitoring their activities will strangle the relationship. You either trust them or you don\'t.' 
        },
        { 
          title: 'Visits have a rhythm', 
          explanation: 'Many LDR couples notice a pattern: excitement before the visit, honeymoon period during, grief and adjustment after. Understanding this rhythm helps navigate the emotional rollercoaster.' 
        },
      ],
      whatHelps: [
        'Establish communication rhythms that work for both - and honor them',
        'Have an end-date conversation: when will you be in the same place, and how will you get there?',
        'Create shared experiences: watch movies "together," play games, have dinner over video',
        'Prioritize visits - they\'re not optional, they\'re relationship maintenance',
        'Talk about fears and jealousy rather than acting them out with controlling behavior',
        'Maintain your own life - being miserable until the next visit isn\'t sustainable',
      ],
    },
    reflectionQuestions: [
      'If you\'re in an LDR: what\'s your plan for eventually being together? If you don\'t have one, why not?',
      'What do you need from communication to feel connected across distance?',
      'What insecurities does distance activate for you, and how are you managing them?',
    ],
    relatedLessons: ['hm-rel-attachment-styles', 'hm-rel-emotional-unavailability', 'hm-rel-anxious-avoidant'],
  },
  {
    id: 'hm-rel-when-to-leave',
    title: 'When to Leave: Recognizing It\'s Over',
    category: 'relationships',
    duration: 9,
    emoji: '🚶",
    content: {
      introduction: `Knowing when to leave a relationship is one of the hardest calls in human experience. Stay too long and you waste years in misery. Leave too soon and you might abandon something that could have been repaired. There's no formula, but there are indicators worth examining.

Some things are clear: violence, abuse, chronic infidelity with no real accountability, addiction with no genuine recovery effort. These are reasons to leave regardless of love, history, or hope. Your safety and wellbeing are not negotiable.

The harder cases: relationships that aren't abusive but aren't good either. Chronic disconnection. Growing in different directions. Persistent unhappiness despite efforts. Incompatible visions for the future. The resentment that won't dissolve. These require honest assessment of whether the relationship is worth saving and whether both people are genuinely working to save it.

Staying for the wrong reasons - fear of being alone, guilt, financial dependence, the kids - creates its own suffering. So does leaving for the wrong reasons - conflict avoidance, grass-is-greener fantasy, or running from intimacy. The question is: given who you both are and where you're headed, is this relationship a yes, a no, or a maybe that deserves more effort?`,
      keyInsights: [
        { 
          title: 'Clear reasons to leave', 
          explanation: 'Physical violence, emotional abuse, active addiction without recovery, repeated betrayal without real change - these override everything else. No amount of love makes staying okay when your wellbeing is at stake.' 
        },
        { 
          title: 'The contempt signal', 
          explanation: 'If you feel contempt for your partner - not occasional frustration but pervasive disgust - this is a powerful signal. Contempt is very hard to come back from and predicts relationship failure.' 
        },
        { 
          title: 'Both must be willing', 
          explanation: 'Relationships can survive almost anything if both people are genuinely committed to repair. If only one person is working, it can\'t succeed. You can\'t save a relationship alone.' 
        },
        { 
          title: 'The grief of leaving vs. the grief of staying', 
          explanation: 'Both options involve grief. Leaving means grieving the loss of the relationship and the future you imagined. Staying means grieving the relationship you wished you had. Either way, there is grief.' 
        },
        {
          title: 'Your future self',
          explanation: 'Project yourself five years forward. If nothing changes, will you regret staying or leaving more? Sometimes imagining your future self clarifies the present choice.'
        }
      ],
      whatHelps: [
        'Get outside perspective - friends, therapist, someone who can see what you can\'t',
        'Write down what you\'ve tried and what results you\'ve seen - is effort being matched?',
        'Imagine your best friend describing this relationship - what would you tell them?',
        'Distinguish between normal relationship problems and fundamental incompatibility',
        'If considering leaving: can you identify what would need to change for you to stay? Is that realistic?',
        'If you\'ve already decided: start making practical plans while processing emotions',
      ],
      warningSign: 'If there is any physical violence or safety concern, please prioritize safety over relationship repair. The National Domestic Violence Hotline: 1-800-799-7233.'
    },
    reflectionQuestions: [
      'What would need to be true for you to stay? Is that genuinely possible?',
      'What are you most afraid of about leaving? Is that fear based on reality?',
      'If you imagine your life five years from now - staying vs. leaving - which version do you want?',
    ],
    relatedLessons: ['hm-rel-contempt', 'hm-rel-rebuilding-trust', 'hm-trans-divorce'],
  },
  {
    id: 'hm-rel-divorce-recovery',
    title: 'Divorce Recovery: Rebuilding After Ending',
    category: 'relationships',
    duration: 9,
    emoji: '🌱",
    content: {
      introduction: `Divorce or the end of a long-term relationship is one of the most stressful life events humans experience - ranking near death of a loved one. And yet, people are expected to keep functioning: show up at work, care for children, make major decisions about housing and finances. All while your heart is shattered and your identity is in flux.

The loss isn't just the person - it's the future you planned, the daily routines, the shared history, the identity of being part of a "we." You're grieving multiple losses simultaneously while being forced to build a new life structure. This is brutal, and there's no shortcut through it.

Recovery happens in stages, though not linearly. There's the acute crisis - the immediate aftermath with its shock, pain, and survival mode. Then the middle phase - where you're functioning but still processing, having good days and bad. Finally, integration - where the divorce becomes part of your story rather than the whole story, and you've built a life that feels genuinely yours.

The timeline is longer than you want. Research suggests 2-5 years for full adjustment. Rushing recovery, immediately dating to avoid pain, or refusing to grieve all extend the process rather than shortening it.`,
      keyInsights: [
        { 
          title: "Multiple losses compound', 
          explanation: 'You\'re not just losing a partner. You may be losing your home, daily contact with kids, financial security, mutual friends, a vision of your future. Each loss deserves acknowledgment.' 
        },
        { 
          title: 'Identity reconstruction takes time', 
          explanation: 'Who are you outside this relationship? That question can\'t be answered quickly. Give yourself time to figure out who you are now, not just who you were or who you were with them.' 
        },
        { 
          title: 'The urge to rush is common and counterproductive', 
          explanation: 'Jumping into a new relationship, making major life changes while in crisis, wanting to "just be over it" - these impulses are understandable but usually extend suffering rather than ending it.' 
        },
        { 
          title: 'Relief and grief coexist', 
          explanation: 'You can be glad the marriage ended AND grieving simultaneously. These aren\'t contradictory - they\'re the complexity of real life.' 
        },
        {
          title: 'Growth is possible but not guaranteed',
          explanation: 'Many people eventually report that divorce led to personal growth. But this isn\'t automatic - it comes from doing the work of processing, learning, and rebuilding intentionally.'
        }
      ],
      whatHelps: [
        'Allow the grief - fighting it extends it',
        'Build support: friends, family, therapist, divorce support groups',
        'Protect basics: sleep, food, movement, connection - even minimal versions',
        'Delay major decisions when possible - your judgment is compromised',
        'Resist rebound relationships - being alone with your feelings is part of healing',
        'Be patient - 2-5 years is normal, and rushing doesn\'t help',
        'Eventually: focus on who you want to become, not just who you lost',
      ],
      professionalNote: 'Divorce support groups and therapists specializing in divorce recovery can provide structured support during this transition. You don\'t have to navigate this alone.'
    },
    reflectionQuestions: [
      'What are all the losses you\'re grieving - not just the obvious ones?',
      'What do you need from others during this time that you haven\'t asked for?',
      'When you imagine who you want to be on the other side of this - who is that person?',
    ],
    relatedLessons: ['hm-trans-divorce', 'hm-trans-grief-all-kinds', 'hm-trans-starting-over'],
  },
  {
    id: 'hm-rel-narcissistic-parents',
    title: 'Narcissistic Parents: Growing Up Unseen',
    category: 'relationships',
    duration: 10,
    emoji: '🪞",
    content: {
      introduction: `Growing up with a narcissistic parent means growing up as an extension of someone else rather than as your own person. Narcissistic parents view their children as sources of narcissistic supply - vehicles for admiration, accomplishment, and validation - rather than as separate individuals with their own needs, feelings, and identities.

The impact is profound and often invisible until adulthood. You may have been the \"golden child\" - idealized and pressured to reflect well on the parent - or the \"scapegoat\" - blamed for family dysfunction and treated as defective. Sometimes children alternate between roles, never knowing which version of the parent they'll encounter. This unpredictability creates hypervigilance that persists long after childhood.

Children of narcissistic parents often struggle with core questions: Am I allowed to have needs? Are my feelings real? Am I good enough? These questions arise because narcissistic parents systematically invalidate their children's inner experiences. Your feelings were wrong, inconvenient, or about them. Your needs were selfish. Your accomplishments were either co-opted or minimized. The real you was never quite acceptable.

Recovery involves grieving the parent you needed but didn't have, learning to trust your own perceptions after years of gaslighting, and developing a sense of self that wasn't allowed to form naturally. This is hard, long work - but it's possible.`,
      keyInsights: [
        { 
          title: 'You were a mirror, not a person', 
          explanation: 'Narcissistic parents need their children to reflect well on them. Your job was to be an extension of their ego - accomplishing what they wanted, feeling what was convenient for them, never outshining or embarrassing them. Your authentic self wasn\'t wanted.' 
        },
        { 
          title: 'Golden child vs. scapegoat', 
          explanation: 'Narcissistic family systems often split children into roles. The golden child is idealized but burdened with impossible expectations. The scapegoat carries the family\'s dysfunction. Both are harmed - just differently.' 
        },
        { 
          title: 'Emotional attunement was missing', 
          explanation: 'Healthy parents attune to their children\'s emotional states. Narcissistic parents expect children to attune to THEM. You learned to read the room, manage their emotions, and suppress your own. This became your relationship template.' 
        },
        { 
          title: 'The wound often surfaces in adulthood', 
          explanation: 'Many children of narcissists don\'t realize what happened until their 30s, 40s, or later. Therapy, books, or hearing others\' stories suddenly name what was always wrong but unidentifiable.' 
        },
        {
          title: 'Love-bombing and withdrawal created confusion',
          explanation: 'Narcissistic parents often alternate between excessive attention and cold withdrawal. This intermittent reinforcement creates trauma bonds and makes you question whether your perception of abuse is valid.'
        }
      ],
      whatHelps: [
        'Learn about narcissistic personality patterns - naming it helps',
        'Find validation: support groups, therapy, books (try "Adult Children of Emotionally Immature Parents")',
        'Practice trusting your own perceptions - they were systematically invalidated',
        'Grieve the parent you deserved but didn\'t get',
        'Set boundaries - narcissistic parents rarely respect them, so enforce consequences',
        'Consider low contact or no contact if the relationship continues to harm you',
      ],
      professionalNote: 'Therapists familiar with narcissistic abuse and complex trauma (C-PTSD) can help you process these dynamics and rebuild a healthy sense of self.'
    },
    reflectionQuestions: [
      'How did your parent respond when you had needs or feelings that were inconvenient for them?',
      'Were you the golden child, the scapegoat, or did you alternate? How did that shape you?',
      'What parts of yourself did you suppress to survive your childhood?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-rel-emotionally-immature-parents', 'hm-rel-estrangement'],
  },
  {
    id: 'hm-rel-enmeshment',
    title: 'Enmeshment: When Families Have No Boundaries',
    category: 'relationships',
    duration: 9,
    emoji: '🕸️",
    content: {
      introduction: `In enmeshed families, boundaries between members are blurred or nonexistent. Individuality is threatening. Separation is betrayal. Family therapist Salvador Minuchin, who identified this pattern, described enmeshed families as systems where everyone feels everyone else's feelings, where privacy is suspicious, and where differentiation is punished.

Enmeshment often masquerades as closeness. \"We're just a really close family" can mean genuine intimacy - or it can mean nobody is allowed to have their own feelings, opinions, or life. The difference is whether separation and individuality are possible without guilt, punishment, or family crisis.

Children raised in enmeshed families struggle to develop a coherent sense of self. They may not know what they actually feel versus what they're supposed to feel. They may experience intense guilt around normal developmental milestones like dating, moving out, or making independent choices. Success and happiness separate from the family can feel like betrayal.

Differentiation - developing a clear sense of where you end and others begin - is the antidote to enmeshment. This doesn't mean becoming cold or distant. It means being able to stay connected while also being yourself.`,
      keyInsights: [
        { 
          title: "Closeness vs. enmeshment', 
          explanation: 'Close families support individuality while staying connected. Enmeshed families require sameness and punish differentiation. If having your own feelings, opinions, or life choices triggers family crisis, that\'s enmeshment.' 
        },
        { 
          title: 'Emotional contagion', 
          explanation: 'In enmeshed families, one person\'s mood affects everyone. You may have learned to constantly monitor family members\' emotional states and adjust yourself accordingly. Your mood was never fully your own.' 
        },
        { 
          title: 'Privacy is suspicious', 
          explanation: 'Enmeshed families often treat privacy as secrecy, secrecy as betrayal. Locked doors, unshared information, or having experiences without the family can trigger accusations of disloyalty.' 
        },
        { 
          title: 'Separation guilt', 
          explanation: 'Moving out, prioritizing your partner, having success the family can\'t share - these normal milestones can trigger overwhelming guilt and family retaliation. The message: your separate existence is a wound to us.' 
        },
        {
          title: 'Enmeshment replicates in other relationships',
          explanation: 'You may recreate enmeshment in friendships and romantic relationships - losing yourself in others, struggling with boundaries, feeling responsible for others\' emotions.'
        }
      ],
      whatHelps: [
        'Learn about differentiation (Murray Bowen\'s family systems theory)',
        'Practice tolerating the discomfort of disappointing family to be yourself',
        'Start small: have one opinion that differs from the family, maintain one boundary',
        'Notice when you\'re feeling others\' feelings instead of your own',
        'Find relationships outside the family system',
        'Therapy can provide a space where your individuality is supported',
      ],
      professionalNote: 'Family systems therapy, particularly Bowen\'s approach, specifically addresses enmeshment and helps with differentiation of self.'
    },
    reflectionQuestions: [
      'Can you disagree with your family without it becoming a crisis? How do they respond to your independent choices?',
      'Do you know what you actually feel, or do you feel what you\'re supposed to feel?',
      'What would happen if you set a boundary your family didn\'t like?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-rel-boundaries-protect', 'hm-rel-codependency'],
  },
  {
    id: 'hm-rel-codependency',
    title: "Codependency: Losing Yourself in Others',
    category: "relationships',
    duration: 9,
    emoji: '🎭",
    content: {
      introduction: `Codependency is when your sense of self becomes dependent on managing, helping, or controlling someone else. It often develops in families with addiction, mental illness, or dysfunction - where children learn to focus outward on others' needs because their own needs weren't safe to have. You became the caretaker, the fixer, the one who holds everything together.

The codependent person's identity revolves around being needed. Their self-worth depends on being helpful, self-sacrificing, and essential to others. This sounds noble, but it comes at a devastating cost: you may have no idea who you are outside of your relationships. Your feelings, needs, and preferences became secondary so long ago that you may not know what they are.

Codependency creates relationships that look like love but function like addiction. You're drawn to people who need fixing because that's where you feel valuable. You may stay in harmful relationships because leaving feels like abandoning your purpose. You give and give until you're empty, then feel resentful - but can't stop giving.

Recovery from codependency involves turning the caretaking energy inward. Learning to have needs. Tolerating the anxiety of not being needed. Discovering who you are when you're not managing someone else's life.`,
      keyInsights: [
        { 
          title: 'Caretaking as identity', 
          explanation: 'Your worth became tied to being helpful, essential, the one who saves others. When you\'re not in that role, you may feel purposeless, anxious, or worthless.' 
        },
        { 
          title: 'Attracted to dysfunction', 
          explanation: 'Codependents are often drawn to partners with addiction, mental illness, or immaturity - people who need the help that defines the codependent\'s identity. Healthy partners can feel boring or uncomfortable.' 
        },
        { 
          title: 'Control disguised as care', 
          explanation: 'Codependency often involves controlling others "for their own good." Managing their lives, advice-giving, and monitoring can be ways of reducing the codependent\'s anxiety rather than genuinely helping.' 
        },
        { 
          title: 'Self-abandonment', 
          explanation: 'You learned to abandon yourself to focus on others. Your needs, feelings, and preferences were submerged so long ago you may not know what they are.' 
        },
        {
          title: 'Boundaries feel selfish',
          explanation: 'Having limits, saying no, and prioritizing your own wellbeing can feel deeply wrong, even cruel. This guilt is a symptom of codependency, not a sign that boundaries are wrong.'
        }
      ],
      whatHelps: [
        'Codependents Anonymous (CoDA) provides community and a framework for recovery',
        'Therapy focused on self-worth and differentiation',
        'Practice identifying what YOU want (start small: what do you want for dinner?)',
        'Notice when helping is about reducing your own anxiety vs. genuine service',
        'Set boundaries even when they feel "selfish"',
        'Develop identity outside of caretaking roles',
      ],
      professionalNote: 'Melody Beattie\'s "Codependent No More" is a foundational resource. Look for therapists familiar with codependency patterns and attachment work.'
    },
    reflectionQuestions: [
      'Who were you taking care of as a child? What did you learn about whose needs mattered?',
      'Outside of your relationships and roles, who are you? What do YOU want?',
      'What happens inside you when someone doesn\'t need your help?',
    ],
    relatedLessons: ['hm-rel-enmeshment', 'hm-rel-boundaries-protect', 'hm-rel-addiction-family'],
  },
  {
    id: 'hm-rel-emotional-abuse',
    title: 'Emotional Abuse: The Invisible Wounds',
    category: 'relationships',
    duration: 10,
    emoji: '🩹",
    content: {
      introduction: `Emotional abuse doesn't leave bruises, which makes it easier to deny, minimize, and doubt. But research is clear: psychological abuse can be as damaging as physical abuse, sometimes more so. It attacks your sense of reality, self-worth, and trust in your own perceptions. The wounds are invisible but deep.

Emotional abuse takes many forms: constant criticism, humiliation, threats, isolation from friends and family, controlling behaviors, manipulation, gaslighting, withholding affection as punishment, explosive rage, and chronic invalidation. The common thread is that the abuser systematically undermines the victim's sense of self, autonomy, and connection to others.

Recognizing emotional abuse is hard when you're in it. Abusers don't abuse constantly - they intersperse cruelty with kindness, keeping you off-balance and hoping. They often present a different face to the outside world, making you doubt whether anyone would believe you. And they frequently convince you that you're the problem, that if you were just better, the abuse would stop.

The damage extends beyond the relationship. Survivors often struggle with trust, self-worth, and forming healthy attachments. They may repeat the pattern or swing to the opposite extreme. Recovery requires recognizing what happened, processing the trauma, and rebuilding a sense of self that was systematically dismantled.`,
      keyInsights: [
        { 
          title: 'Invisible doesn\'t mean less harmful', 
          explanation: 'Research shows emotional abuse has long-term effects comparable to physical abuse: depression, anxiety, PTSD, difficulty trusting. The absence of physical marks doesn\'t minimize the damage.' 
        },
        { 
          title: 'The cycle keeps you trapped', 
          explanation: 'Abuse typically cycles through tension building, incident, reconciliation/honeymoon, and calm - then repeats. The good periods make you doubt your perception and hope things will change.' 
        },
        { 
          title: 'Isolation is strategic', 
          explanation: 'Abusers often isolate victims from friends, family, and outside perspective. Without reality checks, the victim becomes dependent on the abuser\'s version of reality.' 
        },
        { 
          title: 'You become the identified problem', 
          explanation: 'Abusers are skilled at making victims feel like the cause of the abuse. "Look what you made me do." "If you weren\'t so [sensitive/stupid/etc], I wouldn\'t have to..." This gaslighting compounds the damage.' 
        },
        {
          title: 'Trauma bonds form',
          explanation: 'The intermittent reinforcement of abuse followed by kindness creates powerful trauma bonds - attachments that feel like love but function like addiction. Leaving can feel impossible even when you know it\'s necessary.'
        }
      ],
      whatHelps: [
        'Name it: "This is abuse" is a powerful and necessary statement',
        'Break isolation: reconnect with friends, family, or a therapist',
        'Document incidents - for your own clarity if nothing else',
        'Safety planning if you\'re preparing to leave',
        'National Domestic Violence Hotline: 1-800-799-7233',
        'Trauma-informed therapy to process the experience and rebuild',
      ],
      warningSign: 'If you\'re in an abusive relationship and considering leaving, the most dangerous time is around separation. Create a safety plan with professional support.'
    },
    reflectionQuestions: [
      'Have you been told your perception of events is wrong, crazy, or too sensitive? By whom?',
      'Who would you talk to about what\'s happening? If no one, why?',
      'What would you tell a friend who described your relationship to you?',
    ],
    relatedLessons: ['hm-rel-gaslighting', 'hm-rel-when-to-leave', 'hm-mh-trauma-basics'],
  },
  {
    id: 'hm-rel-gaslighting',
    title: 'Gaslighting: When Your Reality Is Denied',
    category: 'relationships',
    duration: 8,
    emoji: '🔦",
    content: {
      introduction: `Gaslighting is a form of psychological manipulation where someone makes you question your own perception of reality. The term comes from a 1944 film where a husband manipulates his wife into believing she's going insane. It's not just disagreeing with you - it's systematically undermining your trust in your own mind.

Common gaslighting tactics include: denying events that happened (\"That never happened\"), minimizing your feelings (\"You're overreacting\"), shifting blame (\"You made me do it\"), countering your memory (\"You're remembering it wrong"), trivializing your concerns ("You're too sensitive\"), and using others against you (\"Everyone thinks you're crazy\").

The insidious power of gaslighting is that it attacks your most fundamental tool for navigating reality: your own perception. When someone persistently tells you that what you see, hear, feel, and remember isn't real, you begin to doubt yourself. This doubt is the point. It makes you easier to control and harder to leave.

Recovery from gaslighting requires rebuilding trust in yourself - which is exactly what was targeted. This often needs outside support: people who validate your reality, therapists who help you distinguish between your perceptions and the gaslighter's version, and time away from the person who scrambled your sense of self.`,
      keyInsights: [
        { 
          title: 'It attacks your reality testing', 
          explanation: 'Your ability to trust what you perceive and remember is foundational to functioning. Gaslighting directly targets this capacity, making you dependent on the gaslighter\'s version of events.' 
        },
        { 
          title: 'It\'s intentional but may not be conscious', 
          explanation: 'Some gaslighters knowingly manipulate. Others do it automatically, having learned the pattern from their own upbringing. Intention doesn\'t change impact, but it affects whether the person can change.' 
        },
        { 
          title: 'Documentation helps', 
          explanation: 'When you can\'t trust your memory, writing things down creates an external record. Journaling events as they happen can be a lifeline when your perception is being systematically undermined.' 
        },
        { 
          title: 'Outside perspective is essential', 
          explanation: 'Isolation enables gaslighting. Connection with people outside the relationship who validate your perception is crucial for maintaining and rebuilding your sense of reality.' 
        },
      ],
      whatHelps: [
        'Write things down - create external records when your memory is being questioned',
        'Seek outside perspectives from people you trust',
        'Learn the tactics - being able to name "that\'s gaslighting" reduces its power',
        'Limit contact with the gaslighter if possible',
        'Therapy to rebuild trust in your own perceptions',
        'Practice phrases like "I know what I saw" and "My feelings are valid"',
      ],
      professionalNote: 'Rebuilding after gaslighting often requires trauma-informed therapy. The goal is restoring trust in yourself, which takes time and support.'
    },
    reflectionQuestions: [
      'Who in your life makes you feel crazy or doubt your own memory and perception?',
      'Do you find yourself apologizing for things you don\'t think you did wrong? Why?',
      'What would you think if you heard your own story from someone else?',
    ],
    relatedLessons: ['hm-rel-emotional-abuse', 'hm-rel-narcissistic-parents', 'hm-mh-trauma-basics'],
  },
  {
    id: 'hm-rel-estrangement',
    title: 'Parent-Child Estrangement: When Cutting Contact Is Necessary',
    category: 'relationships',
    duration: 10,
    emoji: '🚪",
    content: {
      introduction: `Estrangement from family - particularly from parents - is one of the most stigmatized choices a person can make. Society assumes that family bonds are sacred and permanent. \"But they're your parents\" is offered as if it ends all discussion. What this ignores is that some family relationships are so harmful that maintaining them requires ongoing self-destruction.

The decision to go no-contact or low-contact with a parent is rarely made lightly. Most adult children who estrange have tried repeatedly to make the relationship work. They've set boundaries that were ignored, communicated needs that were dismissed, and endured ongoing harm while hoping things would change. Estrangement is usually a last resort, not a first reaction.

The grief of estrangement is complex and often unrecognized. You grieve the parent you needed but didn't have. You grieve the relationship that could have been. You may grieve when they die, realizing that change is now truly impossible. And you do this grieving while society tells you you're wrong, selfish, or unforgiving.

Research on estrangement is growing. Studies show that most people who estrange from family members report improved wellbeing after the initial grief and adjustment. This doesn't mean it's easy or painless - it means sometimes it's necessary.`,
      keyInsights: [
        { 
          title: "Estrangement is often a last resort', 
          explanation: 'Most adult children who cut contact have tried everything else first. Years of attempts at communication, boundary-setting, and hoping for change typically precede the decision.' 
        },
        { 
          title: 'Blood doesn\'t override harm', 
          explanation: 'The cultural belief that family bonds override everything enables ongoing abuse. If a non-family member treated you the way your family does, would you stay in that relationship?' 
        },
        { 
          title: 'Grief is complex and ongoing', 
          explanation: 'Estrangement means grieving while the person is alive. You grieve the relationship you needed, the parent they couldn\'t be, and the fantasy of eventual reconciliation. This grief may resurface throughout life.' 
        },
        { 
          title: 'Wellbeing often improves', 
          explanation: 'Despite social stigma and grief, research shows most people who estrange report better mental health and life satisfaction after adjustment. Sometimes distance is health.' 
        },
        {
          title: 'You can still love them',
          explanation: 'Estrangement doesn\'t mean you don\'t love your parent. It means you\'ve accepted that loving them can\'t coexist with protecting yourself. Both things can be true.'
        }
      ],
      whatHelps: [
        'Trust your own experience - you know what you lived',
        'Find support from people who understand (estrangement forums, therapists who don\'t pathologize your choice)',
        'Prepare responses for social situations where family is assumed',
        'Allow yourself to grieve fully - this is a major loss',
        'Be prepared for family members to pressure you to reconcile',
        'Consider low contact as an option if full estrangement feels too extreme',
      ],
      professionalNote: 'Not all therapists understand estrangement as a valid choice. Look for ones who don\'t automatically push reconciliation without understanding your history.'
    },
    reflectionQuestions: [
      'What have you already tried to make this relationship work? What were the results?',
      'How would your life be different without this person\'s influence?',
      'What grief would you need to process to make peace with estrangement?',
    ],
    relatedLessons: ['hm-rel-narcissistic-parents', 'hm-rel-boundaries-protect', 'hm-trans-grief-all-kinds'],
  },
  {
    id: 'hm-rel-lgbtq-family-rejection',
    title: 'LGBTQ+ Family Rejection: Surviving Non-Acceptance',
    category: 'relationships',
    duration: 10,
    emoji: '🏳️‍🌈",
    content: {
      introduction: `Coming out to family as LGBTQ+ can result in acceptance, rejection, or something complicated in between. For those who face rejection - ranging from subtle withdrawal to explicit disownment - the pain is profound. The people who were supposed to love you unconditionally have made that love conditional on being someone you're not.

The impact of family rejection on LGBTQ+ youth is well-documented and severe. Research shows dramatically increased rates of depression, suicidality, substance abuse, and homelessness among rejected LGBTQ+ young people. But family rejection doesn't only affect youth - adults who come out later also face this pain, sometimes losing decades-long relationships.

Some families need time to adjust. Their initial rejection softens as they process, learn, and adjust their expectations. For these families, patience, education, and continued presence can lead to eventual acceptance. Other families never come around. Knowing which situation you're in - and how long to wait for possible change - is one of the hardest judgments to make.

The concept of \"chosen family\" becomes essential for many LGBTQ+ people. When biological family fails, community becomes family. The connections formed in LGBTQ+ spaces, with partners, with accepting friends - these relationships can provide the belonging and support that family of origin couldn't give.`,
      keyInsights: [
        { 
          title: "Conditional vs. unconditional love', 
          explanation: 'Rejection reveals that family love was conditional on meeting certain expectations. This is a profound wound - the realization that being yourself makes you unacceptable to those who should accept you most.' 
        },
        { 
          title: 'Grief upon grief', 
          explanation: 'You may grieve the relationship, the family you thought you had, the fantasy of full acceptance, and the future events without family support (weddings, children, milestones). Each loss deserves acknowledgment.' 
        },
        { 
          title: 'Some families evolve, some don\'t', 
          explanation: 'Initial rejection isn\'t always permanent. Some families need time and exposure to overcome their conditioning. But others remain entrenched. Knowing when to keep trying and when to protect yourself is difficult.' 
        },
        { 
          title: 'Chosen family is real family', 
          explanation: 'The LGBTQ+ community has a long tradition of chosen family - relationships built on acceptance and mutual support when biological family fails. These bonds can be just as deep and valid.' 
        },
        {
          title: 'Internalized shame requires attention',
          explanation: 'Family rejection can reinforce internalized homophobia, transphobia, or shame about your identity. Processing these internalized messages is part of healing.'
        }
      ],
      whatHelps: [
        'Connect with LGBTQ+ community and chosen family',
        'Organizations like PFLAG can help educate families who are willing to learn',
        'Therapy with an LGBTQ+-affirming provider',
        'Set boundaries with family members who are harmful while determining next steps',
        'Process internalized shame separately from family relationships',
        'The Trevor Project (866-488-7386) provides crisis support for LGBTQ+ young people',
      ],
      warningSign: 'If you\'re a young person facing family rejection and don\'t feel safe, please reach out to The Trevor Project (call, text, or chat) for support.',
      professionalNote: 'Look for therapists who are LGBTQ+-affirming (check their profiles) and have experience with family rejection and chosen family building.'
    },
    reflectionQuestions: [
      'What has your family\'s response to your identity been? How has it affected you?',
      'Who in your life accepts you fully? How can you strengthen those connections?',
      'What messages about your identity did you internalize from your family that may need examining?',
    ],
    relatedLessons: ['hm-rel-estrangement', 'hm-rel-gender-identity', 'hm-world-minority-stress'],
  },
  {
    id: 'hm-rel-divorce-impact-adults',
    title: 'Divorce Impact on Adult Children',
    category: 'relationships',
    duration: 8,
    emoji: '💔",
    content: {
      introduction: `We often focus on how divorce affects children, but parents divorcing when you're an adult brings its own pain - pain that's often minimized or ignored. "At least you were grown" misses that your family of origin dissolving shakes your foundation regardless of age. The family you knew no longer exists. The story you told about your childhood is rewritten.

Adult children of divorce face unique challenges. You may be triangulated into parental conflicts, asked to take sides, or treated as a therapist for one or both parents. You may have to navigate holidays, weddings, and family events where your parents can't be in the same room. You may learn things about your parents' marriage that shift your understanding of your entire childhood.

Perhaps hardest is the retroactive questioning. If they were unhappy for decades, what was real? Were the family memories genuine? Were you living in a lie? This destabilization of your history can shake your sense of reality and trust in your own perception of relationships.

Your feelings about your parents" divorce are valid even if you're 25, 35, or 55. Grief doesn't require youth. The loss of the intact family, however imperfect it was, deserves acknowledgment.`,
      keyInsights: [
        { 
          title: 'Age doesn\'t eliminate impact', 
          explanation: 'Being an adult doesn\'t protect you from grief when your family structure dissolves. The belief that adults are "past" being affected by parental divorce minimizes legitimate pain.' 
        },
        { 
          title: 'Triangulation is common', 
          explanation: 'Adult children often get pulled into parental conflicts, used as messengers, therapists, or allies. Setting boundaries around these roles is essential but difficult.' 
        },
        { 
          title: 'History gets rewritten', 
          explanation: 'Learning about infidelity, unhappiness, or deception can retroactively change how you understand your entire childhood. This is disorienting and requires its own processing.' 
        },
        { 
          title: 'Practical complications abound', 
          explanation: 'Holidays, weddings, grandchildren, family gatherings - all become logistical and emotional minefields when parents can\'t be together. The burden often falls on adult children to manage.' 
        },
      ],
      whatHelps: [
        'Give yourself permission to grieve, regardless of your age',
        'Set boundaries: "I won\'t be a messenger" or "I won\'t discuss the other parent"',
        'Resist taking sides - your relationship with each parent is separate',
        'Seek your own therapy rather than becoming a parent\'s emotional support',
        'Find siblings or others who share this experience',
        'Accept that holidays and events may need new structures',
      ],
    },
    reflectionQuestions: [
      'How has your parents\' divorce affected your view of relationships and marriage?',
      'Have you been placed in the middle of their conflicts? How did you handle it?',
      'What grief about your family\'s dissolution have you not fully allowed yourself to feel?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-rel-boundaries-protect', 'hm-trans-divorce'],
  },
  {
    id: 'hm-rel-blended-families',
    title: 'Blended Families: Navigating Complex Loyalties',
    category: 'relationships',
    duration: 9,
    emoji: '👨‍👩‍👧‍👦",
    content: {
      introduction: `Blended families - families formed by remarriage or partnership when one or both partners have children from previous relationships - are increasingly common and perpetually challenging. The fantasy of seamlessly merging into one happy family rarely matches reality. Real blending involves divided loyalties, resentment, jealousy, competing parenting styles, and the ongoing presence of ex-partners.

For children, a stepparent can feel like an intruder, a replacement for a beloved parent, or a symbol of family upheaval they didn't choose. Resistance to stepparents isn't necessarily defiance - it's often loyalty to the biological parent (even an absent or difficult one) and grief about the original family's dissolution.

For stepparents, the role is uniquely challenging. You're expected to parent children who may not want your parenting, love children who may not love you back, and navigate a co-parenting relationship with someone who may view you as an enemy. The biological parent is caught in the middle, often trying to please everyone and succeeding with no one.

Research shows blended families typically take 5-7 years to feel genuinely integrated. Expecting instant bonding or harmony creates failure. What works is patience, realistic expectations, and allowing relationships to develop naturally rather than forcing them.`,
      keyInsights: [
        { 
          title: "Loyalty binds are real', 
          explanation: 'Children often feel that accepting a stepparent means betraying their biological parent. This is especially powerful if the biological parent reinforces this guilt. These binds aren\'t manipulative - they\'re developmentally normal.' 
        },
        { 
          title: 'Stepparents shouldn\'t rush to parent', 
          explanation: 'Research consistently shows that stepparents who move slowly - acting as "friendly adult" rather than "new parent" - have better outcomes. Discipline should remain with biological parents for a long time.' 
        },
        { 
          title: 'The couple relationship is foundational', 
          explanation: 'Blended families work better when the couple relationship is strong. This doesn\'t mean prioritizing partner over children, but investing in that bond provides stability for the whole system.' 
        },
        { 
          title: 'Integration takes years, not months', 
          explanation: 'Family researchers estimate 5-7 years for blended families to feel cohesive. Expecting instant bonding creates unnecessary pressure and disappointment.' 
        },
        {
          title: 'Ex-partner relationships affect everything',
          explanation: 'High conflict with ex-partners reverberates through the blended family. When possible, reducing this conflict (through boundaries, parallel parenting, or acceptance) benefits everyone.'
        }
      ],
      whatHelps: [
        'Lower expectations for immediate bonding',
        'Stepparents: focus on building friendship before authority',
        'Biological parents: don\'t force children to love your new partner',
        'Maintain one-on-one time between biological parents and children',
        'Develop consistent household rules while respecting differences',
        'Consider family therapy with someone experienced in blended family dynamics',
      ],
    },
    reflectionQuestions: [
      'If you\'re a stepparent: what expectations about bonding have you had to revise?',
      'What loyalty conflicts exist in your blended family? How might they be eased?',
      'What would "success" look like for your blended family - realistically?',
    ],
    relatedLessons: ['hm-rel-divorce-impact-adults', 'hm-rel-boundaries-protect', 'hm-rel-difficult-people'],
  },
  {
    id: 'hm-rel-adoption-wounds',
    title: 'Adoption & Abandonment Wounds: The Primal Experience',
    category: 'relationships',
    duration: 10,
    emoji: '🔗",
    content: {
      introduction: `Adoption, regardless of circumstances, begins with a loss. Before any love from adoptive parents, before any positive outcomes, there is the foundational experience of separation from birth parents. Psychologist Nancy Verrier calls this \"the primal wound\" - a pre-verbal, body-level experience of abandonment that shapes development in ways often invisible but profound.

This doesn't mean adoption is bad or that adoptees are damaged. It means that adoption involves complexity that is often minimized or denied. The cultural narrative of the \"chosen child\" who should feel grateful can silence the legitimate grief, confusion, and questions about identity and belonging that many adoptees experience.

Adoptees may struggle with issues of identity, belonging, and fear of abandonment throughout life. They may idealize birth parents or feel rage toward them. They may feel guilty for searching for birth family, as if it betrays adoptive parents. They may struggle to trust that people won't leave. These aren't universal experiences, but they're common enough to deserve recognition.

The adoptee experience exists on a spectrum. Some feel deeply secure and have no interest in birth family. Others feel unmoored and desperate to find their origins. Most fall somewhere in between, and their feelings may shift throughout life. All of these experiences are valid.`,
      keyInsights: [
        { 
          title: "The primal wound is pre-verbal', 
          explanation: 'Separation from birth mother happens before language, before conscious memory. But the nervous system registers it. This may manifest as deep-seated abandonment fears without clear origin.' 
        },
        { 
          title: 'Gratitude narratives can silence pain', 
          explanation: ''You\'re so lucky to be adopted" pressures adoptees to perform gratitude while suppressing legitimate grief and questions. Being adopted and having complicated feelings about it aren\'t mutually exclusive.' 
        },
        { 
          title: 'Identity questions are normal', 
          explanation: 'Who am I? Where do I come from? Why was I placed? These questions don\'t mean adoptive parents failed - they mean the adoptee is grappling with a complex reality.' 
        },
        { 
          title: 'Search doesn\'t mean rejection', 
          explanation: 'Wanting to know about or meet birth family isn\'t a betrayal of adoptive family. It\'s seeking understanding of one\'s origin. Adoptive parents who support this generally have better relationships with adult adoptees.' 
        },
        {
          title: 'Attachment patterns may be affected',
          explanation: 'Early separation can affect attachment development. Adoptees may be more prone to anxious or avoidant attachment patterns, particularly if there were multiple placements or early institutional care.'
        }
      ],
      whatHelps: [
        'Find community with other adoptees who understand without explanation',
        'Therapy with someone trained in adoption issues and attachment',
        'Books and resources specifically for adoptees (try "The Primal Wound" by Nancy Verrier)',
        'Give yourself permission to have complicated feelings about adoption',
        'If searching for birth family: prepare emotionally for various outcomes',
        'If you\'re an adoptive parent: make space for your child\'s full experience',
      ],
      professionalNote: 'Look for therapists with specific training in adoption issues. Many therapists don\'t understand the complexity and may minimize adoption-related pain.'
    },
    reflectionQuestions: [
      'What messages did you receive about how you should feel about being adopted?',
      'How has your adoption experience affected your relationships and sense of security?',
      'What questions about your origins, if any, remain unresolved?',
    ],
    relatedLessons: ['hm-rel-attachment-styles', 'hm-rel-family-wounds', 'hm-growth-inner-child'],
  },
  {
    id: 'hm-rel-only-child',
    title: 'Only Child Dynamics: Unique Patterns',
    category: 'relationships',
    duration: 7,
    emoji: '👤",
    content: {
      introduction: `Only children occupy a unique position in family dynamics - no siblings to share parental attention, no peers in the household to socialize with, no buffer between themselves and parental focus. The stereotypes (spoiled, lonely, socially awkward) are largely myths disproven by research. But being an only child does create distinct experiences worth understanding.

Only children often develop advanced verbal skills and comfort with adults from spending more time in adult company. They may be more comfortable with solitude and have rich inner lives. They may also carry the full weight of parental expectations, involvement, and anxiety with no siblings to distribute it among.

The concentrated parental attention can be nurturing or overwhelming - sometimes both. When parents are healthy and attuned, only children often thrive with abundant resources and attention. When parents are anxious, controlling, or have unmet needs, only children have no escape from that intensity and no sibling to reality-check with.

As adults, only children face the prospect of sole responsibility for aging parents - a practical and emotional burden that siblings share. They also navigate adulthood without the sibling relationships that serve as lifelong peers for others. This isn't tragedy - just difference worth acknowledging.`,
      keyInsights: [
        { 
          title: "Stereotypes aren\'t supported by research', 
          explanation: 'Studies consistently fail to show that only children are more selfish, lonely, or maladjusted than those with siblings. The "spoiled only child" is a cultural myth more than empirical reality.' 
        },
        { 
          title: 'Parental intensity has no dilution', 
          explanation: 'All parental attention - positive and negative, nurturing and anxious - focuses on one child. This can mean more resources and support, but also more pressure and enmeshment potential.' 
        },
        { 
          title: 'Comfort with solitude and adults', 
          explanation: 'Only children often develop comfortable relationships with solitude and with adult conversation. These aren\'t deficits - they\'re adaptations that can serve well in certain contexts.' 
        },
        { 
          title: 'No sibling buffer or reality-check', 
          explanation: 'In dysfunctional families, siblings can validate each other\'s experience ("yes, that was weird"). Only children must evaluate family dynamics alone, which can be isolating.' 
        },
      ],
      whatHelps: [
        'Recognize your comfort with solitude as strength, not deficiency',
        'If parental attention was overwhelming, practice boundary-setting',
        'Build peer relationships that provide sibling-like support',
        'Plan early for aging parent care given you\'ll carry it alone',
        'Challenge internalized stereotypes about only children',
        'If your family was dysfunctional, seek outside validation of your experience',
      ],
    },
    reflectionQuestions: [
      'How did being an only child shape your comfort with solitude versus social situations?',
      'What was the quality of parental attention you received - nurturing, overwhelming, or both?',
      'How are you preparing for the reality of sole responsibility for aging parents?',
    ],
    relatedLessons: ['hm-rel-enmeshment', 'hm-rel-family-wounds', 'hm-rel-boundaries-protect'],
  },
  {
    id: 'hm-rel-eldest-child-parentification',
    title: 'Eldest Child & Parentification: When Kids Raise Kids',
    category: 'relationships',
    duration: 9,
    emoji: '👑",
    content: {
      introduction: `Eldest children often carry burdens invisible to the rest of the family. Expected to be responsible, to model good behavior, to help with younger siblings, to understand when parents are stressed - they learn early that their job is to be dependable. For some, this extends into parentification: taking on caregiving responsibilities that should belong to adults.

Parentification isn't just helping out. It's when a child becomes functionally responsible for the emotional or practical wellbeing of siblings or parents. The parentified child may manage household tasks, care for siblings while parents work or are impaired, mediate parental conflicts, serve as emotional support for a parent, or hold the family together through crisis. They're children doing adult jobs.

The cost comes due later. Parentified children often become hyper-responsible adults who don't know how to let others care for them. They may feel compelled to fix everyone's problems while neglecting their own needs. They may struggle to play, relax, or not be useful. Achievement may feel mandatory rather than optional. Asking for help may feel impossible.

Recovery involves grieving the childhood that was lost to premature responsibility, learning to have needs without shame, and releasing the pattern of over-functioning that felt essential for survival but now limits life.`,
      keyInsights: [
        { 
          title: 'Emotional vs. instrumental parentification', 
          explanation: 'Instrumental parentification is taking on physical tasks (household management, sibling care). Emotional parentification is becoming a parent\'s confidant, therapist, or emotional support. Both steal childhood; emotional parentification often leaves deeper wounds.' 
        },
        { 
          title: 'It felt normal at the time', 
          explanation: 'Parentified children often don\'t realize their experience was unusual until adulthood. "I just helped out" minimizes the reality that they were carrying adult weight on child shoulders.' 
        },
        { 
          title: 'Hyper-responsibility persists', 
          explanation: 'The parentified child becomes an adult who can\'t stop being responsible. Relaxation feels lazy. Having needs feels weak. Not fixing problems feels negligent. The pattern served survival but now creates exhaustion.' 
        },
        { 
          title: 'Receiving care feels foreign', 
          explanation: 'If you never experienced being cared for, receiving care as an adult can feel uncomfortable, suspicious, or even threatening. Learning to receive is part of healing.' 
        },
        {
          title: 'Grief for lost childhood',
          explanation: 'You can\'t get those years back. The carefree childhood that others had, the freedom from responsibility, the experience of being taken care of - grieving this loss is essential for moving forward.'
        }
      ],
      whatHelps: [
        'Name what happened: "I was parentified" is a powerful recognition',
        'Practice not being useful sometimes - rest isn\'t earned',
        'Learn to receive care without immediately reciprocating',
        'Set boundaries with family who still expect over-functioning from you',
        'Grieve the childhood you deserved but didn\'t get',
        'Therapy focused on childhood roles and adult patterns',
      ],
    },
    reflectionQuestions: [
      'What responsibilities did you carry as a child that in retrospect seem too much for your age?',
      'How does the hyper-responsible pattern show up in your adult life?',
      'When someone offers to help or care for you, what happens inside?',
    ],
    relatedLessons: ['hm-rel-codependency', 'hm-rel-family-wounds', 'hm-growth-reparenting'],
  },
  {
    id: 'hm-rel-middle-child',
    title: 'Middle Child Invisibility: Finding Your Place',
    category: 'relationships',
    duration: 7,
    emoji: '🙈",
    content: {
      introduction: `Middle children exist in a unique structural position: neither the trailblazing eldest nor the babied youngest. Research on \"middle child syndrome\" is mixed, but the lived experience of many middle children includes feeling overlooked, having to fight harder for attention, and developing particular strengths from that position.

The potential positives: middle children often become skilled negotiators and peacemakers, having spent childhood navigating between older and younger siblings. They may be more independent, having received less direct parental attention. They often develop strong peer relationships to compensate for less family centrality.

The potential challenges: feeling invisible in the family, having to create an identity distinct from siblings, receiving less parental investment (photographs, attention, resources), and the sense that their needs were squeezed out by more demanding siblings.

As adults, middle children may continue patterns from childhood - being the mediator, downplaying their needs, or feeling overlooked in groups. Or they may have developed a strong independent identity precisely because they weren't as closely monitored. The experience varies widely based on family dynamics, gender, and the specific siblings involved.`,
      keyInsights: [
        { 
          title: "The squeeze is real', 
          explanation: 'Eldest children get parental attention through novelty and high expectations. Youngest get it through being the baby. Middle children must compete for attention without built-in structural advantages.' 
        },
        { 
          title: 'Peacemaker/negotiator skills', 
          explanation: 'Many middle children become skilled at reading rooms, mediating conflicts, and seeing multiple perspectives. These are genuine strengths developed from navigating sibling dynamics.' 
        },
        { 
          title: 'Independence through necessity', 
          explanation: 'Less parental hovering can mean more freedom to self-direct. Middle children often develop independence and self-reliance because no one was watching as closely.' 
        },
        { 
          title: 'Identity carved out, not given', 
          explanation: 'Unlike eldest or youngest, middle children don\'t have a built-in identity. They often work harder to define who they are distinct from siblings.' 
        },
      ],
      whatHelps: [
        'Recognize strengths that came from your position (negotiation, independence)',
        'Notice if you\'re still downplaying your needs in adult relationships',
        'Practice taking up space - your needs matter even if you learned to minimize them',
        'Let go of resentment toward siblings for dynamics none of you chose',
        'Build relationships where you\'re central, not peripheral',
      ],
    },
    reflectionQuestions: [
      'How visible did you feel in your family compared to your siblings?',
      'What strengths do you have that might have developed from your middle position?',
      'Do you still minimize your needs in groups or relationships?',
    ],
    relatedLessons: ['hm-rel-sibling-wounds', 'hm-rel-family-wounds', 'hm-rel-boundaries-protect'],
  },
  {
    id: 'hm-rel-youngest-child',
    title: 'Youngest Child: Forever the Baby',
    category: 'relationships',
    duration: 7,
    emoji: '🍼",
    content: {
      introduction: `The youngest child in a family occupies a special position - they're the \"baby\" who may never quite outgrow that role, regardless of how many decades pass. Parents are often more relaxed by the last child, having learned from previous kids. But the youngest also inherits a permanent identity that can be hard to escape.

The benefits of youngest-child status often include more relaxed parenting, extended childhood in some ways, and multiple older people invested in their wellbeing. Youngest children are often charming, creative, and skilled at getting attention and navigating social dynamics.

The challenges include being taken less seriously, having achievements minimized (\"the oldest did it first\"), struggling to establish adult identity within the family, and potentially being overprotected or babied well into adulthood. The youngest may also carry grief about the family's "golden age" - they missed the years when siblings were all home, when parents were younger, when the family was more intact.

As adults, youngest children may rebel against the baby role or unconsciously continue it. They may seek partners who take care of them or compensate by becoming fiercely independent. Understanding how birth order shaped you is the first step to choosing whether to continue those patterns.`,
      keyInsights: [
        { 
          title: 'The baby label persists', 
          explanation: 'Family systems tend to freeze people in their childhood roles. The youngest may be 45 and still treated as the baby who can\'t be trusted with serious matters.' 
        },
        { 
          title: 'Relaxed parenting can mean less attention', 
          explanation: 'By the youngest child, parents are often less anxious but also may be less invested. Photo albums get sparser. Milestones get less fanfare. This has its own impact.' 
        },
        { 
          title: 'Achievement in shadows', 
          explanation: 'Whatever the youngest does, older siblings likely did first. This can mean both less pressure and less recognition. Forging a distinct identity may require extra effort.' 
        },
        { 
          title: 'The family\'s golden era was before you', 
          explanation: 'Youngest children hear stories of "before you were born" - the more complete family, the younger parents, the years of togetherness they missed. This creates a subtle outsider feeling.' 
        },
      ],
      whatHelps: [
        'Practice being taken seriously - assert adult identity in family contexts',
        'Notice if you\'re playing "cute" to get needs met instead of asking directly',
        'Develop competencies that feel distinctly yours, not hand-me-downs',
        'Resist the urge to rebel against or fully embrace the baby role - find your middle ground',
        'Address any grief about what you missed before you arrived',
      ],
    },
    reflectionQuestions: [
      'How does your family still treat you as "the baby"? How does this affect you?',
      'What unique identity have you carved out distinct from your siblings?',
      'Do you find yourself wanting to be taken care of, or fiercely resisting that?',
    ],
    relatedLessons: ['hm-rel-sibling-wounds', 'hm-rel-family-wounds', 'hm-rel-enmeshment'],
  },
  {
    id: 'hm-rel-addiction-family',
    title: 'Addiction in the Family: The Whole System Is Sick',
    category: 'relationships',
    duration: 10,
    emoji: '🌀",
    content: {
      introduction: `Addiction isn't an individual disease - it's a family disease. When one person is addicted, the entire family system reorganizes around that addiction. Roles shift, communication becomes distorted, emotions get suppressed or amplified, and everyone develops survival strategies that may not serve them outside the addicted system.

Family systems theory identifies common roles in addicted families: the Hero (often the eldest, who achieves to provide good news), the Scapegoat (who acts out and draws attention away from addiction), the Lost Child (who disappears and asks for nothing), the Mascot (who uses humor to defuse tension), and the Enabler (who protects the addict from consequences). These roles serve the dysfunctional system but create lasting patterns.

Growing up in an addicted family teaches you unreliable lessons: that promises can't be trusted, that feelings must be managed or hidden, that crises are normal, that you're responsible for others" behavior. You may have learned hypervigilance, emotional numbing, people-pleasing, or your own addictive patterns. These adaptations made sense then; they may create problems now.

Recovery from family addiction isn't just about the addicted person getting sober. It's about the entire family learning healthier patterns - which is why Al-Anon, Adult Children of Alcoholics, and family therapy exist. The family members need recovery too.`,
      keyInsights: [
        { 
          title: "Addiction reorganizes the family', 
          explanation: 'The addicted person becomes the center around which everything revolves - schedules, finances, emotions, decisions. Even when trying to ignore the addiction, the family is shaped by it.' 
        },
        { 
          title: 'Roles persist into adulthood', 
          explanation: 'The role you played in your addicted family (hero, scapegoat, lost child, mascot, enabler) often continues in adult relationships and workplaces. These patterns feel natural because they\'re familiar.' 
        },
        { 
          title: 'Broken trust is foundational', 
          explanation: 'Addicts make and break promises constantly. Growing up with this teaches that people can\'t be trusted, that words don\'t match actions. This affects all future relationships.' 
        },
        { 
          title: 'You may carry addiction risk', 
          explanation: 'Both genetics and learned coping patterns increase addiction risk in children of addicts. Being aware of this isn\'t fatalistic - it\'s protective.' 
        },
        {
          title: 'The whole family needs recovery',
          explanation: 'Even if the addicted person gets sober (or doesn\'t), family members have their own recovery work. Al-Anon, ACA (Adult Children of Alcoholics), and therapy address the family members\' patterns.'
        }
      ],
      whatHelps: [
        'Al-Anon or ACA (Adult Children of Alcoholics/Dysfunctional Families) meetings',
        'Therapy focused on family-of-origin issues and codependency',
        'Identify what role you played in the addicted system',
        'Learn what normal, healthy family functioning looks like',
        'Set boundaries with actively addicted family members',
        'Watch your own relationship with substances or addictive behaviors',
      ],
      professionalNote: 'Al-Anon is for family members of alcoholics (current or past, living or dead). ACA is specifically for adults who grew up in addicted or dysfunctional families. Both are free and widely available.'
    },
    reflectionQuestions: [
      'What role did you play in your addicted family system? Does that role continue?',
      'What did you learn about trust, emotions, and stability from your family?',
      'How has your family member\'s addiction affected your own relationship with substances?',
    ],
    relatedLessons: ['hm-rel-codependency', 'hm-rel-family-wounds', 'hm-mh-addiction-spectrum'],
  },
  {
    id: 'hm-rel-mentally-ill-parent',
    title: 'Growing Up with a Mentally Ill Parent',
    category: 'relationships',
    duration: 10,
    emoji: '🎭",
    content: {
      introduction: `Growing up with a parent who has mental illness - depression, bipolar disorder, schizophrenia, severe anxiety, personality disorders - creates a childhood marked by unpredictability and often by role reversal. You may have been caring for your parent rather than being cared for. You may have grown up fast, learned to read moods hypervigilantly, and developed survival skills that now feel like personality traits.

The impact depends on many factors: which illness, how severe, whether treated, whether the other parent was present and stable, and whether anyone explained what was happening. Children often don't have words for what they're experiencing - they just know that their parent is different, unavailable, frightening, or that they must walk on eggshells.

Without explanation, children often blame themselves. "If I were a better kid, mom wouldn't be sad.\" They may also develop a distorted sense of what's normal: if your parent had paranoid delusions, you may have normalized suspiciousness; if they were severely depressed, you may have normalized emotional unavailability. These calibrations need recalibrating.

Compassion for your parent and acknowledgment of your own wounds can coexist. Mental illness isn't a parent's fault, but its impact on you wasn't your fault either. Both are true.`,
      keyInsights: [
        { 
          title: "Children become caretakers', 
          explanation: 'When a parent is impaired, children often step into caregiving roles - emotional support, practical management, monitoring for crisis. This parentification has lasting effects.' 
        },
        { 
          title: 'Hypervigilance as adaptation', 
          explanation: 'Reading moods, predicting episodes, scanning for signs of decompensation - these become automatic when your safety depends on your parent\'s mental state.' 
        },
        { 
          title: 'Self-blame is common', 
          explanation: 'Children naturally center themselves. Without adult explanation, they often conclude they caused or should be able to fix their parent\'s illness.' 
        },
        { 
          title: 'Your risk and your choices', 
          explanation: 'Many mental illnesses have genetic components. This isn\'t determinism - it\'s information. Knowing your family history supports your own mental health management.' 
        },
        {
          title: 'Grief for what you didn\'t get',
          explanation: 'Your parent may have loved you deeply but been unable to be fully present due to their illness. Grieving the parent you needed while understanding why they couldn\'t be that is complex healing work.'
        }
      ],
      whatHelps: [
        'Learn about your parent\'s illness - understanding reduces confusion and self-blame',
        'Recognize that their illness wasn\'t your fault and wasn\'t yours to fix',
        'Identify caregiving patterns that may persist in adult relationships',
        'NAMI (National Alliance on Mental Illness) has family support groups and education',
        'Monitor your own mental health given genetic and environmental factors',
        'Therapy to process childhood experience and current impacts',
      ],
      professionalNote: 'NAMI Family-to-Family is a free educational program for families of people with mental illness. Support groups specifically for adult children of mentally ill parents exist in some areas.'
    },
    reflectionQuestions: [
      'What did you understand about your parent\'s mental illness as a child? What do you understand now?',
      'How did you adapt to your parent\'s condition? Do those adaptations persist?',
      'What would you need to grieve about your childhood to feel more complete?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-rel-eldest-child-parentification', 'hm-mh-depression-truth'],
  },
  {
    id: 'hm-rel-emotionally-immature-parents',
    title: 'Emotionally Immature Parents: Adults Who Never Grew Up',
    category: 'relationships',
    duration: 9,
    emoji: '🧸',
    content: {
      introduction: `Psychologist Lindsay Gibson's concept of "emotionally immature parents" describes adults who, regardless of biological age, never developed the emotional capacities necessary for healthy parenting. They may be self-involved, rigid, unpredictable, or simply emotionally absent - unable to attune to their children's inner worlds because they never developed that capacity in themselves.

Emotionally immature parents come in different flavors: the emotional parent (reactive, unstable, self-centered), the driven parent (perfectionistic, controlling, focused on achievement over connection), the passive parent (disengaged, uninvolved, defers to the other parent), and the rejecting parent (dismissive, hostile, contemptuous). What they share is an inability to see their children as separate people with valid inner experiences.

Children of emotionally immature parents often develop into what Gibson calls "internalizers" - people who blame themselves for relationship problems, try to please others at their own expense, and struggle to identify and assert their own needs. They learned early that their role was to accommodate the parent, not the reverse.

The term "emotionally immature" can feel kinder than "narcissistic" or "abusive" while still capturing real harm. These parents may have loved their children genuinely while being constitutionally unable to provide the emotional attunement children need. Naming this helps adult children understand their experience without requiring the parent to be a villain.`,
      keyInsights: [
        { 
          title: 'Emotional immaturity isn\'t about intelligence', 
          explanation: 'These parents may be successful, intelligent adults who simply lack emotional development. Emotional intelligence is a separate capacity that some adults never develop.' 
        },
        { 
          title: 'You weren\'t seen', 
          explanation: 'Emotionally immature parents can\'t truly see their children as separate people with valid inner worlds. Your job was to orbit them, not to be yourself.' 
        },
        { 
          title: 'Healing loneliness', 
          explanation: 'Children of emotionally immature parents often experienced profound emotional loneliness even in the midst of family. No one was genuinely interested in their inner experience.' 
        },
        { 
          title: 'The internalizer pattern', 
          explanation: 'You may have become highly attuned to others\' emotions while disconnected from your own. You blame yourself for relationship problems and work hard to please while neglecting yourself.' 
        },
        {
          title: 'You can still love them',
          explanation: 'Understanding your parent\'s limitations doesn\'t require hating them. You can love an emotionally immature parent while also protecting yourself from ongoing harm.'
        }
      ],
      whatHelps: [
        'Read "Adult Children of Emotionally Immature Parents" by Lindsay Gibson',
        'Learn to identify your own emotions and needs - they were suppressed early',
        'Practice "maturity awareness" - recognize emotional immaturity in others to calibrate expectations',
        'Reduce emotional investment in getting what the parent can\'t give',
        'Build relationships with emotionally mature people who can model attunement',
        'Therapy focused on recovering authentic self beneath accommodations',
      ],
    },
    reflectionQuestions: [
      'Which type of emotionally immature parent resonates most with your experience?',
      'When you were upset as a child, how did your parents respond? Did you feel seen?',
      'What parts of yourself did you suppress to accommodate your parents\' limitations?',
    ],
    relatedLessons: ['hm-rel-narcissistic-parents', 'hm-rel-family-wounds', 'hm-growth-reparenting'],
  },
  {
    id: 'hm-rel-cultural-religious-pressure',
    title: 'Cultural & Religious Family Pressure: Self vs. Duty',
    category: 'relationships',
    duration: 9,
    emoji: '🙏',
    content: {
      introduction: `For many people, family identity is inseparable from cultural or religious identity. Your family's expectations aren't just personal preferences - they're tied to generations of tradition, community belonging, and deeply held beliefs about right and wrong. Navigating between your authentic self and these expectations is one of the most complex challenges humans face.

The pressure manifests in many areas: who you can marry (same culture/religion), career expectations (certain professions bring honor, others shame), gender roles (how a "proper" daughter or son behaves), religious practice (attending services, observing traditions), and life choices (when to marry, whether to have children). Deviation doesn't just disappoint your family - it threatens their standing in community and their sense of successful parenting.

The bind is real: rejecting family expectations can mean losing community, disappointing people you love, and grieving the belonging you'd have if you fit. But suppressing yourself to meet expectations means living inauthentically, building resentment, and potentially passing the same pressures to your own children.

There's no easy answer. Some people find ways to honor cultural roots while carving out space for authentic expression. Others must choose, grieving what they lose either way. What helps is recognizing this as a genuine dilemma, not a simple matter of \"just be yourself\" or \"respect your elders.\"`,
      keyInsights: [
        { 
          title: "Expectations are tied to survival', 
          explanation: 'In many cultures, family expectations aren\'t arbitrary preferences - they evolved to ensure survival, community cohesion, and intergenerational continuity. This doesn\'t make them right for you, but it contextualizes their intensity.' 
        },
        { 
          title: 'Shame is the enforcement mechanism', 
          explanation: 'Collectivist cultures often use shame - not just guilt - to maintain conformity. You don\'t just feel bad for disappointing family; you feel you ARE bad. Disentangling identity from family approval is core work.' 
        },
        { 
          title: 'Immigration compounds complexity', 
          explanation: 'If your parents immigrated, they may hold tighter to traditions as identity anchors in a foreign land. Your assimilation can feel like betrayal of their sacrifices.' 
        },
        { 
          title: 'Religion adds supernatural weight', 
          explanation: 'When expectations are framed as God\'s will, rejection feels like not just family disappointment but cosmic wrongness. Leaving or modifying religious practice often involves existential grief.' 
        },
        {
          title: 'The third way',
          explanation: 'It\'s not always all-or-nothing. Some people find ways to maintain meaningful cultural/religious connection while creating space for authenticity. This requires negotiation, not total compliance or rejection.'
        }
      ],
      whatHelps: [
        'Disentangle what you value from what was imposed - what do YOU actually believe?',
        'Find community with others navigating the same cultural tensions',
        'Therapy with a culturally competent provider who understands your specific context',
        'Determine which expectations are negotiable and which are non-negotiable for your family',
        'Mourn what you\'ll lose either way - full belonging or authentic self-expression',
        'Consider how to maintain connection to heritage while making your own choices',
      ],
      professionalNote: 'Look for therapists with specific cultural competence in your background. Generic Western therapy may not understand the weight of collectivist family dynamics.'
    },
    reflectionQuestions: [
      'Which family/cultural expectations are most difficult for you to meet or reject?',
      'What would you lose if you fully followed your own path? What do you lose by not following it?',
      'Is there a "third way" that honors your heritage and your authenticity?',
    ],
    relatedLessons: ['hm-rel-enmeshment', 'hm-rel-lgbtq-family-rejection', 'hm-trans-identity-shifts'],
  },
  {
    id: 'hm-rel-intercultural-relationships',
    title: 'Interracial & Intercultural Relationships: Navigating Differences',
    category: 'relationships',
    duration: 9,
    emoji: '🌍",
    content: {
      introduction: `Love doesn't care about cultural lines - but families, communities, and society often do. Interracial and intercultural relationships involve navigating not just two individuals but two sets of cultural expectations, potential family disapproval, and social dynamics that monocultural couples never face.

Cultural differences show up everywhere: communication styles (direct vs. indirect), family involvement (nuclear vs. extended family centrality), gender role expectations, attitudes toward money, parenting approaches, religious practices, food, holidays, and countless daily negotiations. What feels normal to one partner may feel foreign to the other. Neither is wrong - they're just different.

Beyond internal differences, couples often face external challenges: family members who oppose the relationship, microaggressions from strangers, having to navigate each other's cultural contexts as an outsider, and for interracial couples, having children whose racial identity requires thoughtful navigation.

Successful intercultural relationships require curiosity over judgment, ongoing communication about cultural differences, willingness to create a new shared culture rather than one partner assimilating entirely, and strategies for handling external opposition. The work is real - but so are the rewards of building a bridge between worlds.`,
      keyInsights: [
        { 
          title: 'Communication styles differ culturally', 
          explanation: 'What counts as polite, how direct to be, what\'s said explicitly vs. implied, emotional expression norms - all differ by culture. Misunderstandings often aren\'t personal; they\'re cultural.' 
        },
        { 
          title: 'Family involvement expectations vary', 
          explanation: 'Some cultures emphasize nuclear family independence; others expect extended family involvement in major decisions. Clashing expectations here cause significant conflict.' 
        },
        { 
          title: 'Neither culture is "default"', 
          explanation: 'Problems arise when one partner\'s cultural norms are treated as normal and the other\'s as exotic or wrong. Both cultures are equally valid frameworks for living.' 
        },
        { 
          title: 'Children bring new questions', 
          explanation: 'Raising children across cultures requires deciding which traditions to pass on, how to handle racial identity (for interracial families), and how to make children feel whole rather than caught between worlds.' 
        },
        {
          title: 'External opposition is real',
          explanation: 'Not everyone will support your relationship. Strategies for handling family disapproval, social judgment, and microaggressions should be part of the couple\'s toolkit.'
        }
      ],
      whatHelps: [
        'Approach differences with curiosity rather than judgment',
        'Learn about each other\'s cultures deeply, not superficially',
        'Discuss how to handle family opposition as a team',
        'Create your own "third culture" that blends elements from both',
        'For raising children: actively cultivate connection to both heritages',
        'Develop responses to microaggressions and opposition you\'ll face together',
      ],
    },
    reflectionQuestions: [
      'What cultural differences between you and your partner require ongoing negotiation?',
      'How do you handle family or social opposition to your relationship?',
      'What "third culture" are you creating together, blending your backgrounds?',
    ],
    relatedLessons: ['hm-rel-cultural-religious-pressure', 'hm-rel-family-dislikes-partner', 'hm-world-minority-stress'],
  },
  {
    id: 'hm-rel-family-dislikes-partner',
    title: 'When Your Family Doesn\'t Like Your Partner',
    category: 'relationships',
    duration: 8,
    emoji: '😬",
    content: {
      introduction: `Few situations are more uncomfortable than realizing your family dislikes your partner. Family gatherings become minefields. You feel caught between people you love. You may start wondering if your family sees something you don't - or resenting them for not supporting your choice. This is genuinely hard, and there's no simple answer.

First, assess whether the concern has merit. Sometimes families see red flags love is blinding you to. If multiple people who love you have reservations, at least consider why. Are there concerning patterns they're noticing? Substance use? Controlling behavior? Fundamental incompatibility you're minimizing? Families aren't always right, but they're not always wrong either.

Sometimes the issue isn't the partner but the family. Families with enmeshment issues may reject anyone who isn't sufficiently deferential. Families with control dynamics may oppose any partner who threatens their influence over you. And families with explicit or implicit biases (racial, religious, class-based) may reject partners who don't fit their picture of acceptable.

The goal isn't necessarily getting your family to love your partner or ditching the partner to please your family. It's understanding the actual dynamics at play and making conscious choices about how to navigate them.`,
      keyInsights: [
        { 
          title: 'Consider the feedback', 
          explanation: 'When multiple people who love you have concerns about your relationship, it\'s worth examining why. This doesn\'t mean they\'re right - but reflexively dismissing all feedback isn\'t wise either.' 
        },
        { 
          title: 'The problem might be the family', 
          explanation: 'Some families oppose any partner because of their own dysfunction: enmeshment, control, bias. If the concern is "they\'re taking you away from us," that\'s about the family, not the partner.' 
        },
        { 
          title: 'Your partner is your choice', 
          explanation: 'Ultimately, who you partner with is your decision. You can listen to family input while still making your own choice. They don\'t have to approve; they have to be respectful.' 
        },
        { 
          title: 'Set expectations, not ultimatums', 
          explanation: 'You can require your family to be civil without requiring them to be enthusiastic. "You don\'t have to like them, but you do have to be respectful" is a reasonable standard.' 
        },
      ],
      whatHelps: [
        'Honestly evaluate: could the concerns have merit? What would your best friend say?',
        'Identify what specifically bothers your family - articulated reasons can be addressed',
        'Determine if the issue is partner-specific or if they\'d reject anyone',
        'Set clear expectations: respect is required, enthusiasm is preferred but optional',
        'Don\'t triangulate - don\'t vent about your partner to family or vice versa',
        'Accept that some families will never come around, and that\'s not your failure',
      ],
    },
    reflectionQuestions: [
      'What specifically does your family object to about your partner?',
      'Is there any validity to their concerns? What would an objective observer say?',
      'What would your family need to see to accept your partner - and is that reasonable to ask of your partner?',
    ],
    relatedLessons: ['hm-rel-enmeshment', 'hm-rel-intercultural-relationships', 'hm-rel-boundaries-protect'],
  },
  {
    id: 'hm-rel-toxic-family-holidays',
    title: 'Surviving Toxic Family Gatherings',
    category: 'relationships',
    duration: 7,
    emoji: '🎄",
    content: {
      introduction: `For people from difficult families, holidays and family gatherings aren't joyful reunions - they're emotional endurance tests. The pressure to perform family harmony, the regression to childhood dynamics, the proximity to people who harm you, the impossible expectations - it's no wonder so many people dread what's supposed to be \"the happiest time of year.\"

The first step is releasing the fantasy. If your family has never been functional during gatherings, this year won't magically be different. Hoping for warmth when history predicts conflict only sets you up for disappointment. Managing expectations isn't pessimism - it's protection.

You have more options than you might realize. You can limit the duration of visits. You can stay in a hotel instead of the family home. You can decide which gatherings to attend and which to skip. You can bring a supportive partner or friend as buffer. You can plan self-care before, during, and after. You can, if necessary, create your own traditions with people who actually feel like family.

The guilt will likely come. \"But it's family." "But it's Christmas.\" The guilt is part of the dysfunction, not evidence that you're wrong. Protecting yourself from predictable harm isn't betrayal - it's survival.`,
      keyInsights: [
        { 
          title: 'Holidays amplify existing dynamics', 
          explanation: 'Whatever issues exist in your family get intensified by holiday pressure, alcohol, close quarters, and expectations of forced joy. If gatherings are hard, holidays are harder.' 
        },
        { 
          title: 'You regress', 
          explanation: 'Family systems pull you back into old roles. The boundaries you\'ve built as an adult can dissolve when you\'re back at your childhood table. This regression is normal - and you can prepare for it.' 
        },
        { 
          title: 'Obligation isn\'t the same as desire', 
          explanation: 'Attending because you "have to" breeds resentment. If you go, make it a conscious choice with clear self-protection strategies. If attending causes significant harm, you can choose not to.' 
        },
        { 
          title: 'You can create new traditions', 
          explanation: 'Chosen family, solo time, volunteering, traveling - there are many ways to spend holidays that don\'t involve subjecting yourself to dysfunction.' 
        },
      ],
      whatHelps: [
        'Lower expectations: don\'t hope this time will be different if history says otherwise',
        'Plan logistics that give you control: your own transportation, hotel option, set departure time',
        'Identify a support person to debrief with during or after',
        'Prepare responses for predictable difficult conversations or comments',
        'Have a self-care plan: walks, breaks, early bedtime, whatever helps you regulate',
        'Give yourself permission to skip, limit, or modify participation',
      ],
    },
    reflectionQuestions: [
      'What makes family gatherings difficult for you specifically?',
      'What boundaries or logistics could make gatherings more bearable?',
      'If you could redesign holidays to actually suit you, what would that look like?',
    ],
    relatedLessons: ['hm-rel-difficult-people', 'hm-rel-boundaries-protect', 'hm-rel-enmeshment'],
  },
  {
    id: 'hm-rel-reproductive-coercion',
    title: 'Family Pressure About Children: To Have or Not Have',
    category: 'relationships',
    duration: 8,
    emoji: '👶",
    content: {
      introduction: `\"When are you having kids?\" may be the most invasive question people ask casually, as if it's their business. For people who are childfree by choice, struggling with infertility, not financially or emotionally ready, or ambivalent, this pressure from family and society is exhausting. Your reproductive choices are yours - but family often doesn't see it that way.

Childfree people face persistent assumptions that they'll change their minds, that they're selfish, or that their lives are incomplete. This dismissal of a legitimate life choice reflects pronatalist cultural bias more than reality. Research shows childfree people are no less happy than parents - often happier, by some measures.

For those struggling with infertility, family pressure adds injury to injury. The questions remind you of painful reality. The suggestions (\"just relax,\" \"have you tried...\") minimize the complexity. The assumption that of course you want children forces you to either disclose private medical struggles or absorb assumptions about your choices.

Setting boundaries about reproductive topics is challenging when family feels entitled to weigh in. But your reproductive life - whether you have children, when, how many, through what means - is fundamentally not their decision.`,
      keyInsights: [
        { 
          title: "Reproductive choices are personal', 
          explanation: 'Who has children and how many is not a family decision, a cultural obligation, or open for debate. It\'s a deeply personal choice belonging to the individuals involved.' 
        },
        { 
          title: 'Childfree is a valid choice', 
          explanation: 'Not wanting children isn\'t a phase, selfishness, or something you\'ll regret. It\'s one legitimate way to live. Studies show childfree people aren\'t less fulfilled than parents.' 
        },
        { 
          title: 'Pressure compounds struggle', 
          explanation: 'For those facing infertility, loss, or ambivalence, family pressure doesn\'t motivate - it wounds. Every "when are you having kids?" is a reminder of something painful.' 
        },
        { 
          title: 'Boundaries may require firmness', 
          explanation: 'Because family often feels entitled to this information, polite deflection may not work. Firm boundaries ("I won\'t discuss this topic") may be necessary.' 
        },
      ],
      whatHelps: [
        'Prepare responses: "We won\'t be discussing that" or a subject change',
        'Decide how much to share - you don\'t owe anyone your medical history',
        'Find community: childfree groups or infertility support as relevant',
        'Challenge internalized pronatalist messaging - one life path isn\'t superior',
        'Recognize when family pressure crosses into coercion and name it',
        'Therapy can help process ambivalence, grief, or external pressure',
      ],
    },
    reflectionQuestions: [
      'What pressure do you feel from family about children? How does it affect you?',
      'What do YOU actually want, separate from family/social expectations?',
      'What boundaries do you need to set to protect yourself around this topic?',
    ],
    relatedLessons: ['hm-rel-boundaries-protect', 'hm-rel-cultural-religious-pressure', 'hm-trans-identity-shifts'],
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
    emoji: '🌧️",
    content: {
      introduction: `Depression isn't sadness. Sadness is a normal emotion with a beginning, middle, and end. Depression is a disorder that flattens everything - not just your mood, but your energy, motivation, sleep, appetite, concentration, and sense of self. It's not "being sad" that you should "snap out of." It's a neurobiological state that requires intervention.

The symptoms can be confusing because they don't always look like the stereotype. Sometimes depression looks like irritability, not tears. Sometimes it's numbness, not sadness. Sometimes it's exhaustion, not crying in bed. Sometimes you can still function at work while feeling hollow inside. \"High-functioning depression\" is still depression.

Depression lies. It tells you this is permanent. It tells you you're a burden. It tells you nothing will help. It tells you people would be better off without you. These are symptoms of the illness, not truths about reality. The cruelest thing about depression is that it attacks the very parts of you that could seek help - motivation, hope, self-worth.

Treatment works for most people. Medication helps many. Therapy helps many. The combination helps most. Exercise, sleep, connection, and meaning matter too. But first: recognizing depression for what it is - a treatable condition, not a character flaw.`,
      keyInsights: [
        { 
          title: "Depression lies', 
          explanation: 'The hopelessness, worthlessness, and belief that nothing will help are symptoms of the disorder. They feel like truth because depression hijacks the parts of your brain that evaluate reality.' 
        },
        { 
          title: 'It\'s neurobiological', 
          explanation: 'Brain chemistry, inflammation, neural pathways, genetics - depression is a medical condition. You wouldn\'t tell someone with diabetes to "just think positive."' 
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
        'Professional help - therapy (especially CBT, behavioral activation), medication, or both',
        'Behavioral activation - doing things even when you don\'t feel like it, because feeling follows action',
        'Protect sleep even when it\'s disrupted',
        'Movement, even small amounts',
        'Connection, even when you want to isolate',
        'Reduce decision fatigue - structure helps when motivation is gone',
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
    triggerGauges: ['emotion', 'direction'],
    triggerThreshold: 35,
    triggerMode: 'any',
  },
  {
    id: 'hm-mh-anxiety-types',
    title: 'Anxiety: When the Alarm Won\'t Stop',
    category: 'mental-health',
    duration: 8,
    emoji: '⚡",
    content: {
      introduction: `Anxiety is your threat-detection system stuck in \"on\" position. It evolved to keep you alive - to notice danger and respond quickly. The problem is that your ancient alarm system can't tell the difference between a bear attack and an email from your boss. It responds to uncertainty, social evaluation, and \"what ifs\" with the same intensity as physical danger.

There are many flavors of anxiety: Generalized Anxiety Disorder (constant worry about everything), Social Anxiety (fear of judgment), Panic Disorder (sudden intense panic attacks), Health Anxiety (constant worry about illness), and more. They share a common thread: the alarm is too sensitive, fires too often, or won't turn off.

Anxiety becomes a disorder when it significantly impairs your life - when you're avoiding things, when your worry is disproportionate to actual risk, when physical symptoms are constant, when you can't stop the loop no matter what you try. The threshold isn't "any anxiety is bad" - it's "this anxiety is no longer serving me and is actively harming me."

The good news: anxiety is highly treatable. Exposure therapy, cognitive behavioral therapy, medication, and nervous system regulation techniques all have strong evidence. The bad news: untreated anxiety tends to expand. The things you avoid grow.`,
      keyInsights: [
        { 
          title: 'Avoidance makes it worse', 
          explanation: 'When you avoid something anxiety-provoking, your brain learns "that was dangerous, good thing I avoided it." The anxiety grows. Gradual exposure is the opposite approach - teaching your brain that the feared situation is survivable.' 
        },
        { 
          title: 'The body drives anxiety, not just thoughts', 
          explanation: 'Racing heart, shallow breathing, tight muscles - these aren\'t just symptoms of anxiety, they also cause it. Regulating the body can interrupt the cycle even when your mind keeps spinning.' 
        },
        { 
          title: 'Anxiety and excitement feel identical', 
          explanation: 'The physical sensations are the same - your interpretation makes the difference. Sometimes "I\'m anxious" can be reframed as "I\'m excited." It doesn\'t always work, but when it does, it helps.' 
        },
        { 
          title: 'Worry is not problem-solving', 
          explanation: 'Worry feels productive because your brain is working hard. But you\'re not solving anything - you\'re rehearsing catastrophe. Effective problem-solving has an endpoint. Worry loops forever.' 
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
      professionalNote: 'If anxiety is significantly impairing your life - if you\'re avoiding important things, if physical symptoms are constant, if you can\'t control the worry - please see a professional. Anxiety responds very well to treatment.'
    },
    reflectionQuestions: [
      'What are you avoiding because of anxiety? How has that avoidance grown over time?',
      'What would your life look like if anxiety had less power over your decisions?',
      'Where do you feel anxiety in your body? Can you notice it without trying to fix it?',
    ],
    relatedLessons: ['hm-mh-panic-attacks', 'hm-stress-nervous-system', 'hm-body-chronic'],
    triggerGauges: ['state'],
    triggerThreshold: 40,
    triggerMode: 'any',
  },
  {
    id: 'hm-mh-suicidal-thoughts',
    title: 'Suicidal Thoughts: You\'re Not Alone',
    category: 'mental-health',
    duration: 10,
    emoji: '🆘",
    content: {
      introduction: `Having thoughts of suicide doesn't make you crazy, weak, or broken. It makes you human in pain. Suicidal ideation exists on a spectrum - from passive thoughts (\"I wouldn't mind if I didn't wake up\") to active plans with intent. All points on this spectrum deserve attention and care, but they require different levels of intervention.

The stigma around suicidal thoughts prevents people from talking about them, which is exactly the wrong thing. Thoughts that stay hidden grow in power. Speaking them - to a therapist, a crisis line, sometimes a trusted person - reduces their grip. Talking about suicide doesn't \"plant the idea\" - research has thoroughly debunked this myth. Talking about it saves lives.

Suicidal thoughts often emerge when pain exceeds coping resources. The solution isn't always to reduce the pain (though that helps). It's also to increase coping resources: support, skills, meaning, connection, treatment. When the balance tips back, the thoughts often recede.

If you're having these thoughts, please know: this state is temporary, even though it doesn't feel that way. Treatment works. People survive this and go on to live meaningful lives. The thought that everyone would be better off without you is a symptom of the pain, not an accurate assessment of reality.`,
      keyInsights: [
        { 
          title: 'It\'s a symptom, not a character trait', 
          explanation: 'Suicidal thoughts are symptoms of overwhelming pain - not evidence that you\'re fundamentally flawed. Like other symptoms, they can be treated.' 
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
        'Tell someone - a therapist, crisis line, trusted person',
        'Create distance from means (research shows this saves lives)',
        'Crisis resources: 988 (US), Crisis Text Line (text HOME to 741741)',
        'Write a "reasons to live" list when you\'re NOT in crisis - use it during crisis',
        'Make a safety plan with a professional',
        'Remember: this feeling is temporary, even when it feels permanent',
      ],
      warningSign: 'If you have a plan and intent, this is a crisis. Please call 988, go to an emergency room, or call emergency services. This is not weakness - this is using the resources designed for exactly this moment.',
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
    emoji: '💨",
    content: {
      introduction: `A panic attack feels like dying. Racing heart, chest pain, difficulty breathing, dizziness, tingling, sweating, shaking, a sense of doom - your body is fully convinced something catastrophic is happening. But here's the crucial truth: panic attacks, while terrifying, are not medically dangerous. They cannot cause heart attacks, make you stop breathing, make you go crazy, or kill you.

Panic attacks are your fight-or-flight system misfiring with full intensity. All the symptoms are just adrenaline and stress hormones doing what they're designed to do when you face mortal danger. The problem is there's no actual danger - just your alarm system gone haywire.

Understanding this is the first step to reducing panic's power. When you're in a panic attack and you add fear of the panic attack itself, it escalates. When you can recognize \"this is a panic attack, it's awful but not dangerous, and it will pass" - you've interrupted the escalation cycle.

Panic disorder develops when you start fearing and avoiding situations where panic might strike. The avoidance seems protective but actually trains your brain that those situations ARE dangerous. Treatment focuses on breaking this cycle through exposure and learning that panic, while miserable, is survivable.`,
      keyInsights: [
        { 
          title: 'Panic is miserable but not dangerous', 
          explanation: 'No one has ever died from a panic attack. Your heart won\'t stop. You won\'t stop breathing. You won\'t go crazy. Your body is doing exactly what it\'s designed to do - just at the wrong time.' 
        },
        { 
          title: 'Fear of panic feeds panic', 
          explanation: 'The panic about having panic creates a feedback loop. Learning to tolerate panic - to let it happen without fighting - paradoxically reduces its power.' 
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
      professionalNote: 'If panic attacks are recurrent and you\'re avoiding situations because of them, please see a professional. Panic disorder responds extremely well to treatment - most people recover fully.'
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
    emoji: '🌪️",
    content: {
      introduction: `Trauma isn't defined by the event - it's defined by how your nervous system responded to it. Two people can experience the same event; one walks away shaken but okay, the other develops lasting symptoms. This isn't weakness or strength - it's about circumstances, support, prior history, and biology.

Trauma occurs when your nervous system gets overwhelmed and can't complete its natural stress response. The event gets encoded differently - fragments of sensory memory without the normal narrative structure. That's why trauma survivors have flashbacks rather than regular memories, why triggers hit like time machines, why the body keeps reacting as if the past is happening now.

Not all difficult experiences are trauma. Trauma has a specific neurobiological signature: the memory remains "hot," easily triggered, poorly integrated into your life story. It intrudes through flashbacks, nightmares, and physical symptoms. It leads to avoidance, hypervigilance, and changes in how you see yourself and the world.

The good news: trauma is one of the most treatable conditions we know how to treat. The brain can heal. New neural pathways can form. The hot memory can be cooled and integrated. People recover and go on to live full lives. But recovery requires the right approach - not just "talking about it" but specialized trauma therapy.`,
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
          explanation: 'Trauma shrinks your window - the range where you can cope. Too much stimulation pushes you into hyperarousal (panic, rage). Too little drops you into hypoarousal (shutdown, numbing). Healing expands the window.' 
        },
        { 
          title: 'Recovery is possible', 
          explanation: 'The brain\'s plasticity means trauma responses can change. With proper treatment, intrusive symptoms decrease, triggers lose their power, and life expands again.' 
        },
      ],
      whatHelps: [
        'Trauma-specific therapy: EMDR, Somatic Experiencing, CPT, prolonged exposure',
        'Safety first - you need enough stability before processing',
        'Body-based approaches: yoga, breathing, movement',
        'Self-compassion - trauma responses were survival, not weakness',
        'Time AND treatment (time alone doesn\'t heal all wounds)',
        'Community and connection - isolation worsens trauma effects',
      ],
      professionalNote: 'If you have intrusive symptoms (flashbacks, nightmares, physical reactions to triggers), please see a trauma-specialized therapist. Not all therapy is equipped for trauma work.'
    },
    reflectionQuestions: [
      'Do you have experiences that still feel "hot" - easily triggered, intrusive?',
      'What did your nervous system have to do to survive? Can you offer that part of you compassion?',
      'What would healing look like for you - not erasing the past, but integrating it?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-stress-freeze-response', 'hm-world-generational'],
    triggerGauges: ['state', 'emotion'],
    triggerThreshold: 35,
    triggerMode: 'stabilization',
  },
  {
    id: 'hm-mh-medication-misconceptions',
    title: 'Psychiatric Medication: Facts vs. Fear',
    category: 'mental-health',
    duration: 7,
    emoji: '💊",
    content: {
      introduction: `There's more stigma around psychiatric medication than almost any other type of medicine. People who would take blood pressure medication without shame feel embarrassed about antidepressants. People worry medication will \"change who they are\" or become a \"crutch.\" Let's address these fears with facts.

Psychiatric medications work on brain chemistry - neurotransmitters, receptors, neural pathways. They don't give you a fake version of happiness. They correct chemical imbalances that are making your normal brain function impossible. For many people, medication provides the floor of stability needed to do the work of therapy and lifestyle change.

Yes, finding the right medication can take time. Side effects are real and worth discussing with your doctor. Some medications require careful management. But these are medical decisions to make with professionals, not reasons to reject an entire category of treatment that helps millions of people function.

Medication isn't for everyone, and it's not the only treatment. But refusing to consider it because of stigma - when you might benefit - is letting shame make medical decisions for you.`,
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
          title: 'It\'s not a crutch - or so what if it is', 
          explanation: 'If a crutch helps you walk, use the crutch. Some people need medication short-term; some need it forever. Both are okay. Function matters more than ideological purity.' 
        },
        { 
          title: 'Finding the right one takes time', 
          explanation: 'Psychiatric medication often requires trial and adjustment. This isn\'t evidence it doesn\'t work - it\'s evidence that brain chemistry is individual. Patience and communication with your doctor are key.' 
        },
      ],
      whatHelps: [
        'Get informed - learn about what specific medications do and their evidence base',
        'Find a good prescriber - psychiatrists specialize in this; primary care doctors can help but have less specialized training',
        'Give medication time - most take 4-6 weeks to show full effect',
        'Track your symptoms - this helps you and your doctor assess what\'s working',
        'Don\'t stop abruptly - most psychiatric medications need to be tapered under medical supervision',
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
    emoji: '💭",
    content: {
      introduction: `Everyone has intrusive thoughts - sudden, unwanted thoughts that pop into your mind, often disturbing or against your values. The new parent who imagines dropping the baby. The kind person who has violent flashes. The religious person with blasphemous thoughts. These thoughts don't mean anything about who you are. They're neural noise.

The brain generates thousands of thoughts a day, most of which we don't notice or take seriously. Intrusive thoughts become a problem not because of their content but because of how we respond to them. When you take them as meaningful - \"I must be a terrible person for thinking this\" - you give them power. When you try to suppress them, they come back stronger.

Intrusive thoughts are especially common in OCD, anxiety, depression, and postpartum periods. They become clinical problems when they cause significant distress, when you can't stop engaging with them, or when they lead to compulsive behaviors to \"neutralize\" them.

The counterintuitive solution: let the thoughts come without fighting them. Notice them, label them (\"oh, there's an intrusive thought"), and let them pass. Don't engage, analyze, or try to make them stop. Thoughts don't require response.`,
      keyInsights: [
        { 
          title: "Having a thought doesn\'t mean you want it', 
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
        'Let it pass without engaging - don\'t analyze, don\'t confess, don\'t seek reassurance',
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
  {
    id: 'hm-mh-ptsd-vs-cptsd',
    title: 'PTSD vs Complex PTSD: Different Wounds, Different Healing',
    category: 'mental-health',
    duration: 10,
    emoji: '🌊",
    content: {
      introduction: `Post-Traumatic Stress Disorder (PTSD) and Complex PTSD (C-PTSD) both emerge from trauma, but they're different conditions requiring different approaches. Understanding which you're dealing with matters because the wrong treatment can be ineffective or even harmful.

PTSD typically develops from single-incident traumas: accidents, assaults, disasters, combat events - experiences that were overwhelming but had clear beginnings and endings. The hallmarks are intrusive re-experiencing (flashbacks, nightmares), avoidance of reminders, hypervigilance, and negative changes in mood and cognition. The treatment is well-established: trauma-focused therapies like EMDR and Prolonged Exposure that help process the specific traumatic memory.

Complex PTSD, recognized by the WHO's ICD-11, develops from prolonged, repeated trauma - typically during childhood, in captivity, or in situations where escape wasn't possible. It includes everything in PTSD plus three additional features: difficulties regulating emotions, persistent negative self-concept (\"I'm fundamentally damaged"), and disturbances in relationships. C-PTSD shapes who you believe you are and how you relate to others at a foundational level.

The distinction matters because C-PTSD requires more than processing memories. It requires rebuilding a sense of self, learning emotional regulation skills that weren't developed in childhood, and slowly creating new templates for safe connection. This is longer, deeper work - often measured in years rather than months.`,
      keyInsights: [
        { 
          title: 'PTSD: an event that overwhelmed you', 
          explanation: 'PTSD forms around specific traumatic events. The memory got stuck and keeps intruding. Treatment focuses on processing that memory until it becomes a regular memory instead of a live wound.' 
        },
        { 
          title: 'C-PTSD: an environment that shaped you', 
          explanation: 'C-PTSD comes from chronic, inescapable trauma - often in childhood. It\'s not just a stuck memory; it\'s a stuck sense of self. You internalized that the world is dangerous and you are broken.' 
        },
        { 
          title: 'The three additions in C-PTSD', 
          explanation: 'Emotional dysregulation (intense, hard-to-control emotions), negative self-concept (deep shame, feeling fundamentally defective), and relationship difficulties (trouble trusting, patterns of unhealthy relationships).' 
        },
        { 
          title: 'Different treatment needs', 
          explanation: 'PTSD can often be treated in 12-16 sessions of trauma-focused therapy. C-PTSD usually requires phased treatment: stabilization first, then trauma processing, then integration. Jumping to trauma processing too fast can destabilize.' 
        },
        {
          title: 'You can have both',
          explanation: 'Someone with C-PTSD might also have PTSD from a specific event layered on top. Treatment needs to address both the developmental trauma and the specific incident.'
        }
      ],
      whatHelps: [
        'Get proper assessment - which kind of trauma response are you dealing with?',
        'For PTSD: evidence-based trauma therapies (EMDR, CPT, PE)',
        'For C-PTSD: phased treatment starting with safety and stabilization',
        'Learn emotional regulation skills before diving into trauma processing',
        'Work with a therapist trained in complex trauma (look for training in IFS, NARM, or similar)',
        'Be patient - C-PTSD took years to develop and takes time to heal',
      ],
      warningSign: 'If you\'re experiencing severe dissociation, self-harm urges, or suicidal thoughts, please prioritize safety and reach out to a crisis line or mental health professional before beginning trauma processing.',
      professionalNote: 'Judith Herman\'s book "Trauma and Recovery" is foundational reading on C-PTSD. Look for therapists trained in complex trauma who understand phased treatment - not all trauma therapists specialize in this.'
    },
    reflectionQuestions: [
      'Is your trauma more like a specific event that overwhelmed you, or an environment that shaped who you are?',
      'Do you struggle with emotional regulation, negative self-image, and relationship patterns in addition to trauma symptoms?',
      'What phase of healing do you think you\'re in - still needing stabilization, or ready to process?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-mh-dissociation', 'hm-mh-developmental-trauma'],
  },
  {
    id: 'hm-mh-childhood-emotional-neglect',
    title: 'Childhood Emotional Neglect: The Invisible Wound',
    category: 'mental-health',
    duration: 9,
    emoji: '👻",
    content: {
      introduction: `Childhood Emotional Neglect (CEN) is what didn't happen. Not abuse - absence. Not violence - void. It's growing up with parents who failed to notice, respond to, or validate your emotional experience. They might have been loving in other ways. They might have provided everything material. But your emotions were consistently unwitnessed, dismissed, or simply not seen.

CEN is particularly insidious because there's nothing to point to. No bruises, no obvious dysfunction, often no intention to harm. Your parents might have done their best - and still left you emotionally alone. This makes it hard to recognize: "My childhood was fine, so why do I feel this way?" The answer is that something crucial was missing, not that something was added.

The effects are profound. As Dr. Jonice Webb's research shows, CEN adults often feel empty, disconnected, self-blaming, and fundamentally different from others. They struggle to identify and express emotions, have difficulty with self-care and self-compassion, and often feel like something is wrong with them without knowing what. They learned their emotions don't matter - so they stopped trusting them.

The healing path involves learning what was supposed to happen: that emotions are valid information, that your needs matter, that you deserve attunement. This is essentially reparenting yourself - giving your emotional self what it never received. It's learnable, but it takes time to rewire what decades of neglect installed.`,
      keyInsights: [
        { 
          title: 'Absence is hard to see', 
          explanation: 'You can\'t remember what didn\'t happen. This is why CEN survivors often say "my childhood was fine" while carrying deep wounds. The absence of attunement leaves no explicit memory, just a persistent sense of something missing.' 
        },
        { 
          title: 'Well-meaning parents can still neglect', 
          explanation: 'CEN often isn\'t intentional. Parents may have been dealing with their own issues, working long hours, emotionally unavailable due to their own wounds. Understanding this doesn\'t erase your wound - it just explains it.' 
        },
        { 
          title: 'You learned emotions don\'t matter', 
          explanation: 'When your emotions were consistently unnoticed, you internalized that they\'re not important. This leads to alexithymia (difficulty identifying emotions), ignoring your own needs, and poor self-care.' 
        },
        { 
          title: 'The fatal flaw feeling', 
          explanation: 'CEN often creates a persistent sense that something is fundamentally wrong with you - without being able to name what. This vague brokenness is actually the absence of emotional validation leaving its mark.' 
        },
      ],
      whatHelps: [
        'Recognize it: naming CEN is often the first breakthrough',
        'Learn to identify emotions - start with basic feeling wheels and body sensations',
        'Practice self-compassion - treat yourself as you would a dear friend',
        'Ask "what do I need?" regularly and actually respond',
        'Seek out attuned relationships - experiences of being seen and validated',
        'Read "Running on Empty" by Jonice Webb for deep understanding',
      ],
      professionalNote: 'Therapists trained in attachment, emotion-focused work, or reparenting approaches can help heal CEN. The therapy relationship itself becomes a corrective emotional experience.'
    },
    reflectionQuestions: [
      'When you were upset as a child, what happened? Were your emotions noticed, validated, helped?',
      'Do you struggle to know what you\'re feeling or what you need?',
      'Do you carry a sense that something is wrong with you, without being able to name what?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-growth-reparenting', 'hm-mh-developmental-trauma'],
  },
  {
    id: 'hm-mh-developmental-trauma',
    title: 'Developmental Trauma: When Childhood Wasn\'t Safe',
    category: 'mental-health',
    duration: 10,
    emoji: '🧒',
    content: {
      introduction: `Developmental trauma occurs when chronic adversity happens during the formative years of brain development - roughly ages 0-25, with the most sensitive periods in early childhood. Unlike single-event trauma, developmental trauma shapes the brain's architecture itself. It doesn't just create memories; it creates neural pathways, stress response patterns, and attachment templates that become the foundation for everything else.

Dr. Bruce Perry's neurosequential model shows how trauma affects the brain differently depending on when it occurs. Trauma in infancy affects the brainstem (regulation, arousal). Trauma in early childhood affects the limbic system (relationships, emotional regulation). Trauma in later childhood affects the cortex (thinking, learning, self-reflection). The earlier the trauma, the more fundamental the impact.

What constitutes developmental trauma? Abuse (physical, emotional, sexual). Neglect. Witnessing violence. Unpredictable caregiving. Loss of primary caregivers. Household dysfunction (mental illness, addiction, incarceration, domestic violence). Medical procedures. Bullying. Immigration and displacement. Poverty. Discrimination. The ACE (Adverse Childhood Experiences) research documented how common these experiences are and how profoundly they affect lifelong health.

The good news: the brain remains plastic throughout life. Developmental trauma can be healed - not erased, but rewired. It requires experiences of safety, regulation, and connection that were missing in childhood. The brain that was shaped by adversity can be reshaped by corrective experiences. This is the science of hope.`,
      keyInsights: [
        { 
          title: 'It shapes the architecture', 
          explanation: 'Developmental trauma doesn\'t just create bad memories - it shapes how the brain develops. Stress responses, attachment patterns, and emotional regulation capacities are built differently when safety is absent.' 
        },
        { 
          title: 'Earlier = deeper', 
          explanation: 'Trauma before age 3 often has no explicit memory but profound impacts on regulation and attachment. You might not remember, but your body does.' 
        },
        { 
          title: 'ACEs are incredibly common', 
          explanation: 'The ACE study found nearly two-thirds of adults have at least one adverse childhood experience. You\'re not alone, and this isn\'t rare.' 
        },
        { 
          title: 'Healing requires relational experiences', 
          explanation: 'Because developmental trauma happens in relationship, it heals in relationship. Therapy, attuned relationships, and corrective experiences literally change neural pathways.' 
        },
        {
          title: 'The body remembers what the mind forgets',
          explanation: 'Pre-verbal trauma lives in the body and nervous system. This is why talk therapy alone often isn\'t enough - somatic approaches help access what words can\'t reach.'
        }
      ],
      whatHelps: [
        'Learn about your history through the ACE framework',
        'Somatic therapies (Somatic Experiencing, sensorimotor psychotherapy) for body-held trauma',
        'Attachment-focused therapy for relational wounds',
        'Polyvagal-informed approaches for nervous system regulation',
        'Consistent, safe relationships that provide corrective experiences',
        'Be patient - this is rewiring, not quick fixes',
      ],
      professionalNote: 'Look for therapists trained in developmental trauma specifically. "Developmental Trauma Disorder" isn\'t in the DSM yet, but specialists understand this framework. Dr. Bessel van der Kolk\'s "The Body Keeps the Score" is essential reading.'
    },
    reflectionQuestions: [
      'What was the emotional environment of your earliest years, as much as you know?',
      'How many ACEs do you have? What impact might they have had?',
      'What experiences of safety, regulation, and connection have been corrective for you?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-mh-childhood-emotional-neglect', 'hm-rel-attachment-styles'],
  },
  {
    id: 'hm-mh-sexual-trauma',
    title: 'Sexual Trauma: The Body Keeps the Score',
    category: 'mental-health',
    duration: 11,
    emoji: '💜',
    content: {
      introduction: `Sexual trauma - assault, abuse, coercion, violations of consent - leaves marks that extend beyond memory into the body itself. This is where van der Kolk's phrase \"the body keeps the score\" is most viscerally true. Survivors often experience bodily intrusions: sensations, tension patterns, reactions during intimacy, and physical symptoms that seem disconnected from conscious memory but are deeply connected to what the body endured.

The spectrum of sexual trauma is wide: childhood sexual abuse, rape, date rape, coerced sex in relationships, unwanted sexual contact, sexual harassment, and violations that may not fit neat categories but still left wounds. The impact doesn't always correlate with the \"severity\" of the event - what matters is how your system experienced it. A \"minor\" incident can be deeply traumatic; a \"major\" one might be processed with less lasting impact. Your response is valid regardless.

Sexual trauma often creates complex relationships with the body, sexuality, and intimacy. Some survivors disconnect from their bodies entirely. Some experience compulsive sexuality. Some freeze during intimate moments. Some find certain touches, positions, or situations triggering decades later. These are not dysfunction - they are the body's memory and protection system.

Healing is possible, but it requires approaches that include the body, not just the mind. Talk therapy alone often can't reach what is held somatically. The body needs to complete the defensive responses it couldn't complete during the trauma. It needs to learn safety again through experience, not just understanding.`,
      keyInsights: [
        { 
          title: "The body holds what the mind may not remember', 
          explanation: 'Sexual trauma often involves dissociation during the event, meaning explicit memory may be fragmented or absent while the body stores the experience in sensations, tension, and reflexive responses.' 
        },
        { 
          title: 'Response during trauma isn\'t choice', 
          explanation: 'Freeze responses, submission, even physical arousal during assault are automatic nervous system responses - not consent or enjoyment. This confusion adds to shame, but your body was doing what it had to do to survive.' 
        },
        { 
          title: 'Impacts on sexuality vary widely', 
          explanation: 'Some survivors lose interest in sex; others become hypersexual. Some can\'t tolerate certain acts; others reenact trauma. There\'s no "right" response - all are ways the psyche tries to cope.' 
        },
        { 
          title: 'Triggers can be very specific', 
          explanation: 'A scent, a position, a phrase, a touch - the body may react to things that consciously seem unrelated to the trauma. These are body memories, not irrationality.' 
        },
        {
          title: 'Relationships require special navigation',
          explanation: 'Intimacy with partners requires communication, patience, and understanding. Safe partners learn what helps and what doesn\'t. Healing often happens through experiences of safe, boundaried intimacy.'
        }
      ],
      whatHelps: [
        'Somatic therapies (Somatic Experiencing, EMDR) that address the body\'s experience',
        'Trauma-sensitive yoga and movement practices',
        'Therapists specializing in sexual trauma specifically',
        'Take back your body: practices that help you feel embodied and in control',
        'Communicate with partners about triggers and needs',
        'Go at your own pace - you get to decide when, how, and if you address this',
      ],
      warningSign: 'If you\'re experiencing severe dissociation, self-harm, eating disorders, or substance use connected to sexual trauma, please seek specialized support. RAINN (1-800-656-4673) offers confidential support.',
      professionalNote: 'Seek therapists with specific training in sexual trauma. General trauma training isn\'t always sufficient. Organizations like RAINN can help connect you with specialized resources.'
    },
    reflectionQuestions: [
      'How does your body respond during intimacy or when triggered? What might it be trying to tell you?',
      'What beliefs about yourself, your worth, or your body came from this experience?',
      'What does safety in your body feel like? When have you experienced it?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-mh-dissociation', 'hm-mh-freeze-response'],
  },
  {
    id: 'hm-mh-medical-trauma',
    title: 'Medical Trauma: When Healthcare Hurts',
    category: 'mental-health',
    duration: 8,
    emoji: '🏥",
    content: {
      introduction: `Medical trauma is a paradox: the systems designed to help can also wound. Invasive procedures, lack of informed consent, dismissal of pain, medical emergencies, life-threatening diagnoses, procedures done without adequate anesthesia, traumatic births, ICU stays, chronic illness management - all of these can leave lasting psychological marks.

What makes medical trauma particularly complex is that it often involves well-meaning people doing necessary things. The surgery that saved your life also traumatized you. The procedure that was medically routine was experienced by your nervous system as assault. This creates cognitive dissonance: how can you be grateful AND traumatized? The answer is: both are true simultaneously.

Medical trauma is often unrecognized because we frame healthcare as inherently good. Patients who are traumatized may be seen as \"difficult\" or \"overreacting.\" The medical system itself may not acknowledge its capacity to harm even while helping. This lack of recognition compounds the trauma - you can't heal what isn't acknowledged.

The impacts include healthcare avoidance (which can endanger health), panic during procedures, chronic mistrust of providers, PTSD symptoms triggered by medical settings, and complicated relationships with your own body and its vulnerabilities. Understanding medical trauma helps you advocate for trauma-informed care and process experiences that have been affecting you.`,
      keyInsights: [
        { 
          title: 'Healing and harming can coexist', 
          explanation: 'A medically necessary procedure can still be psychologically traumatic. Being grateful for the outcome doesn\'t erase the distress of the experience. Both truths can exist.' 
        },
        { 
          title: 'Your nervous system doesn\'t know "it\'s for your own good"', 
          explanation: 'The body responds to threat. Invasive procedures, pain, loss of control, and vulnerability trigger survival responses regardless of the intent behind them.' 
        },
        { 
          title: 'Healthcare avoidance makes sense', 
          explanation: 'If medical settings became associated with trauma, avoidance is your nervous system protecting you. It\'s problematic for health but understandable as a trauma response.' 
        },
        { 
          title: 'Dismissal compounds trauma', 
          explanation: 'Being told "it wasn\'t that bad" or having pain minimized adds another layer. Not being believed is traumatic on top of whatever happened.' 
        },
      ],
      whatHelps: [
        'Name it - medical trauma is real and valid',
        'Request trauma-informed care (explain your history, ask for accommodations)',
        'Bring support people to appointments',
        'Request pause words or signals during procedures',
        'Therapy to process specific medical experiences',
        'Gradual exposure to medical settings if avoidance is severe',
        'Find providers who take time and believe you',
      ],
      professionalNote: 'Trauma-informed healthcare is growing as a movement. You can ask providers if they have training in this area. Your trauma history is relevant medical information.'
    },
    reflectionQuestions: [
      'Have medical experiences left you with lasting fear or avoidance?',
      'What would you need from healthcare providers to feel safe?',
      'What accommodations might help you get necessary care despite medical trauma?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-body-chronic', 'hm-mh-birth-trauma'],
  },
  {
    id: 'hm-mh-birth-trauma',
    title: 'Birth Trauma: For Parents and Babies',
    category: 'mental-health',
    duration: 9,
    emoji: '👶',
    content: {
      introduction: `Birth can be traumatic - for the person giving birth, for partners who witness it, and even for infants. This reality gets buried under cultural expectations that birth is "natural" and new parenthood is "the happiest time." When the experience is terrifying, painful, out of control, or life-threatening, the gap between expectation and reality compounds the wound.

For birthing parents, trauma can stem from: emergency procedures, loss of control or autonomy, severe pain inadequately managed, feeling unheard by providers, fearing for your life or your baby's life, physical injury, and the cascade of interventions that can feel violating. Even births that end with healthy babies can be traumatic - outcome doesn't determine experience.

Partners and support people can be traumatized too. Witnessing someone you love in danger, feeling helpless, making terrifying decisions, holding fear alone - these leave marks. Partner trauma often goes unrecognized because focus is on the birthing person and baby.

Infants can experience birth trauma, especially with complicated deliveries. While they don't form explicit memories, the nervous system records the experience. Some practitioners believe early intervention can help, though this is a specialized field.

Postpartum PTSD is estimated to affect 4-6% of births, with higher rates for complicated deliveries. It often gets misdiagnosed as postpartum depression or anxiety, meaning proper treatment is delayed. Birth trauma deserves recognition and specialized support.`,
      keyInsights: [
        { 
          title: 'Healthy baby doesn\'t mean healthy experience', 
          explanation: ''All that matters is a healthy baby" dismisses the birthing person\'s experience. You can be grateful for your baby AND traumatized by how they arrived.' 
        },
        { 
          title: 'Loss of control is central', 
          explanation: 'Many birth traumas involve feeling out of control, unheard, or like things were done TO you rather than WITH you. Informed consent and autonomy matter.' 
        },
        { 
          title: 'Partners are affected too', 
          explanation: 'The person who watched their partner almost die, who held fear while trying to stay strong, who felt helpless - they need support and acknowledgment too.' 
        },
        { 
          title: 'It can affect bonding', 
          explanation: 'Trauma can complicate bonding with the baby. This is a symptom, not a character flaw. Addressing the trauma can help the relationship.' 
        },
      ],
      whatHelps: [
        'Tell your birth story - to a therapist, support group, or trusted person',
        'EMDR and other trauma therapies work for birth trauma',
        'Birth trauma support groups (Postpartum Support International)',
        'If bonding is affected, address it directly - attachment can be repaired',
        'Include partners in healing - their experience matters too',
        'For future births: create a trauma-informed birth plan, work with providers who understand',
      ],
      warningSign: 'If you\'re having intrusive thoughts of harm to yourself or your baby, please reach out immediately to Postpartum Support International (1-800-944-4773) or your healthcare provider.',
      professionalNote: 'Look for therapists specializing in perinatal mental health. Birth trauma treatment is a specialty, and generalists may not have the training needed.'
    },
    reflectionQuestions: [
      'If you experienced a traumatic birth, have you been able to tell your story fully?',
      'What did you need during birth that you didn\'t receive?',
      'If bonding has been affected, what support might help?',
    ],
    relatedLessons: ['hm-mh-medical-trauma', 'hm-mh-trauma-basics', 'hm-trans-new-parent'],
  },
  {
    id: 'hm-mh-religious-spiritual-trauma',
    title: 'Religious/Spiritual Trauma: When Faith Wounds',
    category: 'mental-health',
    duration: 10,
    emoji: '⛪',
    content: {
      introduction: `Religious trauma occurs when religious teachings, practices, communities, or leaders cause lasting psychological harm. This can range from subtle (chronic shame, fear of questioning) to severe (spiritual abuse, cult involvement, religiously-justified physical or sexual abuse). For those raised in high-control religions, leaving can feel like death - the death of your worldview, community, identity, and sometimes family relationships.

The concept of Religious Trauma Syndrome (RTS), developed by Dr. Marlene Winell, describes a set of symptoms common among people leaving authoritarian religious environments: cognitive difficulties (black-and-white thinking, difficulty with decisions), emotional challenges (anxiety, depression, grief, anger), social impacts (loss of community, family rupture), and identity confusion (who am I outside this system?).

What makes religious trauma uniquely complex is that it often involves total worldview collapse. When your religion was the framework for understanding reality - morality, meaning, your place in the universe - losing it means rebuilding from the ground up. This is disorienting at a level that other traumas rarely reach.

Additionally, religious trauma often carries spiritual wounds: damage to the capacity for transcendence, meaning, wonder, and connection to something larger. For some, this means permanent atheism. For others, it means slowly finding new spiritual paths. Either is valid. What matters is reclaiming your own relationship with meaning, rather than having one imposed.`,
      keyInsights: [
        { 
          title: 'It\'s not just leaving a belief system', 
          explanation: 'Religious trauma involves losing community, family, identity, meaning-making framework, social network, and certainty - often all at once. The losses are compounded.' 
        },
        { 
          title: 'Authoritarian religion leaves specific marks', 
          explanation: 'Black-and-white thinking, difficulty trusting your own judgment, chronic guilt, fear of punishment, and trouble making decisions without external authority - these are common effects of high-control religious environments.' 
        },
        { 
          title: 'Spiritual wounds are real', 
          explanation: 'Having your capacity for wonder, meaning, and connection co-opted and distorted is its own kind of harm. Reclaiming authentic spirituality (or choosing none) is part of healing.' 
        },
        { 
          title: 'The community loss is devastating', 
          explanation: 'Leaving often means losing everyone you know. This isolation compounds the psychological harm and makes recovery harder.' 
        },
      ],
      whatHelps: [
        'Find ex-community spaces (online groups for people who\'ve left your specific tradition)',
        'Read others\' exit stories - you\'re not alone',
        'Therapy with someone who understands religious trauma (not all do)',
        'Rebuild community outside the religion',
        'Give yourself permission to grieve, rage, and question',
        'Go slowly - you don\'t have to figure out what you believe immediately',
        'Consider books like "Leaving the Fold" by Marlene Winell',
      ],
      professionalNote: 'Look for therapists who specifically mention religious trauma or spiritual abuse in their specialties. Well-meaning therapists who don\'t understand this can inadvertently cause more harm.'
    },
    reflectionQuestions: [
      'What beliefs from your religious upbringing still affect you, even if you\'ve left?',
      'What did you lose when you left (or when you realized you\'d been harmed)?',
      'What relationship do you want with spirituality or meaning now?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-trans-identity-shifts', 'hm-world-disillusionment'],
  },
  {
    id: 'hm-mh-workplace-trauma',
    title: 'Workplace Trauma & Harassment',
    category: 'mental-health',
    duration: 8,
    emoji: '💼",
    content: {
      introduction: `The workplace can be a site of significant trauma. Sexual harassment, bullying, discrimination, hostile work environments, witnessing or experiencing violence, catastrophic failures, and toxic leadership can all leave lasting psychological wounds. And because we spend so much of our lives at work, workplace trauma often receives repeated exposure - you can't just \"walk away\" without losing your livelihood.

Workplace trauma is complicated by power dynamics. Reporting can mean retaliation. Speaking up can mean losing your job. The person harming you may control your performance reviews, raises, and career advancement. This trapped quality - needing to stay for economic survival while being harmed - echoes the dynamics of other captivity traumas.

The gaslighting that often accompanies workplace harm compounds the wound. \"You're being too sensitive." "That's just how he is.\" \"You must have misunderstood.\" When entire cultures normalize abuse, individuals start doubting their own perceptions. You're not crazy - you're in a crazy-making environment.

The impacts extend beyond the workplace: sleep disruption, relationship strain, anxiety that persists after leaving, difficulty trusting future employers, and sometimes full PTSD. Workplace trauma is often minimized because "it's just work\" - but there's no \"just\" about spending 40+ hours a week in a threatening environment.`,
      keyInsights: [
        { 
          title: "Economic coercion creates captivity', 
          explanation: 'When you can\'t leave without losing your income, you\'re in a trapped situation. This changes the trauma dynamic - you\'re enduring ongoing harm without escape.' 
        },
        { 
          title: 'Systemic protection often fails', 
          explanation: 'HR exists to protect the company, not employees. Reporting can lead to retaliation. This lack of recourse intensifies the harm.' 
        },
        { 
          title: 'Cultures can normalize abuse', 
          explanation: 'When toxic behavior is "how it\'s always been done," individuals are gaslit into thinking they\'re the problem. Trust your perception - even if the culture tells you you\'re wrong.' 
        },
        { 
          title: 'Leaving doesn\'t end it', 
          explanation: 'The effects persist after you leave the job. Hypervigilance with new employers, difficulty trusting authority, anxiety about performance reviews - the body remembers.' 
        },
      ],
      whatHelps: [
        'Document everything (times, dates, witnesses, exact quotes)',
        'Find allies - you\'re probably not the only one',
        'Consult employment law resources for your options',
        'Therapy to process while still in the situation AND after leaving',
        'Set the boundaries you can while protecting your position',
        'Make an exit plan - sometimes leaving is the only solution',
        'Remember: it\'s not about you, even when it feels personal',
      ],
      warningSign: 'If workplace trauma is leading to severe depression, anxiety, or thoughts of self-harm, please reach out for support. Your job is never worth your life.',
      professionalNote: 'Therapists who understand occupational stress and trauma can help you navigate while still employed and process afterward. Employment lawyers can help you understand your rights and options.'
    },
    reflectionQuestions: [
      'Is your workplace causing harm? What would need to change for it to be sustainable?',
      'What has workplace trauma cost you - in health, relationships, self-trust?',
      'What would it take for you to leave, and what\'s preventing it?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-stress-burnout', 'hm-work-boundaries'],
  },
  {
    id: 'hm-mh-racial-trauma',
    title: 'Racial Trauma: The Weight of Constant Threat',
    category: 'mental-health',
    duration: 10,
    emoji: '✊',
    content: {
      introduction: `Racial trauma, also called race-based traumatic stress, is the psychological and emotional injury caused by encounters with racial discrimination, racism, and hate crimes. For people of color, this is not occasional - it is constant, cumulative, and often begins in childhood. It is both the acute incidents (being called a slur, being profiled, witnessing violence against people who look like you) and the chronic weight of navigating a world that sees you as threat or lesser.

Dr. Robert Carter's research established that racism can meet clinical definitions of trauma, producing PTSD-like symptoms. But racial trauma differs from single-incident trauma because it is ongoing, inescapable, and often unacknowledged by the dominant culture. There is no \"post\" in post-traumatic when the threat continues.

The lived experience includes: hypervigilance (constantly assessing safety), exhaustion from code-switching and performing non-threatening, the psychological burden of having your reality denied or gaslit, grief after each publicized act of racial violence, and the intergenerational transmission of trauma from ancestors who endured slavery, colonization, genocide, or displacement.

Healing racial trauma requires both individual psychological work AND collective, community-based healing. Individual therapy helps, but it can't resolve systemic oppression. Community, activism, cultural connection, and spaces where your experience is understood without explanation are equally essential.`,
      keyInsights: [
        { 
          title: "It\'s cumulative, not single-incident', 
          explanation: 'Each microaggression, each act of discrimination, each news story of racist violence adds to the load. It\'s death by a thousand cuts, not one wound.' 
        },
        { 
          title: 'Hypervigilance is adaptive', 
          explanation: 'Being constantly alert to threat is exhausting, but it\'s a reasonable response to an environment that has proven dangerous. This isn\'t pathology; it\'s survival.' 
        },
        { 
          title: 'Gaslighting compounds the harm', 
          explanation: ''You\'re imagining it." "Race has nothing to do with it." "It\'s not that bad." Having your reality denied adds psychological injury to the original harm.' 
        },
        { 
          title: 'Intergenerational trauma is real', 
          explanation: 'Trauma can be transmitted across generations through epigenetics, family patterns, and cultural memory. The wounds of slavery, genocide, and colonization echo in descendants who never directly experienced them.' 
        },
        {
          title: 'Healing happens in community',
          explanation: 'Individual therapy matters, but healing racial trauma also requires collective spaces: community, cultural connection, activism, and environments where you don\'t have to explain or prove your experience.'
        }
      ],
      whatHelps: [
        'Name it - racial trauma is legitimate trauma',
        'Find therapists of your own background who understand (BIPOC therapist directories exist)',
        'Community connection - be with people who share your experience',
        'Cultural practices and ancestral connection',
        'Boundaries around news and social media exposure',
        'Activism (for those who find empowerment in it - not an obligation)',
        'Rest as resistance - you don\'t have to constantly educate or fight',
      ],
      professionalNote: 'If seeking therapy, consider finding a therapist who shares your racial/ethnic background or has specific training in racial trauma. Clinicians without this lens can inadvertently cause more harm.'
    },
    reflectionQuestions: [
      'How has your experience of race-based stress been dismissed or minimized?',
      'What does your nervous system need that it hasn\'t been getting?',
      'Where do you find community, cultural connection, and spaces to just be?',
    ],
    relatedLessons: ['hm-world-minority-stress', 'hm-world-generational', 'hm-mh-trauma-basics'],
  },
  {
    id: 'hm-mh-vicarious-trauma',
    title: 'Vicarious/Secondary Trauma: Absorbing Others\' Pain',
    category: 'mental-health',
    duration: 8,
    emoji: '🪞",
    content: {
      introduction: `You don't have to directly experience trauma to be traumatized by it. Vicarious trauma (also called secondary traumatic stress) occurs when you're exposed to others" traumatic experiences - as a helper, witness, or empathic listener. Therapists, healthcare workers, first responders, journalists, social workers, and anyone who regularly absorbs others' suffering can develop trauma symptoms themselves.

This isn't about being "too sensitive." The capacity for empathy that makes you good at helping also makes you vulnerable to absorbing pain. Mirror neurons, emotional attunement, and deep listening mean you're not just hearing about trauma - you're partially experiencing it. Over time, this accumulates.

The symptoms mirror PTSD: intrusive images (of clients" stories, not your own experiences), hypervigilance, avoidance, emotional numbing, changes in worldview (the world seems more dangerous), and disrupted spirituality or meaning. You might also experience compassion fatigue - the gradual erosion of your ability to care.

What makes vicarious trauma insidious is that helpers often ignore their own needs. There's a professional or moral imperative to keep showing up, to prioritize others' suffering over your own. But you cannot pour from an empty cup, and untreated vicarious trauma makes you less effective at the work you're trying to do.`,
      keyInsights: [
        { 
          title: 'Empathy has a cost', 
          explanation: 'The same attunement that makes you helpful makes you vulnerable. Being present to others\' pain means your nervous system responds as if the danger were your own.' 
        },
        { 
          title: 'It\'s occupational but not just occupational', 
          explanation: 'Caregivers for sick family members, parents absorbing children\'s trauma, even friends who are always the "safe person" to confide in - vicarious trauma happens outside professional roles too.' 
        },
        { 
          title: 'Worldview shifts are common', 
          explanation: 'Repeated exposure to others\' trauma changes how you see the world. You may lose trust in humanity, become hyperaware of danger, or struggle with the meaning of life.' 
        },
        { 
          title: 'Prevention is essential', 
          explanation: 'Once vicarious trauma is established, recovery is harder. Regular practices that process and discharge absorbed pain are not luxury - they\'re necessity.' 
        },
      ],
      whatHelps: [
        'Regular supervision/consultation (for professionals)',
        'Clear boundaries between helping time and personal time',
        'Somatic discharge practices: shake, move, exercise after heavy exposure',
        'Conscious transition rituals between work and home',
        'Limit exposure when possible (news, extra caseload)',
        'Personal therapy - helpers need help too',
        'Community with others who understand the work',
      ],
      professionalNote: 'If you\'re in a helping profession, vicarious trauma is an occupational hazard, not a personal failure. Seek out training, supervision, and support specifically for this. Organizations should build prevention into the culture.'
    },
    reflectionQuestions: [
      'Whose pain have you been carrying that isn\'t yours?',
      'What do you do to discharge absorbed trauma after exposure?',
      'Has your worldview changed from exposure to others\' suffering?',
    ],
    relatedLessons: ['hm-stress-burnout', 'hm-mh-trauma-basics', 'hm-stress-chronic'],
  },
  {
    id: 'hm-mh-trauma-bonding',
    title: 'Trauma Bonding: Why You Stay',
    category: 'mental-health',
    duration: 9,
    emoji: '⛓️",
    content: {
      introduction: `Trauma bonding is the powerful emotional attachment that forms between an abused person and their abuser. It's the reason people stay in dangerous relationships, return after leaving, defend their abusers, and feel genuinely attached despite the harm. It's not weakness, stupidity, or masochism - it's a neurobiological response to cycles of abuse.

The pattern works like this: periods of abuse alternate with periods of kindness, remorse, or normalcy. This intermittent reinforcement is the most powerful conditioning schedule known to psychology - more powerful than consistent reward. The unpredictability creates hope: maybe this time will be different. The kindness feels more intense against the backdrop of abuse. You become addicted to the relationship's highs because they contrast so sharply with the lows.

Your attachment system becomes weaponized against you. The very person who is your source of fear becomes your source of comfort when the fear temporarily subsides. This creates a bond that is paradoxically strengthened by the abuse itself. The more intense the cycles, the stronger the bond.

Understanding trauma bonding is essential for self-compassion. If you've struggled to leave, gone back, or found yourself defending someone who hurt you - this isn't a character flaw. It's how human psychology responds to this particular pattern of abuse. Breaking the bond requires understanding it, not just willpower.`,
      keyInsights: [
        { 
          title: 'Intermittent reinforcement is addictive', 
          explanation: 'The unpredictable alternation between abuse and kindness creates a psychological hook stronger than consistent treatment would. You become conditioned to chase the good times.' 
        },
        { 
          title: 'The cycle bonds you to the abuser', 
          explanation: 'Fear → relief → hope → attachment. When the person who terrorizes you also comforts you, your attachment system gets hijacked. This is by design (consciously or unconsciously) in abusive relationships.' 
        },
        { 
          title: 'Love and fear aren\'t mutually exclusive', 
          explanation: 'You can genuinely love someone who is hurting you. The attachment is real, even though the relationship is harmful. This makes leaving infinitely more complicated.' 
        },
        { 
          title: 'Breaking the bond takes time and support', 
          explanation: 'Leaving isn\'t enough. The pull back is neurobiological. Healing requires understanding the bond, grieving it, and building new attachments and self-worth.' 
        },
      ],
      whatHelps: [
        'Learn about trauma bonding - understanding breaks the spell',
        'Build support outside the relationship before leaving',
        'No contact after leaving (if possible) - contact reinforces the bond',
        'Expect intense withdrawal symptoms - the brain is addicted',
        'Work with a therapist who understands abusive relationship dynamics',
        'Connect with others who\'ve been through it (support groups)',
        'Be patient - breaking the bond takes time, and setbacks are common',
      ],
      warningSign: 'If you\'re in danger, please contact the National Domestic Violence Hotline: 1-800-799-7233. Safety planning with experts can help you leave more safely.',
      professionalNote: 'Therapists trained in domestic violence and abusive relationships understand trauma bonding. Avoid therapists who suggest couples counseling with your abuser - this is contraindicated and dangerous.'
    },
    reflectionQuestions: [
      'Do you recognize the intermittent reinforcement cycle in any of your relationships?',
      'What keeps you attached to someone who has harmed you?',
      'What support would you need to break a trauma bond?',
    ],
    relatedLessons: ['hm-rel-when-to-leave', 'hm-mh-trauma-basics', 'hm-rel-toxic-patterns'],
  },
  {
    id: 'hm-mh-freeze-response',
    title: 'The Freeze Response Deep Dive: Shutdown Explained',
    category: 'mental-health',
    duration: 8,
    emoji: '🧊",
    content: {
      introduction: `You've heard of fight-or-flight, but freeze is the response that often carries the most shame. It's the immobility that takes over when your nervous system decides that fighting and fleeing won't work - when threat is inescapable. Polyvagal theory, developed by Dr. Stephen Porges, calls this \"dorsal vagal shutdown\": the most primitive survival response, shared with reptiles, involving immobility and metabolic conservation.

Freeze isn't a choice. It's not cowardice. It's an automatic nervous system response that happens faster than conscious thought. When your amygdala perceives overwhelming threat, it can bypass the cortex entirely and trigger freeze before you have any chance to decide otherwise. The survivor who froze during assault, who went numb during abuse, who couldn't speak up during harassment - their body made that \"decision\" without them.

The aftermath of freeze often includes profound shame. \"Why didn't I fight back? Why didn't I run? Why did I just... stop?\" Understanding freeze neurobiology can help release this shame. You didn't choose to freeze - your nervous system chose for you, based on an instant assessment that freezing gave you the best chance of survival.

Chronic freeze states are also possible. People with extensive trauma may live in a low-grade freeze: depressed, unmotivated, disconnected, feeling \"dead inside.\" This is the nervous system stuck in dorsal vagal shutdown. Coming out requires slowly building a sense of safety, not demanding the body \"just snap out of it.\"`,
      keyInsights: [
        { 
          title: "Freeze is automatic and protective', 
          explanation: 'Your nervous system\'s job is survival, not dignity. Freeze reduces injury, decreases attention from predators, and conserves resources. It\'s ancient, adaptive, and not a reflection of your character.' 
        },
        { 
          title: 'Tonic immobility is a freeze variant', 
          explanation: 'During assault, some people experience tonic immobility: complete physical paralysis with full consciousness. This is well-documented in trauma research and is never consent or compliance.' 
        },
        { 
          title: 'Shame about freeze is common and cruel', 
          explanation: 'The cultural narrative is "fight or flight." When your response was "freeze," you may believe you failed. But freeze isn\'t failure - it\'s neurobiology. Releasing this shame is essential for healing.' 
        },
        { 
          title: 'Coming out of freeze requires safety signals', 
          explanation: 'You can\'t force yourself out of freeze. The nervous system needs to perceive safety before it will release. Warmth, gentle movement, safe presence, and time are the medicine - not willpower.' 
        },
      ],
      whatHelps: [
        'Psychoeducation - understanding freeze releases shame',
        'Somatic therapies help unfreeze the body gently',
        'Titrated (small, gradual) exposure to movement and activation',
        'Co-regulation with safe, calm people',
        'Avoid re-traumatization by forcing yourself to "just move"',
        'Self-compassion: your freeze was protection, not failure',
      ],
      professionalNote: 'Somatic Experiencing, developed by Dr. Peter Levine, specifically addresses freeze and incomplete survival responses. Look for practitioners trained in polyvagal-informed approaches.'
    },
    reflectionQuestions: [
      'Have you blamed yourself for freezing when something bad happened?',
      'What would change if you understood freeze as protection rather than failure?',
      'Do you experience chronic freeze - feeling stuck, numb, or shut down?',
    ],
    relatedLessons: ['hm-stress-freeze-response', 'hm-stress-nervous-system', 'hm-mh-dissociation'],
  },
  {
    id: 'hm-mh-dissociation',
    title: 'Dissociation: When You Leave Your Body',
    category: 'mental-health',
    duration: 9,
    emoji: '🌫️',
    content: {
      introduction: `Dissociation is a disconnection from yourself, your body, your surroundings, or your sense of reality. It ranges from common experiences (highway hypnosis, daydreaming, feeling unreal when exhausted) to severe clinical conditions (dissociative identity disorder). In trauma contexts, dissociation is your mind's protective exit when physical escape isn't possible.

During overwhelming experiences, dissociation serves as psychological anesthesia. If you can't flee the situation, you flee within - disconnecting from the body that's being harmed, floating away from the present moment, or splitting off the part of you that's experiencing this. It's brilliant survival strategy in the moment. The problem is when it persists.

Trauma-related dissociation includes: depersonalization (feeling detached from yourself, like watching yourself from outside), derealization (the world feeling unreal, dreamlike, or foggy), emotional numbing (inability to feel emotions), gaps in memory (dissociative amnesia), and in severe cases, identity fragmentation (distinct self-states or alters).

Dissociation often goes unrecognized because it's subtle. You might not realize you're \"gone\" - you just notice gaps in memory, feeling spacey, or others saying you seemed \"checked out.\" Chronic dissociation can feel normal because it's been your default for so long. Recognition is the first step toward learning to stay present - slowly, carefully, and with support.`,
      keyInsights: [
        { 
          title: 'It\'s a creative survival strategy', 
          explanation: 'Dissociation allowed you to survive what might otherwise have been unsurvivable. It\'s not dysfunction - it\'s an adaptation that worked. The question is whether it still serves you.' 
        },
        { 
          title: 'It exists on a spectrum', 
          explanation: 'From common (zoning out while driving) to severe (losing time, identity fragmentation). Trauma-related dissociation falls somewhere in this range depending on severity and frequency.' 
        },
        { 
          title: 'You might not know you\'re dissociating', 
          explanation: 'Dissociation can be so familiar that it feels normal. Other people might notice before you do. Learning your signs (glazed eyes, forgetting conversations, sudden fatigue) helps.' 
        },
        { 
          title: 'Grounding is the antidote', 
          explanation: 'Dissociation is leaving; grounding is returning. Sensory input, physical presence, and body awareness help pull you back. These are learnable skills.' 
        },
      ],
      whatHelps: [
        'Grounding techniques: 5-4-3-2-1 (five senses), cold water, strong scents, physical pressure',
        'Notice your triggers - what causes you to check out?',
        'Practice staying present in small doses, building tolerance',
        'EMDR and other trauma therapies help process what\'s triggering dissociation',
        'Work with a dissociation-informed therapist if symptoms are severe',
        'Be gentle - trying to force presence can backfire',
      ],
      warningSign: 'If you\'re experiencing significant time gaps, discovering actions you don\'t remember, or distinct self-states, please see a specialist in dissociative disorders. This requires specialized treatment.',
      professionalNote: 'Dissociation requires careful handling in therapy. Processing trauma too fast can increase dissociation. Look for therapists trained in phased treatment and dissociation specifically.'
    },
    reflectionQuestions: [
      'When do you notice yourself "checking out" or feeling unreal?',
      'What grounding techniques work for you, or what might you try?',
      'What was dissociation protecting you from, originally?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-mh-freeze-response', 'hm-stress-nervous-system'],
  },
  {
    id: 'hm-mh-flashbacks-triggers',
    title: 'Flashbacks & Triggers: Understanding the Alarm System',
    category: 'mental-health',
    duration: 8,
    emoji: '⚡",
    content: {
      introduction: `Flashbacks are time machines of the worst kind. A smell, a sound, a phrase, a situation - and suddenly you're not just remembering the past, you're reliving it. Your body responds as if the threat is happening now. Your heart races, your muscles tense, emotions flood you. This isn't a normal memory; it's trauma memory intruding into the present.

The neuroscience: traumatic memories are stored differently. Normally, the hippocampus processes memories with time stamps - you know the memory is in the past. But during overwhelming trauma, the hippocampus goes offline, and memories are stored raw in the amygdala without proper time-coding. When triggered, these memories emerge without the \"this was then, I'm safe now" context. Your brain and body literally don't know it's a memory.

Triggers are the cues that set off this alarm system. They're often sensory: a particular cologne, the quality of light, a sound, a texture. They can be contextual: locations, relationship dynamics, power differentials. They can be emotional: feeling trapped, helpless, or criticized. Triggers are personal - what activates one person's trauma may mean nothing to another.

Understanding triggers and flashbacks is the first step to managing them. You can learn to recognize you're being triggered, use grounding to anchor in the present, and over time, with treatment, reduce the intensity and frequency of these intrusions.`,
      keyInsights: [
        { 
          title: "Flashbacks aren\'t memories - they\'re re-experiencing', 
          explanation: 'Your brain doesn\'t know it\'s past. The emotional and physical responses are happening NOW as far as your nervous system is concerned. This is why "just don\'t think about it" doesn\'t work.' 
        },
        { 
          title: 'Triggers are often subtle', 
          explanation: 'The thing that triggered you might seem unrelated to the trauma. Your subconscious made connections your conscious mind didn\'t. A tone of voice, a pattern of light, a power dynamic - triggers can be obscure.' 
        },
        { 
          title: 'The window between trigger and response', 
          explanation: 'With practice, you can learn to notice "I\'m being triggered" before full flashback response. This window is where intervention is possible. It widens with treatment and practice.' 
        },
        { 
          title: 'Triggers diminish with proper treatment', 
          explanation: 'Trauma therapy helps the brain properly process and "time-stamp" the memory. When this happens, triggers lose their power. They may never fully disappear, but they can become manageable.' 
        },
      ],
      whatHelps: [
        'Grounding: "I am [name], I am [age], I am in [place], today is [date], I am safe"',
        'Sensory grounding: cold water, strong scent, textured object',
        'Name it: "I\'m having a flashback. This is a memory, not now."',
        'Orient to the present: look around, name what you see',
        'Dual awareness practice: "I am here AND I feel the memory"',
        'Trauma therapy (EMDR, CPT, PE) to process the underlying memory',
      ],
      professionalNote: 'Frequent or severe flashbacks warrant professional treatment. Trauma-focused therapies have excellent success rates for reducing intrusive symptoms. You don\'t have to live with constant triggers.'
    },
    reflectionQuestions: [
      'What triggers you? Can you identify patterns in situations, sensations, or emotional states?',
      'When you\'re triggered, how do you currently respond? Does it help?',
      'What grounding techniques might you try to stay connected to the present?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-mh-dissociation', 'hm-stress-nervous-system'],
  },
  {
    id: 'hm-mh-post-traumatic-growth',
    title: 'Post-Traumatic Growth: How People Transform Pain',
    category: 'mental-health',
    duration: 9,
    emoji: '🌱",
    content: {
      introduction: `Post-Traumatic Growth (PTG) is the positive psychological change that can emerge from struggling with highly challenging life circumstances. It's not that trauma is \"good\" or that suffering is necessary for growth - it's that humans have a remarkable capacity to find meaning, develop strength, and transform even in the aftermath of terrible experiences.

Researchers Richard Tedeschi and Lawrence Calhoun identified five domains of PTG: Greater appreciation of life, new possibilities, increased personal strength, improved relationships, and spiritual or existential change. Trauma survivors often report that they value life more, discovered abilities they didn't know they had, deepened relationships, opened new paths, and revised their understanding of life's meaning.

Crucial clarification: PTG is not about finding a silver lining or claiming trauma was \"worth it.\" It's not about toxic positivity or pressure to grow. It's about acknowledging that some people, through the struggle to rebuild after trauma, develop in ways they wouldn't have otherwise. Growth and pain coexist; one doesn't cancel the other.

PTG is also not universal or guaranteed. Some people don't experience significant growth, and that's okay. Growth is not a measure of your worth or your effort. It emerges from particular conditions: supportive relationships, deliberate rumination (making meaning), narrative development (creating a story), and often from the shattering of previous assumptions that creates space for new understandings.`,
      keyInsights: [
        { 
          title: 'Growth doesn\'t mean trauma was good', 
          explanation: 'Most people would trade the growth to not have experienced the trauma. PTG acknowledges transformation without glorifying suffering or demanding it.' 
        },
        { 
          title: 'Struggle is the catalyst', 
          explanation: 'Growth comes not from the trauma itself but from the struggle to rebuild afterward. It\'s the effortful engagement with rebuilding that creates change.' 
        },
        { 
          title: 'Shattering assumptions creates space', 
          explanation: 'Trauma often shatters assumptions about safety, meaning, and self. This is devastating - but the rebuilding can create new, more resilient structures. The cracks let light in.' 
        },
        { 
          title: 'PTG and PTSD can coexist', 
          explanation: 'You can experience growth in some areas while still struggling with symptoms. Growth doesn\'t mean you\'re "over it." Complexity is normal.' 
        },
        {
          title: 'Support and meaning-making matter',
          explanation: 'PTG is more likely with supportive relationships, space for deliberate reflection, and opportunities to create narrative meaning from the experience. These can be cultivated.'
        }
      ],
      whatHelps: [
        'Deliberate rumination: intentional reflection on how you\'ve changed',
        'Narrative development: writing or telling your story',
        'Supportive relationships that can hold both pain and growth',
        'Finding meaning or purpose connected to the experience',
        'Patience - PTG often takes years to emerge',
        'Releasing pressure - growth isn\'t a requirement or measure of success',
      ],
      professionalNote: 'Therapists trained in meaning-making approaches, narrative therapy, and existential frameworks can support PTG. But growth shouldn\'t be rushed or demanded - it emerges when ready.'
    },
    reflectionQuestions: [
      'Have you noticed any unexpected growth or change following difficult experiences?',
      'What have you learned about yourself through struggle that you couldn\'t have learned otherwise?',
      'How has your sense of what matters shifted?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-growth-meaning', 'hm-trans-grief-all-kinds'],
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
    emoji: '🔥",
    content: {
      introduction: `Burnout isn't being tired. Tired recovers with rest. Burnout is a state of chronic stress that has depleted you physically, emotionally, and mentally. The World Health Organization recognizes it as an occupational phenomenon characterized by exhaustion, cynicism, and reduced efficacy. You're not just out of energy - you're out of capacity to care.

The Maslach Burnout Inventory identifies three dimensions: Exhaustion (nothing left to give), Cynicism (detachment and negativity), and Inefficacy (feeling incompetent and like nothing matters). You might have one or all three. Any combination is damaging.

Burnout usually develops gradually. You start by overworking to compensate for something - impossible demands, values mismatch, lack of control, insufficient reward, unfairness, or conflict with the work. You push through tiredness, then push through exhaustion, then push through your body's escalating warnings until the system fails.

Recovery requires more than vacation. Vacation helps symptoms but doesn't address causes. Real recovery requires changing the equation: either changing the environment (job, boundaries, expectations) or changing your relationship to the demands (values clarification, boundaries, support).`,
      keyInsights: [
        { 
          title: "Burnout vs. tired', 
          explanation: 'Tired improves with rest. Burnout often doesn\'t - you take a vacation and come back feeling the same. That\'s a sign it\'s structural, not just a need for sleep.' 
        },
        { 
          title: 'The causes are often systemic', 
          explanation: 'Impossible workloads, lack of control, values conflicts, inadequate rewards, unfairness - these are organizational problems, not personal failures. Self-care can\'t fix a toxic job.' 
        },
        { 
          title: 'Burnout tanks everything', 
          explanation: 'It affects your health, relationships, cognitive function, creativity, and ability to care about anything. It\'s not just a work problem - it\'s a life problem.' 
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
        'Professional support - burnout can develop into depression',
      ],
      professionalNote: 'Severe burnout can transition to clinical depression or anxiety disorders. If you\'re experiencing hopelessness, inability to function, or thoughts of self-harm, please seek professional help.'
    },
    reflectionQuestions: [
      'Which burnout dimension hits closest to home: exhaustion, cynicism, or inefficacy?',
      'What\'s causing your burnout that self-care can\'t fix?',
      'What would have to change for your current situation to be sustainable?',
    ],
    relatedLessons: ['hm-work-job-identity', 'hm-mh-depression-truth', 'hm-stress-overwhelm'],
    triggerGauges: ['body', 'state'],
    triggerThreshold: 40,
    triggerMode: 'any',
  },
  {
    id: 'hm-stress-freeze-response',
    title: 'The Freeze Response: When Shutdown Happens',
    category: 'stress-survival',
    duration: 7,
    emoji: '🧊",
    content: {
      introduction: `You've heard of fight-or-flight. But there's a third response that often gets overlooked: freeze. When your nervous system determines that fighting or fleeing won't work - when the threat is too overwhelming - it shuts down. You go numb. You dissociate. You can't think, can't act, can't feel. You freeze.

Freeze is a survival mechanism, not a choice. It's the nervous system's last-ditch effort to protect you, similar to an animal playing dead. In humans, it can look like spacing out during a stressful conversation, being unable to move during a confrontation, emotional numbness, or that foggy feeling where you're present but not really \"there.\"

The freeze response explains why trauma survivors often ask \"why didn't I fight back?\" or \"why didn't I run?" The answer: your nervous system chose for you, and freeze was its best option given the circumstances. This was never a conscious decision - and blaming yourself for it compounds the trauma.

Coming out of freeze requires gentleness. Forcing yourself to act when you're frozen often backfires. The nervous system needs to feel safe before it releases. Small movements, warmth, presence of safe people, and gentle stimulation of the senses can help. Rushing makes it worse.`,
      keyInsights: [
        { 
          title: 'Freeze isn\'t choosing', 
          explanation: 'Your nervous system assesses threat faster than conscious thought and picks the response most likely to help you survive. Freeze isn\'t cowardice - it\'s a survival adaptation.' 
        },
        { 
          title: 'It explains the "why didn\'t I" question', 
          explanation: 'Survivors often blame themselves for not fighting or fleeing. But those options were neurobiologically offline. Understanding freeze can help release self-blame.' 
        },
        { 
          title: 'Chronic freeze is common', 
          explanation: 'Some people live in a low-grade freeze state - emotionally numb, disconnected, unable to access motivation. This is often the result of chronic overwhelming stress.' 
        },
        { 
          title: 'Thawing takes time and safety', 
          explanation: 'You can\'t force yourself out of freeze through willpower. The system needs safety signals: warmth, gentle movement, safe connection, time.' 
        },
      ],
      whatHelps: [
        'Recognize it: "I\'m in freeze right now"',
        'Don\'t force - pushing through often deepens the freeze',
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
    emoji: '🌊",
    content: {
      introduction: `Overwhelm happens when input exceeds processing capacity. It's not about the absolute amount of stress - it's about the ratio of demands to resources. A single task can be overwhelming if you're already depleted. A hundred tasks might be manageable if you're resourced and supported.

The problem is that overwhelm often triggers more overwhelm. When you're overwhelmed, your executive function - the part of your brain that prioritizes, plans, and makes decisions - goes offline. So you can't figure out what to do about being overwhelmed, which makes you more overwhelmed. It's a trap.

Breaking the cycle requires stepping back from trying to solve the overwhelm and instead stabilizing your nervous system first. You cannot think your way out of overwhelm when the thinking parts of your brain aren't functioning. Regulate first, then prioritize.

Most overwhelm is also a boundaries problem. If you're constantly overwhelmed, something is out of balance: you're taking on too much, not delegating, not saying no, or not building in recovery time. The solution isn't just getting through this current wave - it's restructuring so the waves don't keep crashing.`,
      keyInsights: [
        { 
          title: "Overwhelm tanks executive function', 
          explanation: 'The part of your brain that could solve this problem - planning, prioritizing, deciding - goes offline when you\'re overwhelmed. That\'s why "just make a list" doesn\'t help when you\'re in the middle of it.' 
        },
        { 
          title: 'Regulate before you problem-solve', 
          explanation: 'First: breathe, ground, slow down. Get your nervous system to a place where thinking is possible. Then you can tackle the list.' 
        },
        { 
          title: 'The smallest next step', 
          explanation: 'When everything feels urgent, pick one thing - the smallest possible step. Completion creates momentum. Don\'t try to solve the whole problem at once.' 
        },
        { 
          title: 'Chronic overwhelm is a structure problem', 
          explanation: 'If you\'re always overwhelmed, the issue isn\'t time management - it\'s that demands exceed resources. Something has to change structurally.' 
        },
      ],
      whatHelps: [
        'Stop. Trying to power through overwhelm usually makes it worse.',
        'Regulate first: slow breathing, feet on floor, orient to the room',
        'Brain dump: get everything out of your head onto paper - don\'t organize yet',
        'Pick ONE thing. The smallest possible step.',
        'Ask for help or delegate (even if this is hard)',
        'Look at what\'s creating chronic overwhelm - that\'s where the real work is',
      ],
    },
    reflectionQuestions: [
      'What does overwhelm feel like in your body? Can you catch it earlier?',
      'What\'s creating chronic overwhelm in your life? What would need to change?',
      'What\'s one thing you could say no to or delegate?',
    ],
    relatedLessons: ['hm-stress-burnout', 'hm-work-boundaries'],
    triggerGauges: ['body', 'state', 'emotion'],
    triggerThreshold: 35,
    triggerMode: 'stabilization',
  },
  {
    id: 'hm-stress-nervous-system',
    title: 'Your Nervous System: The Control Center',
    category: 'stress-survival',
    duration: 8,
    emoji: '⚡",
    content: {
      introduction: `Everything in your emotional life runs through your nervous system. Polyvagal theory, developed by Dr. Stephen Porges, describes three states your autonomic nervous system moves between: ventral vagal (safe and social), sympathetic (fight-or-flight), and dorsal vagal (freeze and shutdown).

When you're in ventral vagal, you feel safe, connected, and able to engage with the world. You can think clearly, connect with others, and access creativity. This is where you want to spend most of your time.

Sympathetic activation is the fight-or-flight state: increased heart rate, rapid breathing, tension, anxiety, irritability. It's designed for short-term threat response. Problems arise when you get stuck here - chronic sympathetic activation leads to anxiety, health problems, and relationship difficulties.

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
          explanation: 'Nervous systems sync up. Being in the presence of a calm, regulated person can help regulate you. This is why we seek connection when stressed - and why other people\'s dysregulation is contagious.' 
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
    triggerGauges: ['state', 'body'],
    triggerThreshold: 45,
    triggerMode: 'any',
  },
  {
    id: 'hm-stress-chronic',
    title: 'Chronic Stress: The Slow Poison',
    category: 'stress-survival',
    duration: 7,
    emoji: '⏰",
    content: {
      introduction: `Acute stress is designed to be temporary - you face a threat, your body mobilizes, you deal with it, and then you recover. Chronic stress breaks this cycle. The threat never ends, so the stress response never turns off. Your body is designed for sprints, not marathons of activation.

Chronic stress damages nearly every system in your body. It keeps cortisol elevated, which over time impairs immune function, disrupts sleep, increases inflammation, affects memory and cognition, contributes to weight gain, raises blood pressure, and increases risk of heart disease. It's a slow poison that accumulates.

The tricky part is that chronic stress becomes normal. You adapt to it. You don't notice how much tension you're holding, how shallow your breathing is, how compromised your sleep has become. You think this is just how life is. It's not. It's how your life has been - and it can change.

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
          explanation: 'Sleep, immune function, cognition, mood, relationships, health - chronic stress reaches into every corner of your life. No system is spared.' 
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
        'Sleep protection - chronic stress destroys sleep, which increases stress',
        'Social support - connection buffers stress effects',
        'Movement - the body needs to discharge stress chemicals',
        'Consider what trade-offs you\'re making that aren\'t worth it',
      ],
    },
    reflectionQuestions: [
      'What chronic stressors have you adapted to as "normal"?',
      'Do a quick body scan - where are you holding tension right now?',
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
    emoji: '💼",
    content: {
      introduction: `\"What do you do?\" is often the first question we ask when meeting someone. It's also a trap. When work becomes too central to identity, you're vulnerable in ways you might not recognize until something disrupts that identity - layoff, burnout, retirement, career change, or simply losing passion for what you do.

Enmeshment with work can look like success. The dedicated employee, the passionate entrepreneur, the person who "loves what they do." But when work IS identity rather than part of identity, any threat to work becomes a threat to self. Job criticism feels like personal criticism. Failure at work feels like failure as a human. Time away from work feels like losing yourself.

This isn't to say work can't be meaningful or central to your life. But there's a difference between work being deeply important and work being all you are. The goal is developing what researchers call "identity complexity" - having multiple sources of meaning and value so that no single domain can devastate you.

If you lost your job tomorrow and someone asked "who are you?" - could you answer without mentioning what you do for work?`,
      keyInsights: [
        { 
          title: 'Work as identity is culturally encouraged', 
          explanation: 'Hustle culture, passion economy, "do what you love" - we\'ve built a culture that celebrates work-identity enmeshment. Recognizing this helps you question it.' 
        },
        { 
          title: 'Identity complexity protects you', 
          explanation: 'Having multiple sources of identity - relationships, hobbies, values, communities - means no single failure can destroy your sense of self.' 
        },
        { 
          title: 'What you do ≠ who you are', 
          explanation: 'Your worth isn\'t determined by your productivity, title, or income. You are valuable simply because you exist. (This is hard to believe in capitalism, but it\'s true.)' 
        },
        { 
          title: 'Transitions expose the enmeshment', 
          explanation: 'Layoffs, retirement, burnout, career change - these moments reveal how much identity was wrapped up in work. Better to diversify before crisis forces it.' 
        },
      ],
      whatHelps: [
        'Notice how you describe yourself - is work always first?',
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
    emoji: '💰",
    content: {
      introduction: `Money isn't just numbers - it's tied to survival, safety, worth, and deep emotional history. Financial trauma can come from growing up with scarcity, sudden financial loss, financial abuse, debt, or shame around money. It shows up as anxiety about spending, hoarding, over-giving, avoidance of looking at accounts, or self-sabotaging financial decisions.

Your earliest experiences with money created a template. If money was scarce and stressful, your nervous system may always associate money with threat. If money was used to control you, freedom around money may feel dangerous. If your worth was tied to financial success, money becomes identity rather than tool.

Financial shame is particularly insidious because money is so private. We don't talk about how much we make, owe, or struggle. The silence breeds shame, which prevents asking for help, which deepens the problem. Breaking the cycle often requires naming the shame and the history that created it.

Healing financial trauma is both practical and emotional. You need financial literacy and skills, yes. But you also need to address the nervous system responses, beliefs, and patterns that override rational decision-making when money is involved.`,
      keyInsights: [
        { 
          title: 'Money is emotional, not just rational', 
          explanation: 'Financial decisions are influenced by fear, shame, childhood experiences, and nervous system states - not just math. Understanding this helps you work with your full self.' 
        },
        { 
          title: 'Scarcity mindset vs. abundance mindset', 
          explanation: 'Scarcity says there\'s never enough, so hoard, avoid, or give it all away before it\'s taken. This mindset develops from real scarcity and can persist even when circumstances change.' 
        },
        { 
          title: 'Financial avoidance is protective avoidance', 
          explanation: 'Not looking at your accounts, not opening bills, not making a budget - this isn\'t laziness. It\'s your nervous system protecting you from the anxiety of engaging with money.' 
        },
        { 
          title: 'Intergenerational money patterns', 
          explanation: 'Your family\'s relationship with money - their beliefs, behaviors, silence or conflict around it - shaped yours. Understanding this lineage helps you choose differently.' 
        },
      ],
      whatHelps: [
        'Name your money history - what did you learn about money growing up?',
        'Notice your nervous system around money - anxiety, avoidance, activation',
        'Start small with financial engagement - even opening one statement counts',
        'Separate facts from feelings - what\'s actually in the account vs. how it makes you feel',
        'Consider a financial therapist or financial counselor trained in psychology',
        'Talk about money with safe people - shame grows in silence',
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
    emoji: '🎭",
    content: {
      introduction: `Imposter syndrome is the persistent feeling that you've fooled everyone and are about to be exposed as incompetent, despite evidence of your accomplishments. It's remarkably common - research suggests about 70% of people experience it at some point. You're not alone, and you're not actually a fraud.

Imposter feelings often intensify during transitions: new job, promotion, entering a new field, or being the \"first\" or \"only\" in a space. They're particularly common among high achievers (who always expect more of themselves) and among people from marginalized groups (who receive constant cultural messaging that they don't belong).

The painful irony is that imposter syndrome tends to hit the competent and conscientious hardest. The truly incompetent often have inflated self-assessments (the Dunning-Kruger effect). Your very ability to recognize the gaps in your knowledge - the complexity of your field, the expertise of others - creates the conditions for feeling like an imposter.

This doesn't mean imposter feelings should be ignored. They're information about what you value, what you fear, and where you might benefit from support, mentorship, or skill development. But they're not accurate assessments of your worth or your right to be where you are.`,
      keyInsights: [
        { 
          title: 'Evidence doesn\'t cure it', 
          explanation: 'Getting more credentials, more accomplishments, more praise rarely helps - you just raise the bar and attribute success to luck. The work is internal, not external.' 
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
          explanation: ''I feel like an imposter" is different from "I am an imposter." You can acknowledge the feeling without letting it drive decisions.' 
        },
      ],
      whatHelps: [
        'Name it when it\'s happening: "this is imposter syndrome"',
        'Keep a "wins" file - concrete evidence of your competence to review',
        'Talk to trusted others - you\'ll often find they experience it too',
        'Separate feelings from facts: "I feel like I don\'t belong" vs. "I was hired/accepted/chosen for a reason"',
        'Recognize that discomfort is growth - being stretched doesn\'t mean you\'re failing',
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
    emoji: '🚫",
    content: {
      introduction: `The boundaries between work and life have never been more blurred. Emails at midnight, Slack messages on weekends, the expectation of constant availability, remote work that means work is always accessible - the structures that used to protect personal time have eroded.

This is bad for your health, relationships, and ironically, your work performance. Research consistently shows that working more hours past a certain point leads to declining productivity and increasing errors. Rest isn't a luxury - it's a performance requirement. But try telling that to a culture that celebrates hustle.

Setting work boundaries often feels risky. Will you be passed over for promotion? Will colleagues judge you? Will you lose your job? These fears are sometimes valid and sometimes projections. The truth is usually more nuanced: some workplaces punish boundaries, some respect them, and many are waiting for someone to model that it's possible.

You don't have to announce your boundaries - you can just keep them. Don't respond to emails after hours. Don't apologize for not being available on weekends. Let people adjust to your rhythms rather than abandoning yours to match theirs.`,
      keyInsights: [
        { 
          title: 'Boundaries are a skill, not a personality trait', 
          explanation: 'If boundaries are hard for you, that\'s not because something\'s wrong with you - it\'s because you haven\'t had practice, or because your history made them dangerous. You can learn.' 
        },
        { 
          title: 'Rest is productive', 
          explanation: 'Counter to hustle culture, rest improves creativity, problem-solving, and sustained performance. Burnout is the actual productivity killer.' 
        },
        { 
          title: 'You don\'t have to explain', 
          explanation: ''I\'m not available" is a complete sentence. You don\'t need to justify why you have a life outside work.' 
        },
        { 
          title: 'Structural problems need structural solutions', 
          explanation: 'If your workplace has a culture of boundary violation, individual boundary-setting is swimming upstream. It\'s worth asking whether this is a fixable culture or one you should leave.' 
        },
      ],
      whatHelps: [
        'Decide your boundaries in advance - when are you off?',
        'Create rituals that mark the end of work',
        'Turn off notifications outside work hours',
        'Batch communication - don\'t respond to every ping in real-time',
        'Model boundaries for others - when you keep yours, you give permission',
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
    emoji: '🔍",
    content: {
      introduction: `There's a particular kind of suffering that comes from doing work that feels meaningless. You might be well-paid, successful by external measures, even good at what you do - and still feel empty about it. This isn't ingratitude. It's a legitimate form of distress.

Meaning in work can come from many sources: the work itself (craft, challenge, creativity), its impact (helping others, making a difference), its alignment with values (doing something you believe in), or its role in a larger vision (career path, legacy). When none of these are present, work becomes something you endure rather than something you engage with.

Sometimes loss of meaning signals burnout - you cared once but the caring got depleted. Sometimes it signals misalignment - you grew or changed and the work didn't grow with you. Sometimes it signals that you never cared about this particular work and chose it for other reasons (money, security, expectation) that no longer feel sufficient.

You have options: find meaning in the work differently, find meaning outside work, change the work, or change jobs. None of these are easy, and all require clarity about what actually matters to you - which you may have lost touch with along the way.`,
      keyInsights: [
        { 
          title: "Not everyone can "do what they love"', 
          explanation: 'Sometimes work is how you fund a life that has meaning elsewhere. There\'s no shame in having a job that\'s just a job while you invest meaning in other domains.' 
        },
        { 
          title: 'Meaning can be found, not just had', 
          explanation: 'Sometimes the same work can become meaningful through a shift in perspective: connecting more with people, focusing on craft, finding the impact you weren\'t seeing.' 
        },
        { 
          title: 'Loss of meaning can signal growth', 
          explanation: 'What mattered at 25 might not matter at 40. Outgrowing work isn\'t failure - it\'s evolution. But it requires action, not just suffering.' 
        },
        { 
          title: 'Golden handcuffs are real', 
          explanation: 'High pay in meaningless work creates a trap. You adapt to the income, the lifestyle requires it, and leaving feels impossible. This is a real constraint worth naming.' 
        },
      ],
      whatHelps: [
        'Get clear on what actually gives you meaning (not what should)',
        'Audit your current work - is there meaning you\'re not accessing?',
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
    triggerGauges: ['direction', 'alignment'],
    triggerThreshold: 40,
    triggerMode: 'any',
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
    emoji: '🌍",
    content: {
      introduction: `Trauma isn't always individual. Pandemics, wars, economic collapses, mass violence, political upheaval - these events traumatize entire populations. Collective trauma operates differently than personal trauma: it's shared, it shapes culture, and it often goes unrecognized because when everyone's affected, the abnormal becomes normal.

The COVID-19 pandemic is a recent example of collective trauma. Years later, many people still carry effects they don't recognize as trauma-related: increased anxiety, changed relationships with mortality, erosion of trust, hypervigilance about health, grief that never had space, changes in how they relate to society and each other.

Collective trauma can bind communities together (shared experience, solidarity) or tear them apart (blame, us-vs-them thinking, breakdown of trust). How it unfolds depends partly on leadership, partly on existing social structures, and partly on whether the trauma is acknowledged at all.

Healing from collective trauma requires acknowledgment at the collective level - but since that rarely happens, individuals are often left to process alone what was never theirs alone to carry.`,
      keyInsights: [
        { 
          title: "Collective trauma is invisible', 
          explanation: 'When everyone is affected, there\'s no "normal" to contrast against. Effects become the new baseline. You might not recognize what you\'re carrying as trauma.' 
        },
        { 
          title: 'The pandemic traumatized everyone', 
          explanation: 'Even if you weren\'t sick, didn\'t lose someone, weren\'t frontline - you still lived through chronic uncertainty, disrupted attachment, and collective grief. That counts.' 
        },
        { 
          title: 'Individual healing in collective wounds', 
          explanation: 'Ideally, society would acknowledge and process collective trauma together. Since that rarely happens, individuals must heal wounds that were never theirs alone to carry.' 
        },
        { 
          title: 'Intergenerational transmission', 
          explanation: 'Collective trauma passes through generations - in bodies, in silence, in cultural patterns. Your grandparents\' wars, migrations, and losses may live in you.' 
        },
      ],
      whatHelps: [
        'Name it: acknowledge what you lived through and its effects',
        'Resist minimization: "others had it worse" doesn\'t invalidate your experience',
        'Find community: shared acknowledgment helps, even if society doesn\'t provide it',
        'Understand that some struggles are not individual mental health issues - they\'re reasonable responses to unreasonable circumstances',
        'Consider how collective trauma intersects with your personal history',
      ],
    },
    reflectionQuestions: [
      'How did the pandemic (or other collective events) affect you in ways you haven\'t fully acknowledged?',
      'What collective traumas might your family or community carry that shaped you?',
      'How does it feel to recognize that some of your struggles aren\'t individual - they\'re shared?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-world-generational'],
  },
  {
    id: 'hm-world-news-triggers',
    title: 'News and Doomscrolling: Information as Trauma',
    category: 'world-society',
    duration: 6,
    emoji: '📱",
    content: {
      introduction: `Your nervous system can't distinguish between danger that's in front of you and danger you're reading about on a screen. Every terrible news story activates the same threat response as if it were happening to you personally. This is why consuming news - especially the algorithmic, attention-maximizing, conflict-optimized news of social media - can genuinely traumatize you.

Doomscrolling - the compulsive consumption of negative news - isn't just a bad habit. It's often an attempt at control: if I know about all the threats, I can prepare for them. But you can't prepare for everything, and the knowing doesn't make you safer - it just keeps your nervous system in chronic activation.

This doesn't mean you should be uninformed. But there's a difference between being informed and being saturated. You can know what's happening in the world without watching every video, reading every thread, absorbing every atrocity in real-time detail.

The world has always been full of suffering. What's new is the algorithmic delivery of that suffering directly to your pocket, optimized for maximum engagement (which often means maximum distress).`,
      keyInsights: [
        { 
          title: 'Your body responds to screens like reality', 
          explanation: 'Adrenaline doesn\'t know the difference between a real threat and footage of a threat. Your nervous system responds as if you\'re there.' 
        },
        { 
          title: 'Doomscrolling is an anxious coping mechanism', 
          explanation: 'The urge to know everything is about control, but the information doesn\'t provide control - it provides activation. You\'re not more prepared; you\'re more dysregulated.' 
        },
        { 
          title: 'Algorithms optimize for engagement, not wellbeing', 
          explanation: 'Social media shows you what keeps you scrolling, which is often outrage, fear, and conflict. Your feed is not a neutral source of information.' 
        },
        { 
          title: 'Being informed has diminishing returns', 
          explanation: 'After a certain point, more news doesn\'t make you more informed - it just makes you more traumatized. You can be aware without being overwhelmed.' 
        },
      ],
      whatHelps: [
        'Set specific news times - don\'t let it be constant background',
        'Choose sources consciously - curate for quality over algorithms',
        'Notice the body: are you getting activated? That\'s enough for now.',
        'Ask: does knowing more about this make me more able to help? If not, why am I watching?',
        'Limit video/imagery - reading is usually less activating than watching',
        'Take action when possible - helplessness is traumatic; agency helps',
      ],
    },
    reflectionQuestions: [
      'How much news do you consume, and how does it affect your nervous system?',
      'What drives your doomscrolling - what are you looking for?',
      'What would "informed but not overwhelmed" actually look like?',
    ],
    relatedLessons: ['hm-stress-nervous-system', 'hm-mh-anxiety-types'],
  },
  {
    id: 'hm-world-generational',
    title: 'Generational Trauma: What Gets Passed Down',
    category: 'world-society',
    duration: 8,
    emoji: '🌳",
    content: {
      introduction: `Trauma doesn't end with the person who experienced it. Research shows that the effects of traumatic experiences can be transmitted across generations - through parenting behaviors, through epigenetic changes, through family systems, and through cultural patterns. You may be carrying grief, fear, or survival adaptations from events that happened before you were born.

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
          explanation: 'Anxiety, depression, hypervigilance, survival patterns - these might not have originated with your experiences. Understanding the lineage helps you respond appropriately.' 
        },
        { 
          title: 'Healing is generational too', 
          explanation: 'When you heal, you change what you pass on. You can be the generation that interrupts the transmission. That\'s meaningful beyond your own life.' 
        },
      ],
      whatHelps: [
        'Learn your family history - what traumas were experienced and how were they (or weren\'t they) processed?',
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
    emoji: '⚠️",
    content: {
      introduction: `Minority stress theory explains the unique stressors faced by people who belong to stigmatized groups - based on race, ethnicity, sexual orientation, gender identity, disability, or other marginalized identities. This stress is chronic, comes from external sources, and is layered on top of the general stress everyone faces.

This stress shows up as: direct discrimination (being denied jobs, services, safety), everyday microaggressions (subtle slights and invalidations), internalized stigma (absorbing negative messages about your group), and the mental load of concealment, hypervigilance, and code-switching.

Minority stress has measurable health effects. Research consistently shows higher rates of depression, anxiety, substance use, and physical health problems among minority populations - not because of anything inherent to those identities, but because of how society treats those identities.

This is important context because mental health struggles in marginalized communities are often treated as individual problems when they're actually reasonable responses to unreasonable conditions. You're not broken - you're responding to a world that hasn't been built for you.`,
      keyInsights: [
        { 
          title: "It\'s not in your head - it\'s in the world', 
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
        'Name it as external, not internal - the problem isn\'t you',
        'Find community with people who share your experience',
        'Seek mental health support from providers who understand minority stress',
        'Build spaces where you can be fully yourself without code-switching',
        'Recognize that some exhaustion is from carrying what others don\'t have to carry',
        'Activism can help - channeling frustration into change has mental health benefits',
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
    emoji: '🌡️",
    content: {
      introduction: `Climate anxiety (sometimes called eco-anxiety or solastalgia) is the chronic fear and distress related to environmental destruction and climate change. It's not a clinical disorder - it's a rational response to a real threat. The challenge is living with this awareness without being paralyzed by it.

Young people report especially high rates of climate anxiety, which makes sense: they'll live with the worst consequences. But people of all ages experience it, particularly those connected to nature, future-oriented in their thinking, or aware of the science.

The grief is complex: you're mourning losses that haven't fully happened yet, mourning what you'll never know (what the world could have been), mourning on behalf of future generations. There's also rage at the systems and decisions that created this, and despair at the scale of the problem.

How you respond to climate anxiety matters. Denial numbs but doesn't help. Doom and paralysis feel appropriate but also don't help. The goal is what researchers call \"active hope\" - acknowledging the reality, grieving what's lost, and still engaging in meaningful action.`,
      keyInsights: [
        { 
          title: "This anxiety is rational', 
          explanation: 'Unlike many anxieties, climate anxiety is a response to real, documented, scientifically verified threats. You\'re not catastrophizing - you\'re observing.' 
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
        'Limit (don\'t eliminate) climate news exposure - stay informed without doom-saturating',
        'Connect with others who share your concern - community helps',
        'Take action at the level you can - it won\'t solve everything but helps with helplessness',
        'Allow grief - you\'re allowed to mourn the future',
        'Spend time in nature - it\'s still here, still beautiful, still worth protecting',
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
    emoji: '🏥",
    content: {
      introduction: `Living with chronic illness means living in a body that doesn't work the way bodies \"should.\" This creates unique psychological challenges: grief over lost capacity, rage at a body that betrays you, isolation from a world designed for healthy people, exhaustion from managing symptoms AND the medical system, and the endless work of explaining and justifying your experience.

Chronic illness is often invisible. You may look fine while feeling terrible, which creates its own problems: disbelief from others, pressure to perform wellness, guilt about not being \"sick enough\" to deserve accommodations. The illness is isolating and the invisibility is isolating too.

The medical system often fails people with chronic illness. Conditions are dismissed as psychosomatic, particularly for women and people of color. Diagnosis can take years. Treatment may be inadequate. You end up becoming your own researcher, advocate, and case manager - exhausting work you never asked for.

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
        'Grieve the losses - this is real grief and deserves space',
        'Seek mental health support from providers who understand chronic illness',
        'Advocate for yourself in medical settings - bring documentation, bring support people',
        'Acceptance isn\'t giving up - it\'s making peace with what is so you can live fully within it',
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
    emoji: '💊",
    content: {
      introduction: `There's a particular kind of shame attached to psychiatric medication that doesn't exist for other types of medicine. People who wouldn't hesitate to take blood pressure medication or insulin feel embarrassed about antidepressants. This stigma prevents people from getting help, stops them from being honest about their needs, and adds shame to an already difficult experience.

The beliefs underlying this stigma are deep and often unconscious: mental illness is weakness, medication is a crutch, you should be able to handle it yourself, taking medication means you've failed. These beliefs come from a culture that sees mental health as separate from physical health, mind as superior to body, and needing help as shameful.

The reality: the brain is an organ. Mental health conditions often have neurobiological components. Medication can correct chemical imbalances that make normal function impossible. For many people, medication is what makes therapy possible, what makes daily function possible, what makes life livable.

Choosing medication is a medical decision between you and your provider. It doesn't make you weak. It doesn't change who you \"really\" are. It's a tool for managing a medical condition. Full stop.`,
      keyInsights: [
        { 
          title: "Brain is an organ too', 
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
    emoji: '😴",
    content: {
      introduction: `Sleep and mental health form a bidirectional relationship so strong that it's sometimes hard to tell which is causing which. Poor sleep worsens depression, anxiety, and emotional regulation. Depression and anxiety disrupt sleep. It becomes a vicious cycle where each problem feeds the other.

Sleep deprivation affects the brain in measurable ways: the amygdala (emotional alarm center) becomes up to 60% more reactive, while the prefrontal cortex (rational control center) goes partially offline. You're literally less capable of emotional regulation when you're sleep-deprived. Those mood swings aren't weakness - they're sleep debt.

Sleep is also when the brain processes emotions and consolidates memories. Without adequate REM sleep, emotional experiences don't get properly processed. Trauma survivors often have disrupted REM sleep, which may explain why traumatic memories stay so \"hot.\"

Protecting sleep is often the highest-leverage mental health intervention available. It's also one of the hardest, because life conspires against it: work, kids, screens, stress, the feeling that sleep is \"unproductive\" time. But sleep IS productive - it's when your brain does essential maintenance.`,
      keyInsights: [
        { 
          title: 'Sleep deprivation mimics mental illness', 
          explanation: 'Irritability, emotional dysregulation, cognitive impairment, low mood - these look like depression or anxiety but might actually be sleep debt. Check sleep before diagnosing yourself.' 
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
        'Limit screens before bed - the light disrupts melatonin',
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
    triggerGauges: ['body'],
    triggerThreshold: 45,
    triggerMode: 'any',
  },
  {
    id: 'hm-body-movement-mood',
    title: 'Movement and Mood: The Body-Mind Loop',
    category: 'body-health',
    duration: 5,
    emoji: '🏃",
    content: {
      introduction: `Exercise is one of the most effective interventions for depression and anxiety - in some studies comparable to medication. This isn't \"just go for a run and you'll feel better" toxic positivity. It's neuroscience: movement releases endorphins, reduces cortisol, promotes neurogenesis, and activates the body's natural regulation systems.

But here's the cruel irony: when you're depressed or anxious, motivation and energy for movement are exactly what's missing. Telling someone with depression to exercise can feel like telling someone with a broken leg to walk it off. The solution is also blocked by the problem.

The way through is behavioral activation: doing things even when you don't feel like it, knowing that feeling often follows action rather than preceding it. Start smaller than you think necessary. A five-minute walk counts. Movement doesn't have to be exercise - it can be stretching, dancing, cleaning, anything that gets the body moving.

And it's not about achievement or fitness goals. It's about the mood regulation effects of being in motion. The bar is \"moved a bit\" not \"worked out hard.\" Lower the bar until it's something you can actually do, then do it consistently.`,
      keyInsights: [
        { 
          title: 'The evidence is strong', 
          explanation: 'Multiple meta-analyses show exercise has significant effects on depression and anxiety. This isn\'t wishful thinking - it\'s one of the most well-supported interventions we have.' 
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
        'Start embarrassingly small - make the bar low enough that you can clear it',
        'Attach movement to existing habits (after coffee, during lunch)',
        'Find movement that doesn\'t feel like exercise: walking, dancing, gardening',
        'Don\'t wait to feel like it - do it and let the feeling come after',
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
    emoji: '🍷",
    content: {
      introduction: `Many people use substances - alcohol, cannabis, other drugs - to cope with emotional pain, anxiety, depression, or trauma. This is self-medication: using substances to manage symptoms that aren't being addressed another way. It works, in the short term, which is exactly the problem.

Self-medication isn't stupidity or weakness. It's an attempt to solve a real problem with the tools available. Alcohol does reduce anxiety (temporarily). Cannabis does numb emotional pain (temporarily). The problem is that the temporary relief creates longer-term problems: dependency, tolerance, physical health effects, and often a worsening of the original symptoms.

The question isn't whether substances provide relief - they often do. The question is whether the relief is worth the costs, and whether better solutions exist. For most self-medication patterns, the answer is: there are better solutions, but they require access to treatment, resources, and support that not everyone has.

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
        'Be honest about what function the substance serves - what is it managing?',
        'Look at the actual costs, not just the immediate benefits',
        'Explore what you\'d need to address if you stopped using the substance',
        'Seek support that addresses both the substance use and the underlying issues',
        'Harm reduction: if you can\'t stop, can you reduce harm?',
      ],
      professionalNote: 'If you\'re struggling with substance use, please seek support. This could be a therapist, a support group (AA, SMART Recovery, etc.), or a treatment program. You don\'t have to do this alone.'
    },
    reflectionQuestions: [
      'What function does substance use serve in your life? What is it helping you manage?',
      'What are the costs - not just the obvious ones, but the accumulated ones?',
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
    emoji: '🕯️",
    content: {
      introduction: `Grief is the normal response to loss - but loss comes in more forms than death. You can grieve the end of a relationship, the loss of a job, the life you expected, a friendship that faded, your health, your youth, a version of yourself that no longer exists. These are real losses that deserve real grief.

Our culture is bad at grief. We want it to have stages that progress neatly, a timeline, an endpoint. But grief is not linear. It comes in waves. It can ambush you years later. The \"stages\" model (denial, anger, bargaining, depression, acceptance) was never meant to be sequential - the person who created it said it described common experiences, not a roadmap.

Disenfranchised grief - grief that society doesn't recognize as legitimate - is particularly painful. The loss of a pet, a pregnancy, a friendship, an opportunity, a home. When others don't acknowledge your loss as "real," you may feel you don't have permission to grieve. You do.

Grief doesn't require getting over it. It requires learning to carry it. The loss remains. You grow around it. Over time, the grief may soften, but the love doesn't have to.`,
      keyInsights: [
        { 
          title: 'Grief is not just for death', 
          explanation: 'Any significant loss - relationship, health, opportunity, identity, dream - can generate genuine grief. If you lost something that mattered, you\'re allowed to grieve it.' 
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
        'Name the loss - even if others don\'t recognize it',
        'Let yourself grieve fully - don\'t rush or minimize',
        'Find people who can witness your grief without trying to fix it',
        'Create rituals to honor what you\'ve lost',
        'Be patient - grief has its own timeline',
        'Seek support if grief becomes complicated (stuck, overwhelming, extending function impairment for long periods)',
      ],
      professionalNote: 'Complicated grief - when grief remains intensely debilitating for extended periods - may benefit from specialized grief therapy. This isn\'t weakness; it\'s getting appropriate help for a wound that isn\'t healing on its own.'
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
    emoji: '🦋",
    content: {
      introduction: `Identity isn't fixed - it evolves across the lifespan. Sometimes the evolution is gradual. Sometimes it's sudden: a life event forces you to become someone different, or you realize who you've been is no longer who you want to be. These identity shifts are disorienting, even when they're chosen.

Major life transitions often trigger identity restructuring: becoming a parent, retiring, divorce, illness, career change, loss of a role or relationship that defined you, coming out, recovery from addiction, or any major change in circumstances. The old \"you\" no longer applies, but the new one hasn't solidified.

The space between identities - what William Bridges called the "neutral zone" - is uncomfortable. You don't know who you are yet. The old answers to \"who am I?\" don't fit, and the new answers haven't arrived. This in-between time can feel like falling apart even when it's actually falling into place.

Allow the transition. Resisting it prolongs the disorientation. The new identity will emerge, but it requires letting go of the old one - and that's a grief process too.`,
      keyInsights: [
        { 
          title: "Identity is always in process', 
          explanation: 'You\'re not the same person at 40 that you were at 20. Growth means changing, and changing means grieving who you were.' 
        },
        { 
          title: 'The neutral zone is uncomfortable but necessary', 
          explanation: 'Between "who I was" and "who I\'m becoming" is a messy middle. It\'s disorienting but it\'s where transformation happens.' 
        },
        { 
          title: 'Loss of identity is real loss', 
          explanation: 'When you can no longer be who you were - due to illness, circumstances, growth - that\'s a death of sorts. Grief is appropriate.' 
        },
        { 
          title: 'You get to choose (mostly)', 
          explanation: 'Some identity shifts are forced. But you have more say in who you become than you might think. Intentional identity work is possible.' 
        },
      ],
      whatHelps: [
        'Recognize you\'re in transition - naming it helps',
        'Allow the disorientation instead of rushing to resolve it',
        'Explore: who are you if not [old role/identity]?',
        'Try on new possibilities without committing',
        'Grieve the old identity - it was real, even if it no longer fits',
        'Be patient - identity reconstruction takes time',
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
    emoji: '🌱",
    content: {
      introduction: `Starting over is one of the hardest things humans do. After divorce, job loss, death of a partner, major health crisis, or any event that destroys your previous life structure - you face the task of rebuilding from scratch while grieving what was lost.

The simultaneous grief and reconstruction is exhausting. You're supposed to be moving forward while still processing what happened. Society often wants you to \"bounce back\" on a timeline that has nothing to do with reality. There's pressure to be inspirational, to find the silver lining, to turn pain into growth on command.

Here's permission to not be okay for a while. Starting over doesn't mean pretending the loss didn't happen. It means building a new life that acknowledges the loss, that has room for grief alongside new growth. The new life will be different from what you planned. It can still be good - but it will be different.

Take it day by day when long-term vision feels impossible. Do the next small thing. Let people help. Lower the bar for what counts as success. You're not just building a life - you're doing it while carrying grief. That deserves massive compassion.`,
      keyInsights: [
        { 
          title: "Rebuilding while grieving is exhausting', 
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
          title: ''Bouncing back" is a myth', 
          explanation: 'You don\'t bounce back to who you were. You become someone new - someone shaped by the loss but not defined only by it.' 
        },
      ],
      whatHelps: [
        'Let people help - this isn\'t the time for independence',
        'Lower all standards - good enough is the goal',
        'Day by day when longer is too much',
        'Allow grief alongside rebuilding - they can coexist',
        'Find models: people who rebuilt after similar losses',
        'Patience - this takes longer than you want it to',
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
    emoji: '⏳",
    content: {
      introduction: `Aging is the one major life transition that applies to everyone who doesn't die young. Yet we rarely prepare for it, avoid thinking about it, and treat it as something that happens to other people until it happens to us.

The psychological challenges of aging include: adjusting to changing physical capacity, processing accumulated losses, finding meaning without roles that defined you, facing mortality, dealing with a culture that devalues older people, and maintaining connection when your social network naturally shrinks.

But aging also comes with advantages often overlooked: emotional regulation generally improves with age, older adults tend to focus more on meaningful relationships, research shows increases in wellbeing in later life for many people, and accumulated wisdom is real. The \"U-curve\" of happiness suggests wellbeing often increases after middle age.

The transition of aging goes better when acknowledged than when denied. Pretending you're still 35 when you're 65 creates its own suffering. Accepting the reality of this life stage, with its losses AND its gifts, allows you to live it fully rather than fighting it constantly.`,
      keyInsights: [
        { 
          title: 'Denial doesn\'t help', 
          explanation: 'Fighting aging creates suffering. Accepting it as a life stage - with its challenges AND opportunities - allows you to engage with it rather than resist it.' 
        },
        { 
          title: 'Aging has real gifts', 
          explanation: 'Emotional regulation, perspective, focus on what matters, freedom from certain anxieties - research shows these often improve with age.' 
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
        'Stay connected - isolation is one of the biggest risks',
        'Find meaning in this stage - what does it make possible that earlier stages didn\'t?',
        'Address grief for lost capacities, roles, and people',
        'Stay engaged with life - purpose matters at every age',
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
    emoji: '💔",
    content: {
      introduction: `Divorce and major relationship endings involve loss on multiple levels: loss of the person, loss of the future you planned, loss of daily routines and shared life, loss of identity as part of a couple, sometimes loss of home or financial security, and often loss of mutual friends and extended family connections.

Even when the relationship needed to end - even when you're the one who ended it - grief is normal. You can be relieved AND grieving. You can know it was right AND still mourn. These aren't contradictions; they're the complexity of real human experience.

The practical challenges (where to live, finances, custody if children are involved) layer on top of emotional devastation. You're supposed to make major life decisions while your capacity for decision-making is at its lowest. This is a setup for struggle, and giving yourself grace is essential.

Recovery takes longer than you expect or want. Research suggests 2-5 years for full adjustment to divorce. Rushing to \"get over it\" or jumping into a new relationship to avoid the pain typically extends the recovery, not shortens it.`,
      keyInsights: [
        { 
          title: "Multiple losses at once', 
          explanation: 'You\'re not just losing a person - you\'re losing a life structure, a future, an identity. Each of these deserves grief.' 
        },
        { 
          title: 'Relief and grief coexist', 
          explanation: 'Being glad it\'s over doesn\'t mean you don\'t mourn. Both are true. Both are allowed.' 
        },
        { 
          title: 'Recovery takes years, not months', 
          explanation: 'The pressure to "move on" quickly doesn\'t match reality. Full adjustment takes 2-5 years for most people. That\'s not failure - that\'s normal.' 
        },
        { 
          title: 'Making decisions while depleted', 
          explanation: 'Major life decisions during divorce (housing, finances, custody) happen when you\'re least capable of making them well. Get support, go slow when possible.' 
        },
      ],
      whatHelps: [
        'Allow the full grief, including for parts of the relationship that were good',
        'Get support - friends, family, therapist, divorce support group',
        'Be careful about major decisions while in acute grief',
        'Take care of basics: sleep, food, movement, connection',
        'Resist the urge to jump into a new relationship to avoid pain',
        'Be patient - this takes time and that\'s okay',
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
      introduction: `Becoming a parent is one of the most profound identity transitions a person can undergo. In an instant, you become responsible for another human's survival and wellbeing. Your time, body, relationships, work, and sense of self all fundamentally restructure. This is true even when deeply wanted - and especially complicated when it wasn't.

The cultural narrative says you should feel overwhelming love and joy. The reality often includes exhaustion, identity loss, relationship strain, grief for your former life, sometimes ambivalence, and the terrifying responsibility of keeping a tiny human alive. Admitting any of this feels taboo, which isolates new parents in their struggle.

Postpartum depression and anxiety are common (affecting 10-20% of new mothers and a significant percentage of fathers) but still under-discussed. Intrusive thoughts about harm coming to the baby are extremely common and don't mean you're dangerous - they're a feature of the hypervigilant postpartum brain.

The identity shift of parenthood is permanent. You will never not be a parent again. This can be beautiful and it can feel like a trap. Both are valid experiences of the same reality.`,
      keyInsights: [
        { 
          title: "Identity reconstruction is normal', 
          explanation: 'You\'re not the same person you were before. Mourning your pre-parent self - your freedom, your sleep, your identity - is allowed and doesn\'t mean you don\'t love your child.' 
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
        'Talk honestly about the hard parts - break the isolation',
        'Get help - you\'re not meant to do this alone',
        'Sleep when possible (yes, really)',
        'Screen for postpartum depression/anxiety - it\'s common and treatable',
        'Grieve the identity you lost while embracing the one you\'re gaining',
        'Communicate with your partner - the relationship needs attention',
      ],
      warningSign: 'Postpartum depression and anxiety are serious. If you\'re having persistent low mood, excessive anxiety, intrusive thoughts you can\'t shake, or thoughts of harming yourself or your baby, please tell someone immediately.'
    },
    reflectionQuestions: [
      'What parts of your pre-parent identity are you mourning?',
      'What would you admit about parenthood that you don\'t usually say out loud?',
    ],
    relatedLessons: ['hm-trans-identity-shifts', 'hm-mh-depression-truth'],
  },
  {
    id: 'hm-trans-infertility-loss',
    title: 'Infertility & Pregnancy Loss: Grief Often Minimized',
    category: 'life-transitions',
    duration: 9,
    emoji: '🥀",
    content: {
      introduction: `Infertility and pregnancy loss are among the most isolating forms of grief because they're so often minimized, hidden, or misunderstood. \"At least you can try again.\" \"It wasn't meant to be." "You're still young.\" These well-meaning phrases communicate something devastating: your loss doesn't count.

But it does count. A miscarriage is the loss of a hoped-for child, a future you'd already begun imagining, a family that won't exist as planned. Infertility is a series of losses - each month, each failed treatment, each time someone asks when you're having kids. These are real griefs that deserve real acknowledgment.

The physical experience compounds the emotional one. Pregnancy loss is a bodily trauma. Infertility treatments are invasive, hormonal, and exhausting. Your body, which you may have trusted, becomes a site of failure and betrayal. The disconnect between what your body is supposed to do and what it's doing creates a particular kind of anguish.

Relationships are tested. Partners may grieve differently, creating distance when you need closeness. Friends with children become painful to be around. Baby showers and pregnancy announcements feel like personal attacks even though they're not. The isolation grows because talking about it feels like burdening others with something they can't fix.

Healing doesn't require "getting over it" or finding the silver lining. It requires having your loss witnessed, your grief validated, and your experience recognized as significant. Because it is.`,
      keyInsights: [
        { 
          title: 'This is real loss', 
          explanation: 'You\'re grieving a person who existed in hope, a future that won\'t happen, a version of yourself as a parent. The loss being invisible to others doesn\'t make it less real to you.' 
        },
        { 
          title: 'Disenfranchised grief is particularly painful', 
          explanation: 'When others minimize your loss ("at least it was early"), you may feel you don\'t have permission to grieve. You do. Their discomfort with your pain doesn\'t determine its validity.' 
        },
        { 
          title: 'Body and emotions are intertwined', 
          explanation: 'Pregnancy loss and infertility are physical experiences. Hormones, physical pain, bodily changes - the grief isn\'t just emotional. Your body is grieving too.' 
        },
        { 
          title: 'Each person grieves differently', 
          explanation: 'Partners often have different grieving styles and timelines. This doesn\'t mean one cares more. But it can create painful disconnection when you most need support.' 
        },
        {
          title: 'Secondary losses compound the primary one',
          explanation: 'You may also lose your sense of control, trust in your body, ease around pregnant friends, financial stability (if treatments are involved), and the assumed future you\'d planned. Each of these is its own grief.'
        }
      ],
      whatHelps: [
        'Name your loss - give yourself permission to grieve what you\'re actually grieving',
        'Find people who understand - support groups, online communities, others who\'ve been through it',
        'Create rituals to honor your loss (naming, memorial, marking anniversaries)',
        'Communicate with your partner about what you each need',
        'Set boundaries around triggering situations (baby showers, family gatherings)',
        'Allow the grief to be as big as it is - don\'t minimize it to make others comfortable',
        'Consider therapy with someone specializing in perinatal loss',
      ],
      warningSign: 'If grief becomes all-consuming, if you\'re having thoughts of self-harm, or if you\'re unable to function for extended periods, please reach out for professional support. This is a significant trauma that sometimes requires professional help to process.',
      professionalNote: 'Therapists specializing in perinatal loss understand this particular grief. RESOLVE: The National Infertility Association and pregnancy loss organizations offer support groups and resources.'
    },
    reflectionQuestions: [
      'What losses are you grieving that others might not see or understand?',
      'What do you need from others that you\'re not getting? Can you ask for it directly?',
      'How has this experience changed your relationship with your body?',
    ],
    relatedLessons: ['hm-trans-grief-all-kinds', 'hm-trans-becoming-parent', 'hm-body-chronic'],
  },
  {
    id: 'hm-trans-chronic-pain',
    title: 'Chronic Pain: When Your Body Won\'t Stop Hurting',
    category: 'life-transitions',
    duration: 9,
    emoji: '🔥",
    content: {
      introduction: `Living with chronic pain means waking up each day to a body that won't stop signaling danger. It's exhausting in a way that people without chronic pain can't fully understand - not just the pain itself, but the relentlessness of it, the way it colors every moment, the mental energy required just to function.

Chronic pain changes everything. It changes your capabilities, your relationships, your work, your mood, your sense of self. Activities you once did without thinking become calculations: Is this worth the pain it will cost? Will I pay for this tomorrow? The constant negotiation with your body is draining.

Adding to the burden is how often chronic pain is dismissed or disbelieved. \"Have you tried yoga?\" \"It's probably stress.\" \"You don't look sick." When medical professionals and loved ones don't believe your pain, you start doubting yourself. Gaslighting about your own body is its own form of trauma.

Pain science has evolved significantly. We now understand that chronic pain involves changes in the nervous system - the pain is real, even when scans show nothing. The brain's pain processing has become sensitized. This isn't \"all in your head\" in the dismissive sense - it's in your nervous system, which is very real and very physical.

Living well with chronic pain isn't about pretending it doesn't exist. It's about building a life that acknowledges the pain while not letting it define everything. This is incredibly hard, and anyone doing it deserves recognition for fighting a battle others can't see.`,
      keyInsights: [
        { 
          title: 'Chronic pain is exhausting beyond the pain itself', 
          explanation: 'The constant negotiation, the mental energy of coping, the grief for what you\'ve lost - fatigue is a central feature of chronic pain, not a separate problem.' 
        },
        { 
          title: 'The pain is real, even without visible cause', 
          explanation: 'Modern pain science confirms that nervous system sensitization creates real pain that doesn\'t always show on scans. "We can\'t find anything" doesn\'t mean "nothing\'s wrong."' 
        },
        { 
          title: 'Grief is appropriate', 
          explanation: 'You\'ve lost capabilities, spontaneity, your old body, your old life. Grieving these losses isn\'t weakness - it\'s a normal response to real loss.' 
        },
        { 
          title: 'Medical gaslighting is a trauma', 
          explanation: 'Being disbelieved by doctors, told it\'s stress, having your experience minimized - this is its own wound that compounds the pain experience.' 
        },
        {
          title: 'Boom-bust cycles make things worse',
          explanation: 'Overdoing it on good days and crashing for days after is common but counterproductive. Pacing - doing less than you could on good days - helps prevent flares but feels frustratingly limiting.'
        }
      ],
      whatHelps: [
        'Find healthcare providers who believe you and specialize in chronic pain',
        'Learn about pain science - understanding the nervous system can reduce fear',
        'Pacing: doing less on good days to avoid crashes',
        'Pain management approaches: PT, gentle movement, stress reduction, sleep optimization',
        'Connect with others who understand - chronic pain communities',
        'Grief work for the life and body you\'ve lost',
        'Set boundaries around unsolicited advice',
        'Mental health support - chronic pain and depression/anxiety often co-occur',
      ],
      warningSign: 'Chronic pain significantly increases risk for depression and suicidal thoughts. If you\'re struggling to see a way forward, please reach out to a mental health professional or crisis line.',
      professionalNote: 'Multidisciplinary pain programs, when available, combine medical, psychological, and physical approaches and have the best evidence for chronic pain management.'
    },
    reflectionQuestions: [
      'What have you lost to chronic pain that you haven\'t fully grieved?',
      'Where have you felt disbelieved, and how has that affected you?',
      'What does a "good life" look like with your current body - not the one you wish you had?',
    ],
    relatedLessons: ['hm-trans-grief-all-kinds', 'hm-trans-chronic-illness', 'hm-trans-disability'],
  },
  {
    id: 'hm-trans-disability',
    title: 'Disability: Visible and Invisible',
    category: 'life-transitions',
    duration: 10,
    emoji: '♿",
    content: {
      introduction: `Disability affects how you move through the world - not just physically or cognitively, but socially, economically, and psychologically. Whether your disability is visible (using a wheelchair, having a visible difference) or invisible (chronic illness, learning disabilities, mental health conditions), it shapes your daily experience in ways non-disabled people rarely understand.

The social model of disability distinguishes between impairment (the condition itself) and disability (the barriers society creates). Much of what makes disability hard isn't the condition - it's the stairs without ramps, the websites without accessibility, the jobs that won't accommodate, the assumptions that you're less capable. Disability is as much about how society is designed as about your body or mind.

Invisible disabilities carry their own challenges. You may \"look fine,\" leading others to doubt your experience. You have to decide constantly whether to disclose - and face either disbelief or discrimination either way. The energy spent managing others" perceptions is exhausting.

Identity around disability is complex. Some people embrace disability identity and find community in disability culture. Others resist the label or grieve the life they expected. Many feel both. Your relationship to your disability can change over time, and there's no \"right\" way to feel about it.

What's true across the spectrum: disabled people deserve full participation in life, not charity. Accessibility isn't a special favor - it's equity. And the lived expertise of disabled people about their own experience matters more than what non-disabled "experts" assume.`,
      keyInsights: [
        { 
          title: 'The social model of disability', 
          explanation: 'Much of disability is socially created through inaccessible environments, discrimination, and exclusion. The problem isn\'t your body/mind - it\'s a society designed for a narrow range of bodies and minds.' 
        },
        { 
          title: 'Invisible disabilities are real disabilities', 
          explanation: 'You don\'t need to look disabled to be disabled. Chronic illness, chronic pain, mental health conditions, learning disabilities - these are real even when others can\'t see them.' 
        },
        { 
          title: 'Disclosure is a constant calculation', 
          explanation: 'To disclose or not: risk disbelief and minimization, or risk being seen as hiding something. Either way, you bear the burden of managing others\' perceptions.' 
        },
        { 
          title: 'Identity is personal and can change', 
          explanation: 'Some people proudly claim disability identity. Others prefer "person with a disability" or resist labels entirely. Your feelings about your disability may evolve. All of this is valid.' 
        },
        {
          title: 'Accommodation isn\'t special treatment',
          explanation: 'Accommodations create equity, not advantage. A ramp isn\'t a favor to wheelchair users - it\'s removing a barrier that shouldn\'t exist. The same applies to workplace accommodations, extra time, or other supports.'
        }
      ],
      whatHelps: [
        'Know your rights - disability discrimination is illegal; accommodations are owed, not favors',
        'Connect with disability community - others who truly understand',
        'Allow yourself whatever feelings you have about your disability, including grief',
        'Develop language for disclosure that feels comfortable to you',
        'Advocate for accessibility - you have expertise others lack',
        'Set boundaries around inspiration porn and unsolicited advice',
        'Find healthcare providers who listen and don\'t dismiss',
      ],
      professionalNote: 'Many therapists lack training in disability issues and may hold ableist assumptions. Seek out disability-affirming providers or those with lived experience. Disability advocacy organizations can provide referrals.'
    },
    reflectionQuestions: [
      'What barriers do you face that are about how society is designed rather than your condition?',
      'How do you feel about disability as an identity? Has that changed over time?',
      'Where do you need to advocate for yourself more, and what makes that hard?',
    ],
    relatedLessons: ['hm-trans-chronic-pain', 'hm-trans-chronic-illness', 'hm-trans-identity-shifts'],
  },
  {
    id: 'hm-trans-sandwich-generation',
    title: 'Caring for Aging Parents: The Sandwich Generation',
    category: 'life-transitions',
    duration: 8,
    emoji: '🥪',
    content: {
      introduction: `The "sandwich generation" refers to adults caught between caring for aging parents and raising their own children - squeezed from both directions at once. But even without kids, caring for aging parents is one of life's most challenging transitions. The role reversal alone is disorienting: the people who once took care of you now depend on you.

This transition often happens gradually, then suddenly. First it's helping with bills or driving to appointments. Then it's managing medications, navigating healthcare systems, making difficult decisions about living situations. You may find yourself becoming a nurse, care coordinator, financial manager, and emotional support - roles you never trained for.

The emotional complexity is immense. You're grieving your parent's decline while they're still alive. You may feel guilty for resenting the burden, for not doing enough, for having a life of your own. Old family dynamics resurface under stress. Siblings may not share the load equally, creating conflict. You're mourning the relationship you had and the parent you're losing, even as they're physically present.

Self-sacrifice is not sustainable. The cultural expectation that you should give everything - your time, your finances, your health - to caregiving is a setup for burnout and resentment. Caring for yourself isn't selfish; it's how you stay capable of caring for anyone.`,
      keyInsights: [
        { 
          title: 'Role reversal is disorienting', 
          explanation: 'Becoming the caretaker for someone who raised you scrambles the fundamental order of your relationship. Grief, resistance, and confusion are all normal responses.' 
        },
        { 
          title: 'Anticipatory grief is real', 
          explanation: 'You\'re grieving before death - grieving the decline, the lost abilities, the relationship you used to have. This is exhausting and valid.' 
        },
        { 
          title: 'Family dynamics intensify under stress', 
          explanation: 'Old patterns, rivalries, and wounds often resurface during parent care. Siblings who never communicated well don\'t suddenly start now.' 
        },
        { 
          title: 'You cannot pour from an empty cup', 
          explanation: 'Self-sacrifice isn\'t noble when it leads to burnout. Your wellbeing matters - not just for you, but for your ability to care for anyone.' 
        },
        {
          title: 'The system is not designed to help',
          explanation: 'Navigating healthcare, insurance, Medicare, assisted living, and home care is bewildering. The burden of coordination falls on family, with little support. This is a systemic failure, not your personal incompetence.'
        }
      ],
      whatHelps: [
        'Set boundaries - you cannot do everything and shouldn\'t try',
        'Accept help - let others contribute, hire help if possible',
        'Have difficult conversations early about wishes, finances, and care',
        'Communicate with siblings about division of responsibilities (get specific)',
        'Use respite care - breaks are essential, not optional',
        'Join a caregiver support group - others understand',
        'Grieve openly - this is a loss even while your parent is alive',
        'Protect your own health - schedule your own checkups, maintain your own life',
      ],
      professionalNote: 'Geriatric care managers can help navigate complex care decisions. Social workers at hospitals or senior centers can connect you with resources. Caregiver burnout is real - therapy can help.'
    },
    reflectionQuestions: [
      'What boundaries do you need to set to protect your own wellbeing?',
      'What are you grieving about your parent that you haven\'t acknowledged?',
      'Who else can share this responsibility, and what\'s getting in the way of asking?',
    ],
    relatedLessons: ['hm-trans-caregiver-burnout', 'hm-trans-grief-all-kinds', 'hm-stress-overwhelm'],
  },
  {
    id: 'hm-trans-caregiver-burnout',
    title: 'Caregiver Burnout: You Can\'t Pour From Empty',
    category: 'life-transitions',
    duration: 8,
    emoji: '🪫",
    content: {
      introduction: `Caregiving - whether for a child with special needs, a sick partner, an aging parent, or anyone who depends on you - is one of the most demanding roles a person can occupy. It's also one of the most isolating, because the needs of the person you're caring for often eclipse your own until there's nothing left.

Caregiver burnout isn't just being tired. It's a state of physical, emotional, and mental exhaustion that comes from prolonged caregiving without adequate support. Signs include feeling overwhelmed, hopeless, resentful toward the person you're caring for, withdrawn from others, unable to relax even when you have a break, physically ill more often, and finding no joy in things that used to matter.

The cruel irony is that the most dedicated caregivers are most vulnerable to burnout. The ones who give everything, who never take breaks, who feel guilty for having any needs of their own - they're the ones who crash hardest. And in the crash, they often become unable to provide care at all, which is exactly what they were trying to prevent.

Society romanticizes selfless caregiving while providing almost no support for caregivers. The expectation that you should sacrifice your health, career, relationships, and identity on the altar of caregiving is not noble - it's unsustainable and unfair. Caring for yourself is not a betrayal of the person you're caring for. It's what makes continued caregiving possible.`,
      keyInsights: [
        { 
          title: "Burnout is a state, not a character flaw', 
          explanation: 'You\'re not burned out because you\'re weak. You\'re burned out because the demands exceeded the resources for too long. It\'s physics, not moral failure.' 
        },
        { 
          title: 'Resentment is a warning signal', 
          explanation: 'Feeling resentful toward the person you\'re caring for - or toward those who aren\'t helping - is a sign you\'ve given too much without replenishment. It\'s information, not a character defect.' 
        },
        { 
          title: 'Guilt is the enforcer of unsustainability', 
          explanation: 'Guilt keeps you giving past your limits. But guilt-driven caregiving leads to burnout, which helps no one. Healthy limits aren\'t abandonment.' 
        },
        { 
          title: 'Self-care isn\'t selfish - it\'s infrastructure', 
          explanation: 'You are the infrastructure of care. If you collapse, the care collapses. Maintaining yourself is part of maintaining care.' 
        },
        {
          title: 'Society\'s failure becomes your burden',
          explanation: 'Inadequate healthcare systems, lack of affordable long-term care, minimal respite options - caregivers bear the cost of systemic failures. Your exhaustion is not just personal; it\'s political.'
        }
      ],
      whatHelps: [
        'Acknowledge burnout without shame - it means you\'ve been giving a lot',
        'Accept help - any help, even imperfect help',
        'Schedule regular respite - put it on the calendar like a medical appointment',
        'Maintain at least one thing that\'s yours: a friendship, a hobby, something',
        'Caregiver support groups - others who understand without explanation',
        'Set minimum standards for your own care: sleep, food, one break per week',
        'Explore options you\'ve dismissed: professional care, family help, programs',
        'Therapy or counseling - you need someone focused on YOU',
      ],
      warningSign: 'If you\'re having thoughts of harming yourself or the person you\'re caring for, please reach out immediately. This is a sign of severe burnout that requires urgent support.',
      professionalNote: 'Therapists, social workers, and geriatric care managers can help identify resources. Many communities have caregiver support services that are underutilized because caregivers don\'t know about them or don\'t feel they deserve help.'
    },
    reflectionQuestions: [
      'On a scale of 1-10, how burned out are you? What evidence supports your answer?',
      'What help have you refused that you could reconsider accepting?',
      'What would caring for yourself as well as you care for others actually look like?',
    ],
    relatedLessons: ['hm-trans-sandwich-generation', 'hm-stress-burnout', 'hm-mh-depression-truth'],
  },
  {
    id: 'hm-trans-empty-nest',
    title: 'Empty Nest: When Kids Leave',
    category: 'life-transitions',
    duration: 7,
    emoji: '🪹",
    content: {
      introduction: `For years or decades, your identity has been intertwined with being a parent. The rhythm of daily life revolved around your children - their needs, their schedules, their presence. And then, gradually or suddenly, the house is quiet. They're gone. And you're left wondering who you are now.

Empty nest syndrome isn't a clinical diagnosis, but the experience is real: grief, loneliness, loss of purpose, even depression when children leave home. It can feel like losing your job, your meaning, and your closest daily companions all at once. The absence is physical - empty rooms, quiet dinners - and existential: what am I for now?

This transition is complicated by conflicting emotions. You might feel proud of raising independent humans, relieved to have more freedom, and devastated by the loss all at the same time. You might feel guilty for struggling when you're \"supposed\" to be happy for them. You might grieve the daily connection while genuinely wanting them to thrive independently.

The task of this transition is reinvention. Who are you when you're not actively parenting? What does your relationship with your partner look like now? What interests did you set aside that you could reclaim? The nest is empty, but that's not the end - it's a new beginning that requires intentional creation.`,
      keyInsights: [
        { 
          title: "This is real grief', 
          explanation: 'You\'re grieving a role that defined you, daily presence you relied on, a phase of life that\'s over. The fact that it\'s developmentally normal doesn\'t make it less painful.' 
        },
        { 
          title: 'Conflicting feelings are normal', 
          explanation: 'Pride and grief, relief and loneliness, joy for their independence and sadness for your loss - these coexist. You don\'t have to choose one feeling.' 
        },
        { 
          title: 'Your relationship with your partner may need renegotiating', 
          explanation: 'If kids were the focus, you may barely know who you are as a couple anymore. This requires deliberate attention - some couples thrive, others realize they\'ve grown apart.' 
        },
        { 
          title: 'Identity reconstruction is the task', 
          explanation: 'This isn\'t just about filling time. It\'s about discovering or rediscovering who you are beyond the parent role. This takes intentional exploration.' 
        },
      ],
      whatHelps: [
        'Allow yourself to grieve - don\'t minimize this as no big deal',
        'Resist the urge to fill the void immediately - sit with the emptiness first',
        'Reconnect with your partner - date again, have conversations you couldn\'t with kids around',
        'Revisit interests you set aside during intensive parenting years',
        'Develop new routines - the old structure is gone, create a new one',
        'Stay connected to your kids in new ways - the relationship evolves, it doesn\'t end',
        'Consider what you want this next chapter to be about',
      ],
    },
    reflectionQuestions: [
      'What parts of yourself did you set aside during active parenting that you\'d like to reclaim?',
      'How has your relationship with your partner been affected? What does it need?',
      'What would make this next chapter meaningful to you?',
    ],
    relatedLessons: ['hm-trans-identity-shifts', 'hm-trans-retirement-identity', 'hm-trans-grief-all-kinds'],
  },
  {
    id: 'hm-trans-retirement-identity',
    title: 'Retirement Identity: Who Am I Without Work?',
    category: 'life-transitions',
    duration: 8,
    emoji: '🏖️",
    content: {
      introduction: `Retirement is sold as the golden finish line - rest, freedom, endless vacation. But for many people, it triggers an identity crisis. When your work was not just what you did but who you were, leaving it creates a void that golf and grandchildren may not fill.

In our culture, \"What do you do?\" is how we introduce ourselves. Your work provided structure, purpose, social connection, intellectual stimulation, and a sense of contribution. Remove all of that at once, and the freedom that sounded wonderful can feel like formlessness. The relief of no longer working can coexist with the loss of everything work provided.

This is particularly acute for people whose identity was deeply tied to their profession: doctors, executives, teachers, anyone who answered \"I am a ___\" rather than \"I work as a ___.\" The title wasn't just a job - it was a self-concept. Without it, you may feel you've lost not just your schedule but your significance.

Successful retirement isn't about doing nothing - it's about finding new sources of the things work provided: structure, purpose, connection, contribution, and identity. This requires active creation, not passive waiting. The retirees who thrive are those who approach retirement as a new chapter to author, not just an ending to endure.`,
      keyInsights: [
        { 
          title: "Work provides more than money', 
          explanation: 'Structure, identity, social connection, purpose, intellectual engagement - work provides many things besides income. Retirement removes all of them simultaneously.' 
        },
        { 
          title: 'Loss of identity is a grief process', 
          explanation: 'If you were your job, retirement is a kind of death. The grieving is appropriate and necessary before rebuilding.' 
        },
        { 
          title: 'Freedom can feel like emptiness', 
          explanation: 'Unstructured time sounds wonderful until you have endless amounts of it. Humans need structure; creating your own requires effort.' 
        },
        { 
          title: 'Significance must be recreated', 
          explanation: 'If your sense of mattering came from work, you need new ways to feel significant. Volunteering, mentoring, creative pursuits, relationships - these can provide meaning, but you have to build them.' 
        },
        {
          title: 'Relationships shift',
          explanation: 'Daily proximity to your partner increases dramatically. Work friendships may fade without the workplace. New social structures need to be consciously created.'
        }
      ],
      whatHelps: [
        'Expect an adjustment period - it takes 1-2 years for most people to find their footing',
        'Create structure - have reasons to get up, places to be, regular rhythms',
        'Find new sources of purpose - volunteering, mentoring, creating, contributing',
        'Maintain and build social connections - loneliness is a major risk',
        'Explore new identities - what might you become now?',
        'Give yourself permission to not be productive - rest is allowed',
        'Address practical concerns: finances, health insurance, healthcare',
        'Consider part-time work or consulting if full retirement feels like too much too fast',
      ],
      professionalNote: 'Depression in retirement is common but often unrecognized. If the adjustment period extends beyond a year or two with persistent low mood, consider talking to a mental health professional.'
    },
    reflectionQuestions: [
      'If you\'re not your job title, who are you? What else defines you?',
      'What did work provide that you need to find elsewhere?',
      'What does a meaningful retirement look like for you specifically - not the cultural script?',
    ],
    relatedLessons: ['hm-trans-identity-shifts', 'hm-trans-empty-nest', 'hm-work-job-identity'],
  },
  {
    id: 'hm-trans-midlife-crisis',
    title: 'Midlife Crisis: The Reevaluation',
    category: 'life-transitions',
    duration: 8,
    emoji: '🔄",
    content: {
      introduction: `The term \"midlife crisis\" has become a punchline - the sports car, the affair, the desperate grasp at youth. But beneath the clichés is a legitimate psychological experience: a profound reassessment of life that often happens somewhere between 40 and 60, when mortality becomes real and the question \"Is this all there is?\" demands an answer.

At midlife, you've lived long enough to see what choices led where. Dreams pursued and dreams abandoned. Relationships that worked and ones that didn't. A career that fulfilled or one that just paid bills. You may have achieved what you thought you wanted and found it hollow, or failed to achieve it and faced the grief of closed doors. Either way, the question of meaning becomes urgent.

This is actually developmentally normal. Erik Erikson called the midlife task "generativity vs. stagnation" - the need to contribute something that outlasts you, to matter beyond yourself. When that need isn't met, or when you realize your life hasn't matched your values, crisis emerges.

The \"crisis\" can be destructive - impulsive decisions that blow up your life without addressing the underlying questions. Or it can be generative - a genuine reassessment that leads to more authentic living. The difference is whether you react impulsively to escape the discomfort, or sit with the questions long enough to find real answers.`,
      keyInsights: [
        { 
          title: "The crisis is a question, not a diagnosis', 
          explanation: ''Is this life worth living? Is this who I want to be? What do I want my remaining years to mean?" These are legitimate questions that deserve serious engagement.' 
        },
        { 
          title: 'Mortality becomes real', 
          explanation: 'At midlife, death stops being abstract. You may have more years behind you than ahead. This awareness can be terrifying or clarifying - often both.' 
        },
        { 
          title: 'Impulsive decisions are reactions, not answers', 
          explanation: 'The sports car, the affair, the sudden career change - these often attempt to escape the questions rather than answer them. Temporary relief, lasting regret.' 
        },
        { 
          title: 'Values realignment is the work', 
          explanation: 'The real task of midlife is aligning how you live with what actually matters to you. This may require changes, but they should be thoughtful, not reactive.' 
        },
        {
          title: 'Grief is part of the process',
          explanation: 'You may need to grieve roads not taken, younger selves who had more options, dreams that won\'t happen now. This grief is necessary for moving forward.'
        }
      ],
      whatHelps: [
        'Take the questions seriously - don\'t dismiss or suppress them',
        'Slow down before making major decisions - urgency often leads to regret',
        'Examine your values: What actually matters to you? Is your life reflecting that?',
        'Grieve what needs grieving - lost youth, closed doors, unlived lives',
        'Seek meaning through generativity - what can you contribute that outlasts you?',
        'Therapy or coaching can help navigate without blowing things up',
        'Talk to others in midlife - you\'re not alone in this questioning',
      ],
      professionalNote: 'Existential therapy is specifically designed for questions of meaning, mortality, freedom, and isolation that arise at midlife. Not all therapists are trained in this approach - seek one who is if these questions are central.'
    },
    reflectionQuestions: [
      'What questions about your life have you been avoiding?',
      'If you knew you had 20 good years left, what would you change about how you\'re living?',
      'What would you regret not doing or being if your life ended today?',
    ],
    relatedLessons: ['hm-trans-identity-shifts', 'hm-trans-aging-mortality', 'hm-work-job-identity'],
  },
  {
    id: 'hm-trans-aging-mortality',
    title: 'Aging & Mortality: Facing the End',
    category: 'life-transitions',
    duration: 9,
    emoji: '🕯️",
    content: {
      introduction: `Death is the one certainty we spend most of our lives avoiding. But as you age - as your body changes, as friends and family members die, as your own mortality becomes undeniable - the avoidance becomes impossible. Facing death is perhaps the most profound psychological task a human can undertake.

Existentialists suggest that death awareness can either paralyze us with anxiety or liberate us to live more fully. When you truly accept that your time is limited, trivial concerns fall away. What matters becomes clear. Many people report that confronting mortality - through illness, loss, or simply aging - fundamentally reorients their priorities toward what's actually meaningful.

But getting to that clarity often requires passing through terror. The fear of non-existence, of leaving loved ones, of suffering, of the unknown - these are universal human fears that become more present as death becomes more proximate. There's no shame in fearing death. The question is whether fear will dominate your remaining life or whether you can find a way to hold it while still living fully.

Preparation matters - not just the practical kind (wills, advance directives) but the psychological kind. Processing your relationship to death, having conversations with loved ones, deciding how you want to live in whatever time remains. These are not morbid preoccupations but essential preparations for the one experience no one escapes.`,
      keyInsights: [
        { 
          title: 'Death awareness clarifies life', 
          explanation: 'Paradoxically, accepting mortality often improves quality of life. When time is clearly finite, priorities become clear and trivial concerns diminish.' 
        },
        { 
          title: 'Fear is normal but not final', 
          explanation: 'Terror of death is a universal human experience. It doesn\'t have to be overcome to live well - it can be acknowledged and coexisted with.' 
        },
        { 
          title: 'Legacy is a fundamental need', 
          explanation: 'Most people want to matter beyond their death - through children, work, impact, memory. Addressing this need directly can reduce death anxiety.' 
        },
        { 
          title: 'Conversations about death are gifts', 
          explanation: 'Talking with loved ones about death - your wishes, fears, and what you want them to know - is uncomfortable but precious. These conversations often become treasured after you\'re gone.' 
        },
        {
          title: 'Practical preparation reduces anxiety',
          explanation: 'Having your affairs in order - will, advance directive, expressed wishes - provides relief. Knowing your loved ones won\'t have to guess reduces burden on everyone.'
        }
      ],
      whatHelps: [
        'Allow yourself to think about death - avoidance increases anxiety long-term',
        'Have conversations with loved ones about death and wishes',
        'Complete practical preparations: will, advance directive, organized documents',
        'Consider what legacy means to you - not just material, but impact, memory, meaning',
        'Practice mindfulness or contemplation to build comfort with impermanence',
        'Connect with community around aging and mortality - churches, groups, hospice volunteers',
        'Consider what "a good death" means to you and communicate it',
      ],
      professionalNote: 'Existential therapy specifically addresses death anxiety. Palliative care teams include social workers and chaplains who help with psychological and spiritual aspects of facing death. Hospice philosophy emphasizes living fully until death.'
    },
    reflectionQuestions: [
      'What would you do differently if you truly accepted that your time is limited?',
      'What conversations do you need to have with people you love before it\'s too late?',
      'What would constitute a "good death" for you? A "good life" in whatever time remains?',
    ],
    relatedLessons: ['hm-trans-aging', 'hm-trans-midlife-crisis', 'hm-trans-grief-all-kinds'],
  },
  {
    id: 'hm-trans-poverty',
    title: 'Poverty & Financial Insecurity: Survival Mode',
    category: 'life-transitions',
    duration: 9,
    emoji: '💸",
    content: {
      introduction: `Poverty is not a moral failing. It's a circumstance that affects every dimension of life - not just your bank account, but your health, relationships, mental state, and opportunities. Living in financial insecurity means living in survival mode, where the cognitive load of constant scarcity makes everything else harder.

Research shows that poverty taxes cognitive bandwidth. When you're worried about whether you can pay rent or buy groceries, there's less mental capacity for anything else. This isn't a character defect - it's a predictable effect of scarcity on the brain. Poor people aren't worse at decisions; they're making decisions under conditions that make everyone worse at decisions.

The stress of financial insecurity is chronic and relentless. It's not knowing if you'll have enough this month. It's choosing between medications and heat. It's the shame when you can't give your kids what others have. It's being one emergency away from disaster. This constant stress has documented effects on physical health, mental health, and relationships.

Society often blames individuals for poverty while ignoring systemic causes: wage stagnation, housing costs, healthcare costs, lack of social safety nets. The narrative that anyone can make it with hard work ignores that many people work extremely hard and still can't get ahead. Understanding poverty as a systemic issue, not a personal failing, is essential for both policy change and self-compassion.`,
      keyInsights: [
        { 
          title: 'Poverty is cognitively expensive', 
          explanation: 'Scarcity consumes mental bandwidth. The constant calculations, trade-offs, and worry leave less capacity for other decisions. This is neuroscience, not laziness.' 
        },
        { 
          title: 'Chronic stress has health consequences', 
          explanation: 'Living in financial insecurity keeps your stress system activated long-term. This contributes to heart disease, weakened immunity, depression, and other health problems.' 
        },
        { 
          title: 'Shame compounds the problem', 
          explanation: 'In a culture that equates wealth with worth, poverty carries stigma. This shame adds psychological burden and can prevent people from seeking help.' 
        },
        { 
          title: 'Systemic causes matter', 
          explanation: 'Poverty is often blamed on individual choices while ignoring stagnant wages, housing costs, healthcare costs, and inadequate safety nets. Personal responsibility exists within systems that constrain options.' 
        },
        {
          title: 'Survival mode limits long-term thinking',
          explanation: 'When you\'re focused on making it through today, it\'s hard to plan for next year. This isn\'t shortsightedness - it\'s an appropriate response to immediate survival needs.'
        }
      ],
      whatHelps: [
        'Release shame - poverty is a circumstance, not a character judgment',
        'Access every resource available - you\'ve paid into these systems; use them',
        'Connect with others in similar situations - community reduces isolation',
        'Prioritize ruthlessly when you can\'t do everything',
        'Protect mental health as much as possible given constraints',
        'Advocate for systemic change - your experience gives you expertise',
        'Make plans, even small ones - agency helps even when options are limited',
      ],
      professionalNote: 'Financial counseling, social workers, and community organizations can help navigate resources. Many mental health services offer sliding scale fees. 211 is a resource line that can connect you with local assistance.'
    },
    reflectionQuestions: [
      'How has financial stress affected your mental and physical health?',
      'What shame messages about poverty have you internalized that you could challenge?',
      'What resources might be available that you haven\'t accessed?',
    ],
    relatedLessons: ['hm-trans-housing-instability', 'hm-stress-overwhelm', 'hm-mh-depression-truth'],
  },
  {
    id: 'hm-trans-housing-instability',
    title: 'Homelessness & Housing Instability',
    category: 'life-transitions',
    duration: 9,
    emoji: '🏚️",
    content: {
      introduction: `Housing instability exists on a spectrum - from living in shelters or on the street, to couch surfing with friends, to constantly fearing eviction. All forms of housing insecurity create profound stress and make every other aspect of life harder. A stable address is the foundation that most other stability builds on.

Homelessness is dehumanizing in ways that are hard to understand without experiencing it. The lack of privacy, the constant vulnerability, the way people look through you or around you, the impossibility of doing basic things like showering or storing belongings. The message from society is clear: you don't matter. Fighting against that message while trying to survive is exhausting.

The causes of homelessness are complex: mental illness, addiction, job loss, domestic violence, lack of affordable housing, medical bankruptcy, and more. But whatever the pathway into homelessness, the experience itself creates additional trauma and barriers to escape. It's hard to get a job without an address. It's hard to stay sober without stability. The system creates obstacles at every turn.

Recovery from housing instability is not just about getting a roof overhead - it's about recovering from the trauma of instability itself. The hypervigilance, the shame, the grief for what was lost, and the difficulty trusting stability when you've learned that security can vanish. These psychological wounds need attention alongside practical housing solutions.`,
      keyInsights: [
        { 
          title: 'Housing is foundation', 
          explanation: 'Without stable housing, almost nothing else is possible. Job searching, medical care, mental health, relationships - all require a foundation of secure housing.' 
        },
        { 
          title: 'Homelessness is traumatic', 
          explanation: 'The experience of being unhoused is itself a trauma, creating hypervigilance, shame, and psychological wounds that persist even after housing is obtained.' 
        },
        { 
          title: 'The system creates barriers', 
          explanation: 'Need ID to get housing, need address to get ID. Need work history for jobs, need address for work history. The system is designed in ways that make escape difficult.' 
        },
        { 
          title: 'Multiple causes, one result', 
          explanation: 'Mental illness, addiction, job loss, medical crisis, domestic violence, rising rents - many paths lead to homelessness. Assuming any single cause is a mistake.' 
        },
        {
          title: 'Recovery includes psychological healing',
          explanation: 'Getting housed is just the first step. The trauma of instability, the difficulty trusting security, the lingering hypervigilance - these need processing too.'
        }
      ],
      whatHelps: [
        'Access every available resource: shelters, housing programs, social services',
        'Protect important documents - ID, Social Security card, any records',
        'Connect with case workers who can help navigate systems',
        'Maintain connections - isolation is dangerous physically and psychologically',
        'Once housed: expect adjustment period; instability leaves marks',
        'Seek trauma-informed support for the experience of homelessness itself',
        'Advocate: your lived experience is expertise that policymakers need',
      ],
      warningSign: 'Homelessness dramatically increases risk for assault, illness, and death. If you\'re currently unhoused, please prioritize physical safety and accessing any available shelter or services.',
      professionalNote: 'Many organizations provide services specifically for people experiencing homelessness. The National Alliance to End Homelessness and local 211 lines can connect you with resources.'
    },
    reflectionQuestions: [
      'If you\'ve experienced housing instability, what wounds from that experience haven\'t fully healed?',
      'What barriers in the system have you encountered, and how might they be challenged?',
      'What would true stability feel like in your body, and what makes that hard to trust?',
    ],
    relatedLessons: ['hm-trans-poverty', 'hm-mh-trauma-basics', 'hm-stress-overwhelm'],
  },
  {
    id: 'hm-trans-immigration',
    title: 'Immigration & Cultural Displacement',
    category: 'life-transitions',
    duration: 10,
    emoji: '🌍",
    content: {
      introduction: `Immigration is one of the most profound upheavals a person can experience. Whether you left by choice seeking opportunity, or by necessity fleeing danger, you've been uprooted from everything familiar - language, culture, relationships, landscapes, foods, the way things work. You're building a new life while grieving the old one, navigating a foreign system while processing loss.

The stress of immigration goes beyond practical challenges. There's the grief of leaving home, family, and everything you knew. The disorientation of existing in a culture you don't fully understand. The exhaustion of everything requiring extra effort - simple tasks become complicated when you don't know the language, the systems, the unwritten rules. And often, the experience of being treated as "other" in ways that range from subtle to dangerous.

For refugees and asylum seekers, trauma precedes and compounds the immigration stress. You may be processing violence, persecution, loss of family members, dangerous journeys - all while trying to establish yourself in a new country that may not welcome you. The cumulative burden is immense.

Cultural identity becomes complicated. You may feel caught between cultures - not fully belonging to your homeland anymore, but not fully belonging to the new country either. Your children may assimilate faster than you, creating family tension. The question "Where are you from?" has no simple answer when home is complicated.

Despite all this, immigrants demonstrate remarkable resilience. Building a life in a new country while carrying all this weight is an enormous achievement, even when it doesn't feel like one.`,
      keyInsights: [
        { 
          title: 'Immigration is multiple losses at once', 
          explanation: 'You\'ve lost home, culture, language community, extended family, professional status, the comfort of knowing how things work. Each loss deserves grief.' 
        },
        { 
          title: 'Everything is harder', 
          explanation: 'Tasks that were automatic become effortful. The cognitive and emotional load of operating in a foreign culture is exhausting, even when things are going well.' 
        },
        { 
          title: 'Identity becomes complicated', 
          explanation: 'You may feel between cultures - no longer fully belonging to your homeland, but not fully belonging here either. This in-between space is disorienting but can also be generative.' 
        },
        { 
          title: 'Generational tension is common', 
          explanation: 'Children often assimilate faster, creating family conflict. They may reject heritage culture; you may feel you\'re losing them to a foreign culture. This tension is painful for everyone.' 
        },
        {
          title: 'Resilience is the story, not just struggle',
          explanation: 'Immigration requires extraordinary courage and adaptability. The focus on challenges shouldn\'t overshadow the strength it takes to build a life in a new country.'
        }
      ],
      whatHelps: [
        'Grieve what you\'ve lost - homeland, relationships, your previous life',
        'Connect with cultural community - others who share your background and understand',
        'Maintain cultural practices that matter to you - food, language, traditions',
        'Learn about the new culture while protecting your own',
        'Access immigrant-specific resources - legal help, community organizations, ESL',
        'Be patient with yourself - adjustment takes years, not months',
        'Address trauma if applicable - immigration may have followed or included traumatic experiences',
      ],
      professionalNote: 'Culturally competent therapists who understand immigration stress - ideally from similar backgrounds or with specific training - can make a significant difference. Many communities have immigrant-serving organizations with mental health resources.'
    },
    reflectionQuestions: [
      'What have you lost in immigration that you haven\'t fully grieved?',
      'How do you experience the tension between cultures? Where does it cause the most pain?',
      'What aspects of your heritage are most important to maintain, and how can you protect them?',
    ],
    relatedLessons: ['hm-trans-grief-all-kinds', 'hm-trans-identity-shifts', 'hm-world-minority-stress'],
  },
  {
    id: 'hm-trans-military-veteran',
    title: 'Military/Veteran Transition',
    category: 'life-transitions',
    duration: 9,
    emoji: '🎖️",
    content: {
      introduction: `Military service creates a unique identity - one built on structure, mission, brotherhood and sisterhood, physical challenge, and a clear sense of purpose. Transitioning out of the military means losing all of that simultaneously. The question \"Who am I as a civilian?\" can feel impossible to answer after years of being defined by service.

The military provided total structure: when to wake, what to wear, where to be, what to do. It provided purpose: a mission larger than yourself. It provided belonging: the intense bonds formed under shared hardship. Civilian life offers none of this automatically. You're suddenly responsible for creating your own structure, finding your own purpose, and building connections without the accelerant of shared service.

For many veterans, the transition involves processing experiences that civilians can't understand. Combat, moral injury, loss of fellow service members, things witnessed or done - these experiences may have been compartmentalized during service and emerge during transition. The isolation of being unable to share these experiences with civilians who weren't there compounds the difficulty.

Mental health challenges are common: PTSD, depression, anxiety, substance use, and tragically, suicide. These aren't weaknesses - they're predictable responses to extraordinary experiences and a difficult transition. Seeking help is not failure; it's the same mission adaptation that got you through service.

The transition is not just leaving a job - it's leaving an identity, a community, and a way of being in the world. Treating it as a profound life transition, rather than just a career change, is essential.`,
      keyInsights: [
        { 
          title: "It\'s an identity crisis, not just job change', 
          explanation: 'Military service becomes who you are, not just what you do. Leaving it creates a vacuum of identity, purpose, and belonging that civilian employment doesn\'t automatically fill.' 
        },
        { 
          title: 'Structure must be rebuilt from scratch', 
          explanation: 'The military provided total structure. Civilian life requires creating your own - and the absence of external structure can be disorienting rather than freeing.' 
        },
        { 
          title: 'The bonds are irreplaceable', 
          explanation: 'Relationships forged under fire have an intensity that civilian friendships rarely match. Grieving that level of connection while building new relationships is part of the process.' 
        },
        { 
          title: 'Processing may be delayed', 
          explanation: 'Experiences compartmentalized during service often surface during transition. What you didn\'t have time to process while deployed may demand attention now.' 
        },
        {
          title: 'Seeking help is mission-appropriate',
          explanation: 'In service, you were trained to adapt, overcome, and use available resources. Mental health support is a resource. Using it is adaptation, not weakness.'
        }
      ],
      whatHelps: [
        'Connect with other veterans - they understand without explanation',
        'Create structure deliberately - your own schedule, routines, responsibilities',
        'Find new purpose - what mission can your skills serve now?',
        'Translate your skills - you have valuable capabilities, even if civilian employers don\'t immediately recognize them',
        'Access veteran-specific resources: VA, veteran service organizations, veteran employment programs',
        'Address mental health: PTSD treatment, grief for fallen friends, moral injury processing',
        'Be patient - transition takes years, not months',
      ],
      warningSign: 'Veteran suicide is a crisis. If you\'re struggling with suicidal thoughts, please reach out: Veterans Crisis Line: 988 (press 1) or text 838255. You served; now let others serve you.',
      professionalNote: 'Many VA and veteran-serving mental health providers specialize in transition challenges, PTSD, and military-specific experiences. Evidence-based treatments like CPT and PE for PTSD are effective.'
    },
    reflectionQuestions: [
      'What did military service provide that civilian life doesn\'t? How can you find those things in new ways?',
      'What experiences from service have you not fully processed?',
      'What would maintaining the best of your service identity look like in civilian life?',
    ],
    relatedLessons: ['hm-trans-identity-shifts', 'hm-mh-trauma-basics', 'hm-trans-retirement-identity'],
  },
  {
    id: 'hm-trans-incarceration',
    title: 'Incarceration Impact: On Individuals and Families',
    category: 'life-transitions',
    duration: 10,
    emoji: '🔒",
    content: {
      introduction: `Incarceration doesn't just affect the person behind bars - it ripples through families, communities, and generations. Whether you've been incarcerated yourself or you're dealing with the incarceration of a family member, the impacts are profound, lasting, and often invisible to those who haven't experienced them.

For those who've been incarcerated: The experience is traumatic. The loss of freedom, the violence and dehumanization of the prison environment, the separation from everyone you love. And then reentry compounds the trauma with impossible obstacles: employment discrimination, housing restrictions, probation requirements, lost relationships, and a society that treats "ex-con" as a permanent identity. The barriers to rebuilding a life are systemic and relentless.

For families: The incarceration of a parent, partner, child, or sibling creates cascading crises. Financial hardship from lost income and costs of maintaining contact. Children's trauma from parental separation and stigma. Relationship strain from enforced distance and the changes that occur on both sides. The grief of losing someone who's still alive but inaccessible. And the stigma - the way society treats families of incarcerated people as tainted by association.

Mass incarceration is a public health crisis, not just a criminal justice issue. The trauma, family disruption, community destruction, and intergenerational effects are massive. Understanding incarceration as a life circumstance that affects whole systems - not just individuals who \"deserve\" it - is essential for healing.`,
      keyInsights: [
        { 
          title: "Incarceration is trauma', 
          explanation: 'The prison environment itself is traumatizing: violence, dehumanization, powerlessness, separation from loved ones. PTSD and other trauma responses are common and expected.' 
        },
        { 
          title: 'Reentry barriers are systemic', 
          explanation: 'Employment discrimination, housing restrictions, loss of benefits, voting rights - the system creates obstacles to rebuilding life at every turn. This isn\'t paranoia; it\'s policy.' 
        },
        { 
          title: 'Families are co-victims', 
          explanation: 'Children, partners, and parents of incarcerated people suffer trauma, stigma, financial hardship, and grief - often with no recognition or support.' 
        },
        { 
          title: 'Stigma is lifelong', 
          explanation: 'Society treats a felony record as a permanent identity marker. The assumption that you\'re defined forever by your worst moment (or worst accusation) is dehumanizing and counterproductive.' 
        },
        {
          title: 'Intergenerational impact is documented',
          explanation: 'Children of incarcerated parents have higher rates of trauma, mental health challenges, poverty, and incarceration themselves. The cycle perpetuates unless actively interrupted.'
        }
      ],
      whatHelps: [
        'For those incarcerated or formerly incarcerated:',
        'Access reentry services: housing, employment, mental health, case management',
        'Connect with others who understand - reentry programs, support groups',
        'Address trauma from incarceration itself - it was traumatic, regardless of why you were there',
        'Know your rights regarding disclosure, expungement, restoration',
        'For families:',
        'Maintain connection during incarceration as much as possible',
        'Access family support services - they exist, though often under-publicized',
        'Explain to children in age-appropriate ways; secrets and shame worsen trauma',
        'Allow yourself to grieve - this is a loss, even if temporary',
        'Seek therapy for yourself and children to process the trauma',
      ],
      professionalNote: 'Trauma-informed care that understands incarceration is essential. Many reentry programs include mental health services. Organizations like the National Institute of Corrections and Vera Institute provide resources.'
    },
    reflectionQuestions: [
      'If you\'ve been incarcerated: What trauma from that experience still needs processing?',
      'If a family member has been incarcerated: How has that affected you, and where has that impact been invisible to others?',
      'What barriers to rebuilding are systemic vs. personal? How does distinguishing them help?',
    ],
    relatedLessons: ['hm-mh-trauma-basics', 'hm-trans-identity-shifts', 'hm-trans-poverty'],
  },
  {
    id: 'hm-trans-chronic-illness',
    title: 'Living with a Chronic Illness Diagnosis',
    category: 'life-transitions',
    duration: 9,
    emoji: '💊',
    content: {
      introduction: `A chronic illness diagnosis divides your life into before and after. Before, you could take your health for granted, make plans without considering your body's limitations, assume that wellness was your default state. After, everything requires recalibration. Your body is no longer a reliable partner but something that needs constant management, monitoring, and accommodation.

The grief is enormous and ongoing. You grieve the healthy self you were. You grieve the future you expected. You grieve spontaneity, energy, the ability to do what others do without thinking. And because you're still alive, people may not recognize this as grief. \"At least you're not dying." But living with chronic illness is its own kind of loss that deserves acknowledgment.

Chronic illness affects every domain of life: work (can you still do your job? will your employer accommodate?), relationships (will people stay? can you be the partner/parent/friend you want to be?), finances (medical costs, reduced work capacity), identity (who are you if not the active/healthy/productive person you were?), and daily existence (medication schedules, symptom management, good days and bad days).

The uncertainty is particularly hard. Will it progress? Are these symptoms normal or concerning? Can you commit to plans when you don't know how you'll feel? Living with uncertainty while also trying to build a meaningful life is an ongoing challenge that healthy people rarely appreciate.`,
      keyInsights: [
        { 
          title: "This is a major life transition', 
          explanation: 'Chronic illness diagnosis is not just a medical event - it\'s a before/after divide in your life that affects identity, relationships, work, and purpose.' 
        },
        { 
          title: 'Grief is ongoing, not one-time', 
          explanation: 'Each new limitation, each flare, each thing you can no longer do - these are new losses to grieve. The grief doesn\'t end; you learn to carry it.' 
        },
        { 
          title: 'Invisibility creates its own burden', 
          explanation: 'Many chronic illnesses are invisible. You don\'t look sick, so people don\'t understand why you can\'t do things. Managing others\' perceptions becomes another exhausting task.' 
        },
        { 
          title: 'Your relationship with your body changes', 
          explanation: 'Your body may feel like a betrayer, an unreliable machine, or a fragile vessel. Rebuilding relationship with your body - neither ignoring it nor resenting it - is part of adaptation.' 
        },
        {
          title: 'Medical trauma is common',
          explanation: 'The healthcare system can be retraumatizing: not being believed, harmful treatments, depersonalization. Many chronically ill people develop medical trauma on top of the illness itself.'
        }
      ],
      whatHelps: [
        'Grieve fully - this is a real loss and deserves real grief',
        'Find your people - online communities, support groups, others with your condition',
        'Pace yourself - learn your limits and respect them (even when you hate them)',
        'Advocate in healthcare - you\'re the expert on your body',
        'Communicate with loved ones about what you need and what\'s changed',
        'Adapt identity - find who you are now, not who you were',
        'Practice self-compassion - you\'re doing something hard',
        'Address mental health - chronic illness and depression/anxiety often co-occur',
      ],
      professionalNote: 'Many therapists specialize in chronic illness or health psychology. Support groups, both in-person and online, can provide validation and practical knowledge that professionals lack.'
    },
    reflectionQuestions: [
      'What have you lost to this illness that you haven\'t fully grieved?',
      'How has your relationship with your body changed since diagnosis?',
      'What would a meaningful life look like given your current reality - not the one you wish you had?',
    ],
    relatedLessons: ['hm-trans-grief-all-kinds', 'hm-trans-chronic-pain', 'hm-trans-disability'],
  },
];

// ============================================================================
// CATEGORY 8: GROWTH & HEALING
// ============================================================================

const growthHealingLessons: HumanManualLesson[] = [
  {
    id: 'hm-growth-self-compassion',
    title: 'Self-Compassion: Not Self-Indulgence',
    category: 'growth-healing',
    duration: 7,
    emoji: '💚',
    content: {
      introduction: `Self-compassion is treating yourself with the same kindness you'd offer a good friend who was struggling. It's not self-pity, self-indulgence, or letting yourself off the hook. Research by Dr. Kristin Neff shows it's actually associated with greater motivation, resilience, and wellbeing than self-criticism.

Most of us are far harsher with ourselves than we'd ever be with someone we care about. We say things to ourselves we'd never say to a friend. We hold ourselves to standards we'd recognize as unreasonable for anyone else. This isn't motivating - it's demoralizing.

Self-compassion has three components: self-kindness (being gentle rather than harsh with yourself), common humanity (recognizing that suffering and imperfection are part of the shared human experience), and mindfulness (being aware of pain without over-identifying with it).

The critic in your head probably believes it's helping. It's not. Research consistently shows that self-compassion leads to better outcomes than self-criticism: more motivation, less anxiety, greater resilience, and improved mental health.`,
      keyInsights: [
        { 
          title: "It\'s not soft or weak', 
          explanation: 'Self-compassion is associated with greater resilience, not less. People who practice it bounce back from failure faster and are more willing to try again.' 
        },
        { 
          title: 'The inner critic isn\'t helping', 
          explanation: 'You may believe harsh self-talk motivates you. Research says otherwise: self-criticism is associated with depression, anxiety, and less motivation.' 
        },
        { 
          title: 'Common humanity matters', 
          explanation: 'Suffering feels isolating. Recognizing that imperfection and struggle are universal - not unique to you - reduces shame and loneliness.' 
        },
        { 
          title: 'You can\'t hate yourself into change', 
          explanation: 'Self-criticism doesn\'t produce lasting change. Self-compassion creates the safety needed to honestly assess yourself and grow.' 
        },
      ],
      whatHelps: [
        'Notice your self-talk - would you say this to a friend?',
        'Practice self-compassion phrases: "This is hard. Everyone struggles. May I be kind to myself."',
        'When you fail: acknowledge the pain, remind yourself it\'s human, offer yourself kindness',
        'Write a compassionate letter to yourself',
        'Research: Kristin Neff\'s self-compassion exercises at self-compassion.org',
      ],
    },
    reflectionQuestions: [
      'How do you talk to yourself when you make a mistake? How would you talk to a friend?',
      'What would change if you treated yourself with compassion instead of criticism?',
      'What would you say to yourself right now if you were your own best friend?',
    ],
    relatedLessons: ['hm-mh-depression-truth', 'hm-work-imposter'],
    triggerGauges: ['emotion', 'alignment'],
    triggerThreshold: 40,
    triggerMode: 'any',
  },
  {
    id: 'hm-growth-reparenting',
    title: 'Reparenting: Giving Yourself What You Didn\'t Get',
    category: 'growth-healing',
    duration: 8,
    emoji: '🌱",
    content: {
      introduction: `Reparenting is the practice of consciously providing for yourself the emotional needs that weren't met in childhood. If you didn't receive consistent love, validation, boundaries, or safety from your caregivers, you can learn to give these things to yourself as an adult.

This isn't about blaming your parents or dwelling in victimhood. It's about recognizing that some needs went unmet - for whatever reason - and taking responsibility for meeting them now. You can't change the past, but you can change what happens from here.

Reparenting involves developing an "inner nurturing parent" - a part of you that can offer comfort, set healthy boundaries, provide encouragement, and offer the unconditional regard you may have missed. This takes practice because you're building neural pathways that weren't developed in childhood.

It can feel strange or even silly at first. But over time, reparenting work can fundamentally change your relationship with yourself - from one of neglect or criticism to one of care and support.`,
      keyInsights: [
        { 
          title: "You can meet your own needs now', 
          explanation: 'What you didn\'t receive as a child can be provided by yourself as an adult. The need doesn\'t have to stay unmet forever.' 
        },
        { 
          title: 'It requires conscious effort', 
          explanation: 'The patterns of self-neglect or self-criticism are automatic. Reparenting is deliberate - choosing to respond to yourself differently than you were taught.' 
        },
        { 
          title: 'Small, consistent acts matter', 
          explanation: 'Reparenting happens in moments: speaking kindly to yourself, setting a boundary, meeting a need, comforting yourself when hurting.' 
        },
        { 
          title: 'It changes the relationship with yourself', 
          explanation: 'Over time, you develop an internal source of support that doesn\'t depend on others. You become your own safe base.' 
        },
      ],
      whatHelps: [
        'Identify what you needed and didn\'t get (validation, comfort, boundaries, encouragement)',
        'Practice providing those things to yourself now',
        'Use self-talk that a nurturing parent would use',
        'Meet your physical needs: rest, food, comfort, safety',
        'Set boundaries that protect you, as a good parent would',
        'Celebrate your accomplishments, as a good parent would',
      ],
    },
    reflectionQuestions: [
      'What did you need as a child that you didn\'t receive?',
      'How might you provide that to yourself now?',
      'What would a nurturing parent say to you right now?',
    ],
    relatedLessons: ['hm-rel-family-wounds', 'hm-growth-inner-child', 'hm-growth-self-compassion'],
  },
  {
    id: 'hm-growth-inner-child',
    title: 'Inner Child Work: Healing the Past in the Present',
    category: 'growth-healing',
    duration: 7,
    emoji: '👶",
    content: {
      introduction: `The \"inner child\" is a concept in psychology representing the part of your psyche that retains the feelings, memories, and experiences from childhood. When childhood needs went unmet or childhood wounds went unhealed, this part can continue to influence your adult life in ways you might not recognize.

Inner child work involves connecting with this younger part of yourself, understanding its needs and fears, and providing the care and healing that wasn't available then. It's not about being childish - it's about integrating a part of yourself that's been carrying unprocessed pain.

Signs of an unhealed inner child include: overreacting to situations that remind you of childhood, patterns of self-sabotage, difficulty with intimacy, shame about having needs, perfectionism, people-pleasing, and feeling fundamentally flawed. These are often the inner child's strategies for coping with what was too much to handle at the time.

Healing the inner child doesn't mean the past didn't happen or that those responsible are absolved. It means you're no longer leaving a wounded part of yourself alone in the past. You're bringing them forward into safety.`,
      keyInsights: [
        { 
          title: 'The child is still there', 
          explanation: 'The experiences and feelings from childhood don\'t disappear - they live in your nervous system and psyche, influencing your present.' 
        },
        { 
          title: 'Adult patterns often have child origins', 
          explanation: 'Many of your reactions, fears, and protective behaviors started as adaptations to childhood circumstances that no longer apply.' 
        },
        { 
          title: 'Connection and compassion heal', 
          explanation: 'Simply acknowledging and offering compassion to your inner child can begin to heal wounds that have persisted for decades.' 
        },
        { 
          title: 'You\'re not leaving them behind', 
          explanation: 'Healing isn\'t about growing out of your inner child. It\'s about bringing that part of you along, cared for and integrated.' 
        },
      ],
      whatHelps: [
        'Visualize your younger self and offer comfort',
        'Look at childhood photos and connect with what that child was experiencing',
        'Write a letter to your inner child, or let your inner child write to you',
        'Notice when you\'re reacting from a childlike place - that\'s the inner child',
        'Ask yourself: "What does the little me need right now?"',
        'Inner child meditation and guided visualizations',
      ],
      professionalNote: 'If connecting with your inner child brings up overwhelming emotions or traumatic memories, please work with a therapist trained in this approach.'
    },
    reflectionQuestions: [
      'What did your younger self most need to hear that they didn\'t?',
      'When do you notice yourself reacting in ways that feel childlike?',
      'What would you want to say to yourself at age 5? At age 10?',
    ],
    relatedLessons: ['hm-growth-reparenting', 'hm-rel-family-wounds', 'hm-mh-trauma-basics'],
  },
];

// ============================================================================
// CATEGORY 9: IDENTITY & SELF
// ============================================================================

const identitySelfLessons: HumanManualLesson[] = [
  {
    id: 'hm-id-sexuality-spectrum',
    title: 'The Sexuality Spectrum: Understanding Your Orientation',
    category: 'identity-self',
    duration: 8,
    emoji: '🌈",
    content: {
      introduction: `Sexual orientation isn't a simple binary - it exists on a spectrum that researchers have been mapping since Alfred Kinsey's groundbreaking work in the 1940s. The Kinsey Scale, later expanded by others, suggests orientation ranges from exclusively heterosexual to exclusively homosexual, with most people falling somewhere in between. And that's just the start of the complexity.

Beyond gay, straight, and bisexual, terms like pansexual (attraction regardless of gender), asexual (little or no sexual attraction), demisexual (attraction only after emotional connection), and queer (an umbrella term reclaimed by many) help capture the full range of human experience. Your orientation might also shift over time - sexual fluidity is a documented phenomenon, particularly among women.

Understanding your orientation is about self-knowledge, not about fitting into boxes. Labels can be helpful for finding community and communicating about yourself, but they're tools, not constraints. If no label fits perfectly, that's okay. If your orientation feels complicated or changes over time, that's okay too.

The key insight from modern sexuality research: there's no \"normal\" to deviate from. Human sexuality has always been diverse. What's new is having language for that diversity and the social freedom to explore it.`,
      keyInsights: [
        { 
          title: 'Orientation is a spectrum, not a binary', 
          explanation: 'Research consistently shows sexuality exists on a continuum. Very few people are exclusively attracted to one gender with zero exceptions.' 
        },
        { 
          title: 'Labels are tools, not prisons', 
          explanation: 'Terms like gay, bi, pan, ace, and queer help communicate and find community. But if no label fits, you don\'t need one. You don\'t owe anyone a category.' 
        },
        { 
          title: 'Fluidity is real', 
          explanation: 'Sexual orientation can shift over a lifetime. This doesn\'t mean you were "wrong before" - it means humans are dynamic, not static.' 
        },
        { 
          title: 'Attraction has multiple dimensions', 
          explanation: 'Sexual attraction (who you want sexually), romantic attraction (who you want relationships with), and aesthetic attraction (who you find beautiful) don\'t always align.' 
        },
      ],
      whatHelps: [
        'Explore without pressure to conclude - self-understanding takes time',
        'Read about different orientations from people who live them',
        'Find community - LGBTQ+ spaces, online forums, support groups',
        'Remember that questioning is normal at any age',
        'Separate what you actually feel from what you think you "should" feel',
      ],
      professionalNote: 'If exploring your sexuality brings up distress, confusion, or conflict with your background, an LGBTQ-affirming therapist can provide support without pushing you toward any particular conclusion.'
    },
    reflectionQuestions: [
      'What do you actually notice about your patterns of attraction, separate from what you were taught to feel?',
      'Have your attractions shifted over time? What did that feel like?',
      'Do labels feel helpful or constraining to you? Why?',
    ],
    relatedLessons: ['hm-id-questioning-identity', 'hm-rel-gender-identity', 'hm-id-internalized-shame'],
  },
  {
    id: 'hm-id-questioning-identity',
    title: 'Questioning Your Identity: It\'s Okay Not to Know',
    category: 'identity-self',
    duration: 7,
    emoji: '❓",
    content: {
      introduction: `We live in a culture that demands certainty. \"What are you?\" \"Who are you?\" \"What do you want?\" We're expected to know ourselves fully and declare it confidently. But the truth is: not knowing is a valid place to be. Questioning your identity - whether it's sexuality, gender, career, beliefs, or fundamental sense of self - isn't a failure of self-awareness. It's often a sign of growth.

Erik Erikson, the developmental psychologist who gave us the concept of \"identity crisis,\" saw questioning as essential to identity formation. You can't develop a solid sense of self without first exploring, experimenting, and questioning what you've been given. The crisis IS the process, not a problem to be solved as quickly as possible.

Pressure to know yourself can paradoxically make self-knowledge harder. When questioning feels unsafe, when others need you to have an answer, when you need certainty to feel okay - you might grab a label prematurely or deny what you're actually experiencing. True self-knowledge requires the safety to not know.

Sitting with uncertainty is uncomfortable. Our brains crave resolution. But some of the most important questions about who you are don't have quick answers. The ability to tolerate "I don't know yet" is a skill worth developing.`,
      keyInsights: [
        { 
          title: 'Questioning is the process', 
          explanation: 'Erikson showed that identity develops through crisis and questioning, not despite it. Not knowing is part of how you come to know.' 
        },
        { 
          title: 'Premature closure is a risk', 
          explanation: 'Grabbing an identity too quickly because uncertainty is uncomfortable can lead to inauthentic choices. Better to stay in the question than commit to the wrong answer.' 
        },
        { 
          title: 'You don\'t owe anyone certainty', 
          explanation: 'Others might pressure you to define yourself. But your identity development happens on your timeline, not theirs.' 
        },
        { 
          title: 'Not knowing is a valid identity', 
          explanation: ''I\'m still figuring it out" is a complete sentence. Questioning IS an identity stage, and it can last as long as it needs to.' 
        },
      ],
      whatHelps: [
        'Give yourself permission to not know yet',
        'Explore without committing - try on identities and see how they feel',
        'Reduce exposure to people who pressure you for answers',
        'Journal about what you notice, without needing conclusions',
        'Find communities where questioning is normalized',
        'Remember: identity is process, not destination',
      ],
    },
    reflectionQuestions: [
      'What aspects of your identity are you currently questioning?',
      'Who in your life can hold space for your uncertainty?',
      'What would change if you gave yourself full permission to not know?',
    ],
    relatedLessons: ['hm-id-sexuality-spectrum', 'hm-trans-identity-shifts', 'hm-id-finding-values'],
  },
  {
    id: 'hm-id-internalized-shame',
    title: 'Internalized Shame: When You Hate Parts of Yourself',
    category: 'identity-self',
    duration: 9,
    emoji: '😞",
    content: {
      introduction: `Internalized shame happens when you absorb negative messages about some aspect of your identity and turn them against yourself. You don't just feel ashamed when others judge you - you become your own harshest critic, policing and punishing parts of yourself that were never wrong in the first place.

This is particularly insidious for marginalized identities. Internalized homophobia, internalized racism, internalized ableism, internalized misogyny - these aren't personal failures. They're the predictable result of growing up in a society that devalues your identity. The shame isn't yours; it was given to you. But it now operates from inside, which makes it harder to recognize and resist.

The cruelty of internalized shame is that it disguises itself as your own voice. It doesn't feel like prejudice - it feels like truth, like reality, like "I just know this about myself." Recognizing that these beliefs came from outside, that they were absorbed rather than discovered, is the beginning of untangling them.

Healing internalized shame requires both external work (finding community, changing inputs, experiencing acceptance) and internal work (compassion, challenging beliefs, grieving what the shame cost you). Neither alone is sufficient.`,
      keyInsights: [
        { 
          title: 'The shame was given to you', 
          explanation: 'You weren\'t born hating parts of yourself. That hatred was taught, absorbed, internalized. It feels like yours, but it originated outside.' 
        },
        { 
          title: 'It disguises itself as truth', 
          explanation: 'Internalized shame doesn\'t announce itself. It masquerades as realistic self-assessment: "I\'m just being honest about my flaws."' 
        },
        { 
          title: 'It operates automatically', 
          explanation: 'You don\'t consciously choose to shame yourself. The beliefs run in the background, filtering your self-perception and limiting your life.' 
        },
        { 
          title: 'External and internal work are both needed', 
          explanation: 'Changing your environment and inputs helps. But you also need to actively challenge the beliefs that now live inside you.' 
        },
      ],
      whatHelps: [
        'Identify the source: where did you learn to feel this way about this part of yourself?',
        'Find community with others who share your identity and don\'t share the shame',
        'Challenge the beliefs: are they actually true, or just familiar?',
        'Limit exposure to media and people who reinforce the shame',
        'Practice self-compassion specifically toward the shamed parts',
        'Grieve what the shame cost you',
      ],
      professionalNote: 'Working through internalized shame is often best done with a therapist who affirms your identity and understands the dynamics of internalized oppression.'
    },
    reflectionQuestions: [
      'What parts of yourself do you feel ashamed of? Where did that shame come from?',
      'What would your life look like if that shame didn\'t exist?',
      'Can you identify the moment or messages that planted the shame?',
    ],
    relatedLessons: ['hm-world-minority-stress', 'hm-growth-self-compassion', 'hm-id-sexuality-spectrum'],
  },
  {
    id: 'hm-id-people-pleasing',
    title: 'People-Pleasing: The Fawn Response',
    category: 'identity-self',
    duration: 8,
    emoji: '🙏",
    content: {
      introduction: `You've heard of fight, flight, and freeze. But there's a fourth trauma response: fawn. Fawning means appeasing, pleasing, and merging with others" needs to stay safe. People-pleasing isn't just being nice - when it's compulsive and self-abandoning, it's a survival strategy that developed when pleasing others was literally necessary to survive.

For many people, particularly those raised in chaotic, abusive, or emotionally unpredictable homes, fawning was adaptive. If you could read the room, anticipate needs, and make yourself useful or agreeable, you might avoid harm. The problem is that the strategy continues long after the original danger has passed.

Adult people-pleasers often struggle with knowing their own needs (they've been focused outward for so long), saying no (it feels dangerous), tolerating others" disappointment (it triggers survival panic), and feeling worthy without being useful (their value was conditional).

Breaking the people-pleasing pattern requires understanding that it was survival, not weakness. It requires grieving the self that had to be abandoned to stay safe. And it requires slowly, carefully learning that you can have needs, have opinions, and disappoint people without catastrophe.`,
      keyInsights: [
        { 
          title: 'It\'s a trauma response', 
          explanation: 'Chronic people-pleasing is often the fawn response - a survival adaptation from environments where pleasing others was necessary for safety.' 
        },
        { 
          title: 'The self gets lost', 
          explanation: 'When you\'ve spent years focused on what others need, you may not know what you need. The self that wasn\'t safe to have becomes hard to access.' 
        },
        { 
          title: 'No feels dangerous', 
          explanation: 'For people-pleasers, saying no or disappointing others can trigger genuine nervous system alarm - because at one point, it was dangerous.' 
        },
        { 
          title: 'Worth becomes conditional', 
          explanation: 'If you were only valued when useful, you may believe your worth depends on what you provide. This is a belief, not a truth, and it can change.' 
        },
      ],
      whatHelps: [
        'Recognize people-pleasing as survival, not personality',
        'Practice small nos in low-stakes situations',
        'Learn to sit with others\' disappointment without fixing it',
        'Ask yourself: "What do I want?" (this may take time to access)',
        'Notice when you\'re abandoning yourself to please someone else',
        'Therapy for underlying attachment and trauma patterns',
      ],
    },
    reflectionQuestions: [
      'When did you learn that pleasing others was essential?',
      'What do you actually want, separate from what others want from you?',
      'What happens in your body when you imagine saying no?',
    ],
    relatedLessons: ['hm-rel-boundaries-protect', 'hm-stress-freeze-response', 'hm-id-self-worth'],
  },
  {
    id: 'hm-id-perfectionism',
    title: 'Perfectionism: The Impossible Standard',
    category: 'identity-self',
    duration: 8,
    emoji: '✨",
    content: {
      introduction: `Perfectionism isn't about having high standards. It's about believing your worth depends on being perfect. It's the difference between \"I want to do well\" and \"If I don't do perfectly, I'm worthless." One is healthy striving. The other is a psychological trap.

Research by Dr. Brené Brown and others shows perfectionism is actually correlated with worse outcomes: more anxiety, more depression, more procrastination (it's often safer not to try than to try and fail), and paradoxically, lower performance over time (burnout is inevitable when the standard is inhuman).

Perfectionism often develops in childhoods where love or acceptance felt conditional on achievement. If you were praised for accomplishments but not for being, you learned that worth is earned through performance. If mistakes were punished or shamed, you learned that imperfection is dangerous.

Unlearning perfectionism means accepting that you are inherently worthy, regardless of what you produce. It means allowing yourself to be seen in your imperfection. It means learning that "good enough" is actually good enough. This is terrifying if perfection felt like the only thing keeping you safe.`,
      keyInsights: [
        { 
          title: 'Perfectionism is about worth, not standards', 
          explanation: 'The core belief is: "If I\'m perfect, I can avoid criticism, rejection, and shame. If I\'m not perfect, I\'m worthless."' 
        },
        { 
          title: 'It backfires', 
          explanation: 'Perfectionism leads to procrastination, burnout, anxiety, and often worse performance. It\'s not the path to excellence - it\'s the path to exhaustion.' 
        },
        { 
          title: 'It often has childhood roots', 
          explanation: 'Conditional love, punished mistakes, praise only for achievement - these teach that worth must be earned through perfection.' 
        },
        { 
          title: ''Good enough" is actually better', 
          explanation: 'Done is better than perfect. Trying and failing is better than not trying. Being seen imperfect is better than hiding forever.' 
        },
      ],
      whatHelps: [
        'Notice the perfectionist voice and name it as a learned pattern, not truth',
        'Practice deliberately doing things imperfectly (exposure therapy for perfectionism)',
        'Separate worth from performance: you are not what you produce',
        'Explore the roots: where did you learn perfection was required?',
        'Set "good enough" standards before starting tasks',
        'Share imperfect work - let others see you trying, not just succeeding',
      ],
    },
    reflectionQuestions: [
      'What happens to your sense of self-worth when you fail or make mistakes?',
      'Where did you learn that perfection was necessary?',
      'What would you attempt if you knew you were allowed to fail?',
    ],
    relatedLessons: ['hm-work-imposter', 'hm-growth-self-compassion', 'hm-id-self-worth'],
  },
  {
    id: 'hm-id-rejection-sensitivity',
    title: 'Rejection Sensitive Dysphoria: When Rejection Devastates',
    category: 'identity-self',
    duration: 8,
    emoji: '💥",
    content: {
      introduction: `Rejection Sensitive Dysphoria (RSD) is the extreme emotional pain triggered by the perception of being rejected, criticized, or failing to meet expectations. It's not just feeling bad about rejection - it's an intense, often unbearable flood of emotion that can feel like physical pain.

RSD was initially identified in research on ADHD, where it affects up to 99% of adults with the condition. But the experience isn't limited to ADHD - it can occur with depression, anxiety, autism, and trauma histories. The common thread is a nervous system that processes perceived rejection as an emergency.

The key word is \"perceived.\" RSD can be triggered by actual rejection or by the anticipation of rejection or by interpreting neutral events as rejection. The emotional response is the same regardless of whether the rejection was real or imagined. This makes it particularly difficult, because you can't always trust your perception of whether you're being rejected.

Living with RSD often means managing a hair-trigger emotional response. People may avoid risk (fear of rejection), people-please (prevent rejection), or rage (defensive response to rejection pain). Understanding RSD can help you respond to these intense emotions with more skill and less shame.`,
      keyInsights: [
        { 
          title: 'It\'s not oversensitivity - it\'s different neurology', 
          explanation: 'RSD isn\'t being dramatic or "too sensitive." It\'s a neurobiological response where the brain processes rejection as a threat emergency.' 
        },
        { 
          title: 'Perception triggers it, not just reality', 
          explanation: 'You can experience RSD from imagined rejection or neutral events interpreted as rejection. The emotion doesn\'t distinguish between real and perceived.' 
        },
        { 
          title: 'It\'s strongly linked to ADHD', 
          explanation: 'Up to 99% of adults with ADHD experience RSD. If you have ADHD and intense rejection pain, you\'re not alone.' 
        },
        { 
          title: 'It shapes behavior', 
          explanation: 'People with RSD often avoid situations with rejection risk, people-please to prevent rejection, or react intensely when triggered. These are coping mechanisms, not character flaws.' 
        },
      ],
      whatHelps: [
        'Name it: "This is RSD, not evidence that I\'m actually being rejected"',
        'Pause before reacting - the first interpretation may not be accurate',
        'Ride the wave: intense emotions peak and pass; it won\'t last forever',
        'For ADHD-related RSD: some medications help (discuss with your doctor)',
        'Build a toolkit for intense emotions: grounding, movement, connection',
        'Let trusted people know about RSD so they can provide reality checks',
      ],
      professionalNote: 'If you have ADHD and experience RSD, certain ADHD medications (particularly alpha-agonists like guanfacine) can help reduce RSD intensity. Discuss this with your prescriber.'
    },
    reflectionQuestions: [
      'Do you experience rejection as emotionally devastating rather than just disappointing?',
      'How does fear of rejection shape your choices and behavior?',
      'What would help in the moment when the RSD wave hits?',
    ],
    relatedLessons: ['hm-id-adhd-identity', 'hm-id-people-pleasing', 'hm-stress-nervous-system'],
  },
  {
    id: 'hm-id-adhd-identity',
    title: 'ADHD & Identity: More Than Just Attention',
    category: 'identity-self',
    duration: 9,
    emoji: '🧠",
    content: {
      introduction: `ADHD (Attention-Deficit/Hyperactivity Disorder) isn't just about attention problems - it's a different way of having a brain that affects every aspect of life. Executive function challenges, emotional regulation difficulties, time blindness, rejection sensitivity, interest-based motivation, and a nervous system that works differently are all part of the picture.

Many people with ADHD grow up being told they're lazy, unmotivated, not trying hard enough, or not living up to their potential. They internalize these messages, developing deep shame about their brains. Late diagnosis (especially common in women, who were underdiagnosed for decades) often brings both relief (\"there's a reason!\") and grief (\"I could have known sooner\").

ADHD isn't a character flaw or a lack of willpower. Neuroimaging studies show structural and functional brain differences. The prefrontal cortex, which handles executive functions, develops differently. Dopamine regulation works differently. It's not that you're not trying - it's that your brain is running different software.

Understanding ADHD as part of your identity means neither using it as an excuse nor pretending it doesn't exist. It means learning how your brain works, building systems that work with it rather than against it, and releasing the shame of being different from neurotypical expectations.`,
      keyInsights: [
        { 
          title: 'It\'s a brain difference, not a character flaw', 
          explanation: 'Neuroimaging shows ADHD brains are structurally and functionally different. You\'re not failing at having a normal brain - you have a different brain.' 
        },
        { 
          title: 'Interest-based, not importance-based motivation', 
          explanation: 'ADHD brains don\'t reliably activate for "important" things - they activate for interesting, urgent, novel, or challenging things. This isn\'t laziness; it\'s different neurology.' 
        },
        { 
          title: 'Late diagnosis is common and disorienting', 
          explanation: 'Many people, especially women, aren\'t diagnosed until adulthood. This brings relief and grief - finally understanding, while mourning the struggles that might have been avoided.' 
        },
        { 
          title: 'Shame is learned, not inherent', 
          explanation: 'The shame ADHD people carry was taught by a world that judged them against neurotypical standards. That shame is not accurate information about your worth.' 
        },
      ],
      whatHelps: [
        'Learn how ADHD specifically shows up in YOUR brain',
        'Build systems and structures that work with your brain, not against it',
        'Release shame - different doesn\'t mean defective',
        'Connect with ADHD community - you\'re not alone',
        'Consider medication - it can be life-changing for many',
        'Grieve the years of struggle before understanding',
        'Challenge internalized ableism about what "normal" looks like',
      ],
      professionalNote: 'If you suspect ADHD, seek evaluation from a specialist. Treatment (medication, coaching, therapy, accommodations) can significantly improve quality of life.'
    },
    reflectionQuestions: [
      'How has ADHD (diagnosed or suspected) shaped your sense of self?',
      'What shame about your brain differences do you carry?',
      'What would self-acceptance look like for how your brain works?',
    ],
    relatedLessons: ['hm-id-rejection-sensitivity', 'hm-id-autism-masking', 'hm-id-internalized-shame'],
  },
  {
    id: 'hm-id-autism-masking',
    title: 'Autism & Masking: The Exhaustion of Fitting In',
    category: 'identity-self',
    duration: 9,
    emoji: '🎭",
    content: {
      introduction: `Masking is the process by which autistic people consciously or unconsciously hide their autistic traits to appear more neurotypical. It involves suppressing stims, forcing eye contact, scripting social interactions, mimicking facial expressions, and generally performing a version of \"normal\" that doesn't come naturally.

Many autistic people, especially those diagnosed late in life or those who \"pass\" as neurotypical, have been masking for so long they don't know who they are underneath. The mask becomes automatic, and removing it feels terrifying. But masking has costs: exhaustion, burnout, anxiety, depression, and a fundamental disconnection from authentic self.

Autism wasn't recognized in many people - particularly women, BIPOC individuals, and those without intellectual disabilities - until recently. Many were missed because their masking was successful. They struggled without knowing why, often developing anxiety, depression, or burnout that was really autistic burnout misunderstood.

Understanding autism as part of identity means recognizing that autistic ways of being aren't wrong or disordered - they're different. Unmasking, where it's safe to do so, means allowing yourself to be authentically autistic: to stim, to rest when needed, to communicate naturally, to stop performing neurotypicality.`,
      keyInsights: [
        { 
          title: 'Masking is exhausting', 
          explanation: 'Constantly monitoring and suppressing natural behavior to appear "normal" drains enormous cognitive and emotional energy. Autistic burnout is often masking-related.' 
        },
        { 
          title: 'Many don\'t know they\'re autistic', 
          explanation: 'Late diagnosis is common, especially for women, BIPOC individuals, and anyone who masked successfully. Struggling without knowing why is its own trauma.' 
        },
        { 
          title: 'The mask can become invisible', 
          explanation: 'After years of masking, you may not know what\'s mask and what\'s you. Discovering your authentic self underneath can take time and feel disorienting.' 
        },
        { 
          title: 'Autistic traits aren\'t deficits', 
          explanation: 'Deep focus, pattern recognition, honesty, attention to detail, passionate interests - autism comes with strengths, not just challenges.' 
        },
      ],
      whatHelps: [
        'Learn about autism from autistic people (not just clinical sources)',
        'Identify where and when unmasking is safe',
        'Allow yourself to stim, rest, and communicate naturally when possible',
        'Connect with autistic community - being around people who "get it" is restorative',
        'Grieve the years of exhaustion and misunderstanding',
        'Challenge internalized ableism about what "normal" should look like',
      ],
      professionalNote: 'If you suspect autism, seek evaluation from a specialist who understands how autism presents in adults, especially in women and marginalized groups. Many clinicians still miss autism in people who mask well.'
    },
    reflectionQuestions: [
      'Where do you find yourself performing "normal" in ways that exhaust you?',
      'What would you do differently if you didn\'t have to mask?',
      'What support would help you be more authentically yourself?',
    ],
    relatedLessons: ['hm-id-adhd-identity', 'hm-stress-burnout', 'hm-id-highly-sensitive'],
  },
  {
    id: 'hm-id-highly-sensitive',
    title: 'Highly Sensitive Person (HSP): Not a Flaw, a Trait',
    category: 'identity-self',
    duration: 7,
    emoji: '🌸",
    content: {
      introduction: `High sensitivity is a trait found in about 15-20% of the population - and it's found across species, not just humans. Dr. Elaine Aron, who pioneered research on Highly Sensitive People (HSPs), calls it Sensory Processing Sensitivity: the brain processes stimuli more deeply and notices more subtlety than less sensitive brains.

HSPs notice things others miss: subtle changes in people's moods, details in environments, the emotional undercurrents of situations. This depth of processing makes them insightful, empathetic, and often creative. But it also means overwhelm comes faster - more input means more to process.

The problem isn't the sensitivity itself - it's that we live in a culture that doesn't honor it. "Don't be so sensitive\" is an insult. Toughness is rewarded; sensitivity is pathologized. HSPs often internalize shame about their trait, trying to be less sensitive rather than learning to work with their nature.

Understanding HSP as a neutral trait - with both advantages and challenges - can shift shame into self-acceptance. You're not weak or broken. Your nervous system is wired for deep processing. That's a feature, not a bug, even when it's hard to manage in an overstimulating world.`,
      keyInsights: [
        { 
          title: 'It\'s biological, not weakness', 
          explanation: 'High sensitivity has a genetic component and shows differences in brain processing. You didn\'t fail to toughen up - you\'re built differently.' 
        },
        { 
          title: 'It comes with strengths', 
          explanation: 'Deep processing means noticing subtleties, understanding nuance, and often high creativity and empathy. It\'s not all downside.' 
        },
        { 
          title: 'Overstimulation is real', 
          explanation: 'When you process more deeply, your threshold for overwhelm is lower. This isn\'t weakness - it\'s the cost of depth.' 
        },
        { 
          title: 'The culture doesn\'t support it', 
          explanation: 'Loud, fast, constantly stimulating environments are hard for HSPs. The world wasn\'t designed for your nervous system. That\'s the world\'s limitation, not yours.' 
        },
      ],
      whatHelps: [
        'Reframe sensitivity as a neutral trait with pros and cons',
        "Build in recovery time - you need more downtime than others',
        "Create low-stimulation environments where possible',
        'Protect yourself from overstimulating inputs (news, crowds, etc.)',
        'Read Elaine Aron\'s work for research-based understanding',
        'Connect with other HSPs - being understood helps',
      ],
    },
    reflectionQuestions: [
      'How has being told you\'re "too sensitive" affected how you see yourself?',
      'What advantages does your sensitivity give you?',
      'What would it mean to honor your sensitivity instead of fighting it?',
    ],
    relatedLessons: ['hm-id-introversion', 'hm-stress-overwhelm', 'hm-id-internalized-shame'],
  },
  {
    id: 'hm-id-introversion',
    title: 'Introversion in an Extrovert World',
    category: 'identity-self',
    duration: 6,
    emoji: '🏠",
    content: {
      introduction: `Introversion isn't shyness, social anxiety, or not liking people. It's about where you get your energy. Introverts recharge through solitude; extroverts recharge through social interaction. Both need connection, and both need alone time - but the balance is different.

The Western world, and American culture in particular, strongly favors extroversion. Open offices, brainstorming sessions, team-building exercises, "networking" as a career requirement - these are all designed for extroverted energy styles. Introverts in this world are constantly being asked to function in ways that drain rather than energize them.

Susan Cain's book \"Quiet\" brought attention to the extrovert bias and the hidden strengths of introverts: deep thinking, careful listening, ability to focus, and often more meaningful (if fewer) relationships. The problem isn't introversion - it's a culture that pathologizes it.

Living as an introvert in an extrovert world requires both self-acceptance (this is who you are, and it's valid) and practical management (building in recovery time, setting boundaries, finding work environments that don't constantly drain you).`,
      keyInsights: [
        { 
          title: "Energy, not social skill', 
          explanation: 'Introversion is about what drains and restores you, not whether you\'re good at social interaction. Many introverts are excellent socializers - they just need recovery afterward.' 
        },
        { 
          title: 'The cultural bias is real', 
          explanation: 'Western culture treats extroversion as the healthy default. Introverts are constantly asked to adapt. This isn\'t neutral - it\'s preference disguised as norm.' 
        },
        { 
          title: 'Introverts have strengths', 
          explanation: 'Deep thinking, focused attention, meaningful relationships, careful listening - introversion comes with significant advantages that extrovert culture doesn\'t always recognize.' 
        },
        { 
          title: 'Forced extroversion is exhausting', 
          explanation: 'Constant social demand without recovery time leads to burnout. Introverts need to protect their energy, not just push through.' 
        },
      ],
      whatHelps: [
        'Accept introversion as legitimate, not a deficit to overcome',
        'Build in recovery time around social events',
        'Communicate your needs: "I need to leave early" is valid',
        'Find work environments that don\'t constantly drain you',
        'Protect solitude - it\'s not antisocial, it\'s restorative',
        'Read "Quiet" by Susan Cain for cultural context and validation',
      ],
    },
    reflectionQuestions: [
      'How has extrovert culture affected your sense of yourself?',
      'Do you get enough restorative solitude?',
      'What would honoring your introversion actually look like?',
    ],
    relatedLessons: ['hm-id-highly-sensitive', 'hm-stress-burnout', 'hm-rel-adult-friendships'],
  },
  {
    id: 'hm-id-body-image',
    title: 'Body Image & Dysmorphia: The Distorted Mirror',
    category: 'identity-self',
    duration: 9,
    emoji: '🪞",
    content: {
      introduction: `Body image is how you perceive, think about, and feel about your body. For many people, especially in cultures saturated with unrealistic images, body image is complicated at best and distorted at worst. Body dysmorphia takes this further: you become obsessed with perceived flaws that others can't see or see as minor.

We live in an environment of constant body evaluation. Social media, advertising, and cultural norms send relentless messages about what bodies should look like - messages that are impossible for almost everyone to match. The thin ideal, the fitness ideal, the youth ideal, the whatever-is-trending ideal: these are manufactured standards, not natural ones.

The distortion can become severe enough to be classified as Body Dysmorphic Disorder (BDD), where preoccupation with perceived defects causes significant distress and functional impairment. But even \"subclinical\" body image struggles affect quality of life, self-esteem, and relationship with your physical self.

Healing body image isn't about loving how you look - it can be about neutrality, about appreciating function over form, about disconnecting worth from appearance. The goal is a relationship with your body that doesn't cause constant suffering.`,
      keyInsights: [
        { 
          title: 'The standards are manufactured', 
          explanation: 'The body ideals we compare ourselves to are created by industries that profit from our dissatisfaction. They\'re not natural or healthy standards.' 
        },
        { 
          title: 'What you see may not be reality', 
          explanation: 'Body dysmorphia means your perception of your body is distorted. What you see in the mirror isn\'t what others see - and isn\'t objective.' 
        },
        { 
          title: 'Neutrality is a valid goal', 
          explanation: 'You don\'t have to love your body. Peaceful coexistence - body neutrality - is often more achievable and still liberating.' 
        },
        { 
          title: 'Function matters more than form', 
          explanation: 'What your body does is more important than how it looks. Shifting focus from appearance to ability can reduce suffering.' 
        },
      ],
      whatHelps: [
        'Reduce exposure to appearance-focused media',
        'Unfollow accounts that trigger comparison',
        'Focus on what your body does, not how it looks',
        'Challenge distorted thoughts about your body',
        'Practice body neutrality if body positivity feels impossible',
        'For BDD: seek specialized treatment (CBT and exposure are effective)',
      ],
      warningSign: 'If body image concerns are causing significant distress, interfering with daily life, or leading to harmful behaviors, please seek professional help.',
      professionalNote: 'Body Dysmorphic Disorder is a serious condition that responds well to specific treatment (CBT with exposure and response prevention). If you\'re struggling significantly, please see a specialist.'
    },
    reflectionQuestions: [
      'How much mental energy do you spend thinking about your appearance?',
      'Where did your beliefs about how bodies should look come from?',
      'What would change if you focused on function instead of form?',
    ],
    relatedLessons: ['hm-id-eating-patterns', 'hm-id-comparison-social-media', 'hm-id-internalized-shame'],
  },
  {
    id: 'hm-id-eating-patterns',
    title: 'Eating Patterns & Control: When Food Becomes Complicated',
    category: 'identity-self',
    duration: 9,
    emoji: '🍽️",
    content: {
      introduction: `For many people, food isn't just fuel - it's a battleground. Disordered eating exists on a spectrum from restrictive dieting to binge eating to full eating disorders. The common thread is that food becomes about control, emotion, punishment, comfort, or identity rather than simple nourishment.

Diet culture has normalized disordered eating patterns to such a degree that restriction, food guilt, and "clean eating" obsessions often go unquestioned. But chronic dieting is associated with worse long-term weight outcomes, eating disorders, depression, and a damaged relationship with food that can last a lifetime.

Food restriction or binging often serves emotional functions: control when life feels chaotic, comfort when feelings are overwhelming, punishment when you feel unworthy, numbness when emotions are too much. The behavior makes sense as a coping mechanism - but the coping mechanism has costs.

Healing your relationship with food is possible, but it's often not simple. It may require addressing underlying emotional needs, challenging diet culture beliefs, learning to tolerate emotions without using food, and sometimes treating a full eating disorder with specialized help.`,
      keyInsights: [
        { 
          title: 'Diet culture is disordered eating normalized', 
          explanation: 'Much of what\'s considered "normal" dieting behavior is actually disordered. Chronic restriction, food guilt, and obsessive "healthy eating" are not healthy.' 
        },
        { 
          title: 'Food behaviors serve emotional functions', 
          explanation: 'Restriction can be about control. Binging can be about comfort or numbing. Understanding the function helps address the root cause.' 
        },
        { 
          title: 'Dieting doesn\'t work long-term', 
          explanation: 'The research is clear: diets fail 95% of the time long-term and often lead to weight cycling, which is worse for health than stable higher weight.' 
        },
        { 
          title: 'Recovery is possible', 
          explanation: 'Even severe eating disorders can be recovered from. A peaceful relationship with food is achievable, though it may require significant work.' 
        },
      ],
      whatHelps: [
        'Challenge diet culture beliefs about food morality',
        'Explore intuitive eating principles',
        'Identify the emotional functions of disordered eating',
        'Address underlying emotional needs directly',
        'For eating disorders: seek specialized treatment (they\'re serious and need expert help)',
        'Be patient - healing food relationships takes time',
      ],
      warningSign: 'Eating disorders are serious, sometimes life-threatening conditions. If you\'re significantly restricting, binging and purging, or if food dominates your thoughts, please seek specialized help.',
      professionalNote: 'Eating disorders require specialized treatment. General therapists often aren\'t trained for this work. Look for eating disorder specialists or treatment programs.'
    },
    reflectionQuestions: [
      'What role does food play in your emotional life beyond nourishment?',
      'How has diet culture shaped your relationship with food and your body?',
      'What would a peaceful relationship with food actually look like?',
    ],
    relatedLessons: ['hm-id-body-image', 'hm-id-perfectionism', 'hm-mh-anxiety-types'],
  },
  {
    id: 'hm-id-self-worth',
    title: 'Self-Worth vs Self-Esteem: Building a Stable Core',
    category: 'identity-self',
    duration: 8,
    emoji: '💎",
    content: {
      introduction: `Self-esteem and self-worth are often used interchangeably, but they're different. Self-esteem is how you evaluate yourself - it rises when you succeed and falls when you fail. Self-worth is the underlying belief that you have value simply because you exist, independent of what you achieve or how you perform.

Self-esteem alone is unstable because it depends on constantly proving yourself. High self-esteem can tip into narcissism if it's contingent on superiority. Low self-esteem drives endless striving that never satisfies. The goal isn't higher self-esteem - it's stable self-worth: the belief that you're valuable regardless of performance.

This is hard in a culture that constantly reinforces conditional worth. We're told we're valuable when productive, successful, attractive, or useful. The message that you're inherently worthy - just for existing - is rarely emphasized. Most people have to unlearn conditional worth that was absorbed early.

Building self-worth is different from building self-esteem. It's not about collecting achievements or thinking positively about yourself. It's about fundamentally believing that your value doesn't fluctuate with your performance. This is a deep shift that takes time.`,
      keyInsights: [
        { 
          title: 'Esteem fluctuates; worth shouldn\'t', 
          explanation: 'Self-esteem rises and falls with success and failure. Self-worth is the stable core that holds regardless of outcomes.' 
        },
        { 
          title: 'Conditional worth is learned', 
          explanation: 'You weren\'t born believing your worth depended on achievement. That belief was taught. It can be unlearned.' 
        },
        { 
          title: 'Performance-based worth is exhausting', 
          explanation: 'If you have to keep proving yourself to feel worthy, you\'re on a treadmill that never stops. No achievement is ever enough.' 
        },
        { 
          title: 'Inherent worth is radical', 
          explanation: 'In capitalist culture, believing you\'re valuable just for existing is almost countercultural. It\'s also essential for stable wellbeing.' 
        },
      ],
      whatHelps: [
        'Notice when your sense of worth rises or falls with performance',
        'Practice the belief: "I am valuable regardless of what I produce"',
        'Challenge the cultural messages that tie worth to achievement',
        'Separate "I did a bad thing" from "I am bad"',
        'Remember: you would tell a child they have inherent worth. You deserve the same.',
        'Therapy to address core beliefs about worth',
      ],
    },
    reflectionQuestions: [
      'Does your sense of worth depend on how you\'re performing?',
      'Where did you learn that worth was conditional?',
      'What would change if you truly believed you were worthy just for existing?',
    ],
    relatedLessons: ['hm-id-perfectionism', 'hm-growth-self-compassion', 'hm-id-people-pleasing'],
  },
  {
    id: 'hm-id-comparison-social-media',
    title: 'Comparison & Social Media: The Thief of Joy',
    category: 'identity-self',
    duration: 7,
    emoji: '📱",
    content: {
      introduction: `\"Comparison is the thief of joy,\" wrote Theodore Roosevelt, long before Instagram existed. Social media has supercharged comparison, giving us unlimited highlight reels to measure our behind-the-scenes against. The result is an epidemic of inadequacy that research links to depression, anxiety, and decreased life satisfaction.

The comparison trap is particularly insidious because you're comparing your full reality to others" curated presentations. You see their achievements, not their struggles. Their best photos, not their average days. Their success, not their failures. The comparison is fundamentally unfair, but your brain doesn't factor that in.

Social media isn't neutral - it's designed to maximize engagement, which often means maximizing comparison, outrage, and inadequacy. The algorithms show you what keeps you scrolling, and inadequacy keeps people scrolling. You're not weak for being affected; you're responding as designed.

Breaking free from comparison doesn't necessarily mean quitting social media, though that's one option. It means becoming aware of the comparison trap, curating your inputs more carefully, and developing an internal sense of value that doesn't depend on measuring yourself against others.`,
      keyInsights: [
        { 
          title: "Highlights vs. reality', 
          explanation: 'You\'re comparing your full life to others\' curated presentations. The comparison is unfair by design.' 
        },
        { 
          title: 'It\'s designed to make you feel inadequate', 
          explanation: 'Social media algorithms optimize for engagement. Inadequacy drives engagement. You\'re being manipulated on purpose.' 
        },
        { 
          title: 'Comparison erodes wellbeing', 
          explanation: 'Research shows strong links between social media comparison and depression, anxiety, and life dissatisfaction. The effect is real.' 
        },
        { 
          title: 'Internal reference points are healthier', 
          explanation: 'Comparing yourself to others is unstable. Comparing yourself to your own past or your own values provides more stable footing.' 
        },
      ],
      whatHelps: [
        'Audit who you follow - unfollow accounts that trigger comparison',
        'Set time limits on social media use',
        'Notice when you\'re comparing and name it: "comparison happening"',
        'Remember: you\'re seeing their highlight reel, not their reality',
        'Develop internal metrics: Are you growing? Living your values?',
        'Take breaks from social media and notice how you feel',
      ],
    },
    reflectionQuestions: [
      'How does social media affect your mood and sense of self?',
      'Who do you compare yourself to, and what\'s the effect?',
      'What would change if you measured yourself against your own values instead of others\' presentations?',
    ],
    relatedLessons: ['hm-id-body-image', 'hm-id-self-worth', 'hm-world-news-triggers'],
  },
  {
    id: 'hm-id-finding-values',
    title: 'Finding Your Values: What Actually Matters to You',
    category: 'identity-self',
    duration: 8,
    emoji: '🧭",
    content: {
      introduction: `Values are what you want your life to be about - not goals to achieve but directions to travel. They're different from what you were taught to want, what society says is important, or what you think you \"should\" value. Discovering your actual values, distinct from inherited or imposed ones, is essential identity work.

Many people have never explicitly identified their values. They live according to defaults: what their family valued, what culture rewards, what seems expected. This can work for a while, but eventually, living out of alignment with your actual values creates a sense of emptiness, inauthenticity, or \"something's wrong but I don't know what.\"

Values work involves getting clear on what genuinely matters to you - not in theory but in practice. Do you value security or adventure? Connection or autonomy? Achievement or peace? There are no right answers, but there are honest and dishonest ones. Living according to someone else's values (even unconsciously) creates suffering.

Clarifying values doesn't mean you'll always live them perfectly. It means you have a compass. When you're facing decisions, struggling with direction, or feeling lost, values provide orientation. \"Is this aligned with what I care about?\" becomes a usable question.`,
      keyInsights: [
        { 
          title: "Values are directions, not destinations', 
          explanation: 'You don\'t achieve values - you live them. They\'re not items to check off but directions to travel in consistently.' 
        },
        { 
          title: 'Inherited values may not be yours', 
          explanation: 'What your family, culture, or religion values isn\'t automatically what you value. Separating inherited from authentic values takes work.' 
        },
        { 
          title: 'Misalignment creates suffering', 
          explanation: 'Living according to values that aren\'t actually yours - even if they\'re "good" values - creates a sense of emptiness and inauthenticity.' 
        },
        { 
          title: 'Values provide a compass', 
          explanation: 'When you\'re clear on what matters, decision-making becomes clearer. "Is this aligned with my values?" is a powerful question.' 
        },
      ],
      whatHelps: [
        'Values clarification exercises (lists, card sorts, questionnaires)',
        'Ask: "What do I want my life to stand for?"',
        'Notice when you feel most alive and aligned - what values are present?',
        'Separate "should" values from actual values',
        'Accept that values may conflict - that\'s part of being human',
        'Use values as a decision-making compass',
      ],
    },
    reflectionQuestions: [
      'What do you want your life to stand for? (Not achieve - stand for.)',
      'Which of your values were inherited vs. chosen?',
      'Where is your life currently misaligned with what you actually care about?',
    ],
    relatedLessons: ['hm-work-meaning', 'hm-trans-identity-shifts', 'hm-id-questioning-identity'],
    triggerGauges: ['direction', 'alignment'],
    triggerThreshold: 35,
    triggerMode: 'any',
  },
];

// ============================================================================
// BUILDING STABILITY
// ============================================================================

const buildingStabilityLessons: HumanManualLesson[] = [
  {
    id: 'hm-stability-financial-foundations',
    title: 'Financial Foundations and Your Nervous System',
    category: 'building-stability',
    duration: 6,
    emoji: '💰",
    content: {
      introduction: `Money stress isn't just about the numbers. Financial insecurity activates the same threat systems in your brain as physical danger. When you don't know if you can pay rent or feed your family, your body stays in a state of vigilance. That makes it harder to think clearly, sleep, or regulate emotions.

Financial foundations aren't about being rich. They're about reducing the constant background alarm: a small buffer, knowing where your money goes, having a plan for the next emergency. Even small steps — one month of rent in savings, tracking spending for a week — can lower the volume on that alarm.

You're not bad with money because you're stressed. You're stressed partly because money has been unstable. Building stability is a form of self-care.`,
      keyInsights: [
        { title: "Money stress is real stress', explanation: 'The brain treats financial threat like physical threat. Chronic money worry keeps the nervous system on high alert.' },
        { title: 'Stability is psychological', explanation: 'Knowing you have a plan — even if the plan is small — can reduce anxiety more than the dollar amount alone.' },
        { title: 'Small steps count', explanation: 'One emergency fund dollar, one tracked week, one bill on autopay. Foundations are built in small, repeatable actions.' },
      ],
      whatHelps: [
        'Name the fear: "What exactly am I afraid will happen?"',
        'One buffer goal: e.g. one month of essentials in savings',
        'Track spending for one week without judgment',
        'Separate "not enough" from "I don\'t know where it goes"',
      ],
    },
    reflectionQuestions: [
      'What does "financial safety" mean to you in one sentence?',
      'What\'s one small step you could take this week to reduce money anxiety?',
    ],
    relatedLessons: ['hm-work-meaning', 'hm-stability-growth-tension'],
    triggerGauges: ['state', 'body'],
    triggerThreshold: 40,
    triggerMode: 'any',
  },
  {
    id: 'hm-stability-environment',
    title: 'Your Environment Shapes Your State',
    category: 'building-stability',
    duration: 5,
    emoji: '🏠",
    content: {
      introduction: `Your physical environment isn't background. It's input. Clutter, noise, light, and the people in your space all send signals to your nervous system. A chaotic room can make it harder to think. A dark, isolated space can deepen low mood. A place that feels "yours" — even one corner — can become an anchor.

You don't need a perfect space. You need awareness. What in your environment drains you? What helps you feel a little more grounded? Small changes often matter more than big ones: one clear surface, one ritual (light a candle, open the curtain), one boundary with a roommate or family member.`,
      keyInsights: [
        { title: 'Environment is input', explanation: 'Your brain is always processing your surroundings. Chaos and clutter add load; order and calm can reduce it.' },
        { title: 'One anchor is enough', explanation: 'You don\'t need to fix the whole space. One corner, one ritual, one boundary can shift how you feel.' },
        { title: 'People are part of environment', explanation: 'Who you live with and how you share space affects your sense of safety and rest.' },
      ],
      whatHelps: [
        'Identify one thing that drains you and one that helps',
        'Create one "anchor" — a spot or ritual that feels like yours',
        'Negotiate one boundary (noise, privacy, shared chores)',
      ],
    },
    reflectionQuestions: [
      'What in your environment makes you feel worse? Better?',
      'What\'s one change you could make this week without spending money?',
    ],
    relatedLessons: ['hm-stability-safety', 'hm-stress-burnout'],
    triggerGauges: ['state', 'body'],
    triggerThreshold: 45,
    triggerMode: 'any',
  },
  {
    id: 'hm-stability-safety',
    title: 'What Safety Actually Means',
    category: 'building-stability',
    duration: 6,
    emoji: '🛡️",
    content: {
      introduction: `Safety isn't just physical. Emotional safety is the sense that you can be yourself without being punished, abandoned, or shamed. Many people live in environments where they're physically okay but emotionally on edge — walking on eggshells, hiding feelings, or never quite trusting that they're accepted.

You can't always change the people around you. But you can get clear on what safety would look like for you, and you can start to create pockets of it: one relationship where you don't edit yourself, one place or practice where you feel allowed to rest, one boundary that says "this is not okay." Building safety is often slow. It's still worth naming what you need.`,
      keyInsights: [
        { title: 'Emotional safety is real', explanation: 'Your nervous system needs to know it\'s safe to be seen. Without that, you stay in guard mode.' },
        { title: 'Safety can be partial', explanation: 'You might have safety in one relationship or one context. That still counts and can be expanded.' },
        { title: 'Boundaries create safety', explanation: 'Knowing you can say no or leave a situation is part of feeling safe.' },
      ],
      whatHelps: [
        'Name what "safe" would feel like in one sentence',
        'Identify one relationship or context where you feel most yourself',
        'Practice one boundary — small, clear, repeatable',
      ],
      professionalNote: 'If you are in physical danger or abuse, please reach out to a trusted person or resource. You deserve safety.',
    },
    reflectionQuestions: [
      'Where do you feel safest? Where do you feel you have to hide?',
      'What would need to change for you to feel a little more emotionally safe?',
    ],
    relatedLessons: ['hm-rel-boundaries', 'hm-stability-environment'],
    triggerGauges: ['connection', 'state'],
    triggerThreshold: 40,
    triggerMode: 'any',
  },
  {
    id: 'hm-stability-growth-tension',
    title: 'The Stability–Growth Tension',
    category: 'building-stability',
    duration: 5,
    emoji: '⚖️",
    content: {
      introduction: `Life asks for two things that sometimes conflict: stability (enough safety, routine, and predictability to function) and growth (change, risk, and newness). Too much stability and you stagnate. Too much growth without a base and you burn out or spiral.

There's no universal right balance. But you can notice where you are. Are you so focused on surviving that you've stopped asking what you want? Or are you chasing change without a foundation? Often the answer is: build a little more stability first, then take one small growth step. Or: you've been stable for a while — what's one small risk you're ready for?`,
      keyInsights: [
        { title: 'Both matter', explanation: 'Stability gives you a base. Growth gives you a life. Neither alone is enough.' },
        { title: 'Order often helps', explanation: 'When in doubt, stability first. It\'s hard to grow when you\'re in survival mode.' },
        { title: 'Small steps in both directions', explanation: 'One habit for stability, one experiment for growth. You don\'t have to choose forever.' },
      ],
      whatHelps: [
        'Ask: "Am I in survival mode or do I have room to grow?"',
        'One stability move: one habit, one buffer, one boundary',
        'One growth move: one small risk, one new practice, one honest conversation',
      ],
    },
    reflectionQuestions: [
      'Right now, do you need more stability or more growth?',
      'What\'s one small step in that direction you could take?',
    ],
    relatedLessons: ['hm-stability-financial-foundations', 'hm-growth-reparenting'],
    triggerGauges: ['direction', 'state'],
    triggerThreshold: 45,
    triggerMode: 'any',
  },
  {
    id: 'hm-stability-daily-foundations',
    title: 'Daily Foundations: Sleep, Food, Movement',
    category: 'building-stability',
    duration: 5,
    emoji: '🌅",
    content: {
      introduction: `Stability isn't only big picture. It's also what you do today. Sleep, food, and movement are the tripod. When one is off, the others wobble. When all three are roughly okay, everything else — mood, focus, relationships — has a better chance.

You don't need perfect. You need \"good enough.\" One decent meal. One movement that isn't punishment. One night of slightly better sleep. Tracking or rituals (same wake time, one walk, one meal you look forward to) can turn chaos into a baseline. Start with one leg of the tripod and add from there.`,
      keyInsights: [
        { title: "Sleep, food, movement are foundational', explanation: 'They directly affect your nervous system and mood. Fixing "everything" often starts here.' },
        { title: 'Good enough beats perfect', explanation: 'One solid meal, one short walk, one slightly earlier bedtime. Consistency over intensity.' },
        { title: 'Ritual creates predictability', explanation: 'Same wake time, one daily walk, one meal you plan — these signal "I am taking care of myself."' },
      ],
      whatHelps: [
        'Pick one: sleep, food, or movement. What\'s one small improvement?',
        'One ritual: e.g. same wake time, or one 10-minute walk',
        'Use check-in or Body gauge to notice how each affects you',
      ],
    },
    reflectionQuestions: [
      'Which of the three — sleep, food, movement — is most off right now?',
      'What\'s one "good enough" change you could make this week?',
    ],
    relatedLessons: ['hm-stress-burnout', 'hm-stability-financial-foundations'],
    triggerGauges: ['body', 'state'],
    triggerThreshold: 45,
    triggerMode: 'any',
  },
];

// ============================================================================
// EXPORT CATEGORIES
// ============================================================================

export const humanManualCategories: HumanManualCategory[] = [
  {
    id: 'relationships',
    title: 'Relationships & People',
    emoji: '💕',
    description: 'Family wounds, boundaries, adult friendships, and the complicated terrain of human connection.',
    lessons: relationshipsLessons,
  },
  {
    id: 'mental-health',
    title: 'Mental Health Real Talk',
    emoji: '🧠',
    description: 'Depression, anxiety, trauma, and medication - what they actually are and how to navigate them.',
    lessons: mentalHealthLessons,
  },
  {
    id: 'stress-survival',
    title: 'Stress & Survival',
    emoji: '⚡',
    description: 'Burnout, overwhelm, nervous system regulation, and what happens when everything is too much.',
    lessons: stressSurvivalLessons,
  },
  {
    id: 'work-money',
    title: 'Work & Money',
    emoji: '💼',
    description: 'Job identity, financial trauma, imposter syndrome, and finding meaning in what you do.',
    lessons: workMoneyLessons,
  },
  {
    id: 'world-society',
    title: 'World & Society',
    emoji: '🌍',
    description: 'Collective trauma, generational wounds, minority stress, and living in an overwhelming world.',
    lessons: worldSocietyLessons,
  },
  {
    id: 'body-health',
    title: 'Body & Health',
    emoji: '🏥',
    description: 'Chronic illness, sleep, movement, substances, and the body-mind connection.',
    lessons: bodyHealthLessons,
  },
  {
    id: 'life-transitions',
    title: 'Life Transitions',
    emoji: '🦋',
    description: 'Grief, identity shifts, starting over, and navigating the major changes life brings.',
    lessons: lifeTransitionsLessons,
  },
  {
    id: 'growth-healing',
    title: 'Growth & Healing',
    emoji: '🌱',
    description: 'Self-compassion, reparenting, inner child work, and building a better relationship with yourself.',
    lessons: growthHealingLessons,
  },
  {
    id: 'identity-self',
    title: 'Identity & Self',
    emoji: '🪞',
    description: 'Sexuality, neurodivergence, body image, values, and understanding who you actually are.',
    lessons: identitySelfLessons,
  },
  {
    id: 'building-stability',
    title: 'Building Stability',
    emoji: '🏗️',
    description: 'Financial foundations, environment, safety, and the balance between stability and growth.',
    lessons: buildingStabilityLessons,
  },
  {
    id: 'family-fleet',
    title: 'Family Fleet Rituals',
    emoji: '🛫',
    description: 'Pre-Flight (morning gauge sync + fleet forecast + driving style) and Post-Flight (odometer, pothole report, mechanic’s thanks). Co-regulation before the day starts and narrative repair at day’s end.',
    lessons: familyRitualsLessons,
  },
];

// Flatten all lessons for easy lookup
export const allHumanManualLessons: HumanManualLesson[] = humanManualCategories.flatMap(cat => cat.lessons);

// Get a single lesson by ID
export function getHumanManualLesson(id: string): HumanManualLesson | undefined {
  return allHumanManualLessons.find(lesson => lesson.id === id);
}

// Get lessons by category
export function getLessonsByCategory(categoryId: string): HumanManualLesson[] {
  const category = humanManualCategories.find(cat => cat.id === categoryId);
  return category ? category.lessons : [];
}
