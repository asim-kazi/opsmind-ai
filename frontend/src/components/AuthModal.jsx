import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const { login, register } = useAuth();

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

    if (!isLogin && !formData.name.trim()) {
      setError('Name required');

      return;
    }

    if (!formData.email || !formData.password) {
      setError('Fill all fields');

      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimum 6 chars');

      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(
          formData.email,

          formData.password,
        );
      } else {
        await register(
          formData.name,

          formData.email,

          formData.password,
        );
      }

      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong!!!');
      console.log(err);

      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/60
backdrop-blur-sm
px-4
"
    >
      <div
        className="
bg-[#171c28]
border
border-slate-700
w-full
max-w-md
p-8
rounded-3xl
shadow-2xl
relative
"
      >
        <button
          onClick={onClose}
          className="
absolute
top-4
right-5
text-slate-400
"
        >
          ✕
        </button>

        <h2
          className="
text-3xl
font-bold
text-white
mb-2
"
        >
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-400 mb-8">
          {isLogin
            ? 'Please Login to continue your OpsMind session.'
            : 'Sign up to start chatting with your SOPs.'}
        </p>
        {error && (
          <div
            className="
mb-4
p-3
bg-red-500/10
text-red-400
rounded-lg
"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="
space-y-4
"
        >
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  name: e.target.value,
                })
              }
              className="
w-full
bg-[#0b0f19]
p-3
rounded-xl
"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,

                email: e.target.value,
              })
            }
            className="
w-full
bg-[#0b0f19]
p-3
rounded-xl
"
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({
                ...formData,

                password: e.target.value,
              })
            }
            className="
w-full
bg-[#0b0f19]
p-3
rounded-xl
"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="
w-full
bg-emerald-600
py-3
rounded-xl
"
          >
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p
          className="
mt-4
text-center
"
        >
          <button
            onClick={() => {
              setIsLogin(!isLogin);

              setError('');
            }}
            className="
text-emerald-400
"
          >
            {isLogin ? 'Create account' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
