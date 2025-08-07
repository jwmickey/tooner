/**
 * Properties panel for editing selected assets
 */
export class PropertiesPanel {
  constructor({ container, eventBus }) {
    this.container = container;
    this.eventBus = eventBus;
    this.selectedAsset = null;
    this.selectedObject = null;
    
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="properties-panel">
        <h3>Properties</h3>
        <div id="properties-content">
          <div class="no-selection">
            <p>Select an asset to edit its properties</p>
          </div>
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
          padding: 16px;
          height: 100%;
          overflow-y: auto;
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
    // Listen for asset selection
    this.eventBus.on('object:selected', (objects) => {
      if (objects && objects.length > 0) {
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
    });
  }

  selectAsset(fabricObject) {
    this.selectedObject = fabricObject;
    this.selectedAsset = fabricObject.assetData;
    
    if (this.selectedAsset) {
      this.renderProperties();
    }
  }

  deselectAsset() {
    this.selectedObject = null;
    this.selectedAsset = null;
    this.render();
  }

  renderProperties() {
    const content = this.container.querySelector('#properties-content');
    
    if (!this.selectedAsset) {
      content.innerHTML = '<div class="no-selection"><p>Select an asset to edit its properties</p></div>';
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
    const value = input.type === 'number' ? parseFloat(input.value) : input.value;

    // Update the asset data
    this.setNestedProperty(this.selectedAsset, property, value);

    // Update the Fabric.js object
    this.updateFabricObject();

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

    // Update transform properties directly
    this.selectedObject.set({
      scaleX: this.selectedAsset.scale.x,
      scaleY: this.selectedAsset.scale.y,
      angle: this.selectedAsset.rotation,
      opacity: this.selectedAsset.opacity
    });

    // For text properties, try to update directly instead of full refresh
    if (this.selectedAsset.type === 'speechBubble' && this.selectedAsset.text !== undefined) {
      // Try to find and update text object within the group
      if (this.selectedObject.type === 'group') {
        const textObject = this.selectedObject.getObjects().find(obj => obj.type === 'text');
        if (textObject) {
          textObject.set('text', this.selectedAsset.text || 'Hello!');
        }
      }
    }

    // Re-render canvas without causing selection events
    this.eventBus.emit('canvas:renderAll');
    
    // Only refresh for complex changes (colors, etc) that require full re-render
    const needsFullRefresh = this.selectedAsset.type === 'character' || 
                            (this.selectedAsset.type === 'speechBubble' && this.selectedAsset.bubbleStyle) ||
                            (this.selectedAsset.type === 'actionShape' && this.selectedAsset.shapeStyle);
    
    if (needsFullRefresh) {
      // Temporarily disable selection events during refresh
      this.eventBus.emit('asset:refresh', {
        assetId: this.selectedAsset.id,
        cellId: this.selectedObject.cellId
      });
    }
  }
}
