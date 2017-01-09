import "../../scss/game.scss";

import Settings from "./Settings.js";
import Map from "./Map.js";
import Powerups from "./Powerups.js";

var App = App || {};
App.GameController = function(app) {
    "use strict";
    /* eslint-env browser */

    const that = {};
    const game = document.querySelector(".bs-game");
    const playerCanvas = game.querySelector("#bs-player-map");
    const opponentCanvas = game.querySelector("#bs-opponent-map");
    const powerupsContainer = game.querySelector(".dashboard .powerups");
    const button = game.querySelector(".dashboard button");
    const timer = game.querySelector(".dashboard .timer");
    const timerLabel = timer.querySelector("label");
    const overlay = document.querySelector(".bs-overlay");
    const win = document.querySelector(".bs-overlay .win");
    const fail = document.querySelector(".bs-overlay .fail");
    /// hooks
    const onReport = {};
    const onAction = {};
    const onExecution = {};

    let playerMap,
        opponentMap,
        powerups,
        func,
        timekeeper,
        time,
        turn = false,
        waiting = false;

    function init() {
        const size = game.offsetWidth * (window.devicePixelRatio || 1);
        playerCanvas.width = size;
        playerCanvas.height = size;
        opponentCanvas.width = size;
        opponentCanvas.height = size;
        playerMap = new Map(playerCanvas, Settings);
        opponentMap = new Map(opponentCanvas, Settings);
        powerups = new Powerups(that, playerMap, opponentMap, powerupsContainer, Settings.powerup);

        resetButton();
        playerMap.addShips();
        playerMap.addShipListeners();
        opponentMap.addEventListener("squareClick", shoot);
        app.score.createFleetDisplay(Settings.fleet);
    }

    function resetButton(purpose) {
        button.removeEventListener("click", func);
        switch(purpose) {
        case "wait":
            button.className = "wait";
            setButtonLabel("");
            break;
        case "flip":
            button.className = "flip";
            setButtonLabel("Flip Map");
            func = flip;
            break;
        case "start":
            button.className = "start";
            setButtonLabel("New Game");
            func = start;
            break;
        default:
            button.className = "ready";
            setButtonLabel("Ready");
            func = ready;
            break;
        }
        if(purpose !== "wait") {
            button.addEventListener("click", func);
        }
    }

    function setButtonLabel(text) {
        const label = button.querySelector("label");
        label.innerHTML = text;
    }

    function start() {
        // TODO: Start new game when previous is finished...
    }

    function ready() {
        app.ready();
        playerMap.removeShipListeners();
        wait();
    }

    function flip() {
        game.classList.toggle("flipped");
    }

    function viewPlayerMap() {
        if(game.classList.contains("flipped")) {
            flip();
        }
    }

    function viewOpponentMap() {
        if(!game.classList.contains("flipped")) {
            flip();
        }
    }

    function wait() {
        viewPlayerMap();
        resetButton("wait");
    }

    function isWaiting() {
        return waiting;
    }

    function hasTurn() {
        return turn;
    }

    function startTurn() {
        stopCountdown();
        startCountdown();
        viewOpponentMap();
        resetButton("flip");
        turn = true;
    }

    function endTurn() {
        turn = false;
        app.switchTurn();
        stopCountdown();
        startCountdown();
        setTimeout(wait, 1000);
    }

    function countdown() {
        time -= 1000;
        setTimer(time);
        if(time < Settings.turn.time / 3) {
            timer.classList.add("alert");
            timer.style.opacity = 0;
            setTimeout(() => {
                timer.style.opacity = 1;
            }, 500);
            if(time <= 0) {
                timer.classList.remove("alert");
                endTurn();
            }
        }
    }

    function stopCountdown() {
        clearInterval(timekeeper);
        timer.classList.remove("alert");
        setTimer(Settings.turn.time);
    }

    function startCountdown() {
        clearInterval(timekeeper);
        time = Settings.turn.time;
        timekeeper = setInterval(countdown, 1000);
    }

    function setTimer(time) {
        const mins = Math.floor(time / 60000);
        const secs = Math.floor((time % 60000) / 1000);
        const minString = (mins < 10) ? "0" + mins : mins;
        const secString = (secs < 10) ? "0" + secs : secs;
        timerLabel.innerHTML = minString + ":" + secString;
    }

    function processReport(data) {
        let miss;
        waiting = false;
        startCountdown();
        if(data.constructor === Array) {
            miss = data.map((report) => {
                return executeReport(report);
            }).every((curr) => {
                return curr;
            });
        } else {
            miss = executeReport(data);
        }
        if(miss) {
            endTurn();
        }
    }

    function executeReport(data) {
        if(data) {
            switch(data.type) {
            case "miss":
                handleMiss(data.coords);
                return true;
            case "fail":
                handleHit(data.coords);
                handleSink(data.ship);
                handleWin();
                return false;
            case "sink":
                handleHit(data.coords);
                handleSink(data.ship);
                return false;
            case "hit":
                handleHit(data.coords);
                return false;
            default:
                return onReport[data.type](data.coords);
            }
        }
    }

    function processAction(data) {
        stopCountdown();
        startCountdown();
        app.doReport(executeAction(data));
    }

    function executeAction(data) {
        switch(data.type) {
        case "shoot":
            return handleShot(data.coords);
        default:
            if(onAction[data.type]) {
                if(data.coords.constructor === Array) {
                    return data.coords.map(onAction[data.type])
                        .filter((coords) => {
                            if(coords) { return coords; }
                        });
                } else {
                    return onAction[data.type](data.coords);
                }
            }
        }
    }

    function processHook(type, coords) {
        if(onExecution[type].constructor === Array &&
            onExecution[type].length > 0) {
            return onExecution[type].map((fn) => {
                return fn(coords);
            }).reduce((arr, curr) => {
                arr.concat(curr);
                return arr;
            }, []);
        } else {
            return onExecution[type](coords);
        }
    }

    function handleShot(coords) {
        if(coords.constructor === Array) {
            return coords.map(handleShot);
        } else {
            if(onExecution["shoot"]) {
                const report = processHook("shoot", coords);
                if(report) {
                    return report;
                }
            }
            if(playerMap.shoot(coords)) {
                const ship = playerMap.getShipOnSquare(coords);
                if(ship && ship.isSunk()) {
                    playerMap.sink(ship);
                    if(playerMap.allShipsSunk()) {
                        handleFail();
                        return {
                            coords: coords,
                            type: "fail",
                            ship: {
                                coords: ship.getPosition(),
                                length: ship.getLength(),
                                orientation: ship.getOrientation()
                            }
                        };
                    }
                    return {
                        coords: coords,
                        type: "sink",
                        ship: {
                            coords: ship.getPosition(),
                            length: ship.getLength(),
                            orientation: ship.getOrientation()
                        }
                    };
                }
                return {
                    coords: coords,
                    type: "hit"
                };
            }
            return {
                coords: coords,
                type: "miss"
            };
        }
    }

    function handleHit(coords) {
        if(Settings.score["hit"]) {
            app.score.updateScoreCount(Settings.score.hit);
        }
        opponentMap.mark("hit", coords);
    }

    function handleMiss(coords) {
        if(Settings.score["miss"]) {
            app.score.updateScoreCount(Settings.score.miss);
        }
        opponentMap.mark("miss", coords);
    }

    function handleSink(params) {
        if(Settings.score["sink"]) {
            app.score.updateScoreCount(Settings.score.sink);
        }
        app.score.updateShipDisplay(params.length);
        opponentMap.addShipWithParams(params);
        opponentMap.sink(opponentMap.getShipOnSquare(params.coords));
    }

    function endMatch() {
        turn = false;
        timerLabel.innerHTML = "";
        stopCountdown();
        resetButton("flip");
        opponentMap.removeEventListener("squareClick", shoot);
    }

    function handleWin() {
        endMatch();
        showOverlay(win);
        app.score.updateWinCount();
        app.log("{{user}} won");
    }

    function handleFail() {
        endMatch();
        showOverlay(fail);
        app.score.updateFailCount();
        app.log("{{user}} failed");
    }

    function showOverlay(screen) {
        overlay.style.display = "block";
        screen.style.display = "block";
        setTimeout(() => {
            screen.style.display = "none";
            overlay.style.display = "none";
        }, 4000);
    }

    function register(hook, type, fn) {
        if(typeof fn === "function") {
            switch(hook) {
            case "onAction":
                if(!onAction[type]) {
                    onAction[type] = fn;
                }
                break;
            case "onReport":
                if(!onReport[type]) {
                    onReport[type] = fn;
                }
                break;
            case "onExecution":
                if(onExecution[type]) {
                    if(onExecution[type].constructor === Array) {
                        onExecution[type].push(fn);
                    } else {
                        onExecution[type] = [onExecution[type], fn];
                    }
                } else {
                    onExecution[type] = fn;
                }
                break;
            default:
                break;
            }
        }
    }

    function unregister(hook, type, fn) {
        if(typeof fn === "function") {
            switch(hook) {
            case "onAction":
                if(onAction[type] === fn) {
                    delete onAction[type];
                }
                break;
            case "onReport":
                if(onAction[type] === fn) {
                    delete onAction[type];
                }
                break;
            case "onExecution":
                if(onExecution[type]) {
                    if(onExecution[type].constructor === Array) {
                        onExecution[type] = onExecution[type].filter((cb) => {
                            return (cb === fn) ? false : true;
                        });
                    } else if(onExecution[type] === fn) {
                        delete onExecution[type];
                    }
                }
                break;
            default:
                break;
            }
        }
    }

    function shoot(e) {
        if(!powerups.active() && hasTurn() && !isWaiting()) {
            execute("shoot", {x: e.x, y: e.y});
        }
    }

    function execute(type, coords) {
        waiting = true;
        stopCountdown();
        app.doAction({type, coords});
    }

    function done() {
        const powerup = powerups.active();
        if(powerup) {
            app.log("{{user}} used a " +
                Settings.powerup[powerup.getType()].title);
            powerups.done();
        }
    }

    that.viewPlayerMap = viewPlayerMap;
    that.viewOpponentMap = viewOpponentMap;
    that.isWaiting = isWaiting;
    that.hasTurn = hasTurn;
    that.startTurn = startTurn;
    that.endTurn = endTurn;
    that.processAction = processAction;
    that.processReport = processReport;
    that.register = register;
    that.unregister = unregister;
    that.execute = execute;
    that.done = done;

    init();
    return that;
};

export default App.GameController;
