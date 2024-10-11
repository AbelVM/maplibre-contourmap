/* jshint esversion: 9 */
import { minion } from "./utils.js";
import { contour } from "./contour2.js"

    /**
     * TODO:
     * - check whether is tiled or geojson source
     * - verify geometry are points
     * - filter
     * - worker pool
     * - workers for cells and segments
     */

async function add(inputlayer, options){

    const 
        defaults = {
            "type": "Polygon",
            "debug": false,
            "max_workers": ((!!navigator.hardwareConcurrency) ? navigator.hardwareConcurrency - 1 : 3) - this._lib.getWorkerCount()
        },
        o = Object.assign({}, defaults, options),
        callback = r => {
            const geojson = {
                "type": "FeatureCollection",
                "features": r.data.map((g,i) => {
                  return {
                        "type": "Feature",
                        "id": i,
                        "properties": {},
                        "geometry": {
                            "type": o.type,
                            "coordinates": g
                        }
                  }
                })
              }
            
              debugger;
            this.getSource(`contour-source-${inputlayer}`).setData(geojson);
        };

      // https://dev.to/olyop/concurrency-in-javascript-and-the-power-of-web-workers-4278

    this._minion = minion(
        contour,
        callback,
        [],
        true
    );

    const
        layer = this.getLayer(inputlayer),
        source = layer.source,
        shoot = e => {
            if (e.sourceId === source && e.isSourceLoaded){
                const 
                    query_options = {"sourceLayer": layer.sourceLayer},
                    visibility = layer.getLayoutProperty("visibility");
                if (visibility === 'none') {
                    if(o.debug) console.warning(`The layer ${inputlayer} must be layout:visible in order to be possible to build the contour. Let's change it to paint:opacity = 0`);
                    this.setPaintProperty(inputlayer, `${layer.type}-opacity`, 0);
                    this.setLayoutProperty(inputlayer, 'visibility', 'visible');
                }
                if (!!o.filter) {
                    query_options.filter = o.filter;
                    query_options.validate = o.debug;
                }
                const features = e.target.querySourceFeatures(source, query_options).map((f, i) => {
                    const g = f.geometry;
                    return {
                        "id": i,
                        "properties": f.properties,
                        "geometry": g
                    };
                });
                this._minion.postMessage({
                    "features": features,
                    "measure": o.measure,
                    "breaks": o.breaks
                });
            }
        };

    this.addSource(`contour-source-${inputlayer}`, {
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": []
        }
    });

    this.on("sourcedata", inputlayer, shoot);
    this.on("sourcedataabort", inputlayer, shoot); // TODO: check whether the abort event is needed

    if (this.getSource(source).loaded()) this.getSource(source).fire("sourcedata");

};

async function remove(inputlayer){
    this.off("sourcedata", inputlayer, shoot);
    this.off("sourcedataabort", inputlayer, shoot);
    if (!!this._minion) this._minion.terminate();
    this.removeSource(`contour-source-${inputlayer}`);
};

async function init(lib){
    lib.Map.prototype._lib = lib;
    lib.Map.prototype.addContourSource = add;
    lib.Map.prototype.removeContourSource = remove;
}
export default init;