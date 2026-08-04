'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Quote, Send } from 'lucide-react';
import { getTestimonials, Testimonial } from '@/lib/content';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ authorName: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getTestimonials().then(setTestimonials).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');
    try {
      const response = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitStatus('success');
        setForm({ authorName: '', content: '' });
        setShowForm(false);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || 'Failed to submit testimony');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Failed to submit testimony. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Testimonials</h1>
          <p className="text-lg text-blue-100">Stories of faith and God&apos;s work in the lives of our church family</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {submitStatus === 'success' && (
            <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300 text-center">
              Thank you — your testimony will appear here once reviewed.
            </div>
          )}

          <div className="flex justify-center mb-10">
            <button
              onClick={() => setShowForm(v => !v)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" /> Share Your Testimony
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div>
                <label htmlFor="testimonial-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name *</label>
                <input
                  id="testimonial-name"
                  type="text"
                  required
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="testimonial-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Testimony *</label>
                <textarea
                  id="testimonial-content"
                  required
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              {submitStatus === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Testimony'}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Submissions are reviewed before appearing publicly.</p>
            </form>
          )}

          {testimonials.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No testimonials yet — be the first to share.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <Quote className="w-6 h-6 text-blue-400 mb-3" />
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    {t.imageUrl && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                        <Image src={t.imageUrl} alt={t.authorName} fill className="object-cover" sizes="40px" />
                      </div>
                    )}
                    <p className="font-semibold text-gray-900 dark:text-white">{t.authorName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
