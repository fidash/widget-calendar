/* global console, MashupPlatform */

var UserAPI = (function () {
    "use strict";

    var url = "https://account.lab.fiware.org/user";

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
          //"X-FI-WARE-OAuth-Header-Name": "X-Auth-Token"
          "x-fi-ware-oauth-get-parameter": "access_token"
        },
        onSuccess: success,
        onError: error
      });
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
			}
    };

    return UserAPI;
})();