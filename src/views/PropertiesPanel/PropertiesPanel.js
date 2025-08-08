/**
 * Properties panel for editing selected assets
 */
export class PropertiesPanel {
  constructor({ container, eventBus }) {
    this.container = container;
    this.eventBus = eventBus;
    this.selectedAsset = null;
    this.selectedObject = null;
    this.editMode = false;
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="properties-panel${this.editMode ? ' visible' : ''}" id="properties-panel">
        <h3>Properties
          <button class="property-close" title="Close">×</button>
        </h3>
        <div id="properties-content">
          ${this.editMode ? '' : '<div class="no-selection"><p>Select an asset to edit its properties</p></div>'}
        </div>
      </div>
    `;
    this.addStyles();
  }

  addStyles() {
    if (!document.getElementById('properties-panel-styles')) {
      const style = document.createElement('style');
      style.id = 'properties-panel-styles';
      style.textContent = `
        .properties-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 340px;
          max-width: 100vw;
          height: 100vh;
          background: #f7f7f9 !important;
          box-shadow: -2px 0 8px rgba(0,0,0,0.08);
          z-index: 100;
          padding: 16px;
          overflow-y: auto;
          display: none;
        }
        .properties-panel.visible {
          display: block;
        }
        .property-close {
          float: right;
          font-size: 22px;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          margin-left: 12px;
        }

