//public with sharing class NE_TeamDAO implements ITeamDAO {
public with sharing class SprintBacklogTeamDAO implements SprintBacklogITeamDAO {
        public AgileTeam__c castingObject(SObject obj) {
            return (AgileTeam__c) obj;
        }
    
        public List<AgileTeam__c> getTeamList() {
            List<String> teamIdList = new List<String>();
            for(AgileTeamMember__c member : [
                SELECT  Id, Name,
                        AgileTeam__c
                  FROM  AgileTeamMember__c
                 WHERE  AgileResource__r.AgileUser__c = : UserInfo.getUserId()
            ]) {
                teamIdList.add(member.AgileTeam__c);
            }
            return [
                SELECT  Id, Name, //agf__External_Name__c,
                        (
                            SELECT  Id, Name
                                    , AgileResource__r.AgileUser__r.Name, Allocated__c, 
                                    Role__c, toLabel(Role__c) RoleLabel, AgileResource__r.AgileUser__r.FullPhotoUrl
                              FROM  Membros_do_Time__r
                          ORDER BY  Name
                        ),
                        (
                            SELECT  Id, Name, StartDate__c, FinalDate__c, 
                              WorkDays__c, WorkHours__c
                              FROM  Sprints__r
                          ORDER BY  StartDate__c
                        )
                  FROM  AgileTeam__c
                 WHERE  Id IN :teamIdList
              ORDER BY  Name
            ];
        }
    }