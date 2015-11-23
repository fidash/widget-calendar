/* global Calendar, vis */

(function() {
    "use strict";

    var calendar = new Calendar();
    calendar.init(document.getElementById('visualization'),
    {
      height: "100vh", 
      orientation: "top",
      zoomKey: 'shiftKey'
    });

})();