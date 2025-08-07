import { Asset } from '../Asset.js';
import { Text, Rect, Circle, Path, Group } from 'fabric';

/**
 * Action shape asset for comic book sound effects
 */
export class ActionShape extends Asset {
  constructor(data = {}) {
    super({ ...data, type: 'actionShape' });
    this.text = data.text || 'BAM!';
    this.shapeStyle = data.shapeStyle || 'burst'; // burst, jagged, cloud, simple
    this.fontSize = data.fontSize || 28;
    this.fontFamily = data.fontFamily || 'Arial Black';
    this.textColor = data.textColor || '#ffffff';
    this.backgroundColor = data.backgroundColor || '#ff4444';
    this.borderColor = data.borderColor || '#000000';
    this.borderWidth = data.borderWidth || 3;
    this.shadowEnabled = data.shadowEnabled !== undefined ? data.shadowEnabled : true;
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

    // Create background shape
    const shape = this.createShape();
    
    // Create text
    const textObj = new Text(this.text, {
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fill: this.textColor,
      stroke: this.borderColor,
      strokeWidth: 1,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      fontWeight: 'bold',
      shadow: this.shadowEnabled ? {
        color: 'rgba(0,0,0,0.5)',
        blur: 5,
        offsetX: 2,
        offsetY: 2
      } : null
    });

    // Position text in center
    textObj.set({
      left: 0,
      top: 0
    });

    group.add(shape);
    group.add(textObj);

    // Store reference for updates
    group.assetId = this.id;
    group.assetData = this;

    return group;
  }

  createShape() {
    switch (this.shapeStyle) {
      case 'burst':
        return this.createBurstShape();
      case 'jagged':
        return this.createJaggedShape();
      case 'cloud':
        return this.createCloudShape();
      default:
        return this.createSimpleShape();
    }
  }

  createBurstShape() {
    // Create star-burst pattern
    const points = [];
    const rays = 12;
    const outerRadius = 50;
    const innerRadius = 30;

    for (let i = 0; i < rays * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / rays;
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }

    const pathString = points.reduce((path, point, index) => {
      return path + (index === 0 ? 'M' : 'L') + ` ${point.x},${point.y}`;
    }, '') + ' Z';

    return new Path(pathString, {
      fill: this.backgroundColor,
      stroke: this.borderColor,
      strokeWidth: this.borderWidth,
      originX: 'center',
      originY: 'center'
    });
  }

  createJaggedShape() {
    // Create jagged rectangle
    const width = 100;
    const height = 60;
    const jagSize = 8;
    
    const path = `M ${-width/2},${-height/2 + jagSize} 
                  L ${-width/2 + jagSize},${-height/2} 
                  L ${-width/2 + jagSize*2},${-height/2 + jagSize} 
                  L ${-width/2 + jagSize*3},${-height/2}
                  L ${width/2 - jagSize*3},${-height/2}
                  L ${width/2 - jagSize*2},${-height/2 + jagSize}
                  L ${width/2 - jagSize},${-height/2}
                  L ${width/2},${-height/2 + jagSize}
                  L ${width/2},${height/2 - jagSize}
                  L ${width/2 - jagSize},${height/2}
                  L ${width/2 - jagSize*2},${height/2 - jagSize}
                  L ${width/2 - jagSize*3},${height/2}
                  L ${-width/2 + jagSize*3},${height/2}
                  L ${-width/2 + jagSize*2},${height/2 - jagSize}
                  L ${-width/2 + jagSize},${height/2}
                  L ${-width/2},${height/2 - jagSize} Z`;

    return new Path(path, {
      fill: this.backgroundColor,
      stroke: this.borderColor,
      strokeWidth: this.borderWidth,
      originX: 'center',
      originY: 'center'
    });
  }

  createCloudShape() {
    // Create cloud-like shape with circles
    const group = new Group([]);
    
    // Main body
    const mainCircle = new Circle({
      radius: 30,
      fill: this.backgroundColor,
      stroke: this.borderColor,
      strokeWidth: this.borderWidth,
      originX: 'center',
      originY: 'center'
    });

    // Additional bumps
    const bump1 = new Circle({
      radius: 20,
      fill: this.backgroundColor,
      stroke: this.borderColor,
      strokeWidth: this.borderWidth,
      left: -25,
      top: -10
    });

    const bump2 = new Circle({
      radius: 25,
      fill: this.backgroundColor,
      stroke: this.borderColor,
      strokeWidth: this.borderWidth,
      left: 20,
      top: -15
    });

    group.addWithUpdate(mainCircle);
    group.addWithUpdate(bump1);
    group.addWithUpdate(bump2);

    return group;
  }

  createSimpleShape() {
    return new Rect({
      width: 100,
      height: 60,
      fill: this.backgroundColor,
      stroke: this.borderColor,
      strokeWidth: this.borderWidth,
      originX: 'center',
      originY: 'center',
      rx: 10,
      ry: 10
    });
  }

  updateText(newText) {
    this.text = newText.toUpperCase(); // Action text is usually uppercase
    this.metadata.lastModified = Date.now();
  }

  updateStyle(styleProps) {
    Object.assign(this, styleProps);
    this.metadata.lastModified = Date.now();
  }

  // Predefined action words
  static getCommonActionWords() {
    return [
      'BAM!', 'POW!', 'WHAM!', 'BANG!', 'CRASH!', 'BOOM!',
      'ZAP!', 'KAPOW!', 'THWACK!', 'SMASH!', 'WHOOSH!', 'ZOOM!',
      'ZING!', 'CLANG!', 'THUD!', 'SPLASH!', 'BONK!', 'WHACK!'
    ];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      text: this.text,
      shapeStyle: this.shapeStyle,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      textColor: this.textColor,
      backgroundColor: this.backgroundColor,
      borderColor: this.borderColor,
      borderWidth: this.borderWidth,
      shadowEnabled: this.shadowEnabled
    };
  }

  static fromJSON(data) {
    return new ActionShape(data);
  }
}
