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
                        $state.go('logined.learningSystem.myCourses', {status: 'progressing'});
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
                    level: data.level,
                    duration: data.duration,
                };
                if ($rootScope.userInfo.level == 3) {
                    $state.go('logined.usersManagement.addUser.multiple');
                }
                else if ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2) {
                    $state.go('logined.learningSystem.myCourses', {status: 'progressing'});
                }
            } else {
                toaster.pop('error', "登录失败！", '账号或密码错误', 2000);
            }
        });
    }
}

//controller for homepage router
function homeCtrl($scope, $location, $rootScope, $http, $state, $timeout, $interval) {
    var unbind = $rootScope.$watch(function () {
        return $rootScope.userInfo;
    }, function () {
        if (!$rootScope.userInfo) {
            $http.get('/getUserInfo').
            success(function (result) {
                if (result.status) {
                    $rootScope.userInfo = {
                        id: result.id,
                        name: result.name,
                        level: result.level,
                        duration: result.duration,
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
        const userInfo = $rootScope.userInfo;
        if (userInfo && userInfo.level === 1) {
          $scope.duration = userInfo.duration;
          $scope.addRemoteDuration = function() {
            $http.post('/addDuration', {
              duration: $scope.duration,
            });
          }
          $scope.addDuration = function() {
            $scope.duration++;
            let duration = $scope.duration;
            $scope.hours = Math.floor(duration / 3600);
            duration %= 3600;
            $scope.minutes = Math.floor(duration / 60);
            duration %= 60;
            $scope.seconds = Math.floor(duration);
          } 
          $scope.addRemoteDurationTimer = $interval($scope.addRemoteDuration, 60000);
          $scope.addDurationTimer = $interval($scope.addDuration, 1000);
          $scope.$on('$destroy', function() {
            $interval.cancel($scope.addRemoteDurationTimer);
            $interval.cancel($scope.addDurationTimer);
          });
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
    $scope.$on('$destroy', unbind);
}

//controller for learning system router

function learningSystemCtrl($scope, $location, $rootScope) {
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
        }
    });
    $scope.$on('$destroy', unbind);
    var options = ['my-courses', 'add-course', 'courses-management'];
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
    $scope.totalItems = 1;
    $scope.maxSize = 10;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 20;
    $scope.updateTotal = function(total) {
      $scope.totalItems = total;
    }
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
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
          $scope.userInfo = $rootScope.userInfo;
        }
    });
    $scope.$on('$destroy', unbind);
    $scope.students = [];
    $scope.studentsSelected = [];
    $scope.options = [{value: '学号', key: 'sid'}, {key: 'sname', value:'姓名'}, {key: 'college', value: '学院'},
        {key: 'major', value: '专业'}, {key: 'grade', value: '年级'}];
    $scope.filterCondition = $scope.options[0];

    $scope.$watch('currentPage', function() {
      $http.post('/getStudents', {
          cid: $stateParams.courseID,
          itemsPerPage: $scope.itemsPerPage,
          currentPage: $scope.currentPage,
      }).success(function (res) {
          $scope.updateTotal(res.total);
          $scope.students = res.users;
          $scope.students.forEach(function(item) {
            let duration = item.duration;
            item.hours = Math.floor(duration / 3600);
            duration %= 3600;
            item.minutes = Math.floor(duration / 60);
            duration %= 60;
            item.seconds = Math.floor(duration);
          });
      });
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

    $scope.$watch('currentPage', function() {
      $http.post('getTeachers', {
        cid: $stateParams.courseID,
        itemsPerPage: $scope.itemsPerPage,
        currentPage: $scope.currentPage,        
      }).success(function (res) {
          $scope.updateTotal(res.total);
          $scope.teachers = res.users;
      });
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

function myCoursesCtrl($scope, $rootScope, $http, $state, $stateParams) {
    $scope.status = $scope.radioModel = $stateParams.status;
    $scope.result = {};
    var unbind = $rootScope.$watch(function () {
        return $rootScope.userInfo;
    }, function () {
        if ($rootScope.userInfo && ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2 )) {
            $scope.userInfo = $rootScope.userInfo;
            $http.post('/getMyCourses', {
                userInfo: $rootScope.userInfo,
                status: $scope.status
            }).success(function (res) {
                if (res.status) {
                    $scope.result = res.result;
                }
            });
        }
    });
    $scope.$on('$destroy', unbind);
    $scope.changeStatus = function (status) {
        $state.go("logined.learningSystem.myCourses", {status: status}, {reload: true});
    };
}

function addCourseCtrl($scope, $http, toaster, $rootScope, $uibModal) {
    $scope.course = {};
    $scope.addCourse = function () {
        $scope.course.endTime = $scope.endTime;
        $scope.course.name = $scope.course.name.trim().replace(/\s/g, "");
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "是否创建该课程?";
                }
            }
        });
        modalInstance.result.then(function () {
            $http.post('/addCourse', {
                course: $scope.course,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop('success', "创建成功！", '', 2000);
                } else {
                    toaster.pop('error', "创建失败！", '', 2000);
                }
            });
        });
    };
    $scope.dateOptions = {
        minDate: new Date(),
        startingDay: 1
    };

    $scope.dtOpen = function () {
        $scope.isDtOpen = true;
    };
}

function coursesManagementCtrl($scope, $rootScope, $http, toaster, $uibModal) {
    var unbind = $rootScope.$watch(function () {
        return $rootScope.userInfo;
    }, function () {
        if ($rootScope.userInfo && $rootScope.userInfo.level == 2 ) {
            $http.post('/getMyCourses', {
                userInfo: $rootScope.userInfo,
                status: $scope.status
            }).success(function (res) {
                if (res.status) {
                    $scope.courses = res.result.courses;
                }
            });
        }
    });
    $scope.$on('$destroy', unbind);

    $scope.edit = function(course) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/editCourseModal',
            controller: editCourseModalCtrl,
            resolve: {
                course: function () {
                    return course;
                }
            }
        });
        modalInstance.result.then(function (newCourse) {
            $http.post('/editCourse', {
                course: newCourse,
                oldName: course.cname,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success",  "修改成功！", "", 2000);
                    for (var i in newCourse) {
                        course[i] = newCourse[i];
                    }
                } else {
                    toaster.pop("warning", "修改失败", "", 2000);
                }
            });
        });
    };

    $scope.delete = function (course) {
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "删除课程将同时删除相关题库、课件以及考试，是否确定删除该课程?";
                }
            }
        });
        modalInstance.result.then(function () {
            $http.post('/deleteCourse', {
                course: course,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success", "删除成功！", "", 2000);
                    $scope.courses.splice($scope.courses.indexOf(course), 1);
                } else {
                    toaster.pop("warning", "删除失败", "", 2000);
                }
            });
        });
    };
}

