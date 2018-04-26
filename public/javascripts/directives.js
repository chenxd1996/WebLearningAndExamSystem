angular.module('myApp.directives', []).
directive('verticalCenter', function ($window) {
    return {
        restrict: 'AE',
        link: function ($scope, element, attrs) {
            var height = element.children("div.modal-content").eq(0).height();
            element.css({
                "margin-top": ($window.innerHeight - height) / 2 * 0.8 + 'px',
                "margin-bottom": 0
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
            if ($scope.editorText)
                element.context.innerHTML = $scope.editorText;
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
directive('editor', function ($window) {
    return {
        restrict: 'AE',
        templateUrl: 'partials/editor',
        replace: true,
        link: function ($scope, element, atts) {
            var editor = $scope.editor = UE.getEditor('container');
            if ($scope.editorText)
                editor.setContent($scope.editorText);
            // 很坑，居然监听不了图片url的变化。。
            // editor.addListener('contentChange', function () {
            //     $scope.editorText = editor.getContent();
            // });
            $scope.$on('$destroy', function () {
               editor.destroy();
            });
        }
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
                    SearchMatchAll : true,
                    InitViewMode : 'Portrait',
                    RenderingOrder : 'flash',
                    StartAtPage : '',
                    ViewModeToolsVisible : true,
                    ZoomToolsVisible : true,
                    NavToolsVisible : true,
                    CursorToolsVisible : true,
                    SearchToolsVisible : true,
                    WMode : 'window',
                    localeChain: 'zh_CN'
                }}
            );

            $('#documentViewer').bind('onDocumentLoaded',function(e, totalPages){
                $scope.totalPages = totalPages;
            });

            $('#documentViewer').bind('onCurrentPageChanged',function(e,pagenum){
                if ($scope.pages.indexOf(pagenum) < 0) {
                    $scope.pages.push(pagenum);
                }
                $scope.canAdd = true;
                console.log($scope.pages);
                $scope.pageChageCount++;
            });
        }
    }
})
.directive('modalCenter', function () {
    return {
        restrict: 'AE',
        link: function ($scope, element, attrs) {
            $(".modal").css('display', 'block');
            $('.modal-dialog').css({
                'margin-top': function () {
                    var modalHeight = $('.modal').find('.modal-dialog').height();
                    return ($(window).height() / 2 - (modalHeight / 2));
                }
            });
        }
    }
});
