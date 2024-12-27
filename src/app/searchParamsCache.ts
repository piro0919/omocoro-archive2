import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
// Note: import from 'nuqs/server' to avoid the "use client" directive

const searchParamsCache = createSearchParamsCache({
  // List your search param keys and associated parsers here:
  category: parseAsString.withDefault(""),
  keyword: parseAsString.withDefault(""),
  order: parseAsStringLiteral(["asc", "desc"]).withDefault("desc"),
  writer: parseAsString.withDefault(""),
});

export default searchParamsCache;
