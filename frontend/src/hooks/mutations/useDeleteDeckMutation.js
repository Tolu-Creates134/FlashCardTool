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
            await deleteDeck(deckId)
        },
        onSuccess: () => {
            navigate('/home'); // navigate first
            queryClient.removeQueries({ queryKey: ['deck', deckId] });
            queryClient.removeQueries({ queryKey: ['flashcards', deckId]});
            queryClient.invalidateQueries({ queryKey: ['decks'] });
        }
    });
}