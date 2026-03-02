# InGauge iOS Widget Build Guide

## Overview

Home screen widget showing current gauge snapshot. Drives daily engagement without opening app.

## Widget Types

### 1. Small Widget (2x2)
```
┌─────────────────┐
│   InGauge       │
│                 │
│   Body    72    │
│   State   58    │
│   ───────────── │
│   Tap to check  │
└─────────────────┘
```

### 2. Medium Widget (4x2)  
```
┌───────────────────────────────────────┐
│  InGauge              Today 9:42 AM   │
│                                       │
│  🧬 Body 72  ⚡ State 58  💜 Emo 84   │
│  🤝 Conn 45  🧭 Dir 67   ⭐ Align 91  │
│                                       │
│  "Your State is low but rising" 💡    │
└───────────────────────────────────────┘
```

### 3. Large Widget (4x4)
```
┌───────────────────────────────────────┐
│  InGauge                    9:42 AM   │
│  ─────────────────────────────────    │
│                                       │
│     Body ████████░░ 72                │
│    State █████░░░░░ 58 ↓              │
│  Emotion ████████░░ 84                │
│   Connect ████░░░░░ 45 ⚠️             │
│ Direction ██████░░░ 67                │
│ Alignment █████████ 91 ↑              │
│                                       │
│  ─────────────────────────────────    │
│  💡 "Connection low for 2 days.       │
│      Reach out to someone today?"     │
│                                       │
│  [Check In]              [Talk] 💬    │
└───────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Add Widget Target in Xcode

1. Open `ios/InGauge.xcworkspace` in Xcode
2. File → New → Target
3. Select "Widget Extension"
4. Name: `InGaugeWidget`
5. Uncheck "Include Configuration Intent" (we'll use static config first)

### Step 2: Enable App Groups

Both main app and widget need to share data:

1. In Xcode, select main app target
2. Signing & Capabilities → + Capability → App Groups
3. Add group: `group.com.alln1network.psych.shared`
4. Repeat for widget target

### Step 3: Create Shared Data Store

Widget reads from shared UserDefaults:

```swift
// In main app (React Native bridge)
let sharedDefaults = UserDefaults(suiteName: "group.com.alln1network.psych.shared")
sharedDefaults?.set(gaugeData, forKey: "currentGauges")
```

### Step 4: Widget Swift Code

See `InGaugeWidget.swift` below.

---

## Widget Swift Implementation

```swift
// InGaugeWidget.swift

import WidgetKit
import SwiftUI

// MARK: - Data Models

struct GaugeData: Codable {
    let body: Int?
    let state: Int?
    let emotion: Int?
    let connection: Int?
    let direction: Int?
    let alignment: Int?
    let lastCheckIn: Date?
    let insight: String?
}

// MARK: - Timeline Provider

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> GaugeEntry {
        GaugeEntry(date: Date(), gauges: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (GaugeEntry) -> ()) {
        let entry = GaugeEntry(date: Date(), gauges: loadGaugeData())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let currentDate = Date()
        let entry = GaugeEntry(date: currentDate, gauges: loadGaugeData())
        
        // Refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadGaugeData() -> GaugeData? {
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.alln1network.psych.shared"),
              let data = sharedDefaults.data(forKey: "currentGauges") else {
            return nil
        }
        return try? JSONDecoder().decode(GaugeData.self, from: data)
    }
}

// MARK: - Entry

struct GaugeEntry: TimelineEntry {
    let date: Date
    let gauges: GaugeData?
}

// MARK: - Widget Views

struct SmallWidgetView: View {
    let entry: GaugeEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("InGauge")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.purple)
            
            Spacer()
            
            if let gauges = entry.gauges {
                HStack {
                    GaugeMini(label: "Body", value: gauges.body)
                    Spacer()
                    GaugeMini(label: "State", value: gauges.state)
                }
                HStack {
                    GaugeMini(label: "Emotion", value: gauges.emotion)
                    Spacer()
                    GaugeMini(label: "Connect", value: gauges.connection)
                }
            } else {
                Text("Tap to check in")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding()
    }
}

