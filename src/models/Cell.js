/**
 * Individual comic strip cell model
 */
export class Cell {
  constructor(data = {}) {
    this.id = data.id || `cell-${Date.now()}`;
    this.assets = data.assets || [];
    this.background = data.background || { type: 'solid', color: '#ffffff' };
    this.order = data.order || 0;
    this.dimensions = data.dimensions || { width: 200, height: 200 };
  }

  addAsset(asset) {
    asset.id = asset.id || `asset-${Date.now()}`;
    asset.zIndex = asset.zIndex || this.assets.length;
    this.assets.push(asset);
    return asset;
  }

  removeAsset(assetId) {
    const index = this.assets.findIndex(asset => asset.id === assetId);
    if (index !== -1) {
      this.assets.splice(index, 1);
      // Reorder z-indexes
      this.assets.forEach((asset, idx) => {
        asset.zIndex = idx;
      });
      return true;
    }
    return false;
  }

  getAsset(assetId) {
    return this.assets.find(asset => asset.id === assetId);
  }

  updateAsset(assetId, updates) {
    const asset = this.getAsset(assetId);
    if (asset) {
      Object.assign(asset, updates);
      return asset;
    }
    return null;
  }

  moveAssetToFront(assetId) {
    const asset = this.getAsset(assetId);
    if (asset) {
      const maxZ = Math.max(...this.assets.map(a => a.zIndex));
      asset.zIndex = maxZ + 1;
      return true;
    }
    return false;
  }

  moveAssetToBack(assetId) {
    const asset = this.getAsset(assetId);
    if (asset) {
      const minZ = Math.min(...this.assets.map(a => a.zIndex));
      asset.zIndex = minZ - 1;
      return true;
    }
    return false;
  }

  setBackground(background) {
    this.background = { ...this.background, ...background };
  }

  // Get assets sorted by z-index for rendering
  getSortedAssets() {
    return [...this.assets].sort((a, b) => a.zIndex - b.zIndex);
  }

  toJSON() {
    return {
      id: this.id,
      assets: this.assets,
      background: this.background,
      order: this.order,
      dimensions: this.dimensions
    };
  }

  static fromJSON(data) {
    return new Cell(data);
  }
}
