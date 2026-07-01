/**
 * Upload voice recordings to Supabase Storage.
 * Call before sending Mind Mail so heart_notes/heart_mail store a remote URL.
 */

import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';

const BUCKET = 'voice';
const MIME = 'audio/m4a';

function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://');
}

/** Decode base64 to ArrayBuffer for Supabase upload */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/**
 * Upload a local voice file to Storage and return the public URL.
 * Path: {userId}/{noteId}_{timestamp}.m4a
 * Requires bucket "voice" to exist (create in Supabase Dashboard if migration doesn't create it).
 */
export async function uploadVoiceToStorage(
  localUri: string,
  userId: string,
  noteId: string
): Promise<string> {
  if (!isLocalUri(localUri)) {
    return localUri;
  }

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: 'base64',
  });
  const arrayBuffer = base64ToArrayBuffer(base64);
  const path = `${userId}/${noteId}_${Date.now()}.m4a`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: MIME,
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

/**
 * If the URI is a local file, upload it and return the remote URL; otherwise return as-is.
 */
export async function ensureVoiceRemoteUri(
  voiceUri: string | undefined,
  userId: string,
  noteId: string
): Promise<string | undefined> {
  if (!voiceUri) return undefined;
  if (!isLocalUri(voiceUri)) return voiceUri;
  return uploadVoiceToStorage(voiceUri, userId, noteId);
}
