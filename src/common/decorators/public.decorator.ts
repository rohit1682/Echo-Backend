import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route (or whole controller) as accessible without authentication.
 * Used for auth endpoints, health checks, etc.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
