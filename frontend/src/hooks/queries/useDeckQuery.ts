import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchDeckById } from "../../services/api";
import { DeckDto, GetDeckByIdResponse } from "../../types";

/**
 * Fetch individual deck by id
 * @param {*} deckId 
 * @returns {GetDeckByIdResponse}
 */
export const useDeckQuery = (deckId: string | undefined): UseQueryResult<DeckDto | null, Error> => {
    return useQuery<GetDeckByIdResponse, Error, DeckDto | null>({
        queryKey: ['deck', deckId],
        queryFn: async (): Promise<GetDeckByIdResponse> => {
            if(!deckId){
                throw new Error('A deck ID is required')
            }

            return await fetchDeckById(deckId);
        },
        select: (data: GetDeckByIdResponse): DeckDto | null => data.deck ?? null,
        enabled: Boolean(deckId)
    })
}