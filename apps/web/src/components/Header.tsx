import React, { useState } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  HardDrive,
  LogOut,
  User as UserIcon,
  X,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Language } from '../i18n/translations';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, viewMode, setViewMode } = useDriveStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, language, setLanguage, t } = useSettingsStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <header className="main-header">
      {/* Brand logo */}
      <div className="is-flex is-align-items-center" style={{ gap: '0.75rem', minWidth: '220px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)'
          }}
        >
          <HardDrive size={22} />
        </div>
        <div>
          <span style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.3px' }} className="has-text-dark">
            Safar <span style={{ color: '#2563eb' }}>Disk</span>
          </span>
          <span
            className="tag is-info is-light is-rounded ml-2"
            style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0 6px', height: '18px' }}
          >
            {t.cloudMern}
          </span>
        </div>
      </div>

      {/* Search Bar (Google & Yandex Disk style) */}
      <div style={{ flex: 1, maxWidth: '580px', margin: '0 1.5rem' }}>
        <div className="field mb-0">
          <div className="control has-icons-left has-icons-right">
            <input
              className="input is-rounded"
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                height: '40px',
                fontSize: '0.875rem'
              }}
            />
            <span className="icon is-small is-left has-text-grey">
              <Search size={17} />
            </span>
            {searchQuery && (
              <span
                className="icon is-small is-right"
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onClick={() => setSearchQuery('')}
              >
                <X size={15} />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions: Theme Toggle, Language, View Switcher & Profile */}
      <div className="is-flex is-align-items-center" style={{ gap: '0.75rem' }}>
        {/* Dark / Light Theme Toggle */}
        <button
          className="button is-small is-rounded is-white p-2"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Dark theme' : 'Light theme'}
        >
          {theme === 'light' ? (
            <Moon size={18} className="has-text-grey-dark" />
          ) : (
            <Sun size={18} className="has-text-warning" />
          )}
        </button>

        {/* Language Selector (EN, RU, UZ) */}
        <div className={`dropdown is-right ${langDropdownOpen ? 'is-active' : ''}`}>
          <div className="dropdown-trigger">
            <button
              className="button is-small is-rounded is-white"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              style={{ gap: '0.35rem', fontWeight: 600, textTransform: 'uppercase' }}
            >
              <Globe size={15} className="has-text-info" />
              <span>{language}</span>
            </button>
          </div>
          <div className="dropdown-menu" role="menu">
            <div className="dropdown-content p-1" style={{ borderRadius: '10px' }}>
              {(['en', 'ru', 'uz'] as Language[]).map((lang) => (
                <a
                  key={lang}
                  className={`dropdown-item py-1 ${language === lang ? 'has-text-info has-text-weight-bold' : ''}`}
                  onClick={() => {
                    setLanguage(lang);
                    setLangDropdownOpen(false);
                  }}
                  style={{ fontSize: '0.825rem' }}
                >
                  {lang === 'en' ? '🇬🇧 English' : lang === 'ru' ? '🇷🇺 Русский' : "🇺🇿 O'zbekcha"}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Grid/List switch */}
        <div className="buttons has-addons mb-0">
          <button
            className={`button is-small ${viewMode === 'grid' ? 'is-info is-selected' : 'is-white'}`}
            onClick={() => setViewMode('grid')}
            style={{ borderRadius: '8px 0 0 8px' }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`button is-small ${viewMode === 'list' ? 'is-info is-selected' : 'is-white'}`}
            onClick={() => setViewMode('list')}
            style={{ borderRadius: '0 8px 8px 0' }}
          >
            <List size={16} />
          </button>
        </div>

        {/* User Profile dropdown */}
        <div className={`dropdown is-right ${profileOpen ? 'is-active' : ''}`}>
          <div className="dropdown-trigger">
            <button
              className="button is-rounded is-white p-1"
              aria-haspopup="true"
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ border: '2px solid var(--border-color)', width: '38px', height: '38px' }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
              </div>
            </button>
          </div>
          <div className="dropdown-menu" role="menu" style={{ minWidth: '240px' }}>
            <div className="dropdown-content p-3" style={{ borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
              <div className="mb-2">
                <p className="has-text-weight-bold has-text-dark mb-0">{user?.name}</p>
                <p className="is-size-7 has-text-grey">{user?.email}</p>
              </div>
              <hr className="dropdown-divider my-2" />
              <div className="mb-3">
                <div className="is-flex is-justify-content-space-between is-size-7 has-text-grey mb-1">
                  <span>{t.cloudStorage}:</span>
                  <span>{((user?.storageUsed || 0) / (1024 * 1024)).toFixed(1)} MB / 15 GB</span>
                </div>
                <progress
                  className="progress is-info is-small mb-0"
                  value={((user?.storageUsed || 0) / (user?.storageLimit || 15 * 1024 * 1024 * 1024)) * 100}
                  max="100"
                />
              </div>
              <hr className="dropdown-divider my-2" />
              <button
                className="button is-danger is-light is-small is-fullwidth"
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} className="mr-2" />
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
