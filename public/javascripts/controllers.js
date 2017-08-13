//controller for login router
function loginCtrl($scope, $rootScope, $http, $state, toaster, md5) {
    if (!$rootScope.userInfo) {
        $http.get('/getUserInfo').
            success(function (result) {
                if (result.status) {
                    $rootScope.userInfo = {
                        id: result.id,
                        name: result.name,
                        level: result.level
                    };
                    if ($rootScope.userInfo.level == 3)
                        $state.go('logined.usersManagement.addUser.multiple');
                    else if ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2) {
                        $state.go('logined.learningSystem.myCourses');
                    }
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
                if ($rootScope.userInfo.level == 3) {
                    $state.go('logined.usersManagement.addUser.multiple');
                }
                else if ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2) {
                    $state.go('logined.learningSystem.myCourses');
                }
            } else {
                toaster.pop('error', "登录失败！", '账号或密码错误', 2000);
            }
        });
    }
}

//controller for homepage router
function homeCtrl($scope, $location, $rootScope, $http, $state, $timeout) {
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
        } else {
            if ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2) {
                $http.post("/messagesNum", {
                    userInfo: $rootScope.userInfo
                }).success(function (res) {
                    $rootScope.messagesNum = res[0].messagesNum;
                });
            }
        }
    });
    var options = ['learning-system', 'exam-system', 'exercise-system', 'my-information', 'users-management', 'message-center'];
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
    };
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        var path = $location.path();
        for (var i = 0; i < options.length; i++) {
            if (path.indexOf(options[i]) >= 0) {
                $timeout(function() {
                    $scope.checked = options[i];
                });
                break;
            }
        }
    });


    $scope.changeStatus = function (status) {
        $timeout(function () {
            $scope.checked = status;
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

function addUserCtrl($scope, $location, $rootScope) {
    if ($location.path().indexOf("single") >= 0) {
        $scope.status = "single";
    } else if ($location.path().indexOf("multiple") >= 0) {
        $scope.status = "multiple";
    }
    $scope.changeStatus = function (status) {
        $scope.status = status;
    };
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if ($location.path().indexOf("single") >= 0) {
            $scope.status = "single";
        } else if ($location.path().indexOf("multiple") >= 0) {
            $scope.status = "multiple";
        }
    });
}

function singleAddCtrl($scope, $rootScope, $http, md5, toaster, $stateParams) {
    $scope.user = {};
    var levels = {
        "学生": 1,
        "教师": 2
    };
    var cid = $stateParams.courseID;
    $scope.options = ["学生", "教师"];
    $scope.levelSelected = "学生";
    $scope.submit = function () {
        $scope.user.level = levels[$scope.levelSelected];
        $scope.user.password = md5.createHash($scope.user.id);
        $http.post('/addUser', {
            user: $scope.user,
            userInfo: $rootScope.userInfo,
            cid: cid
        }).success(function (res) {
            if (res.status) {
                toaster.pop('success', "添加成功！", '', 2000);
            } else {
                toaster.pop('error', "添加失败！", '', 2000);
            }
        });
    };
}

function multiAddCtrl($scope, FileUploader, $stateParams, toaster) {
    var cid = $stateParams.courseID;
    $scope.uploader = new FileUploader({
        url: '/importUsers',
        formData: [{
            cid: cid
        }]
    });

    $scope.uploader.onCompleteItem = function(item, res, status, headers) {
        if (res.status) {
            toaster.pop("success", "导入成功！", "", 2000);
        } else {
            toaster.pop("warning", "导入失败！", "", 2000);
        }
    };

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

function courseMembersCtrl($scope, $location) {
    if ($location.path().indexOf('student') >= 0) {
        $scope.status = 'student';
    } else if ($location.path().indexOf('teacher') >= 0) {
        $scope.status = 'teacher';
    }
    $scope.changeStatus = function (status) {
        $scope.status = status;
    };
}

function editUserModalCtrl($scope, $uibModalInstance, user) {
    $scope.user = {};
    for (var i in user) {
        $scope.user[i] = user[i];
    }
    $scope.ok = function () {
        $uibModalInstance.close($scope.user);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function confirmModalCtrl($scope, $uibModalInstance, des) {
    $scope.des = des;
    $scope.ok = function () {
        $uibModalInstance.close($scope.user);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function courseMembersStudentCtrl($scope, $stateParams, $http, $uibModal, $rootScope, toaster, $filter) {
    $scope.students = [];
    $scope.studentsSelected = [];
    $scope.options = [{value: '学号', key: 'sid'}, {key: 'sname', value:'姓名'}, {key: 'college', value: '学院'},
        {key: 'major', value: '专业'}, {key: 'grade', value: '年级'}];
    $scope.filterCondition = $scope.options[0];

    $http.post('/getStudents', {
        cid: $stateParams.courseID
    }).success(function (res) {
        $scope.students = res;
    });

    $scope.changeFileterCondition = function (condition) {
        $scope.filterCondition = condition;
    };
    
    $scope.open = function (user) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/editStudentModal',
            controller: editUserModalCtrl,
            resolve: {
                user: function () {
                    return user;
                }
            }
        });
        modalInstance.result.then(function (newUser) {
            $http.post('/editStudent', {
                sid: user.sid,
                student: newUser,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success",  "修改成功！", "", 2000);
                    for (var i in newUser) {
                        user[i] = newUser[i];
                    }
                } else {
                    toaster.pop("warning", "修改失败", "", 2000);
                }
            });
        });
    };
    
    $scope.delete = function (user) {
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "是否删除该学生?";
                }
            }
        });
        modalInstance.result.then(function () {
            $http.post('/deleteStudent', {
                sid: user.sid,
                userInfo: $rootScope.userInfo,
                cid: $stateParams.courseID
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success", "删除成功！", "", 2000);
                    $scope.students.splice($scope.students.indexOf(user), 1);
                } else {
                    toaster.pop("warning", "删除失败", "", 2000);
                }
            });
        });
    };

    $scope.reset = function (user) {
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "重置后密码为学号，是否重置？";
                }
            }
        });
        modalInstance.result.then(function () {
            $http.post('/resetStudent', {
                sid: user.sid,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success", "重置成功！", "", 2000);
                } else {
                    toaster.pop("warning", "重置失败", "", 2000);
                }
            });
        });
    };

    $scope.change = function () {
        for (var i = 0; i < $scope.students.length; i++) {
            $scope.students[i].selected = false;
        }

        $scope.studentsSelected = $filter('courseMembersFilter')($scope.students, $scope.filterCondition, $scope.filterValue);

        if ($scope.selectAll && $scope.studentsSelected) {
            for (var i = 0; i < $scope.studentsSelected.length; i++) {
                $scope.studentsSelected[i].selected = true;
            }
        }
    };

    $scope.check = function (student) {
        if (!student.selected) {
            $scope.selectAll = false;
        }
    };
    
    $scope.deleteMultiple = function () {
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "是否删除选中的学生？";
                }
            }
        });
        modalInstance.result.then(function () {
            var toDelete = [];
            for (var i = $scope.students.length - 1; i >= 0 ; i--) {
                if ($scope.students[i].selected) {
                    toDelete.push($scope.students[i]);
                }
            }
            $http.post('/deleteStudents', {
                students: toDelete,
                userInfo: $rootScope.userInfo,
                cid: $stateParams.courseID
            }).success(function (res) {
                if (res.status) {
                    toaster.pop('success', "删除成功！", '', 2000);
                    for (var i = $scope.students.length - 1; i >= 0 ; i--) {
                        if ($scope.students[i].selected) {
                            $scope.students.splice(i, 1);
                        }
                    }
                }
            });
        });
    }
}

