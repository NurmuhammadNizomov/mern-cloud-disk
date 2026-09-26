import React, { useState, useEffect, useRef } from 'react';
import {
  Folder as FolderIcon,
  FolderOpen,
  Star,
  MoreVertical,
  Share2,
  Edit2,
  Trash2,
  RotateCcw,
  Check
} from 'lucide-react';
import { Folder } from '../types';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';
import { fmtDate } from '../utils/date';

interface FolderTableRowProps {
  folder: Folder;
}

export const FolderTableRow: React.FC<FolderTableRowProps> = ({ folder }) => {
  const {
    setCurrentFolderId,
    setShareModalItem,
    setRenameModalItem,
    activeSection,
    selectedIds,
    toggleSelectItem
  } = useDriveStore();
  const {
    toggleStarFolder,
    trashFolder,
    restoreFolder,
    deleteFolderPermanently
  } = useDriveOperations();
  const { t } = useSettingsStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const isTrash = activeSection === 'trash';
  const isSelected = selectedIds.includes(folder._id);

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

  const handleOpenFolder = () => {
    if (!isTrash) {
      setCurrentFolderId(folder._id);
    }
  };

  const folderColor = folder.color || '#3b82f6';

  return (
    <tr
      ref={rowRef}
      style={{ cursor: 'pointer' }}
      onClick={handleOpenFolder}
      onDoubleClick={handleOpenFolder}
      className={`is-hoverable ${isSelected ? 'table-row-selected' : ''}`}
    >
      {/* Checkbox column */}
      <td style={{ width: '40px', verticalAlign: 'middle' }}>
        <div
          className={`card-checkbox ${isSelected ? 'is-checked' : ''}`}
          style={{ opacity: isSelected ? 1 : undefined }}
          onClick={(e) => {
            e.stopPropagation();
            toggleSelectItem(folder._id);
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
            onClick={(e) => {
              e.stopPropagation();
              toggleStarFolder(folder._id);
            }}
            title={folder.isStarred ? t.unstar : t.star}
            style={{ width: '28px', height: '28px', borderRadius: '6px' }}
          >
            <Star
              size={15}
              className={folder.isStarred ? 'has-text-warning' : 'has-text-grey-light'}
              fill={folder.isStarred ? '#f59e0b' : 'none'}
            />
          </button>
        )}
      </td>

      {/* Folder Name & Icon */}
      <td style={{ verticalAlign: 'middle' }}>
        <div className="is-flex is-align-items-center" style={{ gap: '10px' }}>
          <FolderIcon size={18} fill={folderColor} fillOpacity={0.25} style={{ color: folderColor }} />
          <span className="has-text-weight-semibold is-size-6" style={{ color: 'var(--text-main)' }}>
            {folder.name}
          </span>
        </div>
      </td>

      {/* Date */}
      <td className="hide-mobile" style={{ verticalAlign: 'middle', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {fmtDate(folder.createdAt)}
      </td>

      {/* Size (folders show —) */}
      <td style={{ verticalAlign: 'middle', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        —
      </td>

      {/* Actions */}
      <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
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
                      handleOpenFolder();
                    }}
                    style={{ gap: '0.6rem' }}
                  >
                    <FolderOpen size={15} className="has-text-primary" />
                    <span>{t.open}</span>
                  </a>
                  <a
                    className="dropdown-item is-flex is-align-items-center py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      setShareModalItem({ type: 'folder', item: folder });
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
                      setRenameModalItem({ type: 'folder', id: folder._id, currentName: folder.name });
                    }}
                    style={{ gap: '0.6rem' }}
                  >
                    <Edit2 size={15} className="has-text-grey" />
                    <span>{t.rename}</span>
                  </a>
                  <hr className="dropdown-divider" />
                  <a
                    className="dropdown-item is-flex is-align-items-center py-2 has-text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      trashFolder(folder._id);
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      restoreFolder(folder._id);
                    }}
                    style={{ gap: '0.6rem' }}
                  >
                    <RotateCcw size={15} />
                    <span>{t.restore}</span>
                  </a>
                  <hr className="dropdown-divider" />
                  <a
                    className="dropdown-item is-flex is-align-items-center py-2 has-text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      deleteFolderPermanently(folder._id);
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
      </td>
    </tr>
  );
};
