import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../../services/api';
import { CategoryDto, CreateCategoryCommand, CreateCategoryResponse } from '../../types';

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

            queryClient.setQueryData<CategoryDto[]>(['categories'], (existingCategories = []) => [
                createdCategory,
                ...existingCategories.filter((category): category is CategoryDto  => category !== undefined && category.id !== createdCategory.id),
            ]);
        },
    });
};
