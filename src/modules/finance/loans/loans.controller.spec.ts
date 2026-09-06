import { LoansController } from './loans.controller';

describe('LoansController', () => {
  let svc: any;
  let controller: LoansController;

  beforeEach(() => {
    svc = {
      list: jest.fn().mockResolvedValue(['l']),
      create: jest.fn().mockResolvedValue('c'),
      update: jest.fn().mockResolvedValue('u'),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    controller = new LoansController(svc);
  });

  it('list', async () => {
    await controller.list('u1');
    expect(svc.list).toHaveBeenCalledWith('u1');
  });
  it('create', async () => {
    await controller.create('u1', { name: 'A', principal: 1, outstanding: 1 } as any);
    expect(svc.create).toHaveBeenCalledWith('u1', { name: 'A', principal: 1, outstanding: 1 });
  });
  it('update', async () => {
    await controller.update('u1', 'l1', { name: 'B' } as any);
    expect(svc.update).toHaveBeenCalledWith('u1', 'l1', { name: 'B' });
  });
  it('remove', async () => {
    await controller.remove('u1', 'l1');
    expect(svc.remove).toHaveBeenCalledWith('u1', 'l1');
  });
});
