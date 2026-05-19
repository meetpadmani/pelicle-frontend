import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import SEO from '../components/common/SEO';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (result.payload?.accessToken) navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      <SEO title="Sign In" description="Sign in to your PELLICLE account to shop, track orders and more." noIndex url="/login" />
      {/* Left Image */}
      <div className="hidden lg:block w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900" alt="Fashion" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-forest/90 to-transparent flex items-center px-14">
          <div>
            <h2 className="font-heading text-5xl font-bold text-warm-ivory mb-4 leading-tight">Welcome<br />Back</h2>
            <p className="text-warm-ivory/70 text-lg font-body">Your wardrobe awaits.</p>
          </div>
        </div>
      </div>
      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-warm-ivory">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-block mb-8">
            <span className="font-heading text-2xl font-extrabold text-deep-forest tracking-tight lowercase">pelicle</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-deep-forest mb-2">Sign In</h1>
          <p className="text-cool-taupe mb-8">Don't have an account? <Link to="/register" className="text-olive-green font-semibold hover:underline">Register</Link></p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="login-email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com" className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="login-password" type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-dusty-blue hover:underline">Forgot password?</Link>
            </div>
            <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-light-beige rounded-xl text-xs text-charcoal">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Admin: meet / 12345678</p>
            <p>User: user@pellicle.com / User@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
