import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {  fetchDecks } from '../../services/api';
import { DeckSummaryDto, ListAllDecksResponse } from '../../types';

/**
 * Retrieves all decks
 * @returns {UseQueryResult<DeckSummaryDto[] | null>}
 */
export const useDecksQuery = (): UseQueryResult<DeckSummaryDto[] | null, Error> => {
    return useQuery<ListAllDecksResponse, Error, DeckSummaryDto[] | null>({
        queryKey: ['decks'],
        queryFn: async (): Promise<ListAllDecksResponse> => await fetchDecks(),
        select: (data: ListAllDecksResponse) => data.decks ?? null
    });
}