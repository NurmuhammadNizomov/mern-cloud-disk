import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { folderApi, fileApi, shareApi } from '../api/client';
import { useDriveStore } from '../store/useDriveStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { toast } from '../store/useToastStore';
import { Folder, FileItem, BreadcrumbItem, UploadItem } from '../types';

export const useDriveOperations = () => {
  const queryClient = useQueryClient();
  const { user, fetchMe } = useAuthStore();
  const { t } = useSettingsStore();
  const {
    currentFolderId,
    activeSection,
    filterCategory,
    searchQuery,
    sortBy,
    sortOrder,
    setUploadQueue,
    setIsUploading,
    setOverallUploadPercent,
    setShowUploadWidget,
    addDeletingId,
    removeDeletingId
  } = useDriveStore();

  const isStarred = activeSection === 'starred';
  const isTrash = activeSection === 'trash';
  const effectiveCategory = activeSection === 'media' ? 'image' : filterCategory;

  // 1. Folders Query
  const foldersQuery = useQuery({
    queryKey: ['folders', currentFolderId, activeSection, searchQuery],
    queryFn: async () => {
      if (activeSection === 'shared') return [];
      const res = await folderApi.getFolders({
        parentFolder: activeSection === 'my-drive' ? currentFolderId : undefined,
        isStarred: isStarred || undefined,
        isTrash: isTrash || undefined,
        search: searchQuery || undefined
      });
      return (res?.folders || []) as Folder[];
    },
    enabled: !!user
  });

  // 2. Files Query
  const filesQuery = useQuery({
    queryKey: ['files', currentFolderId, activeSection, effectiveCategory, searchQuery, sortBy, sortOrder],
    queryFn: async () => {
      if (activeSection === 'shared') return [];
      const res = await fileApi.getFiles({
        folder: activeSection === 'my-drive' ? currentFolderId : undefined,
        category: effectiveCategory,
        search: searchQuery || undefined,
        isStarred: isStarred || undefined,
        isTrash: isTrash || undefined,
        sortBy,
        sortOrder
      });
      return (res?.files || []) as FileItem[];
    },
    enabled: !!user
  });

  // 3. Breadcrumbs Query
  const breadcrumbsQuery = useQuery({
    queryKey: ['breadcrumbs', currentFolderId],
    queryFn: async () => {
      if (!currentFolderId) return [];
      const res = await folderApi.getPath(currentFolderId);
      return (res?.path || []) as BreadcrumbItem[];
    },
    enabled: !!user && !!currentFolderId
  });

  // 4. Shared With Me Query
  const sharedQuery = useQuery({
    queryKey: ['shared-with-me'],
    queryFn: async () => {
      const res = await shareApi.getSharedWithMe();
      return (res || { folders: [], files: [] }) as { folders: Folder[]; files: FileItem[] };
    },
    enabled: !!user && activeSection === 'shared'
  });

  const invalidateDriveData = () => {
    queryClient.invalidateQueries({ queryKey: ['folders'] });
    queryClient.invalidateQueries({ queryKey: ['files'] });
    queryClient.invalidateQueries({ queryKey: ['shared-with-me'] });
    fetchMe();
  };

  // Upload handler with real-time percentage
  const uploadFiles = async (filesToUpload: FileList | File[]) => {
    const fileArray = Array.from(filesToUpload);
    if (fileArray.length === 0) return;

    const newItems: UploadItem[] = fileArray.map((f, idx) => ({
      id: `${Date.now()}-${idx}-${f.name}`,
      file: f,
      progress: 0,
      status: 'pending',
      totalBytes: f.size
    }));

    setUploadQueue((prev) => [...newItems, ...prev]);
    setIsUploading(true);
    setShowUploadWidget(true);
    setOverallUploadPercent(0);

    try {
      await fileApi.uploadWithProgress(
        fileArray,
        activeSection === 'my-drive' ? currentFolderId : null,
        (percent, loaded, total) => {
          setOverallUploadPercent(percent);
          setUploadQueue((prev) =>
            prev.map((item) => {
              if (newItems.some((ni) => ni.id === item.id)) {
                return {
                  ...item,
                  progress: percent,
                  status: percent >= 100 ? 'completed' : 'uploading',
                  bytesUploaded: loaded
                };
              }
              return item;
            })
          );
        }
      );

      setUploadQueue((prev) =>
        prev.map((item) => {
          if (newItems.some((ni) => ni.id === item.id)) {
            return { ...item, progress: 100, status: 'completed' };
          }
          return item;
        })
      );

      invalidateDriveData();
      toast.success(`${filesToUpload.length} ${t.uploadSuccess}`);
    } catch (err: any) {
      console.error('Upload failed:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Upload error occurred';
      toast.error(errMsg);
      setUploadQueue((prev) =>
        prev.map((item) => {
          if (newItems.some((ni) => ni.id === item.id)) {
            return { ...item, status: 'error', errorMsg: errMsg };
          }
          return item;
        })
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Action mutations
  const createFolderMutation = useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) =>
      folderApi.create(name, activeSection === 'my-drive' ? currentFolderId : null, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success(t.folderCreated);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t.operationFailed);
    }
  });

  const renameFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => folderApi.rename(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success(t.itemRenamed);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t.operationFailed);
    }
  });

  const renameFileMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => fileApi.rename(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success(t.itemRenamed);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t.operationFailed);
    }
  });

  const moveFolderMutation = useMutation({
    mutationFn: ({ id, targetFolderId }: { id: string; targetFolderId?: string | null }) =>
      folderApi.move(id, targetFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['breadcrumbs'] });
      toast.success(t.itemMoved);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || t.moveError;
      toast.error(msg);
    }
  });

  const moveFileMutation = useMutation({
    mutationFn: ({ id, targetFolderId }: { id: string; targetFolderId?: string | null }) =>
      fileApi.move(id, targetFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success(t.itemMoved);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || t.moveError;
      toast.error(msg);
    }
  });

  const toggleStarFolderMutation = useMutation({
    mutationFn: (id: string) => folderApi.toggleStar(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success(data?.folder?.isStarred ? t.itemStarred : t.itemUnstarred);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t.operationFailed);
    }
  });

  const toggleStarFileMutation = useMutation({
    mutationFn: (id: string) => fileApi.toggleStar(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success(data?.file?.isStarred ? t.itemStarred : t.itemUnstarred);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t.operationFailed);
    }
  });

  const trashFolderMutation = useMutation({
    mutationFn: (id: string) => folderApi.trash(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success(t.itemTrashed);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t.operationFailed);
    }
  });

  const trashFileMutation = useMutation({
    mutationFn: (id: string) => fileApi.trash(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success(t.itemTrashed);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t.operationFailed);
    }
  });

  const restoreFolderMutation = useMutation({
    mutationFn: (id: string) => folderApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success(t.itemRestored);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t.operationFailed);
    }
  });

  const restoreFileMutation = useMutation({
    mutationFn: (id: string) => fileApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success(t.itemRestored);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t.operationFailed);
    }
  });

  const deleteFolderPermanentlyMutation = useMutation({
    mutationFn: (id: string) => folderApi.deletePermanently(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success(t.itemDeleted);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t.operationFailed);
    }
  });

  const deleteFilePermanentlyMutation = useMutation({
    mutationFn: (id: string) => fileApi.deletePermanently(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      fetchMe();
      toast.success(t.itemDeleted);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t.operationFailed);
    }
  });

  return {
    folders: foldersQuery.data || [],
    files: filesQuery.data || [],
    breadcrumbs: breadcrumbsQuery.data || [],
    sharedFolders: sharedQuery.data?.folders || [],
    sharedFiles: sharedQuery.data?.files || [],
    isLoading: foldersQuery.isLoading || filesQuery.isLoading,
    uploadFiles,
    createFolder: (name: string, color?: string) => createFolderMutation.mutateAsync({ name, color }),
    renameFolder: (id: string, name: string) => renameFolderMutation.mutateAsync({ id, name }),
    renameFile: (id: string, name: string) => renameFileMutation.mutateAsync({ id, name }),
    moveFolder: (id: string, targetFolderId?: string | null) =>
      moveFolderMutation.mutateAsync({ id, targetFolderId }),
    moveFile: (id: string, targetFolderId?: string | null) =>
      moveFileMutation.mutateAsync({ id, targetFolderId }),
    toggleStarFolder: (id: string) => toggleStarFolderMutation.mutateAsync(id),
    toggleStarFile: (id: string) => toggleStarFileMutation.mutateAsync(id),
    trashFolder: async (id: string) => {
      addDeletingId(id);
      try {
        return await trashFolderMutation.mutateAsync(id);
      } finally {
        removeDeletingId(id);
      }
    },
    trashFile: async (id: string) => {
      addDeletingId(id);
      try {
        return await trashFileMutation.mutateAsync(id);
      } finally {
        removeDeletingId(id);
      }
    },
    restoreFolder: async (id: string) => {
      addDeletingId(id);
      try {
        return await restoreFolderMutation.mutateAsync(id);
      } finally {
        removeDeletingId(id);
      }
    },
    restoreFile: async (id: string) => {
      addDeletingId(id);
      try {
        return await restoreFileMutation.mutateAsync(id);
      } finally {
        removeDeletingId(id);
      }
    },
    deleteFolderPermanently: async (id: string) => {
      addDeletingId(id);
      try {
        return await deleteFolderPermanentlyMutation.mutateAsync(id);
      } finally {
        removeDeletingId(id);
      }
    },
    deleteFilePermanently: async (id: string) => {
      addDeletingId(id);
      try {
        return await deleteFilePermanentlyMutation.mutateAsync(id);
      } finally {
        removeDeletingId(id);
      }
    }
  };
};
