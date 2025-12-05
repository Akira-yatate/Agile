public class AgileWorkController {
    
    private static Boolean isEnabled;

    static{
        isEnabled = true;
    }

    public static Boolean isTriggerEnabled(){
        return isEnabled;
    }
    
    public static Boolean disableTrigger(){
        return isEnabled = false;
    }

    public static Boolean enableTrigger(){
        return isEnabled = true;
    }


    public static void summarizeWork(AgileWork__c[] context) {
        Map<Id, AgileSprint__c> sprintUpdateMap = new Map<Id, AgileSprint__c>();
        for(AgileWork__c record : context){
            System.debug('RecordID' + record.Sprint__c);
            if(record.Sprint__c != null)
                sprintUpdateMap.put(record.Sprint__c, new AgileSprint__c(Id = record.Sprint__c, RemainingBaPoints__c = 0, RemainingDevPoints__c = 0, BaPoints__c = 0, DevPoints__c = 0));
        }
		System.debug('sprintUpdateMap 2' + sprintUpdateMap);
        if(sprintUpdateMap.isEmpty()) return;

        for(AgileWork__c record : [SELECT id, Sprint__c, RemainingBaPoints__c, RemainingDevPoints__c, BaPoints__c, DevPoints__c FROM AgileWork__c WHERE Sprint__c IN :sprintUpdateMap.keySet()]){
            AgileSprint__c newRec = sprintUpdateMap.get(record.Sprint__c);
            newRec.RemainingBaPoints__c  += (record.RemainingBaPoints__c != null ? record.RemainingBaPoints__c : 0);
            newRec.RemainingDevPoints__c += (record.RemainingDevPoints__c != null ? record.RemainingDevPoints__c : 0);
            newRec.BaPoints__c           += (record.BaPoints__c != null ? record.BaPoints__c : 0);
            newRec.DevPoints__c          += (record.DevPoints__c != null ? record.DevPoints__c : 0);
            sprintUpdateMap.put(record.Sprint__c, newRec);
        }
		System.debug('sprintUpdateMap' + sprintUpdateMap);
        if(!sprintUpdateMap.isEmpty()){
            update sprintUpdateMap.values();
        }
    }
}