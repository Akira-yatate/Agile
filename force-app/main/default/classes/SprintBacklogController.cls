//public with sharing class SprintBacklogController {
public with sharing class SprintBacklogController {
    public static String userDataString         {get; set;}
    public static String statusListDataString   {get; set;}
    public static SprintBacklogTeamsController ne_teamsController = new SprintBacklogTeamsController();
    public static SprintBacklogWorkController ne_workController = new SprintBacklogWorkController();
    public static SprintBacklogBurndownController ne_burndownController = new SprintBacklogBurndownController();

    public SprintBacklogController() {
        getUserData();
        getStatusList();
    }

    public SprintBacklogController(ApexPages.StandardController standardController) {
        getUserData();
        getStatusList();
    }

    // USER
    @RemoteAction
    public static SprintBacklogUserController.UserResult getUserData() {
        SprintBacklogUserController.UserResult response = SprintBacklogUserController.getUserData();
        userDataString = JSON.serialize(response).escapeEcmaScript();
        return response;
    }
    
    // BURNDOWN
    @RemoteAction
    public static SprintBacklogBurndownController.BurndownResult getBurndown(String sprintId) {
        SprintBacklogBurndownController.BurndownResult response = ne_burndownController.getBurndown(sprintId);
        return response;
    }
    
    // TEAMS
    @RemoteAction
    public static SprintBacklogTeamsController.TeamResult getTeamList() {
        SprintBacklogTeamsController.TeamResult response = ne_teamsController.getTeamList();
        return response;
    }
    
    // WORK
    @RemoteAction
    public static SprintBacklogWorkController.StatusResult getStatusList() {
        SprintBacklogWorkController.StatusResult response = ne_WorkController.getStatusList();
        statusListDataString = JSON.serialize(response).escapeEcmaScript();
        return response;
    }

    @RemoteAction
    public static SprintBacklogWorkController.WorkResult getWorkList(String[] params) {
        String sprintId = params[0];
        String teamId   = params[1];
        SprintBacklogWorkController.WorkResult response = ne_workController.getWorkList(sprintId, teamId);
        return response;
    }

    @RemoteAction
    public static RemotingResult setSprint(SprintBacklogWorkController.SprintData request) {
        RemotingResult response = ne_WorkController.setSprint(request);
        return response;
    }
    @RemoteAction
    public static RemotingResult setWork(SprintBacklogWorkController.WorkData request) {
        RemotingResult response = ne_WorkController.setWork(request);
        System.debug('Response linha 65 ' + response);
        return response;
    }

    @RemoteAction
    public static RemotingResult setTask(SprintBacklogWorkController.TaskData request) {
        RemotingResult response = ne_WorkController.setTask(request);
        return response;
    }

    public class SprintBacklogControllerException extends Exception {}
}