/* global console, MashupPlatform */

var RegionAPI = (function () {
    "use strict";

    var url = "http://130.206.113.159:8085/api/v1/nodes";

    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function RegionAPI () {

    }

    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/
    function getRegions(success, error) {
      MashupPlatform.http.makeRequest(url, {
        method: 'GET',
        requestHeaders: {
          "X-FI-WARE-OAuth-Token": "true",
          "X-FI-WARE-OAuth-Header-Name": "X-Auth-Token"
        },
        onSuccess: success,
        onFailure: error
      });
    }

    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    RegionAPI.prototype = {
      getRegions: getRegions
    };

    return RegionAPI;
})();
