import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { getGaugeColor } from '../../utils/gaugeHelpers';

interface GaugeProps {
  value: number;
  size?: number;
}

export function EmotionGauge({ value, size = 80 }: GaugeProps) {
  const isSet = value >= 0;
  const color = isSet ? getGaugeColor(value) : '#5A5A6A';
  const barCount = 5;
  const barWidth = size * 0.12;
  const gap = size * 0.05;
  const totalWidth = barCount * barWidth + (barCount - 1) * gap;
  const startX = (size - totalWidth) / 2;
  const maxBarHeight = size * 0.65;
  const baseY = size * 0.75;
  const litBars = isSet ? Math.ceil((value / 100) * barCount) : 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: barCount }).map((_, i) => {
          const barHeight = maxBarHeight * ((i + 1) / barCount);
          const x = startX + i * (barWidth + gap);
          const y = baseY - barHeight;
          const isLit = i < litBars;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={barWidth / 3}
              fill={isLit ? color : '#3A3A4E'}
              stroke={isLit ? color : '#5A5A6A'}
              strokeWidth={0.5}
              opacity={isLit ? 0.9 : 0.4}
            />
          );
        })}
      </Svg>
    </View>
  );
}
