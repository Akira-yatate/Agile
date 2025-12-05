//public with sharing class NE_UserController {
public with sharing class SprintBacklogUserController {

    public static UserResult getUserData() {
        UserResult response;
        try {
            response = new UserResult();
            User u = [SELECT SmallPhotoUrl, FullPhotoUrl, Profile.Name, UserType FROM User WHERE Id = :Userinfo.getUserid()];        
            response.data               = new UserData();
            response.data.firstName     = UserInfo.getFirstName();
            response.data.name          = UserInfo.getName();
            response.data.email         = UserInfo.getUserEmail();
            response.data.photo         = u.FullPhotoUrl;
            response.data.communityUrl  = URL.getSalesforceBaseUrl().toExternalForm();
            response.data.isCommunity   = Network.getNetworkId() != null;
        } catch (Exception e) {
            response = new UserResult(e);
        }
        return response;
    }

    public class UserResult extends RemotingResult {
        public UserData data = new UserData();
        public UserResult() {
            super();
        }

        public UserResult(Exception e) {
            super(e);
        }
    }

    public class UserData {
        public String firstName;
        public String name;
        public String email;
        public String photo;
        public String communityUrl;
        public Boolean isCommunity;
    }

}