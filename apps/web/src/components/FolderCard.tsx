import React, { useState } from 'react';
import {
  Folder as FolderIcon,
  MoreVertical,
  Star,
  Trash2,
  Edit2,
  Share2,
  RotateCcw
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
    activeSection
  } = useDriveStore();
  const {
    toggleStarFolder,
    trashFolder,
    restoreFolder,
    deleteFolderPermanently
  } = useDriveOperations();
  const { t } = useSettingsStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const isTrash = activeSection === 'trash';

  const handleDoubleClick = () => {
    if (!isTrash) {
      setCurrentFolderId(folder._id);
    }
  };

  return (
    <div
      className="drive-card folder-card mb-3"
      onDoubleClick={handleDoubleClick}
      style={{
        borderLeft: `4px solid ${folder.color || '#4285F4'}`
      }}
    >
      <div className="is-flex is-align-items-center" style={{ gap: '0.75rem', overflow: 'hidden', flex: 1 }}>
        <div style={{ color: folder.color || '#4285F4' }}>
          <FolderIcon size={24} fill={folder.color || '#4285F4'} fillOpacity={0.2} />
        </div>
        <span
          className="has-text-weight-semibold is-size-6"
          style={{
            maxWidth: '180px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={folder.name}
        >
          {folder.name}
        </span>
      </div>

      <div className="is-flex is-align-items-center" style={{ gap: '0.25rem' }}>
        {!isTrash && (
          <button
            className="button is-small is-white p-1"
            onClick={(e) => {
              e.stopPropagation();
              toggleStarFolder(folder._id);
            }}
            title={folder.isStarred ? t.unstar : t.star}
          >
            <Star
              size={16}
              className={folder.isStarred ? 'has-text-warning' : 'has-text-grey-light'}
              fill={folder.isStarred ? '#f59e0b' : 'none'}
            />
          </button>
        )}

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
                    onClick={() => {
                      setMenuOpen(false);
                      setShareModalItem({ type: 'folder', item: folder });
                    }}
                    style={{ gap: '0.5rem', fontSize: '0.85rem' }}
                  >
                    <Share2 size={15} className="has-text-info" />
                    <span>{t.share}</span>
                  </a>
                  <a
                    className="dropdown-item is-flex is-align-items-center py-2"
                    onClick={() => {
                      setMenuOpen(false);
                      setRenameModalItem({ type: 'folder', id: folder._id, currentName: folder.name });
                    }}
                    style={{ gap: '0.5rem', fontSize: '0.85rem' }}
                  >
                    <Edit2 size={15} className="has-text-grey" />
                    <span>{t.rename}</span>
                  </a>
                  <hr className="dropdown-divider my-1" />
                  <a
                    className="dropdown-item is-flex is-align-items-center py-2 has-text-danger"
                    onClick={() => {
                      setMenuOpen(false);
                      trashFolder(folder._id);
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
                    onClick={() => {
                      setMenuOpen(false);
                      restoreFolder(folder._id);
                    }}
                    style={{ gap: '0.5rem', fontSize: '0.85rem' }}
                  >
                    <RotateCcw size={15} />
                    <span>{t.restore}</span>
                  </a>
                  <hr className="dropdown-divider my-1" />
                  <a
                    className="dropdown-item is-flex is-align-items-center py-2 has-text-danger"
                    onClick={() => {
                      setMenuOpen(false);
                      deleteFolderPermanently(folder._id);
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
    </div>
  );
};
