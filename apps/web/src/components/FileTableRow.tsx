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

interface FileTableRowProps {
  file: FileItem;
}

export const FileTableRow: React.FC<FileTableRowProps> = ({ file }) => {
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
  const rowRef = useRef<HTMLTableRowElement>(null);
  const isTrash = activeSection === 'trash';
  const isSelected = selectedIds.includes(file._id);
  const isDeleting = deletingIds.includes(file._id);

  // Click outside to close menu
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileCategoryIcon = () => {
    switch (file.category) {
      case 'image':
        return <ImageIcon size={18} className="has-text-info" />;
      case 'video':
        return <Video size={18} className="has-text-danger" />;
      case 'audio':
        return <Music size={18} className="has-text-warning" />;
      case 'document':
        return <FileText size={18} className="has-text-primary" />;
      case 'archive':
        return <Archive size={18} className="has-text-link" />;
      default:
        return <GenericFileIcon size={18} className="has-text-grey" />;
    }
  };

  return (
    <tr
      ref={rowRef}
      style={{ cursor: isDeleting ? 'default' : 'pointer' }}
      onClick={() => !isTrash && !isDeleting && setPreviewFile(file)}
      className={`is-hoverable ${isSelected ? 'table-row-selected' : ''} ${isDeleting ? 'row-loading-state' : ''}`}
    >
      {/* Checkbox ("galochka") column */}
      <td style={{ width: '40px', verticalAlign: 'middle' }}>
        <div
          className={`card-checkbox ${isSelected ? 'is-checked' : ''}`}
          style={{ opacity: isSelected ? 1 : undefined }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDeleting) toggleSelectItem(file._id);
          }}
          title="Select"
        >
          {isSelected && <Check size={12} strokeWidth={3} />}
        </div>
      </td>

      {/* Star column */}
      <td style={{ width: '40px', verticalAlign: 'middle' }}>
        {!isTrash && (
          <button
            type="button"
            className="button is-small is-white p-1"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              toggleStarFile(file._id);
            }}
            title={file.isStarred ? t.unstar : t.star}
            style={{ width: '28px', height: '28px', borderRadius: '6px' }}
          >
            <Star
              size={15}
              className={file.isStarred ? 'has-text-warning' : 'has-text-grey-light'}
              fill={file.isStarred ? '#f59e0b' : 'none'}
            />
          </button>
        )}
      </td>

      {/* File Name & Icon */}
      <td style={{ verticalAlign: 'middle' }}>
        <div className="is-flex is-align-items-center" style={{ gap: '10px' }}>
          {getFileCategoryIcon()}
          <span className="has-text-weight-medium is-size-6" style={{ color: 'var(--text-main)' }}>
            {file.name}
          </span>
          {isDeleting && (
            <span className="tag is-small is-danger is-light" style={{ fontSize: '0.7rem' }}>
              <Loader2 size={12} className="animate-spin mr-1" /> {t.deleting}
            </span>
          )}
        </div>
      </td>

      {/* Date */}
      <td className="hide-mobile" style={{ verticalAlign: 'middle', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {fmtDate(file.createdAt)}
      </td>

      {/* Size */}
      <td style={{ verticalAlign: 'middle', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {formatFileSize(file.size)}
      </td>

      {/* Actions */}
      <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
        {isDeleting ? (
          <div className="is-flex is-justify-content-flex-end is-align-items-center pr-1">
            <Loader2 size={16} className="animate-spin has-text-danger" />
          </div>
        ) : (
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
      )}
      </td>
    </tr>
  );
};
