import { EventBus } from './EventBus.js';
import { Storage } from './Storage.js';
import { ComicStripEditor } from '../views/Editor/ComicStripEditor.js';
import { AssetPalette } from '../views/AssetPalette/AssetPalette.js';
import { Toolbar } from '../views/Toolbar/Toolbar.js';
import { PropertiesPanel } from '../views/PropertiesPanel/PropertiesPanel.js';

/**
 * Main application controller that orchestrates all components
 */
export class App {
  constructor() {
    this.eventBus = new EventBus();
    this.storage = new Storage();
    this.components = {};
    
    this.init();
  }

  init() {
    // Initialize core components
    this.components.toolbar = new Toolbar({
      container: document.getElementById('toolbar'),
      eventBus: this.eventBus
    });

    this.components.assetPalette = new AssetPalette({
      container: document.getElementById('asset-palette'),
      eventBus: this.eventBus
    });

    this.components.editor = new ComicStripEditor({
      container: document.getElementById('canvas-container'),
      eventBus: this.eventBus,
      storage: this.storage
    });

    this.components.propertiesPanel = new PropertiesPanel({
      container: document.getElementById('properties-panel'),
      eventBus: this.eventBus
    });

    // Set up global event listeners
    this.setupEventListeners();

    // Load or create default comic strip
    this.loadOrCreateComicStrip();
  }

  setupEventListeners() {
    // Global app events
    this.eventBus.on('app:save', () => this.saveComicStrip());
    this.eventBus.on('app:load', () => this.loadComicStrip());
    this.eventBus.on('app:export', (format) => this.exportComicStrip(format));
    this.eventBus.on('app:new', () => this.createNewComicStrip());
  }

  async loadOrCreateComicStrip() {
    try {
      const savedStrip = await this.storage.loadComicStrip();
      if (savedStrip) {
        console.log('Loaded saved comic strip:', savedStrip);
        this.eventBus.emit('editor:loadComicStrip', savedStrip);
      } else {
        console.log('No saved strip found, creating new one');
        const newStrip = this.createNewComicStrip();
        console.log('Created new comic strip:', newStrip);
        this.eventBus.emit('editor:loadComicStrip', newStrip);
        await this.storage.saveComicStrip(newStrip);
      }
    } catch (error) {
      console.error('Error loading comic strip:', error);
      // Fallback to creating a new strip
      const newStrip = this.createNewComicStrip();
      console.log('Fallback: created new comic strip:', newStrip);
      this.eventBus.emit('editor:loadComicStrip', newStrip);
    }
  }

  createNewComicStrip() {
    const defaultStrip = {
      id: Date.now(),
      title: 'New Comic Strip',
      author: '',
      description: '',
      date: new Date().toISOString(),
      cells: Array(5).fill(null).map((_, index) => ({
        id: `cell-${index}`,
        assets: [],
        background: { type: 'solid', color: '#ffffff' }
      }))
    };
    
    return defaultStrip;
  }

  saveComicStrip() {
    this.eventBus.emit('editor:getComicStripData', (data) => {
      this.storage.save('currentComicStrip', data);
      this.eventBus.emit('app:showMessage', 'Comic strip saved!');
    });
  }

  loadComicStrip() {
    // Future: Show file picker or load dialog
    const savedStrip = this.storage.load('currentComicStrip');
    if (savedStrip) {
      this.eventBus.emit('editor:loadComicStrip', savedStrip);
    }
  }

  exportComicStrip(format = 'svg') {
    this.eventBus.emit('editor:export', format);
  }
}
