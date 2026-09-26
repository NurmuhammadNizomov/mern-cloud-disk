import React, { useRef, useState } from 'react';
import {
  Plus,
  FolderPlus,
  UploadCloud,
  HardDrive,
  Image as ImageIcon,
  Users,
  Star,
  Trash2,
  Database
} from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useAuthStore } from '../store/useAuthStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';
import { NavSection } from '../types';

export const Sidebar: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    setCurrentFolderId,
    setCreateFolderOpen
  } = useDriveStore();
  const { user } = useAuthStore();
  const { uploadFiles } = useDriveOperations();
  const { t } = useSettingsStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
      setDropdownOpen(false);
    }
  };

  const navItems: Array<{ id: NavSection; label: string; icon: React.ReactNode }> = [
    { id: 'my-drive', label: t.myDrive, icon: <HardDrive size={19} /> },
    { id: 'media', label: t.media, icon: <ImageIcon size={19} /> },
    { id: 'shared', label: t.shared, icon: <Users size={19} /> },
    { id: 'starred', label: t.starred, icon: <Star size={19} /> },
    { id: 'trash', label: t.trash, icon: <Trash2 size={19} /> }
  ];

  const usedBytes = user?.storageUsed || 0;
  const limitBytes = user?.storageLimit || 15 * 1024 * 1024 * 1024;
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const percent = Math.min(100, Math.round((usedBytes / limitBytes) * 100));

  return (
    <aside className="main-sidebar">
      {/* Hidden file input */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Main "+ New" Button (Google & Yandex style) */}
      <div className={`dropdown mb-5 ${dropdownOpen ? 'is-active' : ''}`} style={{ width: '100%' }}>
        <div className="dropdown-trigger" style={{ width: '100%' }}>
          <button
            className="button is-primary is-fullwidth"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              height: '48px',
              borderRadius: '24px',
              fontWeight: 600,
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={20} />
            <span>{t.addNew}</span>
          </button>
        </div>
        <div className="dropdown-menu" style={{ width: '100%' }} role="menu">
          <div className="dropdown-content p-2" style={{ borderRadius: '14px', boxShadow: '0 10px 25px rgba(0,0,0,0.12)' }}>
            <a
              className="dropdown-item is-flex is-align-items-center py-2"
              onClick={() => {
                setDropdownOpen(false);
                fileInputRef.current?.click();
              }}
              style={{ borderRadius: '8px', gap: '0.75rem', fontWeight: 500 }}
            >
              <UploadCloud size={18} className="has-text-info" />
              <span>{t.uploadFiles}</span>
            </a>
            <a
              className="dropdown-item is-flex is-align-items-center py-2"
              onClick={() => {
                setDropdownOpen(false);
                setCreateFolderOpen(true);
              }}
              style={{ borderRadius: '8px', gap: '0.75rem', fontWeight: 500 }}
            >
              <FolderPlus size={18} className="has-text-warning" />
              <span>{t.newFolder}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="menu" style={{ flex: 1 }}>
        <p className="menu-label has-text-grey-light" style={{ fontSize: '0.725rem', letterSpacing: '0.5px' }}>
          NAVIGATION
        </p>
        <ul className="menu-list">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <li key={item.id} className="mb-1">
                <a
                  onClick={() => {
                    setActiveSection(item.id);
                    if (item.id === 'my-drive') {
                      setCurrentFolderId(null);
                    }
                  }}
                  className={`is-flex is-align-items-center py-2 px-3 ${
                    isActive ? 'is-active has-background-info-light has-text-info has-text-weight-semibold' : 'has-text-dark'
                  }`}
                  style={{
                    borderRadius: '10px',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ color: isActive ? '#2563eb' : 'inherit' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Storage Indicator */}
      <div
        className="p-3 mt-auto"
        style={{
          background: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}
      >
        <div className="is-flex is-align-items-center mb-2" style={{ gap: '0.5rem' }}>
          <Database size={16} className="has-text-info" />
          <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>
            {t.cloudStorage}
          </span>
        </div>
        <progress
          className="progress is-info is-small mb-2"
          value={percent}
          max="100"
          style={{ height: '7px' }}
        >
          {percent}%
        </progress>
        <div className="is-flex is-justify-content-space-between is-size-7 has-text-grey">
          <span>{Number(usedGB) > 0.1 ? `${usedGB} GB` : `${usedMB} MB`}</span>
          <span>{t.storageLimit}</span>
        </div>
      </div>
    </aside>
  );
};
