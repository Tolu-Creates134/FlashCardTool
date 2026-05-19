import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDeck } from "../../services/api";

/**
 * Mutation hook for updating an existing deck and its flashcards
 * @returns {UseMutationResult} React Query mutation with mutate, isPending, isError, error
 */
export const useUpdateDeckMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ deckId, deckData }) => updateDeck(deckId, deckData),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['decks'] });
            queryClient.invalidateQueries({ queryKey: ['deck', variables.deckId] });
            queryClient.invalidateQueries({ queryKey: ['flashcards', variables.deckId] });
        }
    });
};