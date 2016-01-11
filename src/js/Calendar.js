/* global vis, MashupPlatform, console, moment, EventEditor, CalendarAPI, RegionAPI, UserAPI */

var Calendar = (function (vis) {
  "use strict";

  var container;
  var events = new vis.DataSet();
  var regions = new vis.DataSet();
  var options = {};
  var timeline = {};
  var eventEditor;
  var calendarAPI;
  var userAPI;
  var regionAPI;
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
        console.log("Success obtaining events.");
        events.clear();
        JSON.parse(response.response).events.forEach(function(event) {
          var newEvent = {
            id: event.uid,
            content: event.description,
            title: event.summary.replace(/\\\n/g, "\n"),
            group: event.location,
            start: event.dtstart,
            end: event.dtend,
            className: "",
            editable: false,
            type: 'range'
          };
          if (event.location === "Demos") {
            newEvent.className = "demo";
          } else {
            newEvent.className = "maintenance";
          }
          
          if (userRol === ROLES.DEMO && event.location === "Demos") {
            newEvent.editable = true;
          } else {
            if (isInfrastructureOwner(event.location)) {
              newEvent.editable = true;
            } else {
              newEvent.editable = false;
            }
          }
          
          
          
          events.add(newEvent);
        }, this);
      },
      function () {
        console.log("Error obtaining events.");
      }
    );
  }
  
  function obtainRegions () {
    regionAPI.getRegions(
      function(response) {
        console.log("Success obtaining regions.");      
        var object = JSON.parse(response.response);
        
        regions.clear();
        regions.add({id: "Demos", content: "Demos"});
        
        object._embedded.regions.forEach(function(region) {
          regions.add({id: region.id, content: region.id});
        }, this);
      },
      function(response) {
        console.log("Error obtaining regions." + response);	
    });
  }
  
  function obtainUser () {
    //TODO: Get User Access Token
    userAPI.getUser(
      function(response) {
        user = JSON.parse(response.response);
        if (isInfrastructureOwner()) {
          userRol = "InfrastructureOwner";
        } else {
          userRol = "Demo";
        } 
        console.log("Success obtaining user.");          
      },
      function(response) {
        console.log("Error obtaining user." + response);	
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
      summary: event.title.replace(/\n/g, "\\n"),
      description: event.content,
      dtend: moment(event.end).format("YYYY-MM-DD HH:mm:ssZZ"),
      dtstart: moment(event.start).format("YYYY-MM-DD HH:mm:ssZZ")
    };
    
    calendarAPI.addEvent(eventAPI, 
    function (response) {
        events.remove(event.id);
        console.log("Created Event Successfully.");
        event.id = JSON.parse(response.response).event.uid;
        events.add(event);
        eventEditor.hideEventEditor();
    },
    function () {
        console.log("Error creating Event");
    });
    
  }
  
  function saveEvent(event) {
    var eventAPI = {
      location: event.group,
      summary: event.title.replace(/\n/g, "\\n"),
      description: event.content,
      dtend: moment(event.end).format("YYYY-MM-DD HH:mm:ssZZ"),
      dtstart: moment(event.start).format("YYYY-MM-DD HH:mm:ssZZ"),
      uid: event.id
    };
    calendarAPI.updateEvent(eventAPI,
      function (response) {
        console.log("Event added (Update) successfully.");
        events.remove(event.id);
        event.id = JSON.parse(response.response).event.uid;
        events.update(event);
        eventEditor.hideEventEditor();
      },
      function () {
    });   
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
      }
    };
  }

  /******************************************************************/
  /*                 P U B L I C   F U N C T I O N S                */
  /******************************************************************/

  Calendar.prototype = {
    init: function (calendarContainer, calendarOptions) {
      console.log("Start Timeline v0.8.2");
      
      calendarAPI = new CalendarAPI();
      regionAPI = new RegionAPI();
      userAPI = new UserAPI();
      
      container = calendarContainer;
      if (typeof calendarOptions !== 'undefined') {
        options = getDefaultOptions();
      } else {
        options = calendarOptions;                
      }
      
      options.onMove = function (item, callback) {
        item.title = item.content + "\n" + "Start: " + moment(item.start).format('YYYY-MM-DD HH:mm') + "\n" + "End: " + moment(item.end).format('YYYY-MM-DD HH:mm');        
        var event = {
          location: item.group,
          summary: item.title.replace(/\n/g, "\\n"),
          description: item.content,
          dtend: moment(item.end).format("YYYY-MM-DD HH:mm:ssZZ"),
          dtstart: moment(item.start).format("YYYY-MM-DD HH:mm:ssZZ"),
          uid: item.id
        };
        calendarAPI.updateEvent(event,
          function (response) {
            console.log("Event added (Update) successfully.");
            events.remove(item.id);
            item.id = JSON.parse(response.response).event.uid;
            events.update(item);
            //callback(item);
          },
          function () {
            callback(null);
        });
      };
      options.onRemove = function (item, callback) {
        var event = {
          location: item.group,
          summary: item.title.replace(/\n/g, "\\n"),
          description: item.content,
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