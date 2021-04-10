class SpriteManager implements SpriteTracker {

    _sprites: Grafix.Sprite[];
    
    constructor() {
        this._sprites = [];
    }

    public getAll() : Grafix.Sprite[] {
        return this._sprites;
    }

    public newSprite(sprite:Grafix.Sprite) {
        this._sprites.push(sprite);
    }

    public spriteDied(sprite: Grafix.Sprite): void {
        let filteredList: Grafix.Sprite[] = [];
        this._sprites.forEach(function (sprite: Grafix.Sprite, index: number) {
            if(sprite._isAlive) {
                filteredList.push(sprite);
            }
        })
        this._sprites = filteredList;
    }

    public clearAll() {
        this._sprites = [];
    }
}