declare module 'expo-clipboard' {
  export function getStringAsync(): Promise<string>;
  export function setStringAsync(text: string): Promise<void>;
}

declare module 'expo-image-picker' {
  export const MediaTypeOptions: { Images: string; Videos: string; All: string };
  export type ImagePickerResult = {
    canceled: boolean;
    assets?: Array<{ uri: string; width: number; height: number; base64?: string }>;
  };
  export function launchImageLibraryAsync(options?: {
    mediaTypes?: string;
    allowsEditing?: boolean;
    base64?: boolean;
    quality?: number;
  }): Promise<ImagePickerResult>;
  export function requestMediaLibraryPermissionsAsync(): Promise<{ status: string }>;
}

declare module 'expo-web-browser' {
  export function maybeCompleteAuthSession(): void;
  export function openAuthSessionAsync(
    url: string,
    redirectUrl: string,
    options?: object
  ): Promise<{ type: string; url?: string }>;
}

declare module 'expo-auth-session' {
  export function makeRedirectUri(options?: object): string;
  export function useAutoDiscovery(issuer: string): { authorizationEndpoint?: string; tokenEndpoint?: string } | null;
  export function useAuthRequest(
    config: { clientId: string; redirectUri?: string; scopes?: string[]; responseType?: string },
    discovery: { authorizationEndpoint?: string; tokenEndpoint?: string } | null
  ): [unknown, { type: string; params?: Record<string, string> } | null, () => Promise<void>];
}
