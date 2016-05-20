/* global console, MashupPlatform */

var UserAPI = (function () {
    "use strict";

    var url = "https://account.lab.fiware.org/user";
    var USERROLES = {
      UPTIMEREQUEST: "UptimeRequester",
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
        onFailure: error
      });
    }

    function isInfrastructureOwner (user, region) {
      var indexOrg, indexRol;
      if(region) {
        var FIDASHRegion = region + " FIDASH";
        for (indexOrg = 0; indexOrg < user.organizations.length; indexOrg++) {
          if (FIDASHRegion === user.organizations[indexOrg].name) {
            for (indexRol = 0; indexRol < user.organizations[indexOrg].roles.length; indexRol++) {
              if(user.organizations[indexOrg].roles[indexRol].name === USERROLES.INFRASTRUCTUREOWNER) {
                return true;
              }
            }
          }
        }
        return false;
      } else {
        for (indexOrg = 0; indexOrg < user.organizations.length; indexOrg++) {
          for (indexRol = 0; indexRol < user.organizations[indexOrg].roles.length; indexRol++) {
            if(user.organizations[indexOrg].roles[indexRol].name === USERROLES.INFRASTRUCTUREOWNER) {
              return true;
            }
          }
        }
        return false;
      }
    }

    function isUptimeRequest (user) {
      for (var index = 0; index < user.roles.length; index++) {
        if (user.roles[index].name === USERROLES.UPTIMEREQUEST) {
          return true;
        }
      }
      return false;
    }

    function isAnonymous (user) {
      return !isInfrastructureOwner(user) && !isUptimeRequest(user);
    }

    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    UserAPI.prototype = {
        getUser: getUser,
      ROLES: {
        UPTIMEREQUEST: USERROLES.UPTIMEREQUEST,
        INFRASTRUCTUREOWNER: USERROLES.INFRASTRUCTUREOWNER,
        ANONYMOUS: USERROLES.ANONYMOUS
      },
      utils: {
          isInfrastructureOwner: isInfrastructureOwner,
          isUptimeRequest: isUptimeRequest,
          isAnonymous: isAnonymous,
          getRole: function (user) {
              if (isInfrastructureOwner(user)) return USERROLES.INFRASTRUCTUREOWNER;
              if (isUptimeRequest(user)) return USERROLES.UPTIMEREQUEST;
              if (isAnonymous(user)) return USERROLES.ANONYMOUS;
              return USERROLES.ANONYMOUS;
          }
      }
    };

    return UserAPI;
})();
