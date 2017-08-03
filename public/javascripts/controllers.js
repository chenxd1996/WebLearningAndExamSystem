//controller for login router
function loginCtrl($scope, $rootScope, $http, $state, toaster, md5) {
    $scope.user = {};
    if (!$rootScope.userInfo) {
        $http.get('/getUserInfo').
            success(function (result) {
                if (result.status) {
                    $rootScope.userInfo = {
                        id: result.id,
                        name: result.name,
                        level: result.level
                    };
                    $state.go('logined.learningSystem.myCourses');
                }
            });
    }
    $scope.login = function () {
        $http.post('/login', {
            id: $scope.user.id,
            password: md5.createHash($scope.user.password)
        }).success(function (data) {
            if (data.logined) {
                toaster.pop('success', "登录成功！", '欢迎回来，' + data.name + '！', 2000);
                $rootScope.userInfo = {
                    id: $scope.user.id,
                    name: data.name,
                    level: data.level
                };

                $state.go('logined.learningSystem.myCourses');
            } else {
                toaster.pop('error', "登录失败！", '账号或密码错误', 2000);
            }
        });
    }
}

//controller for homepage router
function homeCtrl($scope, $location, $rootScope, $http, $state) {
    $rootScope.$watch(function () {
        return $rootScope.userInfo;
    }, function () {
        if (!$rootScope.userInfo) {
            $http.get('/getUserInfo').
            success(function (result) {
                if (result.status) {
                    $rootScope.userInfo = {
                        id: result.id,
                        name: result.name,
                        level: result.level
                    };
                }
            });
        }
    });
    var options = ['learning-system', 'exam-system', 'exercise-system', 'my-infomation', 'users-management', 'message-center'];
    var path = $location.path();
    for (var i = 0; i < options.length; i++) {
        if (path.indexOf(options[i]) >= 0) {
            $scope.checked = options[i];
            break;
        }
    }
    $scope.logout = function () {
        $http.get('/logout').success(function (res) {
            $state.go('login');
        });
    }
}

//controller for learning system router

function learningSystemCtrl($scope, $location, $rootScope) {
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
        }
    });
    var options = ['my-courses', 'add-course'];
    var path = $location.path();
    for (var i = 0; i < options.length; i++) {
        if (path.indexOf(options[i]) >= 0) {
            $scope.checked = options[i];
            break;
        }
    }
}

function usersManagementCtrl($scope, $location) {
    if ($location.url().indexOf("users-list") >= 0) {
        $scope.checked = "users-list";
    } else {
        $scope.checked = "users-management";
    }
}

function addUserCtrl($scope, $http, md5, toaster) {
    $scope.user = {};
    var levels = {
        "学生": 1,
        "教师": 2
    }
    $scope.options = ["学生", "教师"];
    $scope.levelSelected = "学生";
    $scope.submit = function () {
        $scope.user.level = levels[$scope.levelSelected];
        $scope.user.password = md5.createHash($scope.user.id);
        $http.post('/addUser', $scope.user).
            success(function (res) {
                if (res.status) {
                    toaster.pop('success', "添加成功！", '', 2000);
                } else {
                    toaster.pop('error', "添加失败！", '', 2000);
                }
        });
    }
}

function editUserCtrl($scope) {
    $scope.user = {};
    var levels = {
        "学生": 1,
        "教师": 2
    };
    $scope.options = ["学生", "教师"];
    $scope.levelSelected = "学生";
}

function deleteUserCtrl($scope) {

}

function usersListCtrl($scope) {

}

function myCoursesCtrl($scope, $rootScope, $http) {
    $rootScope.$watch(function () {
        return $rootScope.userInfo;
    }, function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
            $scope.radioModel = 'underway';
            $http.post('/getMyCourses', {
                id: $scope.userInfo.id,
                level: $scope.userInfo.level
            }).success(function (res) {
                if (res.status) {
                    $scope.result = res.result;
                }
            });
        }
    });
}

function addCourseCtrl($scope, $http, toaster) {
    $scope.course = {};

    $scope.addCourse = function () {
        $scope.course.gradesAndClasses = [];

        $scope.course.teachers = $scope.teachers.split('+');

        $scope.course.endTime = new Date($scope.endTime).getTime();

        for (i in $scope.gradesAndClasses) {
            if ($scope.gradesAndClasses[i].isSelected) {
                $scope.course.gradesAndClasses.push($scope.gradesAndClasses[i]);
            }
        }

        $scope.course.description = $scope.editorText;
        $http.post('/addCourse', $scope.course).
            success(function (res) {
                if (res.status) {
                    toaster.pop('success', "创建成功！", '', 2000);
                } else {
                    toaster.pop('error', "创建失败！", '', 2000);
                }
        });
    }
}

