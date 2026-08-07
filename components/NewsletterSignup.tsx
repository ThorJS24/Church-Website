'use client';

import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to subscribe');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <p className="flex items-center gap-2 text-body-sm text-success">
        <CheckCircle className="h-4 w-4" /> Thanks for subscribing!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 min-w-0 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-body-sm text-white placeholder-white/40 focus:outline-hidden focus:ring-2 focus:ring-white/30"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          aria-label="Subscribe to newsletter"
          className="shrink-0 rounded-md bg-white px-3 py-2 text-[#2A2118] transition-colors hover:bg-white/90 disabled:opacity-50"
        >
          <Mail className="h-4 w-4" />
        </button>
      </div>
      {status === 'error' && <p className="text-caption text-[#E8898D]">{message}</p>}
    </form>
  );
}
