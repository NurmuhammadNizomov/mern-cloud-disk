import React, { useState, useEffect, useRef } from 'react';
import {
  Folder as FolderIcon,
  FolderOpen,
  MoreVertical,
  Star,
  Trash2,
  Edit2,
  Share2,
  RotateCcw,
  Check,
  Loader2
} from 'lucide-react';
import { Folder } from '../types';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';

interface FolderCardProps {
  folder: Folder;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder }) => {
  const {
    setCurrentFolderId,
    setShareModalItem,
    setRenameModalItem,
    activeSection,
    selectedIds,
    toggleSelectItem,
    deletingIds
  } = useDriveStore();
  const {
    toggleStarFolder,
    trashFolder,
    restoreFolder,
    deleteFolderPermanently
  } = useDriveOperations();
  const { t } = useSettingsStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isTrash = activeSection === 'trash';
  const isSelected = selectedIds.includes(folder._id);

  // Click outside listener to automatically close dropdown
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

  const handleOpenFolder = () => {
    if (!isTrash) {
      setCurrentFolderId(folder._id);
    }
  };

  const folderColor = folder.color || '#3b82f6';
  const isDeleting = deletingIds.includes(folder._id);

  return (
    <div
      ref={cardRef}
      className={`drive-card folder-card mb-3 ${menuOpen ? 'menu-active' : ''} ${isSelected ? 'selected' : ''} ${isDeleting ? 'is-deleting' : ''}`}
      onClick={isDeleting ? undefined : handleOpenFolder}
      onDoubleClick={isDeleting ? undefined : handleOpenFolder}
      style={{
        zIndex: menuOpen ? 1000 : undefined,
        position: 'relative'
      }}
    >
      {/* Loading Overlay when Deleting or Restoring */}
      {isDeleting && (
        <div className="card-loading-overlay">
          <Loader2 size={18} className="animate-spin has-text-danger mr-2" />
          <span className="is-size-7 has-text-danger has-text-weight-semibold">
            {t.deleting}
          </span>
        </div>
      )}

      {/* Checkbox ("galochka") for multi-selection */}
      <div
        className={`card-checkbox ${isSelected ? 'is-checked' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleSelectItem(folder._id);
        }}
        title="Select"
      >
        {isSelected && <Check size={12} strokeWidth={3} />}
      </div>

      <div className="is-flex is-align-items-center" style={{ gap: '12px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: `${folderColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: folderColor,
            flexShrink: 0
          }}
        >
          <FolderIcon size={20} fill={folderColor} fillOpacity={0.25} />
        </div>
        <span
          className="has-text-weight-semibold is-size-6"
          style={{
            maxWidth: '180px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--text-main)'
          }}
          title={folder.name}
        >
          {folder.name}
        </span>
      </div>

      <div className="is-flex is-align-items-center" style={{ gap: '4px' }}>
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
                    onClick={async (e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      await trashFolder(folder._id);
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
                      await restoreFolder(folder._id);
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
                      await deleteFolderPermanently(folder._id);
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
    </div>
  );
};
