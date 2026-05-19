import { useQuery } from "@tanstack/react-query";
import { fetchFlashcardsByDeckId } from "../../services/api";

/**
 * Returns flashcards for specific deckId
 * @param {*} deckId 
 * @returns 
 */
export const useFlashcardsQuery = (deckId) => {
    return useQuery({
        queryKey: ['flashcards', deckId],
        queryFn: async () => {
            const data = await fetchFlashcardsByDeckId(deckId);
            return data?.flashCards || data || [];
        },
        enabled: Boolean(deckId)
    })
}