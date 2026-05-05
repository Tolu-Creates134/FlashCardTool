import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDeck } from "../../services/api";

/**
 * Deletes a deck using deckId
 * @param {*} deckId 
 * @returns 
 */
export const useDeleteDeckMutation = (deckId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await deleteDeck(deckId)
        },
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['deck', deckId] });
            queryClient.removeQueries({ queryKey: ['flashcards', deckId]});
            queryClient.invalidateQueries({ queryKey: ['decks'] });
        }
    });
}