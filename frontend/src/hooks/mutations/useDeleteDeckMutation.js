import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDeck } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

/**
 * Deletes a deck using deckId
 * @param {*} deckId 
 * @returns 
 */
export const useDeleteDeckMutation = (deckId) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const isDeleting = useRef(false);

    return useMutation({
        mutationFn: async () => {
            // Synchronous check — much faster than isPending
            if (isDeleting.current) {
                console.log('[DELETE] Blocked duplicate request');
                throw new Error('Delete already in progress');
            }

            isDeleting.current = true;

            try {
                await deleteDeck(deckId);
            } finally {
                isDeleting.current = false;
            }
        
        },
        onSuccess: () => {
            console.log('[DELETE] onSuccess fired ← is this appearing?');
            queryClient.removeQueries({ queryKey: ['deck', deckId] });
            queryClient.removeQueries({ queryKey: ['flashcards', deckId]});
            navigate('/home'); // navigate first
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['decks'] });
            }, 0);
        },
        onError: (error) => {
            if (error.message === 'Delete already in progress') return;
            console.log('[DELETE] onError fired:', error.message, error.response?.status);
        }
    });
}