function editCourseModalCtrl($scope, $uibModalInstance, course) {
    $scope.course = {};
    for (var i in course) {
        $scope.course[i] = course[i];
    }
    $scope.ok = function () {
        $uibModalInstance.close($scope.course);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.dateOptions = {
        minDate: new Date(),
        startingDay: 1
    };

    $scope.dtOpen = function () {
        $scope.isDtOpen = true;
    };
}

function courseDetailCtrl($scope, $location,  $stateParams, $rootScope) {
    $scope.courseID = $stateParams.courseID;
    $scope.courseName = $stateParams.courseName;
    var unbind = $rootScope.$watch(function () {
        return $rootScope.userInfo;
    }, function () {
        $scope.userInfo = $rootScope.userInfo;
    });
    $scope.$on('$destroy', unbind);
    var options = ['add-members', 'add-course-data', 'course-data', 'course-members'];
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
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post('/getCourseWares', {
                cid: courseID,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                $scope.courseWares = res.result;
            });
        }
    });
    $scope.$on('$destroy', unbind);
    
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
    var unbind = $rootScope.$watch('userInfo', function () {
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
    $scope.$on('$destroy', unbind);

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
    var options = ['add-exercise-bank', 'my-exercise-bank', 'exercise-banks-management'];
    var path = $location.path();
    for (var i = 0; i < options.length; i++) {
        if (path.indexOf(options[i]) >= 0) {
            $scope.checked = options[i];
        }
    }
}

function addExerciseBankCtrl($scope, $rootScope, $http, toaster) {
    $scope.exerciseBank = {};
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo && ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2 )) {
            $http.post('/getMyCourses', {
                userInfo: $rootScope.userInfo,
                status: 'progressing'
            }).success(function (res) {
                $scope.courses = res.result.courses;
                $scope.courseSelected = $scope.courses[0];
            });
        }
    });
    $scope.$on('$destroy', unbind);    

    $scope.submit = function () {
        $scope.exerciseBank.id = $scope.courseSelected.cid;
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

function myExerciseBankCtrl($scope, $http, $rootScope, $stateParams, $state) {
    $scope.status = $scope.radioModel = $stateParams.status;
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
            $http.post('/getExerciseBanks', {
                userInfo: $rootScope.userInfo,
                status: $scope.status
            }).success(function (res) {
                $scope.result = res.result;
                $scope.counts = res.counts;
            });
        }
    });
    $scope.$on('$destroy', unbind);
    $scope.changeStatus = function (status) {
        $state.go("logined.exerciseSystem.myExerciseBank", {status: status}, {reload: true});
    }
}

