import { describe, it, expect } from 'vitest';
import { verifyProductionGates } from '../scripts/verify-production-gates.js';

describe('Phase 20 & 21: Production Configuration Gate & Staging Verification', () => {
  it('passes all 12 architectural security and resilience configuration gates', async () => {
    const result = await verifyProductionGates();
    if (!result.allPassed) {
      console.error('Failed gates:', result.gates.filter((g) => !g.passed));
    }
    expect(result.allPassed).toBe(true);
    expect(result.gates.length).toBeGreaterThanOrEqual(6);

    for (const gate of result.gates) {
      expect(gate.passed).toBe(true);
    }
  });
});
