const HomeController = ['$scope', '$route', '$timeout', function (scope, route, $timeout) {
    scope.config.initialState   = true;
    scope.config.action         = '';

    scope.init = function () {
        scope.setDocumentPageTitleWrapper();
        try {
            scope.scrollTop();
        } catch (e) {
            Log.fire(null, {
                code: '204'
            });
        }
    };
}];