import { describe, it, expect, vi } from 'vitest';
import { SSRFValidator } from '../src/infrastructure/security/ssrfValidator.js';
import { CircuitBreaker, CircuitBreakerOpenError } from '../src/infrastructure/security/circuitBreaker.js';
import { AIClient } from '../src/providers/ai/aiClient.js';

describe('Phase 10: Intelligence Providers, Circuit Breakers & SSRF Defense', () => {
  describe('SSRFValidator', () => {
    it('blocks loopback IP addresses (127.0.0.1)', async () => {
      const res = await SSRFValidator.validateUrl('http://127.0.0.1:8080/admin');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Forbidden IP range: Loopback');
    });

    it('blocks AWS/GCP cloud metadata IP (169.254.169.254)', async () => {
      const res = await SSRFValidator.validateUrl('http://169.254.169.254/latest/meta-data');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Link-Local & Cloud Metadata');
    });

    it('blocks private 10.0.0.0/8 IPs', async () => {
      const res = await SSRFValidator.validateUrl('http://10.0.0.5/api');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Private 10.0.0.0/8');
    });

    it('blocks private 192.168.0.0/16 IPs', async () => {
      const res = await SSRFValidator.validateUrl('http://192.168.1.1/router');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Private 192.168.0.0/16');
    });

    it('blocks private 172.16.0.0/12 IPs', async () => {
      const res = await SSRFValidator.validateUrl('http://172.20.0.1/internal');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Private 172.16.0.0/12');
    });

    it('blocks dangerous protocols such as file:// and gopher://', async () => {
      const fileRes = await SSRFValidator.validateUrl('file:///etc/passwd');
      expect(fileRes.valid).toBe(false);
      expect(fileRes.reason).toContain('Forbidden protocol: file:');

      const gopherRes = await SSRFValidator.validateUrl('gopher://127.0.0.1');
      expect(gopherRes.valid).toBe(false);
      expect(gopherRes.reason).toContain('Forbidden protocol: gopher:');
    });

    it('blocks localhost aliases and internal domains', async () => {
      const res = await SSRFValidator.validateUrl('http://localhost:3000/api');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Localhost and internal domains prohibited');
    });

    it('allows valid public HTTPS URLs', async () => {
      const res = await SSRFValidator.validateUrl('https://api.github.com/repos/facebook/react');
      expect(res.valid).toBe(true);
      expect(res.resolvedIp).toBeDefined();
    });
  });

  describe('CircuitBreaker', () => {
    it('executes successfully and remains CLOSED', async () => {
      const cb = new CircuitBreaker({ failureThreshold: 2, name: 'test' });
      const res = await cb.execute(async () => 'success');

      expect(res).toBe('success');
      expect(cb.getState()).toBe('CLOSED');
    });

    it('trips to OPEN after consecutive failures reach threshold', async () => {
      const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000, name: 'test' });

      for (let i = 0; i < 3; i++) {
        await expect(cb.execute(async () => {
          throw new Error('Downstream network error');
        })).rejects.toThrow('Downstream network error');
      }

      expect(cb.getState()).toBe('OPEN');

      // Subsequent attempt fails immediately with CircuitBreakerOpenError without calling inner action
      const mockAction = vi.fn();
      await expect(cb.execute(mockAction)).rejects.toThrow(CircuitBreakerOpenError);
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('transitions to HALF_OPEN after resetTimeoutMs and resets on success', async () => {
      const cb = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 50, name: 'test' });

      // Trigger 2 failures
      for (let i = 0; i < 2; i++) {
        await expect(cb.execute(async () => { throw new Error('fail'); })).rejects.toThrow();
      }
      expect(cb.getState()).toBe('OPEN');

      // Wait for reset timeout
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Next execution probes downstream service
      const res = await cb.execute(async () => 'recovered');
      expect(res).toBe('recovered');
      expect(cb.getState()).toBe('CLOSED');
    });
  });

  describe('AIClient', () => {
    it('extracts requirements with fallback schema and circuit breaker protection', async () => {
      const client = new AIClient();
      const spec = await client.extractRequirements('Build a real-time collaborative whiteboard app');

      expect(spec).toBeDefined();
      const obj = spec as any;
      expect(obj.technicalStack).toBeDefined();
      expect(obj.features.length).toBeGreaterThan(0);
      expect(client.getCircuitState()).toBe('CLOSED');
    });
  });
});
