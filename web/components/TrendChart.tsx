'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CheckIn } from '@/lib/supabase';

interface Props {
  checkins: CheckIn[];
}

const GAUGE_CONFIG = [
  { key: 'body', label: 'Body', color: '#F59E0B' },
  { key: 'state', label: 'State', color: '#10B981' },
  { key: 'emotion', label: 'Emotion', color: '#EC4899' },
  { key: 'connection', label: 'Connection', color: '#8B5CF6' },
  { key: 'direction', label: 'Direction', color: '#3B82F6' },
  { key: 'alignment', label: 'Alignment', color: '#06B6D4' },
];

export function TrendChart({ checkins }: Props) {
  // Transform data for recharts
  const data = checkins.map(checkin => ({
    date: new Date(checkin.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    body: checkin.body,
    state: checkin.state,
    emotion: checkin.emotion,
    connection: checkin.connection,
    direction: checkin.direction,
    alignment: checkin.alignment,
  }));

  // Determine which gauges have data
  const activeGauges = GAUGE_CONFIG.filter(gauge =>
    checkins.some(c => c[gauge.key as keyof CheckIn] != null)
  );

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available for the selected period
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend />
          {activeGauges.map(gauge => (
            <Line
              key={gauge.key}
              type="monotone"
              dataKey={gauge.key}
              name={gauge.label}
              stroke={gauge.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
