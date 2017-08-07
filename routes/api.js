var DBConnect = require("../DataBase/DBConnect");
var con = DBConnect.getCon();
var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;

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
    req.session.destroy(function () {
        res.json({
           status: true
        });
    });
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
    var gradesAndClasses = course.gradesAndClasses;
    var remark = "";
    var len = gradesAndClasses.length;
    for (var i = 0; i < len - 1; i++) {
        remark += gradesAndClasses[i].major + gradesAndClasses[i].grade + "级" + gradesAndClasses[i].class + "班，";
    }

    remark += gradesAndClasses[len - 1].major + gradesAndClasses[len - 1].grade + "级" + gradesAndClasses[len - 1].class + "班";
    var cid = Date.now();
    con.query('insert into Course ' +
        'value(?, ?, ?, ?, ?)', [cid, course.name, remark, course.endTime, course.description], function (err) {
        if (err) {
            console.log("Insert Course: " + err);
            res.json({
               status: false
            });
        } else {
            res.json({
                status: true
            });
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
                          if(result.length == 1) {
                              var tmp = [];
                              tmp.push(result);
                              result = tmp;
                          }
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
                              } else {
                                  var mid = new Date().getTime();
                                  var link = "/homePage/learning-system/my-courses";
                                  var title = "您有新的课程 \"" + course.name + "\"";
                                  sysMessage(mid, link, title, cid, true);
                              }
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
            if (row.length > 0) {
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
            } else {
                res.json({
                    status: true,
                    result: result
                });
            }

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
    var filename = req.file.originalname.slice(0, req.file.originalname.lastIndexOf('.'));
    con.query("select cname from Course " +
        "where cid = ?", cid, function (err, result) {
        if (err) {
            console.log("Get course name in uploadCourseWares: " + err);
        } else {
            var cname = result[0]['cname'];
            var p = "../public/CourseWares/" + cname + "/"  + req.file.filename;
            exec('pdf2swf ' + p + ' -o ' + p + '.swf -T 9', {
                cwd: __dirname
            }, function(error, stdout, stderr) {
                if (error) {
                    console.log('exec error: ' + error);
                } else {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                }
            });
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
                            var mid = new Date().getTime();
                            var link = "/homePage/learning-system/course-detail/" + cid + "/course-data";
                            var title = "您所在的课程 \"" + cname + "\" 有新的课件 \"" + filename + "\"";
                            sysMessage(mid, link, title, cid, false);

                        }
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

exports.updateLearningStatus = function (req, res) {
    console.log(req.body);
    var userInfo = req.body.userInfo;
    var pages = res.body.pages;
    var cwid = req.body.cwid;
    con.query("select learningTime, learningPages from StudentCourseWare " +
        "where sid = ? and cid = ?", [userInfo.id, cwid], function (err, result) {
        if (err) {
            console.log("Get learningTime, learningPages from StudentCourseWare in updateLearningStatus: " + err);
        } else {
            if (result.length == 0) {
                var pagesStr = "";
                if (pages.length > 0) {
                    pagesStr = pages[0];
                    for (var i = 1; i < pages.length; i++) {
                        pagesStr += " " + pages[i];
                    }
                }
                con.query("insert into StudentCourseWare " +
                    "value(?, ?, ?, ?);", [userInfo.id, cwid, pagesStr, 1], function (err) {
                    if (err) {
                        console.log("Insert into StudentCourseWare in updateLearningStatus: " + err);
                    } else {
                        res.json({});
                    }
                });
            } else {
                var pagesStr = result[0]['learningPages'];
                var learningTime = result[0]['learningTime'] + 1;
                var tmpPages = pagesStr.splice(" ");
                for (var i = 0; i < pages.length; i++) {
                    if (tmpPages.indexOf(pages[i]) < 0) {
                        pagesStr += " " + pages[i];
                    }
                }
                con.query("update StudentCourseWare " +
                    "set learningTime = ?, learningPages = ? " +
                    "where sid = ? and cid = ?;", [learningTime, pagesStr, userInfo.id, cwid], function (err) {
                    if (err) {
                        console.log("Update StudentCourseWare in updateLearningStatus: " + err);
                    } else {
                        res.json({});
                    }
                });
            }
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
                    con.query("select cname from Course " +
                        "where cid = ?", req.body.id, function (err, result) {
                        if (err) {
                            console.log("Get course name in addExerciseBank: " + err);
                        } else {
                            var mid = new Date().getTime();
                            var link = "/homePage/exercise-system/exercise-system/my-exercise-bank";
                            var title = "您所在的课程 \"" + result[0]['cname'] + "\" 有新的题库 \"" + req.body.name + "\" ";
                            sysMessage(mid, link, title, req.body.id, false);
                        }
                    });
                }
            });
        }
    });
};

exports.getExerciseBanks = function (req, res) {
    if (req.body.level == 1) {
        con.query("select c.cname, eb.eid, eb.ename from StudentCourse sc, Course c, ExerciseBank eb, ExerciseBankCourse ec " +
            "where sc.sid = ? and sc.cid = c.cid and ec.cid = c.cid and eb.eid = ec.eid;", req.body.id, function (err, result) {
            if (err) {
                console.log("get student exercise banks: " + err);
                res.json({
                    status: false
                });
            } else {
                if (result.length > 0) {
                    var query = "";
                    for (var i = 0; i < result.length; i++) {
                        query += "select Count(*) as exerciseNum from Exercise e, ExerciseBank eb " +
                            "where e.ebid = eb.eid and eb.eid = '" + result[i].eid + "';";
                    }
                    con.query(query, function (err, rows) {
                        if (err) {
                            console.log("Get exercises count: " + err);
                        } else {
                            res.json({
                                status: true,
                                result: result,
                                counts: rows
                            });
                        }
                    });
                } else {
                    res.json({
                        status: true,
                        result: result
                    });
                }
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
                if (result.length > 0) {
                    var query = "";
                    for (var i = 0; i < result.length; i++) {
                        query += "select Count(*) as exerciseNum from Exercise e, ExerciseBank eb " +
                            "where e.ebid = eb.eid and eb.eid = '" + result[i].eid + "';";
                    }
                    con.query(query, function (err, rows) {
                        if (err) {
                            console.log("Get exercises count: " + err);
                        } else {
                            res.json({
                                status: true,
                                result: result,
                                counts: rows
                            });
                        }
                    });
                } else {
                    res.json({
                        status: true,
                        result: result
                    });
                }
            }
        });
    }

};

exports.addExercise = function (req, res) {
    var description = req.body.description;
    var options = req.body.options;
    var answers = req.body.answers;
    var ebid = req.body.ebid;
    var eid = new Date().getTime();
    con.query("insert into Exercise " +
        "value(?,?,?);", [eid, ebid, description],function (err, result) {
        if (err) {
            console.log("Insert into Exercise " + err);
        } else {
            var query = "";
            for (var i = 0; i < options.length; i++) {
                query += "insert into Op value('" + options[i].op +
                    "', '" + options[i].description + "', '" + eid + "');";
            }
            con.query(query, function (err, result) {
                if (err) {
                    console.log("Insert into Op " + err);
                } else {
                    var answer = "";
                    for (var i = 0; i < answers.length - 1; i++) {
                        answer += answers[i];
                    }
                    answer += answers[answers.length - 1];
                    con.query("insert into Answer " +
                        "value(?, ?);",[answer, eid], function (err, result) {
                        if (err) {
                            console.log("Insert into Answer: " + err);
                        } else {
                            res.json({
                                status: true
                            });
                            con.query("select c.cname, c.cid, eb.ename from Course c, ExerciseBankCourse ebc, ExerciseBank eb " +
                                "where eb.eid = ? and eb.eid = ebc.eid and ebc.cid = c.cid;", ebid, function (err, result) {
                                if (err) {
                                    console.log("Get course name in addExercise: " + err);
                                } else {
                                    var cname = result[0]['cname'];
                                    var ename = result[0]['ename'];
                                    var cid = result[0]['cid'];
                                    con.query("select count(*) from Message " +
                                        "where eid = ?;", ebid, function (err, result) {
                                        if (result[0]['count(*)'] == 0) {
                                            var mid = new Date().getTime();
                                            var link = "/homePage/exercise-system/exerciseBank-detail/" + ebid + "/exercise/uncompleted";
                                            var title = "您所在的课程 \"" + cname + "\" 的题库 \"" + ename + "\" 有更新";
                                            sysMessage(mid, link, title, cid, false, ebid);
                                        } else {
                                            var mid = new Date().getTime();
                                            con.query("update Message " +
                                                "set mid = ? " +
                                                "where eid = ?;", [mid, ebid], function (err) {
                                                if (err) {
                                                    console.log("Update Message in addExercise: " + err);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.getExercise = function (req, res) {
    var ebid = req.body.ebid;
    var result = {};
    var userInfo = req.body.userInfo;
    if (userInfo) {
        var query = "";
        if (userInfo.level == 1) {
            query = "select *, e.eid as eid from Exercise e left join StudentExercise se on e.eid = se.eid " +
                "left join Answer a on se.eid = a.eid " +
                "where " +
                "e.ebid = ? order by e.eid;"
        } else if (userInfo.level == 2) {
            query = "select * from Exercise e left join Answer a on e.eid = a.eid " +
                "where " +
                "e.ebid = ? order by e.eid;"
        }
        con.query(query, [ebid, userInfo.id], function (err, result1) {
            if (err) {
                console.log("get exercise: " + err);
            } else {
                result.exercise = result1;
                var query = "";
                for (var i = 0; i < result1.length; i++) {
                    query += "select * from Op " +
                        "where eid = '" + result1[i].eid + "' order by eid;";
                }
                con.query(query, function (err, result2) {
                    if (err) {
                        console.log("get options: " + err);
                    } else {
                        if (result1.length == 1) {
                            result.options = [];
                            result.options.push(result2);
                        } else {
                            result.options = result2;
                        }
                        res.json(result);
                    }
                });
            }
        });
    }
};

exports.submitAndGetAnswer = function (req, res) {
    var options = req.body.options;
    var userInfo = req.body.userInfo;
    var answer = "";
    for (var i = 0; i < options.length - 1; i++) {
        answer += options[i].op;
    }
    answer += options[options.length - 1].op;
    if (userInfo && userInfo.level == 1) {
        con.query("insert into StudentExercise " +
            "value(?,?,?);", [userInfo.id, options[0].eid, answer], function (err, result) {
            if (err) {
                console.log("Insert into StudentExercise: " + err);
            }
            con.query("select * from Answer " +
                "where eid = ?;", options[0].eid, function (err, result) {
                if (err) {
                    console.log("get answer in submitAndGetAnswer: " + err);
                } else {
                    res.json({
                        result: result
                    });
                }
            });
        })
    }
};

exports.getCourseExerciseBanks = function (req, res) {
    var cid = req.body.cid;
    con.query("select eb.eid, eb.ename from ExerciseBank eb, ExerciseBankCourse ebc " +
        "where ebc.cid = ? and eb.eid = ebc.eid", cid, function (err, result) {
        if (err) {
            console.log("Get course's exercise banks: " + err);
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
};

exports.addExam = function (req, res) {
    var cid = req.body.cid;
    var startTime = new Date(req.body.startTime);
    var endTime = new Date(req.body.endTime);
    var examDate = new Date(req.body.examDate);
    var ename = req.body.examName;
    var examPoints = req.body.examPoints;
    var eid = new Date().getTime();
    var ebs = req.body.ebs;
    startTime.setDate(examDate.getDate());
    startTime.setMonth(examDate.getMonth());
    startTime.setFullYear(examDate.getFullYear());
    startTime.setSeconds(0);
    endTime.setDate(examDate.getDate());
    endTime.setMonth(examDate.getMonth());
    endTime.setFullYear(examDate.getFullYear());
    endTime.setSeconds(0);
    con.query("insert into Exam " +
        "value(?, ?, ?, ? ,?);", [eid, ename, examPoints, startTime.getTime(), endTime.getTime()], function (err, result) {
        if (err) {
            console.log("Insert into Exam: " + err);
        } else {
            var query = "";
            for (var i = 0; i < ebs.length; i++) {
                if (ebs[i].exerciseNum > 0) {
                    query += "insert into ExamExerciseBank " +
                        "value('" + eid + "', '" + ebs[i].eid + "');";
                }
            }
            con.query(query, function (err, result) {
               if (err) {
                   console.log("Insert into ExamExerciseBank: " + err);
               } else {
                   con.query("insert into ExamCourse " +
                       "value(?, ?)", [eid, cid], function (err, result) {
                           if (err) {
                               console.log("Insert into ExamCourse: "  + err);
                           } else {
                               con.query("insert into StudentExam(sid, eid) " +
                                   "select sid, eid from " +
                                   "(select sid, eid from StudentCourse sc, ExamCourse ec where " +
                                   "sc.cid = ec.cid and ec.eid = ?) as tb;", eid,
                               function (err, result) {
                                  if (err) {
                                      console.log("insert into StudentExam in addExam: " + err);
                                  } else {
                                      var query = "";
                                      for (var i = 0; i < ebs.length; i++) {
                                          query += "select e.eid, e.ebid from ExerciseBank eb, Exercise e " +
                                              "where eb.eid = '" + ebs[i].eid + "' and eb.eid = e.ebid;";
                                      }
                                      con.query(query, function (err, result) {
                                          if (err) {
                                              console.log("Get exercise in addExam: " + err);
                                          } else {
                                              var query = "";
                                              if (result.length == 1) {
                                                  var tmp = [];
                                                  tmp.push(result);
                                                  result = tmp;
                                              }
                                              for (var i = 0; i < ebs.length; i++) {
                                                  ebs[i].exercise = [];
                                                  var exerciseAll;
                                                  for (var j = 0; j < result.length; j++) {
                                                      if (ebs[i].eid == result[j][0].ebid) {
                                                          exerciseAll = result[j];
                                                          break;
                                                      }
                                                  }
                                                  for (var j = 0; j < ebs[i].exerciseNum; j++) {
                                                      var k = Math.round(Math.random()* (exerciseAll.length - 1));
                                                      while (ebs[i].exercise.indexOf(exerciseAll[k].eid) >= 0) {
                                                          k = Math.round(Math.random()* (exerciseAll.length - 1));
                                                      }
                                                      ebs[i].exercise.push(exerciseAll[k].eid);
                                                      query += "insert into ExamExercise " +
                                                          "value('" + eid + "', '" + exerciseAll[k].eid + "');";
                                                  }
                                              }
                                              con.query(query, function (err, result) {
                                                  if (err) {
                                                      console.log("Insert into ExamExercise: " + err);
                                                  } else {
                                                      res.json({
                                                          status: true
                                                      });
                                                      con.query("select cname from Course " +
                                                          "where cid = ?", cid, function (err, result) {
                                                          if (err) {
                                                              console.log("Get course name in addExam: " + err);
                                                          } else {
                                                              var mid = new Date().getTime();
                                                              var link = "/homePage/exam-system/my-exams/notStarted";
                                                              var title = "您所在的课程 \"" + result[0]['cname'] + "\" 有新的考试 \"" + ename + "\" ";
                                                              sysMessage(mid, link, title, cid, false);
                                                          }
                                                      });
                                                  }
                                              });
                                          }
                                      });
                                  }
                               });
                           }
                       }
                   );
               }
            });
        }
    });
};

exports.getMyExams = function (req, res) {
    var userInfo = req.body.userInfo;
    var status = req.body.status;
    if (userInfo.level == 1) {
        var query = "";
        var now = new Date().getTime();
        if (status == "notStarted") {
            query = "select c.cname, e.startTime, e.endTime, e.eid, e.ename from Course c, Exam e, ExamCourse ec, StudentCourse sc " +
                "where sc.sid = ? and sc.cid = ec.cid and ec.eid = e.eid and c.cid = sc.cid and e.startTime > ?;";
        } else if (status == "progressing") {
            query = "select c.cname, e.startTime, e.endTime, e.eid, e.ename from Course c, Exam e, ExamCourse ec, StudentCourse sc " +
                "where sc.sid = ? and sc.cid = ec.cid and ec.eid = e.eid and c.cid = sc.cid and e.startTime <= ? and e.endTime >= ?;";
        } else if (status == "ended") {
            query = "select c.cname, e.startTime, e.endTime, e.eid, e.ename from Course c, Exam e, ExamCourse ec, StudentCourse sc " +
                "where sc.sid = ? and sc.cid = ec.cid and ec.eid = e.eid and c.cid = sc.cid and e.endTime < ?;";
        }
        con.query(query, [userInfo.id, now, now], function (err, result) {
            if (err) {
                console.log("Get student's exams: " + err);
            } else {
                res.json(result);
            }
        });
    } else if (userInfo.level == 2) {
        var query = "";
        var now = new Date().getTime();
        if (status == "notStarted") {
            query = "select c.cname, e.startTime, e.endTime, e.eid, e.ename from Course c, Exam e, ExamCourse ec, TeacherCourse tc " +
                "where tc.tid = ? and tc.cid = ec.cid and ec.eid = e.eid and c.cid = tc.cid and e.startTime > ?;"
        } else if (status == "progressing") {
            query = "select c.cname, e.startTime, e.endTime, e.eid, e.ename from Course c, Exam e, ExamCourse ec, TeacherCourse tc " +
                "where tc.tid = ? and tc.cid = ec.cid and ec.eid = e.eid and c.cid = tc.cid and e.startTime <= ? and e.endTime >= ?;"
        } else if (status == "ended") {
            query = "select c.cname, e.startTime, e.endTime, e.eid, e.ename from Course c, Exam e, ExamCourse ec, TeacherCourse tc " +
                "where tc.tid = ? and tc.cid = ec.cid and ec.eid = e.eid and c.cid = tc.cid and e.endTime < ?;"
        }
        con.query(query, [userInfo.id, now, now], function (err, result) {
            if (err) {
                console.log("Get teacher's exams: " + err);
            } else {
                res.json(result);
            }
        });
    }
};

exports.getExamQuestions = function(req, res) {
    var userInfo = req.body.userInfo;
    var eid = req.body.eid;
    var result = {};
    if (userInfo) {
        con.query("select startTime, endTime, points from Exam " +
            "where eid = ?;", eid, function (err, result3) {
            if (err) {
                console.log("Get exam in getExamQuestions: " + err);
            } else {
                result.exam = result3[0];
                var query = "";
                var params;
                if (userInfo.level == 1) {
                    var now = new Date().getTime();
                    params = [userInfo.id, eid];
                    if (result3[0].startTime > now) {
                        res.json(null);
                    } else if (result3[0].startTime <= now && result3[0].endTime >= now) {
                        query = "select e.description, e.eid, seq.stuAnswer from ExamExercise ee left join StudentExamQuestion seq on ee.eid = seq.eid and ee.exid = seq.exid and seq.sid = ?, Exercise e " +
                            "where ee.eid = ? and ee.exid = e.eid " +
                            "order by e.eid;"
                    } else if (result3[0].endTime < now) {
                        query = ("select e.description, e.eid, seq.stuAnswer, a.answer from ExamExercise ee left join StudentExamQuestion seq on ee.eid = seq.eid and ee.exid = seq.exid and seq.sid = ?, Exercise e, " +
                            "Answer a where ee.eid = ? and ee.exid = e.eid and a.eid = ee.exid " +
                            "order by e.eid;");
                    }
                } else if (userInfo.level == 2) {
                    params = eid;
                    query = "select a.answer, e.description, e.eid from ExamExercise ee, Exercise e, Answer a " +
                        "where ee.eid = ? and ee.exid = e.eid and a.eid = e.eid " +
                        "order by e.eid;"
                }

                con.query(query, params, function (err, result1) {
                    if (err) {
                        console.log("Get exercise in getExamQuestions: " + err);
                    } else {
                        result.exercise = result1;
                        var query = "";
                        for (var i = 0; i < result1.length; i++) {
                            query += "select * from Op " +
                                "where eid = '" + result1[i].eid + "' order by eid;";
                        }
                        con.query(query, function (err, result2) {
                            if (err) {
                                console.log("get options in getExamQuestions: " + err);
                            } else {
                                if (result1.length == 1) {
                                    result.options = [];
                                    result.options.push(result2);
                                } else {
                                    result.options = result2;
                                }
                                if (result3[0].endTime < now) {
                                    con.query("select grade from StudentExam " +
                                        "where sid = ? and eid = ?", [userInfo.id, eid], function (err, result4) {
                                        if (err) {
                                            console.log("Get student grade: " + err);
                                        } else{
                                            result.grade = result4[0];
                                            result.now = new Date().getTime();
                                            res.json(result);
                                        }
                                    });
                                } else {
                                    result.now = new Date().getTime();
                                    res.json(result);
                                }
                            }
                        });
                    }
                });
            }
        });
    }
};

exports.saveAnswerInExam = function (req, res) {
    var sid = req.body.sid;
    var exid = req.body.exid;
    var eid = req.body.eid;
    var options = req.body.options;
    var answer = "";
    con.query("select endTime, points from Exam " +
        "where eid = ?;", eid, function (err, result) {
        if (err) {
            console.log("Get exam endTime in saveAnswerInExam: " + err);
        } else {
            if (new Date().setTime(result[0]['endTime']) < new Date().getTime()) {
                res.json({
                    status: false
                });
            } else {
                for (var i = 0; i < options.length; i++) {
                    if (options[i].checked) {
                        answer += options[i].op;
                    }
                }
                var point = result[0]['points'];
                con.query("insert into StudentExamQuestion(sid, eid, exid, stuAnswer) " +
                    "values(?, ?, ?, ?) on duplicate key update stuAnswer = ?;", [sid, eid, exid, answer, answer], function (err, result) {
                    if (err) {
                        console.log("Insert into StudentExamQuestion: " + err);
                    } else {
                        con.query("update StudentExamQuestion " +
                            "set point = ? " +
                            "where sid = ? and eid = ? and exid = ? and stuAnswer = (" +
                            "select answer from Answer where eid = ?);" +
                            "update StudentExamQuestion " +
                            "set point = 0 " +
                            "where sid = ? and eid = ? and exid = ? and stuAnswer <> (" +
                            "select answer from Answer where eid = ?);",
                        [point, sid, eid, exid, exid, sid, eid, exid, exid], function (err, result) {
                                if (err) {
                                    console.log("update StudentExamQuestion's point and get grade: " + err);
                                } else {
                                    con.query("replace into StudentExam(sid, eid, grade) " +
                                        "select sid, eid, grade from (select sid, eid, SUM(point) as grade from StudentExamQuestion " +
                                    "where sid = ? and eid = ?) as tb;", [sid, eid], function (err, result) {
                                        if (err) {
                                            console.log("replace into StudentExam: " + err);
                                        } else {
                                            res.json({
                                                status: true
                                            });
                                        }
                                    });
                                }
                            });
                    }
                });
            }
        }
    });
};

exports.getSystemTime = function (req, res) {
    res.json({
        now: new Date().getTime()
    })
};

exports.getExamGrades = function (req, res) {
    var eid = req.body.eid;
    con.query("select s.sid, s.sname, s.major, s.grade as Grade, s.class, se.grade from Student s, StudentExam se " +
        "where s.sid = se.sid and se.eid = ? order by se.grade desc, s.grade, s.class;" +
        "select distinct se.grade from Student s, StudentExam se " +
        "where s.sid = se.sid and se.eid = ? order by se.grade desc;", [eid, eid], function (err, result) {
            if (err) {
                console.log("Get student's grade in getExamGrades: " + err);
            } else {
                res.json(result);
            }
    });
};

exports.addMessage = function (req, res) {
    var message = req.body.message;
    var tid = req.body.tid;
    var mid = new Date().getTime();
    con.query("insert into Message(mid, cid, title, content, posterId) " +
        "values(?, ?, ?, ?, ?);", [mid, message.courseSelected.id, message.title, message.text, tid], function (err, result) {
        if (err) {
            console.log("Insert into Message in addMessage: " + err);
        } else {
            var query = "";
            if (message.includeTeacher) {
                query = "insert into StudentMessage(sid, mid) " +
                    "select sid, mid from (" +
                    "select sc.sid, m.mid from StudentCourse sc, Message m where " +
                    "sc.cid = ? and m.mid = ?) as tb;" +
                    "insert into TeacherMessage(tid, mid) " +
                    "select tid, mid from (" +
                    "select tc.tid, m.mid from TeacherCourse tc, Message m where " +
                    "tc.cid = ? and m.mid = ? and tc.tid <> ?) as tb";
            } else {
                query = "insert into StudentMessage(sid, mid) " +
                    "select sid, mid from (" +
                    "select sc.sid, m.mid from StudentCourse sc, Message m where " +
                    "sc.cid = ? and m.mid = ?) as tb;";
            }
            con.query(query, [message.courseSelected.id, mid, message.courseSelected.id, mid, tid], function (err, result) {
                if (err) {
                    console.log("Insert into StudentMessage or TeacherMessage: " + err);
                } else {
                    res.json({
                        status: true
                    });
                }
            });
        }
    });
};

exports.getMessages = function (req, res) {
    var userInfo = req.body.userInfo;
    var query = "";
    if (userInfo.level == 1) {
        query = "select m.mid, m.cid, m.link, m.title, t.tname from Message m left join Teacher t on m.posterId = t.tid, StudentMessage sm " +
            "where sm.sid = ? and sm.mid = m.mid order by m.mid desc;";
    } else if (userInfo.level == 2) {
        query = "select m.mid, m.cid, m.link, m.title, t.tname from Message m left join Teacher t on m.posterId = t.tid, TeacherMessage tm " +
            "where tm.tid = ? and tm.mid = m.mid order by m.mid desc;";
    }
    con.query(query, userInfo.id, function (err, result) {
        if (err) {
            console.log("Get messages: " + err);
        } else {
            res.json(result);
        }
    });
};

exports.getMessageDetail = function (req, res) {
    con.query("select m.mid, m.title, m.content, t.tname, c.cname from Message m left join Teacher t on m.posterId = t.tid, Course c " +
        "where mid = ? and m.cid = c.cid;", req.body.mid, function (err, result) {
        if (err) {
            console.log("Get message detail: " + err);
        } else {
            res.json(result);
        }
    });
};

function sysMessage(mid, link, title, cid, includeTeacher, eid) {
    var query = "";
    if (!eid) {
        query = "insert into Message(mid, link, title, cid) " +
            "values(?, ?, ?, ?)";
    } else {
        query = "insert into Message(mid, link, title, cid, eid) " +
            "values(?, ?, ?, ?, ?)"
    }
    con.query(query, [mid, link, title, cid, eid], function (err) {
        if (err) {
            console.log("Insert into Message in sysMessage: " + err);
        } else {
            if (includeTeacher) {
                con.query("Insert into StudentMessage(sid, mid) " +
                    "select sid, mid from(" +
                    "select sc.sid, m.mid from StudentCourse sc, Message m " +
                    "where sc.cid = m.cid and m.mid = ?) as tb;" +
                    "Insert into TeacherMessage(tid, mid) " +
                    "select tid, mid from(" +
                    "select tc.tid, m.mid from TeacherCourse tc, Message m " +
                    "where tc.cid = m.cid and m.mid = ?) as tb;", [mid, mid], function (err) {
                    if (err) {
                        console.log("Insert into StudentCourse and TeacherCourse " + err);
                    }
                });
            } else {
                con.query("Insert into StudentMessage(sid, mid) " +
                    "select sid, mid from(" +
                    "select sc.sid, m.mid from StudentCourse sc, Message m " +
                    "where sc.cid = m.cid and m.mid = ?) as tb;", mid, function (err) {
                    if (err) {
                        console.log("Insert into StudentCourse " + err);
                    }
                });
            }
        }
    });
}

exports.deleteMessage = function (req, res) {
    var mid = req.body.mid;
    con.query("delete from Message " +
        "where mid = ?;", mid, function (err, result) {
        if (err) {
            console.log("Delete from Message: " + err);
        } else {
            res.json({
                status: true
            });
        }
    });
};

exports.messagesNum = function (req, res) {
    var userInfo = req.body.userInfo;
    if (userInfo.level == 1) {
        con.query("select count(*) as messagesNum from Message m, StudentMessage sm " +
            "where m.mid = sm.mid and sm.sid = ?", userInfo.id, function (err, result) {
            if (err) {
                console.log("Get student's messages number: " + err);
            } else {
                res.json(result);
            }
        });
    } else if (userInfo.level == 2) {
        con.query("select count(*) as messagesNum from Message m, TeacherMessage tm " +
            "where m.mid = tm.mid and tm.tid = ?", userInfo.id, function (err, result) {
            if (err) {
                console.log("Get teacher's messages number: " + err);
            } else {
                res.json(result);
            }
        });
    }
};