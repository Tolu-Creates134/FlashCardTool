import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchFlashcardsByDeckId } from "../../services/api";
import { FlashCardDto, ListFlashCardsByDeckIdResponse } from "../../types";

/**
 * Returns flashcards for specific deckId
 * @param {*} deckId 
 * @returns 
 */
export const useFlashcardsQuery = (deckId: string | undefined): UseQueryResult<FlashCardDto[] | null, Error> => {
    return useQuery<ListFlashCardsByDeckIdResponse, Error, FlashCardDto[]|null>({
        queryKey: ['flashcards', deckId],
        queryFn: async (): Promise<ListFlashCardsByDeckIdResponse> => {
            if (!deckId) throw new Error('A deck ID is required');
            return fetchFlashcardsByDeckId(deckId);
        },
        select: (data: ListFlashCardsByDeckIdResponse): FlashCardDto[] | null => data.flashCards ?? null,
        enabled: Boolean(deckId)
    })
}