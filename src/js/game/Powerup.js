var App = App || {};
App.Powerup = function(type, position, squareWidth, squareHeight, settings) {
    "use strict";
    /* eslint-env browser */
    /* global createjs */

    const that = new createjs.Shape();

    let xCoord,
        yCoord;

    function init() {
        const width = squareWidth * settings.width;
        const height = squareHeight * settings.height;
        that.x = position.x;
        that.y = position.y;
        that.setBounds(that.x - (width / 2), that.y - (height / 2), width, height);
        that.alpha = settings.opacity;
    }

    function setPosition(position) {
        xCoord = Math.round((position.x / squareWidth) - (settings.width / 2));
        yCoord = Math.round((position.y / squareHeight) - (settings.width / 2));
        that.x = (xCoord + (settings.width / 2)) * squareWidth;
        that.y = (yCoord + (settings.width / 2)) * squareHeight;
    }

    function getAffectedSquares() {
        const squares = [];
        for(let i = 0; i < settings.height; i++) {
            for(let j = 0; j < settings.width; j++) {
                squares.push({x: xCoord + j, y: yCoord + i});
            }
        }
        return squares;
    }

    function getType() {
        return type;
    }

    that.setPosition = setPosition;
    that.getAffectedSquares = getAffectedSquares;
    that.getType = getType;

    init();
    return that;
};

export default App.Powerup;
