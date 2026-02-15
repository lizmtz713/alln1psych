/**
 * Voice: on-device speech recognition (primary) and Whisper API (fallback).
 * Recording (expo-av) is used only when on-device recognition fails.
 */

import { Audio } from 'expo-av';
import Voice from '@react-native-voice/voice';
import { getOpenAIKey } from './ai';

let recording: Audio.Recording | null = null;

export type OnDeviceListenCallbacks = {
  onPartial?: (text: string) => void;
  onResult?: (text: string) => void;
  onError?: (err: { code?: string; message?: string }) => void;
};

function noop() {}

export async function startOnDeviceListening(callbacks: OnDeviceListenCallbacks): Promise<void> {
  const { onPartial, onResult, onError } = callbacks;

  Voice.onSpeechPartialResults = (e) => {
    const text = e.value?.[0] ?? '';
    onPartial?.(text);
  };
  Voice.onSpeechResults = (e) => {
    const text = e.value?.[0] ?? '';
    onResult?.(text);
  };
  Voice.onSpeechEnd = () => {
    // Handlers stay; stop() will be called by caller
  };
  Voice.onSpeechError = (e) => {
    onError?.(e.error ?? { message: 'Speech recognition error' });
  };

  await Voice.start('en-US');
}

export async function stopOnDeviceListening(): Promise<void> {
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
  // UI uses hasOpenAIKey() for API key check; this is a quick env check for capability.
  return true;
}
