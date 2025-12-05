@isTest
public class AgileWorkControllerTest {
    @TestSetup
    public static void createData() {    

        Account acc = new Account();
        acc.Name = 'Cliente';
        // acc.CNPJ__c = '54.772.017/0018-34';
        insert acc;

        AgileProject__c project = new AgileProject__c();
        project.Account__c = acc.id;
        project.StartDate__c = Date.Today();
        project.FinalDate__c = Date.Today().addDays(30);
        project.GoLiveDate__c = Date.Today().addDays(29);
        project.InitialProjectValue__c = 123;
        project.Name = 'Implantação';
        insert project;
        
        AgileTeam__c team = new AgileTeam__c();
        team.AgileProject__c = project.id;
        team.Name = 'Time de Projeto';
        insert team;

        AgileSprint__c sprint = new AgileSprint__c();
        sprint.StartDate__c = Date.Today();
        sprint.FinalDate__c = Date.Today().addDays(30);
        sprint.Status__c = 'Em Execução';
        sprint.Name = 'Levantamento';
        sprint.Team__c = team.Id;
        insert sprint;
        
        AgileEpic__c epic = new AgileEpic__c();
        epic.Status__c = 'Não iniciado';
        epic.Name = 'Visão 360';
        epic.Team__c = team.Id;
        insert epic;

        AgileWork__c work = new AgileWork__c();
        work.Name = 'TEST';
        work.AgileEpic__c = epic.Id;
        work.BaPoints__c = 10;
        work.DevPoints__c = 11;
        work.RemainingBaPoints__c = 10;
        work.RemainingDevPoints__c = 11;
        work.Sprint__c = sprint.Id;
        work.Status__c = 'Nova';
        work.Team__c = team.id;
        insert work;
    }
    @isTest
    public static void summarizeWorks() {  
        AgileWork__c work = new AgileWork__c();
        work.Name = 'TEST';
        work.AgileEpic__c = [SELECT id FROM AgileEpic__c LIMIT 1].Id;
        work.BaPoints__c = 10;
        work.DevPoints__c = 11;
        work.RemainingBaPoints__c = 10;
        work.RemainingDevPoints__c = 11;
        work.Sprint__c = [SELECT id FROM AgileSprint__c LIMIT 1].Id;
        work.Status__c = 'Nova';
        work.Team__c = [SELECT id FROM AgileTeam__c LIMIT 1].id;
        insert work;  
    }
}