import { InvestmentsController } from './investments.controller';

describe('InvestmentsController', () => {
  let svc: any;
  let controller: InvestmentsController;

  beforeEach(() => {
    svc = {
      create: jest.fn().mockResolvedValue('c'),
      findAll: jest.fn().mockResolvedValue('all'),
      findOne: jest.fn().mockResolvedValue('one'),
      update: jest.fn().mockResolvedValue('u'),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    controller = new InvestmentsController(svc);
  });

  it('create', async () => {
    await controller.create('u1', { name: 'A' } as any);
    expect(svc.create).toHaveBeenCalledWith('u1', { name: 'A' });
  });
  it('findAll', async () => {
    await controller.findAll('u1', { page: 1 } as any);
    expect(svc.findAll).toHaveBeenCalledWith('u1', { page: 1 });
  });
  it('findOne', async () => {
    await controller.findOne('u1', 'i1');
    expect(svc.findOne).toHaveBeenCalledWith('u1', 'i1');
  });
  it('update', async () => {
    await controller.update('u1', 'i1', { name: 'B' } as any);
    expect(svc.update).toHaveBeenCalledWith('u1', 'i1', { name: 'B' });
  });
  it('remove', async () => {
    await controller.remove('u1', 'i1');
    expect(svc.remove).toHaveBeenCalledWith('u1', 'i1');
  });
});
