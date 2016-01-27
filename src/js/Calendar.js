/* global vis, console, moment, EventEditor, CalendarAPI, RegionAPI, UserAPI */

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
        events.clear();
        JSON.parse(response.response).events.forEach(function(event) {
          var newEvent = {
            id: event.uid,
            content: event.description,
            title: event.summary.replace(/\\\n/g, "\n"),
            group: event.location,
            start: moment.utc(event.dtstart),
            end: moment.utc(event.dtend),
            className: "",
            editable: false,
            type: 'range'
          };
          
          if (event.location === "UptimeRequests") {
            newEvent.className = "uptime-request";
            newEvent.editable = userAPI.utils.isUptimeRequest(user);
          } else {
            newEvent.className = "maintenance";
            newEvent.editable = userAPI.utils.isInfrastructureOwner(user, event.location);
          }
          console.log(newEvent);
          events.add(newEvent);
        }, this);
        console.log("Success obtaining events.");        
      },
      function (response) {
        console.log("Error obtaining events. " + response);
      }
    );
  }
  
  function obtainRegions () {
    regionAPI.getRegions(
      function(response) {
        var object = JSON.parse(response.response);
        
        regions.clear();
        
        if (userAPI.utils.isUptimeRequest(user)) {
          regions.add({id: "UptimeRequests", content: "Uptime Request", className: "editable"});
        } else {
          regions.add({id: "UptimeRequests", content: "Uptime Request"});
        }
        
        object._embedded.regions.forEach(function(region) {
          if(userAPI.utils.isInfrastructureOwner(user, region.id)) {
            regions.add({id: region.id, content: region.id, className: "editable"});
          } else {
            regions.add({id: region.id, content: region.id});
          }
        }, this);
        console.log("Success obtaining regions.");              
      },
      function(response) {
        console.log("Error obtaining regions. " + response);	
    });
  }
  
  function obtainUser () {
    userAPI.getUser(
      function(response) {
        user = JSON.parse(response.response);
        userRol = userAPI.utils.getRole(user);
        console.log("Success obtaining user: " + user.displayName);
        console.log(JSON.stringify(user));
        console.log("Role: " + userRol);
      },
      function(response) {
        console.log("Error obtaining user. " + response);	
    });
  }
  
  function saveNewEvent(event) {
    var eventAPI = {
      location: event.group,
      summary: event.title.replace(/\n/g, "\\n"),
      description: event.content,
      dtend: moment.utc(event.end).format("YYYY-MM-DD HH:mm:ssZZ"),
      dtstart: moment.utc(event.start).format("YYYY-MM-DD HH:mm:ssZZ")
    };
    
    calendarAPI.addEvent(eventAPI, 
    function (response) {
        console.log("Created Event Successfully.");
        events.remove(event.id);        
        event.id = JSON.parse(response.response).event.uid;
        events.add(event);
        eventEditor.hideEventEditor();
    },
    function (response) {
        console.log("Error creating Event. " + response);
    });
  }
  
  function saveEvent(event) {
    var eventAPI = {
      location: event.group,
      summary: event.title.replace(/\n/g, "\\n"),
      description: event.content,
      dtend: moment.utc(event.end).format("YYYY-MM-DD HH:mm:ssZZ"),
      dtstart: moment.utc(event.start).format("YYYY-MM-DD HH:mm:ssZZ"),
      uid: event.id
    };
    
    calendarAPI.updateEvent(eventAPI,
      function (response) {
        console.log("Event updated successfully.");
        events.remove(event.id);
        event.id = JSON.parse(response.response).event.uid;
        events.update(event);
        eventEditor.hideEventEditor();
      },
      function (response) {
        console.log("Error updating Event. " + response);
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
        className: (props.group === "UptimeRequests") ? 'uptime-request' : 'maintenance', 
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
      case userAPI.ROLES.UPTIMEREQUEST:
        if (props.group === "UptimeRequests") {
          showEventEditor(props);
        }
        break;
      case userAPI.ROLES.INFRASTRUCTUREOWNER:
        if (userAPI.utils.isInfrastructureOwner(user, props.group)) {
          showEventEditor(props);
        }
        break;
      default: 
        break; 
    }
  }
  
  function onRangechanged(properties) {
    var start = properties.start;
    var end = properties.start;
    
    console.log("Range Changed");
    if (properties.byUser) {
      calendarAPI.getEvents(moment.utc(start).add(2, 'months'), moment.utc(end).subtract(15, 'days'),
      function (response) {
        JSON.parse(response.response).events.forEach(function(event) {
          var newEvent = {
            id: event.uid,
            content: event.description,
            title: event.summary.replace(/\\\n/g, "\n"),
            group: event.location,
            start: moment.utc(event.dtstart),
            end: moment.utc(event.dtend),
            className: "",
            editable: false,
            type: 'range'
          };
          
          if (event.location === "UptimeRequests") {
            newEvent.className = "uptime-request";
            newEvent.editable = userAPI.utils.isUptimeRequest(user);
          } else {
            newEvent.className = "maintenance";
            newEvent.editable = userAPI.utils.isInfrastructureOwner(user, event.location);
          }
          console.log(newEvent);
          events.add(newEvent);
        }, this);
        console.log("Success obtaining events.");
      },
      function (response) {
        console.log("Error obtaining events. " + response);
      });
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
          if (a.id === "UptimeRequests") {
            return -1;
          }
          if (b.id === "UptimeRequests") {
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
      moment: function(date) {
        return vis.moment(date).utcOffset('+00:00');
      }
    };
  }

  /******************************************************************/
  /*                 P U B L I C   F U N C T I O N S                */
  /******************************************************************/

  Calendar.prototype = {
    init: function (calendarContainer, calendarOptions) {
      console.log("Start Timeline v0.8.82");
      
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
        item.title = item.content + "\n" + "Start: " + moment.utc(item.start).format('YYYY-MM-DD HH:mm') + "\n" + "End: " + moment.utc(item.end).format('YYYY-MM-DD HH:mm');
        var event = {
          location: item.group,
          summary: item.title.replace(/\n/g, "\\n"),
          description: item.content,
          dtend: moment.utc(item.end).format("YYYY-MM-DD HH:mm:ssZZ"),
          dtstart: moment.utc(item.start).format("YYYY-MM-DD HH:mm:ssZZ"),
          uid: item.id
        };
        calendarAPI.updateEvent(event,
          function (response) {
            console.log("Event updated successfully.");
            events.remove(item.id);
            item.id = JSON.parse(response.response).event.uid;
            events.update(item);
          },
          function (response) {
            console.log("Error updating Event. " + response);
            callback(null);
        });
      };
      options.onRemove = function (item, callback) {
        var event = {
          location: item.group,
          summary: item.title.replace(/\n/g, "\\n"),
          description: item.content,
          dtend: moment.utc(item.end).format("YYYY-MM-DD HH:mm:ssZZ"),
          dtstart: moment.utc(item.start).format("YYYY-MM-DD HH:mm:ssZZ"),
          uid: item.id
        };
        calendarAPI.deleteEvent(event,
          function () {
            console.log("Event deleted successfully.");
            callback(item);
          },
          function (response) {
            console.log("Error deleting Event. " + response);
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
      timeline.on('rangechanged', onRangechanged);
      timeline.setWindow(moment.utc().subtract(2, 'days'), moment.utc().add(13, 'days'));
    }
  };

  return Calendar;
})(vis);