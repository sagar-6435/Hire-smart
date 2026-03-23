/**
 * Utility helper functions
 */

/**
 * Truncate a long filename for display
 */
export const truncateFilename = (name, maxLen = 32) => {
  if (!name) return '';
  if (name.length <= maxLen) return name;
  const ext = name.lastIndexOf('.');
  const extension = ext !== -1 ? name.slice(ext) : '';
  const base = ext !== -1 ? name.slice(0, ext) : name;
  return base.slice(0, maxLen - extension.length - 3) + '...' + extension;
};

/**
 * Format file size in human-readable form
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Delay helper for async flows
 */
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));
