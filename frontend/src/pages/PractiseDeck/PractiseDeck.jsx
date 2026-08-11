import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useDeckQuery } from '../../hooks/queries/useDeckQuery';
import { useFlashcardsQuery } from '../../hooks/queries/useFlashcardsQuery';
import { useCreatePractiseSessionMutation } from '../../hooks/mutations/useCreatePractiseSessionMutation';
import RichTextContent from '../../components/ui/RichTextContent';

/**
 * Practise Deck component
 * @returns
 */
const PractiseDeck = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const sessionStartRef = useRef(null);
  const hasSavedSessionRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [responses, setResponses] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const {
    data: deck = null,
    isLoading: deckLoading,
    isError: deckError,
    error: deckQueryError,
  } = useDeckQuery(deckId);

  const {
    data: flashcards = [],
    isLoading: flashcardsLoading,
    isError: flashcardsError,
    error: flashcardsQueryError,
  } = useFlashcardsQuery(deckId);

  const createPractiseSessionMutation = useCreatePractiseSessionMutation();

  const loading = deckLoading || flashcardsLoading;

  const error =
    deckQueryError?.message ||
    flashcardsQueryError?.message ||
    createPractiseSessionMutation.error?.message ||
    (deckError || flashcardsError
      ? 'Unable to load deck for practice. Please try again.'
      : '');

  const currentCard = flashcards[currentIndex];
  const currentCardId = currentCard?.id ?? `card-${currentIndex}`;
  const currentResponse = useMemo(
    () => responses.find((response) => response.cardId === currentCardId),
    [responses, currentCardId]
  );
  const hasAnsweredCurrent = Boolean(currentResponse);

  const correctCount = useMemo(
    () => responses.filter((response) => response.correct).length,
    [responses]
  );

  const totalCards = flashcards.length;
  const progressPercentage = totalCards > 0
    ? ((currentIndex + 1) / totalCards) * 100
    : 0;

  const persistPracticeSession = async (sessionResponses) => {
    if (hasSavedSessionRef.current) return;
    hasSavedSessionRef.current = true;

    const completionMs = sessionStartRef.current
    ? Date.now() - sessionStartRef.current
    : 0;

    const payload = {
      CorrectCount: sessionResponses.filter((response) => response.correct)
        .length,
      TotalCount: totalCards,
      CompletionTime: Math.round(completionMs / 1000),
      ResponseJson: JSON.stringify(sessionResponses),
    };

    try {
      await createPractiseSessionMutation.mutateAsync({
        deckId,
        sessionData: payload,
      });
    } catch (err) {
      hasSavedSessionRef.current = false;
    }
  };

  const handleReveal = () => {
    if (hasAnsweredCurrent) {
      return;
    }

    setShowAnswer((current) => !current);
  };

  const handleAnswer = (isCorrect) => {
    const response = {
      cardId: currentCard?.id ?? `card-${currentIndex}`,
      correct: isCorrect,
    };

    setResponses((prev) => {
      const updated = [...prev, response];
      if (updated.length === totalCards) {
        setIsFinished(true);
        persistPracticeSession(updated);
      }

      return updated;
    });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setResponses([]);
    setIsFinished(false);
    sessionStartRef.current = Date.now();
    hasSavedSessionRef.current = false;
  };

  const handleNext = () => {
    setCurrentIndex((index) => {
      const nextIndex = Math.min(index + 1, totalCards - 1);
      if (nextIndex !== index) {
        setShowAnswer(false);
      }
      return nextIndex;
    });
  };

  const handlePrevious = () => {
    setCurrentIndex((index) => {
      const prevIndex = Math.max(index - 1, 0);
      if (prevIndex !== index) {
        setShowAnswer(false);
      }
      return prevIndex;
    });
  };

  const handleFinish = () => {
    if (isFinished) {
      return;
    }
    setIsFinished(true);
    persistPracticeSession(responses);
  };

  useEffect(() => {
    if (!loading && deck && sessionStartRef.current === null) {
      sessionStartRef.current = Date.now();
    }
  }, [loading, deck]);

  if (loading) {
    return (
      <div className='flex justify-center items-center py-10'>
        <p className='text-gray-500'>Loading practice session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-3xl mx-auto bg-white p-6 rounded shadow'>
        <p className='text-red-600 mb-4'>{error}</p>
        <button
          className='px-4 py-2 bg-indigo-600 text-white rounded'
          onClick={() => navigate('/home')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!deck) {
    return null;
  }

  if (totalCards === 0) {
    return (
      <div className='max-w-3xl mx-auto bg-white p-6 rounded shadow'>
        <h1 className='text-2xl font-bold text-gray-800 mb-2'>{deck.name}</h1>
        <p className='text-gray-600 mb-4'>
          No flashcards available for this deck yet. Add some cards before
          practising.
        </p>
        <button
          className='px-4 py-2 bg-indigo-600 text-white rounded'
          onClick={() => navigate(`/decks/${deckId}`)}
        >
          View Deck
        </button>
      </div>
    );
  }

  const renderSummary = () => (
    <div className='mx-auto mt-6 w-full max-w-2xl rounded-3xl bg-white px-8 py-10 text-center shadow-lg shadow-slate-200/80'>
      <h2 className='text-4xl font-bold tracking-tight text-slate-900'>
        Practice Complete!
      </h2>
      <div className='mt-8'>
        <p className='text-7xl font-bold tracking-tight text-indigo-600'>
          {Math.round((correctCount / totalCards) * 100)}%
        </p>
        <p className='mt-3 text-lg font-medium text-slate-500'>Your score</p>
      </div>

      <div className='mt-10 grid gap-4 sm:grid-cols-2'>
        <div className='rounded-2xl bg-emerald-50 px-6 py-5'>
          <p className='text-4xl font-bold text-emerald-600'>{correctCount}</p>
          <p className='mt-2 text-lg font-medium text-emerald-700'>Correct</p>
        </div>
        <div className='rounded-2xl bg-rose-50 px-6 py-5'>
          <p className='text-4xl font-bold text-rose-600'>
            {totalCards - correctCount}
          </p>
          <p className='mt-2 text-lg font-medium text-rose-700'>Incorrect</p>
        </div>
      </div>

      <div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row'>
        <button
          className='rounded-xl bg-slate-200 px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-300'
          onClick={() => navigate(`/decks/${deckId}`)}
        >
          Exit
        </button>
        <button
          className='rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700'
          onClick={handleRestart}
        >
          Practise Again
        </button>
      </div>
    </div>
  );

  return (
    <div className='max-w-4xl mx-auto'>
      {!isFinished && (
        <div className='mb-4 px-6'>
          <div className='flex items-center justify-between text-lg text-slate-600'>
            <button
              className='flex items-center text-indigo-600 font-medium hover:text-indigo-700'
              onClick={() => navigate(`/decks/${deckId}`)}
            >
              <span className='mr-2'>{'←'}</span>
              Exit Practice
            </button>
            <p>Card {currentIndex + 1} of {totalCards}</p>
          </div>
          <div className='mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200'>
            <div
              className='h-full rounded-full bg-indigo-600 transition-[width] duration-300 ease-out'
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className='flex flex-col items-center text-center'>
        <div className='flex-1 flex w-full flex-col items-center text-center'>
          {!isFinished && currentCard && (
            <>
              <button
                type='button'
                onClick={handleReveal}
                disabled={hasAnsweredCurrent}
                className={`mb-5 flex min-h-[22rem] w-full max-w-4xl flex-col rounded-[2rem] border border-slate-200 bg-white px-8 py-7 text-left shadow-lg shadow-slate-200/70 transition-all ${
                  hasAnsweredCurrent
                    ? 'cursor-default'
                    : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/90'
                }`}
              >
                <div className='text-lg font-medium text-slate-500'>
                  {showAnswer ? 'Answer' : 'Question'}
                </div>

                <div className='flex flex-1 items-center justify-center py-6 text-center'>
                  <div className='max-w-2xl'>
                    <RichTextContent
                      html={showAnswer ? currentCard.answer : currentCard.question}
                      className='text-2xl leading-10 text-slate-900'
                    />
                  </div>
                </div>

                <p className='text-center text-lg text-slate-500'>
                  {showAnswer ? 'Click to see question' : 'Click to see answer'}
                </p>
              </button>

              <div className='flex min-h-[4rem] flex-col items-center justify-center gap-4 sm:flex-row'>
                {showAnswer && !hasAnsweredCurrent && (
                  <>
                    <button
                      className='rounded-xl bg-rose-100 px-6 py-3 font-medium text-rose-700 transition-colors hover:bg-rose-200'
                      onClick={() => handleAnswer(false)}
                    >
                      <span className='mr-2'>×</span>
                      I got it wrong
                    </button>
                    <button
                      className='rounded-xl bg-emerald-100 px-6 py-3 font-medium text-emerald-700 transition-colors hover:bg-emerald-200'
                      onClick={() => handleAnswer(true)}
                    >
                      <span className='mr-2'>✓</span>
                      I got it right
                    </button>
                  </>
                )}
                {hasAnsweredCurrent && (
                  <button
                    className={`rounded-xl px-6 py-3 font-medium ${
                      currentResponse?.correct
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                    disabled
                  >
                    {currentResponse?.correct ? '✓ Marked correct' : '× Marked incorrect'}
                  </button>
                )}
              </div>

              <div className='mt-6 flex w-full max-w-4xl items-center justify-between'>
                <button
                  className='inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400'
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>
                <button
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                    hasAnsweredCurrent
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                  onClick={
                    currentIndex === totalCards - 1 ? handleFinish : handleNext
                  }
                  disabled={!hasAnsweredCurrent}
                >
                  {currentIndex === totalCards - 1 ? 'Finish' : 'Next'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {isFinished && renderSummary()}
        </div>
      </div>
    </div>
  );
};

export default PractiseDeck;
