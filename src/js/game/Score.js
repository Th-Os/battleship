import "../../scss/score.scss";

var App = App || {};
App.Score = function (container, fleet) {
    "use strict";
    /* eslint-env browser */

    const that = {};

    let display;

    function init() {
        display = document.createElement("div");
        display.classList.add("display");
        container.appendChild(display);
        fleet.forEach(createScoreIndicator.bind(undefined, display));
    }

    function createScoreIndicator(display, ship) {
        const unit = Math.round((display.offsetHeight / fleet.length) / 3);
        const row = document.createElement("div");
        row.classList.add("row");
        row.style.marginLeft = (unit / 3) + "px";
        row.style.marginRight = (unit / 3) + "px";
        row.style.marginTop = (unit / 3) + "px";
        row.style.marginBottom = unit + "px";
        for(let i = 0; i < ship.count; i++) {
            let span = document.createElement("span");
            span.classList.add("ship", "length-" + ship.length);
            span.style.height = unit + "px";
            span.style.width = (unit * ship.length) + "px";
            span.style.marginRight = unit + "px";
            span.style.marginBottom = unit + "px";
            row.appendChild(span);
        }
        display.appendChild(row);
    }

    function update(length) {
        display
            .querySelector(".ship.length-" + length + ":not(.sunk)")
            .classList.add("sunk");
    }

    that.update = update;

    init();
    return that;
};

export default App.Score;
