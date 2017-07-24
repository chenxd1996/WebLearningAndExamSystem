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
                toaster.pop('success', "登录成功！", '欢迎回来，' + data.name + '！', 4000);
                $rootScope.userInfo = {
                    id: $scope.user.id,
                    name: data.name,
                    level: data.level
                };

                $state.go('logined.learningSystem.myCourses');
            } else {
                toaster.pop('error', "登录失败！", '账号或密码错误', 2500);
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
        $http.get('/logout');
    }
}

//controller for learning system router

function learningSystemCtrl($scope, $location) {
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
    /*$scope.getCourseWare = function(courseWareID, type) {
        console.log(courseWareID);
        $http.get('/getCourseWare/?' + "cid=" + courseWareID + "&type=" + type).success(function (res) {

        });
    }*/
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
                                name: courses[i].cname + "(" + courses[i].remark + ")",
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
            $http.post('/getExerciseBanks', $rootScope.userInfo)
                .success(function (res) {
                    $scope.result = res.result;
                    //console.log($scope.result);
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
    var options = ['add-exercise', 'all-exercise'];
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

function allExerciseCtrl($scope, $http, $stateParams) {
    $http.post('/getExercise', {
        ebid: $stateParams.exerciseBankID
    }).success(function (res) {
        console.log(res.result);
    });
}

