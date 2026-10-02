# Frontend tests

Keep frontend tests here, grouped by the area they exercise:

```text
src/tests/
  hooks/
    mutations/
      useCreateCategoryMutation.test.tsx
    queries/
  services/
    api.test.ts
```

Add other areas, such as `pages`, `components`, and `utils`, as tests are added.
Name test files after the module they cover, using `.test.ts` or `.test.tsx`
when the test contains JSX. Import production code from its existing location.
Tests involving a mutation and its effects on a query cache belong under
`hooks/mutations`; tests of query fetching and selection belong under `hooks/queries`.
The queries folder is reserved for future query-specific tests.

This folder lives inside `src` so the existing Create React App test runner
discovers the tests and TypeScript includes them without configuration changes.

Run all tests once:

```sh
npm test -- --watchAll=false --runInBand --watchman=false
```

Run just the mutation tests:

```sh
npm test -- --watchAll=false --runInBand --watchman=false src/tests/hooks/mutations
```
