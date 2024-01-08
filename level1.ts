class Level1 implements Level {

    _baddyManager: SpriteTracker;
    _goodyManager: SpriteTracker;

    _goody:XWing;
    _baddy:Grafix.Sprite;

    VADER_STRENGTH: number = 5;
    R2D2_STRENGTH: number = 1000;
    GOODY: boolean = false;
    BADDY: boolean = true;

    _baddiesKilled: number = 0;
    _levelStage: number = 1;

    constructor(baddyManager: SpriteTracker, goodyManager: SpriteTracker) {
        this.reset(baddyManager, goodyManager);
    }

    public reset(baddyManager: SpriteTracker, goodyManager: SpriteTracker) {
        this._baddyManager = baddyManager;
        this._goodyManager = goodyManager;
        this._goody = new XWing("R2D2", 0,3,0,0, rocket, this.GOODY, this.R2D2_STRENGTH, _BOUNDS, rocketHit, this._goodyManager);
        this._goodyManager.newSprite(this._goody);
        this._baddy = new TieFighter("Vader", getRandomIntInclusive(16, 25),getRandomIntInclusive(2,4),-1,getRandomIntInclusive(-1, 1), tie, this.BADDY, this.VADER_STRENGTH, [8,0,92,7], tieHitBitmap, this._goody, this._baddyManager);
        this._baddyManager.newSprite(this._baddy);
        this._baddiesKilled = 0;
        for(let i=0; i<5;i++) {
            led.unplot(i,0)
            led.plot(i,4)
        }
    }

    tick(tickInfo: TickInfo) {
        this.applyCollisions(tickInfo._collisions)

        this._goodyManager.getAll().forEach(function (sprite: Grafix.Sprite, index: number) {
            sprite.tick(tickInfo);
        })
        this._baddyManager.getAll().forEach(function (sprite: Grafix.Sprite, index: number) {
            sprite.tick(tickInfo);
        })        

        if(this._levelStage == 1) {
            this.stageOneTick(tickInfo)
        } else if(this._levelStage ==2) {
            this.stageTwoTick(tickInfo) 
        } else {
            this.stageThreeTick(tickInfo)
        }
  
    }
    
    stageOneTick(tickInfo: TickInfo) {
      if(!this._baddy._isAlive) {
            this._baddiesKilled++;
            led.plot(this._baddiesKilled-1, 0);
            if(this._baddiesKilled < 1) {
                this._baddy = new TieFighter("Vader", 26, getRandomIntInclusive(2,4),-1,getRandomIntInclusive(-1, 1), tie, this.BADDY, this.VADER_STRENGTH, [4,0,31,7], tieHitBitmap, this._goody, this._baddyManager);
                this._baddyManager.newSprite(this._baddy);               
            }  else {
                this._baddy = new BombBomb("The Bomb Bomb", 25, 0, 0, 0, theBombBomb, this.BADDY, 20, [8,0,63,7], theBombBombHit, this._goody, this._baddyManager);
                this._baddyManager.newSprite(this._baddy);  
                this._goody._maxActiveShots = 5;
                this._levelStage = 2; 
            }
        }
    }

    stageTwoTick(tickInfo: TickInfo) {
      if(this._baddy._isAlive) {
      } else {
          this._levelStage = 3;
      }
    }

    stageThreeTick(tickInfo: TickInfo) {
        //TODO!
    }


    applyCollisions(collisions: CollisionInfo[]) {
        collisions.forEach(function (collision: CollisionInfo, index: number) {
            collision._spriteA.boom(collision._spriteB.getPower())
            collision._spriteB.boom(collision._spriteA.getPower())
        })
    }

    isComplete():boolean {
        return false;
    }
    
    getName() : string {
        return "Level 1 - Meet the Bomb Bomb!"
    }
}

