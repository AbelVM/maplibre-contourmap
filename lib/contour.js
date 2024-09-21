/* jshint esversion: 9 */
import { tin } from "@turf/tin";

const contour = async message => { 
    const 
        features = message.data.features, // TODO: memoizing by tile zxy
        measure = message.data.measure,
        grid = tin(features, measure);
};


export { contour };