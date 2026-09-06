/**
 * Phase 21: Phased Canary Cutover & Gateway Router
 * Manages trusted gateway canary routing, shadow traffic caps, and sub-30s emergency rollback.
 */
import { createHmac } from 'crypto';

export interface CanaryConfig {
  canaryWeightPercent: number; // 0 to 100
  shadowTrafficEnabled: boolean;
  shadowSamplePercent: number;
  shadowMaxDailyBudgetUsd: number;
  gatewaySecret: string;
  legacyBackendUrl: string;
  targetBackendUrl: string;
}

export interface RoutingDecision {
  destination: 'legacy' | 'target';
  targetUrl: string;
  isShadow: boolean;
  canaryWeight: number;
  headersToForward: Record<string, string>;
}

export class CanaryGatewayRouter {
  private currentConfig: CanaryConfig;
  private shadowSpendTodayUsd = 0;
  private lastResetDate = new Date().toISOString().split('T')[0];

  constructor(config: CanaryConfig) {
    this.currentConfig = { ...config };
  }

  updateCanaryWeight(weightPercent: number): void {
    if (weightPercent < 0 || weightPercent > 100) {
      throw new Error('Canary weight must be between 0 and 100 percent');
    }
    this.currentConfig.canaryWeightPercent = weightPercent;
  }

  emergencyRollback(): { rolledBack: boolean; durationMs: number } {
    const start = Date.now();
    this.currentConfig.canaryWeightPercent = 0;
    this.currentConfig.shadowTrafficEnabled = false;
    const durationMs = Date.now() - start;
    return { rolledBack: true, durationMs };
  }

  routeRequest(userId: string | undefined, clientHeaders: Record<string, string>): RoutingDecision {
    // 1. Strip untrusted client routing headers
    const sanitizedHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(clientHeaders)) {
      const lower = k.toLowerCase();
      if (!lower.startsWith('x-untrusted-') && lower !== 'x-force-backend') {
        sanitizedHeaders[k] = v;
      }
    }

    // 2. Deterministic Hash-Based Canary Routing
    let destination: 'legacy' | 'target' = 'legacy';
    if (this.currentConfig.canaryWeightPercent >= 100) {
      destination = 'target';
    } else if (this.currentConfig.canaryWeightPercent > 0) {
      const seed = userId || sanitizedHeaders['x-request-id'] || Math.random().toString();
      const hash = createHmac('sha256', this.currentConfig.gatewaySecret)
        .update(seed)
        .digest('hex');
      const bucket = parseInt(hash.substring(0, 4), 16) % 100;
      if (bucket < this.currentConfig.canaryWeightPercent) {
        destination = 'target';
      }
    }

    // 3. Shadow Traffic Evaluation
    const today = new Date().toISOString().split('T')[0];
    if (today !== this.lastResetDate) {
      this.shadowSpendTodayUsd = 0;
      this.lastResetDate = today;
    }

    let isShadow = false;
    if (
      destination === 'legacy' &&
      this.currentConfig.shadowTrafficEnabled &&
      this.shadowSpendTodayUsd < this.currentConfig.shadowMaxDailyBudgetUsd
    ) {
      const shadowSeed = `${userId || 'anon'}_shadow_${Math.random()}`;
      const shadowHash = createHmac('sha256', this.currentConfig.gatewaySecret)
        .update(shadowSeed)
        .digest('hex');
      const shadowBucket = parseInt(shadowHash.substring(0, 4), 16) % 100;
      if (shadowBucket < this.currentConfig.shadowSamplePercent) {
        isShadow = true;
      }
    }

    const targetUrl = destination === 'target'
      ? this.currentConfig.targetBackendUrl
      : this.currentConfig.legacyBackendUrl;

    return {
      destination,
      targetUrl,
      isShadow,
      canaryWeight: this.currentConfig.canaryWeightPercent,
      headersToForward: sanitizedHeaders
    };
  }

  recordShadowCost(costUsd: number): void {
    this.shadowSpendTodayUsd += costUsd;
  }

  getConfig(): CanaryConfig {
    return { ...this.currentConfig };
  }
}
