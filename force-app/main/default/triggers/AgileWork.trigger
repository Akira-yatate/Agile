trigger AgileWork on AgileWork__c (before insert, after insert, after update, after delete) {
    switch on Trigger.operationType {
        when AFTER_UPDATE {
            //System.debug('Trigger old ' + Trigger.old);
            System.debug('Trigger new ' + Trigger.new);
            if (Trigger.old != null) AgileWorkController.summarizeWork(Trigger.old);
            if (Trigger.new != null) AgileWorkController.summarizeWork(Trigger.new);
        }
        when AFTER_DELETE {        
            AgileWorkController.summarizeWork(Trigger.old);
        }
        when AFTER_INSERT {        
            AgileWorkController.summarizeWork(Trigger.new);
        }
    }
}