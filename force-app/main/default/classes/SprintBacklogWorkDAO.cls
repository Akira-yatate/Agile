// public with sharing class WorkDAO implements IWorkDAO {
public with sharing class SprintBacklogWorkDAO implements SprintBacklogIWorkDAO {
    public AgileWork__c castingObject(SObject obj) {
        return (AgileWork__c) obj;
    }


    public Schema.DescribeFieldResult getTaskStatusDescribeFieldResult() {
        return AgileTask__c.Status__c.getDescribe();
    }

    public Schema.DescribeFieldResult getTaskClassificationDescribeFieldResult() {
        return AgileTask__c.Classification__c.getDescribe();
    }

    public Schema.DescribeFieldResult getWorkStatusDescribeFieldResult() {
        return AgileWork__c.Status__c.getDescribe();
    }

    public List<AgileWork__c> getWorkList(String sprintId) {
        return [
            SELECT  Id, Name,WorkCode__c,
                    Status__c, toLabel(Status__c) StatusLabel, Sprint__r.name, AgileEpic__r.Release__r.name, AgileEpic__r.name, BaPoints__c,
                    RemainingBaPoints__c,
                    SprintRank__c,
                    (
                        SELECT  Id, Name, RemainingEffort__c, Work__c, Code__c, EstimatedEffort__c,
                                Status__c, toLabel(Status__c) StatusLabel,
                                RecordTypeId, RecordType.DeveloperName, RecordType.Name,
                                AssignedTo__c, AssignedTo__r.AgileResource__r.AgileUser__r.Name, AssignedTo__r.AgileResource__r.AgileUser__r.FullPhotoUrl
                                , AssignedTo__r.Name
                                , Sprint__c
                                , Classification__c, toLabel(Classification__c) ClassificationLabel
                                , TestedWithBug__c
                            FROM  Tasks__r
                        ORDER BY  Name
                    ) 
                FROM  AgileWork__c
                WHERE  Sprint__c = :sprintId
            ORDER BY  SprintRank__c NULLS LAST, Name
        ];
    }
    public List<AgileWork__c> getWorkList(String sprintId, String teamId) {
        return [
            SELECT  Id, Name,WorkCode__c,
                    Status__c, toLabel(Status__c) StatusLabel, Sprint__r.name, AgileEpic__r.Release__r.name, AgileEpic__r.name, BaPoints__c,
                    RemainingBaPoints__c,
                    SprintRank__c,
                    (
                        SELECT  Id, Name, RemainingEffort__c, Work__c, Code__c, EstimatedEffort__c,
                                Status__c, toLabel(Status__c) StatusLabel,
                                RecordTypeId, RecordType.DeveloperName, RecordType.Name,
                                AssignedTo__c, AssignedTo__r.AgileResource__r.AgileUser__r.Name, AssignedTo__r.AgileResource__r.AgileUser__r.FullPhotoUrl
                                , AssignedTo__r.Name
                                , Sprint__c
                                , Classification__c, toLabel(Classification__c) ClassificationLabel
                                , TestedWithBug__c
                            FROM  Tasks__r
                        ORDER BY  Name
                    ) 
                FROM  AgileWork__c
                WHERE  Sprint__c = :sprintId OR (Sprint__c = null AND Team__c = :teamId)
            ORDER BY  SprintRank__c NULLS LAST, Name
        ];
    }

    public Map<String, AgileWork__c> getWorkByIdsList(List<String> workIds) {
        return new Map<String, AgileWork__c>([
            SELECT  Id, Name,WorkCode__c,
                    Status__c, toLabel(Status__c) StatusLabel, Sprint__r.name, AgileEpic__r.Release__r.name, AgileEpic__r.name, BaPoints__c,
                    RemainingBaPoints__c,
                    SprintRank__c,
                    (
                        SELECT  Id, Name, RemainingEffort__c, Work__c, Code__c, EstimatedEffort__c,
                                Status__c, toLabel(Status__c) StatusLabel,
                                RecordTypeId, RecordType.DeveloperName, RecordType.Name,
                                AssignedTo__c, AssignedTo__r.AgileResource__r.AgileUser__r.Name, AssignedTo__r.AgileResource__r.AgileUser__r.FullPhotoUrl
                                , AssignedTo__r.Name
                                , Sprint__c
                                , Classification__c, toLabel(Classification__c) ClassificationLabel
                                , TestedWithBug__c
                            FROM  Tasks__r
                        ORDER BY  Name
                    ) 
                FROM  AgileWork__c
                WHERE  Id IN :workIds
            ORDER BY  SprintRank__c NULLS LAST, Name
        ]);
    }

    public RemotingResult setSprint(SprintBacklogWorkController.SprintData request) {
        RemotingResult response;
        Savepoint sp = Database.setSavepoint();
        try {
            response = new RemotingResult();

            Set<Id> wkIdSet = new Set<Id>();
            for(SprintBacklogWorkController.WorkData wk : request.workSprintList){
                wkIdSet.add(wk.id);
            }            
            for(SprintBacklogWorkController.WorkData wk : request.workBacklogList){
                wkIdSet.add(wk.id);
            }
			System.debug('wkIdSet ' + wkIdSet);
            Map<Id, AgileWork__c> SprintBacklogMap = new Map<Id, AgileWork__c>([SELECT id, BaPoints__c FROM AgileWork__c WHERE Id IN : wkIdSet]);
            
            integer position = 0;
            List<AgileWork__c> wkList = new List<AgileWork__c>();
            for(SprintBacklogWorkController.WorkData wk : request.workSprintList){
                Decimal storys = SprintBacklogMap.get(wk.id).BaPoints__c != null ? SprintBacklogMap.get(wk.id).BaPoints__c : 0;
				System.debug('request.id ' + request.id);
                wkList.add(new AgileWork__c(Id = wk.id, Sprint__c = request.id, BaPoints__c = storys, SprintRank__c = position));
                position++;
            }
            
            position = 0;
            for(SprintBacklogWorkController.WorkData wk : request.workBacklogList){
                Decimal storys = SprintBacklogMap.get(wk.id).BaPoints__c != null ? SprintBacklogMap.get(wk.id).BaPoints__c : 0;
                wkList.add(new AgileWork__c(Id = wk.id, Sprint__c = null, BaPoints__c = storys, SprintRank__c = position));
                position++;
            }
			
            update wkList;
            response.setMessage(request.id);
        } catch (Exception e) {
            Database.rollback(sp);
            response = new RemotingResult(e);
        }
        return response;
    }

    public RemotingResult setWork(SprintBacklogWorkController.WorkData request) {
        RemotingResult response;
        Savepoint sp = Database.setSavepoint();
        try {
            response = new RemotingResult();
            AgileWork__c work = [
                SELECT  Id
                    FROM  AgileWork__c 
                    WHERE  Id = :request.id
            FOR UPDATE
            ];
            work.Status__c    = request.status.key;
            work.RemainingBaPoints__c  = request.remainingPoint;
            update work;
            response.setMessage(work.Id);
        } catch (Exception e) {
            Database.rollback(sp);
            response = new RemotingResult(e);
        }
        return response;
    }

    public RemotingResult setTask(SprintBacklogWorkController.TaskData request) {
        RemotingResult response;
        Savepoint sp = Database.setSavepoint();
        try {
            response = new RemotingResult();
            AgileTask__c task = [
                SELECT  Id, Name, Description__c, 
                    EstimatedEffort__c, RemainingEffort__c, Work__c 
                    FROM  AgileTask__c 
                    WHERE  Id = :request.id 
            FOR UPDATE
            ];
            task.Status__c             = request.status.key;
            task.Classification__c     = request.classification != null ? request.classification.key : null;
            task.RemainingEffort__c    = request.remainingHours;
            task.TestedWithBug__c      = request.testedWithBug;
            task.EstimatedEffort__c    = request.initialHours;
            task.AssignedTo__c         = request.assignedTo != null ? request.assignedTo.id : null;

            if(String.isBlank(request.workId)) {
                request.workId = task.Work__c;
            }

            //agf_ADM_TaskTriggerHandler.run = false;
            if(task.Work__c == request.workId) {
                update task;
                response.setMessage(task.Id);
            }else {
                AgileTask__c taskNew    = task.clone(false);
                taskNew.Work__c        = request.workId;
                insert taskNew;
                delete task;
                response.setMessage(taskNew.Id);
            }
            //agf_ADM_TaskTriggerHandler.run = true;

        } catch (Exception e) {
            Database.rollback(sp);
            response = new RemotingResult(e);
        }
        return response;
    }
}