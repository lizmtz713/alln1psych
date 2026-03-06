/**
 * PersonLight — Visual representation of a person in Your People
 * 
 * Three dimensions:
 * - Color: Their status (green/yellow/orange/red/gray)
 * - Brightness: Connection strength (on/dim/off)
 * - Animation: Attention signal (none/pulse/blink/glow)
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Image } from 'react-native';
import { COLORS } from '../../lib/constants';
import {
  calculateLightState,
  getInitials,
  formatLastContact,
  STATUS_COLORS,
  BRIGHTNESS_OPACITY,
  type LightStatus,
  type LightTier,
} from '../../utils/lightHelpers';

interface PersonLightProps {
  id: string;
  name: string;
  avatar?: string;
  status?: LightStatus;
  lastContact?: Date | string | null;
  tier?: LightTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showStatus?: boolean;
  onPress?: () => void;
}

const SIZE_MAP = {
  sm: 44,
  md: 60,
  lg: 80,
};

const FONT_SIZE_MAP = {
  sm: 14,
  md: 18,
  lg: 24,
};

export function PersonLight({
  id,
  name,
  avatar,
  status,
  lastContact,
  tier = 'friends',
  size = 'md',
  showLabel = true,
  showStatus = false,
  onPress,
}: PersonLightProps) {
  const lightState = calculateLightState(status, lastContact ?? null, tier);
  const { colorHex, brightness, opacity, animation, needsAttention } = lightState;
  
  const initials = getInitials(name);
  const sizeValue = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const borderWidth = size === 'lg' ? 4 : size === 'md' ? 3 : 2;
  
  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.2)).current;
  
  // Pulse animation
  useEffect(() => {
    if (animation === 'pulse' || animation === 'blink' || animation === 'glow') {
      const speed = animation === 'blink' ? 600 : animation === 'glow' ? 1500 : 1000;
      const scale = animation === 'blink' ? 1.1 : 1.06;
      
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { 
            toValue: scale, 
            duration: speed, 
            useNativeDriver: true 
          }),
          Animated.timing(pulseAnim, { 
            toValue: 1, 
            duration: speed, 
            useNativeDriver: true 
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [animation]);
  
  // Blink animation (opacity)
  useEffect(() => {
    if (animation === 'blink') {
      const blink = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      );
      blink.start();
      return () => blink.stop();
    } else {
      blinkAnim.setValue(1);
    }
  }, [animation]);
  
  // Glow animation (shadow)
  useEffect(() => {
    if (animation === 'glow') {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.7, duration: 1200, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.2, duration: 1200, useNativeDriver: false }),
        ])
      );
      glow.start();
      return () => glow.stop();
    } else {
      glowAnim.setValue(0.2);
    }
  }, [animation]);
  
  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.container,
        { width: sizeValue + 8 },
        pressed && styles.pressed,
      ]}
    >
      <Animated.View
        style={[
          styles.ring,
          {
            width: sizeValue,
            height: sizeValue,
            borderRadius: sizeValue / 2,
            borderWidth,
            borderColor: colorHex,
            opacity: Animated.multiply(blinkAnim, opacity),
            transform: [{ scale: pulseAnim }],
            shadowColor: colorHex,
            shadowOpacity: animation === 'glow' || needsAttention ? glowAnim : 0,
            shadowRadius: needsAttention ? 10 : 0,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        {avatar ? (
          <Image 
            source={{ uri: avatar }} 
            style={[
              styles.avatar,
              { 
                width: sizeValue - borderWidth * 2 - 4,
                height: sizeValue - borderWidth * 2 - 4,
                borderRadius: (sizeValue - borderWidth * 2 - 4) / 2,
              }
            ]} 
          />
        ) : (
          <Text style={[styles.initials, { fontSize, color: colorHex, opacity }]}>
            {initials}
          </Text>
        )}
      </Animated.View>
      
      {showLabel && (
        <Text 
          style={[styles.name, { opacity: Math.max(opacity, 0.6) }]} 
          numberOfLines={1}
        >
          {name}
        </Text>
      )}
      
      {showStatus && status && status !== 'unknown' && (
        <Text style={[styles.statusLabel, { color: colorHex, opacity }]} numberOfLines={1}>
          {lightState.color === 'green' ? '✓' : 
           lightState.color === 'yellow' ? '~' :
           lightState.color === 'orange' ? '!' :
           lightState.color === 'red' ? '!!' : ''}
        </Text>
      )}
    </Pressable>
  );
}

/**
 * Compact list item version
 */
export function PersonLightRow({
  name,
  status,
  lastContact,
  tier = 'friends',
  onPress,
}: Omit<PersonLightProps, 'size' | 'showLabel' | 'showStatus' | 'avatar'> & { avatar?: string }) {
  const lightState = calculateLightState(status, lastContact ?? null, tier);
  const { colorHex, opacity, needsAttention } = lightState;
  const initials = getInitials(name);
  
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [styles.rowContainer, pressed && styles.pressed]}
    >
      <View style={[styles.rowRing, { borderColor: colorHex, opacity }]}>
        <Text style={[styles.rowInitials, { color: colorHex }]}>{initials}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowName, { opacity: Math.max(opacity, 0.7) }]}>{name}</Text>
        <Text style={styles.rowMeta}>{formatLastContact(lastContact ?? null)}</Text>
      </View>
      {needsAttention && (
        <View style={[styles.attentionDot, { backgroundColor: colorHex }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  avatar: {
    resizeMode: 'cover',
  },
  initials: {
    fontWeight: '700',
  },
  name: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  
  // Row styles
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInitials: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  rowMeta: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  attentionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
});

export default PersonLight;
