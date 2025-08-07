/**
 * Local storage wrapper with JSON serialization
 */
export class Storage {
  constructor(prefix = 'toons_') {
    this.prefix = prefix;
  }

  save(key, data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.prefix + key, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);
      return false;
    }
  }

  load(key) {
    try {
      const serialized = localStorage.getItem(this.prefix + key);
      return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return null;
    }
  }

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }

  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }

  exists(key) {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  // List all stored items with this prefix
  list() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.substring(this.prefix.length));
  }
}
