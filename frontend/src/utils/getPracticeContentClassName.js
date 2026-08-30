/**
 * Returns responsive typography classes for practice card content based on
 * how dense the rendered rich text is.
 * @param {string} html
 * @param {boolean} isAnswerSide
 * @returns {string}
 */
export const getPracticeContentClassName = (html, isAnswerSide) => {
  const plainText = (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const textLength = plainText.length;
  const listItemCount = (html?.match(/<li\b/gi) || []).length;
  const paragraphCount = (
    html?.match(/<(p|h1|h2|h3|h4|h5|h6|pre|blockquote)\b/gi) || []
  ).length;
  const hasCodeBlock = /<pre\b|<code\b/i.test(html || '');
  const isDenseContent =
    textLength > 220 ||
    listItemCount >= 3 ||
    paragraphCount >= 4 ||
    hasCodeBlock;
  const isVeryDenseContent =
    textLength > 420 ||
    listItemCount >= 5 ||
    paragraphCount >= 6;

  if (isAnswerSide) {
    if (isVeryDenseContent) {
      return 'w-full text-left text-base leading-8 text-slate-900';
    }

    if (isDenseContent) {
      return 'w-full text-left text-lg leading-8 text-slate-900';
    }

    return 'w-full text-left text-xl leading-9 text-slate-900';
  }

  if (isVeryDenseContent) {
    return 'text-lg leading-8 text-slate-900';
  }

  if (isDenseContent) {
    return 'text-xl leading-9 text-slate-900';
  }

  return 'text-2xl leading-10 text-slate-900';
};
