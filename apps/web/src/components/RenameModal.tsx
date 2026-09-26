import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';

export const RenameModal: React.FC = () => {
  const { renameModalItem, setRenameModalItem } = useDriveStore();
  const { renameFolder, renameFile } = useDriveOperations();
  const { t } = useSettingsStore();

  const [newName, setNewName] = useState(renameModalItem?.currentName || '');
  const [submitting, setSubmitting] = useState(false);

  if (!renameModalItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setSubmitting(true);
      if (renameModalItem.type === 'folder') {
        await renameFolder(renameModalItem.id, newName.trim());
      } else {
        await renameFile(renameModalItem.id, newName.trim());
      }
      setRenameModalItem(null);
    } catch (err) {
      console.error('Rename error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={() => setRenameModalItem(null)} style={{ backdropFilter: 'blur(4px)' }} />
      <div className="modal-card" style={{ maxWidth: '420px' }}>
        <header className="modal-card-head">
          <div className="is-flex is-align-items-center" style={{ gap: '10px' }}>
            <Edit2 size={18} style={{ color: 'var(--primary)' }} />
            <p className="modal-card-title">{t.renameTitle}</p>
          </div>
          <button type="button" className="delete" aria-label="close" onClick={() => setRenameModalItem(null)} />
        </header>

        <form onSubmit={handleSubmit}>
          <section className="modal-card-body">
            <div className="field">
              <label className="label">{t.newNameLabel}</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>
          </section>

          <footer className="modal-card-foot is-justify-content-flex-end">
            <button
              type="button"
              className="button is-light mr-2"
              onClick={() => setRenameModalItem(null)}
              style={{ borderRadius: '8px' }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={`button is-primary ${submitting ? 'is-loading' : ''}`}
              disabled={!newName.trim() || submitting}
              style={{ borderRadius: '8px', fontWeight: 600 }}
            >
              {t.save}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
