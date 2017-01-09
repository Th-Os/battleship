(function (dbURL) {
    "use strict";
    /* eslint-env node */

    const query = require("pg-query");

    const queryString = "CREATE TABLE IF NOT EXISTS \
        users(userID SERIAL PRIMARY KEY, \
            username VARCHAR(40) not null, \
            socketID TEXT, \
            wins INTEGER, \
            fails INTEGER, \
            score INTEGER \
        );";

    query.connectionParameters = dbURL;

    query(queryString, (error) => {
        if(error) {
            process.exit(1);
        } else {
            process.exit();
        }
    });

})(process.env.DATABASE_URL);
