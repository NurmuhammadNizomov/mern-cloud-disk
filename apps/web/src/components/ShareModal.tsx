import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Globe,
  UserPlus,
  Trash2,
  Shield,
  Eye,
  Edit3
} from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { shareApi } from '../api/client';
import { SharedUser } from '../types';

export const ShareModal: React.FC = () => {
  const { shareModalItem, setShareModalItem } = useDriveStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);

  if (!shareModalItem) return null;

  const { type, item } = shareModalItem;
  const isFile = type === 'file';
  const sharedList: SharedUser[] = (item as any).sharedWith || [];

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setSubmitting(true);
      const res = await shareApi.shareItem(type, item._id, email.trim(), role);
      (item as any).sharedWith = res.sharedWith;
      setEmail('');
      setShareModalItem({ type, item: { ...item } });
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
      <div className="modal-background" onClick={() => setShareModalItem(null)} />
      <div className="modal-card" style={{ maxWidth: '520px' }}>
        <header className="modal-card-head" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="is-flex is-align-items-center" style={{ gap: '0.6rem' }}>
            <Share2 size={20} className="has-text-info" />
            <p className="modal-card-title is-size-5 has-text-weight-bold mb-0">
              Dostup berish: <span className="has-text-grey-dark">{item.name}</span>
            </p>
          </div>
          <button className="delete" aria-label="close" onClick={() => setShareModalItem(null)} />
        </header>

        <section className="modal-card-body" style={{ backgroundColor: '#ffffff' }}>
          {/* Add User Form */}
          <form onSubmit={handleShare} className="mb-4">
            <label className="label is-size-7 has-text-grey">FOYDALANUVCHILARNI QO'SHISH</label>
            <div className="field has-addons mb-1">
              <div className="control is-expanded">
                <input
                  className="input"
                  type="email"
                  placeholder="Email manzilini kiriting..."
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
                  >
                    <option value="viewer">Ko'ruvchi</option>
                    <option value="editor">Tahrirlovchi</option>
                  </select>
                </div>
              </div>
              <div className="control">
                <button
                  type="submit"
                  className={`button is-info ${submitting ? 'is-loading' : ''}`}
                  disabled={!email.trim() || submitting}
                  style={{ borderRadius: '0 8px 8px 0', fontWeight: 600 }}
                >
                  <UserPlus size={16} className="mr-1" />
                  Qo'shish
                </button>
              </div>
            </div>
          </form>

          {/* Current Shared Users List */}
          <div className="mb-4">
            <p className="has-text-weight-semibold is-size-7 has-text-grey mb-2">
              DOSTUP BERILGANLAR ({sharedList.length})
            </p>
            {sharedList.length === 0 ? (
              <p className="is-size-7 has-text-grey-light italic">
                Hozircha hech kimga shaxsiy dostup berilmagan
              </p>
            ) : (
              <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                {sharedList.map((user) => (
                  <div
                    key={user.email}
                    className="is-flex is-align-items-center is-justify-content-space-between p-2 mb-1"
                    style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}
                  >
                    <div>
                      <p className="mb-0 has-text-weight-medium is-size-7">{user.email}</p>
                      <span className="tag is-light is-small" style={{ fontSize: '0.65rem' }}>
                        {user.role === 'editor' ? 'Tahrirlovchi' : 'Ko\'ruvchi'}
                      </span>
                    </div>
                    <button
                      className="button is-small is-white has-text-danger p-1"
                      onClick={() => handleRemoveShare(user.email)}
                      title="Dostupni bekor qilish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="my-3" />

          {/* Public Link Section */}
          {isFile && (
            <div>
              <div className="is-flex is-align-items-center is-justify-content-space-between mb-2">
                <div className="is-flex is-align-items-center" style={{ gap: '0.5rem' }}>
                  <Globe size={18} className="has-text-info" />
                  <div>
                    <p className="has-text-weight-semibold is-size-7 mb-0">Umumiy havola orqali ulashish</p>
                    <p className="is-size-7 has-text-grey mb-0">
                      {(item as any).isPublic ? 'Havolaga ega bo\'lgan har kim ko\'ra oladi' : 'Ommaviy dostup o\'chiq'}
                    </p>
                  </div>
                </div>

                <button
                  className={`button is-small ${(item as any).isPublic ? 'is-success' : 'is-light'} ${publicLoading ? 'is-loading' : ''}`}
                  onClick={handleTogglePublic}
                  style={{ borderRadius: '8px' }}
                >
                  {(item as any).isPublic ? 'Yoqilgan' : 'Yoqish'}
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
                      style={{ borderRadius: '6px 0 0 6px', background: '#f8fafc' }}
                    />
                  </div>
                  <div className="control">
                    <button
                      className={`button is-small ${copied ? 'is-success' : 'is-info'}`}
                      onClick={handleCopyLink}
                      style={{ borderRadius: '0 6px 6px 0', gap: '0.35rem' }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? 'Nusxalandi!' : 'Nusxalash'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <footer className="modal-card-foot is-justify-content-flex-end" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <button
            className="button is-primary"
            onClick={() => setShareModalItem(null)}
            style={{ borderRadius: '8px', fontWeight: 600 }}
          >
            Tayyor
          </button>
        </footer>
      </div>
    </div>
  );
};
