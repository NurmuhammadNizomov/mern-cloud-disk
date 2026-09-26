import React, { useEffect, useState } from 'react';
import {
  Download,
  HardDrive,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  File as GenericFileIcon,
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
        setError(err?.response?.data?.message || 'Havola yaroqsiz yoki ommaviy dostup yopilgan');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicFile();
  }, [token]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="is-flex is-align-items-center is-justify-content-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <button className="button is-loading is-large is-white" style={{ border: 'none' }}>
          Yuklanmoqda...
        </button>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="is-flex is-align-items-center is-justify-content-center p-4" style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div className="card p-6 has-text-centered" style={{ maxWidth: '420px', borderRadius: '16px' }}>
          <AlertTriangle size={48} className="has-text-danger mb-3" />
          <h3 className="is-size-5 has-text-weight-bold mb-2">Fayl topilmadi</h3>
          <p className="has-text-grey is-size-7 mb-4">{error}</p>
          <a href="/" className="button is-primary is-small" style={{ borderRadius: '8px' }}>
            Bosh sahifaga qaytish
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header className="main-header">
        <div className="is-flex is-align-items-center" style={{ gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <HardDrive size={20} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.15rem', color: '#1e293b' }}>
            Safar <span style={{ color: '#2563eb' }}>Disk</span>
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
          Yuklab olish
        </a>
      </header>

      {/* Body preview */}
      <main className="p-5 is-flex is-justify-content-center">
        <div className="card p-5" style={{ maxWidth: '800px', width: '100%', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
          <div className="is-flex is-align-items-center is-justify-content-space-between mb-4">
            <div>
              <h2 className="is-size-4 has-text-weight-bold has-text-dark mb-1">{file.name}</h2>
              <p className="has-text-grey is-size-7 mb-0">
                Hajmi: {formatFileSize(file.size)} · Ulashuvchi: {(file.owner as any)?.name || 'Foydalanuvchi'}
              </p>
            </div>
          </div>

          <div
            className="is-flex is-align-items-center is-justify-content-center p-4 mb-4"
            style={{ background: '#0f172a', borderRadius: '12px', minHeight: '380px' }}
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
                Video ijro etib bo'lmadi.
              </video>
            )}
            {file.category === 'audio' && (
              <audio controls style={{ width: '80%' }} src={file.cloudinaryUrl}>
                Audio ijro etib bo'lmadi.
              </audio>
            )}
            {['document', 'archive', 'other'].includes(file.category) && (
              <div className="has-text-centered has-text-white p-5">
                <FileText size={64} className="has-text-info mb-3" />
                <p className="is-size-5 has-text-weight-semibold">{file.name}</p>
                <p className="is-size-7 has-text-grey-light">{file.mimeType}</p>
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
              Faylni to'liq yuklab olish
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
