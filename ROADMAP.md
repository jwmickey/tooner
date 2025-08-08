# Toons Roadmap

This roadmap outlines major features and improvements for the Toons Comic Strip Builder. It is organized into deliverable feature specs so a developer or AI agent can implement each item with minimal ambiguity.

Conventions
- Stack: Vanilla JS (ES modules), Fabric.js v6.7.x, Vite
- Architecture: App.js (controller), EventBus.js (events), Storage.js (persistence), Models (ComicStrip, Cell, Asset, Components), Views (Editor, AssetPalette, Toolbar, PropertiesPanel)
- Patterns: Event-driven, mobile-first, responsive, SVG-first graphics

Legend
- Dep: feature dependencies
- EB: EventBus contract (events to emit/listen)
- Data: model/schema impacts
- AC: acceptance criteria

---

## 1) Asset Versioning System (Core)
Goal: Track versions of assets (including custom ones) with metadata and enable revert/compare.

Scope
- Version node per asset with semver-like version (major.minor.patch), author, timestamp, diff metadata.
- Automatic version bump on significant changes; manual version tagging.
- Revert to prior version; duplicate as new variant.

Data
- Asset.metadata.version: string, default "0.1.0"
- Asset.metadata.history: Array<{ version, at, by, diff }>
- Storage keyspace: asset-versions/<assetId>.json

EB
- Emit: `asset:version:bumped`, `asset:version:reverted`, `asset:version:tagged`
- Listen: `asset:propertyChanged`, `asset:save`

Implementation
- Diff: shallow compare of public props; record changed keys.
- Bump rules: text/style change -> patch; structural (shapeStyle/bubbleStyle/type) -> minor; asset class change -> major.
- UI: PropertiesPanel “Version” group (view history, revert, tag).

Dep: none

AC
- Changing properties creates a history entry and increments version by rule.
- Revert restores visual state and data; canvas updates immediately.

---

## 2) Custom Asset Editor (Vector Drawing)
Goal: Users draw custom shapes/assets and save for reuse.

Scope
- Modal/editor view with Fabric drawing tools: pen/path, rect, ellipse, polygon, group, boolean union (approx via path combine), fill/stroke.
- Save as `Asset` subtype: `customShape` with embedded path/group JSON.

Data
- New Asset.type: `customShape`
- Asset.payload: Fabric JSON or SVG path data

EB
- Emit: `assetLibrary:created`, `assetLibrary:updated`
- Listen: `palette:openCustomEditor`, `asset:drop(customShape)`

Implementation
- Use Fabric free drawing or path parsing; normalize to group.
- Export/import Fabric JSON for reproducibility.
- Palette category “My Assets”.

Dep: 1) Versioning (optional)

AC
- Draw, save, and drag custom assets onto a cell.
- Saved asset retains appearance on reload/export.

---

## 3) Background Pattern Library
Goal: Rich background presets (cityscape, nature, weather) with color themes.

Scope
- Presets as vector groups or tiled patterns.
- Parameters: theme color, density, parallax layers.

Data
- Cell.background: { type: 'pattern'|'solid', pattern?: string, color?: string, params?: object }

EB
- Emit: `background:applied`
- Listen: `asset:drop(background)`, `background:pick`

Implementation
- Fabric pattern brushes or grouped SVG assets scaled to cell bounds.
- PropertiesPanel section for background when cell is active.

Dep: none

AC
- Selecting a background preset updates the cell and re-renders.
- Export to SVG preserves background vectors.

---

## 4) Character Pose & Expression Editor
Goal: Edit character pose, expression, and body part proportions.

Scope
- Sliders/controls per body part (rotation/length/visibility) and predefined poses.
- Expression presets mapped to mouth/eyes paths.

Data
- Character.bodyParts: map of segments with size/angle/visible
- Character.pose: string; Character.expression: string

EB
- Emit: `character:poseChanged`, `character:expressionChanged`
- Listen: `object:selected(character)`

