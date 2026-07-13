/**
 * Origins Content — "Understanding Your Origins" Human Manual Series
 * 12 lessons for young adults processing family-of-origin wounds
 * 
 * Target: 18-25 year olds dealing with parent issues, attachment wounds
 * Tone: Warm but direct, validating but not coddling, educational but human
 */

export interface OriginsLesson {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  duration: string;
  category: 'basics' | 'father' | 'mother' | 'healing';
  content: {
    opening: string;
    sections: {
      title: string;
      body: string;
    }[];
    theScience: string;
    reflection: string[];
    closing: string;
  };
  relatedTools?: string[];
}

export const ORIGINS_LESSONS: OriginsLesson[] = [
  // ═══════════════════════════════════════════════════════════════
  // PART 1: THE BASICS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'origins-01-not-broken',
    title: "You're Not Broken, You're Adapted",
    subtitle: 'Your survival strategies made sense once',
    emoji: '🔧',
    duration: '5 min',
    category: 'basics',
    content: {
      opening: `Here's something nobody told you: Every "issue" you have is actually a survival strategy that worked at some point.

The anxiety? It kept you alert when your environment was unpredictable.
The people-pleasing? It kept you safe when someone's mood determined your wellbeing.
The emotional walls? They protected you when vulnerability got you hurt.

You're not broken. You're running software that was perfectly designed for a different environment.`,

      sections: [
        {
          title: 'Adaptation, Not Dysfunction',
          body: `Your nervous system is incredibly smart. As a child, it learned exactly what it needed to do to survive your specific environment.

If your home was chaotic, you learned to be hypervigilant.
If emotions were punished, you learned to suppress them.
If love was conditional, you learned to perform for approval.
If needs were ignored, you learned not to have them.

These weren't choices. They were automatic adaptations. Your brain did what it had to do.`
        },
        {
          title: 'The Problem Isn\'t You',
          body: `The problem is that you're still running childhood software in an adult world.

The hypervigilance that kept you safe at home? Now it's called "anxiety."
The emotional suppression that protected you? Now you "can't access your feelings."
The performance for approval? Now you're "exhausted and never feel enough."

You're not broken. You're just using strategies that no longer fit your environment.`
        },
        {
          title: 'Updating Your Operating System',
          body: `Here's the good news: What was learned can be updated.

Not erased—your nervous system will always remember. But you can add new responses. You can expand your options. You can learn that what was necessary then isn't necessary now.

This isn't about "fixing" yourself. It's about giving yourself more choices.`
        }
      ],

      theScience: `Neuroplasticity research (Doidge, 2007) shows that the brain can form new neural pathways throughout life. Your early adaptations created strong pathways, but new experiences and practices can create alternative routes. You're not stuck with your programming—you can update it.`,

      reflection: [
        'What "issue" do you have that might have been a survival strategy?',
        'What was it protecting you from?',
        'What would it mean if you weren\'t broken—just adapted?'
      ],

      closing: `You survived your childhood. That took something. The same adaptability that got you through can now help you update your patterns. You're not starting from scratch—you're building on a foundation of resilience you didn't even know you had.`
    },
    relatedTools: ['replay', 'journal']
  },

  {
    id: 'origins-02-parents-were-children',
    title: 'Your Parents Were Once Children Too',
    subtitle: 'Understanding isn\'t excusing',
    emoji: '👶',
    duration: '6 min',
    category: 'basics',
    content: {
      opening: `This might be hard to hear, but it's important: Your parents were once small, helpless children with their own parents, their own wounds, their own unmet needs.

This isn't about excusing anything. It's about understanding the chain you're part of—so you can break it.`,

      sections: [
        {
          title: 'Hurt People Hurt People',
          body: `Your mom's criticism? She probably heard worse from her mother.
Your dad's emotional absence? He likely never learned that men could have feelings.
Their inability to meet your needs? They were probably trying to meet needs that were never met in them.

This doesn't make it okay. It doesn't mean you have to forgive them. It just means the wound didn't start with you—and it doesn't have to end with you passing it on.`
        },
        {
          title: 'They Gave What They Had',
          body: `Most parents don't wake up and choose to damage their children. They give what they have. If what they have is unprocessed trauma, anxiety, depression, addiction—that's what spills onto their kids.

Your parents likely did their best with what they had. The problem is that their "best" was shaped by their own wounds.

Two things can be true:
1. They did their best.
2. Their best wasn't good enough for what you needed.

Both are true. Neither cancels the other.`
        },
        {
          title: 'Understanding vs. Excusing',
          body: `Understanding why your father was distant doesn't mean his distance didn't hurt you.
Understanding your mother's anxiety doesn't mean her anxiety didn't become your problem.

Understanding is about YOU. It's about making sense of your story. It's about seeing that you were a child caught in patterns that existed long before you.

You can understand completely and still be angry. Still grieve. Still choose distance.`
        }
      ],

      theScience: `Attachment patterns are transmitted across generations (Bowlby, 1988). Parents with insecure attachment often raise children with insecure attachment—not because they want to, but because they're unconsciously recreating the only relational template they know. Awareness breaks the cycle.`,

      reflection: [
        'What do you know about your parents\' childhoods?',
        'What patterns might they have inherited?',
        'Can you hold understanding AND your own hurt at the same time?'
      ],

      closing: `You're not here to excuse your parents. You're here to understand yourself. Seeing them as wounded people—not just as "your parents"—helps you make sense of your story. And making sense of your story is the first step to writing a different ending.`
    },
    relatedTools: ['relate', 'journal']
  },

  {
    id: 'origins-03-attachment-101',
    title: 'Attachment 101',
    subtitle: 'Why you love the way you do',
    emoji: '🔗',
    duration: '7 min',
    category: 'basics',
    content: {
      opening: `The way you act in relationships—the anxiety when they don't text back, the urge to run when things get real, the confusion about what you even want—it's not random. It was programmed in your first few years of life.

Welcome to Attachment Theory. This explains so much.`,

      sections: [
        {
          title: 'The Four Styles',
          body: `**Secure (≈50% of people)**
You learned: "When I need something, someone responds."
Now: You can be close AND independent. You trust that people will show up.

**Anxious/Preoccupied (≈20%)**
You learned: "Sometimes they respond, sometimes they don't. I better make sure they love me."
Now: You crave closeness, fear abandonment, need lots of reassurance.

**Avoidant/Dismissive (≈25%)**
You learned: "When I need something, I get rejected or ignored. Better not need anything."
Now: You value independence, feel suffocated by closeness, shut down when things get emotional.

**Disorganized/Fearful (≈5%)**
You learned: "The person I need is also the person I fear."
Now: You want closeness but push it away. Relationships feel chaotic and confusing.`
        },
        {
          title: 'How It Formed',
          body: `Your attachment style formed before you could talk. It was based on:
- How consistently your needs were met
- How your caregivers responded to your distress
- Whether closeness felt safe or dangerous

This wasn't your choice. A baby can't "choose" to be secure. You got what you got.

And here's the thing: Your attachment style made sense. If closeness was inconsistent, of COURSE you became anxious about it. If needs were ignored, of COURSE you learned to suppress them. Your nervous system was paying attention.`
        },
        {
          title: 'The Good News',
          body: `Attachment styles aren't fixed. Research shows they can change through:
- Awareness (you're doing this now)
- Corrective relationships (friends, partners, therapists who respond differently)
- Intentional practice (gradually expanding your comfort zone)

You're not doomed to repeat your patterns. But you have to know what they are first.`
        }
      ],

      theScience: `John Bowlby and Mary Ainsworth developed Attachment Theory through decades of research. The "Strange Situation" experiment showed that infant attachment patterns predict adult relationship styles. But longitudinal studies also show these patterns can change—especially with awareness and secure relationships.`,

      reflection: [
        'Which attachment style resonates most with you?',
        'Can you see how it formed based on your early experiences?',
        'How does it show up in your relationships now?'
      ],

      closing: `Knowing your attachment style isn't a label—it's a map. It shows you where you are and hints at where the work is. You didn't choose your style, but you can choose what you do with it now.`
    },
    relatedTools: ['relate', 'role-play']
  },

  // ═══════════════════════════════════════════════════════════════
  // PART 2: DADDY ISSUES (REAL TALK)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'origins-04-dad-not-there',
    title: 'When Dad Wasn\'t There',
    subtitle: 'Physically or emotionally absent',
    emoji: '👤',
    duration: '6 min',
    category: 'father',
    content: {
      opening: `Maybe he left. Maybe he was there but not really there—physically present but emotionally absent. Maybe he worked all the time. Maybe he just... didn't know how to connect.

Whatever the reason, you grew up with a father-shaped hole. And that hole affected everything.`,

      sections: [
        {
          title: 'The Two Kinds of Absence',
          body: `**Physical absence:** He left, died, was incarcerated, or was simply never around. You knew he wasn't there.

**Emotional absence:** He was in the house but not in the relationship. Behind a newspaper, a screen, a beer, a closed door. He was there, but you couldn't reach him.

Both hurt. Sometimes emotional absence hurts more—because you can see what you're missing but can't access it.`
        },
        {
          title: 'What You Learned',
          body: `When a father is absent, children learn things. Not consciously—but deep in the nervous system:

"I'm not worth staying for."
"Men leave."
"I have to be enough on my own."
"Love is temporary."
"Needing someone is dangerous."

These aren't rational thoughts. They're body-level beliefs that shape how you move through the world.`
        },
        {
          title: 'How It Shows Up Now',
          body: `**In relationships:**
- Choosing unavailable partners (familiar = comfortable)
- Testing people to see if they'll leave
- Leaving first so you can't be left
- Craving male approval but not trusting it when you get it

**In yourself:**
- Overachieving to prove you're worth staying for
- Feeling like something's missing but not knowing what
- Difficulty with male authority figures
- Either avoiding vulnerability completely or oversharing too fast`
        }
      ],

      theScience: `Research on father absence (McLanahan, 2004) shows impacts on children's emotional regulation, academic achievement, and relationship patterns. But the effects aren't destiny—they're starting points that can be understood and worked with.`,

      reflection: [
        'What kind of absence did you experience?',
        'What did you learn about yourself from that absence?',
        'How do you see it showing up in your life now?'
      ],

      closing: `His absence wasn't about you. You were a child—you couldn't make a grown man stay or be present. But you're an adult now. You can grieve what you didn't get, understand how it shaped you, and start building something different.`
    },
    relatedTools: ['replay', 'journal', 'relate']
  },

  {
    id: 'origins-05-dad-too-much',
    title: 'When Dad Was Too Much',
    subtitle: 'Controlling, critical, or explosive',
    emoji: '🌋',
    duration: '6 min',
    category: 'father',
    content: {
      opening: `Some fathers aren't absent—they're overwhelming. Too angry. Too critical. Too controlling. Too much.

If you grew up walking on eggshells around your dad, this one's for you.`,

      sections: [
        {
          title: 'The Many Faces of "Too Much"',
          body: `**The Critic:** Nothing was ever good enough. Every achievement met with "but why not better?"

**The Controller:** Had to know everything. Had opinions on everything. Your life was his to manage.

**The Rage:** You learned to read the room before you learned to read books. Is he in a good mood? Is it safe?

**The Unpredictable:** Sometimes great, sometimes terrifying. You never knew which dad you'd get.`
        },
        {
          title: 'What You Learned',
          body: `When a father is too much, children become experts at:

- Reading moods (hypervigilance)
- Shrinking themselves (don't take up space)
- Performing (be what he wants)
- Controlling their environment (if I can control this, maybe I'll be safe)
- Flinching (even when there's no threat)

You developed a finely tuned threat-detection system. The problem is, it's still running.`
        },
        {
          title: 'How It Shows Up Now',
          body: `**At work:**
- Terrified of male bosses or authority
- Overworking to avoid criticism
- Freezing when someone raises their voice

**In relationships:**
- Attracted to intense personalities (familiar)
- OR avoiding strong personalities entirely
- Difficulty expressing needs (they might explode)
- Apologizing constantly

**In your body:**
- Chronic tension (always ready to react)
- Startling easily
- Stomach issues, headaches, clenched jaw`
        }
      ],

      theScience: `Growing up with an unpredictable or frightening parent activates the stress response system chronically (van der Kolk, 2014). This can lead to a nervous system that's calibrated for danger—always scanning, always ready. This isn't weakness; it's adaptation to an environment that required vigilance.`,

      reflection: [
        'Which version of "too much" did you experience?',
        'What survival skills did you develop?',
        'Where do you notice hypervigilance in your life now?'
      ],

      closing: `You learned to survive someone who was too much. That took incredible skill. But you're not in that house anymore. Your nervous system just hasn't fully gotten the memo. That's the work now—helping your body learn that the danger has passed.`
    },
    relatedTools: ['replay', 'breathing', 'body-scan']
  },

  {
    id: 'origins-06-dad-deserved',
    title: 'The Dad You Deserved vs. The Dad You Got',
    subtitle: 'Grieving the relationship you needed',
    emoji: '💔',
    duration: '5 min',
    category: 'father',
    content: {
      opening: `There's a grief that doesn't get talked about much: grieving a parent who's still alive. Grieving not a person, but a relationship—the one you needed but never got.`,

      sections: [
        {
          title: 'The Father You Needed',
          body: `Every child needs a father who:
- Is present and engaged
- Makes them feel safe
- Shows them they matter
- Models healthy masculinity
- Loves them without conditions
- Shows up consistently

You needed this. Every child does. And if you didn't get it, that absence left a mark.`
        },
        {
          title: 'The Grief of "Almost"',
          body: `Sometimes the hardest fathers to grieve are the ones who were almost good enough. The one who was great sometimes but absent others. The one who loved you but couldn't show it. The one you can see glimpses of who he could have been.

This grief is complicated because you're mourning a potential that was never realized. You're not grieving a person—you're grieving a version of them that never fully existed.`
        },
        {
          title: 'You Can Hold Both',
          body: `You can love your father and be hurt by him.
You can understand him and still need distance.
You can want a relationship and accept that the one you want isn't possible.
You can grieve while he's still alive.

These aren't contradictions. They're the complexity of being human.`
        }
      ],

      theScience: `Ambiguous loss (Boss, 2006) describes grieving someone who is physically present but emotionally absent, or present but not the person you needed. This type of loss is often unrecognized and can be harder to process than clear-cut loss because there's no closure.`,

      reflection: [
        'What did you need from your father that you didn\'t get?',
        'Have you allowed yourself to grieve that?',
        'What would it mean to accept that you might never get it?'
      ],

      closing: `You deserved a father who could be what you needed. You didn't get that. That loss is real, and it deserves to be grieved. Not to stay stuck in it—but to move through it. Grief is how we honor what mattered while making room for what comes next.`
    },
    relatedTools: ['journal', 'replay']
  },

  // ═══════════════════════════════════════════════════════════════
  // PART 3: MOMMY ISSUES (REAL TALK)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'origins-07-mom-enmeshment',
    title: 'When Mom Needed You To Need Her',
    subtitle: 'Enmeshment and the loss of self',
    emoji: '🪢',
    duration: '6 min',
    category: 'mother',
    content: {
      opening: `Some mothers love too close. Not too much—too close. So close that you couldn't tell where she ended and you began. So close that having your own life felt like betrayal.

This is called enmeshment. And it's one of the hardest patterns to untangle.`,

      sections: [
        {
          title: 'What Enmeshment Looks Like',
          body: `- She needed to know everything about your life
- Your emotions were her emotions (and vice versa)
- Doing things independently felt like abandoning her
- She was your best friend—and that was the problem
- Boundaries were treated as rejection
- Her happiness depended on your choices
- You felt responsible for her emotional wellbeing`
        },
        {
          title: 'Why It Happened',
          body: `Enmeshed mothers usually aren't evil. They're often:
- Lonely (using the child for connection they don't have elsewhere)
- Anxious (needing to know everything to feel safe)
- Unaware (recreating what they experienced)
- Loving in the only way they know

But the impact on you is real, regardless of her intent.`
        },
        {
          title: 'How It Shows Up Now',
          body: `**Guilt as a lifestyle:**
- Feeling guilty for having your own life
- Difficulty making decisions without checking with her
- Guilt when you're happy without her

**Boundary confusion:**
- Not knowing what YOU want vs. what she wants for you
- Feeling responsible for others' emotions
- Difficulty saying no without explanation

**Identity questions:**
- "Who am I outside of this relationship?"
- Chameleon tendencies (becoming what others need)
- Feeling lost when alone`
        }
      ],

      theScience: `Enmeshment prevents the development of individuation—the healthy process of becoming your own person (Minuchin, 1974). Children need connection AND separation. Without space to become individuals, they struggle with identity, boundaries, and independent decision-making in adulthood.`,

      reflection: [
        'Did your mother\'s happiness depend on your choices?',
        'Do you feel guilty for having a life separate from her?',
        'What would it mean to be your own person—not hers?'
      ],

      closing: `Separating from an enmeshed mother isn't abandonment. It's growth. It's what was supposed to happen but didn't. You can love her and have your own life. You can stay connected without being fused. That's not betrayal—that's health.`
    },
    relatedTools: ['role-play', 'journal', 'boundaries']
  },

  {
    id: 'origins-08-mom-was-child',
    title: 'When Mom Was The Child',
    subtitle: 'Parentification and role reversal',
    emoji: '🔄',
    duration: '6 min',
    category: 'mother',
    content: {
      opening: `Some children don't get to be children. They become the parent. They manage their mother's emotions, keep the peace, hold the family together. They grow up too fast because someone had to be the adult.

If this was you, you already know. You've been tired for a very long time.`,

      sections: [
        {
          title: 'Parentification',
          body: `It can look like:
- Being your mother's confidant, therapist, or emotional support
- Managing household responsibilities beyond your years
- Taking care of younger siblings because she couldn't
- Being praised for being "mature" and "responsible"
- Knowing things children shouldn't know (finances, adult problems, marital issues)
- Mediating between parents
- Suppressing your needs because hers were bigger`
        },
        {
          title: 'Why You Became The Parent',
          body: `Maybe she was:
- Struggling with mental health
- In an abusive relationship
- Single and overwhelmed
- Dealing with addiction
- Emotionally immature
- A child herself when she had you

Whatever the reason, she needed someone to lean on. And children, in their desperate need to maintain attachment, will become whatever their parents need. Even parents.`
        },
        {
          title: 'What It Cost You',
          body: `**Lost childhood:**
- You didn't get to be carefree, playful, irresponsible
- You learned to perform competence before you felt it

**Exhaustion:**
- You've been carrying adult weight since childhood
- "The responsible one" is tired

**Receiving difficulty:**
- You know how to give, not how to take
- Care feels uncomfortable coming toward you
- You dismiss your own needs as "not that bad"

**Relationship patterns:**
- Attracted to people who need fixing
- Giving more than you receive
- Feeling needed = feeling loved`
        }
      ],

      theScience: `Parentification is a role reversal that disrupts healthy development (Boszormenyi-Nagy, 1973). Children who become caregivers often struggle with burnout, codependency, and difficulty receiving care in adulthood. They learned that their value lies in what they provide, not in who they are.`,

      reflection: [
        'Were you the "responsible one" before you were ready?',
        'What did you not get to experience because you were parenting?',
        'How comfortable are you receiving care now?'
      ],

      closing: `You held things together that shouldn't have been your responsibility. You stepped up because someone had to. But you were a child who deserved to be taken care of. That child is still in you—and they still deserve care. Learning to receive it is part of your healing now.`
    },
    relatedTools: ['replay', 'self-care', 'journal']
  },

  {
    id: 'origins-09-mom-conditional',
    title: "When Mom's Love Had Conditions",
    subtitle: 'Performance-based approval',
    emoji: '🎭',
    duration: '6 min',
    category: 'mother',
    content: {
      opening: `Some mothers love in conditions. Get good grades, and I'm proud. Succeed, and I'll show you off. Be what I wanted to be, and I'll approve. Fail, disappoint, or differ from what I wanted—and the warmth disappears.

If you learned that love had to be earned, this is for you.`,

      sections: [
        {
          title: 'Conditional Love',
          body: `It sounds like:
- "You're so smart/pretty/talented" (but only when you perform)
- Silent treatment when you disappoint
- Warmth that comes and goes based on your achievements
- Comparisons to siblings, cousins, other kids
- "After everything I've done for you..."
- Love that feels like a transaction
- The sense that you're never quite enough`
        },
        {
          title: 'What You Learned',
          body: `When love has conditions, children learn:
- "I am what I achieve."
- "Rest is laziness."
- "My worth is external."
- "If I'm not producing, I'm not valuable."
- "Unconditional love is a myth."
- "I must be perfect to be loved."

These lessons become the voice in your head. The inner critic? It often sounds like mom.`
        },
        {
          title: 'How It Shows Up Now',
          body: `**Achievement addiction:**
- Always striving, never arriving
- Accomplishments bring brief relief, not lasting satisfaction
- Rest feels dangerous

**Perfectionism:**
- Paralyzing fear of failure
- Procrastination (if I don't try, I can't fail)
- All-or-nothing thinking

**Relationship patterns:**
- Performing for love
- Feeling like you have to earn affection
- Difficulty believing you're loved "just because"
- Waiting for people to discover you're not good enough`
        }
      ],

      theScience: `Conditional positive regard (Rogers, 1959) leads children to develop a "false self"—a performance designed to earn love. This disconnects them from their authentic feelings and needs. Self-worth becomes externalized, dependent on achievement and approval rather than inherent value.`,

      reflection: [
        'What did you have to do or be to receive your mother\'s approval?',
        'What happened when you fell short?',
        'Do you believe you\'re lovable without achieving anything?'
      ],

      closing: `You are not what you produce. Your worth isn't conditional. These are things you might know intellectually but not feel in your body yet. That's okay. The work now is helping the rest of you catch up to what your mind already knows: You are worthy of love just because you exist.`
    },
    relatedTools: ['journal', 'self-compassion', 'thought-challenger']
  },

  // ═══════════════════════════════════════════════════════════════
  // PART 4: NOW WHAT?
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'origins-10-reparenting',
    title: 'Reparenting Yourself',
    subtitle: 'Giving yourself what they couldn\'t',
    emoji: '🌱',
    duration: '7 min',
    category: 'healing',
    content: {
      opening: `You can't go back and get the childhood you needed. But you can do something powerful: You can become the parent you needed. This isn't weird inner-child stuff. It's practical, evidence-based self-care for adults who didn't get enough care as kids.`,

      sections: [
        {
          title: 'What Is Reparenting?',
          body: `Reparenting means intentionally giving yourself what your parents couldn't:
- The validation they didn't offer
- The consistency they couldn't maintain
- The acceptance they made conditional
- The safety they couldn't provide
- The attention they didn't have

It's not about pretending. It's about recognizing that you, as an adult, can now provide what child-you needed.`
        },
        {
          title: 'Practical Reparenting',
          body: `**When you're struggling:**
Instead of "Get over it" → "This is hard. It makes sense you're struggling."

**When you fail:**
Instead of criticism → "Everyone fails. What do you need right now?"

**When you need rest:**
Instead of "You're lazy" → "Rest is necessary. You've earned it."

**When you have needs:**
Instead of dismissing → "Your needs matter. What do you need?"

**When you're scared:**
Instead of "You're being dramatic" → "I'm here. You're safe now."`
        },
        {
          title: 'Daily Reparenting Practices',
          body: `1. **Morning check-in:** "How are we doing today? What do we need?"

2. **Self-talk audit:** Notice your inner voice. Is it your critical parent? What would a loving parent say instead?

3. **Basic care:** Food, water, rest, movement. The stuff a good parent would ensure.

4. **Celebration:** Acknowledge wins, even small ones. No "but" afterward.

5. **Bedtime kindness:** End the day with something you would have needed to hear as a child.`
        }
      ],

      theScience: `Internal Family Systems (Schwartz, 1995) and schema therapy (Young, 2003) both incorporate reparenting techniques. Research shows that self-compassion activates the same neural systems as receiving compassion from others—meaning you can literally give yourself the calming presence you needed as a child.`,

      reflection: [
        'What did child-you most need to hear?',
        'Can you offer that to yourself now?',
        'What would change if you treated yourself like someone worth caring for?'
      ],

      closing: `You can't change the past. But you can change how you treat yourself in the present. Every time you offer yourself kindness instead of criticism, you're doing something radical: You're being the parent you needed. And over time, that adds up.`
    },
    relatedTools: ['journal', 'self-care', 'breathing']
  },

  {
    id: 'origins-11-boundaries',
    title: 'Boundaries With Family',
    subtitle: 'You\'re allowed to limit contact',
    emoji: '🚧',
    duration: '6 min',
    category: 'healing',
    content: {
      opening: `You are allowed to have boundaries with your family. You are allowed to limit contact. You are allowed to protect yourself from people who hurt you, even if you share DNA.

Guilt is not proof you're doing something wrong. Let's talk about boundaries.`,

      sections: [
        {
          title: 'What Boundaries Are',
          body: `Boundaries aren't walls or punishment. They're information about what you will and won't accept.

"I'm not going to discuss my weight with you."
"I need to leave when you start drinking."
"I won't answer calls after 10pm."
"I'm taking a break from our relationship right now."

Boundaries are about YOU and what you'll do—not about controlling them.`
        },
        {
          title: 'The Guilt Is Lying',
          body: `Guilt says: "If this feels bad, you must be doing something wrong."

The truth: Guilt is often just discomfort with change. You're breaking patterns that have existed your whole life. Of course it feels strange.

Guilt is also often programmed. If you were raised to put family first no matter what, choosing yourself will trigger guilt. That guilt isn't moral guidance—it's programming.`
        },
        {
          title: 'Boundary Scripts',
          body: `**When they push:**
"I understand you don't like this boundary. I'm keeping it anyway."

**When they guilt trip:**
"I'm sorry you feel that way." (Full stop. No explaining.)

**When they demand reasons:**
"I've made my decision. I don't need to justify it."

**When you're ready to limit contact:**
"I need some space right now. I'll reach out when I'm ready."

**When you're done:**
You don't owe anyone an explanation. You can simply stop engaging.`
        }
      ],

      theScience: `Healthy boundaries are essential for wellbeing (Cloud & Townsend, 1992). Research shows that people with clear boundaries have better mental health, more satisfying relationships, and less burnout. Boundaries aren't selfish—they're necessary for sustainable relationships.`,

      reflection: [
        'What boundary do you need that you haven\'t set?',
        'What\'s stopping you?',
        'Can you separate guilt from actual wrongdoing?'
      ],

      closing: `You can love your family and have boundaries. You can want a relationship and need distance. You can be a good person and protect yourself from people who hurt you. These aren't contradictions—they're what healthy looks like.`
    },
    relatedTools: ['role-play', 'journal']
  },

  {
    id: 'origins-12-breaking-cycle',
    title: 'Breaking The Cycle',
    subtitle: 'You are not destined to repeat their patterns',
    emoji: '🔓',
    duration: '5 min',
    category: 'healing',
    content: {
      opening: `Here's the fear you might have: "What if I become like them? What if I do to my kids what they did to me? What if I can't escape the pattern?"

Here's the truth: Awareness changes everything. You're already breaking the cycle by being here.`,

      sections: [
        {
          title: 'Why Patterns Repeat',
          body: `Generational patterns repeat because:
- We recreate what's familiar (even if it's painful)
- We didn't know there was another way
- Survival adaptations become automatic
- Unprocessed pain gets passed down

But here's the key: These patterns repeat when they're unconscious. When you shine a light on them, you get a choice.`
        },
        {
          title: 'You Already Have What They Didn\'t',
          body: `You have:
- **Awareness** — You can see the patterns
- **Language** — You can name what happened
- **Resources** — Apps like this, therapy, books, communities
- **Permission** — A culture that increasingly says "it's okay to heal"

Your parents likely had none of this. They couldn't break what they couldn't see. You can.`
        },
        {
          title: 'Breaking The Cycle',
          body: `Every time you:
- Pause instead of reacting
- Choose kindness over criticism (with yourself or others)
- Set a boundary your parents never could
- Ask for help when they suffered alone
- Feel a feeling instead of numbing it
- Choose a different relationship pattern

...you're breaking the cycle. Not all at once. Not perfectly. But enough.`
        }
      ],

      theScience: `Research on intergenerational trauma (Yehuda, 2018) shows that while trauma patterns can be inherited, they can also be interrupted. The key factors are awareness, support, and intentional processing. Being conscious of patterns significantly reduces the likelihood of repeating them.`,

      reflection: [
        'What pattern are you most afraid of repeating?',
        'What do you have now that your parents didn\'t?',
        'What\'s one small way you\'ve already broken the cycle?'
      ],

      closing: `You are not your parents. You carry their patterns, but you also carry the power to change them. Every insight, every different choice, every moment of awareness—it adds up. The cycle didn't start with you, but it can slow down with you. Maybe even stop.

Your healing isn't just for you. It's for everyone who comes after. And that makes it matter even more.`
    },
    relatedTools: ['journal', 'replay', 'self-compassion']
  }
];

// Helper to get lessons by category
export function getOriginsByCategory(category: OriginsLesson['category']): OriginsLesson[] {
  return ORIGINS_LESSONS.filter(lesson => lesson.category === category);
}

// Helper to get a specific lesson
export function getOriginsLesson(id: string): OriginsLesson | undefined {
  return ORIGINS_LESSONS.find(lesson => lesson.id === id);
}

// Get all categories with counts
export function getOriginsCategories() {
  return [
    { id: 'basics', label: 'The Basics', emoji: '📚', count: 3 },
    { id: 'father', label: 'Understanding Dad', emoji: '👔', count: 3 },
    { id: 'mother', label: 'Understanding Mom', emoji: '👩', count: 3 },
    { id: 'healing', label: 'Healing & Growing', emoji: '🌱', count: 3 },
  ];
}
