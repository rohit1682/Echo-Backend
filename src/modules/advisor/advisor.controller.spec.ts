import { AdvisorController } from './advisor.controller';

describe('AdvisorController', () => {
  let svc: any;
  let controller: AdvisorController;

  beforeEach(() => {
    svc = {
      getRecommendations: jest.fn().mockResolvedValue({ recommendations: [] }),
      history: jest.fn().mockResolvedValue(['r']),
    };
    controller = new AdvisorController(svc);
  });

  it('recommendations', async () => {
    await controller.recommendations('u1');
    expect(svc.getRecommendations).toHaveBeenCalledWith('u1');
  });

  it('history with explicit limit', async () => {
    await controller.history('u1', '10');
    expect(svc.history).toHaveBeenCalledWith('u1', 10);
  });

  it('history with default limit', async () => {
    await controller.history('u1', undefined);
    expect(svc.history).toHaveBeenCalledWith('u1', 50);
  });
});
