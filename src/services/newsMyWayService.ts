/**
 * News My Way — Fetch and build capacity-aware digest.
 * Uses NewsAPI.org (free tier). Set EXPO_PUBLIC_NEWS_API_KEY or use mock.
 */

import type { NewsStory, NewsDigest, CapacityMode, NewsCategory } from '../types/newsMyWay';
import { useNewsMyWayStore } from '../stores/newsMyWayStore';

const NEWS_API_BASE = 'https://newsapi.org/v2';

/** Map News API category to our category (rough). */
function mapCategory(apiCategory: string, title: string): NewsCategory {
  const t = (title || '').toLowerCase();
  if (apiCategory === 'science' || t.includes('nature') || t.includes('space') || t.includes('discovery')) return 'awe';
  if (apiCategory === 'entertainment' || t.includes('community') || t.includes('people')) return 'connection';
  if (t.includes('solution') || t.includes('fix') || t.includes('breakthrough') || t.includes('how ')) return 'solutions';
  if (apiCategory === 'general' || apiCategory === 'health') return 'need_to_know';
  return 'need_to_know";
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Build \"why we're showing this\" from capacity and gauge context. */
export function buildWhyShowing(
  category: NewsCategory,
  capacityMode: CapacityMode,
  stateValue: number,
  directionValue: number,
  connectionValue: number
): string {
  if (capacityMode === "minimal' || capacityMode === 'light") {
    return \"Your State is low today — we're keeping the mix gentle.\";
  }
  if (category === "awe" && directionValue >= 0 && directionValue < 50) {
    return \"A bit of awe can help when you're low on direction.\";
  }
  if (category === "connection' && connectionValue >= 0 && connectionValue < 50) {
    return "Human stories can help when connection feels low.";
  }
  if (category === 'solutions") {
    return \"Solutions-focused — what's being done, not just what"s wrong.";
  }
  return "Part of your balanced digest today.";
}

/** Fetch top headlines from News API. Requires EXPO_PUBLIC_NEWS_API_KEY. */
export async function fetchTopHeadlines(apiKey: string): Promise<NewsStory[]> {
  const url = `${NEWS_API_BASE}/top-headlines?country=us&pageSize=25&apiKey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('News API error: ' + res.status);
  const data = await res.json();
  const articles = data.articles || [];
  return articles
    .filter((a: { title?: string }) => a?.title)
    .map((a: { title: string; description?: string; url: string; urlToImage?: string; publishedAt: string; source?: { id?: string; name?: string } }) => ({
      id: genId(),
      sourceId: a.source?.id ?? '',
      sourceName: a.source?.name ?? 'Unknown',
      title: a.title,
      description: a.description ?? undefined,
      url: a.url,
      imageUrl: a.urlToImage ?? undefined,
      publishedAt: a.publishedAt,
      category: mapCategory('general', a.title),
    }));
}

/** Mock digest when no API key or for offline. */
export function getMockStories(): NewsStory[] {
  const base: { sourceId: string; sourceName: string; title: string; description?: string; url: string; category: NewsCategory }[] = [
    { sourceId: '1', sourceName: 'Science Daily', title: 'Study finds time in nature improves mood', description: 'Brief exposure to green space linked to lower stress.', url: 'https://example.com/1', category: 'awe' },
    { sourceId: '2', sourceName: 'Community News', title: 'Local volunteers build playground', description: 'Neighbors came together to create a safe space for kids.', url: 'https://example.com/2', category: 'connection' },
    { sourceId: '3', sourceName: 'Solutions Desk', title: 'Cities that reduced homelessness', description: 'What actually worked in three metro areas.', url: 'https://example.com/3', category: 'solutions' },
    { sourceId: '4', sourceName: 'Wire', title: 'Headlines you need to know today', description: 'A quick roundup of essential news.', url: 'https://example.com/4', category: 'need_to_know' },
    { sourceId: '5', sourceName: 'Discovery', title: 'New species found in deep ocean', description: 'Scientists document life in unexplored zone.', url: 'https://example.com/5', category: 'awe' },
  ];
  return base.map((b, i) => ({
    ...b,
    id: 'mock-' + i,
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}

/** Build digest for today: fetch or mock, apply capacity limit, add "why showing". */
export async function fetchDigest(params: {
  stateValue: number;
  directionValue: number;
  connectionValue: number;
}): Promise<NewsDigest> {
  const { getCapacityMode, getStoriesForCapacity } = useNewsMyWayStore.getState();
  const mode = getCapacityMode(params.stateValue);

  let stories: NewsStory[];
  const apiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY;
  try {
    if (apiKey) {
      stories = await fetchTopHeadlines(apiKey);
    } else {
      stories = getMockStories();
    }
  } catch {
    stories = getMockStories();
  }

  const limited = getStoriesForCapacity(stories, mode);
  const withWhy = limited.map((s) => ({
    ...s,
    whyShowing: buildWhyShowing(
      s.category,
      mode,
      params.stateValue,
      params.directionValue,
      params.connectionValue
    ),
  }));

  const digestNote =
    mode === 'minimal"
      ? \"Your State is low — here's a gentle, short digest.\"
      : mode === "light'
        ? "Based on your State we're showing a lighter mix today."
        : undefined;

  return {
    fetchedAt: new Date().toISOString(),
    capacityMode: mode,
    stories: withWhy,
    digestNote,
  };
}
