import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { getGaugeColor } from '../../utils/gaugeHelpers';

interface GaugeProps {
  value: number;
  size?: number;
}

export function DirectionGauge({ value, size = 80 }: GaugeProps) {
  const isSet = value >= 0;
  const color = isSet ? getGaugeColor(value) : '#2A2A3A';
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const tiltDeg = isSet ? 90 - (value / 100) * 90 : 45;
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const needleLength = radius * 0.75;
  const tipX = cx + needleLength * Math.sin(tiltRad);
  const tipY = cy - needleLength * Math.cos(tiltRad);
  const tailX = cx - needleLength * 0.3 * Math.sin(tiltRad);
  const tailY = cy + needleLength * 0.3 * Math.cos(tiltRad);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={cx} cy={cy} r={radius} fill="none" stroke={isSet ? 'rgba(255,255,255,0.1)' : '#1A1A2E'} strokeWidth={1.5} />
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const innerR = radius * 0.85;
          return (
            <Line
              key={i}
              x1={cx + innerR * Math.sin(rad)}
              y1={cy - innerR * Math.cos(rad)}
              x2={cx + radius * Math.sin(rad)}
              y2={cy - radius * Math.cos(rad)}
              stroke="#2A2A3A"
              strokeWidth={1.5}
            />
          );
        })}
        <Line x1={tailX} y1={tailY} x2={tipX} y2={tipY} stroke={isSet ? color : '#2A2A3A'} strokeWidth={2.5} strokeLinecap="round" />
        <Circle cx={tipX} cy={tipY} r={2.5} fill={isSet ? color : '#2A2A3A'} />
        <Circle cx={cx} cy={cy} r={3} fill={isSet ? '#F0F0F5' : '#2A2A3A'} />
      </Svg>
    </View>
  );
}
