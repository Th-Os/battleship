import "./css/normalize.css";
import "./scss/app.scss";

import io from "socket.io-client";
import ChatController from "./js/chat/ChatController.js";
import ScoreController from "./js/score/ScoreController.js";
import GameController from "./js/game/GameController.js";

var App = App || {};
App = (function () {
    "use strict";
    /* eslint-env browser */

    const socket = io();

    const chatController = new ChatController({
        send: (message) => {
            socket.emit("message", message);
        },
        login: (username) => {
            socket.emit("login", username);
        }
    });

    const scoreController = new ScoreController({
        update: (stats) => {
            socket.emit("update", stats);
        }
    });

    const gameController = new GameController({
        score: scoreController,
        log: (log) => {
            chatController.onLog(log.replace("{{user}}", "You"));
            socket.emit("log", log.replace("{{user}}", "Your opponent"));
        },
        ready: () => {
            socket.emit("ready");
        },
        switchTurn: () => {
            socket.emit("turn");
        },
        doAction: (action) => {
            socket.emit("action", action);
            socket.once("report", gameController.processReport);
        },
        doReport: (report) => {
            socket.emit("report", report);
        }
    });

    socket.on("log", chatController.onLog);
    socket.on("message", chatController.onMessage);
    socket.on("login", scoreController.onLogin);
    socket.on("turn", gameController.startTurn);
    socket.on("action", gameController.processAction);
})();
