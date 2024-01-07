class TieFighter extends Grafix.Sprite {
    
    _target: Grafix.Sprite; //Probably should be a 'positioned' object (new interface?) that we're targeting
    _firedAmmo: Grafix.Sprite[] = [];

    constructor(id: string, startingX: number, startingY: number, xVelocity: number, yVelocity: number, 
                image: number[][], isBaddy: boolean, strength: number, bounds: number[], 
                hitBitmap: number[][], target: Grafix.Sprite, ammoTracker: SpriteTracker) {
        super(id, startingX, startingY, xVelocity, yVelocity, image, isBaddy, strength, bounds, hitBitmap, 100, ammoTracker)
        this._target = target;
    }
    
    canFire(tic: TickInfo) : boolean {
        return (this._target.getYPosition() == this._pY && this.getActiveAmmoCount() < 2) 
    }

    doFire() {
        let ammo = this.buildAmmo();
        this._firedAmmo.push(ammo);
        this._tracker.newSprite(ammo);

        let filteredList: Grafix.Sprite[] = [];
        this._firedAmmo.forEach(function (sprite: Grafix.Sprite, index: number) {
            if(sprite._isAlive) {
                filteredList.push(sprite);
            }
        })
        this._firedAmmo = filteredList;
    }

    buildAmmo(): Grafix.Sprite {
        return new LazerRound(this.newSpriteID(), this._pX, this._pY, -1, 0, bullet, true, 2, this._bounds, bullet, 10, this._tracker);
    }

    getActiveAmmoCount(): number {
        let numberOfActiveAmmo = 0;
        this._firedAmmo.forEach(function (bullet: Grafix.Sprite, index: number) {
            if (bullet._isAlive) {
                numberOfActiveAmmo++;
            }
        })
        return numberOfActiveAmmo;
    }
}

class BombBomb extends TieFighter {

    _vBar: Grafix.Sprite;

    buildAmmo(): Grafix.Sprite {

        this._twiddleBit = !this._twiddleBit;
        
        if(this._vBar === undefined || !this._vBar._isAlive && this._twiddleBit) {
            this._vBar = new LazerRound(this.newSpriteID(), this._pX+3, 0, -1, 0, vBar, true, 6, _BOUNDS, vBar, 150, this._tracker);     
            return this._vBar;
        }
        
        return new TieFighter(this.newSpriteID(), 26, getRandomIntInclusive(2,4),-1, 1, tie, true, 3, [4,0,63,7], tieHitBitmap, this._target, this._tracker);

    }
    
     canFire(tic: TickInfo): boolean {
        let canFire = true;
       
        //Delay firing by checking that anything fired so far has travelled a few pixels
        this._firedAmmo.forEach(function (bullet: Grafix.Sprite, index: number) {
            if (bullet._isAlive && bullet._pX > 19) {
                canFire = false;        
            }
        })
        
       return canFire;
    }
}

