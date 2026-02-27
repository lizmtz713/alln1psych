/**
 * ManualSearch — Search component for the Human Manual
 * 
 * Features:
 * - Search input with icon
 * - Real-time filtering as user types (debounced 300ms)
 * - Shows matching lessons with highlighted terms
 * - Recent searches and popular suggestions
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  Keyboard,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS, SPACING } from '../lib/constants';
import { useManualSearch, type SearchResult } from '../hooks/useManualSearch';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ManualSearchProps {
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
}

/**
 * Highlight matching text in a string
 */
function HighlightedText({ 
  text, 
  highlight, 
  style 
}: { 
  text: string; 
  highlight: string;
  style?: any;
}) {
  if (!highlight.trim()) {
    return <Text style={style}>{text}</Text>;
  }
  
  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <Text style={style}>
      {parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={index} style={styles.highlightedText}>{part}</Text>
        ) : (
          <Text key={index}>{part}</Text>
        )
      )}
    </Text>
  );
}

/**
 * Individual search result item
 */
function SearchResultItem({ 
  result, 
  query,
  onPress 
}: { 
  result: SearchResult; 
  query: string;
  onPress: () => void;
}) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.resultItem,
        pressed && styles.resultItemPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.resultEmojiContainer}>
        <Text style={styles.resultEmoji}>{result.lesson.emoji}</Text>
      </View>
      <View style={styles.resultContent}>
        <HighlightedText 
          text={result.lesson.title} 
          highlight={query}
          style={styles.resultTitle}
        />
        <View style={styles.resultMeta}>
          <Text style={styles.resultCategory}>{result.section.emoji} {result.section.title}</Text>
          {result.matchedFields.includes('introduction') && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>in content</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </Pressable>
  );
}

/**
 * Suggestion chip for recent/popular searches
 */
function SuggestionChip({ 
  text, 
  onPress,
  icon
}: { 
  text: string; 
  onPress: () => void;
  icon?: string;
}) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.suggestionChip,
        pressed && styles.suggestionChipPressed
      ]}
      onPress={onPress}
    >
      {icon && <Ionicons name={icon as any} size={12} color={COLORS.accent} style={{ marginRight: 4 }} />}
      <Text style={styles.suggestionChipText}>{text}</Text>
    </Pressable>
  );
}

export function ManualSearch({ onSearchFocus, onSearchBlur }: ManualSearchProps) {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  
  const {
    query,
    results,
    isSearching,
    recentSearches,
    handleSearch,
    clearSearch,
    saveRecentSearch,
    clearRecentSearches,
    getPopularSearches,
  } = useManualSearch();
  
  const showResults = isFocused && (query.length >= 2 || recentSearches.length > 0);
  
  // Animate focus state
  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onSearchFocus?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [onSearchFocus]);
  
  const handleBlur = useCallback(() => {
    // Delay blur to allow tap on results
    setTimeout(() => {
      setIsFocused(false);
      onSearchBlur?.();
    }, 150);
  }, [onSearchBlur]);
  
  const handleClear = useCallback(() => {
    clearSearch();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [clearSearch]);
  
  const handleResultPress = useCallback((result: SearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveRecentSearch(query);
    Keyboard.dismiss();
    setIsFocused(false);
    router.push(`/lesson/${result.lesson.id}`);
  }, [query, saveRecentSearch, router]);
  
  const handleSuggestionPress = useCallback((suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSearch(suggestion);
    inputRef.current?.focus();
  }, [handleSearch]);
  
  const handleClearRecent = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    clearRecentSearches();
  }, [clearRecentSearches]);
  
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.accent],
  });
  
  const popularSearches = getPopularSearches();
  
  return (
    <View style={styles.container}>
      {/* Search Input */}
      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        <Ionicons 
          name="search" 
          size={18} 
          color={isFocused ? COLORS.accent : COLORS.textMuted} 
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search lessons..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </Pressable>
        )}
        {isSearching && (
          <View style={styles.loadingIndicator}>
            <Text style={styles.loadingText}>...</Text>
          </View>
        )}
      </Animated.View>
      
      {/* Results Dropdown */}
      {showResults && (
        <View style={styles.resultsContainer}>
          {/* No query - show suggestions */}
          {query.length < 2 && (
            <View style={styles.suggestionsContainer}>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <View style={styles.suggestionSection}>
                  <View style={styles.suggestionHeader}>
                    <Text style={styles.suggestionTitle}>Recent</Text>
                    <Pressable onPress={handleClearRecent}>
                      <Text style={styles.clearRecentText}>Clear</Text>
                    </Pressable>
                  </View>
                  <View style={styles.suggestionChips}>
                    {recentSearches.slice(0, 5).map((search) => (
                      <SuggestionChip
                        key={search}
                        text={search}
                        icon="time-outline"
                        onPress={() => handleSuggestionPress(search)}
                      />
                    ))}
                  </View>
                </View>
              )}
              
              {/* Popular Searches */}
              {popularSearches.length > 0 && (
                <View style={styles.suggestionSection}>
                  <Text style={styles.suggestionTitle}>Popular</Text>
                  <View style={styles.suggestionChips}>
                    {popularSearches.slice(0, 6).map((search) => (
                      <SuggestionChip
                        key={search}
                        text={search}
                        icon="trending-up"
                        onPress={() => handleSuggestionPress(search)}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
          
          {/* Search Results */}
          {query.length >= 2 && (
            <>
              {results.length > 0 ? (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.lesson.id}
                  renderItem={({ item }) => (
                    <SearchResultItem
                      result={item}
                      query={query}
                      onPress={() => handleResultPress(item)}
                    />
                  )}
                  style={styles.resultsList}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                />
              ) : !isSearching ? (
                <View style={styles.noResults}>
                  <Ionicons name="search-outline" size={32} color={COLORS.textMuted} />
                  <Text style={styles.noResultsText}>No lessons found</Text>
                  <Text style={styles.noResultsHint}>Try different keywords</Text>
                </View>
              ) : null}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  loadingIndicator: {
    marginLeft: SPACING.sm,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  
  // Results Container
  resultsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultsList: {
    maxHeight: 350,
  },
  
  // Result Item
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultItemPressed: {
    backgroundColor: COLORS.accentBg,
  },
  resultEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  resultEmoji: {
    fontSize: 20,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  matchBadge: {
    backgroundColor: COLORS.accentBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  matchBadgeText: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: '500',
  },
  highlightedText: {
    backgroundColor: COLORS.accentBgStrong,
    color: COLORS.accent,
    fontWeight: '700',
  },
  
  // Suggestions
  suggestionsContainer: {
    padding: SPACING.md,
  },
  suggestionSection: {
    marginBottom: SPACING.md,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearRecentText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  suggestionChipPressed: {
    backgroundColor: COLORS.accentBgStrong,
  },
  suggestionChipText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  
  // No Results
  noResults: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  noResultsHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});

export default ManualSearch;
