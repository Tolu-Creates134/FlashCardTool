import React, { useState } from 'react';
import EmptyState from '../../components/EmptyState';
import CategorySection from './CategorySection';
import DeckGrid from './DeckGrid';
import { useNavigate } from 'react-router-dom';
import { useCategoriesQuery } from '../../hooks/queries/useCategoriesQuery';
import { useDecksQuery } from '../../hooks/queries/useDecksQuery';

/**
 * Displays the home page content after user logs
 * @returns 
 */
const Home = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const navigate = useNavigate()

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError
  } = useCategoriesQuery();

  const {
    data: decks = [],
    isLoading: decksLoading,
    isError: decksError
  } = useDecksQuery()

  const loading = categoriesLoading || decksLoading;
  const error = categoriesError || decksError;

  const handleCreateDeck =  (categoryId) => {
    navigate(categoryId ? `/create-deck/${categoryId}` : '/create-deck');
  };

  const handleSelectDeck = async (deckId) => {
    navigate(`/decks/${deckId}`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className='flex justify-center items-center py-10'>
          <p className='text-gray-500'>Loading your study materials...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className='flex justify-center items-center py-10'>
          <p className='text-red-600'>Unable to load your study materials.</p>
        </div>
      );
    }

    if (decks.length === 0) {
      return <EmptyState onCreateDeck={handleCreateDeck} />;
    }

    if (activeTab === 'categories') {
      return categories.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          decks={decks}
          categories={categories}
          onSelectDeck={handleSelectDeck}
          onCreateDeck={handleCreateDeck}
        />
      ));
    }

    return (
      <DeckGrid
        decks={decks}
        categories={categories}
        onSelectDeck={handleSelectDeck}
        onCreateDeck={handleCreateDeck}
      />
    );
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>
          Your Study Materials
        </h1>

        <div className='flex space-x-2'>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'categories'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('categories')
            }}
          >
            By Category
          </button>

          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'all-decks'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActiveTab('all-decks')}
          >
            All Decks
          </button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default Home;
