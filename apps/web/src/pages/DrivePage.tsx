import {
  Folder as FolderIcon,
  FolderPlus,
  UploadCloud,
  Inbox,
  Users,
  Star,
  Trash2,
  Image as ImageIcon,
  Check,
  RotateCcw
} from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FilterSortBar } from '../components/FilterSortBar';
import { FolderCard } from '../components/FolderCard';
import { FolderTableRow } from '../components/FolderTableRow';
import { FileCard } from '../components/FileCard';
import { FileTableRow } from '../components/FileTableRow';

export const DrivePage: React.FC = () => {
  const {
    viewMode,
    activeSection,
    searchQuery,
    filterCategory,
    setCreateFolderOpen,
    selectedIds,
    selectAll,
    clearSelection
  } = useDriveStore();
  const {
    folders,
    files,
    sharedFolders,
    sharedFiles,
    isLoading,
    trashFolder,
    trashFile,
    restoreFolder,
    restoreFile,
    deleteFolderPermanently,
    deleteFilePermanently
  } = useDriveOperations();
  const { t } = useSettingsStore();

  const isShared = activeSection === 'shared';
  const isTrash = activeSection === 'trash';
  const isStarred = activeSection === 'starred';
  const isMedia = activeSection === 'media';

  const displayFolders = isShared ? sharedFolders : folders;
  const displayFiles = isShared ? sharedFiles : files;
  const showFolders = displayFolders.length > 0 && !isMedia && filterCategory === 'all';

  const allVisibleIds = [
    ...(showFolders ? displayFolders.map((f) => f._id) : []),
    ...displayFiles.map((f) => f._id)
  ];

  const isAllSelected =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAll(allVisibleIds);
    }
  };

  const handleBatchTrash = async () => {
    for (const id of selectedIds) {
      const isFolder = displayFolders.some((f) => f._id === id);
      if (isFolder) {
        await trashFolder(id);
      } else {
        await trashFile(id);
      }
    }
    clearSelection();
  };

  const handleBatchRestore = async () => {
    for (const id of selectedIds) {
      const isFolder = displayFolders.some((f) => f._id === id);
      if (isFolder) {
        await restoreFolder(id);
      } else {
        await restoreFile(id);
      }
    }
    clearSelection();
  };

  const handleBatchDeleteForever = async () => {
    for (const id of selectedIds) {
      const isFolder = displayFolders.some((f) => f._id === id);
      if (isFolder) {
        await deleteFolderPermanently(id);
      } else {
        await deleteFilePermanently(id);
      }
    }
    clearSelection();
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'media':
        return t.media;
      case 'shared':
        return t.shared;
      case 'starred':
        return t.starred;
      case 'trash':
        return t.trash;
      default:
        return t.myDrive;
    }
  };

  const getSectionIcon = () => {
    switch (activeSection) {
      case 'media':
        return <ImageIcon size={22} className="has-text-info" />;
      case 'shared':
        return <Users size={22} className="has-text-info" />;
      case 'starred':
        return <Star size={22} className="has-text-warning" />;
      case 'trash':
        return <Trash2 size={22} className="has-text-danger" />;
      default:
        return <FolderIcon size={22} className="has-text-info" />;
    }
  };

  return (
    <div className="main-body">
      {/* Breadcrumbs for deep navigation */}
      <Breadcrumbs />

      {/* Page Title & Top Actions */}
      <div
        className="is-flex is-justify-content-space-between is-align-items-center mb-3 is-flex-wrap-wrap"
        style={{ gap: '12px' }}
      >
        <div className="is-flex is-align-items-center" style={{ gap: '0.6rem' }}>
          {getSectionIcon()}
          <h1
            className="is-size-4 has-text-weight-bold mb-0"
            style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}
          >
            {getSectionTitle()}
          </h1>
          {searchQuery && (
            <span className="tag is-info is-light is-rounded ml-2">
              {t.searchResult}: "{searchQuery}"
            </span>
          )}
        </div>

        {/* Action buttons (New Folder & Upload Files) */}
        {activeSection === 'my-drive' && (
          <div className="is-flex is-align-items-center" style={{ gap: '8px' }}>
            <button
              type="button"
              className="button is-small is-light"
              onClick={() => setCreateFolderOpen(true)}
              style={{
                borderRadius: '8px',
                fontWeight: 600,
                gap: '6px',
                height: '34px',
                padding: '0 12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)'
              }}
            >
              <FolderPlus size={16} style={{ color: 'var(--primary)' }} />
              <span>{t.newFolder}</span>
            </button>
            <button
              type="button"
              className="button is-small is-primary"
              onClick={() => document.getElementById('global-file-input')?.click()}
              style={{
                borderRadius: '8px',
                fontWeight: 600,
                gap: '6px',
                height: '34px',
                padding: '0 14px'
              }}
            >
              <UploadCloud size={16} />
              <span>{t.uploadFiles}</span>
            </button>
          </div>
        )}
      </div>

      <FilterSortBar />

      {isLoading ? (
        <div className="p-6 has-text-centered">
          <button className="button is-loading is-large is-white" style={{ border: 'none' }}>
            Loading...
          </button>
        </div>
      ) : displayFolders.length === 0 && displayFiles.length === 0 ? (
        /* Empty State */
        <div
          className="p-6 has-text-centered"
          style={{
            marginTop: '2rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px dashed var(--border)',
            padding: '3rem 1.5rem'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--text-muted)'
            }}
          >
            <Inbox size={32} />
          </div>
          <h3 className="is-size-5 has-text-weight-bold mb-1" style={{ color: 'var(--text-main)' }}>
            {isTrash
              ? t.emptyTrash
              : isStarred
              ? t.emptyStarred
              : isShared
              ? t.emptyShared
              : t.emptyFolder}
          </h3>
          <p
            className="is-size-7 mb-4"
            style={{ color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 1.5rem' }}
          >
            {isTrash ? t.trashDesc : t.emptyDesc}
          </p>
          {!isTrash && !isStarred && !isShared && (
            <div className="is-flex is-justify-content-center" style={{ gap: '10px' }}>
              <button
                type="button"
                className="button is-small is-primary"
                onClick={() => document.getElementById('global-file-input')?.click()}
                style={{ borderRadius: '8px', fontWeight: 600, gap: '6px' }}
              >
                <UploadCloud size={15} />
                <span>{t.uploadFiles}</span>
              </button>
              <button
                type="button"
                className="button is-small is-light"
                onClick={() => setCreateFolderOpen(true)}
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  gap: '6px',
                  border: '1px solid var(--border)'
                }}
              >
                <FolderPlus size={15} style={{ color: 'var(--primary)' }} />
                <span>{t.newFolder}</span>
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= GRID VIEW ================= */
        <>
          {/* Folders Section */}
          {showFolders && (
            <div className="mb-5">
              <p
                className="has-text-weight-bold is-size-7 mb-3"
                style={{ letterSpacing: '0.06em', color: 'var(--text-muted)' }}
              >
                {t.foldersCount.toUpperCase()} ({displayFolders.length})
              </p>
              <div className="columns is-multiline">
                {displayFolders.map((folder) => (
                  <div key={folder._id} className="column is-4-desktop is-6-tablet is-12-mobile">
                    <FolderCard folder={folder} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {displayFiles.length > 0 && (
            <div>
              <p
                className="has-text-weight-bold is-size-7 mb-3"
                style={{ letterSpacing: '0.06em', color: 'var(--text-muted)' }}
              >
                {t.filesCount.toUpperCase()} ({displayFiles.length})
              </p>
              <div className="columns is-multiline">
                {displayFiles.map((file) => (
                  <div key={file._id} className="column is-3-widescreen is-4-desktop is-6-tablet is-12-mobile">
                    <FileCard file={file} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* ================= LIST TABLE VIEW ================= */
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}
        >
          <table className="table is-fullwidth is-hoverable mb-0">
            <thead>
              <tr>
                <th style={{ width: '40px', verticalAlign: 'middle' }}>
                  <div
                    className={`card-checkbox ${isAllSelected ? 'is-checked' : ''}`}
                    onClick={handleToggleSelectAll}
                    title="Select All"
                  >
                    {isAllSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </th>
                <th style={{ width: '40px' }}></th>
                <th>{t.name}</th>
                <th>{t.modifiedDate}</th>
                <th>{t.size}</th>
                <th style={{ textAlign: 'right' }}>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {/* Folders rendered first in list view */}
              {showFolders &&
                displayFolders.map((folder) => (
                  <FolderTableRow key={folder._id} folder={folder} />
                ))}

              {/* Files rendered next in list view */}
              {displayFiles.map((file) => (
                <FileTableRow key={file._id} file={file} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Multi-Selection Action Bar ("galochka" bulk operations) */}
      {selectedIds.length > 0 && (
        <div className="selection-floating-bar">
          <div className="is-flex is-align-items-center" style={{ gap: '10px' }}>
            <span className="selection-count-badge">{selectedIds.length}</span>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
              {selectedIds.length} {t.selectedCount}
            </span>
          </div>
          <div className="is-flex is-align-items-center" style={{ gap: '8px' }}>
            <button
              type="button"
              className="button is-small is-white"
              onClick={clearSelection}
              style={{ fontSize: '0.8rem', fontWeight: 500 }}
            >
              {t.deselectAll}
            </button>
            {isTrash ? (
              <>
                <button
                  type="button"
                  className="button is-small is-info is-light"
                  onClick={handleBatchRestore}
                  style={{ borderRadius: '8px', fontWeight: 600, gap: '6px' }}
                >
                  <RotateCcw size={14} />
                  <span>{t.restoreSelected}</span>
                </button>
                <button
                  type="button"
                  className="button is-small is-danger is-light"
                  onClick={handleBatchDeleteForever}
                  style={{ borderRadius: '8px', fontWeight: 600, gap: '6px' }}
                >
                  <Trash2 size={14} />
                  <span>{t.deleteForeverSelected}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="button is-small is-danger is-light"
                onClick={handleBatchTrash}
                style={{ borderRadius: '8px', fontWeight: 600, gap: '6px' }}
              >
                <Trash2 size={14} />
                <span>{t.deleteSelected}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
