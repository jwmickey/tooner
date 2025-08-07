/**
 * Base asset class for all comic strip components
 */
export class Asset {
  constructor(data = {}) {
    this.id = data.id || `asset-${Date.now()}`;
    this.type = data.type || 'unknown';
    this.position = data.position || { x: 0, y: 0 };
    this.scale = data.scale || { x: 1, y: 1 };
    this.rotation = data.rotation || 0;
    this.zIndex = data.zIndex || 0;
    this.visible = data.visible !== undefined ? data.visible : true;
    this.locked = data.locked || false;
    this.opacity = data.opacity !== undefined ? data.opacity : 1;
    this.metadata = data.metadata || {};
  }

  // Transform methods
  setPosition(x, y) {
    this.position = { x, y };
  }

  setScale(x, y = x) {
    this.scale = { x, y };
  }

  setRotation(angle) {
    this.rotation = angle;
  }

  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  // Visibility methods
  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  toggleVisibility() {
    this.visible = !this.visible;
  }

  // Lock methods
  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  toggleLock() {
    this.locked = !this.locked;
  }

  // Z-index methods
  bringToFront() {
    // This will be handled by the parent container
    return 'bring-to-front';
  }

  sendToBack() {
    // This will be handled by the parent container
    return 'send-to-back';
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      zIndex: this.zIndex,
      visible: this.visible,
      locked: this.locked,
      opacity: this.opacity,
      metadata: this.metadata
    };
  }

  // Factory method for creating specific asset types
  static fromJSON(data) {
    // This will be overridden by specific asset types
    return new Asset(data);
  }

  // Abstract method to be implemented by subclasses
  render(fabricCanvas) {
    throw new Error('render() method must be implemented by subclass');
  }

  // Abstract method to update Fabric.js object
  updateFabricObject(fabricObject) {
    if (fabricObject) {
      fabricObject.set({
        left: this.position.x,
        top: this.position.y,
        scaleX: this.scale.x,
        scaleY: this.scale.y,
        angle: this.rotation,
        opacity: this.opacity,
        visible: this.visible,
        selectable: !this.locked,
        evented: !this.locked
      });
    }
  }

  // Update asset from Fabric.js object
  updateFromFabricObject(fabricObject) {
    if (fabricObject) {
      this.position = { x: fabricObject.left, y: fabricObject.top };
      this.scale = { x: fabricObject.scaleX, y: fabricObject.scaleY };
      this.rotation = fabricObject.angle;
      this.opacity = fabricObject.opacity;
    }
  }
}
