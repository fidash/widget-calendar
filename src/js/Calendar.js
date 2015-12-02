/* global vis, MashupPlatform, console, moment */

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
      console.log("Showing event: " + event.id);
      
      var startDate = new Date(event.start);
      var endDate = new Date(event.end);
      
      $('#modalTitle').text(event.content); //Modal Name
      $('#description').val(event.content); //Event Content
      $('#dateStart').val(moment(startDate).format("YYYY-MM-DD")); //Add start datetime    
      $('#timeStart').val(moment(startDate).format("HH:mm")); //Add start datetime
      $('#dateEnd').val(moment(endDate).format("YYYY-MM-DD")); //Add final datetime
      $('#timeEnd').val(moment(endDate).format("HH:mm")); //Add final datetime
            
      $('#eventType').find('option').remove(); //Clear Options
      $('#eventType').append(new Option("Demo", "demo"));
      if (isInfrastructureOwner(props.group))
        $('#eventType').append(new Option("Maintenance", "maintenance"));
      
      $('#eventType option[value="' + event.className + '"]').prop('selected', true); //Select event className
      
      //Events
      $('#description').change(checkModalDates);
      $('#dateStart').change(checkModalDates);
      $('#timeStart').change(checkModalDates);
      $('#dateEnd').change(checkModalDates);
      $('#tiemEnd').change(checkModalDates);
      $('#saveEvent').off("click");
      $('#saveEvent').click({props: props, event: event}, saveEvent);
      
      $('#modalEventEditor').modal("show");
    }
    
    function showNewEvent(props, startDate, endDate) {
      console.log("Showing new event");
      
      $('#modalTitle').text('New Event'); //Modal Name
      $('#description').val("");
      $('#dateStart').val(moment(startDate).format("YYYY-MM-DD")); //Add start datetime    
      $('#timeStart').val(moment(startDate).format("HH:mm")); //Add start datetime
      $('#dateEnd').val(moment(endDate).format("YYYY-MM-DD")); //Add final datetime
      $('#timeEnd').val(moment(endDate).format("HH:mm")); //Add final datetime
        
      $('#eventType').find('option').remove(); //Clear Options
      $('#eventType').append(new Option("Demo", "demo"));
      if (isInfrastructureOwner(props.group))
        $('#eventType').append(new Option("Maintenance", "maintenance"));
      
      //Events
      $('#description').keyup(checkModalDates);
      $('#dateStart').change(checkModalDates);
      $('#timeStart').change(checkModalDates);
      $('#dateEnd').change(checkModalDates);
      $('#tiemEnd').change(checkModalDates);
      $('#saveEvent').off("click");
      $('#saveEvent').click({props: props, event: null}, saveEvent);
      
      $('#saveEvent').prop('disabled', true);
      $('#modalEventEditor').modal("show");
    }
    
    function saveEvent(param) {
      var props = param.data.props;
      var event = param.data.event;
      
      if (moment($('#dateStart').val() + " " + $('#timeStart').val()).isBefore(moment($('#dateEnd').val() + " " + $('#timeEnd').val()))) {
        if (param.data.event == null) {
          events.add({
              title: $('#description').val() + "\n" + "Start: " + $('#dateStart').val() + " " + $('#timeStart').val() + "\n" + "End: " + $('#dateEnd').val() + " " + $('#timeEnd').val(),
              content: $('#description').val(), 
              start: $('#dateStart').val() + " " + $('#timeStart').val(), 
              end: $('#dateEnd').val() + " " + $('#timeEnd').val(), 
              group: props.group, 
              type: 'range', 
              className: $('#eventType').val(), 
              editable: true
          });
        } else {
          events.update({
              id: event.id,
              title: $('#description').val() + "\n" + "Start: " + $('#dateStart').val() + " " + $('#timeStart').val() + "\n" + "End: " + $('#dateEnd').val() + " " + $('#timeEnd').val(), 
              content: $('#description').val(), 
              start: $('#dateStart').val() + " " + $('#timeStart').val(), 
              end: $('#dateEnd').val() + " " + $('#timeEnd').val(), 
              group: props.group, 
              type: 'range', 
              className: $('#eventType').val(), 
              editable: true
          });  
        }
        $('#modalEventEditor').modal("hide");
      } else {
        //Show Error
      }
    }
    
    function checkModalDates() {
      var error = false;
      if(moment($('#dateStart').val() + " " + $('#timeStart').val()).isBefore(moment($('#dateEnd').val() + " " + $('#timeEnd').val()))) {
        $('#dateEndForm').removeClass('has-error');
        $('#timeEndForm').removeClass('has-error');
      } else {
        $('#dateEndForm').addClass('has-error');
        $('#timeEndForm').addClass('has-error');
        error = true;
      }
      if($('#description').val() === "") {
        $('#descriptionForm').addClass('has-error');
        error = true;
      } else {
        $('#descriptionForm').removeClass('has-error');
      }
      $('#saveEvent').prop('disabled', error);
    }
    
    function doubleClick (props) {      
      if (props.what === "background") {
        showNewEvent(props, props.time, new Date(props.time.getTime() + 1800000));
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
            console.log("Start Timeline v0.2.20");
            container = calendarContainer;
            options = calendarOptions;
            
            timeline = new vis.Timeline(container, events, regions, options);
            
            obtainUser();
            obtainRegions();
            obtainEvents();
            
            timeline.setOptions(options);
            
            $('#modalEventEditor').on('shown.bs.modal', function () {
              $('#description').focus();
            });
            timeline.on('doubleClick', doubleClick);
        }
    };

    return Calendar;
})(vis);