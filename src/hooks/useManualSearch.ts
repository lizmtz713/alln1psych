/**
 * useManualSearch — Search logic for the Human Manual
 * 
 * Provides fuzzy search across all lesson content including:
 * - title
 * - content.introduction
 * - keyInsights (keyConcepts)
 * - category (section title)
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MANUAL_SECTIONS,
  type ManualLesson,
  type ManualSection,
} from '../data/manualContent';

const RECENT_SEARCHES_KEY = 'manual_recent_searches';
const MAX_RECENT_SEARCHES = 8;

export interface SearchResult {
  lesson: ManualLesson;
  section: ManualSection;
  moduleTitle: string;
  matchedFields: string[];
  relevanceScore: number;
}

// Popular/suggested searches for when users have no history
const POPULAR_SEARCHES = [
  'emotions',
  'anxiety',
  'stress',
  'relationships',
  'sleep',
  'anger',
  'boundaries',
  'self-care',
];

/**
 * Normalize text for search (lowercase, remove special chars)
 */
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Calculate how well a text matches a query
 * Returns a score from 0 to 100
 */
function calculateMatchScore(text: string, query: string): number {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(' ').filter(Boolean);
  
  if (!queryWords.length) return 0;
  
  let score = 0;
  
  // Exact phrase match (highest score)
  if (normalizedText.includes(normalizedQuery)) {
    score += 50;
    // Bonus if it starts with the query
    if (normalizedText.startsWith(normalizedQuery)) {
      score += 20;
    }
  }
  
  // Word-by-word matching
  for (const word of queryWords) {
    if (word.length < 2) continue;
    
    if (normalizedText.includes(word)) {
      score += 15;
      // Bonus for word boundary matches
      const wordBoundaryRegex = new RegExp(`\\b${word}`, 'i');
      if (wordBoundaryRegex.test(normalizedText)) {
        score += 10;
      }
    }
  }
  
  return Math.min(100, score);
}

/**
 * Search all manual lessons
 */
function searchLessons(query: string): SearchResult[] {
  if (!query.trim() || query.length < 2) return [];
  
  const results: SearchResult[] = [];
  const normalizedQuery = normalizeText(query);
  
  for (const section of MANUAL_SECTIONS) {
    for (const module of section.modules) {
      for (const lesson of module.lessons) {
        const matchedFields: string[] = [];
        let totalScore = 0;
        
        // Search in title (highest weight)
        const titleScore = calculateMatchScore(lesson.title, query);
        if (titleScore > 0) {
          matchedFields.push('title');
          totalScore += titleScore * 2; // Double weight for title
        }
        
        // Search in category/section
        const categoryScore = calculateMatchScore(section.title, query);
        if (categoryScore > 0) {
          matchedFields.push('category');
          totalScore += categoryScore * 0.5;
        }
        
        // Search in introduction (all age versions)
        const ages: ('teen' | 'adult' | 'senior')[] = ['teen', 'adult', 'senior'];
        for (const age of ages) {
          const content = lesson.content[age];
          if (content?.introduction) {
            const introScore = calculateMatchScore(content.introduction, query);
            if (introScore > 0 && !matchedFields.includes('introduction')) {
              matchedFields.push('introduction');
              totalScore += introScore;
              break;
            }
          }
        }
        
        // Search in keyConcepts
        for (const age of ages) {
          const content = lesson.content[age];
          if (content?.keyConcepts) {
            for (const concept of content.keyConcepts) {
              const conceptScore = Math.max(
                calculateMatchScore(concept.title, query),
                calculateMatchScore(concept.explanation, query)
              );
              if (conceptScore > 0 && !matchedFields.includes('keyConcepts')) {
                matchedFields.push('keyConcepts');
                totalScore += conceptScore * 0.8;
                break;
              }
            }
          }
          if (matchedFields.includes('keyConcepts')) break;
        }
        
        // Search in deepDive
        if (lesson.deepDive) {
          const deepDiveScore = calculateMatchScore(lesson.deepDive, query);
          if (deepDiveScore > 0) {
            matchedFields.push('deepDive');
            totalScore += deepDiveScore * 0.5;
          }
        }
        
        // Add to results if any matches found
        if (matchedFields.length > 0 && totalScore > 10) {
          results.push({
            lesson,
            section,
            moduleTitle: module.title,
            matchedFields,
            relevanceScore: totalScore,
          });
        }
      }
    }
  }
  
  // Sort by relevance score
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  return results;
}

/**
 * Hook for managing manual search state and functionality
 */
export function useManualSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);
  
  const loadRecentSearches = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
    }
  }, []);
  
  const saveRecentSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    
    try {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const updated = [
        normalizedQuery,
        ...recentSearches.filter((s) => s !== normalizedQuery),
      ].slice(0, MAX_RECENT_SEARCHES);
      
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save recent search:', e);
    }
  }, [recentSearches]);
  
  const clearRecentSearches = useCallback(async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.warn('Failed to clear recent searches:', e);
    }
  }, []);
  
  const getRecentSearches = useCallback(() => {
    return recentSearches;
  }, [recentSearches]);
  
  const getPopularSearches = useCallback(() => {
    // Filter out any popular searches that are in recent
    return POPULAR_SEARCHES.filter(
      (s) => !recentSearches.includes(s.toLowerCase())
    );
  }, [recentSearches]);
  
  // Debounced search
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    debounceTimer.current = setTimeout(() => {
      const searchResults = searchLessons(searchQuery);
      setResults(searchResults);
      setIsSearching(false);
    }, 300);
  }, []);
  
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);
  
  // Get all lessons flattened (for browsing)
  const allLessons = useMemo(() => {
    const lessons: { lesson: ManualLesson; section: ManualSection; moduleTitle: string }[] = [];
    MANUAL_SECTIONS.forEach((section) => {
      section.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
          lessons.push({ lesson, section, moduleTitle: module.title });
        });
      });
    });
    return lessons;
  }, []);
  
  return {
    query,
    results,
    isSearching,
    recentSearches,
    handleSearch,
    clearSearch,
    saveRecentSearch,
    clearRecentSearches,
    getRecentSearches,
    getPopularSearches,
    allLessons,
  };
}

export default useManualSearch;
