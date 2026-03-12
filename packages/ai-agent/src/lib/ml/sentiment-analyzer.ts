/**
 * Free Sentiment Analyzer
 * Uses lexicon-based approach - no API calls, no costs
 * Based on AFINN-165 word list (open source)
 */

// Simplified AFINN-like sentiment lexicon (positive words)
const POSITIVE_WORDS = new Set([
  "good", "great", "excellent", "amazing", "awesome", "fantastic", "wonderful",
  "love", "like", "happy", "pleased", "satisfied", "perfect", "best", "beautiful",
  "nice", "cool", "brilliant", "outstanding", "superb", "magnificent", "lovely",
  "enjoy", "recommend", "impressed", "quality", "smooth", "easy", "fast",
  "quick", "helpful", "friendly", "professional", "trustworthy", "reliable",
  "affordable", "worth", "value", "clean", "fresh", "delicious", "tasty",
  "comfortable", "convenient", "effective", "efficient", "useful", "helpful",
  "grateful", "thankful", "appreciate", "excited", "joy", "fun", "pleasant",
  "positive", "optimistic", "confident", "successful", "win", "winning",
  "top", "premium", "luxury", "elegant", "stylish", "modern", "innovative"
]);

// Simplified negative words
const NEGATIVE_WORDS = new Set([
  "bad", "terrible", "awful", "horrible", "worst", "hate", "dislike", "angry",
  "disappointed", "unsatisfied", "poor", "cheap", "broken", "damaged", "defective",
  "slow", "late", "delayed", "wrong", "error", "problem", "issue", "complaint",
  "fail", "failure", "failed", "useless", "waste", "difficult", "hard", "complicated",
  "confusing", "frustrated", "annoying", "rude", "unprofessional", "unreliable",
  "expensive", "overpriced", "scam", "fraud", "fake", "dirty", "messy", "ugly",
  "uncomfortable", "inconvenient", "ineffective", "inefficient", "worthless",
  "regret", "sad", "upset", "worried", "concerned", "negative", "pessimistic",
  "doubt", "uncertain", "risky", "dangerous", "unsafe", "unhappy", "pain",
  "suffer", "struggle", "avoid", "never", "not", "no", "none", "nothing"
]);

// Intensifiers multiply sentiment score
const INTENSIFIERS = new Map([
  ["very", 1.5],
  ["extremely", 2.0],
  ["really", 1.5],
  ["quite", 1.3],
  ["pretty", 1.2],
  ["somewhat", 0.8],
  ["slightly", 0.6],
  ["barely", 0.4],
  ["hardly", 0.4],
  ["totally", 1.8],
  ["absolutely", 1.8],
  ["completely", 1.6],
  ["highly", 1.5],
  ["super", 1.5],
  ["ultra", 1.7],
  ["mega", 1.6],
]);

// Negations flip sentiment
const NEGATIONS = new Set([
  "not", "no", "never", "neither", "nor", "none", "nothing", "nobody",
  "nowhere", "hardly", "scarcely", "barely", "doesnt", "dont", "didnt",
  "wasnt", "werent", "hasnt", "havent", "hadnt", "cant", "cannot",
  "couldnt", "wont", "wouldnt", "isnt", "arent", "aint"
]);

export interface SentimentResult {
  score: number; // -1 to 1
  label: "positive" | "negative" | "neutral";
  confidence: number;
}

export class SentimentAnalyzer {
  /**
   * Analyze sentiment of text
   * Returns score from -1 (very negative) to 1 (very positive)
   */
  analyze(text: string): SentimentResult {
    if (!text || text.trim().length === 0) {
      return { score: 0, label: "neutral", confidence: 1 };
    }

    const tokens = this.tokenize(text.toLowerCase());
    let score = 0;
    let wordCount = 0;
    let sentimentWordCount = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      wordCount++;

      // Check if it's a sentiment word
      let wordScore = 0;
      if (POSITIVE_WORDS.has(token)) {
        wordScore = 1;
        sentimentWordCount++;
      } else if (NEGATIVE_WORDS.has(token)) {
        wordScore = -1;
        sentimentWordCount++;
      }

      if (wordScore !== 0) {
        // Check for intensifier before this word (up to 2 words back)
        let multiplier = 1;
        for (let j = Math.max(0, i - 2); j < i; j++) {
          const intensifier = INTENSIFIERS.get(tokens[j]);
          if (intensifier) {
            multiplier = intensifier;
            break;
          }
        }

        // Check for negation (up to 3 words back)
        let isNegated = false;
        for (let j = Math.max(0, i - 3); j < i; j++) {
          if (NEGATIONS.has(tokens[j])) {
            isNegated = true;
            break;
          }
        }

        // Apply negation and intensifier
        let finalScore = wordScore * multiplier;
        if (isNegated) {
          finalScore *= -0.5; // Negation flips but dampens the sentiment
        }

        score += finalScore;
      }
    }

    // Normalize score to -1 to 1 range
    const normalizedScore = wordCount > 0 
      ? Math.max(-1, Math.min(1, score / Math.max(sentimentWordCount, 1)))
      : 0;

    // Determine label
    let label: "positive" | "negative" | "neutral";
    if (normalizedScore > 0.1) {
      label = "positive";
    } else if (normalizedScore < -0.1) {
      label = "negative";
    } else {
      label = "neutral";
    }

    // Calculate confidence based on sentiment word density
    const confidence = sentimentWordCount > 0
      ? Math.min(1, 0.5 + (sentimentWordCount / wordCount))
      : 0.5;

    return {
      score: normalizedScore,
      label,
      confidence,
    };
  }

  /**
   * Batch analyze multiple texts
   */
  analyzeBatch(texts: string[]): SentimentResult[] {
    return texts.map(text => this.analyze(text));
  }

  /**
   * Get sentiment trend over time
   */
  analyzeTrend(sentiments: SentimentResult[]): {
    average: number;
    trend: "improving" | "declining" | "stable";
    volatility: number;
  } {
    if (sentiments.length === 0) {
      return { average: 0, trend: "stable", volatility: 0 };
    }

    const scores = sentiments.map(s => s.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Calculate trend using first half vs second half
    const mid = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, mid);
    const secondHalf = scores.slice(mid);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length || 0;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length || 0;
    
    const diff = secondAvg - firstAvg;
    let trend: "improving" | "declining" | "stable";
    if (diff > 0.1) trend = "improving";
    else if (diff < -0.1) trend = "declining";
    else trend = "stable";

    // Calculate volatility (standard deviation)
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - average, 2), 0) / scores.length;
    const volatility = Math.sqrt(variance);

    return { average, trend, volatility };
  }

  private tokenize(text: string): string[] {
    // Simple tokenization: remove punctuation and split by whitespace
    return text
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 0);
  }
}
