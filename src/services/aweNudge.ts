/**
 * Awe Nudge Service — Perspective-shifting interventions for low Direction
 * 
 * Based on Dacher Keltner's awe research:
 * - Awe is the emotion of perceiving vastness that requires accommodation
 * - Awe "shrinks the ego" and expands perspective
 * - Brief awe experiences can shift stuck mental states
 * - Accessible awe: nature, space, music, art, stories of human triumph
 * 
 * Philosophy:
 * - Wonder-inducing, not pushy
 * - Light touch — a suggestion, not a prescription
 * - Meets you where you are
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGaugeHistory, type GaugeSnapshot } from './crisisPipeline';

const AWE_SHOWN_KEY = 'awe_nudge_shown';
const AWE_COMPLETED_KEY = 'awe_activities_completed';
const COOLDOWN_HOURS = 24; // Don't show more than once per day

export type AweCategory = "nature' | 'space' | 'music' | 'art' | 'stories';

export interface AweActivity {
  id: string;
  title: string;
  description: string;
  category: AweCategory;
  duration?: string; // e.g., "5 min"
  emoji: string;
  /** Why this works, scientifically */
  whyItWorks: string;
  /** External link if applicable */
  externalLink?: string;
  /** Link display text */
  linkText?: string;
  /** Whether this needs a timer */
  hasTimer?: boolean;
  /** Timer duration in minutes */
  timerMinutes?: number;
  /** Whether to also offer AI-generated content option */
  hasAiOption?: boolean;
}

/**
 * Curated list of awe-inducing activities
 * Based on research showing these reliably elicit awe:
 * - Vastness (space, nature scale)
 * - Beauty (art, music)
 * - Virtue (human triumph stories)
 * - Transcendence (spiritual, philosophical)
 */
