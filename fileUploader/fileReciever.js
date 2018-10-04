var multer = require('multer');
const path = require('path');
const con = require("../DataBase/DBConnect");
var fs = require("fs");

var courseWareStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        con.query("select cname from Course " +
            "where cid = ?", req.body.cid, function(err, result) {
            if (err) {
                console.log("Get cname in fileReciever.js: " + err);
            } else {
                var p = 'public/CourseWares/' + result[0]['cname'];
                if (!fs.existsSync(p)) {
                    fs.mkdirSync(p);
                }
                cb(null, p);
            }
        });
    },
    filename: function (req, file, cb) {
        var filename = file.originalname.slice(0, file.originalname.lastIndexOf('.'));
        filename = filename.trim().replace(/\s/g, "");
        cb(null, Date.now().toString() + '-' + filename);
    }
});

var excelStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/Excels/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now().toString() + '.xlsx');
    }
});

var courseWareUpload = multer({ storage: courseWareStorage });
var excelUpload = multer({storage: excelStorage});
exports.courseWareUpload = courseWareUpload;
exports.excelUpload = excelUpload;
