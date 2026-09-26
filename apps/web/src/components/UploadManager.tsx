import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Clock
} from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useSettingsStore } from '../store/useSettingsStore';

export const UploadManager: React.FC = () => {
  const {
    uploadQueue,
    isUploading,
    overallUploadPercent,
    showUploadWidget,
    closeUploadWidget,
    clearCompletedUploads
  } = useDriveStore();
  const { t } = useSettingsStore();

  const [minimized, setMinimized] = useState(false);

  if (!showUploadWidget || uploadQueue.length === 0) return null;

  const completedCount = uploadQueue.filter((i) => i.status === 'completed').length;
  const totalCount = uploadQueue.length;

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const headerTitle = isUploading
    ? `${t.uploadingStatus}... ${overallUploadPercent}% (${completedCount}/${totalCount})`
    : `${completedCount} of ${totalCount} ${t.uploadCompleted}`;

  return (
    <div className={`upload-floating-widget ${minimized ? 'minimized' : ''}`}>
      {/* Widget Header */}
      <div className="upload-header">
        <div className="is-flex is-align-items-center" style={{ gap: '8px', minWidth: 0 }}>
          <UploadCloud size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {headerTitle}
          </span>
        </div>
        <div className="is-flex is-align-items-center" style={{ gap: '4px', flexShrink: 0 }}>
          <button
            type="button"
            className="upload-control-btn"
            onClick={() => setMinimized(!minimized)}
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          {!isUploading && (
            <button
              type="button"
              className="upload-control-btn"
              onClick={closeUploadWidget}
              title="Close"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Real-time Progress Bar */}
      {isUploading && (
        <div className="upload-progress-container">
          <div
            className="upload-progress-bar"
            style={{ width: `${overallUploadPercent}%` }}
          />
        </div>
      )}

      {/* Upload Item Details */}
      {!minimized && (
        <div className="upload-body">
          <div className="upload-items-list">
            {uploadQueue.map((item) => (
              <div key={item.id} className="upload-item-row">
                <FileText size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    className="mb-0"
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.825rem',
                      fontWeight: 500,
                      color: 'var(--text-main)'
                    }}
                    title={item.file.name}
                  >
                    {item.file.name}
                  </p>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {formatFileSize(item.file.size)}
                    {item.status === 'uploading' && ` · ${item.progress}%`}
                  </span>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {item.status === 'completed' && (
                    <CheckCircle2 size={17} style={{ color: 'var(--color-green)' }} />
                  )}
                  {item.status === 'uploading' && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        background: 'rgba(37, 99, 235, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}
                    >
                      {item.progress}%
                    </span>
                  )}
                  {item.status === 'pending' && (
                    <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                  )}
                  {item.status === 'error' && (
                    <span title={item.errorMsg || 'Upload error'}>
                      <AlertCircle size={17} style={{ color: '#ef4444' }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!isUploading && completedCount > 0 && (
            <div className="upload-footer">
              <button
                type="button"
                className="upload-clear-btn"
                onClick={clearCompletedUploads}
              >
                {t.clearCompleted}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
