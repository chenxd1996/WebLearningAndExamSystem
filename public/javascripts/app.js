
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'chart.js', 'toaster', 'angular-md5', 'ngSanitize', 'angularFileUpload']).
config(['$locationProvider', '$stateProvider', '$urlRouterProvider', 'ChartJsProvider', function ($locationProvider, $stateProvider, ChartJsProvider) {
    $stateProvider
        .state("login", {
            url:"/login",
            controller: loginCtrl,
            templateUrl: "partials/login"
        }).state("logined", {
            url: "/homePage",
            controller: homeCtrl,
            templateUrl: "partials/homePage"
        }).state("logined.learningSystem", {
            url: "/learning-system",
            controller: learningSystemCtrl,
            templateUrl: "partials/learningSystem"
        }).state("logined.exerciseSystem", {
            url: "/exercise-system",
            controller: exerciseSystemCtrl,
            templateUrl: "partials/exerciseSystem"
        }).state("logined.usersManagement", {
            url: "/users-management",
            controller: usersManagementCtrl,
            templateUrl: "partials/usersManagement"
        }).state("logined.usersManagement.addUser", {
            url: "/add-user",
            controller:addUserCtrl,
            templateUrl: "partials/addUser"
        }).state("logined.usersManagement.addUser.single", {
            url: "/single",
            controller:singleAddCtrl,
            templateUrl: "partials/singleAdd"
        }).state("logined.usersManagement.addUser.multiple", {
            url: "/multiple",
            controller:multiAddCtrl,
            templateUrl: "partials/multiAdd"
        }).state("logined.usersManagement.editUser", {
            url: "/edit-user",
            controller: editUserCtrl,
            templateUrl: "partials/editUser"
        }).state("logined.usersManagement.deleteUser", {
            url: "/delete-user",
            controller: deleteUserCtrl,
            templateUrl: "partials/deleteUser"
        }).state("logined.usersManagement.usersList", {
            url: "/users-list",
            controller: usersListCtrl,
            templateUrl: "partials/usersList"
        }).state("logined.learningSystem.myCourses", {
            url: "/my-courses",
            controller: myCoursesCtrl,
            templateUrl: "partials/myCourses"
        }).state("logined.learningSystem.addCourse", {
            url: "/add-course",
            controller: addCourseCtrl,
            templateUrl: "partials/addCourse"
        }).state("logined.courseDetail", {
            url: "/learning-system/course-detail",
            params: {courseID: null, courseName: null},
            controller: courseDetailCtrl,
            templateUrl: "partials/courseDetail"
        }).state("logined.courseDetail.courseHome", {
            url: "/:courseID/:courseName/course-home",
            controller: courseHomeCtrl,
            templateUrl: "partials/courseHome"
        }).state("logined.courseDetail.courseData", {
            url: "/:courseID/:courseName/course-data",
            controller: courseDataCtrl,
            templateUrl: "partials/courseData"
        }).state("logined.courseDetail.addMembers", {
            url: "/:courseID/:courseName/add-members",
            controller: addUserCtrl,
            templateUrl: "partials/addUser"
        }).state("logined.courseDetail.addMembers.single", {
            url: "/single",
            controller: singleAddCtrl,
            templateUrl: "partials/singleAdd"
        }).state("logined.courseDetail.addMembers.multiple", {
            url: "/multiple",
            controller: multiAddCtrl,
            templateUrl: "partials/multiAdd"
        }).state("logined.courseDetail.addCourseData", {
            url: "/:courseID/:courseName/add-course-data",
            controller: addCourseDataCtrl,
            templateUrl: "partials/addCourseData"
        }).state("logined.courseDetail.courseMembers", {
            url: "/:courseID/:courseName/course-members",
            controller: courseMembersCtrl,
            templateUrl: "partials/courseMembers"
        }).state("logined.courseDetail.courseMembers.student", {
            url: "/student",
            controller: courseMembersStudentCtrl,
            templateUrl: "partials/courseMembersStudent"
        }).state("logined.courseDetail.courseMembers.teacher", {
            url: "/teacher",
            controller: courseMembersTeacherCtrl,
            templateUrl: "partials/courseMembersTeacher"
        }).state("logined.courseDetail.courseWareDetail", {
            url: "/:courseID/:courseName/course-data/:cwid",
            controller: courseWareDetailCtrl,
            templateUrl: "partials/courseWareDetail"
        }).state("logined.courseDetail.learningSituation", {
            url: "/:courseID/:courseName/course-data/:cwid/learning-situation",
            controller: learningSituationCtrl,
            templateUrl: "partials/learningSituation"
        }).state("logined.exerciseSystem.addExerciseBank", {
            url: "/exercise-system/add-exercise-bank",
            controller: addExerciseBankCtrl,
            templateUrl: "partials/addExerciseBank"
        }).state("logined.exerciseSystem.myExerciseBank", {
            url: "/exercise-system/my-exercise-bank",
            controller: myExerciseBankCtrl,
            templateUrl: "partials/myExerciseBank"
        }).state("logined.exerciseBankDetail", {
            url: "/exercise-system/exerciseBank-detail",
            params: {exerciseBankID: null},
            controller: exerciseBankDetailCtrl,
            templateUrl: "partials/exerciseBankDetail"
        }).state("logined.exerciseBankDetail.addExercise", {
            url: "/:exerciseBankID/add-exercise",
            controller: addExerciseCtrl,
            templateUrl: "partials/addExercise"
        }).state("logined.exerciseBankDetail.exercise", {
            url: "/:exerciseBankID/exercise/:status",
            controller: exerciseCtrl,
            templateUrl: "partials/exercise"
        }).state("logined.examSystem", {
            url: "/exam-system",
            controller: examSystemCtrl,
            templateUrl: "partials/examSystem"
        }).state("logined.examSystem.addExam", {
            url: "/add-exam",
            controller: addExamCtrl,
            templateUrl: "partials/addExam"
        }).state("logined.examSystem.myExams", {
            url: "/my-exams/:status",
            controller: myExamsCtrl,
            templateUrl: "partials/myExams"
        }).state("logined.examDetail", {
            url: "/exam-system/exam-detail",
            params: {examID: null, status: null},
            controller: examDetailCtrl,
            templateUrl: "partials/examDetail"
        }).state("logined.examDetail.allQuestions", {
            url: "/:examID/:status/all-questions",
            controller: allQuestionsCtrl,
            templateUrl: "partials/allQuestions"
        }).state("logined.examDetail.examResult", {
            url: "/:examID/:status/exam-result",
            controller: examResultCtrl,
            templateUrl: "partials/examResult"
        }).state("logined.messagesCenter", {
            url: "/message-center",
            controller: messageCenterCtrl,
            templateUrl: "partials/messageCenter"
        }).state("logined.messagesCenter.postMessage", {
            url: "/post-message",
            controller: postMessageCtrl,
            templateUrl: "partials/postMessage"
        }).state("logined.messagesCenter.allMessages", {
            url: "/all-messages",
            controller: allMessagesCtrl,
            templateUrl: "partials/allMessages"
        }).state("logined.messageDetail", {
            url: "/message-center/messageDetail/:mid",
            controller: messageDetailCtrl,
            templateUrl: "partials/messageDetail"
        }).state("logined.myInformation", {
            url: "/my-information",
            controller: myInformationCtrl,
            templateUrl: "partials/myInformation"
        });
    $locationProvider.html5Mode(true);
}]);