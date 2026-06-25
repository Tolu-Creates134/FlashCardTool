import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayIcon, SquarePen, Trash, ChartColumn } from 'lucide-react';
import FlashCard from '../../components/cards/FlashCard';
import { useDeckQuery } from '../../hooks/queries/useDeckQuery';
import { useFlashcardsQuery } from '../../hooks/queries/useFlashcardsQuery';
import { useDeleteDeckMutation } from '../../hooks/mutations/useDeleteDeckMutation';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';

/**
 * Component for viewing the flashcards within a deck
 * @returns 
 */
const ViewDeck = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
  } = useFlashcardsQuery(deckId)

  const deleteDeckMutation = useDeleteDeckMutation(deckId);
  
  const loading = flashcardsLoading || deckLoading;

  const error = 
  deckQueryError?.message ||
  flashcardsQueryError?.message ||
  deleteDeckMutation.error?.message ||
  (deckError || flashcardsError || deleteDeckMutation.isError
    ? 'Unable to load deck. Please try again.'
    : ''
  );

  const handleDelete = async () => {
    if (!deckId || deleteDeckMutation.isPending) return;
    deleteDeckMutation.mutate();
  }

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
      <ConfirmActionModal
        isOpen={showDeleteModal}
        title="Delete this deck?"
        message={`Are you sure you want to delete "${deck.name}"? This will permanently remove the deck and its flashcards.`}
        confirmText="Delete Deck"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          handleDelete();
        }}
      />

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
            title="Edit deck"
            aria-label="Edit deck"
            onClick={() => navigate(`/decks/${deckId}/edit`)}
          >
            <SquarePen />
          </button>

          <button
            type='button'
            title="Delete deck"
            aria-label="Delete deck"
            disabled={deleteDeckMutation.isPending}
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash className="text-red-600" />
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Flashcards ({flashcards.length})</h2>

          <div className="flex justify-between gap-4 bg-red">
            <button 
              className='px-4 py-2 border rounded text-gray-700 text-lg text-gray hover:bg-gray-200 bg-gray-100 border-gray-300 flex items-center font bold'
              onClick={() => navigate(`/decks/${deckId}/scores`)}
            >
              <ChartColumn size={18} className='mr-2'/>
              Scores
            </button>
            <button
              className="px-4 py-2 border text-lg border-indigo-600 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
              onClick={() => navigate(`/decks/${deckId}/practise`)}
            >
              <PlayIcon size={16} className="mr-2" />
              Practise Deck
            </button>
          </div>
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
