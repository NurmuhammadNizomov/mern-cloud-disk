import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  File as GenericFileIcon,
  Star,
  MoreVertical,
  Download,
  Share2,
  Edit2,
  Trash2,
  Eye,
  RotateCcw
} from 'lucide-react';
import { FileItem } from '../types';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';

interface FileCardProps {
  file: FileItem;
}

export const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const {
    activeSection,
    setShareModalItem,
    setRenameModalItem,
    setPreviewFile
  } = useDriveStore();
  const {
    toggleStarFile,
    trashFile,
    restoreFile,
    deleteFilePermanently
  } = useDriveOperations();
  const { t } = useSettingsStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const isTrash = activeSection === 'trash';

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getFileCategoryIcon = () => {
    switch (file.category) {
      case 'image':
        return <ImageIcon size={38} className="has-text-info" />;
      case 'video':
        return <Video size={38} className="has-text-danger" />;
      case 'audio':
        return <Music size={38} className="has-text-warning" />;
      case 'document':
        return <FileText size={38} className="has-text-primary" />;
      case 'archive':
        return <Archive size={38} className="has-text-link" />;
      default:
        return <GenericFileIcon size={38} className="has-text-grey" />;
    }
  };

  return (
    <div
      className="drive-card mb-4"
      onClick={() => !isTrash && setPreviewFile(file)}
      style={{ overflow: 'hidden' }}
    >
      {/* File Preview Header */}
      <div className="file-card-preview">
        {file.category === 'image' && file.cloudinaryUrl ? (
          <img
            src={file.cloudinaryUrl}
            alt={file.name}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="is-flex is-flex-direction-column is-align-items-center">
            {getFileCategoryIcon()}
            <span
              className="tag is-light is-rounded mt-2"
              style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}
            >
              {file.extension || 'file'}
            </span>
          </div>
        )}

        {/* Floating Star button */}
        {!isTrash && (
          <button
            className="button is-small is-white is-rounded p-1"
            onClick={(e) => {
              e.stopPropagation();
              toggleStarFile(file._id);
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '28px',
              height: '28px',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            <Star
              size={15}
              className={file.isStarred ? 'has-text-warning' : 'has-text-grey-light'}
              fill={file.isStarred ? '#f59e0b' : 'none'}
            />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3">
        <div className="is-flex is-align-items-center is-justify-content-space-between mb-1">
          <p
            className="has-text-weight-semibold is-size-6 mb-0"
            style={{
              maxWidth: '180px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={file.name}
          >
            {file.name}
          </p>

          <div className={`dropdown is-right ${menuOpen ? 'is-active' : ''}`}>
            <div className="dropdown-trigger">
              <button
                className="button is-small is-white p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
              >
                <MoreVertical size={16} className="has-text-grey" />
              </button>
            </div>
            <div className="dropdown-menu" role="menu">
              <div className="dropdown-content p-1" style={{ borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}>
                {!isTrash ? (
                  <>
                    <a
                      className="dropdown-item is-flex is-align-items-center py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        setPreviewFile(file);
                      }}
                      style={{ gap: '0.5rem', fontSize: '0.85rem' }}
                    >
                      <Eye size={15} className="has-text-info" />
                      <span>{t.preview}</span>
                    </a>
                    <a
                      className="dropdown-item is-flex is-align-items-center py-2"
                      href={file.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={file.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                      style={{ gap: '0.5rem', fontSize: '0.85rem' }}
                    >
                      <Download size={15} className="has-text-success" />
                      <span>{t.download}</span>
                    </a>
                    <a
                      className="dropdown-item is-flex is-align-items-center py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        setShareModalItem({ type: 'file', item: file });
                      }}
                      style={{ gap: '0.5rem', fontSize: '0.85rem' }}
                    >
                      <Share2 size={15} className="has-text-info" />
                      <span>{t.share}</span>
                    </a>
                    <a
                      className="dropdown-item is-flex is-align-items-center py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        setRenameModalItem({ type: 'file', id: file._id, currentName: file.name });
                      }}
                      style={{ gap: '0.5rem', fontSize: '0.85rem' }}
                    >
                      <Edit2 size={15} className="has-text-grey" />
                      <span>{t.rename}</span>
                    </a>
                    <hr className="dropdown-divider my-1" />
                    <a
                      className="dropdown-item is-flex is-align-items-center py-2 has-text-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        trashFile(file._id);
                      }}
                      style={{ gap: '0.5rem', fontSize: '0.85rem' }}
                    >
                      <Trash2 size={15} />
                      <span>{t.delete}</span>
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      className="dropdown-item is-flex is-align-items-center py-2 has-text-info"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        restoreFile(file._id);
                      }}
                      style={{ gap: '0.5rem', fontSize: '0.85rem' }}
                    >
                      <RotateCcw size={15} />
                      <span>{t.restore}</span>
                    </a>
                    <hr className="dropdown-divider my-1" />
                    <a
                      className="dropdown-item is-flex is-align-items-center py-2 has-text-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        deleteFilePermanently(file._id);
                      }}
                      style={{ gap: '0.5rem', fontSize: '0.85rem' }}
                    >
                      <Trash2 size={15} />
                      <span>{t.deleteForever}</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="is-flex is-justify-content-space-between is-size-7 has-text-grey">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