Implementation
- Rebuild group or update child transforms on change.
- Save presets in JSON for reuse.

Dep: 1) Versioning (optional)

AC
- Pose changes update immediately; saved in model and export.

---

## 5) Advanced Text & Comic Fonts
Goal: Rich text features (font family, weight, stroke, outline, alignment, balloon padding/auto-fit).

Scope
- Speech/action text: font family picker (include comic-safe web fonts), stroke width, outline color, letter spacing, text transform.
- Auto-resize bubble to fit text (min/max size, padding).

Data
- SpeechBubble: fontFamily, strokeWidth, outlineColor, letterSpacing, textTransform, padding
- ActionShape: similar where relevant

EB
- Emit: `text:metricsChanged`
- Listen: `asset:propertyChanged(text*)`

Implementation
- Use Fabric.Textbox for wrapping, compute bounding box; adjust bubble radii/path points accordingly.
- Load fonts via @font-face; fallback stack.

Dep: none

AC
- Changing font metrics immediately reflows text and adjusts bubble size when auto-fit is on.

---

## 6) Snap/Grid/Guides
Goal: Precise alignment with grid snapping, smart guides, and nudge.

Scope
- Toggle grid overlay per active cell; configurable grid size.
- Snap to grid/edges/centers during move/scale/rotate.
- Arrow key nudge (1px) with Shift (10px).

Data
- EditorPrefs: { gridSize, showGrid, snapMode }

EB
- Listen: `object:moving|scaling|rotating`

Implementation
- Use Fabric transform callbacks to clamp positions; draw grid on canvas background layer.

Dep: none

AC
- Objects snap visually; toggles persist across sessions.

---

## 7) Templates & Layout Presets
Goal: Start from common strip layouts and cell aspect ratios.

Scope
- Presets for 1x3, 1x4, 2x3, Sunday multi-row layouts; cell aspect enforcement.
- Add/remove cell maintains layout constraints.

Data
- ComicStrip.layout: { preset: string, rows: number, cols: number, aspect: number }

EB
- Emit: `layout:applied`

Implementation
- Layout manager calculates cell bounds for active canvas view and thumbnails.

Dep: 6) Grid (optional for drawing guides)

AC
- Switching template rearranges cells; existing assets stay within bounds.

---

## 8) Multi-Select & Bulk Operations
Goal: Select multiple assets to move/align/distribute/lock/group.

Scope
- Drag marquee, shift-click; alignment and distribution; lock/unlock; group/ungroup.

Data
- Group assets tracked as grouped Fabric objects with child assetIds.

EB
- Emit: `selection:changed`, `group:created|ungrouped`

Implementation
- Leverage Fabric activeSelection and grouping APIs; map back to model for persistence.

Dep: none

AC
- Bulk operations update both canvas and data model correctly.

---

## 9) History (Undo/Redo) & Checkpointing
Goal: Robust undo/redo across canvas and model changes.

Scope
- Command stack with coalescing (e.g., continuous move/typing).
- Named checkpoints and autosave.

Data
- History entries: { do, undo, label, timestamp }

EB
- Emit: `history:push`, `history:undo`, `history:redo`
- Listen: all mutating events

Implementation
- Wrap mutating actions in command objects; keyboard shortcuts Cmd/Ctrl+Z/Y.

Dep: 1) Versioning (optional)

AC
- Undo/redo restores state without desync between model and canvas.

---

## 10) Export & Sharing Enhancements
Goal: Flexible exports and share flows.

Scope
- Export per-cell PNG/SVG, full strip PNG/SVG/PDF, and JSON bundle with assets.
- Transparent background option; DPI scaling; filename templating.
- Share link (local or cloud) with embedded JSON.

Data
- ExportPrefs: { format, scale, transparent, naming }

EB
- Emit: `export:started|finished|failed`

Implementation
- Fabric.toDataURL with multiplier; SVG assembly for full strips; optional PDF via client-side lib.

