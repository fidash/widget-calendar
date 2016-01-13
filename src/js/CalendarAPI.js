/* global console, MashupPlatform */

var CalendarAPI = (function () {
    "use strict";

    var url = "http://130.206.113.159:8085/api/v1";

    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function CalendarAPI () {
      
    }

    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/
    function getAllEvents(success, error) {
      MashupPlatform.http.makeRequest(url + "/events", {
        method: 'GET',
        requestHeaders: {
          "X-FI-WARE-OAuth-Token": "true",
          "X-FI-WARE-OAuth-Header-Name": "X-Auth-Token"	
        },
        onSuccess: success,
        onError: error
      });
    }
    
    function addEvent(event, success, error) {
      MashupPlatform.http.makeRequest(url + "/events", {
        method: 'POST',
        contentType: "application/json",
        requestHeaders: {
          "X-FI-WARE-OAuth-Token": "true",
          "X-FI-WARE-OAuth-Header-Name": "X-Auth-Token"	
        },
        postBody: JSON.stringify(event),
        onSuccess: success,
        onError: error
      });
    }
    
    function deleteEvent(event, success, error) {
      MashupPlatform.http.makeRequest(url + "/events/" + event.uid, {
        method: 'DELETE',
        requestHeaders: {
        "X-FI-WARE-OAuth-Token": "true",
        "X-FI-WARE-OAuth-Header-Name": "X-Auth-Token"	
        },
        onSuccess: success,
        onError: error
      });
    }
    
    function updateEvent(event, success, error) {
      //TODO: Implementar con la API cuando este disponible.
      deleteEvent(event, function() {
        console.log("Event removed (Update) successfully.");
        event.uid = null;
        addEvent(event, success, error);
      }, error);
    }
    
    function test(event, success, error) {
      MashupPlatform.http.makeRequest(url, {
        method: 'GET',
        requestHeaders: {
          "X-FI-WARE-OAuth-Token": "true",
          "X-FI-WARE-OAuth-Header-Name": "X-Auth-Token"	
        },
        onSuccess: success,
        onError: error
      });
    }
    
    function createEventObject(uid, description, summary, location, dtstart, dtend, dtstamp) {
      var event = {};
      if (uid !== null) event.uid = uid;
      if (description !== null) event.description = description;
      if (summary !== null) event.summary = summary;
      if (location !== null) event.location = location;
      if (dtstart !== null) event.dtstart = dtstart;
      if (dtend !== null) event.dtend = dtend;
      if (dtstamp !== null) event.dtstamp = dtstamp;
      return event;
    }

    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    CalendarAPI.prototype = {
      getAllEvents: function (success, error) {
        getAllEvents(success, error);
      },
      addEvent: function (event, success, error) {
        addEvent(event, success, error);
      },
      deleteEvent: function (event, success, error) {
        deleteEvent(event, success, error);
      },
      updateEvent: function (event, success, error) {
        updateEvent(event, success, error);
      },
      test: function (success, error) {
        test(success, error);
      }
    };

    return CalendarAPI;
})();