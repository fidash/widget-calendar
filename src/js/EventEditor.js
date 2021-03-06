/* global console, moment */

var EventEditor = (function () {
    "use strict";

    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function EventEditor () {
      
    }

    /******************************************************************/
    /*                P R I V A T E   F U N C T I O N S               */
    /******************************************************************/
    function checkEventEditor() {
      var isValidDate = isValidDateEventEditor();
      var isValidDescription = isValidDescriptionEventEditor();
      
      $('#saveEvent').prop('disabled', !(isValidDate && isValidDescription));
    }
    
    function isValidDateEventEditor() {
      if(moment.utc($('#dateStart').val() + " " + $('#timeStart').val()).isBefore(moment.utc($('#dateEnd').val() + " " + $('#timeEnd').val()))) {
        $('#dateEndForm').removeClass('has-error');
        $('#timeEndForm').removeClass('has-error');
        return true;
      } else {
        $('#dateEndForm').addClass('has-error');
        $('#timeEndForm').addClass('has-error');
        return false;
      }
    }
    
    function isValidDescriptionEventEditor() {
      if($('#description').val() === "") {
        $('#descriptionForm').addClass('has-error');
        return false;
      } else {
        $('#descriptionForm').removeClass('has-error');
        return true;
      }
    }
    
    function clearEventEditor() {
      $('#descriptionForm').removeClass('has-error');
      $('#dateEndForm').removeClass('has-error');
      $('#timeEndForm').removeClass('has-error');
      $('#saveEvent').prop('disabled', true);
    }
    
    function saveEvent(object) {
      var event = object.data.oldEvent;
      var callback = object.data.callback;

      event.title = createTitle();
      event.content = $('#description').val();
      event.start = $('#dateStart').val() + " " + $('#timeStart').val() + moment.utc().format("ZZ");
      event.end = $('#dateEnd').val() + " " + $('#timeEnd').val() + moment.utc().format("ZZ");
      callback(event);
    }
    
    function createTitle () {
      var title = $('#description').val() + "\n"; 
      title += "Start: " + $('#dateStart').val() + " " + $('#timeStart').val() + " UTC\n" ;
      title += "End: " + $('#dateEnd').val() + " " + $('#timeEnd').val() + " UTC";
      return title; 
    }


    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    EventEditor.prototype = {
        init: function () {
          
        },
        setUp: function () {
          console.log("Configurando el editor de eventos.");
          $('#modalEventEditor').on('shown.bs.modal', function () {
            $('#description').focus();
          });
          $('#description').keyup(checkEventEditor);
          $('#dateStart').change(checkEventEditor);
          $('#timeStart').change(checkEventEditor);
          $('#dateEnd').change(checkEventEditor);
          $('#tiemEnd').change(checkEventEditor);
        },
        showEventEditor: function (event, saveFunction) {
          clearEventEditor();
          
          if (event.content === "")
            $('#modalTitle').text("New Event");
          else
            $('#modalTitle').text(event.content);
          
          $('#description').val(event.content); //Event Content
          $('#dateStart').val(moment.utc(event.start).format("YYYY-MM-DD")); //Add start datetime    
          $('#timeStart').val(moment.utc(event.start).format("HH:mm")); //Add start datetime
          $('#dateEnd').val(moment.utc(event.end).format("YYYY-MM-DD")); //Add final datetime
          $('#timeEnd').val(moment.utc(event.end).format("HH:mm")); //Add final datetime
          
          if (typeof event.id !== 'undefined')
            $('#saveEvent').prop('disabled', false);            
          else
            $('#saveEvent').prop('disabled', true);
            
          //Events
          $('#saveEvent').off("click");
          $('#saveEvent').click({callback: saveFunction, oldEvent: event}, saveEvent);
          
          $('#modalEventEditor').modal("show");
        },
        hideEventEditor: function () {
          $('#modalEventEditor').modal("hide");
          clearEventEditor();
        }
    };

    return EventEditor;
})();