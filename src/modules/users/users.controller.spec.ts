import { UsersController } from './users.controller';

describe('UsersController', () => {
  let service: any;
  let controller: UsersController;

  beforeEach(() => {
    service = { getByIdOrThrow: jest.fn(), updateProfile: jest.fn() };
    controller = new UsersController(service);
  });

  it('me() returns the current user profile', async () => {
    service.getByIdOrThrow.mockResolvedValue({ id: 'u1' });
    await expect(controller.me('u1')).resolves.toEqual({ id: 'u1' });
    expect(service.getByIdOrThrow).toHaveBeenCalledWith('u1');
  });

  it('updateMe() forwards the patch', async () => {
    service.updateProfile.mockResolvedValue({ id: 'u1', name: 'X' });
    const dto = { name: 'X' } as any;
    await expect(controller.updateMe('u1', dto)).resolves.toEqual({ id: 'u1', name: 'X' });
    expect(service.updateProfile).toHaveBeenCalledWith('u1', dto);
  });
});
