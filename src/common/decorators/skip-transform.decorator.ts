import { SetMetadata } from '@nestjs/common';

export const SKIP_TRANSFORM = 'SKIP_TRANSFORM';
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM, true);
