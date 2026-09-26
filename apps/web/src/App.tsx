import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DrivePage } from './pages/DrivePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PublicSharePage } from './pages/PublicSharePage';
import { UploadManager } from './components/UploadManager';
import { DropzoneOverlay } from './components/DropzoneOverlay';
import { CreateFolderModal } from './components/CreateFolderModal';
import { ShareModal } from './components/ShareModal';
import { RenameModal } from './components/RenameModal';
import { FilePreviewModal } from './components/FilePreviewModal';

export const App: React.FC = () => {
  const { user, loading, fetchMe } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    fetchMe();
  }, []);

  // Handle public share link: /share/:token
  const pathname = window.location.pathname;
  if (pathname.startsWith('/share/')) {
    const token = pathname.replace('/share/', '').trim();
    if (token) {
      return <PublicSharePage token={token} />;
    }
  }

  if (loading) {
    return (
      <div
        className="is-flex is-align-items-center is-justify-content-center"
        style={{ minHeight: '100vh', background: '#f8fafc' }}
      >
        <button className="button is-loading is-large is-white" style={{ border: 'none' }}>
          Yuklanmoqda...
        </button>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="app-container">
      {/* Full-screen Drag & Drop Dropzone */}
      <DropzoneOverlay />

      {/* Main Sidebar (Google & Yandex Disk style) */}
      <Sidebar />

      {/* Right Content Area */}
      <div className="content-wrapper">
        <Header />
        <DrivePage />
      </div>

      {/* Real-time Percentage Upload Manager Widget */}
      <UploadManager />

      {/* Action Modals */}
      <CreateFolderModal />
      <ShareModal />
      <RenameModal />
      <FilePreviewModal />
    </div>
  );
};
