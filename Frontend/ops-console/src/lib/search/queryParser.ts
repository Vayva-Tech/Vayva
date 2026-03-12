/**
 * Advanced Search Query Language Parser
 * 
 * Syntax:
 * - Field filters: `field:value` or `field:"value with spaces"`
 * - Comparison operators: `gmv>1000`, `created<2024-01-01`, `orders>=50`
 * - Range operators: `gmv:1000..5000`, `created:2024-01-01..2024-12-31`
 * - Boolean logic: `plan:pro AND kyc:pending`, `risk:flagged OR status:suspended`
 * - Negation: `-plan:free` or `NOT plan:free`
 * - Wildcards: `name:contains(store)`, `email:endswith(@gmail.com)`
 */

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startswith' | 'endswith' | 'range' | 'exists';
  value: string | number | boolean | [string | number, string | number];
  negate?: boolean;
}

export interface SearchQuery {
  raw: string;
  textQuery?: string;
  filters: SearchFilter[];
  logic: 'AND' | 'OR';
  valid: boolean;
  errors?: string[];
}

const VALID_FIELDS = [
  // Merchant fields
  'name', 'slug', 'email', 'owner', 'ownerName', 'ownerEmail',
  'plan', 'status', 'kyc', 'kycStatus', 'risk', 'riskFlags',
  'gmv', 'gmv30d', 'orders', 'orderCount', 'created', 'createdAt',
  'lastActive', 'activeAt', 'location', 'trial', 'trialEndsAt',
  'verified', 'isLive', 'industry', 'industrySlug',
  // Comparison aliases
  'revenue', 'sales', 'id'
] as const;

type ValidField = typeof VALID_FIELDS[number];

const FIELD_ALIASES: Record<string, ValidField> = {
  'kyc': 'kycStatus',
  'risk': 'riskFlags',
  'gmv': 'gmv30d',
  'revenue': 'gmv30d',
  'sales': 'orders',
  'orderCount': 'orders',
  'created': 'createdAt',
  'active': 'lastActive',
  'activeAt': 'lastActive',
  'owner': 'ownerEmail',
  'email': 'ownerEmail',
  'industry': 'industrySlug',
  'verified': 'kycStatus',
  'live': 'isLive'
};

const OPERATOR_MAP: Record<string, SearchFilter['operator']> = {
  ':': 'eq',
  '=': 'eq',
  '!=': 'neq',
  '<>': 'neq',
  '>': 'gt',
  '>=': 'gte',
  '<': 'lt',
  '<=': 'lte',
  '~': 'contains',
  '^': 'startswith',
  '$': 'endswith',
  '..': 'range'
};

export function parseSearchQuery(raw: string): SearchQuery {
  const query: SearchQuery = {
    raw,
    filters: [],
    logic: 'AND',
    valid: true
  };

  if (!raw.trim()) {
    return query;
  }

  const errors: string[] = [];
  
  // Extract quoted strings to preserve them
  const quotedStrings: string[] = [];
  const processedRaw = raw.replace(/"([^"]*)"/g, (match, content) => {
    quotedStrings.push(content);
    return `__QUOTED_${quotedStrings.length - 1}__`;
  });

  // Detect logic mode (default is AND)
  if (/\bOR\b/i.test(processedRaw) && !/\bAND\b/i.test(processedRaw)) {
    query.logic = 'OR';
  }

  // Split by AND/OR but preserve the groups
  const groups = processedRaw.split(/\s+(?:AND|OR)\s+/i).filter(Boolean);
  
  for (const group of groups) {
    const filters = parseFilterGroup(group, quotedStrings, errors);
    query.filters.push(...filters);
  }

  // Extract any remaining text query (non-filter text)
  const textParts: string[] = [];
  const filterPattern = /[\w]+[:=<>!~^$]+/;
  const parts = processedRaw.split(/\s+/);
  
  for (const part of parts) {
    if (!filterPattern.test(part) && !/^__(?:QUOTED|RANGE)_\d+__$/.test(part)) {
      textParts.push(restoreQuotedStrings(part, quotedStrings));
    }
  }
  
  if (textParts.length > 0) {
    query.textQuery = textParts.join(' ').trim();
  }

  if (errors.length > 0) {
    query.valid = false;
    query.errors = errors;
  }

  return query;
}

function parseFilterGroup(
  group: string,
  quotedStrings: string[],
  errors: string[]
): SearchFilter[] {
  const filters: SearchFilter[] = [];
  
  // Match patterns: field:value, field>value, field>=value, field:range, -field:value, etc.
  const filterRegex = /(-)?(\w+)\s*(:|=|!=|<>|>=|<=|>|<|\.\.)\s*([^\s]+)/g;
  
  let match;
  while ((match = filterRegex.exec(group)) !== null) {
    const [, negateRaw, fieldRaw, operatorRaw, valueRaw] = match;
    
    // Check for negation via -prefix or NOT
    let negate = !!negateRaw;
    
    // Normalize field name
    const normalizedField = FIELD_ALIASES[fieldRaw] || fieldRaw;
    
    if (!VALID_FIELDS.includes(normalizedField as ValidField)) {
      errors.push(`Unknown field: ${fieldRaw}`);
      continue;
    }
    
    // Restore quoted strings
    let value = restoreQuotedStrings(valueRaw, quotedStrings);
    
    // Handle negation in value (NOT value)
    if (value.toUpperCase().startsWith('NOT ')) {
      negate = !negate;
      value = value.slice(4).trim();
    }
    
    // Parse operator and value
    let operator = OPERATOR_MAP[operatorRaw] || 'eq';
    let parsedValue: SearchFilter['value'] = value;
    
    // Handle range operator (..)
    if (value.includes('..')) {
      operator = 'range';
      const [start, end] = value.split('..');
      const startVal = parseValue(restoreQuotedStrings(start, quotedStrings));
      const endVal = parseValue(restoreQuotedStrings(end, quotedStrings));
      parsedValue = [startVal, endVal] as [string | number, string | number];
    } else if (['gt', 'gte', 'lt', 'lte'].includes(operator)) {
      // Parse numeric values for comparison operators
      parsedValue = parseValue(value);
    } else if (['contains', 'startswith', 'endswith'].includes(operator)) {
      // Keep as string for wildcard operators
      parsedValue = value;
    } else if (operator === 'eq') {
      // Try to parse as boolean or number for equality
      parsedValue = parseValue(value);
    }
    
    filters.push({
      field: normalizedField,
      operator,
      value: parsedValue,
      negate
    });
  }
  
  return filters;
}

