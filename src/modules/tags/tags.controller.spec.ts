import { TagsController } from './tags.controller';

describe('TagsController', () => {
  let tags: any;
  let controller: TagsController;

  beforeEach(() => {
    tags = {
      list: jest.fn().mockResolvedValue(['t']),
      create: jest.fn().mockResolvedValue('c'),
      update: jest.fn().mockResolvedValue('u'),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    controller = new TagsController(tags);
  });

  it('list', async () => {
    await controller.list('u1');
    expect(tags.list).toHaveBeenCalledWith('u1');
  });
  it('create', async () => {
    await controller.create('u1', { name: 'X' } as any);
    expect(tags.create).toHaveBeenCalledWith('u1', { name: 'X' });
  });
  it('update', async () => {
    await controller.update('u1', 't1', { name: 'Y' } as any);
    expect(tags.update).toHaveBeenCalledWith('u1', 't1', { name: 'Y' });
  });
  it('remove', async () => {
    await controller.remove('u1', 't1');
    expect(tags.remove).toHaveBeenCalledWith('u1', 't1');
  });
});
