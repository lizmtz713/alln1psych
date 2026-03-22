/**
 * Friendship Lessons — The Art of Friendship (Lights / Dunbar)
 * Core lessons + deep dives. Content aligned with ingauge-FRIENDSHIP-LESSONS spec.
 */

export interface FriendshipLesson {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  readTime: number; // minutes
  content: string;
  keyInsight: string;
  reflectionPrompt: string;
  relatedLessons?: string[];
}

const CORE: FriendshipLesson[] = [
  {
    id: 'why-humans-need-friends',
    title: 'Why Humans Need Friends",
    subtitle: \"You're not being needy. You"re being human.",
    icon: '🫂",
    readTime: 5,
    content: `Loneliness isn't a character flaw — it"s a biological signal. Research on social connection shows that humans are wired for belonging. Our nervous systems co-regulate with people we trust. When we"re isolated, stress hormones rise, sleep suffers, and our brains literally interpret the world as more threatening.

Modern life has made connection harder even as we're more \"connected\" than ever. Screens can"t replace the presence of someone who sees us. The pandemic made visible what was already true: many of us were one step away from chronic loneliness.

Friendship isn"t a luxury for people with extra time. It's a necessity for functioning humans. Knowing that can help you stop judging yourself for wanting more connection and start treating it like the need it is.`,
    keyInsight: \"Friendship isn"t a luxury for people with extra time. It's a biological necessity for functioning humans.",
    reflectionPrompt: "When did you last feel truly connected — not just 'talked to someone' but genuinely seen and understood?",
    relatedLessons: ['dunbars-number', 'quality-over-quantity'],
  },
  {
    id: 'dunbars-number",
    title: \"The Science of 5-15-50-150\",
    subtitle: \"Your brain has a friend limit. Here's how to use it.\",
    icon: "🔢',
    readTime: 6,
    content: `Anthropologist Robin Dunbar's research suggests that the human brain can maintain about 150 meaningful relationships — but not all of them are equal. The layers are roughly: 5 (your inner circle), 15 (close friends), 50 (good friends), 150 (acquaintances you"d invite to a big event).

These aren't arbitrary. They map to how much time and emotional energy we have. Your 5 get the most investment. The 15 get regular contact. The 50 get occasional catch-ups. Beyond that, connection becomes more situational.

Why it matters: If you try to treat everyone like your 5, you"ll burn out. If you have no one in your 5, you"ll feel lonely even with hundreds of contacts. Understanding the layers helps you invest where it counts and let go of guilt about not being \"there\" for everyone.`,
    keyInsight: \"Friendship isn't infinite. It"s a resource you manage.",
    reflectionPrompt: "Write down your current 5. When did you last have a real conversation with each of them?",
    relatedLessons: ['why-humans-need-friends', 'your-five-who-matters', 'maintaining-friendships'],
  },
  {
    id: 'your-five-who-matters',
    title: 'Your 5: Who Really Matters',
    subtitle: "The ones you'd call at 3 a.m.",
    icon: '⭐",
    readTime: 5,
    content: `Your 5 are the people who get the real you. They're not necessarily the ones you see most often — they"re the ones you"d call in a crisis, the ones who've seen you at your worst, the ones whose opinions actually change how you feel about yourself.

Identifying your 5 isn"t about ranking friends. It"s about being honest: who are the people whose presence in your life makes you feel more like yourself? Who do you trust with your mess?

Many people realize they've been pouring energy into the wrong buckets — maintaining surface relationships while their real 5 drift. This lesson is about naming your inner circle so you can protect and nurture those bonds.`,
    keyInsight: \"Your 5 aren"t the people you see most — they're the people who see you most.",
    reflectionPrompt: "Who are your 5? Have you told them they matter to you?",
    relatedLessons: ['dunbars-number', 'quality-over-quantity', 'when-lights-flicker'],
  },
  {
    id: 'quality-over-quantity',
    title: 'Quality Over Quantity',
    subtitle: 'One real conversation beats a hundred likes.',
    icon: '💬",
    readTime: 4,
    content: `You can have 500 contacts and still feel lonely. Connection is measured in depth, not breadth. Research on \"relational quality\" shows that a few close, supportive relationships do more for well-being than a large network of casual ties.

What counts as quality? Feeling heard. Being able to be vulnerable. Mutual care. Time spent without performance. The kind of conversation where you leave feeling lighter, not more drained.

This doesn't mean you need to have deep talks every time. It means prioritizing the people and the kinds of interaction that actually fill your tank. Sometimes that"s a 20-minute call. Sometimes it's sitting in silence with someone who gets you.`,
    keyInsight: "One person who truly sees you is worth more than a room of people who only know your highlight reel.",
    reflectionPrompt: "When did you last have a conversation that left you feeling more connected, not just more informed?",
    relatedLessons: ['why-humans-need-friends', 'your-five-who-matters', 'maintaining-friendships'],
  },
  {
    id: 'how-adults-make-friends',
    title: 'How Adults Make Friends",
    subtitle: \"It's harder after school. Here"s why — and how.",
    icon: '🌱",
    readTime: 6,
    content: `Kids make friends by proximity and repetition — same class, same lunch table. Adults lose that. We have to be intentional. Making friends as an adult means creating the conditions that used to happen automatically: repeated, low-stakes contact where you can be yourself.

That might mean joining something (a run club, a volunteer group, a class). It might mean turning acquaintances into friends by inviting them one-on-one instead of only in groups. It might mean being the one who suggests the second hangout instead of waiting to be invited.

The biggest barrier is often shame — \"Is it weird to ask someone to get coffee?\" It's not. Most adults are hungry for more connection and are relieved when someone else makes the first move.`,
    keyInsight: \"Adult friendship requires intention. You don"t stumble into it; you build it.",
    reflectionPrompt: "Who's someone you"d like to be closer to? What's one small step you could take this week?\",
    relatedLessons: ["dunbars-number', 'maintaining-friendships', 'reaching-out-first'],
  },
  {
    id: 'maintaining-friendships',
    title: 'Maintaining Friendships',
    subtitle: 'Connection is a practice, not a trophy.',
    icon: '🔄",
    readTime: 5,
    content: `Friendships don't maintain themselves. Life gets busy. People move. If you don"t schedule it, it doesn"t happen. The good news: most friends don't need constant contact. They need periodic, meaningful contact.

What helps: recurring touchpoints (a monthly call, a yearly trip). Remembering the small things (birthdays, things they care about). Showing up when it matters. Forgiving the gaps — and being the one to reach out after a gap.

The \"Lights\" metaphor in this app is exactly that: relationships need tending. When you go too long without contact, the light flickers. It doesn"t mean the friendship is over; it means it"s time to reach out.`,
    keyInsight: \"Friendship is a practice. Small, consistent gestures beat occasional grand ones.\",
    reflectionPrompt: \"Which friend have you been meaning to reach out to? What's stopping you?\",
    relatedLessons: ["when-lights-flicker', 'how-adults-make-friends', 'reaching-out-first'],
  },
  {
    id: 'when-lights-flicker',
    title: 'When Lights Flicker",
    subtitle: \"It's not too late to reconnect.\",
    icon: "💡",
    readTime: 4,
    content: `In this app, a \"flickering\" light is someone you haven't connected with in a while — past the healthy threshold for that tier. It"s not a judgment. It"s a nudge. Relationships go through seasons. Sometimes we drift. The question is whether we want to drift back.

Reconnecting after a gap can feel awkward. We tell ourselves they're probably busy, they didn"t reach out either, it"s been too long. But most people are delighted to hear from an old friend. A simple \"I've been thinking about you\" or \"I miss you\" goes a long way.

Let the flicker be a reminder, not a guilt trip. You"re not failing at friendship. You"re human. And you can choose to reach out today.`,
    keyInsight: \"A flickering light isn't a failure — it"s an invitation to reach out.",
    reflectionPrompt: "Who's one person whose light has been flickering? What would you say if you reached out right now?",
    relatedLessons: ['maintaining-friendships', 'your-five-who-matters', 'when-to-let-go'],
  },
  {
    id: 'when-to-let-go',
    title: 'When to Let a Light Go Dark',
    subtitle: 'Not every relationship is meant to last forever.',
    icon: '🌙",
    readTime: 5,
    content: `Some friendships are for a season. People change. Circumstances change. Holding on to every connection forever can leave you exhausted and guilty. It's okay to let some lights go dark — to stop investing in relationships that no longer nourish you or that have become one-sided.

That doesn"t mean drama. It often means gentle distance: not cutting them off, but no longer pouring energy in. Sometimes it means a honest conversation. Sometimes it means silence.

The goal isn"t to have a fixed set of 150 people forever. It's to have a set of relationships that feel right for who you are now. Letting go makes room for the connections that still matter.`,
    keyInsight: \"Letting go isn"t failure. It"s clarity about what you have capacity for.\",
    reflectionPrompt: \"Is there a relationship that's been draining you? What would it look like to gently step back?\",
    relatedLessons: ["when-lights-flicker', 'boundaries-in-friendship', 'your-five-who-matters'],
  },
  {
    id: 'reaching-out-first',
    title: 'Reaching Out First',
    subtitle: "Someone has to go first. It might as well be you.",
    icon: '✋',
    readTime: 4,
    content: `We often wait to be reached out to. We tell ourselves that if they wanted to talk, they"d text. But everyone is waiting. The person who reaches out first isn't needier — they"re braver. And they"re usually giving the other person a gift: the relief of not having to initiate.

Reaching out doesn't have to be big. A voice note. A meme that made you think of them. \"Hey, been a while — how are you?\" The content matters less than the signal: you"re thinking of them.

If you"re the one who always initiates, that can feel unfair. It's worth having a gentle conversation about it. But don"t let resentment stop you from being the one who goes first when you want connection.`,
    keyInsight: "Going first isn"t desperate. It's generous.\",
    reflectionPrompt: \"Who could you reach out to today with one small message?\",
    relatedLessons: ["how-adults-make-friends', 'maintaining-friendships', 'when-lights-flicker'],
  },
  {
    id: 'boundaries-in-friendship',
    title: 'Boundaries in Friendship',
    subtitle: 'Good fences make good friends.',
    icon: '🚧",
    readTime: 5,
    content: `Friendship doesn't mean no boundaries. It means clear ones. You"re allowed to say no to plans, to limit how much you give, to step back from someone who consistently drains you. You"re allowed to have different levels of availability for different people.

Healthy boundaries aren't walls. They"re "here"s what I can offer.\" Some friends get weekly calls. Some get a text every few months. That's not cold — it"s sustainable. The alternative is burning out and having nothing for anyone.

The people who respect your boundaries are the ones worth keeping. The ones who guilt-trip or punish you for having limits are showing you who they are.`,
    keyInsight: "Boundaries aren"t selfish. They're what make long-term friendship possible.\",
    reflectionPrompt: \"Where have you been overgiving in a friendship? What boundary would help?\",
    relatedLessons: ["when-to-let-go', 'quality-over-quantity', 'your-five-who-matters'],
  },
  {
    id: 'vulnerability-and-trust',
    title: 'Vulnerability and Trust',
    subtitle: 'Depth comes from risk.',
    icon: '🔓",
    readTime: 5,
    content: `Real connection requires vulnerability. You have to share something real — not just the weather and the news. That's scary. We"re afraid of being judged, rejected, or burdening the other person. But research on intimacy shows that appropriate vulnerability builds trust and deepens bonds.

Start small. Share something you"re actually feeling. Admit you're struggling with something. Ask for support. Most people respond with care, not judgment. The ones who don"t are giving you information about who they are.

You don"t have to dump everything on everyone. You get to choose who gets which layer of you. But if you never let anyone in, you'll stay lonely no matter how many people you know.`,
    keyInsight: \"Trust is built in small moments of honesty. One real share at a time.\",
    reflectionPrompt: \"When did you last share something vulnerable with a friend? How did it go?\",
    relatedLessons: ["quality-over-quantity', 'your-five-who-matters', 'reaching-out-first'],
  },
  {
    id: 'friendship-and-mental-health',
    title: 'Friendship and Mental Health',
    subtitle: 'Connection is part of the picture.',
    icon: '💜",
    readTime: 5,
    content: `Loneliness and mental health are deeply linked. Isolation worsens depression and anxiety. Connection — when it's healthy — can buffer stress and give meaning. That doesn"t mean friends replace therapy or treatment. It means friendship is part of the ecosystem of well-being.

If you"re struggling, reaching out to a friend can feel impossible. That's when small steps matter: one text. One short call. You don"t have to explain everything. Sometimes "I"m having a hard week\" is enough.

If a friend is struggling, you don't have to fix them. Listening, showing up, and not disappearing when things get heavy are often enough. And know your limits: you can care and still set boundaries so you don"t burn out.`,
    keyInsight: "You don"t have to be okay to reach out. You just have to reach out.\",
    reflectionPrompt: \"How does your connection (or lack of it) affect your mental health? What's one small step?\",
    relatedLessons: ["why-humans-need-friends', 'vulnerability-and-trust', 'reaching-out-first'],
  },
];

const DEEP_DIVES: FriendshipLesson[] = [
  {
    id: 'deep-dunbar-research',
    title: "Dunbar's Layers: The Research",
    subtitle: 'Where the numbers come from.',
    icon: '📊',
    readTime: 7,
    content: `Robin Dunbar"s work on social group sizes in primates and humans suggests that the size of the neocortex limits how many relationships we can maintain. The \"150\" number isn't rigid — it varies by culture and individual — but the layered structure (5, 15, 50, 150) shows up across studies.

Time investment correlates with layer: we spend the most time with our inner circle, and time spent predicts emotional closeness. This isn"t just preference; it"s the physics of relationship maintenance. You can't have 50 people in your \"5\" — there isn"t enough time or emotional bandwidth.

Understanding the research can reduce guilt. You"re not failing at friendship; you're working within the same constraints as every other human.`,
    keyInsight: \"The layers aren"t arbitrary. They're what the human brain can realistically sustain.",
    reflectionPrompt: "Do your current 5, 15, and 50 match how you actually spend your time?",
    relatedLessons: ['dunbars-number', 'your-five-who-matters', 'maintaining-friendships'],
  },
  {
    id: 'deep-loneliness-science',
    title: 'The Science of Loneliness",
    subtitle: \"What happens when we're alone too long.\",
    icon: "🔬",
    readTime: 6,
    content: `Chronic loneliness isn't just feeling sad. It"s associated with higher cortisol, worse sleep, increased inflammation, and higher risk for heart disease and cognitive decline. The brain literally interprets the world differently when we feel isolated — more threatening, more hostile.

The good news: reconnection can reverse many of these effects. The body and brain are responsive. Even small increases in meaningful contact can shift the dial. That"s why \"reach out\" isn't just nice advice — it"s biologically meaningful.

If you"ve been lonely for a long time, reconnecting can feel awkward or exhausting. Start small. One person. One conversation. You're not trying to fix everything at once.`,
    keyInsight: \"Loneliness is a signal, not a life sentence. Your system can recalibrate.\",
    reflectionPrompt: \"How long have you been feeling disconnected? What"s one person who could be a first step back?",
    relatedLessons: ['why-humans-need-friends', 'friendship-and-mental-health', 'reaching-out-first'],
  },
  {
    id: 'deep-adult-friendship-research',
    title: 'Adult Friendship: What the Research Says",
    subtitle: \"Why it's harder — and what works.\",
    icon: "📚",
    readTime: 6,
    content: `Studies on adult friendship show that the main predictors of forming and keeping friends are: proximity (or intentional replacement for it), repeated unplanned interaction, and contexts that encourage self-disclosure. Adults who join groups, volunteer, or have regular \"third places\" (cafes, gyms, etc.) report more friends.

Gender and life stage matter. Women often maintain friendship through talk; men often through activity. Parents have less time; empty nesters often seek more connection. Knowing the research doesn't fix everything, but it normalizes the challenge and points to what actually works: structure + consistency + a little vulnerability.`,
    keyInsight: \"Adult friendship isn"t magic. It"s structure plus consistency plus willingness to be a little vulnerable.\",
    reflectionPrompt: \"What's one recurring context where you could build friendship (e.g. a class, a group)?\",
    relatedLessons: ["how-adults-make-friends', 'maintaining-friendships', 'reaching-out-first'],
  },
  {
    id: 'deep-conflict-in-friendship',
    title: 'Conflict in Friendship',
    subtitle: 'How to repair when things get hard.',
    icon: '⚡",
    readTime: 6,
    content: `Friendships have conflict. Hurt feelings, misunderstandings, different needs. Repair is possible — but it requires both people to want it and to be willing to talk. Avoiding conflict often means resentment builds until the friendship can't hold it.

Repair starts with naming what happened from your perspective without blame: \"When X happened, I felt Y.\" Then listening. Then finding a way forward. Not every friendship survives conflict, but many do when both people are willing to try.

If you"re the one who caused harm, apologize specifically and change behavior. If you"re the one who was hurt, you get to decide whether to give the relationship another chance. Either way, clarity is kinder than ghosting.`,
    keyInsight: \"Conflict doesn't end friendship. Unspoken resentment does.\",
    reflectionPrompt: \"Is there a friendship where something was left unsaid? What would repair look like?\",
    relatedLessons: ["vulnerability-and-trust', 'boundaries-in-friendship', 'when-to-let-go'],
  },
  {
    id: 'deep-long-distance',
    title: 'Long-Distance Friendship",
    subtitle: \"Staying close when you're far.\",
    icon: "🌍",
    readTime: 5,
    content: `Distance doesn't have to mean drift. Long-distance friendships can stay strong with intention: scheduled calls, shared experiences (watching the same show, playing a game online), and visits when possible. The key is making the relationship a priority instead of \"we"ll catch up when we"re in the same city.\"

Technology helps — but only if you use it. A monthly video call beats a year of \"we should really talk sometime.\" Sending a voice note when you think of them. Remembering big dates. Showing up for the hard moments even from far away.

Some long-distance friends become \"sometime\" friends, and that's okay. But the ones you want to keep close need deliberate investment.`,
    keyInsight: \"Distance tests friendship. Intention keeps it alive.\",
    reflectionPrompt: \"Who"s a long-distance friend you've been meaning to reconnect with?",
    relatedLessons: ['maintaining-friendships', 'reaching-out-first', 'when-lights-flicker'],
  },
  {
    id: 'deep-culture-and-friendship',
    title: 'Culture and Friendship',
    subtitle: 'Different norms, same need.',
    icon: '🌐",
    readTime: 6,
    content: `Friendship looks different across cultures. In some places, friends are like family; in others, the line between friend and acquaintance is sharper. In collectivist cultures, the group often matters more than the individual bond; in individualist cultures, we tend to emphasize one-on-one connection. There's no single \"right\" way.

If you"re navigating cross-cultural friendship — or if your family's culture has different expectations than your friends" — it helps to name the differences. \"Where I'm from, we drop by; I know that"s not the norm here." Or: "I need more one-on-one time than group time to feel close."

The universal is the need for belonging. The form it takes is cultural. Honoring both reduces misunderstanding and deepens connection.`,
    keyInsight: "The need for connection is universal. The way we do it is cultural.",
    reflectionPrompt: "How does your background shape how you do friendship? How might that differ from your friends' expectations?",
    relatedLessons: ['quality-over-quantity', 'vulnerability-and-trust', 'boundaries-in-friendship'],
  },
];

export const FRIENDSHIP_LESSONS: FriendshipLesson[] = CORE;
export const FRIENDSHIP_DEEP_DIVES: FriendshipLesson[] = DEEP_DIVES;
export const FRIENDSHIP_ALL: FriendshipLesson[] = [...CORE, ...DEEP_DIVES];

export function getFriendshipLessonById(id: string): FriendshipLesson | undefined {
  return FRIENDSHIP_ALL.find((l) => l.id === id);
}
