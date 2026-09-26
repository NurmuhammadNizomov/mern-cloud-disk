export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  storageUsed: number;
  storageLimit: number;
}

export interface SharedUser {
  user?: string;
  email: string;
  role: 'viewer' | 'editor';
}

export interface Folder {
  _id: string;
  name: string;
  parentFolder?: string | null;
  owner: string | { _id: string; name: string; email: string };
  sharedWith: SharedUser[];
  isStarred: boolean;
  isTrash: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileItem {
  _id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  extension: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  folder?: string | null;
  owner: string | { _id: string; name: string; email: string };
  sharedWith: SharedUser[];
  isPublic: boolean;
  shareToken?: string;
  isStarred: boolean;
  isTrash: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMsg?: string;
  bytesUploaded?: number;
  totalBytes?: number;
}

export interface BreadcrumbItem {
  _id: string;
  name: string;
}

export type FilterCategory = 'all' | 'image' | 'document' | 'video' | 'audio' | 'archive';
export type SortBy = 'date' | 'name' | 'size';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';
export type NavSection = 'my-drive' | 'media' | 'shared' | 'starred' | 'trash';
