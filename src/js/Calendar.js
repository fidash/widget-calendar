/* global vis */

var Calendar = (function (vis) {
    "use strict";

    var container;
    var events = {};
    var regions = {};
    var options = {};
    var timeline = {};

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

    function obtainEvents () {
        var obtainedEvents;
        
        //TODO: get events from Wirecloud API
        
        obtainedEvents = new vis.DataSet([
            {id: 'A', content: 'Maintenance Window', start: '2015-11-18', end: '2015-11-30', type: 'background', group: 'es', className: 'maintenance'},
            {id: 'B', content: 'Maintenance Window', start: '2015-11-20', end: '2015-12-01', type: 'background', group: 'fr', className: 'maintenance'},
            {id: 'D', content: 'Demo Week', start: '2015-11-23', end: '2015-11-28', type: 'background', group: 'it', className: 'demo'},
            
            {id: 1, content: 'Reinicio', start: '2015-11-24', group: 'fr', editable: true},
            {id: 2, content: 'item 2', start: '2015-11-14', group: 'es', type: 'point'},
            {id: 3, content: 'item 3', start: '2015-11-18', group: 'be', type: 'point'},
            {id: 4, content: 'item 4', start: '2015-11-16 14:08', end: '2015-11-19', group: 'ch'},
            {id: 5, content: 'item 4', start: '2015-11-17', group: 'se', type: 'point'},
            {id: 6, content: 'item 5', start: '2015-11-25', group:'hu', type: 'point'},
            {id: 7, content: 'Demo Fiware 1', start: '2015-11-23 09:00', group: 'it'},
            {id: 8, content: 'Demo Fiware 2', start: '2015-11-24 09:00', group: 'it'},
            {id: 9, content: 'Demo Fiware 3', start: '2015-11-24 12:00', group: 'it'},
            {id: 10, content: 'Demo Fiware 4', start: '2015-11-26 09:00', group: 'it'},
            {id: 11, content: 'Demo Fiware 5', start: '2015-11-27 17:00', group: 'it'}
        ]);
        
        events = obtainedEvents;
        updateEvents();
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
        updateRegions();
    }

    /******************************************************************/
    /*                 P U B L I C   F U N C T I O N S                */
    /******************************************************************/

    Calendar.prototype = {
        init: function (calendarContainer, calendarOptions) {
            container = calendarContainer;
            options = calendarOptions;
            
            timeline = new vis.Timeline(container, events, regions, options);
            
            obtainRegions();
            obtainEvents();
            timeline.setOptions(options);
        }
    };

    return Calendar;
})(vis);