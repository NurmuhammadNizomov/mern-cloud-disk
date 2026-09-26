import React, { useState } from 'react';
import { ChevronRight, Home, Folder } from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';

export const Breadcrumbs: React.FC = () => {
  const { setCurrentFolderId, currentFolderId, activeSection } = useDriveStore();
  const { breadcrumbs, moveFile, moveFolder } = useDriveOperations();
  const { t } = useSettingsStore();
  const [activeDropId, setActiveDropId] = useState<string | null>(null);

  if (activeSection !== 'my-drive') return null;

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    if (e.dataTransfer.types.includes('application/x-disk-item')) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      if (activeDropId !== targetId) {
        setActiveDropId(targetId);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropId(null);
    const raw = e.dataTransfer.getData('application/x-disk-item');
    if (!raw) return;
    try {
      const item = JSON.parse(raw);
      if (item.id === targetFolderId) return;
      if (item.type === 'file') {
        await moveFile(item.id, targetFolderId);
      } else if (item.type === 'folder') {
        await moveFolder(item.id, targetFolderId);
      }
    } catch (err) {
      console.error('Breadcrumb drop error:', err);
    }
  };

  return (
    <nav className="breadcrumb mb-4" aria-label="breadcrumbs">
      <ul style={{ margin: 0, padding: 0 }}>
        <li>
          <a
            onClick={() => setCurrentFolderId(null)}
            onDragOver={(e) => currentFolderId ? handleDragOver(e, 'root') : undefined}
            onDragLeave={handleDragLeave}
            onDrop={(e) => currentFolderId ? handleDrop(e, null) : undefined}
            className={`is-flex is-align-items-center has-text-grey-dark has-text-weight-medium ${activeDropId === 'root' ? 'drop-target-active' : ''}`}
            style={{
              gap: '0.4rem',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            <Home size={16} />
            <span>{t.myDrive}</span>
          </a>
        </li>
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          const isDropActive = activeDropId === crumb._id;
          return (
            <li key={crumb._id} className={isLast ? 'is-active' : ''}>
              <a
                onClick={() => !isLast && setCurrentFolderId(crumb._id)}
                onDragOver={(e) => !isLast ? handleDragOver(e, crumb._id) : undefined}
                onDragLeave={handleDragLeave}
                onDrop={(e) => !isLast ? handleDrop(e, crumb._id) : undefined}
                className={`is-flex is-align-items-center ${isLast ? 'has-text-weight-bold has-text-info' : 'has-text-grey'} ${isDropActive ? 'drop-target-active' : ''}`}
                style={{
                  gap: '0.35rem',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
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
