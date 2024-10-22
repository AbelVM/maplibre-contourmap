/* jshint esversion: 9 */

import init from '../dist/maplibre-contourmap.js';

const 
    breaks = [116, 342, 561, 765, 981, 1314, 3360],
    // 'LA' color scale by Abel Vázquez Montoro
    colors =['#36a0a4','#73829b','#c05e90','#ff5180','#ff876c','#ffb65a','#ffdb4c'];

// add the add/remove functions to Map prototype
init(maplibregl);

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);
const PMTILES_URL = (location.href.indexOf('index.html') == -1) ? location.href + 'assets/cotas.pmtiles' : location.href.replace('index.html', 'assets/cotas.pmtiles');
const p = new pmtiles.PMTiles(PMTILES_URL);
protocol.add(p);
p.getHeader().then(h => {
    const map = new maplibregl.Map({
        container: 'map',
        style: 'https://demotiles.maplibre.org/style.json',
        zoom: 5,//h.maxZoom - 2,
        center: [-3, 41] //[h.centerLon, h.centerLat]
    });
    map.on('load', () => {

        // Raw points source
        map.addSource('points_source', {
            type: 'vector',
            url: `pmtiles://${PMTILES_URL}`
        });

        // Raw points layer
        map.addLayer({
            'id': 'points_layer',
            'type': 'circle',
            'source': 'points_source',
            'source-layer': 'cotas',
            'paint': {
                'circle-radius': 2, /* [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    5, 2.5,
                    10, 10
                ], */
                'circle-color': [
                    'interpolate-lab',
                    ['linear'],
                    ['get', 'COTA'],
                    breaks[0], colors[0],
                    breaks[1], colors[1],
                    breaks[2], colors[2],
                    breaks[3], colors[3],
                    breaks[4], colors[4],
                    breaks[5], colors[5],
                    breaks[6], colors[6]
                ]
            }
        });

        // Contour map source,
        // linked to the former points layer and its COTAS property
        map.addContourSource('points_layer', {
            'measure': 'COTA',
            'breaks': breaks
        });

        // Line layer the for contour map
        map.addLayer({
            'id': 'lines',
            'type': 'line',
            'source': 'contour-source-points_layer',
            'paint': {
                'line-width': 3,
                'line-color':  [
                    'step',
                    ['get', 'break'],
                    '#ffffff',
                    breaks[0], colors[0],
                    breaks[1], colors[1],
                    breaks[2], colors[2],
                    breaks[3], colors[3],
                    breaks[4], colors[4],
                    breaks[5], colors[5],
                    breaks[6], colors[6]
                    ]
            }
        });

        //debugger
        window.map = map;
    });
});