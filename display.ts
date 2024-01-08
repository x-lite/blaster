let _BOUNDS: number[] = [0, 0, 91, 7];

namespace Display {

    const _NOOP = 0 // no-op (do nothing, doesn't change current status)
    const _BLIP = 9
    const _DIGIT = [1, 2, 3, 4, 5, 6, 7, 8] // digit (LED column)
    const _DECODEMODE = 9 // decode mode (1=on, 0-off; for 7-segment display on MAX7219, no usage here)
    const _INTENSITY = 10 // intensity (LED brightness level, 0-15)
    const _SCANLIMIT = 11 // scan limit (number of scanned digits)
    const _SHUTDOWN = 12 // turn on (1) or off (0)
    const _DISPLAYTEST = 15 // force all LEDs light up, no usage here

    let displayRowOne: DisplayRow;
    let activeDisplayRow: DisplayRow;
  

    export function init(cs: DigitalPin,  mosi: DigitalPin, miso: DigitalPin, sck: DigitalPin) {
        displayRowOne = new DisplayRow("1", cs, mosi, miso, sck);
        activeDisplayRow = displayRowOne;
    }

    export function render(sprites: Grafix.Sprite[]) {
        activeDisplayRow.render(sprites);
    }

    class DisplayRow {

        _pinCS = DigitalPin.P16 // LOAD pin, 0=ready to receive command, 1=command take effect
        _matrixNum = 12 // number of MAX7219 matrix linked in the chain
        _rotation = 2 // rotate matrixs display for 4-in-1 modules
        _reversed = true // reverse matrixs display order for 4-in-1 modules
        _vramBuilder: VramBuilder = new VramBuilder()
        _cs: DigitalPin;
        _mosi: DigitalPin;
        _miso: DigitalPin;
        _sck: DigitalPin;

        constructor(id: string, cs: DigitalPin, mosi: DigitalPin, miso: DigitalPin, sck: DigitalPin) {
            this._cs = cs;
            this._pinCS = cs;
            this._mosi = mosi;
            this._miso = miso;
            this._sck = sck;
            this.activateSpi();
            this._reset();
        }

        /* Activate this module as the one that is writing to SPI */
        public activateSpi() {
            pins.spiPins(this._mosi, this._miso, this._sck)
            pins.spiFormat(8, 3)
            pins.spiFrequency(1000000)
        }

        _reset() {
            this._sendCommandToAll(_SHUTDOWN, 0) // turn off
            this._sendCommandToAll(_DISPLAYTEST, 0) // test mode off
            this._sendCommandToAll(_DECODEMODE, 0) // decode mode off
            this._sendCommandToAll(_SCANLIMIT, 7) // set scan limit to 7 (column 0-7)
            this._sendCommandToAll(_INTENSITY, 5) // set brightness to 5
            this._sendCommandToAll(_SHUTDOWN, 1) // turn on
        }

        public render(sprites: Grafix.Sprite[]) {
        
            let bucket1: Grafix.Sprite[] = [];
            let bucket2: Grafix.Sprite[] = [];
            let bucket3: Grafix.Sprite[] = [];
            let bucket4: Grafix.Sprite[] = [];
            let bucket5: Grafix.Sprite[] = [];
            let bucket6: Grafix.Sprite[] = [];
            let bucket7: Grafix.Sprite[] = [];
            let bucket8: Grafix.Sprite[] = [];
            let bucket9: Grafix.Sprite[] = [];
            let bucket10: Grafix.Sprite[] = [];
            let bucket11: Grafix.Sprite[] = [];
            let bucket12: Grafix.Sprite[] = [];

            let buckets: Grafix.Sprite[][] = [bucket1, bucket2, bucket3, bucket4, 
                                                bucket5, bucket6, bucket7, bucket8,
                                                bucket9, bucket10, bucket11, bucket12];

            //first bucket the sprites by node!
            //if a sprite is spanning multiple nodes then we need to add it to multiple buckets

            sprites.forEach(function (sprite: Grafix.Sprite, index: number) {
                if (sprite.getXPosition() < 8) {
                    bucket1.push(sprite);
                    if (sprite.getXPosition() + sprite.getWidth() >= 8) {
                        bucket2.push(sprite);
                    }
                } else if (sprite.getXPosition() < 16) {
                    bucket2.push(sprite);
                    if (sprite.getXPosition() + sprite.getWidth() >= 16) {
                        bucket3.push(sprite);
                    }
                } else if (sprite.getXPosition() < 24) {
                    bucket3.push(sprite);
                    if (sprite.getXPosition() + sprite.getWidth() >= 24) {
                        bucket4.push(sprite);
                    }
                } else if (sprite.getXPosition() < 32) {
                    bucket4.push(sprite);
                    if (sprite.getXPosition() + sprite.getWidth() >= 32) {
                        bucket5.push(sprite);
                    }
                } else if (sprite.getXPosition() < 40) {
                    bucket5.push(sprite);
                    if (sprite.getXPosition() + sprite.getWidth() >= 40) {
                        bucket6.push(sprite);
                    }
                } else if (sprite.getXPosition() < 48) {
                    bucket6.push(sprite);
                    if (sprite.getXPosition() + sprite.getWidth() >= 48) {
                        bucket7.push(sprite);
                    }
                } else if (sprite.getXPosition() < 56) {
                    bucket7.push(sprite);
                    if (sprite.getXPosition() + sprite.getWidth() >= 56) {
                        bucket8.push(sprite);
                    }
                } else if (sprite.getXPosition() < 64) {
                    bucket8.push(sprite);
                    if (sprite.getXPosition() + sprite.getWidth() >= 64) {
                        bucket9.push(sprite);
                    }
                } else if (sprite.getXPosition() < 72) {
                    bucket9.push(sprite);
                    if (sprite.getXPosition() + sprite.getWidth() >= 72) {
                        bucket10.push(sprite);
                    }
                } else if (sprite.getXPosition() < 80) {
                    bucket10.push(sprite);
                    if (sprite.getXPosition() + sprite.getWidth() >= 80) {
                        bucket11.push(sprite);
                    }
                } else if (sprite.getXPosition() < 88) {
                    bucket11.push(sprite);
                    if (sprite.getXPosition() + sprite.getWidth() >= 88) {
                        bucket12.push(sprite);
                    }
                }else {
                    bucket12.push(sprite);
                }
            })

            buckets.forEach(function (sprites: Grafix.Sprite[], matrixId: number) {

                let vram: number[] = this._vramBuilder.buildNewVram(sprites, matrixId)
                //Write vram to screen
                vram.forEach(function (bitMask: number, index: number) {
                    this._renderOnSingleMatrix(8 - index, bitMask, matrixId);
                });
            });
        }

