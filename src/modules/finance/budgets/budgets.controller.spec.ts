import { BudgetsController } from './budgets.controller';

describe('BudgetsController', () => {
  let svc: any;
  let controller: BudgetsController;

  beforeEach(() => {
    svc = {
      list: jest.fn().mockResolvedValue(['b']),
      summary: jest.fn().mockResolvedValue(['s']),
      create: jest.fn().mockResolvedValue('c'),
      update: jest.fn().mockResolvedValue('u'),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    controller = new BudgetsController(svc);
  });

  it('list', async () => {
    await controller.list('u1');
    expect(svc.list).toHaveBeenCalledWith('u1');
  });
  it('summary', async () => {
    await controller.summary('u1');
    expect(svc.summary).toHaveBeenCalledWith('u1');
  });
  it('create', async () => {
    await controller.create('u1', { name: 'B', limit: 1 } as any);
    expect(svc.create).toHaveBeenCalledWith('u1', { name: 'B', limit: 1 });
  });
  it('update', async () => {
    await controller.update('u1', 'b1', { limit: 2 } as any);
    expect(svc.update).toHaveBeenCalledWith('u1', 'b1', { limit: 2 });
  });
  it('remove', async () => {
    await controller.remove('u1', 'b1');
    expect(svc.remove).toHaveBeenCalledWith('u1', 'b1');
  });
});
