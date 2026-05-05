import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPractiseSession } from "../../services/api";

/**
 * Mutation hook for creating a practise session
 * @returns {UseMutationResult} React Query mutation with mutate, isPending, isError, error
 */
export const useCreatePractiseSessionMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ deckId, sessionData}) => 
            createPractiseSession(deckId, sessionData),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({queryKey: ['practiseSessions', variables.deckId]});
        }
    });
}