import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FiLock, FiMail, FiArrowRight, FiShield, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { t, isEnglish, setLanguage } = useLanguage();

  // If already logged in with valid token, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      toast.error(t('loginEmptyError'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(email.trim(), password);
      toast.success(response.message || t('loginSuccess'));
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || t('loginFailError');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Language Switcher for Login Page */}
      <div className="absolute top-6 right-6 z-20 flex items-center bg-slate-800/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            isEnglish
              ? 'bg-primary text-white shadow-sm font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage('hi')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            !isEnglish
              ? 'bg-primary text-white shadow-sm font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          हिंदी
        </button>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white font-black text-2xl shadow-xl shadow-orange-500/25 mb-4">
            CB
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{t('brandName')}</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">{t('loginTitle')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 shadow-2xl shadow-black/50">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
              <FiAlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {t('loginEmailLabel')}
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('loginEmailPlaceholder')}
                  className="w-full bg-slate-900/80 text-white text-sm pl-11 pr-4 py-3.5 rounded-xl border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {t('loginPasswordLabel')}
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('loginPasswordPlaceholder')}
                  className="w-full bg-slate-900/80 text-white text-sm pl-11 pr-4 py-3.5 rounded-xl border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-700 border-slate-600 text-primary focus:ring-0" />
                <span>{t('rememberMe')}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all duration-200 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('loginLoading')}</span>
                </div>
              ) : (
                <>
                  <span>{t('loginBtn')}</span>
                  <FiArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-center gap-2 text-slate-500 text-xs">
            <FiShield size={14} className="text-emerald-400" />
            <span>{t('loginSecureNotice')}</span>
          </div>
        </div>

        {/* Help Note for Admin CLI */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <p>{t('loginCliHelp')} <code className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">node backend/src/scripts/createAdmin.js</code></p>
        </div>
      </div>
    </div>
  );
}
