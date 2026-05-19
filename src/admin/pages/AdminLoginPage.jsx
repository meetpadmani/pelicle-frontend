import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../features/auth/authSlice';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Support username login by appending the domain if not present
    let loginData = { ...form };
    if (!loginData.email.includes('@')) {
      loginData.email = `${loginData.email.toLowerCase()}@pellicle.com`;
    }

    const result = await dispatch(loginUser(loginData));
    // Redirect to /admin on successful login
    if (result.payload?.accessToken) {
      if (result.payload?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/'); // If regular user logs in via this page, send to home
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Area - Dark theme for Admin */}
      <div className="hidden lg:flex w-1/2 relative bg-deep-forest items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-olive-green/20 to-deep-forest opacity-50"></div>
        <div className="relative z-10 p-14 text-center">
          <h2 className="font-heading text-4xl font-extrabold text-warm-ivory mb-4 tracking-tight lowercase">pelicle<br/><span class="text-sage-green text-2xl uppercase tracking-widest">workspace</span></h2>
          <p className="text-cool-taupe text-lg">Secure administrative access portal.</p>
        </div>
      </div>
      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-warm-ivory">
        <div className="w-full max-w-md card p-8 border-t-4 border-t-deep-forest shadow-xl">
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-extrabold text-deep-forest tracking-tight lowercase mb-2">pelicle</h1>
            <h2 className="text-lg font-heading font-semibold text-cool-taupe uppercase tracking-widest">Admin Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Admin Username</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="admin-login-email" type="text" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. admin" className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="admin-login-password" type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <button id="admin-login-submit" type="submit" disabled={loading} className="w-full bg-deep-forest text-warm-ivory font-semibold rounded-xl px-6 py-3.5 hover:bg-olive-green transition-colors disabled:opacity-70">
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-dusty-blue hover:text-deep-forest underline">Return to Main Store</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
