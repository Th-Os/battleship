import Powerup from "./Powerup.js";

var App = App || {};
App.Missile = function(controller, playerMap, opponentMap, settings) {
    "use strict";
    /* eslint-env browser */
    /* global createjs */

    const squareWidth = opponentMap.getSquareWidth();
    const squareHeight = opponentMap.getSquareHeight();
    const squareMargin = opponentMap.getSquareMargin();
    const that = new Powerup(
        "missile",
        opponentMap.getCenter(),
        squareWidth,
        squareHeight,
        settings
    );

    function init() {
        const bounds = that.getBounds();
        that.graphics
            .beginStroke(settings.secondaryColor)
            .beginFill(settings.primaryColor)
            .drawRect(
                (squareWidth / -2) + squareMargin,
                (squareHeight / -2) + squareMargin,
                bounds.width - (squareMargin * 2),
                bounds.height - (squareMargin * 2)
            )
            .endFill();
        createjs.Tween
            .get(that, { loop: true })
            .to({alpha: 0.125}, 250)
            .to({alpha: settings.opacity}, 250);
        controller.register("onAction", "missile", onAction);
        controller.register("onReport", "destroy", onReport);
    }

    function show() {
        controller.viewOpponentMap();
        opponentMap.addChild(that);
        opponentMap.addEventListener("stagemousemove", move);
        opponentMap.addEventListener("click", execute);
    }

    function hide() {
        opponentMap.removeChild(that);
        opponentMap.removeEventListener("stagemousemove", move);
        opponentMap.removeEventListener("click", execute);
    }

    function move(e) {
        that.setPosition({x: e.stageX, y: e.stageY});
        opponentMap.update();
    }

    function execute(e) {
        if(controller.hasTurn() && !controller.isWaiting()) {
            that.setPosition({x: e.stageX, y: e.stageY});
            opponentMap.blink(that.getAffectedSquares(), new createjs.ColorFilter(1, 0.5, 0.6));
            controller.execute(that.getType(), that.getAffectedSquares());
            controller.done();
            hide();
        }
    }

    function onAction(coords) {
        if(playerMap.isOccupied(coords)) {
            const ship = playerMap.getShipOnSquare(coords);
            return {
                coords: ship.getOccupiedSquares(),
                type: "destroy"
            };
        }
        return {
            coords: coords,
            type: "miss"
        };
    }

    function onReport(coords) {
        controller.execute("shoot", coords);
        return false;
    }

    that.show = show;
    that.hide = hide;

    init();
    return that;
};

export default App.Missile;