export const AWE_ACTIVITIES: AweActivity[] = [
  // Nature
  {
    id: 'awe-walk',
    title: '5-Minute Awe Walk',
    description: 'Go outside. Look up at trees or sky. Notice vastness. Walk slowly, paying attention to things that are bigger than you.',
    category: 'nature',
    duration: '5 min',
    emoji: '🌳',
    whyItWorks: 'Looking up at trees or sky triggers awe by exposing us to vastness. The slow pace allows your mind to shift out of rumination.',
    hasTimer: true,
    timerMinutes: 5,
  },
  {
    id: 'stargazing',
    title: 'Look at the Stars Tonight',
    description: 'When it gets dark, go outside and look up. Even a few minutes of stargazing can shift your perspective.',
    category: 'space',
    duration: '5-10 min',
    emoji: '✨',
    whyItWorks: 'The night sky confronts us with incomprehensible scale. This cosmic perspective naturally shrinks our daily problems.',
    externalLink: 'https://stellarium-web.org/',
    linkText: 'Explore the sky',
    hasAiOption: true,
  },
  {
    id: 'nature-timelapse',
    title: 'Watch a Nature Timelapse',
    description: 'Watch plants growing, clouds moving, or seasons changing. Search "nature timelapse" on YouTube.',
    category: 'nature',
    duration: '3-5 min',
    emoji: '🌿',
    whyItWorks: 'Timelapses reveal the hidden rhythms of nature, showing us processes that unfold on scales we usually miss.',
    externalLink: 'https://www.youtube.com/results?search_query=nature+timelapse',
    linkText: 'Find on YouTube',
  },
  
  // Space
  {
    id: 'overview-effect',
    title: 'Overview Effect Video',
    description: 'Watch Earth from space. Astronauts describe a profound shift in perspective when seeing Earth as a whole.',
    category: 'space',
    duration: '4 min',
    emoji: '🌍',
    whyItWorks: 'The "Overview Effect" is a documented cognitive shift astronauts experience. Watching Earth from space can trigger similar feelings of interconnectedness.',
    externalLink: 'https://www.youtube.com/results?search_query=overview+effect+earth+from+space',
    linkText: 'Watch on YouTube',
  },
  {
    id: 'pale-blue-dot',
    title: 'Read: Pale Blue Dot',
    description: "Carl Sagan's reflection on Earth's place in the universe. A humbling, beautiful perspective shift.",
    category: 'space',
    duration: '3 min',
    emoji: '🪐',
    whyItWorks: 'Sagan\'s words reframe our struggles against the cosmic backdrop. It\'s both humbling and oddly comforting.',
    externalLink: 'https://www.planetary.org/worlds/pale-blue-dot',
    linkText: 'Read it',
  },
  {
    id: 'deep-time',
    title: 'Explore Deep Time',
    description: 'The universe is 13.8 billion years old. Earth is 4.5 billion. Humans? 300,000 years. Feel the scale.',
    category: 'space',
    duration: '5 min',
    emoji: '⏳',
    whyItWorks: 'Contemplating deep time dislodges us from the tyranny of the present moment. Our problems become part of a much larger story.',
    externalLink: 'https://www.youtube.com/results?search_query=history+of+the+universe+timelapse',
    linkText: 'Watch on YouTube',
    /** If true, also offer AI reflection option */
    hasAiOption: true,
  },
  
  // Music
  {
    id: 'awe-music-classical',
    title: 'Listen: Awe-Inducing Music',
    description: 'Try: "Clair de Lune" by Debussy, "Spiegel im Spiegel" by Pärt, or "Experience" by Ludovico Einaudi.',
    category: 'music',
    duration: '5-8 min',
    emoji: '🎵',
    whyItWorks: 'Music can induce chills (frisson) and goosebumps — physiological markers of awe. Certain compositions reliably evoke transcendence.',
    externalLink: 'https://open.spotify.com/search/clair%20de%20lune',
    linkText: 'Find on Spotify',
  },
  {
    id: 'nature-sounds',
    title: 'Listen: Natural Vastness',
    description: 'Close your eyes. Listen to ocean waves, thunderstorms, or rainforest sounds. Let the scale wash over you.',
    category: 'music',
    duration: '5 min',
    emoji: '🌊',
    whyItWorks: 'Natural sounds evolved to signal safety or vastness. Ocean and thunder sounds trigger primal feelings of nature\'s power.',
    externalLink: 'https://www.youtube.com/results?search_query=relaxing+ocean+waves+sounds',
    linkText: 'Find on YouTube',
  },
  
  // Art
  {
    id: 'art-masterpieces',
    title: 'View: A Masterpiece',
    description: 'Spend 5 minutes looking at one painting. Really look. Try Starry Night, The Great Wave, or anything that moves you.',
    category: 'art',
    duration: '5 min',
    emoji: '🎨',
    whyItWorks: 'Slow art viewing activates different brain regions than quick scanning. Taking time allows beauty to penetrate.',
    externalLink: 'https://artsandculture.google.com/',
    linkText: 'Explore on Google Arts',
  },
  {
    id: 'sacred-architecture',
    title: 'View: Sacred Architecture',
    description: 'Look at images of cathedrals, temples, or ancient monuments. Humans built these to evoke awe.',
    category: 'art',
    duration: '5 min',
    emoji: '🕍',
    whyItWorks: 'Sacred architecture was designed to make humans feel small and connected to something greater. It still works.',
    externalLink: 'https://www.google.com/search?tbm=isch&q=sacred+architecture+beautiful',
    linkText: 'View images',
  },
  
  // Stories
  {
    id: 'human-triumph',
    title: 'Read: Human Triumph',
    description: 'Find a story of someone overcoming impossible odds. Human virtue and courage can induce moral awe.',
    category: 'stories',
    duration: '10 min',
    emoji: '🏆',
    whyItWorks: 'Stories of virtue expand our sense of what\'s possible. We feel elevated and inspired — what researchers call "moral elevation."',
    externalLink: 'https://www.reddit.com/r/GetMotivated/top/?t=month',
    linkText: 'Browse stories',
    /** If true, also offer AI reflection option */
    hasAiOption: true,
  },
  {
    id: 'collective-humanity',
    title: 'Watch: Collective Humanity',
    description: 'Search for videos of crowds singing together, stadium moments of unity, or acts of mass compassion.',
    category: 'stories',
    duration: '5 min',
    emoji: '👥',
    whyItWorks: 'Collective effervescence — feeling part of something larger — is a reliable awe trigger. We remember we\'re not alone.',
    externalLink: 'https://www.youtube.com/results?search_query=crowd+singing+together+beautiful',
    linkText: 'Find on YouTube',
  },
  {
    id: 'ocean-depths',
    title: 'Explore: The Deep Ocean',
    description: 'Watch footage of the deep sea. Most of our planet is unexplored, alien, and beautiful.',
    category: 'nature',
    duration: '5 min',
    emoji: '🐙',
    whyItWorks: 'The ocean depths are Earth\'s last frontier. Encountering the strange and beautiful creatures there induces wonder.',
    externalLink: 'https://www.youtube.com/results?search_query=deep+sea+creatures+documentary',
    linkText: 'Watch on YouTube',
  },
];

