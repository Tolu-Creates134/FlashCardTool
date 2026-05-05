import { useQuery } from '@tanstack/react-query';
import {  fetchDecks } from '../../services/api';

/**
 * Retrieves all decks
 * @returns 
 */
export const useDecksQuery = () => {
    return useQuery({
        queryKey: ['decks'],
        queryFn: async () => {
            const data = await fetchDecks();
            return Array.isArray(data) ? data : data?.decks ?? []
        }
    });
}