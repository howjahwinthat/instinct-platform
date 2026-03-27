import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { supabase } from '../lib/supabase';
import { Lightbulb, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const signupSuccess = searchParams.get('signup') === 'success';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        navigate('/home');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex">

      {/* Left side — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-blue-900 to-[#0D1117] p-12 border-r border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold text-white">Instinct</span>
        </Link>

        <div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Your trading education
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              starts here.
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Structured courses, live market data, and progress tracking — all in one place.
          </p>
        </div>

        <div className="text-gray-600 text-sm">
          © 2026 Instinct. For educational purposes only.
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <Lightbulb className="w-7 h-7 text-blue-400" />
            <span className="text-lg font-bold text-white">Instinct</span>
          </Link>

          <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-8">Sign in to continue your trading journey</p>

          {error && (
            <div className="bg-red-900 bg-opacity-40 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {signupSuccess && (
            <div className="bg-green-900 bg-opacity-40 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm">
              Account created successfully! Please sign in.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}