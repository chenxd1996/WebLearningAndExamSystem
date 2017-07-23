var DBConnect = require("../DataBase/DBConnect");
var con = DBConnect.getCon();
var fs = require("fs");
var path = require("path");

exports.loginCheck = function (req, res) {
    var id = req.body.id;
    var password = req.body.password;

    con.query("select * from Student " +
        "where sid = ? and password = ?", [id, password], function (err, row) {
        if (err) {
            console.log(err);
            res.json({
                logined: false
            });
        } else if (row.length == 0) {
            con.query("select * from Teacher " +
                "where tid = ? and password = ?", [id, password], function (err, row) {
                if (err) {
                    console.log(err);
                    res.json({
                        logined: false
                    });
                } else if (row.length == 0) {
                    con.query("select * from Admin " +
                        "where aid = ? and password = ?", [id, password], function (err, row) {
                        if (err) {
                            console.log(err);
                        } else if (row.length == 0) {
                            res.json({
                                logined: false
                            });
                        } else {
                            req.session.userInfo = {
                                id: id,
                                level: 3,
                                name: 'admin'
                            };
                            res.json({
                                logined: true,
                                level: 3,
                                name: 'admin'
                            });
                        }
                    })
                } else {
                    req.session.userInfo = {
                        id: id,
                        level: 2,
                        name: row[0]['tname']
                    };
                    res.json({
                        logined: true,
                        level: 2,
                        name: row[0]['tname']
                    });
                }
            })
        } else {
            req.session.userInfo = {
                id: id,
                level: 1,
                name: row[0]['sname']
            };
            res.json({
                logined: true,
                level: 1,
                name: row[0]['sname']
            });
        }
    });
};

exports.logout = function (req, res) {
    req.session.destroy();
};

exports.addUser = function (req, res) {
    var user = req.body;
    if (user.level == 1) {
        con.query("insert into Student" +
            " value(?, ?, ?, ?, ?, ?, ?)", [user.id, user.name, user.college, user.major, user.grade, user.class, user.password],
            function (err, result) {
                if (err) {
                    console.log(err);
                    res.json({
                        status: false
                    });
                } else {
                    res.json({
                       status: true
                    });
                }
            });
    } else if (user.level == 2) {
        con.query("insert into Teacher" +
            " value(?, ?, ?)", [user.id, user.name, user.password],
            function (err, result) {
                if (err) {
                    console.log(err);
                    res.json({
                        status: false
                    });
                } else {
                    res.json({
                       status: true
                    });
                }
        });
    }
};

exports.getMajorGradesAndClasses = function (req, res) {
    var majors = req.body.major;
    var query = "select distinct grade, class, major from Student where";

    if (majors.length > 1) {
        for (var i = 0; i < majors.length - 1; i++) {
            query += " major='" + majors[i] + "'or";
        }
        query += " major='" + majors[majors.length - 1] + "' order by major, grade, class";
    } else {
        query += " major='" + majors[majors.length - 1] + "' order by major, grade, class";
    }

    con.query(query, function (err, row) {
        if (err) {
            console.log("getMajorGradesAndClasses: " + err);
            res.json({
                status: false
            });
        } else {
            res.json({
                status: true,
                result: row
            });
        }
    });
};

exports.addCourse = function (req, res) {
    var course = req.body;
    console.log(course.endTime);
    var gradesAndClasses = course.gradesAndClasses;
    var remark = "";
    var len = gradesAndClasses.length;
    for (var i = 0; i < len - 1; i++) {
        remark += gradesAndClasses[i].major + gradesAndClasses[i].grade + "级" + gradesAndClasses[i].class + "班，";
    }

    remark += gradesAndClasses[len - 1].major + gradesAndClasses[len - 1].grade + "级" + gradesAndClasses[len - 1].class + "班";
    var cid = Date.now();
    console.log(cid);
    con.query('insert into Course ' +
        'value(?, ?, ?, ?, ?)', [cid, course.name, remark, course.endTime, course.description], function (err) {
        if (err) {
            console.log("Insert Course: " + err);
            res.json({
               status: false
            });
        } else {
            var query = "";
            var len = course.teachers.length;
            for (var i = 0; i < len - 1; i++) {
                query += "insert into TeacherCourse value('" + course.teachers[i] + "', '" + cid + "');";
            }
            query += "insert into TeacherCourse value('" + course.teachers[len - 1] + "', '" + cid + "')";

            con.query(query, function (err, result) {
               if (err) {
                   console.log("Insert TeacherCourse: " + err);
               } else {
                   var len = gradesAndClasses.length;
                   var query = "";
                   for (var i = 0; i < len; i++) {
                       query += "select sid from Student where grade = " +
                           gradesAndClasses[i].grade + " and class = " +
                           gradesAndClasses[i].class + " and major = '" +
                           gradesAndClasses[i].major + "';";
                   }
                   con.query(query, function (err, result) {
                      if (err) {
                          console.log("Get sid in addCourse: " + err);
                      } else {
                          var query = "";
                          for (var i = 0; i < result.length; i++) {
                              for (var j = 0; j < result[i].length; j++) {
                                  query += "insert into StudentCourse value('" +
                                      result[i][j]['sid'] + "', '" + cid + "');";
                              }
                          }

                          con.query(query, function (err, result) {
                              if (err) {
                                  console.log("Insert into StudentCourse in addCourse: " + err);
                              }
                              res.json({
                                 status: true
                              });
                          });
                      }
                   });
               }
            });
        }
    });
};

