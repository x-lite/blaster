let MATRIX_LOAD_PIN: DigitalPin = DigitalPin.P8;
let MATRIX_INPUT_PIN: DigitalPin = DigitalPin.P9;
let MATRIX_UNUSED_PIN: DigitalPin = DigitalPin.P14;
let MATRIX_CLOCK_PIN: DigitalPin = DigitalPin.P13;

let JOYSTICK_X_PIN: AnalogPin = AnalogPin.P0;
let JOYSTICK_Y_PIN: AnalogPin = AnalogPin.P2;

function getRandomIntInclusive(min: number,  max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

Joystick.init(JOYSTICK_X_PIN, JOYSTICK_Y_PIN);
Display.init(MATRIX_LOAD_PIN, MATRIX_INPUT_PIN, MATRIX_UNUSED_PIN, MATRIX_CLOCK_PIN);

let manager = new GameManager();

basic.forever(function() {
    manager.nextIteration();
});