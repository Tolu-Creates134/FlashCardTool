import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDeckById, fetchFlashcardsByDeckId } from '../../services/api';

const FlashCards = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDeckData = async () => {
      try {
        setError('');
        setLoading(true);
        const [deckData, flashcardData] = await Promise.all([
          fetchDeckById(deckId),
          fetchFlashcardsByDeckId(deckId)
        ]);
        setDeck(deckData.deck);
        setFlashcards(flashcardData?.flashCards || flashcardData || []);
      } catch (err) {
        console.error(`Failed to load deck ${deckId}`, err);
        setError('Unable to load deck. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDeckData();
  }, [deckId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-500">Loading deck...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded"
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

  return (
    <div className="max-w-4xl mx-auto">

      <button
        className="mt-4 flex items-center text-indigo-600 font-medium hover:text-indigo-700"
        onClick={() => navigate('/home')}
      >
        <span className="mr-2">{'←'}</span>
        Back to Decks
      </button>

      <div className="p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{deck.name}</h1>
        <p className="text-gray-600">{deck.description}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Flashcards ({flashcards.length})</h2>
        {flashcards.length === 0 ? (
          <p className="text-gray-500">No flashcards have been added to this deck yet.</p>
        ) : (
          <div className="space-y-4">
            {flashcards.map((card, index) => (
              <div key={card.id || index} className="border rounded-md p-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Question {index + 1}
                </p>
                <p className="text-gray-800 mb-3">{card.question}</p>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Answer
                </p>
                <p className="text-gray-800">{card.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashCards;
