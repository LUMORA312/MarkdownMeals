import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { partnerLogin, partnerSignup, setAuth } from '@/lib/api';
import { UtensilsCrossed, Mail, Lock, Building2, Phone, Loader2, ArrowLeft } from 'lucide-react';

export default function PartnerLogin() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        if (!businessName.trim()) { setError('Business name is required'); setLoading(false); return; }
        const res = await partnerSignup({ email, password, businessName, phone: phone || undefined });
        setAuth(res.token, { ...res.partner, role: 'partner' });
      } else {
        const res = await partnerLogin(email, password);
        setAuth(res.token, { ...res.partner, role: 'partner' });
      }
      navigate('/partner/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <Link to="/" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-accent shadow-md">
              <UtensilsCrossed className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-display text-foreground">Partner Portal</h1>
            <p className="text-sm font-body text-muted-foreground text-center">
              {isSignup ? 'Create your partner account' : 'Sign in to manage your deals'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignup && (
              <>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business Name"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </div>

            {error && (
              <p className="text-sm font-body text-destructive text-center">{error}</p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-body font-bold text-base cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignup ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <p className="text-sm font-body text-muted-foreground text-center mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              className="text-accent font-semibold cursor-pointer hover:underline"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