function courseDetailCtrl($scope, $location,  $stateParams, $rootScope) {
    $scope.courseID = $stateParams.courseID;
    $rootScope.$watch(function () {
        return $rootScope.userInfo;
    }, function () {
        $scope.userInfo = $rootScope.userInfo;
    });
    var options = ['course-home', 'course-data', 'course-members', 'course-exams'];
    var path = $location.path();
    for (var i = 0; i < options.length; i++) {
        if (path.indexOf(options[i]) >= 0) {
            $scope.checked = options[i];
        }
    }
}

function courseHomeCtrl($scope, $stateParams, $http) {
   var courseID = $stateParams.courseID;
   $http.post('/getCourseInfo', {
       cid: courseID
   }).success(function (res) {
       if (res.status) {
           $scope.remark = res.remark;
           $scope.description = res.description;
           $scope.teachers = res.teachers;
       }
   });
}

function courseDataCtrl($scope, $stateParams, $http) {
    var courseID = $stateParams.courseID;
    $http.post('/getCourseWares', {
        cid: courseID
    }).success(function (res) {
        $scope.courseWares = res.result;
    });
}

function addCourseDataCtrl($scope, $stateParams, FileUploader) {
    var courseID = $stateParams.courseID;
    $scope.uploader = new FileUploader({
        url: '/uploadCourseWares',
        formData: [{
            cid: courseID
        }]
    });
}

function exerciseSystemCtrl($scope, $location) {
    var options = ['add-exercise-bank', 'my-exercise-bank'];
    var path = $location.path();
    for (var i = 0; i < options.length; i++) {
        if (path.indexOf(options[i]) >= 0) {
            $scope.checked = options[i];
        }
    }
}

function addExerciseBankCtrl($scope, $rootScope, $http, toaster) {
    $scope.exerciseBank = {};
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post('/getMyCourses', $rootScope.userInfo).
                success(function (res) {
                    var courses = res.result.courses;
                    $scope.courses = [];
                    for(var i = 0; i < courses.length; i++) {
                        if (courses[i].endTime > new Date().getTime()) {
                            $scope.courses.push({
                                name: courses[i].cname + " (" + courses[i].remark + ")",
                                id: courses[i].cid
                            });
                        }
                    }
            });
        }
    });

    $scope.submit = function () {
        $scope.exerciseBank.id = $scope.courseSelected.id;
        $http.post('/addExerciseBank', $scope.exerciseBank).
            success(function (res) {
                if (res.status) {
                    toaster.pop("success", "创建成功!", "", 2000);
                } else {
                    toaster.pop("error", "创建失败!", "", 2000);
                }
        });
    }
}

function myExerciseBankCtrl($scope, $http, $rootScope) {
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
            $http.post('/getExerciseBanks', $rootScope.userInfo)
                .success(function (res) {
                    $scope.result = res.result;
                    $scope.counts = res.counts;
            });
        }
    });
}

function exerciseBankDetailCtrl($scope, $rootScope, $stateParams, $location) {
    $scope.exerciseBankID = $stateParams.exerciseBankID;
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
        }
    });
    var options = ['add-exercise', 'all', 'completed', 'uncompleted'];
    var path = $location.path();
    for (var i = 0; i < options.length; i++) {
        if (path.indexOf(options[i]) >= 0) {
            $scope.checked = options[i];
        }
    }
}

function addExerciseCtrl($scope, $http, $stateParams, toaster) {
    $scope.options = [];
    $scope.$watch('optionsNum', function () {
        $scope.options = [];
        for (var i = 0; i < $scope.optionsNum; i++) {
            $scope.options.push({
                op: String.fromCharCode(65 + i)
            });
        }
    });
    $scope.submit = function () {
        $http.post('/addExercise', {
            ebid: $stateParams.exerciseBankID,
            description: $scope.editorText,
            options: $scope.options,
            answers: $scope.answer.trim().replace(/\s/g,"").split('+')
        }).success(function (res) {
            if (res.status) {
                toaster.pop('success', '添加成功!', '', 2000);
            }
        })
    }
}

