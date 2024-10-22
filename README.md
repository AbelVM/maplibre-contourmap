# maplibre-contourmap

https://github.com/user-attachments/assets/b468f5f2-26c2-4353-b32d-1d8fb483e847

This [MaplibreGL JS](https://maplibre.org/) plugin allows to generate a real-time, client-side, [contour map](https://en.wikipedia.org/wiki/Contour_line) (isolines, isopleths,...) based on the data provided by a scattered **points** vector layer.

One of the main advantages of the approeach used here is that source points don't need to be regularly placed in a grid, as we are using the [meandering triangles](https://en.wikipedia.org/wiki/Marching_squares#Contouring_triangle_meshes) variation of the [marching squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm, that allows us to use scattered points and work on a [TIN](https://en.wikipedia.org/wiki/Triangulated_irregular_network) defined by those points

## How it works

As the points are arbitrarily scattered, we can't foresee the placement of the points in the tiles. That tiny detail forces us to process the whole available data at once every time the user moves around the map, and refrains us from using [custom protocols](https://maplibre.org/maplibre-gl-js/docs/API/functions/addProtocol/) to process tiles data on the fly before rendering. So we need to trigfger the generation of the contour map once new data is loaded for the linked points layer.

To improve the performance and avoid UI jerkyness, we've used two common techniques here:

* [Webworkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API), so everything is computed out of the main thread
* [Memoization](https://en.wikipedia.org/wiki/Memoization). Due to the nature of the algorithm itself and the need to regenerate the whole contour map as new data is gathered, there is a lot of cells and segments that would be processed multiple times, wasting CPU time. So we memoize both processes (cells and segments) within the worker itself, so it doesn't leak. One of the main potential caveats of memoization is the chance of a huge impact on consumed memory, but the approach used here keeps it under reasonable limits

## How to use

First of all

```bash
npm install
npm run build
```

Now you have the everything you need in the `./dist` folder.

In order to add this plugin to your Maplibre app, you need to import the module and initialize it, passing the mapping library object (usually, `maplibregl`)

```javascript
import init from 'maplibre-contourmap.js';
init(maplibregl);
```

Now we have two new `maplibregl.Map` methods, that needs the name of the points layer to be targeted:

* `addContourSource`(input_layer_name, options_object): once added, a new geoJSON **multilinestring** source is added to the map, called `contour-source-input_layer_name`
* `removeContourSource`(input_layer_name) : to remove the contour map source

The `options_object` contain:

* `measure`: the name of the numerical property of input_layer_name to be used to generate the contour map
* `breaks`: array of numeric values that will define the classes of the isolines
* `filter` [optional, defaults to empty]: layer [filter](https://maplibre.org/maplibre-style-spec/layers/#filter) according to specs, to limit the points of the source layer that will be used for the contour map
* `debug` [optional, defaults to false]: if sets to `true` some extra validations are run and debug messages will be sent to console log

Options yet to be implemented

* `type` [optional, defaults to "MultiLineString"]: Geometry type of the output. As of today, only `MultiLineString` is supported
* `max_workers`[optional, defaults to `((!!navigator.hardwareConcurrency) ? navigator.hardwareConcurrency - 1 : 3) - maplibregl.getWorkerCount()`]: size of the workers pool. As of today, there is no pool management, just one lonely worker

Once the map is loaded, and the target points layer is added, we can attach to the points layer to generate its contour map

```javascript
map.on('load', () => {

    // Raw points source
    map.addSource('points_source', {
        type: 'vector',
        ...
    });

    // Raw points layer
    map.addLayer({
        'id': 'points_layer',
        'type': 'circle',
        'source': 'points_source',
        'source-layer': 'points_source_layer',
        ..
    });

    // Contour map source,
    // linked to the former points layer and its COTAS property
    map.addContourSource('points_layer', {
        'measure': 'my_measure',
        'breaks': breaks
    });

    // Line layer the for contour map
    map.addLayer({
        'id': 'lines',
        'type': 'line',
        'source': 'contour-source-points_layer',
        ...
    });

});
```

**The original points layer must be visible, otherwise its source data won't be loeaded. If you want to hide the points layer, use paint property `opacity` instead of layout property `visible`**

## Dependencies

The only external dependency is [@turf/tin](https://turfjs.org/docs/api/tin), that is side-loaded and embedded within the worker in development time. Think of it as dev dependency.

`The whole plugin is self-contained in a single 8.6kB file`

## To-Do's

* Work with GeoJSON sources too
* Verify geometry are points and get centroids if not
* worker pool
* separete workers for cells and segments
* corner cases in tiles' boundaries
