import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { createPractiseSession } from "../../services/api";
import { CreatePractiseSessionRequest, CreatePractiseSessionResponse } from "../../types";

interface CreatePractiseSessionVariables {
    deckId: string;
    sessionData: CreatePractiseSessionRequest;
}

/**
 * Mutation hook for creating a practise session
 * @returns {UseMutationResult} React Query mutation with mutate, isPending, isError, error
 */
export const useCreatePractiseSessionMutation = (): UseMutationResult<CreatePractiseSessionResponse, Error, {deckId: string, sessionData: CreatePractiseSessionRequest}>  => {
    const queryClient = useQueryClient();

    return useMutation<CreatePractiseSessionResponse, Error, CreatePractiseSessionVariables>({
        mutationFn: ({ deckId, sessionData }: CreatePractiseSessionVariables) => 
            createPractiseSession(deckId, sessionData),
        onSuccess: (_response: CreatePractiseSessionResponse , variables: CreatePractiseSessionVariables) => {
            queryClient.invalidateQueries({queryKey: ['practiseSessions', variables.deckId]});
        }
    });
}