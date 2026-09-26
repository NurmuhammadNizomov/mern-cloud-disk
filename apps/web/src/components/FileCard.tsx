import React, { useState, useEffect, useRef } from 'react';
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
  RotateCcw,
  Check,
  Loader2
} from 'lucide-react';
import { FileItem } from '../types';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';
import { fmtDate } from '../utils/date';

interface FileCardProps {
  file: FileItem;
}

export const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const {
    activeSection,
    setShareModalItem,
    setRenameModalItem,
    setPreviewFile,
    selectedIds,
    toggleSelectItem,
    deletingIds
  } = useDriveStore();
  const { toggleStarFile, trashFile, restoreFile, deleteFilePermanently } = useDriveOperations();
  const { t } = useSettingsStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isTrash = activeSection === 'trash';
  const isSelected = selectedIds.includes(file._id);
  const isDeleting = deletingIds.includes(file._id);

  // Click outside listener
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleDragStart = (e: React.DragEvent) => {
    if (isTrash || isDeleting) return;
    e.dataTransfer.setData(
      'application/x-disk-item',
      JSON.stringify({ type: 'file', id: file._id, name: file.name })
    );
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      ref={cardRef}
      draggable={!isTrash && !isDeleting}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`drive-card mb-4 ${menuOpen ? 'menu-active' : ''} ${isSelected ? 'selected' : ''} ${isDeleting ? 'is-deleting' : ''} ${isDragging ? 'is-dragging' : ''}`}
      onClick={() => !isTrash && !isDeleting && setPreviewFile(file)}
      style={{
        overflow: menuOpen ? 'visible' : 'hidden',
        zIndex: menuOpen ? 1000 : undefined,
        position: 'relative',
        cursor: isTrash || isDeleting ? 'default' : isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Loading Overlay when Deleting or Restoring */}
      {isDeleting && (
        <div className="card-loading-overlay">
          <Loader2 size={20} className="animate-spin has-text-danger mr-2" />
          <span className="is-size-7 has-text-danger has-text-weight-semibold">
            {t.deleting}
          </span>
        </div>
      )}

      {/* File Preview Header */}
      <div className="file-card-preview" style={{ position: 'relative' }}>
        {/* Floating Checkbox ("galochka") */}
        <div
          className={`card-checkbox ${isSelected ? 'is-checked' : ''}`}
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            zIndex: 10,
            opacity: isSelected ? 1 : undefined
          }}
          onClick={(e) => {
            e.stopPropagation();
            toggleSelectItem(file._id);
          }}
          title="Select"
        >
          {isSelected && <Check size={12} strokeWidth={3} />}
        </div>

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
            type="button"
            className="button is-small is-rounded p-1"
            onClick={(e) => {
              e.stopPropagation();
              toggleStarFile(file._id);
            }}
            title={file.isStarred ? t.unstar : t.star}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '28px',
              height: '28px',
              backgroundColor: 'var(--bg-surface)',
              backdropFilter: 'blur(4px)',
              boxShadow: 'var(--shadow-sm)',
              zIndex: 10
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
              textOverflow: 'ellipsis',
              color: 'var(--text-main)'
            }}
            title={file.name}
          >
            {file.name}
          </p>

          <div className={`dropdown is-right ${menuOpen ? 'is-active' : ''}`}>
            <div className="dropdown-trigger">
              <button
                type="button"
                className="button is-small is-white p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                style={{ width: '28px', height: '28px', borderRadius: '6px' }}
              >
                <MoreVertical size={16} className="has-text-grey" />
              </button>
            </div>
            <div className="dropdown-menu" role="menu">
              <div className="dropdown-content">
                {!isTrash ? (
                  <>
                    <a
                      className="dropdown-item is-flex is-align-items-center py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        setPreviewFile(file);
                      }}
                      style={{ gap: '0.6rem' }}
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
                      style={{ gap: '0.6rem' }}
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
                      style={{ gap: '0.6rem' }}
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
                      style={{ gap: '0.6rem' }}
                    >
                      <Edit2 size={15} className="has-text-grey" />
                      <span>{t.rename}</span>
                    </a>
                    <hr className="dropdown-divider" />
                    <a
                      className="dropdown-item is-flex is-align-items-center py-2 has-text-danger"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        await trashFile(file._id);
                      }}
                      style={{ gap: '0.6rem' }}
                    >
                      <Trash2 size={15} />
                      <span>{t.delete}</span>
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      className="dropdown-item is-flex is-align-items-center py-2 has-text-info"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        await restoreFile(file._id);
                      }}
                      style={{ gap: '0.6rem' }}
                    >
                      <RotateCcw size={15} />
                      <span>{t.restore}</span>
                    </a>
                    <hr className="dropdown-divider" />
                    <a
                      className="dropdown-item is-flex is-align-items-center py-2 has-text-danger"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        await deleteFilePermanently(file._id);
                      }}
                      style={{ gap: '0.6rem' }}
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
          <span>{fmtDate(file.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
