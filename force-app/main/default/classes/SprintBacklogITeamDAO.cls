//public interface ITeamDAO {
public interface SprintBacklogITeamDAO {
    AgileTeam__c castingObject(SObject obj);
    List<AgileTeam__c> getTeamList();
}