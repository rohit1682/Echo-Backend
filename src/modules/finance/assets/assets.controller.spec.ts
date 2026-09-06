import { AssetsController } from './assets.controller';

describe('AssetsController', () => {
  let svc: any;
  let controller: AssetsController;

  beforeEach(() => {
    svc = {
      list: jest.fn().mockResolvedValue(['a']),
      create: jest.fn().mockResolvedValue('c'),
      update: jest.fn().mockResolvedValue('u'),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    controller = new AssetsController(svc);
  });

  it('list', async () => {
    await controller.list('u1');
    expect(svc.list).toHaveBeenCalledWith('u1');
  });
  it('create', async () => {
    await controller.create('u1', { name: 'A', currentValue: 1 } as any);
    expect(svc.create).toHaveBeenCalledWith('u1', { name: 'A', currentValue: 1 });
  });
  it('update', async () => {
    await controller.update('u1', 'a1', { name: 'B' } as any);
    expect(svc.update).toHaveBeenCalledWith('u1', 'a1', { name: 'B' });
  });
  it('remove', async () => {
    await controller.remove('u1', 'a1');
    expect(svc.remove).toHaveBeenCalledWith('u1', 'a1');
  });
});
