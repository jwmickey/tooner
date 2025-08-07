# Toons - Comic Strip Builder

This project is a cartoon strip builder application targeting both kids and adults who want to create newspaper-style comic strips in HTML5 format.

## 🚀 Current Status - Phase 2 Complete! 

### ✅ **Phase 1: Foundation Architecture**
- Core application structure with App.js, EventBus, and Storage
- Fabric.js canvas integration for interactive editing
- Component-based architecture with extensible design
- Mobile-first responsive layout

### ✅ **Phase 2: Enhanced Assets & Editing**
- **Advanced Asset Classes**: SpeechBubble, ActionShape, and Character with rich customization
- **Enhanced Asset Palette**: Organized by categories with multiple variants per asset type
- **Properties Panel**: Real-time editing of selected assets with transform controls, text editing, and style options
- **Quick Add Buttons**: Toolbar shortcuts for rapid asset placement
- **Multiple Asset Variants**:
  - Speech bubbles: Regular, thought bubbles, shout bubbles
  - Action shapes: Burst, jagged, cloud, and simple styles with preset action words
  - Characters: Simple stick figures, detailed humans, and animal characters
- **Advanced Interactions**: Asset selection, property editing, layer management (bring to front/back)
- **Smart Defaults**: Random action words, automatic character expressions, intelligent color schemes

### 🎯 **What's Working Now:**
1. **Drag & Drop**: Drag assets from organized palette onto comic cells
2. **Asset Editing**: Click any asset to edit properties in the right panel
3. **Multiple Styles**: Each asset type has multiple visual styles
4. **Real-time Updates**: Changes to properties instantly update the canvas
5. **Quick Actions**: Toolbar buttons for instant asset addition
6. **Layer Management**: Bring assets to front or back, delete selected assets
7. **Background Changes**: Drop background assets to change cell colors/patterns

### � **Ready for Phase 3:**
The enhanced asset system provides a solid foundation for:
- Custom asset editor with drawing tools
- Background pattern library (cityscape, nature, weather)
- Character pose and expression editor
- Asset versioning and custom asset library
- Advanced text formatting and comic fonts  

## Components

The cartoon strip should support some built-in components that the user can drag and drop onto a new cell in the strip.

* Speech Bubble - a text bubble to hold text.
* Action Shapes - drop-in shapes to hold emphasis words like "BAM", "WHAM", "WHOA", "ZING", etc. 
* Backgrounds 
  - cityscape (buildings, streets, skyline, etc.)
  - nature (hillside, ocean, lake, etc.)
  - simple colors
  - weather events (rain, snow, wind, etc.)
* Characters 
  - simple pre-defined characters  
  - custom characters made in the asset editor
  - animals and pets

## Comic Strip Entry

Each comic strip entry should have metadata for title, optional description, date, and author.  

Comic strips should be mobile-first, but also scale up for a good desktop view.  Use vectors to ensure scalability.

## Editor

The editor should provide a comic strip template pre-populated with 5 empty cells.  The user can add or remove as many cells as required.  Each cell should be able to accept one or more backgrounds (white by default) and any other assets available from the inventory.

A custom asset editor should allow for creating custom shapes or characters.  A specific character editor allows for creating humanoid figures in various art styles, with simple draggable controls to change shape inputs in real-time.

Custom assets should be versionable.

## 🛠️ Technology Stack
- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Canvas**: Fabric.js v6.7.1 for interactive graphics
- **Build Tool**: Vite v7.0.6 with hot reload development server
- **Storage**: Browser localStorage with JSON serialization
- **Design**: Mobile-first responsive design principles

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build
```

## 📝 Current Usage
1. **Create Comics**: Start with 5-cell template displayed on canvas
2. **Add Assets**: Drag speech bubbles (💬), action shapes (💥), characters (🚶) from left palette
3. **Position & Scale**: Click assets to select, drag to move, drag corners to resize
4. **Multiple Variants**: Try different speech bubble styles, action effects, character types
5. **Backgrounds**: Drag background assets (🎨) to change cell colors and patterns

## 🎨 Implemented Asset Types

### Speech Bubbles
- **Speech** (💬): Standard dialogue bubbles with "Hello!" default text
- **Thought** (💭): Cloud-style thought bubbles  
- **Shout** (📢): Emphasized speech for loud dialogue

### Action Shapes  
- **Burst** (💥): Explosive-style text effects
- **Jagged** (⚡): Lightning/electric style effects
- **Cloud** (☁️): Soft cloud-style emphasis
- Random action words: BAM!, POW!, WHAM!, BANG!, CRASH!, BOOM!, ZAP!, KAPOW!

### Characters
- **Simple** (🚶): Basic stick figure representations
- **Human** (👤): Detailed human character placeholders  
- **Animal** (🐱): Animal character placeholders

### Backgrounds
- **Solid Color** (🎨): Random color selection for cell backgrounds
- **Cityscape** (🏙️): Urban environment patterns (planned)
- **Nature** (🌳): Outdoor scene patterns (planned)

## Editor Features

The editor provides a comic strip template pre-populated with 5 empty cells. Users can add or remove cells as required. Each cell accepts one or more backgrounds (white by default) and any other assets available from the inventory.

Drag and drop functionality is fully implemented with:
- Visual feedback during dragging
- Smart cell detection and positioning
- Asset constraint within cell boundaries
- Transform controls for scaling and rotation
- Persistent storage of comic strip data

## Future Roadmap

This is an open-ended project with planned features including:
- Custom asset editor with drawing tools
- Advanced text formatting and comic fonts
- Character pose and expression editor  
- Asset versioning and custom library
- Properties panel for detailed asset editing
- Export functionality (SVG/PNG/JSON)
- Collaborative editing features
- Publishing and sharing capabilities
