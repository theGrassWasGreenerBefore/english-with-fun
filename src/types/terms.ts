// Shapes for terms.json, consumed by the clipslesson section. See AGENTS.md section 5.

export interface Sequence {
  readonly id: string;
  readonly start: string;
  readonly end: string;
}

export interface Term {
  readonly sequenceId: string;
  readonly term: string;
  readonly stillframe: string;
  readonly framingXOffset: number;
  readonly definition: string;
  readonly image?: string;
}

export interface TermsData {
  readonly sequences: readonly Sequence[];
  readonly terms: readonly Term[];
}

// Vanilla player API commands invoked by the React layer (headless mode).
// See AGENTS.md section 4, "Division of Responsibility in clipslesson".
export type ShowStillframe = (stillframe: string, framingXOffset: number) => void;
export type Play = (time: string) => void;
