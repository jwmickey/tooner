import { Canvas, Rect, Ellipse, Text, Group, Circle } from 'fabric';
import { ComicStrip } from '../../models/ComicStrip.js';
import { SpeechBubble } from '../../models/Components/SpeechBubble.js';
import { ActionShape } from '../../models/Components/ActionShape.js';
import { Character } from '../../models/Components/Character.js';

/**
 * Main comic strip editor component using Fabric.js
 */
export class ComicStripEditor {
  constructor({ container, eventBus, storage }) {
    this.container = container;
    this.eventBus = eventBus;
    this.storage = storage;
    this.comicStrip = null;
    this.canvas = null;
    this.cells = [];
    this.cellWidth = 200;
    this.cellHeight = 200;
    this.cellSpacing = 10;
    
    this.init();
  }

  init() {
    this.createCanvas();
    this.setupEventListeners();
    this.setupCanvasEvents();
    
    // Ensure canvas is rendered even without comic strip
    this.canvas.renderAll();
  }

  createCanvas() {
    // Create canvas element
    const canvasElement = document.createElement('canvas');
    canvasElement.id = 'comic-canvas';
    this.container.appendChild(canvasElement);

    // Initialize Fabric.js canvas
    this.canvas = new Canvas('comic-canvas', {
      width: window.innerWidth * 0.7, // 70% of viewport width
      height: window.innerHeight * 0.8, // 80% of viewport height
      backgroundColor: '#f8f9fa',
      selection: true,
      preserveObjectStacking: true
    });

    // Force initial render
    this.canvas.renderAll();

    // Make canvas responsive
    this.makeCanvasResponsive();
  }

