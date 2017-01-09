var App = App || {};
App.Square = function(x, y, squareWidth, squareHeight, settings) {
    "use strict";
    /* eslint-env browser */
    /* global createjs */

    const that = new createjs.Shape();

    function init() {
        initSquare();
        addClickListener();
    }

    function initSquare() {
        that.x = x * squareWidth;
        that.y = y * squareWidth;
        that.setBounds(that.x, that.y, squareWidth, squareHeight);
        that.graphics
            .beginStroke(settings.strokeColor)
            .beginFill(settings.fillColor)
            .drawRect(0, 0, squareWidth, squareHeight)
            .endFill();
        that.cache(0, 0, squareWidth, squareHeight);
    }

    function addClickListener() {
        that.addEventListener("click", handleClick);
    }

    function removeClickListener() {
        that.removeEventListener("click", handleClick);
    }

    function handleClick() {
        const event = new createjs.Event("squareClick", true);
        event.x = x;
        event.y = y;
        that.dispatchEvent(event);
    }

    function changeSquareColor(filter) {
        that.filters = [filter];
        update();
    }

    function resetSquareColor() {
        that.filters = [];
        update();
    }

    function update() {
        that.updateCache();
    }

    that.update = update;
    that.changeSquareColor = changeSquareColor;
    that.resetSquareColor = resetSquareColor;
    that.addClickListener = addClickListener;
    that.removeClickListener = removeClickListener;

    init();
    return that;
};

export default App.Square;
