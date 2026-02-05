import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDeckById, fetchFlashcardsByDeckId, createPractiseSession } from '../../services/api';

const PractiseDeck = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const sessionStartRef = useRef(null);
  const hasSavedSessionRef = useRef(false);
  const [savingSession, setSavingSession] = useState(false);

  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [responses, setResponses] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError('');
        setLoading(true);
        const [deckData, flashcardData] = await Promise.all([
          fetchDeckById(deckId),
          fetchFlashcardsByDeckId(deckId),
        ]);
        console.log(flashcardData)
        setDeck(deckData.deck ?? deckData);
        setFlashcards(flashcardData?.flashCards || flashcardData || []);
        if (!sessionStartRef.current) {
          sessionStartRef.current = Date.now();
        }
      } catch (err) {
        console.error(`Failed to load practice deck ${deckId}`, err);
        setError('Unable to load deck for practice. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [deckId]);

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

  const persistPracticeSession = async (sessionResponses) => {
    if (hasSavedSessionRef.current) return;
    hasSavedSessionRef.current = true;

    const completionMs = sessionStartRef.current
      ? Date.now() - sessionStartRef.current
      : 0;

    const payload = {
      CorrectCount: sessionResponses.filter((response) => response.correct).length,
      TotalCount: totalCards,
      CompletionTime: Math.round(completionMs / 1000),
      ResponseJson: JSON.stringify(sessionResponses),
    };

    try {
      setSavingSession(true);
      await createPractiseSession(deckId, payload);
    } catch (err) {
      console.error('Failed to save practise session', err);
    } finally {
      setSavingSession(false);
    }
  };

  const handleReveal = () => {
    setShowAnswer(true);
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
    <div className='bg-white p-6 rounded-lg shadow-md mt-6'>
      <h2 className='text-xl font-semibold text-gray-800 mb-4'>
        Practice Summary
      </h2>
      <p className='text-gray-700 mb-2'>
        Score: {correctCount} / {totalCards}
      </p>
      <p className='text-gray-700 mb-4'>
        Accuracy: {Math.round((correctCount / totalCards) * 100)}%
      </p>
      <div className='flex space-x-3'>
        <button
          className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700'
          onClick={handleRestart}
        >
          Practise Again
        </button>
        <button
          className='px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100'
          onClick={() => navigate(`/decks/${deckId}`)}
        >
          Back to Deck
        </button>
      </div>
    </div>
  );

  return (
    <div className='max-w-4xl mx-auto'>
      <button
        className='mt-4 flex items-center text-indigo-600 font-medium hover:text-indigo-700'
        onClick={() => navigate(`/decks/${deckId}`)}
      >
        <span className='mr-2'>{'←'}</span>
        Exit Practise
      </button>

      <div className='p-6 mb-6'>
        <h1 className='text-2xl font-bold text-gray-800 mb-2'>{deck.name}</h1>
        <p className='text-gray-600'>{deck.description}</p>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-md h-64 md:h-80 lg:h-96 flex flex-col'>
        <div className='flex items-center justify-between text-sm text-gray-500'>
          <p className='text-sm text-gray-500'>
            Card {currentIndex + 1} of {totalCards}
          </p>
          {!isFinished && (
            <p className='text-sm text-gray-500'>
              Correct so far: {correctCount}
              {hasAnsweredCurrent && currentResponse?.correct && (
                <span className='ml-2 text-green-600 font-semibold'>+1</span>
              )}
            </p>
          )}
        </div>

        <div className='flex-1 flex flex-col items-center justify-center text-center'>
          {!isFinished && currentCard && (
            <>
              <div className='mb-4 max-w-2xl'>
                <h2 className='text-lg font-semibold text-gray-800 mb-2'>
                  Question
                </h2>
                <p className='text-gray-700'>{currentCard.question}</p>
              </div>

              {showAnswer ? (
                <div className='mb-6 max-w-2xl'>
                  <h3 className='text-md font-semibold text-gray-800 mb-2'>
                    Answer
                  </h3>
                  <p className='text-gray-700'>{currentCard.answer}</p>
                </div>
              ) : (
                <button
                  className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mb-6'
                  onClick={handleReveal}
                >
                  Reveal Answer
                </button>
              )}

              {showAnswer && (
                <div className='flex flex-col sm:flex-row gap-4'>
                  {!hasAnsweredCurrent && (
                    <>
                      <button
                        className='flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
                        onClick={() => handleAnswer(true)}
                      >
                        I got it correct
                      </button>
                      <button
                        className='flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
                        onClick={() => handleAnswer(false)}
                      >
                        I got it incorrect
                      </button>
                    </>
                  )}
                  {hasAnsweredCurrent && (
                    <button
                      className={`flex-1 px-4 py-2 rounded text-white ${
                        currentResponse?.correct
                          ? 'bg-green-600'
                          : 'bg-red-600'
                      }`}
                      disabled
                    >
                      {currentResponse?.correct
                        ? 'Marked correct'
                        : 'Marked incorrect'}
                    </button>
                  )}
                </div>
              )}

              <div className='mt-6 flex w-full max-w-2xl justify-between'>
                <button
                  className='px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed'
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  Previous
                </button>
                <button
                  className={`px-3 py-1.5 text-sm rounded disabled:opacity-60 disabled:cursor-not-allowed ${
                    hasAnsweredCurrent
                      ? 'bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={currentIndex === totalCards - 1 ? handleFinish : handleNext}
                >
                  {currentIndex === totalCards - 1 ? 'Finish' : 'Next'}
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
