var mysql = require("mysql");

const config = {
  host: process.env.DB_ADDR || 'localhost',
  user: 'LearningAndExamSystem',
  password: 'qweasd123',
  database: 'LearningAndExamSystem',
  port: process.env.DB_PORT || '3306',
  multipleStatements: true
};

// var exportObj = {};
// function createConnection() {
//     exportObj.con = mysql.createConnection({
//         host: process.env.DB_ADDR || 'localhost',
//         user: 'LearningAndExamSystem',
//         password: 'qweasd123',
//         database: 'LearningAndExamSystem',
//         port: process.env.DB_PORT || '3306',
//         multipleStatements: true
//     });
// }

// createConnection();

// function connect() {
//     exportObj.con.connect(function (err) {
//         if (err) {
//             console.log("Can't connect to the database:" + err);
//         } else {
//             console.log("Connected to the database!");
//         }
//     });
// }

// connect();

// function listenError() {
//     exportObj.con.on('error', function (err) {
//         console.log("Mysql connection exists err: " + err);
//         if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//             console.error("Mysql connection lost!");
//             exportObj.con.destroy();
//             createConnection();
//             connect(exportObj.con);
//             listenError(exportObj.con);
//         } else {
//             console.log("Disconnected to the database during run time: " +  err);
//         }
//     });
// }

// listenError();

// exports.getCon = function () {
//     return con;
// };

// module.exports = exportObj;


const pool = mysql.createPool(config);

module.exports = pool;

