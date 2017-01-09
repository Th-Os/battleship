(function (dbURL) {
    "use strict";
    /* eslint-env node */

    const query = require("pg-query");

    const queryString = "DROP TABLE IF EXISTS users;";

    query.connectionParameters = dbURL;

    query(queryString, (error) => {
        if(error) {
            process.exit(1);
        } else {
            process.exit();
        }
    });

})(process.env.DATABASE_URL);
