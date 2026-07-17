import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDeck } from "../../services/api";
import { useNavigate } from "react-router-dom";

/**
 * Deletes a deck using deckId
 * @param {*} deckId 
 * @returns 
 */
export const useDeleteDeckMutation = (deckId) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async () => {
           await deleteDeck(deckId);
        },
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['deck', deckId] });
            queryClient.removeQueries({ queryKey: ['flashcards', deckId]});
            navigate('/home'); // navigate first
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['decks'] });
            }, 0);
        },
        onError: (error) => {
            if (error.response?.status === 404) return; // already handled in api.js
            console.log('[DELETE] onError fired:', error.message);
        }
    });
}