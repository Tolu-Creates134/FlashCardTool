/**
 * Returns responsive typography classes for practice card content based on
 * how dense the rendered rich text is.
 * @param {string} html
 * @param {boolean} isAnswerSide
 * @returns {string}
 */
export const getPracticeContentClassName = (html : string, isAnswerSide : boolean) : string => {
  const plainText : string = (html || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

  const textLength : number = plainText.length;
  const listItemCount : number = (html?.match(/<li\b/gi) || []).length;
  const paragraphCount : number = (
    html?.match(/<(p|h1|h2|h3|h4|h5|h6|pre|blockquote)\b/gi) || []
  ).length;
  const hasCodeBlock : boolean = /<pre\b|<code\b/i.test(html || '');
  const isDenseContent : boolean =
    textLength > 220 ||
    listItemCount >= 3 ||
    paragraphCount >= 4 ||
    hasCodeBlock;
  const isVeryDenseContent : boolean =
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
