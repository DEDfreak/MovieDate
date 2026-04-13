import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Heart, Eye, EyeOff } from "lucide-react";
import { saveSession } from "../../lib/auth";

type Mode = 'login' | 'register';

export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const [mode, setMode]               = useState<Mode>('login');
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          username: username.trim(),
          password,
          display_name: displayName.trim() || username.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      saveSession(data.token, data.user);
      navigate('/');
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#211111] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#e82833]/20 border-2 border-[#e82833]/40 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-[#e82833]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-['Plus_Jakarta_Sans',Helvetica]">CineDate</h1>
          <p className="text-[#a08082] text-sm mt-1">Your couple movie diary</p>
        </div>

        {/* Card */}
        <div className="bg-[#2e1517] border border-[#663335] rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 font-['Plus_Jakarta_Sans',Helvetica]">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display name — register only */}
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#a08082]">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Her, Him, Alex…"
                  autoComplete="name"
                  className="bg-[#3d1f22] border border-[#663335] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#663335] focus:outline-none focus:border-[#e82833] transition-colors"
                />
              </div>
            )}

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#a08082]">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your_username"
                autoComplete="username"
                autoFocus
                className="bg-[#3d1f22] border border-[#663335] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#663335] focus:outline-none focus:border-[#e82833] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#a08082]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full bg-[#3d1f22] border border-[#663335] rounded-lg px-4 py-3 pr-11 text-sm text-white placeholder:text-[#663335] focus:outline-none focus:border-[#e82833] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a08082] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-[#663335]">Minimum 6 characters</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#e82833] hover:bg-[#c62229] text-white font-semibold text-base disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-[#a08082] mt-6">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={switchMode}
              className="text-[#e82833] hover:text-[#c62229] font-medium transition-colors"
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
