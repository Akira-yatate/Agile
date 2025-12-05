public with sharing class SprintBacklogWorkController {
    private SprintBacklogWorkDAO workDAO             = new SprintBacklogWorkDAO();

    public RemotingResult setWork(WorkData request) {
        return workDAO.setWork(request);
    }

    public RemotingResult setTask(TaskData request) {
        return workDAO.setTask(request);
    }

    public RemotingResult setSprint(SprintData request) {
        System.debug('Requet linha 13 ' + request);
        return workDAO.setSprint(request);
    }


    public WorkResult getWorkList(String sprintId, string teamId) {
        WorkResult response;
        try {
            response = new WorkResult();
            for(SObject work : workDAO.getWorkList(sprintId, teamId)) {
                WorkData wkData = new WorkData(workDAO.castingObject(work));
                if(wkData.hasSprint)
                    response.data.add(wkData);
                else
                    response.dataWithoutSprint.add(wkData);
            }
        } catch (Exception e) {
            response = new WorkResult(e);
        }
        return response;
    }

    public StatusResult getStatusList() {
        StatusResult response;
        try {
            response = new StatusResult();
            Schema.DescribeFieldResult fieldResult = workDAO.getTaskStatusDescribeFieldResult();
            List<Schema.PicklistEntry> picklistEntryList = fieldResult.getPicklistValues();
            for(Schema.PicklistEntry entry : picklistEntryList) {
                response.task.add(new PicklistData(entry.getValue(), entry.getLabel()));
            }

            fieldResult = workDAO.getTaskClassificationDescribeFieldResult();
            picklistEntryList = fieldResult.getPicklistValues();
            for(Schema.PicklistEntry entry : picklistEntryList) {
                response.classification.add(new PicklistData(entry.getValue(), entry.getLabel()));
            }

            fieldResult = workDAO.getWorkStatusDescribeFieldResult();
            picklistEntryList = fieldResult.getPicklistValues();
            for(Schema.PicklistEntry entry : picklistEntryList) {
                response.work.add(new PicklistData(entry.getValue(), entry.getLabel()));
            }
            response.taskCompletedStatus = 'Completed';
        } catch (Exception e) {
            response = new StatusResult(e);
        }
        return response;
    }

    public class StatusResult extends RemotingResult {
        public List<PicklistData> task              = new List<PicklistData>();
        public List<PicklistData> classification    = new List<PicklistData>();
        public List<PicklistData> work              = new List<PicklistData>();
        public String taskCompletedStatus;
        
        public StatusResult() {
            super();
        }

        public StatusResult(Exception e) {
            super(e);
        }
    }

    public class WorkResult extends RemotingResult {
        public List<WorkData> data = new List<WorkData>();
        public List<WorkData> dataWithoutSprint = new List<WorkData>();

        public WorkResult() {
            super();
        }

        public WorkResult(Exception e) {
            super(e);
        }
    }

    public class WorkData {
        public String id;
        public String name;
        public String subject;
        public String epicName;
        public String releaseName;
        public Decimal storyPoints;
        public Decimal estimatedHours;
        public Decimal taskLength;
        public Decimal completedHours;
        public Decimal remainingPoint;
        public Decimal sprintRank;
        public PicklistData status;
        public PicklistData type;

        public Boolean hasEpic;
        public Boolean hasRelease;
        public Boolean hasSprint;

        public Boolean finishedSprint;

        public List<TaskData> taskList = new List<TaskData>();

        public WorkData() {}

        public WorkData(AgileWork__c work) {
            this.id             = work.Id;
            this.name           = work.WorkCode__c;
            this.subject        = work.Name;
            this.completedHours = work.BaPoints__c - work.RemainingBaPoints__c;
            this.remainingPoint = work.RemainingBaPoints__c;
            this.epicName       = work.AgileEpic__r.name;
            this.releaseName    = work.AgileEpic__r.Release__r.name;
            this.hasEpic        = work.AgileEpic__c != null;
            this.hasRelease     = work.AgileEpic__r.Release__c != null;
            this.hasSprint      = work.Sprint__c != null;
            this.finishedSprint = work.BaPoints__c - work.RemainingBaPoints__c <= 0;
            this.storyPoints    = work.BaPoints__c == null ? 0 : work.BaPoints__c;
            this.type           = new PicklistData('Historia', 'Historia');//new PicklistData(work.RecordType.DeveloperName, work.RecordType.Name);
            this.status         = new PicklistData(work.Status__c, (String) work.get('StatusLabel'));
            this.estimatedHours = 0;
            this.sprintRank     = work.SprintRank__c;
            this.taskLength     = 0;
            for(AgileTask__c task : work.Tasks__r) {
                this.taskList.add(new TaskData(task));
                this.estimatedHours += (task.EstimatedEffort__c == null ? 0 : task.EstimatedEffort__c);
                this.taskLength++;
            }
        }
    }

    public class TaskData {
        public String id;
        public String name;
        public String subject;
        public String sprint;
        public Decimal remainingHours;
        public Decimal initialHours;
        public PicklistData type;
        public PicklistData status;
        public PicklistData classification;
        public Boolean testedWithBug;
        public String workId;
        public AssignedToData assignedTo;

        public TaskData() {}

        public TaskData(AgileTask__c task) {
            this.id             = task.Id;
            this.workId         = task.Work__c;
            this.name           = task.Code__c;
            this.subject        = task.Name;
            this.sprint         = task.Sprint__c;
            this.initialHours   = task.EstimatedEffort__c;
            this.remainingHours = task.RemainingEffort__c;
            this.testedWithBug  = task.TestedWithBug__c;
            this.type           = new PicklistData(String.isNotBlank(task.RecordType.DeveloperName) ? task.RecordType.DeveloperName : 'Task', String.isNotBlank(task.RecordType.Name) ? task.RecordType.Name : 'Task');
            this.status         = new PicklistData(task.Status__c, (String) task.get('StatusLabel'));
            this.classification = new PicklistData(task.Classification__c, (String) task.get('ClassificationLabel'));
            this.assignedTo     = new AssignedToData(task.AssignedTo__r);
        }
    }

    public class AssignedToData {
        public String id;
        public String name;
        public String photo;

        public AssignedToData() {}

        public AssignedToData(AgileTeamMember__c member) {
            if(member != null) {
                this.id     = member.Id;
                this.name   = String.isNotBlank(member.Name) ? member.Name : member.AgileResource__r.AgileUser__r.Name;
                this.photo  = member.AgileResource__r.AgileUser__r.FullPhotoUrl;
            }
        }
    }

    public class SprintData {
        public String id;
        public List<WorkData> workSprintList    = new List<WorkData>();
        public List<WorkData> workBacklogList   = new List<WorkData>();
    }

}