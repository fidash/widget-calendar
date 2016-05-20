/* global console, moment, MashupPlatform */

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
            onFailure: error
        });
    }

    function getEvents(start, end, success, error) {
        MashupPlatform.http.makeRequest(url + "/events", {
            method: 'GET',
            requestHeaders: {
                "X-FI-WARE-OAuth-Token": "true",
                "X-FI-WARE-OAuth-Header-Name": "X-Auth-Token",
                "start": moment.utc(start).format("YYYY-MM-DD"),
                "end": moment.utc(end).format("YYYY-MM-DD")
            },
            onSuccess: success,
            onFailure: error
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
            onFailure: error
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
            onFailure: error
        });
    }

    function updateEvent(event, success, error) {
        //TODO: Implementar correctamente con la API cuando este disponible.
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
            onFailure: error
        });
    }

    function createEventObject(uid, description, summary, location, dtstart, dtend, dtstamp) {
        return {
            uid: uid,
            description: description,
            summary: summary,
            location: location,
            dtstart: dtstart,
            dtend: dtend,
            dtstamp: dtstamp
        };
    }

    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    CalendarAPI.prototype = {
        getAllEvents: getAllEvents,
        getEvents: getEvents,
        addEvent: addEvent,
        deleteEvent: deleteEvent,
        updateEvent: updateEvent,
        test: test
    };

    return CalendarAPI;
})();
