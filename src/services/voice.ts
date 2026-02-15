/**
 * Voice recording and transcription.
 * Uses expo-av for recording, OpenAI Whisper API for transcription.
 */

import { Audio } from 'expo-av';

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<void> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
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
  } catch (err) {
    recording = null;
    throw err;
  }
}

export async function stopRecording(): Promise<string> {
  if (!recording) {
    throw new Error('No active recording');
  }

  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;

  if (!uri) {
    throw new Error('Failed to get recording URI');
  }
  return uri;
}

export async function transcribeAudio(audioUri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error('OpenAI API key not configured');
  }

  // React Native FormData: append file via { uri, type, name }
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
      // Let browser set Content-Type for FormData with file
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Whisper API error: ${res.status}`);
  }

  const data = (await res.json()) as { text?: string };
  return (data.text ?? '').trim();
}

export function hasVoiceSupport(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim());
}
