/* jshint esversion: 9 */
import { minion } from "./utils.js";
import { contour } from "./contour.js"

const defaults = {
    "type": "line", // line | fill
    //"timeout": 0,
    "debug": false,
    //"promoteId": true,
    //"https": true,
    //"minzoom": 15,
    "breaks": []
  };

async function add(inputlayer, options){
    o = Object.assign({}, defaults, options);
    /**
     * TODO:
     * - check whether is tiled or geojson source
     * - verify geometry are points
     * - filter
     */

    this._minion = minion(
        contour,
        r => {this.getSource(`contour-source-${inputlayer}`).setData(r.data)},
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
                const features = map.querySourceFeatures(source, query_options);
                _minion.postMessage({
                    "features": features,
                    "measure": o.measure
                });
            }
        };

    this.addSource(`contour-source-${inputlayer}`, {
        "type": "geojson",
        "data": {
            "type": "geojson",
            "data": {
              "type": "FeatureCollection",
              "features": []
            }
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
    lib.Map.prototype.addContourSource = add;
    lib.Map.prototype.removeContourSource = remove;

}
export default init;





// import contourinit from main.js
// contourinit(maplibre);



// import * as Utils from "app.js";
// Utils.myLogger();