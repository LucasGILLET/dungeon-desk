import { defineConfig } from 'orval';

const openApiUrl = 'http://localhost:3000/openapi.json';

export default defineConfig({
  dungeonDeskApi: {
    input: {
      target: openApiUrl,
    },
    output: {
      mode: 'split',
      target: './src/api/generated/endpoints.ts',
      schemas: './src/api/generated/model',
      client: 'vue-query',
      httpClient: 'fetch',
      clean: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: true,
        },
        mutator: {
          path: './src/api/mutator.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useInfinite: false,
          useInfiniteQueryParam: 'limit',
        },
      },
    },
  },
});
