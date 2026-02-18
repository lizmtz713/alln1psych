import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Line } from 'react-native-svg';
import { getGaugeColor } from '../../utils/gaugeHelpers';

interface GaugeProps {
  value: number;
  size?: number;
}

export function AlignmentGauge({ value, size = 80 }: GaugeProps) {
  const isSet = value >= 0;
  const color = isSet ? getGaugeColor(value) : '#5A5A6A';
  const cx = size / 2;
  const cy = size / 2;
  const trackWidth = size * 0.7;
  const trackHeight = size * 0.18;
  const trackX = (size - trackWidth) / 2;
  const trackY = cy - trackHeight / 2;

  const bubbleRadius = trackHeight * 0.35;
  const travelWidth = trackWidth - bubbleRadius * 4;
  const offset = isSet ? ((100 - value) / 100) * (travelWidth / 2) : 0;
  const direction = value > 50 ? 1 : -1;
  const bubbleX = cx + offset * direction * 0.5;
  const bubbleY = cy;

  const centerZoneWidth = trackWidth * 0.2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect
          x={trackX}
          y={trackY}
          width={trackWidth}
          height={trackHeight}
          rx={trackHeight / 2}
          fill="#3A3A4E"
          stroke="#5A5A6A"
          strokeWidth={1}
        />
        <Rect
          x={cx - centerZoneWidth / 2}
          y={trackY + 2}
          width={centerZoneWidth}
          height={trackHeight - 4}
          rx={(trackHeight - 4) / 2}
          fill="rgba(52, 211, 153, 0.15)"
        />
        <Line x1={cx} y1={trackY - 2} x2={cx} y2={trackY + trackHeight + 2} stroke="#34D399" strokeWidth={1} opacity={0.4} />
        <Circle
          cx={isSet ? bubbleX : cx}
          cy={bubbleY}
          r={bubbleRadius}
          fill={isSet ? color : '#5A5A6A'}
          opacity={isSet ? 0.9 : 0.3}
        />
      </Svg>
    </View>
  );
}