exports.getMyCourses = function (req, res) {
    var userInfo = req.body;
    var result = {};
    var query = "";
    if (userInfo.level == 1) {
        query = "select * from Course c, StudentCourse sc where sc.sid = ? and sc.cid = c.cid;"
    } else if (userInfo.level == 2) {
        query = "select * from Course c, TeacherCourse tc where tc.tid = ? and tc.cid = c.cid;"
    }
    con.query(query, [userInfo.id], function (err, row) {
        if (err) {
            console.log("getMyCourses query: " + err);
            res.json({
                status: false
            });
        } else {
            result.courses = row;
            var query = "";
            for (var i = 0; i < row.length; i++) {
                query += "select Count(*) from StudentCourse where " +
                    "cid = '" + row[i].cid + "';";
            }
            con.query(query, function (err, counts) {
                if (err) {
                    console.log(err);
                } else {
                    if (row.length == 1) {
                        result.studentCounts = [];
                        result.studentCounts.push(counts);
                    } else {
                        result.studentCounts = counts;
                    }

                    var query = "";
                    for (var i = 0; i < row.length; i++) {
                        query += "select Count(*) from CourseWareCourse where " +
                            "cid = '" + row[i].cid + "';";
                    }
                    con.query(query, function (err, counts) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (row.length == 1) {
                                result.courseWaresCounts = [];
                                result.courseWaresCounts.push(counts);
                            } else {
                                result.courseWaresCounts = counts;
                            }

                            res.json({
                                status: true,
                                result: result
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.getUserInfo = function (req, res) {
    if (req.session.userInfo) {
        res.json({
            status: true,
            id: req.session.userInfo.id,
            level: req.session.userInfo.level,
            name: req.session.userInfo.name
        });
    } else {
        res.json({
            status: false
        });
    }
};

exports.getCourseInfo = function (req, res) {
    var cid = req.body.cid;
    con.query('select c.description, c.remark, t.tname from Course c, Teacher t, TeacherCourse tc ' +
        'where c.cid = ? and c.cid = tc.cid and t.tid = tc.tid;', cid, function (err, result) {
        if (err) {
            console.log("getCourseInfo: " + err);
        } else {
            var teachers = "";
            for (var i = 0; i < result.length - 1; i++) {
                teachers += result[i]['tname'] + "，";
            }
            teachers += result[result.length - 1]['tname'];
            res.json({
                status: true,
                description: result[0]['description'],
                remark: result[0]['remark'],
                teachers: teachers
            });
        }
    });
};

exports.uploadCourseWares = function (req, res) {
    var cid = req.body.cid;
    con.query("insert into CourseWare " +
        "value('" + req.file.filename + "', '" +
        req.file.originalname + "', '" +
        req.file.mimetype + "');", function (err, result) {
        if (err) {
            console.log("Insert into CourseWare: " + err);
        } else {
            con.query("insert into CourseWareCourse " +
                "value('" + req.file.filename + "', '" +
                cid + "');",function (err, result) {
                if (err) {
                    console.log("Insert into CourseCourseWare: " + err);
                } else {
                    res.json({
                        status: true
                    });
                }
            });
        }
    });
};

exports.getCourseWares = function (req, res) {
    var cid = req.body.cid;
    con.query("select * from CourseWare cw, CourseWareCourse cwc " +
        "where cwc.cid = ? and cwc.cwid = cw.cid order by cw.cid DESC;", cid, function (err, result) {
        if (err) {
            console.log("getCourseWares: " + err);
        } else {
            res.json({
                result: result
            });
        }
    });
};

exports.getCourseWare = function (req, res) {
    var cid = req.query.cid;
    var type = req.query.type;
    fs.readFile(path.resolve(__dirname, '../CourseWares') + path.sep + cid, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            con.query('select cname from CourseWare ' +
                'where cid = ?;', cid, function (err, result) {
                if (err) {
                    console.log('select cname from CourseWare ' + err);
                } else {
                    res.setHeader("Content-Type", type);
                    res.download(path.resolve(__dirname, '../CourseWares') + path.sep + cid, result[0]['cname']);
                }
            })
        }
    });
};

exports.addExerciseBank = function (req, res) {
    var eid = new Date().getTime();
    con.query("insert into ExerciseBank " +
        "value(?, ?)", [eid, req.body.name], function (err, result) {
        if (err) {
            console.log("addExerciseBank: " + err);
            res.json({
                status: false
            });
        } else {
            con.query("insert into ExerciseBankCourse " +
                "value(?, ?)", [eid, req.body.id], function (err, result) {
                if (err) {
                    console.log("insert into ExerciseBankCourse: " + err);
                } else {
                    res.json({
                        status: true
                    });
                }
            });
        }
    });
};

exports.getExerciseBanks = function (req, res) {
    if (req.body.level == 1) {
        con.query("select * from StudentCourse sc, Course c, ExerciseBank e, ExerciseBankCourse ec " +
            "where sc.sid = ? and sc.cid = c.cid and ec.cid = c.cid and e.eid = ec.eid;", req.body.id, function (err, result) {
            if (err) {
                console.log("get student exercise banks: " + err);
                res.json({
                    status: false
                });
            } else {
                console.log(result);
                res.json({
                    status: true,
                    result: result
                });
            }
        });
    } else if (req.body.level == 2) {
        con.query("select * from TeacherCourse tc, Course c, ExerciseBank e, ExerciseBankCourse ec " +
            "where tc.tid = ? and tc.cid = c.cid and ec.cid = c.cid and e.eid = ec.eid;", req.body.id, function (err, result) {
            if (err) {
                console.log("get teacher exercise banks:" + err);
                res.json({
                    status: false
                });
            } else {
                res.json({
                    status: true,
                    result: result
                });
            }
        });
    }

};
