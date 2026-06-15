import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../store/authStore.js';
import useLanguageStore from '../../store/languageStore.js';

export default function Register() {
  const [form, setForm]         = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, isLoading, error, clearError } = useAuthStore();
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError('');

    if (form.password !== form.confirmPassword) {
      setFormError('Пароли не совпадают');
      return;
    }
    if (form.password.length < 6) {
      setFormError('Пароль должен быть не менее 6 символов');
      return;
    }

    const result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    if (result.success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-luxury-gradient flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/">
            <div className="w-12 h-12 rounded-full bg-pink-gradient flex items-center justify-center shadow-pink mx-auto mb-3">
              <span className="text-white font-serif font-bold text-lg">LP</span>
            </div>
          </Link>
          <h1 className="font-serif text-3xl text-charcoal-800">{t('auth.register_title')}</h1>
          <p className="text-charcoal-400 text-sm mt-1">Luxury Platok</p>
        </div>

        <div className="bg-white rounded-3xl shadow-luxury-lg p-8">
          {(error || formError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-5 text-sm">
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">{t('auth.name')} *</label>
              <input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="input-field"
                placeholder="Ваше имя"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">{t('auth.email')} *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">{t('auth.phone')}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="input-field"
                placeholder="+998 90 000 00 00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">{t('auth.password')} *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="input-field pr-11"
                  placeholder="Минимум 6 символов"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">{t('auth.confirm_password')} *</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                className="input-field"
                placeholder="Повторите пароль"
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full text-base py-3.5">
              {isLoading ? 'Создаём аккаунт...' : t('auth.register')}
            </button>
          </form>

          <p className="text-center text-sm text-charcoal-500 mt-6">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-pink-500 hover:text-pink-600 font-medium">
              {t('auth.login')}
            </Link>
          </p>
        </div>

        {/* Wholesale CTA */}
        <div className="mt-4 text-center">
          <p className="text-sm text-charcoal-500">
            Вы бизнес?{' '}
            <Link to="/register" className="text-gold-500 hover:text-gold-600 font-medium">
              {t('auth.wholesale_apply')} →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
