namespace Joystick {

    let xPin: AnalogPin;
    let yPin: AnalogPin;
    
    export function init(x_pin: AnalogPin, y_pin: AnalogPin) {
        xPin = x_pin;
        yPin = y_pin;
    }

    export function getX(): number {
        let x = pins.map(pins.analogReadPin(xPin),8,1016,0,4);
        if(x>3)return -1;
        if(x<1)return 1;
        return 0;
    }
    
    export function getY(): number {
        let y = pins.map(pins.analogReadPin(yPin),8,1018,0,4);
        if(y>3)return 1;
        if(y<1)return -1;
        return 0;
    }
}

