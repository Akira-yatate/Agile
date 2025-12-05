const MainController = ['$scope', '$http', '$sce', '$route', '$routeParams', '$location', '$timeout', function (scope, http, $sce, $route, $routeParams, $location, $timeout) {
    scope.origin = window.location.origin;
    scope.templates = window.templates;
    scope.CSS = window.CSS;
    scope.config = {
        show: {
            header: function () {
                return true;
            },
            content: function () {
                return true;
            },
            footer: function () {
                return false;
            },
            loading: false,
            defaultLoading: false,
        },
        placeholder: {
            length: new Array(30)
        },
        title: '',
        action: '',
        initialState: true
    };

    scope.show = {
        modalCnpj: false
    };

    // DATA CONSTRUCTOR
    scope.user                  = userData.data;
    scope.taskStatusList        = statusListData.task;
    scope.classificationList    = statusListData.classification;
    scope.workStatusList        = statusListData.work;
    scope.COMPLETED_STATUS      = statusListData.taskCompletedStatus;

    scope.menu = {
        active: ''
    };

    scope.isMenuOpen = false;

    scope.openMenu = function () {
        scope.isMenuOpen = true;
        $('.sidenav').stop().animate({
            scrollTop: 0
        }, 500, 'swing');
    };

    scope.closeMenu = function () {
        scope.isMenuOpen = false;
        $('.sidenav').stop().animate({
            scrollTop: 0
        }, 500, 'swing');
    };

    scope.historyBack = historyBack;
    scope.formatDate = formatDate;
    scope.formatDateForm = formatDateForm;
    scope.formatDateTimeForm = formatDateTimeForm;
    scope.formatDateCustom = formatDateCustom;
    scope.formatDateBurndown = formatDateBurndown;
    scope.formatDateMonth = formatDateMonth;
    scope.formatPrice = formatPrice;
    scope.formatNumber = formatNumber;
    scope.base = {};
    scope.data = {
        burndownData: null,
        capacityData: null,
        selectedTeam: null,
        selectedSprint: null,
        selectedMember: null,
        selectedVision: null,
        link: {
            work: '/lightning/o/AgileWork__c/new?useRecordTypeCheck=1',
            task: '/lightning/o/AgileTask__c/new?useRecordTypeCheck=1'
        },
        visionList: [
            {
                id: 'work',
                name: 'Work'
            },
            {
                id: 'member',
                name: 'Recurso'
            },
        ],
        sprintTaskList: [],
        calendar: {
            label: 'Data de entrega',
            callbackNeverFire: true,
            date: null,
            avaliable: null,
            unavaliable: null,
            weekend: false,
            marked: null,
            initial: new Date(),
            operator: '>=',
            callback: function (item) {
                scope.data.calendar.callbackNeverFire = false;
            }
        }
    };
    
    scope.data.showAloneWith= false;
    scope.data.showAloneWithout= false;
    scope.data.workSprint = {};
    scope.data.workBacklog = {};
    scope.data.dataWorksMap = {};

    scope.ngBind = {
        filterText: '',
        filterChange: function () {},
        actionOpen: false,
        filterOpened: false,
        openFilter: function (open) {
            scope.ngBind.filterOpened = open;
            scope.ngBind.actionOpen = open;
            if (open) {
                $('.header-input').focus();
            } else {
                scope.ngBind.filterText = null;
            }
        }
    };

    scope.scrollTop = function () {
        $('html, body').stop().animate({
            scrollTop: 0
        }, 500, 'swing');
    }

    scope.config.title = '';
    
    scope.setLoadingPage = function(isLoading) {
        scope.config.show.loadingPage = isLoading;
        console.log('loading => ', scope.config.show.loadingPage)
    };

    scope.setDocumentPageTitleWrapper = function (title) {
        setDocumentPageTitle((title ? title : 'Nèscara Project'), '', (title ? ' | Nèscara Project' : ''));
    };

    scope.isCompletedStatus = function (status) {
        return status == scope.COMPLETED_STATUS;
    };

    scope.getHoursByStatus = function (status, returnFormatted) {
        let hours = 0;
        if (!scope.isCompletedStatus(status)) {
            if (scope.data.workList) {
                let sprintTaskList = scope.data.sprintTaskList.filter(a => a.checked);
                scope.data.workList.forEach(function (work) {
                    let list = (work.taskList || []).filter(a => a.status.key == status && (scope.data.selectedMember ? scope.data.selectedMember.id == a.assignedTo.id : true) && (sprintTaskList.find(b => b.id == null || b.id == a.sprint || (a.sprint == null && b.id == scope.data.selectedSprint.id))));
                    list.forEach(function (task) {
                        if (!isNaN(task.remainingHours)) {
                            hours += task.remainingHours;
                        }
                    });
                });
            }
        }
        if (returnFormatted) {
            if (!hours) {
                return null;
            }
            return scope.formatNumber(hours, 0) + 'h';
        }
        return hours;
    };

    scope.getHoursByWork = function (work, returnFormatted) {
        let hours = 0;
        if(!work) {
            return null;
        }
        let sprintTaskList = scope.data.sprintTaskList.filter(a => a.checked);
        (work.taskList || []).forEach(function (task) {
            if (!isNaN(task.remainingHours) && !scope.isCompletedStatus(task.status.key) && (sprintTaskList.find(b => b.id == null || b.id == task.sprint || (task.sprint == null && b.id == scope.data.selectedSprint.id)))) {
                hours += task.remainingHours;
            }
        });
        if (returnFormatted) {
            if (!hours) {
                return null;
            }
            return scope.formatNumber(hours, 0) + 'h';
        }
        return hours;
    };

    scope.handleSetSelectedSprintTask = function(item) {
        let isActiveGlobalFilter = item.checked && (item.id == null || item.id == scope.data.selectedSprint.id);
        debugger
        if(isActiveGlobalFilter) {
            if(scope.data.sprintTaskList.find(a => a.id == null && a.checked)) {
                let list = scope.data.sprintTaskList.filter(a => a.id != item.id);
                list.forEach(function(item) {
                    item.checked = false;
                });
            }
        }else if(item.checked && item.id != null && item.id != scope.data.selectedSprint.id) {
            scope.data.sprintTaskList.find(a => a.id == null).checked = false;
        }
        if(scope.data.sprintTaskList.filter(a => a.checked).length < 1) scope.data.sprintTaskList.find(a => a.id == scope.data.selectedSprint.id).checked = true
        $timeout(function () {
            $location.search('sprintTask', scope.getSprintTaskLabel());
        });
    };

    scope.getSprintName = function(id) {
        return (scope.data.sprintTaskList.find(a => a.id == id) || {}).name
    };

    scope.isFromAnotherSprint = function(task) {
        return task.sprint != null && task.sprint != scope.data.selectedSprint.id;
    };

    scope.buildSprintTaskList = function() {
        let list = [];
        if ($routeParams.sprintTask) list = $routeParams.sprintTask.split(', ');
        scope.data.sprintTaskList = [
            {
                id: null,
                name: 'Todas',
                checked: list.find(a => a == 'Todas') != null
            },
            {
                id: scope.data.selectedSprint.id,
                name: 'Sprint atual',
                checked: list.length < 1 || list.find(a => a == 'Sprint atual') != null
            }
        ];
        scope.data.workList.forEach(function(work) {
            work.taskList.forEach(function(task) {
                let sprint = scope.data.selectedTeam.sprintList.find(a => a.id == task.sprint);
                if(sprint && !scope.data.sprintTaskList.find(a => a.id == sprint.id)) {
                    scope.data.sprintTaskList.push({
                        id: sprint.id,
                        name: sprint.name,
                        checked: list.find(a => a == sprint.name) != null
                    });
                }
            });
        });
    };

    scope.getSprintTaskLabel = function() {
        let list = scope.data.sprintTaskList.filter(a => a.checked);
        let labelList = [];
        list.forEach(function(item) {
            labelList.push(item.name);
        });
        if(labelList.length < 1) labelList.push((scope.data.sprintTaskList.find(a => a.id == scope.data.selectedSprint.id) || {}).name);
        return labelList.join(', ');
    };
    
    scope.getTasks = function(taskList = [], status) {
        let sprintTaskList = scope.data.sprintTaskList.filter(a => a.checked);
        return taskList.filter(a => a.status.key == status && (sprintTaskList.find(b => b.id == null || b.id == a.sprint || (a.sprint == null && b.id == scope.data.selectedSprint.id))));
    };

    scope.getTasksQuantityByMember = function(member) {
        let tasks = 0;
        let sprintTaskList = scope.data.sprintTaskList.filter(a => a.checked);
        scope.data.workList.forEach(function(work) {
            tasks += (work.taskList.filter(a => a.assignedTo.id == member.id && (sprintTaskList.find(b => b.id == null || b.id == a.sprint || (a.sprint == null && b.id == scope.data.selectedSprint.id)))) || []).length;
        });
        return tasks;
    };

    scope.getCapacityByMember = function(member, returnFormatted) {
        if(isNaN(scope.data.selectedSprint.daysRemaining)) {
            return 0;
        }
        let hours = (scope.data.selectedSprint.totalWorkHours * parseInt(scope.data.selectedSprint.daysRemaining)) * (member.allocation / 100); 
        if (returnFormatted) {
            if (!hours) {
                return 0;
            }
            return scope.formatNumber(hours, 0) + 'h';
        }
        return hours;
    };

    scope.getHoursByMember = function (memberId, returnFormatted) {
        let hours = 0;
        scope.data.workList.forEach(function(work) {
            (work.taskList || []).forEach(function (task) {
                if (!isNaN(task.remainingHours) && task.assignedTo.id == memberId) {
                    hours += task.remainingHours;
                }
            });
        });
        if (returnFormatted) {
            if (!hours) {
                return null;
            }
            return scope.formatNumber(hours, 0) + 'h';
        }
        return hours;
    };

    scope.getDaysRemaining = function () {
        if (!scope.data.selectedSprint) {
            return '';
        }
        return scope.data.selectedSprint.daysRemaining + (isNaN(scope.data.selectedSprint.daysRemaining) ? '' : ' dias restantes');
    };

    scope.handleCreateNewWork = function () {
        if (sforce && sforce.one) {
            sforce.one.createRecord('agf__ADM_Work__c', null, {
                agf__Sprint__c: scope.data.selectedSprint.id,
                agf__Scrum_Team__c: scope.data.selectedTeam.id,
            });
        }
    };

    scope.handleCreateNewTask = function (work, status) {
        if (sforce && sforce.one) {
            sforce.one.createRecord('agf__ADM_Task__c', null, {
                agf__Status__c: status.key,
                agf__Work__c: work.id,
            });
        }
    };

    scope.handleCreateNewTaskByMember = function (member, status) {
        if (sforce && sforce.one) {
            sforce.one.createRecord('agf__ADM_Task__c', null, {
                agf__Status__c: status.key,
                agf__Assigned_To__c: member.id,
            });
        }
    };

    scope.handleEditWork = function (work) {
        if (sforce && sforce.one) {
            sforce.one.editRecord(work.id);
        }
    };

    scope.handleEditTask = function (task) {
        if (sforce && sforce.one) {
            sforce.one.editRecord(task.id);
        }
    };

    scope.workRemoteActionTimestamp = {};
    scope.setWork = async function (work) {
        try {
            return await new Promise(function (resolve) {
                try {
                    let workData = angular.fromJson(angular.toJson(work));
                    delete workData.checked;
                    delete workData.focus;
                    delete workData.taskList;
                    delete workData.debounceSetWork;
                    let remoteActionTimestamp = (new Date()).getTime();
                    scope.workRemoteActionTimestamp[work.id] = remoteActionTimestamp;
                    callRemoteAction('SprintBacklogController.setWork', workData, async function (result, event) {
                        if (remoteActionTimestamp != scope.workRemoteActionTimestamp[work.id]) {
                            return false;
                        }
                        delete scope.workRemoteActionTimestamp[work.id];
                        if (event) {
                            if (event.statusCode != 200) {
                                scope.loadingWorks = false;
                                scope.$apply();
                                resolve(event);
                                console.error(event)
                                Log.fire(event, {
                                    code: '283'
                                });
                                return false;
                            }
                            if (!result.hasError) {
                                work.id = result.message;
                                scope.$apply();
                                resolve(result);
                            } else {
                                scope.$apply();
                                resolve(result);
                                Log.fire(result, {
                                    code: '289'
                                });
                            }
                        } else {
                            console.error(event)
                            scope.$apply();
                            resolve(event);
                            Log.fire(event, {
                                code: '284'
                            });
                        }
                    });
                } catch (e) {
                    console.error(e);
                    scope.$apply();
                    resolve(e);
                }
            });
        } catch (e) {
            console.error(e);
        }
    };

    scope.handleSetWork = function (work) {
        $timeout(function () {
            scope.setWork(work);
        });
    };

    scope.taskRemoteActionTimestamp = {};
    scope.setTask = async function (task) {
        try {
            scope.data.capacityData = null;
            return await new Promise(function (resolve) {
                try {
                    if (scope.isCompletedStatus(task.status.key)) {
                        task.remainingHours = 0;
                    }
                    if(!task.remainingHours) {
                        task.remainingHours = 0;
                    }
                    let taskData = angular.fromJson(angular.toJson(task));
                    if (taskData.assignedTo.isUnassigned || !taskData.assignedTo.id) {
                        delete taskData.assignedTo;
                        return false;
                    }
                    delete taskData.debounceSetTask;
                    delete taskData.checked;
                    delete taskData.status.checked;
                    delete taskData.focus;
                    delete taskData.assignedTo.allocation;
                    delete taskData.assignedTo.role;
                    delete taskData.assignedTo.checked;
                    delete taskData.assignedTo.type;
                    let remoteActionTimestamp = (new Date()).getTime();
                    scope.taskRemoteActionTimestamp[task.id] = remoteActionTimestamp;
                    callRemoteAction('SprintBacklogController.setTask', taskData, async function (result, event) {
                        if (remoteActionTimestamp != scope.taskRemoteActionTimestamp[task.id]) {
                            return false;
                        }
                        delete scope.taskRemoteActionTimestamp[task.id];
                        if (event) {
                            if (event.statusCode != 200) {
                                scope.loadingWorks = false;
                                scope.$apply();
                                resolve(event);
                                console.error(event)
                                Log.fire(event, {
                                    code: '283'
                                });
                                return false;
                            }
                            if (!result.hasError) {
                                let work = (scope.data.workList.find(a => a.id == task.workId) || {});
                                (work.taskList.find(a => a.id == task.id) || {}).remainingHours = task.remainingHours;
                                (work.taskList.find(a => a.id == task.id) || {}).id             = result.message;
                                (work.taskList.find(a => a.id == task.id) || {}).checked        = !(scope.taskStatusList.find(a => a.key == task.status.key) || {}).checked;
                                scope.getBurndown();
                                scope.buildCapacityData();
                                scope.$apply();
                                resolve(result);
                            } else {
                                scope.$apply();
                                resolve(result);
                                Log.fire(result, {
                                    code: '289'
                                });
                            }
                        } else {
                            console.error(event)
                            scope.$apply();
                            resolve(event);
                            Log.fire(event, {
                                code: '284'
                            });
                        }
                    });
                } catch (e) {
                    console.error(e);
                    scope.$apply();
                    resolve(result);
                    resolve(e);
                }
            });
        } catch (e) {
            console.error(e);
        }
    };

    scope.handleSetTask = function (task) {
        $timeout(function () {
            scope.setTask(task);
        });
    };

    scope.initChart = function (elSelector = '.ct-chart') {
        if (!scope.data.burndownData) {
            return false;
        }
        var options = {
            series: [{
                name: 'Horas restantes',
                type: 'area',
                data: scope.data.burndownData.actual
            }, {
                name: 'Desempenho ideal',
                type: 'line',
                data: scope.data.burndownData.baseLine
            }],
            chart: {
                height: 350,
                type: 'line',
                toolbar: {
                    show: true,
                    offsetX: 0,
                    offsetY: 0,
                    tools: {
                        download: false,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                        reset: false,
                        customIcons: []
                    },
                    // export: {
                    //     csv: {
                    //         filename: 'Burndown - ' + scope.data.selectedSprint.name + ' - ' + scope.formatDateTimeForm(new Date()),
                    //         columnDelimiter: ',',
                    //         headerCategory: 'Data',
                    //         headerValue: 'Horas',
                    //         dateFormatter(timestamp) {
                    //             return new Date(timestamp).toDateString()
                    //         }
                    //     }
                    // },
                },
            },
            stroke: {
                curve: 'straight',
                width: 2,
            },
            fill: {
                type: 'solid',
                opacity: [1, 1],
            },
            labels: scope.data.burndownData.label,
            markers: {
                size: 0
            },
            title: {
                text: 'Burndown'
              },
            colors: ['#1AA1E0', '#00E396'],
            yaxis: {
                labels: {
                  formatter: function (val) {
                    if (typeof val !== 'undefined' && val != null) {
                        if(val % 1 != 0) {
                            return val.toFixed(1) + 'h';
                        }
                        return val + 'h';
                    }
                    return '0h'
                  }
                }
              },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (y) {
                        if (typeof y !== 'undefined' && y != null) {
                            return y.toFixed(0) + ' horas';
                        }
                        return y;
                    }
                }
            },
        };

        var chart = new ApexCharts(document.querySelector(elSelector), options);
        chart.render();
    };

    scope.initCapacityChart = function (elSelector = '.ct-chart-capacity') {
        if (!scope.data.capacityData) {
            return false;
        }
        var options = {
            series: [{
            name: 'Atribuído',
            data: scope.data.capacityData.hours
          }, {
            name: 'Disponível',
            data: scope.data.capacityData.under
          }, {
            name: 'Excedido',
            data: scope.data.capacityData.over
          }],
            chart: {
            type: 'bar',
            height: 350,
            stacked: true,
            toolbar: {
                tools: {
                    download: false,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false,
                    customIcons: []
                },
            //     export: {
            //       csv: {
            //           filename: 'Capacidade - ' + scope.data.selectedSprint.name + ' - ' + scope.formatDateTimeForm(new Date()),
            //           columnDelimiter: ',',
            //           headerCategory: 'Recurso',
            //           headerValue: 'Horas',
            //           dateFormatter(timestamp) {
            //               return new Date(timestamp).toDateString()
            //           }
            //       }
            //   },
            }
          },
          plotOptions: {
            bar: {
              horizontal: true,
            },
          },
          stroke: {
            width: 1,
            colors: ['#fff']
          },
          title: {
            text: 'Capacidade'
          },
          colors: ['#1AA1E0', '#00E396', '#FF4560'],
          xaxis: {
            categories: scope.data.capacityData.label,
            labels: {
              formatter: function (val) {
                if (typeof val !== 'undefined' && val != null) {
                    if(val % 1 != 0) {
                        return val.toFixed(1) + 'h';
                    }
                    return val + 'h';
                }
                return '0h'
              }
            }
          },
          yaxis: {
            title: {
              text: undefined
            },
          },
          tooltip: {
            y: {
              formatter: function (val) {
                return val + 'h'
              }
            },
          },
          fill: {
            opacity: 1
          },
          legend: {
            position: 'top',
            horizontalAlign: 'left',
            offsetX: 40
          },
          };

        var chart = new ApexCharts(document.querySelector(elSelector), options);
        chart.render();
    };

    scope.buildBurndownData = function () {
        scope.data.burndownData = {
            label: [],
            actual: [],
            baseLine: [],
        };
        let today = scope.formatDateForm(new Date());
        scope.data.burndown.forEach(function (item) {
            scope.data.burndownData.label.push(scope.formatDateBurndown(item.label));
            scope.data.burndownData.actual.push((item.actual != null && item.label <= today ? item.actual.toFixed(2) : null));
            scope.data.burndownData.baseLine.push((item.baseLine != null ? item.baseLine.toFixed(2) : null));
        });
    };

    scope.buildInternalBurndownData = function () {
        let list = scope.getTasksByMemberType('Internal');
        // scope.data.internalBurndownData = {
        //     label: [],
        //     actual: [],
        //     baseLine: [],
        // };
        // let today = scope.formatDateForm(new Date());
        // list.forEach(function (item) {
        //     scope.data.internalBurndownData.label.push(scope.formatDateBurndown(item.label));
        //     scope.data.internalBurndownData.actual.push((item.actual != null && item.label <= today ? item.actual.toFixed(2) : null));
        //     scope.data.internalBurndownData.baseLine.push((item.baseLine != null ? item.baseLine.toFixed(2) : null));
        // });
    };

    scope.buildCapacityData = function () {
        scope.buildInternalBurndownData();
        scope.data.capacityData = {
            label:      [],
            hours:      [],
            under:      [],
            over:       [],
            capacity:   [],
        };
        scope.data.selectedTeam.memberList.forEach(function (item) {
            let capacity    = scope.getCapacityByMember(item, false);
            let hours       = scope.getHoursByMember(item.id, false);
            let under       = capacity - hours;
            let over        = hours - capacity;
            if(over > 0) {
                hours = hours - over;
            }
            scope.data.capacityData.label.push(item.name);
            scope.data.capacityData.hours.push((hours != null && hours > 0 ? hours.toFixed(2) : null));
            scope.data.capacityData.under.push((under != null && under > 0 ? under.toFixed(2) : null));
            scope.data.capacityData.over.push((over != null && over > 0 ? over.toFixed(2) : null));
            scope.data.capacityData.capacity.push((capacity != null && capacity > 0 ? capacity.toFixed(2) : null));
        });
    };

    scope.getBurndown = async function () {
        scope.setDocumentPageTitleWrapper(scope.data.selectedSprint.name);
        scope.data.burndownData = null;
        try {
            return await new Promise(function (resolve) {
                try {
                    scope.loadingBurndown = true;
                    callRemoteAction('SprintBacklogController.getBurndown', scope.data.selectedSprint.id, async function (result, event) {
                        if (event) {
                            if (event.statusCode != 200) {
                                scope.loadingBurndown = false;
                                resolve(event);
                                scope.$apply();
                                console.error(event)
                                Log.fire(event, {
                                    code: '283'
                                });
                                return false;
                            }
                            if (!result.hasError) {
                                scope.loadingBurndown = false;
                                scope.data.burndown = result.data;
                                scope.buildBurndownData();
                                resolve(result);
                                scope.$apply();
                            } else {
                                scope.loadingBurndown = false;
                                resolve(result);
                                scope.$apply();
                                Log.fire(result, {
                                    code: '289'
                                });
                            }
                        } else {
                            console.error(event)
                            scope.loadingWorks = false;
                            resolve(result);
                            scope.$apply();
                            Log.fire(event, {
                                code: '284'
                            });
                        }
                    });
                } catch (e) {
                    console.error(e);
                    scope.loadingWorks = false;
                    scope.$apply();
                    resolve(e);
                }
            });
        } catch (e) {
            console.error(e);
            scope.loadingWorks = false;
        }
    };

    scope.getExternalUrl = function() {
        let params = $location.search();
        let url = [];
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                url.push(key + '=' + params[key]);
                
            }
        }
        return '/apex/SprintBacklog#/?'+url.join('&');
    };

    scope.setSeachCollapse = function() {
        console.log(scope.data.search);
        $location.search('search', scope.data.search);
        if(scope.data.workList && scope.data.search) {
            let searchTerm = scope.data.search.toLowerCase();
            scope.data.workList.forEach(function(work) {
                if((work.taskList.filter(task => task.name.toLowerCase().includes(searchTerm) || task.subject.toLowerCase().includes(searchTerm)).length > 0)) {
                    work.checked = true;
                }else {
                    work.checked = false;
                }
            });
        }else if(scope.data.workList && !scope.data.search) {
            scope.handleSetSelectedMember();
        }
    };

    scope.handleClearSearch = function() {
        scope.data.search = null;
        scope.setSeachCollapse();
        $('#headerInputSearch').focus();
        scope.handleSetSelectedMember();
    };
    
    scope.sumVals = function(workSprint, workBacklog){
        
        scope.data.workBacklog.points     = workBacklog.sum('storyPoints');
        scope.data.workBacklog.hours      = workBacklog.sum('estimatedHours');
        scope.data.workBacklog.tasks      = workBacklog.sum('taskLength');
        scope.data.workBacklog.lengthWork = workBacklog.length;
        
        scope.data.workSprint.points     = workSprint.sum('storyPoints');
        scope.data.workSprint.hours      = workSprint.sum('estimatedHours');
        scope.data.workSprint.tasks      = workSprint.sum('taskLength');
        scope.data.workSprint.lengthWork = workSprint.length;

        scope.data.showAloneWith    = !workSprint || workSprint.length == 0;
        scope.data.showAloneWithout = !workBacklog || workBacklog.length == 0;
    }

    scope.getWorkList = async function () {
        scope.setDocumentPageTitleWrapper(scope.data.selectedSprint.name);
        scope.data.workList = [];
        scope.data.workBacklogList = [];
        scope.data.dataWorksMap = {};
        scope.data.capacityData = null;
        try {
            return await new Promise(function (resolve) {
                try {
                    scope.loadingWorks = true;
                    callRemoteAction('SprintBacklogController.getWorkList', [scope.data.selectedSprint.id, scope.data.selectedTeam.id], async function (result, event) {
                        if (event) {
                            if (event.statusCode != 200) {
                                scope.loadingWorks = false;
                                scope.$apply();
                                resolve(event);
                                console.error(event)
                                Log.fire(event, {
                                    code: '283'
                                });
                                return false;
                            }
                            if (!result.hasError) {
                                scope.loadingWorks          = false;
                                scope.data.workList         = result.data;
                                scope.data.workBacklogList  = result.dataWithoutSprint;
                                scope.sumVals(scope.data.workList, scope.data.workBacklogList);
                                scope.mapRecords();
                                scope.buildSprintTaskList();
                                scope.handleSetSelectedMember();
                                scope.initDrag();
                                if($routeParams.search) {
                                    scope.data.search = $routeParams.search;
                                    scope.setSeachCollapse();
                                }
                                scope.initCollapseCol(true, false);
                                scope.$apply();
                                resolve(result);
                            } else {
                                scope.loadingWorks = false;
                                scope.$apply();
                                resolve(result);
                                Log.fire(result, {
                                    code: '289'
                                });
                            }
                        } else {
                            console.error(event)
                            scope.loadingWorks = false;
                            scope.$apply();
                            resolve(event);
                            Log.fire(event, {
                                code: '284'
                            });
                        }
                    });
                } catch (e) {
                    console.error(e);
                    scope.loadingWorks = false;
                    scope.$apply();
                    resolve(e);
                    resolve(e);
                }
            });
        } catch (e) {
            console.error(e);
            scope.loadingWorks = false;
        }
    };

    scope.handleGetWorkList = async function() {
        scope.setLoadingPage(true);
        scope.getBurndown();
        await scope.getWorkList();
        scope.setLoadingPage(false);
        scope.$apply();
    };

    scope.handleChangeSelectedSprint = function () {
        $timeout(function () {
            $location.search('sprint', scope.data.selectedSprint.name);
            scope.handleGetWorkList();
        });
    };

    scope.handleChangeSelectedTeam = function () {
        $timeout(function () {
            if (scope.data.selectedTeam) {
                $location.search('team', scope.data.selectedTeam.name);
                if (scope.data.selectedTeam.sprintList.length > 0) {
                    let today = scope.formatDateForm(new Date());
                    scope.data.selectedSprint = scope.data.selectedTeam.sprintList.find(a => a.startDate <= today && a.endDate >= today);
                    if(!scope.data.selectedSprint) {
                        scope.data.selectedSprint = scope.data.selectedTeam.sprintList.find(a => a.startDate > today);
                    }
                    if(!scope.data.selectedSprint) {
                        scope.data.selectedSprint = (scope.data.selectedTeam.sprintList.slice(-1) || [])[0];
                    }
                }
                if (!scope.data.selectedTeam.memberList.find(a => a.id == (scope.data.selectedMember || {}).id)) {
                    scope.data.selectedMember = null;
                    scope.handleSetSelectedMember();
                    if($routeParams.search) {
                        scope.data.search = $routeParams.search;
                        scope.setSeachCollapse();
                    }
                }

            }
            scope.handleChangeSelectedSprint();
        });
    };

    scope.getTasksByMember = function(memberId, status) {
        let list = [];
        let sprintTaskList = scope.data.sprintTaskList.filter(a => a.checked);
        if(status) {
            scope.data.workList.forEach(function(work) {
                list = list.concat(work.taskList.filter(a => a.status.key == status && a.assignedTo.id == memberId && (sprintTaskList.find(b => b.id == null || b.id == a.sprint || (a.sprint == null && b.id == scope.data.selectedSprint.id)))));
            });
        }else {
            scope.data.workList.forEach(function(work) {
                list = list.concat(work.taskList.filter(a => a.assignedTo.id == memberId && (sprintTaskList.find(b => b.id == null || b.id == a.sprint || (a.sprint == null && b.id == scope.data.selectedSprint.id)))));
            });
        }
        return list;
    };

    scope.getTasksHoursByMember = function(memberId, status) {
        let taskList = [];
        let sprintTaskList = scope.data.sprintTaskList.filter(a => a.checked);
        scope.data.workList.forEach(function(work) {
            taskList = taskList.concat(work.taskList.filter(a => a.status.key == status && a.assignedTo.id == memberId && (sprintTaskList.find(b => b.id == null || b.id == a.sprint || (a.sprint == null && b.id == scope.data.selectedSprint.id)))));
        });
        let hours = 0;
        if (taskList) {
            taskList.forEach(function (task) {
                if (!isNaN(task.remainingHours)) {
                    hours += task.remainingHours;
                }
            });
        }
        return hours;
    };

    scope.getTasksByMemberWithoutStatus = function(memberId) {
        let list = [];
        let sprintTaskList = scope.data.sprintTaskList.filter(a => a.checked);
        scope.data.workList.forEach(function(work) {
            list = list.concat(work.taskList.filter(a => a.assignedTo.id == memberId && (sprintTaskList.find(b => b.id == null || b.id == a.sprint || (a.sprint == null && b.id == scope.data.selectedSprint.id)))));
        });
        return list;
    };

    scope.getTasksByMemberType = function(type) {
        let list = [];
        let usersType = scope.data.selectedTeam.memberList.filter(a => (a.type || {}).key == type);
        let sprintTaskList = scope.data.sprintTaskList.filter(a => a.checked);
        scope.data.workList.forEach(function(work) {
            list = list.concat(work.taskList.filter(a => usersType.find(b => a.assignedTo.id == b.id && (sprintTaskList.find(b => b.id == null || b.id == a.sprint || (a.sprint == null && b.id == scope.data.selectedSprint.id))))));
        });
        return list;
    };

    scope.handleSetSelectedMember = function () {
        scope.buildCapacityData();
        scope.data.workList.forEach(function(work) {
            if(!scope.data.selectedMember) {
                work.checked = true;
            }else {
                work.checked = work.taskList.filter(a => a.assignedTo.id == scope.data.selectedMember.id).length > 0;
            }
        });
        scope.data.selectedTeam.memberList.forEach(function(member) {
            member.checked = !scope.data.selectedMember || member.id == scope.data.selectedMember.id;
        });
        scope.allWorkCollapsed();
        $timeout(function () {
            $location.search('member', (scope.data.selectedMember ? scope.data.selectedMember.name : null));
        });
    };

    scope.handleSetSelectedVision = function () {
        $timeout(function () {
            $location.search('vision', (scope.data.selectedVision ? scope.data.selectedVision.name : null));
        });
    };

    scope.setUrlParams = function () {
        if (scope.data.selectedSprint) {
            $location.search('sprint', (scope.data.selectedSprint ? scope.data.selectedSprint.name : null));
        }
        if (scope.data.selectedTeam) {
            $location.search('team', (scope.data.selectedTeam ? scope.data.selectedTeam.name : null));
        }
        if (scope.data.selectedMember) {
            $location.search('member', (scope.data.selectedMember ? scope.data.selectedMember.name : null));
        }
        if (scope.data.selectedVision) {
            $location.search('vision', (scope.data.selectedVision ? scope.data.selectedVision.name : null));
        }
        if (scope.data.sprintTaskList.filter(a => a.checked).length > 0) {
            $location.search('sprintTask', scope.getSprintTaskLabel());
        }
    };

    scope.getTeamList = async function () {
        try {
            return await new Promise(function (resolve) {
                try {
                    scope.config.show.defaultLoading = true;
                    callRemoteAction('SprintBacklogController.getTeamList', async function (result, event) {
                        if (event) {
                            if (event.statusCode != 200) {
                                scope.config.show.defaultLoading = false;
                                scope.$apply();
                                resolve(event);
                                console.error(event)
                                Log.fire(event, {
                                    code: '283'
                                });
                                return false;
                            }
                            if (!result.hasError) {
                                scope.config.show.defaultLoading = false;
                                scope.data.teamList = result.data;
                                if (scope.data.teamList.length > 0) {
                                    if ($routeParams.team) {
                                        scope.data.selectedTeam = scope.data.teamList.find(a => a.name == $routeParams.team);
                                    } else {
                                        scope.data.selectedTeam = scope.data.teamList[0];
                                    }
                                    scope.data.teamList.forEach(function (team) {
                                        team.memberList.push({
                                            id: null,
                                            isUnassigned: true,
                                            name: 'Sem atribuição',
                                            photo: null,
                                            allocation: null,
                                            role: null,
                                        });
                                    });
                                    if ($routeParams.member) {
                                        scope.data.selectedMember = scope.data.selectedTeam.memberList.find(a => a.name == $routeParams.member);
                                    }
                                    if (!$routeParams.vision) {
                                        $routeParams.vision = 'Work';
                                    }
                                    scope.data.selectedVision = scope.data.visionList.find(a => a.name == $routeParams.vision);
                                    if ($routeParams.sprint) {
                                        scope.data.selectedSprint = scope.data.selectedTeam.sprintList.find(a => a.name == $routeParams.sprint);
                                        scope.handleChangeSelectedSprint();
                                    } else {
                                        scope.handleChangeSelectedTeam();
                                    }
                                }
                                scope.$apply();
                                resolve(result);
                            } else {
                                scope.config.show.defaultLoading = false;
                                scope.$apply();
                                resolve(result);
                                Log.fire(result, {
                                    code: '289'
                                });
                            }
                        } else {
                            console.error(event)
                            scope.config.show.defaultLoading = false;
                            scope.$apply();
                            resolve(event);
                            Log.fire(event, {
                                code: '284'
                            });
                        }
                    });
                } catch (e) {
                    console.error(e);
                    scope.config.show.defaultLoading = false;
                    scope.$apply();
                    resolve(e);
                }
            });
        } catch (e) {
            console.error(e);
            scope.config.show.defaultLoading = false;
        }
    };

    scope.init = async function () {
        scope.scrollTop();
        scope.setLoadingPage(true);

        if (userData.hasError) {
            Log.fire(userData, {
                code: 'U-001'
            });
        }

        await scope.getTeamList();
        $route.reload();
    };

    scope.getDefault = function (list) {
        return list.find(a => a.isDefault);
    };

    scope.handleKeyUpSetTask = function (task) {
        if (task.debounceSetTask) {
            clearTimeout(task.debounceSetTask);
        }
        task.debounceSetTask = setTimeout(function () {
            scope.setTask(task);
            scope.$apply();
        }, 1000);
    };

    scope.handleKeyUpSetWork = function (work) {
        debugger;
        if (work.debounceSetWork) {
            clearTimeout(work.debounceSetWork);
        }
        work.debounceSetWork = setTimeout(function () {
            scope.setWork(work);
            scope.$apply();
        }, 1000);
    };

    scope.setSelectBlur = function (e) {
        console.log(e);
        let stopTag = 'BODY';
        let stopClass = '-wrapper';
        let el = e.target;
        while (!el.className.includes(stopClass) && !el.tagName.includes(stopTag)) {
            el = el.parentNode;
        }
        $(el).blur();
    };

    scope.data.collapseValue = false;
    scope.collapseAll = function(collapseValue) {
        scope.data.workList.forEach(function(work) {
            work.checked = !collapseValue;
        });
        scope.data.selectedTeam.memberList.forEach(function(work) {
            work.checked = !collapseValue;
        });
    };

    scope.collapseCol = function(status, collapseValue) {
        if(scope.data.workList) {
            scope.data.workList.forEach(function(work) {
                (scope.getTasks(work.taskList, status) || []).forEach(function(task) {
                    task.checked = !collapseValue;
                });
            });
        }
    };

    scope.initCollapseCol = function(collapseValue, collapseValueForCompleted) {
        scope.taskStatusList.forEach(function(item) {
            if(scope.isCompletedStatus(item.key)) {
                item.checked = !collapseValueForCompleted;
            }else {
                item.checked = !collapseValue;
            }
        });
        scope.$apply();
        if(scope.data.workList) {
            scope.data.workList.forEach(function(work) {
                (work.taskList || []).forEach(function(task) {
                    if(scope.isCompletedStatus(task.status.key)) {
                        task.checked = collapseValueForCompleted;
                    }else {
                        task.checked = collapseValue;
                    }
                });
            });
        }
    };

    scope.allWorkCollapsed = function() {
        if(!scope.data.workList || !scope.data.workList.length) {
            return false;
        }
        scope.data.collapseValue = scope.data.workList.filter(a => a.checked).length == 0;
    };

    scope.data.collapseByMemberValue = false;
    scope.collapseAllByMember = function(collapseByMemberValue) {
        scope.data.selectedTeam.memberList.forEach(function(work) {
            work.checked = !collapseByMemberValue;
        });
    };
    
    Array.prototype.sum = function (prop) {
        var total = 0
        for ( var i = 0, _len = this.length; i < _len; i++ ) {
            total += this[i][prop]
        }
        return total
    }

    scope.mapRecords = function(){        
        scope.data.workList.forEach(function(item){
            scope.data.dataWorksMap[item.id] = item;
        })
        scope.data.workBacklogList.forEach(function(item){
            scope.data.dataWorksMap[item.id] = item;
        })
    };

    scope.filterMemberList = function(item) {
        return item.id != null;
    };

    scope.initDrag = function() {
        if(scope.data.page != 'sprintBacklog') return;
        if(scope.data.draggable) scope.data.draggable.destroy();

        scope.data.draggable = new Draggable.Sortable(document.querySelectorAll('[id^="board-table"]'), {
            draggable: '.multipicklist-item',
            delay: 0,
            mirror: {
              constrainDimensions: true
            },
            plugins: [Draggable.Plugins.SwapAnimation]
        });

        scope.workRemoteActionTimestamp = {};
        scope.data.draggable.on('sortable:stop', (evt) => {
            var objReturn = scope.getElements(evt);

            if(objReturn == null || !objReturn.workSprintList || !objReturn.workBacklogList) return;

            scope.sumVals(objReturn.workSprintList, objReturn.workBacklogList); 
            
            let workId = evt.data.dragEvent.data.source.id;
            
            scope.setSprint(workId, objReturn.workSprintList, objReturn.workBacklogList);
        });
    };

    scope.setSprint = async function (workId, workSprintList, workBacklogList) {
        try {
            return await new Promise(function (resolve) {
                try {
                    let remoteActionTimestamp = (new Date()).getTime();
                    scope.workRemoteActionTimestamp[workId] = remoteActionTimestamp;
                    callRemoteAction('SprintBacklogController.setSprint', {
                        id:                 scope.data.selectedSprint.id,
                        workSprintList:     workSprintList,
                        workBacklogList:    workBacklogList
                    }, async function (result, event) {
                        if (remoteActionTimestamp != scope.workRemoteActionTimestamp[workId]) {
                            return false;
                        }
        
                        delete scope.workRemoteActionTimestamp[workId];
        
                        if (event) {
                            if (event.statusCode != 200) {
                                scope.loadingWorks = false;
                                scope.$apply();
                                console.error(event)
                                Log.fire(event, {
                                    code: '283'
                                });
                                return false;
                            }
                            if (!result.hasError) {
                                scope.$apply();
                            } else {
                                scope.$apply();
                                Log.fire(result, {
                                    code: '289'
                                });
                            }
                        } else {
                            console.error(event)
                            scope.$apply();
                            Log.fire(event, {
                                code: '284'
                            });
                        }
                    });
                    scope.$apply();
                } catch (e) {
                    console.error(e);
                    scope.$apply();
                    resolve(e);
                }
            });
        } catch (e) {
            console.error(e);
        }
    };

    scope.getElements = function(evt){
        var elements = document.querySelectorAll('[id^="board-table"]');
        var elementsNotHide = []
        elements.forEach(function(item){
            if(!item.className.includes('ng-hide'))
                elementsNotHide.push(item);
        }, {elementsNotHide});

        scope.workId = evt.data.dragEvent.data.source.id;
        
        if(scope.data.dataWorksMap[scope.workId].finishedSprint && evt.data.oldContainer.id !=  evt.data.newContainer.id) {

            Toast.fire({
                timer: 3000,
                type: 'warning',
                title: `Histórias finalizadas não podem ser movidas para outra esteira`
            });

            scope.handleGetWorkList();
            return false;
        }

        var addMapPos = [];
        var removeMapPos = [];
        var workSprintList = [];
        var workBacklogList = [];

        for(var i=0; i<elements.length; i++){
            var containers = elements[i].id;
            for(var j=0; j<elements[i].children.length; j++){
                var item = elements[i].children[j];
                if(!item.className.includes('draggable--mirror') && 
                    !item.className.includes('draggable--original') &&
                    item.id != ''){
                        
                    if(containers.includes('add')){
                        if(!addMapPos.includes(item.id) && !removeMapPos.includes(item.id))
                            addMapPos.push(item.id);
                    }else{
                        if(!removeMapPos.includes(item.id) && !addMapPos.includes(item.id))
                            removeMapPos.push(item.id);
                    }
                }
            }
        }
        addMapPos.forEach(function(item){
            let workData = JSON.parse(JSON.stringify(scope.data.dataWorksMap[item]));
            delete workData.checked;
            delete workData.focus;
            delete workData.taskList;
            delete workData.debounceSetWork;
            workSprintList.push(workData);
        }, {workSprintList});
        
        removeMapPos.forEach(function(item){
            let workData = JSON.parse(JSON.stringify(scope.data.dataWorksMap[item]));
            delete workData.checked;
            delete workData.focus;
            delete workData.taskList;
            delete workData.debounceSetWork;
            workBacklogList.push(workData);
        }, {workBacklogList});

        return {workBacklogList : workBacklogList, workSprintList : workSprintList}
    };

    scope.getPageTitle = function() {
        let title = 'Board';
        switch(scope.data.page) {
            case 'taskboard':
                title = 'Taskboard';
            break;
            case 'analytics':
                title = 'Analytics';
            break;
            case 'sprintBacklog':
                title = 'Sprint Backlog';
            break;
        }
        return title;
    };

}];