'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface HeartMessage {
  id: string;
  senderName: string | null;
  isAnonymous: boolean;
  noteType: string;
  content: string;
  createdAt: string;
}

const NOTE_TYPE_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  general: { emoji: '💌', label: 'Message', color: '#EC4899' },
  gratitude: { emoji: '🙏', label: 'Gratitude', color: '#10B981' },
  concern: { emoji: '💭', label: 'Concern', color: '#6366F1' },
  apology: { emoji: '🤝', label: 'Apology', color: '#F59E0B' },
  forgiveness: { emoji: '💜', label: 'Forgiveness', color: '#8B5CF6' },
  boundary: { emoji: '🚧', label: 'Boundary', color: '#EF4444' },
  grief: { emoji: '🕊️', label: 'Support', color: '#6B7280' },
  encouragement: { emoji: '✨', label: 'Encouragement', color: '#FBBF24' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function HeartMailViewPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [message, setMessage] = useState<HeartMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) return;
    
    async function fetchMessage() {
      try {
        const res = await fetch(`/api/heart/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('This message was not found or has expired.');
          } else {
            setError('Something went wrong. Please try again.');
          }
          return;
        }
        const data = await res.json();
        setMessage(data);
      } catch (e) {
        setError('Could not load message. Check your connection.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMessage();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center">
            <span className="text-3xl">💌</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !message) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💔</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Message Not Found</h1>
          <p className="text-gray-400 mb-8">{error || 'This Heart Mail could not be loaded.'}</p>
          <a 
            href="https://getingauge.com"
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors"
          >
            Learn about InGauge
          </a>
        </div>
      </div>
    );
  }
  
  const config = NOTE_TYPE_CONFIG[message.noteType] || NOTE_TYPE_CONFIG.general;
  
  return (
    <div className="min-h-screen bg-[#09090F]">
      {/* Header */}
      <div className="bg-gradient-to-b from-pink-500/10 to-transparent pt-12 pb-24 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-6 border-2 border-pink-500/30">
            <span className="text-5xl">{config.emoji}</span>
          </div>
          <p className="text-pink-400 text-sm font-medium uppercase tracking-wide mb-2">
            {config.label}
          </p>
          <h1 className="text-2xl font-bold text-white mb-2">
            You received a Heart Mail
          </h1>
          <p className="text-gray-400">
            {message.isAnonymous 
              ? 'From someone in your Circle' 
              : `From ${message.senderName || 'Someone special'}`}
          </p>
        </div>
      </div>
      
      {/* Message Card */}
      <div className="px-6 -mt-12">
        <div className="max-w-lg mx-auto">
          <div className="bg-[#111118] rounded-3xl p-8 border border-white/10 shadow-xl">
            <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-500 text-sm">
                Sent on {formatDate(message.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="px-6 py-12">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            Want to send Heart Mail too?
          </h2>
          <p className="text-gray-400 mb-8">
            InGauge helps you understand yourself and connect with the people who matter most.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://apps.apple.com/app/ingauge"
              className="inline-flex items-center justify-center gap-2 bg-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-pink-600 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
              </svg>
              Download on iOS
            </a>
            <a 
              href="https://getingauge.com"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-8 border-t border-white/5">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Heart Mail by InGauge — The Human Cockpit
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Your messages are private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
