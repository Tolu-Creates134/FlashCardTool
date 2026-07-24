/**
 * Returns true when rich text HTML contains meaningful user content.
 * @param {string} html
 * @returns {boolean}
 */
export const hasRichTextContent = (html = '') => {
  if (!html) return false;

  const temp = document.createElement('div');
  temp.innerHTML = html;

  const text = temp.textContent?.replace(/\u00a0/g, ' ').trim() || '';

  const hasText = text.length > 0;
  const hasMedia = temp.querySelector('img, video, iframe, pre, code');

  return hasText || Boolean(hasMedia);
};