function exerciseCtrl($scope, $http, $stateParams, $rootScope, $timeout) {
    $scope.status = $stateParams.status;
    $scope.done = 0;
    $scope.correctNum = 0;

    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
            $http.post('/getExercise', {
                ebid: $stateParams.exerciseBankID,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                $scope.questions = res.exercise;
                $scope.options = res.options;
                var toDelete = [];
                for (var i = 0; i < $scope.options.length; i++) {
                    if ($scope.questions[i].stuAnswer) {
                        if ($scope.status == 'uncompleted') {
                            toDelete.push(i);
                        } else {
                            $scope.questions[i].isShow = true;
                            $scope.questions[i].answers = $scope.questions[i].answer.trim().replace(/\s/g,"");
                            if ($scope.questions[i].stuAnswer == $scope.questions[i].answer) {
                                $scope.questions[i].isTrue = true;
                                $scope.correctNum += 1;
                            } else {
                                $scope.questions[i].isTrue = false;
                            }
                            for (var j = 0; j < $scope.options[i].length; j++) {
                                if ($scope.questions[i].stuAnswer.indexOf($scope.options[i][j].op) >= 0) {
                                    $scope.options[i][j].checked = true;
                                }
                            }
                        }
                    } else {
                        if ($scope.status == 'completed') {
                            toDelete.push(i);
                        }
                    }
                }
                for (var i = toDelete.length - 1; i >= 0; i--) {
                    $scope.questions.splice(toDelete[i], 1);
                    $scope.options.splice(toDelete[i], 1);
                }
            });
        }
    });

    $scope.submit = function (options, index) {
        var ops = [];
        var answers = "";

        for (var i = 0; i < options.length; i++) {
            if (options[i].checked) {
                ops.push(options[i]);
                answers += options[i].op;
            }
        }

        $http.post('/submitAndGetAnswer', {
            options: ops,
            userInfo: $rootScope.userInfo
        }).success(function (res) {
            $scope.done += 1;
            var result = res.result;
            $scope.questions[index].answers = result[0].answer.trim().replace(/\s/g,"");
            if (answers == $scope.questions[index].answers) {
                $scope.questions[index].isTrue = true;
            } else {
                $scope.questions[index].isTrue = false;
            }
            $timeout(function () {
                $scope.questions[index].isShow = true;
            });
        });
    }
}

function examSystemCtrl($scope, $rootScope, $location, $state) {
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
        }
    });
    var options = ['my-exams', 'add-exam'];
    for (var i  = 0; i < options.length; i++) {
        if ($location.path().indexOf(options[i]) >= 0) {
            $scope.checked = options[i];
            break;
        }
    }
}

function addExamCtrl($scope, $rootScope, $http, toaster) {
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post('/getMyCourses', $rootScope.userInfo).
            success(function (res) {
                var courses = res.result.courses;
                $scope.courses = [];
                for(var i = 0; i < courses.length; i++) {
                    if (courses[i].endTime > new Date().getTime()) {
                        $scope.courses.push({
                            name: courses[i].cname + " (" + courses[i].remark + ")",
                            id: courses[i].cid
                        });
                    }
                }
            });
        }
    });

    $scope.dateOptions = {
        minDate: new Date(),
        startingDay: 1
    };

    $scope.dtOpen = function () {
        $scope.isDtOpen = true;
    };

    $scope.hstep = 1;
    $scope.mstep = 1;

    $scope.getCourseExerciseBanks = function () {
        $http.post('/getCourseExerciseBanks', {
            cid: $scope.courseSelected.id
        }).success(function (res) {
            if (res.status) {
                $scope.ebs = res.result;
            }
        });
    };

    $scope.submit = function () {
        var exam = {};
        exam.cid = $scope.courseSelected.id;
        exam.examName = $scope.examName;
        exam.examDate = $scope.examDate;
        exam.startTime = $scope.startTime;
        exam.endTime = $scope.endTime;
        exam.exerciseNum = $scope.exerciseNum;
        exam.examPoints = 100.0 / $scope.exerciseNum;
        exam.ebs = $scope.ebs;
        $http.post('/addExam', exam).success(function (res) {
            if (res.status) {
                toaster.pop("success", "创建成功", "", 2000);
            } else {
                toaster.pop("error", "创建失败", "", 2000);
            }
        });
    }
}

