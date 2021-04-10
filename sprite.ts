namespace Grafix {

    export class Sprite {

        _id: string;
        _pX: number;
        _pY: number;
        _vX: number;
        _vY: number;
        _bitmap:number [][];
        _hitBitmap:number [][];
        _width: number;
        _height: number;
        _isBaddy: boolean;
        _isAlive: boolean;
        _health: number;
        _bounds: number[];
        _deltaSum = 0;
        _speedControl = 250;
        _hitFramesToShow = 0;
        _tracker: SpriteTracker;
        _isDying: boolean = false;
        _childSpriteCount: number = 0;
        _twiddleBit = false;
    

        constructor(id: string, startingX: number, startingY: number, xVelocity: number, yVelocity: number, image: number[][], isBaddy: boolean, health: number, bounds: number[], hitBitmap: number[][], speed: number, tracker: SpriteTracker) {
            this._id = id;
            this._pX=startingX;
            this._pY=startingY;
            this._vX=xVelocity;
            this._vY=yVelocity;
            this._bitmap=image;
            this._width = image[0].length; //TODO - assuming bitmap is same width across all rows so can just check the first row
            this._height = image.length;
            this._isBaddy = isBaddy;
            this._isAlive = true;
            this._health = health;
            this._bounds = bounds;
            this._speedControl = speed;
            this._hitBitmap = hitBitmap;
            this._tracker = tracker;
        }

        //This method should be called once per frame of your application and will cause the Sprite to updates its position, shape etc based on current settings
        tick(tic: TickInfo) {     

            if(this._isDying && this._hitFramesToShow <= 0){
                this._isAlive = false;
                this._tracker.spriteDied(this);
                return;
            }

            if(this.canFire(tic)) {
                this.doFire();
            }

            if(this.canMove(tic._delta)) {
                this.doMove(tic)
            } 
        }

        canFire(tic: TickInfo) {
            return false;
        }
        
        doFire() {
            //no op
        }

        canMove(delta: number): boolean {
            this._deltaSum += delta;
            //Logger.debug(this._id + "._canMove: if " + this._deltaSum + ">" + this._speedControl)
            if(this._deltaSum > this._speedControl) {
                this._deltaSum = 0; //reset
                return true;
            } else {
                return false;
            }
        }

        doMove(tic: TickInfo) {
            this._pX = this._pX + this._vX;         
            this._pY = this._pY + this._vY;

            if(this._pX + this._width >= this._bounds[2] || this._pX <= this._bounds[0]) {
                this._vX = -this._vX
            } 

            if(this._pY + this._height >= this._bounds[3]+1|| this._pY <= this._bounds[1]) {
                this._vY = -this._vY
            } 
        }
        
        //This method will be called if the sprite has been hit (maybe it got hit by a missile, or crashed into a robot!)
        public boom(hitStrength: number) {
            this._health = this._health - hitStrength;
            this._isAlive = this._health > 0;
            if(this._isAlive) 
                this._hitFramesToShow = 3 
            else 
                this._tracker.spriteDied(this);
        }

        public getBitmap(): number[][]  {
            if(this._hitFramesToShow > 0) {
                this._hitFramesToShow--
                return this._hitBitmap
            } else {
                return this._bitmap;
            }
        }  

        public getXPosition(): number {
            return this._pX;
        }

        public getYPosition(): number {
            return this._pY;
        }

        public getWidth(): number {
            return this._width;
        }

        public getHeight(): number {
            return this._height;
        }

        public left()  {
            if(this._pX > this._bounds[0]) this._pX = this._pX - 1;
        }
        public right() {
            if(this._pX + this._width <= this._bounds[2]) this._pX = this._pX + 1;
        }

        public up() {
            if(this._pY + this._height <= this._bounds[3]) this._pY = this._pY + 1;
        }

        public down() {
            if(this._pY > this._bounds[1]) this._pY = this._pY - 1;
        }

        public isBaddy():boolean {
            return this._isBaddy;
        }

        public canCollide() {
            return this._isAlive && !this._isDying;
        }

        public getPower(): number {
            return 1;   
        }
        
        newSpriteID() :string {
            return this._id + "::" + this._childSpriteCount;
        }
    }
}

class LazerRound extends Grafix.Sprite {
    
    _power: number; 

    constructor(id: string, startingX: number, startingY: number, xVelocity: number, yVelocity: number, image: number[][], isBaddy: boolean, health: number, bounds: number[], hitBitmap: number[][], speed: number, tracker: SpriteTracker) {
        super(id, startingX, startingY, xVelocity, yVelocity, image, isBaddy, health, bounds, hitBitmap, speed, tracker);
    }

    doMove(tic: TickInfo) {

        this._pX = this._pX + this._vX;         
        this._pY = this._pY + this._vY;

        if(this._pY + this._height > this._bounds[3] || this._pY < this._bounds[1]) {
            this._vY = -this._vY
        } 

        if(this._pX > 32 || this._pX < 0) {
            this._isAlive = false
            this._tracker.spriteDied(this)
        }
    }

}

