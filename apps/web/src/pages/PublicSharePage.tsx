import React, { useEffect, useState } from 'react';
import {
  Download,
  HardDrive,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { shareApi } from '../api/client';
import { FileItem } from '../types';

interface PublicSharePageProps {
  token: string;
}

export const PublicSharePage: React.FC<PublicSharePageProps> = ({ token }) => {
  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicFile = async () => {
      try {
        setLoading(true);
        const res = await shareApi.getPublicItem(token);
        setFile(res.file);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Invalid link or public access has been disabled');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicFile();
  }, [token]);

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div
        className="is-flex is-align-items-center is-justify-content-center"
        style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}
      >
        <button className="button is-loading is-large is-white" style={{ border: 'none' }}>
          Loading...
        </button>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div
        className="is-flex is-align-items-center is-justify-content-center p-4"
        style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}
      >
        <div
          className="card p-6 has-text-centered"
          style={{
            maxWidth: '420px',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)'
          }}
        >
          <AlertTriangle size={48} className="has-text-danger mb-3" />
          <h3 className="is-size-5 has-text-weight-bold mb-2" style={{ color: 'var(--text-main)' }}>
            File Not Found
          </h3>
          <p className="is-size-7 mb-4" style={{ color: 'var(--text-muted)' }}>
            {error}
          </p>
          <a href="/" className="button is-primary is-small" style={{ borderRadius: '8px' }}>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Header */}
      <header className="main-header" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="is-flex is-align-items-center" style={{ gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <HardDrive size={20} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)' }}>
            Cloud <span style={{ color: 'var(--primary)' }}>Disk</span>
          </span>
        </div>

        <a
          href={file.cloudinaryUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={file.name}
          className="button is-primary"
          style={{ borderRadius: '8px', fontWeight: 600 }}
        >
          <Download size={16} className="mr-2" />
          Download
        </a>
      </header>

      {/* Body preview */}
      <main className="p-5 is-flex is-justify-content-center">
        <div
          className="card p-5"
          style={{
            maxWidth: '800px',
            width: '100%',
            borderRadius: '18px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)'
          }}
        >
          <div className="is-flex is-align-items-center is-justify-content-space-between mb-4">
            <div>
              <h2 className="is-size-4 has-text-weight-bold mb-1" style={{ color: 'var(--text-main)' }}>
                {file.name}
              </h2>
              <p className="is-size-7 mb-0" style={{ color: 'var(--text-muted)' }}>
                Size: {formatFileSize(file.size)} · Shared by: {(file.owner as any)?.name || 'User'}
              </p>
            </div>
          </div>

          <div
            className="is-flex is-align-items-center is-justify-content-center p-4 mb-4"
            style={{ background: 'var(--bg-subtle)', borderRadius: '12px', minHeight: '380px' }}
          >
            {file.category === 'image' && (
              <img
                src={file.cloudinaryUrl}
                alt={file.name}
                style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }}
              />
            )}
            {file.category === 'video' && (
              <video controls style={{ maxHeight: '60vh', maxWidth: '100%' }} src={file.cloudinaryUrl}>
                Cannot play video.
              </video>
            )}
            {file.category === 'audio' && (
              <audio controls style={{ width: '80%' }} src={file.cloudinaryUrl}>
                Cannot play audio.
              </audio>
            )}
            {['document', 'archive', 'other'].includes(file.category) && (
              <div className="has-text-centered p-5">
                <FileText size={64} className="has-text-info mb-3" />
                <p className="is-size-5 has-text-weight-semibold" style={{ color: 'var(--text-main)' }}>
                  {file.name}
                </p>
                <p className="is-size-7" style={{ color: 'var(--text-muted)' }}>
                  {file.mimeType}
                </p>
              </div>
            )}
          </div>

          <div className="has-text-centered">
            <a
              href={file.cloudinaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={file.name}
              className="button is-primary is-medium"
              style={{ borderRadius: '10px', fontWeight: 600 }}
            >
              <Download size={18} className="mr-2" />
              Download File
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
