/**
 * Voice: on-device speech recognition (primary), Whisper API (fallback), OpenAI TTS for AI responses.
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { getOpenAIKey } from './ai';

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

  Voice.onSpeechPartialResults = (e) => {
    const text = e.value?.[0] ?? '';
    onPartial?.(text);
  };
  Voice.onSpeechResults = (e) => {
    const text = e.value?.[0] ?? '';
    onResult?.(text);
  };
  Voice.onSpeechEnd = () => {};
  Voice.onSpeechError = (e) => {
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

/** Play AI response using OpenAI TTS (Psych's voice). */
export async function speakWithOpenAI(text: string): Promise<void> {
  try {
    const apiKey = await getOpenAIKey();
    if (!apiKey?.trim()) return;

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

    if (!response.ok) return;

    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result?.toString?.();
      const base64 = dataUrl?.split(',')[1];
      if (!base64) return;

      const fileUri = FileSystem.documentDirectory + 'psych-voice.mp3';
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && (status as { didJustFinish?: boolean }).didJustFinish) {
          sound.unloadAsync();
        }
      });
    };
    reader.readAsDataURL(blob);
  } catch (e) {
    if (__DEV__) console.warn('TTS failed, text-only fallback:', e);
  }
}
