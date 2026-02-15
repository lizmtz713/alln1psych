/**
 * Voice recording and transcription.
 * Uses expo-av for recording, OpenAI Whisper API for transcription.
 * Recording format: HIGH_QUALITY preset outputs m4a (Whisper-compatible).
 */

import { Audio } from 'expo-av';
import { getOpenAIKey } from './ai';

let recording: Audio.Recording | null = null;

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

export async function transcribeAudio(audioUri: string): Promise<string> {
  if (__DEV__) console.log('[Voice] transcribeAudio: before, uri:', audioUri);
  const apiKey = await getOpenAIKey();
  if (!apiKey?.trim()) {
    throw new Error('OpenAI API key not configured');
  }

  // React Native FormData: append file via { uri, type, name }. HIGH_QUALITY preset = m4a.
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
  if (__DEV__) console.log('[Voice] transcribeAudio: after, text length:', text.length);
  return text;
}

export function hasVoiceSupport(): boolean {
  // UI uses hasOpenAIKey() for API key check; this is a quick env check for capability.
  return true;
}