function restoreQuotedStrings(str: string, quotedStrings: string[]): string {
  return str.replace(/__QUOTED_(\d+)__/g, (match, index) => {
    return quotedStrings[parseInt(index)] || '';
  });
}

function parseValue(value: string): string | number | boolean {
  // Try boolean
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  // Try null/undefined
  if (value.toLowerCase() === 'null' || value.toLowerCase() === 'none') {
    return 'null';
  }
  
  // Try date (ISO format)
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value; // Keep as string for dates
  }
  
  // Try number
  if (/^-?\d+\.?\d*$/.test(value)) {
    return parseFloat(value);
  }
  
  // Return as string
  return value;
}

/**
 * Build URL search params from parsed query
 */
export function buildSearchParams(query: SearchQuery): URLSearchParams {
  const params = new URLSearchParams();
  
  if (query.textQuery) {
    params.set('q', query.textQuery);
  }
  
  for (const filter of query.filters) {
    const key = filter.negate ? `-${filter.field}` : filter.field;
    
    switch (filter.operator) {
      case 'eq':
        params.set(key, String(filter.value));
        break;
      case 'neq':
        params.set(`${key}__neq`, String(filter.value));
        break;
      case 'gt':
        params.set(`${key}__gt`, String(filter.value));
        break;
      case 'gte':
        params.set(`${key}__gte`, String(filter.value));
        break;
      case 'lt':
        params.set(`${key}__lt`, String(filter.value));
        break;
      case 'lte':
        params.set(`${key}__lte`, String(filter.value));
        break;
      case 'contains':
        params.set(`${key}__contains`, String(filter.value));
        break;
      case 'startswith':
        params.set(`${key}__startswith`, String(filter.value));
        break;
      case 'endswith':
        params.set(`${key}__endswith`, String(filter.value));
        break;
      case 'range': {
        const [start, end] = filter.value as [string | number, string | number];
        params.set(`${key}__gte`, String(start));
        params.set(`${key}__lte`, String(end));
        break;
      }
    }
  }
  
  return params;
}

/**
 * Format a filter for display
 */
export function formatFilter(filter: SearchFilter): string {
  const neg = filter.negate ? '-' : '';
  const field = filter.field;
  
  switch (filter.operator) {
    case 'eq':
      return `${neg}${field}:${filter.value}`;
    case 'neq':
      return `${neg}${field}!=${filter.value}`;
    case 'gt':
      return `${neg}${field}>${filter.value}`;
    case 'gte':
      return `${neg}${field}>=${filter.value}`;
    case 'lt':
      return `${neg}${field}<${filter.value}`;
    case 'lte':
      return `${neg}${field}<=${filter.value}`;
    case 'contains':
      return `${neg}${field}~${filter.value}`;
    case 'startswith':
      return `${neg}${field}^${filter.value}`;
    case 'endswith':
      return `${neg}${field}$${filter.value}`;
    case 'range': {
      const [start, end] = filter.value as [string | number, string | number];
      return `${neg}${field}:${start}..${end}`;
    }
    default:
      return `${neg}${field}:${filter.value}`;
  }
}

/**
 * Get search suggestions based on partial input
 */
export function getSearchSuggestions(partial: string): string[] {
  const suggestions: string[] = [];
  
  // Field suggestions
  const fieldMatches = VALID_FIELDS.filter(f => 
    f.toLowerCase().startsWith(partial.toLowerCase())
  );
  suggestions.push(...fieldMatches.map(f => `${f}:`));
  
  // Common value suggestions for certain fields
  if (partial.toLowerCase().startsWith('plan:')) {
    suggestions.push('plan:FREE', 'plan:STARTER', 'plan:PRO');
  }
  if (partial.toLowerCase().startsWith('kyc:') || partial.toLowerCase().startsWith('kycStatus:')) {
    suggestions.push('kyc:APPROVED', 'kyc:PENDING', 'kyc:REJECTED', 'kyc:NOT_SUBMITTED');
  }
  if (partial.toLowerCase().startsWith('risk:')) {
    suggestions.push('risk:flagged', 'risk:clean');
  }
  if (partial.toLowerCase().includes('gmv') && partial.includes('>')) {
    suggestions.push('gmv>100000', 'gmv>500000', 'gmv>1000000');
  }
  
  // Operator suggestions
  if (/^\w+$/.test(partial) && !partial.includes(':')) {
    suggestions.push(`${partial}:`, `${partial}>`, `${partial}<`);
  }
  
  return [...new Set(suggestions)];
}
