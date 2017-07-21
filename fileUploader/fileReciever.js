var multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'CourseWares/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now().toString());
    }
});

var upload = multer({ storage: storage });
exports.upload = upload;