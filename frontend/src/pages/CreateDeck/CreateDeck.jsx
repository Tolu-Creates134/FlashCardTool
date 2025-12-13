import React, {useEffect, useState} from 'react'
import { PlusIcon, XIcon, UploadIcon, BookOpenIcon } from "lucide-react";
import { generateUniqueId } from '../../utils/helpers';
import { createCategory, fetchCategories } from '../../services/api';

/**
 * 
 * @returns 
 */
const CreateDeck = ({onSave = () => {},  categories: initialCategories = [], onCreateCategory = () => {}}) => {

    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState("");

    const [deckName, setDeckName] = useState("");
    const [deckDescription, setDeckDescription] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");

    const [newCategoryName, setNewCategoryName] = useState("");
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    const [flashcards, setFlashcards] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentAnswer, setCurrentAnswer] = useState("");

    // Implement AI functionality later
    const [contentForAI, setContentForAI] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim();
        if(!name) return;

        try {
            setCategoryError("");
            setCreatingCategory(true);
            const createdCategory = await createCategory({ name });
            setCategories((prev) => [createdCategory, ...prev]);
            setSelectedCategoryId(createdCategory.id);
            setNewCategoryName("");
            setShowNewCategoryInput(false);
            onCreateCategory(createdCategory);
        } catch (error) {
            console.error('Failed to create category', error);
            setCategoryError("Unable to create category. Please try again.");
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleSaveDeck = () => {
        if (!deckName.trim() || flashcards.length === 0) return;

        const deckToSave = {
            id: generateUniqueId(),
            name: deckName,
            description: deckDescription,
            categoryId: selectedCategoryId || null,
            flashcards,
        };

        onSave(deckToSave);
    };

    const handleAddFlashcard = () => {
        const q = currentQuestion.trim();
        const a = currentAnswer.trim();
        if (!q || !a) return;

        setFlashcards((prev) => [
        ...prev,
        { id: generateUniqueId(), question: q, answer: a },
        ]);
        setCurrentQuestion("");
        setCurrentAnswer("");
    }

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);

            if(data.length > 0) {
                setSelectedCategoryId(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoadingCategories(false);
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

            {/* Deck name */}
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

            {/* Description */}
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
        </div>

        {/* Flashcards Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Flashcards</h2>
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
        </div>

        {/* Save Deck */}
        <div className="flex justify-end space-x-4">
            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Cancel
            </button>
            <button
                onClick={handleSaveDeck}
                disabled={!deckName.trim() || flashcards.length === 0}
                className={`px-6 py-2 rounded-md ${
                    !deckName.trim() || flashcards.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
            >
                Save Deck
            </button>
        </div>
    </div>
  )
}

export default CreateDeck;
