angular.module('ne-calendar', [])
.controller('NeCalendarController', ['$scope', function($scope) {
}])
.directive('neCalendar', function () {
    return {
        restrict: 'E',
        // require: 'parameter', 
        scope: {
            id: '=',
            label: '@',
            placeholder: '@',
            dateBind: '=date',
            weekend: '=',
            expanded: '=',
            avaliableBind: '=avaliable',
            unavaliableBind: '=unavaliable',
            initialBind: '=initial',
            operator: '@',
            markedBind: '=marked',
            callback: '=callback'
        },
        templateUrl: window.templates.calendar,
        link: function($scope, element, attrs, $model){
            $scope.initial;
            $scope.date;
            $scope.resetDate;
            $scope.selectedDate;
            $scope.avaliable;
            $scope.unavaliable;
            $scope.marked;
            $scope.calendar = {
                firstWeekDay: null,
                weeks: [],
                dates: []
            };

            function sSize(VAR_text) {
                return (VAR_text < 10 ? '0' + VAR_text : VAR_text)
            }
            
            $scope.formatDate = function(date) {
                if(!date) {
                    return false;
                }
                if (typeof date == 'string') {
                    if(date.indexOf('T') < 0) {
                        date = date  + 'T12:00';
                    }
                    date = new Date(date);
                }
                if (typeof date == 'number') {
                    date = new Date(date);
                    return sSize(date.getUTCDate()) + '/' + sSize(date.getUTCMonth() + 1) + '/' + date.getUTCFullYear();
                }
                return sSize(date.getDate()) + '/' + sSize(date.getMonth() + 1) + '/' + date.getFullYear();
            };
            
            $scope.formatDateForm = function(date) {
                if (typeof date == 'string') {
                    if(date.indexOf('T') < 0) {
                        date = date  + 'T12:00';
                    }
                    date = new Date(date);
                }
                if (typeof date == 'number') {
                    date = new Date(date);
                    return sSize(date.getUTCFullYear()) + '-' + sSize(date.getUTCMonth() + 1) + '-' + sSize(date.getUTCDate());
                }
                return sSize(date.getFullYear()) + '-' + sSize(date.getMonth() + 1) + '-' + sSize(date.getDate());
            };
            
            $scope.operatorFunction = function(value) {
                if(!$scope.operator) {
                    return true;
                }
                let a = $scope.formatDateForm($scope.initial);
                a = a.replace(/-/g, '');
                let b = $scope.formatDateForm(value);
                b = b.replace(/-/g, '');
                return eval(b + ' ' + $scope.operator + ' ' + a);
            };

            $scope.buildCalendar = function(callback) {
                let date = new Date(JSON.parse(JSON.stringify($scope.date)));
                let today = $scope.formatDateForm(new Date());
                let selected = $scope.formatDateForm($scope.selectedDate);
                let weekLength = 6;
                let weekendDays = [0, 6];
                date.setDate(1);
                $scope.calendar.firstWeekDay = date.getDay();

                $scope.calendar.weeks = [];
                $scope.calendar.dates = [];

                while(date.getMonth() == $scope.date.getMonth()) {
                    let currDate = new Date(JSON.parse(JSON.stringify(date)));
                    
                    let formattedDate = $scope.formatDateForm(currDate);
                    let dateObj = {
                        dt: currDate.getDate(),
                        date: currDate,
                        formattedDate: formattedDate,
                        today: (formattedDate == today) ,
                        avaliable: $scope.operatorFunction(currDate),
                        marked: ($scope.marked.length > 0 ? ($scope.marked.indexOf(formattedDate) > -1 ? true : false) : false),
                        selected: (formattedDate == selected),
                        finishWeek: (currDate.getDay() == weekLength)
                    };

                    if(dateObj.avaliable && $scope.avaliable.length > 0) {
                        if($scope.avaliable.indexOf(formattedDate) > -1) {
                            dateObj.avaliable = true;
                        }else {
                            dateObj.avaliable = false;
                        }
                    }
                    
                    if(dateObj.avaliable && $scope.unavaliable.length > 0) {
                        if($scope.unavaliable.indexOf(formattedDate) > -1) {
                            dateObj.avaliable = false;
                        }
                    }
                    
                    if(dateObj.avaliable && (!$scope.weekend) && weekendDays.indexOf(currDate.getDay()) > -1) {
                        dateObj.avaliable = false;
                    }

                    $scope.calendar.dates.push(dateObj);

                    if(dateObj.finishWeek) {
                        $scope.calendar.weeks.push($scope.calendar.dates);
                        $scope.calendar.dates = [];
                    }

                    date.setDate(date.getDate() + 1);
                }

                $scope.calendar.weeks.push($scope.calendar.dates);
                $scope.calendar.dates = [];

                for (let i = 0; i < $scope.calendar.firstWeekDay; i++) {
                    $scope.calendar.weeks[0].unshift({});                    
                }
                
            };

            $scope.setMonth = function(add) {
                $scope.date.setMonth($scope.date.getMonth() + (add ? 1 : -1));
                $scope.buildCalendar();
            };

            $scope.setDate = function(item) {
                $scope.date = item.date;
                $scope.dateBind = $scope.selectedDate = new Date($scope.date);
                $scope.formattedDate = $scope.formatDate($scope.selectedDate);
                document.getElementById($scope.id + '-calendar-content-block').blur();
                $scope.buildCalendar();
                $scope.callback(item);
            };

            $scope.reset = function() {
                $scope.date = new Date($scope.resetDate);
                $scope.setDate({
                    date: $scope.date
                });
                $scope.buildCalendar();
            };

            $scope.close = function(e) {
                e.target.blur();
            };

            $scope.getFullDate = function(dt) {
                return dt.toLocaleString("pt-BR", {dateStyle: 'long'});
            };

            $scope.getMonthName = function(dt) {
                return dt.toLocaleString('default', { month: 'long' });
            };

            $scope.init = function() {
                $scope.initial      = $scope.initialBind        || new Date();
                $scope.selectedDate = $scope.dateBind           || new Date($scope.initial);
                $scope.resetDate    = new Date($scope.selectedDate);
                $scope.date         = new Date($scope.selectedDate);

                $scope.dateBind     = $scope.selectedDate;

                $scope.formattedDate = $scope.formatDate($scope.date);

                $scope.avaliable    = $scope.avaliableBind      || [];
                $scope.unavaliable  = $scope.unavaliableBind    || [];
                $scope.marked       = $scope.markedBind         || [];

                console.log($scope);

                $scope.buildCalendar();
            };

            $scope.init();
            
        }
    }
})
