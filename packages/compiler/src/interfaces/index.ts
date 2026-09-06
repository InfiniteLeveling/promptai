/**
 * @promptarchitect/compiler
 * Injected External Intelligence Provider Interfaces (Pure Typed Abstraction)
 */

export interface PackageReference {
  name: string;
  version: string;
  ecosystem: 'npm' | 'pypi' | 'golang' | 'cargo';
}

export interface VulnerabilityItem {
  cveId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
}

export interface VulnerabilityResult {
  vulnerabilities: VulnerabilityItem[];
}

export interface VulnerabilityScanner {
  scan(packages: PackageReference[]): Promise<VulnerabilityResult>;
}

export interface RequirementModel {
  extractRequirements(prompt: string, context?: Record<string, unknown>): Promise<unknown>;
}

export interface LintIssue {
  message: string;
  offset: number;
  length: number;
  rule_id?: string;
}

export interface LanguageLinter {
  lint(text: string): Promise<LintIssue[]>;
}

export interface IconResolver {
  resolveBadge(technology: string): Promise<string | null>;
}

export interface CompilerContext {
  requirementModel: RequirementModel;
  vulnerabilityScanner?: VulnerabilityScanner;
  languageLinter?: LanguageLinter;
  iconResolver?: IconResolver;
  deadlineAt: number; // Absolute Unix timestamp in ms
}