function courseMembersTeacherCtrl($scope, $stateParams, $http, $uibModal, $rootScope, toaster, $filter) {
    $scope.teachers = [];
    $scope.options = [{value: '工号', key: 'tid'}, {key: 'tname', value:'姓名'}];
    $scope.filterCondition = $scope.options[0];

    $http.post('getTeachers', {
        cid: $stateParams.courseID
    }).success(function (res) {
        $scope.teachers = res;
    });

    $scope.changeFileterCondition = function (condition) {
        $scope.filterCondition = condition;
    };


    $scope.open = function (user) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/editTeacherModal',
            controller: editUserModalCtrl,
            resolve: {
                user: function () {
                    return user;
                }
            }
        });
        modalInstance.result.then(function (newUser) {
            $http.post('/editTeacher', {
                tid: user.tid,
                teacher: newUser,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success",  "修改成功！", "", 2000);
                    for (var i in newUser) {
                        user[i] = newUser[i];
                    }
                } else {
                    toaster.pop("warning", "修改失败", "", 2000);
                }
            });
        });
    };

    $scope.delete = function (user) {
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "是否删除该教师?";
                }
            }
        });
        modalInstance.result.then(function () {
            $http.post('/deleteTeacher', {
                tid: user.tid,
                userInfo: $rootScope.userInfo,
                cid: $stateParams.courseID
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success", "删除成功！", "", 2000);
                    $scope.teachers.splice($scope.teachers.indexOf(user), 1);
                } else {
                    toaster.pop("warning", "删除失败", "", 2000);
                }
            });
        });
    };

    $scope.reset = function (user) {
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "重置后密码为工号，是否重置？";
                }
            }
        });
        modalInstance.result.then(function () {
            $http.post('/resetTeacher', {
                tid: user.tid,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success", "重置成功！", "", 2000);
                } else {
                    toaster.pop("warning", "重置失败", "", 2000);
                }
            });
        });
    };

    $scope.change = function () {
        for (var i = 0; i < $scope.teachers.length; i++) {
            $scope.teachers[i].selected = false;
        }

        $scope.teachersSelected = $filter('courseMembersFilter')($scope.teachers, $scope.filterCondition, $scope.filterValue);
        if ($scope.selectAll && $scope.teachersSelected) {
            for (var i = 0; i < $scope.teachersSelected.length; i++) {
                if ($scope.teachersSelected[i].tid != $rootScope.userInfo.id)
                    $scope.teachersSelected[i].selected = true;
            }
        }
    };

    $scope.check = function (teacher) {
        if (!teacher.selected) {
            $scope.selectAll = false;
        }
    };

    $scope.deleteMultiple = function () {
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "是否删除选中的教师？";
                }
            }
        });
        modalInstance.result.then(function () {
            var toDelete = [];
            for (var i = $scope.teachers.length - 1; i >= 0 ; i--) {
                if ($scope.teachers[i].selected) {
                    toDelete.push($scope.teachers[i]);
                }
            }
            $http.post('/deleteTeachers', {
                teachers: toDelete,
                userInfo: $rootScope.userInfo,
                cid: $stateParams.courseID
            }).success(function (res) {
                if (res.status) {
                    toaster.pop('success', "删除成功！", '', 2000);
                    for (var i = $scope.teachers.length - 1; i >= 0 ; i--) {
                        if ($scope.teachers[i].selected) {
                            $scope.teachers.splice(i, 1);
                        }
                    }
                }
            });
        });
    }
}

