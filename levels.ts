class LevelManager {

    _baddyManager: SpriteManager;
    _goodyManager: SpriteManager;
    _levelOne: Level;

    constructor(baddyManager: SpriteManager, goodyManager: SpriteManager) {
        this._baddyManager = baddyManager;
        this._goodyManager = goodyManager;
        this._levelOne = new Level1(this._baddyManager, this._goodyManager);
    }

    getLevel() : Level {
        return this._levelOne;
    }
}

interface Level {
    tick(tickInfo: TickInfo): void;
    isComplete(): boolean;
    getName() : string;
}
