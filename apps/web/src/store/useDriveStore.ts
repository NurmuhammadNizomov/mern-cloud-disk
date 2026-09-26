import { create } from 'zustand';
import {
  Folder,
  FileItem,
  FilterCategory,
  SortBy,
  SortOrder,
  ViewMode,
  NavSection,
  UploadItem
} from '../types';

interface DriveState {
  // Navigation & Filtering
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  activeSection: NavSection;
  setActiveSection: (sec: NavSection) => void;
  filterCategory: FilterCategory;
  setFilterCategory: (cat: FilterCategory) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: SortBy;
  setSortBy: (sb: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (so: SortOrder) => void;
  viewMode: ViewMode;
  setViewMode: (vm: ViewMode) => void;

  // Multi-selection state ("galochka" checkboxes)
  selectedIds: string[];
  toggleSelectItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  // Drag & drop state
  isDraggingOver: boolean;
  setIsDraggingOver: (dragging: boolean) => void;

  // Upload state
  uploadQueue: UploadItem[];
  isUploading: boolean;
  overallUploadPercent: number;
  showUploadWidget: boolean;
  setUploadQueue: (queue: UploadItem[] | ((prev: UploadItem[]) => UploadItem[])) => void;
  setIsUploading: (uploading: boolean) => void;
  setOverallUploadPercent: (percent: number) => void;
  setShowUploadWidget: (show: boolean) => void;
  clearCompletedUploads: () => void;
  closeUploadWidget: () => void;

  // Modals state
  createFolderOpen: boolean;
  setCreateFolderOpen: (open: boolean) => void;
  shareModalItem: { type: 'file' | 'folder'; item: FileItem | Folder } | null;
  setShareModalItem: (item: { type: 'file' | 'folder'; item: FileItem | Folder } | null) => void;
  previewFile: FileItem | null;
  setPreviewFile: (file: FileItem | null) => void;
  renameModalItem: { type: 'file' | 'folder'; id: string; currentName: string } | null;
  setRenameModalItem: (item: { type: 'file' | 'folder'; id: string; currentName: string } | null) => void;
}

export const useDriveStore = create<DriveState>((set) => ({
  // Navigation & Filtering
  currentFolderId: null,
  setCurrentFolderId: (id) => set({ currentFolderId: id, selectedIds: [] }),
  activeSection: 'my-drive',
  setActiveSection: (sec) => set({ activeSection: sec, currentFolderId: null, selectedIds: [] }),
  filterCategory: 'all',
  setFilterCategory: (cat) => set({ filterCategory: cat, selectedIds: [] }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  sortBy: 'date',
  setSortBy: (sb) => set({ sortBy: sb }),
  sortOrder: 'desc',
  setSortOrder: (so) => set({ sortOrder: so }),
  viewMode: 'grid',
  setViewMode: (vm) => set({ viewMode: vm }),

  // Multi-selection
  selectedIds: [],
  toggleSelectItem: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id]
    })),
  selectAll: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  // Drag & drop
  isDraggingOver: false,
  setIsDraggingOver: (dragging) => set({ isDraggingOver: dragging }),

  // Uploads
  uploadQueue: [],
  isUploading: false,
  overallUploadPercent: 0,
  showUploadWidget: false,
  setUploadQueue: (updater) =>
    set((state) => ({
      uploadQueue: typeof updater === 'function' ? updater(state.uploadQueue) : updater
    })),
  setIsUploading: (isUploading) => set({ isUploading }),
  setOverallUploadPercent: (overallUploadPercent) => set({ overallUploadPercent }),
  setShowUploadWidget: (showUploadWidget) => set({ showUploadWidget }),
  clearCompletedUploads: () =>
    set((state) => ({
      uploadQueue: state.uploadQueue.filter((item) => item.status !== 'completed')
    })),
  closeUploadWidget: () => set({ showUploadWidget: false }),

  // Modals
  createFolderOpen: false,
  setCreateFolderOpen: (open) => set({ createFolderOpen: open }),
  shareModalItem: null,
  setShareModalItem: (item) => set({ shareModalItem: item }),
  previewFile: null,
  setPreviewFile: (file) => set({ previewFile: file }),
  renameModalItem: null,
  setRenameModalItem: (item) => set({ renameModalItem: item })
}));
