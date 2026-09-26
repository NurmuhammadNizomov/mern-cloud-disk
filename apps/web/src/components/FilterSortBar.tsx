import React from 'react';
import {
  ArrowUpDown,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Layers
} from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';
import { FilterCategory, SortBy } from '../types';

export const FilterSortBar: React.FC = () => {
  const {
    filterCategory,
    setFilterCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    activeSection
  } = useDriveStore();
  const { folders, files } = useDriveOperations();
  const { t } = useSettingsStore();

  const categories: Array<{ id: FilterCategory; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: t.all, icon: <Layers size={14} /> },
    { id: 'image', label: t.images, icon: <ImageIcon size={14} /> },
    { id: 'document', label: t.documents, icon: <FileText size={14} /> },
    { id: 'video', label: t.videos, icon: <Video size={14} /> },
    { id: 'audio', label: t.audio, icon: <Music size={14} /> },
    { id: 'archive', label: t.archives, icon: <Archive size={14} /> }
  ];

  const showFoldersCount = filterCategory === 'all' && folders.length > 0;

  return (
    <div className="is-flex is-justify-content-space-between is-align-items-center mb-4 is-flex-wrap-wrap" style={{ gap: '12px' }}>
      {/* Category Pills */}
      {activeSection === 'my-drive' && (
        <div className="is-flex is-align-items-center is-flex-wrap-wrap" style={{ gap: '8px' }}>
          {categories.map((cat) => {
            const isActive = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterCategory(cat.id)}
                className={`category-pill ${isActive ? 'active' : ''}`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sorting & Item Count */}
      <div className="is-flex is-align-items-center ml-auto" style={{ gap: '10px' }}>
        <span className="is-size-7" style={{ color: 'var(--text-muted)' }}>
          {showFoldersCount && `${folders.length} ${t.foldersCount}, `}
          {files.length} {t.filesCount}
        </span>

        <div className="select is-small">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            style={{ borderRadius: '8px', fontWeight: 500 }}
          >
            <option value="date">{t.sortByDate}</option>
            <option value="name">{t.sortByName}</option>
            <option value="size">{t.sortBySize}</option>
          </select>
        </div>

        <button
          type="button"
          className="button is-small is-light"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          title={sortOrder === 'asc' ? t.ascending : t.descending}
          style={{ borderRadius: '8px', gap: '4px', fontWeight: 500 }}
        >
          <ArrowUpDown size={13} style={{ color: sortOrder === 'asc' ? 'var(--primary)' : 'var(--text-main)' }} />
          <span className="is-size-7">{sortOrder === 'asc' ? t.ascending : t.descending}</span>
        </button>
      </div>
    </div>
  );
};
