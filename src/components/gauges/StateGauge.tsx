import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { getGaugeColor } from '../../utils/gaugeHelpers';

interface GaugeProps {
  value: number;
  size?: number;
}

export function StateGauge({ value, size = 80 }: GaugeProps) {
  const isSet = value >= 0;
  const color = isSet ? getGaugeColor(value) : '#5A5A6A';
  const cx = size / 2;
  const cy = size * 0.6;
  const radius = size * 0.38;

  const angle = isSet ? Math.PI - (value / 100) * Math.PI : Math.PI / 2;
  const needleLength = radius * 0.85;
  const needleX = cx + needleLength * Math.cos(angle);
  const needleY = cy - needleLength * Math.sin(angle);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[
          { start: 0, end: 0.25, color: '#F87171' },
          { start: 0.25, end: 0.5, color: '#FB923C' },
          { start: 0.5, end: 0.75, color: '#FBBF24' },
          { start: 0.75, end: 1, color: '#34D399' },
        ].map((seg, i) => {
          const startAngle = seg.start * Math.PI;
          const endAngle = seg.end * Math.PI;
          const x1 = cx + radius * Math.cos(Math.PI - startAngle);
          const y1 = cy - radius * Math.sin(Math.PI - startAngle);
          const x2 = cx + radius * Math.cos(Math.PI - endAngle);
          const y2 = cy - radius * Math.sin(Math.PI - endAngle);
          return (
            <Path
              key={i}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 0 ${x2} ${y2}`}
              stroke={isSet ? seg.color : '#5A5A6A'}
              strokeWidth={4}
              fill="none"
              opacity={isSet ? 0.7 : 0.3}
            />
          );
        })}
        <Line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={isSet ? color : '#5A5A6A'} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={cx} cy={cy} r={3} fill={isSet ? color : '#5A5A6A'} />
      </Svg>
    </View>
  );
}
