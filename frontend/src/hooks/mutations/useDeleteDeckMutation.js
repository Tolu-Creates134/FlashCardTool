import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDeck } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { isInfrastructureError } from "../../utils/infraErrorHandler";

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
                queryClient.invalidateQueries({ queryKey: ['categories'] });
            }, 0);
        },
        onError: (error) => {
            if (isInfrastructureError(error)) {
                return;
            }
            throw error;
        }
    });
}
