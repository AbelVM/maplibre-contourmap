/* jshint esversion: 9 */

import init from '../dist/maplibre-contourmap.js';

// add the add/remove functions to Map prototype
init(maplibregl);

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json', 
    center: [-2.9945918,39.8983039,0],
    zoom: 10
});
map.on('load', () => {

    // Raw points layer
    map.addSource('points_source', {
        type: 'vector',
        tiles:[location.href.replace('index.html','assets/tiles/{z}/{x}/{y}.pbf')]
    });
    map.addLayer({
        'id': 'points_layer',
        'type': 'circle',
        'source': 'points_source',
        'source-layer': 'cotas',
        'paint': {
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 2.5,
                19, 30
            ],
            'circle-color': [
                  'interpolate-lab',
                  ['linear'],
                  ['get', 'COTA'],
                  116,'#36a0a4',
                  342,'#73829b',
                  561,'#c05e90',
                  765,'#ff5180',
                  981,'#ff876c',
                  1314,'#ffb65a',
                  3360,'#ffdb4c'
              ]
        }
    });

    map.addContourSource('points_layer',{
        'measure': 'COTA',
        'breaks': [116,342,561,765,981,1314,3360]
    });

    map.addLayer({
        'id': 'maine',
        'type': 'fill',
        'source': 'contour-source-points_layer',
        'layout': {},
        'paint': {
            'fill-color': '#088',
            'fill-outline-color': '#000',
            'fill-opacity': 0.8
        }
    });
    
    //debugger
    window.map=map;
});