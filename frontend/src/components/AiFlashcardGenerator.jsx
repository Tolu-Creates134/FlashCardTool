import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Trash2, Upload } from 'lucide-react';
import { generateFlashcardsPreview } from '../services/api';
import { generateUniqueId } from '../utils/helpers';
import AIProgressBar from './ui/AIProgressBar';
import ConfirmActionModal from './ui/ConfirmActionModal';

const normalizeGeneratedCards = (responseData) => {
  const cards = responseData?.flashCards || responseData?.FlashCards || [];

  return cards
    .filter((card) => card?.question || card?.Question || card?.answer || card?.Answer)
    .map((card) => ({
      id: generateUniqueId(),
      question: card.question || card.Question || '',
      answer: card.answer || card.Answer || '',
    }));
};

/**
 * Embedded AI flashcard draft generator and review panel
 * @param {*} param0
 * @returns
 */
const AiFlashcardGenerator = ({ onApprove, existingCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [targetCardCount, setTargetCardCount] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('Generating your flashcards...');
  const [generatedCards, setGeneratedCards] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [sourceSummary, setSourceSummary] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cardToDelete, setCardToDelete] = useState(null);
  const progressIntervalRef = useRef(null);

  const hasDraft = generatedCards.length > 0;

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const resetDraft = () => {
    setGeneratedCards([]);
    setWarnings([]);
    setSourceSummary('');
    setError('');
  };

  const handleToggle = () => {
    if (isOpen && hasDraft) {
      const shouldClose = window.confirm('Hide this AI draft for now? Your generated cards will still be available when you reopen it.');
      if (!shouldClose) return;
    }

    setIsOpen((prev) => !prev);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const startProgressSimulation = () => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }

    setGenerationProgress(0);

    progressIntervalRef.current = window.setInterval(() => {
      setGenerationProgress((currentProgress) => {
        if (currentProgress >= 80) {
          return currentProgress;
        }

        const increment = currentProgress < 35 ? 9 : currentProgress < 60 ? 5 : 2;
        return Math.min(currentProgress + increment, 80);
      });
    }, 160);
  };

  const stopProgressSimulation = () => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleGenerate = async () => {
    if (!sourceText.trim() && !selectedFile) {
      setError('Paste source text or choose a file before generating flashcards.');
      return;
    }

    const trimmedCount = targetCardCount.trim();
    if (trimmedCount) {
      const numericCount = Number(trimmedCount);
      if (!Number.isInteger(numericCount) || numericCount < 1 || numericCount > 50) {
        setError('Target card count must be a whole number between 1 and 50.');
        return;
      }
    }

    if (hasDraft) {
      const shouldReplace = window.confirm('Generate a new draft? This will replace the cards currently in review.');
      if (!shouldReplace) return;
    }

    const formData = new FormData();
    if (sourceText.trim()) formData.append('text', sourceText.trim());
    if (selectedFile) formData.append('file', selectedFile);
    if (instructions.trim()) formData.append('instructions', instructions.trim());
    if (trimmedCount) formData.append('targetCardCount', trimmedCount);

    setIsGenerating(true);
    setGenerationComplete(false);
    setGenerationMessage('Generating your flashcards...');
    startProgressSimulation();
    setError('');
    setNotice('');

    try {
      const response = await generateFlashcardsPreview(formData);
      const nextCards = normalizeGeneratedCards(response);

      if (nextCards.length === 0) {
        setError('No flashcards were generated. Try more source text or different instructions.');
        resetDraft();
        stopProgressSimulation();
        setIsGenerating(false);
        setGenerationProgress(0);
        return;
      }

      stopProgressSimulation();
      setGenerationProgress(100);
      setGenerationComplete(true);
      setGenerationMessage('Flashcards successfully generated!');
      setGeneratedCards(nextCards);
      setWarnings(response?.warnings || response?.Warnings || []);
      setSourceSummary(response?.sourceSummary || response?.SourceSummary || '');
      setIsOpen(true);
      setNotice(`Flashcards successfully generated! Review ${nextCards.length} draft card${nextCards.length === 1 ? '' : 's'} below.`);
      await new Promise((resolve) => window.setTimeout(resolve, 700));
    } catch (requestError) {
      stopProgressSimulation();
      setGenerationProgress(0);
      setGenerationComplete(false);
      setIsGenerating(false);
      return;
    }

    setGenerationComplete(false);
    setIsGenerating(false);
  };

  const handleCardChange = (id, key, value) => {
    setGeneratedCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, [key]: value } : card))
    );
  };

  const handleRemoveCard = (id) => {
    setGeneratedCards((prev) => prev.filter((card) => card.id !== id));
  };

  const handleDiscardDraft = () => {
    const shouldDiscard = window.confirm('Discard this AI draft? The generated cards will be removed from review.');
    if (!shouldDiscard) return;

    resetDraft();
    setNotice('');
  };

  const handleApprove = () => {
    const approvedCards = generatedCards.map((card) => ({
      question: card.question.trim(),
      answer: card.answer.trim(),
    })).filter((card) => card.question && card.answer);

    if (approvedCards.length === 0) {
      setError('Keep at least one generated card with both a question and answer before approving.');
      return;
    }

    onApprove(approvedCards);
    resetDraft();
    setNotice(`${approvedCards.length} AI flashcard${approvedCards.length === 1 ? '' : 's'} added to this deck draft.`);
    setIsOpen(false);
  };

  return (
    <>
      <AIProgressBar
        isVisible={isGenerating}
        progress={generationProgress}
        message={generationMessage}
        isComplete={generationComplete}
      />
      <ConfirmActionModal
        isOpen={Boolean(cardToDelete)}
        title="Delete this AI draft card?"
        message="Are you sure you want to remove this generated flashcard from the review draft?"
        confirmText="Delete Card"
        onCancel={() => setCardToDelete(null)}
        onConfirm={() => {
          handleRemoveCard(cardToDelete);
          setCardToDelete(null);
        }}
      />

      <div className={`border border-indigo-100 rounded-lg bg-indigo-50/60 p-4 mb-6 transition-opacity ${isGenerating ? 'pointer-events-none opacity-60' : 'opacity-100'}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles size={18} />
            <h3 className="text-base font-semibold">Generate Flashcards with AI</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Create draft cards from pasted text or a file, review them, then merge them into the deck before saving.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="px-4 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100"
        >
          {isOpen ? 'Hide AI Draft' : hasDraft ? 'Resume AI Draft' : 'Open AI Generator'}
        </button>
      </div>

      {notice && (
        <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          {notice}
        </p>
      )}

      {isOpen && (
        <div className="mt-4 border-t border-indigo-100 pt-4">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Text
              </label>
              <textarea
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Paste notes, lecture content, or source material here"
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Upload
              </label>
              <label className="flex items-center justify-between gap-3 p-3 border border-dashed border-gray-300 rounded-md bg-white cursor-pointer hover:border-indigo-300">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Upload size={16} />
                  {selectedFile ? selectedFile.name : 'Choose a PDF or image'}
                </span>
                <span className="text-sm font-medium text-indigo-700">Browse</span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Text input is the most reliable option right now. Some file types may still return a backend not implemented error.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional: focus on definitions, make answers shorter, emphasize key formulas"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Card Count
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={targetCardCount}
                onChange={(event) => setTargetCardCount(event.target.value)}
                className="w-full md:w-48 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={existingCount > 0 ? `Current deck has ${existingCount} cards` : 'Optional'}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-md text-white ${
                isGenerating
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Generate Draft Cards
            </button>

            {hasDraft && (
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-4 py-2 rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                Discard Draft
              </button>
            )}
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          {hasDraft && (
            <div className="mt-5 rounded-lg bg-white border border-gray-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h4 className="text-base font-semibold text-gray-800">Review AI Draft</h4>
                  <p className="text-sm text-gray-600">
                    Edit or remove generated cards, then approve the ones you want to add.
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {generatedCards.length} card{generatedCards.length === 1 ? '' : 's'} ready for review
                </p>
              </div>

              {sourceSummary && (
                <p className="text-sm text-gray-600 mb-3">{sourceSummary}</p>
              )}

              {warnings.length > 0 && (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-800">Generation notes</p>
                  <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
                    {warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                {generatedCards.map((card, index) => (
                  <div key={card.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Draft Card {index + 1}
                        </p>
                        <input
                          type="text"
                          value={card.question}
                          onChange={(event) => handleCardChange(card.id, 'question', event.target.value)}
                          className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                          placeholder="Question"
                        />
                        <textarea
                          value={card.answer}
                          onChange={(event) => handleCardChange(card.id, 'answer', event.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Answer"
                          rows={2}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setCardToDelete(card.id)}
                        className="text-sm text-red-600 hover:text-red-700 flex items-center"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={generatedCards.length === 0}
                  className={`px-4 py-2 rounded-md ${
                    generatedCards.length === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Approve and Add to Deck
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
};

export default AiFlashcardGenerator;
