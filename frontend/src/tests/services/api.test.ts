import { beforeEach, expect, jest, test } from '@jest/globals';
import api, { createCategory, createDeck } from '../../services/api';

jest.mock('axios', () => {
  const { jest } = require('@jest/globals');
  return {
    __esModule: true,
    default: {
      create: () => ({
        post: jest.fn(),
        interceptors: { response: { use: jest.fn() } },
      }),
    },
  };
});

const post = jest.mocked(api.post);

beforeEach(() => {
  post.mockReset();
});

test('creates a category with exactly one request wrapper and preserves the response', async () => {
  const command = { category: { name: 'Biology' } };
  const response = { category: { id: 'category-1', name: 'Biology' } };
  post.mockResolvedValueOnce({ data: response });

  await expect(createCategory(command)).resolves.toEqual(response);
  expect(post).toHaveBeenCalledWith('/categories', command);
});

test('creates a deck with exactly one request wrapper', async () => {
  const command = {
    deck: {
      name: 'Cells',
      categoryId: 'category-1',
      flashCards: [{ question: 'Question', answer: 'Answer' }],
    },
  };
  const response = { id: 'deck-1', deck: command.deck };
  post.mockResolvedValueOnce({ data: response });

  await expect(createDeck(command)).resolves.toEqual(response);
  expect(post).toHaveBeenCalledWith('/decks', command);
});
