/**
 * Heart Notes Store
 * 
 * Manage heart notes - messages to loved ones that can be:
 * - Kept private (processing)
 * - Sent when ready
 * - Soft shared (recipient accepts when ready)
 * - Sent anonymously
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type NoteStatus = 
  | 'draft'      // Still writing
  | 'private'    // Kept for self, never sending
  | 'ready'      // Ready to send, waiting for user action
  | 'pending'    // Soft share sent, waiting for recipient
  | 'shared'     // Delivered and read
  | 'declined'   // Recipient declined soft share
  | 'archived';  // Old note, archived

export type NoteType = 
  | 'general'
  | 'gratitude'
  | 'concern'
  | 'apology'
  | 'forgiveness'
  | 'boundary'
  | 'grief'
  | 'encouragement';

export type SendType = 
  | 'open'       // They see who sent it
  | 'anonymous'  // They only know "someone in your Circle"
  | 'soft';      // They accept before seeing content

export interface HeartNote {
  id: string;
  userId: string;
  
  // Recipient
  recipientType: 'circle' | 'external';
  recipientId?: string;      // Circle member ID if applicable
  recipientName: string;     // Display name
  
  // Content
  title?: string;
  content: string;
  coreMessage?: string;      // AI-distilled summary
  emotion?: string;          // Primary emotion identified
  
  // Classification
  noteType: NoteType;
  sendType?: SendType;
  
  // Status
  status: NoteStatus;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  sharedAt?: string;
  readAt?: string;
  
  // Response
  recipientResponse?: string;
  recipientAcknowledged?: boolean;
  
  // Reminders
  reminderDate?: string;
}

export interface HeartMail {
  id: string;
  recipientId: string;
  senderId: string;
  senderName?: string;       // null if anonymous
  isAnonymous: boolean;
  
  noteType: NoteType;
  content: string;
  
  status: 'pending' | 'read' | 'archived';
  
  createdAt: string;
  readAt?: string;
  
  // Response
  response?: string;
  respondedAt?: string;
}

interface HeartNotesState {
  // Notes I've written
  notes: HeartNote[];
  loading: boolean;
  
  // Mail I've received
  inbox: HeartMail[];
  inboxLoading: boolean;
  unreadCount: number;
  
  // Current draft
  currentDraft: Partial<HeartNote> | null;
  
  // Actions - Notes
  loadNotes: () => Promise<void>;
  createNote: (note: Partial<HeartNote>) => Promise<HeartNote>;
  updateNote: (id: string, updates: Partial<HeartNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Actions - Sending
  sendNote: (id: string, sendType: SendType) => Promise<void>;
  unsendNote: (id: string) => Promise<void>;
  
  // Actions - Inbox
  loadInbox: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  respondToMail: (id: string, response: string) => Promise<void>;
  archiveMail: (id: string) => Promise<void>;
  thankCircle: () => Promise<void>;
  
  // Actions - Draft
  setDraft: (draft: Partial<HeartNote> | null) => void;
  saveDraft: () => Promise<HeartNote | null>;
  
  // Actions - Recipient
  acceptSoftShare: (mailId: string) => Promise<void>;
  declineSoftShare: (mailId: string) => Promise<void>;
}

export const useHeartNotesStore = create<HeartNotesState>((set, get) => ({
  notes: [],
  loading: false,
  inbox: [],
  inboxLoading: false,
  unreadCount: 0,
  currentDraft: null,

  loadNotes: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('heart_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      set({ 
        notes: (data || []).map(n => ({
          id: n.id,
          userId: n.user_id,
          recipientType: n.recipient_type,
          recipientId: n.recipient_id,
          recipientName: n.recipient_name,
          title: n.title,
          content: n.content,
          coreMessage: n.core_message,
          emotion: n.emotion,
          noteType: n.note_type,
          sendType: n.send_type,
          status: n.status,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
          sharedAt: n.shared_at,
          readAt: n.read_at,
          recipientResponse: n.recipient_response,
          recipientAcknowledged: n.recipient_acknowledged,
          reminderDate: n.reminder_date,
        })),
        loading: false,
      });
    } catch (err) {
      console.error('[HeartNotes] Load error:', err);
      set({ loading: false });
    }
  },

  createNote: async (note) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const newNote = {
      user_id: user.id,
      recipient_type: note.recipientType || 'external',
      recipient_id: note.recipientId,
      recipient_name: note.recipientName || 'Someone',
      title: note.title,
      content: note.content || '',
      note_type: note.noteType || 'general',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('heart_notes')
      .insert(newNote)
      .select()
      .single();

    if (error) throw error;

    const created: HeartNote = {
      id: data.id,
      userId: data.user_id,
      recipientType: data.recipient_type,
      recipientId: data.recipient_id,
      recipientName: data.recipient_name,
      title: data.title,
      content: data.content,
      noteType: data.note_type,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    set(state => ({ notes: [created, ...state.notes] }));
    return created;
  },

  updateNote: async (id, updates) => {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.noteType !== undefined) updateData.note_type = updates.noteType;
    if (updates.sendType !== undefined) updateData.send_type = updates.sendType;
    if (updates.coreMessage !== undefined) updateData.core_message = updates.coreMessage;
    if (updates.emotion !== undefined) updateData.emotion = updates.emotion;
    if (updates.reminderDate !== undefined) updateData.reminder_date = updates.reminderDate;
    if (updates.recipientName !== undefined) updateData.recipient_name = updates.recipientName;
    if (updates.recipientId !== undefined) updateData.recipient_id = updates.recipientId;
    if (updates.recipientType !== undefined) updateData.recipient_type = updates.recipientType;

    const { error } = await supabase
      .from('heart_notes')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    set(state => ({
      notes: state.notes.map(n => 
        n.id === id ? { ...n, ...updates, updatedAt: updateData.updated_at } : n
      ),
    }));
  },

  deleteNote: async (id) => {
    const { error } = await supabase
      .from('heart_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    set(state => ({ notes: state.notes.filter(n => n.id !== id) }));
  },

  sendNote: async (id, sendType) => {
    const note = get().notes.find(n => n.id === id);
    if (!note) throw new Error('Note not found');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Create the heart mail entry for recipient
    const mail = {
      recipient_id: note.recipientId,
      sender_id: user.id,
      sender_name: sendType === 'anonymous' ? null : user.user_metadata?.name || 'Someone',
      is_anonymous: sendType === 'anonymous',
      note_type: note.noteType,
      content: note.content,
      status: sendType === 'soft' ? 'pending' : 'pending',
      created_at: new Date().toISOString(),
    };

    const { error: mailError } = await supabase
      .from('heart_mail')
      .insert(mail);

    if (mailError) throw mailError;

    // Update note status
    await get().updateNote(id, {
      status: sendType === 'soft' ? 'pending' : 'shared',
      sendType,
      sharedAt: new Date().toISOString(),
    });
  },

  unsendNote: async (id) => {
    const note = get().notes.find(n => n.id === id);
    if (!note || note.status !== 'pending') return;

    // Delete the pending mail
    const { error } = await supabase
      .from('heart_mail')
      .delete()
      .eq('sender_id', note.userId)
      .eq('status', 'pending');

    if (error) throw error;

    await get().updateNote(id, {
      status: 'ready',
      sharedAt: undefined,
    });
  },

  loadInbox: async () => {
    set({ inboxLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('heart_mail')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const inbox: HeartMail[] = (data || []).map(m => ({
        id: m.id,
        recipientId: m.recipient_id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        isAnonymous: m.is_anonymous,
        noteType: m.note_type,
        content: m.content,
        status: m.status,
        createdAt: m.created_at,
        readAt: m.read_at,
        response: m.response,
        respondedAt: m.responded_at,
      }));

      const unreadCount = inbox.filter(m => m.status === 'pending').length;

      set({ inbox, inboxLoading: false, unreadCount });
    } catch (err) {
      console.error('[HeartNotes] Inbox load error:', err);
      set({ inboxLoading: false });
    }
  },

  markAsRead: async (id) => {
    const { error } = await supabase
      .from('heart_mail')
      .update({ 
        status: 'read',
        read_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    set(state => ({
      inbox: state.inbox.map(m => 
        m.id === id ? { ...m, status: 'read' as const, readAt: new Date().toISOString() } : m
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  respondToMail: async (id, response) => {
    const { error } = await supabase
      .from('heart_mail')
      .update({
        response,
        responded_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    set(state => ({
      inbox: state.inbox.map(m =>
        m.id === id ? { ...m, response, respondedAt: new Date().toISOString() } : m
      ),
    }));
  },

  archiveMail: async (id) => {
    const { error } = await supabase
      .from('heart_mail')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw error;

    set(state => ({
      inbox: state.inbox.map(m =>
        m.id === id ? { ...m, status: 'archived' as const } : m
      ),
    }));
  },

  thankCircle: async () => {
    // Send gratitude to entire Circle without exposing who sent anonymous mail
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all Circle members
    const { data: circle } = await supabase
      .from('circle_members')
      .select('member_id')
      .eq('user_id', user.id);

    if (!circle?.length) return;

    // Send gratitude notification to all
    const notifications = circle.map(c => ({
      user_id: c.member_id,
      type: 'circle_gratitude',
      title: 'Someone appreciated your care 💜',
      body: 'Someone in your Circle is grateful for the love and support.',
      created_at: new Date().toISOString(),
    }));

    await supabase.from('notifications').insert(notifications);
  },

  setDraft: (draft) => set({ currentDraft: draft }),

  saveDraft: async () => {
    const draft = get().currentDraft;
    if (!draft) return null;

    if (draft.id) {
      await get().updateNote(draft.id, draft);
      return get().notes.find(n => n.id === draft.id) || null;
    } else {
      return await get().createNote(draft);
    }
  },

  acceptSoftShare: async (mailId) => {
    await get().markAsRead(mailId);
  },

  declineSoftShare: async (mailId) => {
    const { error } = await supabase
      .from('heart_mail')
      .update({ status: 'declined' })
      .eq('id', mailId);

    if (error) throw error;

    set(state => ({
      inbox: state.inbox.filter(m => m.id !== mailId),
    }));
  },
}));
