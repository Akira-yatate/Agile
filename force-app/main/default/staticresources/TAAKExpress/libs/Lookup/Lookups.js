angular.module('sf-lookup', [])
.controller('LookupController', function($scope){
})
.directive('sfLookup', function($timeout){
    return {
        restrict: 'E',
        require: 'ngModel', 
        scope:{
            ngModel: '=',
            ngDisabled: '=',
            values: '=',
            filters: '=',
            searchTarget: '=',
            subtitle: '=',
            label: '=',
            placeholder: '=',
            title: '=',
            required: '=',
            remoteMethod: '@',
            returnedFields: '=',
            static: '=',
        },
        templateUrl: window.URL.lookup,
        link: function($scope, element, attrs, $model){

            $scope.isFunction = function (param) {
                return param && typeof param == 'function';
            };

            $scope.isStatic     = 'values' in attrs;
            $scope.queryResults = [];

            if ($scope.isStatic){
                $scope.queryResults = Object.assign([], $scope.values);
                $scope.searchMessage = 'Todos os resultados:'
            }

            // $scope.label        = attrs['label'];
            // $scope.placeholder  = attrs['placeholder'];
            $scope.iconColor    = attrs['iconColor'];
            $scope.iconPath     = attrs['iconPath'];
            $scope.isDisabled   = attrs['ngDisabled'];
            $scope.readonly     = attrs['readonly'] == 'true';
            $scope.recents      = attrs['recents'] == 'true';
            
            let remoteMethod = attrs['remoteMethod'] || window.URL['SEARCH_LOOKUP'];
            
            $scope.TYPING_INTERVAL = 1500;
            
            $scope.typingTimeout = void 0;
            
            $scope.defaultTitle = $scope.defaultSubtitle = function(record){
                if (typeof record == 'undefined') {
                   record = {};
                }
                if (typeof (record.name || record.Name) == 'undefined') {
                    record.name = '';
                }
                return (record.name || record.Name);
            };

            $scope.selectedRecord = void 0;
            $scope.getTitle = $scope.title || $scope.defaultSubtitle;
            $scope.getSubtitle = $scope.subtitle || $scope.defaultTitle;

            $scope.isRunning = true;
            $scope.isSearching = false;
            $scope.isTyping = false;
            $scope.isMouseDownEvent = false;
            $scope.showStaticResults = false;
            $scope.showRecentResults = false;
            $scope.recentValues = null;

            $scope.searchTerm = '';

            $scope.callUpdate = function(){
                if ($scope.typingTimeout){
                    $timeout.cancel($scope.typingTimeout);
                }

                let interval = $scope.isStatic ? 0 : $scope.TYPING_INTERVAL;

                if ($scope.searchTerm){

                    if (!$scope.isStatic){
                        $scope.queryResults = [];
                        $scope.searchMessage = `Pesquisando por "${$scope.searchTerm}"...`
                    }
                    
                    $scope.typingTimeout = $timeout(function(){
                        if (!$scope.isStatic){
                            $scope.query();
                        } else {
                            $scope.filterByUserInput();
                        }
                    }, interval);

                    $scope.isSearching = true;
                    
                } else {
                    $scope.isSearching = false;    
                    
                    if ($scope.isStatic){
                        $scope.queryResults = Object.assign([], $scope.values);
                        $scope.searchMessage = $scope.queryResults.length? 'Todos os resultados:' : 'Nenhum resultado encontrado.'
                        $scope.showStaticResults = true;
                    } else if ($scope.recents) {
                        $scope.queryResults = Object.assign([], $scope.recentValues);
                        if ($scope.queryResults.length > 0) {
                            $scope.searchMessage = $scope.queryResults.length ? `Exibindo resultados recentes` : `Nenhum resultado recente encontrado.`
                            $scope.showRecentResultsResults = true;                            
                        }
                    }
                }
            };

            $scope.filterByUserInput = function(){
                let filterFields = ($scope.searchTarget || []).concat('name');

                if ($scope.values){
                    $scope.queryResults = $scope.values.filter(a => {
                        for(let filter of filterFields){
                            if (a[filter] && a[filter].toString().toLowerCase().includes($scope.searchTerm.toLowerCase())) {
                                return true;
                            }
                        }
                    });
                }
                $scope.searchMessage = $scope.queryResults && $scope.queryResults.length ? `Exibindo resultados para: "${$scope.searchTerm}"` : `Nenhum resultado encontrado para "${$scope.searchTerm}".`
                $scope.isSearching = false;
            };

            $scope.filterRecentsByUserInput = function () {
                let filterFields = ($scope.searchTarget || []).concat('name');

                if ($scope.recentValues) {
                    $scope.queryResults = $scope.recentValues.filter(a => {
                        for (let filter of filterFields) {
                            if (a[filter] && a[filter].toString().toLowerCase().includes($scope.searchTerm.toLowerCase())) {
                                return true;
                            }
                        }
                    });
                }
                if (!$scope.queryResults || !$scope.queryResults.length) {
                    $scope.query();
                    return false
                }
                $scope.searchMessage = $scope.queryResults && $scope.queryResults.length ? `Exibindo resultados para: "${$scope.searchTerm}"` : `Nenhum resultado encontrado para "${$scope.searchTerm}".`
                $scope.isSearching = false;
            };

            $scope.query = function(){
                callLookupRemoteAction(remoteMethod, {
                    searchTerm: $scope.searchTerm,
                    tableName:  attrs['object'],
                    filters:    $scope.filters,
                    searchTarget: $scope.searchTarget,
                    returnedFields: $scope.returnedFields,
                    
                }, function(result, event){

                    console.log(event);

                    if (event.status) {
                        if (!result.hasErrors) {
                            $scope.isSearching      = false;
                            $scope.searchMessage    = result.length? `Exibindo resultados para: "${$scope.searchTerm}"` : `Nenhum resultado encontrado para "${$scope.searchTerm}".`
                            $scope.queryResults     = result;
                            $scope.$apply();
                        } else {
                            $scope.$apply();
                            Log.fire(result, {
                                code: '4489'
                            });
                        }
                    } else {
                        $scope.$apply();
                        Log.fire(event, {
                            code: '4498'
                        });
                    }

                })
            };
            
            $scope.queryRecents = function(){
                $scope.isSearching = true;
                callLookupRemoteAction(remoteMethod, {
                    searchTerm: $scope.searchTerm,
                    tableName:  attrs['object'],
                    filters:    $scope.filters,
                    searchTarget: $scope.searchTarget,
                    orderByField: 'LastViewedDate',
                    limitQuery: '10',
                    returnedFields: $scope.returnedFields,
                    
                }, function(result, event){

                    console.log(event);
                    $scope.isSearching = false;

                    if (event.status) {
                        if (!result.hasErrors) {
                            if (result.length > 0) {
                                $scope.showRecentResults    = true;
                                $scope.searchMessage        = result.length? `Exibindo resultados recentes` : `Nenhum resultado recente encontrado.`
                                $scope.queryResults         = result;
                                $scope.recentValues         = result.slice();                                
                            }
                            $scope.$apply();
                        } else {
                            $scope.$apply();
                            Log.fire(result, {
                                code: '4487'
                            });
                        }
                    } else {
                        $scope.$apply();
                        Log.fire(event, {
                            code: '4497'
                        });
                    }

                })
            };

            $scope.preventBlur = function(){
                $scope.isMouseDownEvent = true;
            };

            $scope.selectRecord = function(record){
                $scope.selectedRecord = record;
                $scope.isSelected = true;

                $scope.isMouseDownEvent = false;

                $model.$setViewValue(record);
                $model.$render();
            };  

            $scope.startSearch = function(){
                $scope.isTyping = true;
            };
            
            $scope.stopSearch = function(){
                $scope.isTyping = false;
                $scope.queryResults = [];
                if ($scope.typingTimeout){
                    $timeout.cancel($scope.typingTimeout);
                }
                $scope.searchTerm = '';
            };

            $scope.reset = function(){
                $scope.searchTerm = '';
                $scope.isTyping = false;
                $scope.isSelected = false;
                $scope.queryResults = [];
                $scope.showStaticResults = false;
                $scope.showRecentResults = false;

                $model.$setViewValue(null);
                $model.$render();
            };

            element.bind('focusout', function(e){
                if (!$scope.isMouseDownEvent){
                    $scope.isSearching = false;
                    $scope.reset();
                    $scope.$apply();
                }
            });
            
            element.bind('focusin', function(e){
                if ($scope.isStatic) {
                    $scope.queryResults = $scope.values.filter(a => a.name.toLowerCase().includes($scope.searchTerm.toLowerCase()));
                    $scope.searchMessage = $scope.queryResults.length ? ($scope.isStatic ? 'Todos os resultados:' : 'Resultados Recentes') : 'Não foram encontrados resultados.';
                    $scope.showStaticResults = true;
                    $scope.$apply();
                } else if ($scope.recents && !$scope.isSelected) {
                    $scope.isSearching = true;
                    $scope.$apply();
                    $scope.queryRecents();
                }
            });

            var reseting;
            $scope.$watch('ngModel', function(model){
                if (model == null && !reseting){
                    reseting = true;
                    $scope.reset();
                    reseting = false;
                } else if (model != null && !reseting){
                    reseting = true;
                    $scope.isSelected = true;
                    $scope.selectedRecord = $scope.ngModel;
                    reseting = false;
                }
            }, true);
            
            $scope.$watch('ngDisabled', function (isDisabled) {
                $scope.isDisabled = isDisabled;
            }, true);

            (function($scope){
                if ($scope.ngModel){
                    $scope.isSelected = true;
                    $scope.selectedRecord = $scope.ngModel;
                }
            })($scope)
        }
    }
})

function callLookupRemoteAction(remoteAction, queryObject, callback) {
    Visualforce.remoting.Manager.invokeAction(
        remoteAction, queryObject,
        function (result, event) {
            callback(result, event);
        }, {
            buffer: false,
            escape: true,
            timeout: 300000
        }
    );
}
