import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Current authenticated user's full profile (including preferences). */
  @Get('me')
  async me(@CurrentUser('userId') userId: string) {
    return this.usersService.getByIdOrThrow(userId);
  }

  /** Update profile fields and/or preferences. */
  @Patch('me')
  async updateMe(@CurrentUser('userId') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto as Record<string, unknown>);
  }
}
