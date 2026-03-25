import DatabaseLib from 'better-sqlite3';
import * as path from 'path';

export class Database {
  private db: unknown | null = null;
  private dbPath: string;

  constructor(userDataPath: string) {
    this.dbPath = path.join(userDataPath, 'vayva.db');
  }

  async initialize(): Promise<void> {
    try {
      this.db = new DatabaseLib(this.dbPath);
      
      // Enable WAL mode for better performance
      this.db.pragma('journal_mode = WAL');
      
      // Create tables if they don't exist
      this.createTables();
      
      console.warn('Database initialized at:', this.dbPath);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private createTables(): void {
    if (!this.db) return;

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Merchants table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS merchants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        business_name TEXT,
        industry TEXT,
        settings TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        merchant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        stock INTEGER DEFAULT 0,
        category TEXT,
        images TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
      )
    `);

    // Orders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        merchant_id TEXT NOT NULL,
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        items TEXT NOT NULL,
        payment_status TEXT DEFAULT 'unpaid',
        shipping_address TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
      )
    `);

    // Analytics cache table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_key TEXT NOT NULL,
        metric_value TEXT NOT NULL,
        period TEXT NOT NULL,
        calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(metric_key, period)
      )
    `);

    // Sync queue table (for when online)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        synced BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      )
    `);

    console.warn('Database tables created successfully');
  }

  execute(query: string, params?: unknown[]): unknown {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(query);
      if (params && params.length > 0) {
        return stmt.run(...params);
      }
      return stmt.run();
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  }

  query(query: string, params?: unknown[]): unknown[] {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(query);
      if (params && params.length > 0) {
        return stmt.all(...params);
      }
      return stmt.all();
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  transaction(queries: Array<{ sql: string; params?: unknown[] }>): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      this.db.transaction(() => {
        queries.forEach(({ sql, params }) => {
          this.execute(sql, params);
        });
      })();
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.warn('Database connection closed');
    }
  }
}

export default Database;
