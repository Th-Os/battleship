import Powerup from "./Powerup.js";

var App = App || {};
App.Scan = function(controller, playerMap, opponentMap, settings) {
    "use strict";
    /* eslint-env browser */
    /* global createjs */

    const squareWidth = opponentMap.getSquareWidth();
    const squareHeight = opponentMap.getSquareHeight();
    const squareMargin = opponentMap.getSquareMargin();
    const that = new Powerup(
        "scan",
        opponentMap.getCenter(),
        squareWidth,
        squareHeight,
        settings
    );

    function init() {
        const bounds = that.getBounds();
        const radius = squareWidth + squareHeight - squareMargin;
        that.graphics
            .beginLinearGradientFill(
                [settings.secondaryColor, settings.primaryColor],
                [0, 0.33],
                0,
                0,
                bounds.width,
                bounds.height
            )
            .arc(
                0,
                0,
                radius,
                0,
                Math.PI
            )
            .endFill();
        createjs.Tween
            .get(that, { loop: true })
            .to({rotation: -360}, 2000);
        controller.register("onAction", "scan", onAction);
        controller.register("onReport", "target", onReport);
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
            controller.execute(that.getType(), that.getAffectedSquares());
            controller.done();
            hide();
        }
    }

    function onAction(coords) {
        if(playerMap.isOccupied(coords)) {
            return {
                coords: coords,
                type: "target"
            };
        }
    }

    function onReport(coords) {
        opponentMap.mark("target", coords);
        return true;
    }

    that.show = show;
    that.hide = hide;

    init();
    return that;
};

export default App.Scan;
