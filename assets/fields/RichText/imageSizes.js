// Preference order when choosing which registered image size to insert.
// Rationale: pick the smallest size that still fits typical content-column
// widths so inline images don't ship unnecessary bytes. `medium_large` is
// WordPress's 768px-wide crop, which is usually exactly right for body text;
// `large` (1024px) and `medium` (300px) are fallbacks for when the original
// was small enough that WP didn't generate the preferred size, and `full`
// is the original upload as a last resort.
// WordPress may omit any of these for small originals; we fall through.
const SIZE_PREFERENCE = ['medium_large', 'large', 'medium', 'full'];

export function pickBestSize(attachment) {
  const sizes = attachment?.sizes || {};
  for (const key of SIZE_PREFERENCE) {
    const size = sizes[key];
    if (size?.url) {
      return { url: size.url, width: size.width || null, height: size.height || null };
    }
  }
  return {
    url: attachment?.url,
    width: attachment?.width || null,
    height: attachment?.height || null,
  };
}
