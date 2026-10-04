import { expect, jest, test } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createCategory } from '../../../services/api';
import { useCreateCategoryMutation } from '../../../hooks/mutations/useCreateCategoryMutation';
import { useCategoriesQuery } from '../../../hooks/queries/useCategoriesQuery';

jest.mock('../../../services/api', () => {
  const { jest } = require('@jest/globals');
  return { createCategory: jest.fn(), fetchCategories: jest.fn() };
});

test.each([undefined, null, []])('adds a category when the cached list is %s', async (categories) => {
  const client = new QueryClient({ defaultOptions: { queries: { enabled: false }, mutations: { retry: false } } });
  client.setQueryData(['categories'], { categories });
  const created = { id: 'category-1', name: 'Biology' };
  jest.mocked(createCategory).mockResolvedValueOnce({ category: created });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result, unmount } = renderHook(() => useCreateCategoryMutation(), { wrapper });

  await act(async () => {
    await result.current.mutateAsync({ category: { name: 'Biology' } });
  });

  expect(client.getQueryData(['categories'])).toEqual({ categories: [created] });
  unmount();
  client.clear();
});

test('preserves the response wrapper and exposes the new category through select without duplicates', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { enabled: false }, mutations: { retry: false } } });
  const existing = { id: 'category-2', name: 'Chemistry' };
  const created = { id: 'category-1', name: 'Biology' };
  client.setQueryData(['categories'], { categories: [existing, created] });
  jest.mocked(createCategory).mockResolvedValueOnce({ category: created });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result: mutationResult, unmount: unmountMutation } = renderHook(() => useCreateCategoryMutation(), { wrapper });

  await act(async () => {
    await mutationResult.current.mutateAsync({ category: { name: 'Biology' } });
  });

  const { result: queryResult, unmount: unmountQuery } = renderHook(() => useCategoriesQuery(), { wrapper });
  expect(queryResult.current.data).toEqual([created, existing]);
  expect(client.getQueryData(['categories'])).toEqual({ categories: [created, existing] });
  unmountQuery();
  unmountMutation();
  client.clear();
});
