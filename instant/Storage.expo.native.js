import { openDatabaseAsync } from 'expo-sqlite';

export default class Storage {
  constructor(dbName) {
    this.dbName = dbName;
    this._db = null;
    this._initPromise = null;
  }

  async _ensureInitialized() {
    if (!this._initPromise) {
      this._initPromise = this._initialize();
    }
    return this._initPromise;
  }

  async _initialize() {
    this._db = await openDatabaseAsync(this.dbName);
    await this._db.execAsync(
      'CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)'
    );
  }

  async getItem(k) {
    await this._ensureInitialized();
    const result = await this._db.getFirstAsync(
      'SELECT value FROM kv WHERE key = ?',
      [k]
    );
    return result ? result.value : null;
  }

  async setItem(k, v) {
    await this._ensureInitialized();
    await this._db.runAsync(
      'INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)',
      [k, v]
    );
  }
}