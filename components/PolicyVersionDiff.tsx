'use client';

import { useState, useMemo } from 'react';
import { History } from 'lucide-react';
import { wordDiff } from '@/lib/diff';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface PolicyVersion {
  id: string;
  label: string;
  date: string;
  text: string;
}

export function PolicyVersionDiff({ versions, clauseLabel }: { versions: PolicyVersion[]; clauseLabel: string }) {
  const [fromId, setFromId] = useState(versions[0]?.id);
  const [toId, setToId] = useState(versions[versions.length - 1]?.id);

  const from = versions.find((v) => v.id === fromId) ?? versions[0];
  const to = versions.find((v) => v.id === toId) ?? versions[versions.length - 1];

  const diff = useMemo(() => wordDiff(from?.text ?? '', to?.text ?? ''), [from, to]);
  const hasChanges = diff.some((part) => part.type !== 'same');

  if (versions.length < 2) return null;

  return (
    <div className="mb-10">
      <h2 className="mb-2 flex items-center gap-2 text-headline-sm text-foreground">
        <History className="h-5 w-5 text-accent" /> Policy Change History
      </h2>
      <p className="mb-6 text-body-sm text-foreground-muted">
        Compare how the &ldquo;{clauseLabel}&rdquo; section has changed between versions of this policy.
      </p>
      <Card className="bg-surface">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="From version"
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            options={versions.map((v) => ({ value: v.id, label: `${v.label} (${v.date})` }))}
          />
          <Select
            label="To version"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            options={versions.map((v) => ({ value: v.id, label: `${v.label} (${v.date})` }))}
          />
        </div>

        <div className="mt-5 rounded-lg border border-border bg-background p-4 text-body-sm leading-relaxed">
          {hasChanges ? (
            diff.map((part, i) => (
              <span
                key={i}
                className={cn(
                  part.type === 'added' && 'bg-success-subtle text-success',
                  part.type === 'removed' && 'bg-danger-subtle text-danger line-through'
                )}
              >
                {part.text}
              </span>
            ))
          ) : (
            <p className="text-foreground-muted">No changes between these two versions.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
