import * as path from 'path';

/**
 * Generates a clean, URL-friendly filename with a timestamp or UUID to avoid collisions.
 * @param originalName The original filename (e.g., "My Image.png")
 * @returns A cleaned filename (e.g., "1735050000000-my-image.png")
 */
export const generateCleanFilename = (originalName: string): string => {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);

  const cleanName = nameWithoutExt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  return `${Date.now()}-${cleanName}${ext}`;
};
