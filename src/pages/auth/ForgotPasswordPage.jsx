import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your corporate email address.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to request password reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg text-base">
            EP
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Reset Your Password</h1>
            <p className="text-xs text-slate-400">Enterprise Security Self-Service</p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Reset Link Sent</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                If an account exists for <strong className="text-slate-200">{email}</strong>, you will receive password reset instructions shortly.
              </p>
            </div>
            <Link to="/login" className="inline-block pt-2">
              <Button variant="outline" size="md" icon={ArrowLeft}>
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your registered corporate email address and we will send you a secure verification link to reset your password.
            </p>

            <Input
              label="Corporate Email Address"
              type="email"
              icon={Mail}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
