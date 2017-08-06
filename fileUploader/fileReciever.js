var multer = require('multer');
const path = require('path');
var DBConnect = require("../DataBase/DBConnect");
var con = DBConnect.getCon();
var fs = require("fs");

var storage = multer.diskStorage({
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
        cb(null, Date.now().toString() + '-' + filename);
    }
});

var upload = multer({ storage: storage });
exports.upload = upload;