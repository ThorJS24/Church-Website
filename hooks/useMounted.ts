'use client';

import { useEffect, useState } from 'react';

/** Guards against SSR/portal hydration mismatches — true only after client mount. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
