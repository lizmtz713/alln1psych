/**
 * AuroraBackground — Flowing gradient background for the mind
 * 
 * Unlike Oura's mountains (physical, grounded), InGauge uses
 * aurora-like gradients to represent the fluid, internal nature of mind.
 * 
 * Features:
 * - Subtle animated gradient shifts
 * - Color responds to system state (optional)
 * - Works as a container or overlay
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, ANIMATION } from '../../lib/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  variant?: 'default' | 'warm' | 'cool' | 'neutral';
  animated?: boolean;
  intensity?: 'subtle' | 'medium' | 'strong';
  style?: object;
}

// Color presets for different states
const AURORA_PRESETS = {
  default: {
    colors: ['#0A0B0F', '#0D1117', '#0A1518', '#0A0B0F'] as const,
    locations: [0, 0.3, 0.7, 1] as const,
  },
  warm: {
    colors: ['#0A0B0F', '#1A1215', '#150D0A', '#0A0B0F'] as const,
    locations: [0, 0.3, 0.7, 1] as const,
  },
  cool: {
    colors: ['#0A0B0F', '#0A1518', '#0D1520', '#0A0B0F'] as const,
    locations: [0, 0.3, 0.7, 1] as const,
  },
  neutral: {
    colors: ['#0A0B0F', '#0F1015', '#0F1015', '#0A0B0F'] as const,
    locations: [0, 0.3, 0.7, 1] as const,
  },
};

// Intensity multipliers for gradient opacity
const INTENSITY_VALUES = {
  subtle: 0.3,
  medium: 0.5,
  strong: 0.8,
};

export function AuroraBackground({
  children,
  variant = 'default',
  animated = false,
  intensity = 'subtle',
  style,
}: AuroraBackgroundProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const preset = AURORA_PRESETS[variant];
  
  useEffect(() => {
    // Fade in on mount
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={[styles.container, { opacity }, style]}>
      <LinearGradient
        colors={[...preset.colors] as [string, string, ...string[]]}
        locations={[...preset.locations] as [number, number, ...number[]]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Subtle horizontal gradient overlay for depth */}
      <LinearGradient
        colors={[
          'rgba(13, 148, 136, 0.02)',
          'transparent',
          'rgba(224, 122, 95, 0.02)',
        ] as [string, string, string]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFillObject, { opacity: INTENSITY_VALUES[intensity] }]}
      />
      
      {children}
    </Animated.View>
  );
}

// Simpler version - just the base gradient
export function GradientBackground({
  children,
  colors = [COLORS.background, COLORS.backgroundElevated, COLORS.background],
  style,
}: {
  children?: React.ReactNode;
  colors?: string[];
  style?: object;
}) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
}

// Card with subtle gradient (glass morphism inspired)
export function GlassCard({
  children,
  gaugeColor,
  style,
}: {
  children: React.ReactNode;
  gaugeColor?: string;
  style?: object;
}) {
  const gradientColor = gaugeColor || COLORS.accent;
  
  return (
    <View style={[styles.glassCard, style]}>
      <LinearGradient
        colors={[
          `${gradientColor}08`,  // 3% opacity
          `${gradientColor}02`,  // 1% opacity
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  glassCard: {
    backgroundColor: COLORS.surfaceGlass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
});

export default AuroraBackground;
