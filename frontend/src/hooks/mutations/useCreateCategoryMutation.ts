import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../../services/api';
import { CreateCategoryCommand, CreateCategoryResponse, ListAllCategoriesResponse } from '../../types';

/**
 * Mutation hook for creating a new category
 * @returns {UseMutationResult} React Query mutation with mutate, isPending, isError, error
 */
export const useCreateCategoryMutation = () : UseMutationResult<CreateCategoryResponse, Error, CreateCategoryCommand> => {
    const queryClient = useQueryClient();

    return useMutation<CreateCategoryResponse, Error, CreateCategoryCommand>({
        mutationFn: createCategory,
        onSuccess: (response: CreateCategoryResponse) => {
            const createdCategory = response.category;

            if (!createdCategory) return;

            queryClient.setQueryData<ListAllCategoriesResponse>(['categories'], (existing) => ({
                ...existing,
                categories: [
                    createdCategory,
                    ...(existing?.categories ?? []).filter((category) => category.id !== createdCategory.id),
                ],
            }));
        },
    });
};
