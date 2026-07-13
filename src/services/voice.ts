/**
 * Voice: on-device speech recognition (primary), Whisper API (fallback), OpenAI TTS for AI responses.
 */

import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { callEdgeFunction } from './ai';

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
  throw new Error('Cloud transcription is unavailable in this release. Please type instead.');
}

export function hasVoiceSupport(): boolean {
  return true;
}

/** Play Gauge's voice through the authenticated server-side TTS gateway. */
export async function speakWithOpenAI(text: string): Promise<void> {
  try {
    if (__DEV__) console.log('TTS: Starting for:', text.slice(0, 40));
    const { audio: base64Audio } = await callEdgeFunction<{ audio: string }>('tts', {
      text: text.slice(0, 4096),
      voice: 'nova',
    }, 30_000);
    if (!base64Audio) throw new Error('Voice service returned no audio');

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
