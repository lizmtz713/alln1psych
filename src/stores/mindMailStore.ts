/**
 * Mind Mail Store
 * Public API for Mind Mail (emotional email). Uses heart_notes / heart_mail tables.
 * Re-exports heartNotesStore with Mind Mail naming for rebrand.
 */

export {
  useHeartNotesStore as useMindMailStore,
  type HeartNote as MindNote,
  type HeartMail as MindMail,
  type NoteStatus,
  type NoteType,
  type SendType,
  type GlimpseFields,
  calculateGlimpseDuration,
  GLIMPSE_DURATIONS,
} from './heartNotesStore';
