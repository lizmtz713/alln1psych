/**
 * Tool intro copy — orient before act.
 * Every tool: human situation → normalization → what it helps you do → Start.
 * Optional: "Why this helps" for credibility.
 */

export interface ToolIntroContent {
  /** Tool display name */
  title: string;
  /** Emoji or icon name for header */
  icon: string;
  /** Human situation: what's happening psychologically (1–2 sentences) */
  humanSituation: string;
  /** What this tool helps you do (paragraph or bullets) */
  whatItHelps: string;
  /** Optional research/credibility line */
  whyThisHelps?: string;
}

const CONTENT: Record<string, ToolIntroContent> = {
  decode: {
    title: 'Decode',
    icon: '🔍',
    humanSituation: 'Sometimes messages feel confusing or loaded with meaning. Tone, context, and intention can be hard to read through text or short conversations.',
    whatItHelps: 'This tool helps you slow down, examine what was said, and explore what the other person might have meant before reacting.',
    whyThisHelps: 'Research shows that pausing to consider intent reduces emotional reactivity and improves response quality.',
  },
  resolve: {
    title: 'Resolve',
    icon: '🤝',
    humanSituation: 'Sometimes one part of you wants something while another part wants the opposite. That doesn’t mean something is wrong — it means different needs inside you are trying to be heard.',
    whatItHelps: 'This tool helps you identify those parts and find a path that respects both.',
    whyThisHelps: 'Internal Family Systems research shows that naming and honoring conflicting parts reduces inner conflict and supports integration.',
  },
  'role-play': {
    title: 'Role Play',
    icon: '🎭',
    humanSituation: 'Some conversations feel intimidating or high-stakes. Practicing what you want to say can help you express yourself clearly when the moment comes.',
    whatItHelps: 'This tool lets you simulate the conversation so you can explore different responses and feel more prepared.',
    whyThisHelps: 'Behavioral rehearsal is a core technique in CBT and communication training; it reduces anxiety and improves clarity.',
  },
  referee: {
    title: 'Referee',
    icon: '⚖️',
    humanSituation: 'When conflict happens, each person often believes their perspective is the correct one. But most disagreements come from different interpretations of the same event.',
    whatItHelps: 'This tool helps you step back, examine both sides, and reach a more balanced view.',
    whyThisHelps: 'Seeing multiple perspectives reduces defensiveness and supports fair, constructive outcomes.',
  },
  replay: {
    title: 'Replay',
    icon: '🔄',
    humanSituation: 'After difficult moments, our minds replay the situation again and again. We wonder what we said, what they meant, or what we could have done differently.',
    whatItHelps: 'This tool helps you walk through the moment calmly so you can understand it more clearly.',
    whyThisHelps: 'Structured reflection helps process events instead of ruminating, which can reduce anxiety and improve closure.',
  },
  relate: {
    title: 'Relate',
    icon: '💬',
    humanSituation: 'People often behave in ways that seem confusing, frustrating, or unexpected. But their actions usually make sense from their perspective.',
    whatItHelps: 'This tool helps you step into their point of view and understand what might be driving their behavior.',
    whyThisHelps: 'Perspective-taking is linked to empathy, reduced conflict, and better relationship satisfaction.',
  },
  'prompt-generator': {
    title: 'Prompts',
    icon: '✨',
    humanSituation: 'Sometimes the hardest part of thinking clearly is knowing where to start. A good question can unlock insight that’s hard to reach on your own.',
    whatItHelps: 'This tool gives you thoughtful prompts to help you explore your thoughts and experiences.',
  },
  love: {
    title: 'Love',
    icon: '❤️',
    humanSituation: 'Love isn’t just a feeling — it’s a series of choices and actions. Relationships grow stronger when people feel seen, valued, and understood.',
    whatItHelps: 'This tool helps you reflect on ways to express care and deepen connection.',
  },
  'help-someone': {
    title: 'Help',
    icon: '🆘',
    humanSituation: 'Everyone experiences moments when things feel overwhelming. You don’t have to handle everything alone.',
    whatItHelps: 'This tool helps you pause, organize your thoughts, and find the right kind of support.',
  },
  attraction: {
    title: 'Attraction',
    icon: '💫',
    humanSituation: 'Attraction can feel mysterious and powerful. Sometimes we’re drawn to people because they excite us, feel familiar, or reflect something we’re seeking.',
    whatItHelps: 'This tool helps you explore what might be driving that attraction.',
  },
  'attachment-style': {
    title: 'Attachment',
    icon: '🌳',
    humanSituation: 'The way we connect with others often follows patterns formed earlier in life. These patterns can shape how we trust, communicate, and react in relationships.',
    whatItHelps: 'This tool helps you explore your attachment style and what it might mean.',
  },
  boundaries: {
    title: 'Boundaries',
    icon: '🚧',
    humanSituation: 'Healthy relationships require clear limits. But many people struggle to say no or express what they need.',
    whatItHelps: 'This tool helps you identify your boundaries and communicate them with clarity and respect.',
    whyThisHelps: 'Boundary-setting is associated with better mental health and relationship quality (Tawwab, Cloud & Townsend).',
  },
  'difficult-people': {
    title: 'Difficult People',
    icon: '👤',
    humanSituation: 'Some people trigger strong emotional reactions in us. They may be controlling, dismissive, unpredictable, or difficult to understand.',
    whatItHelps: 'This tool helps you recognize patterns and respond in ways that protect your well-being.',
  },
  'red-green-flags': {
    title: 'Flags',
    icon: '🚩',
    humanSituation: 'Not every behavior is healthy in a relationship. Sometimes subtle signals appear before larger problems develop.',
    whatItHelps: 'This tool helps you identify potential red flags so you can respond thoughtfully.',
  },
  'critical-thinking': {
    title: 'Think',
    icon: '🧠',
    humanSituation: 'When emotions run high, thinking clearly becomes harder. Slowing down and organizing your thoughts can reveal solutions you couldn’t see before.',
    whatItHelps: 'This tool helps you step back and think through a situation carefully.',
  },
  'foundation-body': {
    title: 'Body',
    icon: '🫀',
    humanSituation: 'Your body often reacts before your mind fully understands what’s happening. Fatigue, tension, hunger, or stress can affect how you think and feel.',
    whatItHelps: 'This tool helps you check in with your physical state and understand how it might be influencing your system.',
  },
  'pre-conversation-check': {
    title: 'Pre-Check',
    icon: '✅',
    humanSituation: 'When emotions are strong, we sometimes react quickly and regret it later. Taking a moment to pause can help you respond more thoughtfully.',
    whatItHelps: 'This tool helps you check in with yourself before making a decision or sending a message.',
  },
  'reach-out-scaffold': {
    title: 'Reach Out',
    icon: '🤲',
    humanSituation: 'Relationships strengthen through small moments of connection. Sometimes a simple message or gesture can make a meaningful difference.',
    whatItHelps: 'This tool helps you find thoughtful ways to reach out.',
  },
  'share-insight': {
    title: 'Share Insight',
    icon: '💡',
    humanSituation: 'Sometimes you notice something valuable about a relationship or situation. Sharing that insight can deepen understanding and connection.',
    whatItHelps: 'This tool helps you express those thoughts clearly.',
  },
  'drift-detector': {
    title: 'Drift',
    icon: '📐',
    humanSituation: 'When life feels stuck or uncertain, it can help to loosen rigid expectations. Allowing your thoughts to wander can reveal new directions.',
    whatItHelps: 'This tool helps you explore possibilities without pressure.',
  },
  'awe-activities': {
    title: 'Awe',
    icon: '🌟',
    humanSituation: 'Moments of awe — seeing something larger than ourselves — can reset our thinking. They remind us that our current situation is only one part of a much bigger world.',
    whatItHelps: 'This tool helps you reconnect with that broader perspective.',
  },
  'crisis-resources': {
    title: 'Crisis',
    icon: '🚨',
    humanSituation: 'Some moments feel intense or overwhelming. In those times, the priority is safety, clarity, and immediate support.',
    whatItHelps: 'This tool helps you slow down and find the right next step.',
  },
  'learning-style-quiz': {
    title: 'Learning Style',
    icon: '📚',
    humanSituation: 'People absorb and process information in different ways. Understanding your learning style can help you grow more effectively.',
    whatItHelps: 'This tool helps you identify the environments and approaches where you learn best.',
  },
};

/** Get intro content by modal route name (e.g. decode, resolve, role-play, boundaries). */
export function getToolIntroContent(routeKey: string): ToolIntroContent | null {
  return CONTENT[routeKey] ?? null;
}

export { CONTENT as TOOL_INTRO_CONTENT };
