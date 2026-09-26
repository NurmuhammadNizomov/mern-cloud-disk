import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';

const FOLDER_COLORS = [
  '#4285F4', // Blue (Google Drive)
  '#EA4335', // Red
  '#FBBC05', // Yellow
  '#34A853', // Green
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4'  // Cyan
];

export const CreateFolderModal: React.FC = () => {
  const { createFolderOpen, setCreateFolderOpen } = useDriveStore();
  const { createFolder } = useDriveOperations();

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
      <div className="modal-background" onClick={() => setCreateFolderOpen(false)} />
      <div className="modal-card" style={{ maxWidth: '440px' }}>
        <header className="modal-card-head" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="is-flex is-align-items-center" style={{ gap: '0.5rem' }}>
            <FolderPlus size={20} className="has-text-warning" />
            <p className="modal-card-title is-size-5 has-text-weight-bold mb-0">Yangi papka ochish</p>
          </div>
          <button
            className="delete"
            aria-label="close"
            onClick={() => setCreateFolderOpen(false)}
          />
        </header>

        <form onSubmit={handleSubmit}>
          <section className="modal-card-body" style={{ backgroundColor: '#ffffff' }}>
            <div className="field mb-4">
              <label className="label is-size-7 has-text-grey">PAPKA NOMI</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="Masalan: Shartnomalar 2026"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  autoFocus
                  required
                  style={{ borderRadius: '8px' }}
                />
              </div>
            </div>

            <div className="field mb-2">
              <label className="label is-size-7 has-text-grey">PAPKA RANGI</label>
              <div className="is-flex is-align-items-center" style={{ gap: '0.75rem' }}>
                {FOLDER_COLORS.map((color) => (
                  <div
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: selectedColor === color ? '3px solid #1e293b' : '2px solid transparent',
                      transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          <footer className="modal-card-foot is-justify-content-flex-end" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="button is-light mr-2"
              onClick={() => setCreateFolderOpen(false)}
              style={{ borderRadius: '8px' }}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className={`button is-primary ${submitting ? 'is-loading' : ''}`}
              disabled={!folderName.trim() || submitting}
              style={{ borderRadius: '8px', fontWeight: 600 }}
            >
              Yaratish
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
