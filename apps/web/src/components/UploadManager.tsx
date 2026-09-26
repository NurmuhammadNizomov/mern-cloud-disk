import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  File
} from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';

export const UploadManager: React.FC = () => {
  const {
    uploadQueue,
    isUploading,
    overallUploadPercent,
    showUploadWidget,
    closeUploadWidget,
    clearCompletedUploads
  } = useDriveStore();

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

  return (
    <div className="upload-floating-widget">
      {/* Widget Header (Google & Yandex Disk style) */}
      <div className="upload-header">
        <div className="is-flex is-align-items-center" style={{ gap: '0.5rem' }}>
          <UploadCloud size={18} />
          <span>
            {isUploading
              ? `Yuklanmoqda: ${overallUploadPercent}% (${completedCount}/${totalCount})`
              : `${completedCount} ta fayl muvaffaqiyatli yuklandi`}
          </span>
        </div>
        <div className="is-flex is-align-items-center" style={{ gap: '0.5rem' }}>
          <button
            className="button is-small is-ghost p-1 has-text-white"
            onClick={() => setMinimized(!minimized)}
          >
            {minimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {!isUploading && (
            <button
              className="button is-small is-ghost p-1 has-text-white"
              onClick={closeUploadWidget}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (Bulma progress) */}
      {isUploading && (
        <progress
          className="progress is-primary is-small mb-0"
          value={overallUploadPercent}
          max="100"
          style={{ height: '5px', borderRadius: 0 }}
        >
          {overallUploadPercent}%
        </progress>
      )}

      {/* Upload Item Details */}
      {!minimized && (
        <div className="upload-body">
          {uploadQueue.map((item) => (
            <div key={item.id} className="upload-item-row">
              <File size={16} className="has-text-grey" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  className="mb-0 has-text-weight-medium"
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '0.825rem'
                  }}
                  title={item.file.name}
                >
                  {item.file.name}
                </p>
                <span className="has-text-grey is-size-7">
                  {formatFileSize(item.file.size)}
                  {item.status === 'uploading' && ` · ${item.progress}%`}
                </span>
              </div>
              <div>
                {item.status === 'completed' && (
                  <CheckCircle size={18} className="has-text-success" />
                )}
                {item.status === 'uploading' && (
                  <span className="tag is-info is-light is-rounded is-small">
                    {item.progress}%
                  </span>
                )}
                {item.status === 'pending' && (
                  <span className="tag is-light is-rounded is-small">Kutilmoqda</span>
                )}
                {item.status === 'error' && (
                  <span title={item.errorMsg || 'Xatolik'}>
                    <AlertCircle size={18} className="has-text-danger" />
                  </span>
                )}
              </div>
            </div>
          ))}

          {!isUploading && completedCount > 0 && (
            <div className="pt-2 text-right">
              <button
                className="button is-small is-ghost is-fullwidth has-text-grey"
                onClick={clearCompletedUploads}
              >
                Tugallanganlarni tozalash
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
