/**
 * Simple Embedding & Similarity Search
 * TF-IDF based text similarity - no vector database needed
 * Completely free, runs locally
 */

export interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface SimilarityResult {
  productId: string;
  similarity: number;
}

export class SimpleEmbedding {
  private documentVectors: Map<string, Map<string, number>> = new Map();
  private idf: Map<string, number> = new Map();
  private documents: Map<string, Document> = new Map();

  /**
   * Index documents for similarity search
   */
  index(documents: Document[]): void {
    this.documents.clear();
    this.documentVectors.clear();
    this.idf.clear();

    // Store documents
    for (const doc of documents) {
      this.documents.set(doc.id, doc);
    }

    // Calculate document frequency for each term
    const docFrequency: Map<string, number> = new Map();
    const totalDocs = documents.length;

    for (const doc of documents) {
      const terms = this.extractTerms(doc);
      const uniqueTerms = new Set(terms);
      
      for (const term of uniqueTerms) {
        const count = docFrequency.get(term) || 0;
        docFrequency.set(term, count + 1);
      }
    }

    // Calculate IDF
    for (const [term, freq] of docFrequency) {
      const idf = Math.log(totalDocs / (freq + 1)) + 1;
      this.idf.set(term, idf);
    }

    // Build TF-IDF vectors
    for (const doc of documents) {
      const vector = this.computeTfIdf(doc);
      this.documentVectors.set(doc.id, vector);
    }
  }

