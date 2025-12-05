public with sharing class PicklistData {
    public String key;
    public String type;
    public String value;

    public PicklistData() {}

    public PicklistData(String key, String value) {
        this.key    = key;
        this.value  = value;
    }

    public PicklistData(String key, String value, String type) {
        this.key    = key;
        this.value  = value;
        this.type   = type;
    }
}