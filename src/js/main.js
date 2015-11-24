/* global Calendar, vis */

(function() {
    "use strict";

    var calendar = new Calendar();
    calendar.init(document.getElementById('visualization'),
    {
      height: "100vh", 
      orientation: "top",
      zoomKey: 'shiftKey',
      editable: true
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