  makeCanvasResponsive() {
    const resizeCanvas = () => {
      const containerWidth = this.container.clientWidth;
      const containerHeight = this.container.clientHeight;
      
      // Ensure we have valid dimensions
      const width = Math.max(800, containerWidth);
      const height = Math.max(600, containerHeight);
      
      this.canvas.setDimensions({
        width: width,
        height: height
      });
      
      // Re-apply background color after resize
      this.canvas.backgroundColor = '#f8f9fa';
      this.canvas.renderAll();
      
      if (this.comicStrip) {
        this.updateCellLayout();
        this.renderComicStrip();
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  }

  setupEventListeners() {
    this.eventBus.on('editor:loadComicStrip', (comicStripData) => {
      console.log('ComicStripEditor received comic strip data:', comicStripData);
      this.currentComicStrip = comicStripData;
      this.comicStrip = new ComicStrip(comicStripData); // Create ComicStrip instance
      this.renderComicStrip();
    });

    this.eventBus.on('asset:dragStart', (asset) => {
      this.isDragging = true;
    });

    this.eventBus.on('asset:dragEnd', () => {
      this.isDragging = false;
    });

    // Handle asset drops from the palette
    this.eventBus.on('asset:drop', (assetData, position) => {
      console.log('Asset dropped:', assetData, 'at position:', position);
      this.handleAssetDrop(assetData, position);
    });

    // Real-time canvas render requests from other components (e.g., PropertiesPanel)
    this.eventBus.on('canvas:renderAll', () => {
      if (this.canvas && typeof this.canvas.requestRenderAll === 'function') {
        this.canvas.requestRenderAll();
      } else if (this.canvas) {
        this.canvas.renderAll();
      }
    });

    // Refresh/recreate an asset (e.g., when style/type changes)
    this.eventBus.on('asset:refresh', ({ assetId, cellId }) => {
      this.refreshAsset(assetId, cellId);
    });

    // Delete asset from external actions (e.g., PropertiesPanel button)
    this.eventBus.on('asset:delete', ({ assetId, cellId }) => {
      this.deleteAsset(assetId, cellId);
    });

    // Persist live property changes into the data model for saving/export
    this.eventBus.on('asset:propertyChanged', ({ assetId, property, value }) => {
      if (!this.comicStrip) return;
      const canvasObj = this.canvas?.getObjects().find(o => o.assetId === assetId);
      if (!canvasObj) return;
      const cell = this.cells.find(c => c.id === canvasObj.cellId);
      if (!cell) return;
      const asset = cell.data.assets.find(a => a.id === assetId);
      if (!asset) return;

      // Apply nested property update to the model asset
      const keys = property.split('.');
      let current = asset;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    });
  }

  handleAssetDragStart(asset) {
    // Optional: Add visual feedback when dragging starts
    console.log('Drag started for:', asset);
  }

  handleCanvasDrop(e) {
    // Handle drops directly on canvas
    console.log('Canvas drop:', e);
  }

  setupCanvasEvents() {
    let isInteractingWithUI = false;
    let mouseDownTime = 0;
    let isDragging = false;
    
    // Track when user is interacting with UI elements
    document.addEventListener('mousedown', (e) => {
      // Check if click is on properties panel or other UI elements
      const isPropertiesPanel = e.target.closest('#properties-panel');
      const isAssetPalette = e.target.closest('#asset-palette');
      const isToolbar = e.target.closest('#toolbar');
      
      isInteractingWithUI = !!(isPropertiesPanel || isAssetPalette || isToolbar);
    });
    
    // Track canvas mouse events
    this.canvas.on('mouse:down', (e) => {
      mouseDownTime = Date.now();
      isDragging = false;
      
      // If clicking on empty canvas (not on an object), clear selection
      if (!e.target) {
        this.canvas.discardActiveObject();
        this.eventBus.emit('object:deselected');
      }
    });
    
    this.canvas.on('object:moving', (e) => {
      isDragging = true;
      this.constrainObjectToCell(e.target);
    });

    this.canvas.on('mouse:up', (e) => {
      const mouseUpTime = Date.now();
      const timeDiff = mouseUpTime - mouseDownTime;
      
      // Reset dragging state after a short delay
      setTimeout(() => {
        isDragging = false;
      }, 100);
    });

    // Only emit selection events for actual canvas interactions
    this.canvas.on('selection:created', (e) => {
      if (!isDragging && !isInteractingWithUI) {
        setTimeout(() => {
          if (!isDragging) {
            this.eventBus.emit('object:selected', e.selected);
          }
        }, 50);
      }
    });

    this.canvas.on('selection:updated', (e) => {
      if (!isDragging && !isInteractingWithUI) {
        setTimeout(() => {
          if (!isDragging) {
            this.eventBus.emit('object:selected', e.selected);
          }
        }, 50);
      }
    });

    this.canvas.on('selection:cleared', () => {
      // Only clear selection if not interacting with UI
      if (!isInteractingWithUI) {
        this.eventBus.emit('object:deselected');
      }
    });

    // Object modification - update data but don't auto-show properties after drag
    this.canvas.on('object:modified', (e) => {
      this.updateAssetFromFabricObject(e.target);
      // Don't automatically show properties after dragging - let user click to select
    });

    // Drop zone handling
    this.canvas.on('drop', (e) => {
      this.handleCanvasDrop(e.e);
    });
  }

  loadComicStrip(data) {
    this.comicStrip = new ComicStrip(data);
    this.renderComicStrip();
    this.eventBus.emit('editor:comicStripLoaded', this.comicStrip);
  }

  renderComicStrip() {
    console.log('renderComicStrip called, currentComicStrip:', this.currentComicStrip);
    
    // Clear canvas
    this.canvas.clear();
    this.cells = [];

    // Restore background color after clearing
    this.canvas.backgroundColor = '#f8f9fa';
    this.canvas.renderAll();

    if (!this.comicStrip) {
      console.log('No comicStrip instance found');
      return;
    }
    
    console.log('Rendering comic strip with', this.comicStrip.cells.length, 'cells');
    
    // Calculate layout
    this.updateCellLayout();

    // Render cells
    this.comicStrip.cells.forEach((cellData, index) => {
      this.renderCell(cellData, index);
    });

    this.canvas.renderAll();
  }

  updateCellLayout() {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    
    // Calculate optimal cell size and layout
    const totalCells = this.comicStrip ? this.comicStrip.cells.length : 5;
    const cols = Math.min(totalCells, Math.floor(canvasWidth / (this.cellWidth + this.cellSpacing)));
    const rows = Math.ceil(totalCells / cols);
    
    // Adjust cell size if needed
    const availableWidth = canvasWidth - (this.cellSpacing * (cols + 1));
    const availableHeight = canvasHeight - (this.cellSpacing * (rows + 1));
    
    this.cellWidth = Math.min(200, availableWidth / cols);
    this.cellHeight = Math.min(200, availableHeight / rows);
  }

  renderCell(cellData, index) {
    const cols = Math.floor(this.canvas.width / (this.cellWidth + this.cellSpacing));
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    const x = this.cellSpacing + col * (this.cellWidth + this.cellSpacing);
    const y = this.cellSpacing + row * (this.cellHeight + this.cellSpacing);

    // Create cell background
    const cellBg = new Rect({
      left: x,
      top: y,
      width: this.cellWidth,
      height: this.cellHeight,
      fill: cellData.background.color || '#ffffff',
      stroke: '#cccccc',
      strokeWidth: 2,
      selectable: false,
      evented: false,
      excludeFromExport: false
    });

    cellBg.cellId = cellData.id;
    cellBg.isCell = true;
    
    this.canvas.add(cellBg);
    
    // Store cell info
    this.cells.push({
      id: cellData.id,
      data: cellData,
      bounds: { x, y, width: this.cellWidth, height: this.cellHeight },
      fabricObject: cellBg
    });

    // Render assets in cell
    cellData.assets.forEach(assetData => {
      this.renderAsset(assetData, cellData.id);
    });
  }

  renderAsset(assetData, cellId) {
    // Enhanced asset rendering using specific asset classes
    const cell = this.cells.find(c => c.id === cellId);
    if (!cell) return;

    let fabricObject;
    
    switch (assetData.type) {
      case 'speechBubble':
        const speechBubble = new SpeechBubble(assetData);
        fabricObject = speechBubble.render(this.canvas);
        break;
      case 'actionShape':
        const actionShape = new ActionShape(assetData);
        fabricObject = actionShape.render(this.canvas);
        break;
      case 'character':
        const character = new Character(assetData);
        fabricObject = character.render(this.canvas);
        break;
      default:
        fabricObject = this.createGenericAsset(assetData);
    }

    if (fabricObject) {
      // Position relative to cell
      fabricObject.set({
        left: cell.bounds.x + assetData.position.x,
        top: cell.bounds.y + assetData.position.y
      });

      fabricObject.assetId = assetData.id;
      fabricObject.cellId = cellId;
      fabricObject.assetData = assetData;
  // Persist the cell's origin to correctly compute absolute position during property edits
  fabricObject.cellOffset = { x: cell.bounds.x, y: cell.bounds.y };

      this.canvas.add(fabricObject);

      // Add double-click event for edit mode
      fabricObject.on('mousedblclick', () => {
        this.eventBus.emit('object:editRequested', [fabricObject]);
      });
    }
  }

  createGenericAsset(assetData) {
    return new Rect({
      width: 50,
      height: 50,
      fill: '#ff6b6b',
      stroke: '#333',
      strokeWidth: 1
    });
  }

  createSpeechBubble(assetData) {
    const group = new Group([], {
      width: 120,
      height: 80
    });

    // Bubble shape
    const bubble = new Ellipse({
      rx: 60,
      ry: 40,
      fill: '#ffffff',
      stroke: '#333',
      strokeWidth: 2
    });

    // Text
    const text = new Text(assetData.text || 'Hello!', {
      fontSize: 14,
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });

    group.addWithUpdate(bubble);
    group.addWithUpdate(text);
    
    return group;
  }

  createActionShape(assetData) {
    const text = new Text(assetData.text || 'BAM!', {
      fontSize: 24,
      fontWeight: 'bold',
      fill: '#ff4444',
      stroke: '#000',
      strokeWidth: 1,
      textAlign: 'center'
    });

    return text;
  }

  createCharacter(assetData) {
    // Simple character placeholder - will be enhanced later
    return new Circle({
      radius: 30,
      fill: '#ffeb3b',
      stroke: '#333',
      strokeWidth: 2
    });
  }

  addCell() {
    if (this.comicStrip) {
      this.comicStrip.addCell();
      this.renderComicStrip();
      this.eventBus.emit('editor:cellAdded');
    }
  }

  removeCell(cellId) {
    if (this.comicStrip && this.comicStrip.cells.length > 1) {
      this.comicStrip.removeCell(cellId);
      this.renderComicStrip();
      this.eventBus.emit('editor:cellRemoved', cellId);
    }
  }

  removeLastCell() {
    if (this.comicStrip && this.comicStrip.cells.length > 1) {
      const lastCell = this.comicStrip.cells[this.comicStrip.cells.length - 1];
      this.removeCell(lastCell.id);
    }
  }

  updateComicTitle(title) {
    if (this.comicStrip) {
      this.comicStrip.title = title;
    }
  }

  updateComicAuthor(author) {
    if (this.comicStrip) {
      this.comicStrip.author = author;
    }
  }

  deleteAsset(assetId, cellId) {
    // Remove from data model
    this.comicStrip.removeAssetFromCell(cellId, assetId);
    
    // Remove from canvas
    const objects = this.canvas.getObjects();
    const fabricObject = objects.find(obj => obj.assetId === assetId);
    if (fabricObject) {
      this.canvas.remove(fabricObject);
      this.canvas.renderAll();
    }
  }

  refreshAsset(assetId, cellId) {
    // Find and remove the old fabric object
    const objects = this.canvas.getObjects();
    const oldObject = objects.find(obj => obj.assetId === assetId);
    if (oldObject) {
      this.canvas.remove(oldObject);
    }

    // Find the asset data and re-render
    const cell = this.cells.find(c => c.id === cellId);
    if (cell) {
      const assetData = cell.data.assets.find(a => a.id === assetId);
      if (assetData) {
        this.renderAsset(assetData, cellId);
        this.canvas.renderAll();
      }
    }
  }

  quickAddAsset(assetData) {
    // Add asset to the center of the first cell
    if (this.cells.length > 0) {
      const firstCell = this.cells[0];
      const centerPosition = {
        x: firstCell.bounds.width / 2,
        y: firstCell.bounds.height / 2
      };
      
      this.handleAssetDrop(assetData, {
        x: firstCell.bounds.x + centerPosition.x,
        y: firstCell.bounds.y + centerPosition.y
      });
    }
  }

  handleAssetDrop(assetData, position) {
    console.log('handleAssetDrop called with:', assetData, position);
    
    // Find which cell the asset was dropped on
    const cell = this.findCellAtPosition(position);
    console.log('Found cell:', cell);
    
    if (cell) {
      const newAsset = {
        id: `asset-${Date.now()}`,
        type: assetData.type,
        subtype: assetData.subtype,
        position: {
          x: position.x - cell.bounds.x,
          y: position.y - cell.bounds.y
        }
      };

      // Set default properties based on asset type and subtype
      switch (assetData.type) {
        case 'speechBubble':
          newAsset.text = 'Hello!';
          newAsset.bubbleStyle = assetData.subtype || 'speech';
          break;
        case 'actionShape':
          newAsset.text = this.getRandomActionWord();
          newAsset.shapeStyle = assetData.subtype || 'burst';
          break;
        case 'character':
          newAsset.characterType = assetData.subtype || 'simple';
          newAsset.expression = 'neutral';
          break;
        case 'background':
          this.handleBackgroundDrop(cell, assetData.subtype);
          return; // Background is handled differently
      }

      console.log('Adding new asset:', newAsset);
      this.comicStrip.addAssetToCell(cell.id, newAsset);
      this.renderAsset(newAsset, cell.id);
      this.canvas.renderAll();
    } else {
      console.log('No cell found at position:', position);
    }
  }

  getRandomActionWord() {
    const words = ['BAM!', 'POW!', 'WHAM!', 'BANG!', 'CRASH!', 'BOOM!', 'ZAP!', 'KAPOW!'];
    return words[Math.floor(Math.random() * words.length)];
  }

  handleBackgroundDrop(cell, backgroundType) {
    switch (backgroundType) {
      case 'solid':
        // Show color picker (simplified for now)
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.comicStrip.updateCellBackground(cell.id, { color: randomColor });
        break;
      case 'cityscape':
        this.comicStrip.updateCellBackground(cell.id, { 
          type: 'pattern', 
          pattern: 'cityscape',
          color: '#87ceeb' 
        });
        break;
      case 'nature':
        this.comicStrip.updateCellBackground(cell.id, { 
          type: 'pattern', 
          pattern: 'nature',
          color: '#90EE90' 
        });
        break;
    }
    this.renderComicStrip(); // Re-render to show background changes
  }

  findCellAtPosition(position) {
    return this.cells.find(cell => {
      const bounds = cell.bounds;
      return position.x >= bounds.x && 
             position.x <= bounds.x + bounds.width &&
             position.y >= bounds.y && 
             position.y <= bounds.y + bounds.height;
    });
  }

  constrainObjectToCell(fabricObject) {
    if (!fabricObject.cellId) return;

    const cell = this.cells.find(c => c.id === fabricObject.cellId);
    if (!cell) return;

    const bounds = cell.bounds;
    const objBounds = fabricObject.getBoundingRect();

    // Constrain to cell boundaries
    let newLeft = fabricObject.left;
    let newTop = fabricObject.top;

    if (objBounds.left < bounds.x) {
      newLeft = bounds.x + (fabricObject.left - objBounds.left);
    }
    if (objBounds.top < bounds.y) {
      newTop = bounds.y + (fabricObject.top - objBounds.top);
    }
    if (objBounds.left + objBounds.width > bounds.x + bounds.width) {
      newLeft = bounds.x + bounds.width - objBounds.width + (fabricObject.left - objBounds.left);
    }
    if (objBounds.top + objBounds.height > bounds.y + bounds.height) {
      newTop = bounds.y + bounds.height - objBounds.height + (fabricObject.top - objBounds.top);
    }

    fabricObject.set({ left: newLeft, top: newTop });
  }

  updateAssetFromFabricObject(fabricObject) {
    if (!fabricObject.assetId || !fabricObject.cellId) return;

    const cell = this.cells.find(c => c.id === fabricObject.cellId);
    if (!cell) return;

    const updates = {
      position: {
        x: fabricObject.left - cell.bounds.x,
        y: fabricObject.top - cell.bounds.y
      },
      scale: {
        x: fabricObject.scaleX,
        y: fabricObject.scaleY
      },
      rotation: fabricObject.angle
    };

    this.comicStrip.updateAssetInCell(fabricObject.cellId, fabricObject.assetId, updates);
    
    // Update the assetData reference on the fabric object
    if (fabricObject.assetData) {
      Object.assign(fabricObject.assetData, updates);
    }
  }

  exportComicStrip(format = 'svg') {
    switch (format) {
      case 'svg':
        const svg = this.canvas.toSVG();
        this.downloadFile(svg, 'comic-strip.svg', 'image/svg+xml');
        break;
      case 'png':
        const dataURL = this.canvas.toDataURL('image/png');
        this.downloadDataURL(dataURL, 'comic-strip.png');
        break;
      case 'json':
        const json = JSON.stringify(this.comicStrip.toJSON(), null, 2);
        this.downloadFile(json, 'comic-strip.json', 'application/json');
        break;
    }
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadDataURL(dataURL, filename) {
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = filename;
    a.click();
  }
}