Dep: 7) Templates (for pagination), 1) Versioning (include metadata)

AC
- Exports meet settings and include correct backgrounds/assets.

---

## 11) Collaboration (Turn-based, Optional Realtime)
Goal: Multiple users work on a strip with conflict handling.

Scope
- Turn-based: lock strip while editing; realtime later with CRDT or OT.

Data
- Lock record; change log per asset/cell.

EB
- Emit: `collab:lock|unlock|update`

Implementation
- Minimal: local-only simulation or simple backend adapter interface.

Dep: 9) History (change log reuse)

AC
- Only one active editor at a time in turn-based mode; changes sync when unlocked.

---

## 12) Plugin API (Extensibility)
Goal: Allow third-party asset types, tools, and exporters.

Scope
- Sandbox plugin loader; plugin manifest; lifecycle hooks.

Data
- Plugin registry metadata

EB
- Hooks: `plugin:register`, `plugin:unregister`

Implementation
- Define minimal adapter interfaces: AssetRenderer, Tool, Exporter; dynamically add palette entries and toolbar buttons.

Dep: 10) Export Enhancements (to support exporters)

AC
- Example plugin can register a new Asset type with rendering and export.

---

## 13) Accessibility & Keyboard Shortcuts
Goal: Meet basic a11y; power user shortcuts.

Scope
- Focus order, ARIA labels; keyboard operations for selection, nudge, delete, layer changes.

Data
- Shortcut map persisted in settings.

EB
- Emit: `ui:focusChanged`, `shortcut:invoked`

Implementation
- Add aria-* to panels; implement central shortcut manager.

Dep: none

AC
- App is navigable without a mouse for core tasks.

---

## 14) Localization (i18n) & Theming
Goal: Translate UI and support light/dark/custom themes.

Scope
- i18n messages JSON; theme tokens in CSS variables.

Data
- Settings: { locale, theme }

EB
- Emit: `i18n:changed`, `theme:changed`

Implementation
- Simple i18n formatter; CSS variables for colors/spacing; theme switcher.

Dep: none

AC
- Strings switch language at runtime; theme updates without reload.

---

## 15) Performance & Virtualization
Goal: Keep editor responsive with large strips and many assets.

Scope
- Virtualize thumbnails; memoize previews; lazy-load heavy assets; batch renders with requestRenderAll.

Data
- Thumbnail cache index and invalidation rules

EB
- Emit: `perf:throttle` when inputs flood

Implementation
- Use offscreen StaticCanvas for thumbnails (in place); cache per cell; invalidate on cell mutation only.

Dep: none

AC
- Smooth UI with >20 cells and >200 assets; FPS stays acceptable.

---

## 16) QA & Testing Harness
Goal: Protect core flows with automated tests.

Scope
- Unit tests for models and utilities; integration smoke for rendering and events; visual regression for thumbnails.

Implementation
- Add lightweight test runner (e.g., Vitest) and snapshot tests for export and thumbnail data URLs.

Dep: none

AC
- CI green on PR; key regressions caught by snapshots.

---

# Milestones
- M1 (Core polish): 5, 6, 7, 9, 10, 15, 16
- M2 (Creation power): 2, 3, 4, 1
- M3 (Scale & share): 11, 12, 13, 14

# Risks & Mitigations
- Font loading variability: preload and fallback; measure text after font load event.
- Fabric group bounds precision: normalize origins and call setCoords after updates; requestRenderAll pattern.
- Large SVG size: reuse symbols/defs; deduplicate gradients; optional rasterize backgrounds in PNG export.

# Implementation Notes (General)
- Prefer emitting high-level events from views; centralize model mutation in Editor or Models.
- Keep cell-relative coordinates in model; convert to absolute with cellOffset for canvas placement.
- For thumbnails, use StaticCanvas -> dataURL -> cache -> draw into <canvas>; invalidate cache on cell mutations only.