function myExamsCtrl($scope, $http, $rootScope, $stateParams, $location, $state) {
    var status = $scope.status = $stateParams.status;
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post("/getMyExams", {
                userInfo: $rootScope.userInfo,
                status: status
            }).success(function (res) {
                $scope.exams = res;
            });
        }
    });
    var statuses = ['notStarted', 'progressing', 'ended'];
    for (var i = 0; i < statuses.length; i++) {
        if ($location.path().indexOf(statuses[i]) >= 0) {
            $scope.radioModel = statuses[i];
            break;
        }
    }
    $scope.changeStatus = function(status) {
        $state.go('logined.examSystem.myExams', {status: status}, {reload: true});
    }
}

function examDetailCtrl($scope, $location, $stateParams) {
    var options = ['all-questions', 'exam-result'];
    $scope.status = $stateParams.status;
    $scope.eid = $stateParams.examID;
    for (var i = 0; i < options.length; i++) {
        if ($location.path().indexOf(options[i]) >= 0) {
            $scope.checked = options[i];
            break;
        }
    }
}

function allQuestionsCtrl($scope, $stateParams, $http, $rootScope, toaster, $timeout, $state) {
    var eid = $stateParams.examID;
    $scope.status = $stateParams.status;
    $scope.done = 0;
    $scope.correctNum = 0;
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post("/getExamQuestions",{
                userInfo: $rootScope.userInfo,
                eid: eid
            }).success(function (res) {
                if (!res) {
                    return;
                }
                if (res.grade) {
                    $scope.grade = res.grade.grade;
                } else {
                    $scope.grade = 0;
                }
                $scope.startTime = res.exam.startTime;
                $scope.endTime = res.exam.endTime;
                $scope.points = res.exam.points;
                $scope.now = res.now;
                $scope.questions = res.exercise;
                $scope.options = res.options;
                for (var i = 0; i < $scope.options.length; i++) {
                    if ($scope.status == "ended") {
                        $scope.questions[i].isShow = true;
                        if ($scope.questions[i].stuAnswer) {
                            var stuAnswer = $scope.questions[i].stuAnswer.trim().replace('/\s/g', "");
                            var answer = $scope.questions[i].answer.trim().replace('/\s/g', "");
                            if (stuAnswer == answer) {
                                $scope.questions[i].isTrue = true;
                                $scope.correctNum++;
                            } else {
                                $scope.questions[i].isTrue = false;
                            }
                        } else {
                            $scope.questions[i].isTrue = false;
                        }
                    }
                    if ($scope.questions[i].stuAnswer) {
                        $scope.done += 1;
                        for (var j = 0; j < $scope.options[i].length; j++) {
                            if ($scope.questions[i].stuAnswer.indexOf($scope.options[i][j].op) >= 0) {
                                $scope.options[i][j].checked = true;
                            }
                        }
                    }
                }
                if ($scope.endTime >= $scope.now && $scope.startTime <= $scope.now) {
                    var timeCounter = setInterval(function () {
                        if ($scope.endTime >= $scope.now && $scope.startTime <= $scope.now) {
                            $scope.now = $scope.now + 1000;
                            $timeout(function () {
                                var ms = $scope.endTime - $scope.now;
                                var hours = ms / (1000 * 60 * 60);
                                ms = ms % (1000 * 60 * 60);
                                var minutes = ms / (1000 * 60);
                                ms = ms % (1000 * 60);
                                var seconds = ms / 1000;
                                $scope.leftTime  = new Date();
                                $scope.leftTime.setHours(hours);
                                $scope.leftTime.setMinutes(minutes);
                                $scope.leftTime.setSeconds(seconds);
                            });
                        } else if ($scope.status == "progressing") {
                            $state.go("logined.examDetail.allQuestions", {
                                status: 'ended',
                                examID: eid
                            }, {
                                reload: true
                            });
                            clearInterval(sysTimeChecker);
                            clearInterval(timeCounter);
                        }
                    }, 1000);

                    var sysTimeChecker = setInterval(function () {
                        if ($scope.endTime >= $scope.now && $scope.startTime <= $scope.now) {
                            $http.get('/getSystemTime').success(function (res) {
                                $scope.now = res.now;
                            });
                        }
                    }, 1000 * 60);
                }
            });
        }
    });

    $scope.changeAnswer = function (exid, options) {
        $http.post('/saveAnswerInExam', {
            sid: $rootScope.userInfo.id,
            exid: exid,
            eid: eid,
            options: options
        }).success(function (res) {
            if (!res.status) {
                toaster.pop("warning", "考试已结束，不能修改答案", "", 2000);
            } else {
                $scope.done = 0;
                for (var i = 0; i < $scope.options.length; i++) {
                    var count = 0;
                    for (var j = 0; j < $scope.options[i].length; j++) {
                        if ($scope.options[i][j].checked) {
                            count += 1;
                            break;
                        }
                    }
                    if (count != 0) {
                        $scope.done += 1;
                    }
                }
            }
        });
    };

}

