import React, { useState } from 'react';
import { HardDrive, Mail, Lock, LogIn, Sparkles, Globe } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Language } from '../i18n/translations';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuthStore();
  const { t, language, setLanguage } = useSettingsStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@disk.uz');
    setPassword('password123');
    setLoading(true);
    setError('');
    try {
      await login('demo@disk.uz', 'password123');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Demo login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="is-flex is-align-items-center is-justify-content-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #f8fafc 100%)',
        padding: '1.5rem',
        position: 'relative'
      }}
    >
      {/* Top Language Picker */}
      <div style={{ position: 'absolute', top: '20px', right: '24px' }}>
        <div className="select is-small is-rounded">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            style={{ fontWeight: 600 }}
          >
            <option value="en">🇬🇧 English</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="uz">🇺🇿 O'zbekcha</option>
          </select>
        </div>
      </div>

      <div className="card p-5" style={{ width: '100%', maxWidth: '420px', borderRadius: '18px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        {/* Brand */}
        <div className="has-text-centered mb-5">
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 16px rgba(66, 133, 244, 0.3)'
            }}
          >
            <HardDrive size={30} />
          </div>
          <h2 className="is-size-4 has-text-weight-bold has-text-dark mb-1">
            {t.brandName}
          </h2>
          <p className="has-text-grey is-size-7 mb-0">
            {t.loginSubtitle}
          </p>
        </div>

        {error && (
          <div className="notification is-danger is-light p-3 is-size-7 mb-4" style={{ borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field mb-3">
            <label className="label is-size-7 has-text-grey">{t.emailLabel}</label>
            <div className="control has-icons-left">
              <input
                className="input"
                type="email"
                placeholder="example@disk.uz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ borderRadius: '8px' }}
              />
              <span className="icon is-small is-left has-text-grey">
                <Mail size={16} />
              </span>
            </div>
          </div>

          <div className="field mb-4">
            <label className="label is-size-7 has-text-grey">{t.passwordLabel}</label>
            <div className="control has-icons-left">
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ borderRadius: '8px' }}
              />
              <span className="icon is-small is-left has-text-grey">
                <Lock size={16} />
              </span>
            </div>
          </div>

          <button
            type="submit"
            className={`button is-primary is-fullwidth mb-3 ${loading ? 'is-loading' : ''}`}
            style={{ borderRadius: '10px', height: '42px', fontWeight: 600 }}
          >
            <LogIn size={17} className="mr-2" />
            {t.signInBtn}
          </button>
        </form>

        {/* 1-click Demo Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="button is-info is-light is-fullwidth mb-4"
          style={{ borderRadius: '10px', height: '40px', fontWeight: 600 }}
        >
          <Sparkles size={16} className="mr-2 has-text-info" />
          {t.demoBtn}
        </button>

        <p className="has-text-centered is-size-7 has-text-grey mb-0">
          {t.noAccount}{' '}
          <a onClick={onSwitchToRegister} className="has-text-weight-bold has-text-info">
            {t.signUpBtn}
          </a>
        </p>
      </div>
    </div>
  );
};
