/**
 * LuaVault Database Module
 * ========================
 * In-memory database backed by localStorage for persistence.
 * Designed for static environments (no server-side write access).
 */

const DB = {
  /* ---------- internal helpers ---------- */
  _key(collection) { return `luavault_${collection}`; },

  _load(collection) {
    const raw = localStorage.getItem(this._key(collection));
    return raw ? JSON.parse(raw) : null;
  },

  _save(collection, data) {
    localStorage.setItem(this._key(collection), JSON.stringify(data));
  },

  /* ---------- public API ---------- */

  /**
   * Fetch JSON from a file path and optionally seed localStorage.
   */
  async initFromFile(collection, filePath) {
    const saved = this._load(collection);
    if (saved) return saved;                 // already cached locally
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`Failed to load ${filePath}`);
    const data = await res.json();
    this._save(collection, data);
    return data;
  },

  /**
   * Seed localStorage with an in-memory array (useful after edits).
   */
  seed(collection, data) {
    this._save(collection, data);
  },

  /**
   * Get all items from a collection.
   */
  getAll(collection) {
    return this._load(collection) || [];
  },

  /**
   * Get single item by id.
   */
  getById(collection, id) {
    return this.getAll(collection).find(item => item.id === id) || null;
  },

  /**
   * Add a new item (auto-generates id if missing).
   */
  add(collection, item) {
    const items = this.getAll(collection);
    if (!item.id) {
      const prefix = collection === 'users' ? 'u' : 's';
      const maxId = items.reduce((max, i) => {
        const num = parseInt(String(i.id).replace(prefix, ''), 10);
        return num > max ? num : max;
      }, 0);
      item.id = `${prefix}${maxId + 1}`;
    }
    items.push(item);
    this._save(collection, items);
    return item;
  },

  /**
   * Update an existing item by id.
   */
  update(collection, id, changes) {
    const items = this.getAll(collection);
    const idx = items.findIndex(item => item.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...changes };
    this._save(collection, items);
    return items[idx];
  },

  /**
   * Delete an item by id.
   */
  delete(collection, id) {
    const items = this.getAll(collection);
    const filtered = items.filter(item => item.id !== id);
    this._save(collection, filtered);
    return filtered.length !== items.length;
  },

  /**
   * Reset collection to original JSON file data (clears localStorage cache).
   */
  async reset(collection, filePath) {
    localStorage.removeItem(this._key(collection));
    return this.initFromFile(collection, filePath);
  },

  /**
   * Search scripts by query string (name, game, author, category).
   */
  searchScripts(query) {
    const q = query.toLowerCase();
    return this.getAll('scripts').filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.game && s.game.toLowerCase().includes(q)) ||
      (s.author && s.author.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  },

  /**
   * Get scripts filtered by category.
   */
  filterByCategory(category) {
    return this.getAll('scripts').filter(s => s.category === category);
  }
};

export default DB;

