import type { TargetFormat, ScoreBreakdown, CompiledOutput } from './prompt';

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'streaming' | 'done' | 'error';

export interface ClarificationOption {
  id: string;
  label: string;
  category?: string;
  pointsDelta?: number;
}

export interface ClarificationGroup {
  id: string;
  title: string;
  icon?: string;
  question: string;
  options: ClarificationOption[];
  selectedOptionId?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status?: MessageStatus;
  isStreaming?: boolean;
  compilingStage?: number; // 1..7 for progressive visual updates

  // Diagnostic & Architecture Metadata
  diagnosticScore?: number;
  scoreBreakdown?: ScoreBreakdown;
  detectedCategory?: string;

  // Interactive inline clarifications
  clarificationGroups?: ClarificationGroup[];
  hasClarified?: boolean;

  // Dual-Prompt Compilation Specs
  compiledOutput?: CompiledOutput;
  requirementSpec?: any;

  // Adversarial hardening
  improvementLevel?: number;
  improvementNotice?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  targetFormat: TargetFormat;
  model: string;
  messages: ChatMessage[];
  pinned?: boolean;
}
