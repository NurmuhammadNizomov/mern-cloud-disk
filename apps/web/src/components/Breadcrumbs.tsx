import React from 'react';
import { ChevronRight, Home, Folder } from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';

export const Breadcrumbs: React.FC = () => {
  const { setCurrentFolderId, activeSection } = useDriveStore();
  const { breadcrumbs } = useDriveOperations();
  const { t } = useSettingsStore();

  if (activeSection !== 'my-drive') return null;

  return (
    <nav className="breadcrumb mb-4" aria-label="breadcrumbs">
      <ul style={{ margin: 0, padding: 0 }}>
        <li>
          <a
            onClick={() => setCurrentFolderId(null)}
            className="is-flex is-align-items-center has-text-grey-dark has-text-weight-medium"
            style={{ gap: '0.4rem' }}
          >
            <Home size={16} />
            <span>{t.myDrive}</span>
          </a>
        </li>
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <li key={crumb._id} className={isLast ? 'is-active' : ''}>
              <a
                onClick={() => !isLast && setCurrentFolderId(crumb._id)}
                className={`is-flex is-align-items-center ${isLast ? 'has-text-weight-bold has-text-info' : 'has-text-grey'}`}
                style={{ gap: '0.35rem' }}
              >
                <ChevronRight size={14} className="has-text-grey-light" />
                <Folder size={15} />
                <span>{crumb.name}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
