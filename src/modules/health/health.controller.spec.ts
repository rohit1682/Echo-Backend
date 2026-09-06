import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports ok when the DB is connected', () => {
    const controller = new HealthController({ readyState: 1 } as any);
    const res = controller.check();
    expect(res.status).toBe('ok');
    expect(res.db).toBe('up');
    expect(typeof res.uptime).toBe('number');
  });

  it('reports degraded when the DB is down', () => {
    const controller = new HealthController({ readyState: 0 } as any);
    const res = controller.check();
    expect(res.status).toBe('degraded');
    expect(res.db).toBe('down');
  });
});
