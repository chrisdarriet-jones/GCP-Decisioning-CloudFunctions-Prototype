const mysql = require('mysql');
const connectionName = process.env.CloudSQLConnection;
const dbUser = process.env.CloudSQLUser;
const dbPass = process.env.CloudSQLPassword;
const dbName = process.env.CloudSQLDB;

/**
 * Creates a connection pool to Cloud SQL for the function to use
 * */
exports.createPool = function createPool () {
    var pool = mysql.createPool({
        connectionLimit: 1,
        socketPath: '/cloudsql/' + connectionName,
        //host: 'localhost',
        user: dbUser,
        password: dbPass,
        database: dbName
    });
    return pool;
}