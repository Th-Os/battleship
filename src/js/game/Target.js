import Mark from "./Mark.js";

var App = App || {};
App.Target = function(params) {
    "use strict";
    /* eslint-env browser */
    /* global createjs */

    const that = new Mark(params.coords, params.width, params.height);

    function init() {
        const size = Math.min(params.width, params.width) * params.settings.size;
        that.graphics
            .setStrokeStyle(size * params.settings.strokeWidth)
            .beginStroke(params.settings.strokeColor)
            .moveTo(params.width - params.margin, params.margin)
            .lineTo(params.margin, params.height - params.margin)
            .endStroke();
        that.alpha = params.settings.opacity;
        createjs.Tween.get(that, {loop:true})
            .to({alpha: Math.max(0, params.settings.opacity - 0.25)}, 2000)
            .to({alpha: params.settings.opacity}, 2000);
    }

    init();
    return that;
};

export default App.Target;
