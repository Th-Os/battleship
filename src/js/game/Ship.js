var App = App || {};
App.Ship = function(params) {
    "use strict";
    /* eslint-env browser */
    /* global createjs */

    const that = new createjs.Shape();

    let coords = params.coords || {},
        xCoord = coords.x || 0,
        yCoord = coords.y || 0,
        length = params.length,
        orientation = params.orientation,
        hits = 0,
        mouseMove;

    function init() {
        initOrientation();
        initShip();
        addDragDropListener();
        addClickListener();
    }

    function initOrientation() {
        orientation = orientation || getRandomOrientation();
    }

    function getRandomOrientation() {
        const boolean = Math.round(Math.random());
        return boolean ? "horizontal" : "vertical";
    }

    function initShip() {
        const size = Math.min(params.squareWidth, params.squareHeight) * params.settings.size;
        const radius = size * params.settings.radius;
        let width = size,
            height = size;
        if(length > 1) {
            if(orientation === "horizontal") {
                width += params.squareWidth * (length - 1);
            } else {
                height += params.squareHeight * (length - 1);
            }
        }
        that.x = xCoord * params.squareWidth;
        that.y = yCoord * params.squareHeight;
        that.setBounds(that.x, that.y, width + (params.squareMargin * 2), height + (params.squareMargin * 2));
        that.graphics.beginFill(params.settings.fillColor);
        that.graphics.drawRoundRect(
            params.squareMargin,
            params.squareMargin,
            width,
            height,
            radius
        );
        that.graphics.endFill();
    }

    function addClickListener() {
        that.addEventListener("click", handleClick);
    }

    function removeClickListener() {
        that.removeEventListener("click", handleClick);
    }

    function handleClick(e) {
        e.stopPropagation();
        if(!mouseMove) {
            dispatchEvent("shipClicked", e);
        }
    }

    function addDragDropListener() {
        that.addEventListener("pressmove", handleDrag);
        that.addEventListener("pressup", handleDrop);
    }

    function removeDragDropListener() {
        that.removeEventListener("pressmove", handleDrag);
        that.removeEventListener("pressup", handleDrop);
    }

    function handleDrag(e) {
        e.stopPropagation();
        mouseMove = true;
        dispatchEvent("shipDragged", e);
    }

    function handleDrop(e) {
        e.stopPropagation();
        if(mouseMove) {
            mouseMove = false;
            dispatchEvent("shipDropped", e);
        }
    }

    function dispatchEvent(name, e) {
        const event = new createjs.Event(name, true);
        event.ship = that;
        if(mouseMove) {
            const bounds = that.getBounds();
            event.x = e.stageX - (bounds.width / 2);
            event.y = e.stageY - (bounds.height / 2);
        }
        that.dispatchEvent(event);
    }

    function getPosition() {
        return {x: xCoord, y: yCoord};
    }

    function getLength() {
        return length;
    }

    function getOrientation() {
        return orientation;
    }

    function getOccupiedSquares() {
        const squares = [];
        for(let i = 0; i < length; i++) {
            if(orientation === "horizontal") {
                squares.push({x: xCoord + i, y: yCoord});
            } else {
                squares.push({x: xCoord, y: yCoord + i});
            }
        }
        return squares;
    }

    function occupiesSquare(square) {
        return getOccupiedSquares().map((coords) => {
            return coords.x === square.x && coords.y === square.y;
        }).reduce((prev, curr) => {
            return prev || curr;
        });
    }

    function isSunk() {
        if(hits === length) {
            return true;
        }
        return false;
    }

    function changeOrientation() {
        orientation = orientation === "horizontal" ? "vertical" : "horizontal";
        that.graphics.clear();
        initShip();
    }

    function setPosition(coords) {
        xCoord = coords.x;
        yCoord = coords.y;
        initShip();
    }

    function rotateShip() {
        if(length > 1) {
            const offset = length < 3 ? 0 : Math.ceil(length / 2) - 1;
            setPosition({
                x: orientation === "horizontal" ? xCoord + offset : xCoord - offset,
                y: orientation === "horizontal" ? yCoord - offset : yCoord + offset
            });
            changeOrientation();
        }
    }

    function hit() {
        if(!isSunk()) {
            hits++;
        }
    }

    that.getPosition = getPosition;
    that.getLength = getLength;
    that.getOrientation = getOrientation;
    that.occupiesSquare = occupiesSquare;
    that.getOccupiedSquares = getOccupiedSquares;
    that.isSunk = isSunk;
    that.changeOrientation = changeOrientation;
    that.setPosition = setPosition;
    that.rotateShip = rotateShip;
    that.hit = hit;
    that.addDragDropListener = addDragDropListener;
    that.removeDragDropListener = removeDragDropListener;
    that.addClickListener = addClickListener;
    that.removeClickListener = removeClickListener;

    init();
    return that;
};

export default App.Ship;
