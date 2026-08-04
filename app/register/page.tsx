'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Church, User, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const router = useRouter()
  const { user, register } = useAuth()

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const success = await register({ name: formData.name, email: formData.email, password: formData.password })
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

  if (user) return null

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-surface p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card variant="raised" padding="lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
              <Church className="h-7 w-7 text-accent-foreground" />
            </div>
            <h1 className="text-headline-sm text-foreground">Join Our Community</h1>
            <p className="mt-1 text-body-sm text-foreground-muted">Create your account to connect with our church family</p>
          </div>

          {error && <p className="mb-4 rounded-lg border border-danger/30 bg-danger-subtle p-3 text-body-sm text-danger">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" leftIcon={<User />} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input type="email" label="Email Address" leftIcon={<Mail />} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
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
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Confirm Password"
              leftIcon={<Lock />}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            <Button type="submit" fullWidth size="lg" loading={loading}>{loading ? 'Creating Account...' : 'Create Account'}</Button>
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
