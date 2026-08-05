'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Church, User, Eye, EyeOff, Mail, Lock, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/cn'

const REFERRAL_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'friend-family', label: 'Friend or Family' },
  { value: 'search', label: 'Search Engine' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'walk-in', label: 'Just Visited In Person' },
  { value: 'event', label: 'A Church Event' },
  { value: 'other', label: 'Other' },
]

const MEMBERSHIP_OPTIONS = [
  { value: 'visitor', label: "I'm just visiting / exploring" },
  { value: 'regular_attendee', label: 'I attend regularly' },
  { value: 'member', label: "I'm a member of this church" },
]

function passwordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'bg-surface-active' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-danger' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-warning' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-info' };
  return { score: 4, label: 'Strong', color: 'bg-success' };
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    membershipStatus: 'visitor' as 'visitor' | 'regular_attendee' | 'member',
    referralSource: '',
  })
  const router = useRouter()
  const { user, register } = useAuth()

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  const strength = passwordStrength(formData.password)

  const validateStep1 = (): string | null => {
    if (!formData.name.trim()) return 'Please enter your name.'
    if (!formData.email.trim()) return 'Please enter your email.'
    if (formData.password.length < 6) return 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
    return null
  }

  const goToStep2 = () => {
    const validationError = validateStep1()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setStep(2)
  }

  const createAccount = async () => {
    setLoading(true)
    setError('')
    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        membershipStatus: formData.membershipStatus,
        referralSource: formData.referralSource,
      })
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      goToStep2()
      return
    }
    await createAccount()
  }

  if (user) return null

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-surface p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card variant="raised" padding="lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
              <Church className="h-7 w-7 text-accent-foreground" />
            </div>
            <h1 className="text-headline-sm text-foreground">Join Our Community</h1>
            <p className="mt-1 text-body-sm text-foreground-muted">Create your account to connect with our church family</p>
          </div>

          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className={cn('h-1.5 w-12 rounded-full transition-colors', step >= s ? 'bg-accent' : 'bg-surface-active')} />
            ))}
          </div>

          {error && <p className="mb-4 rounded-lg border border-danger/30 bg-danger-subtle p-3 text-body-sm text-danger">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <Input label="Full Name" leftIcon={<User />} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <Input type="email" label="Email Address" leftIcon={<Mail />} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    leftIcon={<Lock />}
                    rightIcon={
                      <IconButton type="button" label={showPassword ? 'Hide password' : 'Show password'} size="sm" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff /> : <Eye />}
                      </IconButton>
                    }
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= strength.score ? strength.color : 'bg-surface-active')} />
                        ))}
                      </div>
                      <p className="mt-1 text-caption text-foreground-subtle">Password strength: {strength.label}</p>
                    </div>
                  )}
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  leftIcon={<Lock />}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <Button type="submit" fullWidth size="lg" rightIcon={<ChevronRight className="h-4 w-4" />}>Continue</Button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <p className="mb-3 text-label text-foreground">Which best describes you?</p>
                  <div className="space-y-2">
                    {MEMBERSHIP_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setFormData({ ...formData, membershipStatus: opt.value as typeof formData.membershipStatus })}
                        className={cn(
                          'w-full rounded-lg border-2 p-3 text-left text-body-sm transition-colors',
                          formData.membershipStatus === opt.value ? 'border-accent bg-accent-subtle text-foreground' : 'border-border text-foreground-muted hover:border-border-strong'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Select
                  label="How did you hear about us? (optional)"
                  value={formData.referralSource}
                  onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                  options={REFERRAL_OPTIONS}
                />

                <div className="flex gap-3">
                  <Button type="button" variant="outline" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" fullWidth loading={loading}>{loading ? 'Creating Account...' : 'Create Account'}</Button>
                </div>
                <button type="button" onClick={createAccount} disabled={loading} className="w-full text-center text-body-sm text-foreground-subtle hover:text-foreground">
                  Skip this step
                </button>
              </motion.div>
            )}
          </form>

          <p className="mt-6 text-center text-body-sm text-foreground-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-accent hover:text-accent-hover">Sign In</Link>
          </p>
          <p className="mt-4 text-center">
            <Link href="/" className="text-body-sm text-foreground-subtle hover:text-foreground">← Back to Home</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
