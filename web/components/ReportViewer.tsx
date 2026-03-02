'use client';

type Profile = { name?: string; pronouns?: string } | null;
type MoodCheckin = { id: string; mood: string; mood_label: string; note: string | null; created_at: string };
type Conversation = { id: string; summary: string | null; emotional_tone: string | null; created_at: string };
type JournalEntry = { id: string; content: string; mood: string | null; created_at: string };

type Report = {
  id: string;
  config?: Record<string, unknown>;
  expires_at: string;
  view_count: number;
  max_views: number | null;
};

interface ReportViewerProps {
  report: Report;
  profile?: Profile;
  moodCheckins: MoodCheckin[];
  conversations: Conversation[];
  journalEntries: JournalEntry[];
}

const MOOD_COLORS: Record<string, string> = {
  green: '#4ADE80',
  yellow: '#FACC15',
  orange: '#FB923C',
  red: '#F87171',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ReportViewer({
  report,
  profile,
  moodCheckins,
  conversations,
  journalEntries,
}: ReportViewerProps) {
  const name = profile?.name ?? 'Someone';
  const moodCounts: Record<string, number> = {};
  moodCheckins.forEach((m) => {
    moodCounts[m.mood] = (moodCounts[m.mood] ?? 0) + 1;
  });

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          InGauge — Wellness report
        </h1>
        <p style={{ color: '#A0A0B0', marginTop: 8, marginBottom: 0 }}>
          Shared for {name}
          {profile?.pronouns ? ` (${profile.pronouns})` : ''}
        </p>
        <p style={{ fontSize: 13, color: '#6B6B80', marginTop: 4 }}>
          Report viewed {report.view_count} time(s)
          {report.max_views != null ? ` · max ${report.max_views} views` : ''}
          {' · '}
          Link expires {formatDate(report.expires_at)}
        </p>
      </header>

      {moodCheckins.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#A0A0B0' }}>
            Mood check-ins
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {Object.entries(moodCounts).map(([mood, count]) => (
              <span
                key={mood}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 500,
                  background: `${MOOD_COLORS[mood] ?? '#6B6B80'}22`,
                  color: MOOD_COLORS[mood] ?? '#A0A0B0',
                }}
              >
                {mood}: {count}
              </span>
            ))}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {moodCheckins.slice(-20).reverse().map((m) => (
              <li
                key={m.id}
                style={{
                  padding: '10px 14px',
                  marginBottom: 6,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  borderLeft: `3px solid ${MOOD_COLORS[m.mood] ?? '#6B6B80'}`,
                }}
              >
                <span style={{ fontSize: 13, color: '#A0A0B0' }}>
                  {formatDateTime(m.created_at)}
                </span>
                <span style={{ marginLeft: 8, fontWeight: 500 }}>{m.mood}</span>
                {m.mood_label && m.mood_label !== m.mood && (
                  <span style={{ marginLeft: 6, color: '#A0A0B0' }}>— {m.mood_label}</span>
                )}
                {m.note && (
                  <div style={{ marginTop: 6, fontSize: 14, color: '#F0F0F5' }}>{m.note}</div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {conversations.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#A0A0B0' }}>
            Conversation summaries
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {conversations.map((c) => (
              <li
                key={c.id}
                style={{
                  padding: 14,
                  marginBottom: 8,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                <span style={{ fontSize: 13, color: '#A0A0B0' }}>
                  {formatDate(c.created_at)}
                  {c.emotional_tone ? ` · ${c.emotional_tone}` : ''}
                </span>
                <p style={{ margin: '6px 0 0', fontSize: 15, lineHeight: 1.5 }}>
                  {c.summary ?? '(No summary)'}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {journalEntries.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#A0A0B0' }}>
            Journal entries
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {journalEntries.map((j) => (
              <li
                key={j.id}
                style={{
                  padding: 14,
                  marginBottom: 8,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                <span style={{ fontSize: 13, color: '#A0A0B0' }}>{formatDate(j.created_at)}</span>
                <p style={{ margin: '6px 0 0', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {j.content}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {moodCheckins.length === 0 && conversations.length === 0 && journalEntries.length === 0 && (
        <p style={{ color: '#A0A0B0', textAlign: 'center', padding: 32 }}>
          No data in this report for the selected period.
        </p>
      )}

      <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: '#6B6B80' }}>
        Generated by InGauge. This link is private; do not share further.
      </footer>
    </div>
  );
}
