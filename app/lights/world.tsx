/**
 * World Temperature — Real-world interactive map.
 * Your circle vs World. Share-worthy.
 */

import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions, Share as RNShare, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useCircleStore } from '../../src/stores/circleStore';
import { useLightsStore } from '../../src/stores/lightsStore';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/lib/constants';
import { getWorldTemperatureData, getCircleTemperatureAverage, WORLD_TEMP_COLORS } from '../../src/services/worldTemperatureMap';
import type { WorldRegionPoint } from '../../src/types/worldTemperature';

function buildMapHTML(regionPoints: WorldRegionPoint[]): string {
  const pointsJson = JSON.stringify(
    regionPoints.map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      temperature: p.temperature,
      userCount: p.userCount,
      needsHelpCount: p.needsHelpCount,
    }))
  );
  const green = WORLD_TEMP_COLORS.green;
  const yellow = WORLD_TEMP_COLORS.yellow;
  const orange = WORLD_TEMP_COLORS.orange;
  const red = WORLD_TEMP_COLORS.red;

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0A0B0F; }
    #map { width: 100%; height: 100vh; min-height: 320px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function() {
      var points = ${pointsJson};
      var colors = { green: '${green}', yellow: '${yellow}', orange: '${orange}', red: '${red}' };
      var worldBounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));
      var map = L.map('map', {
        zoomControl: true,
        minZoom: 2,
        maxZoom: 12,
        maxBounds: worldBounds,
        maxBoundsViscosity: 1,
        worldCopyJump: false
      }).setView([25, 10], 2);
      map.setMaxBounds(worldBounds);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, &copy; CARTO',
        minZoom: 2,
        maxZoom: 19,
        noWrap: true
      }).addTo(map);
      var maxUsers = Math.max.apply(null, points.map(function(p) { return p.userCount; })) || 1;
      points.forEach(function(p) {
        var radius = Math.max(12, Math.min(80, 8 + (p.userCount / maxUsers) * 70));
        var color = colors[p.temperature] || colors.yellow;
        var circle = L.circle([p.lat, p.lng], {
          radius: radius * 8000,
          color: color,
          fillColor: color,
          fillOpacity: 0.55,
          weight: 2
        }).addTo(map);
        circle.bindTooltip(p.name + ': ' + p.userCount + ' users' + (p.needsHelpCount > 0 ? ' · ' + p.needsHelpCount + ' need support' : ''), {
          permanent: false,
          direction: 'top',
          className: 'dark-tooltip'
        });
        if (p.needsHelpCount > 0) {
          var pulseRadius = radius * 1.5 * 8000;
          var pulseCircle = L.circle([p.lat, p.lng], {
            radius: pulseRadius,
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            weight: 1
          }).addTo(map);
          var step = 0;
          setInterval(function() {
            step += 0.08;
            var scale = 1 + 0.35 * Math.sin(step);
            pulseCircle.setRadius(pulseRadius * scale);
            pulseCircle.setStyle({ fillOpacity: 0.08 + 0.12 * (0.5 + 0.5 * Math.sin(step)) });
          }, 120);
        }
      });
    })();
  </script>