function myCoursesCtrl($scope, $rootScope, $http) {
    $rootScope.$watch(function () {
        return $rootScope.userInfo;
    }, function () {
        if ($rootScope.userInfo && ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2 )) {
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
        $scope.course.name = $scope.course.name.trim().replace(/\s/g, "");
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
    $scope.courseName = $stateParams.courseName;
    $rootScope.$watch(function () {
        return $rootScope.userInfo;
    }, function () {
        $scope.userInfo = $rootScope.userInfo;
    });
    var options = ['add-members', 'course-data', 'course-members'];
    var path = $location.path();
    for (var i = 0; i < options.length; i++) {
        if (path.indexOf(options[i]) >= 0) {
            $scope.checked = options[i];
            break;
        }
    }
}

function courseHomeCtrl($scope, $stateParams, $http) {
   var courseID = $stateParams.courseID;
   $scope.courseName = $stateParams.courseName;
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

function courseDataCtrl($scope, $stateParams, $http, $rootScope, $uibModal, toaster) {
    var courseID = $scope.courseID = $stateParams.courseID;
    $scope.courseName = $stateParams.courseName;
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post('/getCourseWares', {
                cid: courseID,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                $scope.courseWares = res.result;
            });
        }
    });
    
    $scope.delete = function (index) {
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "是否删除该课件？";
                }
            }
        });
        modalInstance.result.then(function () {
            $http.post('/deleteCourseWare', {
                userInfo: $rootScope.userInfo,
                cwid: $scope.courseWares[index].cwid,
                cname: $scope.courseName
            }).success(function (res) {
                if (res.status) {
                    toaster.pop('success', "删除成功！", '', 2000);
                    $scope.courseWares.splice(index, 1);
                }
            });
        });
    }

}

