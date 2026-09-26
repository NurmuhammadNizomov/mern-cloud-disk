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

interface FileTableRowProps {
  file: FileItem;
}

export const FileTableRow: React.FC<FileTableRowProps> = ({ file }) => {
  const { activeSection, setShareModalItem, setRenameModalItem, setPreviewFile } = useDriveStore();
  const { toggleStarFile, trashFile, restoreFile, deleteFilePermanently } = useDriveOperations();
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
        return <ImageIcon size={20} className="has-text-info" />;
      case 'video':
        return <Video size={20} className="has-text-danger" />;
      case 'audio':
        return <Music size={20} className="has-text-warning" />;
      case 'document':
        return <FileText size={20} className="has-text-primary" />;
      case 'archive':
        return <Archive size={20} className="has-text-link" />;
      default:
        return <GenericFileIcon size={20} className="has-text-grey" />;
    }
  };

  return (
    <tr
      style={{ cursor: 'pointer' }}
      onClick={() => !isTrash && setPreviewFile(file)}
      className="is-hoverable"
    >
      <td style={{ width: '40px', verticalAlign: 'middle' }}>
        {!isTrash && (
          <button
            className="button is-small is-white p-1"
            onClick={(e) => {
              e.stopPropagation();
              toggleStarFile(file._id);
            }}
          >
            <Star
              size={16}
              className={file.isStarred ? 'has-text-warning' : 'has-text-grey-light'}
              fill={file.isStarred ? '#f59e0b' : 'none'}
            />
          </button>
        )}
      </td>
      <td style={{ verticalAlign: 'middle' }}>
        <div className="is-flex is-align-items-center" style={{ gap: '0.75rem' }}>
          {getFileCategoryIcon()}
          <span className="has-text-weight-medium is-size-6">{file.name}</span>
        </div>
      </td>
      <td style={{ verticalAlign: 'middle', color: '#64748b', fontSize: '0.875rem' }}>
        {formatDate(file.createdAt)}
      </td>
      <td style={{ verticalAlign: 'middle', color: '#64748b', fontSize: '0.875rem' }}>
        {formatFileSize(file.size)}
      </td>
      <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
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
                    <span>Ko'rish (Preview)</span>
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
                    <span>Yuklab olish</span>
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
                    <span>Dostup berish</span>
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
                    <span>Nomini o'zgartirish</span>
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
                    <span>Chiqindilar qutisiga</span>
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
                    <span>Qayta tiklash</span>
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
                    <span>Butunlay o'chirish</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};