function exerciseBanksManagementCtrl($scope, $http, $rootScope, toaster, $uibModal) {
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
            $http.post('/getExerciseBanks', {
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                $scope.ebs = res.result;
            });
        }
    });
    $scope.$on('$destroy', unbind);

    $scope.edit = function(eb) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/editExerciseBankModal',
            controller: editExerciseBankModalCtrl,
            resolve: {
                eb: function () {
                    return eb;
                }
            }
        });
        modalInstance.result.then(function (newEb) {
            $http.post('/editExerciseBank', {
                eb: newEb,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success",  "修改成功！", "", 2000);
                    for (var i in newEb) {
                        eb[i] = newEb[i];
                    }
                } else {
                    toaster.pop("warning", "修改失败", "", 2000);
                }
            });
        });
    };

    $scope.delete = function (eb) {
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "删除题库将影响到相关的考试，是否确定删除？";
                }
            }
        });
        modalInstance.result.then(function () {
            $http.post('/deleteExerciseBank', {
                eid: eb.eid,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success", "删除成功！", "", 2000);
                    $scope.ebs.splice($scope.ebs.indexOf(eb), 1);
                } else {
                    toaster.pop("warning", "删除失败", "", 2000);
                }
            });
        });
    };
}

function editExerciseBankModalCtrl($scope, $uibModalInstance, eb) {
    $scope.eb = {};
    for (var i in eb) {
        $scope.eb[i] = eb[i];
    }
    $scope.ok = function () {
        $uibModalInstance.close($scope.eb);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function exerciseBankDetailCtrl($scope, $rootScope, $stateParams, $location) {
    $scope.exerciseBankID = $stateParams.exerciseBankID;
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
        }
    });
    $scope.$on('$destroy', unbind);    
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

