/**
 * Apple HealthKit Integration
 * 
 * Pulls data for Body gauge:
 * - Sleep (duration, quality)
 * - Activity (steps, exercise minutes, calories)
 * - Nutrition (water, calories in)
 * - Menstruation (cycle tracking)
 * - Heart rate & HRV (for State gauge)
 */

import { Platform } from 'react-native';

// Types for health data
export interface SleepData {
  lastNight: {
    duration: number; // hours
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    bedTime: Date | null;
    wakeTime: Date | null;
  };
  weekAverage: number; // hours
}

export interface ActivityData {
  steps: number;
  stepsGoal: number;
  exerciseMinutes: number;
  exerciseGoal: number;
  activeCalories: number;
  standHours: number;
}

export interface NutritionData {
  waterOz: number;
  waterGoal: number;
  caloriesIn: number;
  caloriesGoal: number;
}

export interface MenstruationData {
  currentPhase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | null;
  dayOfCycle: number | null;
  cycleLength: number;
  lastPeriodStart: Date | null;
  nextPeriodPredicted: Date | null;
  symptoms: string[];
}

export interface HeartData {
  restingHR: number | null;
  currentHR: number | null;
  hrv: number | null; // Heart rate variability - great for stress/State gauge
}

export interface HealthSnapshot {
  sleep: SleepData;
  activity: ActivityData;
  nutrition: NutritionData;
  menstruation: MenstruationData | null;
  heart: HeartData;
  lastSynced: Date;
}

// Permission types we need
const HEALTH_PERMISSIONS = {
  read: [
    'SleepAnalysis',
    'StepCount',
    'ActiveEnergyBurned',
    'AppleExerciseTime',
    'AppleStandHour',
    'DietaryWater',
    'DietaryEnergyConsumed',
    'MenstrualFlow',
    'HeartRate',
    'HeartRateVariabilitySDNN',
    'RestingHeartRate',
  ],
  write: [] as string[], // We only read, don't write
};