function courseWareDetailCtrl($scope, $stateParams, $http, $rootScope) {
    $scope.courseName = $stateParams.courseName;
    $scope.cwid = $stateParams.cwid;
    $scope.canAdd = true;
    $scope.pages = [];
    $scope.pageChageCount = 0;
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo && $rootScope.userInfo.level == 1) {
            var check = setInterval(function () {
                $scope.canAdd = false;
            }, 3 * 60 * 1001);
            var add = setInterval(function () {
                if ($scope.canAdd && $scope.totalPages) {
                    $http.post('/updateLearningStatus', {
                        userInfo: $rootScope.userInfo,
                        pages: $scope.pages,
                        cwid: $scope.cwid,
                        totalPages: $scope.totalPages
                    });
                }
            }, 60 * 1000);

            $scope.$on("$destroy", function() {
                clearInterval(check);
                clearInterval(add);
            });
        }
    });
}

function learningSituationCtrl($scope, $stateParams, $http) {
    var cwid = $stateParams.cwid;
    var cid = $stateParams.courseID;
    $http.post('/getStuLearningSituation', {
        cwid: cwid,
        cid: cid
    }).success(function (res) {
        $scope.results = res;
        console.log(res);
    });
}

function addCourseDataCtrl($scope, $stateParams, FileUploader) {
    $scope.courseName = $stateParams.courseName;
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
        if ($rootScope.userInfo && ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2 )) {
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
        if ($rootScope.userInfo && ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2 )) {
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
                            var stuAnswer = $scope.questions[i].stuAnswer.trim().replace(/\s/g, "");
                            var answer = $scope.questions[i].answer.trim().replace(/\s/g, "");
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
        if ($rootScope.userInfo && ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2 )) {
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

function allMessagesCtrl($scope, $http, $rootScope, toaster) {
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo && ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2)) {
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
        $http.post("/deleteMessage", {
            mid: $scope.messages[index].mid,
            userInfo: $rootScope.userInfo
        }).success(function (res) {
            if (res.status) {
                $scope.messages.splice(index, 1);
                toaster.pop("success", "删除成功！", "", 2000);
                $rootScope.messagesNum--;
            }
        });
    }
}

function messageDetailCtrl($scope, $http, $stateParams, $rootScope) {
    var mid = $stateParams.mid;
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post("/getMessageDetail", {
                mid: mid,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                $scope.message = res[0];
            });
        }
    });
}

function myInformationCtrl($scope, $rootScope, $http, toaster, md5, $state) {
    $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo && $rootScope.userInfo.level == 1) {
            $http.get('/getUserInfo').success(function (res) {
                $scope.user = res;
            });
        } else {
            $scope.user = $rootScope.userInfo;
        }
    });
    $scope.submit = function () {
        if (!$scope.user.originalPassword) {
            if ($scope.user.newPassword || $scope.user.confirmPassword) {
                toaster.pop("warning", "保存失败", "密码修改未完成", 2000);
            }
        } else {
            $http.post("/checkPassword", {
                userInfo: $rootScope.userInfo,
                password: md5.createHash($scope.user.originalPassword)
            }).success(function (res) {
                if (!res.status) {
                    toaster.pop("warning", "保存失败", "原密码错误", 2000);
                }  else if (!$scope.user.newPassword || !$scope.user.confirmPassword) {
                    toaster.pop("warning", "保存失败", "密码修改未完成", 2000);
                } else if (!isValidPassword($scope.user.originalPassword)) {
                    toaster.pop("warning", "保存失败", "原密码错误", 2000);
                } else if (!isValidPassword($scope.user.newPassword)) {
                    toaster.pop("warning", "保存失败", "新密码格式错误", 2000);
                } else if ($scope.user.newPassword == $scope.user.originalPassword) {
                    toaster.pop("warning", "保存失败", "新密码不能与原密码相同", 2000);
                } else if ($scope.user.newPassword != $scope.user.confirmPassword) {
                    toaster.pop("warning", "保存失败", "两次输入密码不一致", 2000);
                } else {
                    $http.post('/editPassword', {
                        userInfo: $rootScope.userInfo,
                        password: md5.createHash($scope.user.newPassword)
                    }).success(function (res) {
                        toaster.pop("success", "保存成功!", "", 2000);
                    });
                }
            });
        }
    }
}

function isValidPassword(password) {
    var pattern = /^((\w)|(\.)){8,20}$/;
    if (!pattern.exec(password)) {
        return false;
    }
    return true;
}