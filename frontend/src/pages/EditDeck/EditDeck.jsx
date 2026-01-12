import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCategories, fetchDeckById, fetchFlashcardsByDeckId, updateDeck } from '../../services/api';
import { PlusIcon, Trash2, SquarePen } from 'lucide-react';
import ErrorToastr from '../../components/ErrorToastr';

const EditDeck = () => {
    const { deckId } = useParams();
    const navigate = useNavigate();

    const [deckName, setDeckName] = useState('');
    const [deckDescription, setDeckDescription] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [flashcards, setFlashcards] = useState([]); // [{id?, question, answer, _localId}]
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [errorToast, setErrorToast] = useState(null)
    const [flashcardError, setFlashcardError] = useState('');
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');

    // stable local ids for rendering new cards without server ids
  const withLocalIds = (cards) => 
    cards.map((c) => ({ ...c, _localId: c._localId || crypto.randomUUID() }));

    useEffect(() => {
        const loadData = async () => {
            try {
                const [deckRes, flashRes, categoriesRes] = await Promise.all([
                fetchDeckById(deckId),
                fetchFlashcardsByDeckId(deckId),
                fetchCategories(),
                ]);
                const deck = deckRes.deck;
                setDeckName(deck.name);
                setDeckDescription(deck.description);
                setSelectedCategoryId(deck.categoryId || categoriesRes?.[0]?.id || '');
                setCategories(categoriesRes || []);
                setFlashcards(withLocalIds(flashRes.flashCards || flashRes || []));
            } catch (error) {
                setError('Unable to load deck for editing');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [deckId]);

    const handleAddFlashcard = () => {
        if(!newQuestion.trim() || !newAnswer.trim()) {
            setFlashcardError('Enter both a question and an answer');
            return;
        }

        setFlashcardError('');
        setFlashcards((prev) => [
            ...prev,
            {
                id: undefined,
                question: newQuestion.trim(),
                answer: newAnswer.trim(),
                _localId: crypto.randomUUID(),
            }, 
        ]);
        setNewQuestion('');
        setNewAnswer('');
    };

    const handleUpdateFlashcard = (localId, key, value) => {
        setFlashcards((prev) => 
            prev.map((card) => 
                card._localId === localId ? {...card, [key]: value} : card
            )
        );
    };

    const handleRemoveFlashcard = (localId) => {
        setFlashcards((prev) => prev.filter((card) => card._localId !== localId));
    };

    const canSave = useMemo(
        () => deckName.trim() && flashcards.length > 0 && !isSaving,
        [deckName, flashcards, isSaving]
    );

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        setError('');

        const payload = {
            name: deckName.trim(),
            description: deckDescription.trim(),
            categoryId: selectedCategoryId || null,
            flashCards: flashcards.map(({id, question, answer}) => ({
                id,
                question: question.trim(),
                answer: answer.trim
            }))
        };

        try{
            await updateDeck(deckId, payload)
            navigate(`/decks/${deckId}`)
        } catch (err) {
            console.error('Failed to update deck', err);
            const message = 
            err.message || 'Unable to save deck. Please try again.';
            console.log(message, 'CHECKING ERROR MESSAGE')
            console.log(err)
            setError(message);
            setErrorToast({id: Date.now(), message: message})
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <p className="text-gray-500">Loading deck...</p>
            </div>
        );
    }

    if (error) {
        return (
            <ErrorToastr
                key={errorToast.id}
                message={errorToast.message}
                onClose={() => setErrorToast(null)}
            />
        );
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

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Deck</h1>

        {/* Deck Info */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Deck Information</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deck Name
                </label>
                <input
                    type="text"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Biology 101"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="What is this deck about?"
                    rows={3}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                </label>
                <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        {/* Flashcards Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Flashcards</h2>

            {flashcards.length === 0 && (
                <p className="text-gray-500 mb-4">No flashcards yet. Add one below.</p>
            )}

            <div className="space-y-4">
                {flashcards.map((card, index) => (
                    <div key={card._localId} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                    Flashcard {index + 1}
                                </p>
                                <input
                                    type="text"
                                    value={card.question}
                                    onChange={(e) =>
                                        handleUpdateFlashcard(card._localId, 'question', e.target.value)
                                    }
                                    className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                                    placeholder="Question"
                                />
                                <textarea
                                    value={card.answer}
                                    onChange={(e) =>
                                    handleUpdateFlashcard(card._localId, 'answer', e.target.value)
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Answer"
                                    rows={2}
                                />
                            </div>
                            <button
                                className="ml-4 text-sm text-red-600 hover:text-red-700 flex items-center"
                                onClick={() => handleRemoveFlashcard(card._localId)}
                            >
                                <Trash2 size={16} className="mr-1" />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add new flashcard */}
            <div className="mt-6 border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Add Flashcard</p>
                <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                    placeholder="Question"
                />
                <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                    placeholder="Answer"
                    rows={2}
                />
                <button
                    onClick={handleAddFlashcard}
                    className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
                >
                    <PlusIcon size={16} className="mr-2" />
                    Add Flashcard
                </button>
                {flashcardError && (
                    <p className="text-sm text-red-600 mt-2">{flashcardError}</p>
                )}
            </div>
        </div>

        {/* Save / Cancel */}
        <div className="flex justify-end space-x-4">
            <button
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={() => navigate(`/decks/${deckId}`)}
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                disabled={!canSave}
                className={`px-6 py-2 rounded-md ${
                    !canSave
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            >
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
        {error && (
            <p className="text-sm text-red-600 text-right mt-2">{error}</p>
        )}
    </div>
  )
};

export default EditDeck;
