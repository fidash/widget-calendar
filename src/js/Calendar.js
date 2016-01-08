/* global vis, MashupPlatform, console, moment, EventEditor, CalendarAPI */

var Calendar = (function (vis) {
  "use strict";

  var container;
  var events = new vis.DataSet();
  var regions = new vis.DataSet();
  var options = {};
  var timeline = {};
  var eventEditor;
  var calendarAPI;
  var user;
  var userRol;
  
  var ROLES = {
    DEMO: "Demo",
    INFRASTRUCTUREOWNER: "InfrastructureOwner"
  };

  /*****************************************************************
  *                     C O N S T R U C T O R                      *
  *****************************************************************/

  function Calendar () {}

  /******************************************************************/
  /*                P R I V A T E   F U N C T I O N S               */
  /******************************************************************/
  
  function updateEvents () { timeline.setItems(events); }
  
  function updateRegions () { timeline.setGroups(regions); }
  
  function updateOptions () { timeline.setOptions(options); }

  function obtainEvents () {
      
   calendarAPI.getAllEvents(
       function (response) {
           console.log("Success obtaining events. \n");
           events.clear();
           
           JSON.parse(response.response).events.forEach(function(event) {
               var newEvent;
               console.log(event.uid);
               newEvent = {
                 id: event.uid,
                 content: event.description,
                 group: event.location,
                 start: event.dtstart,
                 end: event.dtend,
                 className: "",
                 editable: "",
                 type: 'range'
               };
               
               if (event.location === "Demos") {
                   newEvent.className = "demo";
               } else {
                   newEvent.className = "maintenance";
               }
               if (isInfrastructureOwner(event.location)) {
                   newEvent.editable = true;
               } else {
                   newEvent.editable = false;
               }
               events.add(newEvent);
               
           }, this);
           
           
       },
       function () {
           console.log("Error obtaining events. \n");
       }
   );
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
        
        regions.clear();
        regions.add({id: "Demos", content: "Demos"});
        
        object._embedded.regions.forEach(function(region) {
          regions.add({id: region.id, content: region.id});
        }, this);
        
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
        if (isInfrastructureOwner()) {
          userRol = "InfrastructureOwner";
        } else {
          userRol = "Demo";
        } 
        console.log("Success obtaining user. \n");          
      },
      onError: function(response) {
        console.log("Error obtaining user. \n" + response);	
      }
    });
  }
  
  function isInfrastructureOwner (region) {
    if(region) {
      var FIDASHRegion = region + " FIDASH";
      for (var index = 0; index < user.organizations.length; index++) {
        if (FIDASHRegion === user.organizations[index].name) {
          return true;
        }
      }
      return false;
    } else {
      return user.organizations.length > 0;
    }
  }
  
  function saveNewEvent(event) {
    var eventAPI = {
      location: event.group,
      summary: event.content,
      description: "event.title",
      dtend: moment(event.end).format("YYYY-MM-DD HH:mm:ssZZ"),
      dtstart: moment(event.start).format("YYYY-MM-DD HH:mm:ssZZ")
    };
    console.log(JSON.stringify(eventAPI));
    
    calendarAPI.addEvent(eventAPI, 
    function (response) {
        console.log("Success in addEvent.");
        events.add(event);
        eventEditor.hideEventEditor();
    },
    function () {
        console.log("Error in addEvent");
    });
    
  }
  
  function saveEvent(event) {
    events.update(event);
    eventEditor.hideEventEditor();
  }  
  
  function showEventEditor(props) {
    var event;
    if (props.what === "background") {
      event = {
        title: '',
        content: '', 
        start: new Date(props.time.getTime()), 
        end: new Date(props.time.getTime() + 21600000), 
        group: props.group, 
        type: 'range', 
        className: (props.group === "Demos") ? 'demo' : 'maintenance', 
        editable: true
      };
      eventEditor.showEventEditor(event, saveNewEvent);
    }
    if (props.what === "item") {
      event = events.get(props.item);
      if (event.editable)
        eventEditor.showEventEditor(event, saveEvent);
    }
  }
  
  function doubleClick (props) {
    switch (userRol) {
      case ROLES.DEMO:
        if (props.group === "Demos") {
          showEventEditor(props);
        }
        break;
      case ROLES.INFRASTRUCTUREOWNER:
        if (isInfrastructureOwner(props.group)) {
          showEventEditor(props);
        }
        break;
      default: 
        break; 
    }
  }
  
  function getDefaultOptions() {
    return {
      height: "100vh", 
      orientation: "top",
      zoomKey: 'shiftKey',
      zoomMax: 315360000000,
      zoomMin: 86400000,
      editable: {
        add: false,
        updateTime: true,
        updateGroup: false,
        remove: true
      },
      groupOrder: function (a, b) {
          if (a.id === "Demos") {
            return -1;
          }
          if (b.id === "Demos") {
            return 1;
          }
          
          var groups = [a.id, b.id];
          groups.sort();
          if (a.id === groups[0]) {
            return -1;
          } else {
            return 1;
          }
      },
      
    };
  }

  /******************************************************************/
  /*                 P U B L I C   F U N C T I O N S                */
  /******************************************************************/

  Calendar.prototype = {
    init: function (calendarContainer, calendarOptions) {
      console.log("Start Timeline v0.5.2");
      container = calendarContainer;
      if (typeof calendarOptions !== 'undefined') {
        options = getDefaultOptions();
      } else {
        options = calendarOptions;                
      }
      
      options.onMove = function (item, callback) {
          item.title = item.content + "\n" + "Start: " + moment(item.start).format('YYYY-MM-DD HH:mm') + "\n" + "End: " + moment(item.end).format('YYYY-MM-DD HH:mm');
          events.update(item);
          //callback(item);
      };
      options.onRemove = function (item, callback) {
          var event = {
            location: item.group,
            summary: item.content,
            description: "item.title",
            dtend: moment(item.end).format("YYYY-MM-DD HH:mm:ssZZ"),
            dtstart: moment(item.start).format("YYYY-MM-DD HH:mm:ssZZ"),
            uid: item.id
          };
          calendarAPI.deleteEvent(event,
            function () {
              callback(item);
            },
            function () {
              callback(null);
          });
      };
      
      calendarAPI = new CalendarAPI();
          
      regions.on("*", updateRegions);
      events.on("*", updateEvents);
          
      timeline = new vis.Timeline(container, events, regions, options);
          
      obtainUser();
      obtainRegions();
      obtainEvents();
      
      timeline.setOptions(options);
          
      //Events Editor
      eventEditor = new EventEditor();
      eventEditor.setUp();
          
      timeline.on('doubleClick', doubleClick);
      
      timeline.setWindow(moment().subtract(7, 'days'), moment().add(7, 'days'));
    }
  };

  return Calendar;
})(vis);