/**
 * Get awe activities by category
 */
export function getAweActivitiesByCategory(): Record<AweCategory, AweActivity[]> {
  return {
    nature: AWE_ACTIVITIES.filter(a => a.category === 'nature'),
    space: AWE_ACTIVITIES.filter(a => a.category === 'space'),
    music: AWE_ACTIVITIES.filter(a => a.category === 'music'),
    art: AWE_ACTIVITIES.filter(a => a.category === 'art'),
    stories: AWE_ACTIVITIES.filter(a => a.category === 'stories'),
  };
}

/**
 * Get a single suggested activity based on time of day and history
 */
export async function getSuggestedAweActivity(): Promise<AweActivity> {
  const completed = await getCompletedActivities();
  const hour = new Date().getHours();
  
  // Time-based preferences
  let preferredCategories: AweCategory[];
  if (hour >= 21 || hour < 5) {
    // Night: stars, music
    preferredCategories = ['space', 'music'];
  } else if (hour >= 5 && hour < 10) {
    // Morning: nature walks
    preferredCategories = ['nature', 'music'];
  } else if (hour >= 10 && hour < 17) {
    // Day: anything
    preferredCategories = ['nature', 'art', 'stories', 'space'];
  } else {
    // Evening: music, art, stories
    preferredCategories = ['music', 'art', 'stories'];
  }
  
  // Filter to preferred categories, excluding recently completed
  const recentlyCompleted = new Set(completed.slice(0, 3).map(c => c.activityId));
  const candidates = AWE_ACTIVITIES.filter(a => 
    preferredCategories.includes(a.category) && !recentlyCompleted.has(a.id)
  );
  
  if (candidates.length === 0) {
    // Fall back to any activity not recently completed
    const fallback = AWE_ACTIVITIES.filter(a => !recentlyCompleted.has(a.id));
    return fallback.length > 0 ? fallback[0] : AWE_ACTIVITIES[0];
  }
  
  // Pick based on day seed for consistency
  const daySeed = new Date().getDate();
  return candidates[daySeed % candidates.length];
}

/**
 * Check if we should suggest awe based on Direction gauge
 * 
 * Criteria:
 * - Direction < 40 (low)
 * - OR Direction has been stagnant (same range) for 3+ days
 */
export async function shouldSuggestAwe(
  directionValue: number,
  recentTrend: 'improving' | 'stable' | 'declining' | null
): Promise<boolean> {
  // Don't suggest if Direction is healthy
  if (directionValue >= 50) return false;
  
  // Check cooldown
  const lastShown = await getLastAweShown();
  if (lastShown) {
    const hoursSince = (Date.now() - lastShown.getTime()) / (1000 * 60 * 60);
    if (hoursSince < COOLDOWN_HOURS) return false;
  }
  
  // Low Direction: suggest awe
  if (directionValue < 40) return true;
  
  // Check for stagnation (stable/declining for 3+ days)
  if (recentTrend === "stable' || recentTrend === 'declining') {
    try {
      const history = await getGaugeHistory();
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      const recentSnapshots = history.filter(h => h.timestamp > threeDaysAgo);
      
      // Check if Direction has been in same range for 3+ days
      const directionReadings = recentSnapshots
        .filter(h => h.direction >= 0)
        .map(h => h.direction);
      
      if (directionReadings.length >= 3) {
        const avg = directionReadings.reduce((a, b) => a + b, 0) / directionReadings.length;
        const variance = directionReadings.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / directionReadings.length;
        
        // Low variance = stagnant. If avg is below 50 and variance is low, suggest awe
        if (avg < 50 && variance < 100) {
          return true;
        }
      }
    } catch (e) {
      // Can't check history, fall back to simple check
    }
  }
  
  return false;
}

/**
 * Generate context-aware prompt for an awe activity
 */
