'use client';

import { useEffect, useState, use } from 'react';
import { CheckCircle } from 'lucide-react';
import { FieldSchema } from '@/types/contentType';

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
      .then(res => res.json())
      .then(data => setForm(data.success ? data.form : null))
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

  if (form === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (form === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <p className="text-gray-500 dark:text-gray-400">This form doesn&apos;t exist or is no longer available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300">Thank you — your submission has been received.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{form.title}</h1>
            {form.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{form.description}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {form.fields.map((f) => (
                <div key={f.key}>
                  <label htmlFor={`pf-${f.key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {f.label}{f.required && ' *'}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      id={`pf-${f.key}`}
                      required={f.required}
                      rows={4}
                      value={values[f.key] ?? ''}
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    />
                  ) : f.type === 'checkbox' ? (
                    <input
                      id={`pf-${f.key}`}
                      type="checkbox"
                      checked={!!values[f.key]}
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.checked })}
                      className="w-4 h-4"
                    />
                  ) : (
                    <input
                      id={`pf-${f.key}`}
                      type={f.type === 'datetime' ? 'datetime-local' : f.type}
                      required={f.required}
                      value={values[f.key] ?? ''}
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    />
                  )}
                </div>
              ))}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
