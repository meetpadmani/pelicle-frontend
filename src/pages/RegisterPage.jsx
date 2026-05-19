import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/auth/authSlice';
import SEO from '../components/common/SEO';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { alert('Password must be at least 6 characters'); return; }
    const result = await dispatch(registerUser(form));
    if (result.payload?.accessToken) navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      <SEO title="Create Account" description="Join PELLICLE — India's premium fashion destination. Create your account and start shopping." url="/register" />
      <div className="hidden lg:block w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900" alt="Fashion" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-forest/90 to-transparent flex items-center px-14">
          <div>
            <h2 className="font-heading text-5xl font-bold text-warm-ivory mb-4 leading-tight">Join<br />pelicle</h2>
            <p className="text-warm-ivory/70 text-lg font-body">Wear your story, today.</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-warm-ivory">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-block mb-8">
            <span className="font-heading text-2xl font-extrabold text-deep-forest tracking-tight lowercase">pelicle</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-deep-forest mb-2">Create Account</h1>
          <p className="text-cool-taupe mb-8">Already have an account? <Link to="/login" className="text-olive-green font-semibold hover:underline">Sign In</Link></p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</label>
              <div className="relative"><User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="reg-name" type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name" className="input-field pl-10" /></div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
              <div className="relative"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="reg-email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com" className="input-field pl-10" /></div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone (optional)</label>
              <div className="relative"><Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="reg-phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 9999999999" className="input-field pl-10" /></div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
              <div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="reg-password" type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button id="reg-submit" type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-xs text-cool-taupe text-center mt-4">By registering, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
