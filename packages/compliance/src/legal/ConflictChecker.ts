/**
 * Legal Conflict Checker with Fuzzy Matching
 * Detects potential conflicts of interest using advanced string matching algorithms
 */

import { logger } from '@vayva/shared';

export interface PartyRecord {
  id: string;
  name: string;
  type: 'CLIENT' | 'OPPOSING' | 'WITNESS' | 'THIRD_PARTY';
  relatedMatters: string[]; // Matter IDs
  aliases?: string[];
  metadata?: Record<string, any>;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  matches: ConflictMatch[];
  checkedAt: string;
}

export interface ConflictMatch {
  partyId: string;
  partyName: string;
  matchType: 'EXACT' | 'FUZZY' | 'ALIAS' | 'RELATED';
  similarity: number; // 0-1 score
  reason: string;
  matterId?: string;
}

export class ConflictChecker {
  private static readonly FUZZY_THRESHOLD = 0.85; // 85% similarity for fuzzy match
  private static readonly CONSIDERATION_THRESHOLD = 0.70; // 70% for manual review

  /**
   * Check for conflicts when adding a new client/matter
   */
  checkConflicts(
    newName: string,
    existingParties: PartyRecord[],
    currentMatterId?: string
  ): ConflictCheckResult {
    const matches: ConflictMatch[] = [];
    const normalizedName = this.normalizeString(newName);

    for (const party of existingParties) {
      // Skip if same matter (unless opposing party)
      if (currentMatterId && party.relatedMatters.includes(currentMatterId)) {
        if (party.type !== 'OPPOSING') {
          continue;
        }
      }

      // Check exact match
      if (this.isExactMatch(normalizedName, party.name)) {
        matches.push({
          partyId: party.id,
          partyName: party.name,
          matchType: 'EXACT',
          similarity: 1.0,
          reason: `Exact match with ${party.type.toLowerCase()}: ${party.name}`,
          matterId: party.relatedMatters[0],
        });
        continue;
      }

      // Check aliases
      if (party.aliases?.some(alias => this.isExactMatch(normalizedName, alias))) {
        matches.push({
          partyId: party.id,
          partyName: party.name,
          matchType: 'ALIAS',
          similarity: 0.95,
          reason: `Matches alias of ${party.type.toLowerCase()}: ${party.name}`,
          matterId: party.relatedMatters[0],
        });
        continue;
      }

      // Check fuzzy match
      const similarity = this.calculateSimilarity(normalizedName, this.normalizeString(party.name));
      
      if (similarity >= ConflictChecker.FUZZY_THRESHOLD) {
        matches.push({
          partyId: party.id,
          partyName: party.name,
          matchType: 'FUZZY',
          similarity,
          reason: `High similarity (${(similarity * 100).toFixed(1)}%) with ${party.type.toLowerCase()}: ${party.name}`,
          matterId: party.relatedMatters[0],
        });
      } else if (similarity >= ConflictChecker.CONSIDERATION_THRESHOLD) {
        matches.push({
          partyId: party.id,
          partyName: party.name,
          matchType: 'FUZZY',
          similarity,
          reason: `Possible match (${(similarity * 100).toFixed(1)}%) - manual review recommended`,
          matterId: party.relatedMatters[0],
        });
      }
    }

    // Sort by severity
    matches.sort((a, b) => b.similarity - a.similarity);

    return {
      hasConflict: matches.some(m => m.matchType === 'EXACT' || m.matchType === 'ALIAS' || m.similarity >= ConflictChecker.FUZZY_THRESHOLD),
      severity: this.determineSeverity(matches),
      matches,
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Check conflicts for multiple parties (e.g., case with multiple clients)
   */
  batchConflictCheck(
    parties: Array<{ name: string; type: string }>,
    existingParties: PartyRecord[],
    currentMatterId?: string
  ): ConflictCheckResult[] {
    return parties.map(party => 
      this.checkConflicts(party.name, existingParties, currentMatterId)
    );
  }

  /**
   * Normalize string for comparison
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Check for exact match after normalization
   */
  private isExactMatch(a: string, b: string): boolean {
    return a === b;
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate similarity score between two strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    return 1 - (distance / maxLength);
  }

  /**
   * Determine overall conflict severity
   */
  private determineSeverity(matches: ConflictMatch[]): 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' {
    if (matches.length === 0) return 'NONE';

    const hasExactOrAlias = matches.some(m => m.matchType === 'EXACT' || m.matchType === 'ALIAS');
    const hasHighFuzzy = matches.some(m => m.similarity >= 0.90);
    const hasMediumFuzzy = matches.some(m => m.similarity >= ConflictChecker.FUZZY_THRESHOLD);

    if (hasExactOrAlias) return 'HIGH';
    if (hasHighFuzzy) return 'HIGH';
    if (hasMediumFuzzy) return 'MEDIUM';
    
    return 'LOW';
  }

  /**
   * Generate conflict report for documentation
   */
  generateConflictReport(
    results: ConflictCheckResult[],
    matterId: string
  ): {
    matterId: string;
    generatedAt: string;
    totalChecks: number;
    conflictsFound: number;
    highSeverityCount: number;
    summary: string;
  } {
    const conflictsFound = results.filter(r => r.hasConflict).length;
    const highSeverity = results.filter(r => r.severity === 'HIGH').length;

    let summary = '';
    if (highSeverity > 0) {
      summary = `CRITICAL: ${highSeverity} high-severity conflict(s) detected. Immediate review required.`;
    } else if (conflictsFound > 0) {
      summary = `${conflictsFound} potential conflict(s) found. Manual review recommended.`;
    } else {
      summary = 'No conflicts detected. Matter cleared for representation.';
    }

    return {
      matterId,
      generatedAt: new Date().toISOString(),
      totalChecks: results.length,
      conflictsFound,
      highSeverityCount: highSeverity,
      summary,
    };
  }
}

// Convenience function for quick checks
export function checkConflicts(
  newName: string,
  existingParties: PartyRecord[],
  currentMatterId?: string
): ConflictCheckResult {
  const checker = new ConflictChecker();
  return checker.checkConflicts(newName, existingParties, currentMatterId);
}
