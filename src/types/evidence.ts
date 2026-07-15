export type EvidenceLevel = 'established' | 'emerging' | 'reflective';

export const EVIDENCE_LABELS: Record<EvidenceLevel, { label: string; description: string }> = {
  established: {
    label: 'Evidence-informed',
    description: 'Grounded in established research or widely accepted practice. It is still education, not diagnosis.',
  },
  emerging: {
    label: 'Emerging insight',
    description: 'A pattern or approach that may be useful but is not yet strongly validated for this person.',
  },
  reflective: {
    label: 'For reflection',
    description: 'A prompt or symbolic lens for curiosity—not a scientific assessment or statement of fact.',
  },
};
