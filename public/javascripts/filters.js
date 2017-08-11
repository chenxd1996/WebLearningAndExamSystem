'use strict';

/* Filters */

angular.module('myApp.filters', []).filter('interpolate', ['version', function(version) {
    return function(text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    }
}]).filter('trustHtml', function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input);
    }
}).filter('courseMembersFilter', function () {
    return function (input, condition, value) {
        var result = [];
        if (value) {
            for (var i = 0; i < input.length; i++) {
                if (input[i][condition.key].toString().indexOf(value) >= 0) {
                    result.push(input[i]);
                }
            }
            return result;
        } else {
            return input
        }
    };
});
