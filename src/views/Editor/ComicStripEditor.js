import { Canvas, StaticCanvas, Rect, Ellipse, Text, Group, Circle } from 'fabric';
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
  this.thumbnailCache = new Map();
    
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
    // Prepare containers: thumbnails strip and active canvas host exist in DOM
    const activeHost = this.container.querySelector('#active-canvas') || this.container;
    const thumbsHost = this.container.querySelector('#cell-thumbnails');
    this.thumbsHost = thumbsHost;

    // Create canvas element inside active host
    const canvasElement = document.createElement('canvas');
    canvasElement.id = 'comic-canvas';
    activeHost.appendChild(canvasElement);

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

  // Initial thumbnails render placeholder
  this.renderThumbnails();
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
  // active cell changed -> invalidate its thumbnail
  if (this.activeCellId) this.invalidateThumbnail(this.activeCellId);
  this.renderThumbnails();
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
  this.invalidateThumbnail(cellId);
  this.renderThumbnails();
    });

    // Delete asset from external actions (e.g., PropertiesPanel button)
    this.eventBus.on('asset:delete', ({ assetId, cellId }) => {
      this.deleteAsset(assetId, cellId);
  this.invalidateThumbnail(cellId);
  this.renderThumbnails();
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
  // Live thumbnail refresh for the active cell's data change
  const cellId = canvasObj.cellId;
  this.invalidateThumbnail(cellId);
  this.renderThumbnails();
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

    // Ensure thumbnails reflect current cells
  this.renderThumbnails();

    if (!this.comicStrip) {
      console.log('No comicStrip instance found');
      return;
    }

    // Choose active cell if unset
    if (!this.activeCellId && this.comicStrip.cells.length) {
      this.activeCellId = this.comicStrip.cells[0].id;
    }

    // Render only active cell into the main canvas
    this.renderActiveCell();
  }

  invalidateThumbnail(cellId) {
    if (cellId && this.thumbnailCache.has(cellId)) {
      this.thumbnailCache.delete(cellId);
    }
  }

  renderActiveCell() {
    // Clear canvas and state
    this.canvas.clear();
    this.cells = [];

    // Restore background color after clearing
    this.canvas.backgroundColor = '#f8f9fa';
    this.canvas.renderAll();

    if (!this.comicStrip || !this.activeCellId) return;

    const cellData = this.comicStrip.getCell(this.activeCellId);
    if (!cellData) return;

    // Fit active cell with margins
    const margin = 20;
    const width = this.canvas.getWidth() - margin * 2;
    const height = this.canvas.getHeight() - margin * 2;
    this.cellWidth = width;
    this.cellHeight = height;
    this.cellSpacing = margin;

    // Render a single cell occupying the canvas area with margin
    this.renderCell(cellData, 0);
    this.canvas.renderAll();
  // After we render, invalidate the thumbnail cache for this cell and regenerate
  this.invalidateThumbnail(this.activeCellId);
  this.renderThumbnails();
  }

  renderThumbnails() {
    if (!this.thumbsHost) return;
    // Clear
    this.thumbsHost.innerHTML = '';
    const cells = this.comicStrip?.cells || [];
    cells.forEach((cell, idx) => {
      const el = document.createElement('div');
      el.className = 'cell-thumb' + (cell.id === this.activeCellId ? ' active' : '');
      el.dataset.cellId = cell.id;
      el.title = `Cell ${idx + 1}`;

      // Number badge
      const badge = document.createElement('span');
      badge.className = 'cell-number';
      badge.textContent = String(idx + 1);
      el.appendChild(badge);

      // Mini preview canvas
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 140; // match css flex basis
      thumbCanvas.height = 90;
      el.appendChild(thumbCanvas);
      this.renderThumbnailPreview(thumbCanvas, cell);

      // Delete cell button (if more than 1)
      if (cells.length > 1) {
        const del = document.createElement('button');
        del.type = 'button';
        del.textContent = '×';
        del.title = 'Delete Cell';
        del.style.position = 'absolute';
        del.style.top = '4px';
        del.style.right = '6px';
        del.style.background = 'rgba(0,0,0,0.5)';
        del.style.color = '#fff';
        del.style.border = 'none';
        del.style.borderRadius = '3px';
        del.style.width = '18px';
        del.style.height = '18px';
        del.style.lineHeight = '18px';
        del.style.cursor = 'pointer';
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          const currentIdx = this.comicStrip.cells.findIndex(c => c.id === cell.id);
          // Remove from model
          this.comicStrip.removeCell(cell.id);
          // Update active cell
          if (this.activeCellId === cell.id) {
            const nextIdx = Math.min(currentIdx, this.comicStrip.cells.length - 1);
            this.activeCellId = this.comicStrip.cells[nextIdx]?.id;
          }
          // Invalidate cache and rerender
          this.thumbnailCache.delete(cell.id);
          this.renderThumbnails();
          this.renderActiveCell();
        });
        el.appendChild(del);
      }

      el.addEventListener('click', () => {
        this.activeCellId = cell.id;
        this.renderThumbnails();
        this.renderActiveCell();
      });
      this.thumbsHost.appendChild(el);
    });

    // Add Cell button
    const addBtn = document.createElement('div');
    addBtn.className = 'cell-thumb add-cell';
    addBtn.title = 'Add Cell';
    addBtn.textContent = '+ Add Cell';
    addBtn.addEventListener('click', () => {
      const newCell = this.comicStrip.addCell();
      this.activeCellId = newCell.id;
      this.renderThumbnails();
      this.renderActiveCell();
    });
    this.thumbsHost.appendChild(addBtn);

    // Keyboard navigation (left/right)
    this.enableKeyboardNav();
  }

  renderThumbnailPreview(canvasEl, cell) {
    // If cached image exists, paint it quickly and return
    const cached = this.thumbnailCache.get(cell.id);
    if (cached) {
      const ctx = canvasEl.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
      };
      img.src = cached;
      return;
    }

    // Render to an offscreen StaticCanvas for better control, then cache as data URL
    const offscreen = new StaticCanvas(null, {
      width: canvasEl.width,
      height: canvasEl.height,
      backgroundColor: 'transparent',
      preserveObjectStacking: true
    });

    const margin = 20;
    const baseWidth = Math.max(200, (this.canvas?.getWidth?.() || 800) - margin * 2);
    const baseHeight = Math.max(160, (this.canvas?.getHeight?.() || 600) - margin * 2);
    const scale = Math.min(canvasEl.width / baseWidth, canvasEl.height / baseHeight);
    const offsetX = (canvasEl.width - baseWidth * scale) / 2;
    const offsetY = (canvasEl.height - baseHeight * scale) / 2;

    const bgRect = new Rect({
      left: offsetX,
      top: offsetY,
      width: baseWidth * scale,
      height: baseHeight * scale,
      fill: cell.background?.color || '#ffffff',
      stroke: '#cfd8dc',
      strokeWidth: 1,
      selectable: false,
      evented: false
    });
    offscreen.add(bgRect);

    (cell.assets || []).forEach((asset) => {
      const cloned = {
        ...asset,
        position: {
          x: (asset.position?.x || 0) * scale,
          y: (asset.position?.y || 0) * scale
        },
        scale: {
          x: (asset.scale?.x || 1) * scale,
          y: (asset.scale?.y || 1) * scale
        },
        rotation: asset.rotation || 0,
        opacity: asset.opacity == null ? 1 : asset.opacity
      };

      let obj;
      switch (asset.type) {
        case 'speechBubble':
          obj = new SpeechBubble(cloned).render(offscreen);
          break;
        case 'actionShape':
          obj = new ActionShape(cloned).render(offscreen);
          break;
        case 'character':
          obj = new Character(cloned).render(offscreen);
          break;
        default:
          obj = new Rect({ width: 40 * scale, height: 40 * scale, fill: '#ff6b6b' });
      }
      if (obj) {
        obj.set({
          left: offsetX + cloned.position.x,
          top: offsetY + cloned.position.y,
          selectable: false,
          evented: false
        });
        offscreen.add(obj);
      }
    });

    offscreen.renderAll();
    const dataUrl = offscreen.toDataURL({ format: 'png' });
    this.thumbnailCache.set(cell.id, dataUrl);
    // Paint to visible canvas
    const ctx = canvasEl.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
      offscreen.dispose();
    };
    img.src = dataUrl;
  }

  enableKeyboardNav() {
    if (this._keyboardNavBound) return;
    this._keyboardNavBound = true;
    window.addEventListener('keydown', (e) => {
      if (!this.comicStrip || !this.comicStrip.cells.length) return;
      const idx = this.comicStrip.cells.findIndex(c => c.id === this.activeCellId);
      if (idx === -1) return;
      if (e.key === 'ArrowRight') {
        const next = Math.min(this.comicStrip.cells.length - 1, idx + 1);
        if (next !== idx) {
          this.activeCellId = this.comicStrip.cells[next].id;
          this.renderThumbnails();
          this.renderActiveCell();
          this.scrollActiveThumbIntoView();
        }
      } else if (e.key === 'ArrowLeft') {
        const prev = Math.max(0, idx - 1);
        if (prev !== idx) {
          this.activeCellId = this.comicStrip.cells[prev].id;
          this.renderThumbnails();
          this.renderActiveCell();
          this.scrollActiveThumbIntoView();
        }
      }
    });
  }

  scrollActiveThumbIntoView() {
    const active = this.thumbsHost?.querySelector('.cell-thumb.active');
    if (active && typeof active.scrollIntoView === 'function') {
      active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  updateCellLayout() {
    // For the active canvas view, layout is controlled in renderActiveCell
  }

  renderCell(cellData, index) {
    // Active cell occupies full canvas area with margins at (cellSpacing, cellSpacing)
    const x = this.cellSpacing;
    const y = this.cellSpacing;

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
