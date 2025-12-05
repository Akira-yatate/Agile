public virtual class RemotingResult {
    public Boolean hasError;
    public String code;
    public String message;
    public String description;
    public String stackTrace;

    public RemotingResult() {
        this.hasError   = false;
    }
    
    public RemotingResult(Boolean hasError) {
        this.hasError   = hasError;
    }

    public RemotingResult(Boolean hasError, String message) {
        this.hasError   = hasError;
        this.message    = message;
    }

    public RemotingResult(Boolean hasError, String code, String message) {
        this.hasError   = hasError;
        this.code       = code;
        this.message    = message;
    }

    public RemotingResult(Boolean hasError, String code, String message, String description) {
        this.hasError       = hasError;
        this.code           = code;
        this.message        = message;
        this.description    = description;
    }
    
    public void setMessage(String message) {
        this.message    = message;
    }

    public RemotingResult(Exception e) {
        this.hasError   = true;
        this.message    = e.getMessage();
        this.stackTrace = e.getStackTraceString();
    }

    public RemotingResult(Exception e, String msg) {
        this.hasError   = true;
        this.message    = msg;
        this.stackTrace = e.getStackTraceString();
    }
}