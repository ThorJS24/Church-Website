import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Without this, tailwind-merge doesn't recognize our custom fontSize scale
// (text-body-sm, text-caption, etc. — see tailwind.config.js) as its own
// group, so it misclassifies them as conflicting with text-{color} utilities
// and silently drops whichever one comes first in a cn() call.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-lg', 'display-md', 'display-sm',
            'headline-lg', 'headline-md', 'headline-sm',
            'title-lg', 'title-md', 'title-sm',
            'body-lg', 'body-md', 'body-sm',
            'label', 'caption',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
