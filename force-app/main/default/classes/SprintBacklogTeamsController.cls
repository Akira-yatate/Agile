//public with sharing class NE_TeamsController {
public with sharing class SprintBacklogTeamsController {
    private SprintBacklogITeamDAO teamDAO = new SprintBacklogTeamDAO();

    public TeamResult getTeamList() {
        TeamResult response;
        try {
            response = new TeamResult();
            for(SObject teamData : teamDAO.getTeamList()) {
                AgileTeam__c team = teamDAO.castingObject(teamData);
                if(team.Sprints__r.size() > 0) {
                    response.data.add(new TeamData(team));
                }
            }
        } catch (Exception e) {
            response = new TeamResult(e);
        }
        return response;
    }

    public class TeamResult extends RemotingResult {
        public List<TeamData> data = new List<TeamData>();
        
        public TeamResult() {
            super();
        }

        public TeamResult(Exception e) {
            super(e);
        }
    }

    public class TeamData {
        public String id;
        public String name;
        public List<MemberData> memberList = new List<MemberData>();
        public List<SprintData> sprintList = new List<SprintData>();

        public TeamData() {}

        public TeamData(AgileTeam__c team) {
            this.id             = team.Id;
            this.name           = team.Name;
            for(AgileTeamMember__c member : team.Membros_do_Time__r) {
                this.memberList.add(new MemberData(member));
            }
            for(AgileSprint__c sprint : team.Sprints__r) {
                this.sprintList.add(new SprintData(sprint));
            }
        }
    }

    public class MemberData {
        public String id;
        public String name;
        public String photo;
        public Decimal allocation;
        public PicklistData role;
        public PicklistData type;

        public MemberData() {}

        public MemberData(AgileTeamMember__c member) {
            if(member != null) {
                this.id             = member.Id;
                this.name           = String.isNotBlank(member.Name) ? member.Name : member.AgileResource__r.AgileUser__r.Name;
                this.photo          = member.AgileResource__r.AgileUser__r.FullPhotoUrl;
                this.allocation     = member.Allocated__c;
                this.role           = new PicklistData(member.Role__c, (String) member.get('RoleLabel'));
                this.type           = new PicklistData('Internal', 'Internal');
            }
        }
    }

    public class SprintData {
        public String id;
        public String name;
        public String startDate;
        public String endDate;
        public Decimal totalWorkDays;
        public Decimal totalWorkHours;
        public String daysRemaining;

        public SprintData() {}

        public SprintData(AgileSprint__c sprint) {
            if(sprint != null) {
                this.id             = sprint.Id;
                this.name           = sprint.Name;
                this.startDate      = String.valueOf(sprint.StartDate__c);
                this.endDate        = String.valueOf(sprint.FinalDate__c);
                this.totalWorkDays  = sprint.WorkDays__c;
                this.totalWorkHours = sprint.WorkHours__c;
                this.daysRemaining  = ' - ';
            }  
        }
    }
}