import { Canvas, Rect, Ellipse, Text, Group, Circle } from 'fabric';
import { ComicStrip } from '../../models/ComicStrip.js';

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
      backgroundColor: '#f5f5f5',
      selection: true,
      preserveObjectStacking: true
    });

    // Make canvas responsive
    this.makeCanvasResponsive();
  }

  makeCanvasResponsive() {
    const resizeCanvas = () => {
      const containerWidth = this.container.clientWidth;
      const containerHeight = this.container.clientHeight;
      
      this.canvas.setDimensions({
        width: containerWidth,
        height: containerHeight
      });
      
      this.updateCellLayout();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  }

  setupEventListeners() {
    // Listen for app events
    this.eventBus.on('editor:loadComicStrip', (data) => this.loadComicStrip(data));
    this.eventBus.on('editor:getComicStripData', (callback) => {
      callback(this.comicStrip ? this.comicStrip.toJSON() : null);
    });
    this.eventBus.on('editor:export', (format) => this.exportComicStrip(format));
    this.eventBus.on('editor:addCell', () => this.addCell());
    this.eventBus.on('editor:removeCell', (cellId) => this.removeCell(cellId));
    this.eventBus.on('editor:removeLastCell', () => this.removeLastCell());
    
    // Comic metadata events
    this.eventBus.on('comic:updateTitle', (title) => this.updateComicTitle(title));
    this.eventBus.on('comic:updateAuthor', (author) => this.updateComicAuthor(author));
    
    // Asset palette events
    this.eventBus.on('asset:dragStart', (asset) => this.handleAssetDragStart(asset));
    this.eventBus.on('asset:drop', (asset, position) => this.handleAssetDrop(asset, position));
  }

  setupCanvasEvents() {
    // Object selection
    this.canvas.on('selection:created', (e) => {
      this.eventBus.emit('object:selected', e.selected);
    });

    this.canvas.on('selection:updated', (e) => {
      this.eventBus.emit('object:selected', e.selected);
    });

    this.canvas.on('selection:cleared', () => {
      this.eventBus.emit('object:deselected');
    });

    // Object modification
    this.canvas.on('object:modified', (e) => {
      this.updateAssetFromFabricObject(e.target);
    });

    this.canvas.on('object:moving', (e) => {
      this.constrainObjectToCell(e.target);
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
    // Clear canvas
    this.canvas.clear();
    this.cells = [];

    if (!this.comicStrip) return;

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
    // This will be expanded as we add different asset types
    // For now, create a simple placeholder rectangle
    const cell = this.cells.find(c => c.id === cellId);
    if (!cell) return;

    let fabricObject;
    
    switch (assetData.type) {
      case 'speechBubble':
        fabricObject = this.createSpeechBubble(assetData);
        break;
      case 'actionShape':
        fabricObject = this.createActionShape(assetData);
        break;
      case 'character':
        fabricObject = this.createCharacter(assetData);
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

      this.canvas.add(fabricObject);
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

  handleAssetDrop(assetType, position) {
    // Find which cell the asset was dropped on
    const cell = this.findCellAtPosition(position);
    if (cell) {
      const newAsset = {
        type: assetType,
        position: {
          x: position.x - cell.bounds.x,
          y: position.y - cell.bounds.y
        },
        text: assetType === 'speechBubble' ? 'Hello!' : 
              assetType === 'actionShape' ? 'BAM!' : ''
      };

      this.comicStrip.addAssetToCell(cell.id, newAsset);
      this.renderAsset(newAsset, cell.id);
      this.canvas.renderAll();
    }
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
