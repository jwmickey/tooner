import { Asset } from '../Asset.js';
import { Circle, Ellipse, Rect, Group, Path } from 'fabric';

/**
 * Character asset for comic strip figures
 */
export class Character extends Asset {
  constructor(data = {}) {
    super({ ...data, type: 'character' });
    this.characterType = data.characterType || 'simple'; // simple, human, animal, custom
    this.bodyParts = data.bodyParts || this.getDefaultBodyParts();
    this.pose = data.pose || 'standing'; // standing, sitting, running, jumping
    this.expression = data.expression || 'neutral'; // neutral, happy, sad, angry, surprised
    this.outfit = data.outfit || 'casual';
    this.skinColor = data.skinColor || '#fdbcb4';
    this.hairColor = data.hairColor || '#8b4513';
    this.clothingColors = data.clothingColors || {
      shirt: '#4169e1',
      pants: '#000080'
    };
  }

  getDefaultBodyParts() {
    return {
      head: { size: 1, visible: true },
      body: { size: 1, visible: true },
      leftArm: { size: 1, visible: true, angle: 0 },
      rightArm: { size: 1, visible: true, angle: 0 },
      leftLeg: { size: 1, visible: true, angle: 0 },
      rightLeg: { size: 1, visible: true, angle: 0 }
    };
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

    switch (this.characterType) {
      case 'human':
        this.renderHumanCharacter(group);
        break;
      case 'animal':
        this.renderAnimalCharacter(group);
        break;
      case 'custom':
        this.renderCustomCharacter(group);
        break;
      default:
        this.renderSimpleCharacter(group);
    }

    // Store reference for updates
    group.assetId = this.id;
    group.assetData = this;

    return group;
  }

  renderSimpleCharacter(group) {
    // Simple stick figure style
    
    // Head
    const head = new Circle({
      radius: 15,
      fill: this.skinColor,
      stroke: '#000',
      strokeWidth: 2,
      left: 0,
      top: -25,
      originX: 'center',
      originY: 'center'
    });

    // Body
    const body = new Rect({
      width: 20,
      height: 30,
      fill: this.clothingColors.shirt,
      stroke: '#000',
      strokeWidth: 2,
      left: 0,
      top: 0,
      originX: 'center',
      originY: 'center'
    });

    // Arms
    const leftArm = new Rect({
      width: 3,
      height: 20,
      fill: this.skinColor,
      stroke: '#000',
      strokeWidth: 1,
      left: -15,
      top: -5,
      originX: 'center',
      originY: 'top'
    });

    const rightArm = new Rect({
      width: 3,
      height: 20,
      fill: this.skinColor,
      stroke: '#000',
      strokeWidth: 1,
      left: 15,
      top: -5,
      originX: 'center',
      originY: 'top'
    });

    // Legs
    const leftLeg = new Rect({
      width: 5,
      height: 25,
      fill: this.clothingColors.pants,
      stroke: '#000',
      strokeWidth: 1,
      left: -5,
      top: 15,
      originX: 'center',
      originY: 'top'
    });

    const rightLeg = new Rect({
      width: 5,
      height: 25,
      fill: this.clothingColors.pants,
      stroke: '#000',
      strokeWidth: 1,
      left: 5,
      top: 15,
      originX: 'center',
      originY: 'top'
    });

    // Add facial features based on expression
    this.addFacialFeatures(group, 0, -25);

    group.add(head);
    group.add(body);
    group.add(leftArm);
    group.add(rightArm);
    group.add(leftLeg);
    group.add(rightLeg);
  }

  renderHumanCharacter(group) {
    // More detailed human character
    
    // Head (oval)
    const head = new Ellipse({
      rx: 12,
      ry: 15,
      fill: this.skinColor,
      stroke: '#000',
      strokeWidth: 2,
      left: 0,
      top: -25,
      originX: 'center',
      originY: 'center'
    });

    // Hair
    const hair = new Ellipse({
      rx: 14,
      ry: 10,
      fill: this.hairColor,
      stroke: '#000',
      strokeWidth: 1,
      left: 0,
      top: -35,
      originX: 'center',
      originY: 'center'
    });

    // Torso
    const torso = new Ellipse({
      rx: 15,
      ry: 20,
      fill: this.clothingColors.shirt,
      stroke: '#000',
      strokeWidth: 2,
      left: 0,
      top: 5,
      originX: 'center',
      originY: 'center'
    });

    // Arms (more rounded)
    const leftArm = new Ellipse({
      rx: 4,
      ry: 15,
      fill: this.skinColor,
      stroke: '#000',
      strokeWidth: 1,
      left: -20,
      top: -5,
      originX: 'center',
      originY: 'center'
    });

    const rightArm = new Ellipse({
      rx: 4,
      ry: 15,
      fill: this.skinColor,
      stroke: '#000',
      strokeWidth: 1,
      left: 20,
      top: -5,
      originX: 'center',
      originY: 'center'
    });

    // Legs
    const leftLeg = new Ellipse({
      rx: 6,
      ry: 20,
      fill: this.clothingColors.pants,
      stroke: '#000',
      strokeWidth: 1,
      left: -7,
      top: 35,
      originX: 'center',
      originY: 'center'
    });

    const rightLeg = new Ellipse({
      rx: 6,
      ry: 20,
      fill: this.clothingColors.pants,
      stroke: '#000',
      strokeWidth: 1,
      left: 7,
      top: 35,
      originX: 'center',
      originY: 'center'
    });

    // Add facial features
    this.addFacialFeatures(group, 0, -25);

    group.add(hair);
    group.add(head);
    group.add(torso);
    group.add(leftArm);
    group.add(rightArm);
    group.add(leftLeg);
    group.add(rightLeg);
  }

