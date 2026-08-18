import { useState } from 'react'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const { signIn, signUp } = useAuth()
  const [, navigate] = useLocation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          toast.error('Please enter your full name')
          setLoading(false)
          return
        }

        const { error } = await signUp(email, password, fullName)
        if (error) {
          toast.error(error.message || 'Failed to sign up')
        } else {
          toast.success('Account created! Please check your email to confirm.')
          setIsSignUp(false)
          setEmail('')
          setPassword('')
          setFullName('')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          toast.error(error.message || 'Failed to sign in')
        } else {
          toast.success('Signed in successfully!')
          navigate('/')
        }
      }
    } catch (err) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fillAdminCredentials = () => {
    setEmail('admin@gam-bids.gm')
    setPassword('Admin@123456')
    setIsSignUp(false)
  }

  const fillUserCredentials = () => {
    setEmail('user@gam-bids.gm')
    setPassword('User@123456')
    setIsSignUp(false)
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-10 sm:py-16">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-white shadow-xl md:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-river p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute inset-0 bg-[url('/manus-storage/gambids-river-texture_26d303c4.jpg')] bg-cover bg-center opacity-20" />
          <div className="relative">
            <div className="mb-12 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-laterite to-ochre p-0.5 shadow-sm">
                <img src="/manus-storage/gambids-gb-mark_a2b45b37.png" alt="" className="h-full w-full rounded-[0.65rem] object-cover" />
              </div>
              <div>
                <div className="font-serif text-xl font-bold">GAM-BIDS</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-groundnut">Gambia Tender Search</div>
              </div>
            </div>
            <p className="max-w-xs font-serif text-3xl leading-tight">The public record of opportunity, made easier to reach.</p>
          </div>
          <div className="relative border-t border-white/20 pt-5 text-sm text-white/70">Every Gambian tender, in one place.</div>
        </aside>

        <div className="p-6 sm:p-10">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-river md:hidden">
              <span className="h-2 w-2 rounded-full bg-laterite" /> GAM-BIDS
            </div>
            <h1 className="font-serif text-3xl font-bold text-ink mb-2">{isSignUp ? 'Create your account' : 'Sign in to GAM-BIDS'}</h1>
            <p className="text-muted">{isSignUp ? 'Keep your procurement work close at hand.' : 'Continue to the tender search and your saved opportunities.'}</p>
          </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-line shadow-lg p-8 space-y-6">
          {isSignUp && (
            <div>
              <Label htmlFor="fullName" className="text-sm font-semibold mb-2 block">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="w-full"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-semibold mb-2 block">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-river hover:bg-river-dark text-white font-semibold py-2"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setEmail('')
              setPassword('')
              setFullName('')
            }}
            className="w-full border-line"
          >
            {isSignUp ? 'Sign In Instead' : 'Create Account'}
          </Button>
        </form>

        {/* Demo Credentials */}
        {!isSignUp && (
          <div className="mt-6 bg-river/10 border border-river/20 rounded-lg p-4">
            <p className="text-xs font-semibold text-river uppercase tracking-widest mb-3">
              Demo Credentials
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="w-full text-left px-3 py-2 bg-white border border-river/30 rounded hover:bg-river/5 transition text-sm"
              >
                <div className="font-semibold text-river">Admin Account</div>
                <div className="text-xs text-muted">admin@gam-bids.gm</div>
              </button>
              <button
                type="button"
                onClick={fillUserCredentials}
                className="w-full text-left px-3 py-2 bg-white border border-river/30 rounded hover:bg-river/5 transition text-sm"
              >
                <div className="font-semibold text-river">User Account</div>
                <div className="text-xs text-muted">user@gam-bids.gm</div>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted">
            <a href="/" className="text-river hover:underline">
              ← Back to home
            </a>
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
