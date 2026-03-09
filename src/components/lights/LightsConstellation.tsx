/**
 * LightsConstellation — Pinch/pan/tap constellation of lights (map nodes).
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import type { MapNode } from '../../types/lightsMap';
import { LIGHT_TEMPERATURE_SCALE } from '../../types/lights';
import { BRIGHTNESS_CONFIG } from '../../services/friendshipMaintenance';
import { COLORS } from '../../lib/constants';

const DEFAULT_SIZE = Math.min(Dimensions.get('window').width, Dimensions.get('window').height) * 0.9;
const CENTER_R = 6;
const NODE_R = 14;
const LINE_OPACITY = 0.2;

const tempColor = (t: MapNode['temperature']) =>
  t === 'unknown' ? COLORS.textMuted : LIGHT_TEMPERATURE_SCALE[t].color;

const nodeColor = (n: MapNode) => {
  const level = n.flickering ? 'dimming' : (n.brightness >= 0.7 ? 'bright' : n.brightness >= 0.4 ? 'steady' : 'dimming');
  return BRIGHTNESS_CONFIG[level]?.color ?? COLORS.textMuted;
};

export interface LightsConstellationProps {
  nodes: MapNode[];
  onNodePress?: (node: MapNode) => void;
  size?: number;
}

export function LightsConstellation({ nodes, onNodePress, size = DEFAULT_SIZE }: LightsConstellationProps) {
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
  const radius = size / 2 - NODE_R * 2;

  const pinch = Gesture.Pinch()
    .onStart(() => { scaleAtPinchStart.current = scale; })
    .onUpdate((e) => setScale(Math.min(Math.max(scaleAtPinchStart.current * e.scale, 0.5), 4)));

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
            {/* Center (you) */}
            <View
              style={[
                styles.centerDot,
                { left: center - CENTER_R, top: center - CENTER_R, width: CENTER_R * 2, height: CENTER_R * 2, borderRadius: CENTER_R },
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
            {/* Nodes — active = full color, inactive = faded for easier pattern reading */}
            {nodes.map((n) => {
              const px = center + n.x * radius;
              const py = center + n.y * radius;
              const color = nodeColor(n);
              const isActive = n.brightness >= 0.5 || n.flickering;
              const nodeOpacity = isActive ? 1 : 0.35;
              return (
                <Pressable
                  key={n.id}
                  onPress={() => onNodePress?.(n)}
                  style={[
                    styles.node,
                    {
                      left: px - NODE_R,
                      top: py - NODE_R,
                      width: NODE_R * 2,
                      height: NODE_R * 2,
                      borderRadius: NODE_R,
                      backgroundColor: color,
                      opacity: nodeOpacity,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  canvas: { overflow: 'hidden' },
  inner: { position: 'absolute', left: 0, top: 0 },
  centerDot: { position: 'absolute', backgroundColor: COLORS.accent },
  line: { position: 'absolute', transformOrigin: 'left center' },
  node: { position: 'absolute' },
});
