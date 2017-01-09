var App = App || {};
App.Mark = function(coords, squareWidth, squareHeight) {
    "use strict";
    /* eslint-env browser */
    /* global createjs */

    const that = new createjs.Shape();

    function init() {
        that.x = coords.x * squareWidth;
        that.y = coords.y * squareHeight;
        that.setBounds(that.x, that.y, squareWidth, squareHeight);
    }

    function marksSquare(square) {
        return coords.x === square.x && coords.y === square.y;
    }

    that.marksSquare = marksSquare;

    init();
    return that;
};

export default App.Mark;
