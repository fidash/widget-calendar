/* global console, MashupPlatform */

var UserAPI = (function () {
    "use strict";

    var url = "https://account.lab.fiware.org/user";
    var USERROLES = {
      UPTIMEREQUEST: "UpTimeRequest",
      INFRASTRUCTUREOWNER: "InfrastructureOwner",
      ANONYMOUS: "Anonymous"
    };

    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function UserAPI () {
      
    }

    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/
    function getUser(success, error) {
      MashupPlatform.http.makeRequest(url, {
        method: 'GET',
        requestHeaders: {
          "X-FI-WARE-OAuth-Token": "true",
          "x-fi-ware-oauth-get-parameter": "access_token"
        },
        onSuccess: success,
        onError: error
      });
    }
    
    function isInfrastructureOwner (user, region) {
      var index;
      if(region) {
        var FIDASHRegion = region + " FIDASH";
        for (index = 0; index < user.organizations.length; index++) {
          if (FIDASHRegion === user.organizations[index].name) {
            return true;
          }
        }
        return false;
      } else {
        for (index = 0; index < user.roles.length; index++) {
          if (user.roles[index].name === USERROLES.INFRASTRUCTUREOWNER) {
            return true;
          }
        }
        return false;
      }
    }
    
    function isUpTimeRequest (user) {
      for (var index = 0; index < user.roles.length; index++) {
        if (user.roles[index].name === USERROLES.UPTIMEREQUEST) {
          return true;
        }
      }
      return false;
    }
    
    function isAnonymous (user) {
      return !isInfrastructureOwner(user) && !isUpTimeRequest(user);
    }
    
    function test(success, error) {

    }

    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    UserAPI.prototype = {
      getUser: function (accessToken, success, error) {
        getUser(accessToken, success, error);
      },
		  test: function (success, error) {
				test(success, error);
			},
      ROLES: {
        UPTIMEREQUEST: USERROLES.UPTIMEREQUEST,
        INFRASTRUCTUREOWNER: USERROLES.INFRASTRUCTUREOWNER,
        ANONYMOUS: USERROLES.ANONYMOUS
      },
      utils: {
        isInfrastructureOwner: function (user, region) {
          return isInfrastructureOwner(user, region);
        },
        isUpTimeRequest: function (user) {
          return isUpTimeRequest(user);
        },
        isAnonymous: function (user) {
          return isAnonymous(user);
        },
        getRole: function (user) {
          if (isInfrastructureOwner(user)) return USERROLES.INFRASTRUCTUREOWNER;
          if (isUpTimeRequest(user)) return USERROLES.UPTIMEREQUEST;
          if (isAnonymous(user)) return USERROLES.ANONYMOUS;
        }
      }
    };

    return UserAPI;
})();