const SprintBacklogController = ['$scope', '$route', '$routeParams', '$timeout', function (scope, route, $routeParams, $timeout) {
    scope.config.initialState   = true;
    scope.config.action         = '';

    scope.init = async function () {
        try {
            scope.scrollTop();
            scope.data.page = 'sprintBacklog';
            scope.setUrlParams();
            if(!scope.config.show.loadingPage) await scope.handleGetWorkList();
        } catch (e) {
            console.error(e);
            Log.fire(null, {
                code: 'S-204'
            });
        }
    };
}];