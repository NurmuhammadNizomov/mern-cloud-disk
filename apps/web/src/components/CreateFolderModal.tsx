import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';

const FOLDER_COLORS = [
  '#2563eb', // Royal Blue
  '#dc2626', // Red
  '#f59e0b', // Amber/Yellow
  '#16a34a', // Green
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#0891b2'  // Cyan
];

export const CreateFolderModal: React.FC = () => {
  const { createFolderOpen, setCreateFolderOpen } = useDriveStore();
  const { createFolder } = useDriveOperations();
  const { t } = useSettingsStore();

  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  if (!createFolderOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      setSubmitting(true);
      await createFolder(folderName.trim(), selectedColor);
      setFolderName('');
      setCreateFolderOpen(false);
    } catch (err) {
      console.error('Failed to create folder:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={() => setCreateFolderOpen(false)} style={{ backdropFilter: 'blur(4px)' }} />
      <div className="modal-card" style={{ maxWidth: '440px' }}>
        <header className="modal-card-head">
          <div className="is-flex is-align-items-center" style={{ gap: '10px' }}>
            <FolderPlus size={20} style={{ color: 'var(--primary)' }} />
            <p className="modal-card-title">{t.createFolderTitle}</p>
          </div>
          <button
            type="button"
            className="delete"
            aria-label="close"
            onClick={() => setCreateFolderOpen(false)}
          />
        </header>

        <form onSubmit={handleSubmit}>
          <section className="modal-card-body">
            <div className="field mb-4">
              <label className="label">{t.folderNameLabel}</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder={t.folderPlaceholder}
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="field mb-2">
              <label className="label">{t.folderColorLabel}</label>
              <div className="is-flex is-align-items-center is-flex-wrap-wrap" style={{ gap: '10px' }}>
                {FOLDER_COLORS.map((color) => (
                  <div
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: selectedColor === color ? '3px solid var(--text-main)' : '2px solid transparent',
                      transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          <footer className="modal-card-foot is-justify-content-flex-end">
            <button
              type="button"
              className="button is-light mr-2"
              onClick={() => setCreateFolderOpen(false)}
              style={{ borderRadius: '8px' }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={`button is-primary ${submitting ? 'is-loading' : ''}`}
              disabled={!folderName.trim() || submitting}
              style={{ borderRadius: '8px', fontWeight: 600 }}
            >
              {t.create}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
