import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getGaugeColor } from '../../utils/gaugeHelpers';

interface GaugeProps {
  value: number;
  size?: number;
}

export function ConnectionGauge({ value, size = 80 }: GaugeProps) {
  const isSet = value >= 0;
  const color = isSet ? getGaugeColor(value) : '#5A5A6A';
  const cx = size / 2;
  const cy = size / 2;
  const ringCount = 4;
  const maxRadius = size * 0.4;
  const activeRings = isSet ? Math.ceil((value / 100) * ringCount) : 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={'0 0 ' + size + ' ' + size}>
        {Array.from({ length: ringCount }).map((_, i) => {
          const radius = maxRadius * ((i + 1) / ringCount);
          const isActive = i < activeRings;
          return (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={isActive ? color : '#5A5A6A'}
              strokeWidth={isActive ? 2 : 1}
              opacity={isActive ? 0.8 - i * 0.15 : 0.2}
            />
          );
        })}
        <Circle cx={cx} cy={cy} r={3} fill={isSet ? color : '#5A5A6A'} />
      </Svg>
    </View>
  );
}
