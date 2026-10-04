/**
 * Returns true when rich text HTML contains meaningful user content.
 * @param {string} html
 * @returns {boolean}
 */
export const hasRichTextContent = (html = ''): boolean => {
  if (!html) return false;

  const temp : HTMLDivElement = document.createElement('div');
  temp.innerHTML = html;

  const text : string = temp.textContent?.replace(/\u00a0/g, ' ').trim() ?? '';

  const hasText : boolean = text.length > 0;
  const hasMedia : Element | null = temp.querySelector('img, video, iframe, pre, code');

  return hasText || Boolean(hasMedia);
};