</body>
</html>`;
}

export default function WorldTemperatureScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const members = useCircleStore((s) => s.members ?? []);
  const membersSafe = useMemo(() => (Array.isArray(members) ? members : []), [members]);
  const getLights = useLightsStore((s) => s.getLights);
  const lights = useMemo(() => {
    try {
      return getLights(membersSafe);
    } catch {
      return [];
    }
  }, [getLights, membersSafe]);

  const data = useMemo(() => getWorldTemperatureData(), []);
  const mapHTML = useMemo(() => buildMapHTML(data.regionPoints), [data.regionPoints]);
  const circleTemp = useMemo(() => getCircleTemperatureAverage(lights), [lights]);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await RNShare.share({
        message: `World Temperature today: ${data.worldAverageValue}° ${data.worldAverageLabel}. ${data.totalCheckInsToday.toLocaleString()} check-ins. We're all in this together. AllN1 Psych — You Are Not Alone.`,
        title: 'World Temperature',
      });
    } catch (e) {
      if ((e as { message?: string })?.message !== 'User did not share') {
        Alert.alert('Share', 'Could not open share sheet.');
      }
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 4) }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>World Temperature</Text>
        <Pressable onPress={handleShare} style={styles.shareBtn} hitSlop={12}>
          <Ionicons name="share-outline" size={20} color={COLORS.accent} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: WORLD_TEMP_COLORS.green }]} />
            <Text style={styles.legendLabel}>Green — doing well</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: WORLD_TEMP_COLORS.yellow }]} />
            <Text style={styles.legendLabel}>Yellow — could use love</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: WORLD_TEMP_COLORS.orange }]} />
            <Text style={styles.legendLabel}>Orange — needs attention</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: WORLD_TEMP_COLORS.red }]} />
            <Text style={styles.legendLabel}>Red — struggling</Text>
          </View>
          <Text style={styles.legendHint}>Pulsing regions = people who need support</Text>
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="people" size={16} color={COLORS.textMuted} />
          <Text style={styles.disclaimerText}>Based on app users only. Anonymous, aggregated by region.</Text>
        </View>

        <View style={[styles.mapWrap, { height: Math.min(260, width * 0.78) }]}>
          <WebView
            source={{ html: mapHTML }}
            style={styles.map}
            scrollEnabled={true}
            bounces={false}
            overScrollMode="never"
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            pointerEvents="auto"
          />
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryTitle}>{data.worldAverageValue}° {data.worldAverageLabel}</Text>
          <Text style={styles.summarySub}>{data.totalCheckInsToday.toLocaleString()} check-ins today</Text>
        </View>

        {circleTemp && (
          <View style={styles.vsCard}>
            <Text style={styles.vsTitle}>Your circle vs World</Text>
            <View style={styles.vsRow}>
              <Text style={styles.vsLabel}>Your circle</Text>
              <Text style={styles.vsValue}>{circleTemp.value}° {circleTemp.label}</Text>
            </View>
            <View style={styles.vsRow}>
              <Text style={styles.vsLabel}>World</Text>
              <Text style={styles.vsValue}>{data.worldAverageValue}° {data.worldAverageLabel}</Text>
            </View>
            <Text style={styles.vsInsight}>
              {circleTemp.value > data.worldAverageValue + 5
                ? 'Your circle is warmer than the world right now.'
                : circleTemp.value < data.worldAverageValue - 5
                  ? 'Your circle could use a little more warmth — reach out.'
                  : 'Your circle is in sync with the world.'}
            </Text>
          </View>
        )}

        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            We're all in this together. When you check in, you're adding to our collective awareness.
          </Text>
        </View>

        <View style={{ height: 12 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  shareBtn: { padding: 4 },
  content: { paddingHorizontal: 16, paddingTop: 6 },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: COLORS.textSecondary },
  legendHint: { fontSize: 11, color: COLORS.textMuted, width: '100%', marginTop: 2 },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disclaimerText: { fontSize: 11, color: COLORS.textMuted, flex: 1 },
  mapWrap: {
    width: '100%',
    borderRadius: BORDER_RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6,
  },
  map: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.card,
  },
  summaryRow: {
    marginBottom: 6,
  },
  summaryTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  summarySub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  vsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6,
  },
  vsTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  vsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  vsLabel: { fontSize: 13, color: COLORS.textSecondary },
  vsValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  vsInsight: { fontSize: 12, color: COLORS.textSecondary, marginTop: 6, lineHeight: 17 },
  quote: {
    padding: 8,
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  quoteText: { fontSize: 11, color: COLORS.textSecondary, fontStyle: 'italic', lineHeight: 16 },
});
