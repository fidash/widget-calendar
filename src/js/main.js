/* global console, Calendar, vis */

(function() {
    "use strict";

    var calendar = new Calendar();
    calendar.init(document.getElementById('visualization'),
    {
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
    });
    
    $(document).ready(function(){
      $('.vis-center>.vis-content').on('scroll', function () {
          $('.vis-left>.vis-content').scrollTop($(this).scrollTop());
      });
      $('.vis-left>.vis-content').on('scroll', function () {
          $('.vis-center>.vis-content').scrollTop($(this).scrollTop());
      });	
    });

})();