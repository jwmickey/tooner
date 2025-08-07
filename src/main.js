import './style.css'
import { App } from './core/App.js'

// Initialize the Toons application
const app = new App();

// Make app globally available for debugging
window.ToonsApp = app;

console.log('🎨 Toons Comic Strip Builder initialized!');
