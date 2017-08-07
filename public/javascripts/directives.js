angular.module('myApp.directives', []).
directive('verticalCenter', function ($window) {
    return {
        restrict: 'AE',
        link: function ($scope, element, attrs) {
            var height = element.children("div.modal-content").eq(0).height();

            element.css({
                "margin-top": ($window.innerHeight - height) / 2 + 'px',
                "margin-bottom": 0
            });

            angular.element($window).bind('resize', function () {
                element.css({
                    "margin-top": ($window.innerHeight - height) / 2 + 'px',
                    "margin-bottom": 0
                });
            });
        }
    };
}).
directive('responsiveNavigation', function ($timeout) {
    return {
        restrict: 'AE',
        link: function ($scope, element, attrs) {
            element.on('mouseenter', function () {
                $timeout(function () {
                    $scope.showDetail = true;
                });
                element.removeClass('navNarrow');
                element.addClass('navWide');
                element.removeClass('text-center');
            });
            element.on('mouseleave', function () {
                $timeout(function () {
                    $scope.showDetail = false;
                    $timeout(function () {
                        element.removeClass('navWide');
                        element.addClass('navNarrow');
                        element.addClass('text-center');
                    }, 50);
                });
            });
        }
    }}).
directive('editorBody', function () {
    return {
        restrict: 'AE',
        link: function ($scope, element, attrs) {
            element.css({
                "overflow":"scroll",
                "height":"300px",
                "width":"100%",
                "border-width": "1px",
                "border-style" : "solid",
                "border-color" : "#ccc",
                "margin-top" : "10px"
            });
            element.wysiwyg();
            element.bind('change', function () {
                $scope.editorText = element.context.innerHTML;
            });
        }
    }
}).
directive('editor', function () {
    return {
        restrict: 'AE',
        templateUrl: 'partials/editor',
        replace: true
    }
}).
directive('majorChangeListener', function ($http) {
    return {
        restrict: 'AE',
        link: function ($scope, element, attrs) {
            element.bind('focusout', function () {
                if ($scope.course.major) {
                    var major = $scope.course.major.split('+');
                    $http.post('/getMajorGradesAndClasses', {
                        major: major
                    }).success(function (res) {
                        if (res.status) {
                            $scope.gradesAndClasses = res.result;
                        }

                    });
                }
            });
        }
    }
}).
directive('documentViewer', function () {
    return {
        restrict: 'AE',
        link: function ($scope, element, attrs) {
            $('#documentViewer').FlexPaperViewer(
                { config : {
                    SWFFile : '/CourseWares/' + $scope.courseName + '/' + $scope.cwid + '.swf',
                    Scale : 0.6,
                    ZoomTransition : 'easeOut',
                    ZoomTime : 0.5,
                    ZoomInterval : 0.2,
                    FitPageOnLoad : true,
                    FitWidthOnLoad : false,
                    FullScreenAsMaxWindow : false,
                    ProgressiveLoading : true,
                    MinZoomSize : 0.2,
                    MaxZoomSize : 5,
                    SearchMatchAll : false,
                    InitViewMode : 'Portrait',
                    RenderingOrder : 'flash',
                    StartAtPage : '',
                    ViewModeToolsVisible : true,
                    ZoomToolsVisible : true,
                    NavToolsVisible : true,
                    CursorToolsVisible : true,
                    SearchToolsVisible : false,
                    WMode : 'window',
                    localeChain: 'en_US'
                }}
            );
            $('#documentViewer').bind('onCurrentPageChanged',function(e,pagenum){
                console.log(pagenum);
            });
        }
    }
});