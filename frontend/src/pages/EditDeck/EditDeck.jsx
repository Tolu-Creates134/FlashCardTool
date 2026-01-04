import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchCategories,
  fetchDeckById,
  fetchFlashcardsByDeckId,
} from '../../services/api';

const EditDeck = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [editingCardId, setEditingCardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deckRes, flashRes, categoriesRes] = await Promise.all([
          fetchDeckById(deckId),
          fetchFlashcardsByDeckId(deckId),
          fetchCategories(),
        ]);
        const deck = deckRes.deck;
        console.log();
        setDeckName(deck.name);
        setDeckDescription(deck.description);
        setSelectedCategoryId(deck.categoryId || categoriesRes?.[0]?.id || '');
        setFlashcards(flashRes.flashCards || flashRes || []);
      } catch (error) {
        setError('Unable to load deck for editing');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [deckId]);

  return <div>EditDeck</div>;
};

export default EditDeck;
