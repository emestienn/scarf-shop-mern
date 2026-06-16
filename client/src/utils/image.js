export const PLACEHOLDER_IMAGE = '/placeholder.svg';

export const handleImageError = (e) => {
  if (e.target.src.endsWith(PLACEHOLDER_IMAGE)) return;
  e.target.onerror = null;
  e.target.src = PLACEHOLDER_IMAGE;
};