function examResultCtrl($scope, $stateParams, $http, $rootScope) {
    $scope.status = $stateParams.status;
    $scope.currentPage = 0;
    var eid = $stateParams.examID;
    $scope.labels = ["不及格", "60-70", "70-80", "80-90", "90-100"];
    $scope.data = [0, 0, 0, 0, 0];
    $scope.chartColors = ['#CC3399', '#CCFF66', '#66CCCC', '#FDB45C', '#FF6666'];
    if ($scope.status == 'ended') {
        $http.post('/getExamGrades', {
            eid: eid
        }).success(function (res) {
            $scope.students = res[0];
            $scope.disGrades = res[1];
            $rootScope.$watch('userInfo', function () {
                if ($rootScope.userInfo) {
                    for (var i = 0; i < $scope.students.length; i++) {
                        var grade = $scope.students[i].grade.toFixed(1);
                        if (grade < 60) {
                            $scope.data[0]++;
                        } else if (grade >= 60 && grade < 70) {
                            $scope.data[1]++;
                        } else if (grade >= 70 && grade < 80) {
                            $scope.data[2]++;
                        } else if (grade >= 80 && grade < 90) {
                            $scope.data[3]++;
                        } else {
                            $scope.data[4]++;
                        }
                    }
                    var cmp = $scope.students[0].grade.toFixed(1);
                    var rank = 1;
                    for (var i = 0; i < $scope.students.length; i++) {
                        var grade = $scope.students[i].grade.toFixed(1);
                        if (grade < cmp) {
                            rank++;
                            if (i > 9 && $rootScope.userInfo.level == 1) {
                                $scope.students.splice(i, $scope.students.length);
                                break;
                            }
                            cmp = grade;
                        }
                        $scope.students[i].rank = rank;
                    }
                    $scope.studentsPages = [];
                    for (var i = 0; i < $scope.students.length; i += 10) {
                        $scope.studentsPages.push($scope.students.slice(i, i + 10));
                    }
                }
            });
        });
    }

    $scope.lastPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.studentsPages.length - 1) {
            $scope.currentPage++;
        }
    };

    $scope.setPage = function (current) {
        $scope.currentPage = current;
    };

}

function messageCenterCtrl($scope, $location) {
    var options = ['all-messages', 'post-message'];
    for (var i = 0; i < options.length; i++) {
        if ($location.path().indexOf(options[i]) >= 0) {
            $scope.checked = options[i];
            break;
        }
    }
}


function postMessageCtrl($scope, $rootScope, $http, toaster) {
    $scope.message = {};
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post('/getMyCourses', $rootScope.userInfo).
            success(function (res) {
                var courses = res.result.courses;
                $scope.courses = [];
                for(var i = 0; i < courses.length; i++) {
                    if (courses[i].endTime > new Date().getTime()) {
                        $scope.courses.push({
                            name: courses[i].cname + " (" + courses[i].remark + ")",
                            id: courses[i].cid
                        });
                    }
                }
            });
        }
    });

    $scope.submit = function () {
        $scope.message.text = $scope.editorText;
        $http.post('/addMessage', {
            tid: $rootScope.userInfo.id,
            message: $scope.message
        }).success(function (res) {
            if (res.status) {
                toaster.pop("success", "发布成功！", "", 2000);
            }
        });
    }
}

function allMessagesCtrl($scope, $http, $rootScope) {
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post('/getMessages', {
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                $scope.messages = res;
                for (var i = 0; i < $scope.messages.length; i++) {
                    if (!$scope.messages[i].link) {
                        $scope.messages[i].link = "/homePage/message-center/messageDetail/" + $scope.messages[i].mid;
                    }
                }
            });
        }
    });

    $scope.check = function (index) {
        $scope.messages.splice(index, 1);
    }
}

function messageDetailCtrl($scope, $http, $state) {

}