export function generateAwePrompt(activity: AweActivity): string {
  const prompts: Record<string, string> = {
    "awe-walk": \"When we're stuck in our heads, our world shrinks. Walking slowly and looking up — at trees, sky, clouds — reminds us there's so much more. You don't have to solve anything. Just notice.",
    'stargazing': \"Those stars are millions of years old. Light that left before humans existed is reaching your eyes right now. Whatever you're wrestling with — it's real, and it's also one small piece of something vast.",
    'overview-effect': \"Astronauts report that seeing Earth from space changes them forever. It's called the Overview Effect. You can touch that feeling from your phone.\",
    "pale-blue-dot': "Carl Sagan looked at a photograph of Earth from billions of miles away — a tiny dot suspended in a sunbeam — and wrote something that still gives people chills.",
    'nature-timelapse': \"We move too fast to see what's really happening. Plants grow toward light. Clouds paint the sky. Seasons turn. When we slow down, the world reveals itself.\",
    "deep-time": \"Right now feels so urgent. But zoom out: dinosaurs walked here for 165 million years. We've been here 300,000. Your life is a blink — and that's somehow both humbling and freeing.",
    'awe-music-classical': \"Some music doesn't just entertain — it takes you somewhere. Let it wash over you. You might feel chills. That's your nervous system recognizing beauty.",
    'nature-sounds': \"Our ancestors slept to these sounds. Waves, rain, thunder. There's something in us that still responds to the scale and rhythm of nature.\",
    "art-masterpieces': "We rush past art. But if you give a painting 5 minutes — really look — something shifts. Beauty needs time to penetrate.",
    'sacred-architecture': "Humans have built monuments to awe for millennia. Cathedrals, temples, ancient structures. They still work. They still make us feel small and connected.",
    'human-triumph': "Reading about humans overcoming impossible odds does something to us. Psychologists call it 'moral elevation." It reminds us what we're capable of.\",
    "collective-humanity": \"There's something about seeing crowds of strangers come together — singing, helping, mourning, celebrating. We remember: we're social creatures, wired for connection.",
    'ocean-depths': "Most of Earth is ocean. Most of the ocean is unexplored. Strange, beautiful creatures live in complete darkness. Our planet is more alien than we think.",
  };
  
  return prompts[activity.id] || activity.whyItWorks;
}

/**
 * Record that the awe nudge was shown
 */
export async function recordAweShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(AWE_SHOWN_KEY, new Date().toISOString());
  } catch (e) {
    console.warn('[AweNudge] Failed to record shown:', e);
  }
}

/**
 * Get when awe nudge was last shown
 */
export async function getLastAweShown(): Promise<Date | null> {
  try {
    const stored = await AsyncStorage.getItem(AWE_SHOWN_KEY);
    return stored ? new Date(stored) : null;
  } catch {
    return null;
  }
}

interface CompletedActivity {
  activityId: string;
  timestamp: number;
}

/**
 * Record that an awe activity was completed
 */
export async function recordAweCompleted(activityId: string): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(AWE_COMPLETED_KEY);
    const history: CompletedActivity[] = existing ? JSON.parse(existing) : [];
    
    history.unshift({ activityId, timestamp: Date.now() });
    
    // Keep last 20 completions
    const trimmed = history.slice(0, 20);
    await AsyncStorage.setItem(AWE_COMPLETED_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[AweNudge] Failed to record completion:', e);
  }
}

/**
 * Get completed awe activities
 */
export async function getCompletedActivities(): Promise<CompletedActivity[]> {
  try {
    const data = await AsyncStorage.getItem(AWE_COMPLETED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get short description for prompt generator / cockpit
 */
export function getAweNudgeForPrompt(directionValue: number): string | null {
  if (directionValue >= 40) return null;
  
  return "Your Direction has been low. Sometimes awe helps shift perspective — looking at something vast can make our problems feel more manageable.";
}

/**
 * Category display info
 */
export const AWE_CATEGORY_INFO: Record<AweCategory, { emoji: string; label: string; description: string }> = {
  nature: {
    emoji: '🌳',
    label: 'Nature',
    description: 'Trees, sky, water, growth',
  },
  space: {
    emoji: '🌌',
    label: 'Space',
    description: 'Stars, cosmos, deep time',
  },
  music: {
    emoji: '🎵',
    label: 'Music',
    description: 'Sounds that transcend',
  },
  art: {
    emoji: '🎨',
    label: 'Art',
    description: 'Beauty that moves us',
  },
  stories: {
    emoji: '📖',
    label: 'Stories',
    description: 'Human triumph & connection',
  },
};
