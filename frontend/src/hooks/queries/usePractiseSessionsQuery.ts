import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchPractiseSessions } from "../../services/api";
import { ListPractiseSessionsByDeckIdQueryResponse, PractiseSessionDto } from "../../types";

/**
 * Fetches practise session scores for a deck
 * @param {string} deckId - The ID of the deck
 * @returns {UseQueryResult} React Query result containing session scores
 */
export const usePractiseSessionsQuery = (deckId: string): UseQueryResult<PractiseSessionDto[] | null, Error> => {
    return useQuery<ListPractiseSessionsByDeckIdQueryResponse, Error, PractiseSessionDto[] | null>({
        queryKey: ['practiseSessions', deckId],
        queryFn: async (): Promise<ListPractiseSessionsByDeckIdQueryResponse> => await fetchPractiseSessions(deckId),
        select: (data: ListPractiseSessionsByDeckIdQueryResponse) => data.sessions ?? [],
        enabled: Boolean(deckId)
    });
}