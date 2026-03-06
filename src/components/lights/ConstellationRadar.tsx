/**
 * ConstellationRadar — "A radar for human connection"
 * Deep space aesthetic, 5-signal encoding: position, size, color, motion, cluster.
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Text, Animated } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import type { ConstellationNode } from '../../types/lightsConstellation';
import { LIGHT_TEMPERATURE_SCALE } from '../../types/lights';
import { COLORS } from '../../lib/constants';

const DEFAULT_SIZE = Math.min(Dimensions.get('window').width, Dimensions.get('window').height) * 0.88;
const CENTER_R = 8;
const BASE_NODE_R = 12;
const LINE_OPACITY = 0.12;

const tempColor = (t: ConstellationNode['temperature']) =>
  t === 'unknown' ? COLORS.textMuted : LIGHT_TEMPERATURE_SCALE[t].color;

export interface ConstellationRadarProps {
  nodes: ConstellationNode[];
  onNodePress?: (node: ConstellationNode) => void;
  selectedId?: string | null;
  /** ID of node to briefly glow (e.g. just Transmitted to). Cleared after animation. */
  recentlyConnectedId?: string | null;
  /** Called when the recent-glow animation has finished so parent can clear recentlyConnectedId */
  onRecentGlowComplete?: () => void;
  size?: number;
}

export function ConstellationRadar({
  nodes,
  onNodePress,
  selectedId,
  recentlyConnectedId,
  onRecentGlowComplete,
  size = DEFAULT_SIZE,
}: ConstellationRadarProps) {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const scaleAtPinchStart = useRef(1);
  const translateAtPanStart = useRef({ x: 0, y: 0 });
  const latestTranslate = useRef({ x: 0, y: 0 });
  useEffect(() => {
    latestTranslate.current = { x: translateX, y: translateY };
  }, [translateX, translateY]);

  const center = size / 2;
  const radius = size / 2 - BASE_NODE_R * 2.5;

  const pinch = Gesture.Pinch()
    .onStart(() => {
      scaleAtPinchStart.current = scale;
    })
    .onUpdate((e) => setScale(Math.min(Math.max(scaleAtPinchStart.current * e.scale, 0.5), 3)));

  const pan = Gesture.Pan()
    .onStart(() => {
      translateAtPanStart.current = { ...latestTranslate.current };
    })
    .onUpdate((e) => {
      setTranslateX(translateAtPanStart.current.x + e.translationX);
      setTranslateY(translateAtPanStart.current.y + e.translationY);
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  return (
    <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={composed}>
        <View style={[styles.canvas, { width: size, height: size }]}>
          {/* Deep space gradient background */}
          <View style={[styles.spaceBg, { width: size, height: size }]} />
          <View
            style={[
              styles.inner,
              {
                width: size,
                height: size,
                transform: [
                  { translateX: size / 2 + translateX },
                  { translateY: size / 2 + translateY },
                  { scale },
                  { translateX: -size / 2 },
                  { translateY: -size / 2 },
                ],
              },
            ]}
          >
            {/* Tier rings (subtle) */}
            {[0.22, 0.42, 0.65, 0.92].map((r, i) => (
              <View
                key={i}
                style={[
                  styles.ring,
                  {
                    left: center - radius * r,
                    top: center - radius * r,
                    width: radius * r * 2,
                    height: radius * r * 2,
                    borderRadius: radius * r,
                    borderColor: 'rgba(255,255,255,0.06)',
                  },
                ]}
              />
            ))}
            {/* Center (you) */}
            <View
              style={[
                styles.centerDot,
                {
                  left: center - CENTER_R,
                  top: center - CENTER_R,
                  width: CENTER_R * 2,
                  height: CENTER_R * 2,
                  borderRadius: CENTER_R,
                },
              ]}
            />
            {/* Lines from center to each node */}
            {nodes.map((n) => {
              const px = center + n.x * radius;
              const py = center + n.y * radius;
              const angle = Math.atan2(py - center, px - center);
              const lineLen = Math.hypot(px - center, py - center);
              return (
                <View
                  key={`line-${n.id}`}
                  style={[
                    styles.line,
                    {
                      left: center,
                      top: center,
                      width: lineLen,
                      height: 1,
                      backgroundColor: tempColor(n.temperature),
                      opacity: LINE_OPACITY,
                      transform: [{ rotate: `${angle}rad` }],
                    },
                  ]}
                />
              );
            })}
            {/* Nodes */}
            {nodes.map((n) => {
              const px = center + n.x * radius;
              const py = center + n.y * radius;
              const color = tempColor(n.temperature);
              const nodeR = BASE_NODE_R * n.sizeRatio;
              const isSelected = selectedId === n.id;
              const recentlyConnected = recentlyConnectedId === n.id;
              return (
                <NodeOrb
                  key={n.id}
                  x={px - nodeR}
                  y={py - nodeR}
                  size={nodeR * 2}
                  color={color}
                  brightness={n.brightness}
                  flickering={n.flickering}
                  selected={isSelected}
                  recentlyConnected={recentlyConnected}
                  onRecentGlowComplete={recentlyConnected ? onRecentGlowComplete : undefined}
                  onPress={() => onNodePress?.(n)}
                />
              );
            })}
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

function NodeOrb({
  x,
  y,
  size,
  color,
  brightness,
  flickering,
  selected,
  recentlyConnected,
  onRecentGlowComplete,
  onPress,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  brightness: number;
  flickering: boolean;
  selected: boolean;
  recentlyConnected: boolean;
  onRecentGlowComplete?: () => void;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const breathScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!flickering) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.92, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [flickering, pulse]);

  useEffect(() => {
    if (!recentlyConnected) return;
    const anim = Animated.sequence([
      Animated.timing(glowScale, { toValue: 1.35, duration: 400, useNativeDriver: true }),
      Animated.timing(glowScale, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]);
    anim.start(() => onRecentGlowComplete?.());
    return () => anim.stop();
  }, [recentlyConnected, glowScale, onRecentGlowComplete]);

  // Ambient breathing: 1 → 1.03 → 1, very slow (Rule #3: alive, never busy)
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathScale, { toValue: 1.03, duration: 2500, useNativeDriver: true }),
        Animated.timing(breathScale, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [breathScale]);

  const opacity = 0.75 + brightness * 0.25;
  const scale = recentlyConnected ? glowScale : flickering ? pulse : breathScale;

  return (
    <Animated.View
      style={[
        styles.nodeWrap,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: selected ? 1 : opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[
          styles.node,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            borderWidth: selected ? 3 : 0,
            borderColor: COLORS.text,
            ...(recentlyConnected && {
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 12,
              elevation: 8,
            }),
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  canvas: { overflow: 'hidden', alignSelf: 'center' },
  spaceBg: {
    position: 'absolute',
    backgroundColor: '#06060A',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  inner: { position: 'absolute', left: 0, top: 0 },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  centerDot: {
    position: 'absolute',
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  line: { position: 'absolute', transformOrigin: 'left center' },
  nodeWrap: { position: 'absolute' },
  node: { position: 'absolute' },
});
