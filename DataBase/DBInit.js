var DBConnect = require("./DBConnect");
function DBInit() {
    var con = DBConnect.getCon();

    con.query("ALTER DATABASE LearningAndExamSystem DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci", function (err, result) {
        if (err) {
            console.log("Set utf8: " + err);
        }
    });

    con.query("SET sql_mode ='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';", function (err, result) {
        if (err) {
            console.log("SET sql_mode: " + err);
        }
    });

    con.query("create table if not exists Student(" +
        "sid varchar(20)," +
        "sname varchar(15)," +
        "college varchar(15)," +
        "major varchar(15)," +
        "grade int(4)," +
        "class int(3)," +
        "password varchar(33)," +
        "primary key(sid))", function (err, result) {
            if (err) {
                console.log("Student: " + err);
            }
    });

    con.query("create table if not exists Teacher(" +
        "tid varchar(20)," +
        "tname varchar(15)," +
        "password varchar(33)," +
        "primary key(tid))", function (err, result) {
            if (err) {
                console.log("Teacher: " + err);
            }
    });

    con.query("create table if not exists Admin(" +
        "aid varchar(20)," +
        "aname varchar(15)," +
        "password varchar(33)," +
        "primary key(aid))", function (err, result) {
            if (err) {
                console.log("Admin: " + err);
            }
    });

    con.query("create table if not exists Course(" +
        "cid varchar(32)," +
        "cname varchar(20)," +
        "remark varchar(400)," +
        "endTime varchar(32)," +
        "description varchar(10000)," +
        "primary key(cid))", function (err, result) {
            if (err) {
                console.log("Course: " + err);
            }
    });

    con.query("create table if not exists CourseWare(" +
        "cid varchar(200)," +
        "cname varchar(100)," +
        "mimetype varchar(30)," +
        "primary key(cid))", function (err, result) {
            if (err) {
                console.log("CourseWare: " + err);
            }
    });

    con.query("create table if not exists ExerciseBank(" +
        "eid varchar(32)," +
        "ename varchar(20)," +
        "primary key(eid))", function (err, result) {
            if (err) {
                console.log("ExerciseBank: " + err);
            }
    });

    con.query("create table if not exists Exercise(" +
        "eid varchar(32)," +
        "ebid varchar(32)," +
        "description text," +
        "primary key(eid)," +
        "foreign key(ebid) references ExerciseBank(eid) on delete cascade on update cascade);", function (err, result) {
            if (err) {
                console.log("Exercise: " + err);
            }
    });

    con.query("create table if not exists Op(" +
        "op varchar(2)," +
        "description varchar(5000)," +
        "eid varchar(32)," +
        "foreign key(eid) references Exercise(eid) on delete cascade on update cascade);", function (err, result) {
            if (err) {
                console.log("Op: " + err);
            }
    });

    con.query("create table if not exists Answer(" +
        "answer varchar(60)," +
        "eid varchar(32)," +
        "foreign key(eid) references Exercise(eid) on delete cascade on update cascade);", function (err, result) {
            if (err) {
                console.log("Answer: " + err);
            }
    });


    con.query("create table if not exists Exam(" +
        "eid varchar(32)," +
        "ename varchar(20)," +
        "points float default 0," +
        "startTime varchar(32)," +
        "endTime varchar(32)," +
        "primary key(eid))", function (err, result) {
            if (err) {
                console.log("Exam: " + err);
            }
    });

    con.query("create table if not exists TeacherCourse(" +
        "tid varchar(10)," +
        "cid varchar(32)," +
        "primary key(tid, cid)," +
        "foreign key(tid) references Teacher(tid) on delete cascade on update cascade," +
        "foreign key(cid) references Course(cid) on delete cascade on update cascade)", function (err, result) {
            if (err) {
                console.log("TeacherCourse: " + err);
            }
    });

    con.query("create table if not exists StudentCourse(" +
        "sid varchar(10)," +
        "cid varchar(32)," +
        "primary key(sid, cid)," +
        "foreign key(sid) references Student(sid) on delete cascade on update cascade," +
        "foreign key(cid) references Course(cid) on delete cascade on update cascade)", function (err, result) {
        if (err) {
            console.log("StudentCourse: " + err);
        }
    });

    /*con.query("create table if not exists TeacherCourseWare(" +
        "tid varchar(10)," +
        "cid varchar(32)," +
        "primary key(tid, cid)," +
        "foreign key(tid) references Teacher(tid) on delete cascade on update cascade," +
        "foreign key(cid) references CourseWare(cid) on delete cascade on update cascade)", function (err, result) {
            if (err) {
                console.log("TeacherCourseWare: " + err);
            }
    });*/

    con.query("create table if not exists StudentCourseWare(" +
        "sid varchar(10)," +
        "cid varchar(200)," +
        "learningTime int default 0," +
        "learningPages varchar(3000)," +
        "progress float default 0," +
        "primary key(sid, cid)," +
        "foreign key(sid) references Student(sid) on delete cascade on update cascade," +
        "foreign key(cid) references CourseWare(cid) on delete cascade on update cascade)", function (err, result) {
            if (err) {
                console.log("StudentCourceWare: " + err);
            }
    });

    /*con.query("create table if not exists TeacherExercise(" +
        "tid varchar(10)," +
        "eid varchar(32)," +
        "primary key(tid, eid)," +
        "foreign key(tid) references Teacher(tid) on delete cascade on update cascade," +
        "foreign key(eid) references Exercise(eid) on delete cascade on update cascade)", function (err, result) {
            if (err) {
                console.log("TeacherExercise: " + err);
            }
    });*/

    con.query("create table if not exists Message(" +
        "mid varchar(32)," +
        "cid varchar(32)," +
        "eid varchar(32)," +
        "link varchar(500)," +
        "title varchar(500)," +
        "content text," +
        "posterId varchar(10)," +
        "primary key(mid)," +
        "foreign key(cid) references Course(cid) on delete cascade on update cascade," +
        "foreign key(eid) references ExerciseBank(eid) on delete cascade on update cascade," +
        "foreign key(posterId) references Teacher(tid) on delete set null on update cascade);", function (err, result) {
            if (err) {
                console.log("Message: " + err);
            }
    });

    con.query("create table if not exists StudentMessage(" +
        "sid varchar(10)," +
        "mid varchar(32)," +
        "primary key(sid, mid)," +
        "foreign key(sid) references Student(sid) on delete cascade on update cascade," +
        "foreign key(mid) references Message(mid) on delete cascade on update cascade);", function (err, result) {
            if (err) {
                console.log(err);
            }
    });

    con.query("create table if not exists TeacherMessage(" +
        "tid varchar(10)," +
        "mid varchar(32)," +
        "primary key(tid, mid)," +
        "foreign key(tid) references Teacher(tid) on delete cascade on update cascade," +
        "foreign key(mid) references Message(mid) on delete cascade on update cascade);", function (err, result) {
            if (err) {
                console.log(err);
            }
    });

    con.query("create table if not exists StudentExercise(" +
        "sid varchar(10)," +
        "eid varchar(32)," +
        "stuAnswer varchar(60)," +
        "primary key(sid, eid)," +
        "foreign key(sid) references Student(sid) on delete cascade on update cascade," +
        "foreign key(eid) references Exercise(eid) on delete cascade on update cascade)", function (err, result) {
            if (err) {
                console.log("StudentExercise: " + err);
            }
    });

    con.query("create table if not exists TeacherExam(" +
        "tid varchar(10)," +
        "eid varchar(32)," +
        "primary key(tid, eid)," +
        "foreign key(tid) references Teacher(tid) on delete cascade on update cascade," +
        "foreign key(eid) references Exam(eid) on delete cascade on update cascade)", function (err, result) {
            if (err) {
                console.log("TeacherExam: " + err);
            }
    });

    con.query("create table if not exists StudentExam(" +
        "sid varchar(10)," +
        "eid varchar(32)," +
        "grade float default 0," +
        "primary key(sid, eid)," +
        "foreign key(sid) references Student(sid) on delete cascade on update cascade," +
        "foreign key(eid) references Exam(eid) on delete cascade on update cascade)", function (err, result) {
            if (err) {
                console.log("StudentExam: " + err);
            }
    });

    con.query("create table if not exists CourseWareCourse(" +
        "cwid varchar(200)," +
        "cid varchar(32)," +
        "primary key(cwid, cid)," +
        "foreign key(cwid) references CourseWare(cid) on delete cascade on update cascade," +
        "foreign key(cid) references Course(cid) on delete cascade on update cascade)", function (err, result) {
            if (err) {
                console.log("CourseWareCourse: " + err);
            }
    });

    con.query("create table if not exists ExerciseBankCourse(" +
        "eid varchar(32)," +
        "cid varchar(32)," +
        "primary key(eid, cid)," +
        "foreign key(eid) references ExerciseBank(eid) on delete cascade on update cascade," +
        "foreign key(cid) references Course(cid) on delete cascade on update cascade)", function (err, result) {
            if (err) {
                console.log("ExerciseCourse: " + err);
            }
    });

    con.query("create table if not exists ExamCourse(" +
        "eid varchar(32)," +
        "cid varchar(32)," +
        "primary key(eid, cid)," +
        "foreign key(eid) references Exam(eid) on delete cascade on update cascade," +
        "foreign key(cid) references Course(cid) on delete cascade on update cascade)", function (err, result) {
            if (err) {
                console.log("ExamCourse: " + err);
            }
    });

    con.query("create table if not exists ExamExerciseBank(" +
        "eid varchar(32)," +
        "ebid varchar(32)," +
        "primary key(eid, ebid)," +
        "foreign key(eid) references Exam(eid) on delete cascade on update cascade," +
        "foreign key(ebid) references ExerciseBank(eid) on delete cascade on update cascade);", function (err, result) {
            if (err) {
                console.log("ExamExerciseBank: " + err);
            }
    });

    con.query("create table if not exists ExamExercise(" +
        "eid varchar(32)," +
        "exid varchar(32)," +
        "primary key(eid, exid)," +
        "foreign key(eid) references Exam(eid) on delete cascade on update cascade," +
        "foreign key(exid) references Exercise(eid) on delete cascade on update cascade);", function (err, result) {
            if (err) {
                console.log("ExamExercise: " + err);
            }
    });

    con.query("create table if not exists StudentExamQuestion(" +
        "sid varchar(10)," +
        "eid varchar(32)," +
        "exid varchar(32)," +
        "stuAnswer varchar(60)," +
        "point float default 0," +
        "primary key(sid, eid, exid)," +
        "foreign key(eid) references Exam(eid) on delete cascade on update cascade," +
        "foreign key(sid) references Student(sid) on delete cascade on update cascade," +
        "foreign key(exid) references Exercise(eid) on delete cascade on update cascade);", function (err, result) {
            if (err) {
                console.log("StudentExamQuestion: " + err);
            }
    });

    con.query("select count(*) from Admin", function (err, result) {
        if (result[0]['count(*)'] == 0) {
            con.query("insert into Admin " +
                "values('8888', '25d55ad283aa400af464c76d713c07ad')", function (err, result) {
                if (err) {
                    console.log("Insert a admin at the beginning: " + err);
                }
            });
        }
    });
}

module.exports = DBInit;