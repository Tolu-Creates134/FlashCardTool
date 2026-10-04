const getPracticeContentDensity = (html: string): 'short' | 'dense' | 'veryDense' => {
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

  return isVeryDenseContent ? 'veryDense' : isDenseContent ? 'dense' : 'short';
};

/**
 * Determines whether an answer needs the top-left reading layout.
 * @param {string} html - The answer's rich text.
 * @returns {boolean} Whether the answer is dense or contains code.
 */
export const shouldLeftAlignPracticeAnswer = (html: string): boolean =>
  getPracticeContentDensity(html) !== 'short';

/**
 * Returns responsive typography classes for practice card content.
 * @param {string} html - The card's rich text.
 * @param {boolean} isAnswerSide - Whether the answer is showing.
 * @returns {string} Typography and alignment classes.
 */
export const getPracticeContentClassName = (html: string, isAnswerSide: boolean): string => {
  const density = getPracticeContentDensity(html);

  if (isAnswerSide) {
    if (density === 'veryDense') {
      return 'w-full text-left text-base leading-8 text-slate-900';
    }

    if (density === 'dense') {
      return 'w-full text-left text-lg leading-8 text-slate-900';
    }

    return 'w-full text-center text-xl leading-9 text-slate-900';
  }

  if (density === 'veryDense') {
    return 'text-lg leading-8 text-slate-900';
  }

  if (density === 'dense') {
    return 'text-xl leading-9 text-slate-900';
  }

  return 'text-2xl leading-10 text-slate-900';
};
