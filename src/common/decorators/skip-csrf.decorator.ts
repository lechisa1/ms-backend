import { SetMetadata } from '@nestjs/common';

export const SKIP_CSRF_KEY = 'skipCsrf';

/**
 * Decorator to exempt specific controller actions or classes from CSRF token verification.
 */
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
