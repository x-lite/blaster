class GameManager {
   
    _sprites: Grafix.Sprite[]; 
    _baddies: Grafix.Sprite[];
    _goodies: Grafix.Sprite[];
    
    _baddyManager: SpriteManager;
    _goodyManager: SpriteManager;
    _levelManager: LevelManager;

    _lastTick: number;

    _buttonAPressed: boolean;
    _buttonBPressed: boolean;

    _pause: number = 50;
    
    constructor() {
        input.onButtonPressed(Button.A, function () {
            this._buttonAPressed = true;
        })
        input.onButtonPressed(Button.B, function () {
            this._buttonBPressed = true;
        })
       this.reset();
    }

    reset() {
        this._baddyManager = new SpriteManager();
        this._goodyManager = new SpriteManager();
        this._levelManager = new LevelManager(this._baddyManager, this._goodyManager);
        this._baddies = [];
        this._goodies = [];
        this._lastTick = 0;
        this._buttonAPressed = false;
        this._buttonBPressed = false;
    }

    /*
     *  Called by main.ts to drive the game
     */
    nextIteration() {

        if(this._buttonBPressed) {
            this.reset();
            return;
        }

        let delta = input.runningTime() - this._lastTick;
        this._lastTick = input.runningTime();
        
        this._baddies = this._baddyManager.getAll();
        this._goodies = this._goodyManager.getAll();
        this._sprites = []
        this._sprites = this._sprites.concat(this._baddies);
        this._sprites = this._sprites.concat(this._goodies);

        let joystickData = this.readJoystick();
        let collisionInfo = this.checkCollisions(); 
        let tickInfo = new TickInfo(delta, joystickData, collisionInfo)
        
        this._levelManager.getLevel().tick(tickInfo);   //TODO - is it better to call tick on the manager, or ask for level and call tick on the level?
        Display.render(this._sprites); 
        basic.pause(this._pause);
        
    }

    private readJoystick(): JoystickData {
        let aPressed = this._buttonAPressed;
        let bPressed = this._buttonBPressed;
        this._buttonAPressed = false;
        this._buttonBPressed = false;
        return new JoystickData(Joystick.getX(), Joystick.getY(), aPressed, bPressed);
    }

    private checkCollisions(): CollisionInfo[] {

        let collisions: CollisionInfo[] = [];
            
        this._goodies.forEach(function(goody: Grafix.Sprite, index: number) {
            this.checkForCollisionWithBaddiesAndAddIfFound(goody, collisions);
        });

        return collisions;
    }

    private checkForCollisionWithBaddiesAndAddIfFound(obj: Grafix.Sprite, collisions: CollisionInfo[]) {
        this._baddies.forEach(function (baddy: Grafix.Sprite, index: number) {
            if(baddy.canCollide()) {
                if(this.spritesOverlap(baddy, obj)) {
                    collisions.push(new CollisionInfo(obj, baddy));
                } 
            }   
        });
    }

    private spritesOverlap(spriteA: Grafix.Sprite, spriteB: Grafix.Sprite): boolean {
        let horizontalOverlap = 
            spriteA.getXPosition() <= spriteB.getXPosition() + spriteB.getWidth() &&
            spriteA.getXPosition() + spriteA.getWidth() >= spriteB.getXPosition() 

        let verticalOverlap =
            spriteA.getYPosition() < spriteB.getYPosition() + spriteB.getHeight() &&
            spriteA.getYPosition() + spriteA.getHeight() > spriteB.getYPosition();

        return horizontalOverlap && verticalOverlap;
    }
}

class CollisionInfo {
    public _spriteA: Grafix.Sprite;
    public _spriteB: Grafix.Sprite;
    constructor(objectA: Grafix.Sprite, objectB: Grafix.Sprite) {
        this._spriteA = objectA;
        this._spriteB = objectB;
    }
}

class JoystickData {
    public _x: number;
    public _y: number;
    public _aPressed: boolean;
    public _bPressed: boolean;
    constructor(x: number, y:number, buttonAPressed: boolean, buttonBPressed: boolean) {
        this._x = x;
        this._y =y;
        this._aPressed = buttonAPressed;
        this._bPressed = buttonBPressed;
    }
}

class TickInfo {
    public _delta: number;
    public _joystickData: JoystickData;
    public _collisions: CollisionInfo[];

    constructor(delta: number, joystickData: JoystickData, collisions: CollisionInfo[]) {
        this._delta = delta;
        this._joystickData = joystickData;
        this._collisions = collisions;
    }
}

interface SpriteTracker {
    newSprite(sprite: Grafix.Sprite): void;
    spriteDied(sprite: Grafix.Sprite): void;
    getAll():Grafix.Sprite[];
    clearAll(): void;
}