function exerciseCtrl($scope, $http, $stateParams, $rootScope, $timeout, toaster, $uibModal) {
    $scope.status = $stateParams.status;
    $scope.done = 0;
    $scope.correctNum = 0;
    $scope.questions = [];
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
            $http.post('/getExercise', {
                ebid: $stateParams.exerciseBankID,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                $scope.questions = res.exercise;
                $scope.options = res.options;
                var toDelete = [];
                if (res.exercise.length > 0) {
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
                }
            });
        }
    });
    $scope.$on('$destroy', unbind);

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
            userInfo: $rootScope.userInfo,
            eid: $stateParams.exerciseBankID
        }).success(function (res) {
            if (res.status) {
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
            } else {
                toaster.pop('warning', '课程已结束，不能再提交', "", 2000);
            }
        });
    };

    $scope.edit = function (exercise, options) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/editExerciseModal',
            controller: editExerciseModalCtrl,
            resolve: {
                exercise: function () {
                    return exercise;
                },
                options: function () {
                    return options;
                }
            }
        });
        modalInstance.result.then(function (result) {
            $http.post('/editExercise', {
                exercise: result.exercise,
                options: result.options,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success",  "修改成功！", "", 2000);
                    for (var i in result.exercise) {
                        exercise[i] = result.exercise[i];
                    }
                    for (var i = 0; i < result.options.length; i++) {
                        options[i] = result.options[i];
                    }
                } else {
                    toaster.pop("warning", "修改失败", "", 2000);
                }
            });
        });
    };

    $scope.delete = function (exercise) {
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "删除题目将影响到相关的考试，是否确定删除？";
                }
            }
        });
        modalInstance.result.then(function () {
            $http.post('/deleteExercise', {
                eid: exercise.eid,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success", "删除成功！", "", 2000);
                    $scope.questions.splice($scope.questions.indexOf(exercise), 1);
                } else {
                    toaster.pop("warning", "删除失败", "", 2000);
                }
            });
        });
    }
}

function editExerciseModalCtrl($scope, $uibModalInstance, exercise, options) {
    $scope.editorText = exercise.description;
    $scope.optionsNum = options.length;
    $scope.exercise = {};
    $scope.options = [];
    for (var i in exercise) {
        $scope.exercise[i] = exercise[i];
    }
    for (var i = 0; i < options.length; i++) {
        tmp = {};
        for (var j in options[i]) {
            tmp[j] = options[i][j];
        }
        $scope.options.push(tmp);
    }

    $scope.ok = function () {
        $scope.exercise.description = $scope.editorText;
        $uibModalInstance.close({exercise: $scope.exercise, options: $scope.options});
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.change = function (num) {
        $scope.options = [];
        for (var i = 0; i < num; i++) {
            $scope.options.push({
                op: String.fromCharCode(65 + i),
                eid: exercise.eid
            });
        }
    }
}

function examSystemCtrl($scope, $rootScope, $location, $state) {
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $scope.userInfo = $rootScope.userInfo;
        }
    });
    $scope.$on('$destroy', unbind);
    var options = ['my-exams', 'add-exam', 'exams-management'];
    for (var i  = 0; i < options.length; i++) {
        if ($location.path().indexOf(options[i]) >= 0) {
            $scope.checked = options[i];
            break;
        }
    }
}

