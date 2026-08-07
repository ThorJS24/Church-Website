#!/bin/bash
# Reusable mechanical migration for the warm-rebuild: swaps ui-legacy imports
# for the new lowercase components/ui/* filenames, framer-motion for
# motion/react, and lib/cn for lib/utils. Usage: ./migrate-imports.sh <files...>
# Deleted once Phase 13 cleanup is done and this is no longer needed.
set -e
for f in "$@"; do
  sed -i \
    -e "s#@/components/ui-legacy/Accordion#@/components/ui/accordion#g" \
    -e "s#@/components/ui-legacy/Avatar#@/components/ui/avatar#g" \
    -e "s#@/components/ui-legacy/Badge#@/components/ui/badge#g" \
    -e "s#@/components/ui-legacy/Breadcrumbs#@/components/ui/breadcrumbs#g" \
    -e "s#@/components/ui-legacy/Button#@/components/ui/button#g" \
    -e "s#@/components/ui-legacy/Card#@/components/ui/card#g" \
    -e "s#@/components/ui-legacy/Checkbox#@/components/ui/checkbox#g" \
    -e "s#@/components/ui-legacy/Container#@/components/ui/container#g" \
    -e "s#@/components/ui-legacy/DataTable#@/components/ui/data-table#g" \
    -e "s#@/components/ui-legacy/Drawer#@/components/ui-legacy/Drawer#g" \
    -e "s#@/components/ui-legacy/Dropdown'#@/components/ui-legacy/Dropdown'#g" \
    -e "s#@/components/ui-legacy/Grid#@/components/ui/grid#g" \
    -e "s#@/components/ui-legacy/IconButton#@/components/ui/icon-button#g" \
    -e "s#@/components/ui-legacy/Input#@/components/ui/input#g" \
    -e "s#@/components/ui-legacy/Modal#@/components/ui/modal#g" \
    -e "s#@/components/ui-legacy/PageHero#@/components/ui/page-hero#g" \
    -e "s#@/components/ui-legacy/Pagination#@/components/ui/pagination#g" \
    -e "s#@/components/ui-legacy/Radio#@/components/ui/radio#g" \
    -e "s#@/components/ui-legacy/Section#@/components/ui/section#g" \
    -e "s#@/components/ui-legacy/Select#@/components/ui/select#g" \
    -e "s#@/components/ui-legacy/Skeleton#@/components/ui/skeleton#g" \
    -e "s#@/components/ui-legacy/Stack#@/components/ui/stack#g" \
    -e "s#@/components/ui-legacy/States#@/components/ui/states#g" \
    -e "s#@/components/ui-legacy/Switch#@/components/ui/switch#g" \
    -e "s#@/components/ui-legacy/Tabs#@/components/ui/tabs#g" \
    -e "s#@/components/ui-legacy/Textarea#@/components/ui/textarea#g" \
    -e "s#@/components/ui-legacy/Toast#@/lib/toast#g" \
    -e "s#@/components/ui-legacy/Tooltip#@/components/ui/tooltip#g" \
    -e "s#from 'framer-motion'#from 'motion/react'#g" \
    -e "s#from \"framer-motion\"#from \"motion/react\"#g" \
    -e "s#@/lib/cn'#@/lib/utils'#g" \
    "$f"
done
echo "Migrated ${#@} files"
