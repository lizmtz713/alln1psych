/**
 * Optional Expo modules — declare so TS resolves when types are missing or not installed.
 * expo-calendar may be optional; expo-contacts is in package.json but types may be missing.
 */
declare module 'expo-calendar' {
  const Calendar: any;
  export = Calendar;
}

declare module 'expo-contacts' {
  export interface Address {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  }
  export function requestPermissionsAsync(): Promise<{ status: 'granted' | 'denied' | 'limited' }>;
  export function getPermissionsAsync(): Promise<{ status: string }>;
  export function presentContactPickerAsync(): Promise<{
    name?: string;
    phoneNumbers?: { number?: string }[];
    emails?: { email?: string }[];
    addresses?: Address[];
    image?: { uri?: string };
    id?: string;
  } | null>;
}
