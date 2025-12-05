public with sharing class SprintBacklogBurndownController {
    // private SprintBacklogBurndownDAO burndownDAO = new SprintBacklogBurndownDAO();
    public BurndownResult getBurndown(String sprintId) {
        BurndownResult response;
        try {
            Map<String, BurndownData> burndownMap = new Map<String, BurndownData>();
            // for(AgileBurndown__c burndownItem : BurndownDAO.getBurndownList(sprintId)) {
            //     String dt = String.valueOf(burndownItem.Date__c);
            //     if(!burndownMap.containsKey(dt)) {
            //         burndownMap.put(dt, new BurndownData());
            //     }
            //     burndownMap.get(dt).label           = dt;
            //     if(burndownItem.Type__c == 'Actual') {
            //         burndownMap.get(dt).actual      = burndownItem.EstimatedEffort__c;
            //     }else if(burndownItem.Type__c == 'Baseline') {
            //         burndownMap.get(dt).baseline    = burndownItem.EstimatedEffort__c;
            //     }
            // }
            response = new BurndownResult();
            response.data = burndownMap.values();
        } catch (Exception e) {
            response = new BurndownResult(e);
        }
        return response;
    }

    public class BurndownResult extends RemotingResult {
        public List<BurndownData> data = new List<BurndownData>();

        public BurndownResult() {
            super();
        }

        public BurndownResult(Exception e) {
            super(e);
        }
    }

    public class BurndownData {
        public String   label;
        public Decimal  baseLine;
        public Decimal  actual;

        public BurndownData() {}
    }
}