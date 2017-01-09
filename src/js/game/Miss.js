import Mark from "./Mark.js";

var App = App || {};
App.Miss = function(params) {
    "use strict";
    /* eslint-env browser */

    const that = new Mark(params.coords, params.width, params.height);

    function init() {
        const size = Math.min(params.width, params.height) * params.settings.size;
        that.graphics
            .setStrokeStyle(size * params.settings.strokeWidth)
            .beginStroke(params.settings.strokeColor)
            .drawEllipse(
                params.margin,
                params.margin,
                size,
                size
            )
            .endStroke();
        that.alpha = params.settings.opacity;
    }

    init();
    return that;
};

export default App.Miss;
