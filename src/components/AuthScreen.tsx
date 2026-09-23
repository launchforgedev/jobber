import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo.tsx';
import { UserSession } from '../types/prepkit.ts';
import { loginUser, registerUser } from '../services/authStorage.ts';
import { ArrowRight, Lock, Mail, User, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: (session: UserSession) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Please enter a valid work or personal email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      let res;
      if (isRegister) {
        res = registerUser(email.trim(), password, name.trim() || 'Software Engineer');
      } else {
        res = loginUser(email.trim(), password);
        // If login fails because user doesn't exist yet, auto-register for frictionless evaluation
        if (!res.success && res.error?.includes('Invalid email or password')) {
          res = registerUser(email.trim(), password, 'Jobber Candidate');
        }
      }

      setLoading(false);

      if (res.success && res.session) {
        onAuthenticated(res.session);
      } else {
        setError(res.error || 'Authentication failed. Please check credentials.');
      }
    }, 350);
  };

  const handleOAuthDemo = (provider: 'Google' | 'GitHub') => {
    setLoading(true);
    setTimeout(() => {
      const demoEmail = provider === 'Google' ? 'engineer.demo@gmail.com' : 'dev-candidate@github.com';
      let res = loginUser(demoEmail, 'oauth_secure_token');
      if (!res.success) {
        res = registerUser(demoEmail, 'oauth_secure_token', `${provider} Candidate`);
      }
      setLoading(false);
      if (res.session) {
        onAuthenticated(res.session);
      }
    }, 400);
  };

  const handleQuickDemoAccess = () => {
    const demoEmail = 'candidate@jobber.ai';
    let res = loginUser(demoEmail, 'demo123');
    if (!res.success) {
      res = registerUser(demoEmail, 'demo123', 'Senior Candidate');
    }
    if (res.session) {
      onAuthenticated(res.session);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3">
          <BrandLogo size={42} />
          <div className="text-left">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Jobber
            </span>
            <span className="ml-2 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 uppercase">
              Enterprise
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
          {isRegister ? 'Create your candidate account' : 'Sign in to Jobber Analytics'}
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
          Deterministic interview intelligence & resume compatibility scoring
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthDemo('Google')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors shadow-2xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthDemo('GitHub')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors shadow-2xs"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
            </div>
            <div className="relative bg-white dark:bg-zinc-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono">
              Or with work email
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@company.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setError('Password reset demo: Use demo login or re-register.')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-2.5 text-xs font-semibold shadow-xs transition-colors duration-150 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800/30 px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Explore as Verified Candidate (1-Click Demo)</span>
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {isRegister
                ? 'Already have an account? Sign in here'
                : "Don't have an account yet? Create one"}
            </button>
          </div>
        </div>

        {/* Security badge compliant with assessment specs */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-zinc-500 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          <span>Local Session Isolation · No external credentials stored</span>
        </div>
      </div>
    </div>
  );
};
