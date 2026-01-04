import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDeckById, fetchFlashcardsByDeckId } from '../../services/api';
import { PlayIcon, SquarePen, Trash } from 'lucide-react';
import FlashCard from '../../components/cards/FlashCard';

/**
 * Component for viewing the flashcards within a deck
 * @returns 
 */
const ViewDeck = () => {
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

      {/* Deck details */}
      <div className="p-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{deck.name}</h1>
          <p className="text-gray-600">{deck.description}</p>
        </div>

        {/*Edit or delete deck*/}
        <div className="flex items-center gap-4">
          <button
            type='button'
            onClick={() => navigate(`/decks/${deckId}/edit`)}
          >
            <SquarePen />
          </button>

          <Trash className="text-red-600" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Flashcards ({flashcards.length})</h2>
          <button
            className="px-4 py-2 border border-indigo-600 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
            onClick={() => navigate(`/decks/${deckId}/practise`)}
          >
            <PlayIcon size={16} className="mr-2" />
            Practise Deck
          </button>
        </div>


        {flashcards.length === 0 ? (
          <p className="text-gray-500">No flashcards have been added to this deck yet.</p>
        ) : (
          <div className="space-y-4">
            {flashcards.map((card, index) => (
              <FlashCard key={card.id} flashcard={card} index={index}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDeck;
