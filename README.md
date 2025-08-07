# Toons - Comic Strip Builder

This project is a cartoon strip builder application targeting both kids and adults who want to create newspaper-style comic strips in HTML5 format.

## 🚀 Current Status - Phase 1 Complete!

✅ **Foundation Architecture**
- Core application structure with App.js, EventBus, and Storage
- Fabric.js canvas integration for interactive editing
- Component-based architecture with extensible design
- Mobile-first responsive layout

✅ **Basic Editor Features**
- 5-cell default comic strip template
- Add/remove cells functionality
- Basic drag & drop asset system
- Canvas with cell boundaries and constraints

✅ **UI Components**
- Toolbar with save/load/export functions
- Asset palette with draggable components
- Responsive design for mobile and desktop

✅ **Export Capabilities**
- SVG export for vector graphics
- PNG export for raster images  
- JSON export for data persistence

## 🎯 Next Phase: Enhanced Assets

The foundation is solid and ready for rapid feature development with Copilot assistance!  

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

## Future 

This is an open ended project.  Assume new features will be added for the forseeable future.