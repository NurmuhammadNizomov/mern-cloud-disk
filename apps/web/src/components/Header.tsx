import React, { useState, useEffect, useRef } from 'react';
import {
  HardDrive,
  Search,
  LayoutGrid,
  List,
  Sun,
  Moon,
  Globe,
  User as UserIcon,
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Language } from '../i18n/translations';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, viewMode, setViewMode, mobileSidebarOpen, setMobileSidebarOpen } = useDriveStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, language, setLanguage, t } = useSettingsStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Click outside to close profile dropdown & language dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileOpen && profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (langDropdownOpen && langRef.current && !langRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen, langDropdownOpen]);

  return (
    <header className="main-header">
      {/* Brand logo & mobile hamburger */}
      <div className="is-flex is-align-items-center header-brand-wrapper" style={{ gap: '10px' }}>
        <button
          type="button"
          className="mobile-menu-toggle-btn header-icon-btn mr-1"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            flexShrink: 0
          }}
        >
          <HardDrive size={20} />
        </div>
        <div className="header-brand-text">
          <span style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.3px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
            Cloud <span style={{ color: 'var(--primary)' }}>Disk</span>
          </span>
        </div>
      </div>

      {/* Modern Centered Search Bar */}
      <div className="header-search-wrapper">
        <span
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            pointerEvents: 'none'
          }}
        >
          <Search size={17} />
        </span>
        <input
          className="header-search-input"
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <span
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px'
            }}
            onClick={() => setSearchQuery('')}
          >
            <X size={15} />
          </span>
        )}
      </div>

      {/* Right Controls: Theme, Language, View mode, User */}
      <div className="is-flex is-align-items-center" style={{ gap: '10px' }}>
        {/* Dark / Light Toggle */}
        <button
          type="button"
          className="header-icon-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} style={{ color: '#f59e0b' }} />
          )}
        </button>

        {/* Language Selector (EN, RU) */}
        <div ref={langRef} className={`dropdown is-right ${langDropdownOpen ? 'is-active' : ''}`}>
          <div className="dropdown-trigger">
            <button
              type="button"
              className="header-icon-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              style={{ width: 'auto', padding: '0 12px', gap: '6px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}
            >
              <Globe size={15} style={{ color: 'var(--primary)' }} />
              <span>{language}</span>
            </button>
          </div>
          <div className="dropdown-menu" role="menu">
            <div className="dropdown-content">
              {(['en', 'ru'] as Language[]).map((lang) => (
                <a
                  key={lang}
                  className={`dropdown-item ${language === lang ? 'is-active' : ''}`}
                  onClick={() => {
                    setLanguage(lang);
                    setLangDropdownOpen(false);
                  }}
                  style={{ fontWeight: language === lang ? 600 : 400 }}
                >
                  {lang === 'en' ? '🇬🇧 English' : '🇷🇺 Русский'}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Grid/List Segmented Switcher */}
        <div
          className="header-view-switcher hide-on-tiny-mobile"
          style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid var(--border)'
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              border: 'none',
              background: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none',
              borderRadius: '7px',
              width: '32px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              border: 'none',
              background: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'list' ? 'var(--shadow-xs)' : 'none',
              borderRadius: '7px',
              width: '32px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <List size={15} />
          </button>
        </div>

        {/* User Profile dropdown */}
        <div ref={profileRef} className={`dropdown is-right ${profileOpen ? 'is-active' : ''}`}>
          <div className="dropdown-trigger">
            <button
              type="button"
              aria-haspopup="true"
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '2px solid var(--border)',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all 0.15s ease'
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
            </button>
          </div>
          <div className="dropdown-menu" role="menu" style={{ minWidth: '240px' }}>
            <div className="dropdown-content" style={{ padding: '14px' }}>
              <div className="mb-3">
                <p className="has-text-weight-bold mb-0" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  {user?.name}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user?.email}</p>
              </div>
              <hr className="dropdown-divider" />
              <div className="my-3">
                <div className="is-flex is-justify-content-space-between mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{t.cloudStorage}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {((user?.storageUsed || 0) / (1024 * 1024)).toFixed(1)} MB / 15 GB
                  </span>
                </div>
                <div style={{ width: '100%', height: '5px', borderRadius: '9999px', background: 'var(--border)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(1, ((user?.storageUsed || 0) / (user?.storageLimit || 15 * 1024 * 1024 * 1024)) * 100))}%`,
                      background: 'var(--primary)',
                      borderRadius: '9999px'
                    }}
                  />
                </div>
              </div>
              <hr className="dropdown-divider" />
              <button
                type="button"
                className="button is-danger is-light is-small is-fullwidth mt-2"
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                style={{ borderRadius: '8px', fontWeight: 600 }}
              >
                <LogOut size={14} className="mr-2" />
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
