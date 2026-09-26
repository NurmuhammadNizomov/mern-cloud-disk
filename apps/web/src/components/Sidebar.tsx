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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Click outside to close + New dropdown
  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
      setDropdownOpen(false);
    }
  };

  const navItems: Array<{ id: NavSection; label: string; icon: React.ReactNode }> = [
    { id: 'my-drive', label: t.myDrive, icon: <HardDrive size={18} /> },
    { id: 'media', label: t.media, icon: <ImageIcon size={18} /> },
    { id: 'shared', label: t.shared, icon: <Users size={18} /> },
    { id: 'starred', label: t.starred, icon: <Star size={18} /> },
    { id: 'trash', label: t.trash, icon: <Trash2 size={18} /> }
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
        id="global-file-input"
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* "+ New" Action Button with Dropdown */}
      <div ref={dropdownRef} className={`dropdown mb-3 ${dropdownOpen ? 'is-active' : ''}`} style={{ width: '100%' }}>
        <div className="dropdown-trigger" style={{ width: '100%' }}>
          <button
            type="button"
            className="new-action-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Plus size={20} className="new-action-icon" />
            <span>{t.addNew}</span>
          </button>
        </div>
        <div className="dropdown-menu" style={{ width: '100%' }} role="menu">
          <div className="dropdown-content">
            <a
              className="dropdown-item is-flex is-align-items-center"
              onClick={() => {
                setDropdownOpen(false);
                fileInputRef.current?.click();
              }}
              style={{ gap: '10px' }}
            >
              <UploadCloud size={17} className="has-text-info" />
              <span>{t.uploadFiles}</span>
            </a>
            <a
              className="dropdown-item is-flex is-align-items-center"
              onClick={() => {
                setDropdownOpen(false);
                setCreateFolderOpen(true);
              }}
              style={{ gap: '10px' }}
            >
              <FolderPlus size={17} className="has-text-warning" />
              <span>{t.newFolder}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="nav-section-title">NAVIGATION</div>

      <ul className="sidebar-nav-list">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <li key={item.id}>
              <a
                onClick={() => {
                  setActiveSection(item.id);
                  if (item.id === 'my-drive') {
                    setCurrentFolderId(null);
                  }
                }}
                className={`sidebar-nav-item ${isActive ? 'is-active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Storage Indicator Card */}
      <div className="storage-card">
        <div className="is-flex is-align-items-center is-justify-content-space-between">
          <div className="is-flex is-align-items-center" style={{ gap: '8px' }}>
            <Database size={15} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {t.cloudStorage}
            </span>
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-faint)', fontWeight: 600 }}>
            {percent}%
          </span>
        </div>

        <div className="storage-progress-bar">
          <div className="storage-progress-fill" style={{ width: `${Math.max(percent, 2)}%` }} />
        </div>

        <div className="is-flex is-justify-content-space-between is-size-7" style={{ color: 'var(--text-muted)' }}>
          <span>{Number(usedGB) > 0.1 ? `${usedGB} GB` : `${usedMB} MB`}</span>
          <span>{t.storageLimit}</span>
        </div>
      </div>
    </aside>
  );
};
