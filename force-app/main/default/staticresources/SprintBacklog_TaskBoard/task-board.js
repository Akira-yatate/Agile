const TaskBoardController = ['$scope', '$route', '$routeParams', '$timeout', function (scope, route, $routeParams, $timeout) {
    scope.config.initialState   = true;
    scope.config.action         = '';
    scope.loadingWorks          = true;

    scope.dropSuccessHandler = function($event,index,array){
        // array.splice(index,1);
    };

    scope.getWorkByTask = function(task) {
        return scope.data.workList.find(a => a.id == task.workId);
    };

    scope.handleGetWorkByTask = function(task) {
        return scope.getWorkByTask(task) || {};
    };
    
    scope.onDrop = function(event, task, data){
        if((!task.assignedTo || task.assignedTo.isUnassigned || !task.assignedTo.id) && (!data.member || !data.member.id)) {
            return false;
        }
        let needSave = false;
        if(!data.work) {
            data.work = scope.data.workList.find(a => a.id == task.workId);
        }
        if(!data.work || data.work.id != task.workId) {
            return false;
        }
        if(!data.work.taskList.find(a => a.id == task.id && a.status == data.status)) {
            if(data.work.id != task.workId) {
                let oldWork = scope.data.workList.find(a => a.id == task.workId);
                let index = oldWork.taskList.findIndex(a => a.id == task.id);
                oldWork.taskList.splice(index, 1);
                
                task.workId = data.work.id;
                data.work.taskList.push(task);
                needSave = true;
            }else {
                data.work.taskList.find(a => a.id == task.id).status = data.status;
                needSave = true;
            }
        }
        if(data.member && data.member.id != task.assignedTo.id) {
            data.work.taskList.find(a => a.id == task.id).assignedTo = data.member;
            needSave = true;
        }
        if(needSave) {
            task.status = data.status;
            if(data.member) {
                task.assignedTo = data.member;
            }
            scope.setTask(task);
        }
    };

    scope.lazyLoad = {
        isSetOnScrollEvent: false,
        length: 0,
        baseLimit: 10,
        limit: 10,
    };

    scope.handleLazyLoad = function () {
        let limitHelper = scope.lazyLoad.limit + scope.lazyLoad.baseLimit;
        if(limitHelper > scope.lazyLoad.length) {
            scope.lazyLoad.limit = scope.lazyLoad.length;
        }else {
            scope.lazyLoad.limit = limitHelper;
        }
    };

    scope.scrollLoading = function(elViewSelector, elViewWrapperSelector) {
        let result = $(elViewSelector).height()  -($(elViewWrapperSelector).height() + $(elViewWrapperSelector).scrollTop());
        console.log(result);
        if(result < 0) {
            scope.handleLazyLoad();
        }
    };

    scope.setBoardLazyLoad = function() {
        if(scope.lazyLoad.isSetOnScrollEvent) {
            return false;
        }
        scope.lazyLoad.length = scope.data.workList.length;
        scope.lazyLoad.limit = scope.lazyLoad.baseLimit;
        scope.setLoadingPage(false);
        if(scope.lazyLoad.limit > scope.lazyLoad.length) {
            scope.lazyLoad.limit = scope.lazyLoad.length;
        }else {
            scope.lazyLoad.isSetOnScrollEvent = true;
            $('.wrapper-board').scroll(function() {
                scope.scrollLoading('#board-table', '.wrapper-board');
                scope.$apply();
            });
        }
    };

    scope.isLast = function(work, isLastIndex) {
        if(isLastIndex) {
            let list = scope.data.workList.slice(0, scope.lazyLoad.limit);
            list = list.filter(a => a.taskList.length > 0);
            if(list) {
                let lastWork = list.slice(-1)[0];
                if(lastWork && lastWork.id == work.id) {
                    console.log('lastWork');
                    scope.setBoardLazyLoad();
                }
            }
        }
    };

    scope.init = async function () {
        try {
            scope.scrollTop();
            scope.data.page = 'taskboard';
            scope.setUrlParams();
            if(!scope.config.show.loadingPage) await scope.handleGetWorkList();
        } catch (e) {
            console.error(e);
            Log.fire(null, {
                code: 'T-204'
            });
        }
    };

    scope.initList = function() {
        let list = scope.data.workList.filter(a => a.taskList.length > 0);
        if(list.length == 0) {
            scope.setBoardLazyLoad();
        }
    };
}];