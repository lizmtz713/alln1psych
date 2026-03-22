/**
 * Human Manual Section 8: Understanding Your Origins
 * 
 * 12 lessons on family-of-origin wounds, attachment, and healing
 * Target: Young adults (18-25) but age-adaptive for all tiers
 * 
 * Integrates with existing Manual structure
 */

import type { ManualSection, ManualModule, ManualLesson } from './manualContent';

// ═══════════════════════════════════════════════════════════════
// MODULE 1: THE BASICS
// ═══════════════════════════════════════════════════════════════

const originsModule1: ManualModule = {
  id: 'origins-basics',
  title: 'The Basics',
  emoji: '📚',
  lessons: [
    {
      id: 'origins-not-broken",
      title: \"You're Not Broken, You"re Adapted",
      emoji: '🔧',
      linkedActivity: 'replay',
      deepDive: `Every "issue" you have is actually a survival strategy that worked at some point. The anxiety kept you alert when your environment was unpredictable. The people-pleasing kept you safe when someone"s mood determined your wellbeing. The emotional walls protected you when vulnerability got you hurt. You're not running faulty software—you"re running software that was perfectly designed for a different environment.`,
      realWorld: [
        'The hypervigilance that kept you safe at home is now called "anxiety"',
        'The emotional suppression that protected you means you "can\'t access feelings"',
        'The performance for approval means you\'re exhausted and never feel enough',
      ],
      tryThis: 'Pick one "issue" you have. Ask: "What was this protecting me from as a kid?"',
      connectsTo: ['attachment-101', 'reparenting"],
      content: {
        teen: {
          introduction: \"Here's something nobody told you: The things you don"t like about yourself? They probably kept you safe when you were younger. They"re not flaws—they're survival strategies.\",
          keyConcepts: [
            { title: "Adaptation", explanation: \"Your brain learned what it needed to survive your specific situation. That's not weakness—that"s smart." },
            { title: 'Old Software", explanation: \"The problem isn't that these strategies exist. It"s that you"re still running them when you don't need them anymore.\" },
            { title: "Not Your Fault", explanation: \"You didn't choose these patterns. They happened TO you. Now you can choose what comes next.\" },
          ],
          reflectionPrompt: "What\'s something about yourself you wish you could change? What might it have protected you from when you were younger?',
        },
        adult: {
          introduction: "Those patterns you keep trying to break? They made sense once. Every adaptation you developed—the anxiety, the control, the walls—was your nervous system's solution to a problem. Understanding this changes everything.",
          keyConcepts: [
            { title: 'Survival Strategies", explanation: \"Hypervigilance, people-pleasing, emotional shutdown—these aren't personality flaws. They"re what kept you functioning in your childhood environment." },
            { title: 'Context Mismatch", explanation: \"The strategy that saved you at 8 might be sabotaging you at 28. Your environment changed; your programming didn't update.\" },
            { title: "Neuroplasticity", explanation: \"What was learned can be updated. You can't erase old pathways, but you can build new ones alongside them.\" },
          ],
          reflectionPrompt: "What pattern in yourself frustrates you most? Can you trace it back to something that made sense in your childhood?",
        },
        senior: {
          introduction: \"Looking back across decades, you may see patterns in yourself that never quite made sense—until now. Those patterns weren't character flaws. They were a child"s best attempt to survive their environment.",
          keyConcepts: [
            { title: 'Lifetime Patterns', explanation: "Behaviors that have followed you for decades often started as childhood survival strategies. Understanding this can bring peace." },
            { title: 'Compassionate View", explanation: \"That child did their best. You can hold compassion for both who you were and who you've become.\" },
            { title: "Never Too Late', explanation: "Insight can come at any age. Understanding yourself now still matters—for your peace and for what you pass on." },
          ],
          reflectionPrompt: 'What pattern has been with you your whole life? Can you see how it might have started as protection?',
        },
      },
    },
    {
      id: 'origins-parents-children',
      title: 'Your Parents Were Once Children Too',
      emoji: '👶',
      linkedActivity: 'relate',
      deepDive: `Hurt people hurt people. Your mom's criticism? She probably heard worse from her mother. Your dad"s emotional absence? He likely never learned that men could have feelings. This doesn't make it okay. It doesn"t mean you have to forgive them. It just means the wound didn"t start with you—and it doesn't have to end with you passing it on.`,
      realWorld: [
        \"Your father"s distance might echo his own father's distance",
        "Your mother's anxiety might be inherited from generations back",
        "Patterns repeat until someone sees them clearly enough to break them",
      ],
      tryThis: 'Ask an older relative what your parents were like as children, or what their parents were like.',
      connectsTo: ['breaking-cycle', 'boundaries"],
      content: {
        teen: {
          introduction: \"This might be hard to hear: Your parents were once kids too. They had their own parents, their own problems, their own pain. This doesn't excuse anything—but it helps explain things.\",
          keyConcepts: [
            { title: "Hurt People Hurt People', explanation: "Your parents' wounds often become your environment. They gave what they had, even if what they had was pain." },
            { title: 'Not About You', explanation: "Their issues were never about you. A parent's problems existed before you were born." },
            { title: 'Understanding ≠ Excusing', explanation: "You can understand why someone does something AND still be hurt by it. Both are true." },
          ],
          reflectionPrompt: 'What do you know about what your parents were like as kids? What might they have gone through?",
        },
        adult: {
          introduction: \"Your parents were shaped by forces beyond their control—just like you were shaped by them. Understanding this isn't about excusing their failures. It"s about seeing the full picture so you can write a different story.",
          keyConcepts: [
            { title: 'Generational Patterns', explanation: "Trauma and dysfunction often pass through generations—not through genes, but through learned behavior and unprocessed pain." },
            { title: 'Their Best ≠ Good Enough", explanation: \"Your parents likely did their best with what they had. And their best wasn't enough for what you needed. Both statements can be true.\" },
            { title: "Breaking Chains', explanation: "When you understand the chain, you can choose to be the link where it breaks." },
          ],
          reflectionPrompt: 'What patterns do you see in your family going back generations? What do you want to do differently?',
        },
        senior: {
          introduction: "With the perspective of years, you may be able to see your parents more clearly now—as people shaped by their own era, their own parents, their own limitations. This clarity can bring a kind of peace.",
          keyConcepts: [
            { title: 'Historical Context', explanation: "Your parents grew up in a different world, with different expectations and fewer resources for understanding emotions." },
            { title: 'Compassion and Truth', explanation: "You can hold compassion for who they were AND acknowledge how their limitations affected you." },
            { title: 'Legacy', explanation: "What you understand now can be wisdom you share with younger generations." },
          ],
          reflectionPrompt: 'Looking back, what do you understand about your parents now that you couldn\'t see when you were young?',
        },
      },
    },
    {
      id: 'origins-attachment-101',
      title: 'Attachment 101: Why You Love The Way You Do',
      emoji: '🔗',
      linkedActivity: 'relate",
      deepDive: `Your attachment style—secure, anxious, avoidant, or disorganized—formed before you could talk. It was based on how consistently your needs were met and whether closeness felt safe or dangerous. This wasn't your choice. But now that you can see it, you can work with it.`,
      realWorld: [
        "Anxious attachment: needing lots of reassurance, fearing abandonment',
        'Avoidant attachment: valuing independence, feeling suffocated by closeness',
        'Disorganized: wanting closeness but pushing it away, chaotic relationships',
      ],
      tryThis: 'Think about your last three relationships. What pattern shows up in how you act when you feel insecure?',
      connectsTo: ['dad-not-there', 'mom-enmeshment', 'reparenting"],
      content: {
        teen: {
          introduction: \"The way you act in friendships and relationships isn't random. It was shaped by your first few years of life, before you even knew it was happening.\",
          keyConcepts: [
            { title: "Attachment Styles', explanation: "There are four main styles: Secure (trusting), Anxious (needing reassurance), Avoidant (needing space), and Disorganized (confused about closeness)." },
            { title: 'Not Your Fault", explanation: \"Your style formed based on how adults treated you as a baby and toddler. You didn't choose it.\" },
            { title: "Can Change", explanation: \"Attachment styles aren't permanent. With awareness and different experiences, they can shift.\" },
          ],
          reflectionPrompt: "When you feel insecure in a friendship, what do you usually do? Cling tighter? Pull away? Both?',
        },
        adult: {
          introduction: "Your attachment style is probably the single most important thing to understand about your relationship patterns. It explains why you do what you do when intimacy is on the line.",
          keyConcepts: [
            { title: 'Secure Attachment', explanation: "Can be close AND independent. Trusts that people will show up. About 50% of people." },
            { title: 'Insecure Styles', explanation: "Anxious (20%), Avoidant (25%), Disorganized (5%). Each developed as a logical response to inconsistent or frightening caregiving." },
            { title: 'Earned Security', explanation: "Through therapy, good relationships, and intentional work, insecure attachment can become 'earned secure.'" },
          ],
          reflectionPrompt: 'Which attachment style resonates most with how you act in close relationships? Can you see how it formed?',
        },
        senior: {
          introduction: "Your relationship patterns across a lifetime likely trace back to your earliest bonds. Understanding attachment can bring clarity to decades of relationship experiences.",
          keyConcepts: [
            { title: 'Lifetime Patterns', explanation: "The same attachment style often shows up across friendships, marriages, and even how you relate to your own children." },
            { title: 'It Made Sense', explanation: "However you learned to attach, it was a response to your environment. It protected you then." },
            { title: 'Wisdom in Seeing', explanation: "Even late in life, understanding attachment can heal old wounds and improve current relationships." },
          ],
          reflectionPrompt: 'Looking at your relationships across your life, what pattern do you see in how you handle closeness?',
        },
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// MODULE 2: UNDERSTANDING DAD
// ═══════════════════════════════════════════════════════════════

const originsModule2: ManualModule = {
  id: 'origins-father',
  title: 'Understanding Dad',
  emoji: '👔',
  lessons: [
    {
      id: 'origins-dad-not-there",
      title: \"When Dad Wasn't There\",
      emoji: "👤',
      linkedActivity: 'replay",
      deepDive: `Maybe he left. Maybe he was there but not really there—physically present but emotionally absent. Whatever the reason, you grew up with a father-shaped hole. Children of absent fathers often learn: \"I'm not worth staying for\" or \"Men leave\" or \"Needing someone is dangerous.\" These aren"t rational thoughts—they're body-level beliefs that shape how you move through the world.`,
      realWorld: [
        'Choosing unavailable partners because unavailable feels familiar',
        'Testing people to see if they\'ll leave',
        'Leaving first so you can\'t be left',
        'Craving male approval but not trusting it when you get it',
      ],
      tryThis: 'Write a letter to your absent father. You don\'t have to send it—this is for you.',
      connectsTo: ['attachment-101', 'dad-deserved', 'reparenting"],
      ageAdaptive: {
        teen: \"If your dad isn't around much, it can leave a mark even if you don"t realize it. That"s not your fault, and it doesn't mean anything is wrong with you.\",
      },
      content: {
        teen: {
          introduction: \"If your dad isn"t around—or is around but doesn"t really connect with you—that affects you. It doesn't mean you"re not worth being there for. It means he couldn't be what you needed.",
          keyConcepts: [
            { title: 'Two Kinds of Absence', explanation: "Physical absence (not there) and emotional absence (there but unreachable) both hurt in different ways." },
            { title: 'Not About You', explanation: "His absence is about HIM—his limitations, his wounds, his choices. Not about your worth." },
            { title: 'The Hole", explanation: \"There might be a part of you that's always looking for something. That makes sense.\" },
          ],
          reflectionPrompt: "What would you want to say to your dad if you could say anything?",
        },
        adult: {
          introduction: \"Growing up without a present father—physically or emotionally—leaves marks that often don't become clear until adulthood. In relationships, work, and how you see yourself.\",
          keyConcepts: [
            { title: "Absence Lessons', explanation: "Children of absent fathers often unconsciously learn: "I'm not worth staying for," 'Men leave,' 'Needing someone is dangerous.'" },
            { title: 'Relationship Echoes', explanation: "Choosing unavailable partners, testing loyalty, leaving before you can be left—these patterns often trace back to early absence." },
            { title: 'The Work", explanation: \"Grieving what you didn't get while building what you need now. Both are necessary.\" },
          ],
          reflectionPrompt: "How does your father\'s absence (physical or emotional) show up in your relationships now?',
        },
        senior: {
          introduction: "A father's absence—whether through death, departure, or emotional distance—can echo across a lifetime. Looking back, you may see its fingerprints on many choices and relationships.",
          keyConcepts: [
            { title: 'Lifetime Impact', explanation: "The absence of a father often shapes career choices, relationship patterns, and sense of self for decades." },
            { title: 'Never Too Late", explanation: \"Grief for what you didn't receive can happen at any age. It"s not about moving on—it's about making peace." },
            { title: 'Legacy', explanation: "Understanding how his absence affected you can help you support others who face similar wounds." },
          ],
          reflectionPrompt: 'How did your father\'s presence or absence shape the life you\'ve lived?',
        },
      },
    },
    {
      id: 'origins-dad-too-much',
      title: 'When Dad Was Too Much',
      emoji: '🌋',
      linkedActivity: 'replay",
      deepDive: `Some fathers aren't absent—they"re overwhelming. Too angry, too critical, too controlling. If you grew up walking on eggshells, you developed a finely tuned threat-detection system. The problem is, it"s still running—even when there's no threat.`,
      realWorld: [
        "Flinching when someone raises their voice (even playfully)',
        'Chronic tension in your body, always ready to react',
        'Difficulty with male authority figures',
        'Overworking to avoid criticism',
      ],
      tryThis: 'Notice when you flinch or tense up around men. Ask: "Is there actual danger here, or is my body remembering something old?"',
      connectsTo: ['attachment-101', 'dad-deserved', 'boundaries"],
      ageAdaptive: {
        teen: \"If your dad is scary or unpredictable, focus on staying safe first. You don't have to fix anything—just survive until you have more choices.\",
      },
      content: {
        teen: {
          introduction: \"If your dad is someone you have to be careful around—if his mood controls the house—that"s a lot to deal with. Your job isn"t to fix him. It's to survive and find support.\",
          keyConcepts: [
            { title: "Walking on Eggshells", explanation: \"When a parent is unpredictable or scary, kids learn to always be on alert. That's exhausting.\" },
            { title: "Not Your Job", explanation: \"You shouldn't have to manage his emotions or protect others from him. That"s not a kid's job." },
            { title: 'Find Support', explanation: "Trusted adults, counselors, friends' parents—building support outside home is important." },
          ],
          reflectionPrompt: 'Who outside your home feels safe to talk to?",
        },
        adult: {
          introduction: \"Growing up with an explosive, controlling, or critical father programs your nervous system for threat. That programming doesn't just disappear when you leave home.\",
          keyConcepts: [
            { title: "Hypervigilance', explanation: "Your threat-detection system is calibrated high. You notice shifts in mood, tone of voice, energy—before others do." },
            { title: 'Body Memory', explanation: "Flinching, tension, stomach drops—your body remembers what your mind might have buried." },
            { title: 'Safety Now", explanation: \"Part of healing is teaching your nervous system that the threat is over. You're not in that house anymore.\" },
          ],
          reflectionPrompt: "Where do you notice hypervigilance in your life now? What triggers it?",
        },
        senior: {
          introduction: \"A frightening or overwhelming father can leave marks that last a lifetime—in your body, your relationships, your sense of safety. It's never too late to understand and address those marks.\",
          keyConcepts: [
            { title: "Lifetime Vigilance", explanation: \"If you spent your childhood on alert, that habit doesn't just go away. But understanding it can bring relief.\" },
            { title: "Compassion', explanation: "You can hold compassion for the child who had to survive that environment. They did what they had to do." },
            { title: 'Peace', explanation: "Understanding the source of old fears can bring a kind of peace, even decades later." },
          ],
          reflectionPrompt: 'What fears or tensions from childhood are still with you?',
        },
      },
    },
    {
      id: 'origins-dad-deserved',
      title: 'The Dad You Deserved vs. The Dad You Got',
      emoji: '💔',
      linkedActivity: 'journal",
      deepDive: `There's a grief that doesn"t get talked about much: grieving a parent who"s still alive. Grieving not a person, but a relationship—the one you needed but never got. You can love your father and be hurt by him. You can understand him and still need distance. These aren't contradictions.`,
      realWorld: [
        "Feeling guilty for being angry at your father',
        'Wanting a relationship while knowing the one you want isn\'t possible',
        'Grieving after every disappointing interaction',
      ],
      tryThis: 'Write two descriptions: the father you needed, and the father you got. Let yourself feel the gap.',
      connectsTo: ['dad-not-there', 'dad-too-much', 'reparenting"],
      content: {
        teen: {
          introduction: \"You might feel sad or angry about your dad without knowing exactly why. Maybe it's not about what he did—it"s about what he didn"t do. What he couldn't be.\",
          keyConcepts: [
            { title: "The Gap", explanation: \"There's a difference between the dad you needed and the dad you got. That gap is real, and it"s okay to feel it." },
            { title: 'Mixed Feelings', explanation: "You can love him and be disappointed. You can want him to be different and accept he might not change." },
            { title: 'Your Needs Matter", explanation: \"Wanting a certain kind of dad doesn't make you ungrateful. It makes you human.\" },
          ],
          reflectionPrompt: "If you could have any kind of relationship with your dad, what would it look like?",
        },
        adult: {
          introduction: \"Grieving a parent who's still alive is a strange kind of loss. You"re not mourning a person—you're mourning a relationship that never existed and probably never will.",
          keyConcepts: [
            { title: 'Ambiguous Loss", explanation: \"When someone is physically present but emotionally unavailable, there's no clear moment to grieve. The loss is ongoing.\" },
            { title: "Permission", explanation: \"You're allowed to grieve the father you needed. That grief is valid even if he"s still here." },
            { title: 'Both/And', explanation: "You can love him and be hurt. Understand him and need distance. Want reconciliation and accept it may not happen." },
          ],
          reflectionPrompt: 'What have you never allowed yourself to grieve about your relationship with your father?",
        },
        senior: {
          introduction: \"Whether your father is still living or has passed, there may be grief you've carried for decades—grief for the relationship you needed but never had. It"s not too late to honor that loss.",
          keyConcepts: [
            { title: 'Delayed Grief", explanation: \"Sometimes grief for what we didn't receive doesn"t surface until late in life. That's okay." },
            { title: 'Making Peace", explanation: \"Peace doesn't require reconciliation. It requires accepting what was and wasn"t possible." },
            { title: 'Legacy', explanation: "Your understanding can be a gift to younger family members facing similar losses." },
          ],
          reflectionPrompt: 'What would you want to say to your father now, whether he can hear it or not?',
        },
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// MODULE 3: UNDERSTANDING MOM  
// ═══════════════════════════════════════════════════════════════

const originsModule3: ManualModule = {
  id: 'origins-mother',
  title: 'Understanding Mom',
  emoji: '👩',
  lessons: [
    {
      id: 'origins-mom-enmeshment',
      title: 'When Mom Needed You To Need Her',
      emoji: '🪢',
      linkedActivity: 'boundaries",
      deepDive: `Enmeshment is when a mother loves too close. So close you couldn't tell where she ended and you began. So close that having your own life felt like betrayal. Enmeshed children often struggle with guilt, boundaries, and knowing what they actually want versus what she wants for them.`,
      realWorld: [
        "Feeling guilty for having a life separate from her',
        'Difficulty making decisions without checking with her first',
        'Not knowing what YOU want versus what she wants for you',
        'Feeling responsible for her happiness',
      ],
      tryThis: 'Make a small decision this week without consulting her or worrying about her reaction.',
      connectsTo: ['attachment-101', 'mom-conditional', 'boundaries"],
      content: {
        teen: {
          introduction: \"Some moms hold on really tight. So tight it's hard to figure out who YOU are separate from her. That"s called enmeshment, and it's confusing.",
          keyConcepts: [
            { title: 'Too Close', explanation: "When a parent"s emotions are always wrapped up in yours, it's hard to know where you end and they begin.\" },
            { title: "Guilt", explanation: \"You might feel guilty for wanting your own life, your own friends, your own space. That guilt isn't fair.\" },
            { title: "Your Life", explanation: \"Having your own identity isn't betrayal. It"s healthy. It"s what's supposed to happen.\" },
          ],
          reflectionPrompt: "What would you do differently if you didn\'t have to worry about your mom\'s reaction?',
        },
        adult: {
          introduction: "Enmeshment looks like love but feels like suffocation. If your mother's happiness depended on your choices, your emotions were always tangled with hers, you know this pattern.",
          keyConcepts: [
            { title: 'Boundary Confusion', explanation: "When you grow up enmeshed, you might not know what YOU want. Her voice is always in your head." },
            { title: 'Guilt as Control", explanation: \"Enmeshed relationships often use guilt to maintain closeness. Guilt isn't proof you"re wrong—it's often programming." },
            { title: 'Separating", explanation: \"Becoming your own person isn't abandonment. It"s what healthy development looks like. She might not like it." },
          ],
          reflectionPrompt: 'How do you know when a decision is yours versus what she\'d want?',
        },
        senior: {
          introduction: "An enmeshed relationship with a mother can span decades, becoming the water you swim in. Looking back, you may see how her needs shaped your entire life.",
          keyConcepts: [
            { title: 'Lifetime Pattern', explanation: "Enmeshment often continues until one person dies—unless someone consciously chooses to change it." },
            { title: 'Late Separation", explanation: \"It's never too late to become your own person. Even in your 60s, 70s, 80s.\" },
            { title: "Peace', explanation: "Understanding enmeshment can bring peace about choices you made and paths not taken." },
          ],
          reflectionPrompt: 'How did your relationship with your mother shape the life you\'ve lived?',
        },
      },
    },
    {
      id: 'origins-mom-parentified',
      title: 'When Mom Was The Child',
      emoji: '🔄',
      linkedActivity: 'replay",
      deepDive: `Parentification is when the child becomes the parent. You managed her emotions, kept the peace, held the family together. You grew up too fast because someone had to be the adult. If this was you, you've been tired for a very long time.`,
      realWorld: [
        "Being "the responsible one" since childhood',
        'Knowing things children shouldn\'t know (finances, adult problems)',
        'Being praised for being "mature"',
        'Difficulty receiving care—you only know how to give',
      ],
      tryThis: 'This week, ask someone for help with something you\'d normally handle alone.',
      connectsTo: ['attachment-101', 'reparenting', 'boundaries"],
      ageAdaptive: {
        teen: \"If you feel like you're taking care of your mom instead of the other way around, that"s not fair. It's not your job to be the parent.",
      },
      content: {
        teen: {
          introduction: "Some kids end up being the parent to their own parent. Taking care of her emotions, managing the household, being 'the responsible one." If that's you, you"re carrying too much.",
          keyConcepts: [
            { title: 'Role Reversal', explanation: "When a parent leans on their child for emotional support or household management, the roles get flipped." },
            { title: 'Too Much", explanation: \"You shouldn't have to manage adult problems. You should get to be a kid.\" },
            { title: "Support', explanation: "Find adults who can support YOU. Counselors, teachers, other family members." },
          ],
          reflectionPrompt: 'What do you take care of that shouldn\'t be your job?",
        },
        adult: {
          introduction: \"If you were the responsible one, the one who held everything together, the one your mother leaned on—you know what parentification is. You've been tired since childhood.\",
          keyConcepts: [
            { title: "Lost Childhood", explanation: \"You didn't get to be carefree, playful, or irresponsible. You learned to perform competence before you felt it.\" },
            { title: "Giving vs. Receiving", explanation: \"You know how to give. Receiving feels uncomfortable, maybe even wrong. That's the parentification talking.\" },
            { title: "The Exhaustion", explanation: \"The exhaustion you feel isn't normal tiredness. It"s decades of carrying weight that was never yours to carry." },
          ],
          reflectionPrompt: 'What did you miss out on because you were busy being the adult?',
        },
        senior: {
          introduction: "A lifetime of being 'the responsible one' can leave you depleted and uncertain how to receive care. Understanding parentification can explain patterns of exhaustion and over-giving.",
          keyConcepts: [
            { title: 'Lifetime Role", explanation: \"If you've always been the caretaker, it can feel like identity. But it was a role you were drafted into, not who you are.\" },
            { title: "Learning to Receive", explanation: \"Even now, learning to receive care is possible. It might feel strange, but it's what you deserved all along.\" },
            { title: "Rest", explanation: \"After decades of carrying others, rest isn't selfish. It"s necessary." },
          ],
          reflectionPrompt: 'What would it mean to let yourself be taken care of?',
        },
      },
    },
    {
      id: 'origins-mom-conditional',
      title: "When Mom's Love Had Conditions",
      emoji: '🎭',
      linkedActivity: 'thought-challenger",
      deepDive: `Conditional love teaches children that love must be earned. Get good grades, and I'm proud. Succeed, and I"ll show you off. Differ from what I wanted—and the warmth disappears. Children raised this way often become overachievers who never feel enough.`,
      realWorld: [
        'Feeling like you have to earn affection',
        'Never feeling "enough" despite achievements',
        'Waiting for people to discover you\'re not good enough',
        'Rest feeling dangerous',
      ],
      tryThis: 'Do something enjoyable that produces nothing. See what it feels like to not be achieving.',
      connectsTo: ['attachment-101', 'reparenting', 'boundaries"],
      content: {
        teen: {
          introduction: \"If your mom only seems proud when you achieve, and distant when you don't, you"re learning that love has to be earned. That's not how it should work.",
          keyConcepts: [
            { title: 'Conditional", explanation: \"Love with conditions means you have to DO something to get it. But real love isn't a reward—it"s a given." },
            { title: 'The Critic Inside', explanation: "When a parent's love has conditions, that critical voice becomes your own inner voice." },
            { title: 'Worth ≠ Achievement", explanation: \"You're valuable because you exist. Not because of grades, sports, or anything you produce.\" },
          ],
          reflectionPrompt: "When do you feel most loved? Is it connected to achieving something?',
        },
        adult: {
          introduction: "If you were raised on conditional love, you probably became an achiever—and you probably never feel like enough. The inner critic driving you? It often sounds like mom.",
          keyConcepts: [
            { title: 'Love as Transaction', explanation: "Conditional love teaches that you are what you achieve. Your worth is always in flux, always up for evaluation." },
            { title: 'The Exhausting Chase', explanation: "Achievement brings brief relief, not lasting satisfaction. The goalpost always moves." },
            { title: 'Inherent Worth', explanation: "You are worthy of love because you exist. Not because of what you produce. This might take years to believe." },
          ],
          reflectionPrompt: 'What do you believe you have to DO to be worthy of love?",
        },
        senior: {
          introduction: \"A lifetime of conditional love can leave you still chasing approval, still wondering if you're enough. Understanding this pattern can bring relief—and permission to finally rest.\",
          keyConcepts: [
            { title: "Decades of Striving", explanation: \"If you've spent your life achieving to earn love, that exhaustion makes sense. It was never winnable.\" },
            { title: "Enough", explanation: \"You've done enough. You ARE enough. This might be hard to hear after a lifetime of striving.\" },
            { title: "Rest", explanation: \"Rest isn't earned. It"s needed. Giving yourself permission to rest is part of healing." },
          ],
          reflectionPrompt: 'What would it mean to believe you\'ve done enough?',
        },
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// MODULE 4: HEALING & GROWING
// ═══════════════════════════════════════════════════════════════

const originsModule4: ManualModule = {
  id: 'origins-healing',
  title: 'Healing & Growing',
  emoji: '🌱',
  lessons: [
    {
      id: 'origins-reparenting',
      title: 'Reparenting Yourself',
      emoji: '🌱',
      linkedActivity: 'self-care",
      deepDive: `You can't go back and get the childhood you needed. But you can become the parent you needed. Reparenting means intentionally giving yourself what your parents couldn"t: validation, consistency, acceptance, safety, attention. It"s not pretending—it's recognizing that you, as an adult, can now provide what child-you needed.`,
      realWorld: [
        "Talking to yourself like a loving parent would',
        'Meeting your basic needs without having to earn it',
        'Celebrating your wins instead of dismissing them',
        'Giving yourself permission to rest',
      ],
      tryThis: 'Tonight before bed, say something to yourself that you needed to hear as a child.',
      connectsTo: ['not-broken', 'boundaries', 'breaking-cycle"],
      content: {
        teen: {
          introduction: \"You can start being kind to yourself now—even if your parents aren't. Reparenting means treating yourself the way you deserved to be treated.\",
          keyConcepts: [
            { title: "Self-Kindness', explanation: "The voice in your head can be critical or kind. You can start practicing the kind one." },
            { title: 'Basic Needs", explanation: \"Making sure you eat, sleep, and rest isn't earned. It"s what you deserve." },
            { title: 'Start Small", explanation: \"You don't need to transform overnight. Start with one kind thing you say to yourself each day.\" },
          ],
          reflectionPrompt: "What does the critical voice in your head sound like? Whose voice is it?",
        },
        adult: {
          introduction: \"Reparenting isn't weird inner-child stuff. It"s practical: intentionally giving yourself what you didn't get. Validation, consistency, acceptance, safety.",
          keyConcepts: [
            { title: 'You Can Now", explanation: \"As an adult, you have the capacity to provide what your parents couldn't. Not perfectly—but enough.\" },
            { title: "New Inner Voice", explanation: \"When you're struggling, instead of "Get over it,' try "This is hard. It makes sense you're struggling."" },
            { title: 'Daily Practice', explanation: "Morning check-ins, celebrating wins, speaking kindly to yourself. It adds up over time." },
          ],
          reflectionPrompt: 'What does child-you most need to hear? Can you say it now?",
        },
        senior: {
          introduction: \"It's never too late to treat yourself with the kindness you deserved all along. Reparenting at any age can bring peace and healing.\",
          keyConcepts: [
            { title: "Never Too Late', explanation: "Even after decades of the same inner critic, you can start building a kinder voice." },
            { title: 'Deserved All Along", explanation: \"The care you give yourself now isn't compensation—it"s what you deserved from the beginning." },
            { title: 'Modeling', explanation: "How you treat yourself is visible to younger generations. Self-kindness is a legacy." },
          ],
          reflectionPrompt: 'What would it feel like to treat yourself with consistent kindness?',
        },
      },
    },
    {
      id: 'origins-boundaries',
      title: 'Boundaries With Family',
      emoji: '🚧',
      linkedActivity: 'role-play",
      deepDive: `You are allowed to have boundaries with your family. You are allowed to limit contact. You are allowed to protect yourself from people who hurt you, even if you share DNA. Boundaries aren't walls or punishment—they"re information about what you will and won"t accept. Guilt is not proof you're doing something wrong.`,
      realWorld: [
        ""I\'m not going to discuss my weight with you."',
        '"I need to leave when you start drinking."',
        '"I\'m taking a break from our relationship right now."',
        'Not answering calls after 10pm.',
      ],
      tryThis: 'Identify one boundary you need. Write it down. Practice saying it out loud.',
      connectsTo: ['reparenting', 'breaking-cycle', 'mom-enmeshment"],
      ageAdaptive: {
        teen: \"If you're still living at home, "boundaries" might mean small things—like not engaging with certain topics. You can't fully set boundaries when you depend on someone, but you can start noticing what you"ll do differently later.",
      },
      content: {
        teen: {
          introduction: "When you depend on your parents, boundaries are hard. But you can start noticing what you need, even if you can't enforce it yet.",
          keyConcepts: [
            { title: 'Boundaries Later', explanation: "You might not be able to set boundaries now. But you can start knowing what they\'ll be when you can." },
            { title: 'Small Steps', explanation: "Maybe you can choose not to engage with certain topics. Or spend more time with friends." },
            { title: 'Guilt", explanation: \"Feeling guilty about wanting space doesn't mean you"re wrong. It might just mean you're not used to prioritizing yourself." },
          ],
          reflectionPrompt: 'What boundary would you set if you could?",
        },
        adult: {
          introduction: \"You are allowed to have boundaries with family. You are allowed to limit contact. Guilt is not proof you're doing something wrong—it"s often just discomfort with change.",
          keyConcepts: [
            { title: 'What Boundaries Are", explanation: \"Boundaries aren't punishment. They"re information about what you will and won"t accept. They're about YOU, not controlling them.\" },
            { title: "Scripts', explanation: ""I understand you don't like this. I"m keeping it anyway.' "I'm sorry you feel that way." Full stop. No justifying." },
            { title: 'Guilt is Lying", explanation: \"Guilt often means you're breaking old patterns, not that you"re wrong. Feeling bad isn't evidence." },
          ],
          reflectionPrompt: 'What boundary do you need that you haven\'t set?',
        },
        senior: {
          introduction: "Even late in life, you can set boundaries with family. It might be about caregiving, visits, or topics of conversation. You still get to protect yourself.",
          keyConcepts: [
            { title: 'It\'s Not Too Late', explanation: "Boundaries at 70 are just as valid as boundaries at 30. You deserve peace at every age." },
            { title: 'Complex Situations', explanation: "Aging parents, inheritance, caregiving—boundaries get complicated. But your wellbeing still matters." },
            { title: 'Modeling", explanation: \"Setting boundaries shows younger generations it's possible. That"s a powerful lesson." },
          ],
          reflectionPrompt: 'What boundary would bring you more peace?',
        },
      },
    },
    {
      id: 'origins-breaking-cycle',
      title: 'Breaking The Cycle',
      emoji: '🔓',
      linkedActivity: 'journal",
      deepDive: `Here's the fear: \"What if I become like them?\" Here"s the truth: Awareness changes everything. Generational patterns repeat when they"re unconscious. You can see them now. That alone breaks the cycle. Every pause, every different choice, every moment of awareness—it adds up. The cycle didn't start with you, but it can slow down with you.`,
      realWorld: [
        "Catching yourself sounding like your parent—and choosing differently',
        'Knowing your triggers so they don\'t control you',
        'Asking for help when they suffered alone',
        'Feeling a feeling instead of numbing it',
      ],
      tryThis: 'Identify one pattern you don\'t want to repeat. Notice when it shows up this week. Just notice.',
      connectsTo: ['not-broken', 'parents-children', 'reparenting"],
      content: {
        teen: {
          introduction: \"You might be scared of becoming like your parents. Here's the truth: being aware of the pattern is already breaking it.\",
          keyConcepts: [
            { title: "Awareness Breaks It', explanation: "Patterns repeat when no one sees them. You see yours. That changes everything." },
            { title: 'Not Destiny", explanation: \"You are not destined to repeat what they did. You have awareness they didn't have.\" },
            { title: "Start Now", explanation: \"Every time you notice a pattern—even if you can't change it yet—you"re weakening it." },
          ],
          reflectionPrompt: 'What pattern from your parents do you NOT want to repeat?",
        },
        adult: {
          introduction: \"The fear that you'll become your parents is common. The truth is: awareness alone breaks generational cycles. You"re already doing it differently.",
          keyConcepts: [
            { title: 'Unconscious → Conscious', explanation: "Patterns repeat when unconscious. Once you see them, you have a choice. Your parents may not have had that." },
            { title: 'Different Choices", explanation: \"Every time you pause instead of react, ask for help instead of suffer alone, feel instead of numb—you're breaking the pattern.\" },
            { title: "Ripple Effect", explanation: \"Your healing isn't just for you. It affects everyone in your life and everyone who comes after.\" },
          ],
          reflectionPrompt: "What\'s one way you\'ve already broken a family pattern?",
        },
        senior: {
          introduction: \"Looking back, you can see which patterns you repeated and which you broke. That clarity is valuable—and it's never too late to continue the work.\",
          keyConcepts: [
            { title: "What Broke", explanation: \"You've already broken some patterns. Some continued. Understanding both brings peace.\" },
            { title: "Legacy', explanation: "Your awareness and healing can be a gift to children, grandchildren, and others in your life." },
            { title: 'Continuing', explanation: "Even now, you can make different choices. The cycle can keep slowing down." },
          ],
          reflectionPrompt: 'What pattern did you break? What wisdom can you share from that experience?',
        },
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// EXPORT SECTION
// ═══════════════════════════════════════════════════════════════

export const MANUAL_SECTION_8: ManualSection = {
  id: 'origins',
  title: 'Understanding Your Origins',
  subtitle: 'Family, attachment & healing',
  emoji: '🌳',
  color: '#8B5CF6',  // Purple - matches Connection gauge
  modules: [
    originsModule1,
    originsModule2,
    originsModule3,
    originsModule4,
  ],
};

export default MANUAL_SECTION_8;
