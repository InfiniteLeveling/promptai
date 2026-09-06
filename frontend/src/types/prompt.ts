export interface ScoreBreakdown {
  clarity: number;       // max 20
  completeness: number;  // max 20
  constraints: number;   // max 15
  gating: number;        // max 15
  context: number;       // max 10
  modelFit: number;      // max 10
  edgeDefenses: number;  // max 10
}

export interface ClarificationChip {
  id: string;
  label: string;
  text: string;
  deltaPoints: number;
  category: 'security' | 'architecture' | 'testing' | 'database' | 'performance';
  selected?: boolean;
}

export interface Archetype {
  id: string;
  name: string;
  iconName: string;
  description: string;
  samplePrompt: string;
  defaultChips: string[];
}

export type TargetFormat = 'twoprompt' | 'antigravity' | 'cursor' | 'claude' | 'v0' | 'midjourney';

export interface CompiledOutput {
  promptA: string;
  promptB: string;
  nativeCode: string;
  schemaJson: string;
  diffSummary: string[];
  whyBetterNotes: {
    original: string;
    additions: string[];
  };
}
