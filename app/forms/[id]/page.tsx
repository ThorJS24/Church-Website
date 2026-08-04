'use client';

import { useEffect, useState, use } from 'react';
import { CheckCircle } from 'lucide-react';
import { FieldSchema } from '@/types/contentType';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/States';

interface PublicForm {
  id: string;
  title: string;
  description?: string;
  fields: FieldSchema[];
}

export default function PublicFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<PublicForm | null | undefined>(undefined);
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data.success ? data.form : null))
      .catch(() => setForm(null));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(`/api/forms/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
      } else {
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

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {form.fields.map((f) =>
                f.type === 'textarea' ? (
                  <Textarea
                    key={f.key}
                    label={f.label}
                    required={f.required}
                    rows={4}
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  />
                ) : f.type === 'checkbox' ? (
                  <Checkbox
                    key={f.key}
                    label={`${f.label}${f.required ? ' *' : ''}`}
                    checked={!!values[f.key]}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.checked })}
                  />
                ) : (
                  <Input
                    key={f.key}
                    label={f.label}
                    type={f.type === 'datetime' ? 'datetime-local' : f.type}
                    required={f.required}
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  />
                )
              )}

              {error && <p className="text-body-sm text-danger">{error}</p>}

              <Button type="submit" fullWidth loading={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
            </form>
          </>
        )}
      </Card>
    </Container>
  );
}
