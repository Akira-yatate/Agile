const AnalyticsController = ['$scope', '$route', '$timeout', function (scope, route, $timeout) {
  scope.config.initialState = true;
  scope.config.action = '';

  scope.init = function () {
    try {
      scope.scrollTop();
      scope.data.page = 'analytics';
      scope.setLoadingPage(false);
      scope.setUrlParams();
    } catch (e) {
      Log.fire(null, {
        code: 'A-0204'
      });
    }
  };
}];