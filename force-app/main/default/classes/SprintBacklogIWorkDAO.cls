//public interface IWorkDAO {
public interface SprintBacklogIWorkDAO {
    Schema.DescribeFieldResult getTaskStatusDescribeFieldResult();
    Schema.DescribeFieldResult getTaskClassificationDescribeFieldResult();
    Schema.DescribeFieldResult getWorkStatusDescribeFieldResult();
    List<AgileWork__c> getWorkList(String sprintId);
    List<AgileWork__c> getWorkList(String sprintId, string teamId);
    AgileWork__c castingObject(SObject obj);
    RemotingResult setWork(SprintBacklogWorkController.WorkData request);
    RemotingResult setSprint(SprintBacklogWorkController.SprintData request);
    RemotingResult setTask(SprintBacklogWorkController.TaskData request);
}