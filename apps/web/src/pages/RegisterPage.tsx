import React, { useState } from 'react';
import { HardDrive, Mail, Lock, User, UserPlus, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { authApi } from '../api/client';
import { Language } from '../i18n/translations';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register, login } = useAuthStore();
  const { t, language, setLanguage } = useSettingsStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Email verification step
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      setVerificationStep(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.verifyEmail(email, verificationCode);
      await login(email, password);
      setVerifySuccess('Email verified successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="is-flex is-align-items-center is-justify-content-center"
      style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        padding: '1.5rem',
        position: 'relative'
      }}
    >
      <div style={{ position: 'absolute', top: '20px', right: '24px' }}>
        <div className="select is-small is-rounded">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            style={{ fontWeight: 600 }}
          >
            <option value="en">🇬🇧 English</option>
            <option value="ru">🇷🇺 Русский</option>
          </select>
        </div>
      </div>

      <div className="card p-5" style={{ width: '100%', maxWidth: '420px', borderRadius: '18px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
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
            {t.registerTitle}
          </h2>
          <p className="has-text-grey is-size-7 mb-0">
            {t.registerSubtitle}
          </p>
        </div>

        {error && (
          <div className="notification is-danger is-light p-3 is-size-7 mb-4" style={{ borderRadius: '8px' }}>
            {error}
          </div>
        )}
        {verifySuccess && (
          <div className="notification is-success is-light p-3 is-size-7 mb-4" style={{ borderRadius: '8px' }}>
            {verifySuccess}
          </div>
        )}

        {!verificationStep ? (
          <form onSubmit={handleSubmit}>
            <div className="field mb-3">
              <label className="label is-size-7 has-text-grey">{t.fullNameLabel}</label>
              <div className="control has-icons-left">
                <input
                  className="input"
                  type="text"
                  placeholder="Ali Valiyev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ borderRadius: '8px' }}
                />
                <span className="icon is-small is-left has-text-grey">
                  <User size={16} />
                </span>
              </div>
            </div>

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
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ borderRadius: '8px' }}
                />
                <span className="icon is-small is-left has-text-grey">
                  <Lock size={16} />
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={`button is-primary is-fullwidth mb-4 ${loading ? 'is-loading' : ''}`}
              style={{ borderRadius: '10px', height: '42px', fontWeight: 600 }}
            >
              <UserPlus size={17} className="mr-2" />
              {t.signUpBtn}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="notification is-info is-light p-3 is-size-7 mb-3" style={{ borderRadius: '8px' }}>
              6-digit verification code sent to {email}.
            </div>

            <div className="field mb-4">
              <label className="label is-size-7 has-text-grey">{t.verifyCodeLabel}</label>
              <div className="control has-icons-left">
                <input
                  className="input"
                  type="text"
                  placeholder={t.verifyCodePlaceholder}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  style={{ borderRadius: '8px', letterSpacing: '3px', fontWeight: 'bold' }}
                />
                <span className="icon is-small is-left has-text-grey">
                  <KeyRound size={16} />
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={`button is-success is-fullwidth mb-3 ${loading ? 'is-loading' : ''}`}
              style={{ borderRadius: '10px', height: '42px', fontWeight: 600 }}
            >
              {t.verifyBtn}
            </button>
          </form>
        )}

        <p className="has-text-centered is-size-7 has-text-grey mb-0">
          {t.haveAccount}{' '}
          <a onClick={onSwitchToLogin} className="has-text-weight-bold has-text-info">
            {t.signInBtn}
          </a>
        </p>
      </div>
    </div>
  );
};
