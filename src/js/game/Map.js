import Square from "./Square.js";
import Ship from "./Ship.js";
import Target from "./Target.js";
import Hit from "./Hit.js";
import Miss from "./Miss.js";

var App = App || {};
App.Map = function(element, settings) {
    "use strict";
    /* eslint-env browser */
    /* global createjs */

    const that = new createjs.Stage(element);
    const gridLayer = new createjs.Container();
    const shipLayer = new createjs.Container();
    const markLayer = new createjs.Container();
    const width = that.canvas.width;
    const height = that.canvas.height;
    const rows = settings.grid.rows;
    const cols = settings.grid.cols;

    let squareWidth,
        squareHeight,
        squareMargin;

    function init() {
        squareWidth = that.canvas.width / rows;
        squareHeight = that.canvas.height / cols;
        squareMargin = Math.min(squareWidth, squareHeight) / Math.max(rows, cols);
        initGridLayer();
        initShipLayer();
        initShotLayer();

        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", that);
    }

    function initGridLayer() {
        for(let y = 0; y < rows; y++) {
            for(let x = 0; x < cols; x++) {
                gridLayer.addChild(new Square(x, y, squareWidth, squareHeight, settings.square));
            }
        }
        that.addChild(gridLayer);
    }

    function initShipLayer() {
        that.addChild(shipLayer);
    }

    function initShotLayer() {
        that.addChild(markLayer);
    }

    function getSquareWidth() {
        return squareWidth;
    }

    function getSquareHeight() {
        return squareHeight;
    }

    function getSquareMargin() {
        return squareMargin;
    }

    function getCenter() {
        return {
            x: width / 2,
            y: height / 2
        };
    }

    function testAllChildren(layer, fn) {
        if(layer.children.length === 0) {
            return false;
        }
        return layer.children.map(fn).some((curr) => curr);
    }

    function allShipsSunk() {
        return !testAllChildren(shipLayer, (ship) => {
            return !ship.isSunk();
        });
    }

    function isOccupied(coords) {
        return testAllChildren(shipLayer, (ship) => {
            return ship.occupiesSquare(coords);
        });
    }

    function isMarked(coords) {
        return testAllChildren(markLayer, (mark) => {
            return mark.marksSquare(coords);
        });
    }

    function getSquare(coords) {
        return gridLayer.getChildAt((coords.y * cols) + coords.x);
    }

    function forEachSquare(fn, coords) {
        if(coords === undefined) {
            gridLayer.children.forEach(fn);
        } else if(coords.constructor === Array) {
            coords.forEach((square) => {
                forEachSquare(fn, square);
            });
        } else {
            fn(getSquare(coords));
        }
    }

    function highlight(squares, filter) {
        unhighlight(squares);
        forEachSquare((square) => {
            square.changeSquareColor(filter);
            createjs.Ticker.addEventListener("tick", square.update);
        }, squares);
    }

    function unhighlight(squares) {
        forEachSquare((square) => {
            square.resetSquareColor();
            createjs.Ticker.removeEventListener("tick", square.update);
        }, squares);
    }

    function getAlternatingColorFilter(filter, factor) {
        const altRedMultiplier = Math.min(1, filter.redMultiplier * factor);
        const altGreenMultiplier = Math.min(1, filter.greenMultiplier * factor);
        const altBlueMultiplier = Math.min(1, filter.blueMultiplier * factor);
        return new createjs.ColorFilter(
            altRedMultiplier,
            altGreenMultiplier,
            altBlueMultiplier
        );
    }

    function flicker(squares, filter) {
        const altFilter = getAlternatingColorFilter(filter, 1.5);
        highlight(squares, altFilter);
        createjs.Tween.get(altFilter, {
            override: true,
            ignoreGlobalPause: true
        })
        .to({
            redMultiplier: filter.redMultiplier,
            greenMultiplier: filter.greenMultiplier,
            blueMultiplier: filter.blueMultiplier
        }, 250)
        .to({
            redMultiplier: altFilter.altRedMultiplier,
            greenMultiplier: altFilter.altGreenMultiplier,
            blueMultiplier: altFilter.altBlueMultiplier
        }, 125)
        .to({
            redMultiplier: filter.redMultiplier,
            greenMultiplier: filter.greenMultiplier,
            blueMultiplier: filter.blueMultiplier
        }, 125)
        .to({
            redMultiplier: 1,
            greenMultiplier: 1,
            blueMultiplier: 1
        }, 500);
    }

    function blink(squares, filter) {
        const altFilter = getAlternatingColorFilter(filter, 1.333333333);
        highlight(squares, altFilter);
        createjs.Tween.get(altFilter, {
            loop: true,
            override: true,
            ignoreGlobalPause: true
        })
        .to({
            redMultiplier: filter.redMultiplier,
            greenMultiplier: filter.greenMultiplier,
            blueMultiplier: filter.blueMultiplier
        }, 500)
        .to({
            redMultiplier: altFilter.redMultiplier,
            greenMultiplier: altFilter.greenMultiplier,
            blueMultiplier: altFilter.blueMultiplier
        }, 500);
    }

    function pulse(squares, filter) {
        const altFilter = getAlternatingColorFilter(filter, 1.1111111111);
        highlight(squares, altFilter);
        createjs.Tween.get(altFilter, {
            loop: true,
            override: true,
            ignoreGlobalPause: true
        })
        .to({
            redMultiplier: filter.redMultiplier,
            greenMultiplier: filter.greenMultiplier,
            blueMultiplier: filter.blueMultiplier
        }, 2000)
        .to({
            redMultiplier: altFilter.redMultiplier,
            greenMultiplier: altFilter.greenMultiplier,
            blueMultiplier: altFilter.blueMultiplier
        }, 2000);
    }

    function getChild(layer, fn) {
        return layer.children.filter(fn)[0];
    }

    function getShipOnSquare(coords) {
        return getChild(shipLayer, (ship) => {
            if(ship.occupiesSquare(coords)) {
                return true;
            }
            return false;
        });
    }

    function getMarkOnSquare(coords) {
        return getChild(markLayer, (mark) => {
            if(mark.marksSquare(coords)) {
                return true;
            }
            return false;
        });
    }

    function mark(type, coords) {
        if(coords.x < 0 || coords.x >= rows || coords.y < 0 || coords.y >= cols) {
            return;
        }
        if(type === "target" && isMarked(coords)) {
            return;
        }
        const params = {
            coords: coords,
            width: squareWidth,
            height: squareHeight,
            margin: squareMargin,
            settings: settings.mark[type]
        };
        let square,
            mark;
        switch(type) {
        case "target":
            mark = new Target(params);
            break;
        case "hit":
            square = getSquare(coords);
            square.resetSquareColor();
            square.removeClickListener();
            mark = new Hit(params);
            break;
        case "miss":
            square = getSquare(coords);
            square.resetSquareColor();
            square.removeClickListener();
            mark = new Miss(params);
            break;
        default:
            break;
        }
        markLayer.removeChild(getMarkOnSquare(coords));
        markLayer.addChild(mark);
        that.update();
    }

    function shoot(coords) {
        if(isOccupied(coords)) {
            const ship = getShipOnSquare(coords);
            if(ship) {
                ship.hit();
                mark("hit", coords);
                return true;
            }
        } else {
            mark("miss", coords);
        }
        return false;
    }

    function sink(ship) {
        const coords = ship.getPosition();
        for(let i = -1; i < 2; i++) {
            for(let j = -1; j < ship.getLength() + 1; j++) {
                if(ship.getOrientation() === "horizontal") {
                    if(i !== 0 || j < 0 || j >= ship.getLength()) {
                        mark("miss", {x: coords.x + j, y: coords.y + i});
                    }
                } else {
                    if(i !== 0 || j < 0 || j >= ship.getLength()) {
                        mark("miss", {x: coords.x + i, y: coords.y + j});
                    }
                }
            }
        }
        that.update();
    }

    function isInBounds(ship, coords) {
        if(ship.getOrientation() === "horizontal") {
            return coords.x >= 0 &&
                coords.x + ship.getLength() <= cols &&
                coords.y >=0 &&
                coords.y < rows;
        } else {
            return coords.x >= 0 &&
                coords.x < cols &&
                coords.y >=0 &&
                coords.y + ship.getLength() <= rows;
        }
    }

    function canBePlaced(ship, coords) {
        if(!isInBounds(ship, coords)) {
            return false;
        } else {
            for(let i = -1; i < 2; i++) {
                for(let j = -1; j < ship.getLength() + 1; j++) {
                    if(ship.getOrientation() === "horizontal") {
                        if(isOccupied({x: coords.x + j, y: coords.y + i})) {
                            return false;
                        }
                    } else {
                        if(isOccupied({x: coords.x + i, y: coords.y + j})) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    function getRandomCoordinate(max) {
        return Math.ceil(Math.random() * (max + 1)) - 1;
    }

    function getRandomCoordinates(maxX, maxY) {
        return {
            x: getRandomCoordinate(maxX),
            y: getRandomCoordinate(maxY)
        };
    }

    function getRandomPosition(ship, current, max) {
        const currentIteration = (current || 0) + 1;
        let maxX = cols - 1,
            maxY = rows - 1;
        if(currentIteration > (max || 20)) {
            ship.changeOrientation();
            return getRandomPosition(ship);
        }
        if(ship.getOrientation() === "horizontal") {
            maxX = maxX - ship.getLength();
        } else {
            maxY = maxY - ship.getLength();
        }
        const coords = getRandomCoordinates(maxX, maxY);
        if(canBePlaced(ship, coords)) {
            return coords;
        }
        return getRandomPosition(ship, currentIteration);
    }

    function addShipAtRandomPosition(length) {
        const ship = new Ship({
            length: length,
            squareWidth: squareWidth,
            squareHeight: squareHeight,
            squareMargin: squareMargin,
            settings: settings.ship
        });
        const coords = getRandomPosition(ship);
        ship.setPosition(coords);
        addShip(ship);
    }

    function addShipWithParams(params) {
        const ship = new Ship({
            coords: params.coords,
            length: params.length,
            orientation: params.orientation,
            squareWidth: squareWidth,
            squareHeight: squareHeight,
            squareMargin: squareMargin,
            settings: settings.ship
        });
        addShip(ship);
    }

    function addShip(ship) {
        shipLayer.addChild(ship);
    }

    function addShips() {
        settings.fleet.forEach((ship) => {
            for(let i = 0; i < ship.count; i++) {
                that.addShipAtRandomPosition(ship.length);
            }
        });
    }

    function removeShip(ship) {
        shipLayer.removeChild(ship);
    }

    function removeShips() {
        shipLayer.children.forEach((ship) => {
            removeShip(ship);
        });
    }

    function addShipListeners() {
        that.addEventListener("shipDragged", handleDrag);
        that.addEventListener("shipDropped", handleDrop);
        that.addEventListener("shipClicked", handleClick);
    }

    function removeShipListeners() {
        that.removeEventListener("shipDragged", handleDrag);
        that.removeEventListener("shipDropped", handleDrop);
        that.removeEventListener("shipClicked", handleClick);
    }

    function handleDrag(e) {
        const ship = e.ship;
        const bounds = ship.getBounds();
        unhighlight();
        removeShip(ship);
        that.addChild(ship);
        ship.x = Math.min(width - bounds.width, Math.max(0, e.x));
        ship.y = Math.min(height - bounds.height, Math.max(0, e.y));
        let coords = {
            x: Math.round(ship.x / that.getSquareWidth()),
            y: Math.round(ship.y / that.getSquareHeight())
        };
        if(!that.canBePlaced(ship, coords)) {
            coords = ship.getPosition();
        }
        const squares = [];
        for(let i = 0; i < ship.getLength(); i++) {
            if(ship.getOrientation() === "horizontal") {
                squares.push({x: coords.x + i, y: coords.y});
            } else {
                squares.push({x: coords.x, y: coords.y + i});
            }
        }
        blink(squares, new createjs.ColorFilter(0.6, 0.8, 0.4));
        that.update();
    }

    function handleDrop(e) {
        const ship = e.ship;
        const coords = {
            x: Math.round(ship.x / that.getSquareWidth()),
            y: Math.round(ship.y / that.getSquareHeight())
        };
        unhighlight();
        if(canBePlaced(ship, coords)) {
            ship.setPosition(coords);
        } else {
            ship.setPosition(ship.getPosition());
        }
        that.removeChild(ship);
        addShip(ship);
        that.update();
    }

    function handleClick(e) {
        const ship = e.ship;
        if(ship.length !== 1) {
            unhighlight();
            removeShip(ship);
            ship.rotateShip();
            if(!canBePlaced(ship, ship.getPosition())) {
                ship.rotateShip();
                flicker(ship.getOccupiedSquares(), new createjs.ColorFilter(1, 0.5, 0.6));
            }
            addShip(ship);
            that.update();
        }
    }

    that.getSquareWidth = getSquareWidth;
    that.getSquareHeight = getSquareHeight;
    that.getSquareMargin = getSquareMargin;
    that.getCenter = getCenter;
    that.getSquare = getSquare;
    that.allShipsSunk = allShipsSunk;
    that.isOccupied = isOccupied;
    that.isMarked = isMarked;
    that.highlight = highlight;
    that.unhighlight = unhighlight;
    that.flicker = flicker;
    that.blink = blink;
    that.pulse = pulse;
    that.mark = mark;
    that.shoot = shoot;
    that.sink = sink;
    that.canBePlaced = canBePlaced;
    that.addShipAtRandomPosition = addShipAtRandomPosition;
    that.addShipWithParams = addShipWithParams;
    that.addShip = addShip;
    that.addShips = addShips;
    that.removeShip = removeShip;
    that.removeShips = removeShips;
    that.getShipOnSquare = getShipOnSquare;
    that.addShipListeners = addShipListeners;
    that.removeShipListeners = removeShipListeners;

    init();
    return that;
};

export default App.Map;
