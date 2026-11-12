import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Returns candidate root directories where uploaded files might reside.
 * Handles both running from project root (new-ms) or package root (maintenance-system).
 */
export function getUploadRoots(): string[] {
  const cwd = process.cwd();
  return [
    cwd,
    join(cwd, 'maintenance-system'),
    join(cwd, '..'),
    join(cwd, '..', 'maintenance-system'),
    join(__dirname, '..', '..', '..'),
    join(__dirname, '..', '..', '..', '..'),
  ];
}

/**
 * Searches across all candidate upload roots and subfolders for a file.
 * Returns the verified absolute path, or null if not found.
 */
export function findFileOnDisk(fileName: string, storageKey?: string | null): string | null {
  if (!fileName && !storageKey) return null;

  const roots = getUploadRoots();
  const subfolders = ['requests', 'spec-requests', 'specifications', ''];

  // 1. If storageKey is present (e.g. 'spec-requests/xyz.png' or 'requests/xyz.png')
  if (storageKey) {
    for (const root of roots) {
      const p1 = join(root, 'uploads', storageKey);
      if (existsSync(p1)) return p1;
      const p2 = join(root, storageKey);
      if (existsSync(p2)) return p2;
    }
  }

  // 2. Search for fileName in candidate subfolders
  if (fileName) {
    for (const root of roots) {
      for (const sub of subfolders) {
        const candidate = sub
          ? join(root, 'uploads', sub, fileName)
          : join(root, 'uploads', fileName);
        if (existsSync(candidate)) return candidate;
      }
    }
  }

  return null;
}

/**
 * Returns the canonical destination directory for saving new uploads.
 * Always resolves to a real directory and creates it if missing.
 */
export function getUploadDestination(
  subfolder: 'requests' | 'spec-requests' | 'specifications',
): string {
  const cwd = process.cwd();
  const isInsideMs = cwd.replace(/\\/g, '/').endsWith('/maintenance-system');
  const target = isInsideMs
    ? join(cwd, 'uploads', subfolder)
    : existsSync(join(cwd, 'maintenance-system'))
      ? join(cwd, 'maintenance-system', 'uploads', subfolder)
      : join(cwd, 'uploads', subfolder);

  mkdirSync(target, { recursive: true });
  return target;
}
