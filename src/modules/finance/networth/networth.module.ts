import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NetWorthSnapshot, NetWorthSnapshotSchema } from './schemas/networth-snapshot.schema';
import { NetWorthService } from './networth.service';
import { NetWorthController } from './networth.controller';
import { InvestmentsModule } from '../investments/investments.module';
import { AssetsModule } from '../assets/assets.module';
import { LoansModule } from '../loans/loans.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: NetWorthSnapshot.name, schema: NetWorthSnapshotSchema }]),
    InvestmentsModule,
    AssetsModule,
    LoansModule,
  ],
  providers: [NetWorthService],
  controllers: [NetWorthController],
  exports: [NetWorthService],
})
export class NetWorthModule {}
