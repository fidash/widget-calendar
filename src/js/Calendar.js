/* global vis, MashupPlatform, console */

var Calendar = (function (vis) {
    "use strict";

    var container;
    var events = {};
    var regions = [];
    var options = {};
    var timeline = {};
    var user;

    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function Calendar () {
      
    }

    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/
    
    function updateEvents () {
      timeline.setItems(events);
    }
    
    function updateRegions () {
      timeline.setGroups(regions);
    }
    
    function updateOptions () {
      timeline.setOptions(options);
    }

    function obtainEvents () {
        var obtainedEvents;
        
        //TODO: get events from Wirecloud API
        obtainedEvents = new vis.DataSet([
            {id: 1, content: 'Reinicio', start: '2015-11-24', group: 'Lannion2', editable: true},
            {id: 2, content: 'item 2', start: '2015-11-14', group: 'Crete', type: 'point'},
            {id: 3, content: 'item 3', start: '2015-11-18', group: 'Crete', type: 'point'},
            {id: 4, content: 'item 4', start: '2015-11-16 14:08', end: '2015-11-19', group: 'Volos'},
            {id: 5, content: 'item 4', start: '2015-11-17', group: 'Prague', type: 'point'},
            {id: 6, content: 'item 5', start: '2015-11-25', group:'Zurich', type: 'point'},
            {id: 7, content: 'Fiware 1', start: '2015-11-23 09:00', end: '2015-11-23 12:00', group: 'Spain2'},
            {id: 8, content: 'Fiware 2', start: '2015-11-24 09:00', end: '2015-11-24 12:00', group: 'Spain2'},
            {id: 9, content: 'Fiware 3', start: '2015-11-24 12:00', end: '2015-11-24 15:00', group: 'Spain2'},
            {id: 10, content: 'Fiware 4', start: '2015-11-26 09:00', end: '2015-11-26 12:00', group: 'Spain2'},
            {id: 11, content: 'Fiware 5', start: '2015-11-27 17:00', end: '2015-11-27 20:00', group: 'Spain2'}
        ]);
        
        events = obtainedEvents;
        updateEvents();
    }
    
    function obtainRegions () {
      MashupPlatform.http.makeRequest("http://130.206.84.4:1028/monitoring/regions/", {
        method: 'GET',
        requestHeaders: {
        "X-FI-WARE-OAuth-Token": "true",
        "X-FI-WARE-OAuth-Header-Name": "X-Auth-Token"	
        },
        onSuccess: function(response) {         
          var object = JSON.parse(response.response);
          
          regions = [];
          
          object._embedded.regions.forEach(function(region) {
            regions.push({id: region.id, content: region.id});
            console.log("Añadiendo Region: " + region.id);
          }, this);
          
          updateRegions();
        },
        onError: function(response) {
          console.log("Error obtaining regions. \n" + response);	
        }
      });
    }
    
    function obtainUser () {
      MashupPlatform.http.makeRequest("https://account.lab.fiware.org/user/?access_token=ADp9U5YVRDJd32mg7Dm53h1z4cOCCt", {
          method: 'GET',
          requestHeaders: {
          "X-FI-WARE-OAuth-Token": "true",
          "X-FI-WARE-OAuth-Header-Name": "X-Auth-Token"	
          },
          onSuccess: function(response) {
            user = JSON.parse(response.response);      
            console.log("Success obtaining user. \n");
            console.log(user);            
          },
          onError: function(response) {
            console.log("Error obtaining user. \n" + response);	
          }
        });
    }
    
    function isInfrastructureOwner (region) {
      var FIDASHRegion = region + " FIDASH";
      for (var index = 0; index < user.organizations.length; index++) {
        if (FIDASHRegion === user.organizations[index].name) {
          console.log("Coincidencia encontrada: " + user.organizations[index].name);
          return true;
        }
      }
      
      console.log("Coincidencia no encontrada.");
      return false;
    }
    
    function doubleClick (props) {
      console.log("Hecho doble click");
      console.log(props);
      
      if(props.what === "background") {
        var startDate = props.time;
        var endDate = new Date(props.time.getTime() + 1800000); 
        
        if(isInfrastructureOwner(props.group)) {
          events.add({
            title: 'Maintenance', 
            content: 'Maintenance', 
            start: startDate, 
            end: endDate, 
            group: props.group, 
            type: 'range', 
            className: 'maintenance', 
            editable: true 
          });
        } else {
          events.add({
            title: 'Demo', 
            content: 'Demo', 
            start: startDate, 
            end: endDate, 
            group: props.group, 
            type: 'range', 
            className: 'demo', 
            editable: true 
            });
        }
        
      }
      
    }
    
    

    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    Calendar.prototype = {
        init: function (calendarContainer, calendarOptions) {
            console.log("Prueba version D");
            
            container = calendarContainer;
            options = calendarOptions;
            
            timeline = new vis.Timeline(container, events, regions, options);
            
            obtainUser();
            obtainRegions();
            obtainEvents();
            
            timeline.setOptions(options);
            
            timeline.on('doubleClick', doubleClick);
        }
    };

    return Calendar;
})(vis);