  renderAnimalCharacter(group) {
    // Simple cat character as example
    
    // Body
    const body = new Ellipse({
      rx: 20,
      ry: 15,
      fill: '#ffa500',
      stroke: '#000',
      strokeWidth: 2,
      left: 0,
      top: 10,
      originX: 'center',
      originY: 'center'
    });

    // Head
    const head = new Circle({
      radius: 18,
      fill: '#ffa500',
      stroke: '#000',
      strokeWidth: 2,
      left: 0,
      top: -20,
      originX: 'center',
      originY: 'center'
    });

    // Ears
    const leftEar = new Path('M -10,-15 L -5,-25 L -15,-20 Z', {
      fill: '#ffa500',
      stroke: '#000',
      strokeWidth: 1,
      left: -5,
      top: -35
    });

    const rightEar = new Path('M 10,-15 L 5,-25 L 15,-20 Z', {
      fill: '#ffa500',
      stroke: '#000',
      strokeWidth: 1,
      left: 5,
      top: -35
    });

    // Tail
    const tail = new Ellipse({
      rx: 3,
      ry: 15,
      fill: '#ffa500',
      stroke: '#000',
      strokeWidth: 1,
      left: 25,
      top: 5,
      originX: 'center',
      originY: 'center'
    });

    // Add animal facial features
    this.addAnimalFacialFeatures(group, 0, -20);

    group.add(body);
    group.add(head);
    group.add(leftEar);
    group.add(rightEar);
    group.add(tail);
  }

  renderCustomCharacter(group) {
    // Placeholder for custom character rendering
    this.renderSimpleCharacter(group);
  }

  addFacialFeatures(group, x, y) {
    // Eyes
    const leftEye = new Circle({
      radius: 2,
      fill: '#000',
      left: x - 5,
      top: y - 2
    });

    const rightEye = new Circle({
      radius: 2,
      fill: '#000',
      left: x + 5,
      top: y - 2
    });

    // Mouth based on expression
    let mouth;
    switch (this.expression) {
      case 'happy':
        mouth = new Path('M -5,5 Q 0,10 5,5', {
          stroke: '#000',
          strokeWidth: 2,
          fill: '',
          left: x,
          top: y
        });
        break;
      case 'sad':
        mouth = new Path('M -5,8 Q 0,3 5,8', {
          stroke: '#000',
          strokeWidth: 2,
          fill: '',
          left: x,
          top: y
        });
        break;
      case 'surprised':
        mouth = new Circle({
          radius: 3,
          stroke: '#000',
          strokeWidth: 2,
          fill: '',
          left: x,
          top: y + 5
        });
        break;
      default: // neutral
        mouth = new Path('M -3,5 L 3,5', {
          stroke: '#000',
          strokeWidth: 2,
          left: x,
          top: y
        });
    }

    group.add(leftEye);
    group.add(rightEye);
    group.add(mouth);
  }

  addAnimalFacialFeatures(group, x, y) {
    // Animal eyes (larger)
    const leftEye = new Circle({
      radius: 3,
      fill: '#000',
      left: x - 6,
      top: y - 3
    });

    const rightEye = new Circle({
      radius: 3,
      fill: '#000',
      left: x + 6,
      top: y - 3
    });

    // Nose
    const nose = new Path('M 0,2 L -2,5 L 2,5 Z', {
      fill: '#000',
      left: x,
      top: y
    });

    // Whiskers
    const leftWhisker1 = new Path('M -15,2 L -8,0', {
      stroke: '#000',
      strokeWidth: 1,
      left: x,
      top: y
    });

    const leftWhisker2 = new Path('M -15,5 L -8,3', {
      stroke: '#000',
      strokeWidth: 1,
      left: x,
      top: y
    });

    const rightWhisker1 = new Path('M 15,2 L 8,0', {
      stroke: '#000',
      strokeWidth: 1,
      left: x,
      top: y
    });

    const rightWhisker2 = new Path('M 15,5 L 8,3', {
      stroke: '#000',
      strokeWidth: 1,
      left: x,
      top: y
    });

    group.add(leftEye);
    group.add(rightEye);
    group.add(nose);
    group.add(leftWhisker1);
    group.add(leftWhisker2);
    group.add(rightWhisker1);
    group.add(rightWhisker2);
  }

  updateExpression(expression) {
    this.expression = expression;
    this.metadata.lastModified = Date.now();
  }

  updatePose(pose) {
    this.pose = pose;
    this.metadata.lastModified = Date.now();
  }

  updateColors(colors) {
    Object.assign(this, colors);
    this.metadata.lastModified = Date.now();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      characterType: this.characterType,
      bodyParts: this.bodyParts,
      pose: this.pose,
      expression: this.expression,
      outfit: this.outfit,
      skinColor: this.skinColor,
      hairColor: this.hairColor,
      clothingColors: this.clothingColors
    };
  }

  static fromJSON(data) {
    return new Character(data);
  }

  // Predefined character types
  static getCharacterTypes() {
    return [
      { type: 'simple', name: 'Simple Figure' },
      { type: 'human', name: 'Human Character' },
      { type: 'animal', name: 'Animal Character' },
      { type: 'custom', name: 'Custom Character' }
    ];
  }

  static getExpressions() {
    return ['neutral', 'happy', 'sad', 'angry', 'surprised', 'confused', 'excited'];
  }

  static getPoses() {
    return ['standing', 'sitting', 'running', 'jumping', 'waving', 'pointing'];
  }
}