class HealthKitService {
  private isAvailable = false;
  private isAuthorized = false;
  private AppleHealthKit: any = null;

  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('HealthKit only available on iOS');
      return false;
    }

    try {
      // Dynamic import to avoid crashes on Android
      const healthKit = require('react-native-health').default;
      this.AppleHealthKit = healthKit;

      return new Promise((resolve) => {
        healthKit.isAvailable((err: any, available: boolean) => {
          if (err || !available) {
            console.log('HealthKit not available:', err);
            resolve(false);
            return;
          }

          this.isAvailable = true;
          resolve(true);
        });
      });
    } catch (e) {
      console.log('HealthKit module not installed:', e);
      return false;
    }
  }

  async requestAuthorization(): Promise<boolean> {
    if (!this.isAvailable || !this.AppleHealthKit) return false;

    return new Promise((resolve) => {
      const permissions = {
        permissions: {
          read: HEALTH_PERMISSIONS.read,
          write: HEALTH_PERMISSIONS.write,
        },
      };

      this.AppleHealthKit.initHealthKit(permissions, (err: any) => {
        if (err) {
          console.log('HealthKit authorization failed:', err);
          resolve(false);
          return;
        }

        this.isAuthorized = true;
        resolve(true);
      });
    });
  }

  async getSleepData(): Promise<SleepData> {
    const defaultData: SleepData = {
      lastNight: { duration: 0, quality: 'fair', bedTime: null, wakeTime: null },
      weekAverage: 0,
    };

    if (!this.isAuthorized || !this.AppleHealthKit) return defaultData;

    return new Promise((resolve) => {
      const options = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 50,
      };

      this.AppleHealthKit.getSleepSamples(options, (err: any, results: any[]) => {
        if (err || !results?.length) {
          resolve(defaultData);
          return;
        }

        // Process sleep data
        const lastNightSamples = results.filter((s) => {
          const date = new Date(s.endDate);
          const today = new Date();
          return date.toDateString() === today.toDateString() ||
            (today.getHours() < 12 && new Date(today.getTime() - 12 * 60 * 60 * 1000).toDateString() === date.toDateString());
        });

        let totalLastNight = 0;
        let bedTime: Date | null = null;
        let wakeTime: Date | null = null;

        lastNightSamples.forEach((s) => {
          if (s.value === 'ASLEEP' || s.value === 'INBED') {
            const start = new Date(s.startDate);
            const end = new Date(s.endDate);
            totalLastNight += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            if (!bedTime || start < bedTime) bedTime = start;
            if (!wakeTime || end > wakeTime) wakeTime = end;
          }
        });

        // Calculate week average
        const weekTotal = results.reduce((acc, s) => {
          if (s.value === 'ASLEEP') {
            const start = new Date(s.startDate);
            const end = new Date(s.endDate);
            return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          }
          return acc;
        }, 0);

        const quality: SleepData['lastNight']['quality'] =
          totalLastNight >= 8 ? 'excellent' :
          totalLastNight >= 7 ? 'good' :
          totalLastNight >= 5 ? 'fair' : 'poor';

        resolve({
          lastNight: {
            duration: Math.round(totalLastNight * 10) / 10,
            quality,
            bedTime,
            wakeTime,
          },
          weekAverage: Math.round((weekTotal / 7) * 10) / 10,
        });
      });
    });
  }

  async getActivityData(): Promise<ActivityData> {
    const defaultData: ActivityData = {
      steps: 0,
      stepsGoal: 10000,
      exerciseMinutes: 0,
      exerciseGoal: 30,
      activeCalories: 0,
      standHours: 0,
    };

    if (!this.isAuthorized || !this.AppleHealthKit) return defaultData;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [steps, exercise, calories] = await Promise.all([
      this.getSteps(today),
      this.getExerciseMinutes(today),
      this.getActiveCalories(today),
    ]);

    return {
      steps,
      stepsGoal: 10000,
      exerciseMinutes: exercise,
      exerciseGoal: 30,
      activeCalories: calories,
      standHours: 0, // Would need separate query
    };
  }

  private getSteps(startDate: Date): Promise<number> {
    return new Promise((resolve) => {
      this.AppleHealthKit.getStepCount(
        { date: startDate.toISOString() },
        (err: any, result: { value: number }) => {
          resolve(err ? 0 : result?.value || 0);
        }
      );
    });
  }

  private getExerciseMinutes(startDate: Date): Promise<number> {
    return new Promise((resolve) => {
      this.AppleHealthKit.getAppleExerciseTime(
        { date: startDate.toISOString() },
        (err: any, result: { value: number }) => {
          resolve(err ? 0 : result?.value || 0);
        }
      );
    });
  }

  private getActiveCalories(startDate: Date): Promise<number> {
    return new Promise((resolve) => {
      this.AppleHealthKit.getActiveEnergyBurned(
        {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        },
        (err: any, results: Array<{ value: number }>) => {
          if (err || !results?.length) {
            resolve(0);
            return;
          }
          const total = results.reduce((acc, r) => acc + (r.value || 0), 0);
          resolve(Math.round(total));
        }
      );
    });
  }

  async getNutritionData(): Promise<NutritionData> {
    const defaultData: NutritionData = {
      waterOz: 0,
      waterGoal: 64,
      caloriesIn: 0,
      caloriesGoal: 2000,
    };

    if (!this.isAuthorized || !this.AppleHealthKit) return defaultData;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [water, calories] = await Promise.all([
      this.getWaterIntake(today),
      this.getCaloriesConsumed(today),
    ]);

    return {
      waterOz: water,
      waterGoal: 64,
      caloriesIn: calories,
      caloriesGoal: 2000,
    };
  }

  private getWaterIntake(startDate: Date): Promise<number> {
    return new Promise((resolve) => {
      this.AppleHealthKit.getWater(
        {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        },
        (err: any, results: Array<{ value: number }>) => {
          if (err || !results?.length) {
            resolve(0);
            return;
          }
          // Convert liters to oz
          const totalLiters = results.reduce((acc, r) => acc + (r.value || 0), 0);
          resolve(Math.round(totalLiters * 33.814));
        }
      );
    });
  }

  private getCaloriesConsumed(startDate: Date): Promise<number> {
    return new Promise((resolve) => {
      this.AppleHealthKit.getEnergyConsumed(
        {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        },
        (err: any, results: Array<{ value: number }>) => {
          if (err || !results?.length) {
            resolve(0);
            return;
          }
          const total = results.reduce((acc, r) => acc + (r.value || 0), 0);
          resolve(Math.round(total));
        }
      );
    });
  }

  async getMenstruationData(): Promise<MenstruationData | null> {
    if (!this.isAuthorized || !this.AppleHealthKit) return null;

    return new Promise((resolve) => {
      const options = {
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      };

      this.AppleHealthKit.getMenstrualFlow(options, (err: any, results: any[]) => {
        if (err || !results?.length) {
          resolve(null);
          return;
        }

        // Find most recent period start
        const periodStarts = results
          .filter((r) => r.value === 'HKCategoryValueMenstrualFlowLight' || 
                        r.value === 'HKCategoryValueMenstrualFlowMedium' ||
                        r.value === 'HKCategoryValueMenstrualFlowHeavy')
          .map((r) => new Date(r.startDate))
          .sort((a, b) => b.getTime() - a.getTime());

        if (!periodStarts.length) {
          resolve(null);
          return;
        }

        const lastPeriodStart = periodStarts[0];
        const daysSincePeriod = Math.floor((Date.now() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
        const cycleLength = 28; // Default, could be calculated from history

        // Determine phase
        let currentPhase: MenstruationData['currentPhase'];
        if (daysSincePeriod <= 5) currentPhase = 'menstrual';
        else if (daysSincePeriod <= 13) currentPhase = 'follicular';
        else if (daysSincePeriod <= 16) currentPhase = 'ovulation';
        else currentPhase = 'luteal';

        const nextPeriodPredicted = new Date(lastPeriodStart.getTime() + cycleLength * 24 * 60 * 60 * 1000);

        resolve({
          currentPhase,
          dayOfCycle: daysSincePeriod + 1,
          cycleLength,
          lastPeriodStart,
          nextPeriodPredicted,
          symptoms: [],
        });
      });
    });
  }

  async getHeartData(): Promise<HeartData> {
    const defaultData: HeartData = {
      restingHR: null,
      currentHR: null,
      hrv: null,
    };

    if (!this.isAuthorized || !this.AppleHealthKit) return defaultData;

    const [restingHR, hrv] = await Promise.all([
      this.getRestingHeartRate(),
      this.getHRV(),
    ]);

    return {
      restingHR,
      currentHR: null, // Would need real-time monitoring
      hrv,
    };
  }

  private getRestingHeartRate(): Promise<number | null> {
    return new Promise((resolve) => {
      this.AppleHealthKit.getRestingHeartRate(
        {
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
        (err: any, results: Array<{ value: number }>) => {
          if (err || !results?.length) {
            resolve(null);
            return;
          }
          // Get most recent
          resolve(Math.round(results[results.length - 1].value));
        }
      );
    });
  }

  private getHRV(): Promise<number | null> {
    return new Promise((resolve) => {
      this.AppleHealthKit.getHeartRateVariabilitySamples(
        {
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
        (err: any, results: Array<{ value: number }>) => {
          if (err || !results?.length) {
            resolve(null);
            return;
          }
          // Get most recent
          resolve(Math.round(results[results.length - 1].value));
        }
      );
    });
  }

  async getFullSnapshot(): Promise<HealthSnapshot> {
    const [sleep, activity, nutrition, menstruation, heart] = await Promise.all([
      this.getSleepData(),
      this.getActivityData(),
      this.getNutritionData(),
      this.getMenstruationData(),
      this.getHeartData(),
    ]);

    return {
      sleep,
      activity,
      nutrition,
      menstruation,
      heart,
      lastSynced: new Date(),
    };
  }

  /**
   * Calculate a Body gauge score (0-100) from health data
   */
  calculateBodyScore(snapshot: HealthSnapshot): number {
    let score = 50; // Base score
    let factors = 0;

    // Sleep (most important - 40% weight)
    if (snapshot.sleep.lastNight.duration > 0) {
      const sleepScore = Math.min(100, (snapshot.sleep.lastNight.duration / 8) * 100);
      score += (sleepScore - 50) * 0.4;
      factors++;
    }

    // Activity (30% weight)
    if (snapshot.activity.steps > 0) {
      const stepsScore = Math.min(100, (snapshot.activity.steps / snapshot.activity.stepsGoal) * 100);
      const exerciseScore = Math.min(100, (snapshot.activity.exerciseMinutes / snapshot.activity.exerciseGoal) * 100);
      const activityScore = (stepsScore + exerciseScore) / 2;
      score += (activityScore - 50) * 0.3;
      factors++;
    }

    // Hydration (15% weight)
    if (snapshot.nutrition.waterOz > 0) {
      const waterScore = Math.min(100, (snapshot.nutrition.waterOz / snapshot.nutrition.waterGoal) * 100);
      score += (waterScore - 50) * 0.15;
      factors++;
    }

    // HRV / Heart health (15% weight) - higher HRV is better
    if (snapshot.heart.hrv) {
      // Average HRV is ~40ms, good is 50+, excellent is 70+
      const hrvScore = Math.min(100, (snapshot.heart.hrv / 70) * 100);
      score += (hrvScore - 50) * 0.15;
      factors++;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate State gauge contribution from HRV
   * Higher HRV = calmer nervous system
   */
  calculateStateContribution(snapshot: HealthSnapshot): number | null {
    if (!snapshot.heart.hrv) return null;
    
    // HRV is a good proxy for parasympathetic activity
    // Low HRV (<30) = stressed, High HRV (>60) = calm
    if (snapshot.heart.hrv < 30) return 30;
    if (snapshot.heart.hrv < 40) return 45;
    if (snapshot.heart.hrv < 50) return 60;
    if (snapshot.heart.hrv < 60) return 75;
    return 85;
  }
}

export const healthKitService = new HealthKitService();
