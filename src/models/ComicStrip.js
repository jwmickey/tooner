/**
 * Comic strip data model
 */
export class ComicStrip {
  constructor(data = {}) {
    this.id = data.id || Date.now();
    this.title = data.title || 'Untitled Comic Strip';
    this.author = data.author || '';
    this.description = data.description || '';
    this.date = data.date || new Date().toISOString();
    this.cells = data.cells || this.createDefaultCells();
    this.metadata = data.metadata || {};
  }

  createDefaultCells(count = 5) {
    return Array(count).fill(null).map((_, index) => ({
      id: `cell-${Date.now()}-${index}`,
      assets: [],
      background: { type: 'solid', color: '#ffffff' },
      order: index
    }));
  }

  addCell(position = -1) {
    const newCell = {
      id: `cell-${Date.now()}`,
      assets: [],
      background: { type: 'solid', color: '#ffffff' },
      order: position === -1 ? this.cells.length : position
    };

    if (position === -1) {
      this.cells.push(newCell);
    } else {
      this.cells.splice(position, 0, newCell);
      // Update order for subsequent cells
      this.cells.forEach((cell, index) => {
        cell.order = index;
      });
    }

    return newCell;
  }

  removeCell(cellId) {
    const index = this.cells.findIndex(cell => cell.id === cellId);
    if (index !== -1) {
      this.cells.splice(index, 1);
      // Update order for remaining cells
      this.cells.forEach((cell, idx) => {
        cell.order = idx;
      });
      return true;
    }
    return false;
  }

  getCell(cellId) {
    return this.cells.find(cell => cell.id === cellId);
  }

  updateCellBackground(cellId, background) {
    const cell = this.getCell(cellId);
    if (cell) {
      cell.background = { ...cell.background, ...background };
      return true;
    }
    return false;
  }

  addAssetToCell(cellId, asset) {
    const cell = this.getCell(cellId);
    if (cell) {
      asset.id = asset.id || `asset-${Date.now()}`;
      cell.assets.push(asset);
      return asset;
    }
    return null;
  }

  removeAssetFromCell(cellId, assetId) {
    const cell = this.getCell(cellId);
    if (cell) {
      const index = cell.assets.findIndex(asset => asset.id === assetId);
      if (index !== -1) {
        cell.assets.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  updateAssetInCell(cellId, assetId, updates) {
    const cell = this.getCell(cellId);
    if (cell) {
      const asset = cell.assets.find(a => a.id === assetId);
      if (asset) {
        Object.assign(asset, updates);
        return asset;
      }
    }
    return null;
  }

  // Serialize for storage/export
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      description: this.description,
      date: this.date,
      cells: this.cells,
      metadata: this.metadata
    };
  }

  // Create from stored data
  static fromJSON(data) {
    return new ComicStrip(data);
  }
}
