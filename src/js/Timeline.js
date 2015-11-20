/* global google,require,RegionView,HostView,Utils,  */

var Timeline = (function () {
    "use strict";

    var container;
    var events = {};
    var regions = {};
    var options = {};
    var timeline = {};

    /*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

    function Timeline () {

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

    function obtainEvents () {
        var obtainedEvents;
        
        //TODO: get events from Wirecloud API
        
        obtainedEvents = new vis.DataSet([
            {id: 'A', content: 'Maintenance Window', start: '2015-11-13', end: '2015-11-22', type: 'background', group: 'fr'},
            {id: 1, content: 'Reinicio', start: '2015-11-20', group: 'fr', type: 'point', editable: true},
            {id: 2, content: 'item 2', start: '2015-11-14', group: 'es', type: 'point'},
            {id: 3, content: 'item 3', start: '2015-11-18', group: 'be', type: 'point'},
            {id: 4, content: 'item 4', start: '2015-11-16 14:08:00', end: '2015-11-19', group: 'ch'},
            {id: 5, content: 'item 4', start: '2015-11-17', group: 'se', type: 'point'},
            {id: 6, content: 'item 5', start: '2015-11-25', group:'hu', type: 'point'},
            {id: 7, content: 'item 6', start: '2015-11-27', group: 'it'}
        ]);
        
        events = obtainedEvents;
        setTimeout(updateEvents(), 4000);
    }
    
    function obtainRegions () {
        var obtainedRegions;
        
        //TODO: get regions from Wirecloud API
        
        obtainedRegions = [
            { id: 'es', content: 'Spain' },
            { id: 'fr', content: 'France' },
            { id: 'be', content: 'Belgium' },
            { id: 'ch', content: 'Switzerland' },
            { id: 'it', content: 'Italy' },
            { id: 'gr', content: 'Greece' },
            { id: 'hu', content: 'Hungary' },
            { id: 'cz', content: 'Czech Republic' },
            { id: 'pl', content: 'Poland' },
            { id: 'se', content: 'Sweden' },
            { id: 'br', content: 'Brazil' }
        ];
        
        regions = obtainedRegions;
        setTimeout(updateRegions(),3000);
    }

    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    Timeline.prototype = {
        init: function (timelineContainer, timelineOptions) {
            container = timelineContainer;
            options = timelineOptions;
            
            timeline = new vis.Timeline(container, events, regions, options);
            
            obtainRegions();
            obtainEvents();
        }
    };

    return Timeline;

})();