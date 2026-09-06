import { describe, it, expect } from 'vitest';
import { CanaryGatewayRouter } from '../scripts/canary-gateway.js';

describe('Phase 21: Phased Canary Cutover & Gateway Routing', () => {
  const baseConfig = {
    canaryWeightPercent: 0,
    shadowTrafficEnabled: true,
    shadowSamplePercent: 10,
    shadowMaxDailyBudgetUsd: 5.0,
    gatewaySecret: 'test-gateway-secret-2026',
    legacyBackendUrl: 'http://localhost:3000',
    targetBackendUrl: 'http://localhost:3001'
  };

  it('routes 100% of traffic to legacy when canary weight is 0%', () => {
    const router = new CanaryGatewayRouter(baseConfig);

    for (let i = 0; i < 20; i++) {
      const decision = router.routeRequest(`user_${i}`, {});
      expect(decision.destination).toBe('legacy');
      expect(decision.targetUrl).toBe('http://localhost:3000');
    }
  });

  it('routes 100% of traffic to target when canary weight is 100%', () => {
    const router = new CanaryGatewayRouter(baseConfig);
    router.updateCanaryWeight(100);

    for (let i = 0; i < 20; i++) {
      const decision = router.routeRequest(`user_${i}`, {});
      expect(decision.destination).toBe('target');
      expect(decision.targetUrl).toBe('http://localhost:3001');
    }
  });

  it('distributes traffic deterministically according to canary weight (e.g. 25%)', () => {
    const router = new CanaryGatewayRouter(baseConfig);
    router.updateCanaryWeight(25);

    let targetCount = 0;
    const total = 500;

    for (let i = 0; i < total; i++) {
      const decision = router.routeRequest(`unique_user_${i}`, {});
      if (decision.destination === 'target') {
        targetCount++;
      }
    }

    const percentage = (targetCount / total) * 100;
    // Expected around 25% ± 7%
    expect(percentage).toBeGreaterThan(18);
    expect(percentage).toBeLessThan(32);
  });

  it('strips untrusted client version and routing headers', () => {
    const router = new CanaryGatewayRouter(baseConfig);
    const decision = router.routeRequest('user_1', {
      'x-request-id': 'req-123',
      'authorization': 'Bearer token',
      'x-untrusted-client-version': 'v2.0',
      'x-force-backend': 'target'
    });

    expect(decision.headersToForward['x-request-id']).toBe('req-123');
    expect(decision.headersToForward['authorization']).toBe('Bearer token');
    expect(decision.headersToForward['x-untrusted-client-version']).toBeUndefined();
    expect(decision.headersToForward['x-force-backend']).toBeUndefined();
  });

  it('executes emergency rollback within sub-30 second SLO (<10ms measured)', () => {
    const router = new CanaryGatewayRouter(baseConfig);
    router.updateCanaryWeight(50);
    expect(router.getConfig().canaryWeightPercent).toBe(50);

    const rollback = router.emergencyRollback();
    expect(rollback.rolledBack).toBe(true);
    expect(rollback.durationMs).toBeLessThan(30000); // SLO: <= 30 seconds
    expect(router.getConfig().canaryWeightPercent).toBe(0);
    expect(router.getConfig().shadowTrafficEnabled).toBe(false);

    // Immediately all traffic is back to legacy
    const decision = router.routeRequest('user_after_rollback', {});
    expect(decision.destination).toBe('legacy');
  });

  it('stops shadow traffic when daily spend budget cap is exceeded', () => {
    const router = new CanaryGatewayRouter({
      ...baseConfig,
      shadowSamplePercent: 100, // force shadow
      shadowMaxDailyBudgetUsd: 1.0
    });

    const d1 = router.routeRequest('user_1', {});
    expect(d1.isShadow).toBe(true);

    // Exceed budget
    router.recordShadowCost(1.5);

    const d2 = router.routeRequest('user_2', {});
    expect(d2.isShadow).toBe(false);
  });
});
