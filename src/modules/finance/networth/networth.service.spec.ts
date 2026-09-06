import { Types } from 'mongoose';
import { NetWorthService } from './networth.service';

const USER = new Types.ObjectId().toHexString();

describe('NetWorthService', () => {
  let snapshotModel: any;
  let investments: any;
  let assets: any;
  let loans: any;
  let service: NetWorthService;

  beforeEach(() => {
    snapshotModel = {
      create: jest.fn().mockResolvedValue({ id: 's1' }),
      find: jest.fn(),
    };
    investments = { findAllForUser: jest.fn() };
    assets = { findAllForUser: jest.fn() };
    loans = { findAllForUser: jest.fn() };
    service = new NetWorthService(snapshotModel, investments, assets, loans);
  });

  it('computes net worth from investments + assets - liabilities', async () => {
    investments.findAllForUser.mockResolvedValue([
      { currentValue: 100 },
      { currentValue: undefined },
    ]);
    assets.findAllForUser.mockResolvedValue([{ currentValue: 50 }, { currentValue: undefined }]);
    loans.findAllForUser.mockResolvedValue([{ outstanding: 30 }, { outstanding: undefined }]);

    await expect(service.compute(USER)).resolves.toEqual({
      totalInvestments: 100,
      totalAssets: 50,
      totalLiabilities: 30,
      totalAssetsWithInvestments: 150,
      netWorth: 120,
    });
  });

  it('captureSnapshot persists a computed snapshot', async () => {
    investments.findAllForUser.mockResolvedValue([{ currentValue: 100 }]);
    assets.findAllForUser.mockResolvedValue([]);
    loans.findAllForUser.mockResolvedValue([{ outstanding: 40 }]);
    await service.captureSnapshot(USER);
    expect(snapshotModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ totalAssets: 100, totalLiabilities: 40, netWorth: 60 }),
    );
  });

  it('history returns snapshots with a default limit', async () => {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(['s']),
    };
    snapshotModel.find.mockReturnValue(chain);
    await expect(service.history(USER)).resolves.toEqual(['s']);
    expect(chain.limit).toHaveBeenCalledWith(90);
  });
});
