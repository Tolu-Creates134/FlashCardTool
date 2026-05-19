import { useQuery } from "@tanstack/react-query";
import { fetchPractiseSessions } from "../../services/api";

/**
 * Fetches practise session scores for a deck
 * @param {string} deckId - The ID of the deck
 * @returns {UseQueryResult} React Query result containing session scores
 */
export const usePractiseSessionsQuery = (deckId) => {
    return useQuery({
        queryKey: ['practiseSessions', deckId],
        queryFn: async () => {
            const data = await fetchPractiseSessions(deckId);
            return data?.sessions ?? [];
        },
        enabled: Boolean(deckId)
    });
}