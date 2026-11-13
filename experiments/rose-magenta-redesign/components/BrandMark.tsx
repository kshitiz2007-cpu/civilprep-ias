import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon } from '@hugeicons/core-free-icons';

export default function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <HugeiconsIcon icon={BookOpen01Icon} size={size} strokeWidth={1.8} />
    </span>
  );
}
