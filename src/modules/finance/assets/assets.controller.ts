import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';

@Controller('finance/assets')
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Get()
  list(@CurrentUser('userId') userId: string) {
    return this.assets.list(userId);
  }

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateAssetDto) {
    return this.assets.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assets.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.assets.remove(userId, id);
  }
}
