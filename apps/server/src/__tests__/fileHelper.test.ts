import { describe, it, expect } from 'vitest';
import { getCategoryFromMimeAndExt, formatBytes, sanitizeFileName } from '../utils/fileHelper';

describe('fileHelper utility', () => {
  it('to\'g\'ri kategoriyani aniqlaydi (Image, Video, Audio, Document, Archive)', () => {
    expect(getCategoryFromMimeAndExt('image/jpeg', 'jpg')).toBe('image');
    expect(getCategoryFromMimeAndExt('image/png', 'png')).toBe('image');
    expect(getCategoryFromMimeAndExt('video/mp4', 'mp4')).toBe('video');
    expect(getCategoryFromMimeAndExt('audio/mpeg', 'mp3')).toBe('audio');
    expect(getCategoryFromMimeAndExt('application/pdf', 'pdf')).toBe('document');
    expect(getCategoryFromMimeAndExt('application/zip', 'zip')).toBe('archive');
    expect(getCategoryFromMimeAndExt('application/octet-stream', 'xyz')).toBe('other');
  });

  it('baytlarni inson o\'qiy oladigan formatga o\'tkazadi (formatBytes)', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('fayl nomidagi xavfli belgilarni tozalaydi (sanitizeFileName)', () => {
    expect(sanitizeFileName('my file (test)!.pdf')).toBe('my_file__test__');
    expect(sanitizeFileName('presentation#2026.pptx')).toBe('presentation_2026');
  });
});
