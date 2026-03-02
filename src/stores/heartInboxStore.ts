/**
 * Heart Inbox Store
 * Manage incoming heart messages
 */
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type HeartInboxMessage = {
  id: string;
  from_user_id: string;
  from_name: string;
  to_user_id: string;
  type: 'open' | 'anonymous' | 'soft_share';
  content: string;
  read: boolean;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
};

interface HeartInboxState {
  messages: HeartInboxMessage[];
  isLoading: boolean;
  error: string | null;
  fetchMessages: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  acceptSoftShare: (id: string) => Promise<void>;
  declineSoftShare: (id: string) => Promise<void>;
}

export const useHeartInboxStore = create<HeartInboxState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  fetchMessages: async () => {
    set({ isLoading: true, error: null });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return set({ isLoading: false });

    const { data, error } = await supabase
      .from('heart_messages')
      .select('*')
      .eq('to_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
    } else {
      set({ messages: data || [], isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    await supabase.from('heart_messages').update({ read: true }).eq('id', id);
    set({ messages: get().messages.map(m => m.id === id ? { ...m, read: true } : m) });
  },

  acceptSoftShare: async (id: string) => {
    await supabase.from('heart_messages').update({ status: 'accepted' }).eq('id', id);
    set({ messages: get().messages.map(m => m.id === id ? { ...m, status: 'accepted' } : m) });
  },

  declineSoftShare: async (id: string) => {
    await supabase.from('heart_messages').update({ status: 'declined' }).eq('id', id);
    set({ messages: get().messages.map(m => m.id === id ? { ...m, status: 'declined' } : m) });
  },
}));
