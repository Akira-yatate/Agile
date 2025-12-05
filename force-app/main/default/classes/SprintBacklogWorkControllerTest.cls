@isTest
public with sharing class SprintBacklogWorkControllerTest {

    @TestSetup
    static void makeData(){
        // PROJECT
        AgileProject__c project = new AgileProject__c(Name = 'Test Project');
        insert project;

        // TEAM
        List<AgileTeam__c> teamList = new List<AgileTeam__c>();

        AgileTeam__c team1 = new AgileTeam__c();
        team1.Name                      = 'Team 1';
        team1.AgileProject__c          	= project.Id;
        //team1.Account__c                  = account1.Id;

        teamList.add(team1);

        insert teamList;
        
        // SPRINT
        List<AgileSprint__c> sprintList = new List<AgileSprint__c>();

        AgileSprint__c sprint1 = new AgileSprint__c();
        sprint1.Name                = '2020.09 Sprint 1';
        sprint1.StartDate__c        = Date.today();
        sprint1.FinalDate__c          = (Date.today()).addDays(15);
        sprint1.ReleasePhase__c     = 'Construct';
        sprint1.Team__c             = team1.Id;

        sprintList.add(sprint1);
        
        insert sprintList;
        
        // EPIC
        AgileEpic__c epic = new AgileEpic__c(
        	Name = 'Épic Test',
            Priority__c = 'Baixa',
            Team__c = team1.Id
        );
        insert epic;
        
        // WORK
        AgileWork__c SprintBacklogWork = new AgileWork__c();
        SprintBacklogWork.name                  = 'Validade Work';
        SprintBacklogWork.Sprint__c             = sprint1.Id;
        SprintBacklogWork.Status__c             = 'Sprint Backlog';
        SprintBacklogWork.SprintRank__c         = 1;
        SprintBacklogWork.Team__c               = team1.Id;
        SprintBacklogWork.AgileEpic__c          = epic.Id;
        SprintBacklogWork.RemainingBaPoints__c  = 4.0;
        SprintBacklogWork.RemainingDevPoints__c = 4.0;
        
        insert SprintBacklogWork;

    }

    @isTest
    public static void getWorkList() {
        SprintBacklogWorkController SprintBacklog = new SprintBacklogWorkController();
        Test.startTest();
        SprintBacklog.getWorkList('','');
        Test.stopTest();
    }

    @isTest
    public static void getStatusList() {
        SprintBacklogWorkController SprintBacklog = new SprintBacklogWorkController();
        Test.startTest();
        SprintBacklog.getStatusList();
        Test.stopTest();
    }

}