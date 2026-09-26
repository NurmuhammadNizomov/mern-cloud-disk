import React from 'react';
import {
  Download,
  Share2,
  FileText,
  Music,
  Archive,
  File as GenericFileIcon
} from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useSettingsStore } from '../store/useSettingsStore';

export const FilePreviewModal: React.FC = () => {
  const { previewFile, setPreviewFile, setShareModalItem } = useDriveStore();
  const { t } = useSettingsStore();

  if (!previewFile) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={() => setPreviewFile(null)} style={{ background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(6px)' }} />
      <div className="modal-card" style={{ maxWidth: '850px', width: '92vw', maxHeight: '92vh' }}>
        {/* Header */}
        <header className="modal-card-head">
          <div className="is-flex is-align-items-center" style={{ gap: '10px', overflow: 'hidden' }}>
            <span
              className="tag is-info is-light is-rounded has-text-weight-bold"
              style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}
            >
              {previewFile.extension || 'file'}
            </span>
            <p
              className="modal-card-title is-size-6"
              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {previewFile.name}
            </p>
          </div>

          <div className="is-flex is-align-items-center" style={{ gap: '8px' }}>
            <a
              className="button is-small is-light"
              href={previewFile.cloudinaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={previewFile.name}
              style={{ borderRadius: '8px', gap: '6px' }}
            >
              <Download size={14} />
              <span className="is-hidden-mobile">{t.download}</span>
            </a>
            <button
              type="button"
              className="button is-small is-primary is-light"
              onClick={() => {
                setShareModalItem({ type: 'file', item: previewFile });
              }}
              style={{ borderRadius: '8px', gap: '6px' }}
            >
              <Share2 size={14} />
              <span className="is-hidden-mobile">{t.share}</span>
            </button>
            <button type="button" className="delete" aria-label="close" onClick={() => setPreviewFile(null)} />
          </div>
        </header>

        {/* Media Preview Body */}
        <section
          className="modal-card-body p-0 is-flex is-align-items-center is-justify-content-center"
          style={{ backgroundColor: '#090d16', minHeight: '380px' }}
        >
          {previewFile.category === 'image' && (
            <img
              src={previewFile.cloudinaryUrl}
              alt={previewFile.name}
              style={{ maxHeight: '65vh', maxWidth: '100%', objectFit: 'contain' }}
            />
          )}

          {previewFile.category === 'video' && (
            <video
              controls
              autoPlay
              style={{ maxHeight: '65vh', maxWidth: '100%' }}
              src={previewFile.cloudinaryUrl}
            >
              Your browser does not support video playback.
            </video>
          )}

          {previewFile.category === 'audio' && (
            <div className="p-6 text-center has-text-white" style={{ width: '100%', maxWidth: '450px' }}>
              <Music size={54} className="has-text-warning mb-4" />
              <p className="has-text-weight-bold is-size-5 mb-4">{previewFile.name}</p>
              <audio controls style={{ width: '100%' }} src={previewFile.cloudinaryUrl}>
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {['document', 'archive', 'other'].includes(previewFile.category) && (
            <div className="p-6 text-center has-text-white">
              {previewFile.category === 'document' ? (
                <FileText size={64} className="has-text-info mb-3" />
              ) : previewFile.category === 'archive' ? (
                <Archive size={64} className="has-text-link mb-3" />
              ) : (
                <GenericFileIcon size={64} className="has-text-grey mb-3" />
              )}
              <h3 className="is-size-5 has-text-weight-bold mb-2">{previewFile.name}</h3>
              <p className="has-text-grey-light is-size-7 mb-4">
                {previewFile.mimeType} · {formatFileSize(previewFile.size)}
              </p>
              <a
                href={previewFile.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={previewFile.name}
                className="button is-primary"
                style={{ borderRadius: '8px', fontWeight: 600 }}
              >
                <Download size={16} className="mr-2" />
                {t.download}
              </a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
