import { createSearchParamsCache, parseAsString } from "nuqs/server";
// Note: import from 'nuqs/server' to avoid the "use client" directive

const searchParamsCache = createSearchParamsCache({
  // List your search param keys and associated parsers here:
  category: parseAsString.withDefault(""),
  keyword: parseAsString.withDefault(""),
  writer: parseAsString.withDefault(""),
});

export default searchParamsCache;
