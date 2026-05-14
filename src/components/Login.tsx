import React, { useState } from 'react';
import { LogIn, ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../App';

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mock authentication
    setTimeout(() => {
      if (email === 'admin@test.com' && password === 'password123') {
        onLogin({
          uid: 'admin-123',
          email: 'admin@test.com',
          displayName: 'Test Admin',
          photoURL: '',
          role: 'admin',
          createdAt: new Date().toISOString(),
        });
      } else if (email === 'dev@test.com' && password === 'password123') {
        onLogin({
          uid: 'dev-789',
          email: 'dev@test.com',
          displayName: 'Test Developer',
          photoURL: '',
          role: 'developer',
          createdAt: new Date().toISOString(),
        });
      } else if (email === 'user@test.com' && password === 'password123') {
        onLogin({
          uid: 'user-456',
          email: 'user@test.com',
          displayName: 'Test User',
          photoURL: '',
          role: 'user',
          createdAt: new Date().toISOString(),
        });
      } else {
        setError('Invalid email or password. Use admin@test.com or user@test.com with password123');
      }
      setLoading(false);
    }, 500);
  };

  const quickLogin = (type: 'admin' | 'user' | 'developer') => {
    const testEmail = type === 'admin' ? 'admin@test.com' : type === 'developer' ? 'dev@test.com' : 'user@test.com';
    setEmail(testEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">SupportFlow</h1>
          <p className="text-gray-500 text-sm">Offline Testing Mode</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-sm text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="admin@test.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="password123"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">Quick Access</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => quickLogin('admin')}
            className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mb-1" />
            <span className="text-[10px] font-bold text-gray-600">Admin</span>
          </button>
          <button
            onClick={() => quickLogin('developer')}
            className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-green-600 mb-1" />
            <span className="text-[10px] font-bold text-gray-600">Dev</span>
          </button>
          <button
            onClick={() => quickLogin('user')}
            className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <LogIn className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mb-1" />
            <span className="text-[10px] font-bold text-gray-600">User</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