function addExamCtrl($scope, $rootScope, $http, toaster) {
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo && ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2 )) {
            $http.post('/getMyCourses', {
                userInfo: $rootScope.userInfo,
                status: 'progressing'
            }).success(function (res) {
                $scope.courses = res.result.courses;
            });
        }
    });
    $scope.$on('$destroy', unbind);

    $scope.dateOptions = {
        minDate: new Date(),
        startingDay: 1
    };

    $scope.startDateOpen = function () {
        $scope.isStartDateOpen = true;
    };

    $scope.endDateOpen = function() {
      $scope.isEndDateOpen = true;
    }

    $scope.hstep = 1;
    $scope.mstep = 1;

    $scope.getCourseExerciseBanks = function () {
        // $http.post('/getCourseExerciseBanks', {
        //     cid: $scope.courseSelected.cid
        // }).success(function (res) {
        //     if (res.status) {
        //         $scope.ebs = res.result;
        //         for (var i = 0; i < $scope.ebs.length; i++) {
        //             $scope.ebs[i].exerciseNum = 0;
        //         }
        //     }
        // });
        $http.post('/getExerciseBanks', {
            userInfo: $rootScope.userInfo
        }).success(function (res) {
            if (res.status) {
                $scope.ebs = res.result;
                for (var i = 0; i < $scope.ebs.length; i++) {
                    $scope.ebs[i].exerciseNum = 0;
                }
            }
        });
    };

    $scope.submit = function () {
        var exam = {};
        exam.cid = $scope.courseSelected.cid;
        exam.examName = $scope.examName;
        exam.examStartDate = $scope.examStartDate;
        exam.examEndDate = $scope.examEndDate;
        exam.startTime = $scope.startTime;
        exam.endTime = $scope.endTime;
        exam.exerciseNum = $scope.exerciseNum;
        exam.isMock = $scope.isMock;
        exam.duration = $scope.duration;
        var total = 0;
        for (var i = 0; i < $scope.ebs.length; i++) {
            total += $scope.ebs[i].exerciseNum;
        }
        if (total > 0) {
            exam.examPoints = 100.0 / total;
        } else {
            exam.examPoints = 0;
        }
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

function myExamsCtrl($scope, $http, $rootScope, $stateParams, $location, $state, $uibModal) {
    var status = $scope.status = $stateParams.status;
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post("/getMyExams", {
                userInfo: $rootScope.userInfo,
                status: status
            }).success(function (res) {
                $scope.exams = res;
            });
        }
    });
    $scope.$on('$destroy', unbind);
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
    $scope.showConfirm = function(exam) {
      var modalInstance = $uibModal.open({
        animation: false,
        size: 'sm',
        templateUrl: 'partials/confirmModal',
        controller: confirmModalCtrl,
        resolve: {
            des: function () {
                return "考试须在规定时间内完成，确定开始考试吗？";
            }
        }
      });

      modalInstance.result.then(function () {
          $http.post('/startExam', {
              eid: exam.eid,
              userInfo: $rootScope.userInfo
          }).success(function (res) {
              if (res.status === 'SUCCESS') {
                $state.go("logined.examDetail.allQuestions", {
                    status: 'progressing',
                    examID: exam.eid,
                });
              }
          });
      });
    }
}

function examsManagementCtrl($scope, $http, $rootScope, $uibModal, toaster) {
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post("/getMyExams", {
                userInfo: $rootScope.userInfo,
                status: status
            }).success(function (res) {
                $scope.exams = res || [];
                $scope.exams.forEach((exam) => {
                  exam.duration = exam.duration / 60;
                });
            });
        }
    });
    $scope.$on('$destroy', unbind);    

    $scope.edit = function (exam) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/editExamModal',
            controller: editExamModalCtrl,
            resolve: {
                exam: function () {
                    return exam;
                }
            }
        });
        modalInstance.result.then(function (newExam) {
            $http.post('/editExam', {
                exam: newExam,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success",  "修改成功！", "", 2000);
                    for (var i in newExam) {
                        exam[i] = newExam[i];
                    }
                } else {
                    toaster.pop("warning", "修改失败", "", 2000);
                }
            });
        });
    }

    $scope.delete = function (exam) {
        var modalInstance = $uibModal.open({
            animation: false,
            size: 'sm',
            templateUrl: 'partials/confirmModal',
            controller: confirmModalCtrl,
            resolve: {
                des: function () {
                    return "删除考试将同时删除学生的考试成绩，是否确定删除？";
                }
            }
        });

        modalInstance.result.then(function () {
            $http.post('/deleteExam', {
                eid: exam.eid,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                if (res.status) {
                    toaster.pop("success", "删除成功！", "", 2000);
                    $scope.exams.splice($scope.exams.indexOf(exam), 1);
                } else {
                    toaster.pop("warning", "删除失败", "", 2000);
                }
            });
        });
    }
}

