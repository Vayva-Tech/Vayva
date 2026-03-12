export interface ParsedQuery {
  terms: string[];
  filters: Record<string, string>;
}

export function parseQuery(query: string): ParsedQuery {
  return {
    terms: query.split(/s+/).filter(Boolean),
    filters: {},
  };
}