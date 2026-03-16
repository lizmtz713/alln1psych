/**
 * Voice: on-device speech recognition (primary), Whisper API (fallback), OpenAI TTS for AI responses.
 */

import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { getOpenAIKey } from './ai';

function uint8ToBase64(uint8: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < uint8.length; i += 3) {
    const a = uint8[i];
    const b = uint8[i + 1];
    const c = uint8[i + 2];
    out += chars[a >> 2];
    out += chars[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b !== undefined ? chars[((b & 15) << 2) | ((c ?? 0) >> 6)] : '=';
    out += c !== undefined ? chars[c & 63] : '=';
  }
  return out;
}

let Voice: any = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (e) {
  if (__DEV__) console.warn('Voice module not available, falling back to Whisper');
}

let recording: Audio.Recording | null = null;

export type OnDeviceListenCallbacks = {
  onPartial?: (text: string) => void;
  onResult?: (text: string) => void;
  onError?: (err: { code?: string; message?: string }) => void;
};

function noop() {}

export async function startOnDeviceListening(callbacks: OnDeviceListenCallbacks): Promise<void> {
  const { onPartial, onResult, onError } = callbacks;

  if (!Voice) {
    onError?.({ message: 'Voice module not available' });
    return;
  }

  Voice.onSpeechPartialResults = (e: any) => {
    const text = e.value?.[0] ?? '';
    onPartial?.(text);
  };
  Voice.onSpeechResults = (e: any) => {
    const text = e.value?.[0] ?? '';
    onResult?.(text);
  };
  Voice.onSpeechEnd = () => {};
  Voice.onSpeechError = (e: any) => {
    onError?.(e.error ?? { message: 'Speech recognition error' });
  };

  await Voice.start('en-US');
}

export async function stopOnDeviceListening(): Promise<void> {
  if (!Voice) return;
  try {
    await Voice.stop();
  } finally {
    Voice.onSpeechPartialResults = noop;
    Voice.onSpeechResults = noop;
    Voice.onSpeechEnd = noop;
    Voice.onSpeechError = noop;
  }
}

export function cancelOnDeviceListening(): void {
  if (!Voice) return;
  Voice.cancel?.();
  Voice.onSpeechPartialResults = noop;
  Voice.onSpeechResults = noop;
  Voice.onSpeechEnd = noop;
  Voice.onSpeechError = noop;
}

export async function startRecording(): Promise<void> {
  if (__DEV__) console.log('[Voice] startRecording: before');
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (__DEV__) console.log('[Voice] requestPermissionsAsync result:', status);
    if (status !== 'granted') {
      throw new Error('Microphone permission not granted');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recording = newRecording;
    if (__DEV__) console.log('[Voice] startRecording: after (recording started)');
  } catch (err) {
    recording = null;
    if (__DEV__) console.log('[Voice] startRecording: error', err);
    throw err;
  }
}

export async function stopRecording(): Promise<string> {
  if (__DEV__) console.log('[Voice] stopRecording: before');
  if (!recording) {
    throw new Error('No active recording');
  }

  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;

  if (!uri) {
    throw new Error('Failed to get recording URI');
  }
  if (__DEV__) console.log('[Voice] stopRecording: after, audio URI:', uri);
  return uri;
}

/** Whisper API fallback when on-device recognition fails or for non-English. */
export async function transcribeWithWhisper(audioUri: string): Promise<string> {
  if (__DEV__) console.log('[Voice] transcribeWithWhisper: before, uri:', audioUri);
  const apiKey = await getOpenAIKey();
  if (!apiKey?.trim()) {
    throw new Error('OpenAI API key not configured');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as unknown as Blob);
  formData.append('model', 'whisper-1');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    if (__DEV__) console.error('[Voice] Whisper API error:', res.status, body);
    throw new Error(body || `Whisper API error: ${res.status}`);
  }

  const data = (await res.json()) as { text?: string };
  const text = (data.text ?? '').trim();
  if (__DEV__) console.log('[Voice] transcribeWithWhisper: after, text length:', text.length);
  return text;
}

export function hasVoiceSupport(): boolean {
  return true;
}

/** Play AI response using OpenAI TTS (Gauge's voice). Uses fetch + blob + FileReader for reliable binary in RN. Rejects if no API key so callers can show a hint. */
export async function speakWithOpenAI(text: string): Promise<void> {
  try {
    const apiKey = await getOpenAIKey();
    if (!apiKey) {
      if (__DEV__) console.warn('TTS: No API key');
      throw new Error('NO_API_KEY');
    }

    if (__DEV__) console.log('TTS: Starting for:', text.slice(0, 40));

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text.slice(0, 4096),
        voice: 'nova',
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      if (__DEV__) console.warn('TTS API error:', response.status, errText);
      return;
    }

    const blob = await response.blob();
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64 ?? '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const dir = (FileSystem as any).documentDirectory ?? '';
    const fileUri = dir + 'psych-tts-' + Date.now() + '.mp3';
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: (FileSystem as any).EncodingType?.Base64 ?? 'base64',
    });

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: true, volume: 1.0 }
    );

    sound.setOnPlaybackStatusUpdate(async (status: any) => {
      if (status.isLoaded && status.didJustFinish) {
        if (__DEV__) console.log('TTS: Playback finished');
        await sound.unloadAsync();
        try {
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
        } catch {}
      }
    });

    if (__DEV__) console.log('TTS: Playing audio');
  } catch (e) {
    if (__DEV__) console.warn('TTS failed:', e);
  }
}
