import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon, Trash2 } from 'lucide-react';
import AiFlashcardGenerator from '../../components/AiFlashcardGenerator';
import { generateUniqueId } from '../../utils/helpers';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import { useDeckQuery } from '../../hooks/queries/useDeckQuery';
import { useFlashcardsQuery } from '../../hooks/queries/useFlashcardsQuery';
import { useCategoriesQuery } from '../../hooks/queries/useCategoriesQuery';
import { useCreateCategoryMutation } from '../../hooks/mutations/useCreateCategoryMutation';
import { useUpdateDeckMutation } from '../../hooks/mutations/useUpdateDeckMutation';

/**
 * Edit deck component
 * @returns 
 */
const EditDeck = () => {
    const { deckId } = useParams();
    const navigate = useNavigate();

    const [deckName, setDeckName] = useState('');
    const [deckDescription, setDeckDescription] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [flashcards, setFlashcards] = useState([]); // [{id?, question, answer, _localId}]
    const [flashcardError, setFlashcardError] = useState('');
    const [saveError, setSaveError] = useState('');
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const [flashcardToDelete, setFlashcardToDelete] = useState(null);
    const [hasHydratedForm, setHasHydratedForm] = useState(false);

    // stable local ids for rendering new cards without server ids
    const withLocalIds = (cards) => 
    cards.map((c) => ({ ...c, _localId: c._localId || generateUniqueId() }));

    const {
        data: deck = null,
        isLoading: deckLoading,
        isError: deckError,
        error: deckQueryError
    } = useDeckQuery(deckId);

    const {
        data: fetchedFlashcards = [],
        isLoading: flashcardsLoading,
        isError: flashcardsError,
        error: flashcardsQueryError
    } = useFlashcardsQuery(deckId);

    const {
        data: categories = [],
        isLoading: categoriesLoading,
        isError: categoriesError,
        error: categoriesQueryError
    } = useCategoriesQuery();

    const createCategoryMutation = useCreateCategoryMutation();
    const updateDeckMutation = useUpdateDeckMutation();

    const loading = deckLoading || flashcardsLoading || categoriesLoading

    const error =
    deckQueryError?.message ||
    flashcardsQueryError?.message ||
    categoriesQueryError?.message ||
    (deckError || flashcardsError || categoriesError
        ? 'Unable to load deck. Please try again.'
        : ''
    );

    useEffect(() => {
        if (!deck || hasHydratedForm) return;

        setDeckName(deck.name || '');
        setDeckDescription(deck.description || '');
        setSelectedCategoryId(deck.categoryId || categories?.[0]?.id || '');
        setFlashcards(withLocalIds(fetchedFlashcards || []));
        setHasHydratedForm(true);
    }, [deck, categories, fetchedFlashcards, hasHydratedForm]);

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
                _localId: generateUniqueId(),
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

    const handleApproveAiCards = (approvedCards) => {
        setFlashcards((prev) => [
            ...prev,
            ...approvedCards.map((card) => ({
                id: undefined,
                question: card.question,
                answer: card.answer,
                _localId: generateUniqueId(),
            })),
        ]);
        setFlashcardError('');
        setSaveError('');
    };

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) {
            return;
        }

        try {
            const createdCategory = await createCategoryMutation.mutateAsync({ name });
            setSelectedCategoryId(createdCategory.id);
            setSaveError('');
            setNewCategoryName('');
            setShowNewCategoryInput(false);
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Unable to create category. Please try again.';
            setSaveError(message);
        }
    };

    const canSave = useMemo(
        () => !updateDeckMutation.isPending
    ,[updateDeckMutation.isPending]);

    const handleSave = async () => {
        if (!deckName.trim()) {
            setSaveError('Please provide a deck name before saving.');
            return;
        }

        if (flashcards.length === 0) {
            setSaveError('Please add at least one flashcard before saving.');
            return;
        }

        if (!selectedCategoryId) {
            setSaveError('Please select or create a category before saving.');
            return;
        }

        if (!canSave) return;
        setSaveError('');

        const payload = {
            name: deckName.trim(),
            description: deckDescription.trim(),
            categoryId: selectedCategoryId,
            flashCards: flashcards.map(({id, question, answer}) => ({
                id,
                question: question.trim(),
                answer: answer.trim()
            }))
        };

        try{
            await updateDeckMutation.mutateAsync({
                deckId,
                deckData: payload,
            });
            navigate(`/decks/${deckId}`)
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Unable to save deck. Please try again.';
            setSaveError(message);
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
            <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                    onClick={() => navigate(`/decks/${deckId}`)}
                >
                    Back to Deck
                </button>
            </div>
        );
    }

  return (
    <div className="max-w-4xl mx-auto">
        <ConfirmActionModal
            isOpen={Boolean(flashcardToDelete)}
            title="Delete this flashcard?"
            message="Are you sure you want to remove this flashcard from the deck?"
            confirmText="Delete Flashcard"
            onCancel={() => setFlashcardToDelete(null)}
            onConfirm={() => {
                handleRemoveFlashcard(flashcardToDelete);
                setFlashcardToDelete(null);
            }}
        />

        <button
            className="mt-4 flex items-center text-indigo-600 font-medium hover:text-indigo-700"
            onClick={() => navigate(`/decks/${deckId}`)}
        >
            <span className="mr-2">{'←'}</span>
            Back to Deck
        </button>

        <div className="p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Deck</h1>
        </div>

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
                    onChange={(e) => {
                        setDeckName(e.target.value);
                        if (saveError) setSaveError('');
                    }}
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

                {showNewCategoryInput ? (
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="New Category Name"
                        />
                        <button
                            type="button"
                            onClick={handleCreateCategory}
                            disabled={createCategoryMutation.isPending}
                            className={`px-4 py-2 rounded-md text-white ${
                                createCategoryMutation.isPending
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {createCategoryMutation.isPending ? 'Adding...' : 'Add'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowNewCategoryInput(false);
                                setNewCategoryName('');
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <select
                            value={selectedCategoryId}
                            onChange={(e) => {
                                setSelectedCategoryId(e.target.value);
                                if (saveError) setSaveError('');
                            }}
                            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="" disabled>
                                Select a category
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => setShowNewCategoryInput(true)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
                        >
                            <PlusIcon size={16} className="mr-1" />
                            New
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Flashcards Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Flashcards</h2>

            <AiFlashcardGenerator
                existingCount={flashcards.length}
                onApprove={handleApproveAiCards}
            />

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
                                onClick={() => setFlashcardToDelete(card._localId)}
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
                {updateDeckMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
        {saveError && (
            <p className="text-sm text-red-600 text-right mt-2">{saveError}</p>
        )}
    </div>
  )
};

export default EditDeck;
