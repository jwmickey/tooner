/**
 * Toolbar component with main controls
 */
export class Toolbar {
  constructor({ container, eventBus }) {
    this.container = container;
    this.eventBus = eventBus;
    
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-section">
          <button class="toolbar-btn" data-action="new" title="New Comic Strip">
            📄 New
          </button>
          <button class="toolbar-btn" data-action="save" title="Save Comic Strip">
            💾 Save
          </button>
          <button class="toolbar-btn" data-action="load" title="Load Comic Strip">
            📂 Load
          </button>
        </div>

        <div class="toolbar-section">
          <button class="toolbar-btn" data-action="add-cell" title="Add Cell">
            ➕ Add Cell
          </button>
          <button class="toolbar-btn" data-action="remove-cell" title="Remove Last Cell">
            ➖ Remove Cell
          </button>
        </div>

        <div class="toolbar-section">
          <button class="toolbar-btn" data-action="export-svg" title="Export as SVG">
            📄 SVG
          </button>
          <button class="toolbar-btn" data-action="export-png" title="Export as PNG">
            🖼️ PNG
          </button>
          <button class="toolbar-btn" data-action="export-json" title="Export as JSON">
            📋 JSON
          </button>
        </div>

        <div class="toolbar-section">
          <div class="comic-info">
            <input type="text" id="comic-title" placeholder="Comic Strip Title" maxlength="50">
            <input type="text" id="comic-author" placeholder="Author" maxlength="30">
          </div>
        </div>
      </div>
    `;

    this.addStyles();
  }

  addStyles() {
    if (!document.getElementById('toolbar-styles')) {
      const style = document.createElement('style');
      style.id = 'toolbar-styles';
      style.textContent = `
        .toolbar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: #ffffff;
          border-bottom: 1px solid #e0e0e0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          flex-wrap: wrap;
        }

        .toolbar-section {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 8px;
          border-right: 1px solid #e0e0e0;
        }

        .toolbar-section:last-child {
          border-right: none;
          margin-left: auto;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .toolbar-btn:hover {
          background: #e9ecef;
          border-color: #007acc;
        }

        .toolbar-btn:active {
          background: #dee2e6;
          transform: translateY(1px);
        }

        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .comic-info {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .comic-info input {
          padding: 6px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .comic-info input:focus {
          border-color: #007acc;
          box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
        }

        .comic-info input[type="text"]#comic-title {
          width: 200px;
        }

        .comic-info input[type="text"]#comic-author {
          width: 120px;
        }

        @media (max-width: 768px) {
          .toolbar {
            padding: 8px;
            gap: 8px;
          }

          .toolbar-section {
            padding: 0 4px;
          }

          .toolbar-btn {
            padding: 6px 8px;
            font-size: 12px;
          }

          .comic-info {
            flex-direction: column;
            gap: 4px;
          }

          .comic-info input {
            width: 150px !important;
            font-size: 12px;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupEventListeners() {
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('toolbar-btn')) {
        const action = e.target.dataset.action;
        this.handleToolbarAction(action);
      }
    });

    // Comic info inputs
    const titleInput = this.container.querySelector('#comic-title');
    const authorInput = this.container.querySelector('#comic-author');

    titleInput.addEventListener('input', (e) => {
      this.eventBus.emit('comic:updateTitle', e.target.value);
    });

    authorInput.addEventListener('input', (e) => {
      this.eventBus.emit('comic:updateAuthor', e.target.value);
    });

    // Listen for comic strip updates
    this.eventBus.on('editor:comicStripLoaded', (comicStrip) => {
      titleInput.value = comicStrip.title || '';
      authorInput.value = comicStrip.author || '';
    });
  }

  handleToolbarAction(action) {
    switch (action) {
      case 'new':
        if (confirm('Create a new comic strip? Any unsaved changes will be lost.')) {
          this.eventBus.emit('app:new');
        }
        break;
      
      case 'save':
        this.eventBus.emit('app:save');
        break;
      
      case 'load':
        // For now, just reload from storage
        this.eventBus.emit('app:load');
        break;
      
      case 'add-cell':
        this.eventBus.emit('editor:addCell');
        break;
      
      case 'remove-cell':
        if (confirm('Remove the last cell?')) {
          this.eventBus.emit('editor:removeLastCell');
        }
        break;
      
      case 'export-svg':
        this.eventBus.emit('app:export', 'svg');
        break;
      
      case 'export-png':
        this.eventBus.emit('app:export', 'png');
        break;
      
      case 'export-json':
        this.eventBus.emit('app:export', 'json');
        break;
      
      default:
        console.warn('Unknown toolbar action:', action);
    }
  }

  updateComicInfo(title, author) {
    const titleInput = this.container.querySelector('#comic-title');
    const authorInput = this.container.querySelector('#comic-author');
    
    if (titleInput) titleInput.value = title || '';
    if (authorInput) authorInput.value = author || '';
  }

  enableButton(action) {
    const button = this.container.querySelector(`[data-action="${action}"]`);
    if (button) button.disabled = false;
  }

  disableButton(action) {
    const button = this.container.querySelector(`[data-action="${action}"]`);
    if (button) button.disabled = true;
  }
}