        /**
        * (internal function) write command and data to all MAX7219s
        */
        _sendCommandToAll(addressCode: number, data: number) {
            pins.digitalWritePin(this._pinCS, 0) // LOAD=LOW, start to receive commands
            for (let i = 0; i < this._matrixNum; i++) {
                // when a MAX7219 received a new command/data set
                // the previous one would be pushed to the next matrix along the chain via DOUT
                pins.spiWrite(addressCode) // command (8 bits)
                pins.spiWrite(data) //data (8 bits)
            }
            pins.digitalWritePin(this._pinCS, 1) // LOAD=HIGH, commands take effect
        }

        /**
        * (internal function) write command and data to a specific MAX7219 (index 0=farthest on the chain)
        */
        _renderOnSingleMatrix(addressCode: number, data: number, nodeNumber: number) {
            if (nodeNumber <= this._matrixNum - 1) {
                pins.digitalWritePin(this._pinCS, 0) // LOAD=LOW, start to receive commands
                for (let i = 0; i < this._matrixNum; i++) {
                    // when a MAX7219 received a new command/data set
                    // the previous one would be pushed to the next matrix along the chain via DOUT
                    if (i == nodeNumber) { // send change to target
                        pins.spiWrite(addressCode) // command (8 bits)
                        pins.spiWrite(data) //data (8 bits)
                    } else { // do nothing to non-targets
                        pins.spiWrite(_NOOP)
                        pins.spiWrite(0)
                    }
                }
                pins.digitalWritePin(this._pinCS, 1) // LOAD=HIGH, commands take effect
            }
        }
    }//End of DisplayRow

    /*
     * Class that converts sprites into vram for an allocated matrix
     * The id of the builder indicates which matrix to build for and implies its position index
     * the 2D 'display space'
     */
    class VramBuilder {

        public buildNewVram(sprites: Grafix.Sprite[], matrixId: number): number[] {
            let vram = [0, 0, 0, 0, 0, 0, 0, 0];

            sprites.forEach(function (sprite: Grafix.Sprite, index: number) {
                this._addSpriteToVram(sprite, vram, matrixId);
            });

            return vram;

        }

        private _addSpriteToVram(sprite: Grafix.Sprite, vram: number[], matrixId: number) {
            let bitmap = sprite.getBitmap();
            let xPos = sprite.getXPosition();
            let yPos = sprite.getYPosition();

            //Loop over the rows of the bitmap and add value of row to vRam
            for (let bitmapRow = 0; bitmapRow < bitmap.length; bitmapRow++) {
                if (bitmapRow + yPos > 7) continue;

                let bitMapBitMask = this._toBitMask(bitmap[bitmap.length - (bitmapRow + 1)], xPos, matrixId);
                //add to whatever value is already in vram for this row - by using a bitwise OR
                vram[yPos + bitmapRow] = vram[yPos + bitmapRow] | bitMapBitMask;
            }
        }


        private _toBitMask(bitmapRow: number[], xPos: number, matrixId: number): number {

            let bitMask: number = 0;
            let nodeWidth: number = 8;
            let minX = matrixId * nodeWidth; //This is the minimum xposition we'll consider for this node. Smaller x values will have been rendered on a different node!

            //Check each value in the BITMAP row to create a bit mask
            for (let i = 0; i < bitmapRow.length; i++) {
                //Does the bit have a value and is it on this node
                if (bitmapRow[i] && ((xPos + i) >= minX)) {
                    let exponent = 7 - (xPos + i - (nodeWidth * matrixId));
                    bitMask += 2 ** exponent;
                }
            }

            return bitMask;
        }
    }


}
