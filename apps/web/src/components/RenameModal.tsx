import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';

export const RenameModal: React.FC = () => {
  const { renameModalItem, setRenameModalItem } = useDriveStore();
  const { renameFolder, renameFile } = useDriveOperations();

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
      <div className="modal-background" onClick={() => setRenameModalItem(null)} />
      <div className="modal-card" style={{ maxWidth: '420px' }}>
        <header className="modal-card-head" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="is-flex is-align-items-center" style={{ gap: '0.5rem' }}>
            <Edit2 size={18} className="has-text-info" />
            <p className="modal-card-title is-size-5 has-text-weight-bold mb-0">Nomini o'zgartirish</p>
          </div>
          <button className="delete" aria-label="close" onClick={() => setRenameModalItem(null)} />
        </header>

        <form onSubmit={handleSubmit}>
          <section className="modal-card-body" style={{ backgroundColor: '#ffffff' }}>
            <div className="field">
              <label className="label is-size-7 has-text-grey">YANGI NOM</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  required
                  style={{ borderRadius: '8px' }}
                />
              </div>
            </div>
          </section>

          <footer className="modal-card-foot is-justify-content-flex-end" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="button is-light mr-2"
              onClick={() => setRenameModalItem(null)}
              style={{ borderRadius: '8px' }}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className={`button is-info ${submitting ? 'is-loading' : ''}`}
              disabled={!newName.trim() || submitting}
              style={{ borderRadius: '8px', fontWeight: 600 }}
            >
              Saqlash
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
