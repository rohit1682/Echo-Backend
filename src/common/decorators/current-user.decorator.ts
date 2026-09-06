import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * The authenticated principal attached to the request by JwtStrategy.
 * `userId` is the string form of the User document's _id and is used to scope
 * every query so users can only ever read/write their own data.
 */
export interface AuthUser {
  userId: string;
  email?: string;
}

/**
 * Convenience decorator: `@CurrentUser() user: AuthUser` in a controller.
 * Pass a key to pluck a single field: `@CurrentUser('userId') userId: string`.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthUser = request.user;
    return data ? user?.[data] : user;
  },
);
