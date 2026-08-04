'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Church, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const router = useRouter()
  const { user, login } = useAuth()

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Invalid email or password')
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
            <h1 className="text-headline-sm text-foreground">Welcome Back</h1>
            <p className="mt-1 text-body-sm text-foreground-muted">Sign in to your account</p>
          </div>

          {error && <p className="mb-4 rounded-lg border border-danger/30 bg-danger-subtle p-3 text-body-sm text-danger">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email Address"
              leftIcon={<Mail />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Password"
              leftIcon={<Lock />}
              rightIcon={
                <IconButton
                  type="button"
                  label={showPassword ? 'Hide password' : 'Show password'}
                  size="sm"
                  className="pointer-events-auto -mr-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </IconButton>
              }
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Button type="submit" fullWidth size="lg" loading={loading}>{loading ? 'Signing In...' : 'Sign In'}</Button>
          </form>

          <p className="mt-6 text-center text-body-sm text-foreground-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-accent hover:text-accent-hover">Sign Up</Link>
          </p>
          <p className="mt-4 text-center">
            <Link href="/" className="text-body-sm text-foreground-subtle hover:text-foreground">← Back to Home</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
