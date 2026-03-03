/**
 * BiometricIndicator — Small badge showing data source (Oura, Apple Health) for Body/State gauges.
 * Used by CockpitCluster when bodyBiometricSource or stateBiometricSource is set.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type BiometricSource = 'oura' | 'apple_health';

interface BiometricIndicatorProps {
  source: BiometricSource;
  fresh?: boolean;
  size?: number;
}

const SOURCE_LABEL: Record<BiometricSource, string> = {
  oura: 'Oura',
  apple_health: 'Health',
};

export function BiometricIndicator({ source, fresh = false, size = 20 }: BiometricIndicatorProps): React.ReactElement {
  return (
    <View style={[styles.badge, { minWidth: size * 1.8, height: size }]}>
      <Text style={[styles.label, { fontSize: size * 0.5 }]} numberOfLines={1}>
        {SOURCE_LABEL[source]}
        {fresh ? ' •' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  label: {
    color: '#F0F0F5',
    fontWeight: '600',
  },
});