function editExamModalCtrl($scope, $uibModalInstance, exam, $rootScope, $http) {
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo && ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2 )) {
            $http.post('/getMyCourses', {
                userInfo: $rootScope.userInfo,
                status: 'progressing'
            }).success(function (res) {
                $scope.courses = res.result.courses;
            });
        }
    });
    $scope.$on('$destroy', unbind);
    $scope.exam = {};
    for (var i in exam) {
        $scope.exam[i] = exam[i];
    }
    var tmpStartTime = new Date();
    tmpStartTime.setTime($scope.exam.startTime);
    var tmpEndTime = new Date();
    tmpEndTime.setTime($scope.exam.endTime);
    $scope.exam.startTime = tmpStartTime;
    $scope.exam.endTime = tmpEndTime;
    $scope.exam.examStartDate = tmpStartTime;
    $scope.exam.examEndDate = tmpEndTime;

    $scope.ok = function () {
        $scope.exam.startTime = new Date($scope.exam.startTime);
        $scope.exam.endTime = new Date($scope.exam.endTime);
        $scope.exam.examStartDate = new Date($scope.exam.examStartDate);
        $scope.exam.examEndDate = new Date($scope.exam.examEndDate);
        $scope.exam.startTime.setFullYear($scope.exam.examStartDate.getFullYear());
        $scope.exam.endTime.setFullYear($scope.exam.examEndDate.getFullYear());
        $scope.exam.startTime.setMonth($scope.exam.examStartDate.getMonth());
        $scope.exam.endTime.setMonth($scope.exam.examEndDate.getMonth());
        $scope.exam.startTime.setDate($scope.exam.examStartDate.getDate());
        $scope.exam.endTime.setDate($scope.exam.examEndDate.getDate());
        $uibModalInstance.close($scope.exam);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.dateOptions = {
        minDate: new Date(),
        startingDay: 1
    };

    $scope.startDateOpen = function () {
        $scope.isStartDateOpen = true;
    };

    $scope.endDateOpen = function () {
      $scope.isEndDateOpen = true;
  };

    $scope.hstep = 1;
    $scope.mstep = 1;

    $scope.getCourseExerciseBanks = function () {
        $http.post('/getCourseExerciseBanks', {
            cid: $scope.courseSelected.cid
        }).success(function (res) {
            if (res.status) {
                $scope.ebs = res.result;
                for (var i = 0; i < $scope.ebs.length; i++) {
                    $scope.ebs[i].exerciseNum = 0;
                }
            }
        });
    };


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

function allQuestionsCtrl($scope, $stateParams, $http, $rootScope, toaster, $timeout, $state, $uibModal) {
    var eid = $stateParams.examID;
    $scope.status = $stateParams.status;
    $scope.done = 0;
    $scope.correctNum = 0;
    $scope.hours = 0;
    $scope.minutes = 0;
    $scope.seconds = 0;
    var timeCounter;
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post("/getExamQuestions",{
                userInfo: $rootScope.userInfo,
                eid: eid
            }).success(function (res) {
                if (!res) {
                    return;
                }
                if (res.grade) {
                    $scope.grade = res.grade;
                } else {
                    $scope.grade = 0;
                }
                $scope.isSubmit = res.isSubmit;
                $scope.leftTime = res.leftTime;
                $scope.startTime = res.exam.startTime;
                $scope.endTime = res.exam.endTime;
                $scope.points = res.exam.points;
                $scope.type = res.exam.type;
                $scope.now = res.now;
                $scope.questions = res.exercise;
                $scope.options = res.options;
                for (var i = 0; i < $scope.options.length; i++) {
                    if ($scope.status == "ended" || $scope.isSubmit) {
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
                if ($scope.leftTime > 0) {
                    timeCounter = setInterval(function () {
                        $scope.leftTime -= 1000;
                        if ($scope.leftTime > 0) {
                            $timeout(function () {
                                var ms = $scope.leftTime;
                                if (ms >= 0) {
                                  $scope.hours = Math.floor(ms / (1000 * 60 * 60));
                                  ms = ms % (1000 * 60 * 60);
                                  $scope.minutes = Math.floor(ms / (1000 * 60));
                                  ms = ms % (1000 * 60);
                                  $scope.seconds = Math.floor(ms / 1000);
                                }
                            });
                        } else if ($scope.status == "progressing") {
                            $state.go("logined.examDetail.allQuestions", {
                                status: 'ended',
                                examID: eid
                            }, {
                                reload: true
                            });
                            clearInterval(timeCounter);
                        }
                    }, 1000);
                } else if ($scope.status == "progressing") {
                    $state.go("logined.examDetail.allQuestions", {
                        status: 'ended',
                        examID: eid
                    }, {
                        reload: true
                    });
                }
            });
        }
    });
    $scope.$on('$destroy', function() {
      unbind();
      clearInterval(timeCounter);
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

    $scope.submitAnswer = function() {
      var modalInstance = $uibModal.open({
          animation: false,
          size: 'sm',
          templateUrl: 'partials/confirmModal',
          controller: confirmModalCtrl,
          resolve: {
              des: function () {
                return "提交之后不能再修改答案，确定提交吗?";
              }
          }
      });
      modalInstance.result.then(function () {
        $http.post('/submitAnswer', {
          sid: $rootScope.userInfo.id,
          eid: eid,
        }).success(function() {
          location.reload();
        });
      });
    };

    $scope.reExam = function() {
      var modalInstance = $uibModal.open({
          animation: false,
          size: 'sm',
          templateUrl: 'partials/confirmModal',
          controller: confirmModalCtrl,
          resolve: {
              des: function () {
                return "重测将会清空之前的作答与成绩，确定重测吗？";
              }
          }
      });
      modalInstance.result.then(function () {
        $http.post('/startExam', {
          userInfo: $rootScope.userInfo,
          eid: eid,
        }).success(function() {
          $state.go("logined.examDetail.allQuestions", {
            status: 'progressing',
            examID: eid
          }, {
            reload: true
          });
        });
      });
    };
}

function examResultCtrl($scope, $stateParams, $http, $rootScope) {
    $scope.status = $stateParams.status;
    $scope.currentPage = 1;
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
            var unbind = $rootScope.$watch('userInfo', function () {
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
                    var cmp = Number.parseFloat($scope.students[0].grade.toFixed(1));
                    var rank = 1;
                    for (var i = 0; i < $scope.students.length; i++) {
                        if (i === 10 && $rootScope.userInfo.level == 1) {
                            $scope.students.splice(10, $scope.students.length - 10);
                            break;
                        }
                        var grade = Number.parseFloat($scope.students[i].grade.toFixed(1));
                        if (grade < cmp) {
                            rank++;
                            cmp = grade;
                        }
                        $scope.students[i].rank = rank;
                    }
                    $scope.studentsPages = [];
                    for (var i = 0; i < $scope.students.length; i += 10) {
                        $scope.studentsPages.push($scope.students.slice(i, i + 10));
                    }
                    console.log($scope.studentsPages.length);
                }
            });
            $scope.$on('$destroy', unbind);            
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
    // UE.getEditor('container');
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo && ($rootScope.userInfo.level == 1 || $rootScope.userInfo.level == 2 )) {
            $http.post('/getMyCourses', {
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                $scope.courses = res.result.courses;
            });
        }
    });
    $scope.$on('$destroy', unbind);

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
    var unbind = $rootScope.$watch('userInfo', function () {
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

    $scope.$on('$destroy', unbind);
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
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo) {
            $http.post("/getMessageDetail", {
                mid: mid,
                userInfo: $rootScope.userInfo
            }).success(function (res) {
                $scope.message = res[0];
            });
        }
    });
    $scope.$on('$destroy', unbind);
}

