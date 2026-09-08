import { TasksController } from './tasks.controller';

describe('TasksController', () => {
  let svc: any;
  let controller: TasksController;

  beforeEach(() => {
    svc = {
      list: jest.fn().mockResolvedValue(['t']),
      create: jest.fn().mockResolvedValue('c'),
      update: jest.fn().mockResolvedValue('u'),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    controller = new TasksController(svc);
  });

  it('list', async () => {
    await controller.list('u1');
    expect(svc.list).toHaveBeenCalledWith('u1');
  });
  it('create', async () => {
    await controller.create('u1', { title: 'A' } as any);
    expect(svc.create).toHaveBeenCalledWith('u1', { title: 'A' });
  });
  it('update', async () => {
    await controller.update('u1', 't1', { completed: true } as any);
    expect(svc.update).toHaveBeenCalledWith('u1', 't1', { completed: true });
  });
  it('remove', async () => {
    await controller.remove('u1', 't1');
    expect(svc.remove).toHaveBeenCalledWith('u1', 't1');
  });
});
