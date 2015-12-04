/* global vis, MashupPlatform, console, moment, EventEditor */

var Calendar = (function (vis) {
    "use strict";

    var container;
    var events = {};
    var regions = [];
    var options = {};
    var timeline = {};
    var eventEditor;
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
            {id: 1, content: 'Maintenance', start: '2015-11-25', end: '2015-12-01', group: 'Prague', type: 'range', className: "maintenance", editable: true},
            {id: 2, content: 'Maintenance', start: '2015-11-30', end: '2015-12-03', group:'Zurich', type: 'range', className: "maintenance", editable: false},
            {id: 3, content: 'Demo 1', start: '2015-11-30 09:00', end: '2015-11-30 12:00', group: 'Spain2', type: 'range', className: "demo", editable: true},
            {id: 4, content: 'Demo 2', start: '2015-12-01 09:00', end: '2015-12-01 12:00', group: 'Spain2', type: 'range', className: "demo", editable: true},
            {id: 5, content: 'Demo 3', start: '2015-12-01 12:00', end: '2015-12-01 15:00', group: 'Spain2', type: 'range', className: "demo", editable: true},
            {id: 6, content: 'Demo 4', start: '2015-12-02 09:00', end: '2015-12-02 12:00', group: 'Spain2', type: 'range', className: "demo", editable: true},
            {id: 7, content: 'Demo 5', start: '2015-12-03 17:00', end: '2015-12-03 20:00', group: 'Spain2', type: 'range', className: "demo", editable: true}
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
          }, this);
          
          updateRegions();
          console.log("Success obtaining regions. \n");
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
      return false;
    }
    
    function showEditEvent(props, event) {
      var eventTypes;
      if (isInfrastructureOwner(props.group)) {
        eventTypes = [
          {text: 'Demo', value: 'demo'},
          {text: 'Maintenance', value: 'maintenance'}
        ];
      } else {
        eventTypes = [
          {text: 'Demo', value: 'demo'}
        ];
      }
      
      if (typeof event.id !== 'undefined')
        eventEditor.showEventEditor(event, eventTypes, saveEvent);      
      else
        eventEditor.showEventEditor(event, eventTypes, saveEvent);      
    }
    
    function saveNewEvent(event) {
      events.add(event);
      eventEditor.hideEventEditor();
    }
    
    function saveEvent(event) {
      events.update(event);
      eventEditor.hideEventEditor();
    }  
    
    function doubleClick (props) {      
      if (props.what === "background") {
        var event = {
          title: '',
          content: '', 
          start: new Date(props.time.getTime()), 
          end: new Date(props.time.getTime() + 1800000), 
          group: props.group, 
          type: 'range', 
          className: '', 
          editable: true
        };
        showEditEvent(props, event);
      }
      if (props.what === "item") {
        var item = events.get(props.item);
        if (item.editable)
          showEditEvent(props, item);
      }
    }  

    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    Calendar.prototype = {
        init: function (calendarContainer, calendarOptions) {
            console.log("Start Timeline v0.5.2");
            container = calendarContainer;
            options = calendarOptions;
            
            timeline = new vis.Timeline(container, events, regions, options);
            
            obtainUser();
            obtainRegions();
            obtainEvents();
            
            timeline.setOptions(options);
            
            //Events Editor
            eventEditor = new EventEditor();
            eventEditor.setUp();
            
            timeline.on('doubleClick', doubleClick);
        }
    };

    return Calendar;
})(vis);