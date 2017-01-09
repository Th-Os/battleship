import Powerup from "./Powerup.js";

var App = App || {};
App.Bomb = function(controller, playerMap, opponentMap, settings) {
    "use strict";
    /* eslint-env browser */
    /* global createjs */

    const squareWidth = opponentMap.getSquareWidth();
    const squareHeight = opponentMap.getSquareHeight();
    const squareMargin = opponentMap.getSquareMargin();
    const that = new Powerup(
        "bomb",
        opponentMap.getCenter(),
        squareWidth,
        squareHeight,
        settings
    );

    function init() {
        const bounds = that.getBounds();
        const tileWidth = squareWidth - (squareMargin * 2);
        const tileHeight = squareHeight - (squareMargin * 2);
        for(let y = 0; y < settings.height; y++)  {
            for(let x = 0; x < settings.width; x++) {
                that.graphics
                    .beginStroke(settings.secondaryColor)
                    .beginFill(settings.primaryColor)
                    .drawRect(
                        (bounds.width / -2) + squareMargin + (squareWidth * x),
                        (bounds.height / -2) + squareMargin + (squareHeight * y),
                        tileWidth,
                        tileHeight
                    )
                    .endFill();
            }
        }
        createjs.Tween
            .get(that, { loop: true })
            .to({alpha: 0.125}, 500)
            .to({alpha: settings.opacity}, 500);
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
            controller.execute("shoot", that.getAffectedSquares());
            controller.done();
            hide();
        }
    }

    that.show = show;
    that.hide = hide;

    init();
    return that;
};

export default App.Bomb;
