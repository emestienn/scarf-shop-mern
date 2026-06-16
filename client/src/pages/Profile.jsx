import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Camera, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Loader2, ShieldCheck, BadgeCheck,
} from 'lucide-react';
import useAuthStore from '../store/authStore.js';
import useLanguageStore from '../store/languageStore.js';
import { usersApi, uploadApi } from '../api/index.js';

const Notification = ({ notice }) => (
  <AnimatePresence>
    {notice && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-2 rounded-2xl p-4 mb-5 text-sm border ${
          notice.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}
      >
        {notice.type === 'success' ? <CheckCircle size={16} className="flex-shrink-0" /> : <AlertCircle size={16} className="flex-shrink-0" />}
        {notice.message}
      </motion.div>
    )}
  </AnimatePresence>
);

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const { t } = useLanguageStore();

  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState({ name: '', phone: '', avatar: '' });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [notice, setNotice]       = useState(null);

  const [pwForm, setPwForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw]       = useState({ current: false, next: false, confirm: false });
  const [changingPw, setChangingPw] = useState(false);
  const [pwNotice, setPwNotice]   = useState(null);

  useEffect(() => {
    usersApi.getProfile()
      .then(({ data }) => {
        setForm({ name: data.user.name || '', phone: data.user.phone || '', avatar: data.user.avatar || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const notify = (setter, type, message) => {
    setter({ type, message });
    setTimeout(() => setter(null), 4000);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { data } = await uploadApi.uploadImage(file);
      setForm((f) => ({ ...f, avatar: data.url }));
      setAvatarBroken(false);
    } catch (err) {
      notify(setNotice, 'error', err.response?.data?.message || t('profile.update_error'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await usersApi.updateProfile(form);
      updateUser(data.user);
      notify(setNotice, 'success', t('profile.update_success'));
    } catch (err) {
      notify(setNotice, 'error', err.response?.data?.message || t('profile.update_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      notify(setPwNotice, 'error', t('profile.password_mismatch'));
      return;
    }
    setChangingPw(true);
    try {
      await usersApi.changePassword(pwForm);
      notify(setPwNotice, 'success', t('profile.password_success'));
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      notify(setPwNotice, 'error', err.response?.data?.message || t('profile.password_error'));
    } finally {
      setChangingPw(false);
    }
  };

  const initials = (form.name || user?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-charcoal-50/50 py-10 sm:py-14">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal-800">{t('profile.title')}</h1>
          <div className="gold-divider" />
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="skeleton h-64 rounded-2xl" />
            <div className="skeleton h-72 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal info card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-luxury p-6 sm:p-8"
            >
              <h2 className="font-serif text-xl text-charcoal-800 mb-1 flex items-center gap-2">
                <User size={18} className="text-pink-400" /> {t('profile.personal_info')}
              </h2>
              {user?.role && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gold-600 bg-gold-100 px-2.5 py-1 rounded-full mb-5 mt-2">
                  <BadgeCheck size={12} /> {t(`profile.role.${user.role}`)}
                </span>
              )}

              <Notification notice={notice} />

              <form onSubmit={handleSave} className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    {form.avatar && !avatarBroken ? (
                      <img
                        src={form.avatar}
                        alt=""
                        className="w-20 h-20 rounded-full object-cover border-2 border-pink-100"
                        onError={() => setAvatarBroken(true)}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 text-2xl font-bold">
                        {initials}
                      </div>
                    )}
                    <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-pink-400 hover:bg-pink-500 text-white flex items-center justify-center cursor-pointer shadow-pink transition-colors">
                      {avatarUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarUploading} />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-700">{t('profile.avatar')}</p>
                    <p className="text-xs text-charcoal-400">{avatarUploading ? t('profile.avatar_uploading') : t('profile.avatar_change')}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">{t('profile.name')}</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5 flex items-center gap-1.5">
                    <Mail size={13} /> {t('profile.email')}
                  </label>
                  <input value={user?.email || ''} disabled className="input-field bg-charcoal-50 text-charcoal-400 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} /> {t('profile.phone')}
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="input-field"
                    placeholder={t('profile.phone_placeholder')}
                  />
                </div>

                <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? t('profile.saving') : t('profile.save_changes')}
                </button>
              </form>
            </motion.div>

            {/* Security card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-3xl shadow-luxury p-6 sm:p-8"
            >
              <h2 className="font-serif text-xl text-charcoal-800 mb-1 flex items-center gap-2">
                <ShieldCheck size={18} className="text-pink-400" /> {t('profile.security')}
              </h2>
              <p className="text-sm text-charcoal-400 mb-5">{t('profile.security_sub')}</p>

              <Notification notice={pwNotice} />

              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { key: 'currentPassword', label: t('profile.current_password'), show: 'current', autoComplete: 'current-password' },
                  { key: 'newPassword',     label: t('profile.new_password'),     show: 'next',    autoComplete: 'new-password' },
                  { key: 'confirmPassword', label: t('profile.confirm_password'), show: 'confirm', autoComplete: 'new-password' },
                ].map(({ key, label, show, autoComplete }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1.5 flex items-center gap-1.5">
                      <Lock size={13} /> {label}
                    </label>
                    <div className="relative">
                      <input
                        type={showPw[show] ? 'text' : 'password'}
                        value={pwForm[key]}
                        onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="input-field pr-11"
                        placeholder="••••••••"
                        autoComplete={autoComplete}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => ({ ...s, [show]: !s[show] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                      >
                        {showPw[show] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                ))}

                <button type="submit" disabled={changingPw} className="btn-outline w-full flex items-center justify-center gap-2">
                  {changingPw && <Loader2 size={16} className="animate-spin" />}
                  {changingPw ? t('profile.changing_password') : t('profile.change_password')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
