/**
 * Smart Notifications Service
 * 
 * Learns user patterns and delivers the right notification
 * at the right time.
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ============ Types ============

export interface CheckInEvent {
  timestamp: string;
  dayOfWeek: number;        // 0-6, Sunday = 0
  hourOfDay: number;        // 0-23
  source: 'organic' | 'notification' | 'widget' | 'circle_prompt';
  sessionDuration?: number; // seconds
  gaugesLogged: number;
}

export interface TimeWindow {
  centerHour: number;       // 0-23
  windowSize: number;       // minutes
  confidence: number;       // 0-1
  dayMask: number[];        // which days this applies to
}

export interface NotificationSettings {
  enabled: boolean;
  quietHoursStart: number;  // hour (e.g., 22 for 10pm)
  quietHoursEnd: number;    // hour (e.g., 7 for 7am)
  maxPerDay: number;
  checkInReminders: boolean;
  circleAlerts: boolean;
  insightNudges: boolean;
  streakReminders: boolean;
}

export type NotificationType = 
  | 'check_in_reminder'
  | 'circle_alert'
  | 'streak_at_risk'
  | 'insight_nudge'
  | 'cycle_context'
  | 'pattern_detected'
  | 'gentle_reconnect';

interface ScheduledNotification {
  id: string;
  type: NotificationType;
  scheduledFor: string;
  title: string;
  body: string;
}

// ============ Constants ============

const STORAGE_KEYS = {
  checkInHistory: 'smart_notif_checkin_history',
  optimalWindows: 'smart_notif_optimal_windows',
  settings: 'smart_notif_settings',
  lastNotifications: 'smart_notif_last_sent',
  notificationCount: 'smart_notif_daily_count',
};

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  maxPerDay: 3,
  checkInReminders: true,
  circleAlerts: true,
  insightNudges: true,
  streakReminders: true,
};

const DECAY_FACTOR = 0.85; // Per week
const MIN_DATA_POINTS = 7;
const CONFIDENCE_THRESHOLD = 0.6;

// ============ Notification Content ============

interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationContent[]> = {
  check_in_reminder: [
    { title: 'Quick check-in?', body: 'Take 30 seconds to see where you are right now.' },
    { title: 'How are you?', body: 'Your dashboard is waiting. Just a quick read.' },
    { title: '💜 Moment for yourself', body: 'A quick check-in helps you stay aware.' },
    { title: 'Your system check', body: "How's the cockpit looking today?" },
  ],
  circle_alert: [
    { title: '{name} might need support', body: 'Their temperature dropped to {temp}°' },
    { title: '💜 {name} is struggling', body: 'Consider reaching out.' },
  ],
  streak_at_risk: [
    { title: '🔥 Keep your streak!', body: "You haven't checked in today. Don't break {days} days!" },
    { title: 'One quick check-in', body: 'Keep your {days}-day streak going!' },
  ],
  insight_nudge: [
    { title: '💡 Pattern spotted', body: 'Your {gauge} gauge tends to dip on {day}s.' },
    { title: 'Did you know?', body: "You've been most regulated when you {insight}." },
  ],
  cycle_context: [
    { title: '🌙 Cycle reminder', body: "You're entering {phase} phase. Be gentle with yourself." },
    { title: 'Heads up', body: '{days} days until your period. Your patterns suggest lighter scheduling.' },
  ],
  pattern_detected: [
    { title: '📊 New pattern found', body: 'Your {gauge} connects to your {trigger}. Tap to explore.' },
  ],
  gentle_reconnect: [
    { title: 'Hey, we miss you', body: "It's been {days} days. Everything okay?" },
    { title: '💜 Still here', body: 'No pressure — just checking in when you are ready.' },
  ],
};

// ============ Pattern Learning ============

class PatternLearner {
  async getCheckInHistory(): Promise<CheckInEvent[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.checkInHistory);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async recordCheckIn(event: Omit<CheckInEvent, 'timestamp' | 'dayOfWeek' | 'hourOfDay'>): Promise<void> {
    const now = new Date();
    const fullEvent: CheckInEvent = {
      ...event,
      timestamp: now.toISOString(),
      dayOfWeek: now.getDay(),
      hourOfDay: now.getHours(),
    };

    const history = await this.getCheckInHistory();
    
    // Keep last 90 days
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const filtered = history.filter(e => new Date(e.timestamp).getTime() > ninetyDaysAgo);
    
    filtered.push(fullEvent);
    await AsyncStorage.setItem(STORAGE_KEYS.checkInHistory, JSON.stringify(filtered));
    
    // Recalculate optimal windows
    await this.calculateOptimalWindows();
  }

  async calculateOptimalWindows(): Promise<TimeWindow[]> {
    const history = await this.getCheckInHistory();
    
    if (history.length < MIN_DATA_POINTS) {
      // Return default windows for cold start
      return this.getDefaultWindows();
    }

    // Weight recent check-ins more heavily
    const now = Date.now();
    const weightedByHour: Record<number, number> = {};
    
    history.forEach(event => {
      const ageWeeks = (now - new Date(event.timestamp).getTime()) / (7 * 24 * 60 * 60 * 1000);
      const weight = Math.pow(DECAY_FACTOR, ageWeeks);
      
      const hour = event.hourOfDay;
      weightedByHour[hour] = (weightedByHour[hour] || 0) + weight;
    });

    // Find peak hours
    const peaks: TimeWindow[] = [];
    const hours = Object.entries(weightedByHour)
      .map(([h, w]) => ({ hour: parseInt(h), weight: w }))
      .sort((a, b) => b.weight - a.weight);

    // Take top 2 time windows
    const maxWeight = hours[0]?.weight || 1;
    
    for (let i = 0; i < Math.min(2, hours.length); i++) {
      const h = hours[i];
      if (h.weight / maxWeight >= CONFIDENCE_THRESHOLD) {
        peaks.push({
          centerHour: h.hour,
          windowSize: 90,
          confidence: h.weight / maxWeight,
          dayMask: [0, 1, 2, 3, 4, 5, 6], // All days for now
        });
      }
    }

    if (peaks.length === 0) {
      return this.getDefaultWindows();
    }

    await AsyncStorage.setItem(STORAGE_KEYS.optimalWindows, JSON.stringify(peaks));
    return peaks;
  }

  getDefaultWindows(): TimeWindow[] {
    // Default: 9am and 8pm
    return [
      { centerHour: 9, windowSize: 90, confidence: 0.5, dayMask: [0, 1, 2, 3, 4, 5, 6] },
      { centerHour: 20, windowSize: 90, confidence: 0.5, dayMask: [0, 1, 2, 3, 4, 5, 6] },
    ];
  }

  async getOptimalWindows(): Promise<TimeWindow[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.optimalWindows);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fall through to default
    }
    return this.getDefaultWindows();
  }
}

// ============ Notification Scheduler ============

class NotificationScheduler {
  private learner = new PatternLearner();

  async getSettings(): Promise<NotificationSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.settings);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(partial: Partial<NotificationSettings>): Promise<void> {
    const current = await this.getSettings();
    const updated = { ...current, ...partial };
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated));
    
    // Reschedule notifications with new settings
    await this.scheduleSmartNotifications();
  }

  isInQuietHours(settings: NotificationSettings): boolean {
    const hour = new Date().getHours();
    
    if (settings.quietHoursStart < settings.quietHoursEnd) {
      // Same day quiet hours (e.g., 10am-6pm)
      return hour >= settings.quietHoursStart && hour < settings.quietHoursEnd;
    } else {
      // Overnight quiet hours (e.g., 10pm-7am)
      return hour >= settings.quietHoursStart || hour < settings.quietHoursEnd;
    }
  }

  async canSendNotification(type: NotificationType): Promise<boolean> {
    const settings = await this.getSettings();
    
    if (!settings.enabled) return false;
    if (this.isInQuietHours(settings)) return false;
    
    // Check daily limit
    const today = new Date().toDateString();
    const countKey = `${STORAGE_KEYS.notificationCount}_${today}`;
    const countStr = await AsyncStorage.getItem(countKey);
    const count = countStr ? parseInt(countStr) : 0;
    
    if (count >= settings.maxPerDay) return false;
    
    // Check type-specific settings
    switch (type) {
      case 'check_in_reminder':
        return settings.checkInReminders;
      case 'circle_alert':
        return settings.circleAlerts;
      case 'insight_nudge':
      case 'pattern_detected':
        return settings.insightNudges;
      case 'streak_at_risk':
        return settings.streakReminders;
      default:
        return true;
    }
  }

  async incrementDailyCount(): Promise<void> {
    const today = new Date().toDateString();
    const countKey = `${STORAGE_KEYS.notificationCount}_${today}`;
    const countStr = await AsyncStorage.getItem(countKey);
    const count = countStr ? parseInt(countStr) : 0;
    await AsyncStorage.setItem(countKey, String(count + 1));
  }

  getRandomTemplate(type: NotificationType): NotificationContent {
    const templates = NOTIFICATION_TEMPLATES[type];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  async scheduleSmartNotifications(): Promise<void> {
    // Cancel existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.checkInReminders) return;
    
    const windows = await this.learner.getOptimalWindows();
    
    // Schedule for next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);
      
      for (const window of windows) {
        // Skip if in quiet hours
        if (window.centerHour >= settings.quietHoursStart || 
            window.centerHour < settings.quietHoursEnd) {
          continue;
        }
        
        // Add some randomness within window
        const minuteOffset = Math.floor(Math.random() * window.windowSize) - window.windowSize / 2;
        
        targetDate.setHours(window.centerHour);
        targetDate.setMinutes(Math.max(0, Math.min(59, 30 + minuteOffset)));
        targetDate.setSeconds(0);
        
        // Don't schedule in the past
        if (targetDate.getTime() <= Date.now()) continue;
        
        const template = this.getRandomTemplate('check_in_reminder');
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: template.title,
            body: template.body,
            data: { type: 'check_in_reminder' },
            sound: true,
          },
          trigger: {
            date: targetDate,
          },
        });
      }
    }
  }

  async sendImmediateNotification(
    type: NotificationType, 
    params?: Record<string, string | number>
  ): Promise<boolean> {
    if (!(await this.canSendNotification(type))) {
      return false;
    }

    let template = this.getRandomTemplate(type);
    
    // Replace placeholders
    if (params) {
      let title = template.title;
      let body = template.body;
      
      Object.entries(params).forEach(([key, value]) => {
        title = title.replace(`{${key}}`, String(value));
        body = body.replace(`{${key}}`, String(value));
      });
      
      template = { title, body };
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: template.title,
        body: template.body,
        data: { type },
        sound: true,
      },
      trigger: null, // Immediate
    });

    await this.incrementDailyCount();
    return true;
  }
}

// ============ Exported Functions ============

const learner = new PatternLearner();
const scheduler = new NotificationScheduler();

export async function initializeSmartNotifications(): Promise<void> {
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('[SmartNotif] Permission not granted');
    return;
  }

  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Schedule initial notifications
  await scheduler.scheduleSmartNotifications();
}

export async function recordCheckIn(
  source: CheckInEvent['source'], 
  gaugesLogged: number,
  sessionDuration?: number
): Promise<void> {
  await learner.recordCheckIn({ source, gaugesLogged, sessionDuration });
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return scheduler.getSettings();
}

export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<void> {
  await scheduler.updateSettings(settings);
}

export async function sendCircleAlert(memberName: string, temperature: number): Promise<boolean> {
  return scheduler.sendImmediateNotification('circle_alert', {
    name: memberName,
    temp: temperature,
  });
}

export async function sendStreakReminder(streakDays: number): Promise<boolean> {
  return scheduler.sendImmediateNotification('streak_at_risk', {
    days: streakDays,
  });
}

export async function sendCycleReminder(phase: string, daysUntilPeriod?: number): Promise<boolean> {
  if (daysUntilPeriod !== undefined && daysUntilPeriod <= 3) {
    return scheduler.sendImmediateNotification('cycle_context', {
      days: daysUntilPeriod,
    });
  }
  return scheduler.sendImmediateNotification('cycle_context', { phase });
}

export async function sendGentleReconnect(daysSinceActive: number): Promise<boolean> {
  return scheduler.sendImmediateNotification('gentle_reconnect', {
    days: daysSinceActive,
  });
}

export async function sendPatternInsight(gauge: string, insight: string): Promise<boolean> {
  return scheduler.sendImmediateNotification('insight_nudge', {
    gauge,
    insight,
  });
}

export async function rescheduleNotifications(): Promise<void> {
  await scheduler.scheduleSmartNotifications();
}

export async function getOptimalCheckInWindows(): Promise<TimeWindow[]> {
  return learner.getOptimalWindows();
}

export { PatternLearner, NotificationScheduler };
