'use client';

import { useEffect, useState, useMemo, use } from 'react';
import { CheckCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { FieldSchema } from '@/types/contentType';
import { Container } from '@/components/ui-legacy/Container';
import { Card } from '@/components/ui-legacy/Card';
import { Input } from '@/components/ui-legacy/Input';
import { Textarea } from '@/components/ui-legacy/Textarea';
import { Checkbox } from '@/components/ui-legacy/Checkbox';
import { Button } from '@/components/ui-legacy/Button';
import { LoadingState } from '@/components/ui-legacy/States';
import { cn } from '@/lib/cn';

interface PublicForm {
  id: string;
  title: string;
  description?: string;
  fields: FieldSchema[];
  thankYouUrl?: string;
}

const STEP_SIZE = 4;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldVisible(field: FieldSchema, values: Record<string, any>): boolean {
  if (!field.showIf) return true;
  const actual = values[field.showIf.fieldKey];
  return actual === field.showIf.equals || String(actual) === String(field.showIf.equals);
}

function validateField(f: FieldSchema, value: any): string | null {
  const isEmpty = value === undefined || value === null || value === '';
  if (f.required && f.type === 'checkbox' && !value) return `${f.label} is required.`;
  if (f.required && f.type !== 'checkbox' && isEmpty) return `${f.label} is required.`;
  if (!isEmpty && f.type === 'email' && !EMAIL_PATTERN.test(String(value))) return 'Please enter a valid email address.';
  return null;
}

function draftKey(id: string) {
  return `form-draft-${id}`;
}

export default function PublicFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<PublicForm | null | undefined>(undefined);
  const [values, setValues] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data.success ? data.form : null))
      .catch(() => setForm(null));
  }, [id]);

  // Restore a saved draft once the form definition (and therefore its
  // field list) is known.
  useEffect(() => {
    if (!form) return;
    try {
      const saved = localStorage.getItem(draftKey(id));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setValues(parsed);
          setDraftRestored(true);
        }
      }
    } catch {
      // corrupted draft — ignore rather than block the form from loading
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.id]);

  // Auto-save on every change, skipped for file fields (not serializable).
  useEffect(() => {
    if (!form || Object.keys(values).length === 0) return;
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(id), JSON.stringify(values));
      } catch {
        // storage full/unavailable — draft saving is a convenience, not
        // something worth surfacing an error over
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [values, form, id]);

  const clearDraft = () => {
    localStorage.removeItem(draftKey(id));
    setValues({});
    setDraftRestored(false);
  };

  const steps = useMemo(() => {
    if (!form) return [];
    const visibleFields = form.fields;
    if (visibleFields.length <= STEP_SIZE) return [visibleFields];
    const chunks: FieldSchema[][] = [];
    for (let i = 0; i < visibleFields.length; i += STEP_SIZE) chunks.push(visibleFields.slice(i, i + STEP_SIZE));
    return chunks;
  }, [form]);

  const isMultiStep = steps.length > 1;
  const currentStepFields = (steps[step] ?? []).filter((f) => fieldVisible(f, values));

  const setValue = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateFields = (fields: FieldSchema[]): boolean => {
    const stepErrors: Record<string, string> = {};
    for (const f of fields) {
      if (!fieldVisible(f, values)) continue;
      const err = validateField(f, values[f.key]);
      if (err) stepErrors[f.key] = err;
    }
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const goNext = () => {
    if (!validateFields(currentStepFields)) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allVisibleFields = (form?.fields ?? []).filter((f) => fieldVisible(f, values));
    if (!validateFields(allVisibleFields)) {
      // Jump back to the first step containing an error, if multi-step.
      const firstBadStep = steps.findIndex((stepFields) => stepFields.some((f) => fieldVisible(f, values) && validateField(f, values[f.key])));
      if (firstBadStep >= 0) setStep(firstBadStep);
      return;
    }
    setSubmitting(true);
    setError('');
    setIsDuplicate(false);
    try {
      const hasFileField = form?.fields.some((f) => f.type === 'file');
      let body: string | FormData;
      let headers: Record<string, string> | undefined;
      if (hasFileField) {
        const fd = new FormData();
        form?.fields.forEach((f) => {
          if (!fieldVisible(f, values)) return;
          if (f.type === 'file') {
            const file = files[f.key];
            if (file) fd.append(f.key, file);
          } else if (values[f.key] !== undefined) {
            fd.append(f.key, String(values[f.key]));
          }
        });
        body = fd;
      } else {
        const visibleValues: Record<string, any> = {};
        form?.fields.forEach((f) => { if (fieldVisible(f, values)) visibleValues[f.key] = values[f.key]; });
        body = JSON.stringify(visibleValues);
        headers = { 'Content-Type': 'application/json' };
      }

      const response = await fetch(`/api/forms/${id}/submit`, { method: 'POST', headers, body });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem(draftKey(id));
        if (form?.thankYouUrl) {
          window.location.href = form.thankYouUrl;
        } else {
          setSubmitted(true);
        }
      } else {
        setIsDuplicate(response.status === 409);
        setError(data.message || 'Failed to submit. Please try again.');
      }
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (form === undefined) return <LoadingState label="Loading form..." />;

  if (form === null) {
    return (
      <Container size="sm" className="flex min-h-[60vh] items-center justify-center py-16 text-center">
        <p className="text-body-md text-foreground-muted">This form doesn&apos;t exist or is no longer available.</p>
      </Container>
    );
  }

  return (
    <Container size="sm" className="py-16">
      <Card variant="raised" padding="lg">
        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-subtle">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <p className="text-body-md text-foreground-muted">Thank you — your submission has been received.</p>
          </div>
        ) : (
          <>
            <h1 className="text-headline-sm text-foreground">{form.title}</h1>
            {form.description && <p className="mt-2 text-body-sm text-foreground-muted">{form.description}</p>}

            {draftRestored && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-info/30 bg-info-subtle p-3 text-body-sm text-info">
                <span className="flex items-center gap-2"><Info className="h-4 w-4 shrink-0" /> Restored your saved draft.</span>
                <button type="button" onClick={clearDraft} className="font-medium underline underline-offset-2">Clear</button>
              </div>
            )}

            {isMultiStep && (
              <div className="my-6">
                <div className="relative mb-3 flex items-center justify-between">
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
                  <div
                    className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent transition-all duration-slow"
                    style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                  />
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-body-sm font-medium',
                        step >= i ? 'bg-accent text-accent-foreground' : 'bg-surface-active text-foreground-subtle'
                      )}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <p className="text-caption text-foreground-subtle">Step {step + 1} of {steps.length}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className={cn('space-y-4', isMultiStep ? '' : 'mt-6')}>
              {currentStepFields.map((f) =>
                f.type === 'textarea' ? (
                  <Textarea
                    key={f.key}
                    label={f.label}
                    required={f.required}
                    rows={4}
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    onBlur={() => validateFields([f])}
                    error={errors[f.key]}
                  />
                ) : f.type === 'checkbox' ? (
                  <div key={f.key}>
                    <Checkbox
                      label={`${f.label}${f.required ? ' *' : ''}`}
                      checked={!!values[f.key]}
                      onChange={(e) => setValue(f.key, e.target.checked)}
                    />
                    {errors[f.key] && <p className="mt-1 text-caption text-danger">{errors[f.key]}</p>}
                  </div>
                ) : f.type === 'file' ? (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-label text-foreground">
                      {f.label}{f.required && <span className="ml-0.5 text-danger">*</span>}
                    </label>
                    <input
                      type="file"
                      required={f.required}
                      onChange={(e) => setFiles({ ...files, [f.key]: e.target.files?.[0] ?? null })}
                      className="block w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-body-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-accent-subtle file:px-3 file:py-1.5 file:text-accent"
                    />
                  </div>
                ) : (
                  <Input
                    key={f.key}
                    label={f.label}
                    type={f.type === 'datetime' ? 'datetime-local' : f.type}
                    required={f.required}
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    onBlur={() => validateFields([f])}
                    error={errors[f.key]}
                  />
                )
              )}

              {error && (
                <p className={cn('text-body-sm', isDuplicate ? 'rounded-lg border border-info/30 bg-info-subtle p-3 text-info' : 'text-danger')}>
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                {isMultiStep && step > 0 && (
                  <Button type="button" variant="outline" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={goPrev}>
                    Previous
                  </Button>
                )}
                {isMultiStep && step < steps.length - 1 ? (
                  <Button type="button" className="ml-auto" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={goNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" fullWidth={!isMultiStep} className={isMultiStep ? 'ml-auto' : ''} loading={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                )}
              </div>
            </form>
          </>
        )}
      </Card>
    </Container>
  );
}
