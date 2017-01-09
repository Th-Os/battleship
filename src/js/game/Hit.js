import Mark from "./Mark.js";

var App = App || {};
App.Hit = function(params) {
    "use strict";
    /* eslint-env browser */

    const that = new Mark(params.coords, params.width, params.height);

    function init() {
        const size = Math.min(params.width, params.height) * params.settings.size;
        that.graphics
            .setStrokeStyle(size * params.settings.strokeWidth)
            .beginStroke(params.settings.strokeColor)
            .moveTo(params.margin, params.margin)
            .lineTo(params.width - params.margin, params.height - params.margin)
            .moveTo(params.width - params.margin, params.margin)
            .lineTo(params.margin, params.height - params.margin)
            .endStroke();
        that.alpha = params.settings.opacity;
    }

    init();
    return that;
};

export default App.Hit;
