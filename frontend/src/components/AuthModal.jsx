import React, { useState } from 'react';
import axios from 'axios';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const res = await axios.post(
        `http://localhost:5000${endpoint}`,
        formData,
      );

      // Token aur User details save karo
      localStorage.setItem('opsmind_token', res.data.token);
      localStorage.setItem('opsmind_user', JSON.stringify(res.data.user));

      onLoginSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#171c28] border border-slate-700 w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-slate-400 hover:text-white text-xl"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-400 mb-8">
          {isLogin
            ? 'Login to continue your OpsMind session.'
            : 'Sign up to start chatting with your SOPs.'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-[#0b0f19] border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-emerald-500 outline-none"
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full bg-[#0b0f19] border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-emerald-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full bg-[#0b0f19] border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-emerald-500 outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-400 hover:underline font-medium"
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
