import React, { useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useDriveOperations } from '../hooks/useDriveOperations';
import { useSettingsStore } from '../store/useSettingsStore';

export const DropzoneOverlay: React.FC = () => {
  const { isDraggingOver, setIsDraggingOver } = useDriveStore();
  const { uploadFiles } = useDriveOperations();
  const { t } = useSettingsStore();

  useEffect(() => {
    let dragCounter = 0;

    const isExternalFileDrag = (e: DragEvent): boolean => {
      const types = Array.from(e.dataTransfer?.types || []);
      return types.includes('Files') && !types.includes('application/x-disk-item');
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (!isExternalFileDrag(e)) return;
      dragCounter++;
      setIsDraggingOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (!isExternalFileDrag(e)) return;
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDraggingOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const wasExternal = isExternalFileDrag(e);
      dragCounter = 0;
      setIsDraggingOver(false);

      if (wasExternal && e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  if (!isDraggingOver) return null;

  return (
    <div className="drag-overlay">
      <div
        className="p-6 has-text-centered"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-xl)',
          border: '2px dashed var(--primary)',
          maxWidth: '460px',
          width: '90%'
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--primary)'
          }}
        >
          <UploadCloud size={44} />
        </div>
        <h3 className="is-size-4 has-text-weight-bold mb-2" style={{ color: 'var(--text-main)' }}>
          {t.dropFilesHere}
        </h3>
        <p className="is-size-6 mb-0" style={{ color: 'var(--text-muted)' }}>
          {t.autoProgress}
        </p>
      </div>
    </div>
  );
};