  /**
   * Find similar documents
   */
  findSimilar(
    documentId: string,
    documents: Document[],
    limit: number = 5
  ): SimilarityResult[] {
    // Ensure documents are indexed
    if (this.documents.size === 0 || !this.documents.has(documentId)) {
      this.index(documents);
    }

    const targetVector = this.documentVectors.get(documentId);
    if (!targetVector) return [];

    const similarities: SimilarityResult[] = [];

    for (const [id, vector] of this.documentVectors) {
      if (id === documentId) continue;

      const similarity = this.cosineSimilarity(targetVector, vector);
      if (similarity > 0.05) { // Minimum threshold
        similarities.push({ productId: id, similarity });
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Search documents by query
   */
  search(
    query: string,
    limit: number = 5
  ): SimilarityResult[] {
    if (this.documents.size === 0) return [];

    // Create a pseudo-document from query
    const queryDoc: Document = {
      id: "__query__",
      title: query,
      description: query,
      category: "",
    };

    const queryVector = this.computeTfIdf(queryDoc);
    const similarities: SimilarityResult[] = [];

    for (const [id, vector] of this.documentVectors) {
      const similarity = this.cosineSimilarity(queryVector, vector);
      if (similarity > 0.01) {
        similarities.push({ productId: id, similarity });
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Find similar products by text
   */
  findSimilarByText(
    text: string,
    documents: Document[],
    limit: number = 5
  ): SimilarityResult[] {
    this.index(documents);
    return this.search(text, limit);
  }

  /**
   * Semantic similarity between two texts
   */
  textSimilarity(text1: string, text2: string): number {
    const doc1: Document = {
      id: "__temp1__",
      title: text1,
      description: text1,
      category: "",
    };
    const doc2: Document = {
      id: "__temp2__",
      title: text2,
      description: text2,
      category: "",
    };

    // Build temporary index with just these two
    const tempEmbedding = new SimpleEmbedding();
    tempEmbedding.index([doc1, doc2]);

    const vec1 = tempEmbedding.documentVectors.get("__temp1__");
    const vec2 = tempEmbedding.documentVectors.get("__temp2__");

    if (!vec1 || !vec2) return 0;
    return this.cosineSimilarity(vec1, vec2);
  }

  /**
   * Extract and weight terms from document
   */
  private extractTerms(doc: Document): string[] {
    const terms: string[] = [];

    // Title terms (higher weight)
    const titleTerms = this.tokenize(doc.title);
    for (let i = 0; i < 3; i++) {
      terms.push(...titleTerms);
    }

    // Description terms
    terms.push(...this.tokenize(doc.description));

    // Category terms (medium weight)
    const categoryTerms = this.tokenize(doc.category);
    for (let i = 0; i < 2; i++) {
      terms.push(...categoryTerms);
    }

    return terms;
  }

  /**
   * Compute TF-IDF vector for a document
   */
  private computeTfIdf(doc: Document): Map<string, number> {
    const terms = this.extractTerms(doc);
    const termFreq: Map<string, number> = new Map();

    // Count term frequencies
    for (const term of terms) {
      const count = termFreq.get(term) || 0;
      termFreq.set(term, count + 1);
    }

    // Normalize by document length (TF)
    const totalTerms = terms.length;
    const vector: Map<string, number> = new Map();

    for (const [term, freq] of termFreq) {
      const tf = freq / totalTerms;
      const idf = this.idf.get(term) || 1;
      vector.set(term, tf * idf);
    }

    return vector;
  }

  /**
   * Tokenize text into terms
   */
  private tokenize(text: string): string[] {
    if (!text) return [];

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(term => term.length > 2) // Filter short words
      .filter(term => !this.isStopWord(term));
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      "the", "and", "for", "are", "but", "not", "you", "all", "can",
      "had", "her", "was", "one", "our", "out", "day", "get", "has",
      "him", "his", "how", "its", "may", "new", "now", "old", "see",
      "two", "who", "boy", "did", "she", "use", "her", "way", "many",
      "oil", "sit", "set", "run", "eat", "far", "sea", "eye", "ago",
      "off", "too", "any", "say", "man", "try", "ask", "end", "why",
      "let", "put", "say", "she", "try", "way", "own", "say", "too",
      "old", "tell", "very", "when", "much", "would", "there", "their",
      "what", "said", "each", "which", "will", "about", "could", "other",
      "after", "first", "never", "these", "think", "where", "being",
      "every", "great", "might", "shall", "still", "those", "while",
      "this", "that", "with", "have", "from", "they", "know", "want",
      "been", "good", "much", "some", "time", "very", "when", "come",
      "here", "just", "like", "long", "make", "many", "over", "such",
      "take", "than", "them", "well", "were",
    ]);

    return stopWords.has(word);
  }

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(
    vec1: Map<string, number>,
    vec2: Map<string, number>
  ): number {
    const terms = new Set([...vec1.keys(), ...vec2.keys()]);

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const term of terms) {
      const val1 = vec1.get(term) || 0;
      const val2 = vec2.get(term) || 0;

      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Get keywords from text
   */
  extractKeywords(text: string, topN: number = 5): string[] {
    const terms = this.tokenize(text);
    const freq: Map<string, number> = new Map();

    for (const term of terms) {
      const count = freq.get(term) || 0;
      freq.set(term, count + 1);
    }

    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([term]) => term);
  }

  /**
   * Cluster similar documents
   */
  cluster(documents: Document[], numClusters: number = 3): Map<string, string[]> {
    this.index(documents);

    const clusters: Map<string, string[]> = new Map();
    const assigned: Set<string> = new Set();

    // Simple greedy clustering
    const docIds = Array.from(this.documents.keys());
    let clusterId = 0;

    for (const docId of docIds) {
      if (assigned.has(docId)) continue;

      const cluster: string[] = [docId];
      assigned.add(docId);

      const docVector = this.documentVectors.get(docId);
      if (!docVector) continue;

      for (const otherId of docIds) {
        if (assigned.has(otherId) || otherId === docId) continue;

        const otherVector = this.documentVectors.get(otherId);
        if (!otherVector) continue;

        const similarity = this.cosineSimilarity(docVector, otherVector);
        if (similarity > 0.5) {
          cluster.push(otherId);
          assigned.add(otherId);
        }
      }

      clusters.set(`cluster_${clusterId}`, cluster);
      clusterId++;

      if (clusterId >= numClusters) break;
    }

    return clusters;
  }
}
