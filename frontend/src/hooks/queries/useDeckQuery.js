import { useQuery } from "@tanstack/react-query";
import { fetchDeckById } from "../../services/api";

/**
 * Fetch individual deck by id
 * @param {*} deckId 
 * @returns 
 */
export const useDeckQuery = (deckId) => {
    return useQuery({
        queryKey: ['deck', deckId],
        queryFn: async () => {
            const data = await fetchDeckById(deckId);
            return data?.deck ?? null;
        },
        enabled: Boolean(deckId)
    })
}