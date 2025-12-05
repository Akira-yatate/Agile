/**
 * @description       : 
 * @descrição         : 
 * @author            : Lucas Meneguelli
 * @group             : 
 * @last modified on  : 10-01-2025
 * @last modified by  : Luíz Suliman
**/
@isTest
public with sharing class SprintBacklogProjectControllerTest {
    @TestSetup
    static void setupData() {
        SprintBacklogSprintHandler.run = false;

        // ACCOUNT
        List<Account> accountList = new List<Account>();

        Account account1 = new Account();
        account1.Name                   = 'account 1';
        //account1.Unidade_de_Negocio__c  = 'Nèscara';

        accountList.add(account1);

        insert accountList;

        Contact cont1 = new Contact();
        cont1.LastName = 'Cont 1';
        cont1.AccountId = account1.Id;
        cont1.Email = 'demo@taak.com.test';
        Insert cont1;
        
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

        // TEAM MEMBER
        List<AgileTeamMember__c> teamMemberList = new List<AgileTeamMember__c>();

        AgileResource__c resources = new AgileResource__c(AgileUser__c = UserInfo.getUserId());

        AgileTeamMember__c teamMember1 = new AgileTeamMember__c();
        teamMember1.Allocated__c  = 100;
        teamMember1.AgileResource__c             = resources.Id;
        teamMember1.AgileTeam__c             = team1.Id;
        teamMember1.Role__c             = 'InternalConsultant';
        teamMember1.StartDate__c           = Date.today();
        teamMember1.FinalDate__c             = Date.today().addDays(30);

        teamMemberList.add(teamMember1);

        insert teamMemberList;

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

        
        // // Burndown
        // List<AgileBurndown__c> burndownList = new List<AgileBurndown__c>();
        // AgileBurndown__c burndown1 = new AgileBurndown__c();
        // burndown1.Sprint__c             = Sprint1.Id;
        // burndown1.Type__c               = 'Baseline';
        // burndown1.EstimatedEffort__c    = 4;
        // burndown1.Date__c               = Date.today();

        // burndownList.add(burndown1);

        // AgileBurndown__c burndown2 = new AgileBurndown__c();
        // burndown2.Sprint__c             = Sprint1.Id;
        // burndown2.Type__c               = 'Actual';
        // burndown2.EstimatedEffort__c    = 3;
        // burndown2.Date__c               = Date.today();

        // burndownList.add(burndown2);

        // insert burndownList;

        // EPIC
        AgileEpic__c epic = new AgileEpic__c(
        	Name = 'Épic Test',
            Priority__c = 'Baixa',
            Team__c = team1.Id
        );
        insert epic;
        
        // WORK
        System.debug(team1);
        List<AgileWork__c> workList = new List<AgileWork__c>();

        AgileWork__c work1 = new AgileWork__c();
        work1.Name              = 'Work 1 Subject';
        work1.Sprint__c         = sprint1.Id;
        work1.Status__c   = 'Sprint Backlog';
        work1.SprintRank__c     = 1;
        //work1.Account__c        = account1.Id;
        work1.Team__c           = team1.Id;
        work1.AgileEpic__c      = epic.Id;
        work1.RemainingBaPoints__c = 4.0;
        work1.RemainingDevPoints__c = 4.0;

        workList.add(work1);

        AgileWork__c work2 = new AgileWork__c();
        work2.Name              = 'Work 2 Subject';
        work2.Sprint__c         = sprint1.Id;
        work2.Status__c   = 'Sprint Backlog';
        work2.SprintRank__c     = 2;
        //work2.Account__c        = account1.Id;
        work2.Team__c           = team1.Id;
        work2.AgileEpic__c      = epic.Id;
        work2.RemainingBaPoints__c = 4.0;
        work2.RemainingDevPoints__c = 4.0;
        
        workList.add(work2);

        insert workList;

        // TASK
        List<AgileTask__c> taskList = new List<AgileTask__c>();

        AgileTask__c task1 = new AgileTask__c();
        task1.Name              = 'Task 1 Subject';
        task1.EstimatedEffort__c  = 8;
        task1.RemainingEffort__c  = 8;
        task1.Work__c           = work1.Id;
        task1.Team__c           = team1.Id;
        task1.AssignedTo__c     = teamMember1.Id;
        task1.Classification__c = 'Bug';

        taskList.add(task1);

        insert taskList;
        
        SprintBacklogSprintHandler.run = true;
    }

    @isTest
    public static void SprintBacklogController() {
        ApexPages.StandardController sc = new ApexPages.standardController(new Account());
        Test.startTest();

        SprintBacklogController controller = new SprintBacklogController(sc);
        controller = new SprintBacklogController();
        new SprintBacklogUserController.UserResult(new SprintBacklogController.SprintBacklogControllerException());
        PicklistData pickList = new PicklistData();
        PicklistData pickList2 = new PicklistData('teste','teste');
        PicklistData pickList3 = new PicklistData('teste','teste','teste');
        RemotingResult result = new RemotingResult();
        result = new RemotingResult(true);
        result = new RemotingResult(true, 'message');
        result = new RemotingResult(true, 'code', 'message');
        result = new RemotingResult(true, 'code', 'message', 'description');
        result = new RemotingResult(new SprintBacklogController.SprintBacklogControllerException());
        result = new RemotingResult(new SprintBacklogController.SprintBacklogControllerException(), 'message');

        SprintBacklogWorkDAO workC = new SprintBacklogWorkDAO();
        workC.getTaskClassificationDescribeFieldResult();

        Test.stopTest();
    }

    @isTest
    public static void getBurndown() {
        Test.startTest();

        AgileSprint__c sprint1 = [SELECT Id FROM AgileSprint__c LIMIT 1];
        SprintBacklogBurndownController.BurndownResult result = SprintBacklogController.getBurndown(sprint1.Id);
        System.debug(JSON.serializePretty(result));
        System.assertEquals(false, result.hasError);

        SprintBacklogBurndownController.BurndownResult resultBurndown = new SprintBacklogBurndownController.BurndownResult(new SprintBacklogController.SprintBacklogControllerException());

        Test.stopTest();
    }
   
    @isTest
    public static void getTeamList() {
        Test.startTest();

        SprintBacklogTeamsController.TeamResult result = SprintBacklogController.getTeamList();
        System.debug(JSON.serializePretty(result));
        System.assertEquals(false, result.hasError);

        new SprintBacklogTeamsController.TeamResult(new SprintBacklogController.SprintBacklogControllerException());
        new SprintBacklogTeamsController.TeamData();
        new SprintBacklogTeamsController.MemberData();
        new SprintBacklogTeamsController.SprintData();

        Test.stopTest();
    }

    @isTest
    public static void getWorkList() {
        AgileSprint__c sprint1 = [SELECT Id, Team__c FROM AgileSprint__c LIMIT 1];

        Test.startTest();

        SprintBacklogWorkController.WorkResult result = SprintBacklogController.getWorkList(new List<String>{sprint1.id,sprint1.team__c });
        System.debug(JSON.serializePretty(result));
        System.assertEquals(false, result.hasError);

        SprintBacklogController.setSprint(null);
        new SprintBacklogWorkDAO().getWorkByIdsList(new List<String>());
        new SprintBacklogWorkDAO().getWorkList(sprint1.id);
        
        SprintBacklogWorkController.SprintData request = new SprintBacklogWorkController.SprintData();
        request.workSprintList  = new List<SprintBacklogWorkController.WorkData>();
        request.workBacklogList = new List<SprintBacklogWorkController.WorkData>();
        request.id              = sprint1.id;

        new SprintBacklogWorkDAO().setSprint(request);

        new SprintBacklogWorkController.StatusResult(new SprintBacklogController.SprintBacklogControllerException());
        new SprintBacklogWorkController.WorkResult(new SprintBacklogController.SprintBacklogControllerException());
        new SprintBacklogWorkController.AssignedToData();

        Test.stopTest();
    }

    @isTest
    public static void setWork() {
        SprintBacklogWorkController.WorkData request = new SprintBacklogWorkController.WorkData();
        AgileWork__c work1 = [SELECT Id, Status__c, RemainingBaPoints__c FROM AgileWork__c WHERE Name = 'Work 2 Subject' LIMIT 1];
        request.id = work1.Id;
        request.status = new PicklistData(work1.Status__c, work1.Status__c);
        request.remainingPoint = work1.RemainingBaPoints__c;

        Test.startTest();

        RemotingResult result = SprintBacklogController.setWork(request);
        System.debug(JSON.serializePretty(result));
        System.assertEquals(false, result.hasError);

        Test.stopTest();
    }

    @isTest
    public static void setTask() {
        SprintBacklogWorkController.AssignedToData assignedData = new SprintBacklogWorkController.AssignedToData([SELECT Id, Name, Role__c ,AgileResource__r.AgileUser__r.Name , AgileResource__r.AgileUser__r.FullPhotoUrl FROM AgileTeamMember__c Limit 1]);
        SprintBacklogWorkController.TaskData request = new SprintBacklogWorkController.TaskData();
        AgileWork__c work2  = [SELECT Id, Status__c FROM AgileWork__c WHERE Name = 'Work 2 Subject' LIMIT 1];
        AgileTask__c task1  = [SELECT Id, Status__c, Classification__c, Work__c FROM AgileTask__c LIMIT 1];
        request.id              = task1.Id;
        request.status          = new PicklistData(task1.Status__c, task1.Status__c);
        request.classification  = new PicklistData(task1.Classification__c, task1.Classification__c);
        request.remainingHours  = 2;
        request.assignedTo      = assignedData;

        Test.startTest();
        
        RemotingResult result = SprintBacklogController.setTask(request);
        System.debug(JSON.serializePretty(result));
        //System.assertEquals(false, result.hasError);
        
        request.workId = work2.Id;
        result = SprintBacklogController.setTask(request);
        System.debug(JSON.serializePretty(result));
        //System.assertEquals(false, result.hasError);

        Test.stopTest();
    }

    @isTest
    public static void setMailTask() {
        SprintBacklogWorkController.AssignedToData assignedData = new SprintBacklogWorkController.AssignedToData([SELECT Id, Name, Role__c ,AgileResource__r.AgileUser__r.Name , AgileResource__r.AgileUser__r.FullPhotoUrl FROM AgileTeamMember__c Limit 1]);
        SprintBacklogWorkController.TaskData request = new SprintBacklogWorkController.TaskData();
        // List<Contact> ContractNesc = [SELECT Id, AccountId FROM Contact WHERE Account.Name like '%account 1%' limit 1];
        AgileTeam__c team1  = [SELECT Id FROM AgileTeam__c WHERE Name = 'Team 1' LIMIT 1];
        AgileWork__c work2  = [SELECT Id, Status__c, Sprint__c FROM AgileWork__c WHERE Name = 'Work 2 Subject' LIMIT 1];
        AgileTask__c task1  = [SELECT Id, Status__c, Classification__c, Work__c, work__r.Sprint__c FROM AgileTask__c LIMIT 1];
        request.id              = task1.Id;
        request.status          = new PicklistData(task1.Status__c, task1.Status__c);
        request.classification  = new PicklistData(task1.Classification__c, task1.Classification__c);
        request.remainingHours  = 2;
        request.assignedTo      = assignedData;

        Test.startTest();

        // team1.Contact__c = ContractNesc[0].Id;
        // team1.GeneralEmailAddress__c = 'demo@taak.com.test';
        // team1.TeamEmailAddress__c = 'demo@taak.com.test';
        update team1;

        task1.Status__c = 'In Progress';
        update task1;

        task1.Status__c = 'Completed';
        update task1;

        Delete task1;
        
        // EPIC
        AgileEpic__c epic = new AgileEpic__c(
        	Name = 'Épic Test',
            Priority__c = 'Baixa',
            Team__c = team1.Id
        );
        
        insert epic;

        // List<RecordType> rTP = [SELECT Id, DeveloperName FROM RecordType WHERE SobjectType='AgileWork__c' AND DeveloperName = 'CaseBug'];

        List<AgileWork__c> workList = new List<AgileWork__c>();

        AgileWork__c work1 = new AgileWork__c();
        work1.Name              = 'Work 2 CaseBug';
        work1.Sprint__c         = work2.Sprint__c;
        work1.Status__c   = work2.Status__c;
        work1.SprintRank__c     = 1;
        //work1.Account__c        = ContractNesc[0].AccountId;
        work1.Team__c           = team1.Id;
        // work1.RecordTypeId      = rTP[0].Id;
        work1.AgileEpic__c      = epic.Id;

        workList.add(work1);
        Insert workList;


        Test.stopTest();
    }


}