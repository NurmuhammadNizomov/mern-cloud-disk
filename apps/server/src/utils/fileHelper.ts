export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

export const getCategoryFromMimeAndExt = (mimeType: string, ext: string): FileCategory => {
  const lowerMime = (mimeType || '').toLowerCase();
  const lowerExt = (ext || '').toLowerCase();

  if (lowerMime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(lowerExt)) {
    return 'image';
  }
  if (lowerMime.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'].includes(lowerExt)) {
    return 'video';
  }
  if (lowerMime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(lowerExt)) {
    return 'audio';
  }
  if (
    lowerMime === 'application/pdf' ||
    lowerMime.includes('document') ||
    lowerMime.includes('word') ||
    lowerMime.includes('excel') ||
    lowerMime.includes('powerpoint') ||
    lowerMime.includes('text/') ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md'].includes(lowerExt)
  ) {
    return 'document';
  }
  if (
    lowerMime.includes('zip') ||
    lowerMime.includes('rar') ||
    lowerMime.includes('tar') ||
    lowerMime.includes('compressed') ||
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(lowerExt)
  ) {
    return 'archive';
  }
  return 'other';
};

export const sanitizeFileName = (name: string): string => {
  return name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
