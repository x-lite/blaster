let _BOUNDS: number[] = [0,0,31,7];

namespace Display {

    const _NOOP = 0 // no-op (do nothing, doesn't change current status)
    const _BLIP=9
    const _DIGIT = [1, 2, 3, 4, 5, 6, 7, 8] // digit (LED column)
    const _DECODEMODE = 9 // decode mode (1=on, 0-off; for 7-segment display on MAX7219, no usage here)
    const _INTENSITY = 10 // intensity (LED brightness level, 0-15)
    const _SCANLIMIT = 11 // scan limit (number of scanned digits)
    const _SHUTDOWN = 12 // turn on (1) or off (0)
    const _DISPLAYTEST = 15 // force all LEDs light up, no usage here

    let _pinCS = DigitalPin.P16 // LOAD pin, 0=ready to receive command, 1=command take effect
    let _matrixNum = 8 // number of MAX7219 matrix linked in the chain
    let _displayArray: number[] = [] // display array to show accross all matrixs
    let _rotation = 2 // rotate matrixs display for 4-in-1 modules
    let _reversed = true // reverse matrixs display order for 4-in-1 modules
    let _nodes: Node[] = [];
    
    

    export function init(cs: DigitalPin, mosi: DigitalPin, miso: DigitalPin, sck: DigitalPin) {
        // set internal variables        
        _pinCS = cs
 
        // prepare display array (for displaying texts; add extra 8 columns at each side as buffers)
        for (let i = 0; i < (_matrixNum + 2) * 8; i++)  _displayArray.push(0)
        // set micro:bit SPI
        pins.spiPins(mosi, miso, sck)
        pins.spiFormat(8, 3)
        pins.spiFrequency(1000000)
        // initialize MAX7219s
        _registerAll(_SHUTDOWN, 0) // turn off
        _registerAll(_DISPLAYTEST, 0) // test mode off
        _registerAll(_DECODEMODE, 0) // decode mode off
        _registerAll(_SCANLIMIT, 7) // set scan limit to 7 (column 0-7)
        _registerAll(_INTENSITY, 5) // set brightness to 5
        _registerAll(_SHUTDOWN, 1) // turn on

        for(let i = 0; i < _matrixNum; i++) {
            _nodes.push(new Node(i))
        }
    }

    export function renderAll(sprites: Grafix.Sprite[]) {

        let bucket1: Grafix.Sprite[] = [];
        let bucket2: Grafix.Sprite[] = [];
        let bucket3: Grafix.Sprite[] = [];
        let bucket4: Grafix.Sprite[] = [];

        let buckets: Grafix.Sprite[][] = [bucket1, bucket2, bucket3, bucket4];

        //first bucket the sprites by node!
            //if a sprite is spanning multiple nodes then we need to add it to multiple buckets
            //TODO - currently only support 2 bucket span - should try to handle 4 bucket span!
        sprites.forEach(function (sprite: Grafix.Sprite, index: number) {
            if(sprite.getXPosition() < 8) {
                bucket1.push(sprite);
                if(sprite.getXPosition()+sprite.getWidth() >= 8) {
                    bucket2.push(sprite);
                } 
            } else if (sprite.getXPosition() < 16) {
                bucket2.push(sprite);
                if(sprite.getXPosition()+sprite.getWidth() >= 16) {
                    bucket3.push(sprite);
                } 
            } else if (sprite.getXPosition() < 24) {
                bucket3.push(sprite);
                if(sprite.getXPosition()+sprite.getWidth() >= 24) {
                    bucket4.push(sprite);
                } 
            } else {
                bucket4.push(sprite);
            }
        })

        buckets.forEach(_renderAll);
    }


    function _renderAll(sprites: Grafix.Sprite[], node: number) {
        _nodes[node].render(sprites);
    }

    class Node {

        _id: number;
        _currentVram: number[] = [0,0,0,0,0,0,0,0];
        _newVram: number[];

        constructor(id: number) {
            this._id = id;
        }

        public render(sprites: Grafix.Sprite[]) {
            let vram = [0,0,0,0,0,0,0,0];
            
            sprites.forEach(function (sprite: Grafix.Sprite, index: number) {
                this._addSpriteToVram(sprite, vram);
            });
            
            //Write vram to screen
            vram.forEach(function (mask: number, index: number) {
                _registerForOne(8-index, mask, this._id);
            });
            
        }

        public _addSpriteToVram(sprite: Grafix.Sprite, vram: number[]) {
            let bitmap = sprite.getBitmap();
            let xPos = sprite.getXPosition();
            let yPos = sprite.getYPosition();

            //Loop over the rows of the bitmap and add value of row to vRam
            for (let bitmapRow = 0; bitmapRow < bitmap.length ; bitmapRow++) {
                if(bitmapRow + yPos > 7) continue;

                let bitMapBitMask = this._toBitMask(bitmap[bitmap.length-(bitmapRow+1)], xPos);
                //add to whatever value is already in vram for this row - by using a bitwise OR
                vram[yPos+bitmapRow] = vram[yPos+bitmapRow] | bitMapBitMask; 
            }
        }


        private _toBitMask(bitmapRow: number[], xPos: number) : number {

            let bitMask: number = 0;
            let nodeWidth: number = 8;
            let minX = this._id * nodeWidth; //This is the minimum xposition we'll consider for this node. Smaller x values will have been rendered on a different node!

            //Check each value in the BITMAP row to create a bit mask
            for(let i = 0 ; i < bitmapRow.length ; i++) {
                //Does the bit have a value and is it on this node
                if(bitmapRow[i] && ((xPos + i) >= minX) ) {
                    let exponent = 7-(xPos+i-(nodeWidth*this._id));
                    bitMask += 2 ** exponent;
                }
            }

            return bitMask;
        }
    }

    /**
    * (internal function) write command and data to all MAX7219s
    */
    export function _registerAll(addressCode: number, data: number) {
        pins.digitalWritePin(_pinCS, 0) // LOAD=LOW, start to receive commands
        for (let i = 0; i < _matrixNum; i++) {
            // when a MAX7219 received a new command/data set
            // the previous one would be pushed to the next matrix along the chain via DOUT
            pins.spiWrite(addressCode) // command (8 bits)
            pins.spiWrite(data) //data (8 bits)
        }
        pins.digitalWritePin(_pinCS, 1) // LOAD=HIGH, commands take effect
    }

    /**
    * (internal function) write command and data to a specific MAX7219 (index 0=farthest on the chain)
    */
    export function _registerForOne(addressCode: number, data: number, matrixIndex: number) {
        if (matrixIndex <= _matrixNum - 1) {
            pins.digitalWritePin(_pinCS, 0) // LOAD=LOW, start to receive commands
            for (let i = 0; i < _matrixNum; i++) {
                // when a MAX7219 received a new command/data set
                // the previous one would be pushed to the next matrix along the chain via DOUT
                if (i == matrixIndex) { // send change to target
                    pins.spiWrite(addressCode) // command (8 bits)
                    pins.spiWrite(data) //data (8 bits)
                } else { // do nothing to non-targets
                    pins.spiWrite(_NOOP)
                    pins.spiWrite(0)
                }
            }
            pins.digitalWritePin(_pinCS, 1) // LOAD=HIGH, commands take effect
        }
    }

    /**
    * Set brightness level of LEDs on all MAX7219s
    */
    export function brightnessAll(level: number) {
        _registerAll(_INTENSITY, level)
    }

}
