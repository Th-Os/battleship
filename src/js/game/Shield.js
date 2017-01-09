import Powerup from "./Powerup.js";

var App = App || {};
App.Shield = function(controller, playerMap, opponentMap, settings) {
    "use strict";
    /* eslint-env browser */
    /* global createjs */

    const squareWidth = opponentMap.getSquareWidth();
    const squareHeight = opponentMap.getSquareHeight();
    const squareMargin = opponentMap.getSquareMargin();
    const that = new Powerup(
        "shield",
        opponentMap.getCenter(),
        squareWidth,
        squareHeight,
        settings
    );

    let squares = [];

    function init() {
        const bounds = that.getBounds();
        const radius = (squareWidth + squareHeight) * (settings.radius / 2);
        that.graphics
            .beginStroke(settings.secondaryColor)
            .beginFill(settings.primaryColor)
            .drawRoundRect(
                (bounds.width / -2) - squareMargin,
                (bounds.height / -2) - squareMargin,
                bounds.width + (squareMargin * 2),
                bounds.height + (squareMargin * 2),
                radius
            )
            .endFill();
        that.alpha = settings.opacity;
        createjs.Tween
            .get(that, { loop: true })
            .to({alpha: 0.125}, 1000)
            .to({alpha: settings.opacity}, 1000);
        controller.register("onExecution", "shoot", onExecution);
        controller.register("onReport", "shield", onReport);
    }

    function show() {
        controller.viewPlayerMap();
        playerMap.addChild(that);
        playerMap.addEventListener("stagemousemove", move);
        playerMap.addEventListener("click", execute);
    }

    function hide() {
        playerMap.removeChild(that);
        playerMap.removeEventListener("stagemousemove", move);
        playerMap.removeEventListener("click", execute);
    }

    function move(e) {
        that.setPosition({x: e.stageX, y: e.stageY});
        playerMap.update();
    }

    function execute(e) {
        if(controller.hasTurn()) {
            that.setPosition({x: e.stageX, y: e.stageY});
            protect(that.getAffectedSquares());
            playerMap.pulse(squares, new createjs.ColorFilter(0.55, 0.75, 0.9));
            controller.done();
            hide();
        }
    }

    function protect(coords) {
        squares = squares.concat(coords);
    }

    function isProtected(coords) {
        if(squares.length === 0) {
            return -1;
        }
        return squares.findIndex((curr) => {
            if(curr.x === coords.x && curr.y === coords.y) {
                return true;
            }
            return false;
        });
    }

    function onExecution(coords) {
        const index = isProtected(coords);
        if(index !== -1) {
            squares.splice(index, 1);
            if(isProtected(coords) === -1) {
                playerMap.unhighlight(coords);
            }
            return {
                coords: coords,
                type: "shield"
            };
        }
    }

    function onReport(coords) {
        opponentMap.pulse(coords, new createjs.ColorFilter(0.55, 0.75, 0.9));
        return true;
    }

    that.show = show;
    that.hide = hide;

    init();
    return that;
};

export default App.Shield;
