var mysql = require("mysql");
var con = mysql.createConnection({
    host: 'localhost',
    user: 'LearningAndExamSystem',
    password: 'qweasd123',
    database: 'LearningAndExamSystem',
    port: '3306',
    multipleStatements: true
});

con.connect(function (err) {
    if (err) {
        console.log("Can't connect to the database!");
    } else {
        console.log("Connected to the database!");
    }
});

con.on('error', function (err) {
    console.log("Mysql connection exists err: " + err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        con = mysql.createConnection({
            host: 'localhost',
            user: 'LearningAndExamSystem',
            password: 'qweasd123',
            database: 'LearningAndExamSystem',
            port: '3306',
            multipleStatements: true
        });
        con.connect(function (err) {
            if (err) {
                console.log("Can't connect to the database!");
            } else {
                console.log("Connected to the database!");
            }
        });
    } else {
        console.log("Disconnected to the database during run time: " +  err);
    }
});

exports.getCon = function () {
    return con;
};

