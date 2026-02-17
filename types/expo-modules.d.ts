declare module 'expo-web-browser' {
  export function openBrowserAsync(url: string, options?: object): Promise<{ type: string }>;
  export function maybeCompleteAuthSession(): Promise<{ type: string; url?: string }>;
  export function warmUpAsync(): Promise<void>;
  export function coolDownAsync(): Promise<void>;
}

declare module 'expo-auth-session' {
  export function makeRedirectUri(options?: object): string;
  export function useAutoDiscovery(endpoint: string): AuthDiscovery | null;
  export function useAuthRequest(
    config: object,
    discovery: AuthDiscovery | null
  ): [AuthRequest | null, AuthSessionResponse | null, () => Promise<void>];
  export type AuthDiscovery = object;
  export type AuthRequest = object;
  export interface AuthSessionResponse {
    type: 'success' | 'dismiss' | 'cancel' | 'error';
    params?: Record<string, string>;
    error?: Error;
  }
}
