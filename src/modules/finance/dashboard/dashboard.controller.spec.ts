import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  it('summary delegates to the service', async () => {
    const svc = { getSummary: jest.fn().mockResolvedValue({ ok: true }) } as any;
    const controller = new DashboardController(svc);
    await expect(controller.summary('u1')).resolves.toEqual({ ok: true });
    expect(svc.getSummary).toHaveBeenCalledWith('u1');
  });
});
