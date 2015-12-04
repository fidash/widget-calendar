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
      zoomMin: 600000,
      editable: {
        add: false,
        updateTime: true,
        updateGroup: false,
        remove: true
      },
      groupOrder: function (a, b) {
          console.log("Ordenar!!");
          console.log(a.id);
          console.log(b.id);
          if (a.id === "demos") {
            return -1;
          }
          if (b.id === "demos") {
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