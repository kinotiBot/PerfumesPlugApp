import { getImageUrl } from '../utils/api';

describe('Image Placeholder Functionality', () => {
  test('returns local placeholder for null imagePath', () => {
    const result = getImageUrl(null);
    expect(result).toBe('/images/placeholder.svg');
  });

  test('returns local placeholder for undefined imagePath', () => {
    const result = getImageUrl(undefined);
    expect(result).toBe('/images/placeholder.svg');
  });

  test('returns local placeholder for empty string imagePath', () => {
    const result = getImageUrl('');
    expect(result).toBe('/images/placeholder.svg');
  });

  test('returns full URL for http URLs', () => {
    const httpUrl = 'http://example.com/image.jpg';
    const result = getImageUrl(httpUrl);
    expect(result).toBe(httpUrl);
  });

  test('returns full URL for https URLs', () => {
    const httpsUrl = 'https://example.com/image.jpg';
    const result = getImageUrl(httpsUrl);
    expect(result).toBe(httpsUrl);
  });

  test('prepends base URL for /media/ paths', () => {
    const mediaPath = '/media/images/perfume.jpg';
    const result = getImageUrl(mediaPath);
    expect(result).toBe('http://127.0.0.1:8000/media/images/perfume.jpg');
  });

  test('prepends base URL and /media/ for relative paths', () => {
    const relativePath = 'images/perfume.jpg';
    const result = getImageUrl(relativePath);
    expect(result).toBe('http://127.0.0.1:8000/media/images/perfume.jpg');
  });

  test('does not use external placeholder services', () => {
    const result = getImageUrl(null);
    expect(result).not.toContain('placeholder.com');
    expect(result).not.toContain('via.placeholder.com');
    expect(result).not.toContain('placeholdit.imgix.net');
  });

  test('uses local SVG placeholder', () => {
    const result = getImageUrl('');
    expect(result).toContain('.svg');
    expect(result).toMatch(/^\/images\//);
  });
});