import { ExpensesController } from './expenses.controller';

describe('ExpensesController', () => {
  let svc: any;
  let controller: ExpensesController;

  beforeEach(() => {
    svc = {
      list: jest.fn().mockResolvedValue(['e']),
      create: jest.fn().mockResolvedValue('c'),
      update: jest.fn().mockResolvedValue('u'),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    controller = new ExpensesController(svc);
  });

  it('list', async () => {
    await controller.list('u1');
    expect(svc.list).toHaveBeenCalledWith('u1');
  });
  it('create', async () => {
    await controller.create('u1', { amount: 10 } as any);
    expect(svc.create).toHaveBeenCalledWith('u1', { amount: 10 });
  });
  it('update', async () => {
    await controller.update('u1', 'e1', { amount: 20 } as any);
    expect(svc.update).toHaveBeenCalledWith('u1', 'e1', { amount: 20 });
  });
  it('remove', async () => {
    await controller.remove('u1', 'e1');
    expect(svc.remove).toHaveBeenCalledWith('u1', 'e1');
  });
});
