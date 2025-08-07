<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project: Toons - Comic Strip Builder

This is a cartoon strip builder application targeting both kids and adults who want to create newspaper-style comic strips.

Use Fabric.js version 6.  Reference the Fabric.js documentation for API details: https://fabricjs.com/docs/ or 
read the #githubRepo at https://github.com/fabricjs/fabric.js

### Architecture:
- **Core**: App.js (main controller), EventBus.js (communication), Storage.js (persistence)
- **Models**: ComicStrip.js, Cell.js, Asset.js (data models)
- **Views**: Editor (Fabric.js canvas), AssetPalette (drag/drop), Toolbar (controls)
- **Graphics**: Uses Fabric.js for interactive canvas manipulation and SVG export

### Key Features:
- Drag and drop assets (speech bubbles, action shapes, characters, backgrounds)
- 5-cell default template with add/remove cell functionality  
- Mobile-first responsive design with desktop scaling
- SVG/PNG/JSON export capabilities
- Local storage persistence
- Asset versioning system (planned)

### Development Guidelines:
- Use ES6 modules and modern JavaScript
- Follow event-driven architecture with EventBus
- Maintain mobile-first responsive design
- Ensure all components are extensible for future features
- Use semantic HTML and accessible design patterns- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a modern HTML5 + JavaScript web project scaffolded with Vite. Use best practices for vanilla JS and web development.
