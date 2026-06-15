import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../store/authStore.js';
import useLanguageStore from '../../store/languageStore.js';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const { t } = useLanguageStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await login(email, password);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-luxury-gradient flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-pink-gradient flex items-center justify-center shadow-pink mx-auto mb-3">
              <span className="text-white font-serif font-bold text-lg">LP</span>
            </div>
          </Link>
          <h1 className="font-serif text-3xl text-charcoal-800">{t('auth.login_title')}</h1>
          <p className="text-charcoal-400 text-sm mt-1">Luxury Platok</p>
        </div>

        <div className="bg-white rounded-3xl shadow-luxury-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-charcoal-600">{t('auth.password')}</label>
                <button type="button" className="text-xs text-pink-400 hover:text-pink-600">
                  {t('auth.forgot_password')}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-base py-3.5"
            >
              {isLoading ? 'Входим...' : t('auth.login')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-charcoal-400">{t('auth.or')}</span>
            </div>
          </div>

          {/* Telegram login placeholder */}
          <button className="w-full py-3 px-4 rounded-2xl border-2 border-[#0088cc]/30 bg-[#0088cc]/5 text-[#0088cc] font-medium text-sm hover:bg-[#0088cc]/10 transition-all flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.43 13.625l-2.938-.916c-.638-.197-.651-.638.136-.943l11.466-4.42c.537-.194 1.006.131.8.875z"/>
            </svg>
            {t('auth.telegram_login')}
          </button>

          <p className="text-center text-sm text-charcoal-500 mt-6">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-pink-500 hover:text-pink-600 font-medium">
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
