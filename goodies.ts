class XWing extends Grafix.Sprite {

    public _maxActiveShots: number = 2;

    constructor(id: string, startingX: number, startingY: number, xVelocity: number, yVelocity: number, image: number[][], 
                isBaddy: boolean, strength: number, bounds: number[], hitBitmap: number[][],
                 ammoTracker: SpriteTracker) {
        super(id, startingX, startingY, xVelocity, yVelocity, image, isBaddy, strength, bounds, hitBitmap, 150, ammoTracker)
    }
    

    public doMove(tic: TickInfo) {
        if(tic._joystickData._x == -1) {
            this.left()
        } else if (tic._joystickData._x  == 1) {
            this.right();
        }
        if(tic._joystickData._y  == -1) {
            this.down()
        } else if (tic._joystickData._y == 1) {
            this.up();
        }
    }

    public canFire(tic: TickInfo) : boolean {
        return tic._joystickData._aPressed && this._tracker.getAll().length < this._maxActiveShots+1
    }

    public doFire() {
        let ammo = new LazerRound(this.newSpriteID(), this._pX + this._width, this._pY + 1, 1, 0, bullet, this._isBaddy, 1, [0,0,7,31], bullet, 10, this._tracker);
        this._tracker.newSprite(ammo);
    }
}

