/**
 * ConstellationRadar — "A radar for human connection"
 * Distance = layer, Color = relationship health, Motion = breathing / glow.
 * Inner layers (5/15) = avatars; 50/150 = dots.
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Text, Animated, Image } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import type { ConstellationNode, RelationshipHealthColor } from '../../types/lightsConstellation';
import { COLORS } from '../../lib/constants';

const DEFAULT_SIZE = Math.min(Dimensions.get('window').width, Dimensions.get('window').height) * 0.88;
const CENTER_R = 8;
const BASE_NODE_R = 12;
const LINE_OPACITY = 0.12;
const SELECTED_LINE_OPACITY = 0.38;

const RELATIONSHIP_COLORS: Record<RelationshipHealthColor, string> = {
  green: '#34D399',
  yellow: '#FBBF24',
  orange: '#FB923C',
  red: '#F87171',
  neutral: 'rgba(255,255,255,0.5)',
};

function nodeColor(n: ConstellationNode): string {
  if (n.relationshipColor) return RELATIONSHIP_COLORS[n.relationshipColor];
  return COLORS.textMuted;
}

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
            {/* Dunbar layer rings: 5 / 15 / 50 / 150 */}
            {[
              { r: 0.22, label: '5' },
              { r: 0.42, label: '15' },
              { r: 0.65, label: '50' },
              { r: 0.92, label: '150' },
            ].map(({ r }, i) => (
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
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                ]}
              />
            ))}
            {/* Center: YOU */}
            <View
              style={[
                styles.centerWrap,
                {
                  left: center - 28,
                  top: center - 28,
                  width: 56,
                  height: 56,
                },
              ]}
            >
              <View
                style={[
                  styles.centerDot,
                  {
                    width: CENTER_R * 2,
                    height: CENTER_R * 2,
                    borderRadius: CENTER_R,
                  },
                ]}
              />
              <Text style={styles.centerLabel}>YOU</Text>
            </View>
            {/* Lines from center to each node — selected node gets highlighted line */}
            {nodes.map((n) => {
              const px = center + n.x * radius;
              const py = center + n.y * radius;
              const angle = Math.atan2(py - center, px - center);
              const lineLen = Math.hypot(px - center, py - center);
              const isSelected = selectedId === n.id;
              return (
                <View
                  key={`line-${n.id}`}
                  style={[
                    styles.line,
                    {
                      left: center,
                      top: center,
                      width: lineLen,
                      height: isSelected ? 2 : 1,
                      backgroundColor: nodeColor(n),
                      opacity: isSelected ? SELECTED_LINE_OPACITY : LINE_OPACITY,
                      transform: [{ rotate: `${angle}rad` }],
                    },
                  ]}
                />
              );
            })}
            {/* Nodes: avatars for 5/15, dots for 50/150 */}
            {nodes.map((n) => {
              const px = center + n.x * radius;
              const py = center + n.y * radius;
              const color = nodeColor(n);
              const nodeR = BASE_NODE_R * n.sizeRatio;
              const isSelected = selectedId === n.id;
              const recentlyConnected = recentlyConnectedId === n.id;
              const useAvatar = n.tier === 'five' || n.tier === 'fifteen';
              return useAvatar ? (
                <NodeAvatar
                  key={n.id}
                  x={px - nodeR}
                  y={py - nodeR}
                  size={nodeR * 2}
                  name={n.name}
                  photoUri={n.photoUri}
                  color={color}
                  brightness={n.brightness}
                  flickering={n.flickering}
                  selected={isSelected}
                  recentlyConnected={recentlyConnected}
                  onRecentGlowComplete={recentlyConnected ? onRecentGlowComplete : undefined}
                  onPress={() => onNodePress?.(n)}
                />
              ) : (
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

/** Avatar node for inner layers (5/15): image or initial, with relationship-health ring */
function NodeAvatar({
  x,
  y,
  size,
  name,
  photoUri,
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
  name: string;
  photoUri?: string;
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
        Animated.timing(pulse, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.94, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [flickering, pulse]);

  useEffect(() => {
    if (!recentlyConnected) return;
    const anim = Animated.sequence([
      Animated.timing(glowScale, { toValue: 1.3, duration: 400, useNativeDriver: true }),
      Animated.timing(glowScale, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]);
    anim.start(() => onRecentGlowComplete?.());
    return () => anim.stop();
  }, [recentlyConnected, glowScale, onRecentGlowComplete]);

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

  const opacity = 0.78 + brightness * 0.22;
  const scaleAnim = recentlyConnected ? glowScale : flickering ? pulse : breathScale;
  const initial = name.trim() ? name.trim()[0].toUpperCase() : '?';

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
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[
          styles.nodeAvatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: color,
            ...(selected && { borderWidth: 3, borderColor: COLORS.text }),
            ...(recentlyConnected && {
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 10,
              elevation: 8,
            }),
          },
        ]}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={[styles.avatarImg, { width: size, height: size, borderRadius: size / 2 }]} resizeMode="cover" />
        ) : (
          <View style={[styles.avatarInitial, { width: size, height: size, borderRadius: size / 2, backgroundColor: COLORS.surface }]}>
            <Text style={[styles.avatarInitialText, { fontSize: Math.max(10, size * 0.4) }]}>{initial}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
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
  centerWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  line: { position: 'absolute', transformOrigin: 'left center' },
  nodeWrap: { position: 'absolute' },
  node: { position: 'absolute' },
  nodeAvatar: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarImg: { position: 'absolute' },
  avatarInitial: { alignItems: 'center', justifyContent: 'center' },
  avatarInitialText: { color: COLORS.text, fontWeight: '600' },
});