        .properties-panel h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: #333;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 8px;
        }

        .no-selection {
          text-align: center;
          color: #666;
          font-style: italic;
          margin-top: 40px;
        }

        .property-group {
          margin-bottom: 24px;
        }

        .property-group h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .property-item {
          margin-bottom: 12px;
        }

        .property-item label {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .property-item input,
        .property-item select,
        .property-item textarea {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .property-item input:focus,
        .property-item select:focus,
        .property-item textarea:focus {
          border-color: #007acc;
          box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
        }

        .property-item input[type="range"] {
          padding: 0;
        }

        .property-item input[type="color"] {
          height: 32px;
          padding: 2px;
        }

        .property-item textarea {
          resize: vertical;
          min-height: 60px;
        }

        .property-row {
          display: flex;
          gap: 8px;
        }

        .property-row .property-item {
          flex: 1;
        }

        .property-button {
          width: 100%;
          padding: 8px 12px;
          background: #007acc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .property-button:hover {
          background: #005a9e;
        }

        .property-button.secondary {
          background: #6c757d;
        }

        .property-button.secondary:hover {
          background: #545b62;
        }

        .property-button.danger {
          background: #dc3545;
        }

        .property-button.danger:hover {
          background: #c82333;
        }

        @media (max-width: 768px) {
          .properties-panel {
            padding: 12px;
          }

          .property-row {
            flex-direction: column;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupEventListeners() {
    // Listen for double-click edit mode
    this.eventBus.on('object:editRequested', (objects) => {
      if (objects && objects.length > 0) {
        this.editMode = true;
        this.selectAsset(objects[0]);
      }
    });

    // Listen for asset selection (single click)
    this.eventBus.on('object:selected', (objects) => {
      if (!this.editMode && objects && objects.length > 0) {
        this.selectAsset(objects[0]);
      }
    });

    this.eventBus.on('object:deselected', () => {
      this.deselectAsset();
    });

    // Listen for property changes
    this.container.addEventListener('input', (e) => {
      if (e.target.classList.contains('property-input')) {
        this.handlePropertyChange(e.target);
      }
    });

    this.container.addEventListener('change', (e) => {
      if (e.target.classList.contains('property-input')) {
        this.handlePropertyChange(e.target);
      }
    });

    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('property-button')) {
        this.handleButtonClick(e.target);
      }
      if (e.target.classList.contains('property-close')) {
        this.editMode = false;
        this.deselectAsset();
      }
    });
  }

  selectAsset(fabricObject) {
    this.selectedObject = fabricObject;
    this.selectedAsset = fabricObject.assetData;
    if (this.selectedAsset && this.editMode) {
      this.renderProperties();
      this.showPanel();
    } else {
      this.hidePanel();
    }
  }

  deselectAsset() {
    this.selectedObject = null;
    this.selectedAsset = null;
    this.editMode = false;
    this.render();
    this.hidePanel();
  }

  renderProperties() {
    const content = this.container.querySelector('#properties-content');
    if (!this.selectedAsset || !this.editMode) {
      content.innerHTML = '<div class="no-selection"><p>Select an asset to edit its properties</p></div>';
      this.hidePanel();
      return;
    }

    // Ensure all required properties exist with defaults
    if (!this.selectedAsset.position) this.selectedAsset.position = { x: 0, y: 0 };
    if (!this.selectedAsset.scale) this.selectedAsset.scale = { x: 1, y: 1 };
    if (this.selectedAsset.rotation === undefined) this.selectedAsset.rotation = 0;
    if (this.selectedAsset.opacity === undefined) this.selectedAsset.opacity = 1;

    let propertiesHTML = '';

    // Common properties for all assets
    propertiesHTML += `
      <div class="property-group">
        <h4>Transform</h4>
        <div class="property-row">
          <div class="property-item">
            <label>X Position</label>
            <input type="number" class="property-input" data-property="position.x" value="${Math.round(this.selectedAsset.position.x)}">
          </div>
          <div class="property-item">
            <label>Y Position</label>
            <input type="number" class="property-input" data-property="position.y" value="${Math.round(this.selectedAsset.position.y)}">
          </div>
        </div>
        <div class="property-row">
          <div class="property-item">
            <label>Scale X</label>
            <input type="range" class="property-input" data-property="scale.x" min="0.1" max="3" step="0.1" value="${this.selectedAsset.scale.x}">
          </div>
          <div class="property-item">
            <label>Scale Y</label>
            <input type="range" class="property-input" data-property="scale.y" min="0.1" max="3" step="0.1" value="${this.selectedAsset.scale.y}">
          </div>
        </div>
        <div class="property-item">
          <label>Rotation</label>
          <input type="range" class="property-input" data-property="rotation" min="0" max="360" value="${this.selectedAsset.rotation}">
        </div>
        <div class="property-item">
          <label>Opacity</label>
          <input type="range" class="property-input" data-property="opacity" min="0" max="1" step="0.1" value="${this.selectedAsset.opacity}">
        </div>
      </div>
    `;

    // Asset-specific properties
    switch (this.selectedAsset.type) {
      case 'speechBubble':
        propertiesHTML += this.renderSpeechBubbleProperties();
        break;
      case 'actionShape':
        propertiesHTML += this.renderActionShapeProperties();
        break;
      case 'character':
        propertiesHTML += this.renderCharacterProperties();
        break;
    }

    // Asset management buttons
    propertiesHTML += `
      <div class="property-group">
        <h4>Actions</h4>
        <button class="property-button" data-action="bring-to-front">Bring to Front</button>
        <button class="property-button secondary" data-action="send-to-back">Send to Back</button>
        <button class="property-button danger" data-action="delete">Delete Asset</button>
      </div>
    `;

    content.innerHTML = propertiesHTML;
  }

  renderSpeechBubbleProperties() {
    return `
      <div class="property-group">
        <h4>Speech Bubble</h4>
        <div class="property-item">
          <label>Text</label>
          <textarea class="property-input" data-property="text">${this.selectedAsset.text || ''}</textarea>
        </div>
        <div class="property-item">
          <label>Bubble Style</label>
          <select class="property-input" data-property="bubbleStyle">
            <option value="speech" ${this.selectedAsset.bubbleStyle === 'speech' ? 'selected' : ''}>Speech</option>
            <option value="thought" ${this.selectedAsset.bubbleStyle === 'thought' ? 'selected' : ''}>Thought</option>
            <option value="shout" ${this.selectedAsset.bubbleStyle === 'shout' ? 'selected' : ''}>Shout</option>
          </select>
        </div>
        <div class="property-row">
          <div class="property-item">
            <label>Font Size</label>
            <input type="range" class="property-input" data-property="fontSize" min="8" max="32" value="${this.selectedAsset.fontSize || 14}">
          </div>
          <div class="property-item">
            <label>Text Color</label>
            <input type="color" class="property-input" data-property="textColor" value="${this.selectedAsset.textColor || '#000000'}">
          </div>
        </div>
        <div class="property-row">
          <div class="property-item">
            <label>Bubble Color</label>
            <input type="color" class="property-input" data-property="bubbleColor" value="${this.selectedAsset.bubbleColor || '#ffffff'}">
          </div>
          <div class="property-item">
            <label>Border Color</label>
            <input type="color" class="property-input" data-property="borderColor" value="${this.selectedAsset.borderColor || '#000000'}">
          </div>
        </div>
      </div>
    `;
  }

  renderActionShapeProperties() {
    return `
      <div class="property-group">
        <h4>Action Shape</h4>
        <div class="property-item">
          <label>Text</label>
          <input type="text" class="property-input" data-property="text" value="${this.selectedAsset.text || ''}">
        </div>
        <div class="property-item">
          <label>Shape Style</label>
          <select class="property-input" data-property="shapeStyle">
            <option value="burst" ${this.selectedAsset.shapeStyle === 'burst' ? 'selected' : ''}>Burst</option>
            <option value="jagged" ${this.selectedAsset.shapeStyle === 'jagged' ? 'selected' : ''}>Jagged</option>
            <option value="cloud" ${this.selectedAsset.shapeStyle === 'cloud' ? 'selected' : ''}>Cloud</option>
            <option value="simple" ${this.selectedAsset.shapeStyle === 'simple' ? 'selected' : ''}>Simple</option>
          </select>
        </div>
        <div class="property-row">
          <div class="property-item">
            <label>Font Size</label>
            <input type="range" class="property-input" data-property="fontSize" min="12" max="48" value="${this.selectedAsset.fontSize || 28}">
          </div>
          <div class="property-item">
            <label>Text Color</label>
            <input type="color" class="property-input" data-property="textColor" value="${this.selectedAsset.textColor || '#ffffff'}">
          </div>
        </div>
        <div class="property-item">
          <label>Background Color</label>
          <input type="color" class="property-input" data-property="backgroundColor" value="${this.selectedAsset.backgroundColor || '#ff4444'}">
        </div>
      </div>
    `;
  }

  renderCharacterProperties() {
    return `
      <div class="property-group">
        <h4>Character</h4>
        <div class="property-item">
          <label>Character Type</label>
          <select class="property-input" data-property="characterType">
            <option value="simple" ${this.selectedAsset.characterType === 'simple' ? 'selected' : ''}>Simple</option>
            <option value="human" ${this.selectedAsset.characterType === 'human' ? 'selected' : ''}>Human</option>
            <option value="animal" ${this.selectedAsset.characterType === 'animal' ? 'selected' : ''}>Animal</option>
          </select>
        </div>
        <div class="property-item">
          <label>Expression</label>
          <select class="property-input" data-property="expression">
            <option value="neutral" ${this.selectedAsset.expression === 'neutral' ? 'selected' : ''}>Neutral</option>
            <option value="happy" ${this.selectedAsset.expression === 'happy' ? 'selected' : ''}>Happy</option>
            <option value="sad" ${this.selectedAsset.expression === 'sad' ? 'selected' : ''}>Sad</option>
            <option value="angry" ${this.selectedAsset.expression === 'angry' ? 'selected' : ''}>Angry</option>
            <option value="surprised" ${this.selectedAsset.expression === 'surprised' ? 'selected' : ''}>Surprised</option>
          </select>
        </div>
        <div class="property-row">
          <div class="property-item">
            <label>Skin Color</label>
            <input type="color" class="property-input" data-property="skinColor" value="${this.selectedAsset.skinColor || '#fdbcb4'}">
          </div>
          <div class="property-item">
            <label>Hair Color</label>
            <input type="color" class="property-input" data-property="hairColor" value="${this.selectedAsset.hairColor || '#8b4513'}">
          </div>
        </div>
      </div>
    `;
  }

  handlePropertyChange(input) {
    if (!this.selectedAsset || !this.selectedObject) return;

    const property = input.dataset.property;
    let value;
    if (input.type === 'number' || input.type === 'range') {
      value = parseFloat(input.value);
    } else {
      value = input.value;
    }

    // Update the asset data
    this.setNestedProperty(this.selectedAsset, property, value);

    // Update the Fabric.js object and canvas immediately
    this.updateFabricObject(property, value);

    // Emit change event for saving
    this.eventBus.emit('asset:propertyChanged', {
      assetId: this.selectedAsset.id,
      property: property,
      value: value
    });
  }

  handleButtonClick(button) {
    const action = button.dataset.action;

    switch (action) {
      case 'bring-to-front':
        this.selectedObject.bringToFront();
        this.eventBus.emit('canvas:renderAll');
        break;
      case 'send-to-back':
        this.selectedObject.sendToBack();
        this.eventBus.emit('canvas:renderAll');
        break;
      case 'delete':
        this.eventBus.emit('asset:delete', {
          assetId: this.selectedAsset.id,
          cellId: this.selectedObject.cellId
        });
        this.deselectAsset();
        break;
    }
  }

  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  updateFabricObject() {
    if (!this.selectedObject || !this.selectedAsset) return;

    // Always update transform properties
    // If the object knows its cell origin, position is relative to that
    const cellOffset = this.selectedObject.cellOffset || { x: 0, y: 0 };
    this.selectedObject.set({
      left: cellOffset.x + (this.selectedAsset.position.x || 0),
      top: cellOffset.y + (this.selectedAsset.position.y || 0),
      scaleX: this.selectedAsset.scale.x,
      scaleY: this.selectedAsset.scale.y,
      angle: this.selectedAsset.rotation,
      opacity: this.selectedAsset.opacity
    });
    this.selectedObject.setCoords();
    this.selectedObject.dirty = true;

    let needsRefresh = false;

    // Asset-specific real-time updates
    if (this.selectedAsset.type === 'speechBubble') {
      if (this.selectedObject.type === 'group') {
        // Update text
        const textObject = this.selectedObject.getObjects().find(obj => obj.type === 'text');
        if (textObject) {
          textObject.set({
            text: this.selectedAsset.text || 'Hello!',
            fontSize: this.selectedAsset.fontSize || 14,
            fill: this.selectedAsset.textColor || '#000000'
          });
          textObject.setCoords();
          textObject.dirty = true;
        }
        // Update all non-text shapes (bubble + tail)
        this.selectedObject.getObjects().forEach(obj => {
          if (obj.type !== 'text') {
            obj.set({
              fill: this.selectedAsset.bubbleColor || '#ffffff',
              stroke: this.selectedAsset.borderColor || '#000000'
            });
            obj.setCoords();
            obj.dirty = true;
          }
        });
        if (typeof this.selectedObject._calcBounds === 'function') {
          this.selectedObject._calcBounds();
        }
        if (typeof this.selectedObject._updateObjectsCoords === 'function') {
          this.selectedObject._updateObjectsCoords();
        }
      }
      // Only trigger full refresh if bubbleStyle changed
      if (this._lastBubbleStyle !== undefined && this._lastBubbleStyle !== this.selectedAsset.bubbleStyle) {
        needsRefresh = true;
      }
      this._lastBubbleStyle = this.selectedAsset.bubbleStyle;
    } else if (this.selectedAsset.type === 'actionShape') {
      if (this.selectedObject.type === 'group') {
        const textObject = this.selectedObject.getObjects().find(obj => obj.type === 'text');
        if (textObject) {
          textObject.set({
            text: this.selectedAsset.text || '',
            fontSize: this.selectedAsset.fontSize || 28,
            fill: this.selectedAsset.textColor || '#ffffff'
          });
          textObject.setCoords();
          textObject.dirty = true;
        }
        // Update shapes: direct children and nested groups
        this.selectedObject.getObjects().forEach(obj => {
          if (obj.type === 'text') return;
          if (obj.type === 'group' && typeof obj.getObjects === 'function') {
            obj.getObjects().forEach(child => {
              if (child.type !== 'text') {
                child.set({
                  fill: this.selectedAsset.backgroundColor || '#ff4444',
                  stroke: this.selectedAsset.borderColor || '#000000'
                });
                child.setCoords();
                child.dirty = true;
              }
            });
          } else {
            obj.set({
              fill: this.selectedAsset.backgroundColor || '#ff4444',
              stroke: this.selectedAsset.borderColor || '#000000'
            });
            obj.setCoords();
            obj.dirty = true;
          }
        });
        if (typeof this.selectedObject._calcBounds === 'function') {
          this.selectedObject._calcBounds();
        }
        if (typeof this.selectedObject._updateObjectsCoords === 'function') {
          this.selectedObject._updateObjectsCoords();
        }
      }
      if (this._lastShapeStyle !== undefined && this._lastShapeStyle !== this.selectedAsset.shapeStyle) {
        needsRefresh = true;
      }
      this._lastShapeStyle = this.selectedAsset.shapeStyle;
    } else if (this.selectedAsset.type === 'character') {
      // Only trigger full refresh if type/expression/skin/hair changed
      if (
        (this._lastCharacterType !== undefined && this._lastCharacterType !== this.selectedAsset.characterType) ||
        (this._lastExpression !== undefined && this._lastExpression !== this.selectedAsset.expression) ||
        (this._lastSkinColor !== undefined && this._lastSkinColor !== this.selectedAsset.skinColor) ||
        (this._lastHairColor !== undefined && this._lastHairColor !== this.selectedAsset.hairColor)
      ) {
        needsRefresh = true;
      }
      this._lastCharacterType = this.selectedAsset.characterType;
      this._lastExpression = this.selectedAsset.expression;
      this._lastSkinColor = this.selectedAsset.skinColor;
      this._lastHairColor = this.selectedAsset.hairColor;
    }

  // Re-render canvas immediately for all direct property changes
  this.eventBus.emit('canvas:renderAll');

    // Only trigger full asset refresh for style/type changes
    if (needsRefresh) {
      this.eventBus.emit('asset:refresh', {
        assetId: this.selectedAsset.id,
        cellId: this.selectedObject.cellId
      });
    }
  }

  showPanel() {
    const panel = this.container.querySelector('.properties-panel');
    if (panel) panel.classList.add('visible');
  }

  hidePanel() {
    const panel = this.container.querySelector('.properties-panel');
    if (panel) panel.classList.remove('visible');
  }
}
