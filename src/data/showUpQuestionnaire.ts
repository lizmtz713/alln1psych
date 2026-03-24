/** Labels for How to Show Up questionnaire (match keys stored in answers JSON). */

export const CONTACT_METHOD_OPTIONS = [
  { id: 'text' as const, label: 'Text' },
  { id: 'call' as const, label: 'Call' },
  { id: 'voice_note' as const, label: 'Voice note' },
  { id: 'email' as const, label: 'Email' },
  { id: 'in_person' as const, label: 'In person' },
  { id: 'depends' as const, label: 'Depends' },
];

export const CHECK_IN_OPTIONS = [
  { id: 'thinking_of_you', label: 'Thinking of you' },
  { id: 'want_to_talk', label: 'Want to talk?' },
  { id: 'want_help', label: 'Want help with anything?' },
  { id: 'memes', label: 'Memes / funny stuff' },
  { id: 'specific_plans', label: 'Specific plans' },
  { id: 'simple_hello', label: 'Simple hello' },
  { id: 'checkin_voice_note', label: 'Voice note' },
  { id: 'space', label: 'I like space more than check-ins' },
];

export const STRESS_HELP_OPTIONS = [
  { id: 'listening', label: 'Someone listening' },
  { id: 'practical', label: 'Practical help' },
  { id: 'encouragement', label: 'Encouragement' },
  { id: 'space', label: 'Space' },
  { id: 'distraction', label: 'Distraction / fun' },
  { id: 'advice', label: 'Advice' },
  { id: 'quiet_company', label: 'Quiet company' },
  { id: 'check_in_later', label: 'Check in later, not right away' },
];

export const STRESS_AVOID_OPTIONS = [
  { id: 'too_many_texts', label: 'Too many texts' },
  { id: 'advice_fast', label: 'Advice too fast' },
  { id: 'pushed_to_talk', label: 'Being pushed to talk' },
  { id: 'jokes_soon', label: 'Jokes too soon' },
  { id: 'silence_long', label: 'Silence for too long' },
  { id: 'about_themselves', label: 'People making it about themselves' },
  { id: 'calm_down', label: 'Being told to calm down' },
  { id: 'not_sure', label: "I'm not sure" },
];

export const APPRECIATION_OPTIONS = [
  { id: 'thoughtful_texts', label: 'Small thoughtful texts' },
  { id: 'checked_on', label: 'Being checked on' },
  { id: 'quality_time', label: 'Quality time' },
  { id: 'practical_help', label: 'Help with something practical' },
  { id: 'celebrating_wins', label: 'Celebrating wins' },
  { id: 'invited', label: 'Being invited places' },
  { id: 'dates_remembered', label: 'Remembering important dates' },
  { id: 'honest_words', label: 'Honest words' },
];

export const IMPORTANT_DATES_KIND = [
  { id: 'birthday' as const, label: 'Birthday' },
  { id: 'hard_season' as const, label: 'Hard month/season' },
  { id: 'anniversary' as const, label: 'Anniversary / milestone' },
  { id: 'not_now' as const, label: 'Not right now' },
];

export const DEEPER_COMM_OPTIONS = [
  { id: 'direct', label: 'Direct' },
  { id: 'gentle', label: 'Gentle' },
  { id: 'casual', label: 'Casual' },
  { id: 'thoughtful', label: 'Thoughtful' },
  { id: 'depends', label: 'Depends on situation' },
];

export const DEEPER_REPAIR_OPTIONS = [
  { id: 'talk_directly', label: 'Talk directly' },
  { id: 'text_first', label: 'Text first' },
  { id: 'time_first', label: 'A little time first' },
  { id: 'ack_first', label: 'Acknowledgement first' },
  { id: 'apology_first', label: 'Apology first' },
  { id: 'not_sure', label: "I'm not sure" },
];

export const DEEPER_BARRIER_OPTIONS = [
  { id: 'defensiveness', label: 'Defensiveness' },
  { id: 'sarcasm', label: 'Sarcasm' },
  { id: 'long_silence', label: 'Long silence' },
  { id: 'pressure_talk', label: 'Pressure to talk too soon' },
  { id: 'minimizing', label: 'Minimizing my feelings' },
  { id: 'misunderstood', label: 'Being misunderstood' },
];

export const DEEPER_FREQ_OPTIONS = [
  { id: 'often', label: 'Often' },
  { id: 'sometimes', label: 'Sometimes' },
  { id: 'not_much', label: 'Not too much' },
  { id: 'depends', label: 'It depends' },
];

export const DEEPER_INVITE_OPTIONS = [
  { id: 'planned', label: 'Planned ahead' },
  { id: 'spontaneous', label: 'Spontaneous' },
  { id: 'small_group', label: 'Small group' },
  { id: 'one_on_one', label: 'One-on-one' },
  { id: 'low_pressure', label: 'Low-pressure invites' },
  { id: 'staying_in', label: 'I usually prefer staying in' },
];
