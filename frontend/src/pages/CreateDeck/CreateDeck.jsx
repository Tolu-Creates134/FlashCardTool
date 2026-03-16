import React, {useEffect, useState} from 'react'
import { PlusIcon } from "lucide-react";
import { generateUniqueId } from '../../utils/helpers';
import { createCategory, fetchCategories, createDeck } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AiFlashcardGenerator from '../../components/AiFlashcardGenerator';


/**
 * Create deck component
 * @param {*} param0 
 * @returns 
 */
const CreateDeck = ({onSave = () => {},  categories: initialCategories = [], onCreateCategory = () => {}}) => {

    const [categories, setCategories] = useState([])
    // const [loadingCategories, setLoadingCategories] = useState(true)
    const [creatingCategory, setCreatingCategory] = useState(false);
    // const [categoryError, setCategoryError] = useState("");

    const [deckName, setDeckName] = useState("");
    const [deckDescription, setDeckDescription] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");

    const [newCategoryName, setNewCategoryName] = useState("");
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    const [flashcards, setFlashcards] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [flashcardError, setFlashcardError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const navigate = useNavigate();

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim();
        if(!name) return;

        try {
            setCreatingCategory(true);
            const createdCategory = await createCategory({ name });
            setCategories((prev) => [createdCategory, ...prev]);
            setSelectedCategoryId(createdCategory.id);
            setNewCategoryName("");
            setShowNewCategoryInput(false);
            onCreateCategory(createdCategory);
        } catch (error) {
            console.error('Failed to create category', error);
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleSaveDeck = async () => {
        if (!deckName.trim()) {
            setSaveError("Please provide a deck name before saving.");
            return;
        }

        if (flashcards.length === 0) {
            setSaveError("Please add at least one flashcard before saving.");
            return;
        }

        const payload = {
            name: deckName.trim(),
            description: deckDescription.trim(),
            categoryId: selectedCategoryId,
            flashCards: flashcards.map(({ question, answer }) => ({
                question,
                answer,
            })),
        };

        setIsSaving(true);
        setSaveError("");

        try {
            const createdDeck = await createDeck(payload);
            onSave(createdDeck);
            navigate("/home");
        } catch (error) {
            console.error("Failed to create deck", error);
            const message = error.response?.data?.message || "Unable to save deck. Please try again.";
            setSaveError(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddFlashcard = () => {
        const q = currentQuestion.trim();
        const a = currentAnswer.trim();
        if (!q || !a) {
            setFlashcardError("Please enter both a question and an answer.");
            return;
        }

        setFlashcards((prev) => [
        ...prev,
        { id: generateUniqueId(), question: q, answer: a },
        ]);
        setCurrentQuestion("");
        setCurrentAnswer("");
        setFlashcardError("");
    }

    const handleRemoveFlashcard = (id) => {
        setFlashcards((prev) => prev.filter((card) => card.id !== id));
    };

    const handleApproveAiCards = (approvedCards) => {
        setFlashcards((prev) => [
            ...prev,
            ...approvedCards.map((card) => ({
                id: generateUniqueId(),
                question: card.question,
                answer: card.answer,
            })),
        ]);
        setFlashcardError("");
        setSaveError("");
    };

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
        }
    };

    useEffect(() => {
        loadCategories();
    }, [])

  return (
    <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Create New Flashcard Deck
        </h1>

        {/* Deck Info */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Deck Information</h2>

            {/* Category */}
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
                            onClick={handleCreateCategory}
                            disabled={creatingCategory}
                            className={`px-4 py-2 rounded-md text-white ${creatingCategory ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                        >
                            {creatingCategory ? "Adding..." : "Add"}
                        </button>
                        <button
                            onClick={() => setShowNewCategoryInput(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                    // {categoryError && (
                    //     <div className="text-sm text-red-600 mt-2">
                    //         {categoryError}
                    //     </div>
                    // )}
                ) : (
                <div className="flex space-x-2">
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowNewCategoryInput(true)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
                    >
                        <PlusIcon size={16} className="mr-1" />
                        New
                    </button>
                </div>
            )}
            </div>

            {/* Deck name */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deck Name
                </label>
                <input
                    type="text"
                    value={deckName}
                    onChange={(e) => {
                        setDeckName(e.target.value);
                        if (saveError) setSaveError("");
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Biology 101"
                />
            </div>

            {/* Description */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deck Description
                </label>
                <textarea
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="What is this deck about?"
                    rows={3}
                />
            </div>
        </div>

        {/* Flashcards Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Flashcards</h2>

            <AiFlashcardGenerator
                existingCount={flashcards.length}
                onApprove={handleApproveAiCards}
            />

            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question
                </label>
                <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter question"
                />
            </div>
            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer
                </label>
                <input
                    type="text"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter answer"
                />
            </div>
            <button
                onClick={handleAddFlashcard}
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
                <PlusIcon size={16} className="mr-2 inline" />
                Add Flashcard
                </button>
            {flashcardError && (
                <p className="text-sm text-red-600 mt-2">{flashcardError}</p>
            )}

            {flashcards.length > 0 && (
                <div className="mt-6 space-y-4">
                    {flashcards.map((card, index) => (
                        <div key={card.id} className="border rounded-md p-4 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">
                                        Question {index + 1}
                                    </p>
                                    <p className="text-gray-800">{card.question}</p>

                                    <p className="text-sm font-semibold text-gray-700 mt-2">
                                        Answer
                                    </p>
                                    <p className="text-gray-800">{card.answer}</p>
                                </div>
                                <button
                                    className="text-sm text-red-500 hover:text-red-600"
                                    onClick={() => handleRemoveFlashcard(card.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Save Deck */}
        <div className="flex justify-end space-x-4">
            <button
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={() => navigate("/home")}
            >
                Cancel
            </button>
            <button
                onClick={handleSaveDeck}
                disabled={isSaving}
                className={`px-6 py-2 rounded-md ${
                    isSaving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
            >
                {isSaving ? "Saving..." : "Save Deck"}
            </button>
        </div>
        {saveError && (
            <p className="text-sm text-red-600 text-right mt-2">{saveError}</p>
        )}
    </div>
  )
}

export default CreateDeck;
