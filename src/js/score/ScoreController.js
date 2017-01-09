import "../../scss/score.scss";

var App = App || {};
App.ScoreController = function(app) {
    "use strict";
    /* eslint-env browser */

    const that = {};
    const container = document.querySelector(".bs-score");
    const matchDisplay = container.querySelector(".match");
    const userDisplay = container.querySelector(".user");
    const score = document.createElement("div");
    const label = document.createElement("div");
    const wins = document.createElement("span");
    const fails = document.createElement("span");

    let scoreCount = 0,
        winsCount = 0,
        failsCount = 0;

    function init() {
        score.classList.add("score");
        label.classList.add("label");
        score.innerHTML = 0;
        label.innerHTML = "Score";
        userDisplay.appendChild(score);
        userDisplay.appendChild(label);
    }

    function onLogin(user) {
        const name = document.createElement("div");
        const stats = document.createElement("div");
        const separator = document.createElement("span");
        name.classList.add("name");
        stats.classList.add("stats");
        wins.classList.add("wins");
        separator.classList.add("separator");
        fails.classList.add("fails");
        scoreCount += user.score;
        winsCount += user.wins;
        failsCount += user.fails;
        name.innerHTML = user.username;
        score.innerHTML = scoreCount;
        wins.innerHTML = winsCount;
        fails.innerHTML = failsCount;
        separator.innerHTML = "|";
        userDisplay.removeChild(label);
        userDisplay.insertBefore(name, score);
        stats.appendChild(wins);
        stats.appendChild(separator);
        stats.appendChild(fails);
        userDisplay.appendChild(stats);
    }

    function updateScoreCount(points) {
        scoreCount += points;
        score.innerHTML = scoreCount;
    }

    function updateWinCount() {
        winsCount += 1;
        wins.innerHTML = winsCount;
        app.update({
            wins: winsCount,
            score: scoreCount
        });
    }

    function updateFailCount() {
        failsCount += 1;
        fails.innerHTML = failsCount;
        app.update({
            fails: failsCount,
            score: scoreCount
        });
    }

    function createFleetDisplay(fleet) {
        fleet.forEach(createShipDisplay.bind(undefined, fleet));
        resizeFleetDisplay(fleet);
        window.addEventListener("resize",
            resizeFleetDisplay.bind(undefined, fleet));
    }

    function createShipDisplay(fleet, ship) {
        const row = document.createElement("div");
        row.classList.add("row");
        for(let i = 0; i < ship.count; i++) {
            let shipDisplay = document.createElement("span");
            shipDisplay.classList.add("ship", "length-" + ship.length);
            shipDisplay.setAttribute("data-length", ship.length);
            row.appendChild(shipDisplay);
        }
        matchDisplay.appendChild(row);
    }

    function resizeFleetDisplay(fleet) {
        const unit = Math.round((matchDisplay.offsetHeight / fleet.length) / 3);
        const rows = matchDisplay.querySelectorAll(".row");
        for(let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            row.style.marginTop = unit + "px";
            row.style.marginRight = unit + "px";
            row.style.marginBottom = unit + "px";
            row.style.marginLeft = unit + "px";
            const shipDisplays = row.querySelectorAll(".ship");
            for(let j = 0; j < shipDisplays.length; j++) {
                const shipDisplay = shipDisplays.item(j);
                const length = shipDisplay.getAttribute("data-length");
                shipDisplay.style.height = unit + "px";
                shipDisplay.style.width = (unit * length) + "px";
                shipDisplay.style.marginRight = unit + "px";
                shipDisplay.style.marginBottom = unit + "px";
            }
        }
    }

    function updateShipDisplay(length) {
        matchDisplay
            .querySelector(".ship.length-" + length + ":not(.sunk)")
            .classList.add("sunk");
    }

    that.onLogin = onLogin;
    that.updateScoreCount = updateScoreCount;
    that.updateWinCount = updateWinCount;
    that.updateFailCount = updateFailCount;
    that.createFleetDisplay = createFleetDisplay;
    that.updateShipDisplay = updateShipDisplay;

    init();
    return that;
};

export default App.ScoreController;
