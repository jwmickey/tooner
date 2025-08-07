import { Asset } from '../Asset.js';
import { Text, Ellipse, Group, Path } from 'fabric';

/**
 * Speech bubble asset with customizable text and styles
 */
export class SpeechBubble extends Asset {
  constructor(data = {}) {
    super({ ...data, type: 'speechBubble' });
    this.text = data.text || 'Hello!';
    this.bubbleStyle = data.bubbleStyle || 'speech'; // speech, thought, shout
    this.fontSize = data.fontSize || 14;
    this.fontFamily = data.fontFamily || 'Arial';
    this.textColor = data.textColor || '#000000';
    this.bubbleColor = data.bubbleColor || '#ffffff';
    this.borderColor = data.borderColor || '#000000';
    this.borderWidth = data.borderWidth || 2;
    this.tailDirection = data.tailDirection || 'bottom-left'; // bottom-left, bottom-right, top-left, top-right
  }

  render(fabricCanvas) {
    const group = new Group([], {
      left: this.position.x,
      top: this.position.y,
      scaleX: this.scale.x,
      scaleY: this.scale.y,
      angle: this.rotation,
      opacity: this.opacity
    });

    // Create bubble shape based on style
    let bubble;
    switch (this.bubbleStyle) {
      case 'thought':
        bubble = this.createThoughtBubble();
        break;
      case 'shout':
        bubble = this.createShoutBubble();
        break;
      default:
        bubble = this.createSpeechBubble();
    }

    // Create text
    const textObj = new Text(this.text, {
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fill: this.textColor,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      width: 100,
      splitByGrapheme: true
    });

    // Position text in center of bubble
    textObj.set({
      left: 0,
      top: 0
    });

    group.add(bubble);
    group.add(textObj);

    // Add tail
    const tail = this.createTail();
    if (tail) {
      group.add(tail);
    }

    // Store reference for updates
    group.assetId = this.id;
    group.assetData = this;

    return group;
  }

  createSpeechBubble() {
    return new Ellipse({
      rx: 60,
      ry: 40,
      fill: this.bubbleColor,
      stroke: this.borderColor,
      strokeWidth: this.borderWidth,
      originX: 'center',
      originY: 'center'
    });
  }

  createThoughtBubble() {
    // Main thought bubble (cloud-like)
    const bubble = new Ellipse({
      rx: 60,
      ry: 40,
      fill: this.bubbleColor,
      stroke: this.borderColor,
      strokeWidth: this.borderWidth,
      originX: 'center',
      originY: 'center'
    });

    // Add small circles for thought effect (simplified)
    return bubble;
  }

  createShoutBubble() {
    // Create a spiky/jagged bubble using path
    const path = 'M -60,-30 L -40,-40 L -20,-30 L 0,-40 L 20,-30 L 40,-40 L 60,-30 L 60,0 L 60,30 L 40,40 L 20,30 L 0,40 L -20,30 L -40,40 L -60,30 L -60,0 Z';
    
    return new Path(path, {
      fill: this.bubbleColor,
      stroke: this.borderColor,
      strokeWidth: this.borderWidth,
      originX: 'center',
      originY: 'center'
    });
  }

  createTail() {
    // Create simple triangular tail
    const tailPath = 'M 0,0 L 15,20 L -15,20 Z';
    
    return new Path(tailPath, {
      fill: this.bubbleColor,
      stroke: this.borderColor,
      strokeWidth: this.borderWidth,
      left: this.getTailPosition().x,
      top: this.getTailPosition().y
    });
  }

  getTailPosition() {
    switch (this.tailDirection) {
      case 'bottom-left':
        return { x: -30, y: 35 };
      case 'bottom-right':
        return { x: 30, y: 35 };
      case 'top-left':
        return { x: -30, y: -35 };
      case 'top-right':
        return { x: 30, y: -35 };
      default:
        return { x: 0, y: 35 };
    }
  }

  updateText(newText) {
    this.text = newText;
    this.metadata.lastModified = Date.now();
  }

  updateStyle(styleProps) {
    Object.assign(this, styleProps);
    this.metadata.lastModified = Date.now();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      text: this.text,
      bubbleStyle: this.bubbleStyle,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      textColor: this.textColor,
      bubbleColor: this.bubbleColor,
      borderColor: this.borderColor,
      borderWidth: this.borderWidth,
      tailDirection: this.tailDirection
    };
  }

  static fromJSON(data) {
    return new SpeechBubble(data);
  }
}
