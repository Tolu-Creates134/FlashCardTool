import React, { useMemo, useState } from 'react';
import EmptyState from '../../components/ui/EmptyState';
import CategorySection from './CategorySection';
import DeckGrid from './DeckGrid';
import { useNavigate } from 'react-router-dom';
import { useCategoriesQuery } from '../../hooks/queries/useCategoriesQuery';
import { useDecksQuery } from '../../hooks/queries/useDecksQuery';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import { useDeleteCategoryMutation } from '../../hooks/mutations/useDeleteCategoryMutation';

/**
 * Displays the home page content after user logs
 * @returns 
 */
const Home = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const navigate = useNavigate();

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

  const deleteCategoryMutation = useDeleteCategoryMutation()

  const loading = categoriesLoading || decksLoading;
  const error = categoriesError || decksError;

  const handleCreateDeck =  (categoryId) => {
    navigate(categoryId ? `/create-deck/${categoryId}` : '/create-deck');
  };

  const handleSelectDeck = async (deckId) => {
    navigate(`/decks/${deckId}`);
  };

  const handleRequestDeleteCategory = (category) => {
    setCategoryToDelete(category);
  }

  const handleCloseDeleteCategoryModal = () => {
    if (deleteCategoryMutation.isPending) return;
    setCategoryToDelete(null);
  }

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete || deleteCategoryMutation.isPending) return;

    deleteCategoryMutation.mutate(
      { 
        categoryId : categoryToDelete.id
      },
      {
        onSuccess: () => {
          setCategoryToDelete(null);
        }
      }
    );
  };

  const decksInCategory = useMemo(() => {
    if (!categoryToDelete) return [];

    return decks.filter((deck) => String(deck.categoryId) === String(categoryToDelete.id));

  }, [categoryToDelete, decks])

  const flashCardCount = useMemo(() => {
    return decksInCategory.reduce((total, deck) => {
      return total + (deck.flashCardCount ?? 0)
    }, 0);
  }, [decksInCategory]);

  const deleteModalContent = categoryToDelete ? (
    decksInCategory.length > 0 ? (
      <div className="space-y-4 text-center">
        <p className="text-sm leading-6 text-slate-600">
          Are you sure you want to delete{' '}
          <strong>{categoryToDelete.name}</strong>? This action is permanent and
          will remove everything inside this category.
        </p>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
            This will delete
          </p>
          <ul className="mt-3 space-y-2 text-sm text-red-900">
            <li>1 category</li>
            <li>
              {decksInCategory.length}{' '}
              {decksInCategory.length === 1 ? 'deck' : 'decks'}
            </li>
            <li>
              {flashCardCount}{' '}
              {flashCardCount === 1 ? 'flashcard' : 'flashcards'}
            </li>
          </ul>
        </div>

        <p className="text-sm text-slate-500">This cannot be undone.</p>
      </div>
    ) : (
      <div className="space-y-4 text-center">
        <p className="text-sm leading-6 text-slate-600">
          Are you sure you want to delete{' '}
          <strong>{categoryToDelete.name}</strong>?
        </p>
        <p className="text-sm text-slate-500">
          This category is empty, but deleting it is permanent.
        </p>
      </div>
    )
  ) : null;

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
      return <EmptyState onCreateDeck={handleCreateDeck}/>;
    }

    if (activeTab === 'categories') {
      return categories.map((category) => {
        const decksInCurrentCategory = decks.filter((deck) => String(deck.categoryId) === String(category.id))
        return(
          <CategorySection
            key={category.id}
            category={category}
            decks={decksInCurrentCategory}
            categories={categories}
            onSelectDeck={handleSelectDeck}
            onCreateDeck={handleCreateDeck}
            onDeleteCategory={handleRequestDeleteCategory}
          />
        )
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
      <ConfirmActionModal
        isOpen={Boolean(categoryToDelete)}
        title="Delete this category?"
        content={deleteModalContent}
        confirmText={
          deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete Category'
        }
        cancelText="Cancel"
        isConfirmDisabled={deleteCategoryMutation.isPending}
        isCancelDisabled={deleteCategoryMutation.isPending}
        onCancel={handleCloseDeleteCategoryModal}
        onConfirm={handleConfirmDeleteCategory}
      />

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
