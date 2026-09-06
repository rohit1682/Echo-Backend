import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InvestmentsService } from '../investments/investments.service';
import { AssetsService } from '../assets/assets.service';
import { LoansService } from '../loans/loans.service';
import { NetWorthSnapshot, NetWorthSnapshotDocument } from './schemas/networth-snapshot.schema';

export interface NetWorthBreakdown {
  totalInvestments: number;
  totalAssets: number;
  totalLiabilities: number;
  totalAssetsWithInvestments: number;
  netWorth: number;
}

@Injectable()
export class NetWorthService {
  constructor(
    @InjectModel(NetWorthSnapshot.name)
    private readonly snapshotModel: Model<NetWorthSnapshotDocument>,
    private readonly investments: InvestmentsService,
    private readonly assets: AssetsService,
    private readonly loans: LoansService,
  ) {}

  /** Compute the current net worth = (investments + assets) − loan outstanding. */
  async compute(userId: string): Promise<NetWorthBreakdown> {
    const [investments, assets, loans] = await Promise.all([
      this.investments.findAllForUser(userId),
      this.assets.findAllForUser(userId),
      this.loans.findAllForUser(userId),
    ]);

    const totalInvestments = investments.reduce((sum, i) => sum + (i.currentValue ?? 0), 0);
    const totalAssets = assets.reduce((sum, a) => sum + (a.currentValue ?? 0), 0);
    const totalLiabilities = loans.reduce((sum, l) => sum + (l.outstanding ?? 0), 0);
    const totalAssetsWithInvestments = totalInvestments + totalAssets;

    return {
      totalInvestments,
      totalAssets,
      totalLiabilities,
      totalAssetsWithInvestments,
      netWorth: totalAssetsWithInvestments - totalLiabilities,
    };
  }

  /** Persist a snapshot so the trend chart accrues data points. */
  async captureSnapshot(userId: string): Promise<NetWorthSnapshotDocument> {
    const b = await this.compute(userId);
    return this.snapshotModel.create({
      userId: new Types.ObjectId(userId),
      totalAssets: b.totalAssetsWithInvestments,
      totalLiabilities: b.totalLiabilities,
      netWorth: b.netWorth,
      capturedAt: new Date(),
    });
  }

  history(userId: string, limit = 90): Promise<NetWorthSnapshotDocument[]> {
    return this.snapshotModel.find({ userId }).sort({ capturedAt: -1 }).limit(limit).exec();
  }
}
