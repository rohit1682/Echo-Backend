import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Investment, InvestmentSchema } from './schemas/investment.schema';
import { InvestmentsService } from './investments.service';
import { InvestmentsController } from './investments.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Investment.name, schema: InvestmentSchema }])],
  providers: [InvestmentsService],
  controllers: [InvestmentsController],
  exports: [InvestmentsService, MongooseModule],
})
export class InvestmentsModule {}
