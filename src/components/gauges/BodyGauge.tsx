import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { getGaugeColor } from '../../utils/gaugeHelpers';

interface GaugeProps {
  value: number;
  size?: number;
}

export function BodyGauge({ value, size = 80 }: GaugeProps) {
  const isSet = value >= 0;
  const fillPercent = isSet ? value / 100 : 0;
  const color = isSet ? getGaugeColor(value) : '#5A5A6A';
  const barWidth = size * 0.35;
  const barHeight = size * 0.85;
  const fillHeight = barHeight * fillPercent;
  const svgW = barWidth + 8;
  const svgH = barHeight + 8;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={svgW} height={svgH} viewBox={'0 0 ' + svgW + ' ' + svgH}>
        <Rect x={4} y={4} width={barWidth} height={barHeight} rx={barWidth / 2} fill="#3A3A4E" stroke="#5A5A6A" strokeWidth={1} />
        {isSet && (
          <Rect
            x={6}
            y={4 + barHeight - fillHeight + 2}
            width={barWidth - 4}
            height={Math.max(0, fillHeight - 4)}
            rx={(barWidth - 4) / 2}
            fill={color}
            opacity={0.9}
          />
        )}
        {[0.25, 0.5, 0.75].map((tick, i) => (
          <Rect key={i} x={0} y={4 + barHeight * (1 - tick)} width={4} height={1} fill="#5A5A6A" />
        ))}
      </Svg>
    </View>
  );
}
