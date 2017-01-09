var Server = Server || {};
Server = (function (port, dbURL) {
    "use strict";
    /* eslint-env node */

    const db = require("./db/query");
    const express = require("express");
    const bodyParser = require("body-parser");
    const app = express();
    const server = require("http").Server(app);
    const io = require("socket.io")(server);

    let queue = [];

    function init() {
        db.setConnectionString(dbURL);

        io.on("connection", (socket) => {
            socket.join("lobby");
            socket.emit("log", "You have been connected to the lobby");
            socket.broadcast.to("lobby").emit("log", "A new user has joined the lobby");
            socket.on("login", onLogin.bind(socket));
            socket.on("message", onMessage.bind(socket));
            socket.on("update", onUpdate.bind(socket));
            socket.on("log", onLog.bind(socket));
            socket.on("ready", onReady.bind(socket));
            socket.on("turn", onTurn.bind(socket));
            socket.on("action", onAction.bind(socket));
            socket.on("report", onReport.bind(socket));
            socket.on("disconnect", onDisconnect.bind(socket));
        });

        app.use(express.static(__dirname + "/../client"));
        app.use(bodyParser.urlencoded({
            extended: true
        }));

        server.listen(port, () => {
            console.log("Running on port", port);
        });
    }

    function onLogin(username) {
        const socket = this;
        socket.emit("log", "Logged in as " + username);
        socket.bsPlayer = username;
        db.updateUser(username, {id: socket.id}, (rows) => {
            socket.emit("login", rows[0]);
        });
    }

    function onMessage(data) {
        const socket = this;
        const message = {
            username: socket.bsPlayer,
            message: data
        };
        if(socket.bsRoom) {
            socket.broadcast.to(socket.bsRoom).emit("message", message);
        } else {
            socket.broadcast.emit("message", message);
        }
    }

    function onUpdate(data) {
        const socket = this;
        db.updateUser(socket.bsPlayer, data);
    }

    function onLog(data) {
        const socket = this;
        if(socket.bsRoom) {
            socket.broadcast.to(socket.bsRoom).emit("log", data);
        } else {
            socket.broadcast.emit("log", data);
        }
    }

    function onReady() {
        const socket = this;
        socket.leave("lobby");
        if(queue.length > 0) {
            const match = queue[0];
            queue.splice(0, 1);
            match.leave("lobby");
            match.bsRoom = match.id;
            match.bsOpponent = socket.id;
            socket.bsRoom = match.id;
            socket.bsOpponent = match.id;
            socket.join(match.id);
            socket.emit("log", "Starting game");
            match.emit("log", "Opponent found – Starting game");
            match.emit("turn");
        } else {
            queue.push(socket);
            socket.emit("log", "Looking for opponent");
        }
    }

    function onTurn() {
        const socket = this;
        socket.broadcast.to(socket.bsRoom).emit("turn");
    }

    function onAction(data) {
        const socket = this;
        socket.broadcast.to(socket.bsRoom).emit("action", data);
    }

    function onReport(data) {
        const socket = this;
        socket.broadcast.to(socket.bsRoom).emit("report", data);
    }

    function onDisconnect() {
        const socket = this;
        const index = queue.findIndex((user) => {
            return user.id === socket.id;
        });
        if(index !== -1) {
            queue.splice(index, 1);
        }
        if(socket.bsRoom) {
            socket.broadcast.to(socket.bsRoom).emit("log", "Your opponent left");
        } else if(socket.bsPlayer) {
            socket.broadcast.emit("log", socket.bsPlayer + " left");
        }
    }

    init();

})((process.env.PORT || 8080), process.env.DATABASE_URL);
