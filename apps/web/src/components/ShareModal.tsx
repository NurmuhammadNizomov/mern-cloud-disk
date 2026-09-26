import React, { useState } from 'react';
import {
  Share2,
  X,
  UserPlus,
  Trash2,
  Globe,
  Copy,
  Check
} from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { shareApi } from '../api/client';
import { useSettingsStore } from '../store/useSettingsStore';

export const ShareModal: React.FC = () => {
  const { shareModalItem, setShareModalItem } = useDriveStore();
  const { t } = useSettingsStore();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);

  if (!shareModalItem) return null;

  const { type, item } = shareModalItem;
  const isFile = type === 'file';
  const sharedList: Array<{ email: string; role: string; user?: any }> = (item as any).sharedWith || [];

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setSubmitting(true);
      const res = await shareApi.shareItem(type, item._id, email.trim(), role);
      (item as any).sharedWith = res.sharedWith;
      setShareModalItem({ type, item: { ...item } });
      setEmail('');
    } catch (err) {
      console.error('Share error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveShare = async (targetEmail: string) => {
    try {
      const res = await shareApi.removeShare(type, item._id, targetEmail);
      (item as any).sharedWith = res.sharedWith;
      setShareModalItem({ type, item: { ...item } });
    } catch (err) {
      console.error('Remove share error:', err);
    }
  };

  const handleTogglePublic = async () => {
    if (!isFile) return;
    try {
      setPublicLoading(true);
      const res = await shareApi.togglePublicLink(item._id);
      (item as any).isPublic = res.isPublic;
      (item as any).shareToken = res.shareToken;
      setShareModalItem({ type, item: { ...item } });
    } catch (err) {
      console.error('Toggle public link error:', err);
    } finally {
      setPublicLoading(false);
    }
  };

  const publicLink = isFile && (item as any).shareToken
    ? `${window.location.origin}/share/${(item as any).shareToken}`
    : '';

  const handleCopyLink = () => {
    if (!publicLink) return;
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={() => setShareModalItem(null)} style={{ backdropFilter: 'blur(4px)' }} />
      <div className="modal-card" style={{ maxWidth: '520px' }}>
        <header className="modal-card-head">
          <div className="is-flex is-align-items-center" style={{ gap: '10px' }}>
            <Share2 size={20} style={{ color: 'var(--primary)' }} />
            <p className="modal-card-title">
              {t.shareTitle}: <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
            </p>
          </div>
          <button type="button" className="delete" aria-label="close" onClick={() => setShareModalItem(null)} />
        </header>

        <section className="modal-card-body">
          {/* Add User Form */}
          <form onSubmit={handleShare} className="mb-4">
            <label className="label">{t.addUserLabel}</label>
            <div className="field has-addons mb-1">
              <div className="control is-expanded">
                <input
                  className="input"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ borderRadius: '8px 0 0 8px' }}
                />
              </div>
              <div className="control">
                <div className="select">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
                    style={{ borderRadius: '0' }}
                  >
                    <option value="viewer">{t.viewer}</option>
                    <option value="editor">{t.editor}</option>
                  </select>
                </div>
              </div>
              <div className="control">
                <button
                  type="submit"
                  className={`button is-primary ${submitting ? 'is-loading' : ''}`}
                  disabled={!email.trim() || submitting}
                  style={{ borderRadius: '0 8px 8px 0', fontWeight: 600 }}
                >
                  <UserPlus size={15} className="mr-1" />
                  {t.addUserBtn}
                </button>
              </div>
            </div>
          </form>

          {/* Current Shared Users List */}
          <div className="mb-4">
            <p className="is-size-7 has-text-weight-bold mb-2" style={{ color: 'var(--text-muted)' }}>
              {t.sharedPeople} ({sharedList.length})
            </p>
            {sharedList.length === 0 ? (
              <p className="is-size-7" style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
                {t.noOneShared}
              </p>
            ) : (
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sharedList.map((user) => (
                  <div
                    key={user.email}
                    className="is-flex is-align-items-center is-justify-content-space-between p-2"
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div>
                      <p className="mb-0 has-text-weight-medium is-size-7" style={{ color: 'var(--text-main)' }}>
                        {user.email}
                      </p>
                      <span className="tag is-small mt-1" style={{ fontSize: '0.65rem', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                        {user.role === 'editor' ? t.editor : t.viewer}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="button is-small is-white has-text-danger p-1"
                      onClick={() => handleRemoveShare(user.email)}
                      title="Remove access"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="dropdown-divider my-3" />

          {/* Public Link Section */}
          {isFile && (
            <div>
              <div className="is-flex is-align-items-center is-justify-content-space-between mb-2">
                <div className="is-flex is-align-items-center" style={{ gap: '10px' }}>
                  <Globe size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <p className="has-text-weight-semibold is-size-7 mb-0" style={{ color: 'var(--text-main)' }}>
                      {t.publicLinkTitle}
                    </p>
                    <p className="is-size-7 mb-0" style={{ color: 'var(--text-muted)' }}>
                      {(item as any).isPublic ? t.publicLinkEnabled : t.publicLinkDisabled}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`button is-small ${(item as any).isPublic ? 'is-success' : 'is-light'} ${publicLoading ? 'is-loading' : ''}`}
                  onClick={handleTogglePublic}
                  style={{ borderRadius: '8px', fontWeight: 600 }}
                >
                  {(item as any).isPublic ? t.turnOff : t.turnOn}
                </button>
              </div>

              {(item as any).isPublic && publicLink && (
                <div className="field has-addons mt-2">
                  <div className="control is-expanded">
                    <input
                      className="input is-small"
                      type="text"
                      readOnly
                      value={publicLink}
                      style={{ borderRadius: '6px 0 0 6px', backgroundColor: 'var(--bg-subtle)' }}
                    />
                  </div>
                  <div className="control">
                    <button
                      type="button"
                      className={`button is-small ${copied ? 'is-success' : 'is-primary'}`}
                      onClick={handleCopyLink}
                      style={{ borderRadius: '0 6px 6px 0', gap: '4px' }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? t.copied : t.copyLink}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <footer className="modal-card-foot is-justify-content-flex-end">
          <button
            type="button"
            className="button is-primary"
            onClick={() => setShareModalItem(null)}
            style={{ borderRadius: '8px', fontWeight: 600 }}
          >
            {t.save}
          </button>
        </footer>
      </div>
    </div>
  );
};
