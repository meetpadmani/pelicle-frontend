import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import SEO from '../components/common/SEO';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <SEO title="Reset Password" description="Set a new password for your PELLICLE account." noIndex />
      <div className="w-full max-w-md">
        <Link to="/" className="inline-block mb-8">
          <span className="font-heading text-2xl font-bold text-deep-forest tracking-[0.15em]">PELLICLE</span>
        </Link>
        {done ? (
          <div className="card p-8 text-center">
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
            <p className="text-gray-500 mb-6">Redirecting you to login...</p>
          </div>
        ) : (
          <div className="card p-8">
            <h1 className="text-2xl font-bold text-deep-forest mb-2">Set New Password</h1>
            <p className="text-gray-500 mb-6">Choose a strong password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="input-field pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Confirm password" className="input-field pl-10" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
