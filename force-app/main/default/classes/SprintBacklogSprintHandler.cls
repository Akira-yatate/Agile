/*** File Name: SprintBacklogSprintHandler.cls
* Description : Handler for SprintBacklogSprint.trigger
* Copyright:  Nèscara Ltda. 
* Author:     Gabriel Teixeira
* Creation:   30/05/2021
* Modification Log =============================================================== 
*==> TX - 2021-05-30: Metodos de calculo de dias uteis criado
*==> Ralfo - 2021-08-21: Implementar metodo de encerramento de Sprint e criar lógica do Sprint backlog
*==> Ralfo - 2021-08-21: Descontinuada a classa CompServices passando os metodos para CompServiceQueueable
***/

public without sharing class SprintBacklogSprintHandler {
    public static Boolean                   run;
    public        List<AgileSprint__c>     oldRecordsList;
    public        List<AgileSprint__c>     newRecordsList;
    public        Map<Id, AgileSprint__c>  oldRecordsMap;
    public        Map<Id, AgileSprint__c>  newRecordsMap;
    public        Boolean        		    isSingleRow;
    public        Map<Id, AgileSprint__c>  idToAfterContext;
    public        integer sprintDays;

    static {
        run = true;
    }
 
    public void beforeInsert(){
        calculateSprintDays(newRecordsList);
    }    

    public void beforeUpdate(){
        calculateSprintDays(newRecordsList);
    }

    public void beforeDelete(){
        deleteWorkSprintControl(oldRecordsMap);
    }

    public void afterInsert(){
        // prepManagemetSprint(newRecordsMap);
        generateAndUpdateBurndown(newRecordsMap);
    }

    public void afterUpdate(){
        closingProcess(newRecordsMap);
        generateAndUpdateBurndown(newRecordsMap);
    }

    public void afterDelete(){}


    // Gererate Burndown
    public void generateAndUpdateBurndown(Map<Id,AgileSprint__c> RecordsMap){

        Map<String, AgileSprint__c>  outNewRecordsMap = new Map<String, AgileSprint__c>();//newRecordsMap;
        Map<String, AgileSprint__c>  outOldRecordsMap = new Map<String, AgileSprint__c>();//oldRecordsMap;

        for(AgileSprint__c work : newRecordsMap.values() ){
            if(Trigger.IsInsert){ 
                outNewRecordsMap.put((String)work.Id, work); 
            } else {
                outNewRecordsMap.put((String)work.Id, work); 
                outOldRecordsMap.put((String)work.Id, work);
            }
        }
        
        SprintBacklogSprintHandler.run = false;
        // SprintBacklogCompServicesQueueable ComServices = new SprintBacklogCompServicesQueueable();                                          // Generate Burndown SINCRONO
        // ComServices.generateBurnDownBySprint(outNewRecordsMap, outOldRecordsMap);                                             // Generate Burndown SINCRONO
        // System.enqueueJob(new SprintBacklogCompServicesQueueable('generateBurnDownBySprint', outNewRecordsMap, outOldRecordsMap));     // Generate Burndown ASSINCRONO
        SprintBacklogSprintHandler.run = true;
    }

    // prepManagemetSprint
    //    - Criar as works de Gestão da Sprint
    //    - Criar Works por fase da Sprint (Planning, Building, Homologation, Deploying, Operation)
    //        Planning ( Feriados, Agenda, Revisar proposta técnica, treinamento Metodologia, Validar Agenda dos PO e Usuários)
    // public void prepManagemetSprint(Map<Id,AgileSprint__c> RecordsMap){
    //     String taskRecordTypeId                 = [SELECT Id FROM RecordType WHERE DeveloperName = 'Task' AND sObjectType = 'AgileTask__c'].Id;//Schema.SObjectType.AgileTask__c.getRecordTypeInfosByName().get('Task').getRecordTypeId();
        
    //     Map<String, AgileWork__c> workCreateMap = new Map<String, AgileWork__c>();
    //     Set<Id> teamIds = new Set<Id>();
    
    //     // System.Label.LabelName;
    //     // 1. Criar Works de Gestão na Sprint que esta Sendo Criada!
    //     // System.debug('SprintBacklogSprintHandler.prepManagementSprint() Validar mapa de Sprint: ' + recordsMap.Values());
    //     for(AgileSprint__c sprint : recordsMap.Values()){
    //         teamIds.add(sprint.Team__c);
    
    //         // Work Sprint Planning
    //         AgileWork__c workSprintPlanning = new AgileWork__c(
    //             Name = 'Reunião Sprint Planning' //System.Label.NeWorkNameSprinPlanningMeeting 
    //             , Team__c = sprint.Team__c
    //             , Sprint__c = sprint.Id
    //             , Status__c = 'Desalocada'
    //             // System.Label.NeUserStorySprinPlanningMeeting //
    //             , UserStoryEQP__c =  'Reunião definir junto ao PO do projeto o objetivo (MVP) da Sprint. Montagem do Sprint Backlog com a seleção e sequenciamento das works aprovadas de acordo com as prioridades de negócio!'
                
    //             , SprintRank__c = 100
                
    //             , BAPoints__c = 1
    //             , RemainingBAPoints__c = 1
    //         );

    //         workCreateMap.Put('' + sprint.Id + 'workSprintPlanning' , workSprintPlanning);
    
    //         // Work p/ Sprint Daily Meeting
    //         AgileWork__c workDailyMeeting = new AgileWork__c(
    //             Name = 'Reunião Daily Meeting'
    //             , Team__c = sprint.Team__c
    //             , Sprint__c = sprint.Id
    //             , Status__c = 'Desalocada'
    //             // System.Label.NeWorkEQPASprinPlanningMeeting
    //             , UserStoryEQP__c = 'Nesta reunião devemos identificar os impeditivos do time, para que os Scrum Masters e POs trabalhem durante dia no desbloqueio dos mesmos. Condução por pessoa, seguindo as seguintes perguntas: O que fiz ontem? O que farei hoje? Quais os impeditivos que tenho?'
                
    //             , SprintRank__c = 101
                
    //             , BAPoints__c = 1
    //             , RemainingBAPoints__c = 1
    //         );
    //         workCreateMap.Put('' + sprint.Id + 'workDailyMeeting' , workDailyMeeting);
    
    //         // Work p/ Sprint Review
    //         AgileWork__c workSprintReview = new AgileWork__c(
    //             Name = 'Reunião de Sprint Review'
    //             , Team__c = sprint.Team__c
    //             , Sprint__c = sprint.Id
    //             , Status__c = 'Desalocada'
    //             , UserStoryEQP__c = 'Reunião para o time de projeto apresentar para os SPONSOR do projeto o objetivo (MVP) e os entregáveis da Sprint, sugerimos que a condução da apresentação seja do PO com apoio do time da SQUAD!'
                
    //             , SprintRank__c = 102
                
    //             , BAPoints__c = 1
    //             , RemainingBAPoints__c = 1
    //         );
    //         workCreateMap.Put('' + sprint.Id + 'workSprintReview' , workSprintReview);
    
    //         // Work p/ Sprint Retrospective
    //         AgileWork__c workSprintRetrospective = new AgileWork__c(
    //             Name = 'Reunião de Sprint Retrospective'
    //             , Team__c = sprint.Team__c
    //             , Sprint__c = sprint.Id
    //             , Status__c = 'Desalocada'
    //             , UserStoryEQP__c = 'Reunião para time realizar os ajustes de percurso e discussões de modelos de trabalho e modos de relacionamento. Perguntas sugeridas: O que deve continuar sendo feito? O que não deve continuar fazendo? O que devemos começar a fazer?'
                
    //             , SprintRank__c = 103
                
    //             , BAPoints__c = 1
    //             , RemainingBAPoints__c = 1
    //         );
    //         workCreateMap.Put('' + sprint.Id + 'workSprintRetrospective' , workSprintRetrospective);
    
    //         /* Este requisito deve ser melhor pensado antes de darmos sequencia!
    //             // Work p/ Gestão de Testes
    //             AgileWork__c workSprintTest = new AgileWork__c(
    //                 Name = 'Controle dos testes na Sprint'
    //                 , Team__c = sprint.Team__c
    //                 , Sprint__c = sprint.Id
    //                 , Status__c = 'Desalocada'
    //                 , UserStoryEQP__c = 'Work criada com objetivo de gerenciar os testes realizados na Sprint!'                
                    
    //                 , SprintRank__c = 98
                    
    //                 , BAPoints__c = 1
    //                 , RemainingBAPoints__c = 1
    //             );
    //             workCreateMap.Put('' + sprint.Id + 'workSprintTest' , workSprintTest);
                
    //             // Work p/ Gestão dos Bugs
    //             AgileWork__c workSprintBug = new AgileWork__c(
    //                 Name = 'Controle dos Ajustes/Bugs na Sprint'
    //                 , Team__c = sprint.Team__c
    //                 , Sprint__c = sprint.Id
    //                 , Status__c = 'Desalocada'
    //                 , UserStoryEQP__c = 'Work criada com objetivo de gerenciar os testes realizados na Sprint!'
                    
    //                 , SprintRank__c = 99
                    
    //                 , BAPoints__c = 1
    //                 , RemainingBAPoints__c = 1
    //             );
    //             workCreateMap.Put('' + sprint.Id + 'workSprintBug' , workSprintBug);
    //         */
    //     }
    
    //     if(!workCreateMap.isEmpty()){
    //         //System.debug('SprintBacklogSprintHandler.prepManagementSprint() validar mapa workCreateMap: ' + workCreateMap);
    //         insert workCreateMap.values();
    //     }
        
    //     // 2 Adicionar as Works de Gestão de Testes e de Bugs nas Sprint
    //     List<AgileSprint__c> sprintUpdateList = new List<AgileSprint__c>();
    //     List<AgileTask__c> taskAddList = new List<AgileTask__c>();
    
    //     Map<String, AgileTeam__c> teamMap = new Map<String, AgileTeam__c>([SELECT Id, (SELECT Id, Overhead__c FROM Membros_do_Time__r WHERE Overhead__c = false) FROM AgileTeam__c WHERE Id IN : teamIds ]);
    
    //     for(AgileSprint__c sprint : recordsMap.Values()){
    //         // Atualizar Sprint com campos com as Works de Controle
    //         AgileSprint__c sprintUpdt = new AgileSprint__c();
    //         sprintUpdt.Id                               = sprint.Id;
            
    //         sprintUpdateList.add(sprintUpdt);
    
    //         // Tarefas de para os times não overhead, para controle de capacidade
    //         System.Debug( 'Ralfo SprintBacklogSprintHandler : workCreateMap --> ' + workCreateMap);
    //         for (AgileTeamMember__c teamMember : teamMap.get(sprint.Team__c).Membros_do_Time__r){
    //             // 2.1 Criar Reunião Sprint Plan
    //             AgileTask__c taskPlan = new AgileTask__c(
    //                 Name            = 'Sprint Planning',
    //                 RecordTypeId    = taskRecordTypeId,
    //                 Team__c         = Sprint.Team__c,
    //                 Work__c         = workCreateMap.get('' + sprint.Id + 'workSprintPlanning').Id,
    //                 Status__c       = 'Not Started',
    //                 AssignedTo__c   = teamMember.Id,
    //                 Description__c  = 'Participar da Reunião Sprint Planning',
    //                 Order__c        = 99,
    //                 EstimatedEffort__c = Sprint.SprintPlanningTime__c,
    //                 RemainingEffort__c = Sprint.SprintPlanningTime__c,
    //                 Action__c       = 'NoAction'
    //             );
    //             taskAddList.add(taskPlan);
    
    //             // 2.1 Criar Reunião Daily Meeting
    //             AgileTask__c taskDailyMeeting = new AgileTask__c(
    //                 Name            = 'Daily Meeting',
    //                 RecordTypeId    = taskRecordTypeId,
    //                 Team__c         = Sprint.Team__c,
    //                 Work__c         = workCreateMap.get('' + sprint.Id + 'workDailyMeeting').Id,
    //                 Status__c       = 'Not Started',
    //                 AssignedTo__c   = teamMember.Id,
    //                 Description__c  = 'Participar da Reunião de Daily Meeting',
    //                 Order__c        = 100,
    //                 EstimatedEffort__c = (sprint.DailyMeetingTime__c > 0 ? sprint.DailyMeetingTime__c : 0 ) * (sprint.WorkDay__c > 0 ? sprint.WorkDay__c : 0 ) / 60, // Divide por sessenta para converter os minutos em horas para Task
    //                 RemainingEffort__c = (sprint.DailyMeetingTime__c > 0 ? sprint.DailyMeetingTime__c : 0 ) * (sprint.WorkDay__c > 0 ? sprint.WorkDay__c : 0 ) / 60, // Divide por sessenta para converter os minutos em horas para Task
    //                 Action__c       = 'NoAction'
    //             );
    //             taskAddList.add(taskDailyMeeting);
    
    //             // Sprint Review
    //             AgileTask__c taskSprintReview = new AgileTask__c(
    //                 Name            = 'Sprint Review',
    //                 RecordTypeId    = taskRecordTypeId,
    //                 Team__c         = Sprint.Team__c,
    //                 Work__c         = workCreateMap.get('' + sprint.Id + 'workSprintReview').Id,
    //                 Status__c       = 'Not Started',
    //                 AssignedTo__c   = teamMember.Id,
    //                 Description__c  = 'Participar da Reunião de Sprint Review',
    //                 Order__c        = 101,
    //                 EstimatedEffort__c = sprint.SprintReviewTime__c,
    //                 RemainingEffort__c = sprint.SprintReviewTime__c,
    //                 Action__c       = 'NoAction'
    //             );
    //             taskAddList.add(taskSprintReview);
    
    //             // Sprint Retrospective
    //             AgileTask__c taskSprintRetrospective = new AgileTask__c(
    //                 Name            = 'Sprint Retrospective',
    //                 RecordTypeId    = taskRecordTypeId,
    //                 Team__c         = Sprint.Team__c,
    //                 Work__c         = workCreateMap.get('' + sprint.Id + 'workSprintRetrospective').Id,
    //                 Status__c       = 'Not Started',
    //                 AssignedTo__c   = teamMember.Id,
    //                 Description__c  = 'Participar da Reunião de Sprint Retrospective',
    //                 Order__c        = 102,
    //                 EstimatedEffort__c = sprint.SprintRetrospectiveTime__c,
    //                 RemainingEffort__c = sprint.SprintRetrospectiveTime__c,
    //                 Action__c       = 'NoAction'
    //             );
    //             taskAddList.add(taskSprintRetrospective);
    //         }
    //     }
    
    //     if(sprintUpdateList.size() > 0){
    //         SprintBacklogSprintHandler.run = false;
    //         update sprintUpdateList;
    //         SprintBacklogSprintHandler.run = true;
    //     }
    
    //     System.debug('RALFO SprintBacklogSprintHandler : taskAddList -->> ' + taskAddList);
    //     if(taskAddList.size() > 0 ){
    //         SprintBacklogWorkTriggerHandler.run = false;
    //         SprintBacklogTaskTriggerHandler.run = false;
    //         insert taskAddList;
    //         SprintBacklogTaskTriggerHandler.run = true;
    //         SprintBacklogWorkTriggerHandler.run = true;
    //     }
    // }

    public void closingProcess(Map<Id,AgileSprint__c> RecordsMap){

        // Map<Id,AgileWork__c> workMap = new Map<Id,AgileWork__c>();
        // Map<Id,AgileWork__c> workUpdateMap = new Map<Id,AgileWork__c>();
        // Map<String,SprintBacklogSprintBacklog__c> sprintBacklogUpSetMap = new Map<String,SprintBacklogSprintBacklog__c>();

        // for(AgileSprint__c sprint : [SELECT Id, Status__c, NextSprint__c 
        //         , (SELECT Id, ExternalId__c, Status__c, RemainingBAPoints__c, EstimatedConsultingEffortHour__c, EstimatedCustomerEffortHour__c, CompletedEffort__c,  EstimatedPoint__c,  Work__c
        //                 FROM NeSprintBacklogs__r order by Id)
        //         , (SELECT Id, BAPoints__c, Status__c, RemainingBAPoints__c, EstimatedConsultingEffortHour__c, EstimatedCustomerEffortHour__c, CompletedEffort__c 
        //                 FROM NeWorks__r order by Id)
        //         FROM AgileSprint__c
        //         WHERE Id IN : RecordsMap.KeySet() 
        //         AND (Status__c = : neMetadata.SBLog_SprintStatus_Finished__c OR Status__c = : neMetadata.SBLog_SprintStatus_ReleaseFinished__c)
        // ]){
        //     // Atualizar o Sprint Backlog
        //     workMap.putAll(sprint.NeWorks__r);
        //     System.debug('Exibe conteudo do workMap ==> ' + workMap);

        //     for(SprintBacklogSprintBacklog__c sprintBacklog : sprint.NeSprintBacklogs__r){
        //         if(workMap.containsKey(sprintBacklog.Work__c)){
        //             AgileWork__c work = workMap.get(sprintBacklog.Work__c);

        //             sprintbacklog.EstimatedPoint__c                 = work.BAPoints__c;
        //             sprintbacklog.EstimatedConsultingEffortHour__c  = work.EstimatedConsultingEffortHour__c;
        //             sprintbacklog.EstimatedCustomerEffortHour__c    = work.EstimatedCustomerEffortHour__c;
        //             sprintbacklog.RemainingBAPoints__c                 = work.RemainingBAPoints__c;
        //             sprintbacklog.CompletedEffort__c                = work.CompletedEffort__c;
        //             sprintbacklog.Status__c                   = work.Status__c;

        //             if(work.Status__c == neMetadata.Work_SprintStatus_Finished__c){
        //                 //Tratativa para Works FINALIZADAS na Sprint
        //                 sprintBacklog.RemainingBAPoints__c = 0;                    
        //             } else {
        //                 if( Sprint.Status__c ==  neMetadata.SBLog_SprintStatus_Finished__c){
        //                     work.Sprint__c = sprint.NextSprint__c;
        //                     workUpdateMap.put(work.Id, work);
        //                 }

        //                 //Tratativa para Works NÃO FINALIZADAS na Sprint
        //                 sprintBacklog.RemainingBAPoints__c = work.RemainingBAPoints__c;
        //                 sprintBacklogUpSetMap.put(sprintBacklog.ExternalId__c, sprintBacklog);
        //             }
        //         }
        //     }
        // }

        // if(!sprintBacklogUpSetMap.isEmpty()){
        //     upsert sprintBacklogUpSetMap.values() ExternalId__c;
        // }

        // // Alocar Works Nas Sprints Novas
        // if(!workUpdateMap.isEmpty()){
        //     update workUpdateMap.values();
        // }
    }

    public static void calculateSprintDays(List<AgileSprint__c> contextList){
        // Set<Id> teamIds = new Set<Id>();
        // for(AgileSprint__c sprints : contextList){
        //     teamIds.add(sprints.Team__c);
        // }

        // Map<Id, Set<Date>> currentHolidayMap = (Map<Id, Set<Date>>) SprintBacklogSprintHolidayHandler.getHolidayTeam(teamIds);
        // //System.debug('SprintBacklogSprintHandler.calculateSprintDays validar feriados 1 : SprintBacklogSprintHolidayHandler.getHolidayTeam(teamIds) ' + SprintBacklogSprintHolidayHandler.getHolidayTeam(teamIds));
        // //System.debug('SprintBacklogSprintHandler.calculateSprintDays validar feriados 1 : currentHolidayMap ' + currentHolidayMap);

        // for(AgileSprint__c sprints : contextList){
        //     Set<Date> dts = currentHolidayMap.containsKey(sprints.Team__c) ? currentHolidayMap.get(sprints.Team__c) : new Set<Date>();
        //     //System.debug('SprintBacklogSprintHandler.calculateSprintDays validar feriados 2 : ' + dts);
        //     sprints.CalculatedDaysRemaining__c = SprintBacklogSprintHolidayHandler.calculateDays(sprints, dts);
        //     sprints.WorkDay__c = SprintBacklogSprintHolidayHandler.calculateQttyDaysByDate(sprints.StartDate__c, sprints.FinalDate__c, dts);
        // }   
    }
    
    public void deleteWorkSprintControl(Map<Id,AgileSprint__c> RecordsMap){
        // Set<id> sprintIds = new Set<Id>();
        // for(AgileSprint__c sprint : RecordsMap.values()){
        //     if(Sprint.Status__c == neMetadata.Sprint_Status_Created__c){
        //         sprintIds.add(sprint.Id);
        //     }
        // }
    }
}