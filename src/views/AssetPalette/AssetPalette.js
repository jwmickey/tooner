/**
 * Asset palette component for dragging assets onto the canvas
 */
export class AssetPalette {
  constructor({ container, eventBus }) {
    this.container = container;
    this.eventBus = eventBus;
    this.assets = this.getAvailableAssets();
    
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  getAvailableAssets() {
    return [
      // Speech Bubbles
      {
        type: 'speechBubble',
        subtype: 'speech',
        name: 'Speech Bubble',
        icon: '💬',
        description: 'Add a speech bubble with text',
        category: 'bubbles'
      },
      {
        type: 'speechBubble',
        subtype: 'thought',
        name: 'Thought Bubble',
        icon: '💭',
        description: 'Add a thought bubble',
        category: 'bubbles'
      },
      {
        type: 'speechBubble',
        subtype: 'shout',
        name: 'Shout Bubble',
        icon: '📢',
        description: 'Add a shout/yell bubble',
        category: 'bubbles'
      },
      
      // Action Shapes
      {
        type: 'actionShape',
        subtype: 'burst',
        name: 'Action Burst',
        icon: '💥',
        description: 'Add burst-style action text',
        category: 'actions'
      },
      {
        type: 'actionShape',
        subtype: 'jagged',
        name: 'Action Jagged',
        icon: '⚡',
        description: 'Add jagged action text',
        category: 'actions'
      },
      {
        type: 'actionShape',
        subtype: 'cloud',
        name: 'Action Cloud',
        icon: '☁️',
        description: 'Add cloud-style action text',
        category: 'actions'
      },
      
      // Characters
      {
        type: 'character',
        subtype: 'simple',
        name: 'Simple Figure',
        icon: '🚶',
        description: 'Add a simple stick figure',
        category: 'characters'
      },
      {
        type: 'character',
        subtype: 'human',
        name: 'Human Character',
        icon: '👤',
        description: 'Add a detailed human character',
        category: 'characters'
      },
      {
        type: 'character',
        subtype: 'animal',
        name: 'Animal Character',
        icon: '🐱',
        description: 'Add an animal character',
        category: 'characters'
      },
      
      // Backgrounds
      {
        type: 'background',
        subtype: 'solid',
        name: 'Solid Color',
        icon: '🎨',
        description: 'Change cell background color',
        category: 'backgrounds'
      },
      {
        type: 'background',
        subtype: 'cityscape',
        name: 'Cityscape',
        icon: '🏙️',
        description: 'Add city background',
        category: 'backgrounds'
      },
      {
        type: 'background',
        subtype: 'nature',
        name: 'Nature Scene',
        icon: '🌳',
        description: 'Add nature background',
        category: 'backgrounds'
      }
    ];
  }

  render() {
    // Group assets by category
    const categories = this.groupAssetsByCategory();
    
    this.container.innerHTML = `
      <div class="asset-palette">
        <h3>Assets</h3>
        ${Object.entries(categories).map(([categoryName, assets]) => `
          <div class="asset-category">
            <h4>${this.getCategoryDisplayName(categoryName)}</h4>
            <div class="asset-grid">
              ${assets.map(asset => `
                <div class="asset-item" 
                     data-asset-type="${asset.type}"
                     data-asset-subtype="${asset.subtype || ''}"
                     draggable="true"
                     title="${asset.description}">
                  <div class="asset-icon">${asset.icon}</div>
                  <div class="asset-name">${asset.name}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.addStyles();
  }

  groupAssetsByCategory() {
    return this.assets.reduce((categories, asset) => {
      const category = asset.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(asset);
      return categories;
    }, {});
  }

  getCategoryDisplayName(categoryName) {
    const displayNames = {
      bubbles: 'Speech & Thought',
      actions: 'Action Effects',
      characters: 'Characters',
      backgrounds: 'Backgrounds',
      other: 'Other'
    };
    return displayNames[categoryName] || categoryName;
  }

  addStyles() {
    if (!document.getElementById('asset-palette-styles')) {
      const style = document.createElement('style');
      style.id = 'asset-palette-styles';
      style.textContent = `
        .asset-palette {
          width: 200px;
          height: 100%;
          background: #f8f9fa;
          border-right: 1px solid #e0e0e0;
          padding: 16px;
          overflow-y: auto;
        }

        .asset-palette h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: #333;
        }

        .asset-palette h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .asset-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 24px;
        }

        .asset-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          cursor: grab;
          transition: all 0.2s ease;
          user-select: none;
        }

        .asset-item:hover {
          border-color: #007acc;
          box-shadow: 0 2px 8px rgba(0, 122, 204, 0.1);
          transform: translateY(-1px);
        }

        .asset-item:active {
          cursor: grabbing;
          transform: translateY(0);
        }

        .asset-item.dragging {
          opacity: 0.5;
        }

        .asset-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .asset-name {
          font-size: 11px;
          text-align: center;
          color: #666;
          line-height: 1.2;
        }

        @media (max-width: 768px) {
          .asset-palette {
            width: 100%;
            height: auto;
            max-height: 200px;
            border-right: none;
            border-bottom: 1px solid #e0e0e0;
          }

          .asset-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupEventListeners() {
    // Drag and drop handling
    this.container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('asset-item')) {
        const assetType = e.target.dataset.assetType;
        const assetSubtype = e.target.dataset.assetSubtype;
        e.dataTransfer.setData('application/json', JSON.stringify({
          type: assetType,
          subtype: assetSubtype,
          source: 'palette'
        }));
        
        e.target.classList.add('dragging');
        this.eventBus.emit('asset:dragStart', { type: assetType, subtype: assetSubtype });
      }
    });

    this.container.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('asset-item')) {
        e.target.classList.remove('dragging');
        this.eventBus.emit('asset:dragEnd');
      }
    });

    // Canvas drop zone setup
    this.setupCanvasDropZone();
  }

  setupCanvasDropZone() {
    const canvasContainer = document.getElementById('canvas-container');
    
    canvasContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    canvasContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      
      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        if (data.source === 'palette') {
          const rect = canvasContainer.getBoundingClientRect();
          const position = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          };
          
          this.eventBus.emit('asset:drop', data, position);
        }
      } catch (error) {
        console.error('Error parsing drop data:', error);
      }
    });
  }

  // Method to add custom assets (for future extensibility)
  addCustomAsset(asset) {
    this.assets.push(asset);
    this.render();
  }

  // Method to remove asset type
  removeAsset(assetType) {
    this.assets = this.assets.filter(asset => asset.type !== assetType);
    this.render();
  }

  // Method to update asset categories
  updateCategories(categories) {
    // Future enhancement for organizing assets into categories
    this.render();
  }
}