struct MediumWidgetView: View {
    let entry: GaugeEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("InGauge")
                    .font(.headline)
                    .fontWeight(.bold)
                Spacer()
                if let lastCheck = entry.gauges?.lastCheckIn {
                    Text(lastCheck, style: .time)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            if let gauges = entry.gauges {
                HStack(spacing: 16) {
                    GaugeCompact(emoji: "🧬", label: "Body", value: gauges.body)
                    GaugeCompact(emoji: "⚡", label: "State", value: gauges.state)
                    GaugeCompact(emoji: "💜", label: "Emo", value: gauges.emotion)
                }
                HStack(spacing: 16) {
                    GaugeCompact(emoji: "🤝", label: "Conn", value: gauges.connection)
                    GaugeCompact(emoji: "🧭", label: "Dir", value: gauges.direction)
                    GaugeCompact(emoji: "⭐", label: "Align", value: gauges.alignment)
                }
                
                if let insight = gauges.insight {
                    Text(insight)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            } else {
                Spacer()
                Text("Tap to check in")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
            }
        }
        .padding()
    }
}

struct LargeWidgetView: View {
    let entry: GaugeEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Text("InGauge")
                    .font(.title2)
                    .fontWeight(.bold)
                Spacer()
                if let lastCheck = entry.gauges?.lastCheckIn {
                    Text(lastCheck, style: .time)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Divider()
            
            if let gauges = entry.gauges {
                // Gauge bars
                VStack(spacing: 8) {
                    GaugeBar(label: "Body", value: gauges.body, color: .green)
                    GaugeBar(label: "State", value: gauges.state, color: .yellow)
                    GaugeBar(label: "Emotion", value: gauges.emotion, color: .purple)
                    GaugeBar(label: "Connection", value: gauges.connection, color: .pink)
                    GaugeBar(label: "Direction", value: gauges.direction, color: .blue)
                    GaugeBar(label: "Alignment", value: gauges.alignment, color: .orange)
                }
                
                Divider()
                
                // Insight
                if let insight = gauges.insight {
                    HStack(alignment: .top) {
                        Text("💡")
                        Text(insight)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                // Action buttons
                HStack {
                    Link(destination: URL(string: "ingauge://checkin")!) {
                        Text("Check In")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color.purple)
                            .foregroundColor(.white)
                            .cornerRadius(20)
                    }
                    Spacer()
                    Link(destination: URL(string: "ingauge://talk")!) {
                        HStack {
                            Text("Talk")
                            Text("💬")
                        }
                        .font(.caption)
                        .fontWeight(.semibold)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.purple.opacity(0.2))
                        .foregroundColor(.purple)
                        .cornerRadius(20)
                    }
                }
            } else {
                Spacer()
                VStack {
                    Text("👋")
                        .font(.largeTitle)
                    Text("Tap to check in")
                        .font(.headline)
                    Text("See how you're really doing")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                Spacer()
            }
        }
        .padding()
    }
}

// MARK: - Helper Views

struct GaugeMini: View {
    let label: String
    let value: Int?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(value.map { "\($0)" } ?? "—")
                .font(.title3)
                .fontWeight(.semibold)
        }
    }
}

struct GaugeCompact: View {
    let emoji: String
    let label: String
    let value: Int?
    
    var body: some View {
        HStack(spacing: 4) {
            Text(emoji)
                .font(.caption)
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(value.map { "\($0)" } ?? "—")
                .font(.caption)
                .fontWeight(.semibold)
        }
    }
}

struct GaugeBar: View {
    let label: String
    let value: Int?
    let color: Color
    
    var body: some View {
        HStack {
            Text(label)
                .font(.caption)
                .frame(width: 70, alignment: .leading)
            
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.2))
                    
                    if let v = value {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(color)
                            .frame(width: geo.size.width * CGFloat(v) / 100)
                    }
                }
            }
            .frame(height: 8)
            
            Text(value.map { "\($0)" } ?? "—")
                .font(.caption)
                .fontWeight(.semibold)
                .frame(width: 30, alignment: .trailing)
        }
    }
}