function myInformationCtrl($scope, $rootScope, $http, toaster, md5) {
    var unbind = $rootScope.$watch('userInfo', function () {
        if ($rootScope.userInfo && $rootScope.userInfo.level == 1) {
            $http.get('/getUserInfo').success(function (res) {
                $scope.user = res;
            });
        } else {
            $scope.user = $rootScope.userInfo;
        }
    });
    $scope.$on('$destroy', unbind);
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

function addQuestionModalCtrl($scope, $uibModalInstance, $rootScope, $http, courseID) {
  $scope.ok = function () {
    if (!$scope.title || !$scope.editorText) {
      alert('标题或内容不能为空哦！');
    } else {
      $http.post('/addQuestion', {
        title: $scope.title,
        content: $scope.editorText,
        courseID: courseID,
        creater: $rootScope.userInfo,
      }).success(function(res) {
        if (res.status === 'SUCCESS') {
          alert('提交成功');
        } else {
          alert('提交失败');
        }
        $uibModalInstance.close({
          title: $scope.title,
          content: $scope.editorText,
          courseID: courseID,
          creater: $rootScope.userInfo,
        });
      });
    }
  };

  $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
  };
}

function questionAndAnswerCtrl($scope, $http, $uibModal, $rootScope) {
  var unbind = $rootScope.$watch(function () {
      return $rootScope.userInfo;
  }, function () {
    $scope.userInfo = $rootScope.userInfo;
  });
  $scope.$on('$destroy', unbind);
  const courseID = $scope.$parent.courseID;
  $http.post('/getQuestions', {
    courseID: courseID,
  }).success(function(res) {
    $scope.questions = res.questions.sort(function(questionA, questionB) {
      return questionB.time - questionA.time;
    });
    $scope.questions.forEach(item => {
      item.creater = JSON.parse(item.creater);
    });
  });
  $scope.showModal = function() {
    const instance = $uibModal.open({
      templateUrl: 'myModalContent.html',
      controller: addQuestionModalCtrl,
      // controllerAs: '$ctrl',
      resolve: {
        courseID: function () {
          return courseID;
        }
      }
    });
    instance.result.then(function(res) {
      $scope.questions.unshift(res);
    });
  };
  $scope.delete = function(questionId) {
    $http.post('/deleteQuestion', {
      questionId: questionId,
    }).success(function(res) {
      if (res.status === 'SUCCESS') {
        alert('删除成功');
        $scope.questions = $scope.questions.filter(function(item) {
          return item.id !== questionId;
        });
      } else {
        alert('删除失败');
      }
    });
  }
}

