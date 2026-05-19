import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import SEO from '../components/common/SEO';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <SEO title="Forgot Password" description="Reset your PELLICLE account password." noIndex url="/forgot-password" />
      <div className="w-full max-w-md">
        <Link to="/" className="inline-block mb-8">
          <span className="font-heading text-2xl font-bold text-deep-forest tracking-[0.15em]">PELLICLE</span>
        </Link>
        {sent ? (
          <div className="card p-8 text-center">
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-deep-forest mb-2">Check your inbox</h2>
            <p className="text-gray-500 mb-6">We've sent a password reset link to <strong>{email}</strong>. It expires in 15 minutes.</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2"><ArrowLeft size={16} /> Back to Login</Link>
          </div>
        ) : (
          <div className="card p-8">
            <h1 className="text-2xl font-bold text-deep-forest mb-2">Forgot Password?</h1>
            <p className="text-gray-500 mb-6">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="forgot-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input-field pl-10" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-olive-green mt-5 justify-center">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