// MARK: - Widget Configuration

@main
struct InGaugeWidget: Widget {
    let kind: String = "InGaugeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            InGaugeWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("InGauge")
        .description("See your current gauge state at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct InGaugeWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: GaugeEntry
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        @unknown default:
            SmallWidgetView(entry: entry)
        }
    }
}
```

---

## React Native Bridge

Create native module to write gauge data to shared UserDefaults:

```typescript
// src/native/WidgetBridge.ts

import { NativeModules, Platform } from 'react-native';

const { WidgetBridge } = NativeModules;

export interface WidgetGaugeData {
  body: number | null;
  state: number | null;
  emotion: number | null;
  connection: number | null;
  direction: number | null;
  alignment: number | null;
  lastCheckIn: string; // ISO date
  insight: string | null;
}

export const updateWidget = async (data: WidgetGaugeData): Promise<void> => {
  if (Platform.OS !== 'ios') return;
  
  try {
    await WidgetBridge?.updateGaugeData(data);
  } catch (error) {
    console.warn('[Widget] Failed to update:', error);
  }
};

export const refreshWidget = async (): Promise<void> => {
  if (Platform.OS !== 'ios') return;
  
  try {
    await WidgetBridge?.refreshWidget();
  } catch (error) {
    console.warn('[Widget] Failed to refresh:', error);
  }
};
```

```swift
// ios/WidgetBridge.swift

import Foundation
import WidgetKit

@objc(WidgetBridge)
class WidgetBridge: NSObject {
  
  @objc
  func updateGaugeData(_ data: NSDictionary) {
    guard let sharedDefaults = UserDefaults(suiteName: "group.com.alln1network.psych.shared") else {
      return
    }
    
    let gaugeData: [String: Any] = [
      "body": data["body"] as? Int ?? NSNull(),
      "state": data["state"] as? Int ?? NSNull(),
      "emotion": data["emotion"] as? Int ?? NSNull(),
      "connection": data["connection"] as? Int ?? NSNull(),
      "direction": data["direction"] as? Int ?? NSNull(),
      "alignment": data["alignment"] as? Int ?? NSNull(),
      "lastCheckIn": data["lastCheckIn"] as? String ?? "",
      "insight": data["insight"] as? String ?? NSNull()
    ]
    
    if let jsonData = try? JSONSerialization.data(withJSONObject: gaugeData) {
      sharedDefaults.set(jsonData, forKey: "currentGauges")
    }
    
    // Trigger widget refresh
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
  
  @objc
  func refreshWidget() {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
```

---

## Integration with Cockpit Store

Update cockpit store to push to widget after check-in:

```typescript
// In cockpitStore.ts, after saving check-in:

import { updateWidget } from '../native/WidgetBridge';

// After saving gauges:
updateWidget({
  body: state.body.value,
  state: state.state.value,
  emotion: state.emotion.value,
  connection: state.connection.value,
  direction: state.direction.value,
  alignment: state.alignment.value,
  lastCheckIn: new Date().toISOString(),
  insight: state.crossSystemInsight,
});
```

---

## Deep Links

Add URL scheme handling for widget taps:

```typescript
// App.tsx or navigation setup

import { Linking } from 'react-native';

// Handle deep links
Linking.addEventListener('url', ({ url }) => {
  if (url === 'ingauge://checkin') {
    router.push('/(modals)/cockpit-checkin');
  } else if (url === 'ingauge://talk') {
    router.push('/(tabs)/talk');
  }
});
```

---

## Testing

1. Build and run on physical device (widgets don't work in simulator well)
2. Add widget to home screen
3. Complete a check-in
4. Verify widget updates within 30 seconds
5. Tap widget to open app

---

## Next Steps After Widget

1. Lock screen widgets (iOS 16+)
2. Watch complications
3. Interactive widgets (iOS 17+) for quick check-in
