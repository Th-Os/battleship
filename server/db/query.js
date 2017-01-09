(function() {
    "use strict";

    const query = require("pg-query");

    function setConnectionString(dbURL) {
        query.connectionParameters = dbURL;
    }

    function executeQuery(queryString, array, fn) {
        query(queryString, (array || []), (error, rows, result) => {
            if(fn && typeof fn === "function") {
                if(error) {
                    fn(error);
                }
                fn(rows, result);
            }
        });
    }

    function getAllUsers(fn) {
        executeQuery("SELECT * FROM users ORDER BY score DESC", [], fn);
    }

    function getUser(username, fn) {
        executeQuery("SELECT * FROM users WHERE username=$1 LIMIT 1",
            [username], fn);
    }

    function updateUser(username, params, fn) {
        getUser(username, (rows) => {
            if(rows.length !== 0) {
                executeQuery(
                    "UPDATE users SET socketID=$2, wins=$3, fails=$4, score=$5 \
                        WHERE username=$1",
                    [
                        username,
                        params.id || rows[0].id,
                        params.wins || rows[0].wins,
                        params.fails || rows[0].fails,
                        params.score || rows[0].score
                    ],
                    getUser.bind(undefined, username, fn)
                );
            } else {
                createUser(username, params, getUser.bind(undefined, username, fn));
            }
        });
    }

    function createUser(username, params, fn) {
        executeQuery(
            "INSERT INTO users(username, socketID, wins, fails, score) \
                VALUES($1, $2, $3, $4, $5)",
            [
                username,
                params.id,
                params.wins || 0,
                params.fails || 0,
                params.score || 0
            ],
            fn
        );
    }




    exports.setConnectionString = setConnectionString;
    exports.getAllUsers = getAllUsers;
    exports.getUser = getUser;
    exports.updateUser = updateUser;
})();
