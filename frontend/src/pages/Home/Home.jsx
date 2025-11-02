import React, { useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import CategorySection from './CategorySection';
import DeckGrid from './DeckGrid';
import { createDeck, fetchCategories, fetchDecks } from '../../services/api';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [decks, setDecks] = useState([]);
  const [activeTab, setActiveTab] = useState('categories');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catData, deckData] = await Promise.all([
          fetchCategories(),
          fetchDecks(),
        ]);
        setCategories(catData);
        setDecks(deckData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Create new deck
  const handleCreateDeck = async (deckData) => {
    try {
      const newDeck = await createDeck(deckData);
      setDecks((prev) => [...prev, newDeck]);
    } catch (err) {
      console.error(`Faield to create deck: ${err}`);
    }
  };

  const handleSelectDeck = async (deckId) => {
    console.log('deck selected:', deckId);
    // Future: navigate (/decks/deckId)
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className='flex justify-center items-center py-10'>
          <p className='text-gray-500'>Loading your study materials...</p>
        </div>
      );
    }

    if (decks.length === 0)
      return <EmptyState onCreateDeck={handleCreateDeck} />;

    if (activeTab === 'categories') {
      return categories.map((category) => {
        <CategorySection
          key={category.id}
          category={category}
          decks={decks}
          categories={categories}
          onSelectDeck={handleSelectDeck}
          onCreateDeck={handleCreateDeck}
        />;
      });
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
            onClick={() => setActiveTab('categories')}
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
