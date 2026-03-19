/**
 * InGauge Splash Screen
 * Shows on app launch with 6 gauge emoji pattern background
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_CONFIG } from '../lib/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// The 6 gauges
const GAUGE_EMOJIS = ['🫀', '⚡', '💜', '💙', '🧭', '✨'];

// Generate a grid of emojis for the background pattern
function generateEmojiGrid(): string[][] {
  const rows = Math.ceil(SCREEN_HEIGHT / 60) + 2;
  const cols = Math.ceil(SCREEN_WIDTH / 60) + 2;
  const grid: string[][] = [];
  
  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      // Offset every other row for a staggered pattern
      const index = (r * cols + c + (r % 2 === 0 ? 0 : 3)) % GAUGE_EMOJIS.length;
      row.push(GAUGE_EMOJIS[index]);
    }
    grid.push(row);
  }
  return grid;
}

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export function SplashScreen({ onFinish, duration = 2000 }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const patternOpacity = useRef(new Animated.Value(0)).current;
  const emojiGrid = useRef(generateEmojiGrid()).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(patternOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // Call onFinish after duration
    if (onFinish) {
      const timer = setTimeout(onFinish, duration);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0D0D14', '#12121A', '#0D0D14']}
        style={StyleSheet.absoluteFill}
      />

      {/* Emoji pattern background */}
      <Animated.View style={[styles.patternContainer, { opacity: patternOpacity }]}>
        {emojiGrid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.patternRow}>
            {row.map((emoji, colIndex) => (
              <Text
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.patternEmoji,
                  { marginLeft: rowIndex % 2 === 0 ? 0 : 30 }
                ]}
              >
                {emoji}
              </Text>
            ))}
          </View>
        ))}
      </Animated.View>

      {/* Center logo area */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        {/* Logo background glow */}
        <View style={styles.logoGlow} />
        
        {/* Main logo content */}
        <View style={styles.logoContent}>
          {/* Brain/gauge icon representation */}
          <View style={styles.iconContainer}>
            <Text style={styles.mainIcon}>🎛️</Text>
          </View>
          
          {/* App name */}
          <Text style={styles.appName}>{APP_CONFIG.name}</Text>
          
          {/* Tagline */}
          <Text style={styles.tagline}>Your personal cockpit</Text>
        </View>

        {/* 6 gauge mini icons in a row */}
        <View style={styles.gaugeRow}>
          {GAUGE_EMOJIS.map((emoji, i) => (
            <View key={i} style={styles.miniGauge}>
              <Text style={styles.miniGaugeEmoji}>{emoji}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Pattern background
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternRow: {
    flexDirection: 'row',
  },
  patternEmoji: {
    fontSize: 28,
    width: 60,
    height: 60,
    textAlign: 'center',
    lineHeight: 60,
    opacity: 0.08,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124, 77, 255, 0.15)',
  },
  logoContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 17, 24, 0.95)',
    paddingHorizontal: 40,
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.3)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 77, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#F0F0F5',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: '#8888A0',
    marginTop: 4,
  },
  
  // Mini gauge row
  gaugeRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  miniGauge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniGaugeEmoji: {
    fontSize: 18,
  },
});

export default SplashScreen;
