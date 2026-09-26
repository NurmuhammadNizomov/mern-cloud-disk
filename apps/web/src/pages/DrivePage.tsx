import React from 'react';
import {
  Folder as FolderIcon,
  Inbox,
  Users,
  Star,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FilterSortBar } from '../components/FilterSortBar';
import { FolderCard } from '../components/FolderCard';
import { FileCard } from '../components/FileCard';
import { FileTableRow } from '../components/FileTableRow';

export const DrivePage: React.FC = () => {
  const { viewMode, activeSection, searchQuery } = useDriveStore();
  const { folders, files, sharedFolders, sharedFiles, isLoading } = useDriveOperations();
  const { t } = useSettingsStore();

  const isShared = activeSection === 'shared';
  const isTrash = activeSection === 'trash';
  const isStarred = activeSection === 'starred';
  const isMedia = activeSection === 'media';

  const displayFolders = isShared ? sharedFolders : folders;
  const displayFiles = isShared ? sharedFiles : files;

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

      {/* Page Title & Filter Bar */}
      <div className="is-flex is-align-items-center mb-3" style={{ gap: '0.6rem' }}>
        {getSectionIcon()}
        <h1 className="is-size-4 has-text-weight-bold has-text-dark mb-0">
          {getSectionTitle()}
        </h1>
        {searchQuery && (
          <span className="tag is-info is-light is-rounded ml-2">
            {t.searchResult}: "{searchQuery}"
          </span>
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
            marginTop: '3rem',
            background: 'var(--card-bg)',
            borderRadius: '16px',
            border: '1px dashed var(--border-color)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#94a3b8'
            }}
          >
            <Inbox size={32} />
          </div>
          <h3 className="is-size-5 has-text-weight-bold has-text-dark mb-1">
            {isTrash
              ? t.emptyTrash
              : isStarred
              ? t.emptyStarred
              : isShared
              ? t.emptyShared
              : t.emptyFolder}
          </h3>
          <p className="has-text-grey is-size-7 mb-4">
            {isTrash ? t.trashDesc : t.emptyDesc}
          </p>
        </div>
      ) : (
        <>
          {/* Folders Section */}
          {displayFolders.length > 0 && !isMedia && (
            <div className="mb-5">
              <p className="has-text-weight-bold is-size-7 has-text-grey mb-3" style={{ letterSpacing: '0.5px' }}>
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
              <p className="has-text-weight-bold is-size-7 has-text-grey mb-3" style={{ letterSpacing: '0.5px' }}>
                {t.filesCount.toUpperCase()} ({displayFiles.length})
              </p>

              {viewMode === 'grid' ? (
                /* Grid View */
                <div className="columns is-multiline">
                  {displayFiles.map((file) => (
                    <div key={file._id} className="column is-3-widescreen is-4-desktop is-6-tablet is-12-mobile">
                      <FileCard file={file} />
                    </div>
                  ))}
                </div>
              ) : (
                /* List Table View */
                <div className="table-container" style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <table className="table is-fullwidth is-hoverable mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}></th>
                        <th className="is-size-7 has-text-grey">{t.name}</th>
                        <th className="is-size-7 has-text-grey">{t.modifiedDate}</th>
                        <th className="is-size-7 has-text-grey">{t.size}</th>
                        <th className="is-size-7 has-text-grey" style={{ textAlign: 'right' }}>{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayFiles.map((file) => (
                        <FileTableRow key={file._id} file={file} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