function addAnswerModalCtrl($scope, $http, questionId, $rootScope, $uibModalInstance, toUser) {
  $scope.ok = function () {
    if (!$scope.editorText) {
      alert('回复内容不能为空哦！');
    } else {
      $http.post('/addAnswer', {
        content: $scope.editorText,
        questionId: questionId,
        from: $rootScope.userInfo,
        to: toUser,
      }).success(function(res) {
        if (res.status === 'SUCCESS') {
          alert('提交成功');
        } else {
          alert('提交失败');
        }
        $uibModalInstance.close({
          content: $scope.editorText,
          questionId: questionId,
          from: $rootScope.userInfo,
          to: toUser,
        });
      });
    }
  };

  $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
  };
}

function questionDetail($scope, $state, $http, $uibModal) {
  let question = {};
  $http.post('/getQuestionDetail', {
    questionId: $state.params.questionId,
  }).success(function(res) {
    question = $scope.question = res.question;
    question.creater = JSON.parse(question.creater);
    if (question.answers) {
      question.answers = JSON.parse(question.answers);
    } else {
      question.answers = [];
    }
  });
  $scope.showModal = function(toUser) {
    const instance = $uibModal.open({
      templateUrl: 'addAnswerModal.html',
      controller: addAnswerModalCtrl,
      // controllerAs: '$ctrl',
      resolve: {
        questionId: function () {
          return question.id;
        },
        toUser: toUser,
      }
    });
    instance.result.then(function(res) {
      question.answers.push(res);
    });
  };
  
}

function isValidPassword(password) {
    var pattern = /^((\w)|(\.)){8,20}$/;
    if (!pattern.exec(password)) {
        return false;
    }
    return true;
}